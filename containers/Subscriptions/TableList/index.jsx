"use client";

import { useEffect, useState } from "react";
import { DeleteSubscription, getSubscriptions } from "@/services/Subscriptions";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FiEdit } from "react-icons/fi";

export default function PricingPlans() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    GetAllSubscriptions();
  }, []);

  const GetAllSubscriptions = async () => {
    try {
      const res = await getSubscriptions();
      setSubscriptions(res.data);
    } catch (error) {
      console.error("error Fetching subscritpions", error.message);
    }
  };

  const removePlan = async (id) => {
    try {
      const res = await DeleteSubscription(id);
      console.log("res : ", res);
    } catch (error) {
      console.error("Error Deleting Plan : ", error?.message);
    }
  };
  return (
    <div className=" flex flex-col justify-center py-5 px-7">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Subscriptions Lists
        </h1>
        <p className="text-gray-300 text-base">
          Subscriptions Plans for your business !
        </p>
      </div>
      <div className="flex w-full bg-gradient-to-r font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-3xl card">
        {/* Header */}
        <div className="flex items-center justify-end mb-8">
          <div className="flex items-center justify-end gap-2">
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
              placeholder="Search Plan"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1128] text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

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

          <button
            onClick={() => router.push("/Subscriptions/Add")}
            className="bg-[#facc15] text-[#0a1128] cursor-pointer p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20"
          >
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#080C26] rounded-2xl">
              <tr className="rounded-2xl">
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  #
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Plan Name
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Price
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  User Limit
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Project Limit
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Features
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Modules
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((plan, index) => (
                <tr
                  key={plan.id}
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
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                          {plan.name.slice(0, 2)}
                        </div>
                      </div>
                      <span className="text-white font-medium">
                        {plan.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {" "}
                    ${plan.price || "20"}
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {plan.userLimit || "♾️"}
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {plan.projectLimit || "♾️"}
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    <div className="flex flex-col gap-2 text-gray-300 text-sm mb-4">
                      {Object.entries(plan?.features).map(([key, value]) => (
                        <div key={key}>
                          <span>{key}</span>: <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-400">
                    {" "}
                    {plan.moduleAccess.map((mod) => (
                      <p key={mod} className="text-gray-300">
                        {mod}
                      </p>
                    ))}
                  </td>

                  <td className="flex items-center justify-center py-4 px-4 gap-4">
                    <button className="text-info text-xl mt-10 mb-10">
                      <a href={`/Subscriptions/Add?id=${plan?.id}`}>
                        <FaEdit />
                      </a>
                    </button>
                    <button
                      className="text-error text-xl"
                      onClick={() => removePlan(plan.id)}
                    >
                      <FaTrash />
                    </button>
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
