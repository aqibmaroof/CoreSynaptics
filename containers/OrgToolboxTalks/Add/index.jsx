"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrgToolboxTalk, TBT_CATEGORIES } from "@/services/OrgToolboxTalks";

const EMPTY = { title: "", description: "", category: "", durationMins: ""};

export default function OrgToolboxTalkAdd() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setLoading(true);
    setError("");
    try {
      await createOrgToolboxTalk({
        title: form.title.trim(),
        description: form.description || undefined,
        category: form.category || undefined,
        durationMins: form.durationMins !== "" ? parseInt(form.durationMins) : undefined,
      });
      router.push("/OrgToolboxTalks");
    } catch (err) {
      setError(err?.message || "Failed to create toolbox talk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold mb-6">New Toolbox Talk</h1>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Title <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Electrical Safety Overview" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Overview of key safety topics covered…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700">
                <option value="">None</option>
                {TBT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Duration (minutes)</label>
              <input type="number" min="1"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                value={form.durationMins} onChange={(e) => set("durationMins", e.target.value)}
                placeholder="15" />
            </div>
          </div>

        

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Create Toolbox Talk"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
