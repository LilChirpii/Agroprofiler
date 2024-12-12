import CheckBoxDropDown from "@/Components/CheckBoxDropDown";
import InputLabel from "@/Components/InputLabel";
import List from "@/Components/List";
import Modal from "@/Components/Modal";
import PrimaryButton from "@/Components/PrimaryButton";
import Search from "@/Components/Search";
import TextInput from "@/Components/TextInput";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { PlusIcon } from "lucide-react";
import React, { FormEventHandler, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Commodity {
    id: number;
    name: string;
    desc: string;
}

export interface PaginatedCommodity {
    data: Commodity[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
    next_page_url: string | null;
    prev_page_url: string | null;
}

interface CommodityProps extends PageProps {
    commodity: PaginatedCommodity;
}

export default function Commodities({ auth, commodity }: CommodityProps) {
    const commodityData = commodity?.data || [];
    const columns = ["id", "name", "desc"];
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCommodity, setSelectedCommodity] =
        useState<Commodity | null>(null);

    const rows = commodityData.map((commodity: Commodity) => ({
        id: commodity.id,
        name: commodity.name,
        desc: commodity?.desc,
    }));

    console.log("commodities: ", commodity);

    const [filteredRows, setFilteredRows] = useState(rows);

    const handleSearch = (query: string) => {
        const lowerCaseQuery = query.toLowerCase();
        const filteredData = rows.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(lowerCaseQuery)
            )
        );
        setFilteredRows(filteredData);
    };

    const itemsPerPage = 20;
    const totalItems = commodity?.total || 0;

    const handlePageChange = async (page: number) => {
        setCurrentPage(page);
        try {
            const response = await axios.get(`/commodity?page=${page}`, {
                headers: {
                    "X-Inertia": true,
                    Accept: "application/json",
                },
            });

            const paginatedActivities = response.data;
            if (paginatedActivities && paginatedActivities.data) {
                const updatedRows = paginatedActivities.data.map(
                    (commodity: Commodity) => ({
                        id: commodity.id,
                        name: commodity.name,
                        desc: commodity.desc,
                    })
                );

                setFilteredRows(updatedRows);
            }
        } catch (error) {
            console.error("Error fetching paginated data:", error);
        }
    };

    const handleView = (commodity: Commodity) => {
        router.visit(`/farmprofile/${commodity.id}`);
    };

    const handleEdit = (commodity: Commodity) => {
        setSelectedCommodity(commodity);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleDelete = async (commodity: Commodity) => {
        if (window.confirm("Are you sure you want to delete this commodity?")) {
            try {
                await router.delete(`/commodity/destroy/${commodity.id}`);
                toast.success("Commodity deleted successfully", {
                    draggable: true,
                    closeOnClick: true,
                });
            } catch (error) {
                toast.error("Failed to delete commodity");
            }
        }
    };

    const handleUpdate: FormEventHandler = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/commodity/update/${selectedCommodity?.id}`, {
                name: selectedCommodity?.name,
                desc: selectedCommodity?.desc,
            });
            toast.success("Commodity updated successfully");
            closeEditModal();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(
                    `Failed to update commodity: ${error.response.statusText}`
                );
            } else {
                toast.error("Failed to update commodity");
            }
        }
    };

    const [newCommodity, setNewCommodity] = useState({
        name: "",
        desc: "",
    });

    const openModal = (): void => {
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCommodity({
            ...newCommodity,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();

        if (!newCommodity.name) {
            toast.error("Name field cannot be empty");
            return;
        }

        console.log("Commodity data before sending:", newCommodity);

        try {
            await axios.post("/commodities/store", newCommodity, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            toast.success("Commodity added successfully");
            closeModal();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                toast.error(
                    `Failed to add commodity: ${
                        error.response.data.message || "Validation error"
                    }`
                );
            } else {
                toast.error("Failed to add commodity");
            }
        }
    };

    const handleUpdateInputChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!selectedCommodity) return;
        setSelectedCommodity({
            ...selectedCommodity,
            [e.target.name]: e.target.value,
        } as Commodity);
    };

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
            <div className="flex justify-between mb-3">
                <div className="flex gap-5">
                    <Search onSearch={handleSearch} />
                </div>
                <div className="flex gap-5">
                    <PrimaryButton
                        className="text-sm justify-center align-content-center rounded-lg text-white"
                        onClick={openModal}
                    >
                        <span className="flex gap-2">
                            <PlusIcon size={18} />
                            Add new
                        </span>
                    </PrimaryButton>
                </div>
            </div>

            <span className="text-sm text-slate-300">
                Total commodities: {totalItems}
            </span>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="p-4">
                    <div className="p-2 border-b-[1px] border-slate-300 mb-2">
                        <h2 className="text-lg">🌾 Add New Commodity</h2>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-5">
                            <TextInput
                                name="name"
                                value={newCommodity.name}
                                onChange={handleInputChange}
                                placeholder="Commodity Name"
                            />

                            <TextInput
                                name="desc"
                                value={newCommodity.desc}
                                onChange={handleInputChange}
                                placeholder="Description"
                            />
                        </div>

                        <div className="p-4 mt-4 border-t border-slate-300">
                            <PrimaryButton type="submit">Submit</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            <div>
                <List
                    columns={columns}
                    rows={filteredRows}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                />
            </div>

            {selectedCommodity && (
                <Modal show={isEditModalOpen} onClose={closeEditModal}>
                    <div className="p-4">
                        <div className="p-2 border-b-[1px] border-slate-300 mb-4">
                            <h2 className="text-lg mb-2">Edit Commodity</h2>
                        </div>

                        <form onSubmit={handleUpdate}>
                            <div className="flex gap-5 mb-4">
                                <div>
                                    <InputLabel
                                        value="Commodity Name"
                                        htmlFor="commodityName"
                                    />
                                    <TextInput
                                        name="name"
                                        value={selectedCommodity.name}
                                        onChange={handleUpdateInputChange}
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        value="Description"
                                        htmlFor="description"
                                    />
                                    <TextInput
                                        name="desc"
                                        value={selectedCommodity.desc}
                                        onChange={handleUpdateInputChange}
                                    />
                                </div>
                            </div>
                            <div className="p-4 mt-4 border-t border-slate-300">
                                <PrimaryButton type="submit">
                                    Update Commodity
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </Authenticated>
    );
}
