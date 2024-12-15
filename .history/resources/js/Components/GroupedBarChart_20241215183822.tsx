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
    console.log(data);

    const chartData = Object.keys(data).map((barangay) => {
        const entry = data[barangay];
        const rowData: any = { name: barangay };

        if (distributionType === "allocations" && entry.allocations) {
            Object.keys(entry.allocations).forEach((allocation) => {
                rowData[allocation] = entry.allocations?.[allocation] || 0;
            });
        }

        // Handle commodity categories
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

    return (
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
                        // Generate a random color for each distribution and subtype
                        const randomColor = generateRandomColor();

                        return (
                            <Bar
                                key={key}
                                dataKey={key}
                                barSize={20}
                                fill={randomColor} // Use the random color
                            />
                        );
                    }
                })}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default GroupedBarChart;
