import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
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
import { Edit, Edit2Icon, Plus, Trash, Trash2 } from "lucide-react";
import PrimaryButton from "@/Components/PrimaryButton";

interface AllocationTypeRow {
    id: number;
    name: string;
    desc: string;
    allocation_type_id: string;
    allocation_type_commodities: string[];
    allocation_type_barangays: string[];
    allocation_type_elligibilities: string[];
    allocation_type_crop_damage_causes: string[]; // Add this line
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
    const [selectedAllocation, setSelectedAllocation] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [updateOodalOpen, setUpdateModalOpen] = useState(false);
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

            setCommodities(commoditiesResponse.data);
            setBarangays(barangaysResponse.data);
            setCropDamages(cropDamagesResponse.data);
            setEligibilities(eligibilitiesResponse.data);
        } catch (error) {
            console.error("Failed to fetch data: ", error);
            toast.error("Failed to fetch data.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (
        event: React.ChangeEvent<HTMLSelectElement>,
        key: string
    ) => {
        const value = event.target.value;
        setFormData((prevData) => ({
            ...prevData,
            [key]: typeof value === "string" ? value.split(",") : value,
        }));
    };

    const resetFormData = () => {
        setFormData({
            name: "",
            desc: "",
            commodityIds: [],
            barangayIds: [],
            cropDamageCauseIds: [],
            eligibilityIds: [],
        });
    };

    const handleSubmit = async () => {
        console.log("FormData being sent: ", formData);
        try {
            await axios.post("/allocation/store", formData);
            console.log("FormData being sent: ", formData);
            toast.success("Allocation type added successfully!");
            setModalOpen(false);
            resetFormData();
            fetchData();
        } catch (error: any) {
            // Use `any` if you are unsure of the structure
            console.error(error.response?.data || error.message);
            toast.error("Failed to add allocation type.");
        }
    };

    const rows: AllocationTypeRow[] = (allocationTypes || []).map(
        (type, index) => ({
            id: Number(type.allocation_type_id) || index, // Ensure id is a number
            name: type.name,
            desc: type.desc || "No description available",

            // Map commodities to a string if they exist
            commodities:
                Array.isArray(type.allocation_type_commodities) &&
                type.allocation_type_commodities.length > 0
                    ? type.allocation_type_commodities
                          .map((c: { name: string }) => c.name)
                          .join(", ")
                    : "Not Commodity Specific",

            // Map barangays to a string
            barangays:
                Array.isArray(type.allocation_type_barangays) &&
                type.allocation_type_barangays.length > 0
                    ? type.allocation_type_barangays
                          .map(
                              (b: { barangay_name: string }) => b.barangay_name
                          )
                          .join(", ")
                    : "Not Barangay Specific",

            // Map crop damage causes to a string
            allocation_type_crop_damage_causes:
                Array.isArray(type.allocation_type_crop_damage_causes) &&
                type.allocation_type_crop_damage_causes.length > 0
                    ? type.allocation_type_crop_damage_causes
                          .map(
                              (d: { crop_damage_cause_name: string }) =>
                                  d.crop_damage_cause_name
                          )
                          .join(", ")
                    : "Not Crop Damage Cause Specific",

            // Map eligibilities to a string
            elligibilities:
                Array.isArray(type.allocation_type_elligibilities) &&
                type.allocation_type_elligibilities.length > 0
                    ? type.allocation_type_elligibilities
                          .map(
                              (e: { elligibility_type: string }) =>
                                  e.elligibility_type
                          )
                          .join(", ")
                    : "No eligibility specified",
        })
    );

    // const handleUpdate = async (allocationId: number) => {
    //     try {
    //         const updatedData = {
    //             name: formData.name,
    //             desc: formData.desc,
    //             barangays: formData.barangayIds,
    //             commodities: formData.commodityIds,
    //             crop_damage_causes: formData.cropDamageCauseIds,
    //             eligibilities: formData.eligibilityIds,
    //         };

    //         const response = await axios.put(
    //             `/allocation/${selectedAllocation.allocation_type_id}`,
    //             updatedData
    //         );

    //         toast.success("Allocation type updated successfully!");
    //         setModalOpen(false); // Close the modal
    //         fetchData(); // Refresh data
    //     } catch (error) {
    //         if (error instanceof AxiosError) {
    //             console.error(error.response?.data || error.message);
    //         } else {
    //             console.error(error);
    //         }
    //         toast.error("Failed to update allocation type.");
    //     }
    // };

    const handleEdit = (allocationId: number) => {
        const allocation = allocationTypes.find(
            (item) => item.allocation_type_id === allocationId
        );

        if (allocation) {
            setSelectedAllocation(allocation);
            setFormData({
                name: allocation.name || "", // Ensure that name is set
                desc: allocation.desc || "", // Ensure that description is set
                commodityIds:
                    allocation.allocation_type_commodities?.map(
                        (c: { id: number }) => c.id
                    ) || [], // Default to empty array if undefined
                barangayIds:
                    allocation.allocation_type_barangays?.map(
                        (b: { id: number }) => b.id
                    ) || [], // Default to empty array if undefined
                cropDamageCauseIds:
                    allocation.allocation_type_crop_damage_causes?.map(
                        (d: { id: number }) => d.id
                    ) || [], // Default to empty array if undefined
                eligibilityIds:
                    allocation.allocation_type_elligibilities?.map(
                        (e: { id: number }) => e.id
                    ) || [], // Default to empty array if undefined
            });
            setModalOpen(true); // Open the modal to show the form
        }
    };

    const handleDelete = async (allocationTypeId: number) => {
        try {
            // Make API call to delete the allocation type
            const response = await axios.delete(
                `/allocation/destroy/${allocationTypeId}`
            );
            toast.success("Allocation type deleted successfully!");
            fetchData(); // Refresh the list after deletion
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.response?.data || error.message);
            } else {
                console.error(error);
            }
            toast.error("Failed to delete allocation type.");
        }
    };

    const columns: GridColDef[] = [
        { field: "id", headerName: "#", flex: 2 },
        { field: "name", headerName: "Name", flex: 2 },
        { field: "desc", headerName: "Description", flex: 2 },
        { field: "commodity", headerName: "Commodities", flex: 2 },
        { field: "barangays", headerName: "Barangays", flex: 2 },
        {
            field: "allocation_type_crop_damage_causes",
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
                    {/* Edit button */}
                    <Button
                        size="small"
                        onClick={() => handleEdit(params.row.id)}
                    >
                        <Edit size={24} />
                    </Button>

                    {/* Delete button */}
                    <Button
                        size="small"
                        color="secondary"
                        onClick={() => handleDelete(params.row.id)}
                    >
                        <Trash2 size={24} />
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
                <PrimaryButton onClick={() => setModalOpen(true)}>
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
                            <InputLabel>Select Eligible Commodities</InputLabel>
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
                                <MenuItem value="all">
                                    <Checkbox
                                        checked={
                                            formData.commodityIds.length ===
                                            commodities.length
                                        }
                                        onChange={() => {
                                            const isAllSelected =
                                                formData.commodityIds.length ===
                                                commodities.length;
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                commodityIds: isAllSelected
                                                    ? []
                                                    : commodities.map(
                                                          (c) => c.id
                                                      ),
                                            }));
                                        }}
                                    />
                                    <ListItemText primary="All" />
                                </MenuItem>

                                <MenuItem value={0}>
                                    <Checkbox
                                        checked={formData.commodityIds.includes(
                                            0
                                        )}
                                        onChange={(e) => {
                                            const selectedIds = [
                                                ...formData.commodityIds,
                                            ];
                                            if (e.target.checked) {
                                                selectedIds.push(0);
                                            } else {
                                                const index =
                                                    selectedIds.indexOf(0);
                                                if (index > -1) {
                                                    selectedIds.splice(
                                                        index,
                                                        1
                                                    );
                                                }
                                            }
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                commodityIds: selectedIds,
                                            }));
                                        }}
                                    />
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
                                            onChange={(e) => {
                                                const selectedIds = [
                                                    ...formData.commodityIds,
                                                ];
                                                if (e.target.checked) {
                                                    selectedIds.push(
                                                        commodity.id
                                                    );
                                                } else {
                                                    const index =
                                                        selectedIds.indexOf(
                                                            commodity.id
                                                        );
                                                    if (index > -1) {
                                                        selectedIds.splice(
                                                            index,
                                                            1
                                                        );
                                                    }
                                                }
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    commodityIds: selectedIds,
                                                }));
                                            }}
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
                            <InputLabel>Select Eligible Barangays</InputLabel>
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
                                <MenuItem value="all">
                                    <Checkbox
                                        checked={
                                            formData.barangayIds.length ===
                                            barangays.length
                                        }
                                        onChange={() => {
                                            const isAllSelected =
                                                formData.barangayIds.length ===
                                                barangays.length;
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                barangayIds: isAllSelected
                                                    ? []
                                                    : barangays.map(
                                                          (b) => b.id
                                                      ),
                                            }));
                                        }}
                                    />
                                    <ListItemText primary="All" />
                                </MenuItem>

                                <MenuItem value={0}>
                                    <Checkbox
                                        checked={formData.barangayIds.includes(
                                            0
                                        )}
                                        onChange={(e) => {
                                            const selectedIds = [
                                                ...formData.barangayIds,
                                            ];
                                            if (e.target.checked) {
                                                selectedIds.push(0);
                                            } else {
                                                const index =
                                                    selectedIds.indexOf(0);
                                                if (index > -1) {
                                                    selectedIds.splice(
                                                        index,
                                                        1
                                                    );
                                                }
                                            }
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                barangayIds: selectedIds,
                                            }));
                                        }}
                                    />
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
                                            onChange={(e) => {
                                                const selectedIds = [
                                                    ...formData.barangayIds,
                                                ];
                                                if (e.target.checked) {
                                                    selectedIds.push(
                                                        barangay.id
                                                    );
                                                } else {
                                                    const index =
                                                        selectedIds.indexOf(
                                                            barangay.id
                                                        );
                                                    if (index > -1) {
                                                        selectedIds.splice(
                                                            index,
                                                            1
                                                        );
                                                    }
                                                }
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    barangayIds: selectedIds,
                                                }));
                                            }}
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
                                Select Eligible Crop Damage Cause
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
                                <MenuItem value="all">
                                    <Checkbox
                                        checked={
                                            formData.cropDamageCauseIds
                                                .length === cropDamages.length
                                        }
                                        onChange={() => {
                                            const isAllSelected =
                                                formData.cropDamageCauseIds
                                                    .length ===
                                                cropDamages.length;
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                cropDamageCauseIds:
                                                    isAllSelected
                                                        ? []
                                                        : cropDamages.map(
                                                              (c) => c.id
                                                          ),
                                            }));
                                        }}
                                    />
                                    <ListItemText primary="All" />
                                </MenuItem>

                                <MenuItem value={0}>
                                    <Checkbox
                                        checked={formData.cropDamageCauseIds.includes(
                                            0
                                        )}
                                        onChange={(e) => {
                                            const selectedIds = [
                                                ...formData.cropDamageCauseIds,
                                            ];
                                            if (e.target.checked) {
                                                selectedIds.push(0);
                                            } else {
                                                const index =
                                                    selectedIds.indexOf(0);
                                                if (index > -1) {
                                                    selectedIds.splice(
                                                        index,
                                                        1
                                                    );
                                                }
                                            }
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                cropDamageCauseIds: selectedIds,
                                            }));
                                        }}
                                    />
                                </MenuItem>

                                {cropDamages.map((damage) => (
                                    <MenuItem key={damage.id} value={damage.id}>
                                        <Checkbox
                                            checked={formData.cropDamageCauseIds.includes(
                                                damage.id
                                            )}
                                            onChange={(e) => {
                                                const selectedIds = [
                                                    ...formData.cropDamageCauseIds,
                                                ];
                                                if (e.target.checked) {
                                                    selectedIds.push(damage.id);
                                                } else {
                                                    const index =
                                                        selectedIds.indexOf(
                                                            damage.id
                                                        );
                                                    if (index > -1) {
                                                        selectedIds.splice(
                                                            index,
                                                            1
                                                        );
                                                    }
                                                }
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    cropDamageCauseIds:
                                                        selectedIds,
                                                }));
                                            }}
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
                            <InputLabel>Select Eligible Farmers</InputLabel>
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
                                <MenuItem value="all">
                                    <Checkbox
                                        checked={
                                            formData.eligibilityIds.length ===
                                            eligibilities.length
                                        }
                                        onChange={() => {
                                            // Check if "All" is currently selected
                                            const isAllSelected =
                                                formData.eligibilityIds
                                                    .length ===
                                                eligibilities.length;
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                eligibilityIds: isAllSelected
                                                    ? []
                                                    : eligibilities.map(
                                                          (e) => e.id
                                                      ),
                                            }));
                                        }}
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
                                            onChange={(e) => {
                                                const selectedIds = [
                                                    ...formData.eligibilityIds,
                                                ];
                                                if (e.target.checked) {
                                                    selectedIds.push(
                                                        eligibility.id
                                                    );
                                                } else {
                                                    const index =
                                                        selectedIds.indexOf(
                                                            eligibility.id
                                                        );
                                                    if (index > -1) {
                                                        selectedIds.splice(
                                                            index,
                                                            1
                                                        );
                                                    }
                                                }
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    eligibilityIds: selectedIds,
                                                }));
                                            }}
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
                        <PrimaryButton onClick={handleSubmit}>
                            Save
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </Authenticated>
    );
}
