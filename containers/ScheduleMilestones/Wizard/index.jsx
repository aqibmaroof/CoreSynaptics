"use client";

import { useState, useEffect } from "react";
import { listPhases, assignPhasesToProject } from "@/services/Phases";
import { listMilestones } from "@/services/ScheduleMilestones";
import { getCxProjects } from "@/services/CxProjects";

const TYPE_STYLES = {
  CONTRACT: "bg-red-900/40 text-red-300 border-red-700/40",
  OPS: "bg-orange-900/40 text-orange-300 border-orange-700/40",
  INTERNAL: "bg-gray-700/60 text-gray-300 border-gray-600/40",
};

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "short" })
    : "—";

export default function PhaseMilestoneWizard() {
  const [step, setStep] = useState(1); // 1 = setup, 2 = select, 3 = confirm, 4 = done

  // Step 1 — project target
  const [projectId, setProjectId] = useState("");
  const [projectIdError, setProjectIdError] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    getCxProjects()
      .then((d) => setProjects(Array.isArray(d) ? d : (d?.data ?? d?.projects ?? d?.items ?? [])))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // Step 2 — library data
  const [globalPhases, setGlobalPhases] = useState([]);
  const [globalMilestones, setGlobalMilestones] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");

  // Selections
  const [selectedPhaseIds, setSelectedPhaseIds] = useState([]);
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState([]);
  const [highlightedPhaseId, setHighlightedPhaseId] = useState(null);

  // Step 3/4 — saving
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [result, setResult] = useState(null);

  const loadLibrary = async () => {
    setLibraryLoading(true);
    setLibraryError("");
    try {
      const [phases, milestones] = await Promise.all([
        listPhases(),
        listMilestones(),
      ]);
      setGlobalPhases(Array.isArray(phases) ? phases : []);
      setGlobalMilestones(Array.isArray(milestones) ? milestones : []);
    } catch (err) {
      setLibraryError(err?.message || "Failed to load org library");
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!projectId) {
        setProjectIdError("Please select a project");
        return;
      }
      setProjectIdError("");
      loadLibrary();
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const togglePhase = (id) => {
    setSelectedPhaseIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleMilestone = (id) => {
    setSelectedMilestoneIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleConfirm = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await assignPhasesToProject({
        projectId: projectId.trim(),
        phaseIds: selectedPhaseIds,
        milestoneIds: selectedMilestoneIds,
      });
      setResult(res);
      setStep(4);
    } catch (err) {
      setSaveError(err?.message || "Failed to assign phases and milestones");
    } finally {
      setSaving(false);
    }
  };

  // Milestones filtered by highlighted phase in left panel
  const visibleMilestones = highlightedPhaseId
    ? globalMilestones.filter((m) => m.phaseId === highlightedPhaseId)
    : globalMilestones;

  const selectedPhases = globalPhases.filter((p) =>
    selectedPhaseIds.includes(p.id),
  );
  const selectedMilestones = globalMilestones.filter((m) =>
    selectedMilestoneIds.includes(m.id),
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Phase & Milestone Wizard
          </h1>
          <p className="text-gray-400">
            Bulk-assign global templates to a project in one step.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {["Project", "Select", "Confirm", "Done"].map((label, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${done ? "bg-green-600 text-white" : active ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
                >
                  {done ? "✓" : idx}
                </div>
                <span
                  className={`text-sm font-medium ${active ? "text-white" : "text-gray-500"}`}
                >
                  {label}
                </span>
                {i < 3 && (
                  <div
                    className={`h-px w-12 transition-colors ${done ? "bg-green-600" : "bg-gray-700"}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Step 1: Enter project ID ── */}
        {step === 1 && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 max-w-lg">
            <h2 className="text-xl font-semibold text-white mb-2">
              Target Project
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Select the project you want to assign phases and milestones to.
            </p>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => { setProjectId(e.target.value); setProjectIdError(""); }}
                disabled={projectsLoading}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:border-blue-500 appearance-none [&_option]:bg-gray-700 disabled:opacity-50 ${projectIdError ? "border-red-500" : "border-gray-600"}`}
              >
                <option value="">{projectsLoading ? "Loading projects…" : "Select a project…"}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
            </div>
            {projectIdError && (
              <p className="text-red-400 text-sm mt-1">{projectIdError}</p>
            )}
            <button
              onClick={handleNext}
              disabled={projectsLoading}
              className="mt-6 w-full px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
            >
              Next: Select Phases & Milestones →
            </button>
          </div>
        )}

        {/* ── Step 2: Select ── */}
        {step === 2 && (
          <div>
            {libraryError && (
              <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-200 text-sm">
                {libraryError}
              </div>
            )}
            {libraryLoading ? (
              <div className="flex items-center justify-center py-24">
                <svg
                  className="w-10 h-10 text-blue-500 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Left: Phases */}
                  <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-white">
                        Phases ({globalPhases.length})
                      </h3>
                      <span className="text-xs text-blue-400">
                        {selectedPhaseIds.length} selected
                      </span>
                    </div>
                    <div className="divide-y divide-gray-700/50 max-h-96 overflow-y-auto">
                      {globalPhases.length === 0 ? (
                        <p className="p-5 text-gray-500 text-sm">
                          No global phases in this org.
                        </p>
                      ) : (
                        globalPhases.map((phase) => {
                          const selected = selectedPhaseIds.includes(phase.id);
                          const highlighted = highlightedPhaseId === phase.id;
                          return (
                            <div
                              key={phase.id}
                              onClick={() =>
                                setHighlightedPhaseId(
                                  highlighted ? null : phase.id,
                                )
                              }
                              className={`flex items-start gap-3 px-5 py-3 cursor-pointer transition-colors ${highlighted ? "bg-blue-900/20" : "hover:bg-gray-750"}`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  togglePhase(phase.id);
                                }}
                                className="mt-0.5 w-4 h-4 rounded border-gray-600 accent-blue-500 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {phase.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {fmt(phase.startDate)} – {fmt(phase.endDate)}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 shrink-0">
                                #{phase.order}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right: Milestones */}
                  <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
                      <h3 className="font-semibold text-white">
                        Milestones
                        {highlightedPhaseId && (
                          <span className="ml-1 text-xs text-blue-400">
                            (filtered by phase)
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        {highlightedPhaseId && (
                          <button
                            onClick={() => setHighlightedPhaseId(null)}
                            className="text-xs text-gray-400 hover:text-white underline"
                          >
                            Show all
                          </button>
                        )}
                        <span className="text-xs text-blue-400">
                          {selectedMilestoneIds.length} selected
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-700/50 max-h-96 overflow-y-auto">
                      {visibleMilestones.length === 0 ? (
                        <p className="p-5 text-gray-500 text-sm">
                          {highlightedPhaseId
                            ? "No milestones linked to this phase."
                            : "No global milestones in this org."}
                        </p>
                      ) : (
                        visibleMilestones.map((ms) => {
                          const selected = selectedMilestoneIds.includes(ms.id);
                          return (
                            <label
                              key={ms.id}
                              className="flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-gray-750 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleMilestone(ms.id)}
                                className="mt-0.5 w-4 h-4 rounded border-gray-600 accent-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {ms.isCritical && (
                                    <span className="text-yellow-400 text-xs">
                                      ◆
                                    </span>
                                  )}
                                  <p className="text-sm font-medium text-white truncate">
                                    {ms.name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className={`inline-block px-1.5 py-0.5 text-xs rounded border ${TYPE_STYLES[ms.type] ?? TYPE_STYLES.INTERNAL}`}
                                  >
                                    {ms.type}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {fmt(ms.date)}
                                  </span>
                                </div>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
                  >
                    Review & Confirm →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Step 3: Confirm ── */}
        {step === 3 && (
          <div>
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Review Selection
              </h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                    Phases to clone ({selectedPhases.length})
                  </h3>
                  {selectedPhases.length === 0 ? (
                    <p className="text-gray-500 text-sm">None selected</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedPhases.map((p) => (
                        <li
                          key={p.id}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                          <span className="font-medium text-white">
                            {p.name}
                          </span>
                          <span className="text-gray-500">#{p.order}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">
                    Milestones to clone ({selectedMilestones.length})
                  </h3>
                  {selectedMilestones.length === 0 ? (
                    <p className="text-gray-500 text-sm">None selected</p>
                  ) : (
                    <ul className="space-y-2">
                      {selectedMilestones.map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center gap-2 text-sm text-gray-300"
                        >
                          {m.isCritical && (
                            <span className="text-yellow-400 text-xs">◆</span>
                          )}
                          <span className="font-medium text-white">
                            {m.name}
                          </span>
                          <span
                            className={`inline-block px-1.5 py-0 text-xs rounded border ${TYPE_STYLES[m.type] ?? TYPE_STYLES.INTERNAL}`}
                          >
                            {m.type}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-700 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-gray-400">
                  Will be cloned into project{" "}
                  <span className="text-white font-medium">
                    {projects.find((p) => p.id === projectId)?.name ?? projectId}
                  </span>
                  . Phase-to-milestone links are remapped automatically.
                </p>
              </div>
            </div>

            {saveError && (
              <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-200 text-sm">
                {saveError}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                disabled={saving}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {saving && (
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {saving ? "Saving…" : "Confirm & Finalize"}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ── */}
        {step === 4 && result && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Done!</h2>
            <p className="text-gray-400 mb-6">
              Cloned{" "}
              <span className="text-white font-semibold">
                {result.phases?.length ?? 0} phases
              </span>{" "}
              and{" "}
              <span className="text-white font-semibold">
                {result.milestones?.length ?? 0} milestones
              </span>{" "}
              into project{" "}
              <span className="text-white font-medium">
                {projects.find((p) => p.id === projectId)?.name ?? projectId}
              </span>.
            </p>

            <div className="text-left grid grid-cols-2 gap-4 mb-8">
              {result.phases?.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Cloned Phases
                  </h3>
                  <ul className="space-y-1.5">
                    {result.phases.map((p) => (
                      <li key={p.id} className="text-sm text-gray-300">
                        <span className="font-medium text-white">{p.name}</span>
                        <span className="text-gray-500 ml-2 text-xs">
                          #{p.order}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.milestones?.length > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Cloned Milestones
                  </h3>
                  <ul className="space-y-1.5">
                    {result.milestones.map((m) => (
                      <li key={m.id} className="text-sm text-gray-300">
                        {m.isCritical && (
                          <span className="text-yellow-400 mr-1 text-xs">
                            ◆
                          </span>
                        )}
                        <span className="font-medium text-white">{m.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setProjectId("");
                  setProjectIdError("");
                  setSelectedPhaseIds([]);
                  setSelectedMilestoneIds([]);
                  setResult(null);
                  setSaveError("");
                }}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Run another wizard
              </button>
              <a
                href="/Phases/List"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View Phases
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
