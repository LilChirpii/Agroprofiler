import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import axios from "axios";

const Heatmap = () => {
    const [geoData, setGeoData] = useState(null);
    const [heatmapData, setHeatmapData] = useState({});
    const [distributionType, setDistributionType] = useState("allocations");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState([]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get("/api/dashboard-data");
            const { heatmapData, commodityCategories } = response.data;

            setHeatmapData(heatmapData);
            setCategories(commodityCategories.map((cat) => cat.name));
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        // Load GeoJSON data
        axios
            .get("/public/Digos_City.geojson")
            .then((response) => setGeoData(response.data));
    }, []);

    const handleDistributionTypeChange = (event) => {
        setDistributionType(event.target.value);
        setSelectedCategory("All");
    };

    const handleCategoryChange = (event) => {
        setSelectedCategory(event.target.value);
    };

    const getIntensity = (barangayName) => {
        if (distributionType === "allocations") {
            return Object.values(
                heatmapData[barangayName]?.allocations || {}
            ).reduce((sum, count) => sum + count, 0);
        } else if (distributionType === "farmers") {
            return Object.values(
                heatmapData[barangayName]?.farmers || {}
            ).reduce((sum, count) => sum + count, 0);
        } else if (distributionType === "commodities_categories") {
            if (selectedCategory === "All") {
                return Object.values(
                    heatmapData[barangayName]?.commodities_categories || {}
                )
                    .flatMap((category) => Object.values(category))
                    .reduce((sum, count) => sum + count, 0);
            } else {
                return Object.values(
                    heatmapData[barangayName]?.commodities_categories[
                        selectedCategory
                    ] || {}
                ).reduce((sum, count) => sum + count, 0);
            }
        }
        return 0;
    };

    const style = (feature) => {
        const intensity = getIntensity(feature.properties.name);
        return {
            fillColor: `rgba(255, 0, 0, ${Math.min(intensity / 100, 1)})`,
            weight: 1,
            color: "black",
            fillOpacity: 0.7,
        };
    };

    return (
        <div>
            <div>
                <label htmlFor="distributionType">
                    Select Distribution Type:
                </label>
                <select
                    id="distributionType"
                    value={distributionType}
                    onChange={handleDistributionTypeChange}
                >
                    <option value="allocations">Allocations</option>
                    <option value="farmers">Farmers</option>
                    <option value="commodities_categories">
                        Commodity Categories
                    </option>
                </select>

                {distributionType === "commodities_categories" && (
                    <div>
                        <label htmlFor="category">Select Category:</label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="All">All Categories</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <MapContainer
                style={{ height: "500px" }}
                zoom={13}
                center={[6.749, 125.354]}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {geoData && <GeoJSON data={geoData} style={style} />}
            </MapContainer>
        </div>
    );
};

export default Heatmap;
