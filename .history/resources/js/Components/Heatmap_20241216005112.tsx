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

interface Commodity {
    id: number;
    name: string;
    farms_count: number;
    count: number;
    commodity_name: string;
    commodity_total: number;
}

interface BarangayData {
    [key: string]: {
        registeredFarmers: number;
        unregisteredFarmers: number;
        commodityCounts: {
            [commodityType: string]: number;
        };
        allocationCounts: {
            [allocationType: string]: number;
        };
    };
}

interface CommodityCategory {
    id: number;
    name: string;
    desc: string;
    commodity_category_name: string;
    commodity_category_total: number;
    commodities: Commodity[];
}

interface HeatmapProps {
    geoData: any;
    distributionData: {
        [barangay: string]: {
            allocations?: { [subtype: string]: number };
            commodities_categories?: {
                [subtype: string]: { [subcategory: string]: number };
            };
            farmers?: { [subtype: string]: number };
            commodities?: Array<{
                commodities_category_name: string;
                commodities: Array<{ name: string; count: number }>;
            }>;
        };
    };
    commodityCategories: CommodityCategory[];
}

const Heatmap: React.FC<HeatmapProps> = ({
    distributionData,
    commodityCategories,
}) => {
    const distributions = {
        allocations: ["All", "Cash Assistance", "Pesticide", "Fertilizer"],
        commodities: [
            "All",
            ...commodityCategories.map((category) => category.name),
        ],
        farmers: ["All", "Registered", "Unregistered"],
        highValue: ["All", "Fruit-Bearing", "Vegetables"],
    };
    const [geoData, setGeoData] = useState<any>(null);
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
                          view === "commodities"
                              ? distributionData[barangayKey]
                                    ?.commodities_categories?.[subtype] || 0
                              : distributionData[barangayKey]?.[view]?.[
                                    subtype
                                ] || 0,
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
            pieChartData,
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

        fetchGeoData();
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
        if (value !== "commodities") {
            setSubtype("All");
        }
    };

    const handleChangeSubtype = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSubtype(event.target.value);
    };

    const calculateTotalForAll = (barangayName: string) => {
        if (!barangayName || !distributionData[barangayName]) {
            return {
                allocations: 0,
                commodities: 0,
                farmers: 0,
                highValue: 0,
            };
        }

        const allocationTotal = Object.values(
            distributionData[barangayName]?.allocations || {}
        ).reduce((acc, val) => acc + val, 0);

        const commodityTotal = Object.values(
            distributionData[barangayName]?.commodities || {}
        ).reduce((acc, commodityCategory) => {
            if (
                typeof commodityCategory === "object" &&
                commodityCategory !== null
            ) {
                return (
                    acc +
                    Object.values(
                        commodityCategory as Record<string, number>
                    ).reduce((subAcc, val) => subAcc + val, 0)
                );
            }
            return acc + (commodityCategory as number);
        }, 0);

        const farmerTotal = Object.values(
            distributionData[barangayName]?.farmers || {}
        ).reduce((acc, val) => acc + val, 0);

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

        const barangayName =
            feature.properties?.NAME_2?.replace(/\s+/g, "") || "Unknown";

        let value = 0;
        if (subtype === "All") {
            value = calculateTotalForAll(barangayName)[view] || 0;
        } else {
            if (view === "commodities") {
                value =
                    distributionData[barangayName]?.commodities_categories?.[
                        subtype
                    ] || 0;
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
                <div
                    className="color-box"
                    style={{ backgroundColor: "#4d7c0f" }}
                />
                Very High
            </div>
            <div className="legend">
                <div
                    className="color-box"
                    style={{ backgroundColor: "#65a30d" }}
                />
                High
            </div>
            <div className="legend">
                <div
                    className="color-box"
                    style={{ backgroundColor: "#84cc16" }}
                />
                Medium
            </div>
            <div className="legend">
                <div
                    className="color-box"
                    style={{ backgroundColor: "#bef264" }}
                />
                Low
            </div>
            <div className="legend">
                <div
                    className="color-box"
                    style={{ backgroundColor: "#d9f99d" }}
                />
                Very Low
            </div>
        </div>
    );

    return (
        <div className="map-container">
            <div className="filter-controls">
                <select onChange={handleChangeView} value={view}>
                    {Object.keys(distributions).map((key) => (
                        <option key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </option>
                    ))}
                </select>

                {view !== "allocations" && (
                    <select onChange={handleChangeSubtype} value={subtype}>
                        {distributions[view].map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <MapContainer
                center={[-6.7564, 125.3647]}
                zoom={10}
                scrollWheelZoom={false}
                style={{ height: "80vh", width: "100%" }}
                whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />

                {geoData && (
                    <GeoJSON
                        data={geoData}
                        style={style}
                        onEachFeature={onEachFeature}
                    />
                )}
            </MapContainer>

            {/* {isModalOpen && selectedBarangay && (
                <Modal
                    barangay={selectedBarangay}
                    pieChartData={selectedBarangay.pieChartData}
                    closeModal={closeModal}
                />
            )} */}
            {renderLegend()}
        </div>
    );
};

export default Heatmap;
