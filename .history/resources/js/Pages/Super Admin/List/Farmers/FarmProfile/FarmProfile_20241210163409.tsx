import Card from "@/Components/Card";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head, Link } from "@inertiajs/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import {
    Accessibility,
    Briefcase,
    Building,
    Cake,
    ChevronLeft,
    Edit,
    Eye,
    HouseIcon,
    Plus,
    Trash,
} from "lucide-react";
import Modal from "@/Components/Modal";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";

interface Farm {
    id: number;
    commodity: {
        name: string;
    };
    ha: number;
    owner: string;
    latitude: number;
    longitude: number;
}

interface Allocation {
    allocation_type: {
        id: number;
        allocation_type: string;
    };
    date_received: string;
}

interface CropDamage {
    cause: string;
    total_damaged_area: number;
}

interface Farmer {
    id: number;
    firstname: string;
    lastname: string;
    age: number;
    sex: string;
    status: string;
    coop: string;
    pwd: string;
    barangay: {
        id: number;
        name: string;
    };
    "4ps"?: string;
    dob: string;
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

    const handleOpenModal = (type: string) => {
        setModalType(type);
        setFormData({});
        setModalOpen(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/commodity-categories-show");
            setCommodities(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        // Logic to handle form submission (POST/PUT via Axios or Inertia)
        console.log("Submitting form data:", modalType, formData);
        setModalOpen(false);
    };

    const allocationColumns: GridColDef[] = [
        {
            field: "id",
            headerName: "#",
            width: 50,
        },
        {
            field: "allocation_type",
            headerName: "Allocation",
            width: 200,
            valueGetter: (value, row) => {
                row.allocations?.allocation_type_id;
            },
        },
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
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight ">
                    <Link href="/farmers">
                        <span className="flex mb-4">
                            <ChevronLeft size={24} /> Back
                        </span>{" "}
                    </Link>
                </h2>
            }
        >
            <Head
                title={`${farmer.firstname} ${farmer.lastname} - ${farmer.id}`}
            />

            <Modal show={modalOpen} onClose={() => setModalOpen(false)}>
                <form
                    className="p-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                >
                    <h2 className="text-lg font-semibold mb-4">
                        {modalType === "allocation"
                            ? "Add Allocation"
                            : modalType === "damage"
                            ? "Add Crop Damage"
                            : "Add Farm"}
                    </h2>
                    <div className="mb-4">
                        <label
                            htmlFor="field"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Field Name
                        </label>
                        <input
                            type="text"
                            name="field"
                            id="field"
                            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    field: e.target.value,
                                })
                            }
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </form>
            </Modal>

            <div className="grid grid-rows-1 gap-2">
                <div className="grid grid-flow-col grid-cols-2 gap-2 p-5 rounded-[1rem] shadow-sm">
                    {/* Farmer Profile Content */}
                    <div className="col-span-1 grid grid-flow-col grid-cols-3 gap-1 border-r-1">
                        <div className="col-span-2 grid grid-flow-row grid-rows-3">
                            <div>
                                <span className="text-lg text-slate-700">
                                    {farmer.firstname} {farmer.lastname}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] bg-green-800 text-white rounded-[2rem] px-2 py-1">
                                    {farmer.status}
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Cake size={20} />
                                <span className="inline mt-1 text-sm text-slate-700">
                                    {new Date(farmer.dob).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <HouseIcon size={20} />
                                <span className="text-sm mt-1 flex-wrap w-[250px] text-slate-700">
                                    {farmer.barangay.name}, Davao del Sur
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Other profile information */}
                </div>

                {/* Allocations Table using DataGrid */}
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
                            rows={farmer.allocations.map(
                                (allocation, index) => ({
                                    id: index,
                                    allocation_type:
                                        allocation.allocation_type
                                            ?.allocation_type || "N/A",
                                    date_received: new Date(
                                        allocation.date_received
                                    ).toLocaleDateString(),
                                })
                            )}
                            columns={allocationColumns}
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
                    </div>
                </Card>

                {/* Crop Damage Table using DataGrid */}
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
                            rows={farmer.crop_damages.map((damage, index) => ({
                                id: index,
                                cause: damage.cause,
                                total_damaged_area: damage.total_damaged_area,
                            }))}
                            columns={damageColumns}
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
                            rows={farmer.farms.map((farm, index) => ({
                                id: index,
                                commodity: farm.commodity?.name,
                                ha: farm.ha,
                                owner: farm.owner,
                            }))}
                            columns={farmColumns}
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
                    </div>
                </Card>

                <MapContainer
                    center={[6.9769, 125.3261]}
                    zoom={13}
                    style={{ height: "400px", width: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[6.9769, 125.3261]}>
                        <Popup>
                            {farmer.firstname} {farmer.lastname}'s Farm
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </Authenticated>
    );
}
