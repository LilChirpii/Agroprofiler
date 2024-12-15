import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Map as LeafletMap, GeoJSON as LeafletGeoJSON } from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../css/ThematicMap.css";
import Modal from "./Modal";
import axios from "axios";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF5E57"];

interface HeatmapProps {
    geoData: any;
    distributionData: {
        [barangay: string]: {
            allocations?: { [subtype: string]: number };
            commodities?: { [subtype: string]: number };
            farmers?: { [subtype: string]: number };
            highValue?: { [subtype: string]: number };
        };
    };
}

const Heatmap: React.FC<HeatmapProps> = ({ distributionData }) => {
    const [geoData, setGeoData] = useState<any>(null);
    const [distributions, setDistributions] = useState<any>({
        allocations: [],
        commodities: [],
        farmers: ["All", "Registered", "Unregistered"],
        highValue: ["All", "Fruit Bearing", "Vegetables"],
    });
    const mapRef = useRef<LeafletMap | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedBarangay, setSelectedBarangay] = useState<any>(null);
    const [view, setView] = useState<
        "allocations" | "commodities" | "farmers" | "highValue"
    >("allocations");
    const [subtype, setSubtype] = useState<string>("All");
    const geoJsonLayer = useRef<any>(null);

    const openModal = (barangay: any): void => {
        const barangayKey = barangay.name.replace(/\s+/g, "");
        const data =
            subtype === "All"
                ? calculateTotalForAll(barangayKey)
                : {
                      [view]:
                          distributionData[barangayKey]?.[view]?.[subtype] || 0,
                  };

        const intensityCategory = getIntensityCategory(barangay.intensity);

        const pieChartData =
            view === "allocations" ||
            view === "commodities" ||
            view === "farmers" ||
            view === "highValue"
                ? Object.entries(data[view] || {}).map(([name, value]) => ({
                      name,
                      value,
                  }))
                : [];

        setSelectedBarangay({
            name: barangay.name,
            intensity: barangay.intensity,
            intensityCategory,
            data: data,
            pieChartData, // Add this to selectedBarangay state
        });

        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
        setSelectedBarangay(null);
    };

    useEffect(() => {
        const fetchGeoData = async () => {
            try {
                const response = await axios.get("/Digos_City.geojson");
                setGeoData(response.data);

                if (mapRef.current && response.data) {
                    geoJsonLayer.current = new LeafletGeoJSON(response.data);
                    const bounds = geoJsonLayer.current.getBounds();
                    mapRef.current.fitBounds(bounds);
                    mapRef.current.setMaxBounds(bounds);
                }
            } catch (error) {
                console.error("Error fetching GeoJSON data:", error);
            }
        };

        const fetchDistributionData = async () => {
            try {
                const response = await axios.get("/api/distributions");
                setDistributions(response.data);
            } catch (error) {
                console.error("Error fetching distribution data:", error);
            }
        };

        fetchGeoData();
        fetchDistributionData();
    }, []);

    const getColor = (intensity: number) => {
        return intensity > 100
            ? "#4d7c0f"
            : intensity > 70
            ? "#65a30d"
            : intensity > 50
            ? "#84cc16"
            : intensity > 20
            ? "#bef264"
            : "#d9f99d";
    };

    const getIntensityCategory = (intensity: number) => {
        return intensity > 100
            ? "Very High"
            : intensity > 70
            ? "High"
            : intensity > 50
            ? "Medium"
            : intensity > 20
            ? "Low"
            : "Very Low";
    };

    const style = (feature: any) => {
        const barangayName = feature.properties.NAME_2.replace(/\s+/g, "");
        let intensity = 0;
        if (subtype === "All") {
            intensity = calculateTotalForAll(barangayName)[view] || 0;
        } else {
            intensity = distributionData[barangayName]?.[view]?.[subtype] || 0;
        }

        return {
            fillColor: getColor(intensity),
            weight: 2,
            opacity: 1,
            color: "black",
            dashArray: "3",
            fillOpacity: 0.9,
        };
    };

    const handleChangeView = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as
            | "allocations"
            | "commodities"
            | "farmers"
            | "highValue";
        setView(value);
        setSubtype("All");
    };

    const handleChangeSubtype = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSubtype(event.target.value);
    };

    const calculateTotalForAll = (barangayName: string) => {
        // For allocations: Sum all the allocation types
        const allocationTotal = Object.values(
            distributionData[barangayName]?.allocations || {}
        ).reduce((acc, val) => acc + val, 0);

        // For commodities: Handle nested structures
        const commodityTotal = Object.values(
            distributionData[barangayName]?.commodities || {}
        ).reduce((acc, commodityCategory) => {
            if (
                typeof commodityCategory === "object" &&
                commodityCategory !== null
            ) {
                return (
                    acc +
                    Object.values(commodityCategory).reduce(
                        (subAcc, val) => subAcc + val,
                        0
                    )
                );
            }
            return acc + commodityCategory;
        }, 0);

        // For farmers: Sum the registered and unregistered values
        const farmerTotal = Object.values(
            distributionData[barangayName]?.farmers || {}
        ).reduce((acc, val) => acc + val, 0);

        // For highValue: Sum the values (assuming it's not nested)
        const highValueTotal = Object.values(
            distributionData[barangayName]?.highValue || {}
        ).reduce((acc, val) => acc + val, 0);

        return {
            allocations: allocationTotal,
            commodities: commodityTotal,
            farmers: farmerTotal,
            highValue: highValueTotal,
        };
    };

    const onEachFeature = (feature: any, layer: any) => {
        if (!feature || !layer) return;

        const barangayName = feature.properties?.NAME_2 || "Unknown";

        let value = 0;
        if (subtype === "All") {
            value = calculateTotalForAll(barangayName)[view] || 0;
        } else {
            if (view === "commodities") {
                value =
                    distributionData[barangayName]?.commodities?.[subtype] || 0;
            } else {
                value = distributionData[barangayName]?.[view]?.[subtype] || 0;
            }
        }

        const intensityCategory = getIntensityCategory(value);

        layer.bindTooltip(`${barangayName} - ${intensityCategory}: ${value}`, {
            permanent: false,
            direction: "left",
            className: "barangay-tooltip",
        });

        layer.on({
            click: () => {
                openModal({
                    name: barangayName,
                    intensity: layer.options.fillColor,
                });
            },
        });
    };

    const renderLegend = () => (
        <div className="legend-container">
            <div className="legend">
                <h4>
                    {view.charAt(0).toUpperCase() + view.slice(1)}{" "}
                    {subtype && subtype !== "All" ? `- ${subtype}` : ""}
                </h4>
                <ul>{/* Render legend items */}</ul>
            </div>
        </div>
    );

    return (
        <div className="heatmap-container">
            <div className="select-container mb-10 flex gap-4">
                <select
                    id="view-select"
                    onChange={handleChangeView}
                    value={view}
                    className="w-1/3"
                >
                    <option value="allocations">Allocations</option>
                    <option value="commodities">Commodities</option>
                    <option value="farmers">Farmers</option>
                    <option value="highValue">High Value Crops</option>
                </select>

                <select
                    id="subtype-select"
                    onChange={handleChangeSubtype}
                    value={subtype}
                    className="w-1/3"
                >
                    <option value="All">All</option>
                    {(distributions[view] || []).map((subtype: string) => (
                        <option value={subtype} key={subtype}>
                            {subtype}
                        </option>
                    ))}
                </select>
            </div>
            {geoData && (
                <MapContainer
                    center={[7.1415, 125.1875]}
                    zoom={12}
                    ref={mapRef}
                    style={{ height: "400px" }}
                    zoomControl={false}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <GeoJSON
                        data={geoData}
                        style={style}
                        onEachFeature={onEachFeature}
                    />
                </MapContainer>
            )}

            {renderLegend()}

            {isModalOpen && selectedBarangay && (
                <Modal
                    selectedBarangay={selectedBarangay}
                    onClose={closeModal}
                    distributions={distributions}
                />
            )}
        </div>
    );
};

export default Heatmap;
