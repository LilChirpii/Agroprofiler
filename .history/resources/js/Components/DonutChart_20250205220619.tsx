import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
} from "recharts";

interface DonutChartProps {
    data: { name: string; value: number }[];
    colors?: string[];
    title?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
    data,
    colors = ["#3B82F6", "#6366F1"],
    title,
}) => {
    return (
        <div className="w-full h-[330px] p-4 border rounded-lg shadow-lg bg-white">
            {title && (
                <h2 className="text-center text-lg font-semibold mb-2">
                    {title}
                </h2>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name }) => name}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                        wrapperStyle={{
                            height: 50,
                            marginTop: 200,
                            padding: 10,
                            textTransform: "capitalize",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DonutChart;
