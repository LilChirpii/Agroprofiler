import Authenticated from "@/Layouts/AuthenticatedLayout";
import React, { FormEventHandler, useState } from "react";
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import Search from "@/Components/Search";
import CheckBoxDropDown from "@/Components/CheckBoxDropDown";
import PrimaryButton from "@/Components/PrimaryButton";
import { Download, EyeIcon, Pencil, PlusIcon, Trash } from "lucide-react";
import axios from "axios";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import List from "@/Components/List";
import FarmerSearch from "@/Components/Listbox";
import { supabase } from "@/supabase";
import { GridColDef } from "@mui/x-data-grid";

interface Barangay {
    id: number;
    name: string;
}

interface Commodity {
    id: number;
    name: string;
}

interface Farmer {
    id: number;
    firstname: string;
    lastname: string;
}

type Damage = {
    id: number;
    farmer_id: number;
    commodity_id: number;
    brgy_id: number;
    cause: string;
    total_damaged_area: number;
    partially_damaged_area: number;
    area_affected: number;
    remarks: string;
    farmer: { firstname: string };
    commodity: { id: number; name: string };
    barangay: { id: number; name: string };
};

export interface PaginatedDamage {
    data: Damage[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface DamageProps extends PageProps {
    damage: PaginatedDamage;
    barangays: Barangay[];
    commodities: Commodity[];
    farmers: Farmer[];
}

export default function CropDamagesList({
    auth,
    damage,
    barangays = [],
    commodities = [],
    farmers = [],
}: DamageProps) {
    const damageData = damage?.data || [];

    const rows = damageData.map((damage: Damage) => ({
        id: damage.id,
        farmer_name: damage.farmer?.firstname || "N/A",
        commodity_name: damage.commodity?.name || "N/A",
        barangay_name: damage.barangay?.name || "N/A",
        total_damaged_area: damage.total_damaged_area,
        partially_damaged_area: damage.partially_damaged_area,
        area_affected: damage.area_affected,
        cause: damage.cause,
        remarks: damage.remarks,
    }));

    const columns: GridColDef[] = [
        { field: "id", headerName: "#", width: 50 },

        { field: "farmer_id", headerName: "Name", width: 120,  valueGetter: (value, row) => {
            return `${row?.farmer?.firstname || "Not Assigned"} ${row?.farmer?.lastname || "Not assigned"} `;
        }, },

        {
            field: "brgy_id",
            headerName: "Barangay",
            width: 100,
            valueGetter: (value, row) => {
                return row?.barangay?.name || "Not Assigned";
            },
        },

        { field: "commodity_id", headerName: "Commodity", width: 70,  valueGetter: (value, row) => {
            return row?.commodity?.name || "Not Assigned";
        }, },
        {
            field:  "cause",
            headerName:  "Cause",

            width: 50,

        },
        { field: "total_damaged_area", headerName: "Total Damaged Area", width: 100 },
        { field: "partially_damaged_area", headerName: "Partially Damaged Area", width: 100 },
        { field: "area_affected", headerName: "Area Affected", width: 100 },
        { field: "severity", headerName: "Severity", width: 100 },
        {
            field: "actions",
            headerName: "Actions",
            width: 90,
            renderCell: (params) => (
                <div>
                    <button
                        style={{ marginRight: 5 }}
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <EyeIcon size={20} color="blue" />
                    </button>
                    <button
                        style={{ marginRight: 5 }}
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <Pencil size={20} color="green" />
                    </button>
                    <button onClick={() => handleDelete(params.row.id)}>
                        <Trash size={20} color="red" />
                    </button>
                </div>
            ),
        },
    ];

    const [filteredRows, setFilteredRows] = useState(rows);
    const [yearSelectValue, setYearSelectValue] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = damage?.total || 0;
    const itemsPerPage = 20;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDamage, setNewDamage] = useState({
        farmer_id: "",
        commodity_id: "",
        brgy_id: "",
        total_damaged_area: "",
        partially_damaged_area: "",
        area_affected: "",
        cause: "",
        remarks: "",
    });

    const yearOptions = [
        { label: "2024", value: "2024" },
        { label: "2023", value: "2023" },
        { label: "2022", value: "2022" },
        { label: "2021", value: "2021" },
    ];

    const handleSearch = (query: string) => {
        const lowerCaseQuery = query.toLowerCase();
        const filteredData = rows.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(lowerCaseQuery)
            )
        );
        setFilteredRows(filteredData);
    };

    const handleYearSelectChange = (newValue: any) => {
        setYearSelectValue(newValue);
    };


    const handlePageChange = async (page: number) => {
        setCurrentPage(page);
        try {
            const response = await axios.get(`/cropadamage?page=${page}`, {
                headers: {
                    "X-Inertia": true,
                    Accept: "application/json",
                },
            });

            const paginatedDamage = response.data;

            if (paginatedDamage && paginatedDamage.data) {
                const updatedRows = paginatedDamage.data.map(
                    (damage: Damage) => ({
                        id: damage.id,
                        farmer_name: damage.farmer?.firstname || "unknown",
                        commodity_name: damage.commodity?.name || "unknown",
                        barangay_name: damage.barangay?.name || "unknown",
                        total_damaged_area: damage.total_damaged_area,
                        partially_damaged_area: damage.partially_damaged_area,
                        area_affected: damage.area_affected,
                        cause: damage.cause,
                        remarks: damage.remarks,
                    })
                );

                setFilteredRows(updatedRows);
            }
        } catch (error) {
            console.error("Error fetching paginated data:", error);
        }
    };

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    const handleEdit = (damage: Damage) => {
        setSelectedDamage(damage);
        setIsUpdateModalOpen(true);
        console.log(selectedDamage);
    };

    const handleDelete = async (damage: Damage) => {
        if (
            window.confirm(
                "Are you sure you want to delete this damage record?"
            )
        ) {
            try {
                await router.delete(`/cropdamages/destroy/${damage.id}`);
                toast.success("Damage deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
                // Optionally, refresh the list or call handlePageChange(currentPage) here
            } catch (error) {
                toast.error("Failed to delete damage");
            }
        }
    };

    const openModal = (): void => {
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewDamage({
            ...newDamage,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewDamage({
            ...newDamage,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (!newDamage.farmer_id) {
            toast.error("Please fill in all required fields.");
            return;
        }
        const formData = new FormData();

        console.log("Submitting damage data:", newDamage);
        (Object.keys(newDamage) as (keyof typeof newDamage)[]).forEach(
            (key) => {
                const value = newDamage[key];
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            }
        );
        try {
            await axios.post("/cropdamages/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Damage added successfully");
            closeModal();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error("Error adding damage:", error.response.data);
                toast.error(
                    `Failed to add damage: ${
                        error.response.data.message || "Validation error"
                    }`
                );
            } else {
                toast.error("Failed to add damage");
            }
        }
    };

    const handleView = (damage: Damage) => {
        console.log('clicked');
        // router.visit(`/farmprofile/${farmer.id}`);
    };

    const handleCommodityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewDamage((prev) => ({
            ...prev,
            commodity_id: e.target.value,
        }));
    };

    const handleBrgyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewDamage((prev) => ({
            ...prev,
            brgy_id: e.target.value,
        }));
    };

    const handleFarmerSelect = (farmer: Farmer) => {
        setNewDamage((prev) => ({
            ...prev,
            farmer_id: String(farmer.id),
        }));
    };

    const [selectedDamage, setSelectedDamage] = useState<Damage | null>(null);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDamage) {
            console.error("No damage selected");
            toast.error("No damage selected");
            return;
        }

        const updates = {
            farmer_id: selectedDamage.farmer_id || "",
            commodity_id: selectedDamage.commodity?.id,
            brgy_id: selectedDamage.barangay?.id || "",
            cause: selectedDamage.cause,
            total_damaged_area: selectedDamage.total_damaged_area,
            partially_damaged_area: selectedDamage.partially_damaged_area,
            area_affected: selectedDamage.area_affected,
            remarks: selectedDamage.remarks,
        };

        try {
            const { data, error } = await supabase
                .from("allocation")
                .update(updates)
                .eq("id", selectedDamage.id);

            console.log(selectedDamage);

            if (error) {
                console.error("Error updating allocation:", error);
            } else {
                console.log("allocation updated successfully:", data);
                toast.success("allocation updated successfully!");
                setIsUpdateModalOpen(false);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
        }
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Crop Damages List
                </h2>
            }
        >
            <Head title="Crop Damages List" />
            <ToastContainer />

            <div className="overflow-hidden shadow-sm sm:rounded-lg">
                <div className="bg-white border-b border-gray-200">
                    <div className="mb-4 flex justify-between">
                        <Search onSearch={handleSearch} />
                        <PrimaryButton onClick={openModal}>
                            <PlusIcon className="mr-2" />
                            Add Damage
                        </PrimaryButton>
                    </div>

                    <List
                        columns={columns}
                        rows={filteredRows}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onView={handleView}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />

                    <Modal show={isModalOpen} onClose={closeModal}>
                        <form onSubmit={handleSubmit} className="mt-4">
                            <h2 className="text-xl font-semibold">
                                Add Damage
                            </h2>
                            <div className="mb-4">
                                <label
                                    htmlFor="farmer_id"
                                    className="block mb-2"
                                >
                                    Farmer
                                </label>
                                <FarmerSearch
                                    onFarmerSelect={handleFarmerSelect}
                                    farmers={farmers}
                                />
                            </div>
                            <div className="mb-4">
                                <label
                                    htmlFor="commodity_id"
                                    className="block mb-2"
                                >
                                    Commodity
                                </label>
                                <select
                                    id="commodity_id"
                                    name="commodity_id"
                                    onChange={handleCommodityChange}
                                    className="border border-gray-300 rounded-lg p-2 w-full"
                                >
                                    <option value="">Select Commodity</option>
                                    {commodities.map((commodity) => (
                                        <option
                                            key={commodity.id}
                                            value={commodity.id}
                                        >
                                            {commodity.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="brgy_id" className="block mb-2">
                                    Barangay
                                </label>
                                <select
                                    id="brgy_id"
                                    name="brgy_id"
                                    onChange={handleBrgyChange}
                                    className="border border-gray-300 rounded-lg p-2 w-full"
                                >
                                    <option value="">Select Barangay</option>
                                    {barangays.map((barangay) => (
                                        <option
                                            key={barangay.id}
                                            value={barangay.id}
                                        >
                                            {barangay.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <TextInput
                                name="total_damaged_area"
                                value={newDamage.total_damaged_area}
                                onChange={handleInputChange}
                                placeholder="Total Damaged Area"
                            />
                            <TextInput
                                name="partially_damaged_area"
                                value={newDamage.partially_damaged_area}
                                onChange={handleInputChange}
                                placeholder="Partially Damaged Area"
                            />
                            <TextInput
                                name="area_affected"
                                value={newDamage.area_affected}
                                onChange={handleInputChange}
                                placeholder="Area Affected"
                            />
                            <TextInput
                                name="cause"
                                value={newDamage.cause}
                                onChange={handleInputChange}
                                placeholder="Cause"
                            />
                            <TextInput
                                name="remarks"
                                value={newDamage.remarks}
                                onChange={handleInputChange}
                                placeholder="Remarks"
                            />
                            <div className="mt-4">
                                <PrimaryButton type="submit">
                                    Submit
                                </PrimaryButton>
                            </div>
                        </form>
                    </Modal>

                    <Modal
                        show={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                    >
                        <h2 className="text-xl mb-2">Update Allocation</h2>

                        {selectedDamage && (
                            <form onSubmit={handleUpdate}>
                                <div className="mb-4">
                                    <label
                                        htmlFor="farmer_id"
                                        className="block mb-2"
                                    >
                                        Farmer
                                    </label>
                                    <FarmerSearch
                                        onFarmerSelect={handleFarmerSelect}
                                        farmers={farmers}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="commodity_id"
                                        className="block mb-2"
                                    >
                                        Commodity
                                    </label>
                                    <select
                                        id="commodity_id"
                                        name="commodity_id"
                                        value={
                                            selectedDamage.commodity?.name || ""
                                        }
                                        onChange={(e) => {
                                            const commodityId = Number(
                                                e.target.value
                                            );
                                            const selectedCommodity =
                                                commodities.find(
                                                    (c) => c.id === commodityId
                                                );
                                            setSelectedDamage({
                                                ...selectedDamage,
                                                commodity: selectedCommodity || {
                                                    id: 0,
                                                    name: "Unknown",
                                                },
                                            });
                                        }}
                                        className="border border-gray-300 rounded-lg p-2 w-full"
                                    >
                                        <option value="">
                                            Select Commodity
                                        </option>
                                        {commodities.map((commodity) => (
                                            <option
                                                key={commodity.id}
                                                value={commodity.id}
                                            >
                                                {commodity.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label
                                        htmlFor="brgy_id"
                                        className="block mb-2"
                                    >
                                        Barangay
                                    </label>
                                    <select
                                        id="brgy_id"
                                        name="brgy_id"
                                        onChange={(e) => {
                                            const barangayId = Number(
                                                e.target.value
                                            );
                                            const selectedBarangay =
                                                barangays.find(
                                                    (b) => b.id === barangayId
                                                );
                                            setSelectedDamage({
                                                ...selectedDamage,
                                                barangay: selectedBarangay || {
                                                    id: 0,
                                                    name: "Unknown",
                                                },
                                            });
                                        }}
                                        className="border border-gray-300 rounded-lg p-2 w-full"
                                    >
                                        <option value="">
                                            Select Barangay
                                        </option>
                                        {barangays.map((barangay) => (
                                            <option
                                                key={barangay.id}
                                                value={barangay.id}
                                            >
                                                {barangay.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <TextInput
                                    name="total_damaged_area"
                                    value={selectedDamage.total_damaged_area}
                                    onChange={(e) =>
                                        setSelectedDamage({
                                            ...selectedDamage,
                                            total_damaged_area: e.target.value,
                                        })
                                    }
                                    placeholder="Total Damaged Area"
                                />
                                <TextInput
                                    name="partially_damaged_area"
                                    value={
                                        selectedDamage.partially_damaged_area
                                    }
                                    onChange={(e) =>
                                        setSelectedDamage({
                                            ...selectedDamage,
                                            partially_damaged_area:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="Partially Damaged Area"
                                />
                                <TextInput
                                    name="area_affected"
                                    value={selectedDamage.area_affected}
                                    onChange={(e) =>
                                        setSelectedDamage({
                                            ...selectedDamage,
                                            area_affected: e.target.value,
                                        })
                                    }
                                    placeholder="Area Affected"
                                />
                                <TextInput
                                    name="cause"
                                    value={selectedDamage.cause}
                                    onChange={(e) =>
                                        setSelectedDamage({
                                            ...selectedDamage,
                                            cause: e.target.value,
                                        })
                                    }
                                    placeholder="Cause"
                                />
                                <TextInput
                                    name="remarks"
                                    value={selectedDamage.remarks}
                                    onChange={(e) =>
                                        setSelectedDamage({
                                            ...selectedDamage,
                                            remarks: e.target.value,
                                        })
                                    }
                                    placeholder="Remarks"
                                />
                                <div className="mt-4">
                                    <PrimaryButton type="submit">
                                        Submit
                                    </PrimaryButton>
                                </div>
                                <PrimaryButton type="submit">
                                    Update
                                </PrimaryButton>
                            </form>
                        )}
                    </Modal>
                </div>
            </div>
        </Authenticated>
    );
}
