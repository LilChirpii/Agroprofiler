import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import Card from "./Card";
import { PieChart } from "lucide-react";
export default function CommoditiesAnalytics() {
    return (_jsx("div", { className: "mb-4 grid lg:grid-cols-2 md:grid-cols-1 gap-4", id: "commodities", children: commodityCategoryDistribution?.map((category) => {
            const chartData = category.commodities.map((commodity) => ({
                name: commodity.commodity_name,
                value: commodity.commodity_total,
            }));
            return (_jsxs(Card, { title: category.commodity_category_name, className: "mb-1 capitalize", children: [_jsxs("h1", { className: "font-semibold text-xl text-green-600", children: ["Total:", " ", category.commodity_category_total.toLocaleString()] }), _jsxs("div", { children: [_jsx("div", { className: "p-4 border rounded-lg text-sm font-medium h-auto mb-4", children: _jsx("ul", { children: category.commodities.map((commodity) => (_jsxs("li", { className: "mb-2 flex justify-between", children: [_jsx("span", { className: "", children: commodity.commodity_name }), _jsx("span", { children: commodity.commodity_total })] }, commodity.commodity_name))) }) }), _jsx("div", { children: _jsx(PieChart, { data: chartData }) })] })] }, category.commodity_category_name));
        }) }));
}
