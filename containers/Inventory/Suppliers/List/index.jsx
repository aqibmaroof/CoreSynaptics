"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getSuppliers,
  deleteSupplier,
  updateSupplier,
} from "@/services/Inventory";

const Toast = ({ msg }) =>
  msg ? (
    <div
      className={`z-50 px-4 py-3 rounded-lg border shadow-xl text-sm ${
        msg.type === "success"
          ? "bg-green-900/90 border-green-500/40 text-green-300"
          : "bg-red-900/90 border-red-500/40 text-red-300"
      }`}
    >
      {msg.text}
    </div>
  ) : null;

export default function SuppliersList() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [searchTerm, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setAL] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [filterActive]);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function fetchSuppliers() {
    setLoading(true);
    try {
      const params = {};
      if (filterActive !== "") params.isActive = filterActive;
      const res = await getSuppliers(params);
      setSuppliers(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setMsg({ type: "error", text: "Failed to load suppliers" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setAL(true);
    try {
      await deleteSupplier(id);
      setMsg({ type: "success", text: "Supplier deleted" });
      setDeleteConfirm(null);
      await fetchSuppliers();
    } catch {
      setMsg({ type: "error", text: "Failed to delete supplier" });
    } finally {
      setAL(false);
    }
  }

  const filtered = suppliers.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.code || "").toLowerCase().includes(q) ||
      (s.contactName || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });

  const stats = {
    total: suppliers.length,
    active: suppliers.filter((s) => s.isActive !== false).length,
    inactive: suppliers.filter((s) => s.isActive === false).length,
  };

  const handleUpdate = async (e, editId, editedSupplier, newStatus) => {
    e.preventDefault();
    try {
      const payload = {
        isActive: newStatus,
      };
      await updateSupplier(editId, payload);
      setMsg({ type: "success", text: "Supplier updated successfully " });
      fetchSuppliers();
    } catch (err) {
      setMsg({ type: "error", text: "Failed to update supplier" });
    }
  };
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Suppliers</h1>
            <p className="text-gray-400">
              Manage vendors and suppliers you purchase inventory from
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Toast msg={msg} />
            <button
              onClick={() => router.push("/Inventory/Suppliers/Add")}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
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
              Add Supplier
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Suppliers",
              value: stats.total,
              color: "text-white",
            },
            { label: "Active", value: stats.active, color: "text-green-400" },
            {
              label: "Inactive",
              value: stats.inactive,
              color: "text-gray-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-4"
            >
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                {s.label}
              </p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, code, contact, email..."
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[220px] max-w-sm px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
          />
          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value);
            }}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-16 text-center">
            <p className="text-5xl mb-4">🏢</p>
            <p className="text-gray-400 text-lg mb-1">No suppliers found</p>
            <p className="text-gray-600 text-sm mb-6">
              Add your first supplier to start tracking your vendors
            </p>
            <button
              onClick={() => router.push("/Inventory/Suppliers/Add")}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium"
            >
              Add First Supplier
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((sup) => (
              <div
                key={sup.id}
                className={`bg-gray-900/50 rounded-xl border overflow-hidden transition-all ${
                  sup.isActive === false
                    ? "border-gray-800/50 opacity-60"
                    : "border-gray-800/50 hover:border-gray-700"
                }`}
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-800/60">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏢</span>
                      <div>
                        <h3 className="text-white font-semibold text-base">
                          {sup.name}
                        </h3>
                        {sup.code && (
                          <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-1.5 py-0.5 rounded">
                            {sup.code}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      onClick={(e) =>
                        handleUpdate(e, sup?.id, sup, !sup?.isActive)
                      }
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 border cursor-pointer hover:bg-transparent ${
                        sup.isActive !== false
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-gray-600/30 text-gray-400 border-gray-600/40"
                      }`}
                    >
                      {sup.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  {sup.contactName && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">
                        Contact
                      </span>
                      <span className="text-gray-300 text-xs">
                        {sup.contactName}
                      </span>
                    </div>
                  )}
                  {sup.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">
                        Email
                      </span>
                      <span className="text-gray-400 text-xs truncate">
                        {sup.email}
                      </span>
                    </div>
                  )}
                  {sup.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">
                        Phone
                      </span>
                      <span className="text-gray-400 text-xs">{sup.phone}</span>
                    </div>
                  )}
                  {(sup.city || sup.country) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">
                        Location
                      </span>
                      <span className="text-gray-300 text-xs">
                        {[sup.city, sup.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {sup.notes && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-gray-500 w-20 flex-shrink-0">
                        Notes
                      </span>
                      <span className="text-gray-500 text-xs italic leading-relaxed line-clamp-2">
                        {sup.notes}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="px-5 py-4 border-t border-gray-800/60 flex items-center gap-2">
                  <button
                    onClick={() =>
                      router.push(`/Inventory/Suppliers/Edit/${sup.id}`)
                    }
                    className="flex-1 px-3 py-2 border border-gray-700 hover:border-cyan-500 text-gray-400 hover:text-cyan-400 rounded-lg text-xs transition-colors text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(sup)}
                    className="px-3 py-2 border border-red-900/40 text-red-500 hover:bg-red-900/20 rounded-lg text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setDeleteConfirm(null)}
            />
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-2">
                Delete Supplier?
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                Are you sure you want to delete{" "}
                <span className="text-white font-medium">
                  {deleteConfirm.name}
                </span>
                ?
              </p>
              <p className="text-red-400 text-xs mb-6">
                This is a soft delete — the record will be deactivated and
                hidden from active lists.
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
