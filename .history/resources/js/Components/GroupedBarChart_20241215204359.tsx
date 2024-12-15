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
        commodities_categories?: {
            [subtype: string]: { [subcategory: string]: number };
        };
        farmers?: { [subtype: string]: number };
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
            distributionType === "commodity_categories" &&
            entry.commodities_categories
        ) {
            Object.keys(entry.commodities_categories).forEach((category) => {
                rowData[category] = entry.commodities_categories[category] || 0;

                // Add individual commodities under each category
                entry.commodities.forEach((categoryData) => {
                    if (categoryData.commodities_category_name === category) {
                        categoryData.commodities.forEach((commodity) => {
                            rowData[`${category} - ${commodity.name}`] =
                                commodity.count;
                        });
                    }
                });
            });
        }

        if (distributionType === "farmers" && entry.farmers) {
            Object.keys(entry.farmers).forEach((farmerType) => {
                rowData[farmerType] = entry.farmers?.[farmerType] || 0;
            });
        }

        return rowData;
    });

    const handleOpenModal = () => {
        const tableData = chartData.map((row) => {
            const rowDetails: any = { name: row.name, total: 0 };

            if (distributionType === "commodity_categories") {
                Object.keys(row).forEach((key) => {
                    if (key !== "name" && key !== "total") {
                        rowDetails[key] = row[key];
                        rowDetails.total += row[key]; // Sum up values for the total column
                    }
                });
            }

            return rowDetails;
        });
        setSelectedData(tableData);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    return (
        <div>
            <PrimaryButton onClick={handleOpenModal}>
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

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box sx={{ p: 4 }}>
                    <h2>Table Report: {distributionType}</h2>
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
                                    {Object.keys(row).map((key) =>
                                        key !== "name" && key !== "total" ? (
                                            <TableCell key={key}>
                                                {row[key]}
                                            </TableCell>
                                        ) : null
                                    )}
                                    <TableCell>{row.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Button onClick={handleCloseModal}>Close</Button>
                </Box>
            </Modal>
        </div>
    );
};

export default GroupedBarChart;
