"use client";

import { useState, useEffect } from "react";
import { getTenants, updateTenant, deleteTenant } from "@/services/Admin";

const COMPANY_TYPES = ["CLIENT", "SUBCONTRACTOR", "VENDOR", "PARTNER", "CONSULTANT", "OTHER"];
const PLANS = ["BASIC", "STANDARD", "PREMIUM", "ENTERPRISE"];

const TYPE_BADGE = {
  CLIENT:        "bg-blue-500/20 text-blue-300",
  SUBCONTRACTOR: "bg-orange-500/20 text-orange-300",
  VENDOR:        "bg-purple-500/20 text-purple-300",
  PARTNER:       "bg-cyan-500/20 text-cyan-300",
  CONSULTANT:    "bg-yellow-500/20 text-yellow-300",
  OTHER:         "bg-gray-600/40 text-gray-300",
};

const EMPTY_EDIT = {
  name: "",
  type: "",
  region: "",
  subscriptionPlan: "",
  subscriptionActive: true,
};

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  async function fetchTenants() {
    setLoading(true);
    try {
      const res = await getTenants();
      setTenants(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }

  const openEdit = (tenant) => {
    setEditTarget(tenant);
    setEditForm({
      name: tenant.name || "",
      type: tenant.type || "",
      region: tenant.region || "",
      subscriptionPlan: tenant.subscriptionPlan || "",
      subscriptionActive: tenant.subscriptionActive ?? true,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTenant(editTarget.id, editForm);
      setTenants((prev) =>
        prev.map((t) => (t.id === editTarget.id ? { ...t, ...editForm } : t))
      );
      setEditTarget(null);
      setMessage({ type: "success", text: "Tenant updated" });
    } catch (e) {
      setMessage({ type: "error", text: e?.message || "Failed to update tenant" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTenant(deleteConfirm);
      setTenants((prev) => prev.filter((t) => t.id !== deleteConfirm));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Tenant deleted" });
    } catch (e) {
      setMessage({ type: "error", text: e?.message || "Failed to delete tenant" });
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tenants.filter((t) => {
    const ms = !search || (t.name || "").toLowerCase().includes(search.toLowerCase()) || (t.region || "").toLowerCase().includes(search.toLowerCase());
    const mt = !filterType || t.type === filterType;
    const ma = filterActive === "" || String(t.subscriptionActive) === filterActive;
    return ms && mt && ma;
  });

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tenants</h1>
          <p className="text-gray-400 text-sm mt-1">All registered companies / tenants in the platform</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm border ${message.type === "success" ? "bg-green-900/60 border-green-500/30 text-green-300" : "bg-red-900/60 border-red-500/30 text-red-300"}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <input
          type="text"
          placeholder="Search by name or region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 w-64"
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
          <option value="">All Types</option>
          {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={() => { setSearch(""); setFilterType(""); setFilterActive(""); }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
          Reset
        </button>
        <span className="ml-auto text-xs text-gray-500 self-center">{filtered.length} of {tenants.length} tenants</span>
      </div>

      {/* Table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16">No tenants found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {["Company", "Type", "Region", "Plan", "Status", "Created", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                    <td className="px-6 py-4 text-white font-medium text-sm">{tenant.name}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${TYPE_BADGE[tenant.type] || TYPE_BADGE.OTHER}`}>
                        {tenant.type || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{tenant.region || "—"}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{tenant.subscriptionPlan || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${tenant.subscriptionActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                        {tenant.subscriptionActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEdit(tenant)} className="text-cyan-400 hover:text-cyan-300 text-xs">Edit</button>
                        <button onClick={() => setDeleteConfirm(tenant.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-white font-bold text-lg">Edit Tenant</h3>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Company Name</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Type</label>
                <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                  <option value="">— Select —</option>
                  {COMPANY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Region</label>
                <input type="text" value={editForm.region} onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Subscription Plan</label>
                <select value={editForm.subscriptionPlan} onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                  <option value="">— None —</option>
                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Subscription Active</label>
                <select value={String(editForm.subscriptionActive)} onChange={(e) => setEditForm({ ...editForm, subscriptionActive: e.target.value === "true" })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditTarget(null)} className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-bold mb-2">Delete Tenant?</h3>
            <p className="text-gray-400 text-sm mb-6">This will soft-delete the company. It can be restored by a system administrator.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
