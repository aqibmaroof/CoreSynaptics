"use client";

import { useState } from "react";
import WarehouseDetails from "@/components/Cards/WarehouseDetails";
import { getUser } from "../../../services/instance/tokenService";
import RevenueStates from "@/components/Cards/RevenueStates";
import InventoryStatus from "@/components/Cards/InventoryStatus";
import WarehouseAnalysis from "@/components/Cards/WarehouseAnalysis";
import PurchaseReport from "@/components/Cards/PurchaseReport";

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
        <WarehouseDetails user={JSON.parse(getUser())} />
        {/* <StatsCards /> */}
      </div>
      <div className="flex justify-center gap-10 w-full  py-5 font-gilroy">
        <WarehouseAnalysis />
      </div>

      <div className="flex justify-between gap-5 w-full pb-5 font-gilroy">
        <InventoryStatus />
        <PurchaseReport />
      </div>
      {/* TABLE */}
      <div className="flex w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl card">
        {/* Header */}
        <div className="flex flex-row md:flex-row gap-4 justify-between mb-8">
          <h1 className="text-white mt-5 ml-4 text-xl md:text-2xl">Best Selling Products</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Sort by</span>
            <button className="text-white font-semibold text-sm flex items-center gap-1 hover:text-gray-300 transition-colors">
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
                placeholder="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a1128] text-white placeholder-white pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
              <option>Manufacturer</option>
              <option>Netherlands</option>
              <option>USA</option>
              <option>UK</option>
            </select>

            {/* Dropdown Filters */}
            
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            

            <select className="bg-[#0a1128] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
              <option>Stock</option>
              <option>Active</option>
              <option>In-active</option>
            </select>

            {/* Action Buttons */}
            <button className="bg-[#0a1128] text-white p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
              <svg 
                width="14" height="14" 
                viewBox="0 0 14 14" fill="none" 
                xmlns="http://www.w3.org/2000/svg">
                <path 
                d="M6.75 2.25V0.75M6.75 2.25C5.92157 2.25 5.25 2.92157 5.25 3.75C5.25 4.57843 5.92157 5.25 6.75 5.25M6.75 2.25C7.57843 2.25 8.25 2.92157 8.25 3.75C8.25 4.57843 7.57843 5.25 6.75 5.25M2.25 11.25C3.07843 11.25 3.75 10.5784 3.75 9.75C3.75 8.92157 3.07843 8.25 2.25 8.25M2.25 11.25C1.42157 11.25 0.75 10.5784 0.75 9.75C0.75 8.92157 1.42157 8.25 2.25 8.25M2.25 11.25V12.75M2.25 8.25V0.75M6.75 5.25V12.75M11.25 11.25C12.0784 11.25 12.75 10.5784 12.75 9.75C12.75 8.92157 12.0784 8.25 11.25 8.25M11.25 11.25C10.4216 11.25 9.75 10.5784 9.75 9.75C9.75 8.92157 10.4216 8.25 11.25 8.25M11.25 11.25V12.75M11.25 8.25V0.75" 
                stroke="white" stroke-width="1.5" 
                stroke-linecap="round" stroke-linejoin="round"/>
              </svg>

            </button>

            <button className="bg-[#0a1128] text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
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
                width="18" height="18" 
                viewBox="0 0 18 18" fill="none" 
                xmlns="http://www.w3.org/2000/svg">
                <path 
                d="M6.75 3.75H5.25C4.42157 3.75 3.75 4.42157 3.75 5.25V14.25C3.75 15.0784 4.42157 15.75 5.25 15.75H12.75C13.5784 15.75 14.25 15.0784 14.25 14.25V5.25C14.25 4.42157 13.5784 3.75 12.75 3.75H11.25M6.75 3.75C6.75 4.57843 7.42157 5.25 8.25 5.25H9.75C10.5784 5.25 11.25 4.57843 11.25 3.75M6.75 3.75C6.75 2.92157 7.42157 2.25 8.25 2.25H9.75C10.5784 2.25 11.25 2.92157 11.25 3.75" 
                stroke="#08080C" stroke-width="1.5" 
                stroke-linecap="round"
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
