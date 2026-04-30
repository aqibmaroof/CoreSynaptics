"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createChangeRequest } from "@/services/ChangeRequests";
import { listCxProjects } from "@/services/ProjectWizard";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

const IMPACT_TYPES = ["COST", "SCHEDULE", "BOTH", "NONE"];

const EMPTY = {
  title: "", description: "", impactType: "NONE",
  costImpact: "", scheduleDays: "",
};

export default function ChangeRequestAdd() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") ?? "";

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listCxProjects()
      .then((res) => {
        const list = toArray(res);
        setProjects(list);
        if (!initialProjectId && list.length > 0) setProjectId(String(list[0].id));
      })
      .catch(() => {});
  }, [initialProjectId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!projectId) { setError("Please select a project."); return; }
    setLoading(true);
    setError("");
    try {
      await createChangeRequest(projectId, {
        title: form.title.trim(),
        description: form.description || undefined,
        impactType: form.impactType,
        costImpact: form.costImpact !== "" ? parseFloat(form.costImpact) : undefined,
        scheduleDays: form.scheduleDays !== "" ? parseInt(form.scheduleDays) : undefined,
      });
      router.push("/ChangeRequests");
    } catch (err) {
      setError(err?.message || "Failed to create change request.");
    } finally {
      setLoading(false);
    }
  };

  const showCost = form.impactType === "COST" || form.impactType === "BOTH";
  const showDays = form.impactType === "SCHEDULE" || form.impactType === "BOTH";

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1">← Back</button>
        <h1 className="text-2xl font-bold mb-6">New Change Request</h1>

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Project <span className="text-red-400">*</span></label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700">
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.projectName ?? p.name ?? p.id}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Title <span className="text-red-400">*</span></label>
            <input className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="Additional rack installation" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <textarea className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the scope change…" />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Impact Type</label>
            <div className="flex gap-2 flex-wrap">
              {IMPACT_TYPES.map((t) => (
                <button key={t} type="button" onClick={() => set("impactType", t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.impactType === t ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(showCost || showDays) && (
            <div className="grid grid-cols-2 gap-4">
              {showCost && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Cost Impact ($)</label>
                  <input type="number" min="0" step="0.01"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    value={form.costImpact} onChange={(e) => set("costImpact", e.target.value)}
                    placeholder="0.00" />
                </div>
              )}
              {showDays && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Schedule Impact (days)</label>
                  <input type="number" min="0"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    value={form.scheduleDays} onChange={(e) => set("scheduleDays", e.target.value)}
                    placeholder="0" />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 transition-colors">
              {loading ? "Creating…" : "Submit Change Request"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
