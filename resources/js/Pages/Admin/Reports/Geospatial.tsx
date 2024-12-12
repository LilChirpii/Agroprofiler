import Card from "@/Components/Card";
import Dropdown from "@/Components/Dropdown";
import GeospatialHeatmap from "@/Components/Geospatial";
import ThematicMap from "@/Components/Map";
import Authenticated from "@/Layouts/AuthenticatedLayout";
import { PageProps } from "@/types";
import { Head } from "@inertiajs/react";
import { ChevronDown } from "lucide-react";
import React from "react";

export default function Geospatial({ auth }: PageProps) {
    return (
        <Authenticated
            user={auth.user}
            header={
                <h2 className="text-xl block text-gray-800 leading-tight">
                    Geospatial
                </h2>
            }
        >
            <Head title="Geospatial" />
            <div className="grid grid-flow-col grid-cols-2 gap-5">
                <div>
                    <Card title="Map of Digos City, Davao del Sur">
                        <GeospatialHeatmap />
                    </Card>
                </div>
                <div>
                    <Card title="Summary">
                        <div className="flex gap-5">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="rounded-[12px] text-sm border border-slate-200 p-2 flex">
                                        Commodity
                                        <ChevronDown
                                            size={15}
                                            className="mt-1 ml-3"
                                        />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right">
                                    <Dropdown.Link href="/link1">
                                        Fertilizer
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/link2">
                                        Pesticides
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/link3">
                                        Commodity
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="rounded-[12px] text-sm border border-slate-200 p-2 flex">
                                        Year
                                        <ChevronDown
                                            size={15}
                                            className="mt-1 ml-3"
                                        />
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right">
                                    <Dropdown.Link href="/link1">
                                        2024
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/link2">
                                        2023
                                    </Dropdown.Link>
                                    <Dropdown.Link href="/link3">
                                        2022
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <br />
                        <div>
                            <Card title="`Desc">$brgy.selected</Card>
                        </div>
                    </Card>
                </div>
            </div>
        </Authenticated>
    );
}
