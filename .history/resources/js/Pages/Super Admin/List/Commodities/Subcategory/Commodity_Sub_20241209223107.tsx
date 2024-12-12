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
import { Pencil, Trash } from "lucide-react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PageProps } from "@/types";
import { SelectChangeEvent } from "@mui/material";

interface Commodity {
    id: number;
    name: string;
    desc: string;
    commodity_category_id: number;
    commodity: {
        id: number;
        name: string;
        desc: string;
    };
}

const Commodities = ({ auth }: PageProps) => {
    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const [categories, setCategories] = useState<Commodity[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<Commodity>({
        id: 0,
        name: "",
        desc: "",
        commodity_category_id: 0,
        commodity: { id: 0, name: "", desc: "" },
    });
    const [isEdit, setIsEdit] = useState(false);

    const fetchCommodities = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/commodities/show");
            setCommodities(response.data);
            console.log("fetch commodities: ", commodities);
        } catch (error) {
            console.error("Error fetching commodities:", error);
        } finally {
            setLoading(false);
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
        data: Commodity = {
            id: 0,
            name: "",
            desc: "",
            commodity_category_id: 0,
            commodity: { id: 0, name: "", desc: "" },
        }
    ) => {
        setIsEdit(!!data.id);
        setFormData(data);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(`/commodities/update/${formData.id}`, formData);
                handleClose();
            } else {
                const response = await axios.post(
                    "/commodities/store",
                    formData
                );
                fetchCommodities();
                toast.success(response.data.message, {
                    draggable: true,
                    closeOnClick: true,
                });
                handleClose();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error:", error.response?.data);
            } else {
                console.error("Unexpected error:", error);
            }
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/commodities/destroy/${id}`);
            fetchCommodities();
            setCommodities((prevData) =>
                prevData.filter((commodity) => commodity.id !== id)
            );
            toast.success("Commodity deleted successfully", {
                draggable: true,
                closeOnClick: true,
            });
        } catch (error) {
            toast.error("Commodity deleted unsuccessfully", {
                draggable: true,
                closeOnClick: true,
            });
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
                return row?.commodity?.name || "Not Assigned";
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
                <>
                    <Button onClick={() => handleOpen(params.row)}>
                        <Pencil color="green" size={20} />
                    </Button>
                    <Button
                        onClick={() => handleDelete(params.row.id)}
                        style={{ marginLeft: 8 }}
                    >
                        <Trash color="red" size={20} />
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Commodity Management
                </h2>
            }
        >
            <Head title="Commodity Management" />
            <ToastContainer />
            <div style={{ height: 500, width: "100%" }}>
                <div className="flex justify-between px-4 py-2">
                    <div></div>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleOpen()}
                    >
                        Add Commodity
                    </Button>
                </div>
                <Box
                    sx={{
                        height: "450px",
                        padding: "10px",
                        borderRadius: "10px",
                    }}
                >
                    <DataGrid
                        rows={commodities}
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
                        getRowId={(row) => row.id}
                    />
                </Box>

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
                            onChange={handleTextFieldChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="desc"
                            value={formData.desc}
                            onChange={handleTextFieldChange}
                            margin="normal"
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="commodity_category_id"
                                value={formData.commodity_category_id.toString()}
                                onChange={handleSelectChange}
                            >
                                {categories.map((category) => (
                                    <MenuItem
                                        key={category.id}
                                        value={category.id}
                                    >
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
        </Authenticated>
    );
};

export default Commodities;
