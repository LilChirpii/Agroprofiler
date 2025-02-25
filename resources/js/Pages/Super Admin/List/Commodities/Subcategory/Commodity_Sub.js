import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { DataGrid, GridToolbar, } from "@mui/x-data-grid";
import { Modal, Box, TextField, Select, MenuItem, InputLabel, FormControl, } from "@mui/material";
import axios from "axios";
import { Pencil, Plus, Trash, Trash2 } from "lucide-react";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrimaryButton from "@/Components/PrimaryButton";
import SecondaryButton from "@/Components/SecondaryButton";
const Commodities = ({ auth }) => {
    const [commodities, setCommodities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
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
        }
        catch (error) {
            console.error("Error fetching commodities:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            const response = await axios.get("/commodity-categories-show");
            setCategories(response.data);
            console.log(categories);
        }
        catch (error) {
            console.error("Error fetching categories:", error);
        }
    };
    useEffect(() => {
        fetchCommodities();
        fetchCategories();
    }, []);
    const handleOpen = (data = {
        id: 0,
        name: "",
        desc: "",
        commodity_category_id: 0,
        commodity: { id: 0, name: "", desc: "" },
    }) => {
        setIsEdit(!!data.id);
        setFormData(data);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const handleTextFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleSave = async () => {
        if (!formData.name || !formData.desc) {
            toast.error("Name and Description are required!");
            return;
        }
        try {
            let response;
            const requestData = {
                ...formData,
                _method: isEdit ? "PUT" : "POST", // Method spoofing for update
            };
            if (isEdit) {
                response = await axios.post(`/commodities/update/${formData.id}`, // Still using POST for update
                requestData);
            }
            else {
                response = await axios.post("/commodities/store", formData);
            }
            if (response.data.errors) {
                if (response.data.errors.name) {
                    toast.error(response.data.errors.name[0]);
                }
                if (response.data.errors.desc) {
                    toast.error(response.data.errors.desc[0]);
                }
            }
            else {
                toast.success(response.data.message ||
                    (isEdit
                        ? "Commodity updated successfully!"
                        : "Commodity added successfully!"), {
                    draggable: true,
                    closeOnClick: true,
                });
                fetchCommodities();
                handleClose();
            }
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Axios error:", error.response?.data);
            }
            else {
                console.error("Unexpected error:", error);
            }
            toast.error("An unexpected error occurred!");
        }
    };
    const handleDelete = async (id) => {
        try {
            // Use POST with method spoofing for DELETE
            await axios.post(`/commodities/destroy/${id}`, {
                _method: "DELETE", // Method spoofing for DELETE
            });
            // Update local state after deletion
            setCommodities((prevData) => prevData.filter((commodity) => commodity.id !== id));
            // Refresh commodity list after successful deletion
            fetchCommodities();
            // Display success toast
            toast.success("Commodity deleted successfully", {
                draggable: true,
                closeOnClick: true,
            });
        }
        catch (error) {
            // Display error toast if deletion fails
            toast.error("Commodity deleted unsuccessfully", {
                draggable: true,
                closeOnClick: true,
            });
            console.error("Error deleting data:", error);
        }
    };
    const columns = [
        { field: "id", headerName: "#", width: 100 },
        { field: "name", headerName: "Name", width: 200 },
        { field: "desc", headerName: "Description", width: 300 },
        {
            field: "commodity_category_id",
            headerName: "Category",
            width: 200,
            valueGetter: (value, row) => {
                return row?.category?.name || "Not Assigned";
            },
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 310,
            flex: 1,
            renderCell: (params) => (_jsxs("div", { className: "p-2 px-1 flex gap-2", children: [_jsx("button", { className: "border rounded-[12px] p-2 hover:bg-green-300", onClick: () => handleOpen(params.row), children: _jsx(Pencil, { color: "green", size: 20 }) }), _jsx("button", { onClick: () => handleDelete(params.row.id), className: "border rounded-[12px] p-2 hover:bg-red-300", children: _jsx(Trash, { color: "red", size: 20 }) })] })),
        },
    ];
    const [selectedIds, setSelectedIds] = useState([]);
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
            await axios.post("/api/commodities/delete", {
                ids: selectedIds,
            });
            setCommodities((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
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
    return (_jsxs(Authenticated, { user: auth.user, header: _jsxs("div", { className: "flex w-full justify-between", children: [_jsx("h2", { className: "text-[25px] mt-2 font-semibold text-green-600 leading-tight", children: "Commodities Management" }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(PrimaryButton, { onClick: () => handleOpen(), children: [_jsx(Plus, { size: 24 }), "Add Commodity"] }), _jsxs(SecondaryButton, { onClick: handleMultipleDelete, disabled: selectedIds.length === 0 || loading, style: {
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
                                ) : (_jsxs("span", { className: "flex gap-2", children: [" ", _jsx(Trash2, { size: 14 }), " Delete"] })), loading ? (_jsxs("span", { className: "flex gap-2", children: [_jsx(Trash2, { size: 14 }), " Deleting"] })) : ("")] })] })] }), children: [_jsx(Head, { title: "Commodity Management" }), _jsx(ToastContainer, {}), _jsxs("div", { children: [_jsx(Box, { sx: {
                            height: "550px",
                        }, children: _jsx(DataGrid, { rows: commodities, columns: columns, initialState: {
                                pagination: {
                                    paginationModel: { pageSize: 50 },
                                },
                            }, pageSizeOptions: [50, 100, 200, 350, 500], loading: loading, checkboxSelection: true, onRowSelectionModelChange: handleSelectionChange, rowSelectionModel: selectedIds, slots: { toolbar: GridToolbar }, slotProps: {
                                toolbar: {
                                    showQuickFilter: true,
                                },
                            }, sx: {
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: "#f5f5f5",
                                },
                                border: "none",
                            }, getRowId: (row) => row.id }) }), _jsx(Modal, { open: open, onClose: handleClose, children: _jsxs(Box, { className: "dark:bg-[#122231]", sx: {
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                width: 400,
                                bgcolor: "background.paper",
                                boxShadow: 24,
                                p: 4,
                                borderRadius: 2,
                            }, children: [_jsx("h2", { className: "text-green-600 text-[20px] font-semibold", children: isEdit ? "Edit Commodity" : "Add Commodity" }), _jsx(TextField, { fullWidth: true, label: "Name", name: "name", value: formData.name, onChange: handleTextFieldChange, margin: "normal" }), _jsx(TextField, { fullWidth: true, label: "Description", name: "desc", value: formData.desc, onChange: handleTextFieldChange, margin: "normal" }), _jsxs(FormControl, { fullWidth: true, margin: "normal", children: [_jsx(InputLabel, { children: "Category" }), _jsxs(Select, { name: "commodity_category_id", value: formData.commodity_category_id || "", onChange: handleSelectChange, displayEmpty: true, children: [_jsx(MenuItem, { value: "", disabled: true, children: "Select a category" }), categories.map((category) => (_jsx(MenuItem, { value: category.id, children: category.name }, category.id)))] })] }), _jsx(PrimaryButton, { className: "mt-4", children: "Save" })] }) })] })] }));
};
export default Commodities;
