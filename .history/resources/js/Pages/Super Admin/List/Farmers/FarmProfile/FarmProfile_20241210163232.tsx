import React, { useState } from "react";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Plus, Edit, Trash, Eye } from "lucide-react";
import Card from "@/Components/Card";
import Modal from "@/Components/Modal";
import { Link } from "@inertiajs/react";

interface Allocation {
    id: number;
    allocation_type: string;
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

interface FarmProfileProps {
    farmer: Farmer;
    damages: CropDamage[];
    allocations: Allocation[];
}

const FarmProfile = ({ farmer, damages, allocations }: FarmProfileProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState<any>({});

    const handleOpenModal = (type: string) => {
        setModalType(type);
        setFormData({});
        setModalOpen(true);
    };

    const allocationColumns: GridColDef[] = [
        { field: "id", headerName: "#", width: 50 },
        { field: "allocation_type", headerName: "Allocation", width: 200 },
        { field: "date_received", headerName: "Date Received", width: 180 },
        {
            field: "actions",
            headerName: "Actions",
            width: 150,
            renderCell: () => (
                <div className="flex justify-evenly">
                    <Edit size={20} />
                    <Trash size={20} />
                    <Eye size={20} />
                </div>
            ),
        },
    ];

    const damageColumns: GridColDef[] = [
        { field: "cause", headerName: "Cause", width: 250 },
        {
            field: "total_damaged_area",
            headerName: "Total Damaged Area (ha)",
            width: 250,
        },
    ];

    const farmColumns: GridColDef[] = [
        { field: "commodity", headerName: "Commodity", width: 200 },
        { field: "ha", headerName: "Hectares", width: 150 },
        { field: "owner", headerName: "Owner", width: 200 },
    ];

    return (
        <div>
            {/* Farmer Profile and Tables */}
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
                        rows={allocations.map((allocation) => ({
                            id: allocation.id,
                            allocation_type: allocation.allocation_type,
                            date_received: new Date(
                                allocation.date_received
                            ).toLocaleDateString(),
                        }))}
                        columns={allocationColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        components={{ Toolbar: GridToolbar }}
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
                        rows={damages.map((damage) => ({
                            id: damage.id,
                            cause: damage.cause,
                            total_damaged_area: damage.total_damaged_area,
                        }))}
                        columns={damageColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        components={{ Toolbar: GridToolbar }}
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
                        rows={farmer.farms.map((farm) => ({
                            id: farm.id,
                            commodity: farm.commodity.name,
                            ha: farm.ha,
                            owner: farm.owner,
                        }))}
                        columns={farmColumns}
                        pageSize={5}
                        rowsPerPageOptions={[5, 10, 20]}
                        components={{ Toolbar: GridToolbar }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default FarmProfile;
