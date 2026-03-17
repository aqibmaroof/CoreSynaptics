"use client";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import { FaCircle } from "react-icons/fa";
import { useState } from "react";
import ShipmentOverview from "@/components/Cards/ShipmentOverview";
import { useRouter } from "next/navigation";

export default function KanbanBoard() {
  const router = useRouter();
  const managers = [
    {
      id: 1,
      shippingId: "CERUPS461",
      pName: "UPS-1500-STD",
      sNumber: "UB123900026BA",
      shipDate: "06-01-2026",
      shipOwner: "Christopher Beauchamp",
      status: "Approved",
    },
    {
      id: 2,
      shippingId: "CERUPS461",
      pName: "UPS-1500-STD",
      sNumber: "UB123900026BA",
      shipDate: "06-01-2026",
      shipOwner: "Christopher Beauchamp",
      status: "Rejected",
    },
    {
      id: 3,
      shippingId: "CERUPS461",
      pName: "UPS-1500-STD",
      sNumber: "UB123900026BA",
      shipDate: "06-01-2026",
      shipOwner: "Christopher Beauchamp",
      status: "Approved",
    },
    {
      id: 4,
      shippingId: "CERUPS461",
      pName: "UPS-1500-STD",
      sNumber: "UB123900026BA",
      shipDate: "06-01-2026",
      shipOwner: "Christopher Beauchamp",
      status: "Approved",
    },
    {
      id: 5,
      shippingId: "CERUPS461",
      pName: "UPS-1500-STD",
      sNumber: "UB123900026BA",
      shipDate: "06-01-2026",
      shipOwner: "Christopher Beauchamp",
      status: "Approved",
    },
    {
      id: 6,
      shippingId: "CERUPS461",
      pName: "UPS-1500-STD",
      sNumber: "UB123900026BA",
      shipDate: "06-01-2026",
      shipOwner: "Christopher Beauchamp",
      status: "Pending",
    },
    {
      id: 7,
      shippingId: "CERUPS461",
      pName: "UPS-1500-STD",
      sNumber: "UB123900026BA",
      shipDate: "06-01-2026",
      shipOwner: "Christopher Beauchamp",
      status: "Approved",
    },
  ];
  return (
    <div className="min-h-screen  p-6 text-white">
      {/* Stats */}
      <h1 className="text-xl md:text-2xl font-bold">Shipment Overview</h1>
      <div className="flex items-center justify-between w-full gap-20 md:gap-8 mt-2">
        <div className="flex items-center justify-left gap-6 w-full ">
          <p className="text-4xl md:text-7xl font-bold font-gilroy">10</p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm w-20 md:w-30">
            <p>
              Total Shipment
              <br />
              Today
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="font-bold text-4xl md:text-7xl">1500</p>
          <div className="flex flex-col items-right justify-end text-xs md:text-sm w-30">
            <p>
              Total shipment <br /> last month
            </p>
            <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ">
              <FiArrowDown />
              25%
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="font-bold text-4xl md:text-7xl">147</p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm">
            <p>
              Total <br />
              Transactions
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full ml-4">
          <p className="text-4xl md:text-7xl font-bold ">22</p>
          <div className="flex flex-col items-start justify-end text-right text-xs md:text-sm">
            <p>
              Total <br />
              Receiving
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-row gap-4 mb-5">
        {/* Shipment card */}
        <div className="flex flex-col justify-between w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  p-6 mt-8 rounded-2xl card">
          <div className="">
            <h1 className="text-base md:text-xl font-bold">Shipment Status</h1>
          </div>
          <div className="flex flex-col mt-4 w-full">
            <div className="flex flex-row items-center justify-between mt-8">
              <div>
                <p className="font-bold text-4xl md:text-6xl">2500</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content]">
                  <FiArrowDown />
                  25%
                </p>
              </div>
              <div className="flex flex-col items-center ">
                <div className="flex flex-col gap-2">
                  <progress
                    className="progress progress-accent w-70 h-6"
                    value="70"
                    max="100"
                  ></progress>
                  <progress
                    className="progress progress-accent w-70 h-6 text-[#0075FF]"
                    value="80"
                    max="100"
                  ></progress>
                  <progress
                    className="progress progress-accent w-70 h-6 text-[#E7844D]"
                    value="90"
                    max="100"
                  ></progress>
                </div>
                <div className="flex flex-row gap-10 items-center mt-4">
                  <div className="flex flex-col items-center ">
                    <p className="flex items-center gap-2 text-xs md:text-sm">
                      <FaCircle className="text-[#00E691]" />
                      At Warehouse
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold mt-2">53%</h3>
                  </div>
                  <div className="flex flex-col items-center ">
                    <p className="flex items-center gap-2 text-xs md:text-sm">
                      <FaCircle className="text-[#0075FF]" />
                      In Transits
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold mt-2">64%</h3>
                  </div>
                  <div className="flex flex-col items-center ">
                    <p className="flex items-center gap-2 text-xs md:text-sm">
                      <FaCircle className="text-[#E7844D]" />
                      Reached at Site
                    </p>
                    <h3 className="text-xl md:text-2xl font-bold mt-2">72%</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Avg card */}
        <div className="flex flex-row items-center justify-between w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  p-6 mt-8 rounded-2xl card">
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full justify-between">
              <h1 className="text-base md:text-xl font-bold justify-between">
                Avg. Delivery Time
              </h1>
              <svg
                width="29"
                height="29"
                viewBox="0 0 29 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.4732 14.4742L14.4732 19.9022M14.4732 10.4509V10.4032M3.61719 14.4742C3.61719 8.47857 8.4776 3.61816 14.4732 3.61816C20.4688 3.61816 25.3293 8.47858 25.3293 14.4742C25.3292 20.4698 20.4688 25.3302 14.4732 25.3302C8.4776 25.3302 3.61719 20.4698 3.61719 14.4742Z"
                  stroke="#9BA9BB"
                  strokeWidth="2.71401"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="font-bold text-4xl md:text-6xl mt-4">2.5 Days</p>
            </div>

            {/* Vertical lines */}
            <div className="flex w-full justify-between mt-4">
              <div className="text-xs md:text-sm text-[#9BA9BB] inline-block h-48 min-h-[1em] w-0.5  bg-white/10 ">
                0
                <div className="mt-4 w-full">
                  <div className="absolute items-center justify-between">
                    <progress
                      className="progress progress-accent w-35 h-6"
                      value="70"
                    ></progress>
                    <span className="text-xs md:text-sm">3 Days</span>
                  </div>
                  <div className="absolute items-center justify-between mt-10">
                    <progress
                      className="progress progress-accent w-70 h-6 text-[#0075FF]"
                      value="80"
                    ></progress>
                    <span className="text-xs md:text-sm">2 Days</span>
                  </div>
                </div>
              </div>
              <div className="text-xs md:text-sm text-[#9BA9BB] inline-block h-48 min-h-[1em] w-0.5  bg-white/10 ">
                10k
              </div>
              <div className="text-xs md:text-sm text-[#9BA9BB] inline-block h-48 min-h-[1em] w-0.5  bg-white/10 ">
                20k
              </div>
              <div className="text-xs md:text-sm text-[#9BA9BB] inline-block h-48 min-h-[1em] w-0.5  bg-white/10 ">
                30k
              </div>
              <div className="text-xs md:text-sm text-[#9BA9BB] inline-block h-48 min-h-[1em] w-0.5  bg-white/10 ">
                40k
              </div>
              <div className="text-xs md:text-sm text-[#9BA9BB] inline-block h-48 min-h-[1em] w-0.5  bg-white/10 ">
                50k
              </div>
              <div className="inline-block h-48 min-h-[1em] w-0.5  bg-white/10 "></div>
            </div>
          </div>
        </div>
      </div>
      {/* Header */}
      <ShipmentOverview
        heading="Shipment Statistics"
        description="Shipment performance and delivery status overview."
      />

      {/* Receving list Table */}
      <div className="flex mt-5 w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-2xl card">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white text-xl md:text-2xl font-normal">
            Shipping List
          </h1>
          {/* Add new button */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/ProjectDetails/Create/12")}
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
                <span className="text-xs md:text-sm">Add Shipment</span>
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
              placeholder="Search Task"
              className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Dropdown Filters */}
          <select className="w-[max-content] bg-transparent text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance hover:border-white/20 transition-colors">
            <option>Date</option>
            <option>All Projects</option>
          </select>

          <select className="bg-transparent text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
            <option>Status</option>
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
                strokeLinecap="round"
                strokeLinejoin="round"
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
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
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
                <th className="text-white rounded-tl-full rounded-bl-full border-none">
                  #
                </th>
                <th className="text-white border-none">Shipping ID</th>
                <th className="text-white border-none">Product Name</th>
                <th className="text-white border-none">Serial Number</th>
                <th className="text-white border-none">Shipping Date</th>
                <th className="text-white border-none">Shipping Owner</th>
                <th className="text-white rounded-tr-full rounded-br-full border-none">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {managers.map((manager, index) => (
                <tr
                  onClick={() => router.push("/Shipment/Details")}
                  key={manager.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="py-4">
                    <input type="checkbox" className="checkbox checkbox-sm" />
                  </td>
                  <td className="py-4 text-gray-100">{manager.shippingId}</td>
                  <td className="py-4 text-gray-100">{manager.pName}</td>
                  <td className="py-4 text-gray-100">{manager.sNumber}</td>
                  <td className="py-4 text-gray-100">{manager.shipDate}</td>
                  <td className="py-4 text-gray-100">{manager.shipOwner}</td>

                  <td className="py-4">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                        manager.status === "Approved"
                          ? "bg-[#00E691] text-white"
                          : manager.status === "Pending"
                            ? "bg-[#656A80] text-white"
                            : "bg-[#FF2727] text-white"
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
