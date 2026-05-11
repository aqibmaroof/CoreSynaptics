"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { listPhases, deletePhase, clonePhase } from "@/services/Phases";
import { getCxProjects } from "@/services/CxProjects";

const fmt = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

function toArr(data) {
  return Array.isArray(data) ? data : (data?.data ?? data?.projects ?? data?.items ?? []);
}

function SelectField({ label, value, onChange, options, placeholder, loading: l }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={l}
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

export default function PhasesList() {
  const router = useRouter();

  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("global");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [cloneTarget, setCloneTarget] = useState(null);
  const [cloneProjectId, setCloneProjectId] = useState("");
  const [cloning, setCloning] = useState(false);

  // Load project list once
  useEffect(() => {
    getCxProjects()
      .then((d) => setProjects(toArr(d)))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // Fetch phases whenever mode / project selection changes
  useEffect(() => {
    fetchPhases();
  }, [viewMode, selectedProjectId]);

  const fetchPhases = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (viewMode === "project" && selectedProjectId) params.projectId = selectedProjectId;
      const res = await listPhases(params);
      setPhases(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (err) {
      setError(err?.message || "Failed to load phases");
      setPhases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deletePhase(id);
      setPhases((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || "Failed to delete phase");
    } finally {
      setDeleting(false);
    }
  };

  const handleClone = async () => {
    if (!cloneProjectId) return;
    setCloning(true);
    try {
      const cloned = await clonePhase(cloneTarget.id, { projectId: cloneProjectId });
      setCloneTarget(null);
      setCloneProjectId("");
      if (viewMode === "project" && selectedProjectId === cloneProjectId) {
        setPhases((prev) => [...prev, cloned]);
      }
    } catch (err) {
      setError(err?.message || "Failed to clone phase");
    } finally {
      setCloning(false);
    }
  };

  const projectOptions = projects.map((p) => ({ value: p.id, label: p.name ?? p.id }));

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Phases</h1>
            <p className="text-gray-400">Manage schedule phases and project templates</p>
          </div>
          <Link
            href="/Phases/Add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Phase
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
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">View</label>
              <div className="flex rounded-lg overflow-hidden border border-gray-600">
                <button
                  onClick={() => { setViewMode("global"); setSelectedProjectId(""); }}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "global" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                >
                  Global Templates
                </button>
                <button
                  onClick={() => setViewMode("project")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "project" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
                >
                  Project Phases
                </button>
              </div>
            </div>

            {viewMode === "project" && (
              <div className="w-72">
                <SelectField
                  label="Project"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  options={projectOptions}
                  placeholder="Select a project…"
                  loading={projectsLoading}
                />
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-400">Loading phases…</p>
            </div>
          </div>
        ) : phases.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-400 text-lg">No phases found</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">End Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {phases.map((phase) => (
                    <tr key={phase.id} className="hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400">{phase.order}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{phase.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{fmt(phase.startDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{fmt(phase.endDate)}</td>
                      <td className="px-6 py-4">
                        {phase.isGlobal ? (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-purple-900/40 text-purple-300 border border-purple-700/40">Template</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/40">Project</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => router.push(`/Phases/Edit/${phase.id}`)} className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors">Edit</button>
                          {phase.isGlobal && (
                            <button onClick={() => setCloneTarget(phase)} className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors">Clone</button>
                          )}
                          <button onClick={() => setDeleteConfirm(phase.id)} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm mx-4 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Phase?</h3>
              <p className="text-gray-400 mb-6">This will soft-delete the phase. This action cannot be undone.</p>
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
              <h3 className="text-lg font-semibold text-white mb-1">Clone Phase into Project</h3>
              <p className="text-gray-400 text-sm mb-4">
                Cloning <span className="text-white font-medium">{cloneTarget.name}</span>
              </p>
              <SelectField
                label="Target Project"
                value={cloneProjectId}
                onChange={(e) => setCloneProjectId(e.target.value)}
                options={projectOptions}
                placeholder="Select a project…"
                loading={projectsLoading}
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => { setCloneTarget(null); setCloneProjectId(""); }} disabled={cloning} className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
                <button onClick={handleClone} disabled={cloning || !cloneProjectId} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2">
                  {cloning && <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                  Clone Phase
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
