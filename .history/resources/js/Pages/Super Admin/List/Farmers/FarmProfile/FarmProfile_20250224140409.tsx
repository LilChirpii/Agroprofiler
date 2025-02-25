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
    Pencil,
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
import { Button } from "@headlessui/react";

interface Allocation {
    id: number;
    amount: number;
    allocation_type?: {
        name: number;
        desc: string;
        amount: number;
        funding_id: number;
        identifier_id: number;
    };
    funding?: {
        id: number;
        name: string;
    };
    identifier?: {
        id: number;
        title: string;
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
    farm: {
        id: number;
        name: string;
        ha: string;
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
    farm_id: number;
    brgy_id: number;
    commodity_id: number;
    value: number;
    name: string;
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
    damages: CropDamage[];
    farms: Farm[];
    crop_activities: CropActivity[];
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
interface CropActivity {
    id: number;
    title: string;
    desc: string;
    date: Date;
    file_path: string;
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
    const [cropActivities, setCropActivities] = useState<CropActivity[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);
    const [commodities, setCommodities] = useState<Option[]>([]);
    const [cropDamageCause, setCropDamageCause] = useState<Option[]>([]);
    const [allocationType, setAllocationType] = useState<Option[]>([]);
    const [loadingCommodities, setLoadingCommodities] = useState(true);
    const [barangays, setBarangays] = useState<Option[]>([]);
    const [loadingBarangays, setLoadingBarangays] = useState(true);
    const [loadingFarms, setLoadingFarms] = useState(true);
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
                axios.get(`/data/farms?farmer_id=${farmer.id}`),
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
                    funding: allocationType.funding,
                    identifier: allocationType.identifier,
                    amount: allocationType.amount,
                    barangays: allocationType.barangays,
                    commodities: allocationType.commodities,
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

    useEffect(() => {
        console.log("Updated farms:", farms);
    }, [farms]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/data/farmprofile/${farmer.id}`);
            setAllocations(response.data.allocations);
            setCropDamages(response.data.damages);
            setFarms(response.data.farmer.farms);
            setCropActivities(response.data.farmer.crop_activities);
            console.log("damages: ", response.data.damages);
            console.log("crop damages: ", cropDamages);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteData = async (id: number) => {
        setLoading(true);

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
                route = "";
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
        { field: "name", headerName: "Name", width: 200 },
        { field: "barangay", headerName: "Barangay", width: 200 },
        { field: "ha", headerName: "Hectares", width: 150 },
        { field: "owner", headerName: "Owner", width: 200 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="p-2 px-1 flex gap-2">
                    <button
                        className="border rounded-[12px] p-2 hover:bg-green-300"
                        onClick={() => handleOpenModal("farm", params.row)}
                    >
                        <Pencil size={20} color="green" />
                    </button>
                    <button
                        className="border rounded-[12px] p-2 hover:bg-red-300"
                        onClick={() => deleteData(params.row.id)}
                    >
                        <Trash size={20} color="red" />
                    </button>
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

            dataToSend.append(
                "allocation_type_id",
                formData.allocation_type_id
            );
            dataToSend.append("commodity_id", formData.commodity_id);
            dataToSend.append("funding_id", formData.funding_id);
            dataToSend.append("identifier_id", formData.identifier_id);
            dataToSend.append("received", formData.received);
            dataToSend.append("amount", formData.amount);

            if (formData.date_received) {
                dataToSend.append("date_received", formData.date_received);
            } else {
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
                _method: "PUT",
                farmer_id: farmer.id,
                brgy_id: farmer.barangay.id,
                allocation_type_id: formData.allocation_type_id,
                commodity_id: formData.commodity_id,
                funding_id: formData.funding_id,
                identifier_id: formData.identifier_id,
                amount: formData.amount,
                received: formData.received,
                date_received: formData.date_received,
            };

            console.log(
                "Data to send for Allocation update with method spoofing:",
                dataToSend
            );

            const response = await axios.post(
                `/allocations/update/${formData.id}`,
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

    const handleSaveCropActivity = async () => {
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append("farmer_id", farmer.id.toString()); // Ensure farmer_id is correct
            dataToSend.append("title", formData.title);
            dataToSend.append("desc", formData.desc);

            if (formData.date) {
                dataToSend.append("date", formData.date);
            } else {
                dataToSend.append("date", "");
            }
            if (formData.file_path) {
                dataToSend.append("file_path", formData.file_path);
            }

            console.log("Data to send for Crop Activity:", dataToSend);

            const response = await axios.post(
                "/cropactivity/store",
                dataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            console.log("API response for Crop Activity:", response.data);

            toast.success("Successfully added the crop activity!");
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving Crop Activity:", error);
            toast.error("Error saving Crop Activity!");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCropActivity = async () => {
        setLoading(true);
        try {
            const dataToSend = new FormData();
            dataToSend.append("title", formData.title);
            dataToSend.append("desc", formData.desc);
            dataToSend.append("date", formData.date || "");

            if (formData.img) {
                dataToSend.append("file_path", formData.img);
            }

            dataToSend.append("_method", "PATCH"); // Required for Laravel PATCH requests

            const response = await axios.post(
                `/cropactivity/${formData.id}`, // Adjusted route
                dataToSend,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            toast.success(response.data.message);
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error updating Crop Activity:", error);
            toast.error("Error updating crop activity!");
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
            dataToSend.append("commodity_id", formData.commodity_id);
            dataToSend.append(
                "crop_damage_cause_id",
                formData.crop_damage_cause_id
            );
            dataToSend.append("farm_id", formData.farm_id);
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

            const response = await axios.post(
                `/cropdamages/update/${formData.id}`,
                dataToSend,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

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
            dataToSend.append("commodity_id", formData.commodity_id);
            dataToSend.append("ha", formData.ha);
            dataToSend.append("owner", formData.owner);
            dataToSend.append("name", formData.name);

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const handleAllocationTypeChange = (selectedOption: any) => {
        setFormData({
            ...formData,
            allocation_type_id: selectedOption.value,
            funding_id: selectedOption.funding.id, // Auto-fill funding
            identifier_id: selectedOption.identifier.id, // Auto-fill identifier
            amount: selectedOption.amount, // Set total amount
        });

        setBarangays(
            selectedOption.barangays.map((barangay: any) => ({
                label: barangay.name,
                value: barangay.id,
            }))
        );

        setCommodities(
            selectedOption.commodities.map((commodity: any) => ({
                label: commodity.name,
                value: commodity.id,
            }))
        );
    };

    const handleSelectFarm = (selectedOption: any) => {
        setFormData({
            ...formData,
            farm_id: selectedOption.value,
            commodity_id: selectedOption.commodity_id,
            brgy_id: selectedOption.brgy_id,
            farm_ha: selectedOption.ha,
        });
    };

    const [remainingAmount, setRemainingAmount] = useState(0);

    useEffect(() => {
        if (formData.amount && formData.allocation_type_id) {
            const totalAmount =
                allocationType.find(
                    (type) => type.value === formData.allocation_type_id
                )?.amount || 0;

            setRemainingAmount(totalAmount - formData.amount);
        }
    }, [formData.amount, formData.allocation_type_id]);

    const customStyles = (isDarkMode: boolean) => ({
        control: (base: any) => ({
            ...base,
            backgroundColor: "transparent",
            color: isDarkMode ? "white" : "black",
            borderColor: isDarkMode ? "#888" : "#ccc",
        }),
        menu: (base: any) => ({
            ...base,
            backgroundColor: isDarkMode ? "#122231" : "white",
            color: isDarkMode ? "white" : "#122231",
        }),
        singleValue: (base: any) => ({
            ...base,
            color: isDarkMode ? "white" : "black",
        }),
        placeholder: (base: any) => ({
            ...base,
            color: isDarkMode ? "#aaa" : "#555",
        }),
        option: (base: any, { isFocused }: any) => ({
            ...base,
            backgroundColor: isFocused
                ? isDarkMode
                    ? "#121f31"
                    : "#eee"
                : "transparent",
            color: isDarkMode ? "white" : "black",
        }),
    });

    const isDarkMode = document.documentElement.classList.contains("dark");

    return (
        <Authenticated user={auth.user}>
            <Head title={`${farmer.firstname} ${farmer.lastname} `} />
            <ToastContainer />

            <div className="grid grid-cols-4 h-full gap-0 p-[0.5rem]">
                <div className="relative left-0 h-full border-r px-4 py-2 border-slate-200 ">
                    <div>
                        <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                            <>
                                <div className="flex justify-between mb-4 dark:text-white">
                                    <Link href="/farmers">
                                        <span className="flex mb-4">
                                            <ChevronLeft size={24} /> Back
                                        </span>{" "}
                                    </Link>
                                </div>
                            </>
                        </h2>
                    </div>

                    <div className="flex dark:text-green-600 content-center justify-center mt-10 font-semibold text-[24px] flex-wrap ">
                        {farmer.firstname} <br /> {farmer.lastname}
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
                                <div className="bg-red-600 p-1 px-2 text-white rounded-lg text-[10px]">
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
                                <span className="flex gap-2 dark:text-white text-slate-700 text-sm">
                                    <House size={18} />
                                    {farmer.barangay?.name}, Davao del Sur
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="flex gap-2 dark:text-white text-slate-700 text-sm">
                                    <Cake size={18} />
                                    {farmer.dob}
                                </span>
                            </div>
                            <div className="mt-2">
                                <span className="flex gap-2 dark:text-white text-slate-700 text-sm">
                                    <Phone size={18} />
                                    09676979568
                                </span>
                            </div>

                            {farmer["4ps"] === "yes" ? (
                                <>
                                    <div className="mt-2">
                                        <span className="flex gap-2 dark:text-white text-slate-700 text-sm">
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
                                        <span className="flex gap-2 dark:text-white text-slate-700 text-sm">
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

                <div className="relative col-span-3 right-0 h-full px-6 py-4">
                    <span className="text-lg text-[25px] dark:text-green-600 text-slate-700 font-semibold">
                        Data History
                    </span>
                    <div className="w-full h-full mt-4">
                        <Tabs>
                            <Tab label="Allocation">
                                <div className="flex justify-end px-4">
                                    <Button
                                        className="bg-green-800 text-white mb-4 p-2 px-2 rounded-lg hover:bg-green-900 hover:shadow-md "
                                        onClick={() =>
                                            handleOpenModal("allocation")
                                        }
                                    >
                                        <span className="text-sm flex gap-2">
                                            <Plus size={18} />
                                            Add Allocation
                                        </span>
                                    </Button>
                                </div>
                                <Timeline
                                    items={allocations.map((allocation) => ({
                                        id: allocation.id,
                                        fields: {
                                            allocation:
                                                allocation.allocation_type
                                                    ?.name,
                                            dateReceived: formatDate(
                                                allocation.date_received
                                            ),
                                            amount: `${allocation.amount} ${allocation.identifier?.title}`,
                                            received: allocation.received,
                                            commodity:
                                                allocation.commodity?.name,
                                            funding: allocation.funding?.name,
                                        },
                                        actions: [
                                            {
                                                icon: (
                                                    <EditIcon
                                                        size={20}
                                                        color="green"
                                                    />
                                                ),
                                                onClick: () =>
                                                    handleOpenModal(
                                                        "allocation",
                                                        allocation
                                                    ),
                                            },
                                            {
                                                icon: (
                                                    <TrashIcon
                                                        size={20}
                                                        color="red"
                                                    />
                                                ),
                                                onClick: () =>
                                                    deleteData(allocation.id),
                                            },
                                        ],
                                    }))}
                                    fieldConfig={[
                                        {
                                            key: "allocation",
                                            label: "Allocation",
                                        },
                                        {
                                            key: "commodity",
                                            label: "Commodity",
                                        },
                                        {
                                            key: "received",
                                            label: "Received",
                                        },
                                        {
                                            key: "funding",
                                            label: "Source",
                                        },
                                        {
                                            key: "amount",
                                            label: "Amount",
                                        },
                                        {
                                            key: "dateReceived",
                                            label: "Date Received",
                                        },
                                    ]}
                                />
                            </Tab>
                            <Tab label="Crop Damages">
                                <div className="flex justify-end px-4">
                                    <Button
                                        className="bg-green-800 text-white mb-4 p-2 rounded"
                                        onClick={() =>
                                            handleOpenModal("damage")
                                        }
                                    >
                                        <span className="text-sm flex gap-2">
                                            <Plus size={18} />
                                            Add Crop Damage
                                        </span>
                                    </Button>
                                </div>

                                <div>
                                    <Timeline
                                        items={cropDamages.map((damage) => ({
                                            id: damage.id,
                                            fields: {
                                                cause: damage.crop_damage_cause
                                                    .name,
                                                img: damage.proof,
                                                farm: `${damage.farm?.name}(${damage.farm?.ha} ha)`,
                                                severity: damage.severity,
                                                partiallyDamagedArea: `${damage.partially_damaged_area} ha`,
                                                totalDamagedArea: `${damage.total_damaged_area} ha`,
                                            },
                                            actions: [
                                                {
                                                    icon: (
                                                        <EditIcon
                                                            size={24}
                                                            color="green"
                                                            className="border p-1 rounded-md"
                                                        />
                                                    ),
                                                    onClick: () =>
                                                        handleOpenModal(
                                                            "damage",
                                                            damage
                                                        ),
                                                },
                                                {
                                                    icon: (
                                                        <TrashIcon
                                                            size={24}
                                                            color="red"
                                                            className="border p-1 rounded-md"
                                                        />
                                                    ),
                                                    onClick: () =>
                                                        deleteData(damage.id),
                                                },
                                            ],
                                        }))}
                                        fieldConfig={[
                                            { key: "cause", label: "Cause" },
                                            { key: "img", label: "Proof" },
                                            { key: "farm", label: "Farm" },
                                            {
                                                key: "partiallyDamagedArea",
                                                label: "Partially Damaged Area",
                                            },
                                            {
                                                key: "totalDamagedArea",
                                                label: "Total Damaged Area",
                                            },
                                            {
                                                key: "severity",
                                                label: "Severity",
                                            },
                                        ]}
                                    />
                                </div>
                            </Tab>
                            <Tab label="Farms">
                                <div className="flex justify-end px-4">
                                    <Button
                                        className="bg-green-800 text-white mb-4 p-2 rounded"
                                        onClick={() => handleOpenModal("farm")}
                                    >
                                        <span className="text-sm flex gap-2">
                                            <Plus size={18} />
                                            Add Farm
                                        </span>
                                    </Button>
                                </div>
                                <div>
                                    <DataGrid
                                        rows={farms.map((farm, index) => ({
                                            id: farm.id,
                                            commodity: farm.commodity.name,
                                            barangay: farm.barangay.name,
                                            name: farm.name,
                                            ha: farm.ha,
                                            owner: farm.owner,
                                        }))}
                                        columns={farmColumns}
                                        loading={loading}
                                        sx={{
                                            padding: "20px",
                                            borderRadius: "10px",
                                            height: "380px",
                                        }}
                                    />
                                </div>
                            </Tab>
                            <Tab label="Crop Activities">
                                <div className="flex justify-end px-4">
                                    <Button
                                        className="bg-green-800 text-white mb-4 p-2 rounded"
                                        onClick={() =>
                                            handleOpenModal("cropActivity")
                                        }
                                    >
                                        <span className="text-sm flex gap-2">
                                            <Plus size={18} />
                                            Add Crop Activity
                                        </span>
                                    </Button>
                                </div>
                                <Timeline
                                    items={cropActivities.map(
                                        (cropActivity) => ({
                                            id: cropActivity.id,
                                            fields: {
                                                title: cropActivity.title,
                                                desc: cropActivity.desc,
                                                date: cropActivity.date,
                                                img: cropActivity.file_path,
                                            },
                                            actions: [
                                                {
                                                    icon: (
                                                        <EditIcon
                                                            size={20}
                                                            color="green"
                                                        />
                                                    ),
                                                    onClick: () =>
                                                        handleOpenModal(
                                                            "cropActivity",
                                                            cropActivity
                                                        ),
                                                },
                                                {
                                                    icon: (
                                                        <TrashIcon
                                                            size={20}
                                                            color="red"
                                                        />
                                                    ),
                                                    onClick: () =>
                                                        deleteData(
                                                            cropActivity.id
                                                        ),
                                                },
                                            ],
                                        })
                                    )}
                                    fieldConfig={[
                                        { key: "title", label: "Title" },
                                        { key: "desc", label: "Description" },
                                        { key: "img", label: "File" },
                                        { key: "date", label: "Date" },
                                    ]}
                                />
                            </Tab>
                        </Tabs>
                    </div>
                </div>

                <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                    {modalType === "allocation" && (
                        <div className="p-10 h-50">
                            <h2 className="font-semibold mb-2 text-2xl dark:text-green-600 text-green-800">
                                {formData.id
                                    ? "Edit Allocation"
                                    : "Add Allocation"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (modalType === "allocation") {
                                        formData.id
                                            ? handleUpdateAllocation()
                                            : handleSaveAllocation();
                                    }
                                }}
                            >
                                <div className="p-4">
                                    <Select
                                        options={allocationType}
                                        isLoading={loadingAllocationType}
                                        value={allocationType.find(
                                            (option) =>
                                                option.value ===
                                                formData.allocation_type_id
                                        )}
                                        onChange={handleAllocationTypeChange}
                                        placeholder="Select Allocation Type"
                                        className="mb-4 dark:text-white"
                                        styles={customStyles(isDarkMode)}
                                    />

                                    <TextInput
                                        type="text"
                                        value={
                                            allocationType.find(
                                                (type) =>
                                                    type.value ===
                                                    formData.allocation_type_id
                                            )?.funding.name || ""
                                        }
                                        placeholder="Source of Funds (Auto Generated)"
                                        disabled
                                        className="mb-4 w-full rounded-md bg-slate-200"
                                    />

                                    <TextInput
                                        type="text"
                                        value={
                                            allocationType.find(
                                                (type) =>
                                                    type.value ===
                                                    formData.allocation_type_id
                                            )?.identifier.title || ""
                                        }
                                        placeholder="Identifier (Auto Generated)"
                                        disabled
                                        className="mb-4 w-full rounded-md bg-slate-200"
                                    />

                                    <Select
                                        options={commodities}
                                        isLoading={loadingCommodities}
                                        value={commodities.find(
                                            (commodity) =>
                                                commodity.value ===
                                                formData.commodity_id
                                        )}
                                        onChange={(selectedOption) =>
                                            handleSelectChange(
                                                selectedOption,
                                                "commodity_id"
                                            )
                                        }
                                        placeholder="Select Commodity"
                                        className=" mb-4"
                                        styles={customStyles(isDarkMode)}
                                    />

                                    <Select
                                        options={barangays}
                                        isLoading={loadingBarangays}
                                        value={barangays.find(
                                            (barangay) =>
                                                barangay.value ===
                                                formData.barangay_id
                                        )}
                                        onChange={(selectedOption) =>
                                            handleSelectChange(
                                                selectedOption,
                                                "barangay_id"
                                            )
                                        }
                                        placeholder="Select Barangay"
                                        className="rounded-2xl mb-4"
                                        styles={customStyles(isDarkMode)}
                                    />

                                    <TextInput
                                        type="number"
                                        name="amount"
                                        value={formData.amount || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                amount:
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0,
                                            })
                                        }
                                        placeholder="Amount"
                                        className="w-full rounded-md"
                                    />
                                    <p className="text-sm text-gray-500 dark:text-white px-4">
                                        Remaining Balance: {remainingAmount}
                                    </p>

                                    <label className="block mt-4 dark:text-white font-semibold px-4 text-[15px]">
                                        Was the Allocation Received?
                                    </label>
                                    <select
                                        value={formData.received}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                received: e.target.value,
                                                date_received:
                                                    e.target.value === "Yes"
                                                        ? formData.date_received
                                                        : "",
                                            })
                                        }
                                        className="w-full border rounded-md p-2 border-slate-400
                                                    bg-white text-black dark:bg-transparent dark:text-white
                                                    dark:border-gray-600"
                                    >
                                        <option
                                            value=""
                                            className="dark:bg-transparent"
                                        >
                                            Select Value
                                        </option>
                                        <option
                                            className="dark:bg-transparent"
                                            value="no"
                                        >
                                            No
                                        </option>
                                        <option
                                            className="dark:bg-transparent"
                                            value="yes"
                                        >
                                            Yes
                                        </option>
                                    </select>

                                    <label className="block mt-4 dark:text-white font-semibold px-4 text-[15px]">
                                        If yes, when was the allocation
                                        received?
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date_received}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                date_received: e.target.value,
                                            })
                                        }
                                        disabled={formData.received !== "yes"}
                                        className="w-full border rounded-lg p-2 disabled:bg-gray-200 dark:bg-transparent dark:text-white"
                                    />
                                </div>
                                <br />
                                <PrimaryButton type="submit">
                                    {formData.id ? "Update" : "Add"} Allocation
                                </PrimaryButton>
                            </form>
                        </div>
                    )}

                    {modalType === "cropActivity" && (
                        <div className="p-10">
                            <h2 className="font-semibold text-xl mb-4 text-green-700 dark:text-green-600">
                                {formData.id
                                    ? "Edit Crop Activity"
                                    : "Add Crop Activity"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (modalType === "cropActivity") {
                                        formData.id
                                            ? handleUpdateCropActivity()
                                            : handleSaveCropActivity();
                                    }
                                }}
                            >
                                <TextInput
                                    type="text"
                                    name="title"
                                    value={formData.title || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Title"
                                    className="w-full mb-4"
                                />
                                <TextInput
                                    type="text"
                                    name="desc"
                                    value={formData.desc || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            desc: e.target.value,
                                        })
                                    }
                                    placeholder="desc"
                                    className="w-full mb-4"
                                />

                                <TextInput
                                    type="date"
                                    name="date"
                                    value={formData.date || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            date: e.target.value,
                                        })
                                    }
                                    placeholder="Date"
                                    className="w-full mt-4 mb-4"
                                />

                                <div>
                                    <label
                                        htmlFor="file_path"
                                        className="block mb-2"
                                    >
                                        Upload Image:
                                    </label>
                                    <TextInput
                                        type="file"
                                        id="proof"
                                        name="file_path"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (files && files.length > 0) {
                                                const file = files[0];
                                                const previewURL =
                                                    URL.createObjectURL(file);
                                                setFormData({
                                                    ...formData,
                                                    file_path: file,
                                                    imagePreview: previewURL,
                                                });
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </div>
                                {formData.imagePreview && (
                                    <div className="mt-4">
                                        <label className="block mb-2">
                                            Image Preview:
                                        </label>
                                        <img
                                            src={formData.imagePreview}
                                            alt="Preview"
                                            className="rounded border"
                                            style={{
                                                maxWidth: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                                borderRadius: "10px",
                                            }}
                                        />
                                    </div>
                                )}
                                <PrimaryButton type="submit" className="mt-4">
                                    {formData.id ? "Update" : "Add"} Crop Damage
                                </PrimaryButton>
                            </form>
                        </div>
                    )}

                    {modalType === "damage" && (
                        <div className="p-10">
                            <h2 className="font-semibold text-xl mb-4 dark:text-green-600 text-green-700">
                                {formData.id
                                    ? "Edit Crop Damage"
                                    : "Add Crop Damage"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (modalType === "damage") {
                                        formData.id
                                            ? handleUpdateCropDamage()
                                            : handleSaveCropDamage();
                                    }
                                }}
                            >
                                {formData.farm_id && (
                                    <div className="mb-2 text-gray-700 font-medium">
                                        Farm Size:{" "}
                                        {farms.find(
                                            (farm) =>
                                                farm.id === formData.farm_id
                                        )?.ha || "N/A"}{" "}
                                        ha
                                    </div>
                                )}
                                <Select
                                    options={farms.map((farm) => ({
                                        value: farm.id,
                                        label: farm.name,
                                    }))}
                                    isLoading={loadingFarms}
                                    value={
                                        formData.farm_id
                                            ? {
                                                  value: formData.farm_id,
                                                  label:
                                                      farms.find(
                                                          (farm) =>
                                                              farm.id ===
                                                              formData.farm_id
                                                      )?.name || "Select Farm",
                                              }
                                            : null
                                    }
                                    onChange={(selectedOption) => {
                                        const selectedFarm = farms.find(
                                            (farm) =>
                                                farm.id ===
                                                selectedOption?.value
                                        );
                                        setFormData({
                                            ...formData,
                                            farm_id: selectedOption?.value,
                                            commodity_id:
                                                selectedFarm?.commodity?.id ||
                                                "",
                                            brgy_id:
                                                selectedFarm?.barangay?.id ||
                                                "",
                                        });
                                    }}
                                    placeholder="Select Farm"
                                    className="rounded-2xl mb-4 dark:bg-transparent dark:text-white"
                                    styles={customStyles(isDarkMode)}
                                />

                                <Select
                                    options={commodities}
                                    isLoading={loadingCommodities}
                                    value={commodities.find(
                                        (commodity) =>
                                            commodity.value ===
                                            formData.commodity_id
                                    )}
                                    isDisabled
                                    placeholder="Commodity (Auto-filled)"
                                    className="rounded-2xl mb-4 dark:bg-transparent dark:text-white"
                                    styles={customStyles(isDarkMode)}
                                />
                                <Select
                                    options={barangays}
                                    isLoading={loadingBarangays}
                                    value={barangays.find(
                                        (barangay) =>
                                            barangay.value === formData.brgy_id
                                    )}
                                    isDisabled
                                    placeholder="Barangay (Auto-filled)"
                                    className="rounded-2xl mb-4 dark:bg-transparent dark:text-white"
                                    styles={customStyles(isDarkMode)}
                                />
                                <Select
                                    options={cropDamageCause}
                                    isLoading={loadingCropDamageCause}
                                    value={cropDamageCause.find(
                                        (cause) =>
                                            cause.value ===
                                            formData.cropDamageCause_id
                                    )}
                                    onChange={(selectedOption) =>
                                        handleSelectChange(
                                            selectedOption,
                                            "crop_damage_cause_id"
                                        )
                                    }
                                    placeholder="Select Cause Type"
                                    className="rounded-2xl mb-4 dark:bg-transparent dark:text-white"
                                    styles={customStyles(isDarkMode)}
                                />
                                <TextInput
                                    type="number"
                                    name="total_damaged_area"
                                    value={formData.total_damaged_area || ""}
                                    onChange={(e) => {
                                        const totalDamagedArea = Number(
                                            e.target.value
                                        );
                                        const selectedFarm = farms.find(
                                            (farm) =>
                                                farm.id === formData.farm_id
                                        );
                                        const farmArea =
                                            parseFloat(selectedFarm?.ha) || 1;

                                        let severity = "low";
                                        const damagePercentage =
                                            (totalDamagedArea / farmArea) * 100;

                                        if (damagePercentage > 50)
                                            severity = "high";
                                        else if (damagePercentage > 20)
                                            severity = "medium";

                                        setFormData({
                                            ...formData,
                                            total_damaged_area:
                                                totalDamagedArea,
                                            severity,
                                        });
                                    }}
                                    placeholder="Total Damaged Area"
                                    className="w-full mb-4 dark:bg-transparent dark:text-white"
                                />

                                <TextInput
                                    type="number"
                                    name="partially_damaged_area"
                                    value={
                                        formData.partially_damaged_area || ""
                                    }
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            partially_damaged_area:
                                                e.target.value,
                                        })
                                    }
                                    placeholder="Partially Damaged Area"
                                    className="w-full mb-4"
                                />
                                <TextInput
                                    type="number"
                                    name="area_affected"
                                    value={formData.area_affected || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            area_affected: e.target.value,
                                        })
                                    }
                                    placeholder="Area Affected"
                                    className="w-full mb-4"
                                />
                                <TextInput
                                    type="text"
                                    name="severity"
                                    value={formData.severity}
                                    readOnly
                                    placeholder="Severity (Auto-filled)"
                                    className="w-full mb-4 bg-gray-200 cursor-not-allowed"
                                />
                                <div>
                                    <label
                                        htmlFor="proof"
                                        className="block mb-2 font-semibold text-[15px] dark:text-white"
                                    >
                                        Upload Image Proof:
                                    </label>
                                    <TextInput
                                        type="file"
                                        id="proof"
                                        name="proof"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const files = e.target.files;
                                            if (files && files.length > 0) {
                                                const file = files[0];
                                                const previewURL =
                                                    URL.createObjectURL(file);
                                                setFormData({
                                                    ...formData,
                                                    proof: file, // Store the new file
                                                    imagePreview: previewURL, // Update preview
                                                });
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </div>
                                {formData.imagePreview && (
                                    <div className="mt-4">
                                        <label className="block mb-2 font-semibold text-[15px]">
                                            Image Preview:
                                        </label>
                                        <img
                                            src={formData.imagePreview}
                                            alt="Preview"
                                            className="rounded border"
                                            style={{
                                                maxWidth: "100px",
                                                height: "100px",
                                                objectFit: "cover",
                                                borderRadius: "10px",
                                            }}
                                        />
                                    </div>
                                )}

                                <PrimaryButton type="submit" className="mt-4">
                                    {formData.id ? "Update" : "Add"} Crop Damage
                                </PrimaryButton>
                            </form>
                        </div>
                    )}

                    {modalType === "farm" && (
                        <div className="p-10">
                            <h2 className="font-semibold text-xl mb-4 dark:text-green-600 text-green-700">
                                {formData.id ? "Edit Farm" : "Add Farm"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (modalType === "farm") {
                                        formData.id
                                            ? handleUpdateFarm()
                                            : handleSaveFarm();
                                    }
                                }}
                            >
                                <Select
                                    options={commodities}
                                    isLoading={loadingCommodities}
                                    value={commodities.find(
                                        (commodity) =>
                                            commodity.value ===
                                            formData.commodity_id
                                    )}
                                    onChange={(selectedOption) =>
                                        handleSelectChange(
                                            selectedOption,
                                            "commodity_id"
                                        )
                                    }
                                    placeholder="Select Commodity"
                                    className="rounded-2xl mb-4 dark:bg-transparent dark:text-white"
                                />
                                <Select
                                    options={barangays}
                                    isLoading={loadingBarangays}
                                    value={barangays.find(
                                        (barangay) =>
                                            barangay.value === formData.brgy_id
                                    )}
                                    onChange={(selectedOption) =>
                                        handleSelectChange(
                                            selectedOption,
                                            "brgy_id"
                                        )
                                    }
                                    placeholder="Select Barangay"
                                    className="rounded-2xl mb-4 dark:bg-transparent dark:text-white"
                                />
                                <TextInput
                                    type="text"
                                    name="name"
                                    value={formData.name || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Farm Name"
                                    className="w-full mb-4 dark:bg-transparent dark:text-white"
                                />
                                <TextInput
                                    type="number"
                                    name="ha"
                                    value={formData.ha || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            ha: e.target.value,
                                        })
                                    }
                                    placeholder="Farm Area (ha)"
                                    className="w-full mb-4 dark:bg-transparent dark:text-white"
                                />
                                <Select
                                    options={[
                                        { value: "yes", label: "Yes" },
                                        { value: "no", label: "No" },
                                    ]}
                                    value={
                                        formData.owner
                                            ? {
                                                  value: formData.owner,
                                                  label:
                                                      formData.owner === "yes"
                                                          ? "Yes"
                                                          : "No",
                                              }
                                            : null
                                    }
                                    onChange={(selectedOption) =>
                                        setFormData({
                                            ...formData,
                                            owner: selectedOption?.value || "",
                                        })
                                    }
                                    placeholder="Is the Person Owner?"
                                    className="w-full mb-4 dark:bg-transparent dark:text-white"
                                />
                                <PrimaryButton type="submit">
                                    {formData.id ? "Update" : "Add"} Farm
                                </PrimaryButton>
                            </form>
                        </div>
                    )}
                </Modal>
            </div>
        </Authenticated>
    );
}
