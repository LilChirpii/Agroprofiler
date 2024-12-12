import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Plus, Edit, Trash, Eye } from "lucide-react";
import Modal from "@/Components/Modal";
import Card from "@/Components/Card";
import { PageProps } from "@/types";

interface Allocation {
    id: number;
    allocation_type: {
        allocation_type: string;
    };
    date_received: string;
}

interface CropDamage {
    id: number;
    cause: string;
    total_damaged_area: number;
}

interface Farm {
    id: number;
    commodity: {
        name: string;
    };
    ha: number;
    owner: string;
}

interface Farmer {
    id: number;
    firstname: string;
    lastname: string;
    dob: string;
    status: string;
    barangay: {
        name: string;
    };
    allocations: Allocation[];
    crop_damages: CropDamage[];
    farms: Farm[];
}

interface FarmersListProps extends PageProps {
    farmer: Farmer;
}

export default function FarmProfile({ auth, farmer }: FarmersListProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // "allocation", "damage", or "farm"
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [cropDamages, setCropDamages] = useState<CropDamage[]>([]);
    const [farms, setFarms] = useState<Farm[]>([]);

    const handleOpenModal = (type: string, data?: any) => {
        setModalType(type);
        setFormData(data || {});
        setModalOpen(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/data/farmprofile/${farmer.id}`);
            setAllocations(response.data.allocations);
            setCropDamages(response.data.damages);
            setFarms(response.data.farmer.farms);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const createOrUpdateData = async () => {
        setLoading(true);
        try {
            const method = formData.id ? "put" : "post";
            const url = formData.id
                ? `/data/farmprofile/${farmer.id}/${modalType}/${formData.id}`
                : `/data/farmprofile/${farmer.id}/${modalType}`;
            await axios[method](url, formData);
            fetchData(); // Refresh data
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving data:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteData = async (id: number) => {
        setLoading(true);
        try {
            await axios.delete(
                `/data/farmprofile/${farmer.id}/${modalType}/${id}`
            );
            fetchData(); // Refresh data
        } catch (error) {
            console.error("Error deleting data:", error);
        } finally {
            setLoading(false);
        }
    };

    const allocationColumns: GridColDef[] = [
        { field: "id", headerName: "#", width: 50 },
        {
            field: "allocation_type",
            headerName: "Allocation",
            width: 200,
            valueGetter: (value, row) => row.allocation_type.allocation_type,
        },
        { field: "date_received", headerName: "Date Received", width: 180 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
                    <Edit
                        size={20}
                        onClick={() =>
                            handleOpenModal("allocation", params.row)
                        }
                    />
                    <Trash
                        size={20}
                        onClick={() => deleteData(params.row.id)}
                    />
                    <Eye size={20} />
                </div>
            ),
        },
    ];

    const damageColumns: GridColDef[] = [
        { field: "cause", headerName: "Cause", width: 250 },
        {
            field: "total_damaged_area",
            headerName: "Damaged Area (ha)",
            width: 250,
        },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
                    <Edit
                        size={20}
                        onClick={() => handleOpenModal("damage", params.row)}
                    />
                    <Trash
                        size={20}
                        onClick={() => deleteData(params.row.id)}
                    />
                    <Eye size={20} />
                </div>
            ),
        },
    ];

    const farmColumns: GridColDef[] = [
        { field: "commodity", headerName: "Commodity", width: 200 },
        { field: "ha", headerName: "Hectares", width: 150 },
        { field: "owner", headerName: "Owner", width: 200 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: (params) => (
                <div className="flex justify-evenly">
                    <Edit
                        size={20}
                        onClick={() => handleOpenModal("farm", params.row)}
                    />
                    <Trash
                        size={20}
                        onClick={() => deleteData(params.row.id)}
                    />
                    <Eye size={20} />
                </div>
            ),
        },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <Card title="List of Allocations Received">
                <div className="flex justify-end items-center mb-4">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded flex"
                        onClick={() => handleOpenModal("allocation")}
                    >
                        <Plus size={24} />
                        Add Allocation
                    </button>
                </div>
                <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={allocations.map((allocation, index) => ({
                            id: allocation.id,
                            allocation_type: allocation.allocation_type,
                            date_received: new Date(
                                allocation.date_received
                            ).toLocaleDateString(),
                        }))}
                        columns={allocationColumns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                    />
                </div>
            </Card>

            <Card title="Crop Damages Experienced">
                <div className="flex justify-end items-center mb-4">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded flex"
                        onClick={() => handleOpenModal("damage")}
                    >
                        <Plus size={24} />
                        Add Crop Damage
                    </button>
                </div>
                <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={cropDamages.map((damage, index) => ({
                            id: damage.id,
                            cause: damage.cause,
                            total_damaged_area: damage.total_damaged_area,
                        }))}
                        columns={damageColumns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                    />
                </div>
            </Card>

            <Card title="List of Farms">
                <div className="flex justify-end items-center mb-4">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded flex"
                        onClick={() => handleOpenModal("farm")}
                    >
                        <Plus size={24} />
                        Add Farm
                    </button>
                </div>
                <div style={{ height: 400, width: "100%" }}>
                    <DataGrid
                        rows={farms.map((farm, index) => ({
                            id: farm.id,
                            commodity: farm.commodity.name,
                            ha: farm.ha,
                            owner: farm.owner,
                        }))}
                        columns={farmColumns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                    />
                </div>
            </Card>

            {/* Modal Component for Add/Edit */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                {/* Modal content based on modalType */}
                {/* Add form fields for allocation, damage, or farm depending on modalType */}
            </Modal>
        </div>
    );
}
