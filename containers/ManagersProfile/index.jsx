"use client";

import ManagersProjects from "@/components/Cards/ManagersProjects";
import RevenueCard from "@/components/Cards/RevenueCard";
import { useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import TransactionCard from "../../components/Cards/TransactionCard";

export default function ManagersProfile() {
  const [searchTerm, setSearchTerm] = useState("");

  const transactionsData = {
    title: "Transactions",
    transactions: [
      {
        type: "Paypal",
        description: "Send money",
        amount: "+82.6",
        currency: "USD",
        iconBg: "bg-red-100",
        iconColor: "text-red-500",
        icon: "P",
      },
      {
        type: "Wallet",
        description: "Mac'D",
        amount: "+270.69",
        currency: "USD",
        iconBg: "bg-green-100",
        iconColor: "text-green-500",
        icon: "W",
      },
      {
        type: "Transfer",
        description: "Refund",
        amount: "+637.91",
        currency: "USD",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-500",
        icon: "T",
      },
      {
        type: "Credit Card",
        description: "Ordered Food",
        amount: "-838.71",
        currency: "USD",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-500",
        icon: "C",
      },
      {
        type: "Wallet",
        description: "Starbucks",
        amount: "+203.33",
        currency: "USD",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-500",
        icon: "W",
      },
      {
        type: "Mastercard",
        description: "Ordered Food",
        amount: "-92.45",
        currency: "USD",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-500",
        icon: "M",
      },
    ],
  };

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
      <div className="w-full flex items-center gap-4 justify-center mb-8 ">
        <div className="flex bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl w-full max-w-sm h-full">
          {/* Card Container */}
          <div className="p-4">
            {/* Profile Avatar and Name */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-4 overflow-hidden">
                <img
                  src="/images/profile.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-white text-xl font-semibold mb-1">
                Chris Frieddy
              </h2>
              <p className="text-gray-400 text-md">ID:W3589128</p>
            </div>

            {/* General Info Section */}
            <div className="mb-8">
              <h3 className="text-white text-md font-semibold mb-4">
                General Info
              </h3>

              {/* Info Grid */}
              <div className="space-y-4">
                {/* Email Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-0.5">Email</p>
                      <p className="text-white text-sm">
                        chrisfireddy32@gmail.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone and Date Row */}
                <div className="flex items-center justify-between gap-6">
                  {/* Phone */}
                  <div className="flex items-center ">
                    <div>
                      <p className="text-gray-400 text-sm mb-0.5">Phone</p>
                      <p className="text-white text-sm">+1 234 567 890</p>
                    </div>
                  </div>

                  {/* Date Joined */}
                  <div className="flex items-center gap-3 flex-1">
                    <div>
                      <p className="text-gray-400 text-sm mb-0.5">
                        Date Joined
                      </p>
                      <p className="text-white text-sm">12/10/2024</p>
                    </div>
                  </div>
                </div>

                {/* Country Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-gray-400 text-sm mb-0.5">Country</p>
                      <p className="text-white text-sm">Netherlands</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-xl">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-400 text-sm font-medium">
                  Active
                </span>
              </div>
            </div>

            {/* Send Message Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50">
              Send Message
            </button>
          </div>
        </div>
        <div className="w-full">
          <div>
            <ManagersProjects />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex justify-center gap-5 w-full px-5 pt-5 font-gilroy">
              <RevenueCard />
              <TransactionCard
                data={transactionsData}
                heading="Sales / Revenue"
              />
            </div>
          </div>
        </div>
      </div>
      {/* TABLE */}
      <div className="flex w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl card">
        {/* Header */}
        <div className="flex flex-row md:flex-row gap-4 justify-between mb-8">
          <h1 className="text-white mt-5 ml-4 text-xl md:text-3xl">Projects</h1>
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-6 ml-4">
          <div className="flex gap-2 w-full md:w-full">
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
                placeholder="Search Projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a1128] text-white placeholder-white pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>

            {/* Dropdown Filters */}
            <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
              <option>Client</option>
              <option>All Projects</option>
              <option>Active Projects</option>
            </select>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
              <option>Last Modified</option>
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
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
                  className=" hover:bg-white/5 transition-colors"
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
