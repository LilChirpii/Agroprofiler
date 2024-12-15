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
            const rowDetails: any = { name: row.name };
            let total = 0;

            if (distributionType === "commodityCategories") {
                Object.keys(row).forEach((key) => {
                    if (key !== "name") {
                        const count = row[key] || 0;
                        rowDetails[key] = count;
                        total += count;
                    }
                });
            }
            rowDetails["Total"] = total;
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
            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
            >
                View Table Report
            </Button>

            {/* Modal for displaying the table report */}
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
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Barangay</TableCell>
                                    <TableCell>Subcategories</TableCell>
                                    <TableCell>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.name}</TableCell>
                                        <TableCell>
                                            {Object.keys(row)
                                                .filter(
                                                    (key) =>
                                                        key !== "name" &&
                                                        key !== "Total"
                                                )
                                                .map((key) => (
                                                    <div key={key}>
                                                        {key}: {row[key]}
                                                    </div>
                                                ))}
                                        </TableCell>
                                        <TableCell>{row.Total}</TableCell>
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
