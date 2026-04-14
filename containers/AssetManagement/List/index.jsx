"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAssets, changeAssetStatus, assignAsset, getAssetHistory } from "@/services/AssetManagement";
import { getUsers } from "@/services/Users";

const ASSET_STATUSES = ["IN_STOCK", "ASSIGNED", "IN_REPAIR", "DAMAGED", "RETIRED", "LOST"];
const CATEGORIES     = ["IT Equipment", "Vehicle", "Machinery", "Furniture", "Safety Equipment", "Tools", "Other"];
const TABS           = ["All", "IN_STOCK", "ASSIGNED", "IN_REPAIR", "DAMAGED", "RETIRED"];

const STATUS_COLORS = {
  IN_STOCK:  "bg-green-500/20 text-green-300 border-green-500/30",
  ASSIGNED:  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  IN_REPAIR: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  DAMAGED:   "bg-orange-500/20 text-orange-300 border-orange-500/30",
  RETIRED:   "bg-gray-600/30 text-gray-400 border-gray-600/40",
  LOST:      "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_ICONS = {
  IN_STOCK:  "📦", ASSIGNED: "👤", IN_REPAIR: "🔧",
  DAMAGED:   "⚠️", RETIRED:  "🗑️", LOST:     "❓",
};

const TRANSITIONS = {
  IN_STOCK:  ["ASSIGNED", "IN_REPAIR", "RETIRED"],
  ASSIGNED:  ["IN_STOCK", "IN_REPAIR", "DAMAGED", "LOST"],
  IN_REPAIR: ["IN_STOCK", "DAMAGED", "RETIRED"],
  DAMAGED:   ["IN_REPAIR", "RETIRED", "LOST"],
  RETIRED:   [],
  LOST:      ["IN_STOCK"],
};

