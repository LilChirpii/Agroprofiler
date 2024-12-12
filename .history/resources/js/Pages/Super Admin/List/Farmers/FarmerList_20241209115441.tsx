import Authenticated from "@/Layouts/AuthenticatedLayout";
import { format } from "date-fns";
import React, {
    ReactNode,
    useState,
    useEffect,
    FormEventHandler,
    Suspense,
    lazy,
} from "react";
import { PageProps } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import List from "@/Components/List";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Search from "@/Components/Search";
import {
    EyeIcon,
    Pencil,
    PlusIcon,
    Trash,
} from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import axios from "axios";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";

import InputLabel from "@/Components/InputLabel";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Box } from "@mui/material";

interface Barangay {
    id: number;
    name: string;
}

interface Farmer {
    id: number;
    rsbsa_ref_no: string;
    firstname: string;
    lastname: string;
    age: number;
    sex: string;
    status: string;
    coop: string;
    pwd: string;
    barangay: {
        id: number;
        name: string;
    };
    "4ps"?: string;
    dob: Date;
    brgy_id: number;
}
export interface PaginatedFarmers {
    data: Farmer[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface FarmerProps extends PageProps {
    farmers: PaginatedFarmers;
    barangays: Barangay[];
}

export default function FarmerList({
    auth,
    farmers,
    barangays = [],
}: FarmerProps) {
    // const farmerData = farmers?.data || [];
    const [farmersData, setFarmersData] = useState<FarmerProps[]>();
    const [loading, setLoading] = useState(false);
    const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
    // const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

    const fetchFarmerData = () => {
        setLoading(true);

        axios
            .get("/farmers/data")

            .then((response) => {
                const data = response.data;
                setFarmersData(data);
                console.log("Farmers data: ", farmers);
            })
            .catch((error) => {
                console.error("error: ", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchFarmerData();
    }, []);

    const columns: GridColDef[] = [
        { field: "id", headerName: "#", width: 100 },
        {
            field: "rsbsa_ref_no",
            headerName: "RSBSA_REF_#",
            width: 200,
        },
        { field: "firstname", headerName: "First name", width: 120 },
        { field: "lastname", headerName: "Last name", width: 120 },
        { field: "age", headerName: "Age", width: 90 },
        {
            field: "brgy_id",
            headerName: "Barangay",
            width: 100,
            // valueGetter: (params: { row: Farmer }) => {
            //     console.log(params.row);
            //     return params.row?.barangay?.name || "Not Assigned";
            // },
        },
        { field: "status", headerName: "Status", width: 100 },
        { field: "sex", headerName: "Sex", width: 70 },
        { field: "4ps", headerName: "4ps", type: "boolean", width: 50 },
        {
            field: "actions",
            headerName: "Actions",
            width: 90,
            renderCell: (params) => (
                <div>
                    <button
                        style={{ marginRight: 5 }}
                        onClick={() => handleView(params.row.id)}
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

    // const [filteredRows, setFilteredRows] = useState<Farmer[]>(farmersData|| []);

    // const handleSearch = (query: string) => {
    //     const lowerCaseQuery = query.toLowerCase();
    //     if (!farmersData) return;

    //     const filteredData = farmers.filter((farmersData) =>
    //         Object.values(farmersData).some((value) =>
    //             String(value).toLowerCase().includes(lowerCaseQuery)
    //         )
    //     );
    //     setFarmersData(filteredData);
    // };


    const closeEditModal = () => setIsEditModalOpen(false);

    const sex = [
        { label: "female", value: "female" },
        { label: "male", value: "male" },
    ];


    const [sexSelectValue, setSexSelectValue] = useState([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleSexSelectChange = (newValue: any) => {
        setSexSelectValue(newValue);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const totalItems = farmers?.total || 0;

    const itemsPerPage = 20;


    const handleView = (farmersData: Farmer) => {
        console.log(`/farmprofile/${farmersData}`);
        router.visit(`/farmprofile/${farmersData}`);
    };

    const handleEdit = (farmersData: Farmer) => {
        setSelectedFarmer(farmersData);
        console.log("farmersData: Farmer id: ", farmersData);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (farmer: Farmer) => {
        if (window.confirm("Are you sure you want to delete this farmer?")) {
            try {
                await router.delete(`/farmers/destroy/${farmer.id}`);
                fetchFarmerData();
                setFarmersData((prevData = []) =>
                    prevData.filter((farmer) => farmer.id !== farmer.id)
                );
                toast.success("Farmer deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
            } catch (error) {
                toast.error("Failed to delete farmer");
            }
        }
    };

    const handleUpdate: FormEventHandler = async (e) => {
        e.preventDefault();

        if (!selectedFarmer?.dob) {
            toast.error("Date of Birth is required.");
            return;
        }

        const formattedFarmer = {
            ...selectedFarmer,
            dob: selectedFarmer.dob ? selectedFarmer.dob : null,
            brgy_id: selectedFarmer.brgy_id,
        };

        console.log("Formatted Farmer ID:", formattedFarmer.id);
        console.log(formattedFarmer);

        try {
            await axios.patch(`/farmers/update/${formattedFarmer.id}`, {
                rsbsa_ref_no: formattedFarmer.rsbsa_ref_no,
                firstname: formattedFarmer.firstname,
                lastname: formattedFarmer.lastname,
                dob: formattedFarmer.dob,
                age: formattedFarmer.age,
                sex: formattedFarmer.sex,
                status: formattedFarmer.status,
                coop: formattedFarmer.coop,
                pwd: formattedFarmer.pwd,
                "4ps": formattedFarmer["4ps"],
                brgy_id: formattedFarmer.brgy_id,
            });
            toast.success("Farmer updated successfully");
            closeModal();
        } catch (error) {
            console.error("Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                toast.error(
                    `Failed to update farmer: ${error.response.statusText}`
                );
            } else {
                toast.error("Failed to update farmer");
            }
        }
    };

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const [newFarmer, setNewFarmer] = useState({
        rsbsa_ref_no: "",
        firstname: "",
        lastname: "",
        age: "",
        sex: "",
        brgy_id: "",
        status: "",
        coop: "",
        pwd: "",
        "4ps": "",
        dob: "",
    });

    // const filterRows = (status: string[], year: string[], sex: string[]) => {
    //     let filtered = rows;

    //     if (status.length > 0) {
    //         filtered = filtered.filter((row) =>
    //             status.includes(row.status.props.children)
    //         );
    //     }
    //     setFilteredRows(filtered);
    // };

    const openModal = (): void => {
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewFarmer({
            ...newFarmer,
            [e.target.name]: e.target.value,
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setNewFarmer({
            ...newFarmer,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (!newFarmer.dob) {
            toast.error("Date of Birth is required.");
            return;
        }
        const formattedFarmer = {
            ...newFarmer,
            dob: newFarmer.dob ? newFarmer.dob : null,
        };
        const formData = new FormData();

        (
            Object.keys(formattedFarmer) as (keyof typeof formattedFarmer)[]
        ).forEach((key) => {
            const value = formattedFarmer[key];
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        try {
            await axios.post("/farmers/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("Farmer added successfully");
            closeModal();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error("Error adding farmer:", error.response.data);
                toast.error(
                    `Failed to add farmer: ${
                        error.response.data.message || "Validation error"
                    }`
                );
            } else {
                toast.error("Failed to add farmer");
            }
        }
    };

    const handleUpdateInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!selectedFarmer) return;
        setSelectedFarmer({
            ...selectedFarmer,
            [e.target.name]: e.target.value,
        } as Farmer);
    };

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Farmers Management
                </h2>
            }
        >
            <Head title="Farmers Management" />
            <ToastContainer />

            <div className="flex justify-between mb-3">
                <div className="flex gap-5">

                </div>
                <div className="flex gap-5">
                    <PrimaryButton
                        className="text-sm justify-center align-content-center rounded-lg text-white"
                        onClick={openModal}
                    >
                        <span className="flex gap-2">
                            <PlusIcon size={18} />
                            Add new
                        </span>
                    </PrimaryButton>
                </div>
            </div>

            <span className="text-sm text-slate-300">
                Total farmers: {farmers.total}
            </span>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-4">
                    <div className="p-2 border-b-[1px] border-slate-300 mb-2">
                        <h2 className="text-lg">Add New Farmer</h2>
                    </div>

                    <div className="mt-4">
                        <form onSubmit={handleSubmit}>
                            <div className="flex gap-5">
                                <TextInput
                                    name="firstname"
                                    value={newFarmer.firstname}
                                    onChange={handleInputChange}
                                    placeholder="Firstname"
                                />
                                <TextInput
                                    name="lastname"
                                    value={newFarmer.lastname}
                                    onChange={handleInputChange}
                                    placeholder="Lastname"
                                />
                            </div>
                            <br />
                            <div className="flex gap-5">
                                <TextInput
                                    name="age"
                                    value={newFarmer.age}
                                    onChange={handleInputChange}
                                    placeholder="Age"
                                />
                                <select
                                    name="sex"
                                    value={newFarmer.sex}
                                    onChange={handleSelectChange}
                                    className="rounded-lg border-gray-300"
                                >
                                    <option value="" disabled>
                                        Select Sex
                                    </option>
                                    {sex.map((sexOption) => (
                                        <option
                                            key={sexOption.value}
                                            value={sexOption.value}
                                        >
                                            {sexOption.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <br />
                            <div className="flex gap-5">
                                <select
                                    name="brgy_id"
                                    value={newFarmer.brgy_id}
                                    onChange={handleSelectChange}
                                    className="w-full rounded-lg border-gray-300"
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

                                <select
                                    name="4ps"
                                    value={newFarmer["4ps"]}
                                    onChange={handleSelectChange}
                                    className=" w-full rounded-lg border-gray-300"
                                >
                                    <option value="">Is 4Ps?</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>

                                <select
                                    name="pwd"
                                    value={newFarmer.pwd}
                                    onChange={handleSelectChange}
                                    className="w-full rounded-lg border-gray-300"
                                >
                                    <option value="" disabled>
                                        Is PWD?
                                    </option>

                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <br />
                            <div>
                                <input
                                    type="date"
                                    id="dob"
                                    name="dob"
                                    value={newFarmer.dob}
                                    onChange={(e) =>
                                        setNewFarmer({
                                            ...newFarmer,
                                            dob: "1990-01-01",
                                        })
                                    }
                                    className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                    required
                                />
                                <br />
                                <select
                                    name="status"
                                    value={newFarmer.status}
                                    onChange={handleSelectChange}
                                    className="mt-3 w-full rounded-lg border-gray-300"
                                >
                                    <option value="" disabled>
                                        Status
                                    </option>
                                    <option value="registered">
                                        Registered
                                    </option>
                                    <option value="unregistered">
                                        Unregistered
                                    </option>
                                </select>
                                <br />
                                <input
                                    type="text"
                                    id="coop"
                                    name="coop"
                                    placeholder="coop"
                                    value={newFarmer.coop}
                                    onChange={handleInputChange}
                                    className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                />
                            </div>

                            <div className="p-4 mt-4 border-t border-slate-300">
                                <PrimaryButton onClick={handleSubmit}>
                                    Submit
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            <Box
                sx={{ height: "450px", padding: "10px", borderRadius: "10px" }}
            >
                <DataGrid
                    rows={farmersData}
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

            {selectedFarmer && (
                <Modal show={isEditModalOpen} onClose={closeEditModal}>
                    <div className="p-4">
                        <div className="p-2 border-b-[1px] border-slate-300 mb-4">
                            <h2 className="text-lg mb-2">Edit Farmer</h2>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="flex gap-5 mb-4">
                                <div>
                                    <InputLabel
                                        value="First Name"
                                        htmlFor="firstName"
                                        className="mb-2"
                                    />
                                    <TextInput
                                        name="firstname"
                                        value={selectedFarmer.firstname}
                                        onChange={handleUpdateInputChange}
                                        placeholder="Firstname"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        value="Last Name"
                                        htmlFor="lastName"
                                        className="mb-2"
                                    />
                                    <TextInput
                                        name="lastname"
                                        value={selectedFarmer.lastname}
                                        onChange={handleUpdateInputChange}
                                        placeholder="Lastname"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-5 mb-4">
                                <div>
                                    <InputLabel
                                        value="Age"
                                        htmlFor="age"
                                        className="mb-2"
                                    />
                                    <TextInput
                                        name="age"
                                        value={selectedFarmer.age}
                                        onChange={handleUpdateInputChange}
                                        placeholder="Age"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        value="Coop"
                                        htmlFor="coop"
                                        className="mb-2"
                                    />
                                    <input
                                        type="text"
                                        id="coop"
                                        name="coop"
                                        placeholder="coop"
                                        value={selectedFarmer.coop}
                                        onChange={handleUpdateInputChange}
                                        className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <InputLabel value="Sex" htmlFor="sex" />
                                    <select
                                        name="sex"
                                        className="w-[200px] mt-3 rounded-lg border-gray-300"
                                        value={selectedFarmer.sex}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                sex: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Select Sex</option>
                                        {sex.map((sexOption) => (
                                            <option
                                                key={sexOption.value}
                                                value={sexOption.value}
                                            >
                                                {sexOption.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <InputLabel
                                        value="Barangay"
                                        htmlFor="barangay"
                                    />
                                    <select
                                        name="brgy_id"
                                        value={
                                            selectedFarmer.barangay?.name || ""
                                        }
                                        onChange={(e) => {
                                            const barangayId = Number(
                                                e.target.value
                                            );
                                            const selectedBarangay =
                                                barangays.find(
                                                    (b) => b.id === barangayId
                                                );
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                barangay: selectedBarangay || {
                                                    id: 0,
                                                    name: "Unknown",
                                                },
                                            });
                                        }}
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="" disabled>
                                            Barangay
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
                            </div>

                            <div className="flex gap-4 mt-4">
                                <div>
                                    <InputLabel value="Is 4ps?" htmlFor="4ps" />
                                    <select
                                        name="4ps"
                                        value={selectedFarmer["4ps"]}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                "4ps": e.target.value,
                                            })
                                        }
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="" disabled>
                                            Is 4Ps?
                                        </option>
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                <div>
                                    <InputLabel value="Is PWD?" htmlFor="pwd" />
                                    <select
                                        name="pwd"
                                        value={selectedFarmer.pwd}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                pwd: e.target.value,
                                            })
                                        }
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="" disabled>
                                            Is PWD?
                                        </option>

                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div>
                                    <InputLabel
                                        value="Birthdate"
                                        htmlFor="dob"
                                    />
                                    <input
                                        type="date"
                                        id="dob"
                                        name="dob"
                                        value={
                                            selectedFarmer.dob
                                                ? format(
                                                      new Date(
                                                          selectedFarmer.dob
                                                      ),
                                                      "yyyy-MM-dd"
                                                  )
                                                : ""
                                        }
                                        onChange={handleUpdateInputChange}
                                        className="mt-1 w-full border-gray-300 rounded-lg shadow-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <InputLabel value="status" htmlFor="dob" />
                                    <select
                                        name="status"
                                        value={selectedFarmer.status}
                                        onChange={(e) =>
                                            setSelectedFarmer({
                                                ...selectedFarmer,
                                                status: e.target.value,
                                            })
                                        }
                                        className="mt-3 w-full rounded-lg border-gray-300"
                                    >
                                        <option value="">Status</option>
                                        <option value="registered">
                                            Registered
                                        </option>
                                        <option value="unregistered">
                                            Unregistered
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 mt-4 border-t border-slate-300">
                                <PrimaryButton type="submit">
                                    Update
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </Authenticated>
    );
}
