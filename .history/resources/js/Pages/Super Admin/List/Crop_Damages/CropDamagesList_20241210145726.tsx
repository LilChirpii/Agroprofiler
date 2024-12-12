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
    // Add relations if needed
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

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "farmer_id", headerName: "Farmer ID", width: 150 },
        { field: "commodity_id", headerName: "Commodity ID", width: 150 },
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
    }, []);

    const fetchCropDamages = async () => {
        try {
            const response = await axios.get(
                "http://127.0.0.1:8000/api/crop-damages"
            );
            setCropDamages(response.data);
        } catch (error) {
            console.error("Error fetching crop damages", error);
        }
    };

    const handleEdit = (data: CropDamage) => {
        setFormData(data);
        setOpenDialog(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://127.0.0.1:8000/api/crop-damages/${id}`);
            fetchCropDamages();
        } catch (error) {
            console.error("Error deleting crop damage", error);
        }
    };

    const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
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
                    <TextField
                        label="Farmer ID"
                        name="farmer_id"
                        value={formData.farmer_id}
                        onChange={handleFormChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Commodity ID"
                        name="commodity_id"
                        value={formData.commodity_id}
                        onChange={handleFormChange}
                        fullWidth
                        margin="normal"
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
