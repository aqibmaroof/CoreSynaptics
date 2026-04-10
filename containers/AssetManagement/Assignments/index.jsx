"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getActiveAssignments,
  getAssets,
  returnAsset,
} from "@/services/AssetManagement";
import { getUsers } from "@/services/Users";

const today = () => new Date().toISOString().split("T")[0];

const isOverdue = (expectedDate) =>
  expectedDate && expectedDate < today();

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

const Toast = ({ msg }) =>
  msg ? (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl text-sm flex items-center gap-2 ${
      msg.type === "success"
        ? "bg-green-900/90 border-green-500/40 text-green-300"
        : "bg-red-900/90 border-red-500/40 text-red-300"
    }`}>
      {msg.text}
    </div>
  ) : null;

export default function AssetAssignmentsList() {
  const router = useRouter();

  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets]           = useState([]);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [msg, setMsg]                 = useState(null);
  const [filterView, setFilterView]   = useState("active"); // "active" | "all"
  const [search, setSearch]           = useState("");

  // Return modal
  const [returnModal, setReturnModal] = useState(null); // assignment object
  const [returnForm, setReturnForm]   = useState({ return_date: today(), condition_notes: "" });
  const [returnErrors, setReturnErrors] = useState({});
  const [returning, setReturning]     = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [assignRes, assetRes, userRes] = await Promise.all([
        getActiveAssignments().catch(() => []),
        getAssets().catch(() => []),
        getUsers().catch(() => []),
      ]);
      setAssignments(Array.isArray(assignRes) ? assignRes : assignRes?.data || []);
      setAssets(Array.isArray(assetRes) ? assetRes : assetRes?.data || []);
      setUsers(Array.isArray(userRes) ? userRes : userRes?.data || []);
    } catch {
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const assetById  = (id) => assets.find((a) => String(a.id) === String(id));
  const userById   = (id) => users.find((u) => String(u.id) === String(id));
  const userName   = (id) => {
    const u = userById(id);
    return u ? `${u.firstName} ${u.lastName}` : id ?? "—";
  };

  // ── Return flow ───────────────────────────────────────────────
  const openReturn = (assignment) => {
    setReturnModal(assignment);
    setReturnForm({ return_date: today(), condition_notes: "" });
    setReturnErrors({});
  };

  const setR = (k) => (e) => {
    setReturnForm((p) => ({ ...p, [k]: e.target.value }));
    if (returnErrors[k]) setReturnErrors((p) => ({ ...p, [k]: "" }));
  };

  const validateReturn = () => {
    const e = {};
    if (!returnForm.return_date) e.return_date = "Return date is required";
    setReturnErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleReturn = async (ev) => {
    ev.preventDefault();
    if (!validateReturn()) return;
    setReturning(true);
    try {
      await returnAsset(returnModal.asset_id, returnModal.id, {
        return_date:     returnForm.return_date,
        condition_notes: returnForm.condition_notes || undefined,
      });
      setMsg({ type: "success", text: `Asset returned — ${assetById(returnModal.asset_id)?.asset_tag ?? ""} is now IN_STOCK` });
      setReturnModal(null);
      await fetchAll();
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to return asset" });
    } finally {
      setReturning(false);
    }
  };

  // ── Derived data ─────────────────────────────────────────────
  const overdueCount  = assignments.filter((a) => isOverdue(a.expected_return_date)).length;
  const dueSoonCount  = assignments.filter((a) => {
    const d = daysUntil(a.expected_return_date);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  const filtered = assignments.filter((a) => {
    if (!search) return true;
    const asset = assetById(a.asset_id);
    const user  = userById(a.assigned_to_user_id);
    const q = search.toLowerCase();
    return (
      (asset?.asset_tag  || "").toLowerCase().includes(q) ||
      (asset?.name       || "").toLowerCase().includes(q) ||
      (user?.firstName   || "").toLowerCase().includes(q) ||
      (user?.lastName    || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <Toast msg={msg} />

        {/* Header */}
        <div className="mb-8 flex flex-wrap justify-between items-start gap-4">
          <div>
            <button onClick={() => router.push("/Assets/List")}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-3 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Assets
            </button>
            <h1 className="text-4xl font-bold text-white mb-2">Asset Assignments</h1>
            <p className="text-gray-400">Track active assignments, overdue returns, and assignment history</p>
          </div>
          <button
            onClick={() => router.push("/Assets/List")}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Assign an Asset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Assignments", value: assignments.length,    color: "text-cyan-400"   },
            { label: "Overdue",            value: overdueCount,          color: "text-red-400"    },
            { label: "Due Within 7 Days",  value: dueSoonCount,          color: "text-yellow-400" },
            { label: "Total Assets",       value: assets.length,         color: "text-white"      },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Overdue alert */}
        {overdueCount > 0 && (
          <div className="mb-5 bg-red-900/20 border border-red-500/30 rounded-xl p-4 flex gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-red-300 text-sm">
              <strong>{overdueCount} assignment{overdueCount > 1 ? "s are" : " is"} overdue.</strong>
              {" "}These assets have passed their expected return date.
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by asset tag, name, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] max-w-sm px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
          />
        </div>

        {error && (
          <div className="mb-5 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
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
                    {["Asset", "Assigned To", "Assigned Date", "Expected Return", "Status", "Notes", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const asset   = assetById(a.asset_id);
                    const days    = daysUntil(a.expected_return_date);
                    const overdue = isOverdue(a.expected_return_date);
                    const dueSoon = !overdue && days !== null && days <= 7;

                    return (
                      <tr key={a.id}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${overdue ? "bg-red-900/5" : ""}`}>

                        <td className="px-5 py-4">
                          <p className="text-cyan-400 font-mono text-sm font-medium">{asset?.asset_tag ?? a.asset_id}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{asset?.name ?? "—"}</p>
                          <p className="text-gray-600 text-xs">{asset?.category ?? ""}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-white text-sm">{userName(a.assigned_to_user_id)}</p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-400 whitespace-nowrap">
                          {a.assigned_date ?? "—"}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {a.expected_return_date ? (
                            <div>
                              <p className={`text-sm font-medium ${overdue ? "text-red-400" : dueSoon ? "text-yellow-400" : "text-gray-300"}`}>
                                {a.expected_return_date}
                              </p>
                              <p className={`text-xs mt-0.5 ${overdue ? "text-red-500" : dueSoon ? "text-yellow-500" : "text-gray-600"}`}>
                                {overdue
                                  ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
                                  : days === 0
                                    ? "Due today"
                                    : `${days} day${days !== 1 ? "s" : ""} remaining`}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-600 text-sm">Not set</span>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {overdue ? (
                            <span className="text-xs px-2.5 py-1 rounded-full border bg-red-900/30 text-red-300 border-red-500/30">Overdue</span>
                          ) : dueSoon ? (
                            <span className="text-xs px-2.5 py-1 rounded-full border bg-yellow-900/30 text-yellow-300 border-yellow-500/30">Due Soon</span>
                          ) : (
                            <span className="text-xs px-2.5 py-1 rounded-full border bg-blue-900/30 text-blue-300 border-blue-500/30">Active</span>
                          )}
                        </td>

                        <td className="px-5 py-4 max-w-[180px]">
                          <p className="text-gray-500 text-xs truncate">{a.notes || "—"}</p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openReturn(a)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Return
                            </button>
                            <button
                              onClick={() => router.push(`/Assets/Edit/${a.asset_id}`)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700 text-gray-300 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-gray-500 py-16">
                        {search ? "No assignments match your search" : "No active assignments"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Return Modal ─────────────────────────────────────── */}
        {returnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl">
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg">Return Asset</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      <span className="text-cyan-400 font-mono">{assetById(returnModal.asset_id)?.asset_tag ?? returnModal.asset_id}</span>
                      {" — "}
                      {assetById(returnModal.asset_id)?.name}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Assigned to: <span className="text-gray-300">{userName(returnModal.assigned_to_user_id)}</span>
                      {" · "}Since {returnModal.assigned_date ?? "—"}
                    </p>
                  </div>
                  <button onClick={() => setReturnModal(null)} className="text-gray-400 hover:text-white ml-4">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleReturn} noValidate className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Return Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={returnForm.return_date}
                    onChange={setR("return_date")}
                    className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 transition-colors ${
                      returnErrors.return_date ? "border-red-500" : "border-gray-700"
                    }`}
                  />
                  {returnErrors.return_date && (
                    <p className="text-red-400 text-xs mt-1">{returnErrors.return_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Condition Notes
                  </label>
                  <textarea
                    value={returnForm.condition_notes}
                    onChange={setR("condition_notes")}
                    rows={3}
                    placeholder="Describe the asset condition on return — any damage, missing parts, wear..."
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none transition-colors"
                  />
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-300/70">
                  The asset status will automatically be set to <strong className="text-blue-300">IN_STOCK</strong> after return is confirmed.
                </div>

                <div className="flex gap-3 justify-end pt-1">
                  <button type="button" onClick={() => setReturnModal(null)}
                    className="px-5 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={returning}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all">
                    {returning && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                    {returning ? "Processing..." : "Confirm Return"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
