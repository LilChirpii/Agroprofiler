import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { GeoJSON as LeafletGeoJSON, DivIcon, LayerGroup, Marker as LeafletMarker, } from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../../css/ThematicMap.css";
import Modal from "./Modal";
const ThematicMap = () => {
    const [geoData, setGeoData] = useState(null);
    const [visibleTypes, setVisibleTypes] = useState([]);
    const [labelsVisible, setLabelsVisible] = useState(true);
    const mapRef = useRef(null);
    const markerGroups = useRef({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => {
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
    };
    const icons = {
        all: new DivIcon({
            className: "",
            html: '<div style="background-color: none; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        rice: new DivIcon({
            className: "custom-icon rice-icon",
            html: '<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [5, 5],
        }),
        corn: new DivIcon({
            className: "custom-icon corn-icon",
            html: '<div style="background-color: #BF2EF0; box-shadow: 2px; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        fish: new DivIcon({
            className: "custom-icon fish-icon",
            html: '<div style="background-color: #FFE700; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
    };
    const allocation = {
        all: new DivIcon({
            className: "",
            html: '<div style="background-color: none; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        Pesticides: new DivIcon({
            className: "custom-icon rice-icon",
            html: '<div style="background-color: #FF204E; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        Fertilizer: new DivIcon({
            className: "custom-icon corn-icon",
            html: '<div style="background-color: #CB6040; box-shadow: 2px; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        Other: new DivIcon({
            className: "custom-icon corn-icon",
            html: '<div style="background-color: #BF2EF0; box-shadow: 2px; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
    };
    const farmers = {
        all: new DivIcon({
            className: "",
            html: '<div style="background-color: none; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        Registered: new DivIcon({
            className: "custom-icon rice-icon",
            html: '<div style="background-color: #F57D1F; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        Unregistered: new DivIcon({
            className: "custom-icon corn-icon",
            html: '<div style="background-color: #27005D; box-shadow: 2px; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
    };
    const highValue = {
        all: new DivIcon({
            className: "",
            html: '<div style="background-color: none; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        Vegetable: new DivIcon({
            className: "custom-icon rice-icon",
            html: '<div style="background-color: #343131; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
        FruitBearing: new DivIcon({
            className: "custom-icon corn-icon",
            html: '<div style="background-color: #A27B5C; box-shadow: 2px; width: 12px; height: 12px; border-radius: 50%;"></div>',
            iconSize: [12, 12],
        }),
    };
    const [farmerData, setFarmerData] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const farmerResponse = await axios.get("/map/farm");
                const farmResponse = await axios.get("/map/farm");
                const farmers = farmerResponse.data;
                const farms = farmResponse.data;
                const mappedFarmerData = farmers.map((farmer) => {
                    return {
                        ...farmer,
                        farms: farms.filter((farm) => farm.farmer_id === farmer.id),
                    };
                });
                setFarmerData(mappedFarmerData);
            }
            catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        farmerData.forEach((farmer) => {
            farmer.farms.forEach((farmer) => {
                const marker = new LeafletMarker([farm.latitude, farm.longitude], {
                    icon: icons[farm.commodity.name.toLowerCase()],
                });
                const layerGroup = markerGroups.current[farm.commodity.name] ||
                    new LayerGroup();
                layerGroup.addLayer(marker);
                markerGroups.current[farm.commodity.name] = layerGroup;
            });
        });
    }, [farmerData]);
    useEffect(() => {
        const fetchGeoData = async () => {
            try {
                const response = await axios.get("/Digos_City.geojson");
                setGeoData(response.data);
                if (mapRef.current && response.data) {
                    const geoJsonLayer = new LeafletGeoJSON(response.data);
                    const bounds = geoJsonLayer.getBounds();
                    mapRef.current.fitBounds(bounds);
                    mapRef.current.setMaxBounds(bounds);
                }
            }
            catch (error) {
                console.error("Error fetching GeoJSON data:", error);
            }
        };
        fetchGeoData();
    }, []);
    useEffect(() => {
        if (mapRef.current) {
            Object.values(markerGroups.current).forEach((group) => {
                if (mapRef.current && group) {
                    mapRef.current.removeLayer(group);
                }
            });
            Object.entries(markerGroups.current).forEach(([type, group]) => {
                if (mapRef.current && group && visibleTypes.includes(type)) {
                    group.addTo(mapRef.current);
                }
            });
        }
    }, [visibleTypes]);
    const style = (feature) => {
        return {
            fillColor: "#d4d4d8",
            weight: 2,
            opacity: 3,
            color: "white",
            dashArray: "1",
            border: 1,
            borderColor: "slate",
            fillOpacity: 0.9,
        };
    };
    const getLabel = (feature) => {
        return feature.properties.NAME_2 || "Unnamed";
    };
    const onEachFeature = (feature, layer) => {
        const label = getLabel(feature);
        layer.bindTooltip(label, {
            permanent: false,
            direction: "top",
            className: "custom-tooltip",
        });
        layer.on({
            mouseover: () => {
                layer.openTooltip();
                layer.setStyle({
                    weight: 1,
                    color: "#FF0000",
                    dashArray: "2px",
                    fillOpacity: 0.7,
                });
            },
            mouseout: () => {
                if (!labelsVisible) {
                    layer.closeTooltip();
                }
                layer.setStyle(style(feature));
            },
            click: (e) => {
                setIsModalOpen(true);
                const selectedBrgy = feature.properties.NAME_2;
                console.log("Clicked feature:", selectedBrgy);
                layer.setStyle({
                    weight: 1,
                    color: "#FF0000",
                    dashArray: "1px",
                    fillOpacity: 0.7,
                });
            },
        });
    };
    const handleLegendClick = (type) => {
        setVisibleTypes((prevVisibleTypes) => prevVisibleTypes.includes(type)
            ? prevVisibleTypes.filter((t) => t !== type)
            : [...prevVisibleTypes, type]);
    };
    useEffect(() => {
        Object.keys(icons).forEach((type) => {
            const layerGroup = new LayerGroup();
            const filteredData = farmerData.filter((farmer) => farmer.type === type);
            filteredData.forEach((farmer) => {
                const marker = new LeafletMarker([farmer.lat, farmer.lng], {
                    icon: icons[type],
                });
                layerGroup.addLayer(marker);
            });
            markerGroups.current[type] = layerGroup;
        });
    }, []);
    useEffect(() => {
        Object.keys(allocation).forEach((type) => {
            const layerGroup = new LayerGroup();
            const filteredData = farmerData.filter((farmer) => farmer.type === type);
            filteredData.forEach((farmer) => {
                const marker = new LeafletMarker([farmer.lat, farmer.lng], {
                    icon: allocation[type],
                });
                layerGroup.addLayer(marker);
            });
            markerGroups.current[type] = layerGroup;
        });
    }, []);
    useEffect(() => {
        Object.keys(highValue).forEach((type) => {
            const layerGroup = new LayerGroup();
            const filteredData = farmerData.filter((farmer) => farmer.type === type);
            filteredData.forEach((farmer) => {
                const marker = new LeafletMarker([farmer.lat, farmer.lng], {
                    icon: highValue[type],
                });
                layerGroup.addLayer(marker);
            });
            markerGroups.current[type] = layerGroup;
        });
    }, []);
    useEffect(() => {
        Object.keys(farmers).forEach((type) => {
            const layerGroup = new LayerGroup();
            const filteredData = farmerData.filter((farmer) => farmer.type === type);
            filteredData.forEach((farmer) => {
                const marker = new LeafletMarker([farmer.lat, farmer.lng], {
                    icon: farmers[type],
                });
                layerGroup.addLayer(marker);
            });
            markerGroups.current[type] = layerGroup;
        });
    }, []);
    return (_jsxs(_Fragment, { children: [_jsx(Modal, { show: isModalOpen, maxWidth: "lg", onClose: closeModal, children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-lg font-bold", children: "Summary" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "$barangay.selected" }), _jsx("button", { onClick: closeModal, className: "mt-4 px-4 text-sm py-2 text-white bg-red-600 rounded-md hover:bg-red-700", children: "close" })] }) }), _jsx("div", { className: "map-container", children: _jsxs(MapContainer, { ref: mapRef, center: [6.75, 125.35], zoom: 12, style: {
                        height: "500px",
                        width: "100%",
                        backgroundColor: "white",
                    }, className: "leaflet-map-container", children: [_jsx(TileLayer, { url: "" }), geoData && (_jsx(GeoJSON, { data: geoData, style: style, onEachFeature: onEachFeature })), _jsx("div", { className: "legend-container w-[8rem] mt-[1.5rem]", children: _jsxs("div", { className: "legend", children: [_jsx("h5", { className: "text-slate-400 pb-2", children: "Commodities" }), Object.keys(icons).map((type) => (_jsxs("div", { className: `legend-item ${visibleTypes.includes(type)
                                            ? "legend-item-active rounded-full"
                                            : ""}`, onClick: () => handleLegendClick(type), children: [_jsx("div", { className: "legend-icon", style: {
                                                    backgroundColor: icons[type].options.html.match(/background-color: ([^;]+)/)[1],
                                                } }), type.charAt(0).toUpperCase() +
                                                type.slice(1)] }, type)))] }) }), _jsx("div", { className: "legend-container w-[8rem] relative mt-[12rem]", children: _jsxs("div", { className: "legend", children: [_jsx("h5", { className: "text-slate-400 pb-2", children: "High Value" }), Object.keys(highValue).map((type) => (_jsxs("div", { className: `legend-item ${visibleTypes.includes(type)
                                            ? "legend-item-active"
                                            : ""}`, onClick: () => handleLegendClick(type), children: [_jsx("div", { className: "legend-icon", style: {
                                                    backgroundColor: highValue[type].options.html.match(/background-color: ([^;]+)/)[1],
                                                } }), type.charAt(0).toUpperCase() +
                                                type.slice(1)] }, type)))] }) }), _jsx("div", { className: "legend-container w-[8rem] relative left-2 mt-[15rem]", children: _jsxs("div", { className: "legend", children: [_jsx("h5", { className: "text-slate-400 pb-2", children: "Farmers" }), Object.keys(farmers).map((type) => (_jsxs("div", { className: `legend-item ${visibleTypes.includes(type)
                                            ? "legend-item-active"
                                            : ""}`, onClick: () => handleLegendClick(type), children: [_jsx("div", { className: "legend-icon", style: {
                                                    backgroundColor: farmers[type].options.html.match(/background-color: ([^;]+)/)[1],
                                                } }), type.charAt(0).toUpperCase() +
                                                type.slice(1)] }, type)))] }) })] }) })] }));
};
export default ThematicMap;
