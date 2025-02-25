import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar, } from "@mui/x-data-grid";
import axios from "axios";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, } from "@mui/material";
import Select from "react-select";
import { Head, router } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Edit2Icon, Import, Plus, Trash2, Trash2Icon } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import SecondaryButton from "@/Components/SecondaryButton";
import AdminLayout from "@/Layouts/AdminLayout";
const CropDamages = ({ auth }) => {
    axios.defaults.headers.common["X-CSRF-TOKEN"] =
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || "";
    const [cropDamages, setCropDamages] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        id: 0,
        farmer_id: 0,
        farm_id: 0,
        farm_name: "",
        farm_size: 0,
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
    const [farmers, setFarmers] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [CropDamageCause, setCropDamageCause] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingFarmers, setLoadingFarmers] = useState(true);
    const [loadingBarangays, setLoadingBarangays] = useState(true);
    const [loadingCommodities, setLoadingCommodities] = useState(true);
    const [loadingCropDamageCause, setLoadingCropDamageCause] = useState(true);
    const [proofFile, setProofFile] = useState(null);
    const [farms, setFarms] = useState([]);
    const [loadingFarms, setLoadingFarms] = useState(false);
    const columns = [
        { field: "id", headerName: "#", width: 90 },
        {
            field: "proof",
            headerName: "Proof",
            renderCell: (params) => (_jsx("img", { src: params.value || "https://via.placeholder.com/50", alt: "Avatar", style: {
                    marginTop: 5,
                    width: 40,
                    height: 40,
                    borderRadius: "15%",
                    objectFit: "cover",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                } })),
        },
        {
            field: "farmer_id",
            headerName: "Farmer",
            width: 150,
            valueGetter: (value, row) => {
                return `${row?.farmer?.firstname || "Not Assigned"} ${row?.farmer?.lastname || "Not assigned"} `;
            },
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
            valueGetter: (value, row) => row.crop_damage_cause.name,
        },
        {
            field: "farm_id",
            headerName: "Farm Affected",
            width: 150,
            valueGetter: (value, row) => row.farm?.name || "No Farm Listed",
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
            renderCell: (params) => (_jsxs("div", { className: "p-2 px-1 flex gap-2", children: [_jsx("button", { className: "border rounded-[12px] p-2 hover:bg-green-300", onClick: () => handleEdit(params.row), children: _jsx(Edit2Icon, { size: 20, color: "green" }) }), _jsx("button", { className: "border rounded-[12px] p-2 hover:bg-red-300", onClick: () => handleDelete(params.row.id), children: _jsx(Trash2Icon, { size: 20, color: "red" }) })] })),
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
            console.log("crop damages", cropDamages);
        }
        catch (error) {
            console.error("Error fetching crop damages", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchOptions = async () => {
        try {
            const [farmersData, barangaysData, commoditiesData, cropDamageCauseData,] = await Promise.all([
                axios.get("/data/farmers"),
                axios.get("/data/barangay"),
                axios.get("/data/commodity"),
                axios.get("/data/cropDamageCause"),
            ]);
            setFarmers(farmersData.data.map((farmer) => ({
                label: `${farmer.firstname || ""} ${farmer.lastname}`,
                value: farmer.id,
            })));
            setBarangays(barangaysData.data.map((barangay) => ({
                label: barangay.name,
                value: barangay.id,
            })));
            setCommodities(commoditiesData.data.map((commodity) => ({
                label: commodity.name,
                value: commodity.id,
            })));
            setCropDamageCause(cropDamageCauseData.data.map((cause) => ({
                label: cause.name,
                value: cause.id,
            })));
            setLoadingBarangays(false);
            setLoadingCommodities(false);
            setLoadingCropDamageCause(false);
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Error fetching options:", error.response?.data || error.message);
            }
            else {
                console.error("An unknown error occurred:", error);
            }
        }
    };
    const handleFarmerChange = async (selectedOption) => {
        setFormData({
            ...formData,
            farmer_id: selectedOption.value,
            farm_id: 0,
            farm_name: "",
        });
        setLoadingFarms(true);
        try {
            const response = await axios.get(`/farms/${selectedOption.value}`);
            setFarms(response.data.map((farm) => ({
                value: farm.id,
                label: `${farm.name} (${farm.ha} ha)  `,
            })));
        }
        catch (error) {
            console.error("Error fetching farms:", error);
        }
        finally {
            setLoadingFarms(false);
        }
    };
    const handleFileChange = (event) => {
        if (event.target.files) {
            setProofFile(event.target.files[0]);
        }
    };
    const handleEdit = (data) => {
        setFormData(data);
        setOpenDialog(true);
    };
    const handleDelete = async (data) => {
        if (window.confirm("Are you sure you want to delete this farmer?")) {
            try {
                await router.delete(`/cropdamages/destroy/${data}`);
                fetchCropDamages();
                setCropDamages((prevData = []) => prevData.filter((data) => data !== data));
                toast.success("Damage deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
            }
            catch (error) {
                toast.error("Failed to delete Damage");
            }
        }
    };
    const handleFormChange = (event) => {
        const updatedFormData = {
            ...formData,
            [event.target.name]: event.target.value,
        };
        if (formData.farm_size) {
            updatedFormData.severity = calculateSeverity(parseFloat(updatedFormData.total_damaged_area || 0), formData.farm_size);
        }
        setFormData(updatedFormData);
    };
    const handleSelectChange = (selectedOption, field) => {
        setFormData({
            ...formData,
            [field]: selectedOption ? selectedOption.value : 0,
        });
    };
    const calculateSeverity = (totalDamagedArea, farmSize) => {
        if (!farmSize || farmSize === 0)
            return "low";
        const damagePercentage = (totalDamagedArea / farmSize) * 100;
        if (damagePercentage > 50) {
            return "high";
        }
        else if (damagePercentage >= 20) {
            return "medium";
        }
        else {
            return "low";
        }
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!formData.crop_damage_cause_id) {
            console.error("crop_damage_cause_id is required");
            toast.error("Crop damage cause is required.");
            return;
        }
        else {
            console.log("crop damage cause id: ", formData.crop_damage_cause_id);
        }
        if (!formData.commodity_id) {
            console.error("commodity_id is required");
            toast.error("Commodity is required.");
            return;
        }
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("farmer_id", formData.farmer_id.toString());
            formDataToSend.append("farm_id", formData.farm_id.toString());
            formDataToSend.append("commodity_id", formData.commodity_id.toString());
            formDataToSend.append("crop_damage_cause_id", formData.crop_damage_cause_id.toString());
            formDataToSend.append("brgy_id", formData.brgy_id.toString());
            formDataToSend.append("total_damaged_area", formData.total_damaged_area.toString());
            formDataToSend.append("partially_damaged_area", formData.partially_damaged_area.toString());
            formDataToSend.append("area_affected", formData.area_affected.toString());
            formDataToSend.append("remarks", formData.remarks);
            formDataToSend.append("severity", formData.severity);
            if (proofFile) {
                console.log("Appending proof file:", proofFile);
                formDataToSend.append("proof", proofFile);
            }
            const url = formData.id
                ? `/cropdamages/update/${formData.id}`
                : "/store/cropdamages";
            const headers = {
                "Content-Type": "multipart/form-data",
                "X-CSRF-TOKEN": document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || "",
            };
            const response = await axios.post(url, formDataToSend, { headers });
            console.log("Response Data:", response.data);
            if (response.data.message) {
                toast.success(response.data.message, {
                    draggable: false,
                    closeOnClick: false,
                });
            }
            else {
                toast.error("Unexpected response format", {
                    draggable: false,
                    closeOnClick: false,
                });
            }
            fetchCropDamages();
            setFormData({
                id: 0,
                farmer_id: 0,
                farm_id: 0,
                commodity_id: 0,
                brgy_id: 0,
                total_damaged_area: 0,
                partially_damaged_area: 0,
                area_affected: 0,
                remarks: "",
                severity: "low",
                proof: "",
                crop_damage_cause_id: 0,
            });
            setOpenDialog(false);
        }
        catch (error) {
            console.error("Error submitting crop damage data", error);
            toast.error(error.response?.data?.message || "An error occurred", {
                draggable: false,
                closeOnClick: false,
            });
        }
    };
    const handleFarmChange = async (event) => {
        const selectedFarmId = Number(event.target.value);
        if (!selectedFarmId)
            return;
        try {
            const response = await axios.get(`/farms/details/${selectedFarmId}`);
            console.log("API Response:", response.data);
            setFormData((prevData) => ({
                ...prevData,
                farm_id: selectedFarmId,
                farm_name: response.data.name,
                farm_size: response.data.ha,
                severity: "low",
            }));
        }
        catch (error) {
            console.error("Error fetching farm details:", error);
        }
    };
    const selectedFarmer = farmers.find((farmer) => farmer.value === formData.farmer_id);
    const [file, setFile] = useState(null);
    const handleImportFileChange = (event) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };
    const handleUpload = async () => {
        if (!file) {
            alert("Please select a CSV file.");
            return;
        }
        const formData = new FormData();
        formData.append("file", file);
        try {
            await axios.post("/import-crop-damages", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert("Crop damages imported successfully!");
        }
        catch (error) {
            alert("Error importing file.");
            console.error(error);
        }
    };
    const handleImageUpload = async (file) => {
        const formData = new FormData();
        formData.append("proof", file);
        try {
            const response = await axios.post("/upload-proof", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data.path;
        }
        catch (error) {
            console.error("Error uploading proof:", error);
            return null;
        }
    };
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
            await axios.post("/api/cropdamages/delete", { ids: selectedIds });
            setCropDamages((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
            setSelectedIds([]);
            toast.success("Data Deleted successfully!");
        }
        catch (error) {
            console.error("Error deleting records:", error);
            toast.error("Data Deletion was not Successful!");
        }
        finally {
            setLoading(false); // Stop loading
        }
    };
    return (_jsxs(AdminLayout, { user: auth.user, header: _jsx(_Fragment, { children: _jsx("div", { className: "flex w-full justify-between", children: _jsx("h2", { className: "text-[24px] mt-2 font-medium text-green-800 leading-tight", children: "Crop Damages Management" }) }) }), children: [_jsx(Head, { title: "Damages List" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(TextInput, { type: "file", accept: ".csv", onChange: handleImportFileChange, className: "rounded-md border p-1" }), _jsxs(PrimaryButton, { onClick: handleUpload, className: "flex gap-2", children: [_jsx(Import, { size: 20 }), " Import"] })] }), _jsxs(PrimaryButton, { onClick: () => setOpenDialog(true), children: [_jsx(Plus, { size: 24 }), "Add Data"] }), _jsxs(SecondaryButton, { onClick: handleMultipleDelete, disabled: selectedIds.length === 0 || loading, style: {
                            background: selectedIds.length > 0 ? "red" : "gray",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            cursor: selectedIds.length > 0 ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }, children: [loading ? (_jsx("span", { className: "loader" }) // Add a loading animation here
                            ) : (_jsxs("span", { className: "flex gap-2", children: [" ", _jsx(Trash2, { size: 14 }), " Delete"] })), loading ? (_jsxs("span", { className: "flex gap-2", children: [_jsx(Trash2, { size: 14 }), " Deleting"] })) : ("")] })] }), _jsx(ToastContainer, {}), _jsxs("div", { children: [_jsx(Box, { sx: {
                            height: "550px",
                        }, children: _jsx(DataGrid, { rows: cropDamages, columns: columns, initialState: {
                                pagination: {
                                    paginationModel: { pageSize: 50 },
                                },
                            }, onRowSelectionModelChange: handleSelectionChange, rowSelectionModel: selectedIds, pageSizeOptions: [50, 100, 200, 350, 500], loading: loading, slots: { toolbar: GridToolbar }, checkboxSelection: true, slotProps: {
                                toolbar: {
                                    showQuickFilter: true,
                                },
                            }, sx: {
                                "& .MuiDataGrid-columnHeaders": {
                                    backgroundColor: "#f5f5f5",
                                },
                                border: "none",
                            } }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), children: [_jsxs(DialogTitle, { children: [formData.id ? "Edit" : "Add", " Crop Damage"] }), _jsxs(DialogContent, { children: [_jsx(TextField, { label: "Proof (Image)", type: "file", name: "proof", fullWidth: true, margin: "normal", onChange: handleFileChange }), proofFile && (_jsx(Box, { mt: 2, children: _jsx("img", { src: URL.createObjectURL(proofFile), alt: "Proof Preview", style: {
                                                maxWidth: "100%",
                                                maxHeight: "200px",
                                                objectFit: "cover",
                                                justifyContent: "center",
                                                alignContent: "center",
                                                alignItems: "center",
                                                display: "flex",
                                                borderRadius: "15px",
                                            } }) })), _jsx("br", {}), _jsx("br", {}), _jsxs("select", { className: "border border-gray-300 rounded-md p-2 w-full", value: formData.farmer_id, onChange: (e) => handleFarmerChange(farmers.find((farmer) => farmer.value ===
                                            Number(e.target.value))), children: [_jsx("option", { value: "", children: "Select a Farmer" }), farmers.map((farmer) => (_jsx("option", { value: farmer.value, children: farmer.label }, farmer.value)))] }), _jsx("br", {}), _jsx("br", {}), _jsxs("select", { className: "border border-gray-300 rounded-md p-2 w-full", value: formData.farm_id, onChange: handleFarmChange, disabled: loadingFarms || farms.length === 0, children: [_jsx("option", { value: "", children: "Select a Farm" }), farms.map((farm) => (_jsx("option", { value: farm.value, children: farm.label }, farm.value)))] }), _jsx("br", {}), _jsx("br", {}), _jsx(Select, { options: CropDamageCause, value: CropDamageCause.find((option) => option.value ===
                                            formData.crop_damage_cause_id), onChange: (selectedOption) => handleSelectChange(selectedOption, "crop_damage_cause_id") }), _jsx("br", {}), _jsx(Select, { options: barangays, isLoading: loadingBarangays, value: barangays.find((barangay) => barangay.value === formData.brgy_id), onChange: (selectedOption) => handleSelectChange(selectedOption, "brgy_id"), placeholder: "Select Barangay" }), _jsx("br", {}), _jsx(Select, { options: commodities, isLoading: loadingCommodities, value: commodities.find((commodity) => commodity.value === formData.commodity_id), onChange: (selectedOption) => handleSelectChange(selectedOption, "commodity_id"), placeholder: "Select Commodity" }), _jsx(TextField, { label: "Total Damaged Area", name: "total_damaged_area", value: formData.total_damaged_area, onChange: handleFormChange, fullWidth: true, margin: "normal" }), _jsx(TextField, { label: "Partially Damaged Area", name: "partially_damaged_area", value: formData.partially_damaged_area, onChange: handleFormChange, fullWidth: true, margin: "normal" }), _jsx(TextField, { label: "Area Affected", name: "area_affected", value: formData.area_affected, onChange: handleFormChange, fullWidth: true, margin: "normal" }), _jsx(TextField, { label: "Severity", name: "severity", value: formData.severity, disabled: true, fullWidth: true, margin: "normal" }), _jsx(TextField, { label: "Remarks", name: "remarks", value: formData.remarks, onChange: handleFormChange, fullWidth: true, margin: "normal" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpenDialog(false), children: "Cancel" }), _jsx(PrimaryButton, { type: "submit", onClick: handleSubmit, children: "Submit" })] })] })] })] }));
};
export default CropDamages;
