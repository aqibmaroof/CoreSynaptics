"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PRIORITIES = ["Normal", "High", "Critical"];
const STATUSES = ["Open", "Answered", "Closed"];

export default function RFIList() {
  const router = useRouter();
  const [rfis, setRfis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchRFIs();
  }, []);

  const fetchRFIs = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setRfis([]);
      setError("");
    } catch (err) {
      setError("Failed to load RFIs");
      setRfis([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setRfis(rfis.filter((r) => r.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete RFI");
    }
  };

  const filteredRFIs = rfis.filter((rfi) => {
    const matchesSearch =
      rfi.rfi_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfi.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfi.spec_section?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = !filterPriority || rfi.priority === filterPriority;
    const matchesStatus = !filterStatus || rfi.status === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-yellow-900/30 text-yellow-300 border-yellow-700/30";
      case "Answered":
        return "bg-blue-900/30 text-blue-300 border-blue-700/30";
      case "Closed":
        return "bg-green-900/30 text-green-300 border-green-700/30";
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-700/30";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Normal":
        return "text-blue-400";
      case "High":
        return "text-orange-400";
      case "Critical":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">RFIs</h1>
            <p className="text-gray-400">Manage Requests For Information</p>
          </div>
          <Link
            href="/RFI/Add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create RFI
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters & Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
              <input
                type="text"
                placeholder="RFI number, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
              >
                <option value="">All Priorities</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setfilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterPriority("");
                  setFilterStatus("");
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredRFIs.length} of {rfis.length} RFIs
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-400">Loading RFIs...</p>
            </div>
          </div>
        ) : filteredRFIs.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg">No RFIs found</p>
          </div>
        ) : (
          /* Table View */
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">RFI #</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Section</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300">Due Date</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredRFIs.map((rfi) => (
                    <tr key={rfi.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{rfi.rfi_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{rfi.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{rfi.spec_section}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-medium ${getPriorityColor(rfi.priority)}`}>
                          {rfi.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(rfi.status)}`}>
                          {rfi.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {rfi.due_date ? new Date(rfi.due_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => router.push(`/RFI/Edit/${rfi.id}`)}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(rfi.id)}
                            className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                          >
                            Delete
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm mx-4 shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Delete RFI?</h3>
                <p className="text-gray-400 mb-6">Are you sure? This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
