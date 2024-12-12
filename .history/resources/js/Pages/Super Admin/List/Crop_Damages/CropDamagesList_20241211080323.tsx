import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";
import Select from "react-select";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageProps } from "@/types";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";

interface CropDamage {
    id: number;
    proof: File | string;
    farmer_id: number;
    commodity_id: number;
    brgy_id: number;
    crop_damage_cause_id: number;
    total_damaged_area: number;
    partially_damaged_area: number;
    area_affected: number;
    remarks: string;
    severity: string;
}

interface Option {
    label: string;
    value: number;
    firstname: string;
    lastname: string;
}

const CropDamages = ({ auth }: PageProps) => {
    const [cropDamages, setCropDamages] = useState<CropDamage[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState<CropDamage>({
        id: 0,
        farmer_id: 0,
        commodity_id: 0,
        brgy_id: 0,
        crop_damage_cause_id: 0,
        total_damaged_area: 0,
        partially_damaged_area: 0,
        area_affected: 0,
        remarks: "",
        severity: "",
        proof: "",
    });
    const [farmers, setFarmers] = useState<Option[]>([]);
    const [barangays, setBarangays] = useState<Option[]>([]);
    const [commodities, setCommodities] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [loadingBarangays, setLoadingBarangays] = useState(true);
    const [loadingCommodities, setLoadingCommodities] = useState(true);

    console.log(farmers);
    console.log(barangays);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 90 },
        {
            field: "farmer_id",
            headerName: "Farmer",
            width: 150,
            valueGetter: (value, row) => {
                return `${row.firstname || ""} ${row.lastname || ""}`;
            },
        },
        {
            field: "commodity_id",
            headerName: "Commodity",
            width: 150,
            valueGetter: (value, row) => row.commodity.name,
        },
        {
            field: "total_damaged_area",
            headerName: "Total Damaged Area",
            width: 180,
        },
        {
            field: "partially_damaged_area",
            headerName: "Partial Damaged Area",
            width: 180,
        },
        {
            field: "area_affected",
            headerName: "Affected Area",
            width: 180,
        },
        { field: "remarks", headerName: "Remarks", width: 180 },
        { field: "severity", headerName: "Severity", width: 150 },
        {
            field: "action",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <>
                    <Button onClick={() => handleEdit(params.row)}>
                        <Edit2Icon size={24} color="green" />
                    </Button>
                    <Button onClick={() => handleDelete(params.row.id)}>
                        <Trash2Icon size={24} color="red" />
                    </Button>
                </>
            ),
        },
    ];

    useEffect(() => {
        fetchCropDamages();
        fetchOptions();
    }, []);

    const fetchCropDamages = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/cropdamages/data");
            setCropDamages(response.data);
        } catch (error) {
            console.error("Error fetching crop damages", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [farmersData, barangaysData, commoditiesData] =
                await Promise.all([
                    axios.get("/data/farmers"),
                    axios.get("/data/barangay"),
                    axios.get("/data/commodity"),
                ]);

            setFarmers(
                farmersData.data.map((farmer: any) => ({
                    label: `${farmer.firstname || ""} ${farmer.lastname}`,
                    value: farmer.id,
                }))
            );
            setBarangays(
                barangaysData.data.map((barangay: any) => ({
                    label: barangay.name,
                    value: barangay.id,
                }))
            );
            setCommodities(
                commoditiesData.data.map((commodity: any) => ({
                    label: commodity.name,
                    value: commodity.id,
                }))
            );

            // Set loading state to false after data is fetched
            setLoadingFarmers(false);
            setLoadingBarangays(false);
            setLoadingCommodities(false);
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

    const handleEdit = (data: CropDamage) => {
        setFormData(data);
        setOpenDialog(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/crop-damages/destroy/${id}`);
            fetchCropDamages();
        } catch (error) {
            console.error("Error deleting crop damage", error);
        }
    };

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const handleSelectChange = (selectedOption: any, field: string) => {
        setFormData({
            ...formData,
            [field]: selectedOption ? selectedOption.value : 0,
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (formData.id) {
                const response = await axios.put(
                    `/cropdamages/update/${formData.id}`,
                    formData
                );
                fetchCropDamages();
                toast.success(response.data.message, {
                    draggable: true,
                    closeOnClick: true,
                });
                setOpenDialog(false);
            } else {
                console.log("POST URL:", "/cropdamages/store"); // Debugging log
                console.log("Form Data:", formData); // Debugging log

                // Log the data that is about to be sent in the POST request
                console.log("Sending Data to POST Route:", formData);

                const csrfTokenElement = document.querySelector(
                    'meta[name="csrf-token"]'
                );
                if (csrfTokenElement) {
                    // Corrected the closing parenthesis and fixed axios.post syntax
                    const response = await axios.post(
                        "/store/cropdamages",
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                                "X-CSRF-TOKEN":
                                    csrfTokenElement.getAttribute("content") ||
                                    "",
                            },
                        }
                    );
                    console.log("Response Data:", response.data); // Debugging log to see the response
                } else {
                    console.error("CSRF token meta tag not found.");
                    // Handle the error, e.g., show an alert or take necessary action
                }
            }
            setOpenDialog(false);
            fetchCropDamages();
        } catch (error: any) {
            console.error("Error submitting crop damage data", error);

            if (error.response) {
                console.log("Error Response:", error.response); // Debugging log
                const errorMessage =
                    error.response.data.message ||
                    "An error occurred while submitting the form.";
                toast.error(errorMessage, {
                    draggable: true,
                    closeOnClick: true,
                });
            } else if (error.request) {
                console.log("Error Request:", error.request); // Debugging log
                toast.error(
                    "No response from the server. Please try again later.",
                    {
                        draggable: true,
                        closeOnClick: true,
                    }
                );
            } else {
                console.log("Error Message:", error.message); // Debugging log
                toast.error("An unexpected error occurred. Please try again.", {
                    draggable: true,
                    closeOnClick: true,
                });
            }
        }
    };

    const selectedFarmer = farmers.find(
        (farmer) => farmer.value === formData.farmer_id
    );

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Crop Damage Management
                </h2>
            }
        >
            <Head title="Damages List" />

            <ToastContainer />
            <div>
                <div className="flex justify-between">
                    <div></div>
                    <PrimaryButton onClick={() => setOpenDialog(true)}>
                        Add New Crop Damage
                    </PrimaryButton>
                </div>

                <Box
                    sx={{
                        height: "450px",
                        padding: "10px",
                        borderRadius: "10px",
                    }}
                >
                    <DataGrid
                        rows={cropDamages}
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
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                    <DialogTitle>
                        {formData.id ? "Edit" : "Add"} Crop Damage
                    </DialogTitle>
                    <DialogContent>
                        <Select
                            options={farmers}
                            isLoading={loadingFarmers}
                            value={selectedFarmer || null}
                            onChange={(selectedOption) =>
                                handleSelectChange(selectedOption, "farmer_id")
                            }
                            placeholder="Select Farmer"
                        />

                        <br />

                        <Select
                            options={barangays}
                            isLoading={loadingBarangays}
                            value={barangays.find(
                                (barangay) =>
                                    barangay.value === formData.brgy_id
                            )}
                            onChange={(selectedOption) =>
                                handleSelectChange(selectedOption, "brgy_id")
                            }
                            placeholder="Select Barangay"
                        />

                        <br />
                        <Select
                            options={commodities}
                            isLoading={loadingCommodities}
                            value={commodities.find(
                                (commodity) =>
                                    commodity.value === formData.commodity_id
                            )}
                            onChange={(selectedOption) =>
                                handleSelectChange(
                                    selectedOption,
                                    "commodity_id"
                                )
                            }
                            placeholder="Select Commodity"
                        />
                        <TextField
                            label="Total Damaged Area"
                            name="total_damaged_area"
                            value={formData.total_damaged_area}
                            onChange={handleFormChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Partially Damaged Area"
                            name="partially_damaged_area"
                            value={formData.partially_damaged_area}
                            onChange={handleFormChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Area Affected"
                            name="area_affected"
                            value={formData.area_affected}
                            onChange={handleFormChange}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Remarks"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleFormChange}
                            fullWidth
                            margin="normal"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>
                            Cancel
                        </Button>
                        <PrimaryButton type="submit" onClick={handleSubmit}>
                            Submit
                        </PrimaryButton>
                    </DialogActions>
                </Dialog>
            </div>
        </Authenticated>
    );
};

export default CropDamages;
