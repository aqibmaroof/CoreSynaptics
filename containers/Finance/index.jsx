"use client";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import TestCasesOverview from "../../components/Cards/TestCasesOverview";
import SalesOverview from "../../components/Cards/SalesOverview";
import ShipmentOverview from "@/components/Cards/ShipmentOverview";

export default function KanbanBoard() {
const orderStatsData = {
title: "Order Statistics",
totalSales: "42.82K",
totalOrders: 8258,
weeklyPercentage: 38,
categories: [
{ name: "Electronic", description: "Mobile, Earbuds, TV", value: "82.5K" },
{ name: "Fashion", description: "T-shirt, Jeans, Shoes", value: "23.8K" },
{ name: "Decor", description: "Fine Art, Dining", value: "849" },
{ name: "Sports", description: "Football, Cricket Kit", value: "99" },
],
};
const managers = [
{
    id: 1,
    invoiceOwner: "Christopher Beauchamp",
    accountName: "John Doe",
    invoiceNumber: "INV-000001",
    orderNumber: "54383683863",
    amount: "$8000",
    dueDate: "06-01-2026",
    paidAmount: "$4000",
    status: "Pending",
},
{
    id: 2,
    invoiceOwner: "Christopher Beauchamp",
    accountName: "John Doe",
    invoiceNumber: "INV-000001",
    orderNumber: "54383683863",
    amount: "$8000",
    dueDate: "06-01-2026",
    paidAmount: "$4000",
    status: "Paid",
},
{
    id: 3,
    invoiceOwner: "Christopher Beauchamp",
    accountName: "John Doe",
    invoiceNumber: "INV-000001",
    orderNumber: "54383683863",
    amount: "$8000",
    dueDate: "06-01-2026",
    paidAmount: "$4000",
    status: "Pending",
},
{
    id: 4,
    invoiceOwner: "Christopher Beauchamp",
    accountName: "John Doe",
    invoiceNumber: "INV-000001",
    orderNumber: "54383683863",
    amount: "$8000",
    dueDate: "06-01-2026",
    paidAmount: "$4000",
    status: "Pending",
},
{
    id: 5,
    invoiceOwner: "Christopher Beauchamp",
    accountName: "John Doe",
    invoiceNumber: "INV-000001",
    orderNumber: "54383683863",
    amount: "$8000",
    dueDate: "06-01-2026",
    paidAmount: "$4000",
    status: "Pending",
},
{
    id: 6,
    invoiceOwner: "Christopher Beauchamp",
    accountName: "John Doe",
    invoiceNumber: "INV-000001",
    orderNumber: "54383683863",
    amount: "$8000",
    dueDate: "06-01-2026",
    paidAmount: "$4000",
    status: "Pending",
},
{
    id: 7,
    invoiceOwner: "Christopher Beauchamp",
    accountName: "John Doe",
    invoiceNumber: "INV-000001",
    orderNumber: "54383683863",
    amount: "$8000",
    dueDate: "06-01-2026",
    paidAmount: "$4000",
    status: "Pending",
},
];
    return(
    <div className="min-h-screen font-gilroy p-6 text-[#101437] dark:text-white">
        {/* Stats */}
        <h1 className="text-xl font-bold">Overview</h1>
        <div className="flex items-center justify-between w-full gap-3 mt-2">
            <div className="flex items-center justify-left gap-6 w-full ">
                <p className="text-7xl font-bold font-gilroy">$100K</p>
                <div className="flex flex-col items-start justify-end text-sm w-30">
                <p>
                    Revenue
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-6 w-full">
                <p className="font-bold text-7xl">$70K</p>
                <div className="flex flex-col items-right justify-end text-sm ">
                <p>
                    Total Profit
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-6 w-full">
                <p className="font-bold text-7xl">20%</p>
                <div className="flex flex-col items-start justify-end text-sm">
                <p>
                   ROI 
                </p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ">
                    <FiArrowDown />
                    25%
                </p>
                </div>
            </div>
            <div className="flex items-center justify-left gap-6 w-full">
                <p className="text-7xl font-bold ">10%</p>
                <div className="flex flex-col items-start justify-end text-right text-base">
                <p>
                    Turnover
                </p>
                </div>
            </div>
        </div>

        {/* cards */}
        <div className="flex flex-row gap-4 mb-5 font-gilroy mt-8">
          <TestCasesOverview data={orderStatsData} heading="Revenue by Customer" />
          <SalesOverview heading="Sales Growth" />
        </div>

        {/* Profit Margin */}
        <ShipmentOverview className="mt-4"
            heading="Profit Margin"
            description="Product receiving performance and delivery status overview."
        />

        {/* Table recent activities */}
        <div className="flex mt-5 w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-2xl card">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <h1 className="text-white text-2xl font-gilroy font-bold">Recent Activities</h1>
                <button  className="btn text-xs bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-2 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
                  Invoices
                </button>
                <button className="btn text-xs bg-transparent  text-[#62708D] p-2 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
                  Estimates
                </button>
                <button className="btn text-xs bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] text-[#62708D] p-2  rounded-3xl transition-all">
                  Sales Orders
                </button>
                <button className="btn text-xs bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] text-[#62708D] p-2  rounded-3xl transition-all">
                  Purchase Orders
                </button>
            </div>
          {/* Add new button */}
          <div className="flex items-center gap-5">
            <button
              className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white py-2 px-4 border-none rounded-xl transition-all cursor-pointer"
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
                <span>Add New</span>
              </div>
            </button>
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
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-6">
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
              placeholder="Search Invoices"
              className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Dropdown Filters */}
          <select className="w-[max-content] bg-transparent text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance hover:border-white/20 transition-colors">
            <option>Status</option>
            <option>All Projects</option>
          </select>

          <select className="bg-transparent text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
            <option>Date</option>
            <option>Urgent</option>
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
              width="15"
              height="17"
              viewBox="0 0 15 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.75 11.25C2.09315 11.25 0.75 9.90685 0.75 8.25C0.75 6.81971 1.75092 5.6232 3.09053 5.32271C3.03127 5.05796 3 4.78263 3 4.5C3 2.42893 4.67893 0.75 6.75 0.75C8.56448 0.75 10.078 2.03869 10.4251 3.75073C10.45 3.75025 10.475 3.75 10.5 3.75C12.5711 3.75 14.25 5.42893 14.25 7.5C14.25 9.31422 12.9617 10.8275 11.25 11.175M9.75 9L7.5 6.75M7.5 6.75L5.25 9M7.5 6.75L7.5 15.75"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
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
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
              />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table text-center">
            {/* head */}
            <thead>
              <tr className="bg-[#080C26]">
                <th className="text-white rounded-tl-full rounded-bl-full border-none">#</th>
                <th className="text-white border-none">Invoice Owner</th>
                <th className="text-white border-none">Account Name</th>
                <th className="text-white border-none">Invoice Number</th>
                <th className="text-white border-none">Order Number</th>
                <th className="text-white border-none">Amount</th>
                <th className="text-white border-none">Due Date</th>
                <th className="text-white border-none">Amount Paid</th>
                <th className="text-white rounded-tr-full rounded-br-full border-none">
                  Status
                </th>
              </tr>
            </thead>
            <tbody >
              {managers.map((manager, index) => (
                <tr
                  key={manager.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-4">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                  </td>
                  <td className="py-4 px-1">
                    <div className="flex items-center justify-center gap-2 ">
                    <p className="w-12 h-12 rounded-full flex items-center justify-center bg-[#656A80] text-[16px] font-bold text-white">
                        {manager.invoiceOwner.slice(0, 1)}
                        {manager.invoiceOwner.split(" ")[1].slice(0, 1)}
                    </p>
                    <span className=" text-xs"> {manager.invoiceOwner}</span>
                    </div>
                  </td>
                  <td className="py-4 px-1">
                    <div className="flex items-center justify-center gap-2 ">
                    <p className="w-12 h-12 rounded-full flex items-center justify-center bg-[#656A80] text-[16px] font-bold text-white">
                        {manager.accountName.slice(0, 1)}
                        {manager.accountName.split(" ")[1].slice(0, 1)}
                    </p>
                    <span className=" text-xs"> {manager.accountName}</span>
                    </div>
                  </td>
                  <td className="py-4 text-gray-100 text-xs">{manager.invoiceNumber}</td>
                  <td className="py-4 text-gray-100 text-xs">{manager.orderNumber}</td>
                  <td className="py-4 text-gray-100 text-xs">{manager.amount}</td>
                  <td className="py-4 text-gray-100 text-xs">{manager.dueDate}</td>
                  <td className="py-4 text-gray-100 text-xs">{manager.paidAmount}</td>

                  <td className="py-4">
                    <span 
                      className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                        manager.status === "Pending"
                          ? "bg-[#E7844D] text-white"
                          : manager.status === "Paid"
                            ? "bg-[#00E691] text-white"
                            : "bg-[#00E691] text-white"
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