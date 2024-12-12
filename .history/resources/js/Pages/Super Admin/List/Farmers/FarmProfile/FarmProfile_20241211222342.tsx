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
        setFormData(data || {});
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
            [field]: selectedOption ? selectedOption.value : 0,
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/data/farmprofile/${farmer.id}`);
            setAllocations(response.data.allocations);
            setCropDamages(response.data.damages);
            setFarms(response.data.farmer.farms);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const createOrUpdateData = async () => {
        setLoading(true);
        try {
            const method = formData.id ? "put" : "post";

            // Use FormData to handle file uploads
            const dataToSend = new FormData();
            dataToSend.append("farmer_id", farmer.id.toString());
            dataToSend.append("brgy_id", farmer.barangay.id.toString());
            for (const [key, value] of Object.entries(formData)) {
                if (key === "proof" && value instanceof File) {
                    dataToSend.append(key, value);
                } else if (value !== null && value !== undefined) {
                    dataToSend.append(key, value.toString());
                }
            }

            console.log("formData ", dataToSend);

            let endpoint = "";
            if (modalType === "allocation") {
                endpoint =
                    method === "post"
                        ? "/allocations/store"
                        : `/allocations/update/${formData.id}`;
            } else if (modalType === "damage") {
                endpoint =
                    method === "post"
                        ? "/store/cropdamages"
                        : `/cropdamages/update/${formData.id}`;
            } else if (modalType === "farm") {
                endpoint = method === "post" ? "/farms/store" : `/farms/update`;
            }

            console.log("Sending data to API:", {
                method,
                endpoint,
                data: dataToSend,
            });

            // Make the API request
            let response;
            if (formData.id) {
                response = await axios({
                    method: "put",
                    url: `${endpoint}/${formData.id}`,
                    data: dataToSend,
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                response = await axios({
                    method: "post",
                    url: endpoint,
                    data: dataToSend,
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            console.log("API response:", response.data);

            // Show success toast message
            toast.success(
                `Successfully ${
                    formData.id ? "updated" : "created"
                } the ${modalType} data!`
            );

            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving data:", error);
            toast.error("Error saving data!");
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
            // Use POST method with `_method` spoofing to delete the resource
            const response = await axios.post(route, {
                _method: "DELETE", // Spoof DELETE method
            });

            toast.success(
                `${
                    modalType.charAt(0).toUpperCase() + modalType.slice(1)
                } deleted successfully!`
            );
            fetchData(); // Refresh data
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
        { field: "date_received", headerName: "Date Received", width: 180 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
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
        { field: "crop_damage_cause", headerName: "Cause", width: 250 },
        {
            field: "partially_damaged_area",
            headerName: "Partially Damaged Area (ha)",
            width: 250,
            // valueGetter: (value, row) =>
            //     row.crop_damages.partially_damaged_area,
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
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
                    <Edit
                        size={20}
                        onClick={() => handleOpenModal("damage", params.row)}
                    />
                    <Trash
                        size={20}
                        onClick={() => deleteData(params.row.id)}
                    />
                    <Eye size={20} />
                </div>
            ),
        },
    ];

    const farmColumns: GridColDef[] = [
        { field: "id", headerName: "#", width: 90 },
        { field: "commodity", headerName: "Commodity", width: 200 },
        { field: "ha", headerName: "Hectares", width: 150 },
        { field: "owner", headerName: "Owner", width: 200 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
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

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    <>
                        <Link href="/farmers">
                            <span className="flex mb-4">
                                <ChevronLeft size={24} /> Back
                            </span>{" "}
                        </Link>
                    </>
                </h2>
            }
        >
            <Head
                title={`${farmer.firstname} ${farmer.lastname} - ${farmer.id}`}
            />

            <ToastContainer />
            <div className="p-4">
                <Card title="Details">
                    <div className="flex gap-4 mb-2">
                        <h1 className="text-md flex gap-2">
                            <User2Icon size={24} /> Name: {farmer.firstname}{" "}
                            {farmer.lastname}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <HouseIcon size={24} /> Address: {farmer.barangay?.name}
                        , Davao del Sur
                    </div>
                </Card>
            </div>
            <div>
                <div className="flex justify-between mb-4 mt-5 px-5">
                    <h1 className="text-md mt-5">
                        Allocations Received History
                    </h1>
                    <PrimaryButton
                        onClick={() => handleOpenModal("allocation")}
                        className=""
                    >
                        <Plus size={24} />
                        Add Allocation
                    </PrimaryButton>
                </div>
                <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={allocations.map((allocation, index) => ({
                            id: allocation.id,
                            allocations: allocation.allocation_type,
                            desc: allocation.allocation_type,
                            date_received: new Date(
                                allocation.date_received
                            ).toLocaleDateString(),
                        }))}
                        columns={allocationColumns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        sx={{
                            padding: "20px",
                            borderRadius: "10px",
                        }}
                    />
                </div>

                <br />

                <div className="">
                    <div className="flex justify-between px-4">
                        <h1 className="mt-5 text-md">Crop Damages History</h1>
                        <PrimaryButton
                            className="bg-green-500 text-white px-4 py-2 rounded flex"
                            onClick={() => handleOpenModal("damage")}
                        >
                            <Plus size={24} />
                            Add Crop Damage
                        </PrimaryButton>
                    </div>
                </div>
                <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={cropDamages.map((damage, index) => ({
                            id: damage.id,
                            crop_damage_cause: damage.crop_damage_cause_id,
                            partially_damaged_area:
                                damage.partially_damaged_area,
                            area_affected: damage.area_affected,
                            severity: damage.severity,
                            total_damaged_area: damage.total_damaged_area,
                        }))}
                        columns={damageColumns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        sx={{
                            padding: "20px",
                            borderRadius: "10px",
                        }}
                    />
                </div>

                <br />

                <div className="flex justify-between px-4">
                    <h1 className="text-md mt-4">List of Farms</h1>
                    <PrimaryButton
                        className="bg-green-500 text-white px-4 py-2 rounded flex mb-4"
                        onClick={() => handleOpenModal("farm")}
                    >
                        <Plus size={24} />
                        Add Farm
                    </PrimaryButton>
                </div>

                <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={farms.map((farm, index) => ({
                            id: farm.id,
                            commodity: farm.commodity.name,
                            ha: farm.ha,
                            owner: farm.owner,
                        }))}
                        columns={farmColumns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        sx={{
                            padding: "20px",
                            borderRadius: "10px",
                        }}
                    />
                </div>

                {/* Modal Component for Add/Edit */}
                <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                    {modalType === "allocation" && (
                        <div className="p-10 h-50">
                            <h2 className="font-semibold text-lg mb-2">
                                {formData.id
                                    ? "Edit Allocation"
                                    : "Add Allocation"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    createOrUpdateData();
                                }}
                            >
                                <Select
                                    options={allocationType}
                                    isLoading={loadingAllocationType}
                                    value={allocationType.find(
                                        (type) =>
                                            type.value ===
                                            formData.allocation_type_id
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
                                    className="rounded-2xl mb-4"
                                />
                                <Select
                                    options={[
                                        { value: "yes", label: "Yes" },
                                        { value: "no", label: "No" },
                                    ]}
                                    value={
                                        formData.received
                                            ? {
                                                  value: formData.received,
                                                  label:
                                                      formData.received ===
                                                      "yes"
                                                          ? "Yes"
                                                          : "No",
                                              }
                                            : null
                                    }
                                    onChange={(selectedOption) =>
                                        setFormData({
                                            ...formData,
                                            received:
                                                selectedOption?.value || "",
                                        })
                                    }
                                    placeholder="Received?"
                                    className="w-full"
                                />
                                <TextInput
                                    type="date"
                                    name="date_received"
                                    value={formData.date_received || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            date_received: e.target.value,
                                        })
                                    }
                                    placeholder="Date Received"
                                    className="w-full mt-4 mb-4"
                                />

                                <PrimaryButton type="submit">
                                    {formData.id ? "Update" : "Add"} Allocation
                                </PrimaryButton>
                            </form>
                        </div>
                    )}

                    {modalType === "damage" && (
                        <div className="p-10">
                            <h2 className="font-semibold text-xl mb-4">
                                {formData.id
                                    ? "Edit Crop Damage"
                                    : "Add Crop Damage"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    createOrUpdateData();
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
                                    className="rounded-2xl mb-4"
                                />
                                <Select
                                    options={cropDamageCause}
                                    isLoading={loadingCropDamageCause}
                                    value={cropDamageCause.find(
                                        (cropDamageCause) =>
                                            cropDamageCause.value ===
                                            formData.cropDamageCause_id
                                    )}
                                    onChange={(selectedOption) =>
                                        handleSelectChange(
                                            selectedOption,
                                            "crop_damage_cause_id"
                                        )
                                    }
                                    placeholder="Select Cause Type"
                                    className="rounded-2xl mb-4"
                                />
                                <TextInput
                                    type="number"
                                    name="total_damaged_area"
                                    value={formData.total_damaged_area || ""}
                                    onChange={(e) => {
                                        const totalDamagedArea = e.target.value;
                                        let severity = "low";
                                        if (totalDamagedArea >= 60)
                                            severity = "high";
                                        else if (totalDamagedArea >= 30)
                                            severity = "medium";

                                        setFormData({
                                            ...formData,
                                            total_damaged_area:
                                                totalDamagedArea,
                                            severity, // Update severity dynamically
                                        });
                                    }}
                                    placeholder="Total Damaged Area"
                                    className="w-full mb-4"
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
                                    value={formData.severity || ""}
                                    readOnly
                                    placeholder="Severity"
                                    className="w-full mb-4 bg-gray-200 cursor-not-allowed"
                                />

                                <div className="">
                                    <label
                                        htmlFor="proof"
                                        className="block mb-2"
                                    >
                                        Upload Image:
                                    </label>
                                    <TextInput
                                        type="file"
                                        id="proof"
                                        name="proof"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const previewURL =
                                                    URL.createObjectURL(file);
                                                setFormData({
                                                    ...formData,
                                                    proof: file, // Store the file in formData
                                                    imagePreview: previewURL, // Store preview URL
                                                });
                                            }
                                        }}
                                        className="w-full"
                                    />
                                </div>

                                {/* Image Preview */}
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

                    {modalType === "farm" && (
                        <div className="p-10">
                            <h2 className="font-semibold text-xl mb-4">
                                {formData.id ? "Edit Farm" : "Add Farm"}
                            </h2>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    createOrUpdateData();
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
                                    className="rounded-2xl mb-4"
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
                                    className="rounded-2xl mb-4"
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
                                    placeholder="Hectares"
                                    className="w-full mb-4"
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
                                    placeholder="Legit Owner?"
                                    className="w-full mb-4"
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
