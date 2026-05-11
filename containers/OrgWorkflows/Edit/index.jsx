"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrgWorkflow, updateOrgWorkflow } from "@/services/OrgWorkflows";

export default function OrgWorkflowEdit() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", description: "", version: "", tags: "", steps: "", isActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getOrgWorkflow(id)
      .then((res) => {
        const d = res?.data ?? res;
        setForm({
          name: d.name ?? "",
          description: d.description ?? "",
          version: d.version ?? "",
          tags: (d.tags ?? []).join(", "),
          steps: (d.steps ?? []).map((s) => (typeof s === "string" ? s : s.name)).join("\n"),
          isActive: d.isActive ?? true,
        });
      })
      .catch(() => setError("Failed to load workflow."))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true);
    setError("");
    try {
      await updateOrgWorkflow(id, {
        name: form.name.trim(),
        description: form.description || undefined,
        version: form.version || undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        steps: form.steps
          ? form.steps.split("\n").map((s) => ({ name: s.trim(), type: "task" })).filter((s) => s.name)
          : [],
        isActive: form.isActive,
      });
      router.push("/OrgWorkflows");
    } catch (err) {
      setError(err?.message || "Failed to update workflow.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading…</div>;

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold mb-6">Edit Workflow Template</h1>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Version</label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.version} onChange={(e) => set("version", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tags <span className="text-gray-500 font-normal">(comma-separated)</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Steps <span className="text-gray-500 font-normal">(one per line)</span></label>
            <textarea className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
              rows={4} value={form.steps} onChange={(e) => set("steps", e.target.value)} />
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
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
