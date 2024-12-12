import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import {
    Map as LeafletMap,
    GeoJSON as LeafletGeoJSON,
    DivIcon,
    LayerGroup,
    Marker as LeafletMarker,
    LeafletEvent,
} from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../../css/ThematicMap.css";
import Modal from "./Modal";

interface Icons {
    [key: string]: DivIcon;
}

interface Allocation {
    [key: string]: DivIcon;
}

interface Farmers {
    [key: string]: DivIcon;
}

interface HighValue {
    [key: string]: DivIcon;
}

interface Farm {
    commodity: {
        name: string;
        id: number;
    };
    latitude: number;
    longitude: number;
    farmer: Farmer[];
}

interface Farmer {
    id: number;
    farms: Farm[];
}

const ThematicMap: React.FC = () => {
    const [geoData, setGeoData] = useState<any>(null);
    const [visibleTypes, setVisibleTypes] = useState<string[]>([]);
    const [labelsVisible, setLabelsVisible] = useState<boolean>(true);
    const mapRef = useRef<LeafletMap | null>(null);
    const markerGroups = useRef<{ [key: string]: LayerGroup }>({});
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const openModal = (): void => {
        setIsModalOpen(true);
    };

    const closeModal = (): void => {
        setIsModalOpen(false);
    };

    const icons: Icons = {
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

    const allocation: Allocation = {
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

    const farmers: Farmers = {
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

    const highValue: HighValue = {
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

    const [farmerData, setFarmerData] = useState<Farm[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const farmerResponse = await axios.get("/map/farm");
                const farmResponse = await axios.get("/map/farm");

                const farmers = farmerResponse.data;
                const farms = farmResponse.data;

                const mappedFarmerData = farmers.map((farmer: any) => {
                    return {
                        ...farmer,
                        farms: farms.filter(
                            (farm: any) => farm.farmer_id === farmer.id
                        ),
                    };
                });

                setFarmerData(mappedFarmerData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        farmerData.forEach((farmer: Farm) => {
            farmer.farms.forEach((farmer: Farmer) => {
                const marker = new LeafletMarker(
                    [farm.latitude, farm.longitude],
                    {
                        icon: icons[farm.commodity.name.toLowerCase()],
                    }
                );
                const layerGroup =
                    markerGroups.current[farm.commodity.name] ||
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
            } catch (error) {
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

    const style = (feature: any) => {
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

    const getLabel = (feature: any) => {
        return feature.properties.NAME_2 || "Unnamed";
    };

    const onEachFeature = (feature: any, layer: any) => {
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
            click: (e: LeafletEvent) => {
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

    const handleLegendClick = (type: string) => {
        setVisibleTypes((prevVisibleTypes) =>
            prevVisibleTypes.includes(type)
                ? prevVisibleTypes.filter((t) => t !== type)
                : [...prevVisibleTypes, type]
        );
    };

    useEffect(() => {
        Object.keys(icons).forEach((type) => {
            const layerGroup = new LayerGroup();
            const filteredData = farmerData.filter(
                (farmer) => farmer.type === type
            );

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
            const filteredData = farmerData.filter(
                (farmer) => farmer.type === type
            );

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
            const filteredData = farmerData.filter(
                (farmer) => farmer.type === type
            );

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
            const filteredData = farmerData.filter(
                (farmer) => farmer.type === type
            );

            filteredData.forEach((farmer) => {
                const marker = new LeafletMarker([farmer.lat, farmer.lng], {
                    icon: farmers[type],
                });
                layerGroup.addLayer(marker);
            });

            markerGroups.current[type] = layerGroup;
        });
    }, []);

    return (
        <>
            <Modal show={isModalOpen} maxWidth="lg" onClose={closeModal}>
                <div className="p-6">
                    <h2 className="text-lg font-bold">Summary</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        $barangay.selected
                    </p>
                    <button
                        onClick={closeModal}
                        className="mt-4 px-4 text-sm py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        close
                    </button>
                </div>
            </Modal>
            <div className="map-container">
                <MapContainer
                    ref={mapRef}
                    center={[6.75, 125.35]}
                    zoom={12}
                    style={{
                        height: "500px",
                        width: "100%",
                        backgroundColor: "white",
                    }}
                    className="leaflet-map-container"
                >
                    <TileLayer url="" />

                    {geoData && (
                        <GeoJSON
                            data={geoData}
                            style={style}
                            onEachFeature={onEachFeature}
                        />
                    )}

                    <div className="legend-container w-[8rem] mt-[1.5rem]">
                        <div className="legend">
                            <h5 className="text-slate-400 pb-2">Commodities</h5>
                            {Object.keys(icons).map((type) => (
                                <div
                                    key={type}
                                    className={`legend-item ${
                                        visibleTypes.includes(type)
                                            ? "legend-item-active rounded-full"
                                            : ""
                                    }`}
                                    onClick={() => handleLegendClick(type)}
                                >
                                    <div
                                        className="legend-icon"
                                        style={{
                                            backgroundColor: (
                                                icons[type] as any
                                            ).options.html.match(
                                                /background-color: ([^;]+)/
                                            )[1],
                                        }}
                                    />
                                    {type.charAt(0).toUpperCase() +
                                        type.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="legend-container w-[8rem] relative mt-[12rem]">
                        <div className="legend">
                            <h5 className="text-slate-400 pb-2">High Value</h5>
                            {Object.keys(highValue).map((type) => (
                                <div
                                    key={type}
                                    className={`legend-item ${
                                        visibleTypes.includes(type)
                                            ? "legend-item-active"
                                            : ""
                                    }`}
                                    onClick={() => handleLegendClick(type)}
                                >
                                    <div
                                        className="legend-icon"
                                        style={{
                                            backgroundColor: (
                                                highValue[type] as any
                                            ).options.html.match(
                                                /background-color: ([^;]+)/
                                            )[1],
                                        }}
                                    />
                                    {type.charAt(0).toUpperCase() +
                                        type.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="legend-container w-[8rem] relative left-2 mt-[15rem]">
                        <div className="legend">
                            <h5 className="text-slate-400 pb-2">Farmers</h5>
                            {Object.keys(farmers).map((type) => (
                                <div
                                    key={type}
                                    className={`legend-item ${
                                        visibleTypes.includes(type)
                                            ? "legend-item-active"
                                            : ""
                                    }`}
                                    onClick={() => handleLegendClick(type)}
                                >
                                    <div
                                        className="legend-icon"
                                        style={{
                                            backgroundColor: (
                                                farmers[type] as any
                                            ).options.html.match(
                                                /background-color: ([^;]+)/
                                            )[1],
                                        }}
                                    />
                                    {type.charAt(0).toUpperCase() +
                                        type.slice(1)}
                                </div>
                            ))}
                        </div>
                    </div>
                </MapContainer>
            </div>
        </>
    );
};

export default ThematicMap;
