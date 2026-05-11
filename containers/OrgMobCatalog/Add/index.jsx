"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrgMobCatalogItem, MOB_STEP_KEYS } from "@/services/OrgMobCatalog";

const STEP_LABELS = {
  mob_site: "Site Setup", mob_ppe: "PPE", mob_supplies: "Supplies",
  mob_trailer: "Trailer", mob_house: "Housing", mob_tools: "Tools",
};

const EMPTY = { stepKey: "", name: "", category: "", icon: "", defaultQty: "1", defaultUnitCost: "0", formula: "" };

function AppSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export default function OrgMobCatalogAdd() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.stepKey) { setError("Step is required."); return; }
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (!form.category.trim()) { setError("Category is required."); return; }
    setLoading(true);
    setError("");
    try {
      await createOrgMobCatalogItem({
        stepKey: form.stepKey,
        name: form.name.trim(),
        category: form.category.trim(),
        ...(form.icon && { icon: form.icon }),
        defaultQty: parseInt(form.defaultQty) || 1,
        defaultUnitCost: parseFloat(form.defaultUnitCost) || 0,
        ...(form.formula && { formula: form.formula }),
      });
      router.push("/OrgMobCatalog");
    } catch (err) {
      setError(err?.message || "Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold mb-6">New Catalog Item</h1>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Step <span className="text-red-400">*</span></label>
            <AppSelect value={form.stepKey} onChange={(e) => set("stepKey", e.target.value)}
              options={MOB_STEP_KEYS.map((k) => ({ value: k, label: STEP_LABELS[k] }))}
              placeholder="Select step" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Name <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Safety Glasses" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Category <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="PPE" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Default Qty</label>
              <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                type="number" min="1" value={form.defaultQty} onChange={(e) => set("defaultQty", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Default Unit Cost ($)</label>
              <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                type="number" min="0" step="0.01" value={form.defaultUnitCost} onChange={(e) => set("defaultUnitCost", e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Icon <span className="text-gray-500 font-normal">(key name)</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.icon} onChange={(e) => set("icon", e.target.value)} placeholder="safety-glasses" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Formula <span className="text-gray-500 font-normal">(optional)</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 font-mono"
              value={form.formula} onChange={(e) => set("formula", e.target.value)} placeholder="crewSize * 1" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create Item"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
