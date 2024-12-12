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
    const [CropDamageCause, setCropDamageCause] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [loadingBarangays, setLoadingBarangays] = useState(true);
    const [loadingCommodities, setLoadingCommodities] = useState(true);
    const [loadingCropDamageCause, setLoadingCropDamageCause] = useState(true);
    const [proofFile, setProofFile] = useState<File | null>(null);

    console.log(farmers);
    console.log(barangays);

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 90 },
        {
            field: "proof",
            headerName: "Proof",
            renderCell: (params) => (
                <img
                    src={params.value || "https://via.placeholder.com/50"}
                    alt="Avatar"
                    style={{
                        marginTop: 5,
                        width: 40,
                        height: 40,
                        borderRadius: "15%",
                        objectFit: "cover",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                />
            ),
        },
        {
            field: "farmer_id",
            headerName: "Farmer",
            width: 150,
            // valueGetter: (value, row) => {
            //     return `${row.firstname || ""} ${row.lastname || ""}`;
            // },
        },
        {
            field: "commodity_id",
            headerName: "Commodity",
            width: 150,
            valueGetter: (value, row) => row.commodity.name,
        },
        {
            field: "crop_damage_cause_id",
            headerName: "Cause",
            width: 150,
            // valueGetter: (value, row) => row.crop_damage_caues.name,
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
            const [
                farmersData,
                barangaysData,
                commoditiesData,
                cropDamageCauseData,
            ] = await Promise.all([
                axios.get("/data/farmers"),
                axios.get("/data/barangay"),
                axios.get("/data/commodity"),
                axios.get("/data/cropDamageCause"),
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
            setCropDamageCause(
                cropDamageCauseData.data.map((cause: any) => ({
                    label: cause.name,
                    value: cause.id,
                }))
            );

            // Set loading state to false after data is fetched
            setLoadingFarmers(false);
            setLoadingBarangays(false);
            setLoadingCommodities(false);
            setLoadingCropDamageCause(false);
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setProofFile(event.target.files[0]);
        }
    };

    const handleEdit = (data: CropDamage) => {
        setFormData(data);
        setOpenDialog(true);
    };

    const handleDelete = async (id: number) => {
        try {
            // Get the CSRF token from the meta tag
            const csrfToken = (
                document.querySelector(
                    'meta[name="csrf-token"]'
                ) as HTMLMetaElement
            ).content;

            // Send the DELETE request with the CSRF token
            await axios.delete(`/crop-damages/destroy/${id}`, {
                headers: {
                    "X-CSRF-TOKEN": csrfToken, // Include CSRF token
                },
            });

            fetchCropDamages(); // Refresh the list after deletion

            // Show success toast notification
            toast.success("Crop damage deleted successfully!", {
                draggable: false,
                closeOnClick: false,
            });
        } catch (error) {
            console.error("Error deleting crop damage", error);

            // Show error toast notification
            toast.error("Error deleting crop damage!", {
                draggable: false,
                closeOnClick: false,
            });
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
            const formDataToSend = new FormData();
            formDataToSend.append("farmer_id", formData.farmer_id.toString());
            formDataToSend.append(
                "commodity_id",
                formData.commodity_id.toString()
            );
            formDataToSend.append(
                "crop_damaged_cause_id",
                formData.crop_damage_cause_id.toString()
            );
            formDataToSend.append("brgy_id", formData.brgy_id.toString());
            formDataToSend.append(
                "total_damaged_area",
                formData.total_damaged_area.toString()
            );
            formDataToSend.append(
                "partially_damaged_area",
                formData.partially_damaged_area.toString()
            );
            formDataToSend.append(
                "area_affected",
                formData.area_affected.toString()
            );
            formDataToSend.append("remarks", formData.remarks);

            if (proofFile) {
                formDataToSend.append("proof", proofFile);
            }

            console.log(formData.crop_damage_cause_id);

            // Only add _method if updating an existing record
            if (formData.id) {
                formDataToSend.append("_method", "PUT");
            }

            const url = formData.id
                ? `/cropdamages/update/${formData.id}`
                : "/store/cropdamages";

            console.log("Sending Form Data:", formDataToSend);

            const headers = {
                "Content-Type": "multipart/form-data",
                "X-CSRF-TOKEN":
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "",
            };
            console.log(
                "Form Data before sending:",
                Object.fromEntries(formDataToSend)
            );

            const response = await axios.post(url, formDataToSend, { headers });

            console.log("Response Data:", response.data);

            if (response.data.message) {
                toast.success(response.data.message, {
                    draggable: false,
                    closeOnClick: false,
                });
            } else {
                toast.error("Unexpected response format", {
                    draggable: false,
                    closeOnClick: false,
                });
            }

            fetchCropDamages();

            // Clear form data after successful submission
            setFormData({
                id: 0,
                farmer_id: 0,
                commodity_id: 0,
                brgy_id: 0,
                total_damaged_area: 0,
                partially_damaged_area: 0,
                area_affected: 0,
                remarks: "",
                severity: "low", // Default value
                proof: "", // Add this field, setting it to null or a default value
                crop_damage_cause_id: 0, // Add this field, setting it to null or a default value
            });

            // Close the modal
            setOpenDialog(false);
        } catch (error: any) {
            console.error("Error submitting crop damage data", error);
            if (error.response?.data?.errors) {
                console.error("Validation errors:", error.response.data.errors);
                toast.error(
                    "Validation failed: " +
                        JSON.stringify(error.response.data.errors),
                    {
                        draggable: false,
                        closeOnClick: false,
                    }
                );
            } else {
                toast.error(
                    error.response?.data?.message || "An error occurred",
                    {
                        draggable: false,
                        closeOnClick: false,
                    }
                );
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
                        <TextField
                            label="Proof (Image)"
                            type="file"
                            name="proof"
                            fullWidth
                            margin="normal"
                            onChange={handleFileChange}
                        />
                        {proofFile && (
                            <Box mt={2}>
                                <img
                                    src={URL.createObjectURL(proofFile)}
                                    alt="Proof Preview"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "200px",
                                        objectFit: "cover",
                                    }}
                                />
                            </Box>
                        )}

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
                            options={CropDamageCause}
                            isLoading={loadingCropDamageCause}
                            value={CropDamageCause.find(
                                (cdc) => cdc.value === formData.brgy_id
                            )}
                            onChange={(selectedOption) =>
                                handleSelectChange(
                                    selectedOption,
                                    "crop_damage_cause_id"
                                )
                            }
                            placeholder="Select Crop Damage Cause"
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
