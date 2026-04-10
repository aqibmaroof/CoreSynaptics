"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getIssues,
  changeIssueStatus,
  assignIssue,
  verifyAndCloseIssue,
  deleteIssue,
} from "@/services/Issues";
import { getUsers } from "@/services/Users";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES   = ["New", "In Progress", "Ready for Verification", "Closed", "Deferred"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const TABS       = ["All", "New", "In Progress", "Ready for Verification", "Closed", "Deferred"];

/** Allowed next-states for each current state (client-side mirror of server rules) */
const TRANSITIONS = {
  "New":                    ["In Progress", "Deferred"],
  "In Progress":            ["Ready for Verification", "Deferred"],
  "Ready for Verification": ["In Progress", "Deferred"],
  "Deferred":               ["New", "In Progress"],
  "Closed":                 [],
};

const SEVERITY_COLORS = {
  Low:      "bg-gray-700/60 text-gray-300 border-gray-600/50",
  Medium:   "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  High:     "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Critical: "bg-red-500/20 text-red-300 border-red-500/30",
};

const SEVERITY_DOT = {
  Low:      "bg-gray-400",
  Medium:   "bg-yellow-400",
  High:     "bg-orange-400",
  Critical: "bg-red-400",
};

const STATUS_COLORS = {
  "New":                    "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "In Progress":            "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "Ready for Verification": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  "Closed":                 "bg-green-500/20 text-green-300 border-green-500/30",
  "Deferred":               "bg-gray-600/30 text-gray-400 border-gray-600/40",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const Label = ({ children, className = "" }) => (
  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${className}`}>
    {children}
  </span>
);

const Toast = ({ message }) =>
  message ? (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl text-sm flex items-center gap-2 ${
      message.type === "success"
        ? "bg-green-900/90 border-green-500/40 text-green-300"
        : "bg-red-900/90 border-red-500/40 text-red-300"
    }`}>
      {message.type === "success" ? (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {message.text}
    </div>
  ) : null;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IssuesList() {
  const router = useRouter();

  const [issues, setIssues]         = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [message, setMessage]       = useState(null);

  // Filters / tabs
  const [activeTab, setActiveTab]         = useState("All");
  const [searchTerm, setSearchTerm]       = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [viewMode, setViewMode]           = useState("list"); // list | kanban

  // Modals
  const [deleteConfirm, setDeleteConfirm]   = useState(null);
  const [statusModal, setStatusModal]       = useState(null); // { issue, nextStatus }
  const [assignModal, setAssignModal]       = useState(null); // issue
  const [verifyModal, setVerifyModal]       = useState(null); // issue
  const [actionLoading, setActionLoading]   = useState(false);

  // Assign form
  const [assignForm, setAssignForm] = useState({ assigned_to_user_id: "", assigned_to_company_id: "" });
  // Verify form
  const [verifyForm, setVerifyForm] = useState({ close_verified_by: "", verification_notes: "" });

  // ── Data fetching ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 3500);
    return () => clearTimeout(t);
  }, [message]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await getIssues();
      setIssues(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch {
      setError("Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : res?.data || []);
    } catch {}
  };

  const withAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      setMessage({ type: "success", text: successMsg });
      await fetchIssues();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStatusChange = async () => {
    if (!statusModal) return;
    await withAction(
      () => changeIssueStatus(statusModal.issue.id, { status: statusModal.nextStatus }),
      `Status changed to "${statusModal.nextStatus}"`
    );
    setStatusModal(null);
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    await withAction(
      () => assignIssue(assignModal.id, assignForm),
      "Issue assigned successfully"
    );
    setAssignModal(null);
    setAssignForm({ assigned_to_user_id: "", assigned_to_company_id: "" });
  };

  const handleVerifyClose = async () => {
    if (!verifyModal || !verifyForm.close_verified_by) return;
    await withAction(
      () => verifyAndCloseIssue(verifyModal.id, verifyForm),
      "Issue verified and closed"
    );
    setVerifyModal(null);
    setVerifyForm({ close_verified_by: "", verification_notes: "" });
  };

  const handleDelete = async (id) => {
    await withAction(() => deleteIssue(id), "Issue deleted");
    setDeleteConfirm(null);
  };

  // ── Filter logic ───────────────────────────────────────────────────────────

  const filtered = issues.filter((issue) => {
    const matchTab = activeTab === "All" || issue.status === activeTab;
    const matchSeverity = !filterSeverity || issue.severity === filterSeverity;
    const matchSearch =
      !searchTerm ||
      (issue.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.project?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.asset?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSeverity && matchSearch;
  });

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = {
    total:    issues.length,
    new:      issues.filter((i) => i.status === "New").length,
    active:   issues.filter((i) => i.status === "In Progress").length,
    pending:  issues.filter((i) => i.status === "Ready for Verification").length,
    closed:   issues.filter((i) => i.status === "Closed").length,
    critical: issues.filter((i) => i.severity === "Critical").length,
  };

  // ── Kanban board ───────────────────────────────────────────────────────────

  const renderKanban = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {["New", "In Progress", "Ready for Verification", "Deferred"].map((status) => {
        const lane = filtered.filter((i) => i.status === status);
        return (
          <div key={status} className="w-72 flex-shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  status === "New" ? "bg-blue-400" :
                  status === "In Progress" ? "bg-cyan-400" :
                  status === "Ready for Verification" ? "bg-purple-400" :
                  "bg-gray-500"
                }`} />
                <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">{status}</h3>
              </div>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
                {lane.length}
              </span>
            </div>
            <div className="space-y-3 min-h-[200px] bg-gray-900/30 rounded-xl p-3 border border-gray-800/50">
              {lane.map((issue) => (
                <div key={issue.id}
                  className="bg-gray-800/80 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-all cursor-pointer group"
                  onClick={() => router.push(`/Issues/Edit/${issue.id}`)}
                >
                  {/* Severity + title */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white text-sm font-medium leading-snug line-clamp-2">{issue.title}</p>
                    <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[issue.severity]}`}>
                      {issue.severity}
                    </span>
                  </div>

                  {/* Project / Asset */}
                  {(issue.project?.name || issue.asset?.name) && (
                    <p className="text-gray-500 text-xs mb-2">
                      {issue.project?.name}{issue.asset?.name ? ` · ${issue.asset.name}` : ""}
                    </p>
                  )}

                  {/* Quick actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700/50">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {TRANSITIONS[issue.status]?.slice(0, 2).map((next) => (
                        <button key={next}
                          onClick={() => setStatusModal({ issue, nextStatus: next })}
                          className="text-[10px] px-2 py-0.5 rounded bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        >
                          → {next === "Ready for Verification" ? "RFV" : next}
                        </button>
                      ))}
                      {issue.status === "Ready for Verification" && (
                        <button onClick={() => setVerifyModal(issue)}
                          className="text-[10px] px-2 py-0.5 rounded bg-green-900/40 text-green-400 hover:text-green-300">
                          ✓ Close
                        </button>
                      )}
                    </div>
                    <div className={`w-2 h-2 rounded-full ${SEVERITY_DOT[issue.severity]}`} />
                  </div>
                </div>
              ))}
              {lane.length === 0 && (
                <p className="text-gray-600 text-xs text-center py-8">No issues</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── Table ──────────────────────────────────────────────────────────────────

  const renderTable = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {["Title", "Severity", "Status", "Project / Asset", "Assigned", "Raised By", "Raised At", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue) => {
              const assignedUser = users.find((u) => u.id === issue.assigned_to_user_id);
              const raisedUser   = users.find((u) => u.id === issue.raised_by);
              const transitions  = TRANSITIONS[issue.status] || [];
              const isCritical   = issue.severity === "Critical";

              return (
                <tr key={issue.id}
                  className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${isCritical ? "bg-red-900/5" : ""}`}
                >
                  {/* Title + description snippet */}
                  <td className="px-5 py-4 max-w-[240px]">
                    <p className="text-white text-sm font-medium truncate">{issue.title}</p>
                    {issue.description && (
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{issue.description}</p>
                    )}
                  </td>

                  {/* Severity */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border w-fit ${SEVERITY_COLORS[issue.severity]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[issue.severity]}`} />
                      {issue.severity}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Label className={STATUS_COLORS[issue.status]}>{issue.status}</Label>
                  </td>

                  {/* Project / Asset */}
                  <td className="px-5 py-4 text-sm">
                    {issue.project?.name && (
                      <p className="text-gray-300 text-xs">{issue.project.name}</p>
                    )}
                    {issue.asset?.name && (
                      <p className="text-gray-500 text-xs mt-0.5">Asset: {issue.asset.name}</p>
                    )}
                    {!issue.project?.name && !issue.asset?.name && (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>

                  {/* Assigned */}
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {assignedUser
                      ? `${assignedUser.firstName} ${assignedUser.lastName}`
                      : issue.assigned_to_company?.name || "—"}
                  </td>

                  {/* Raised By */}
                  <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                    {raisedUser ? `${raisedUser.firstName} ${raisedUser.lastName}` : "—"}
                  </td>

                  {/* Raised At */}
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                    {issue.raised_at ? new Date(issue.raised_at).toLocaleDateString() : "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 flex-wrap min-w-[160px]">
                      <button
                        onClick={() => router.push(`/Issues/Edit/${issue.id}`)}
                        className="text-cyan-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50"
                      >
                        Edit
                      </button>

                      {/* Inline status transitions */}
                      {transitions.map((next) => (
                        <button key={next}
                          onClick={() => setStatusModal({ issue, nextStatus: next })}
                          className={`text-[11px] px-2 py-0.5 rounded bg-gray-800/50 ${
                            next === "Deferred" ? "text-gray-400 hover:text-white" :
                            next === "In Progress" ? "text-cyan-400 hover:opacity-80" :
                            "text-purple-400 hover:opacity-80"
                          }`}
                        >
                          {next === "Ready for Verification" ? "→ RFV" : `→ ${next}`}
                        </button>
                      ))}

                      {/* Assign */}
                      {issue.status !== "Closed" && (
                        <button
                          onClick={() => { setAssignModal(issue); setAssignForm({ assigned_to_user_id: issue.assigned_to_user_id || "", assigned_to_company_id: issue.assigned_to_company_id || "" }); }}
                          className="text-yellow-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50"
                        >
                          Assign
                        </button>
                      )}

                      {/* Verify & Close */}
                      {issue.status === "Ready for Verification" && (
                        <button
                          onClick={() => setVerifyModal(issue)}
                          className="text-green-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50 font-medium"
                        >
                          ✓ Close
                        </button>
                      )}

                      {/* Delete — only New */}
                      {issue.status === "New" && (
                        <button
                          onClick={() => setDeleteConfirm(issue.id)}
                          className="text-red-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-500 py-14">
                  No issues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <Toast message={message} />

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Issues</h1>
            <p className="text-gray-400">Track and resolve project issues across assets and sites</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
              <button onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "list" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "kanban" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
              </button>
            </div>

            <button
              onClick={() => router.push("/Issues/Add")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Raise Issue
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total",    value: stats.total,    color: "text-white" },
            { label: "New",      value: stats.new,      color: "text-blue-400" },
            { label: "Active",   value: stats.active,   color: "text-cyan-400" },
            { label: "Pending",  value: stats.pending,  color: "text-purple-400" },
            { label: "Closed",   value: stats.closed,   color: "text-green-400" },
            { label: "Critical", value: stats.critical, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-900/60 border border-gray-800/60 rounded-lg overflow-hidden w-fit mb-5">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search title, description, project, asset..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[220px] max-w-md px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
          />
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === "kanban" ? renderKanban() : renderTable()}

        {/* ── Status Change Modal ── */}
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-white font-bold mb-1">Change Status</h3>
              <p className="text-gray-400 text-sm mb-6">
                Move{" "}
                <span className="text-white font-medium">"{statusModal.issue.title}"</span>
                {" "}from{" "}
                <Label className={STATUS_COLORS[statusModal.issue.status]}>{statusModal.issue.status}</Label>
                {" "}→{" "}
                <Label className={STATUS_COLORS[statusModal.nextStatus]}>{statusModal.nextStatus}</Label>
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setStatusModal(null)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleStatusChange} disabled={actionLoading}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {actionLoading ? "Updating..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Assign Modal ── */}
        {assignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-white font-bold text-lg mb-1">Assign Issue</h3>
              <p className="text-gray-400 text-sm mb-5 truncate">"{assignModal.title}"</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Assign to User</label>
                  <select
                    value={assignForm.assigned_to_user_id}
                    onChange={(e) => setAssignForm({ ...assignForm, assigned_to_user_id: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">No user assigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setAssignModal(null)}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleAssign} disabled={actionLoading}
                  className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {actionLoading ? "Assigning..." : "Save Assignment"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Verify & Close Modal ── */}
        {verifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-900/40 border border-green-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold">Verify & Close Issue</h3>
                  <p className="text-gray-500 text-xs">This action sets resolved_at and is irreversible</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-5 truncate bg-gray-800/50 rounded px-3 py-2">
                {verifyModal.title}
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                    Verified By <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={verifyForm.close_verified_by}
                    onChange={(e) => setVerifyForm({ ...verifyForm, close_verified_by: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 cursor-pointer"
                  >
                    <option value="">Select verifier...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Verification Notes</label>
                  <textarea
                    value={verifyForm.verification_notes}
                    onChange={(e) => setVerifyForm({ ...verifyForm, verification_notes: e.target.value })}
                    rows={3}
                    placeholder="Confirm the issue has been fully resolved..."
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => { setVerifyModal(null); setVerifyForm({ close_verified_by: "", verification_notes: "" }); }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleVerifyClose} disabled={actionLoading || !verifyForm.close_verified_by}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {actionLoading ? "Closing..." : "Verify & Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirm ── */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-white font-bold mb-2">Delete Issue?</h3>
              <p className="text-gray-400 text-sm mb-6">Only issues with "New" status can be deleted. This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
