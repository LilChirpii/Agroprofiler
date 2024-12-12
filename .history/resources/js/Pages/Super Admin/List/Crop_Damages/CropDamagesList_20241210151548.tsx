import React, { useState, useEffect } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
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
}

const CropDamages: React.FC = () => {
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

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 90 },
        {
            field: "farmer_id",
            headerName: "Farmer",
            width: 150,
            valueGetter: (params) => params.row.farmer.name,
        },
        {
            field: "commodity_id",
            headerName: "Commodity",
            width: 150,
            valueGetter: (params) => params.row.commodity.name,
        },
        {
            field: "total_damaged_area",
            headerName: "Total Damaged Area",
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
        try {
            const response = await axios.get("/cropdamages/data");
            setCropDamages(response.data);
        } catch (error) {
            console.error("Error fetching crop damages", error);
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
                    label: farmer.name,
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
        } catch (error) {
            console.error("Error fetching options", error);
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
                    `http://127.0.0.1:8000/api/crop-damages/${formData.id}`,
                    formData
                );
            } else {
                await axios.post(
                    "http://127.0.0.1:8000/api/crop-damages",
                    formData
                );
            }
            setOpenDialog(false);
            fetchCropDamages();
        } catch (error) {
            console.error("Error submitting crop damage data", error);
        }
    };

    return (
        <div>
            <Button onClick={() => setOpenDialog(true)}>
                Add New Crop Damage
            </Button>
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid rows={cropDamages} columns={columns} pageSize={5} />
            </div>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {formData.id ? "Edit" : "Add"} Crop Damage
                </DialogTitle>
                <DialogContent>
                    <Select
                        options={farmers}
                        value={farmers.find(
                            (farmer) => farmer.value === formData.farmer_id
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, "farmer_id")
                        }
                        placeholder="Select Farmer"
                    />
                    <Select
                        options={barangays}
                        value={barangays.find(
                            (barangay) => barangay.value === formData.brgy_id
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, "brgy_id")
                        }
                        placeholder="Select Barangay"
                    />
                    <Select
                        options={commodities}
                        value={commodities.find(
                            (commodity) =>
                                commodity.value === formData.commodity_id
                        )}
                        onChange={(selectedOption) =>
                            handleSelectChange(selectedOption, "commodity_id")
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
                        label="Remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleFormChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Severity"
                        name="severity"
                        value={formData.severity}
                        onChange={handleFormChange}
                        fullWidth
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CropDamages;