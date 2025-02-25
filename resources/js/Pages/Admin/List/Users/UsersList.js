import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, } from "react";
import "../../../../../css/Table.css";
import axios from "axios";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Box, Breadcrumbs, Link } from "@mui/material";
import { Head, router } from "@inertiajs/react";
import { DataGrid, GridToolbar, } from "@mui/x-data-grid";
import { Pencil, Plus, Trash } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import TextInput from "@/Components/TextInput";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DefaultAvatar from "@/Components/DefaultAvatar";
const UsersList = ({ auth }) => {
    const [users, setUsers] = useState([]);
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const closeEditModal = () => setIsEditModalOpen(false);
    const handlePreviewClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const previewUrl = URL.createObjectURL(file); // Create a preview URL for display
            // Update state with the file and preview URL
            setSelectedUser((prevUser) => {
                if (!prevUser)
                    return null; // Ensure `prevUser` exists
                return {
                    ...prevUser,
                    pfp: previewUrl, // Set the preview
                };
            });
            // Set file for uploading
            setNewUser("pfp");
        }
        else {
            // Reset preview and file
            setSelectedUser((prevUser) => {
                if (!prevUser)
                    return null; // Ensure `prevUser` exists
                return {
                    ...prevUser,
                    pfp: null,
                };
            });
            setNewUser("pfp");
        }
    };
    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/users/data");
            setUserData(response.data);
            console.log(response.data);
        }
        catch (error) {
            console.error("Error fetching user data:", error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchUserData();
    }, []);
    function changeDateFormat(dateString) {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        const date = new Date(dateString);
        return date.toLocaleDateString("en-UK", options);
    }
    console.log("Users Array:", userData);
    const handleEdit = (userId) => {
        if (!userData) {
            console.error("User data is not available");
            return;
        }
        const user = userData.find((user) => user.id === userId);
        if (user) {
            setSelectedUser(user); // Set the full user data
            setIsEditModalOpen(true); // Open the modal
            console.log("Selected User: ", user); // Log the selected user data
        }
        else {
            console.error("User not found");
        }
    };
    const handleDelete = async (userData) => {
        console.log(userData);
        if (window.confirm("Are you sure you want to delete this User?")) {
            try {
                await router.delete(`/users/destroy/${userData}`);
                fetchUserData();
                setUserData((prevData = []) => prevData.filter((userData) => userData.id !== userData.id));
                toast.success("User deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
            }
            catch (error) {
                toast.error("Failed to delete User");
            }
        }
    };
    const columns = [
        { field: "id", headerName: "#", width: 100 },
        {
            field: "pfp",
            headerName: "PFP",
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
        { field: "firstname", headerName: "First name", width: 120 },
        { field: "lastname", headerName: "Last name", width: 120 },
        { field: "email", headerName: "Email", width: 250 },
        { field: "status", headerName: "Status", width: 100 },
        { field: "section", headerName: "section", width: 100 },
        {
            field: "actions",
            headerName: "Actions",
            width: 90,
            renderCell: (params) => (_jsxs("div", { children: [_jsx("button", { style: { marginRight: 5 }, onClick: () => handleEdit(params.row.id), children: _jsx(Pencil, { size: 20, color: "green" }) }), _jsx("button", { onClick: () => handleDelete(params.row.id), children: _jsx(Trash, { size: 20, color: "red" }) })] })),
        },
    ];
    const handleUpdate = async (e) => {
        e.preventDefault();
        // Prepare the payload data
        const dataToSend = {
            _method: "PUT",
            firstname: selectedUser?.firstname,
            lastname: selectedUser?.lastname,
            sex: selectedUser?.sex,
            email: selectedUser?.email,
            section: selectedUser?.section,
            status: selectedUser?.status,
            role: selectedUser?.role,
            password: selectedUser?.password,
        };
        // Check if a new profile picture is selected and convert it to base64 if it's a file
        if (selectedUser?.pfp instanceof File) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const profilePictureBase64 = reader.result; // Base64 string of the image
                dataToSend.pfp = profilePictureBase64; // Add base64 image data to the payload
                await sendUpdateRequest(dataToSend);
            };
            reader.readAsDataURL(selectedUser.pfp); // Convert the file to base64 string
        }
        else {
            // If no new profile picture, just send the existing one or an empty string
            dataToSend.pfp = selectedUser?.pfp || ""; // Send the existing image URL or empty if none
            await sendUpdateRequest(dataToSend);
        }
    };
    const sendUpdateRequest = async (dataToSend) => {
        try {
            await axios.post(`/users/update/${selectedUser?.id}`, // Use POST, but spoof it as PUT
            dataToSend, {
                headers: {
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content") || "",
                },
            });
            // Update the user data and state
            fetchUserData();
            setUserData((prevData) => selectedUser
                ? prevData
                    .filter((userData) => userData.id !== selectedUser.id)
                    .concat(selectedUser)
                : prevData);
            toast.success("User updated successfully", {
                draggable: true,
                closeOnClick: true,
            });
            closeEditModal();
        }
        catch (error) {
            console.error("Error:", error);
            if (axios.isAxiosError(error) && error.response) {
                if (error.response.status === 422) {
                    toast.error(`Failed to update user: ${JSON.stringify(error.response.data.errors)}`);
                }
                else {
                    toast.error(`Failed to update user: ${error.response.statusText}`);
                }
            }
            else {
                toast.error("Failed to update user");
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(newUser).forEach((key) => {
            const value = newUser[key];
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });
        try {
            await axios.post("/users/store", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast.success("User added successfully");
            fetchUserData();
            setUserData((prevData = []) => prevData.filter((userData) => userData !== userData));
            closeModal();
        }
        catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error("Error adding User:", error.response.data);
                toast.error(`Failed to add User: ${error.response.data.message || "Validation error"}`);
            }
            else {
                toast.error("Failed to add User");
            }
        }
    };
    const [newUser, setNewUser] = useState({
        pfp: "",
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        section: "",
        sex: "",
        status: "",
        password: "",
        confirm_password: "",
    });
    const handleSelectChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value,
        });
    };
    const handleInputChange = (e) => {
        setNewUser({
            ...newUser,
            [e.target.name]: e.target.value,
        });
    };
    const handleUpdateInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedUser((prev) => (prev ? { ...prev, [name]: value } : null));
    };
    console.log("selected user: ", selectedUser); // Check if the user data is correct
    return (_jsxs(Authenticated, { user: auth.user, header: _jsx("h2", { className: "text-xl mt-2 text-gray-800 leading-tight", children: "Users Management" }), breadcrumbs: _jsx("div", { className: "ml-[2rem]", children: _jsxs(Breadcrumbs, { "aria-label": "breakdown", children: [_jsx(Link, { href: "/dashboard", children: _jsx("span", { className: "text-xs text-green-500 hover:text-green-700", children: "Dashboard" }) }), _jsx(Link, { href: "#", children: _jsx("span", { className: "text-xs text-green-500 hover:text-green-700", children: "Users" }) })] }) }), children: [_jsx(Head, { title: "Users Management" }), _jsx(ToastContainer, {}), _jsxs("div", { className: "flex justify-between px-6", children: [_jsx("div", {}), _jsxs(PrimaryButton, { className: "mr-50 flex gap-2 py-2", onClick: openModal, children: [_jsx(Plus, { size: 15 }), "Add New User"] })] }), _jsx(Box, { sx: { height: "450px", padding: "10px", borderRadius: "10px" }, children: _jsx(DataGrid, { rows: userData, columns: columns, initialState: {
                        pagination: {
                            paginationModel: { pageSize: 50 },
                        },
                    }, pageSizeOptions: [50, 100, 200, 350, 500], loading: loading, slots: { toolbar: GridToolbar }, slotProps: {
                        toolbar: {
                            showQuickFilter: true,
                        },
                    }, sx: {
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#f5f5f5",
                        },
                        padding: "10px",
                        borderRadius: "1.5rem",
                    } }) }), selectedUser && (_jsx(Modal, { show: isEditModalOpen, onClose: closeEditModal, children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-semibold mb-4 flex gap-2", children: "\uD83D\uDC66 Edit User" }), _jsxs("form", { onSubmit: handleUpdate, children: [_jsx("div", { className: "flex gap-5 mt-4", children: _jsxs("div", { children: [_jsx("input", { type: "file", id: "pfp", name: "pfp", accept: "image/*", onChange: handleFileChange, className: "hidden", ref: fileInputRef }), _jsx("div", { className: "w-24 h-24 rounded-2xl overflow-hidden border-2 cursor-pointer", onClick: handlePreviewClick, children: selectedUser.pfp ? (_jsx("img", { src: selectedUser.pfp ||
                                                        DefaultAvatar, alt: "Profile Preview", className: "object-cover w-full h-full" })) : (_jsx(DefaultAvatar, { width: "100%", height: "100%", className: "object-cover w-full h-full" })) })] }) }), _jsxs("div", { className: "flex gap-5 mt-4", children: [_jsx(TextInput, { name: "firstname", value: selectedUser.firstname || "", onChange: handleUpdateInputChange, placeholder: "Firstname" }), _jsx(TextInput, { name: "lastname", value: selectedUser.lastname || "", onChange: handleUpdateInputChange, placeholder: "Lastname" })] }), _jsxs("div", { className: "flex gap-5 mt-4", children: [_jsx(TextInput, { name: "email", value: selectedUser.email || "", onChange: handleUpdateInputChange, placeholder: "Email" }), _jsxs("select", { name: "role", value: selectedUser.role || "", onChange: (e) => setSelectedUser({
                                                ...selectedUser,
                                                role: e.target.value,
                                            }), className: "w-full rounded-xl border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Role" }), _jsx("option", { value: "super admin", children: "Super Admin" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsx("div", { className: "mt-4", children: _jsxs("select", { name: "status", value: selectedUser.status || "", onChange: (e) => setSelectedUser({
                                            ...selectedUser,
                                            status: e.target.value,
                                        }), className: "w-full rounded-lg border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Status" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "rejected", children: "Rejected" })] }) }), _jsx("div", { className: "mt-4", children: _jsxs("select", { name: "section", value: selectedUser.section || "", onChange: (e) => setSelectedUser({
                                            ...selectedUser,
                                            section: e.target.value,
                                        }), className: "w-full rounded-lg border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Section" }), _jsx("option", { value: "rice", children: "Rice" }), _jsx("option", { value: "corn", children: "Corn" }), _jsx("option", { value: "fishery", children: "Fishery" }), _jsx("option", { value: "high value", children: "High Value" })] }) }), _jsx("div", { className: "mt-4", children: _jsxs("select", { name: "sex", value: selectedUser.sex || "", onChange: (e) => setSelectedUser({
                                            ...selectedUser,
                                            sex: e.target.value,
                                        }), className: "w-full rounded-lg border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Sex" }), _jsx("option", { value: "male", children: "Male" }), _jsx("option", { value: "female", children: "Female" })] }) }), _jsxs("div", { className: "flex gap-5 mt-4", children: [_jsx(TextInput, { name: "password", value: selectedUser.password || "", onChange: handleUpdateInputChange, placeholder: "Password", type: "password" }), _jsx(TextInput, { name: "confirm_password", value: selectedUser.confirm_password || "", onChange: handleUpdateInputChange, placeholder: "Confirm Password", type: "password" })] }), _jsx("div", { className: "p-4 mt-4 border-t border-slate-300", children: _jsx(PrimaryButton, { type: "submit", children: "Submit" }) })] })] }) })), _jsx(Modal, { show: isModalOpen, maxWidth: "lg", onClose: closeModal, children: _jsxs("div", { className: "p-6", children: [_jsxs("h2", { className: "text-xl font-bold mb-4 flex gap-2", children: ["\uD83D\uDC66 Add New User", " "] }), _jsx("div", { className: "mt-4 ", children: _jsx("div", { className: "flex gap-5", children: _jsxs("div", { children: [_jsx("input", { type: "file", id: "pfp", name: "pfp", accept: "image/*", onChange: handleFileChange, className: "hidden", ref: fileInputRef }), _jsx("div", { className: "w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-300 hover:border-green-500 cursor-pointer", onClick: handlePreviewClick, children: preview ? (_jsx("img", { src: preview, alt: "Profile Preview", className: "object-cover w-full h-full" })) : (_jsx(DefaultAvatar, { width: "100%", height: "100%", className: "object-cover w-full h-full" })) })] }) }) }), _jsx("div", { className: "mt-4", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "flex gap-5", children: [_jsx(TextInput, { name: "firstname", value: newUser.firstname, onChange: handleInputChange, placeholder: "Firstname" }), _jsx(TextInput, { name: "lastname", value: newUser.lastname, onChange: handleInputChange, placeholder: "Lastname" }), _jsx("br", {})] }), _jsx("br", {}), _jsxs("div", { className: "flex gap-5", children: [_jsx(TextInput, { name: "email", value: newUser.email, onChange: handleInputChange, placeholder: "email" }), _jsxs("select", { name: "role", value: newUser.role, onChange: handleSelectChange, className: "w-full rounded-xl border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Role" }), _jsx("option", { value: "super admin", children: "Super Admin" }), _jsx("option", { value: "admin", children: "Admin" })] }), _jsx("br", {})] }), _jsxs("div", { children: [_jsxs("select", { name: "status", value: newUser.status, onChange: handleSelectChange, className: "mt-3 w-full rounded-lg border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Status" }), _jsx("option", { value: "approved", children: "approved" }), _jsx("option", { value: "pending", children: "pending" }), _jsx("option", { value: "rejected", children: "reject" })] }), _jsx("br", {})] }), _jsxs("div", { children: [_jsxs("select", { name: "section", value: newUser.section, onChange: handleSelectChange, className: "mt-3 w-full rounded-lg border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Section" }), _jsx("option", { value: "rice", children: "rice" }), _jsx("option", { value: "corn", children: "corn" }), _jsx("option", { value: "fishery", children: "fishery" }), _jsx("option", { value: "high value", children: "high value" })] }), _jsx("br", {})] }), _jsxs("div", { children: [_jsxs("select", { name: "sex", value: newUser.sex, onChange: handleSelectChange, className: "mt-3 w-full rounded-lg border-gray-300", children: [_jsx("option", { value: "", disabled: true, children: "Sex" }), _jsx("option", { value: "male", children: "male" }), _jsx("option", { value: "female", children: "female" })] }), _jsx("br", {})] }), _jsx("br", {}), _jsxs("div", { className: "flex gap-5", children: [_jsx(TextInput, { name: "password", value: newUser.password, onChange: handleInputChange, placeholder: "password", type: "password" }), _jsx(TextInput, { name: "confirm_password", value: newUser.confirm_password, onChange: handleInputChange, placeholder: "confirm password", type: "password" }), _jsx("br", {})] }), _jsx("div", { className: "p-4 mt-4 border-t border-slate-300", children: _jsx(PrimaryButton, { onClick: handleSubmit, children: "Submit" }) })] }) })] }) })] }));
};
export default UsersList;
