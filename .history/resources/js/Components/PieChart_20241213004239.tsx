import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface DataItem {
    name: string;
    value: number;
}

interface RechartsPieChartProps {
    data: DataItem[];
}

const RechartsPieChart: React.FC<RechartsPieChartProps> = ({ data }) => {
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4567"];

    return (
        <div style={{ width: "100%", height: "250px", position: "relative" }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        fill="#8884d8"
                        label={(entry) => entry.name}
                        isAnimationActive
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "lightsteelblue",
                            borderRadius: "5px",
                            fontSize: "8px",
                        }}
                        formatter={(value, name) => [`${value}`, `${name}`]}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <style>
                {`
                    .recharts-tooltip-wrapper {
                        pointer-events: none;
                    }
                `}
            </style>
        </div>
    );
};

export default RechartsPieChart;
