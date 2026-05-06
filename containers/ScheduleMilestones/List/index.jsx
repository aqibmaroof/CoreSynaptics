"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listMilestones, deleteMilestone, cloneMilestone } from "@/services/ScheduleMilestones";
import { listPhases } from "@/services/Phases";
import { getCxProjects } from "@/services/CxProjects";

const TYPE_STYLES = {
  CONTRACT: "bg-red-900/40 text-red-300 border-red-700/40",
  OPS: "bg-orange-900/40 text-orange-300 border-orange-700/40",
  INTERNAL: "bg-gray-700/60 text-gray-300 border-gray-600/40",
};

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

function toArr(data) {
  return Array.isArray(data) ? data : (data?.data ?? data?.projects ?? data?.items ?? []);
}

function SelectField({ label, value, onChange, options, placeholder, loading: l, disabled }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={l || disabled}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none [&_option]:bg-gray-700 disabled:opacity-50"
        >
          <option value="">{l ? "Loading…" : placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
      </div>
    </div>
  );
}

const FILTER_MODES = ["global", "project", "phase"];

export default function ScheduleMilestonesList() {
  const router = useRouter();

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterMode, setFilterMode] = useState("global");

  // Project + phase dropdowns for filter bar
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [filterProjectId, setFilterProjectId] = useState("");

  const [phases, setPhases] = useState([]);
  const [phasesLoading, setPhasesLoading] = useState(false);
  const [filterPhaseId, setFilterPhaseId] = useState("");

  // Clone modal
  const [cloneTarget, setCloneTarget] = useState(null);
  const [cloneProjects, setCloneProjects] = useState([]);
  const [cloneProjectId, setCloneProjectId] = useState("");
  const [clonePhases, setClonePhases] = useState([]);
  const [clonePhasesLoading, setClonePhasesLoading] = useState(false);
  const [clonePhaseId, setClonePhaseId] = useState("");
  const [cloning, setCloning] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Load projects once
  useEffect(() => {
    getCxProjects()
      .then((d) => { setProjects(toArr(d)); setCloneProjects(toArr(d)); })
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // Load phases for filter bar when filterProjectId changes (phase mode)
  useEffect(() => {
    if (filterMode !== "phase") return;
    setFilterPhaseId("");
    if (!filterProjectId) { setPhases([]); return; }
    setPhasesLoading(true);
    listPhases({ projectId: filterProjectId })
      .then((d) => setPhases(toArr(d)))
      .catch(() => setPhases([]))
      .finally(() => setPhasesLoading(false));
  }, [filterProjectId, filterMode]);

  // Load phases for clone modal when cloneProjectId changes
  useEffect(() => {
    setClonePhaseId("");
    if (!cloneProjectId) { setClonePhases([]); return; }
    setClonePhasesLoading(true);
    listPhases({ projectId: cloneProjectId })
      .then((d) => setClonePhases(toArr(d)))
      .catch(() => setClonePhases([]))
      .finally(() => setClonePhasesLoading(false));
  }, [cloneProjectId]);

  // Fetch milestones when filter changes
  useEffect(() => {
    fetchMilestones();
  }, [filterMode, filterProjectId, filterPhaseId]);

  const fetchMilestones = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filterMode === "project" && filterProjectId) params.projectId = filterProjectId;
      if (filterMode === "phase" && filterPhaseId) params.phaseId = filterPhaseId;
      const res = await listMilestones(params);
      setMilestones(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setError(err?.message || "Failed to load milestones");
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteMilestone(id);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || "Failed to delete milestone");
    } finally {
      setDeleting(false);
    }
  };

  const handleClone = async () => {
    if (!cloneProjectId) return;
    setCloning(true);
    try {
      const payload = { projectId: cloneProjectId };
      if (clonePhaseId) payload.phaseId = clonePhaseId;
      await cloneMilestone(cloneTarget.id, payload);
      setCloneTarget(null);
      setCloneProjectId("");
      setClonePhaseId("");
    } catch (err) {
      setError(err?.message || "Failed to clone milestone");
    } finally {
      setCloning(false);
    }
  };

  const handleFilterModeChange = (mode) => {
    setFilterMode(mode);
    setFilterProjectId("");
    setFilterPhaseId("");
    setPhases([]);
  };

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name ?? p.id }));
  const phaseOptions = phases.map((p) => ({ value: p.id, label: p.name ?? p.id }));
  const clonePhaseOptions = clonePhases.map((p) => ({ value: p.id, label: p.name ?? p.id }));

  const groupedByPhase = milestones.reduce((acc, m) => {
    const key = m.phaseId ?? "__unassigned__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Schedule Milestones</h1>
            <p className="text-gray-400">Manage schedule milestones and project templates</p>
          </div>
          <Link
            href="/ScheduleMilestones/Add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Milestone
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Mode toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filter By</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-600">
                {FILTER_MODES.map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleFilterModeChange(mode)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${filterMode === mode ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                  >
                    {mode === "global" ? "Global Templates" : mode === "project" ? "Project" : "Phase"}
                  </button>
                ))}
              </div>
            </div>

            {/* Project dropdown */}
            {(filterMode === "project" || filterMode === "phase") && (
              <div className="w-64">
                <SelectField
                  label="Project"
                  value={filterProjectId}
                  onChange={(e) => setFilterProjectId(e.target.value)}
                  options={projectOptions}
                  placeholder="Select a project…"
                  loading={projectsLoading}
                />
              </div>
            )}

            {/* Phase dropdown — only shown in phase mode, needs a project selected first */}
            {filterMode === "phase" && (
              <div className="w-64">
                <SelectField
                  label="Phase"
                  value={filterPhaseId}
                  onChange={(e) => setFilterPhaseId(e.target.value)}
                  options={phaseOptions}
                  placeholder={filterProjectId ? "Select a phase…" : "Select a project first"}
                  loading={phasesLoading}
                  disabled={!filterProjectId}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-400">Loading milestones…</p>
            </div>
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-lg">No milestones found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByPhase).map(([phaseKey, items]) => (
              <div key={phaseKey} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
                <div className="px-6 py-3 border-b border-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-300">
                    {phaseKey === "__unassigned__" ? "Unassigned" : `Phase: ${phaseKey}`}
                  </span>
                  <span className="ml-auto text-xs text-gray-500">{items.length} milestone{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Critical</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Scope</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {items.map((ms) => (
                        <tr key={ms.id} className="hover:bg-gray-750 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-white">
                            {ms.isCritical && <span className="mr-1.5 text-yellow-400" title="Critical path">◆</span>}
                            {ms.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{fmt(ms.date)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full border ${TYPE_STYLES[ms.type] ?? TYPE_STYLES.INTERNAL}`}>
                              {ms.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {ms.isCritical ? <span className="text-yellow-400 font-medium">Yes</span> : <span className="text-gray-500">—</span>}
                          </td>
                          <td className="px-6 py-4">
                            {ms.isGlobal ? (
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/40">Template</span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/40">Project</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => router.push(`/ScheduleMilestones/Edit/${ms.id}`)} className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">Edit</button>
                              {ms.isGlobal && (
                                <button onClick={() => setCloneTarget(ms)} className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors">Clone</button>
                              )}
                              <button onClick={() => setDeleteConfirm(ms.id)} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm mx-4 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Milestone?</h3>
              <p className="text-gray-400 mb-6">This will soft-delete the milestone and cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} disabled={deleting} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  {deleting && <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clone modal */}
        {cloneTarget && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-md w-full mx-4 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-1">Clone Milestone into Project</h3>
              <p className="text-gray-400 text-sm mb-4">
                Cloning <span className="text-white font-medium">{cloneTarget.name}</span>
              </p>
              <div className="space-y-4">
                <SelectField
                  label="Target Project *"
                  value={cloneProjectId}
                  onChange={(e) => setCloneProjectId(e.target.value)}
                  options={projectOptions}
                  placeholder="Select a project…"
                  loading={projectsLoading}
                />
                <SelectField
                  label="Target Phase (optional)"
                  value={clonePhaseId}
                  onChange={(e) => setClonePhaseId(e.target.value)}
                  options={clonePhaseOptions}
                  placeholder={cloneProjectId ? "Select a phase…" : "Select a project first"}
                  loading={clonePhasesLoading}
                  disabled={!cloneProjectId}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setCloneTarget(null); setCloneProjectId(""); setClonePhaseId(""); }} disabled={cloning} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
                <button onClick={handleClone} disabled={cloning || !cloneProjectId} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  {cloning && <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                  Clone Milestone
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
