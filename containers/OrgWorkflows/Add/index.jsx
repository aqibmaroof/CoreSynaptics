"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrgWorkflow } from "@/services/OrgWorkflows";

const EMPTY = { name: "", description: "", version: "", tags: "", steps: "" };

export default function OrgWorkflowAdd() {
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
      const payload = {
        name: form.name.trim(),
        ...(form.description && { description: form.description }),
        ...(form.version && { version: form.version }),
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        steps: form.steps
          ? form.steps.split("\n").map((s) => ({ name: s.trim(), type: "task" })).filter((s) => s.name)
          : [],
      };
      await createOrgWorkflow(payload);
      router.push("/OrgWorkflows");
    } catch (err) {
      setError(err?.message || "Failed to create workflow.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-6">New Workflow Template</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Name <span className="text-red-400">*</span></label>
            <input
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Standard Project Deployment"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Free-form description"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Version</label>
            <input
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.version} onChange={(e) => set("version", e.target.value)} placeholder="1.0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Tags <span className="text-gray-500 font-normal">(comma-separated)</span></label>
            <input
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="deployment, standard"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Steps <span className="text-gray-500 font-normal">(one per line)</span></label>
            <textarea
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
              rows={4} value={form.steps} onChange={(e) => set("steps", e.target.value)}
              placeholder={"Site Assessment\nInstallation\nTesting"}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating…" : "Create Workflow"}
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
