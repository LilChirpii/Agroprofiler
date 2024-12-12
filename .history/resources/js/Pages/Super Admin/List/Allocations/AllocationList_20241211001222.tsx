import CheckBoxDropDown from "@/Components/CheckBoxDropDown";
import List from "@/Components/List";
import DropdownSelect from "@/Components/Listbox";
import PrimaryButton from "@/Components/PrimaryButton";
import Search from "@/Components/Search";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { Download, EyeIcon, Pencil, PlusIcon, Trash } from "lucide-react";
import { FormEventHandler, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import FarmerSearch from "@/Components/Listbox";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import { supabase } from "@/supabase";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import Select from "react-select";

interface Barangay {
    id: number;
    name: string;
}

interface Farmer {
    id: number;
    firstname: string;
    lastname: string;
}

interface Commodity {
    id: number;
    name: string;
}

interface NewAllocation {
    allocation_type: string;
    brgy_id: string;
    commodity_id: string;
    date_received: string;
    farmer_id: number | null;
    received: string;
}

type Allocation = {
    id: number;
    allocation_type: string;
    farmer: {
        id: number;
        firstname: string;
        lastname: string;
    };
    received: string;
    date_received: Date;
    commodity: {
        id: number;
        name: string;
    };
    barangay: {
        id: number;
        name: string;
    };
};

type PaginatedAllocation = {
    data: Allocation[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    next_page_url: string | null;
    prev_page_url: string | null;
};

interface AllocationProps extends PageProps {
    allocation: PaginatedAllocation;
    barangays: Barangay[];
    commodities: Commodity[];
    farmers: Farmer[];
}

interface Option {
    id: number;
    label: string;
    value: number;
    firstname: string;
    lastname: string;
}

export default function AllocationList({
    auth,
    allocation = {
        data: [],
        total: 0,
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
        next_page_url: null,
        prev_page_url: null,
    },
    barangays = [],
    commodities = [],
    farmers = [],
}: AllocationProps) {
    const allocationData = allocation?.data || [];
    const [formData, setFormData] = useState<any>({});
    const [allocations, setAllocations] = useState<AllocationProps[]>();
    const [loading, setLoading] = useState(false);
    const [loadingAllocationType, setLoadingAllocationType] = useState(true);
    const [allocationType, setAllocationType] = useState<Option[]>([]);
    const [commodity, setCommodities] = useState<Option[]>([]);
    const [loadingCommodities, setLoadingCommodities] = useState(true);
    const rows = allocationData.map((allocation: Allocation) => ({
        id: allocation.id,
        allocation_type: allocation.allocation_type, // Include this
        farmer_name: `${allocation.farmer?.firstname || "N/A"} ${
            allocation.farmer?.lastname || "N/A"
        }`,
        commodity_name: allocation.commodity?.name || "N/A",
        brgy_name: allocation.barangay?.name || "N/A", // Include this
        received: allocation.received,
        date_received: allocation.date_received,
    }));

    const fetchAllocationData = () => {
        setLoading(true);

        axios
            .get("/allocations/data")

            .then((response) => {
                const data = response.data;
                setAllocations(data);
                console.log("Allocations data: ", allocations);
            })
            .catch((error) => {
                console.error("error: ", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAllocationData();
        fetchOptions();
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "#", width: 50 },
        {
            field: "allocation_type",
            headerName: "Type",
            width: 100,
            valueGetter: (value, row) => {
                return row?.allocation_type?.name || "Not Assigned";
            },
        },
        {
            field: "farmer_id",
            headerName: "Receiver",
            width: 120,
            valueGetter: (value, row) => {
                return `${row?.farmer?.firstname || "Not Assigned"} ${
                    row?.farmer?.lastname || "Not assigned"
                } `;
            },
        },

        {
            field: "brgy_id",
            headerName: "Barangay",
            width: 100,
            valueGetter: (value, row) => {
                return row?.barangay?.name || "Not Assigned";
            },
        },

        {
            field: "commodity_id",
            headerName: "Commodity",
            width: 70,
            valueGetter: (value, row) => {
                return row?.commodity?.name || "Not Assigned";
            },
        },
        {
            field: "received",
            headerName: "Received",

            width: 50,
        },
        { field: "date_received", type: Date, headerName: "Date", width: 100 },
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAllocation, setNewAllocation] = useState<NewAllocation>({
        allocation_type: "",
        brgy_id: "",
        commodity_id: "",
        date_received: "",
        farmer_id: null,
        received: "",
    });

    const fetchOptions = async () => {
        try {
            const [
                commoditiesData,
                allocationTypeData,
                cropDamageCauseData,
                barangaysData,
            ] = await Promise.all([
                axios.get("/data/commodity"),
                axios.get("/data/allocationtype"),
                axios.get("/data/cropDamageCause"),
                axios.get("/data/barangay"),
            ]);

            setCommodities(
                commoditiesData.data.map((commodity: any) => ({
                    label: commodity.name,
                    value: commodity.id,
                }))
            );

            setAllocationType(
                allocationTypeData.data.map((allocationType: any) => ({
                    label: allocationType.name,
                    value: allocationType.id,
                }))
            );

            setLoadingCommodities(false);
            setLoadingAllocationType(false);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.error(
                    "Error fetching options:",
                    error.response?.data || error.message
                );
            } else {
                console.error("An unknown error occurred:", error);
            }
        }
    };

    const handleEdit = (allocation: Allocation) => {
        setSelectedAllocation(allocation);
        setIsUpdateModalOpen(true);
        console.log(selectedAllocation);
    };

    const handleDelete = async (allocation: Allocation) => {
        if (
            window.confirm(
                "Are you sure you want to delete this allocation record?"
            )
        ) {
            try {
                await router.delete(`/allocations/destroy/${allocation.id}`);
                toast.success("allocation deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
            } catch (error) {
                toast.error("Failed to delete allocation");
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
        setNewAllocation({
            ...newAllocation,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewAllocation({
            ...newAllocation,
            [e.target.name]: e.target.value,
        });
    };

    const handleCommodityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewAllocation((prev) => ({
            ...prev,
            commodity_id: e.target.value,
        }));
    };

    const handleBrgyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewAllocation((prev) => ({
            ...prev,
            brgy_id: e.target.value,
        }));
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (
            !newAllocation.farmer_id ||
            !newAllocation.allocation_type ||
            !newAllocation.received ||
            !newAllocation.brgy_id
        ) {
            toast.error("Please fill in all required fields.");
            return;
        }

        const formData = new FormData();

        console.log("Submitting damage data:", newAllocation);
        (Object.keys(newAllocation) as (keyof typeof newAllocation)[]).forEach(
            (key) => {
                const value = newAllocation[key];
                if (value !== null && value !== undefined) {
                    formData.append(key, String(value));
                }
            }
        );

        try {
            await axios.post("/allocations/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Allocation added successfully");
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

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const [selectedFarmer, setSelectedFarmer] = useState(null);

    const farmerOptions = farmers.map((farmer) => ({
        label: `${farmer.firstname} ${farmer.lastname}`,
        value: farmer.id.toString(),
    }));

    const [selectedAllocation, setSelectedAllocation] =
        useState<Allocation | null>(null);

    const handleView = (allocation: Allocation) => {
        setSelectedAllocation(allocation);
        openModal();
    };

    const handleFarmerSelect = (farmer: Farmer) => {
        setNewAllocation((prev) => ({
            ...prev,
            farmer_id: farmer.id,
        }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAllocation) {
            console.error("No allocation selected");
            toast.error("No allocation selected");
            return;
        }

        const updates = {
            allocation_type: selectedAllocation.allocation_type,
            farmer_id: selectedAllocation.farmer?.id,
            received: selectedAllocation.received,
            date_received: selectedAllocation.date_received,
            commodity_id: selectedAllocation.commodity?.id,
            brgy_id: selectedAllocation.barangay?.id || "",
        };

        try {
            const { data, error } = await supabase
                .from("allocation")
                .update(updates)
                .eq("id", selectedAllocation.id);

            console.log(selectedAllocation);

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

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Allocation Management
                </h2>
            }
        >
            <Head title="Allocation Management" />
            <ToastContainer />

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-10">
                    <h2 className="text-xl mb-2">Add New Allocation</h2>

                    <form onSubmit={handleSubmit}>
                        <Select
                            options={commodities}
                            isLoading={loadingCommodities}
                            value={commodity.find(
                                (c) => c.value === formData.commodity_id
                            )}
                            onChange={(selectedOption) =>
                                handleSelectChange(
                                    selectedOption,
                                    "commodity_id"
                                )
                            }
                            placeholder="Select Commodity"
                            className="rounded-2xl mb-4"
                        />
                        <Select
                            options={allocationType}
                            isLoading={loadingAllocationType}
                            value={allocationType.find(
                                (allocationType) =>
                                    allocationType.value ===
                                    formData.allocationType_id
                            )}
                            onChange={(selectedOption) =>
                                handleSelectChange(
                                    selectedOption,
                                    "allocation_type_id"
                                )
                            }
                            placeholder="Select Allocation Type"
                            className="rounded-2xl mb-4"
                        />
                        <FarmerSearch
                            farmers={farmers}
                            onFarmerSelect={handleFarmerSelect}
                        />


                            <select
                                name="received"
                                value={newAllocation.received}
                                onChange={handleSelectChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="" disabled>
                                    Received?
                                </option>

                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            <select
                                name="brgy_id"
                                value={newAllocation.brgy_id}
                                onChange={handleBrgyChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="">Barangay</option>
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

                        <div className="flex gap-5">
                            <select
                                name="commodity_id"
                                value={newAllocation.commodity_id}
                                onChange={handleCommodityChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="" disabled>
                                    Commodity
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
                            <br />
                            <input
                                type="date"
                                name="date_received"
                                value={newAllocation.date_received}
                                onChange={(e) =>
                                    setNewAllocation({
                                        ...newAllocation,
                                        date_received: e.target.value,
                                    })
                                }
                                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                required
                            />
                        </div>

                        <PrimaryButton onClick={handleSubmit}>
                            Submit
                        </PrimaryButton>
                    </form>
                </div>
            </Modal>
            <div className="flex justify-between mb-3">
                <div className="flex gap-5">
                    <PrimaryButton
                        onClick={openModal}
                        className="text-sm justify-center align-content-center rounded-lg text-white"
                    >
                        <span className="flex gap-2">
                            <PlusIcon size={18} />
                            Add new
                        </span>
                    </PrimaryButton>
                </div>
            </div>

            <span className="text-sm text-slate-300">
                Total Allocations: {allocation.total}
            </span>

            <Box
                sx={{ height: "450px", padding: "10px", borderRadius: "10px" }}
            >
                <DataGrid
                    rows={allocations}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 50 },
                        },
                    }}
                    pageSizeOptions={[50, 100, 200, 350, 500]}
                    loading={loading}
                    slots={{ toolbar: GridToolbar }}
                    sx={{
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#f5f5f5",
                        },
                        padding: "10px",
                        borderRadius: "1.5rem",
                    }}
                />
            </Box>

            <Modal
                show={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
            >
                <h2 className="text-xl mb-2">Update Allocation</h2>

                {selectedAllocation && (
                    <form onSubmit={handleUpdate}>
                        <div className="flex flex-gap">
                            <TextInput
                                name="allocation_type"
                                value={selectedAllocation.allocation_type}
                                onChange={handleInputChange}
                                placeholder="allocation_type"
                            />
                            <FarmerSearch
                                farmers={farmers}
                                onFarmerSelect={handleFarmerSelect}
                            />
                        </div>

                        <div className="flex gap-5">
                            <select
                                name="received"
                                value={selectedAllocation.received}
                                onChange={handleSelectChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="" disabled>
                                    Received?
                                </option>

                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                            <select
                                name="brgy_id"
                                value={selectedAllocation.barangay?.id}
                                onChange={handleBrgyChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="">Barangay</option>
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

                        <div className="flex gap-5">
                            <select
                                name="commodity_id"
                                value={selectedAllocation.commodity?.id}
                                onChange={handleCommodityChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="" disabled>
                                    Commodity
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
                            <br />
                            {/* <input
                                type="date"
                                name="date_received"
                                value={
                                    selectedAllocation.date_received
                                        ? selectedAllocation.date_received
                                              .toISOString()
                                              .split("T")[0]
                                        : ""
                                }
                                onChange={(e) =>
                                    setNewAllocation({
                                        ...selectedAllocation,
                                        date_received: e.target.value,
                                    })
                                }
                                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                            /> */}
                        </div>

                        <PrimaryButton type="submit">Update</PrimaryButton>
                    </form>
                )}
            </Modal>
        </Authenticated>
    );
}
