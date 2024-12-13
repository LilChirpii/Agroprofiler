import React from "react";
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface PieChartProps {
    data: { name: string; value: number }[];
}

const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF4567",
    "#A28CF3",
];

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    return (
        <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
            {title && <h3 className="text-center mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        fill="#8884d8"
                        label={({ name }) => name}
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
                            fontSize: "12px",
                        }}
                        formatter={(value) => `${value}`}
                    />
                    <Legend />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChart;
