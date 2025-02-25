import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import Search from "@/Components/Search";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Edit2Icon, PlusIcon, Trash } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
export default function Images({ auth, images: initialImages, cropActivityId, }) {
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");
    axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Tracks if editing or adding
    const [selectedImageId, setSelectedImageId] = useState(null); // Tracks the ID of the image being edited
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [images, setImages] = useState(initialImages);
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
        else {
            setImagePreview(null);
        }
    };
    const openAddModal = () => {
        setIsEditing(false);
        setIsModalOpen(true);
        setTitle("");
        setDesc("");
        setImageFile(null);
        setImagePreview(null);
        setSelectedImageId(null);
    };
    const openEditModal = (id) => {
        const selectedImage = images.find((image) => image.id === id);
        if (selectedImage) {
            setIsEditing(true);
            setIsModalOpen(true);
            setSelectedImageId(id);
            setTitle(selectedImage.title);
            setDesc(selectedImage.desc);
            setImagePreview(selectedImage.file_path);
            setImageFile(null); // Reset file input to prevent overwriting unless a new file is selected
        }
        else {
            toast.error("Image not found for editing.");
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setTitle("");
        setDesc("");
        setImageFile(null);
        setImagePreview(null);
        setSelectedImageId(null);
    };
    const handleFormSubmit = async (event) => {
        event.preventDefault();
        if (!imageFile) {
            toast.error("No image selected.");
            return;
        }
        const formData = new FormData();
        // Append the cropActivityId to the form data
        formData.append("crop_activity_id", cropActivityId.toString()); // Make sure it's a string
        formData.append("image", imageFile);
        formData.append("title", title);
        formData.append("desc", desc);
        try {
            const response = await axios.post("/cropactivity/images/store", formData);
            // Check if the status code is within the successful range (2xx)
            if (response.status >= 200 && response.status < 300) {
                console.log("Response data:", response.data);
                if (response.data && response.data.image) {
                    if (isEditing) {
                        setImages((prevImages) => prevImages.map((img) => img.id === selectedImageId
                            ? response.data.image
                            : img));
                        toast.success("Image updated successfully!");
                    }
                    else {
                        setImages((prevImages) => [
                            ...prevImages,
                            response.data.image,
                        ]);
                        toast.success("Image uploaded successfully!");
                    }
                    closeModal();
                }
                else {
                    console.error("Unexpected response structure:", response.data);
                    toast.error("Failed to update/upload image.");
                }
            }
            else {
                console.error("Request failed with status:", response.status);
                toast.error("Failed to update/upload image.");
            }
        }
        catch (error) {
            console.error("Error during image upload:", error);
            toast.error("Failed to update/upload image.");
        }
    };
    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this image?")) {
            try {
                const csrfToken = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content");
                await fetch(`/images/${id}`, {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken || "",
                    },
                });
                setImages((prev) => prev.filter((img) => img.id !== id));
                toast.success("Image deleted successfully!");
            }
            catch (error) {
                console.error("Error deleting image:", error);
                toast.error("Failed to delete image.");
            }
        }
    };
    return (_jsxs(Authenticated, { user: auth.user, header: _jsx("h2", { className: "text-xl mt-2 text-gray-800 leading-tight", children: "Images Management" }), children: [_jsx(Head, { title: "Images Management" }), _jsx(ToastContainer, {}), _jsxs("div", { className: "flex justify-between mb-3", children: [_jsx(Search, { onSearch: () => { } }), _jsx(PrimaryButton, { className: "text-sm justify-center align-content-center rounded-lg text-white", onClick: openAddModal, children: _jsxs("span", { className: "flex gap-2", children: [_jsx(PlusIcon, { size: 18 }), "Add new"] }) })] }), _jsx("div", { className: "flex flex-wrap gap-5 mt-2", children: images.map((image) => (_jsxs("div", { className: "relative border border-slate-300 w-[200px] h-[100] rounded-2xl p-3", children: [_jsx("div", { className: "w-50 h-40", children: _jsx("img", { src: image.file_path, alt: image.title, className: "w-full h-full object-cover rounded-md" }) }), _jsxs("div", { className: "p-2", children: [_jsx("span", { className: "text-xs", children: image.title }), _jsx("br", {}), _jsx("span", { className: "text-xs", children: image.desc })] }), _jsxs("div", { className: "flex gap-4 ", children: [_jsx("button", { className: " text-red-500", onClick: () => handleDelete(image.id), children: _jsx(Trash, { size: 20 }) }), _jsx("button", { className: " text-green-500", onClick: () => openEditModal(image.id), children: _jsx(Edit2Icon, { size: 20 }) })] })] }, image.id))) }), _jsx(Modal, { show: isModalOpen, maxWidth: "lg", closeable: true, onClose: closeModal, children: _jsxs("div", { className: "p-6 text-center", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: isEditing ? "Edit Image" : "Upload New Image" }), _jsxs("form", { onSubmit: handleFormSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Title" }), _jsx("input", { type: "hidden", name: "crop_activity_id", value: cropActivityId }), _jsx("input", { type: "text", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", value: title, onChange: (e) => setTitle(e.target.value), required: true }), _jsx("label", { className: "block text-sm font-medium text-gray-700 mt-2", children: "Description" }), _jsx("input", { type: "text", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", value: desc, onChange: (e) => setDesc(e.target.value) })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Image" }), _jsx("input", { type: "file", accept: "image/*", className: "mt-1 block w-full", onChange: handleFileChange, required: !isEditing })] }), _jsxs("div", { className: "mb-4", children: [_jsx("h3", { className: "text-sm font-medium text-gray-700", children: "Preview:" }), imagePreview ? (_jsx("img", { src: imagePreview, alt: "Image Preview", className: "mt-2 w-full h-[150px] object-cover rounded-md border border-gray-300" })) : (_jsx("div", { className: "mt-2 w-full h-[150px] bg-gray-100 flex items-center justify-center rounded-md border border-gray-300", children: _jsx("span", { className: "text-gray-400", children: "No preview available" }) }))] }), _jsx(PrimaryButton, { className: "rounded-lg text-white", type: "submit", children: isEditing ? "Update Image" : "Upload Image" })] })] }) })] }));
}
