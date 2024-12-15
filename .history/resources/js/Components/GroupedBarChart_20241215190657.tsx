import React, { useState } from "react";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    Button,
    Modal,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import PrimaryButton from "./PrimaryButton";

type HeatmapData = {
    [barangay: string]: {
        allocations?: { [subtype: string]: number };
        commodityCategories?: {
            [category: string]: {
                name: string;
                subcategories: { name: string; count: number }[];
            };
        };
        farmers?: { [subtype: string]: number };
        highValue?: { [subtype: string]: number };
    };
};

interface GroupedBarChartProps {
    data: HeatmapData;
    distributionType:
        | "allocations"
        | "commodityCategories"
        | "farmers"
        | "highValue";
}

const generateRandomColor = () => {
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    return randomColor;
};

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
    data,
    distributionType,
}) => {
    const [openModal, setOpenModal] = useState(false);
    const [selectedData, setSelectedData] = useState<any[]>([]); // Store data for the modal

    const chartData = Object.keys(data).map((barangay) => {
        const entry = data[barangay];
        const rowData: any = { name: barangay };

        if (distributionType === "allocations" && entry.allocations) {
            Object.keys(entry.allocations).forEach((allocation) => {
                rowData[allocation] = entry.allocations?.[allocation] || 0;
            });
        }

        if (
            distributionType === "commodityCategories" &&
            entry.commodityCategories
        ) {
            Object.keys(entry.commodityCategories).forEach((category) => {
                const categoryData = entry.commodityCategories?.[category];
                categoryData?.subcategories.forEach((subcategory) => {
                    rowData[`${category} - ${subcategory.name}`] =
                        subcategory.count || 0;
                });
            });
        }

        if (distributionType === "farmers" && entry.farmers) {
            Object.keys(entry.farmers).forEach((farmerType) => {
                rowData[farmerType] = entry.farmers?.[farmerType] || 0;
            });
        }

        if (distributionType === "highValue" && entry.highValue) {
            Object.keys(entry.highValue).forEach((highValueType) => {
                rowData[highValueType] = entry.highValue?.[highValueType] || 0;
            });
        }

        return rowData;
    });

    // Function to open modal and set data for the selected distribution type
    const handleOpenModal = () => {
        const tableData = chartData.map((row) => {
            const rowDetails: any = { name: row.name, total: 0 };
            const subcategories: string[] = [];

            if (distributionType === "commodityCategories") {
                Object.keys(row).forEach((key) => {
                    if (key !== "name" && key !== "total") {
                        rowDetails[key] = row[key];
                        subcategories.push(key);
                        rowDetails.total += row[key]; // Sum up values for the total column
                    }
                });
            }

            if (distributionType === "farmers") {
                Object.keys(row).forEach((key) => {
                    if (key !== "name" && key !== "total") {
                        rowDetails[key] = row[key];
                        subcategories.push(key);
                        rowDetails.total += row[key]; // Sum up values for the total column
                    }
                });
            }

            if (distributionType === "allocations") {
                Object.keys(row).forEach((key) => {
                    if (key !== "name" && key !== "total") {
                        rowDetails[key] = row[key];
                        subcategories.push(key);
                        rowDetails.total += row[key]; // Sum up values for the total column
                    }
                });
            }

            if (distributionType === "highValue") {
                Object.keys(row).forEach((key) => {
                    if (key !== "name" && key !== "total") {
                        rowDetails[key] = row[key];
                        subcategories.push(key);
                        rowDetails.total += row[key]; // Sum up values for the total column
                    }
                });
            }

            return rowDetails;
        });
        setSelectedData(tableData);
        setOpenModal(true);
    };

    // Close the modal
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <div>
            <PrimaryButton
                className="fixed index-20 flex top-[15rem] left-[100rem] "
                onClick={handleOpenModal}
            >
                View Table Report
            </PrimaryButton>
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                    <CartesianGrid stroke="#f5f5f5" />
                    <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        interval={0}
                        tick={{ fontSize: 10 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {Object.keys(chartData[0]).map((key) => {
                        if (key !== "name") {
                            const randomColor = generateRandomColor();
                            return (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    barSize={20}
                                    fill={randomColor}
                                />
                            );
                        }
                    })}
                </ComposedChart>
            </ResponsiveContainer>

            <Modal
                open={openModal}
                onClose={handleCloseModal}
                aria-labelledby="table-report-modal"
                aria-describedby="table-report-modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 800,
                        bgcolor: "background.paper",
                        border: "2px solid #000",
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <h2 id="table-report-modal">
                        Table Report: {distributionType}
                    </h2>
                    <TableContainer
                        component={Paper}
                        sx={{ maxHeight: 400, overflowY: "auto" }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Barangay</TableCell>
                                    {selectedData.length > 0 &&
                                        Object.keys(selectedData[0])
                                            .filter(
                                                (key) =>
                                                    key !== "name" &&
                                                    key !== "total"
                                            )
                                            .map((key) => (
                                                <TableCell key={key}>
                                                    {key}
                                                </TableCell>
                                            ))}
                                    <TableCell>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.name}</TableCell>
                                        {Object.keys(row).map(
                                            (key) =>
                                                key !== "name" &&
                                                key !== "total" && (
                                                    <TableCell key={key}>
                                                        {row[key]}
                                                    </TableCell>
                                                )
                                        )}
                                        <TableCell>{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Button onClick={handleCloseModal}>Close</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default GroupedBarChart;
