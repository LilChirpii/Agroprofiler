import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import axios from "axios";
import { FeatureCollection, Geometry, Feature } from "geojson";

type HeatmapData = {
    [barangayName: string]: {
        [category: string]: { sum: number; count: number };
    };
};

type Category = string;

const Heatmap: React.FC = () => {
    const [geoData, setGeoData] = useState<FeatureCollection<Geometry> | null>(
        null
    );
    const [heatmapData, setHeatmapData] = useState<HeatmapData>({});
    const [distributionType, setDistributionType] =
        useState<string>("allocations");
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [categories, setCategories] = useState<Category[]>([]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get("/showResponseDashboard");
            const { heatmapData, commodityCategories } = response.data;

            setHeatmapData(heatmapData);
            setCategories(
                commodityCategories.map((cat: { name: string }) => cat.name)
            );
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    const fetchGeoData = async () => {
        try {
            const response = await axios.get("/public/Digos_City.geojson");
            setGeoData(response.data);
        } catch (error) {
            console.error("Error fetching GeoJSON data:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        fetchGeoData();
    }, []);

    const handleDistributionTypeChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setDistributionType(event.target.value);
        setSelectedCategory("All");
    };

    const handleCategoryChange = (
        event: React.ChangeEvent<HTMLSelectElement>
    ) => {
        setSelectedCategory(event.target.value);
    };

    const getIntensity = (barangayName: string) => {
        const barangayData = heatmapData[barangayName];
        if (!barangayData) return 0;

        const categoryData =
            selectedCategory === "All"
                ? Object.values(barangayData)
                : barangayData[selectedCategory];

        if (!categoryData) return 0;

        const { sum, count } = Array.isArray(categoryData)
            ? categoryData.reduce(
                  (acc, data) => ({
                      sum: acc.sum + data.sum,
                      count: acc.count + data.count,
                  }),
                  { sum: 0, count: 0 }
              )
            : categoryData;

        return count > 0 ? sum / count : 0;
    };

    const onEachFeature = (feature: Feature<Geometry>, layer: L.Layer) => {
        const barangayName = feature.properties?.barangay_name;
        const intensity = barangayName ? getIntensity(barangayName) : 0;

        layer.setStyle({
            fillColor: `rgba(255, 0, 0, ${intensity / 10})`,
            fillOpacity: 0.8,
            color: "#000",
            weight: 1,
        });

        layer.bindPopup(
            `${barangayName || "Unknown"}: ${intensity.toFixed(2)}`
        );
    };

    return (
        <div>
            <div>
                <label htmlFor="distributionType">Distribution Type:</label>
                <select
                    id="distributionType"
                    value={distributionType}
                    onChange={handleDistributionTypeChange}
                >
                    <option value="allocations">Allocations</option>
                    <option value="commodities">Commodities</option>
                    <option value="farmers">Farmers</option>
                    <option value="highValueCrops">High Value Crops</option>
                </select>
                <label htmlFor="category">Category:</label>
                <select
                    id="category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="All">All</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
            {geoData && (
                <MapContainer
                    center={[6.75, 125.35]}
                    zoom={12}
                    style={{ height: "600px", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <GeoJSON data={geoData} onEachFeature={onEachFeature} />
                </MapContainer>
            )}
        </div>
    );
};

export default Heatmap;
