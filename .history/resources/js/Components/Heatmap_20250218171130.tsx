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
import DonutChart from "./DonutChart";
import AgeHistogram from "./Histogram";
import Histogram from "./Histogram";
import DonutChartTwo from "./DonutChartTwo";
import GroupedHeatmap from "./GroupedHeatmap";
import { useTheme } from "@/ThemeContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF5E57"];

interface Commodity {
    id: number;
    name: string;
    farms_count: number;
    count: number;
    commodity_name: string;
    commodity_total: number;
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
            commodities_category_name?: Array<{
                commodities: Array<{ name: string; count: number }>;
            }>;
        };
    };
    commodityCategories: Array<any>;
}

const distributions = {
    allocations: [
        "All",
        "Cash Assistance",
        "Pesticides",
        "Fertilizer",
        "Seeds",
        "Machinery Support",
    ],
    commodities: ["All", "Rice", "Corn", "Fish"],
    farmers: ["All", "Registered", "Unregistered"],
    highValue: ["All", "Fruit-Bearing", "Vegetables"],
};

const Heatmap: React.FC<HeatmapProps> = ({ distributionData }) => {
    const [geoData, setGeoData] = useState<any>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedBarangay, setSelectedBarangay] = useState<any>(null);

    const geoJsonLayer = useRef<any>(null);

    const [commodityCategories, setCommodityCategories] = useState<string[]>(
        []
    );
    const [filteredCategories, setFilteredCategories] = useState<any[]>([]);
    const [subtypes, setSubtypes] = useState<string[]>([]);

    const [view, setView] = useState("allocations");
    const [subtype, setSubtype] = useState("All");
    const [category, setCategory] = useState("All");
    const [distributions, setDistributions] = useState({
        allocations: ["All"],
        commodities: ["All"],
        farmers: ["All"],
        highValue: ["All"],
        commodities_categories: {},
    });

    useEffect(() => {
        axios
            .get("/api/allocation-types")
            .then((response) => {
                const allocationTypes = response.data.map(
                    (type: any) => type.name
                );
                setDistributions((prev) => ({
                    ...prev,
                    allocations: ["All", ...allocationTypes],
                }));
            })
            .catch((error) =>
                console.error("Error fetching allocations:", error)
            );

        axios
            .get("/commodity-categories-list")
            .then((response) => {
                const categoriesData = response.data.reduce(
                    (acc: any, category: any) => {
                        acc[category.name] = category.commodities.map(
                            (c: any) => c.name
                        );
                        return acc;
                    },
                    {}
                );
                setDistributions((prev) => ({
                    ...prev,
                    commodities_categories: categoriesData,
                }));
            })
            .catch((error) =>
                console.error("Error fetching commodity categories:", error)
            );
    }, []);

    const handleChangeView = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setView(event.target.value);
        setSubtype("All");
        setCategory("All");
    };

    const handleChangeSubtype = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSubtype(event.target.value);
    };

    const handleChangeCategory = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setCategory(event.target.value);
        setSubtype("All");
    };

    useEffect(() => {
        const categories = Object.keys(
            Object.values(distributionData)[0]?.commodities_categories || {}
        );
        setCommodityCategories(categories);
    }, [distributionData]);

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

    useEffect(() => {
        const categories = Object.keys(
            Object.values(distributionData)[0]?.commodities_categories || {}
        );
        setCommodityCategories(categories);
    }, [distributionData]);

    useEffect(() => {
        if (view === "commodities_categories" && category !== "All") {
            const firstBarangay = Object.values(distributionData)[0];
            const subcategories =
                firstBarangay?.commodities_categories?.[category] || {};
            setSubtypes(Object.keys(subcategories));
        } else {
            setSubtypes(["All"]);
        }
    }, [category, view, distributionData]);

    const getColor = (intensity: number) => {
        return intensity > 100
            ? "#0ba60a"
            : intensity > 40
            ? "#ecdd09"
            : "#ec1809";
    };

    const getIntensityCategory = (intensity: number) => {
        return intensity > 100 ? "High" : intensity > 70 ? "Medium" : "Low";
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

    const filterCategories = (view: string) => {
        if (view === "commodities") {
            setFilteredCategories(commodityCategories);
        } else {
            setFilteredCategories([]);
        }
    };

    const calculateTotalForAll = (barangayName: string) => {
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

        // Determine the intensity category based on the value
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

    const { theme } = useTheme();

    const renderLegend = () => (
        <div className="legend-container dark:bg-[#0D1A25]">
            <div className="legend">
                <h4 className="text-md dark:text-white">
                    {view.charAt(0).toUpperCase() + view.slice(1)}{" "}
                    {subtype && subtype !== "All" ? `- ${subtype}` : ""}
                </h4>
                <ul>
                    <li className="legend-item" style={{ color: "#0ba60a" }}>
                        <span
                            className="legend-icon"
                            style={{ backgroundColor: "#0ba60a" }}
                        ></span>{" "}
                        Very High (More than 100)
                    </li>
                    <li className="legend-item" style={{ color: "#ecdd09" }}>
                        <span
                            className="legend-icon"
                            style={{ backgroundColor: "#ecdd09" }}
                        ></span>{" "}
                        Medium (More than 50)
                    </li>
                    <li className="legend-item" style={{ color: "#ec1809" }}>
                        <span
                            className="legend-icon"
                            style={{ backgroundColor: "#ec1809" }}
                        ></span>{" "}
                        Low (0 - 40)
                    </li>
                </ul>
            </div>
        </div>
    );

    return (
        <div className="heatmap-container">
            <div className="select-container mb-10 grid lg:grid-flow-row lg:grid-rows-1 md:grid-flow-col md:grid-cols-2 gap-4">
                <select
                    value={view}
                    onChange={handleChangeView}
                    className="border-slate-400 dark:text-white dark:border-green-700 dark:border-[2px] p-2 px-4 dark:bg-[#0D1A25] rounded-xl cursor-pointer focus:border-green-500 sm:text-[14px]"
                >
                    <option value="allocations" className="dark:text-white">
                        Allocations
                    </option>
                    <option value="commodities" className="dark:text-white">
                        Commodities
                    </option>
                    <option value="farmers" className="dark:text-white">
                        Farmers
                    </option>
                    <option value="highValue" className="dark:text-white">
                        High Value
                    </option>
                </select>

                <select
                    id="subtype-select"
                    onChange={handleChangeSubtype}
                    value={subtype}
                    className="rounded-[12px] dark:text-white dark:border-green-700 dark:border-[2px] p-2 px-4 dark:bg-[#0D1A25] border-slate-500  cursor-pointer focus:border-green-500 sm:text-[14px]"
                >
                    {distributions[view].map((dist) => (
                        <option
                            key={dist}
                            value={dist}
                            className="dark:text-white "
                        >
                            {dist}
                        </option>
                    ))}
                </select>

                {view === "commodities_categories" && (
                    <select value={category} onChange={handleChangeCategory}>
                        <option value="All">All Categories</option>
                        {commodityCategories.map((categoryName) => (
                            <option key={categoryName} value={categoryName}>
                                {categoryName}
                            </option>
                        ))}
                    </select>
                )}

                {view === "commodities_categories" && category !== "All" && (
                    <select value={subtype} onChange={handleChangeSubtype}>
                        <option value="All">All Subtypes</option>
                        {subtypes.map((subtypeName) => (
                            <option key={subtypeName} value={subtypeName}>
                                {subtypeName}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <MapContainer
                center={[6.75, 125.35]}
                zoom={10}
                scrollWheelZoom={true}
                ref={mapRef}
                className="dark:bg-black"
                style={{
                    width: "100%",
                    height: "500px",
                    zIndex: "10",
                    borderRadius: "0.5rem",
                    backgroundColor: "transparent",
                }}
            >
                {geoData && (
                    <GeoJSON
                        key={view + subtype}
                        data={geoData}
                        style={style}
                        onEachFeature={onEachFeature}
                    />
                )}
                {renderLegend()}
            </MapContainer>

            <Modal show={isModalOpen} onClose={closeModal}>
                <div className="px-6 py-8 xl:h-[600px] overflow-auto">
                    <div className="p-4 mb-2">
                        <h3 className="font-semibold text-[20px] mb-2 text-green-700">
                            Allocation Distribution
                        </h3>
                        <h2 className="text-[15px]">
                            Barangay:{" "}
                            <span className="font-semibold">
                                {selectedBarangay?.name}
                            </span>
                        </h2>

                        <p className="text-[15px]">
                            Intensity Category:{" "}
                            <span className="font-semibold text-red-500">
                                {selectedBarangay?.intensityCategory}
                            </span>
                        </p>
                    </div>

                    {selectedBarangay?.data ? (
                        <>
                            {/* <ResponsiveContainer width="100%" height={300}>
                                {selectedBarangay?.pieChartData?.length ? (
                                    <PieChart>
                                        <Pie
                                            data={selectedBarangay.pieChartData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label
                                        >
                                            {selectedBarangay.pieChartData.map(
                                                (_: unknown, index: number) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                ) : (
                                    <p>No data available.</p>
                                )}
                            </ResponsiveContainer> */}

                            <div className="p-4 mb-2">
                                <div className="w-full p-4 border rounded-lg">
                                    <h2 className="font-semibold">Summary</h2>
                                    {/* prettier-ignore */}
                                    <span className="p-4 inline-block text-justify">
  In Barangay {selectedBarangay?.name}, a total of 500 allocations were distributed, with 60% allocated as Cash Assistance, 25% as Pesticides, and 15% as Seeds. The average allocation per household was 2,000 pesos, with allocations primarily benefiting registered farmers (75%) and 4Ps beneficiaries (20%). The highest concentration of allocations was seen in barangays affected by recent floods, with a notable 80% increase in Cash Assistance over the last quarter. These allocations have significantly improved farmers' access to resources, though the distribution remains skewed towards the most vulnerable communities.
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 grid grid-flow-row grid-rows-1 gap-2">
                                <div>
                                    <DonutChart
                                        data={sampleData}
                                        title="Farmers' Gender Distribution"
                                    />
                                </div>

                                <div>
                                    <Histogram
                                        data={ageDistributionData}
                                        title="Farmers' Age Distribution "
                                    />
                                </div>
                                <GroupedHeatmap
                                    data={data}
                                    categories={categories}
                                    allocationTypes={allocationTypes}
                                    colorScale={colorScale}
                                />
                                <div>
                                    <DonutChartTwo
                                        data={donutChartData}
                                        allocationTypes={
                                            donutChartallocationTypes
                                        }
                                        demographics={demographics}
                                        sourcesOfFund={sourcesOfFund}
                                        colors={colors}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>No data available.</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Heatmap;
