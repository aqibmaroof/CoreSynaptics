"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getTARFs,
  approveTARF,
  rejectTARF,
  signInTARF,
  signOutTARF,
  deleteTARF,
} from "@/services/TARF";

const TABS = ["All", "Pending", "Approved", "On Site", "Expired"];

const STATUS_COLORS = {
  Pending:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Approved: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "On Site": "bg-green-500/20 text-green-300 border-green-500/30",
  Expired:  "bg-red-500/20 text-red-300 border-red-500/30",
  Rejected: "bg-gray-500/20 text-gray-400 border-gray-600/30",
  "Signed Out": "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function getTARFStatus(tarf) {
  const now = new Date();
  const end = tarf.expected_end ? new Date(tarf.expected_end) : null;
  if (!tarf.approved) return tarf.rejected ? "Rejected" : "Pending";
  if (end && end < now) return "Expired";
  if (tarf.signed_in_at && tarf.signed_out_at) return "Signed Out";
  if (tarf.signed_in_at && !tarf.signed_out_at) return "On Site";
  return "Approved";
}

function isExpired(tarf) {
  if (!tarf.expected_end) return false;
  return new Date(tarf.expected_end) < new Date();
}

export default function TARFList() {
  const router = useRouter();
  const [tarfs, setTARFs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchTARFs(); }, []);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchTARFs = async () => {
    try {
      setLoading(true);
      const res = await getTARFs();
      setTARFs(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch {
      setError("Failed to load TARF entries");
    } finally {
      setLoading(false);
    }
  };

  const withAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      setMessage({ type: "success", text: successMsg });
      await fetchTARFs();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (id) =>
    withAction(() => approveTARF(id), "TARF approved — access granted");

  const handleReject = async () => {
    if (!rejectModal) return;
    await withAction(
      () => rejectTARF(rejectModal, { reason: rejectReason }),
      "TARF rejected"
    );
    setRejectModal(null);
    setRejectReason("");
  };

  const handleSignIn = (id) =>
    withAction(() => signInTARF(id), "Signed in successfully");

  const handleSignOut = (id) =>
    withAction(() => signOutTARF(id), "Signed out successfully");

  const handleDelete = async (id) => {
    await withAction(() => deleteTARF(id), "TARF request deleted");
    setDeleteConfirm(null);
  };

  const filtered = tarfs.filter((t) => {
    const status = getTARFStatus(t);
    const matchTab =
      activeTab === "All" ||
      (activeTab === "Pending" && status === "Pending") ||
      (activeTab === "Approved" && status === "Approved") ||
      (activeTab === "On Site" && status === "On Site") ||
      (activeTab === "Expired" && status === "Expired");
    const matchSearch =
      !searchTerm ||
      (t.person_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.role_on_site || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total:    tarfs.length,
    pending:  tarfs.filter((t) => getTARFStatus(t) === "Pending").length,
    onSite:   tarfs.filter((t) => getTARFStatus(t) === "On Site").length,
    approved: tarfs.filter((t) => getTARFStatus(t) === "Approved").length,
    expired:  tarfs.filter((t) => getTARFStatus(t) === "Expired").length,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">

        {/* Toast */}
        {message && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-900/80 border-green-500/30 text-green-300"
              : "bg-red-900/80 border-red-500/30 text-red-300"
          }`}>
            {message.type === "success" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Site Access — TARF</h1>
            <p className="text-gray-400">Trade Access Request Forms · Personnel sign-in/out tracking</p>
          </div>
          <button
            onClick={() => router.push("/TARF/Add")}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New TARF Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total",    value: stats.total,    color: "text-white" },
            { label: "Pending",  value: stats.pending,  color: "text-yellow-400" },
            { label: "Approved", value: stats.approved, color: "text-cyan-400" },
            { label: "On Site",  value: stats.onSite,   color: "text-green-400" },
            { label: "Expired",  value: stats.expired,  color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex bg-gray-900/60 border border-gray-800/60 rounded-lg overflow-hidden">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-cyan-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, company, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[220px] max-w-sm px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
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
                    {["Person", "Company", "Role on Site", "Access Window", "Safety", "Status", "Signed In", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tarf) => {
                    const status = getTARFStatus(tarf);
                    const expired = isExpired(tarf);
                    return (
                      <tr
                        key={tarf.id}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${
                          expired ? "bg-red-900/5" : ""
                        }`}
                      >
                        {/* Person */}
                        <td className="px-5 py-4">
                          <p className="text-white text-sm font-medium">{tarf.person_name}</p>
                          {tarf.approved_by_name && (
                            <p className="text-gray-500 text-xs mt-0.5">Approved by {tarf.approved_by_name}</p>
                          )}
                        </td>

                        {/* Company */}
                        <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">
                          {tarf.company_name || "—"}
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4 text-gray-300 text-sm">{tarf.role_on_site || "—"}</td>

                        {/* Access Window */}
                        <td className="px-5 py-4 text-sm whitespace-nowrap">
                          <span className={expired ? "text-red-400" : "text-gray-400"}>
                            {tarf.expected_start
                              ? new Date(tarf.expected_start).toLocaleDateString()
                              : "—"}
                            {" → "}
                            {tarf.expected_end
                              ? new Date(tarf.expected_end).toLocaleDateString()
                              : "—"}
                          </span>
                          {expired && (
                            <span className="ml-1.5 text-[10px] text-red-500 uppercase font-bold">expired</span>
                          )}
                        </td>

                        {/* Safety Orientation */}
                        <td className="px-5 py-4">
                          {tarf.safety_orientation_complete ? (
                            <span className="flex items-center gap-1 text-green-400 text-xs font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              Complete
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 text-xs font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[status] || STATUS_COLORS["Rejected"]}`}>
                            {status}
                          </span>
                        </td>

                        {/* Sign-in time */}
                        <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {tarf.signed_in_at
                            ? new Date(tarf.signed_in_at).toLocaleString()
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(tarf.id)}
                                  disabled={actionLoading}
                                  className="text-green-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50 disabled:opacity-40"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectModal(tarf.id)}
                                  className="text-red-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(tarf.id)}
                                  className="text-gray-500 hover:text-gray-300 text-[11px] px-2 py-0.5 rounded bg-gray-800/50"
                                >
                                  Delete
                                </button>
                              </>
                            )}

                            {status === "Approved" && (
                              <button
                                onClick={() => handleSignIn(tarf.id)}
                                disabled={!tarf.safety_orientation_complete || actionLoading}
                                title={!tarf.safety_orientation_complete ? "Safety orientation must be complete before sign-in" : ""}
                                className="text-cyan-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Sign In
                              </button>
                            )}

                            {status === "On Site" && (
                              <button
                                onClick={() => handleSignOut(tarf.id)}
                                disabled={actionLoading}
                                className="text-purple-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50 disabled:opacity-40"
                              >
                                Sign Out
                              </button>
                            )}

                            {(status === "Approved" || status === "Pending") && (
                              <button
                                onClick={() => router.push(`/TARF/Edit/${tarf.id}`)}
                                className="text-gray-400 hover:text-white text-[11px] px-2 py-0.5 rounded bg-gray-800/50"
                              >
                                Edit
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
                        No TARF entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-white font-bold mb-2">Delete TARF Request?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone. Only pending requests can be deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-white font-bold text-lg mb-1">Reject TARF Request</h3>
              <p className="text-gray-400 text-sm mb-4">
                Provide a reason for rejection. This will be recorded for audit purposes.
              </p>
              <div className="mb-5">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for rejecting access..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setRejectModal(null); setRejectReason(""); }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {actionLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
