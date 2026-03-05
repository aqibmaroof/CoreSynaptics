"use client";
import RevenueCard from "@/components/Cards/RevenueCard";
import { useState } from "react";
import TransactionCard from "@/components/Cards/TransactionCard";
import RevenueDetails from "@/components/Cards/RevenueDetails";
import { getUser } from "../../../services/instance/tokenService";
import SalesOverview from "@/components/Cards/SalesOverview";
import RevenueStates from "@/components/Cards/RevenueStates";

export default function Warehouse() {
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
      status: "In-Stock",
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
      status: "In-Stock",
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
      status: "Out of Stock",
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
      status: "Out of Stock",
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
      status: "Low Stock",
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
      status: "In-Stock",
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
      status: "In-Stock",
      avatar: "/api/placeholder/40/40",
    },
  ];

  return (
    <div className="min-h-screen font-gilroy p-6 text-white">
      {/* STATS */}
      <div className="px-5">
        <RevenueDetails user={JSON.parse(getUser())} />
        {/* <StatsCards /> */}
      </div>
      <div className="flex justify-between gap-5 w-full py-5 font-gilroy">
        <TransactionCard data={transactionsData} heading="Sales / Revenue" />

        <SalesOverview />
      </div>

      <div className="flex justify-between gap-5 w-full pb-5 font-gilroy">
        <RevenueCard />
        <RevenueStates />
      </div>
      {/* TABLE */}
      <div className="flex w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl card">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white mt-5 ml-4 text-3xl">
            Best Selling Products
          </h1>
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
              placeholder="Search Products"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1128] text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Dropdown Filters */}
          <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
            <option>Manufacturer</option>
            <option>All Projects</option>
            <option>Active Projects</option>
          </select>

          <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
            <option>Stock</option>
            <option>Netherlands</option>
            <option>USA</option>
            <option>UK</option>
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
                  Product Name
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  CERUPS461
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Serial Number
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Manufacturer
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Earnings
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Sales
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Stock
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
                        manager.status === "In-Stock"
                          ? "bg-[#00E691] text-white"
                          : manager.status === "Low Stock"
                          ? "bg-[#FF6637] text-white"
                          : "bg-[#6E7492] text-white"
                      }`}
                    >
                      {manager.status}
                    </span>
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
