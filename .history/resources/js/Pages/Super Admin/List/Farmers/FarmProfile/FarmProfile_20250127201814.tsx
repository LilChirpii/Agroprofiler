import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import {
    Plus,
    Edit,
    Trash,
    Eye,
    ChevronLeft,
    TrashIcon,
    EditIcon,
    HouseIcon,
    User2Icon,
    Cake,
    Building2,
    Edit2,
    House,
    Contact2,
    Phone,
    Accessibility,
    HandCoins,
} from "lucide-react";
import Modal from "@/Components/Modal";
import Card from "@/Components/Card";
import { PageProps } from "@/types";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

import Select from "react-select";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tab, Tabs } from "@/Components/Tabs";
import Timeline from "@/Components/Timeline";

interface Allocation {
    id: number;
    allocation_type: {
        name: number;
        desc: string;
    };
    date_received: string;
}

interface CropDamage {
    id: number;
    cause: string;
    crop_damage_cause_id: number;
    crop_damage_cause: {
        id: number;
        name: string;
    };
    proof: string;
    total_damaged_area: number;
    partially_damaged_area: number;
    area_affected: number;
    severity: string;
    image?: File | null;
}

interface CropDamageCause {
    id: number;
    name: string;
    desc: string;
}

interface FormData {
    farmer: {
        id: number;
        farmer_id: number;
        brgy_id: number;
    };
    barangay: {
        id: string;
    };
    // other fields
}

interface Farm {
    id: number;
    commodity: {
        id: number;
        name: string;
    };
    barangay: {
        id: number;
        name: string;
    };
    ha: number;
    owner: string;
}

interface Farmer {
    id: number;
    rsbsa_ref_no: string;
    firstname: string;
    lastname: string;
    dob: string;
    status: string;
    barangay: {
        id: number;
        name: string;
    };
    allocations: Allocation[];
    crop_damages: CropDamage[];
    farms: Farm[];
    coop: string;
    pwd: string;
    "4ps": string;
}

interface Option {
    id: number;
    label: string;
    value: number;
    firstname: string;
    lastname: string;
}

interface FarmersListProps extends PageProps {
    farmer: Farmer;
}

