"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaTrash, FaEye } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";

const invoicesData = [
  {
    id: 5089,
    client: "Jamal Kerrod",
    role: "Software Development",
    total: 3077,
    date: "09 May 2020",
    status: "Paid",
    balance: 0,
  },
  {
    id: 5041,
    client: "Shamus Tuttle",
    role: "Software Development",
    total: 2230,
    date: "19 Nov 2020",
    status: "Paid",
    balance: 0,
  },
  {
    id: 5027,
    client: "Devonne Wallbridge",
    role: "Software Development",
    total: 2787,
    date: "25 Sept 2020",
    status: "Paid",
    balance: 0,
  },
  {
    id: 5024,
    client: "Ariella Filippyev",
    role: "Unlimited Extended License",
    total: 5285,
    date: "02 Aug 2020",
    status: "Unpaid",
    balance: 0,
  },
  {
    id: 5020,
    client: "Roy Southerell",
    role: "UI/UX Design",
    total: 5219,
    date: "15 Dec 2020",
    status: "Paid",
    balance: 0,
  },
];

export default function InvoicePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // new state

  const filtered = invoicesData.filter((inv) => {
    const matchesClient = inv.client
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter ? inv.status === statusFilter : true; // filter by status if selected
    return matchesClient && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stats shadow bg-[#f6f6f6] dark:bg-[#1e4742]">
          <div className="stat">
            <div className="stat-title">Clients</div>
            <div className="stat-value">24</div>
          </div>
        </div>

        <div className="stats shadow bg-[#f6f6f6] dark:bg-[#1e4742]">
          <div className="stat">
            <div className="stat-title">Invoices</div>
            <div className="stat-value">165</div>
          </div>
        </div>

        <div className="stats shadow bg-[#f6f6f6] dark:bg-[#1e4742]">
          <div className="stat">
            <div className="stat-title">Paid</div>
            <div className="stat-value">$2.46k</div>
          </div>
        </div>

        <div className="stats shadow bg-[#f6f6f6] dark:bg-[#1e4742]">
          <div className="stat">
            <div className="stat-title">Unpaid</div>
            <div className="stat-value">$876</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <div>
          <select className="select select-bordered w-32 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white">
            <option>Show 10</option>
            <option>Show 20</option>
            <option>Show 30</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search Invoice"
            className="input bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select select-bordered w-44 bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Invoice Status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="table w-full text-[#183431] dark:text-white">
          <thead className="text-[#183431] dark:text-white bg-[#f6f6f6] dark:bg-[#0b1f1d]">
            <tr>
              <th></th>
              <th>#</th>
              <th>Client</th>
              <th>Total</th>
              <th>Issued Date</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((inv) => (
              <tr
                key={inv.id}
                className="text-[#183431] dark:text-white bg-[#f6f6f6] dark:bg-[#1e4742]"
              >
                <td>
                  <input
                    type="checkbox"
                    className="checkbox bg-[#f6f6f6] dark:bg-[#1e4742] border border-black dark:border-white"
                  />
                </td>

                <td className="font-semibold">#{inv.id}</td>

                <td>
                  <div>
                    <div className="font-bold">{inv.client}</div>
                    <div className="text-xs">{inv.role}</div>
                  </div>
                </td>

                <td>${inv.total}</td>

                <td>{inv.date}</td>

                <td>
                  {inv.balance === 0 ? (
                    <span className="badge badge-success">Paid</span>
                  ) : (
                    <span className="badge badge-error">-${inv.balance}</span>
                  )}
                </td>

                <td className="flex gap-4">
                  <FaTrash className="cursor-pointer text-red-400 hover:text-red-300" />
                  <FaEye className="cursor-pointer hover:text-primary" />
                  <HiDotsVertical className="cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
