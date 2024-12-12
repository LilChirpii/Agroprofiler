import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import {
    Button,
    Modal,
    Box,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from "@mui/material";
import axios from "axios";
import { Pencil } from "lucide-react";

const Commodities = () => {
    const [commodities, setCommodities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: "",
        desc: "",
        commodity_category_id: "",
    });
    const [isEdit, setIsEdit] = useState(false);

    const fetchCommodities = async () => {
        try {
            const response = await axios.get("/commodities/show");
            setCommodities(response.data);
        } catch (error) {
            console.error("Error fetching commodities:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get("/commodity-categories");
            setCategories(response.data);
            console.log(categories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchCommodities();
        fetchCategories();
    }, []);

    const handleOpen = (
        data = { id: null, name: "", desc: "", commodity_category_id: "" }
    ) => {
        setIsEdit(!!data.id);
        setFormData(data);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | { name?: string; value: unknown }
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name || ""]: value }));
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`/commodities/${formData.id}`, formData);
            } else {
                await axios.post("/commodities", formData);
            }
            fetchCommodities();
            handleClose();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/commodities/${id}`);
            fetchCommodities();
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "name", headerName: "Name", width: 200 },
        { field: "desc", headerName: "Description", width: 300 },
        {
            field: "commodity_category",
            headerName: "Category",
            width: 200,
            valueGetter: (value, row) => {
                return row?.category?.name || "Not Assigned";
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
                <>
                    <Button onClick={() => handleOpen(params.row)}>
                        <Pencil size={20} />
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(params.row.id)}
                        style={{ marginLeft: 8 }}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div style={{ height: 600, width: "100%" }}>
            <h1>Commodities</h1>
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpen()}
            >
                Add Commodity
            </Button>
            <DataGrid
                rows={commodities}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                components={{ Toolbar: GridToolbar }}
                getRowId={(row) => row.id}
            />
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <h2>{isEdit ? "Edit Commodity" : "Add Commodity"}</h2>
                    <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        name="desc"
                        value={formData.desc}
                        onChange={handleChange}
                        margin="normal"
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Category</InputLabel>
                        <Select
                            name="commodity_category_id"
                            value={formData.commodity_category_id}
                            onChange={handleChange}
                        >
                            {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        style={{ marginTop: 16 }}
                    >
                        Save
                    </Button>
                </Box>
            </Modal>
        </div>
    );
};

export default Commodities;
