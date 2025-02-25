import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, } from "recharts";
const DEFAULT_COLORS = [
    "#3674B5",
    "#D84040",
    "#3D8D7A",
    "#EB5B00",
    "#FFB22C",
    "#B9B28A",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#FF4567",
    "#A28CF3",
];
const PieChart = ({ data, colors = DEFAULT_COLORS, }) => {
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains("dark"));
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains("dark"));
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { style: {
                    backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
                    color: isDarkMode ? "white" : "black",
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    boxShadow: isDarkMode
                        ? "0px 4px 10px rgba(255, 255, 255, 0.2)"
                        : "0px 4px 10px rgba(0, 0, 0, 0.2)",
                }, children: [_jsx("p", { style: {
                            margin: 0,
                            fontWeight: "semi-bold",
                            fontSize: "14px",
                        }, children: payload[0].name }), _jsxs("p", { style: { margin: 0, fontSize: "12px" }, children: ["Value: ", payload[0].value] })] }));
        }
        return null;
    };
    return (_jsx("div", { style: {
            width: "100%",
            maxWidth: "750px",
            margin: "0 auto",
            padding: "5px",
            flex: "wrap",
        }, children: _jsx(ResponsiveContainer, { width: "90%", height: 400, children: _jsxs(RechartsPieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "name", cx: "50%", cy: "50%", outerRadius: "70%", label: ({ name }) => name, children: data.map((entry, index) => (_jsx(Cell, { fill: colors[index % colors.length] }, `cell-${index}`))) }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Legend, { wrapperStyle: {
                            height: 50,
                            marginTop: 200,
                            padding: 10,
                            border: "1px",
                            textTransform: "capitalize",
                            fontSize: "12px",
                            borderRadius: "20px",
                        } })] }) }) }));
};
export default PieChart;
