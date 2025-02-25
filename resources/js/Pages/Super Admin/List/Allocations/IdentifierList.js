import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, } from "@mui/material";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import PrimaryButton from "@/Components/PrimaryButton";
import { Pencil, Plus, Trash, Trash2 } from "lucide-react";
import SecondaryButton from "@/Components/SecondaryButton";
const IdentifierList = ({ auth }) => {
    const [identifer, setidentifer] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        title: "",
        desc: "",
    });
    const [editMode, setEditMode] = useState(false);
    // Fetch Data
    useEffect(() => {
        fetchidentifer();
    }, []);
    const fetchidentifer = async () => {
        const response = await axios.get("/api/identifier");
        setidentifer(response.data);
    };
    const handleOpen = (funding) => {
        if (funding) {
            setEditMode(true);
            setFormData(funding);
        }
        else {
            setEditMode(false);
            setFormData({ id: 0, title: "", desc: "" });
        }
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async () => {
        if (editMode) {
            await axios.put(`/update/identifier/${formData.id}`, formData);
        }
        else {
            await axios.post("/store/identifier", formData);
        }
        fetchidentifer();
        handleClose();
    };
    const handleDelete = async (id) => {
        await axios.delete(`/destroy/identifier/${id}`);
        fetchidentifer();
    };
    const columns = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "title", headerName: "Name", width: 200 },
        { field: "desc", headerName: "Description", width: 300 },
        {
            field: "actions",
            headerName: "Actions",
            width: 500,
            flex: 1,
            renderCell: (params) => (_jsxs("div", { className: "p-2 px-1 flex gap-2", children: [_jsx("button", { className: "border rounded-[12px] p-2 hover:bg-green-300", onClick: () => handleOpen(params.row), children: _jsx(Pencil, { size: 20, color: "green" }) }), _jsx("button", { className: "border rounded-[12px] p-2 hover:bg-red-300", onClick: () => handleDelete(params.row.id), children: _jsx(Trash, { size: 20, color: "red" }) })] })),
        },
    ];
    const [selectedIds, setSelectedIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const handleSelectionChange = (selection) => {
        setSelectedIds(selection);
    };
    const handleMultipleDelete = async () => {
        if (selectedIds.length === 0) {
            alert("No records selected!");
            return;
        }
        if (!window.confirm("Are you sure you want to delete selected records?")) {
            return;
        }
        try {
            setLoading(true);
            await axios.post("/api/identifiers/delete", {
                ids: selectedIds,
            });
            setidentifer((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
            setSelectedIds([]);
            toast.success("Data Deleted successfully!");
        }
        catch (error) {
            console.error("Error deleting records:", error);
            toast.error("Data Deletion was not Successful!");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Authenticated, { user: auth.user, header: _jsx(_Fragment, { children: _jsxs("div", { className: "flex w-full justify-between", children: [_jsx("h2", { className: "text-[25px] mt-2 font-semibold text-green-600 leading-tight", children: "Allocation Identifier Management" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(PrimaryButton, { onClick: () => handleOpen(), children: [_jsx(Plus, { size: 24 }), "Add Allocation Identifier"] }), _jsxs(SecondaryButton, { onClick: handleMultipleDelete, disabled: selectedIds.length === 0 || loading, style: {
                                    background: selectedIds.length > 0 ? "red" : "gray",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "12px",
                                    cursor: selectedIds.length > 0
                                        ? "pointer"
                                        : "not-allowed",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }, children: [loading ? (_jsx("span", { className: "loader" }) // Add a loading animation here
                                    ) : (_jsxs("span", { className: "flex gap-2", children: [" ", _jsx(Trash2, { size: 14 }), " Delete"] })), loading ? (_jsxs("span", { className: "flex gap-2", children: [_jsx(Trash2, { size: 14 }), " Deleting"] })) : ("")] })] })] }) }), children: [_jsx(Head, { title: "Commodities List" }), _jsx(ToastContainer, {}), _jsxs(Box, { p: 3, sx: { height: "550px" }, children: [_jsx(DataGrid, { rows: identifer, columns: columns, pageSizeOptions: [5, 10], slots: { toolbar: GridToolbar }, checkboxSelection: true, onRowSelectionModelChange: handleSelectionChange, rowSelectionModel: selectedIds, slotProps: {
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }, sx: {
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#f5f5f5",
                            },
                            border: "none",
                        } }), _jsxs(Dialog, { open: open, onClose: handleClose, children: [_jsx(DialogTitle, { className: "text-green-600 font-semibold", children: editMode ? "Edit Identifier" : "Add Identifier" }), _jsxs(DialogContent, { children: [_jsx(TextField, { margin: "dense", label: "Name", name: "title", fullWidth: true, value: formData.title, onChange: handleChange }), _jsx(TextField, { margin: "dense", label: "Description", name: "desc", fullWidth: true, value: formData.desc, onChange: handleChange })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleClose, children: "Cancel" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", children: editMode ? "Update" : "Add" })] })] })] })] }));
};
export default IdentifierList;
