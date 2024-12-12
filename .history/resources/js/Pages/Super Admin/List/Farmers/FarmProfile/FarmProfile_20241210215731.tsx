import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Plus, Edit, Trash, Eye, ChevronLeft } from "lucide-react";
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
        allocation_type: string;
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
    const [modalType, setModalType] = useState<string>(""); // "allocation", "damage", or "farm"
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
            // Determine the HTTP method (POST or PUT)
            const method = formData.id ? "put" : "post";

            // Add static data to formData (if not already included)
            const dataToSend = {
                ...formData, // dynamic data
                farmer_id: farmer.id, // static farmer ID
                brgy_id: farmer.barangay.id, // static barangay ID
            };

            console.log("formData ", dataToSend);

            // Determine the endpoint based on modalType and method (POST/PUT)
            let endpoint = "";
            if (modalType === "allocation") {
                endpoint =
                    method === "post"
                        ? "/allocations/store"
                        : `/allocations/update/${formData.id}`;
            } else if (modalType === "damage") {
                endpoint =
                    method === "post" ? "/farms/store" : "/cropdamage/create";
            } else if (modalType === "farm") {
                endpoint = method === "post" ? "/farm/store" : "/farm/create";
            }

            // Log the data being sent to the API
            console.log("Sending data to API:", {
                method,
                endpoint,
                data: dataToSend,
            });

            // Perform API call for storing or updating
            let response;
            if (formData.id) {
                // Update existing entry
                response = await axios.put(
                    `${endpoint}/${formData.id}`,
                    dataToSend
                );
            } else {
                // Create new entry
                response = await axios.post(endpoint, dataToSend);
            }

            // Log the response from the API
            console.log("API response:", response.data);

            // Show success toast message
            toast.success(
                `Successfully ${
                    formData.id ? "updated" : "created"
                } the ${modalType} data!`
            );

            // Refresh data and close modal
            fetchData();
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving data:", error);
            // Optionally, show an error toast
            toast.error("Error saving data!");
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        // Reset form data or modal logic
        setFormData({});
    };

    const deleteData = async (id: number) => {
        setLoading(true);
        try {
            await axios.delete(
                `/data/farmprofile/${farmer.id}/${modalType}/${id}`
            );
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error deleting data:", error);
        } finally {
            setLoading(false);
        }
    };

    const allocationColumns: GridColDef[] = [
        { field: "id", headerName: "#", width: 50 },
        {
            field: "allocation_type",
            headerName: "Allocation",
            width: 200,
            valueGetter: (value, row) => row.allocation_type.allocation_type,
        },
        { field: "date_received", headerName: "Date Received", width: 180 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
                    <Edit
                        size={20}
                        onClick={() =>
                            handleOpenModal("allocation", params.row)
                        }
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

    const damageColumns: GridColDef[] = [
        { field: "cause", headerName: "Cause", width: 250 },
        {
            field: "total_damaged_area",
            headerName: "Damaged Area (ha)",
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
        { field: "commodity", headerName: "Commodity", width: 200 },
        { field: "ha", headerName: "Hectares", width: 150 },
        { field: "owner", headerName: "Owner", width: 200 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
                    <Edit
                        size={20}
                        onClick={() => handleOpenModal("farm", params.row)}
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
                        <div className="px-10">
                            {farmer.firstname} {farmer.lastname} {farmer.id}
                        </div>
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
                    {farmer.barangay?.name}, Davao del Sur
                </Card>
            </div>
            <div>
                <Card title="List of Allocations Received">
                    <div className="flex justify-end items-center mb-4">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded flex"
                            onClick={() => handleOpenModal("allocation")}
                        >
                            <Plus size={24} />
                            Add Allocation
                        </button>
                    </div>
                    <div style={{ height: 400, width: "100%" }}>
                        <DataGrid
                            rows={allocations.map((allocation, index) => ({
                                id: allocation.id,
                                allocation_type: allocation.allocation_type,
                                date_received: new Date(
                                    allocation.date_received
                                ).toLocaleDateString(),
                            }))}
                            columns={allocationColumns}
                            loading={loading}
                            slots={{ toolbar: GridToolbar }}
                        />
                    </div>
                </Card>

                <br />

                <Card title="Crop Damages Experienced">
                    <div className="flex justify-end items-center mb-4">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded flex"
                            onClick={() => handleOpenModal("damage")}
                        >
                            <Plus size={24} />
                            Add Crop Damage
                        </button>
                    </div>
                    <div style={{ height: 400, width: "100%" }}>
                        <DataGrid
                            rows={cropDamages.map((damage, index) => ({
                                id: damage.id,
                                cause: damage.cause,
                                total_damaged_area: damage.total_damaged_area,
                            }))}
                            columns={damageColumns}
                            loading={loading}
                            slots={{ toolbar: GridToolbar }}
                        />
                    </div>
                </Card>

                <br />

                <Card title="List of Farms">
                    <div className="flex justify-end items-center mb-4">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded flex"
                            onClick={() => handleOpenModal("farm")}
                        >
                            <Plus size={24} />
                            Add Farm
                        </button>
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
                        />
                    </div>
                </Card>

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
                                <input
                                    type="text"
                                    name={formData.farmerId || ""}
                                    value={farmerId}
                                    readOnly
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
                                            "cause_id"
                                        )
                                    }
                                    placeholder="Select Cause Type"
                                    className="rounded-2xl mb-4"
                                />
                                <TextInput
                                    type="number"
                                    name="total_damaged_area"
                                    value={formData.total_damaged_area || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            total_damaged_area: e.target.value,
                                        })
                                    }
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

                                <div className="">
                                    <label
                                        htmlFor="image-upload"
                                        className="block mb-2"
                                    >
                                        Upload Image:
                                    </label>
                                    <TextInput
                                        type="file"
                                        id="image-upload"
                                        name="proof"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const previewURL =
                                                    URL.createObjectURL(file);
                                                setFormData({
                                                    ...formData,
                                                    image: file, // Store the file in formData
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
