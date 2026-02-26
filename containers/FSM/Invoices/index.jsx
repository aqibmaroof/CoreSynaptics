"use client";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import { FaCircle } from "react-icons/fa";
import { useState } from "react";

export default function KanbanBoard() {
const [searchTerm, setSearchTerm] = useState("");
const tasks = [
    {
      id: 1,
      invoiceNumber: "INV - 5849496",
      date: "3/10/2024",
      dueDate: "3/10/2024",
      total: "$250",
      balance: "--",
      status: "Paid",
    },
    {
      id: 2,
      invoiceNumber: "INV - 5849496",
      date: "3/10/2024",
      dueDate: "3/10/2024",
      total: "$250",
      balance: "--",
      status: "Not Paid",
    },
    {
      id: 3,
      invoiceNumber: "INV - 5849496",
      date: "3/10/2024",
      dueDate: "3/10/2024",
      total: "$250",
      balance: "--",
      status: "Not Paid",
    },
    {
      id: 4,
      invoiceNumber: "INV - 5849496",
      date: "3/10/2024",
      dueDate: "3/10/2024",
      total: "$250",
      balance: "--",
      status: "Paid",
    },
    {
      id: 5,
      invoiceNumber: "INV - 5849496",
      date: "3/10/2024",
      dueDate: "3/10/2024",
      total: "$250",
      balance: "--",
      status: "Paid",
    },
    
  ];
  return(
    <div className="min-h-screen font-gilroy p-6 text-[#101437] dark:text-white">
        {/* Stats */}
        <h1 className="text-xl font-bold">Overview</h1>
        <div className="flex items-center justify-between w-full gap-12 mt-2">
            <div className="flex items-center justify-left gap-6 w-full ">
                <p className="text-7xl font-bold font-gilroy">147</p>
                <div className="flex flex-col items-start justify-end text-sm">
                <p>
                    Invoices Paid
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-6 w-full">
                <p className="font-bold text-7xl">120</p>
                <div className="flex flex-col items-right justify-end text-sm">
                <p>
                    Invoices Unpaid
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-6 w-full">
                <p className="font-bold text-7xl">27</p>
                <div className="flex flex-col items-start justify-end text-sm">
                <p>
                    Invoices Cancelled 
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-6 w-full">
                <p className="text-7xl font-bold ">27</p>
                <div className="flex flex-col items-start justify-end text-right text-base">
                <p>
                    Total Invoices
                </p>
                </div>
            </div>
        </div>
        {/* Task List */}
            <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-white mt-5 ml-4 text-2xl font-bold">All Invoices</h1>
                    <div className="flex items-center gap-5">
                        <button
                        className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white px-4 py-2 border-none rounded-xl transition-all cursor-pointer"
                        >
                        <div className="flex flex-row gap-2">
                            <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4 "
                            />
                            </svg>
                            <span>Create</span>
                        </div>
                        </button>
                        <button className="flex items-center justify-center gap-2 text-white text-sm flex items-center gap-1 hover:text-gray-300 transition-colors">
                        <span className="text-gray-100 text-sm">Sort by</span>
                        Top
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
                        </button>
                    </div>
                </div>
                {/* Filters and Search */}
                <div className="flex items-center gap-4 mb-6 ml-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <svg
                        className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                        </svg>
                        <input
                        type="text"
                        placeholder="Search PMs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                        />
                    </div>
        
                    {/* Dropdown Filters */}
                    <select className="bg-transparent text-white px-3 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
                        <option>Projects</option>
                    </select>
            
                    <select className="bg-transparent text-white px-3 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
                        <option>Country</option>
                    </select>

                    <select className="bg-transparent text-white px-3 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
                        <option>Status</option>
                    </select>
        
                    {/* Action Buttons */}
                    <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
                        <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            strokeWidth={2}
                            d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                        />
                        </svg>
                    </button>
            
                    <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
                        <svg 
                            width="15" height="17" 
                            viewBox="0 0 15 17" fill="none" 
                            xmlns="http://www.w3.org/2000/svg">
                        <path 
                            d="M3.75 11.25C2.09315 11.25 0.75 9.90685 0.75 8.25C0.75 6.81971 1.75092 5.6232 3.09053 5.32271C3.03127 5.05796 3 4.78263 3 4.5C3 2.42893 4.67893 0.75 6.75 0.75C8.56448 0.75 10.078 2.03869 10.4251 3.75073C10.45 3.75025 10.475 3.75 10.5 3.75C12.5711 3.75 14.25 5.42893 14.25 7.5C14.25 9.31422 12.9617 10.8275 11.25 11.175M9.75 9L7.5 6.75M7.5 6.75L5.25 9M7.5 6.75L7.5 15.75" 
                            stroke="white" stroke-width="1.5" 
                            stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>

                    </button>
            
                    <button className="bg-[#F2F962] text-[#0a1128] p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20">
                        <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
                        />
                        </svg>
                    </button>
                </div>
                {/* Table */}
                <div className="overflow-x-auto ml-4">
                <table className="w-full">
                    <thead className="bg-[#080C26] rounded-2xl">
                    <tr className="rounded-2xl">
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Invoice Number
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Date
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Due Date
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Total
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Balance
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Status
                        </th>
                        <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Action
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {tasks.map((task, index) => (
                        <tr
                        key={task.id}
                        className=" hover:bg-white/5 transition-colors"
                        
                        >
                        <td className="py-4 px-2">
                            <input
                            type="checkbox"
                            className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                            />
                        </td>
                        <td className="py-4 px-2 text-xs ">{task.invoiceNumber}</td>
                        <td className="py-4 px-2 text-xs">{task.date}</td>
                        <td className="py-4 px-2 text-gray-400 text-xs">
                            {task.dueDate}
                        </td>
                        <td className="py-4 px-2 text-[14px]">
                           
                            {task.total}
                        </td>
                        <td className="py-4 px-2  text-[14px]">
                            
                            {task.balance}
                        </td>
                        <td className="py-4 px-2  text-[14px]">
                            
                            <span 
                                className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                    task.status === "Paid"
                                    ? "bg-[#00E691] text-white"
                                    : task.status === "Not Paid"
                                        ? "bg-[#757B8C] text-white"
                                        : "bg-[#00E691] text-white"
                                }`}
                                >
                                {task.status}
                            </span>
                        </td>
                        
                        <td className="py-4 px-2 ">
                            <div className="flex items-center gap-2 text-[14px]">
                            <button className="text-gray-400 hover:text-white transition-colors p-2">
                                <FiMessageCircle className="text-white" />
                            </button>
                            <button className="text-gray-400 hover:text-yellow-400 transition-colors p-2">
                                <FiStar className="text-white" />
                            </button>
                            <button className="text-gray-400 hover:text-blue-400 transition-colors p-2">
                                <FaPencil className="text-white text-[12px]" />
                            </button>
                            <button className="text-gray-400 hover:text-white transition-colors p-2">
                                <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                />
                                </svg>
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
    </div>
  );
}