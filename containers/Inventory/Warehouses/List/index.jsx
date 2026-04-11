"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getWarehouses,
  updateWarehouse,
  deleteWarehouse,
  getWarehouseStockSummary,
} from "@/services/Inventory";

const WAREHOUSE_TYPES = [
  "Main Warehouse",
  "Site Storage",
  "Transit Hub",
  "Cold Storage",
  "Secure Storage",
  "Distribution Center",
  "Other",
];

const TYPE_ICON = {
  "Main Warehouse": "🏭",
  "Site Storage": "🏗️",
  "Transit Hub": "🚛",
  "Cold Storage": "❄️",
  "Secure Storage": "🔒",
  "Distribution Center": "📦",
  "Other": "🏢",
};

const STATUS_STYLES = {
  active: "bg-green-500/20 text-green-300 border border-green-500/30",
  inactive: "bg-gray-600/30 text-gray-400 border border-gray-600/40",
};

const Toast = ({ msg }) =>
  msg ? (
    <div className={`z-50 px-4 py-3 rounded-lg border shadow-xl text-sm ${msg.type === "success"
        ? "bg-green-900/90 border-green-500/40 text-green-300"
        : "bg-red-900/90 border-red-500/40 text-red-300"
      }`}>
      {msg.text}
    </div>
  ) : null;

