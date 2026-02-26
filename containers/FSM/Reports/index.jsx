"use client";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import { FaCircle } from "react-icons/fa";
import { useState } from "react";

export default function KanbanBoard() {
const tasks = [
    {
      id: 1,
      reportName: "Cancelled/Terminated Services",
      description: "List of Services Cancelled or Terminated",
      lastAcces: "3/10/2024, 10:00 AM",
      assignee: [{ id: 1, avatar: "/images/assignee1.jpg", },],
      createdBy: "Chris Friedkly",
    },
    {
      id: 2,
      reportName: "Cancelled/Terminated Services",
      description: "List of Services Cancelled or Terminated",
      lastAcces: "3/10/2024, 10:00 AM",
      assignee: [{ id: 1, avatar: "/images/assignee1.jpg", },],
      createdBy: "Chris Friedkly",
    },
    {
      id: 3,
      reportName: "Cancelled/Terminated Services",
      description: "List of Services Cancelled or Terminated",
      lastAcces: "3/10/2024, 10:00 AM",
      assignee: [{ id: 1, avatar: "/images/assignee1.jpg", },],
      createdBy: "Chris Friedkly",
    },
    {
      id: 4,
      reportName: "Cancelled/Terminated Services",
      description: "List of Services Cancelled or Terminated",
      lastAcces: "3/10/2024, 10:00 AM",
      assignee: [{ id: 1, avatar: "/images/assignee1.jpg", },],
      createdBy: "Chris Friedkly",
    },
    {
      id: 5,
      reportName: "Cancelled/Terminated Services",
      description: "List of Services Cancelled or Terminated",
      lastAcces: "3/10/2024, 10:00 AM",
      assignee: [{ id: 1, avatar: "/images/assignee1.jpg", },],
      createdBy: "Chris Friedkly",
    },
    
  ];
    return(
        <div className="min-h-screen flex flex-row gap-2 font-gilroy p-6 text-[#101437] dark:text-white">
            
            {/* Folder */}
            <div className="flex min-h-screen w-78 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-2 mt-8 rounded-2xl card">
                <div>
                    <select
                        className="text-xl font-bold p-1"
                        name="Create Task"
                        id="Create Task"
                    >
                        <option>Folder</option>
                    </select>
                </div>
                <div className="flex items-center justify-between mx-1 mt-4 gap-1 ">

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
                        placeholder="Search folder"
                        className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-2 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                        />
                    </div>
                    <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.75 2.25V0.75M6.75 2.25C5.92157 2.25 5.25 2.92157 5.25 3.75C5.25 4.57843 5.92157 5.25 6.75 5.25M6.75 2.25C7.57843 2.25 8.25 2.92157 8.25 3.75C8.25 4.57843 7.57843 5.25 6.75 5.25M2.25 11.25C3.07843 11.25 3.75 10.5784 3.75 9.75C3.75 8.92157 3.07843 8.25 2.25 8.25M2.25 11.25C1.42157 11.25 0.75 10.5784 0.75 9.75C0.75 8.92157 1.42157 8.25 2.25 8.25M2.25 11.25V12.75M2.25 8.25V0.75M6.75 5.25V12.75M11.25 11.25C12.0784 11.25 12.75 10.5784 12.75 9.75C12.75 8.92157 12.0784 8.25 11.25 8.25M11.25 11.25C10.4216 11.25 9.75 10.5784 9.75 9.75C9.75 8.92157 10.4216 8.25 11.25 8.25M11.25 11.25V12.75M11.25 8.25V0.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    
                </div>
                <div className="ml-2 mr-2">
                    <h2 className="p-2 mt-6 text-base font-gilroy font-regular">All Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">My Exported Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-4 text-base">Request Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Estimate Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Work Order Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Service Appointment Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Service & Parts Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Contact / Company Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Asset Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Other Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Custom Reports</h2>
                    <hr class="w-full my-1 bg-neutral-quaternary border-[#656A80]"></hr>
                    <h2 className="p-2 mt-1 text-base">Billing Reports</h2>
                </div>
            </div>

            <div className="flex min-h-screen w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-2 mt-8 rounded-2xl card">
                <div>
                    <h2 className="text-xl font-bold p-2">Search service & parts reports</h2>
                </div>
                <div className="flex items-center justify-between mx-2 mt-4 gap-1 ">
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
                        placeholder="Search service & parts reports"
                        className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-2 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                        />
                    </div>
                    <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.75 2.25V0.75M6.75 2.25C5.92157 2.25 5.25 2.92157 5.25 3.75C5.25 4.57843 5.92157 5.25 6.75 5.25M6.75 2.25C7.57843 2.25 8.25 2.92157 8.25 3.75C8.25 4.57843 7.57843 5.25 6.75 5.25M2.25 11.25C3.07843 11.25 3.75 10.5784 3.75 9.75C3.75 8.92157 3.07843 8.25 2.25 8.25M2.25 11.25C1.42157 11.25 0.75 10.5784 0.75 9.75C0.75 8.92157 1.42157 8.25 2.25 8.25M2.25 11.25V12.75M2.25 8.25V0.75M6.75 5.25V12.75M11.25 11.25C12.0784 11.25 12.75 10.5784 12.75 9.75C12.75 8.92157 12.0784 8.25 11.25 8.25M11.25 11.25C10.4216 11.25 9.75 10.5784 9.75 9.75C9.75 8.92157 10.4216 8.25 11.25 8.25M11.25 11.25V12.75M11.25 8.25V0.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                {/* Table */}
                <div className="overflow-x-auto ml-4 mt-8">
                <table className="w-full ">
                    <thead className="bg-[#080C26] rounded-2xl ">
                    <tr className="rounded-2xl">
                        <th className="text-left py-1 px-4 text-gray-400 font-medium text-sm">
                        #
                        </th>
                        <th className="text-left py-1 px-2 text-gray-400 font-medium text-sm">
                        Report Name
                        </th>
                        <th className="text-left py-1 px-4 text-gray-400 font-medium text-sm">
                        Description
                        </th>
                        <th className="text-left py-1 px-4 text-gray-400 font-medium text-sm">
                        Last Accessed
                        </th>
                        <th className="text-left py-1 px-4 text-gray-400 font-medium text-sm">
                        Created By
                        </th>
                        <th className="text-left py-1 px-4 text-gray-400 font-medium text-sm">
                        Action
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {tasks.map((task, index) => (
                        <tr
                        key={task.id}
                        className=" hover:bg-white/5 transition-colors cursor-pointer"
                        
                        >
                        <td className="py-4 px-4">
                            <input
                            type="checkbox"
                            className="checkbox checkbox-sm border-white [--chkbg:#3b82f6]"
                            />
                        </td>
                        <td className="py-4 px-1 text-xs ">{task.reportName}</td>
                        
                        <td className="py-4 px-4 text-gray-400 text-xs">
                            {task.description}
                        </td>
                        <td className="py-4 px-1 text-xs">
                            {task.lastAcces}
                        </td>
                        
                        <div className="flex items-center gap-1 text-xs">
                        <td className="flex items-center py-4 px-1 text-gray-400">
                            {task.assignee.map((item, index) => (
                            <div
                                key={index}
                                className={`avatar 
                                    ${index !== 0 ? "" : ""} 
                                    transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                                <div className="w-[35px] h-[35px] rounded-full ring-[#0C255B] shadow-xl">
                                <img
                                    src={item.avatar}
                                    alt={`User ${index}`}
                                    className="w-[35px] h-[35px] rounded-full object-cover"
                                />
                                </div>
                            </div>
                            ))}
                        </td>
                        <td className="py-4 px-1  text-xs">
                            {task.createdBy}
                        </td>
                        </div>
                        
                        <td className="py-4 px-1 ">
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