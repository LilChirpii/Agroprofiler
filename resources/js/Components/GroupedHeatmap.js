import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, } from "recharts";
const GroupedHeatmap = ({ data, categories, allocationTypes, colorScale, }) => {
    return (_jsxs("div", { className: "w-full h-80 p-4 border rounded-lg shadow-lg bg-white", children: [_jsx("h2", { className: "text-center text-lg font-semibold mb-4", children: "Allocation Recipient By Allocation Type" }), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 10, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "category" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Legend, {}), allocationTypes.map((allocationType, index) => (_jsx(Bar, { dataKey: allocationType, name: allocationType, barSize: 30, fill: colorScale(index), children: data.map((entry, idx) => (_jsx(Cell, { fill: colorScale(entry[allocationType]) }, `cell-${idx}`))) }, index)))] }) })] }));
};
export default GroupedHeatmap;
