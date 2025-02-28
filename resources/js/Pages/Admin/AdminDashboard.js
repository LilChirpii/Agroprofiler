import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Head, router } from "@inertiajs/react";
import Card from "@/Components/Card";
import { useEffect, useState } from "react";
import PieChart from "@/Components/PieChart";
import Heatmap from "@/Components/Heatmap";
import axios from "axios";
import GroupedBarChart from "@/Components/GroupedBarChart";
import AdminLayout from "@/Layouts/AdminLayout";
export default function Dashboard({ auth, children, totalAllocations, commoditiesDistribution, registeredFarmers, unregisteredFarmers, totalFarmers, commodityCounts, allocationType, data, years, selectedYear, barangayData, heatmapData, highValueCounts, commodityCategories, }) {
    const [distributionType, setDistributionType] = useState("allocations");
    const validDistributionTypes = [
        "allocations",
        "commodityCategories",
        "farmers",
    ];
    const isValidDistributionType = (value) => {
        return validDistributionTypes.includes(value);
    };
    const [farmersData, setFarmersData] = useState(null);
    const [allocationsData, setAllocationsData] = useState(null);
    const [allocationsDistributionData, setAllocationsDistributionData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const subcategories = {
        farmers: ["all", "registered", "unregistered"],
    };
    const pieData = [
        { name: "Registered", value: registeredFarmers },
        { name: "Unregistered", value: unregisteredFarmers },
    ];
    const [geoData, setGeoData] = useState(null);
    const [distributionData, setDistributionData] = useState(null);
    const [farmersDistributionData, setFarmersDistributionData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/admin/api/farmers");
                const data = await response.json();
                setFarmersDistributionData(data);
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/admin/api/allocations");
                const data = await response.json();
                setAllocationsDistributionData(data);
            }
            catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
        fetchData();
    }, []);
    const [commodityCategoryDistribution, setCommodityCategoryDistribution] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/admin/commoditycategorycounts");
                const data = await response.json();
                setCommodityCategoryDistribution(data);
                console.log("commodity categories distribution: ", commodityCategoryDistribution);
            }
            catch (error) {
                console.error("Error fetching data: ", error);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const geoResponse = await axios.get("/Digos_City.geojson");
                setGeoData(geoResponse.data);
                const distributionResponse = await axios.get("/admin/dashboard");
                setDistributionData(distributionResponse.data);
            }
            catch (error) {
                console.error("Error fetching allocations data:", error);
            }
        };
        fetchData();
    }, []);
    const farmerCount = [
        { name: "Registered", value: registeredFarmers },
        { name: "Unregistered", value: unregisteredFarmers },
    ];
    const [yearss, setYears] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState("all");
    const months = [
        { value: "all", label: "All" },
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];
    const [currentYear, setCurrentYear] = useState(selectedYear);
    return (_jsxs(AdminLayout, { user: auth.user, header: _jsx("h2", { className: "text-[24px] block font-semibold text-green-600 leading-tight", children: "Dashboard" }), children: [_jsx(Head, { title: "Dashboard" }), _jsx("div", { className: "flex mb-5 gap-4 w-[100px]", children: _jsx("select", { value: currentYear, onChange: (e) => {
                        const year = e.target.value;
                        setCurrentYear(year);
                        router.get("/admin/dashboard", {
                            year: year === "All" ? "all" : year,
                        });
                    }, className: "rounded-[12px] focus:ring-green-600 focus:outline-none dark:text-white dark:focus:ring-green-400 dark:border-green-700 dark:border-[2px] p-2 px-4 dark:bg-[#0D1A25] text-[15px] w-[470px] cursor-pointer outline-none after:outline-none", children: years.map((year) => (_jsx("option", { value: year, className: "dark:text-white", children: year }, year))) }) }), _jsxs("div", { className: "", children: [_jsx("div", { className: "mb-4", id: "farmer", children: _jsxs("div", { className: "grid lg:grid-cols-2 md:grid-cols-1 gap-4", children: [_jsx(Card, { title: "Farmers Distribution", className: "w-50", children: _jsxs("div", { children: [_jsxs("div", { children: [_jsxs("h1", { className: "font-semibold text-2xl text-green-700", children: ["Total: ", totalFarmers.toLocaleString()] }), _jsxs("div", { className: "p-4 border rounded-lg text-sm font-medium h-auto", children: [_jsxs("span", { className: "flex justify-between text-sm dark:text-white", children: [_jsx("span", { children: "Registered" }), _jsx("span", { children: registeredFarmers.toLocaleString() })] }), _jsxs("span", { className: "flex justify-between text-sm dark:text-white", children: [_jsx("span", { children: "Unregistered" }), _jsx("span", { children: unregisteredFarmers.toLocaleString() })] })] })] }), _jsx("br", {}), _jsx("div", { children: _jsx(PieChart, { data: farmerCount }) })] }) }), _jsxs(Card, { title: "Allocations Distribution", className: "w-50", children: [_jsxs("h1", { className: "font-semibold text-2xl text-green-700", children: ["Total: ", totalAllocations.toLocaleString()] }), _jsx("div", { className: "p-4 border rounded-lg text-sm font-medium h-auto mb-4 text-[14px] dark:text-white", children: Array.isArray(data) && data.length > 0 ? (data.map((d, index) => (_jsxs("div", { className: "flex justify-between text-sm mb-2", children: [_jsx("span", { children: d.name }), _jsx("span", { children: d.value })] }, index)))) : (_jsx("p", { className: "text-gray-500", children: "No data available" })) }), _jsx("div", { children: _jsx(PieChart, { data: data }) })] })] }) }), _jsx("div", { className: "mb-4 grid lg:grid-cols-2 md:grid-cols-1 gap-4", id: "commodities", children: commodityCategoryDistribution?.map((category) => {
                            const chartData = category.commodities.map((commodity) => ({
                                name: commodity.commodity_name,
                                value: commodity.commodity_total,
                            }));
                            return (_jsxs(Card, { title: `${category.commodity_category_name} Distribution`, className: "mb-1 capitalize", children: [_jsxs("h1", { className: "font-semibold text-xl text-green-600", children: ["Total:", " ", category.commodity_category_total.toLocaleString()] }), _jsxs("div", { children: [_jsx("div", { className: "p-4 border rounded-lg text-sm font-medium h-auto mb-4 text-[14px]", children: _jsx("ul", { children: category.commodities.map((commodity) => (_jsxs("li", { className: "mb-2 flex justify-between dark:text-white", children: [_jsx("span", { className: "", children: commodity.commodity_name }), _jsx("span", { children: commodity.commodity_total.toLocaleString() })] }, commodity.commodity_name))) }) }), _jsx("div", { children: _jsx(PieChart, { data: chartData }) })] })] }, category.commodity_category_name));
                        }) }), _jsx("div", { className: "grid grid-flow-col grid-cols-1 mb-4", id: "geospatial", children: _jsx("div", { children: _jsx(Card, { title: "Map of Digos City, Davao del Sur", children: _jsx("div", { children: _jsx(Heatmap, { heatmapData: heatmapData, commodityCategories: commodityCategories, allocationType: allocationType }) }) }) }) }), _jsx("div", { children: _jsx(Card, { title: "Barangay Data Distribution", children: _jsxs("div", { children: [_jsx("div", { className: "p-5", children: _jsxs("select", { onChange: (e) => setDistributionType(e.target.value), className: "rounded-[12px] border-slate-500 w-[170px] dark:text-white mb-5 cursor-pointer dark:border-green-600 dark:bg-[#0D1A25] ", children: [_jsx("option", { value: "allocations", className: "dark:text-white", children: "Allocations" }), _jsx("option", { value: "farmers", className: "dark:text-white", children: "Farmers" }), commodityCategories.map((category) => (_jsx("option", { value: `commodity_categories_${category.name}`, className: "dark:text-white", children: category.name }, category.id)))] }) }), _jsx(GroupedBarChart, { data: heatmapData, distributionType: isValidDistributionType(distributionType)
                                            ? distributionType
                                            : "allocations" })] }) }) })] })] }));
}
