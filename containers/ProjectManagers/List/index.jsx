"use client";

import ManagersOverview from "@/components/ManagersOverview";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";

export default function ProjectManagersList() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const managers = [
    {
      id: 1,
      name: "Chris Frieddy",
      email: "chrisfireddy32@gmail.com",
      pmId: "W12389128",
      dateJoined: "3/10/2024",
      projectsDone: 15,
      country: "Netherlands",
      status: "Active",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 2,
      name: "Chris Frieddy",
      email: "chrisfireddy32@gmail.com",
      pmId: "W12389128",
      dateJoined: "3/10/2024",
      projectsDone: 15,
      country: "Netherlands",
      status: "Active",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 3,
      name: "Chris Frieddy",
      email: "chrisfireddy32@gmail.com",
      pmId: "W12389128",
      dateJoined: "3/10/2024",
      projectsDone: 15,
      country: "Netherlands",
      status: "In-active",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 4,
      name: "Chris Frieddy",
      email: "chrisfireddy32@gmail.com",
      pmId: "W12389128",
      dateJoined: "3/10/2024",
      projectsDone: 15,
      country: "Netherlands",
      status: "In-active",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 5,
      name: "Chris Frieddy",
      email: "chrisfireddy32@gmail.com",
      pmId: "W12389128",
      dateJoined: "3/10/2024",
      projectsDone: 15,
      country: "Netherlands",
      status: "In-active",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 6,
      name: "Chris Frieddy",
      email: "chrisfireddy32@gmail.com",
      pmId: "W12389128",
      dateJoined: "3/10/2024",
      projectsDone: 15,
      country: "Netherlands",
      status: "In-active",
      avatar: "/api/placeholder/40/40",
    },
    {
      id: 7,
      name: "Chris Frieddy",
      email: "chrisfireddy32@gmail.com",
      pmId: "W12389128",
      dateJoined: "3/10/2024",
      projectsDone: 15,
      country: "Netherlands",
      status: "In-active",
      avatar: "/api/placeholder/40/40",
    },
  ];
  

  return (
    <div className="min-h-screen font-gilroy p-6 text-white">
      {/* STATS */}
      <ManagersOverview />

      {/* TABLE */}
      <div className="flex w-full bg-gradient-to-r  from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-2 rounded-3xl card">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white mt-5 ml-4 text-3xl">Projects</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by</span>
            <button className="text-white font-semibold text-sm flex items-center gap-1 hover:text-gray-300 transition-colors">
              Newest
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
              className="w-full bg-[#0a1128] text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Dropdown Filters */}
          <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
            <option>Projects</option>
            <option>All Projects</option>
            <option>Active Projects</option>
          </select>

          <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
            <option>Country</option>
            <option>Netherlands</option>
            <option>USA</option>
            <option>UK</option>
          </select>

          <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
            <option>Status</option>
            <option>Active</option>
            <option>In-active</option>
          </select>

          {/* Action Buttons */}
          <button className="bg-[#0a1128] text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <button className="bg-[#0a1128] text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>

          <button className="bg-[#facc15] text-[#0a1128] p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20">
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
                d="M12 4v16m8-8H4"
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
                  Name
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Email
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  PM ID
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Date Joined
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Projects Done
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Country
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
              {managers.map((manager, index) => (
                <tr
                  key={manager.id}
                  className=" hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/Profile/Managers/${manager.id}`)}
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                      </div>
                      <span className="text-white font-medium">
                        {manager.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-400">{manager.email}</td>
                  <td className="py-4 px-4 text-gray-400">{manager.pmId}</td>
                  <td className="py-4 px-4 text-gray-400">
                    {manager.dateJoined}
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {manager.projectsDone}
                  </td>
                  <td className="py-4 px-4 text-gray-400">{manager.country}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                        manager.status === "Active"
                          ? "bg-[#00E691] text-white"
                          : "bg-[#6E7492] text-white"
                      }`}
                    >
                      {manager.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-white transition-colors p-2">
                        <FiMessageCircle className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-yellow-400 transition-colors p-2">
                        <FiStar className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors p-2">
                        <FaPencil className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors p-2">
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
