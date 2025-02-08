import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Label,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface DonutChartProps {
    data: {
        allocationType: string;
        demographic: string;
        sourceOfFund: string;
        value: number;
    }[];
    allocationTypes: string[];
    demographics: string[];
    sourcesOfFund: string[];
    colors: string[]; // Array of colors for each slice
}

const DonutChartTwo: React.FC<DonutChartProps> = ({
    data,
    allocationTypes,
    demographics,
    sourcesOfFund,
    colors,
}) => {
    // Inner Ring: Total values for allocation types
    const innerData = allocationTypes.map((allocationType) => ({
        name: allocationType,
        value: data
            .filter((item) => item.allocationType === allocationType)
            .reduce((acc, curr) => acc + curr.value, 0),
    }));

    // Outer Ring: Total values for demographic categories
    const outerData = demographics.map((demographic) => ({
        name: demographic,
        value: data
            .filter((item) => item.demographic === demographic)
            .reduce((acc, curr) => acc + curr.value, 0),
    }));

    // Super Outer Ring: Total values for sources of funds
    const superOuterData = sourcesOfFund.map((source) => ({
        name: source,
        value: data
            .filter((item) => item.sourceOfFund === source)
            .reduce((acc, curr) => acc + curr.value, 0),
    }));

    const renderPie = (
        data: { name: string; value: number }[],
        innerRadius: number,
        outerRadius: number
    ) => {
        return (
            <Pie
                data={data}
                dataKey="value"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={5}
                labelLine={false}
                label={({ name }) => name} // Show the name inside the slice
            >
                {data.map((entry, index) => (
                    <Cell
                        key={`cell-${index}`}
                        fill={colors[index % colors.length]} // Use color array
                    />
                ))}
            </Pie>
        );
    };

    return (
        <div className="w-full h-80 p-4 border rounded-lg shadow-lg bg-white">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    {/* Inner Ring: Allocation Types */}
                    {renderPie(innerData, 60, 80)}

                    {/* Outer Ring: Demographic Categories */}
                    {renderPie(outerData, 80, 100)}

                    {/* Super Outer Ring: Source of Funds */}
                    {renderPie(superOuterData, 100, 120)}

                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DonutChartTwo;
