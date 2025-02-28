import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
const Histogram = ({ data, title, color = "#F59E0B", }) => {
    return (_jsxs("div", { className: "w-full h-[25rem] p-4 border rounded-lg shadow-lg bg-white", children: [title && (_jsx("h2", { className: "text-center text-lg font-semibold mb-2", children: title })), _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(BarChart, { data: data, margin: { top: 10, right: 30, left: 0, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "ageRange" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "count", fill: color })] }) })] }));
};
export default Histogram;
