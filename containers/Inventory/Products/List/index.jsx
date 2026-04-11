"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts, updateProduct, deleteProduct, getLowStockAlerts } from "@/services/Inventory";

const CATEGORIES = ["Electrical", "Mechanical", "Civil", "IT Equipment", "Safety", "Tools", "Consumables", "Spare Parts", "Other"];
const UNIT_TYPES  = ["pcs", "kg", "box", "set", "m", "L", "roll", "pallet"];

const STATUS_COLORS = {
  active:   "bg-green-500/20 text-green-300 border-green-500/30",
  inactive: "bg-gray-600/30 text-gray-400 border-gray-600/40",
};

const STOCK_BADGE = {
  ok:       "bg-green-500/20 text-green-300 border-green-500/30",
  low:      "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  out:      "bg-red-500/20 text-red-300 border-red-500/30",
};

function stockLabel(qty) {
  if (qty === null || qty === undefined) return { label: "—", cls: "text-gray-500" };
  if (qty === 0) return { label: "Out of Stock", cls: STOCK_BADGE.out };
  if (qty <= 10) return { label: `Low (${qty})`, cls: STOCK_BADGE.low };
  return { label: `In Stock (${qty})`, cls: STOCK_BADGE.ok };
}

const Toast = ({ msg }) =>
  msg ? (
    <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-xl text-sm flex items-center gap-2 ${
      msg.type === "success" ? "bg-green-900/90 border-green-500/40 text-green-300" : "bg-red-900/90 border-red-500/40 text-red-300"
    }`}>
      {msg.text}
    </div>
  ) : null;

export default function ProductsList() {
  const router = useRouter();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [msg, setMsg]             = useState(null);
  const [searchTerm, setSearch]   = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchProducts(); }, []);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch { setError("Failed to load products"); }
    finally { setLoading(false); }
  };

  const handleToggleStatus = async (product) => {
    const next = product.status === "active" ? "inactive" : "active";
    setActionLoading(true);
    try {
      await updateProduct(product.id, { status: next });
      setMsg({ type: "success", text: `Product marked as ${next}` });
      await fetchProducts();
    } catch { setMsg({ type: "error", text: "Failed to update status" }); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await deleteProduct(id);
      setMsg({ type: "success", text: "Product deleted" });
      setDeleteConfirm(null);
      await fetchProducts();
    } catch { setMsg({ type: "error", text: "Failed to delete product" }); }
    finally { setActionLoading(false); }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !searchTerm ||
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat    = !filterCat    || p.category === filterCat;
    const matchStatus = !filterStatus || p.status   === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const stats = {
    total:    products.length,
    active:   products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status === "inactive").length,
    lowStock: products.filter((p) => p.total_stock !== undefined && p.total_stock > 0 && p.total_stock <= 10).length,
    outStock: products.filter((p) => p.total_stock === 0).length,
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <Toast msg={msg} />

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Products & Inventory</h1>
            <p className="text-gray-400">Manage products, SKUs, and warehouse stock levels</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/Inventory/StockMovement/Add")}
              className="px-5 py-3 border border-gray-600 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded-lg text-sm font-medium transition-all"
            >
              Record Movement
            </button>
            <button
              onClick={() => router.push("/Inventory/Products/Add")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total Products", value: stats.total,    color: "text-white" },
            { label: "Active",         value: stats.active,   color: "text-green-400" },
            { label: "Inactive",       value: stats.inactive, color: "text-gray-400" },
            { label: "Low Stock",      value: stats.lowStock, color: "text-yellow-400" },
            { label: "Out of Stock",   value: stats.outStock, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4">
              <p className="text-gray-500 text-xs uppercase tracking-wider">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input type="text" placeholder="Search by name, barcode, brand..."
            value={searchTerm} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500" />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                    {["Product", "Category", "Brand", "Unit", "Barcode", "SKUs", "Total Stock", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const stock = stockLabel(p.total_stock);
                    return (
                      <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-white text-sm font-medium">{p.name}</p>
                          {p.description && <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[180px]">{p.description}</p>}
                        </td>
                        <td className="px-5 py-4 text-gray-400 text-sm whitespace-nowrap">{p.category || "—"}</td>
                        <td className="px-5 py-4 text-gray-400 text-sm">{p.brand || "—"}</td>
                        <td className="px-5 py-4 text-gray-500 text-sm font-mono">{p.unit_type || "—"}</td>
                        <td className="px-5 py-4 text-gray-500 text-xs font-mono">{p.barcode || "—"}</td>
                        <td className="px-5 py-4 text-cyan-400 text-sm font-mono">{p.sku_count ?? "—"}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${stock.cls}`}>{stock.label}</span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_COLORS[p.status] || STATUS_COLORS.inactive}`}>
                            {p.status || "inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button onClick={() => router.push(`/Inventory/Products/Edit/${p.id}`)}
                              className="text-cyan-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">Edit</button>
                            <button onClick={() => router.push(`/Inventory/Products/${p.id}/SKUs`)}
                              className="text-purple-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">SKUs</button>
                            <button onClick={() => handleToggleStatus(p)} disabled={actionLoading}
                              className={`text-[11px] px-2 py-0.5 rounded bg-gray-800/50 disabled:opacity-40 ${p.status === "active" ? "text-yellow-400" : "text-green-400"}`}>
                              {p.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                            <button onClick={() => setDeleteConfirm(p.id)}
                              className="text-red-400 hover:opacity-80 text-[11px] px-2 py-0.5 rounded bg-gray-800/50">Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-gray-500 py-14">No products found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
              <h3 className="text-white font-bold mb-2">Delete Product?</h3>
              <p className="text-gray-400 text-sm mb-6">All associated SKUs and stock records will be removed. This cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
