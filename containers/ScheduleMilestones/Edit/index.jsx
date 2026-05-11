"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getMilestoneById, updateMilestone } from "@/services/ScheduleMilestones";
import { listPhases } from "@/services/Phases";

const MILESTONE_TYPES = [
  { value: "INTERNAL", label: "Internal — tracking only" },
  { value: "CONTRACT", label: "Contract — client-facing deadline" },
  { value: "OPS", label: "OPS — internal ops target" },
];

function toArr(data) {
  return Array.isArray(data) ? data : (data?.data ?? data?.items ?? []);
}

export default function ScheduleMilestoneEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  const [phases, setPhases] = useState([]);
  const [phasesLoading, setPhasesLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    date: "",
    type: "INTERNAL",
    isCritical: false,
    phaseId: "",
    projectId: "",
  });
  const [detachPhase, setDetachPhase] = useState(false);

  useEffect(() => {
    if (!id) return;
    getMilestoneById(id)
      .then((ms) => {
        const projectId = ms.projectId ?? "";
        setForm({
          name: ms.name ?? "",
          date: ms.date ? ms.date.slice(0, 10) : "",
          type: ms.type ?? "INTERNAL",
          isCritical: ms.isCritical ?? false,
          phaseId: ms.phaseId ?? "",
          projectId,
        });
        setPhasesLoading(true);
        const params = projectId ? { projectId } : {};
        return listPhases(params);
      })
      .then((d) => setPhases(toArr(d)))
      .catch((err) => setError(err?.message || "Failed to load milestone"))
      .finally(() => { setFetching(false); setPhasesLoading(false); });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {};
      if (form.name.trim()) payload.name = form.name.trim();
      if (form.date) payload.date = new Date(form.date).toISOString();
      payload.type = form.type;
      payload.isCritical = form.isCritical;

      if (detachPhase) {
        payload.phaseId = null;
      } else if (form.phaseId) {
        payload.phaseId = form.phaseId;
      }

      await updateMilestone(id, payload);
      router.push("/ScheduleMilestones/List");
    } catch (err) {
      setError(err?.message || "Failed to update milestone");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <svg className="w-10 h-10 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-white">Edit Milestone</h1>
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Milestone Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Target Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

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

          <div className="flex items-center gap-3">
            <input
              id="isCritical"
              name="isCritical"
              type="checkbox"
              checked={form.isCritical}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-blue-500"
            />
            <label htmlFor="isCritical" className="text-sm font-medium text-gray-300 cursor-pointer">Mark as Critical Path</label>
          </div>

          {/* Phase dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phase (optional)</label>
            <div className="relative">
              <select
                name="phaseId"
                value={form.phaseId}
                onChange={handleChange}
                disabled={detachPhase || phasesLoading}
                className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none [&_option]:bg-gray-700 disabled:opacity-40"
              >
                <option value="">
                  {phasesLoading ? "Loading phases…" : phases.length === 0 ? "No phases available" : "— Unlinked —"}
                </option>
                {phases.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                id="detachPhase"
                type="checkbox"
                checked={detachPhase}
                onChange={(e) => setDetachPhase(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 accent-red-500"
              />
              <label htmlFor="detachPhase" className="text-sm text-gray-400 cursor-pointer">
                Detach from current phase (sends <code className="text-xs bg-gray-700 px-1 rounded">phaseId: null</code>)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-lg transition-all flex items-center gap-2"
            >
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
