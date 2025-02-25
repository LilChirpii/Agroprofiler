import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Select } from "antd";
import BoxPlot from "./GroupedBarChart";
const DistributionMap = ({ geoJsonData }) => {
    const [selectedDistribution, setSelectedDistribution] = useState("commodities");
    const [distributionData, setDistributionData] = useState([]);
    const handleDistributionChange = (value) => {
        setSelectedDistribution(value);
        fetchDistributionData(value);
    };
    const fetchDistributionData = (type) => {
        const mockData = {
            commodities: [10, 20, 30, 40, 50],
            highValue: [15, 25, 35, 45, 55],
            allocation: [5, 15, 25, 35, 45],
            registered: [20, 30, 40, 50, 60],
            unregistered: [25, 35, 45, 55, 65],
        };
        setDistributionData(mockData[type]);
    };
    useEffect(() => {
        fetchDistributionData(selectedDistribution);
    }, []);
    return (_jsxs("div", { className: "distribution-map", children: [_jsxs(Select, { defaultValue: selectedDistribution, onChange: handleDistributionChange, children: [_jsx(Select.Option, { value: "commodities", children: "Commodities Distribution" }), _jsx(Select.Option, { value: "highValue", children: "High Value Distribution" }), _jsx(Select.Option, { value: "allocation", children: "Allocation Distribution" }), _jsx(Select.Option, { value: "registered", children: "Registered Distribution" }), _jsx(Select.Option, { value: "unregistered", children: "Unregistered Distribution" })] }), _jsxs(MapContainer, { center: [-6.7298, 125.3472], zoom: 13, style: { height: "400px", width: "100%" }, children: [_jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "\u00A9 <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors" }), _jsx(GeoJSON, { data: geoJsonData, style: styleFeature })] }), _jsx(BoxPlot, { data: distributionData })] }));
};
const styleFeature = (feature) => {
    const value = feature.properties.value;
    return {
        fillColor: getColor(value),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7,
    };
};
const getLabel = (feature) => {
    return feature.properties.NAME_2 || "Unnamed";
};
const getColor = (value) => {
    return value > 50
        ? "#800026"
        : value > 20
            ? "#BD0026"
            : value > 10
                ? "#E31A1C"
                : value > 5
                    ? "#FC4E2A"
                    : value > 0
                        ? "#FD8D3C"
                        : "#FFEDA0";
};
export default DistributionMap;
