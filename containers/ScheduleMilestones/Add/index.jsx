"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMilestone } from "@/services/ScheduleMilestones";
import { listPhases } from "@/services/Phases";
import { getCxProjects } from "@/services/CxProjects";

const MILESTONE_TYPES = [
  { value: "INTERNAL", label: "Internal — tracking only" },
  { value: "CONTRACT", label: "Contract — client-facing deadline" },
  { value: "OPS", label: "OPS — internal ops target" },
];

function toArr(data) {
  return Array.isArray(data) ? data : (data?.data ?? data?.projects ?? data?.items ?? []);
}

export default function ScheduleMilestoneAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [phases, setPhases] = useState([]);
  const [phasesLoading, setPhasesLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    date: "",
    type: "INTERNAL",
    isCritical: false,
    projectId: "",
    phaseId: "",
  });

  // Load projects on mount
  useEffect(() => {
    getCxProjects()
      .then((d) => setProjects(toArr(d)))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // When project changes, reload phases for that project (or global phases if none)
  useEffect(() => {
    setForm((prev) => ({ ...prev, phaseId: "" }));
    setPhasesLoading(true);
    const params = form.projectId ? { projectId: form.projectId } : {};
    listPhases(params)
      .then((d) => setPhases(toArr(d)))
      .catch(() => setPhases([]))
      .finally(() => setPhasesLoading(false));
  }, [form.projectId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        date: new Date(form.date).toISOString(),
        type: form.type,
        isCritical: form.isCritical,
      };
      if (form.projectId) payload.projectId = form.projectId;
      if (form.phaseId) payload.phaseId = form.phaseId;

      await createMilestone(payload);
      router.push("/ScheduleMilestones/List");
    } catch (err) {
      setError(err?.message || "Failed to create milestone");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">New Milestone</h1>
            <p className="text-gray-400 text-sm mt-1">Leave Project blank to create a global org-level template.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Milestone Name <span className="text-red-400">*</span>
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. NTP Issued"
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Date <span className="text-red-400">*</span>
            </label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <div className="relative">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none [&_option]:bg-gray-700"
              >
                {MILESTONE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          {/* isCritical */}
          <div className="flex items-center gap-3">
            <input
              id="isCritical"
              name="isCritical"
              type="checkbox"
              checked={form.isCritical}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-blue-500"
            />
            <label htmlFor="isCritical" className="text-sm font-medium text-gray-300 cursor-pointer">
              Mark as Critical Path <span className="text-gray-500 font-normal">(shown with ◆ diamond indicator)</span>
            </label>
          </div>

          {/* Project dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Project (optional)</label>
            <div className="relative">
              <select
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                disabled={projectsLoading}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none [&_option]:bg-gray-700 disabled:opacity-50"
              >
                <option value="">{projectsLoading ? "Loading projects…" : "— Global Template (no project) —"}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
          </div>

          {/* Phase dropdown — updates when project changes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phase (optional)</label>
            <div className="relative">
              <select
                name="phaseId"
                value={form.phaseId}
                onChange={handleChange}
                disabled={phasesLoading}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none [&_option]:bg-gray-700 disabled:opacity-50"
              >
                <option value="">
                  {phasesLoading
                    ? "Loading phases…"
                    : phases.length === 0
                    ? "No phases available"
                    : "— Unlinked —"}
                </option>
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              {form.projectId
                ? "Showing phases for the selected project."
                : "Showing global template phases. Select a project above to see project-scoped phases."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-lg transition-all flex items-center gap-2"
            >
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              Create Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
