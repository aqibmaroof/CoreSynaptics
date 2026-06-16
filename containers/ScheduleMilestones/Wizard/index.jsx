"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { listPhases, assignPhasesToProject } from "@/services/Phases";
import { listMilestones } from "@/services/ScheduleMilestones";
import { getCxProjects } from "@/services/CxProjects";

// Type chip palette — rf-token based so it adapts to light/dark.
const TYPE_META = {
  CONTRACT: {
    bg: "rgba(220,38,38,0.12)",
    color: "var(--rf-red)",
    border: "rgba(220,38,38,0.3)",
  },
  OPS: {
    bg: "rgba(192,90,0,0.12)",
    color: "var(--rf-orange)",
    border: "rgba(192,90,0,0.3)",
  },
  INTERNAL: {
    bg: "var(--rf-bg3)",
    color: "var(--rf-txt2)",
    border: "var(--rf-border)",
  },
};

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "short" })
    : "—";

// ─── rf-token style atoms ────────────────────────────────────────────────────
const sCard = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border)",
  borderRadius: 14,
};
const sBtnPrimary = {
  padding: "10px 22px",
  borderRadius: 9,
  border: "none",
  background: "var(--rf-accent)",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};
const sBtnGhost = {
  padding: "10px 20px",
  borderRadius: 9,
  border: "1px solid var(--rf-border)",
  background: "var(--rf-bg3)",
  color: "var(--rf-txt2)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

function Spinner({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      className="animate-spin"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function TypeChip({ type }) {
  const meta = TYPE_META[type] ?? TYPE_META.INTERNAL;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 8px",
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 6,
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
      }}
    >
      {type}
    </span>
  );
}

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

  const errorBox = (text) => (
    <div
      style={{
        marginBottom: 16,
        background: "rgba(220,38,38,0.08)",
        border: "1px solid rgba(220,38,38,0.3)",
        borderRadius: 10,
        padding: "12px 14px",
        color: "var(--rf-red)",
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );

  const panelHeader = {
    padding: "14px 20px",
    borderBottom: "1px solid var(--rf-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
  const projectName =
    projects.find((p) => p.id === projectId)?.name ?? projectId;

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--rf-txt)" }}>
          Phase &amp; Milestone Wizard
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--rf-txt3)" }}>
          Bulk-assign global templates to a project in one step.
        </p>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {["Project", "Select", "Confirm", "Done"].map((label, i) => {
          const idx = i + 1;
          const active = step === idx;
          const done = step > idx;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  background: done
                    ? "var(--rf-green)"
                    : active
                      ? "var(--rf-accent)"
                      : "var(--rf-bg3)",
                  color: done || active ? "#fff" : "var(--rf-txt3)",
                  border: done || active ? "none" : "1px solid var(--rf-border)",
                }}
              >
                {done ? "✓" : idx}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: active ? "var(--rf-txt)" : "var(--rf-txt3)",
                }}
              >
                {label}
              </span>
              {i < 3 && (
                <div
                  style={{
                    height: 1,
                    width: 48,
                    background: done ? "var(--rf-green)" : "var(--rf-border)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Select project ── */}
      {step === 1 && (
        <div style={{ ...sCard, padding: 32, maxWidth: 520 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 19, fontWeight: 700, color: "var(--rf-txt)" }}>
            Target Project
          </h2>
          <p style={{ margin: "0 0 22px", fontSize: 13, color: "var(--rf-txt3)" }}>
            Select the project you want to assign phases and milestones to.
          </p>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--rf-txt2)",
              marginBottom: 8,
            }}
          >
            Project <span style={{ color: "var(--rf-red)" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value); setProjectIdError(""); }}
              disabled={projectsLoading}
              style={{
                width: "100%",
                padding: "11px 32px 11px 12px",
                background: "var(--rf-bg)",
                border: `1px solid ${projectIdError ? "var(--rf-red)" : "var(--rf-border)"}`,
                borderRadius: 9,
                color: "var(--rf-txt)",
                fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                appearance: "none",
                cursor: projectsLoading ? "default" : "pointer",
                opacity: projectsLoading ? 0.5 : 1,
              }}
            >
              <option value="">{projectsLoading ? "Loading projects…" : "Select a project…"}</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name ?? p.id}</option>
              ))}
            </select>
            <svg
              style={{
                pointerEvents: "none",
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--rf-txt3)",
              }}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {projectIdError && (
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--rf-red)" }}>{projectIdError}</p>
          )}
          <button
            onClick={handleNext}
            disabled={projectsLoading}
            style={{
              ...sBtnPrimary,
              marginTop: 24,
              width: "100%",
              justifyContent: "center",
              opacity: projectsLoading ? 0.6 : 1,
            }}
          >
            Next: Select Phases &amp; Milestones →
          </button>
        </div>
      )}

      {/* ── Step 2: Select ── */}
      {step === 2 && (
        <div>
          {libraryError && errorBox(libraryError)}
          {libraryLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "96px 0", color: "var(--rf-accent)" }}>
              <Spinner size={40} />
            </div>
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                  marginBottom: 24,
                }}
              >
                {/* Left: Phases */}
                <div style={{ ...sCard, overflow: "hidden" }}>
                  <div style={panelHeader}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--rf-txt)" }}>
                      Phases ({globalPhases.length})
                    </h3>
                    <span style={{ fontSize: 12, color: "var(--rf-accent)", fontWeight: 600 }}>
                      {selectedPhaseIds.length} selected
                    </span>
                  </div>
                  <div style={{ maxHeight: 384, overflowY: "auto" }}>
                    {globalPhases.length === 0 ? (
                      <p style={{ padding: 20, fontSize: 13, color: "var(--rf-txt3)" }}>
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
                              setHighlightedPhaseId(highlighted ? null : phase.id)
                            }
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              padding: "12px 20px",
                              cursor: "pointer",
                              borderTop: "1px solid var(--rf-border)",
                              background: highlighted ? "var(--rf-glow)" : "transparent",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={(e) => {
                                e.stopPropagation();
                                togglePhase(phase.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              style={{ marginTop: 2, width: 16, height: 16, accentColor: "var(--rf-accent)", cursor: "pointer" }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--rf-txt)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {phase.name}
                              </p>
                              <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--rf-txt3)" }}>
                                {fmt(phase.startDate)} – {fmt(phase.endDate)}
                              </p>
                            </div>
                            <span style={{ fontSize: 12, color: "var(--rf-txt3)", flexShrink: 0 }}>
                              #{phase.order}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right: Milestones */}
                <div style={{ ...sCard, overflow: "hidden" }}>
                  <div style={panelHeader}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--rf-txt)" }}>
                      Milestones
                      {highlightedPhaseId && (
                        <span style={{ marginLeft: 6, fontSize: 12, color: "var(--rf-accent)", fontWeight: 500 }}>
                          (filtered by phase)
                        </span>
                      )}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {highlightedPhaseId && (
                        <button
                          onClick={() => setHighlightedPhaseId(null)}
                          style={{
                            fontSize: 12,
                            color: "var(--rf-txt3)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          Show all
                        </button>
                      )}
                      <span style={{ fontSize: 12, color: "var(--rf-accent)", fontWeight: 600 }}>
                        {selectedMilestoneIds.length} selected
                      </span>
                    </div>
                  </div>
                  <div style={{ maxHeight: 384, overflowY: "auto" }}>
                    {visibleMilestones.length === 0 ? (
                      <p style={{ padding: 20, fontSize: 13, color: "var(--rf-txt3)" }}>
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
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              padding: "12px 20px",
                              cursor: "pointer",
                              borderTop: "1px solid var(--rf-border)",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleMilestone(ms.id)}
                              style={{ marginTop: 2, width: 16, height: 16, accentColor: "var(--rf-accent)", cursor: "pointer" }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {ms.isCritical && (
                                  <span style={{ color: "var(--rf-yellow)", fontSize: 12 }}>◆</span>
                                )}
                                <p
                                  style={{
                                    margin: 0,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: "var(--rf-txt)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {ms.name}
                                </p>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                                <TypeChip type={ms.type} />
                                <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
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

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button onClick={() => setStep(1)} style={sBtnGhost}>
                  ← Back
                </button>
                <button onClick={handleNext} style={sBtnPrimary}>
                  Review &amp; Confirm →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 3: Confirm ── */}
      {step === 3 && (
        <div>
          <div style={{ ...sCard, padding: 24, marginBottom: 24 }}>
            <h2 style={{ margin: "0 0 18px", fontSize: 19, fontWeight: 700, color: "var(--rf-txt)" }}>
              Review Selection
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--rf-txt3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Phases to clone ({selectedPhases.length})
                </h3>
                {selectedPhases.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--rf-txt3)" }}>None selected</p>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedPhases.map((p) => (
                      <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--rf-accent)", flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: "var(--rf-txt)" }}>{p.name}</span>
                        <span style={{ color: "var(--rf-txt3)" }}>#{p.order}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--rf-txt3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Milestones to clone ({selectedMilestones.length})
                </h3>
                {selectedMilestones.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--rf-txt3)" }}>None selected</p>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                    {selectedMilestones.map((m) => (
                      <li key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        {m.isCritical && <span style={{ color: "var(--rf-yellow)", fontSize: 12 }}>◆</span>}
                        <span style={{ fontWeight: 600, color: "var(--rf-txt)" }}>{m.name}</span>
                        <TypeChip type={m.type} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div
              style={{
                marginTop: 22,
                paddingTop: 16,
                borderTop: "1px solid var(--rf-border)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <svg width="16" height="16" fill="none" stroke="var(--rf-accent)" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p style={{ margin: 0, fontSize: 13, color: "var(--rf-txt3)" }}>
                Will be cloned into project{" "}
                <span style={{ color: "var(--rf-txt)", fontWeight: 600 }}>{projectName}</span>
                . Phase-to-milestone links are remapped automatically.
              </p>
            </div>
          </div>

          {saveError && errorBox(saveError)}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} disabled={saving} style={sBtnGhost}>
              ← Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving}
              style={{
                padding: "11px 24px",
                borderRadius: 9,
                border: "none",
                background: "var(--rf-green)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving && <Spinner />}
              {saving ? "Saving…" : "Confirm & Finalize"}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 4 && result && (
        <div style={{ ...sCard, padding: 32, textAlign: "center" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(22,163,74,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg width="32" height="32" fill="none" stroke="var(--rf-green)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "var(--rf-txt)" }}>
            Done!
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: 14, color: "var(--rf-txt3)" }}>
            Cloned{" "}
            <span style={{ color: "var(--rf-txt)", fontWeight: 700 }}>
              {result.phases?.length ?? 0} phases
            </span>{" "}
            and{" "}
            <span style={{ color: "var(--rf-txt)", fontWeight: 700 }}>
              {result.milestones?.length ?? 0} milestones
            </span>{" "}
            into project{" "}
            <span style={{ color: "var(--rf-txt)", fontWeight: 600 }}>{projectName}</span>.
          </p>

          <div
            style={{
              textAlign: "left",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {result.phases?.length > 0 && (
              <div style={{ background: "var(--rf-bg3)", borderRadius: 10, padding: 16 }}>
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--rf-txt3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Cloned Phases
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.phases.map((p) => (
                    <li key={p.id} style={{ fontSize: 13 }}>
                      <span style={{ fontWeight: 600, color: "var(--rf-txt)" }}>{p.name}</span>
                      <span style={{ color: "var(--rf-txt3)", marginLeft: 8, fontSize: 12 }}>#{p.order}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.milestones?.length > 0 && (
              <div style={{ background: "var(--rf-bg3)", borderRadius: 10, padding: 16 }}>
                <h3
                  style={{
                    margin: "0 0 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--rf-txt3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Cloned Milestones
                </h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                  {result.milestones.map((m) => (
                    <li key={m.id} style={{ fontSize: 13 }}>
                      {m.isCritical && <span style={{ color: "var(--rf-yellow)", marginRight: 4, fontSize: 12 }}>◆</span>}
                      <span style={{ fontWeight: 600, color: "var(--rf-txt)" }}>{m.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
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
              style={sBtnGhost}
            >
              Run another wizard
            </button>
            <Link
              href="/Phases/List"
              style={{
                padding: "10px 20px",
                borderRadius: 9,
                background: "var(--rf-accent)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              View Phases
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
