"use client";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

export default function KanbanBoard() {
const fieldSevrice = [
{
id: 1,
requestName: "REQ21",
summary: "AC Repair",
status: "New",
priority: "High",
ter: "Zyl",
},
{
id: 2,
requestName: "REQ21",
summary: "AC Repair",
status: "New",
priority: "High",
ter: "Zyl",
},
{
id: 3,
requestName: "REQ21",
summary: "AC Repair",
status: "New",
priority: "Medium",
ter: "Zyl",
},
{
id: 4,
requestName: "REQ21",
summary: "AC Repair",
status: "New",
priority: "Critical",
ter: "Zyl",
},

];
    return(
        <div className="min-h-screen font-gilroy p-6 text-[#101437] dark:text-white">
            {/* Stats */}
            <h1 className="text-xl font-bold">Overview</h1>
            <div className="flex items-center justify-between w-full gap-3 mt-2">
                <div className="flex items-center justify-left gap-6 w-full ">
                    <p className="text-7xl font-bold font-gilroy">1050</p>
                    <div className="flex flex-col items-start justify-end text-sm w-30">
                    <p>
                        Total Work Orders
                    </p>
                    <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ">
                        <FiArrowUp />
                        20%
                    </p>
                    </div>
                </div>
                <div className="flex items-center justify-left gap-6 w-full">
                    <p className="font-bold text-7xl">877</p>
                    <div className="flex flex-col items-right justify-end text-sm ">
                    <p>
                        Completed Work Orders
                    </p>
                    <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ">
                        <FiArrowDown />
                        10%
                    </p>
                    </div>
                </div>
                <div className="flex items-center justify-left gap-6 w-full">
                    <p className="font-bold text-7xl">154</p>
                    <div className="flex flex-col items-start justify-end text-sm">
                    <p>
                        Total Service Appointments
                    </p>
                    <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ">
                        <FiArrowUp />
                        22%
                    </p>
                    </div>
                </div>
                <div className="flex items-center justify-left gap-6 w-full">
                    <p className="text-7xl font-bold ">89</p>
                    <div className="flex flex-col items-start justify-end text-right text-sm">
                    <p>
                        Completed Service Appointments
                    </p>
                    <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ">
                        <FiArrowUp />
                        22%
                    </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-5">
                <div className="flex mt-5 w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-2xl card">
                    <div className="flex items-center justify-between gap-4">
                    <h1 className="text-white text-xl font-gilroy font-bold">New Requests</h1>
                    {/* Sort by */}
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="text-white/80 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                        >
                            Sort by <span className="font-semibold">Top</span>
                            <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                            </svg>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1e3a8a] rounded-box w-40 mt-2"
                        >
                            <li>
                            <a className="text-white hover:bg-white/10">Daily</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Weekly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Monthly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Yearly</a>
                            </li>
                        </ul>
                    </div>
                    </div>
                    <div className="overflow-x-auto mt-6">
                    <table className="table text-center">
                        {/* head */}
                        <thead>
                        <tr className="bg-[#080C26]">
                            <th className="text-white rounded-tl-full rounded-bl-full border-none">#</th>
                            <th className="text-white border-none">Request Name</th>
                            <th className="text-white border-none">Summary</th>
                            <th className="text-white border-none">Status</th>
                            <th className="text-white border-none">Priority</th>
                            <th className="text-white rounded-tr-full rounded-br-full border-none">
                            Ter
                            </th>
                        </tr>
                        </thead>
                        <tbody >
                        {fieldSevrice.map((manager, index) => (
                            <tr
                            key={manager.id}
                            className="hover:bg-white/5 transition-colors"
                            >
                            <td className="py-4">
                                <input type="checkbox" className="checkbox checkbox-sm" />
                            </td>
                            <td className="py-4 text-gray-100 text-xs">{manager.requestName}</td>
                            <td className="py-4 text-gray-100 text-xs">{manager.summary}</td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.status === "New"
                                    ? "bg-[#0075FF] text-white"
                                    : manager.status === "Paid"
                                        ? "bg-[#00E691] text-white"
                                        : "bg-[#00E691] text-white"
                                }`}
                                >
                                {manager.status}
                                </span>
                            </td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.priority === "High"
                                    ? "bg-[#FF6637] text-white"
                                    : manager.priority === "Critical"
                                        ? "bg-[#FF0000] text-white"
                                        : "bg-[#757B8C] text-white"
                                }`}
                                >
                                {manager.priority}
                                </span>
                            </td>
                            {/* <td className="py-4 text-gray-100 text-xs">{manager.priority}</td> */}
                            <td className="py-4 text-gray-100 text-xs">{manager.ter}</td>

                            
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="flex mt-5 w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-2xl card">
                    <div className="flex items-center justify-between gap-4">
                    <h1 className="text-white text-xl font-gilroy font-bold">New Work Orders</h1>
                    {/* Sort by */}
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="text-white/80 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                        >
                            Sort by <span className="font-semibold">Top</span>
                            <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                            </svg>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1e3a8a] rounded-box w-40 mt-2"
                        >
                            <li>
                            <a className="text-white hover:bg-white/10">Daily</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Weekly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Monthly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Yearly</a>
                            </li>
                        </ul>
                    </div>
                    </div>
                    <div className="overflow-x-auto mt-6">
                    <table className="table text-center">
                        {/* head */}
                        <thead>
                        <tr className="bg-[#080C26]">
                            <th className="text-white rounded-tl-full rounded-bl-full border-none">#</th>
                            <th className="text-white border-none">Request Name</th>
                            <th className="text-white border-none">Summary</th>
                            <th className="text-white border-none">Status</th>
                            <th className="text-white border-none">Priority</th>
                            <th className="text-white rounded-tr-full rounded-br-full border-none">
                            Ter
                            </th>
                        </tr>
                        </thead>
                        <tbody >
                        {fieldSevrice.map((manager, index) => (
                            <tr
                            key={manager.id}
                            className="hover:bg-white/5 transition-colors"
                            >
                            <td className="py-4">
                                <input type="checkbox" className="checkbox checkbox-sm" />
                            </td>
                            <td className="py-4 text-gray-100 text-xs">{manager.requestName}</td>
                            <td className="py-4 text-gray-100 text-xs">{manager.summary}</td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.status === "New"
                                    ? "bg-[#0075FF] text-white"
                                    : manager.status === "Paid"
                                        ? "bg-[#00E691] text-white"
                                        : "bg-[#00E691] text-white"
                                }`}
                                >
                                {manager.status}
                                </span>
                            </td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.priority === "High"
                                    ? "bg-[#FF6637] text-white"
                                    : manager.priority === "Critical"
                                        ? "bg-[#FF0000] text-white"
                                        : "bg-[#757B8C] text-white"
                                }`}
                                >
                                {manager.priority}
                                </span>
                            </td>
                            {/* <td className="py-4 text-gray-100 text-xs">{manager.priority}</td> */}
                            <td className="py-4 text-gray-100 text-xs">{manager.ter}</td>

                            
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>

            <div className="flex gap-5">
                <div className="flex mt-5 w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-2xl card">
                    <div className="flex items-center justify-between gap-4">
                    <h1 className="text-white text-xl font-gilroy font-bold">Approved Estimates</h1>
                    {/* Sort by */}
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="text-white/80 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                        >
                            Sort by <span className="font-semibold">Top</span>
                            <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                            </svg>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1e3a8a] rounded-box w-40 mt-2"
                        >
                            <li>
                            <a className="text-white hover:bg-white/10">Daily</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Weekly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Monthly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Yearly</a>
                            </li>
                        </ul>
                    </div>
                    </div>
                    <div className="overflow-x-auto mt-6">
                    <table className="table text-center">
                        {/* head */}
                        <thead>
                        <tr className="bg-[#080C26]">
                            <th className="text-white rounded-tl-full rounded-bl-full border-none">#</th>
                            <th className="text-white border-none">Request Name</th>
                            <th className="text-white border-none">Summary</th>
                            <th className="text-white border-none">Status</th>
                            <th className="text-white border-none">Priority</th>
                            <th className="text-white rounded-tr-full rounded-br-full border-none">
                            Ter
                            </th>
                        </tr>
                        </thead>
                        <tbody >
                        {fieldSevrice.map((manager, index) => (
                            <tr
                            key={manager.id}
                            className="hover:bg-white/5 transition-colors"
                            >
                            <td className="py-4">
                                <input type="checkbox" className="checkbox checkbox-sm" />
                            </td>
                            <td className="py-4 text-gray-100 text-xs">{manager.requestName}</td>
                            <td className="py-4 text-gray-100 text-xs">{manager.summary}</td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.status === "New"
                                    ? "bg-[#0075FF] text-white"
                                    : manager.status === "Paid"
                                        ? "bg-[#00E691] text-white"
                                        : "bg-[#00E691] text-white"
                                }`}
                                >
                                {manager.status}
                                </span>
                            </td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.priority === "High"
                                    ? "bg-[#FF6637] text-white"
                                    : manager.priority === "Critical"
                                        ? "bg-[#FF0000] text-white"
                                        : "bg-[#757B8C] text-white"
                                }`}
                                >
                                {manager.priority}
                                </span>
                            </td>
                            {/* <td className="py-4 text-gray-100 text-xs">{manager.priority}</td> */}
                            <td className="py-4 text-gray-100 text-xs">{manager.ter}</td>

                            
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="flex mt-5 w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-2xl card">
                    <div className="flex items-center justify-between gap-4">
                    <h1 className="text-white text-xl font-gilroy font-bold">Estimates Waiting for Approval</h1>
                    {/* Sort by */}
                    <div className="dropdown dropdown-end">
                        <label
                            tabIndex={0}
                            className="text-white/80 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                        >
                            Sort by <span className="font-semibold">Top</span>
                            <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                            </svg>
                        </label>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1e3a8a] rounded-box w-40 mt-2"
                        >
                            <li>
                            <a className="text-white hover:bg-white/10">Daily</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Weekly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Monthly</a>
                            </li>
                            <li>
                            <a className="text-white hover:bg-white/10">Yearly</a>
                            </li>
                        </ul>
                    </div>
                    </div>
                    <div className="overflow-x-auto mt-6">
                    <table className="table text-center">
                        {/* head */}
                        <thead>
                        <tr className="bg-[#080C26]">
                            <th className="text-white rounded-tl-full rounded-bl-full border-none">#</th>
                            <th className="text-white border-none">Request Name</th>
                            <th className="text-white border-none">Summary</th>
                            <th className="text-white border-none">Status</th>
                            <th className="text-white border-none">Priority</th>
                            <th className="text-white rounded-tr-full rounded-br-full border-none">
                            Ter
                            </th>
                        </tr>
                        </thead>
                        <tbody >
                        {fieldSevrice.map((manager, index) => (
                            <tr
                            key={manager.id}
                            className="hover:bg-white/5 transition-colors"
                            >
                            <td className="py-4">
                                <input type="checkbox" className="checkbox checkbox-sm" />
                            </td>
                            <td className="py-4 text-gray-100 text-xs">{manager.requestName}</td>
                            <td className="py-4 text-gray-100 text-xs">{manager.summary}</td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.status === "New"
                                    ? "bg-[#0075FF] text-white"
                                    : manager.status === "Paid"
                                        ? "bg-[#00E691] text-white"
                                        : "bg-[#00E691] text-white"
                                }`}
                                >
                                {manager.status}
                                </span>
                            </td>
                            <td className="py-4">
                                <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    manager.priority === "High"
                                    ? "bg-[#FF6637] text-white"
                                    : manager.priority === "Critical"
                                        ? "bg-[#FF0000] text-white"
                                        : "bg-[#757B8C] text-white"
                                }`}
                                >
                                {manager.priority}
                                </span>
                            </td>
                            {/* <td className="py-4 text-gray-100 text-xs">{manager.priority}</td> */}
                            <td className="py-4 text-gray-100 text-xs">{manager.ter}</td>

                            
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
        </div>
    );
}