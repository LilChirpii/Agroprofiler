import React, { useEffect, useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Button, Modal, Box, TextField } from "@mui/material";
import axios from "axios";
import { PageProps } from "@/types";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import { Pencil, Trash } from "lucide-react";

const Commodities = ({ auth }: PageProps) => {
    const [commodities, setCommodities] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: "", desc: "" });
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/commodity-categories");
            setCommodities(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpen = (data = { id: null, name: "", desc: "" }) => {
        setIsEdit(!!data.id);
        setFormData(data);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            if (isEdit) {
                await axios.put(
                    `/commodity-categories/${formData.id}`,
                    formData
                );
            } else {
                const response = await axios.post(
                    "/commodity-categories/store",
                    formData
                );
                fetchData();
                toast.success(response.data.message, {
                    draggable: true,
                    closeOnClick: true,
                });
                handleClose();
            }
            fetchData();
            handleClose();
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/commodity-categories/${id}`);
            fetchData();
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 100 },
        { field: "name", headerName: "Name", width: 200 },
        { field: "desc", headerName: "Description", width: 300 },
        {
            field: "actions",
            headerName: "Actions",
            width: 200,
            renderCell: (params) => (
                <>
                    <button
                        style={{ marginRight: 5 }}
                        onClick={() => handleOpen(params.row.id)}
                    >
                        <Pencil size={20} color="green" />
                    </button>

                    <button onClick={() => handleDelete(params.row.id)}>
                        <Trash size={20} color="red" />
                    </button>
                </>
            ),
        },
    ];

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Commodity Category List
                </h2>
            }
        >
            <Head title="Crop Damage causes List" />

            <ToastContainer />
            <div style={{ height: 500, width: "100%" }}>
                <div className="flex justify-between px-4">
                    <div></div>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleOpen()}
                    >
                        Add Commodity
                    </Button>{" "}
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
