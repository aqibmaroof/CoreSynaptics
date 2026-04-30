"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrgToolboxTalk, updateOrgToolboxTalk, TBT_CATEGORIES } from "@/services/OrgToolboxTalks";

export default function OrgToolboxTalkEdit() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({ title: "", description: "", category: "", durationMins: "", isActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getOrgToolboxTalk(id)
      .then((res) => {
        const d = res?.data ?? res;
        setForm({
          title: d.title ?? "",
          description: d.description ?? "",
          category: d.category ?? "",
          durationMins: d.durationMins != null ? String(d.durationMins) : "",
          isActive: d.isActive ?? true,
        });
      })
      .catch(() => setError("Failed to load toolbox talk."))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      await updateOrgToolboxTalk(id, {
        title: form.title.trim(),
        description: form.description || undefined,
        category: form.category || undefined,
        durationMins: form.durationMins !== "" ? parseInt(form.durationMins) : undefined,
        isActive: form.isActive,
      });
      router.push("/OrgToolboxTalks");
    } catch (err) {
      setError(err?.message || "Failed to update toolbox talk.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold mb-6">Edit Toolbox Talk</h1>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Title <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
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
                value={form.durationMins} onChange={(e) => set("durationMins", e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-blue-500" />
            <label htmlFor="isActive" className="text-sm text-gray-300">Active</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
