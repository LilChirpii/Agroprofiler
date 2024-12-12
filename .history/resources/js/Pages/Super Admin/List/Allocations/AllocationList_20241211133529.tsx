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
import "react-toastify/dist/ReactToastify.css";
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
    allocation_type_id: string;
    allocation_type: string;
    brgy_id: string;
    commodity_id: string;
    date_received: string;
    farmer_id: number | null;
    received: string;
}

type Allocation = {
    id: number;
    allocation_type_id: string;
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
    const [farmerss, setFarmers] = useState<Option[]>([]);
    const [allocations, setAllocations] = useState<AllocationProps[]>();
    const [loading, setLoading] = useState(false);
    const [loadingAllocationType, setLoadingAllocationType] = useState(true);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
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
            field: "allocation_type_id",
            headerName: "Type",
            width: 100,
            valueGetter: (value, row) => row.allocation_type,
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
        {
            field: "date_received",
            headerName: "Date Received",
            type: "date", // Use a valid GridColType, not `DateConstructor`
            valueGetter: (value, row) => new Date(row.date_received),
        },
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
        allocation_type_id: "",
        brgy_id: "",
        commodity_id: "",
        date_received: "",
        farmer_id: null,
        received: "",
        allocation_type: " ",
    });

    const fetchOptions = async () => {
        try {
            const [
                commoditiesData,
                allocationTypeData,
                cropDamageCauseData,
                barangaysData,
                farmersData,
            ] = await Promise.all([
                axios.get("/data/commodity"),
                axios.get("/data/allocationtype"),
                axios.get("/data/cropDamageCause"),
                axios.get("/data/barangay"),
                axios.get("/data/farmers"),
            ]);

            setFarmers(
                farmersData.data.map((farmer: any) => ({
                    label: `${farmer.firstname || ""} ${farmer.lastname}`,
                    value: farmer.id,
                }))
            );

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
            setLoadingFarmers(false);
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
        console.log(selectedAllocation);
        setIsUpdateModalOpen(true);
    };

    const handleDelete = async (allocations: Allocation) => {
        console.log("select");
        if (
            window.confirm(
                "Are you sure you want to delete this allocation record?"
            )
        ) {
            try {
                await router.delete(`/allocations/destroy/${allocations}`);
                toast.success("allocation deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
                fetchAllocationData();
                setAllocations((prevData = []) =>
                    prevData.filter(
                        (setAllocations) => setAllocations !== setAllocations
                    )
                );
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

    const handleSelectChange = (
        selectedOption: { value: number; label: string } | null,
        field: string
    ) => {
        setNewAllocation((prev) => ({
            ...prev,
            [field]: selectedOption ? selectedOption.value : 0,
        }));
    };

    const handleUpdateSelectChange = (
        selectedOption: { value: number; label: string } | null,
        field: string
    ) => {
        setSelectedAllocation((prev) => ({
            ...prev,
            [field]: selectedOption
                ? selectedOption.value
                : prev?.[field] || "",
        }));
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
            !newAllocation.allocation_type_id ||
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

        console.log("new allocation", newAllocation);

        try {
            await axios.post("/allocations/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Allocation added successfully");

            fetchAllocationData();
            setAllocations((prevData = []) =>
                prevData.filter(
                    (setAllocations) => setAllocations !== setAllocations
                )
            );
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
        useState<Allocation | null>({
            id: 0,
            allocation_type_id: "",
            allocation_type: "",
            farmer: {
                id: 0,
                firstname: "",
                lastname: "",
            },
            received: "",
            date_received: new Date(),
            commodity: { id: 0, name: "" },
            barangay: { id: 0, name: "" },
        });

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

    useEffect(() => {
        if (selectedAllocation) {
            console.log("Selected Allocation:", selectedAllocation); // Log whenever selectedAllocation changes
        }
    }, [selectedAllocation]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedAllocation) {
            console.error("No allocation selected");
            toast.error("No allocation selected");
            return;
        }

        const updates = {
            allocation_type_id: selectedAllocation.allocation_type_id,
            farmer_id: selectedAllocation.farmer?.id,
            received: selectedAllocation.received,
            date_received: selectedAllocation.date_received,
            commodity_id: selectedAllocation.commodity?.id,
            brgy_id: selectedAllocation.barangay?.id || "",
        };

        try {
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            if (!csrfToken) {
                toast.error("CSRF token not found.");
                return;
            }

            const response = await axios.put(
                `/allocations/update/${selectedAllocation.id}`, // use selectedAllocation.id here
                updates,
                {
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                    },
                }
            );

            if (response.status === 200) {
                console.log("Allocation updated successfully:", response.data);
                toast.success("Allocation updated successfully!");
                setIsUpdateModalOpen(false);
            } else {
                console.error("Error updating allocation:", response);
                toast.error("Failed to update allocation.");
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("Unexpected error occurred.");
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
                        {/* Commodity Select */}

                        {/* Allocation Type Select */}
                        <select
                            name="allocation_type_id"
                            value={newAllocation.allocation_type_id}
                            onChange={(e) =>
                                setNewAllocation((prev) => ({
                                    ...prev,
                                    allocation_type_id: e.target.value,
                                }))
                            }
                            className="mb-3 w-full rounded-lg border-gray-300"
                        >
                            <option value="">Allocation Type</option>
                            {allocationType.map((allocationType) => (
                                <option
                                    key={allocationType.value}
                                    value={allocationType.value}
                                >
                                    {allocationType.label}
                                </option>
                            ))}
                        </select>

                        {/* Farmer Search */}
                        <FarmerSearch
                            farmers={farmers}
                            onFarmerSelect={handleFarmerSelect}
                        />

                        {/* Received Dropdown */}
                        <select
                            name="received"
                            value={newAllocation.received}
                            onChange={(e) =>
                                setNewAllocation((prev) => ({
                                    ...prev,
                                    received: e.target.value,
                                }))
                            }
                            className="mt-3 w-full rounded-lg border-gray-300"
                        >
                            <option value="" disabled>
                                Received?
                            </option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>

                        {/* Barangay Dropdown */}
                        <select
                            name="brgy_id"
                            value={newAllocation.brgy_id}
                            onChange={(e) =>
                                setNewAllocation((prev) => ({
                                    ...prev,
                                    brgy_id: e.target.value,
                                }))
                            }
                            className="mt-3 w-full rounded-lg border-gray-300"
                        >
                            <option value="">Barangay</option>
                            {barangays.map((barangay) => (
                                <option key={barangay.id} value={barangay.id}>
                                    {barangay.name}
                                </option>
                            ))}
                        </select>

                        {/* Commodity Dropdown */}
                        <select
                            name="commodity_id"
                            value={newAllocation.commodity_id}
                            onChange={(e) =>
                                setNewAllocation((prev) => ({
                                    ...prev,
                                    commodity_id: e.target.value,
                                }))
                            }
                            className="mt-3 w-full rounded-lg border-gray-300"
                        >
                            <option value="" disabled>
                                Commodity
                            </option>
                            {commodities.map((commodity) => (
                                <option key={commodity.id} value={commodity.id}>
                                    {commodity.name}
                                </option>
                            ))}
                        </select>

                        {/* Date Received Input */}
                        <input
                            type="date"
                            name="date_received"
                            value={newAllocation.date_received}
                            onChange={(e) =>
                                setNewAllocation((prev) => ({
                                    ...prev,
                                    date_received: e.target.value,
                                }))
                            }
                            className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                            required
                        />

                        {/* Submit Button */}
                        <PrimaryButton type="submit" className="mt-4">
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
                {selectedAllocation ? (
                    <div className="p-10">
                        <h2 className="text-xl mb-2">Update Allocation</h2>
                        <form onSubmit={handleUpdate}>
                            {/* Allocation Type */}
                            <select
                                name="allocation_type_id"
                                value={
                                    selectedAllocation.allocation_type_id || ""
                                }
                                onChange={(e) =>
                                    handleUpdateSelectChange(
                                        {
                                            value: parseInt(e.target.value),
                                            label: e.target.options[
                                                e.target.selectedIndex
                                            ].text,
                                        },
                                        "allocation_type_id"
                                    )
                                }
                                className="mb-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="">Select Allocation Type</option>
                                {allocationType.map((allocation) => (
                                    <option
                                        key={allocation.value}
                                        value={allocation.value}
                                    >
                                        {allocation.label}
                                    </option>
                                ))}
                            </select>

                            {/* Select Farmer */}
                            <Select
                                options={farmerss}
                                isLoading={loadingFarmers}
                                value={
                                    selectedAllocation.farmer
                                        ? {
                                              value: selectedAllocation.farmer
                                                  .id,
                                              label: `${selectedAllocation.farmer.firstname} ${selectedAllocation.farmer.lastname}`,
                                          }
                                        : null
                                }
                                onChange={(selectedOption) =>
                                    handleUpdateSelectChange(
                                        selectedOption,
                                        "farmer_id"
                                    )
                                }
                                placeholder="Select Farmer"
                            />

                            {/* Received */}
                            <select
                                name="received"
                                value={selectedAllocation.received || ""}
                                onChange={handleInputChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
                            >
                                <option value="" disabled>
                                    Received?
                                </option>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>

                            {/* Barangay */}
                            <select
                                name="brgy_id"
                                value={selectedAllocation.barangay?.id || ""}
                                onChange={handleInputChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
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

                            {/* Commodity */}
                            <select
                                name="commodity_id"
                                value={selectedAllocation.commodity?.id || ""}
                                onChange={handleInputChange}
                                className="mt-3 w-full rounded-lg border-gray-300"
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

                            {/* Date Received */}
                            <input
                                type="date"
                                name="date_received"
                                value={
                                    selectedAllocation.date_received
                                        ? selectedAllocation.date_received
                                              .toISOString()
                                              .split("T")[0]
                                        : ""
                                }
                                onChange={handleInputChange}
                                className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                            />

                            <PrimaryButton type="submit" className="mt-4">
                                Update
                            </PrimaryButton>
                        </form>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </Modal>
        </Authenticated>
    );
}
