"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PHASES = ["L1", "L2", "L3", "L4", "L5"];
const CHECKLIST_TYPES = ["vendor", "gc", "cxagent", "trade"];
const STATUSES = ["Not Started", "In Progress", "Complete", "Verified"];

export default function ChecklistList() {
  const router = useRouter();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPhase, setFilterPhase] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch checklists on mount
  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/checklists");
      if (!response.ok) throw new Error("Failed to fetch checklists");
      const data = await response.json();
      setChecklists(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load checklists");
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete checklist");
      setChecklists(checklists.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || "Failed to delete checklist");
    }
  };

  // Filter checklists
  const filteredChecklists = checklists.filter((checklist) => {
    const matchesSearch = 
      checklist.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (checklist.project?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (checklist.assigned_to_company?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPhase = !filterPhase || checklist.phase === filterPhase;
    const matchesType = !filterType || checklist.checklist_type === filterType;
    const matchesStatus = !filterStatus || checklist.status === filterStatus;
    
    return matchesSearch && matchesPhase && matchesType && matchesStatus;
  });

  const getCompletionPercentage = (checklist) => {
    if (checklist.total_items === 0) return 0;
    return Math.round((checklist.completed_items / checklist.total_items) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-900/30 text-gray-300 border-gray-700/30";
      case "In Progress":
        return "bg-blue-900/30 text-blue-300 border-blue-700/30";
      case "Complete":
        return "bg-green-900/30 text-green-300 border-green-700/30";
      case "Verified":
        return "bg-purple-900/30 text-purple-300 border-purple-700/30";
      default:
        return "bg-gray-900/30 text-gray-300 border-gray-700/30";
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Checklists</h1>
            <p className="text-gray-400">Manage and track project checklists</p>
          </div>
          <Link
            href="/Checklist/Add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Checklist
          </Link>
        </div>

        {/* Error Message */}
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

        {/* Filters Card */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters & Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Project, company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>

            {/* Phase Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phase
              </label>
              <select
                value={filterPhase}
                onChange={(e) => setFilterPhase(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all [&_option]:bg-gray-700 [&_option]:text-white"
              >
                <option value="">All Phases</option>
                {PHASES.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all [&_option]:bg-gray-700 [&_option]:text-white"
              >
                <option value="">All Types</option>
                {CHECKLIST_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-all [&_option]:bg-gray-700 [&_option]:text-white"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterPhase("");
                  setFilterType("");
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
          Showing {filteredChecklists.length} of {checklists.length} checklists
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4"
                fill="none"
                stroke="currentColor"
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
              <p className="text-gray-400">Loading checklists...</p>
            </div>
          </div>
        ) : filteredChecklists.length === 0 ? (
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg">No checklists found</p>
          </div>
        ) : (
          /* Card Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist) => {
              const completionPercentage = getCompletionPercentage(checklist);
              return (
                <div
                  key={checklist.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition-all cursor-pointer group"
                  onClick={() => router.push(`/Checklist/Edit/${checklist.id}`)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">
                        {checklist.project?.name || "No Project"}
                      </p>
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {checklist.checklist_type.toUpperCase()} - Phase {checklist.phase}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(checklist.status)}`}>
                      {checklist.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        {checklist.completed_items}/{checklist.total_items} items
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Company & Type */}
                  <div className="mb-4 space-y-2">
                    {checklist.assigned_to_company && (
                      <p className="text-sm text-gray-300">
                        <span className="text-gray-500">Assigned to:</span> {checklist.assigned_to_company.name}
                      </p>
                    )}
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Phase:</span> {checklist.phase}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/Checklist/Edit/${checklist.id}`);
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(checklist.id);
                      }}
                      className="px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm mx-4 shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Delete Checklist?
                </h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete this checklist? This action cannot be undone.
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