export default function FarmProfile({ auth, farmer }: FarmersListProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<string>("");
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [cropDamages, setCropDamages] = useState<CropDamage[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [commodities, setCommodities] = useState<Option[]>([]);
    const [cropDamageCause, setCropDamageCause] = useState<Option[]>([]);
    const [allocationType, setAllocationType] = useState<Option[]>([]);
    const [loadingCommodities, setLoadingCommodities] = useState(true);
    const [barangays, setBarangays] = useState<Option[]>([]);
    const [loadingBarangays, setLoadingBarangays] = useState(true);
    const [loadingCropDamageCause, setLoadingCropDamageCause] = useState(true);
    const [loadingAllocationType, setLoadingAllocationType] = useState(true);
    const [data, setData] = useState([]);

    const handleOpenModal = (type: string, data?: any) => {
        console.log("Opening modal with data:", data);
        console.log("Opening modal with data:", type);

        setModalType(type);
        setFormData({
            ...data,
            allocation_type_id: data?.allocation_type_id || "",
            commodity_id: data?.commodity_id || "",
            received: data?.received || "",
            date_received: data?.date_received || "",
        });
        setModalOpen(true);
    };

    useEffect(() => {
        fetchData();
        fetchOptions();
    }, []);

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

            setBarangays(
                barangaysData.data.map((barangay: any) => ({
                    label: barangay.name,
                    value: barangay.id,
                }))
            );

            setAllocationType(
                allocationTypeData.data.map((allocationType: any) => ({
                    label: allocationType.name,
                    value: allocationType.id,
                }))
            );

            setCropDamageCause(
                cropDamageCauseData.data.map((cropDamageCause: any) => ({
                    label: cropDamageCause.name,
                    value: cropDamageCause.id,
                }))
            );

            setLoadingCommodities(false);
            setLoadingAllocationType(false);
            setLoadingBarangays(false);
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

    const handleSelectChange = (selectedOption: any, field: string) => {
        setFormData({
            ...formData,
            [field]: selectedOption ? selectedOption.value : "",
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/data/farmprofile/${farmer.id}`);
            setAllocations(response.data.allocations);
            setCropDamages(response.data.damages);
            setFarms(response.data.farmer.farms);
            console.log("crop damage: ", cropDamages);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setFormData({});
    };

    const deleteData = async (id: number) => {
        setLoading(true);

        // Define the route for each modalType
        let route = "";
        switch (modalType) {
            case "allocation":
                route = `/allocations/destroy/${id}`;
                break;
            case "damage":
                route = `/cropdamages/destroy/${id}`;
                break;
            case "farm":
                route = `/farms/destroy/${id}`;
                break;
            default:
                route = ""; // Default route in case of unknown modal type
                break;
        }

        try {
            const response = await axios.post(route, {
                _method: "DELETE",
            });

            toast.success(
                `${
                    modalType.charAt(0).toUpperCase() + modalType.slice(1)
                } deleted successfully!`
            );
            fetchData();
        } catch (error) {
            console.error("Error deleting data:", error);
            toast.error(
                `Failed to delete ${
                    modalType.charAt(0).toUpperCase() + modalType.slice(1)
                }!`
            );
        } finally {
            setLoading(false);
        }
    };

    const allocationColumns: GridColDef[] = [
        { field: "id", headerName: "#", width: 90 },
        {
            field: "allocations",
            headerName: "Allocation",
            width: 120,
        },
        {
            field: "date_received",
            type: Date,
            headerName: "Date Received",
            width: 180,
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly mt-4">
                    <EditIcon
                        size={20}
                        onClick={() =>
                            handleOpenModal("allocation", params.row)
                        }
                        color="green"
                        className="flex justify-center content-center"
                    />
                    <TrashIcon
                        size={20}
                        onClick={() => deleteData(params.row.id)}
                        color="red"
                    />
                </div>
            ),
        },
    ];

    const damageColumns: GridColDef[] = [
        { field: "id", headerName: "#", width: 90 },
        {
            field: "proof",
            headerName: "Proof",
            width: 150,
            renderCell: (params) => {
                const proofUrl = params.value
                    ? `http://127.0.0.1:8000//${params.value}`
                    : "";
                return proofUrl ? (
                    <img
                        src={proofUrl}
                        alt="Proof"
                        style={{
                            width: "100%",
                            height: "auto",
                            padding: "5px",
                            borderRadius: "10px",
                            maxHeight: "60px",
                            objectFit: "contain",
                        }}
                    />
                ) : (
                    <span>No Image</span>
                );
            },
        },
        { field: "crop_damage_cause", headerName: "Cause", width: 250 },
        {
            field: "partially_damaged_area",
            headerName: "Partially Damaged Area (ha)",
            width: 250,
        },
        {
            field: "total_damaged_area",
            headerName: "Total Damaged Area (ha)",
            width: 250,
        },
        {
            field: "area_affected",
            headerName: "Area Affected (ha)",
            width: 250,
        },
        {
            field: "severity",
            headerName: "Severity",
            width: 250,
        },
        {
            field: "actions",
            headerName: "Actions",
            align: "center",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly mt-4">
                    <Edit
                        size={20}
                        color="green"
                        onClick={() => handleOpenModal("damage", params.row)}
                    />
                    <Trash
                        size={20}
                        color="red"
                        onClick={() => deleteData(params.row.id)}
                    />
                </div>
            ),
        },
    ];

    const farmColumns: GridColDef[] = [
        { field: "id", headerName: "#", width: 90 },
        { field: "commodity", headerName: "Commodity", width: 200 },
        { field: "barangay", headerName: "Barangay", width: 200 },
        { field: "ha", headerName: "Hectares", width: 150 },
        { field: "owner", headerName: "Owner", width: 200 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly mt-4">
                    <EditIcon
                        size={20}
                        onClick={() => handleOpenModal("farm", params.row)}
                        color="green"
                    />
                    <TrashIcon
                        size={20}
                        onClick={() => deleteData(params.row.id)}
                        color="red"
                    />
                </div>
            ),
        },
    ];

    const handleSaveAllocation = async () => {
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append("farmer_id", farmer.id.toString());
            dataToSend.append("brgy_id", farmer.barangay.id.toString());

            // Add other fields for Allocation
            dataToSend.append(
                "allocation_type_id",
                formData.allocation_type_id
            );
            dataToSend.append("commodity_id", formData.commodity_id);
            dataToSend.append("received", formData.received);

            // Check if date_received is set before appending to FormData
            if (formData.date_received) {
                dataToSend.append("date_received", formData.date_received);
            } else {
                // Optionally, you can append a null value or skip the field based on how your backend handles nullable fields
                dataToSend.append("date_received", "");
            }

            console.log("Data to send for Allocation:", dataToSend);

            const response = await axios.post(
                "/allocations/store",
                dataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            console.log("API response for Allocation:", response.data);

            toast.success("Successfully added the allocation!");
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving Allocation:", error);
            toast.error("Error saving allocation!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateAllocation = async () => {
        setLoading(true);
        try {
            const dataToSend = {
                _method: "PUT", // Method spoofing
                farmer_id: farmer.id,
                brgy_id: farmer.barangay.id,
                allocation_type_id: formData.allocation_type_id,
                commodity_id: formData.commodity_id,
                received: formData.received,
                date_received: formData.date_received,
            };

            console.log(
                "Data to send for Allocation update with method spoofing:",
                dataToSend
            );

            const response = await axios.post(
                `/allocations/update/${formData.id}`, // Use POST instead of PUT
                dataToSend,
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("API response for Allocation update:", response.data);

            toast.success("Successfully updated the allocation!");
            fetchData();
            setModalOpen(false);
        } catch (error: any) {
            console.error(
                "Error updating Allocation:",
                error.response?.data || error
            );
            toast.error(
                `Error updating allocation: ${
                    error.response?.data?.message || "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCropDamage = async () => {
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append("farmer_id", farmer.id.toString());
            dataToSend.append("brgy_id", farmer.barangay.id.toString());

            // Add other fields for Crop Damage
            dataToSend.append("commodity_id", formData.commodity_id);
            dataToSend.append(
                "crop_damage_cause_id",
                formData.crop_damage_cause_id
            );
            dataToSend.append(
                "total_damaged_area",
                formData.total_damaged_area
            );
            dataToSend.append(
                "partially_damaged_area",
                formData.partially_damaged_area
            );
            dataToSend.append("area_affected", formData.area_affected);
            dataToSend.append("severity", formData.severity);

            // If image (proof) is selected, add it to the form data
            if (formData.proof) {
                dataToSend.append("proof", formData.proof);
            }

            console.log("Data to send for Crop Damage:", dataToSend);

            const response = await axios.post(
                "/store/cropdamages",
                dataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            console.log("API response for Crop Damage:", response.data);

            toast.success("Successfully added the crop damage!");
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving Crop Damage:", error);
            toast.error("Error saving crop damage!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCropDamage = async () => {
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append("farmer_id", farmer.id.toString());
            dataToSend.append("brgy_id", farmer.barangay.id.toString());

            dataToSend.append("commodity_id", formData.commodity_id);
            dataToSend.append(
                "crop_damage_cause_id",
                formData.crop_damage_cause_id
            );
            dataToSend.append(
                "total_damaged_area",
                formData.total_damaged_area
            );
            dataToSend.append(
                "partially_damaged_area",
                formData.partially_damaged_area
            );
            dataToSend.append("area_affected", formData.area_affected);
            dataToSend.append("severity", formData.severity);

            if (formData.proof) {
                dataToSend.append("proof", formData.proof);
            }

            console.log("Data to send for Crop Damage update:", dataToSend);

            const response = await axios.post(
                `/cropdamages/update/${formData.id}`,
                dataToSend,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            console.log("API response for Crop Damage update:", response.data);

            toast.success("Successfully updated the crop damage!");
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error updating Crop Damage:", error);
            toast.error("Error updating crop damage!");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFarm = async () => {
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append("farmer_id", farmer.id.toString());
            dataToSend.append("brgy_id", formData.brgy_id.toString());

            // Add other fields for Farm
            dataToSend.append("commodity_id", formData.commodity_id);
            dataToSend.append("ha", formData.ha);
            dataToSend.append("owner", formData.owner);

            console.log("Data to send for Farm:", dataToSend);

            const response = await axios.post("/farms/store", dataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log("API response for Farm:", response.data);

            toast.success("Successfully added the farm!");
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving Farm:", error);
            toast.error("Error saving farm!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFarm = async () => {
        setLoading(true);
        try {
            const dataToSend = {
                farmer_id: farmer.id,
                brgy_id: formData.brgy_id,
                commodity_id: formData.commodity_id,
                ha: formData.ha,
                owner: formData.owner,
            };

            console.log("Data to send for Farm update:", dataToSend);

            const response = await axios.put(
                `/farms/update/${formData.id}`,
                dataToSend,
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("API response for Farm update:", response.data);

            toast.success("Successfully updated the farm!");
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error(
                "Error updating Farm:",
                error.response?.data || error
            );
            toast.error(
                `Error updating farm: ${
                    error.response?.data?.message || "Unknown error"
                }`
            );
        } finally {
            setLoading(false);
        }
    };

    function changeDateFormat(dateString: string | number | Date) {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
        } as Intl.DateTimeFormatOptions;
        const date = new Date(dateString);
        return date.toLocaleDateString("en-UK", options);
    }

    const timelineData = [
        {
            title: "Activity 1",
            description: "This is the description for activity 1.",
            timestamp: "2025-01-27 10:00 AM",
        },
        {
            title: "Activity 2",
            description: "This is the description for activity 2.",
            timestamp: "2025-01-27 12:00 PM",
        },
        {
            title: "Activity 3",
            description: "This is the description for activity 3.",
            timestamp: "2025-01-27 02:00 PM",
        },
    ];

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    <>
                        <div className="flex justify-between w-[300px] ">
                            <Link href="/farmers">
                                <span className="flex mb-4">
                                    <ChevronLeft size={24} /> Back
                                </span>{" "}
                            </Link>
                            <Edit2 size={20} />
                        </div>
                    </>
                </h2>
            }
        >
            <Head title={`${farmer.firstname} ${farmer.lastname} `} />
            <ToastContainer />

            <div className="grid grid-cols-4 h-full gap-0 p-[0.5rem]">
                <div className="relative left-0 h-full border-r px-4 py-2 border-slate-200 ">
                    <div className="relative flex justify-center content-center ">
                        <img
                            src="https://www.pngmart.com/files/22/User-Avatar-Profile-PNG.png"
                            alt=""
                            className="w-[105px] h-[105px] object-cover rounded-lg border"
                        />
                    </div>
                    <div className="flex content-center justify-center mt-2">
                        {farmer.firstname} {farmer.lastname}
                    </div>
                    <div className="flex content-center justify-center mt-1">
                        {farmer.status === "registered" ? (
                            <>
                                <div className="text-slate-600 p-1 rounded-2xl text-xs">
                                    {farmer.rsbsa_ref_no}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-red-400 p-1 rounded-lg text-[10px]">
                                    unregistered
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-1">
                        <div className="mt-4">
                            <span className="text-slate-400 text-sm ml-3 mt-4">
                                Info
                            </span>{" "}
                        </div>
                        <div className="pl-3">
                            <div className="mt-2 flex gap-1">
                                <span className="flex gap-2 text-slate-700 text-sm">
                                    <House size={18} />
                                    {farmer.barangay?.name}, Davao del Sur
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="flex gap-2 text-slate-700 text-sm">
                                    <Cake size={18} />
                                    {farmer.dob}
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="flex gap-2 text-slate-700 text-sm">
                                    <Phone size={18} />
                                    09676979568
                                </span>
                            </div>

                            {farmer["4ps"] === "yes" ? (
                                <>
                                    <div className="mt-2">
                                        <span className="flex gap-2 text-slate-700 text-sm">
                                            <HandCoins size={20} />
                                            4ps Beneficiary
                                        </span>
                                    </div>
                                </>
                            ) : (
                                ""
                            )}

                            {farmer.pwd === "yes" ? (
                                <>
                                    <div className="mt-2">
                                        <span className="flex gap-2 text-slate-700 text-sm">
                                            <Accessibility size={20} />
                                            Person with disabilty
                                        </span>
                                    </div>
                                </>
                            ) : (
                                ""
                            )}
                        </div>
                    </div>
                </div>

                {/* left na ni */}
                <div className="relative col-span-3 right-0 h-full px-6 py-4">
                    <span className="text-lg text-slate-700 font-semibold">
                        Data History
                    </span>
                    <div className="w-full h-full mt-4">
                        <Tabs>
                            <Tab label="Allocation">
                                <p>This is the content of Tab 2.</p>
                            </Tab>
                            <Tab label="Crop Damages">
                                <div className="flex justify-between px-4">
                                    <PrimaryButton
                                        className="bg-green-500 text-white mb-4 rounded flex"
                                        onClick={() =>
                                            handleOpenModal("damage")
                                        }
                                    >
                                        <Plus size={18} />
                                        Add Crop Damage
                                    </PrimaryButton>
                                </div>
                            </Tab>
                            <Tab label="Farms">
                                <p>This is the content of Tab 3.</p>
                            </Tab>
                            <Tab label="Crop Activities">
                                <Timeline items={timelineData} />
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </div>
        </Authenticated>
    );
}