export default function WarehousesList() {
  const router = useRouter();

  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [searchTerm, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatus] = useState("");
  const [actionLoading, setAL] = useState(false);

  // Stock summary drawer
  const [stockDrawer, setStockDrawer] = useState(null);
  const [stockSummary, setStockSummary] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { fetchWarehouses(); }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function fetchWarehouses() {
    setLoading(true);
    try {
      const res = await getWarehouses();
      setWarehouses(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load warehouses" });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(wh) {
    const next = wh.status === "active" ? "inactive" : "active";
    setAL(true);
    try {
      await updateWarehouse(wh.id, { status: next });
      setMsg({ type: "success", text: `Warehouse marked as ${next}` });
      await fetchWarehouses();
    } catch {
      setMsg({ type: "error", text: "Failed to update status" });
    } finally {
      setAL(false);
    }
  }

  async function handleDelete(id) {
    setAL(true);
    try {
      await deleteWarehouse(id);
      setMsg({ type: "success", text: "Warehouse deleted" });
      setDeleteConfirm(null);
      await fetchWarehouses();
    } catch {
      setMsg({ type: "error", text: "Failed to delete warehouse" });
    } finally {
      setAL(false);
    }
  }

  async function openStockDrawer(wh) {
    setStockDrawer(wh);
    setStockSummary(null);
    setLoadingStock(true);
    try {
      const res = await getWarehouseStockSummary(wh.id);
      setStockSummary(res?.data || null);
    } catch {
      setStockSummary(null);
    } finally {
      setLoadingStock(false);
    }
  }

  const filtered = warehouses.filter((w) => {
    const ms =
      !searchTerm ||
      (w.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.city || "").toLowerCase().includes(searchTerm.toLowerCase());
    const mt = !typeFilter || w.type === typeFilter;
    const ms2 = !statusFilter || w.status === statusFilter;
    return ms && mt && ms2;
  });

  const stats = {
    total: warehouses.length,
    active: warehouses.filter((w) => w.status === "active").length,
    inactive: warehouses.filter((w) => w.status === "inactive").length,
    totalSkus: warehouses.reduce((s, w) => s + (w.sku_count || 0), 0),
  };

  const capacityPct = (w) => {
    if (!w.capacity || !w.used_capacity) return 0;
    return Math.min(100, Math.round((w.used_capacity / w.capacity) * 100));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">


        {/* Header */}
        <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Warehouses</h1>
            <p className="text-gray-400">Manage warehouse locations, capacity, and stock visibility</p>
          </div>
          <div className="flex items-center gap-3">
            <Toast msg={msg} />
            <button
              onClick={() => router.push("/Inventory/Warehouses/Add")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Warehouse
            </button>
          </div>

        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Warehouses", value: stats.total, color: "text-white" },
            { label: "Active", value: stats.active, color: "text-green-400" },
            { label: "Inactive", value: stats.inactive, color: "text-gray-400" },
            { label: "Total SKUs Stored", value: stats.totalSkus, color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, code, location..."
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Types</option>
            {WAREHOUSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-16 text-center">
            <p className="text-5xl mb-4">🏭</p>
            <p className="text-gray-400 text-lg mb-1">No warehouses found</p>
            <p className="text-gray-600 text-sm mb-6">Add your first warehouse to start tracking stock locations</p>
            <button
              onClick={() => router.push("/Inventory/Warehouses/Add")}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium"
            >
              Add First Warehouse
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((wh) => {
              const pct = capacityPct(wh);
              return (
                <div
                  key={wh.id}
                  className={`bg-gray-900/50 rounded-xl border overflow-hidden transition-all ${wh.status === "inactive" ? "border-gray-800/50 opacity-60" : "border-gray-800/50 hover:border-gray-700"
                    }`}
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-gray-800/60">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{TYPE_ICON[wh.type] || "🏢"}</span>
                        <div>
                          <h3 className="text-white font-semibold text-base">{wh.name}</h3>
                          {wh.code && (
                            <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">
                              {wh.code}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLES[wh.status] || STATUS_STYLES.inactive}`}>
                        {wh.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    {/* Type */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">Type</span>
                      <span className="text-gray-300">{wh.type || "—"}</span>
                    </div>

                    {/* Location */}
                    {(wh.location || wh.city) && (
                      <div className="flex items-start gap-2 text-sm">
                        <span className="text-gray-500 w-20 flex-shrink-0">Location</span>
                        <span className="text-gray-300 text-xs leading-relaxed">
                          {[wh.location, wh.city, wh.country].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    {/* Manager */}
                    {wh.manager_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 w-20 flex-shrink-0">Manager</span>
                        <span className="text-gray-300">{wh.manager_name}</span>
                      </div>
                    )}

                    {/* SKU count */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">SKUs</span>
                      <span className="text-cyan-400 font-medium">{wh.sku_count ?? "—"}</span>
                    </div>

                    {/* Capacity bar */}
                    {wh.capacity > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Capacity</span>
                          <span>{wh.used_capacity ?? 0} / {wh.capacity} {wh.capacity_unit || "units"} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${pct > 85 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-cyan-500"
                              }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="px-5 py-4 border-t border-gray-800/60 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openStockDrawer(wh)}
                      className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium transition-colors text-center"
                    >
                      View Stock
                    </button>
                    <button
                      onClick={() => router.push(`/Inventory/Warehouses/Edit/${wh.id}`)}
                      className="px-3 py-2 border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 rounded-lg text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(wh)}
                      disabled={actionLoading}
                      className={`px-3 py-2 rounded-lg text-xs transition-colors border ${wh.status === "active"
                          ? "border-yellow-700/50 text-yellow-500 hover:bg-yellow-900/20"
                          : "border-green-700/50 text-green-500 hover:bg-green-900/20"
                        }`}
                    >
                      {wh.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(wh)}
                      className="px-3 py-2 border border-red-900/40 text-red-500 hover:bg-red-900/20 rounded-lg text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stock Summary Drawer / Modal */}
        {stockDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setStockDrawer(null)} />
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-white font-bold text-lg">{stockDrawer.name}</h2>
                  <p className="text-gray-400 text-sm">{stockDrawer.type} · Stock Summary</p>
                </div>
                <button
                  onClick={() => setStockDrawer(null)}
                  className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
                >✕</button>
              </div>

              <div className="p-6">
                {loadingStock ? (
                  <div className="flex justify-center py-10">
                    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !stockSummary || stockSummary.items?.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-400">No stock recorded in this warehouse yet.</p>
                    <button
                      onClick={() => { setStockDrawer(null); router.push("/Inventory/Movements/Add"); }}
                      className="mt-4 px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm"
                    >
                      Record Stock In
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: "SKUs", value: stockSummary.total_skus ?? "—", color: "text-cyan-400" },
                        { label: "Total Qty", value: stockSummary.total_qty ?? "—", color: "text-white" },
                        { label: "Low Stock", value: stockSummary.low_stock_count ?? 0, color: "text-yellow-400" },
                      ].map((s) => (
                        <div key={s.label} className="bg-gray-800/60 rounded-xl p-3 text-center">
                          <p className="text-gray-500 text-xs">{s.label}</p>
                          <p className={`font-bold text-xl mt-1 ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      <div className="grid grid-cols-3 text-xs text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-800 px-2">
                        <span>Product / SKU</span>
                        <span className="text-center">Qty</span>
                        <span className="text-right">Status</span>
                      </div>
                      {stockSummary.items.map((item) => (
                        <div key={item.sku_id} className="grid grid-cols-3 items-center px-2 py-2 hover:bg-gray-800/40 rounded-lg">
                          <div>
                            <p className="text-white text-sm">{item.product_name}</p>
                            <p className="text-gray-500 text-xs font-mono">{item.sku_code}</p>
                          </div>
                          <p className="text-white font-medium text-center">{item.quantity}</p>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.quantity === 0
                                ? "bg-red-500/20 text-red-300"
                                : item.quantity <= 10
                                  ? "bg-yellow-500/20 text-yellow-300"
                                  : "bg-green-500/20 text-green-300"
                              }`}>
                              {item.quantity === 0 ? "Out" : item.quantity <= 10 ? "Low" : "OK"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-800 flex justify-end gap-3">
                <button
                  onClick={() => { setStockDrawer(null); router.push(`/Inventory/Movements/Add`); }}
                  className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
                >
                  Record Movement
                </button>
                <button
                  onClick={() => setStockDrawer(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-2">Delete Warehouse?</h3>
              <p className="text-gray-400 text-sm mb-2">
                Are you sure you want to delete{" "}
                <span className="text-white font-medium">{deleteConfirm.name}</span>?
              </p>
              <p className="text-red-400 text-xs mb-6">
                This will remove the warehouse record. Any existing stock records linked to this warehouse may be affected.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {actionLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
