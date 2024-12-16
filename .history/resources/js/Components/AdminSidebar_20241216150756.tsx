import React, { useState } from "react";
import NavLink from "./NavLink";
import {
    Bell,
    BookImage,
    Brain,
    BugIcon,
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    Cog,
    Earth,
    Flower,
    Folder,
    HandCoins,
    Handshake,
    LayoutDashboard,
    Leaf,
    NotebookTextIcon,
    Tractor,
    TreePalm,
    Wheat,
    Wrench,
} from "lucide-react";
import { User } from "@/types";

type Props = {
    user: {
        pfp: string;
        firstname: string;
        lastname: string;
        email: string;
        role: "admin" | "super admin";
    };
};

export default function AdminSidebar({ user }: Props) {
    const [expanded, setExpanded] = useState(true);
    const [isAllocationOpen, setIsAllocationOpen] = useState(false);
    const [isCommodityOpen, setIsCommodityOpen] = useState(false);
    const [isCropDamagesOpen, setIsCropDamagesOpen] = useState(false);

    return (
        <div
            className={`fixed mt-20 p-5 overflow-hidden bg-white rounded-[1rem] ml-3 shadow ${
                expanded ? "w-[20rem]" : "w-[10rem]"
            }`}
        >
            <button
                onClick={() => setExpanded((curr) => !curr)}
                className="transition-all mb-5"
            >
                {expanded ? (
                    <ChevronFirst size={24} />
                ) : (
                    <ChevronLast size={24} />
                )}
            </button>

            <ul>
                <span className="ml-2 mb-4 text-sm text-slate-400">Main</span>
                <li className="text-m mb-5">
                    <NavLink
                        href={route("admin.dashboard")}
                        active={route().current("admin.dashboard")}
                    >
                        <div className="flex gap-2">
                            <LayoutDashboard size={20} />
                            {expanded && <span>Dashboard</span>}
                        </div>
                    </NavLink>
                </li>

                <span className="ml-2 mb-4 text-sm text-slate-400">List</span>

                <li className="text-m mb-4">
                    <NavLink
                        href={route("admin.farmers.index")}
                        active={route().current("admin.farmers.index")}
                    >
                        <div className="flex gap-2">
                            <Wheat size={20} />
                            {expanded && <span>Farmer</span>}
                        </div>
                    </NavLink>
                </li>

                <li
                    className="text-sm cursor-pointer font-medium p-2"
                    onClick={() =>
                        setIsCommodityOpen((prevState) => !prevState)
                    }
                >
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Leaf size={20} />
                            {expanded && <span>Commodity</span>}
                        </div>
                        <ChevronDown size={20} />
                    </div>
                </li>
                {isCommodityOpen && (
                    <ul className="ml-6 transition-all duration-300 overflow-hidden">
                        <li>
                            <NavLink
                                href={route("admin.commodity.index")}
                                active={route().current(
                                    "admin.commodity.index"
                                )}
                            >
                                <div className="flex gap-2">
                                    <TreePalm size={20} />
                                    {expanded && <span>Category</span>}
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={route("admin/commodity/list/index")}
                                active={route().current(
                                    "admin/commodity/list/index"
                                )}
                            >
                                <div className="flex gap-2">
                                    <NotebookTextIcon size={19} />
                                    {expanded && <span>asList</span>}
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                )}

                <li
                    className="text-sm cursor-pointer font-medium p-2"
                    onClick={() =>
                        setIsAllocationOpen((prevState) => !prevState)
                    }
                >
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Handshake size={20} />
                            {expanded && <span>Allocation</span>}
                        </div>
                        <ChevronDown size={20} />
                    </div>
                </li>
                {isAllocationOpen && (
                    <ul className="ml-6 transition-all duration-300 overflow-hidden">
                        <li>
                            <NavLink
                                href={route("admin.allocation.type.index")}
                                active={route().current(
                                    "admin.allocation.type.index"
                                )}
                            >
                                <div className="flex gap-2">
                                    <HandCoins size={20} />
                                    {expanded && <span>AsType</span>}
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={route("admin.allocations.index")}
                                active={route().current(
                                    "admin.allocations.index"
                                )}
                            >
                                <div className="flex gap-2">
                                    <NotebookTextIcon size={19} />
                                    {expanded && <span>Records</span>}
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                )}

                <li
                    className="text-sm cursor-pointer font-medium p-2"
                    onClick={() =>
                        setIsCropDamagesOpen((prevState) => !prevState)
                    }
                >
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <BugIcon size={20} />
                            {expanded && <span>Damages</span>}
                        </div>
                        <ChevronDown size={20} />
                    </div>
                </li>
                {isCropDamagesOpen && (
                    <ul className="ml-6 transition-all duration-300 overflow-hidden">
                        <li>
                            <NavLink
                                href={route("admin.crop.damage.show")}
                                active={route().current(
                                    "admin.crop.damage.show"
                                )}
                            >
                                <div className="flex gap-2">
                                    <HandCoins size={20} />
                                    {expanded && <span>Type</span>}
                                </div>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                href={route("admin.crop.damages.index")}
                                active={route().current(
                                    "admin.crop.damages.index"
                                )}
                            >
                                <div className="flex gap-2">
                                    <NotebookTextIcon size={19} />
                                    {expanded && <span>Records</span>}
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                )}

                <li className="text-m">
                    <NavLink
                        href={route("admin.crop.activity.index")}
                        active={route().current("admin.crop.activity.index")}
                    >
                        <div className="flex gap-2">
                            <BookImage size={20} />
                            {expanded && <span>Crop Activity</span>}
                        </div>
                    </NavLink>
                </li>

                <br />
                <span className="ml-2 mb-4 text-sm text-slate-400">
                    Reports
                </span>
                <li className="text-m">
                    <NavLink
                        href={route("admin.recommendations.index")}
                        active={route().current("admin.recommendations.index")}
                    >
                        <div className="flex gap-2">
                            <Brain size={20} />
                            {expanded && <span>Recommendation</span>}
                        </div>
                    </NavLink>
                </li>
            </ul>
        </div>
    );
}
