import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Select } from "antd";
import BoxPlot from "./GroupedBarChart";
interface Props {
    geoJsonData: any;
}

const DistributionMap: React.FC<Props> = ({ geoJsonData }) => {
    const [selectedDistribution, setSelectedDistribution] =
        useState<string>("commodities");
    const [distributionData, setDistributionData] = useState<any[]>([]);

    const handleDistributionChange = (value: string) => {
        setSelectedDistribution(value);
        fetchDistributionData(value);
    };

    const fetchDistributionData = (type: string) => {
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

    return (
        <div className="distribution-map">
            <Select
                defaultValue={selectedDistribution}
                onChange={handleDistributionChange}
            >
                <Select.Option value="commodities">
                    Commodities Distribution
                </Select.Option>
                <Select.Option value="highValue">
                    High Value Distribution
                </Select.Option>
                <Select.Option value="allocation">
                    Allocation Distribution
                </Select.Option>
                <Select.Option value="registered">
                    Registered Distribution
                </Select.Option>
                <Select.Option value="unregistered">
                    Unregistered Distribution
                </Select.Option>
            </Select>

            <MapContainer
                center={[-6.7298, 125.3472]}
                zoom={13}
                style={{ height: "400px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                />
                <GeoJSON data={geoJsonData} style={styleFeature} />
            </MapContainer>

            <BoxPlot data={distributionData} />
        </div>
    );
};

const styleFeature = (feature: any) => {
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

const getLabel = (feature: any) => {
    return feature.properties.NAME_2 || "Unnamed";
};

const getColor = (value: number) => {
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
