import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Search from "@/Components/Search";
import PrimaryButton from "@/Components/PrimaryButton";
import Modal from "@/Components/Modal";
import { PencilIcon, PlusIcon, Trash } from "lucide-react";
export default function CropActivityFolder({ auth }) {
    const { props } = usePage();
    const initialFolders = props.initialFolders ?? [];
    const [folders, setFolders] = useState(initialFolders);
    const [filteredFolders, setFilteredFolders] = useState(initialFolders);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [editingFolderId, setEditingFolderId] = useState(null);
    useEffect(() => {
        setFilteredFolders(folders);
    }, [folders]);
    const openModal = (folder) => {
        setIsModalOpen(true);
        if (folder) {
            setEditingFolderId(folder.id);
            setTitle(folder.title || "");
            setDate(folder.date || "");
        }
        else {
            setEditingFolderId(null);
            setTitle("");
            setDate("");
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFolderId(null);
        setTitle("");
        setDate("");
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedDate = date
            ? new Date(date).toISOString().split("T")[0]
            : null;
        const payload = { title, date: formattedDate };
        if (editingFolderId) {
            // Update existing folder
            router.patch(`/cropactivity/update/${editingFolderId}`, payload, {
                onSuccess: (response) => {
                    toast.success("Folder updated successfully!");
                    window.location.reload();
                },
                onError: () => {
                    toast.error("Failed to update folder.");
                },
            });
        }
        else {
            // Add new folder
            router.post("/cropactivity/store", payload, {
                onSuccess: (response) => {
                    toast.success("Folder added successfully!");
                    window.location.reload();
                },
                onError: () => {
                    toast.error("Failed to add folder.");
                },
            });
        }
    };
    const handleView = (id) => {
        router.visit(`/cropactivity/images/${id}`);
        console.log("folder id:", id);
    };
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this folder?")) {
            router.delete(`/cropactivity/destroy/${id}`, {
                onSuccess: () => {
                    setFolders(folders.filter((folder) => folder.id !== id));
                    toast.success("Folder deleted successfully!");
                },
                onError: () => {
                    toast.error("Failed to delete folder.");
                },
            });
        }
    };
    const handleSearch = (query) => {
        const lowerCaseQuery = query.toLowerCase();
        setFilteredFolders(folders.filter((folder) => folder.title.toLowerCase().includes(lowerCaseQuery)));
    };
    return (_jsxs(Authenticated, { user: auth.user, header: _jsx("h2", { className: "text-xl mt-2 text-gray-800 leading-tight", children: "Crop Activity Management" }), children: [_jsx(Head, { title: "Crop Activity Management" }), _jsx(ToastContainer, {}), _jsxs("div", { className: "flex justify-between mb-3", children: [_jsx(Search, { onSearch: handleSearch }), _jsx(PrimaryButton, { className: "text-sm justify-center align-content-center rounded-lg text-white", onClick: () => openModal(), children: _jsxs("span", { className: "flex gap-2", children: [_jsx(PlusIcon, { size: 18 }), "Add new"] }) })] }), _jsxs("span", { className: "mt-5 text-sm text-slate-400", children: ["Total: ", filteredFolders.length] }), _jsx("div", { className: "flex flex-wrap gap-5 mt-2", children: filteredFolders.map((folder) => folder ? (_jsxs("div", { className: "flex justify-between border border-slate-300 w-[300px] h-[45px] rounded-2xl p-3 cursor-pointer", onClick: () => handleView(folder.id), children: [_jsx("div", { className: "border-b border-slate-300 mb-2", children: _jsx("p", { className: "text-sm font-semibold text-slate-600", children: folder.title }) }), _jsx("div", { className: "text-xs text-slate-500 mb-2", children: _jsx("span", { children: folder.date
                                    ? new Date(folder.date).toLocaleDateString()
                                    : "No date provided" }) }), _jsxs("div", { className: "b-0 flex gap-3", children: [_jsx("button", { className: "text-xs text-red-500 mt-auto", onClick: (e) => {
                                        e.stopPropagation();
                                        handleDelete(folder.id);
                                    }, children: _jsx(Trash, { size: 20 }) }), _jsx("button", { className: "text-xs text-green-500 mt-auto", onClick: (e) => {
                                        e.stopPropagation();
                                        openModal(folder);
                                    }, children: _jsx(PencilIcon, { size: 20 }) })] })] }, folder.id)) : null) }), _jsx(Modal, { show: isModalOpen, maxWidth: "lg", closeable: true, onClose: closeModal, children: _jsxs("div", { className: "p-6 text-center", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: editingFolderId
                                ? "Edit Crop Activity"
                                : "Add New Crop Activity" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Title" }), _jsx("input", { type: "text", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", value: title, onChange: (e) => setTitle(e.target.value), required: true })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Date" }), _jsx("input", { type: "date", className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm", value: date, onChange: (e) => setDate(e.target.value), required: true })] }), _jsxs("div", { className: "flex justify-end", children: [_jsx("button", { type: "button", className: "bg-gray-500 text-white px-4 py-2 rounded mr-2", onClick: closeModal, children: "Cancel" }), _jsx("button", { type: "submit", className: "bg-blue-500 text-white px-4 py-2 rounded", children: editingFolderId ? "Update" : "Add" })] })] })] }) })] }));
}
