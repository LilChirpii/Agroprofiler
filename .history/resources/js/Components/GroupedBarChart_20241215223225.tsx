import React, { useState } from "react";
import {
    ResponsiveContainer,
    ComposedChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
} from "recharts";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

type Commodity = {
    name: string;
    count: number;
};

type CommodityCategory = {
    commodities_category_name: string;
    commodities: Commodity[];
};

type BarangayData = {
    allocations?: Record<string, number>;
    commodities_categories?: Record<string, number>;
    commodities?: CommodityCategory[];
};

type GroupedBarChartProps = {
    data: Record<string, BarangayData>;
    distributionType: "allocations" | "commodityCategories";
};

const generateRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
    data,
    distributionType,
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null
    );

    // Extract commodity categories from data
    const commodityCategories = Object.keys(data).reduce(
        (categories: string[], barangay) => {
            const entry = data[barangay];
            entry.commodities?.forEach((category) => {
                if (!categories.includes(category.commodities_category_name)) {
                    categories.push(category.commodities_category_name);
                }
            });
            return categories;
        },
        []
    );

    const handleCategoryChange = (
        event: React.ChangeEvent<{ value: unknown }>
    ) => {
        setSelectedCategory(event.target.value as string);
    };

    const chartData = Object.keys(data || {}).map((barangay) => {
        const entry = data[barangay];
        const rowData: any = { name: barangay };

        if (distributionType === "commodityCategories" && entry?.commodities) {
            entry.commodities.forEach((category) => {
                if (
                    !selectedCategory ||
                    category.commodities_category_name === selectedCategory
                ) {
                    category.commodities.forEach((commodity) => {
                        rowData[commodity.name] = commodity.count;
                    });
                }
            });
        }

        return rowData;
    });

    return (
        <div>
            {/* Dropdown for Commodity Categories */}
            {distributionType === "commodityCategories" && (
                <FormControl fullWidth>
                    <InputLabel>Commodity Categories</InputLabel>
                    <Select
                        value={selectedCategory || ""}
                        onChange={handleCategoryChange}
                        label="Commodity Categories"
                    >
                        <MenuItem value="">
                            <em>All</em>
                        </MenuItem>
                        {commodityCategories.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            {/* Render Chart */}
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
                    {Object.keys(chartData[0] || {}).map((key) => {
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
        </div>
    );
};

export default GroupedBarChart;
