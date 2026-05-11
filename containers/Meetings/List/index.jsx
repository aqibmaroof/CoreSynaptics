"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMeetings, deleteMeeting } from "@/services/Meetings";
import { getProjects } from "@/services/Projects";

const STATUSES = ["DRAFT", "MINUTES", "CLOSED"];

function toArray(data) {
  return Array.isArray(data) ? data : (data?.data ?? data?.projects ?? []);
}

const STATUS_COLORS = {
  DRAFT: "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
  MINUTES: "bg-blue-900/30 text-blue-300 border-blue-700/30",
  CLOSED: "bg-green-900/30 text-green-300 border-green-700/30",
};

export default function MeetingList() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load projects on mount
  useEffect(() => {
    getProjects()
      .then((d) => setProjects(toArray(d)))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // Fetch meetings when project changes
  const fetchMeetings = async (projectId) => {
    if (!projectId) {
      setMeetings([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await getMeetings({ projectId });
      setMeetings(toArray(data));
    } catch (err) {
      setError(err?.message || "Failed to load meetings");
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectChange = (e) => {
    const val = e.target.value;
    setSelectedProject(val);
    fetchMeetings(val);
  };

  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || "Failed to delete meeting");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = meetings.filter((m) => {
    const matchSearch =
      m.seriesName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Meetings</h1>
            <p className="text-gray-400">Manage project meetings and minutes</p>
          </div>
          <Link
            href="/Meeting/Add"
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
            New Meeting
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
            Filters &amp; Search
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Project selector — required by API */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Project <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={handleProjectChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none"
                >
                  <option value="">
                    {projectsLoading ? "Loading…" : "— Select Project —"}
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Series name, location…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none"
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("");
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Count */}
        {selectedProject && !loading && (
          <div className="mb-4 text-sm text-gray-400">
            Showing {filtered.length} of {meetings.length} meetings
          </div>
        )}

        {/* Content */}
        {!selectedProject ? (
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg">
              Select a project to load meetings
            </p>
          </div>
        ) : loading ? (
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
              <p className="text-gray-400">Loading meetings…</p>
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-400 text-lg">No meetings found</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Series
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filtered.map((meeting) => (
                    <tr
                      key={meeting.id}
                      className="hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {meeting.seriesName || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {meeting.meetingDate
                          ? new Date(meeting.meetingDate).toLocaleString(
                              undefined,
                              { dateStyle: "medium", timeStyle: "short" },
                            )
                          : "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {meeting.location || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {Array.isArray(meeting.attendees)
                          ? meeting.attendees.length
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[meeting.status] ?? "bg-gray-700 text-gray-300 border-gray-600"}`}
                        >
                          {meeting.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              router.push(`/Meeting/Edit/${meeting.id}`)
                            }
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                          >
                            View / Edit
                          </button>
                          {meeting.status !== "CLOSED" && (
                            <button
                              onClick={() => setDeleteConfirm(meeting.id)}
                              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            >
                              Delete
                            </button>
                          )}
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
                <h3 className="text-lg font-semibold text-white mb-2">
                  Delete Meeting?
                </h3>
                <p className="text-gray-400 mb-6">
                  This will soft-delete the meeting. This action cannot be
                  undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {deleting && (
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
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
