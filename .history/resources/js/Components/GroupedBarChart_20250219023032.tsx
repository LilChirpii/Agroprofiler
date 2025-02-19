import React from "react";
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

type HeatmapData = {
    [barangay: string]: {
        allocations?: { [subtype: string]: { count: number; amount: number } };
        commodities_categories?: {
            [subcategory: string]: { [commodity: string]: number };
        };
        farmers?: { [subtype: string]: number };
    };
};

interface GroupedBarChartProps {
    data: HeatmapData;
    distributionType: "allocations" | "commodityCategories" | "farmers";
}

const generateRandomColor = () => {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

const GroupedBarChart: React.FC<GroupedBarChartProps> = ({
    data,
    distributionType,
}) => {
    if (!data || Object.keys(data).length === 0) {
        console.warn("GroupedBarChart: Data is empty or invalid", data);
        return <div>No data available</div>;
    }

    const chartData = Object.keys(data).map((barangay) => {
        const entry = data[barangay] ?? {};
        const rowData: Record<string, number | string> = { name: barangay };

        if (distributionType === "allocations" && entry.allocations) {
            Object.entries(entry.allocations).forEach(
                ([allocationType, details]) => {
                    rowData[allocationType] = details.count || 0;
                }
            );
        }

        if (
            distributionType === "commodityCategories" &&
            entry.commodities_categories
        ) {
            Object.entries(entry.commodities_categories).forEach(
                ([category, subtypes]) => {
                    if (subtypes && typeof subtypes === "object") {
                        Object.entries(subtypes).forEach(
                            ([commodity, count]) => {
                                rowData[`${category} - ${commodity}`] =
                                    count || 0;
                            }
                        );
                    }
                }
            );
        }
        console.log(`Processed rowData for ${barangay}:`, rowData);

        console.log("commodity categories: ", entry.commodities_categories);

        if (distributionType === "farmers" && entry.farmers) {
            rowData["Registered Farmers"] = entry.farmers["Registered"] || 0;
            rowData["Unregistered Farmers"] =
                entry.farmers["Unregistered"] || 0;
        }

        return rowData;
    });

    console.log(chartData);

    const barKeys = Array.from(
        new Set(chartData.flatMap((item) => Object.keys(item)))
    ).filter((key) => key !== "name");

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
                        height={60}
                        tick={{ fontSize: 10 }}
                    />
                    <Legend
                        wrapperStyle={{
                            height: 50,
                            marginTop: 20,
                            padding: 10,
                            textTransform: "capitalize",
                            fontSize: "14px",
                        }}
                    />
                    <YAxis tick={{ fontSize: 14 }} />
                    <Tooltip />
                    {barKeys.map((key) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            barSize={10}
                            fill={generateRandomColor()}
                            radius={[20, 20, 0, 0]}
                        />
                    ))}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GroupedBarChart;
