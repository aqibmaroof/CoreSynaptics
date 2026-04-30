"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrgSOP } from "@/services/OrgSOPs";

const SOP_CATEGORIES = ["SAFETY", "OPERATIONS", "COMMISSIONING", "ELECTRICAL", "MECHANICAL", "QUALITY", "OTHER"];
const EMPTY = { name: "", description: "", version: "", tags: "", category: "", documentUrl: "" };

function AppSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export default function OrgSOPAdd() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setLoading(true);
    setError("");
    try {
      await createOrgSOP({
        name: form.name.trim(),
        ...(form.description && { description: form.description }),
        ...(form.version && { version: form.version }),
        ...(form.category && { category: form.category }),
        ...(form.documentUrl && { documentUrl: form.documentUrl }),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      router.push("/OrgSOPs");
    } catch (err) {
      setError(err?.message || "Failed to create SOP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold mb-6">New SOP</h1>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Electrical Safety Procedure" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Category</label>
              <AppSelect value={form.category} onChange={(e) => set("category", e.target.value)} options={SOP_CATEGORIES} placeholder="Select category" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Version</label>
              <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={form.version} onChange={(e) => set("version", e.target.value)} placeholder="2026-04" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tags <span className="text-gray-500 font-normal">(comma-separated)</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="safety, electrical" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Document URL</label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              type="url" value={form.documentUrl} onChange={(e) => set("documentUrl", e.target.value)} placeholder="https://docs.example.com/sop" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create SOP"}
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
