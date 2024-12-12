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
    Delete,
    Edit,
    Eye,
    HouseIcon,
    Plus,
    Trash,
} from "lucide-react";
import Modal from "@/Components/Modal";

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

    const handleOpenModal = (type: string) => {
        setModalType(type);
        setFormData({});
        setModalOpen(true);
    };

    const handleSubmit = () => {
        // Logic to handle form submission (POST/PUT via Axios or Inertia)
        console.log("Submitting form data:", modalType, formData);
        setModalOpen(false);
    };

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
            <Head title="Farmer Profile" />
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
                    {/* Dynamically render form inputs based on modalType */}
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
                    <div>
                        <div className="grid grid-rows-3 gap-2">
                            <div className="flex gap-2">
                                <Briefcase size={20} />
                                <span className="inline mt-1 text-sm text-slate-700">
                                    Farmer
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Building size={20} />
                                <span className="inline mt-1 text-sm text-slate-700">
                                    {farmer.coop}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <span className="inline mt-1 text-sm text-slate-700">
                                    {farmer.pwd ===
                                    " <Accessibility size={22} /> yes"
                                        ? "PWD"
                                        : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Allocations Table */}
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
                    <table className="table-auto w-full text-left border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1">Allocation</th>
                                <th className="border px-2 py-1">
                                    Date Received
                                </th>
                                <th className="border px-2 py-1" colSpan={3}>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {farmer.allocations.length > 0 ? (
                                farmer.allocations.map((allocation, index) => (
                                    <tr key={index}>
                                        <td className="border px-2 py-1">
                                            {allocation.allocation_type
                                                ?.allocation_type || "N/A"}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {new Date(
                                                allocation.date_received
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <Edit size={24} />
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <Trash size={24} />
                                        </td>
                                        <td className="px-2 py-1 text-center">
                                            <Eye size={24} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="border px-2 py-1 text-center"
                                    >
                                        No allocations received
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>

                {/* Crop Damage Table */}
                <Card title="Crop Damages Experienced">
                    <div className="flex justify-end items-center mb-4">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded flex"
                            onClick={() => handleOpenModal("crop damages")}
                        >
                            <Plus size={24} />
                            Add Crop Damage
                        </button>
                    </div>
                    <table className="table-auto w-full text-left border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1">Cause</th>
                                <th className="border px-2 py-1">
                                    Total Damaged Area (ha)
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {farmer.crop_damages.length > 0 ? (
                                farmer.crop_damages.map((damage, index) => (
                                    <tr key={index}>
                                        <td className="border px-2 py-1">
                                            {damage.cause}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {damage.total_damaged_area}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="border px-2 py-1 text-center"
                                    >
                                        No damages recorded
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>

                {/* Farms Table */}
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
                    <table className="table-auto w-full text-left border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border px-2 py-1">Commodity</th>
                                <th className="border px-2 py-1">Hectares</th>
                                <th className="border px-2 py-1">Owner</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farmer.farms.length > 0 ? (
                                farmer.farms.map((farm, index) => (
                                    <tr key={index}>
                                        <td className="border px-2 py-1">
                                            {farm.commodity?.name}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {farm.ha}
                                        </td>
                                        <td className="border px-2 py-1">
                                            {farm.owner}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="border px-2 py-1 text-center"
                                    >
                                        No farms registered
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </Card>

                {/* Map Section */}
                <Card title="Farm Locations">
                    <MapContainer
                        center={[
                            farmer.farms[0]?.latitude || 0,
                            farmer.farms[0]?.longitude || 0,
                        ]}
                        zoom={13}
                        style={{
                            height: "400px",
                            width: "100%",
                            borderRadius: "20px",
                        }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {farmer.farms.map((farm, index) => (
                            <Marker
                                key={index}
                                position={[farm.latitude, farm.longitude]}
                            >
                                <Popup>
                                    <span>
                                        Commodity: {farm.commodity?.name}
                                        <br />
                                        Hectares: {farm.ha}
                                        <br />
                                        Owner: {farm.owner}
                                    </span>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </Card>
            </div>
        </Authenticated>
    );
}
