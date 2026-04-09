"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getSubmittals,
  deleteSubmittal,
  submitForReview,
  approveSubmittal,
  rejectSubmittal,
  reviseSubmittal,
} from "@/services/Submittals";

const STATUSES = ["Open", "Under Review", "Approved", "Approved as Noted", "Revise & Resubmit", "Rejected"];
const TYPES = ["Product Data", "Shop Drawing", "Sample", "O&M", "Warranty"];

const STATUS_COLORS = {
  Open: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Under Review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Approved: "bg-green-500/20 text-green-400 border-green-500/30",
  "Approved as Noted": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Revise & Resubmit": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function SubmittalsList() {
  const router = useRouter();
  const [submittals, setSubmittals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { id, action, submittal }
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchSubmittals(); }, []);
  useEffect(() => { if (message) { const t = setTimeout(() => setMessage(null), 3000); return () => clearTimeout(t); } }, [message]);

  const fetchSubmittals = async () => {
    try {
      setLoading(true);
      const res = await getSubmittals();
      setSubmittals(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load submittals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubmittal(id);
      setSubmittals(submittals.filter((s) => s.id !== id));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Submittal deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const handleWorkflowAction = async () => {
    if (!actionModal) return;
    setActionLoading(true);
    try {
      const { id, action } = actionModal;
      if (action === "submit") await submitForReview(id);
      else if (action === "approve") await approveSubmittal(id, { notes: actionNotes });
      else if (action === "reject") await rejectSubmittal(id, { reason: actionNotes });
      else if (action === "revise") await reviseSubmittal(id, { notes: actionNotes });

      setMessage({ type: "success", text: `Submittal ${action === "submit" ? "submitted for review" : action + "d"} successfully` });
      setActionModal(null);
      setActionNotes("");
      await fetchSubmittals();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || `Failed to ${actionModal.action}` });
    } finally {
      setActionLoading(false);
    }
  };

  const isOverdue = (sub) => {
    if (!sub.required_date && !sub.requiredDate) return false;
    if (sub.status === "Approved" || sub.status === "Approved as Noted") return false;
    const rd = new Date(sub.required_date || sub.requiredDate);
    return rd < new Date();
  };

  const getAvailableActions = (sub) => {
    const status = sub.status;
    const actions = [];
    if (status === "Open") actions.push({ key: "submit", label: "Submit for Review", color: "text-yellow-400" });
    if (status === "Under Review") {
      actions.push({ key: "approve", label: "Approve", color: "text-green-400" });
      actions.push({ key: "revise", label: "Revise & Resubmit", color: "text-orange-400" });
      actions.push({ key: "reject", label: "Reject", color: "text-red-400" });
    }
    if (status === "Revise & Resubmit" || status === "Rejected") {
      actions.push({ key: "submit", label: "Resubmit for Review", color: "text-yellow-400" });
    }
    return actions;
  };

  const filtered = submittals.filter((s) => {
    const matchSearch = (s.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.submittal_number || s.submittalNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.spec_section || s.specSection || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchType = !filterType || (s.submittal_type || s.submittalType) === filterType;
    return matchSearch && matchStatus && matchType;
  });

  // Stats
  const stats = {
    total: submittals.length,
    open: submittals.filter((s) => s.status === "Open").length,
    underReview: submittals.filter((s) => s.status === "Under Review").length,
    approved: submittals.filter((s) => s.status === "Approved" || s.status === "Approved as Noted").length,
    overdue: submittals.filter(isOverdue).length,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Toast */}
        {message && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm ${message.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"}`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Submittals</h1>
            <p className="text-gray-400">Manage technical documentation submissions and approvals</p>
          </div>
          <button
            onClick={() => router.push("/Submittals/Add")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Submittal
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-white" },
            { label: "Open", value: stats.open, color: "text-blue-400" },
            { label: "Under Review", value: stats.underReview, color: "text-yellow-400" },
            { label: "Approved", value: stats.approved, color: "text-green-400" },
            { label: "Overdue", value: stats.overdue, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text" placeholder="Search by title, number, spec section..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] max-w-md px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
            <option value="">All Types</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["#", "Title", "Type", "Spec Section", "Trade Co.", "Status", "Required", "Rev", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => {
                    const overdue = isOverdue(sub);
                    const actions = getAvailableActions(sub);
                    const reqDate = sub.required_date || sub.requiredDate;
                    return (
                      <tr key={sub.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${overdue ? "bg-red-900/5" : ""}`}>
                        <td className="px-5 py-4 text-cyan-400 font-mono text-sm font-medium whitespace-nowrap">
                          {sub.submittal_number || sub.submittalNumber}
                        </td>
                        <td className="px-5 py-4 text-white text-sm max-w-[200px] truncate">{sub.title}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">{sub.submittal_type || sub.submittalType}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm">{sub.spec_section || sub.specSection || "—"}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">{sub.tradeCompany?.name || "—"}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[sub.status]}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className={`px-5 py-4 text-sm whitespace-nowrap ${overdue ? "text-red-400 font-medium" : "text-gray-400"}`}>
                          {reqDate ? new Date(reqDate).toLocaleDateString() : "—"}
                          {overdue && <span className="ml-1 text-[10px] text-red-500 uppercase">overdue</span>}
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-sm font-mono">
                          {sub.revision_number ?? sub.revisionNumber ?? 0}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {actions.map((a) => (
                              <button
                                key={a.key}
                                onClick={() => setActionModal({ id: sub.id, action: a.key, submittal: sub })}
                                className={`${a.color} hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50 whitespace-nowrap`}
                              >
                                {a.label}
                              </button>
                            ))}
                            <button onClick={() => router.push(`/Submittals/Edit/${sub.id}`)}
                              className="text-cyan-400 hover:text-cyan-300 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">
                              Edit
                            </button>
                            {sub.status === "Open" && (
                              <button onClick={() => setDeleteConfirm(sub.id)}
                                className="text-red-400 hover:text-red-300 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-gray-500 py-12">No submittals found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white font-bold mb-2">Delete Submittal?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone. Only Open submittals can be deleted.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Action Modal */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-white font-bold text-lg mb-1 capitalize">{actionModal.action === "submit" ? "Submit for Review" : actionModal.action} Submittal</h3>
              <p className="text-gray-400 text-sm mb-4">
                <span className="text-cyan-400 font-mono">{actionModal.submittal?.submittal_number || actionModal.submittal?.submittalNumber}</span>
                {" — "}{actionModal.submittal?.title}
              </p>

              {actionModal.action !== "submit" && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                    {actionModal.action === "reject" ? "Rejection Reason *" : "Notes (optional)"}
                  </label>
                  <textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" rows={3}
                    placeholder={actionModal.action === "reject" ? "Reason for rejection..." : "Additional notes..."} />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button onClick={() => { setActionModal(null); setActionNotes(""); }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleWorkflowAction} disabled={actionLoading || (actionModal.action === "reject" && !actionNotes.trim())}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${
                    actionModal.action === "reject" ? "bg-red-600" :
                    actionModal.action === "approve" ? "bg-green-600" :
                    actionModal.action === "revise" ? "bg-orange-600" :
                    "bg-yellow-600"
                  }`}>
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
