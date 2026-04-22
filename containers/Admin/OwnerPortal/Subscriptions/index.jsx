"use client";

import { useState, useEffect } from "react";
import { getTenants, updateTenant } from "@/services/Admin";

const PLANS = ["BASIC", "STANDARD", "PREMIUM", "ENTERPRISE"];

const PLAN_COLORS = {
  BASIC:      "bg-gray-600/40 text-gray-300 border-gray-600/40",
  STANDARD:   "bg-blue-500/20 text-blue-300 border-blue-500/30",
  PREMIUM:    "bg-orange-500/20 text-orange-300 border-orange-500/30",
  ENTERPRISE: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function Subscriptions() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("");
  const [filterActive, setFilterActive] = useState("");

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({ subscriptionPlan: "", subscriptionActive: true, subscriptionExpiresAt: "" });
  const [saving, setSaving] = useState(false);
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
      subscriptionPlan: tenant.subscriptionPlan || "",
      subscriptionActive: tenant.subscriptionActive ?? true,
      subscriptionExpiresAt: tenant.subscriptionExpiresAt?.slice(0, 10) || "",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        subscriptionPlan: editForm.subscriptionPlan || undefined,
        subscriptionActive: editForm.subscriptionActive,
        subscriptionExpiresAt: editForm.subscriptionExpiresAt ? new Date(editForm.subscriptionExpiresAt).toISOString() : undefined,
      };
      await updateTenant(editTarget.id, payload);
      setTenants((prev) =>
        prev.map((t) => (t.id === editTarget.id ? { ...t, ...payload } : t))
      );
      setEditTarget(null);
      setMessage({ type: "success", text: "Subscription updated" });
    } catch (e) {
      setMessage({ type: "error", text: e?.message || "Failed to update subscription" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = tenants.filter((t) => {
    const ms = !search || (t.name || "").toLowerCase().includes(search.toLowerCase());
    const mp = !filterPlan || t.subscriptionPlan === filterPlan;
    const ma = filterActive === "" || String(t.subscriptionActive) === filterActive;
    return ms && mp && ma;
  });

  // Summary counts
  const activeSubs = tenants.filter((t) => t.subscriptionActive).length;
  const planBreakdown = PLANS.map((p) => ({
    plan: p,
    count: tenants.filter((t) => t.subscriptionPlan === p).length,
  }));

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Subscriptions</h1>
          <p className="text-gray-400 text-sm mt-1">Manage tenant subscription plans and status</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm border ${message.type === "success" ? "bg-green-900/60 border-green-500/30 text-green-300" : "bg-red-900/60 border-red-500/30 text-red-300"}`}>
            {message.text}
          </div>
        )}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 col-span-1">
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active</p>
          <p className="text-2xl font-bold text-green-400">{activeSubs}</p>
        </div>
        {planBreakdown.map(({ plan, count }) => (
          <div key={plan} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{plan}</p>
            <p className="text-2xl font-bold text-white">{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
        <input type="text" placeholder="Search by company name..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 w-56" />
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
          <option value="">All Plans</option>
          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={() => { setSearch(""); setFilterPlan(""); setFilterActive(""); }}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">Reset</button>
        <span className="ml-auto text-xs text-gray-500 self-center">{filtered.length} of {tenants.length}</span>
      </div>

      {/* Table */}
      <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16">No subscriptions found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {["Company", "Plan", "Status", "Expires", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tenant) => {
                  const isExpired = tenant.subscriptionExpiresAt && new Date(tenant.subscriptionExpiresAt) < new Date();
                  return (
                    <tr key={tenant.id} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 text-white font-medium text-sm">{tenant.name}</td>
                      <td className="px-6 py-4">
                        {tenant.subscriptionPlan ? (
                          <span className={`text-xs px-2 py-1 rounded-full border ${PLAN_COLORS[tenant.subscriptionPlan] || PLAN_COLORS.BASIC}`}>
                            {tenant.subscriptionPlan}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">No Plan</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${tenant.subscriptionActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                          {tenant.subscriptionActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {tenant.subscriptionExpiresAt ? (
                          <span className={`text-xs ${isExpired ? "text-red-400" : "text-gray-400"}`}>
                            {new Date(tenant.subscriptionExpiresAt).toLocaleDateString()}
                            {isExpired && <span className="ml-1 text-red-500">(Expired)</span>}
                          </span>
                        ) : (
                          <span className="text-gray-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => openEdit(tenant)} className="text-cyan-400 hover:text-cyan-300 text-xs">Manage</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-white font-bold text-lg">Manage Subscription</h3>
            <p className="text-gray-400 text-sm">{editTarget.name}</p>
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Plan</label>
              <select value={editForm.subscriptionPlan} onChange={(e) => setEditForm({ ...editForm, subscriptionPlan: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                <option value="">— No Plan —</option>
                {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Status</label>
                <select value={String(editForm.subscriptionActive)} onChange={(e) => setEditForm({ ...editForm, subscriptionActive: e.target.value === "true" })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Expires On</label>
                <input type="date" value={editForm.subscriptionExpiresAt} onChange={(e) => setEditForm({ ...editForm, subscriptionExpiresAt: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditTarget(null)} className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
