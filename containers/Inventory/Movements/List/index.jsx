"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStockMovements, getProducts, getWarehouses } from "@/services/Inventory";

const MOVEMENT_TYPES = ["IN", "OUT", "TRANSFER", "RETURN", "ADJUSTMENT"];

const TYPE_STYLES = {
  IN: { badge: "bg-green-500/20 text-green-300 border border-green-500/30", label: "Stock In", icon: "↓" },
  OUT: { badge: "bg-red-500/20 text-red-300 border border-red-500/30", label: "Stock Out", icon: "↑" },
  TRANSFER: { badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30", label: "Transfer", icon: "⇄" },
  RETURN: { badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30", label: "Return", icon: "↩" },
  ADJUSTMENT: { badge: "bg-purple-500/20 text-purple-300 border border-purple-500/30", label: "Adjust", icon: "±" },
};

const Toast = ({ msg }) =>
  msg ? (
    <div className={`z-50 px-4 py-3 rounded-lg border shadow-xl text-sm flex items-center gap-2 ${msg.type === "success"
        ? "bg-green-900/90 border-green-500/40 text-green-300"
        : "bg-red-900/90 border-red-500/40 text-red-300"
      }`}>
      {msg.text}
    </div>
  ) : null;

const TODAY = new Date().toISOString().slice(0, 10);
const MONTH_START = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  .toISOString()
  .slice(0, 10);

export default function MovementsList() {
  const router = useRouter();

  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(MONTH_START);
  const [dateTo, setDateTo] = useState(TODAY);
  const [warehouseFilter, setWH] = useState("");
  const [productFilter, setProduct] = useState("");

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [mv, pr, wh] = await Promise.all([
        getStockMovements({ date_from: dateFrom, date_to: dateTo }),
        getProducts(),
        getWarehouses(),
      ]);
      setMovements(Array.isArray(mv) ? mv : mv?.data || []);
      setProducts(Array.isArray(pr) ? pr : pr?.data || []);
      setWarehouses(Array.isArray(wh) ? wh : wh?.data || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load movements" });
    } finally {
      setLoading(false);
    }
  }

  async function applyDateFilter() {
    setLoading(true);
    try {
      const res = await getStockMovements({ date_from: dateFrom, date_to: dateTo });
      setMovements(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load movements" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = movements.filter((m) => {
    const ms =
      !searchTerm ||
      (m.product_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.sku_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.reference_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.created_by_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const mt = !typeFilter || m.movement_type === typeFilter;
    const mw =
      !warehouseFilter ||
      m.from_warehouse_id === warehouseFilter ||
      m.to_warehouse_id === warehouseFilter;
    const mp = !productFilter || m.product_id === productFilter;
    return ms && mt && mw && mp;
  });

  // Summary counts for current filter
  const summary = MOVEMENT_TYPES.reduce((acc, t) => {
    acc[t] = movements.filter((m) => m.movement_type === t).length;
    return acc;
  }, {});
  const totalQtyIn = movements.filter((m) => ["IN", "RETURN"].includes(m.movement_type)).reduce((s, m) => s + (m.quantity || 0), 0);
  const totalQtyOut = movements.filter((m) => ["OUT"].includes(m.movement_type)).reduce((s, m) => s + (m.quantity || 0), 0);

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">

        {/* Header */}
        <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Stock Movements</h1>
            <p className="text-gray-400">Full audit trail of all inventory in/out/transfer/adjustment events</p>
          </div>
          <div className="flex items-center gap-3">
            <Toast msg={msg} />
            <button
              onClick={() => router.push("/Inventory/Movements/Add")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Record Movement
            </button>

          </div>

        </div>

        {/* Type summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {[
            { label: "Total", value: movements.length, color: "text-white" },
            { label: "In", value: summary.IN, color: "text-green-400" },
            { label: "Out", value: summary.OUT, color: "text-red-400" },
            { label: "Transfer", value: summary.TRANSFER, color: "text-blue-400" },
            { label: "Return", value: summary.RETURN, color: "text-yellow-400" },
            { label: "Adjustment", value: summary.ADJUSTMENT, color: "text-purple-400" },
            { label: "Net Qty In", value: `+${totalQtyIn - totalQtyOut}`, color: totalQtyIn >= totalQtyOut ? "text-green-400" : "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4 mb-5 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Search</label>
            <input
              type="text"
              placeholder="Product, SKU, ref, user..."
              value={searchTerm}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 w-56"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="">All Types</option>
              {MOVEMENT_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_STYLES[t].label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Product</label>
            <select
              value={productFilter}
              onChange={(e) => setProduct(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer w-44"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider">Warehouse</label>
            <select
              value={warehouseFilter}
              onChange={(e) => setWH(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer w-44"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 uppercase tracking-wider">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={applyDateFilter}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Apply
          </button>

          <button
            onClick={() => {
              setSearch(""); setTypeFilter(""); setProduct(""); setWH("");
              setDateFrom(MONTH_START); setDateTo(TODAY);
            }}
            className="px-5 py-2.5 border border-gray-600 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg text-sm transition-colors"
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-16 text-center">
            <p className="text-5xl mb-4">📦</p>
            <p className="text-gray-400 text-lg mb-1">No movements found</p>
            <p className="text-gray-600 text-sm mb-6">Try adjusting your filters or record a new stock movement</p>
            <button
              onClick={() => router.push("/Inventory/Movements/Add")}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium"
            >
              Record First Movement
            </button>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    {["Date & Time", "Type", "Product / SKU", "From Warehouse", "To Warehouse", "Qty", "Reference", "Project", "Notes", "Recorded By"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const style = TYPE_STYLES[m.movement_type] || TYPE_STYLES.ADJUSTMENT;
                    return (
                      <tr key={m.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <p className="text-white text-sm">{m.created_at ? new Date(m.created_at).toLocaleDateString() : "—"}</p>
                          <p className="text-gray-500 text-xs">{m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.badge}`}>
                            <span>{style.icon}</span>
                            {style.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-white text-sm font-medium">{m.product_name || "—"}</p>
                          {m.sku_name && <p className="text-gray-500 text-xs mt-0.5 font-mono">{m.sku_name}</p>}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-sm">{m.from_warehouse_name || "—"}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm">{m.to_warehouse_name || "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`text-base font-bold ${["IN", "RETURN"].includes(m.movement_type) ? "text-green-400" :
                              m.movement_type === "OUT" ? "text-red-400" :
                                m.movement_type === "ADJUSTMENT" ? "text-purple-400" : "text-blue-400"
                            }`}>
                            {["IN", "RETURN"].includes(m.movement_type) ? "+" : m.movement_type === "OUT" ? "−" : ""}
                            {m.quantity}
                          </span>
                          {m.unit_type && <span className="text-gray-600 text-xs ml-1">{m.unit_type}</span>}
                        </td>
                        <td className="px-5 py-4">
                          {m.reference_id ? (
                            <div>
                              <p className="text-gray-300 text-xs font-mono">{m.reference_id}</p>
                              {m.reference_type && <p className="text-gray-600 text-xs mt-0.5">{m.reference_type}</p>}
                            </div>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-xs">{m.project_name || m.project_id || "—"}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs max-w-[160px] truncate" title={m.notes}>
                          {m.notes || "—"}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">{m.created_by_name || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-gray-800 flex items-center justify-between">
              <p className="text-gray-500 text-xs">
                Showing {filtered.length} of {movements.length} movements
              </p>
              <p className="text-gray-500 text-xs">
                Net qty change: <span className={totalQtyIn - totalQtyOut >= 0 ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
                  {totalQtyIn - totalQtyOut >= 0 ? "+" : ""}{totalQtyIn - totalQtyOut}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
