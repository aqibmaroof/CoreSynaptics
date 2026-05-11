"use client";

import { useState, useEffect } from "react";
import { getCompanies } from "@/services/Companies";

const STAT_CARD_CLS = "bg-gray-800/60 border border-gray-700/50 rounded-xl p-5";

export default function OwnerPortal() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    getCompanies()
      .then((res) => setCompanies(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeCount = companies.filter((c) => c.subscriptionActive).length;
  const inactiveCount = companies.length - activeCount;

  const planCounts = companies.reduce((acc, c) => {
    const plan = c.subscriptionPlan || "None";
    acc[plan] = (acc[plan] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = companies.reduce((acc, c) => {
    const t = c.type || "OTHER";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Owner Portal</h1>
          <p className="text-gray-400 mt-1 text-sm">System-wide visibility — SUPERADMIN only</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-medium">
          SUPERADMIN
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-800/50 p-1 rounded-lg w-fit">
        {["overview", "tenants", "subscriptions"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-xs font-medium capitalize transition-all ${
              tab === t ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === "overview" ? (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={STAT_CARD_CLS}>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Tenants</p>
              <p className="text-3xl font-bold text-white">{companies.length}</p>
            </div>
            <div className={STAT_CARD_CLS}>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Subs</p>
              <p className="text-3xl font-bold text-green-400">{activeCount}</p>
            </div>
            <div className={STAT_CARD_CLS}>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Inactive</p>
              <p className="text-3xl font-bold text-red-400">{inactiveCount}</p>
            </div>
            <div className={STAT_CARD_CLS}>
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Activation Rate</p>
              <p className="text-3xl font-bold text-cyan-400">
                {companies.length ? Math.round((activeCount / companies.length) * 100) : 0}%
              </p>
            </div>
          </div>

          {/* Plan breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={STAT_CARD_CLS}>
              <h3 className="text-sm font-bold text-gray-300 mb-4">By Subscription Plan</h3>
              <div className="space-y-2">
                {Object.entries(planCounts).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{plan}</span>
                    <span className="text-white font-medium text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={STAT_CARD_CLS}>
              <h3 className="text-sm font-bold text-gray-300 mb-4">By Company Type</h3>
              <div className="space-y-2">
                {Object.entries(typeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">{type}</span>
                    <span className="text-white font-medium text-sm">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : tab === "tenants" ? (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {["Company", "Type", "Region", "Plan", "Status", "Created"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="px-6 py-3 text-white text-sm font-medium">{c.name}</td>
                  <td className="px-6 py-3 text-gray-400 text-sm">{c.type || "—"}</td>
                  <td className="px-6 py-3 text-gray-400 text-sm">{c.region || "—"}</td>
                  <td className="px-6 py-3 text-gray-400 text-sm">{c.subscriptionPlan || "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.subscriptionActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                      {c.subscriptionActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {["Company", "Plan", "Active", "Expires"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="px-6 py-3 text-white text-sm font-medium">{c.name}</td>
                  <td className="px-6 py-3 text-gray-400 text-sm">{c.subscriptionPlan || "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.subscriptionActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                      {c.subscriptionActive ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {c.subscriptionExpiresAt ? new Date(c.subscriptionExpiresAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
