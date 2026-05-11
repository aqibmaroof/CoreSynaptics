"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCompanies, deleteCompany } from "@/services/Companies";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

const COMPANY_TYPES = [
  "CLIENT",
  "SUBCONTRACTOR",
  "VENDOR",
  "PARTNER",
  "CONSULTANT",
  "OTHER",
];

const TYPE_COLORS = {
  CLIENT: "bg-blue-900/30 text-blue-300 border-blue-700/30",
  SUBCONTRACTOR: "bg-orange-900/30 text-orange-300 border-orange-700/30",
  VENDOR: "bg-purple-900/30 text-purple-300 border-purple-700/30",
  PARTNER: "bg-cyan-900/30 text-cyan-300 border-cyan-700/30",
  CONSULTANT: "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
  OTHER: "bg-gray-700/30 text-gray-300 border-gray-600/30",
};

export default function CompanyList() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [timelineEntity, setTimelineEntity] = useState(null); // { id, name }

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getCompanies();
      setCompanies(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || "Failed to delete company");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = companies.filter((c) => {
    const matchSearch =
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.region || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !filterType || c.type === filterType;
    const matchActive =
      filterActive === "" ||
      (filterActive === "true" && c.subscriptionActive === true) ||
      (filterActive === "false" && c.subscriptionActive === false);
    return matchSearch && matchType && matchActive;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Companies</h1>
            <p className="text-gray-400">
              Manage and view all company information
            </p>
          </div>
          <Link
            href="/Company/Add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
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
            Add Company
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
            Filters & Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Company name or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="">All Types</option>
                {COMPANY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t[0] + t.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subscription
              </label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("");
                  setFilterActive("");
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filtered.length} of {companies.length} companies
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-400">Loading companies...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <svg
              className="w-12 h-12 text-gray-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-400 text-lg">No companies found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || filterType || filterActive
                ? "Try adjusting your filters"
                : "Create your first company"}
            </p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50 border-b border-gray-700">
                  <tr>
                    {[
                      "Company Name",
                      "Type",
                      "Region",
                      "Plan",
                      "Subscription",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-left text-sm font-semibold text-gray-200 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filtered.map((company) => (
                      <tr
                        key={company.id}
                        className="hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/Company/Detail/${company.id}`}
                            className="text-white font-medium hover:text-blue-400 transition-colors"
                          >
                            {company.name}
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${TYPE_COLORS[company.type] || TYPE_COLORS.OTHER}`}
                          >
                            {company.type
                              ? company.type[0] +
                                company.type.slice(1).toLowerCase()
                              : "—"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-300">
                          {company.region || "—"}
                        </td>

                        <td className="px-6 py-4">
                          {company.subscriptionPlan ? (
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full border ${
                                company.subscriptionPlan?.toLowerCase() ===
                                "enterprise"
                                  ? "bg-purple-900/30 text-purple-300 border-purple-700/30"
                                  : company.subscriptionPlan?.toLowerCase() ===
                                      "premium"
                                    ? "bg-orange-900/30 text-orange-300 border-orange-700/30"
                                    : "bg-green-900/30 text-green-300 border-green-700/30"
                              }`}
                            >
                              {company.subscriptionPlan}
                            </span>
                          ) : (
                            <span className="text-gray-600 text-sm">—</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full border ${
                              company.subscriptionActive
                                ? "bg-green-900/30 text-green-300 border-green-700/30"
                                : "bg-red-900/30 text-red-300 border-red-700/30"
                            }`}
                          >
                            {company.subscriptionActive
                              ? "✓ Active"
                              : "○ Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {company.createdAt
                            ? new Date(company.createdAt).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <button
                              onClick={() => setTimelineEntity({ id: company.id, name: company.name })}
                              className="text-purple-400 hover:text-purple-300 text-xs px-2 py-1"
                              title="Timeline"
                            >
                              Timeline
                            </button>
                            <button
                              onClick={() =>
                                router.push(`/Company/Edit/${company.id}`)
                              }
                              className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(company.id)}
                              className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm mx-4 shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Delete Company?
                </h3>
                <p className="text-gray-400 mb-6">
                  This will soft-delete the company. It can be restored by an
                  administrator if needed.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Modal */}
        {timelineEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setTimelineEntity(null)}>
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 shrink-0">
                <h3 className="text-white font-bold">Timeline — {timelineEntity.name}</h3>
                <button onClick={() => setTimelineEntity(null)} className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
              </div>
              <div className="p-5 overflow-y-auto">
                <ActivityTimeline entityType="company" entityId={timelineEntity.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
