import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import axios from "axios";
import {
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
import { ToastContainer } from "react-toastify";
import { PageProps } from "@/types";

interface CropDamage {
    id: number;
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
                    <Button onClick={() => handleEdit(params.row)}>Edit</Button>
                    <Button onClick={() => handleDelete(params.row.id)}>
                        Delete
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
                await axios.put(
                    `/crop-damages/update/${formData.id}`,
                    formData
                );
            } else {
                await axios.post("/crop-damages/store", formData);
            }
            setOpenDialog(false);
            fetchCropDamages();
        } catch (error) {
            console.error("Error submitting crop damage data", error);
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
                    Commodity Category List
                </h2>
            }
        >
            <Head title="Commodities List" />

            <ToastContainer />
            <div>
                <Button onClick={() => setOpenDialog(true)}>
                    Add New Crop Damage
                </Button>
                <div style={{ height: 400, width: "100%" }}>
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
                </div>
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
                            value={formData.partially_damaged_area}
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
                        <Button onClick={handleSubmit}>Submit</Button>
                    </DialogActions>
                </Dialog>
            </div>
        </Authenticated>
    );
};

export default CropDamages;
