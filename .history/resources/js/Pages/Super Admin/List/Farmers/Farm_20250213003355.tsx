import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Modal, Box, TextField, MenuItem } from "@mui/material";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";

interface Farm {
    id: number;
    name: string;
    farmer_id: number;
    farmer_name: string;
    brgy_id: number;
    commodity_id: number;
    ha: number;
    owner: string;
    latitude: number | null;
    longitude: number | null;
}

const Farm: React.FC = () => {
    const [farms, setFarms] = useState<Farm[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState<Farm>({
        id: 0,
        name: "",
        farmer_id: 0,
        farmer_name: "",
        brgy_id: 0,
        commodity_id: 0,
        ha: 0,
        owner: "yes",
        latitude: null,
        longitude: null,
    });

    useEffect(() => {
        fetchFarms();
    }, []);

    const fetchFarms = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/data/farms");
            setFarms(response.data);
            console.log(farms);
        } catch (error) {
            console.error("Error fetching farms:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        try {
            if (formData.id) {
                await axios.put(`/farms/${formData.id}`, formData);
            } else {
                await axios.post("/farms", formData);
            }
            fetchFarms();
            handleClose();
        } catch (error) {
            console.error("Error saving farm:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this farm?")) {
            try {
                await axios.delete(`/api/farms/${id}`);
                fetchFarms();
            } catch (error) {
                console.error("Error deleting farm:", error);
            }
        }
    };

    const handleOpen = (farm?: Farm) => {
        if (farm) {
            setFormData(farm);
        } else {
            setFormData({
                id: 0,
                name: "",
                farmer_id: 0,
                farmer_name: "",
                brgy_id: 0,
                commodity_id: 0,
                ha: 0,
                owner: "yes",
                latitude: null,
                longitude: null,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "name", headerName: "Farm Name", width: 150 },
        {
            field: "farm_id",
            headerName: "Farmer",
            width: 150,
            valueGetter: (value, row) => {
                return `${row?.farmer?.firstname || "Not Assigned"} ${
                    row?.farmer?.lastname || "Not assigned"
                } `;
            },
        },
        { field: "ha", headerName: "Size (ha)", width: 120 },
        { field: "owner", headerName: "Owner", width: 100 },
        { field: "latitude", headerName: "Latitude", width: 130 },
        { field: "longitude", headerName: "Longitude", width: 130 },
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
                <>
                    <Button size="small" onClick={() => handleOpen(params.row)}>
                        Edit
                    </Button>
                    <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Authenticated
            user={auth.user}
            header={
                <>
                    <div className="flex w-full justify-between">
                        <h2 className="text-xl mt-2 font-medium text-green-800 leading-tight">
                            Crop Damages Management
                        </h2>
                        <div className="flex gap-2">
                            <TextInput
                                type="file"
                                accept=".csv"
                                onChange={handleImportFileChange}
                                className="rounded-md border p-2"
                            />
                            <PrimaryButton onClick={handleUpload}>
                                Import
                            </PrimaryButton>
                        </div>
                        <PrimaryButton onClick={() => setOpenDialog(true)}>
                            <Plus size={24} />
                            Add Data
                        </PrimaryButton>
                        <SecondaryButton
                            onClick={handleMultipleDelete}
                            disabled={selectedIds.length === 0 || loading}
                            style={{
                                background:
                                    selectedIds.length > 0 ? "red" : "gray",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                cursor:
                                    selectedIds.length > 0
                                        ? "pointer"
                                        : "not-allowed",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            {loading ? (
                                <span className="loader"></span> // Add a loading animation here
                            ) : (
                                <span className="flex gap-2">
                                    {" "}
                                    <Trash2 size={14} /> Delete
                                </span>
                            )}
                            {loading ? (
                                <span className="flex gap-2">
                                    <Trash2 size={14} /> Deleting
                                </span>
                            ) : (
                                ""
                            )}
                        </SecondaryButton>
                    </div>
                </>
            }
        >
            <div style={{ height: 500, width: "100%" }}>
                <Button
                    onClick={() => handleOpen()}
                    variant="contained"
                    color="primary"
                    style={{ marginBottom: 10 }}
                >
                    Add Farm
                </Button>
                <DataGrid
                    rows={farms}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[5, 10, 20]}
                />

                {/* Modal for Adding/Editing */}
                <Modal open={open} onClose={handleClose}>
                    <Box
                        sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: 400,
                            bgcolor: "white",
                            p: 3,
                            borderRadius: 2,
                        }}
                    >
                        <h2>{formData.id ? "Edit Farm" : "Add Farm"}</h2>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Farm Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Size (ha)"
                            name="ha"
                            type="number"
                            value={formData.ha}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            select
                            label="Owner"
                            name="owner"
                            value={formData.owner}
                            onChange={handleChange}
                        >
                            <MenuItem value="yes">Yes</MenuItem>
                            <MenuItem value="no">No</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Latitude"
                            name="latitude"
                            type="number"
                            value={formData.latitude || ""}
                            onChange={handleChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Longitude"
                            name="longitude"
                            type="number"
                            value={formData.longitude || ""}
                            onChange={handleChange}
                        />
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            color="primary"
                            fullWidth
                        >
                            {formData.id ? "Update" : "Create"}
                        </Button>
                    </Box>
                </Modal>
            </div>
        </Authenticated>
    );
};

export default Farm;
