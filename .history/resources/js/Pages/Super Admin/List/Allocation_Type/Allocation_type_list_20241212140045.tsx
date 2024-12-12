import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Modal,
    Button,
    TextField,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    InputLabel,
    FormControl,
    SelectChangeEvent,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { Edit2Icon, Plus, Trash } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";

interface AllocationTypeRow {
    id: number;
    name: string;
    desc: string;
    commodities: string;
    barangays: string;
    cropDamageCauses: string;
    elligibilities: string;
}

interface Commodity {
    id: number;
    name: string;
}

interface Barangay {
    id: number;
    name: string;
}

interface CropDamage {
    id: number;
    cause: string;
}

interface Eligibility {
    id: number;
    name: string;
}

export default function AllocationTypeList({ auth }: PageProps) {
    const [allocationTypes, setAllocationTypes] = useState<AllocationTypeRow[]>(
        []
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState<{
        id?: number; // Allow id to be optional
        name: string;
        desc: string;
        commodityIds: number[];
        barangayIds: number[];
        cropDamageCauseIds: number[];
        eligibilityIds: number[];
    }>({
        name: "",
        desc: "",
        commodityIds: [],
        barangayIds: [],
        cropDamageCauseIds: [],
        eligibilityIds: [],
    });

    const [commodities, setCommodities] = useState<Commodity[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [cropDamages, setCropDamages] = useState<CropDamage[]>([]);
    const [eligibilities, setEligibilities] = useState<Eligibility[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetching allocation types
            const allocationTypesResponse = await axios.get<
                AllocationTypeRow[]
            >("/allocation-types-list");
            if (
                allocationTypesResponse.status === 200 &&
                Array.isArray(allocationTypesResponse.data)
            ) {
                setAllocationTypes(allocationTypesResponse.data);
            } else {
                console.error(
                    "Invalid response data: ",
                    allocationTypesResponse.data
                );
            }

            // Fetching other data
            const commoditiesResponse = await axios.get<Commodity[]>(
                "/commodities"
            );
            const barangaysResponse = await axios.get<Barangay[]>("/barangays");
            const cropDamagesResponse = await axios.get<CropDamage[]>(
                "/crop-damages-causes"
            );
            const eligibilitiesResponse = await axios.get<Eligibility[]>(
                "/eligibilities"
            );

            // Set the state with the fetched data
            setCommodities(commoditiesResponse.data);
            setBarangays(barangaysResponse.data);
            setCropDamages(cropDamagesResponse.data);
            setEligibilities(eligibilitiesResponse.data);
        } catch (error) {
            console.error("Failed to fetch data: ", error);
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false); // Data is now loaded
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = <T extends keyof typeof formData>(
        e: SelectChangeEvent<number[]>,
        field: T
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: e.target.value as (typeof formData)[T],
        }));
    };

    const handleSubmit = async () => {
        try {
            await axios.post("/api/allocation-types", formData);
            toast.success("Allocation type added successfully!");
            setModalOpen(false);
            setFormData({
                name: "",
                desc: "",
                commodityIds: [],
                barangayIds: [],
                cropDamageCauseIds: [],
                eligibilityIds: [],
            });
            fetchData();
        } catch (error) {
            toast.error("Failed to add allocation type.");
        }
    };

    const rows: AllocationTypeRow[] = (allocationTypes || []).map(
        (type, index) => ({
            id: Number(type.id) || index, // Force `id` to be a number
            name: type.name,
            desc: type.desc || "No description available",
            commodities: Array.isArray(type.commodities)
                ? type.commodities
                      .map((c: { name: string }) => c.name)
                      .join(", ")
                : "Not Commodity Specific",
            barangays: Array.isArray(type.barangays)
                ? type.barangays.map((b: { name: string }) => b.name).join(", ")
                : "Not Barangay Specific",
            cropDamageCauses: Array.isArray(type.cropDamageCauses)
                ? type.cropDamageCauses
                      .map((d: { cause: string }) => d.cause)
                      .join(", ")
                : "Not Crop Damage Cause Specific",
            elligibilities: Array.isArray(type.elligibilities)
                ? type.elligibilities
                      .map((e: { name: string }) => e.name)
                      .join(", ")
                : "No eligibility specified",
        })
    );

    const handleEdit = async (id: number) => {
        try {
            const response = await axios.get(`/allocation-types/${id}`);
            const data = response.data;
            setFormData({
                id: data.id,
                name: data.name,
                desc: data.desc,
                commodityIds: data.commodities.map((c: { id: number }) => c.id),
                barangayIds: data.barangays.map((b: { id: number }) => b.id),
                cropDamageCauseIds: data.cropDamageCauses.map(
                    (d: { id: number }) => d.id
                ),
                eligibilityIds: data.elligibilities.map(
                    (e: { id: number }) => e.id
                ),
            });
            setModalOpen(true);
        } catch (error) {
            toast.error("Failed to fetch allocation type details.");
        }
    };

    const handleDelete = (id: number) => console.log("Delete:", id);

    const columns: GridColDef[] = [
        { field: "name", headerName: "Name", flex: 2 },
        { field: "desc", headerName: "Description", flex: 2 },
        { field: "commodities", headerName: "Commodities", flex: 2 },
        { field: "barangays", headerName: "Barangays", flex: 2 },
        {
            field: "crop_damage_cause_name",
            headerName: "Crop Damage Causes",
            flex: 2,
        },
        { field: "elligibilities", headerName: "Eligibilities", flex: 2 },
        {
            field: "actions",
            headerName: "Actions",
            align: "center",
            flex: 2.5,
            renderCell: (params) => (
                <>
                    <Button
                        size="small"
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <Edit2Icon size={18} />
                    </Button>
                    <Button
                        size="small"
                        color="secondary"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        <Trash size={18} />
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl mt-2 text-gray-800 leading-tight">
                    Allocation Type Management
                </h2>
            }
        >
            <Head title="Allocation Type Management" />
            <ToastContainer />

            <div className="p-6 bg-white border-b border-gray-200">
                <PrimaryButton
                    // variant="contained"
                    // color="primary"
                    onClick={() => setModalOpen(true)}
                >
                    <Plus size={24} />
                    Add Allocation Type
                </PrimaryButton>

                <div
                    style={{
                        height: 450,
                        width: "100%",
                        borderRadius: "10rem",
                    }}
                    className="mt-4"
                >
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[5, 10, 20]}
                        checkboxSelection={false}
                        disableRowSelectionOnClick
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                            },
                        }}
                        sx={{
                            "& .MuiDataGrid-columnHeaders": {
                                backgroundColor: "#f5f5f5",
                            },
                            padding: "15px",
                            borderRadius: "1.5rem",
                        }}
                    />
                </div>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <div className="p-6 bg-white rounded shadow-md max-w-lg mx-auto mt-10">
                    <h3 className="text-lg font-bold mb-4">
                        Add Allocation Type
                    </h3>

                    <div>
                        <TextField
                            label="Allocation Type Name"
                            name="name"
                            fullWidth
                            onChange={handleInputChange}
                            className="mb-4"
                        />
                    </div>

                    <br />

                    <div>
                        <TextField
                            label="Description"
                            name="desc"
                            fullWidth
                            multiline
                            rows={3}
                            onChange={handleInputChange}
                            className="mb-4"
                        />
                    </div>

                    <br />
                    <div>
                        <FormControl fullWidth className="mb-4">
                            <InputLabel>Is this Commodity Specific?</InputLabel>
                            <Select
                                multiple
                                value={formData.commodityIds}
                                onChange={(e) =>
                                    handleSelectChange(e, "commodityIds")
                                }
                                renderValue={(selected) =>
                                    (selected as number[])
                                        .map(
                                            (id) =>
                                                commodities.find(
                                                    (item) => item.id === id
                                                )?.name
                                        )
                                        .join(", ")
                                }
                            >
                                <MenuItem value={0}>
                                    <Checkbox
                                        checked={formData.commodityIds.includes(
                                            0
                                        )}
                                    />
                                    <ListItemText primary="NO" />
                                </MenuItem>
                                {commodities.map((commodity) => (
                                    <MenuItem
                                        key={commodity.id}
                                        value={commodity.id}
                                    >
                                        <Checkbox
                                            checked={formData.commodityIds.includes(
                                                commodity.id
                                            )}
                                        />
                                        <ListItemText
                                            primary={commodity.name}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <br />
                    <div>
                        <FormControl fullWidth className="mb-4">
                            <InputLabel>Is this barangay specific?</InputLabel>
                            <Select
                                multiple
                                value={formData.barangayIds}
                                onChange={(e) =>
                                    handleSelectChange(e, "barangayIds")
                                }
                                renderValue={(selected) =>
                                    (selected as number[])
                                        .map(
                                            (id) =>
                                                barangays.find(
                                                    (item) => item.id === id
                                                )?.name
                                        )
                                        .join(", ")
                                }
                            >
                                <MenuItem value={0}>
                                    <Checkbox
                                        checked={formData.barangayIds.includes(
                                            0
                                        )}
                                    />
                                    <ListItemText primary="NO" />
                                </MenuItem>
                                {barangays.map((barangay) => (
                                    <MenuItem
                                        key={barangay.id}
                                        value={barangay.id}
                                    >
                                        <Checkbox
                                            checked={formData.barangayIds.includes(
                                                barangay.id
                                            )}
                                        />
                                        <ListItemText primary={barangay.name} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <br />
                    <div>
                        <FormControl fullWidth className="mb-4">
                            <InputLabel>
                                Is this Crop Damage Cause specific?
                            </InputLabel>
                            <Select
                                multiple
                                value={formData.cropDamageCauseIds}
                                onChange={(e) =>
                                    handleSelectChange(e, "cropDamageCauseIds")
                                }
                                renderValue={(selected) =>
                                    (selected as number[])
                                        .map(
                                            (id) =>
                                                cropDamages.find(
                                                    (item) => item.id === id
                                                )?.cause
                                        )
                                        .join(", ")
                                }
                            >
                                <MenuItem value={0}>
                                    <Checkbox
                                        checked={formData.cropDamageCauseIds.includes(
                                            0
                                        )}
                                    />
                                    <ListItemText primary="NO" />
                                </MenuItem>
                                {cropDamages.map((damage) => (
                                    <MenuItem key={damage.id} value={damage.id}>
                                        <Checkbox
                                            checked={formData.cropDamageCauseIds.includes(
                                                damage.id
                                            )}
                                        />
                                        <ListItemText primary={damage.cause} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>

                    <br />

                    <div>
                        <FormControl fullWidth className="mb-4">
                            <InputLabel>Select Eligible farmers</InputLabel>
                            <Select
                                multiple
                                value={formData.eligibilityIds}
                                onChange={(e) =>
                                    handleSelectChange(e, "eligibilityIds")
                                }
                                renderValue={(selected) =>
                                    (selected as number[])
                                        .map(
                                            (id) =>
                                                eligibilities.find(
                                                    (item) => item.id === id
                                                )?.name
                                        )
                                        .join(", ")
                                }
                            >
                                <MenuItem
                                    value="all"
                                    onClick={() =>
                                        setFormData((prevState) => ({
                                            ...prevState,
                                            eligibilityIds: eligibilities.map(
                                                (e) => e.id
                                            ),
                                        }))
                                    }
                                >
                                    <Checkbox
                                        checked={
                                            formData.eligibilityIds.length ===
                                            eligibilities.length
                                        }
                                    />
                                    <ListItemText primary="All" />
                                </MenuItem>
                                {eligibilities.map((eligibility) => (
                                    <MenuItem
                                        key={eligibility.id}
                                        value={eligibility.id}
                                    >
                                        <Checkbox
                                            checked={formData.eligibilityIds.includes(
                                                eligibility.id
                                            )}
                                        />
                                        <ListItemText
                                            primary={eligibility.name}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <br />
                    <div>
                        <PrimaryButton
                            // variant="contained"
                            // color="primary"
                            // fullWidth
                            onClick={handleSubmit}
                        >
                            Save
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </Authenticated>
    );
}