const Toast = ({ msg }) => msg ? (
  <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl text-sm flex items-center gap-2 ${
    msg.type === "success" ? "bg-green-900/90 border-green-500/40 text-green-300" : "bg-red-900/90 border-red-500/40 text-red-300"
  }`}>{msg.text}</div>
) : null;

export default function AssetsList() {
  const router = useRouter();

  const [assets, setAssets]     = useState([]);
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [msg, setMsg]           = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Status change modal
  const [statusModal, setStatusModal] = useState(null); // { asset, nextStatus }
  const [statusReason, setStatusReason] = useState("");

  // Assign modal
  const [assignModal, setAssignModal]   = useState(null);
  const [assignUserId, setAssignUserId] = useState("");

  // History modal
  const [historyModal, setHistoryModal]     = useState(null);
  const [historyEvents, setHistoryEvents]   = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { fetchAssets(); fetchUsers(); }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getAssets();
      setAssets(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch { setError("Failed to load assets"); }
    finally { setLoading(false); }
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
      setMsg({ type: "success", text: successMsg });
      await fetchAssets();
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Action failed" });
    } finally { setActionLoading(false); }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    await withAction(
      () => changeAssetStatus(statusModal.asset.id, { status: statusModal.nextStatus, reason: statusReason }),
      `Asset status changed to ${statusModal.nextStatus}`
    );
    setStatusModal(null);
    setStatusReason("");
  };

  const handleAssign = async () => {
    if (!assignModal || !assignUserId) return;
    await withAction(
      () => assignAsset(assignModal.id, { assignedToUserId: assignUserId }),
      "Asset assigned successfully"
    );
    setAssignModal(null);
    setAssignUserId("");
  };

  const openHistory = async (asset) => {
    setHistoryModal(asset);
    setHistoryLoading(true);
    try {
      const res = await getAssetHistory(asset.id);
      setHistoryEvents(Array.isArray(res) ? res : res?.data || []);
    } catch { setHistoryEvents([]); }
    finally { setHistoryLoading(false); }
  };

  const isWarrantyExpiring = (asset) => {
    if (!asset.warrantyExpiry) return false;
    const diff = (new Date(asset.warrantyExpiry) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  const isWarrantyExpired = (asset) =>
    asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date();

  const filtered = assets.filter((a) => {
    const matchTab    = activeTab === "All" || a.status === activeTab;
    const matchSearch = !searchTerm ||
      (a.assetTag || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = !filterCat || a.category === filterCat;
    return matchTab && matchSearch && matchCat;
  });

  const stats = {
    total:    assets.length,
    inStock:  assets.filter((a) => a.status === "IN_STOCK").length,
    assigned: assets.filter((a) => a.status === "ASSIGNED").length,
    inRepair: assets.filter((a) => a.status === "IN_REPAIR").length,
    damaged:  assets.filter((a) => a.status === "DAMAGED").length,
    expired:  assets.filter(isWarrantyExpired).length,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <Toast msg={msg} />

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Asset Management</h1>
            <p className="text-gray-400">Track enterprise assets — lifecycle, assignments, and maintenance</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/Assets/Assignments")}
              className="px-5 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg font-medium transition-all flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Assignments
            </button>
            <button onClick={() => router.push("/Assets/Add")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Register Asset
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            { label: "Total",     value: stats.total,    color: "text-white" },
            { label: "In Stock",  value: stats.inStock,  color: "text-green-400" },
            { label: "Assigned",  value: stats.assigned, color: "text-cyan-400" },
            { label: "In Repair", value: stats.inRepair, color: "text-yellow-400" },
            { label: "Damaged",   value: stats.damaged,  color: "text-orange-400" },
            { label: "Warranty ⚠", value: stats.expired, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex bg-gray-900/60 border border-gray-800/60 rounded-lg overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}>
                {STATUS_ICONS[tab] ? `${STATUS_ICONS[tab]} ` : ""}{tab.replace(/_/g," ")}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search by tag or name..."
            value={searchTerm} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] max-w-sm px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500" />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {error && <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>}

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
                    {["Asset Tag", "Name / Category", "Status", "Assigned To", "Location", "Cost", "Warranty", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => {
                    const transitions   = TRANSITIONS[asset.status] || [];
                    const warExpiring   = isWarrantyExpiring(asset);
                    const warExpired    = isWarrantyExpired(asset);
                    const assignedUser  = users.find((u) => u.id === asset.currentAssignedUserId);

                    return (
                      <tr key={asset.id}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${warExpired ? "bg-red-900/5" : ""}`}>
                        <td className="px-5 py-4">
                          <p className="text-cyan-400 font-mono text-sm font-medium">{asset.assetTag}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-white text-sm font-medium">{asset.name}</p>
                          <p className="text-gray-500 text-xs mt-0.5">{asset.category}</p>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[asset.status]}`}>
                            {STATUS_ICONS[asset.status]} {asset.status.replace(/_/g," ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                          {assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : "—"}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">{asset.location?.name || "—"}</td>
                        <td className="px-5 py-4 text-sm text-gray-400 font-mono">
                          {asset.purchaseCost ? `$${Number(asset.purchaseCost).toLocaleString()}` : "—"}
                        </td>
                        <td className={`px-5 py-4 text-xs whitespace-nowrap ${warExpired ? "text-red-400" : warExpiring ? "text-yellow-400" : "text-gray-500"}`}>
                          {asset.warrantyExpiry
                            ? new Date(asset.warrantyExpiry).toLocaleDateString()
                            : "—"}
                          {warExpired   && <span className="ml-1 text-[10px] text-red-500 uppercase font-bold">expired</span>}
                          {warExpiring  && !warExpired && <span className="ml-1 text-[10px] text-yellow-500 uppercase">expiring</span>}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 flex-wrap min-w-[180px]">
                            <button onClick={() => openHistory(asset)}
                              className="text-gray-400 hover:text-white text-[11px] px-2 py-0.5 rounded bg-gray-800/50">History</button>
                            {asset.status === "IN_STOCK" && (
                              <button onClick={() => router.push(`/Assets/Assign/${asset.id}`)}
                                className="text-cyan-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">Assign</button>
                            )}
                            {transitions.map((next) => (
                              <button key={next}
                                onClick={() => { setStatusModal({ asset, nextStatus: next }); setStatusReason(""); }}
                                className={`text-[11px] px-2 py-0.5 rounded bg-gray-800/50 ${
                                  next === "IN_STOCK" ? "text-green-400" :
                                  next === "IN_REPAIR" ? "text-yellow-400" :
                                  next === "DAMAGED" ? "text-orange-400" :
                                  next === "RETIRED" ? "text-gray-400" : "text-red-400"
                                }`}>
                                → {next.replace(/_/g," ")}
                              </button>
                            ))}
                            <button onClick={() => router.push(`/Assets/Edit/${asset.id}`)}
                              className="text-purple-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">Edit</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} className="text-center text-gray-500 py-14">No assets found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Status Change Modal ── */}
        {statusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-white font-bold text-lg mb-1">Change Asset Status</h3>
              <p className="text-gray-400 text-sm mb-5">
                <span className="font-mono text-cyan-400">{statusModal.asset.assetTag}</span>
                {" → "}
                <span className={`text-xs px-2 py-0.5 rounded-full border ml-1 ${STATUS_COLORS[statusModal.nextStatus]}`}>
                  {statusModal.nextStatus.replace(/_/g," ")}
                </span>
              </p>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Reason / Notes</label>
                <textarea value={statusReason} onChange={(e) => setStatusReason(e.target.value)} rows={3}
                  placeholder="Reason for this status change..."
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" />
              </div>
              <div className="flex gap-3 justify-end mt-5">
                <button onClick={() => setStatusModal(null)} className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleStatusChange} disabled={actionLoading}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
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
              <h3 className="text-white font-bold text-lg mb-1">Assign Asset</h3>
              <p className="text-gray-400 text-sm mb-5 font-mono">{assignModal.assetTag} — {assignModal.name}</p>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Assign To User <span className="text-red-400">*</span></label>
                <select value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                  <option value="">Select user...</option>
                  {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end mt-5">
                <button onClick={() => setAssignModal(null)} className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleAssign} disabled={actionLoading || !assignUserId}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {actionLoading ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── History Modal ── */}
        {historyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-white font-bold text-lg">Status History</h3>
                  <p className="text-cyan-400 font-mono text-sm">{historyModal.assetTag} — {historyModal.name}</p>
                </div>
                <button onClick={() => setHistoryModal(null)} className="text-gray-400 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {historyLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : historyEvents.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6">No history recorded yet</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gray-700" />
                  <div className="space-y-4">
                    {historyEvents.map((ev, i) => {
                      const changer = users.find((u) => u.id === ev.changedBy);
                      return (
                        <div key={ev.id || i} className="relative pl-8">
                          <div className={`absolute left-0 w-7 h-7 rounded-full flex items-center justify-center text-xs ${STATUS_COLORS[ev.newStatus] || "bg-gray-800 border border-gray-700"}`}>
                            {STATUS_ICONS[ev.newStatus] || "•"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              {ev.previousStatus && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[ev.previousStatus]}`}>
                                  {ev.previousStatus.replace(/_/g," ")}
                                </span>
                              )}
                              <span className="text-gray-500 text-xs">→</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[ev.newStatus]}`}>
                                {ev.newStatus?.replace(/_/g," ")}
                              </span>
                            </div>
                            {ev.reason && <p className="text-gray-400 text-xs mt-1">{ev.reason}</p>}
                            <p className="text-gray-600 text-xs mt-0.5">
                              {changer ? `${changer.firstName} ${changer.lastName}` : "System"}
                              {" · "}
                              {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
