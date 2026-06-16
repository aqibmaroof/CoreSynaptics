"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  listMilestones,
  deleteMilestone,
  cloneMilestone,
} from "@/services/ScheduleMilestones";
import { listPhases } from "@/services/Phases";
import { listV2Projects } from "@/services/CxProjectsV2";
import ScheduleBaselineDiff from "@/components/ScheduleBaselineDiff";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

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
    ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" })
    : "—";

function toArr(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ?? data?.projects ?? data?.items ?? []);
}

// ─── rf-token style atoms ────────────────────────────────────────────────────
const sCard = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border)",
  borderRadius: 12,
};
const sBtnGhost = {
  padding: "9px 16px",
  borderRadius: 9,
  border: "1px solid var(--rf-border)",
  background: "var(--rf-bg3)",
  color: "var(--rf-txt2)",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
const actionBtn = (bg) => ({
  padding: "5px 12px",
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 6,
  border: "none",
  cursor: "pointer",
  color: "#fff",
  background: bg,
});

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

function Badge({ meta, children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 999,
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </span>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  loading: l,
  disabled,
}) {
  console.log(options);
  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--rf-txt2)",
            marginBottom: 6,
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={onChange}
          disabled={l || disabled}
          style={{
            width: "100%",
            padding: "9px 32px 9px 12px",
            background: "var(--rf-bg)",
            border: "1px solid var(--rf-border)",
            borderRadius: 9,
            color: "var(--rf-txt2)",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            appearance: "none",
            cursor: l || disabled ? "default" : "pointer",
            opacity: l || disabled ? 0.5 : 1,
          }}
        >
          <option value="">{l ? "Loading…" : placeholder}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          style={{
            pointerEvents: "none",
            position: "absolute",
            right: 10,
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
    </div>
  );
}

const FILTER_MODES = ["global", "project", "phase"];

export default function ScheduleMilestonesList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = useUserPermissions();

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
    listV2Projects()
      .then((d) => {
        setProjects(toArr(d));
        setCloneProjects(toArr(d));
      })
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // Load phases for filter bar when filterProjectId changes (phase mode)
  useEffect(() => {
    if (filterMode !== "phase") return;
    setFilterPhaseId("");
    if (!filterProjectId) {
      setPhases([]);
      return;
    }
    setPhasesLoading(true);
    listPhases({ projectId: filterProjectId })
      .then((d) => setPhases(toArr(d)))
      .catch(() => setPhases([]))
      .finally(() => setPhasesLoading(false));
  }, [filterProjectId, filterMode]);

  // Load phases for clone modal when cloneProjectId changes
  useEffect(() => {
    setClonePhaseId("");
    if (!cloneProjectId) {
      setClonePhases([]);
      return;
    }
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
      if (filterMode === "project" && filterProjectId)
        params.projectId = filterProjectId;
      if (filterMode === "phase" && filterPhaseId)
        params.phaseId = filterPhaseId;
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
console.log(projects)
  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.projectName ?? p.id,
  }));
  const phaseOptions = phases.map((p) => ({
    value: p.id,
    label: p.name ?? p.id,
  }));
  const clonePhaseOptions = clonePhases.map((p) => ({
    value: p.id,
    label: p.name ?? p.id,
  }));

  const groupedByPhase = milestones.reduce((acc, m) => {
    const key = m.phaseId ?? "__unassigned__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const th = {
    padding: "10px 20px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--rf-txt3)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };
  const td = { padding: "13px 20px", fontSize: 13, color: "var(--rf-txt)" };

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 800,
              color: "var(--rf-txt)",
            }}
          >
            Schedule Milestones
          </h1>
          <p
            style={{ margin: "6px 0 0", fontSize: 14, color: "var(--rf-txt3)" }}
          >
            Manage schedule milestones and project templates
          </p>
        </div>
        <Link
          href={canCreate(MODULE.MILESTONES) ? "/ScheduleMilestones/Add" : "#"}
          {...permissionProps(
            canCreate(MODULE.MILESTONES),
            "create a milestone",
          )}
          style={{
            padding: "10px 18px",
            background: "var(--rf-accent)",
            color: "#fff",
            borderRadius: 9,
            fontWeight: 700,
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
          }}
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Milestone
        </Link>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 24,
            background: "rgba(220,38,38,0.08)",
            border: "1px solid rgba(220,38,38,0.3)",
            borderRadius: 10,
            padding: "12px 14px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            color: "var(--rf-red)",
            fontSize: 13,
          }}
        >
          <svg
            width="18"
            height="18"
            fill="currentColor"
            viewBox="0 0 20 20"
            style={{ flexShrink: 0, marginTop: 1 }}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ ...sCard, padding: 20, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "flex-end",
          }}
        >
          {/* Mode toggle */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--rf-txt2)",
                marginBottom: 6,
              }}
            >
              Filter By
            </label>
            <div
              style={{
                display: "flex",
                borderRadius: 9,
                overflow: "hidden",
                border: "1px solid var(--rf-border)",
              }}
            >
              {FILTER_MODES.map((mode) => {
                const active = filterMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => handleFilterModeChange(mode)}
                    style={{
                      padding: "9px 16px",
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      border: "none",
                      cursor: "pointer",
                      background: active ? "var(--rf-accent)" : "var(--rf-bg3)",
                      color: active ? "#fff" : "var(--rf-txt2)",
                    }}
                  >
                    {mode === "global"
                      ? "Global Templates"
                      : mode === "project"
                        ? "Project"
                        : "Phase"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project dropdown */}
          {(filterMode === "project" || filterMode === "phase") && (
            <div style={{ width: 256 }}>
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
            <div style={{ width: 256 }}>
              <SelectField
                label="Phase"
                value={filterPhaseId}
                onChange={(e) => setFilterPhaseId(e.target.value)}
                options={phaseOptions}
                placeholder={
                  filterProjectId ? "Select a phase…" : "Select a project first"
                }
                loading={phasesLoading}
                disabled={!filterProjectId}
              />
            </div>
          )}
        </div>
      </div>

      {/* v15 B4 — Baseline vs actual variance, scoped to selected project */}
      {filterMode !== "global" && filterProjectId && (
        <div style={{ marginBottom: 16 }}>
          <ScheduleBaselineDiff cxProjectId={filterProjectId} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "64px 0",
          }}
        >
          <div style={{ textAlign: "center", color: "var(--rf-accent)" }}>
            <Spinner size={44} />
            <p style={{ marginTop: 14, color: "var(--rf-txt3)", fontSize: 14 }}>
              Loading milestones…
            </p>
          </div>
        </div>
      ) : milestones.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "64px 0",
            color: "var(--rf-txt3)",
          }}
        >
          <svg
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ margin: "0 auto 14px", display: "block" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p style={{ fontSize: 16 }}>No milestones found</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {Object.entries(groupedByPhase).map(([phaseKey, items]) => (
            <div key={phaseKey} style={{ ...sCard, overflow: "hidden" }}>
              <div
                style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--rf-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="var(--rf-txt3)"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--rf-txt2)",
                  }}
                >
                  {phaseKey === "__unassigned__"
                    ? "Unassigned"
                    : `Phase: ${phaseKey}`}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 12,
                    color: "var(--rf-txt3)",
                  }}
                >
                  {items.length} milestone{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--rf-border)" }}>
                      <th style={th}>Name</th>
                      <th style={th}>Date</th>
                      <th style={th}>Type</th>
                      <th style={th}>Critical</th>
                      <th style={th}>Scope</th>
                      <th style={{ ...th, textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((ms) => (
                      <tr
                        key={ms.id}
                        style={{ borderTop: "1px solid var(--rf-border)" }}
                      >
                        <td style={{ ...td, fontWeight: 600 }}>
                          {ms.isCritical && (
                            <span
                              style={{
                                marginRight: 6,
                                color: "var(--rf-yellow)",
                              }}
                              title="Critical path"
                            >
                              ◆
                            </span>
                          )}
                          {ms.name}
                        </td>
                        <td style={{ ...td, color: "var(--rf-txt3)" }}>
                          {fmt(ms.date)}
                        </td>
                        <td style={td}>
                          <Badge
                            meta={TYPE_META[ms.type] ?? TYPE_META.INTERNAL}
                          >
                            {ms.type}
                          </Badge>
                        </td>
                        <td style={td}>
                          {ms.isCritical ? (
                            <span
                              style={{
                                color: "var(--rf-yellow)",
                                fontWeight: 600,
                              }}
                            >
                              Yes
                            </span>
                          ) : (
                            <span style={{ color: "var(--rf-txt3)" }}>—</span>
                          )}
                        </td>
                        <td style={td}>
                          {ms.isGlobal ? (
                            <Badge
                              meta={{
                                bg: "rgba(96,32,176,0.12)",
                                color: "var(--rf-purple)",
                                border: "rgba(96,32,176,0.3)",
                              }}
                            >
                              Template
                            </Badge>
                          ) : (
                            <Badge
                              meta={{
                                bg: "var(--rf-glow)",
                                color: "var(--rf-accent)",
                                border: "rgba(0,112,187,0.3)",
                              }}
                            >
                              Project
                            </Badge>
                          )}
                        </td>
                        <td style={{ ...td, textAlign: "right" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              gap: 8,
                            }}
                          >
                            <button
                              onClick={() =>
                                router.push(`/ScheduleMilestones/Edit/${ms.id}`)
                              }
                              {...permissionProps(
                                canEdit(MODULE.MILESTONES),
                                "edit milestones",
                              )}
                              style={actionBtn("var(--rf-accent)")}
                            >
                              Edit
                            </button>
                            {ms.isGlobal && (
                              <button
                                onClick={() => setCloneTarget(ms)}
                                style={actionBtn("var(--rf-purple)")}
                              >
                                Clone
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteConfirm(ms.id)}
                              {...permissionProps(
                                canDelete(MODULE.MILESTONES),
                                "delete milestones",
                              )}
                              style={actionBtn("var(--rf-red)")}
                            >
                              Delete
                            </button>
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={(e) =>
            e.target === e.currentTarget && setDeleteConfirm(null)
          }
        >
          <div style={{ ...sCard, maxWidth: 380, width: "100%", padding: 24 }}>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--rf-txt)",
              }}
            >
              Delete Milestone?
            </h3>
            <p
              style={{
                margin: "0 0 22px",
                fontSize: 14,
                color: "var(--rf-txt3)",
              }}
            >
              This will soft-delete the milestone and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                style={{ ...sBtnGhost, flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 9,
                  border: "none",
                  background: "var(--rf-red)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: deleting ? 0.7 : 1,
                }}
              >
                {deleting && <Spinner />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone modal */}
      {cloneTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCloneTarget(null);
              setCloneProjectId("");
              setClonePhaseId("");
            }
          }}
        >
          <div style={{ ...sCard, maxWidth: 460, width: "100%", padding: 24 }}>
            <h3
              style={{
                margin: "0 0 4px",
                fontSize: 17,
                fontWeight: 700,
                color: "var(--rf-txt)",
              }}
            >
              Clone Milestone into Project
            </h3>
            <p
              style={{
                margin: "0 0 18px",
                fontSize: 13,
                color: "var(--rf-txt3)",
              }}
            >
              Cloning{" "}
              <span style={{ color: "var(--rf-txt)", fontWeight: 600 }}>
                {cloneTarget.name}
              </span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                placeholder={
                  cloneProjectId ? "Select a phase…" : "Select a project first"
                }
                loading={clonePhasesLoading}
                disabled={!cloneProjectId}
              />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
              <button
                onClick={() => {
                  setCloneTarget(null);
                  setCloneProjectId("");
                  setClonePhaseId("");
                }}
                disabled={cloning}
                style={{ ...sBtnGhost, flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleClone}
                disabled={cloning || !cloneProjectId}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: 9,
                  border: "none",
                  background: "var(--rf-purple)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: cloning || !cloneProjectId ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: cloning || !cloneProjectId ? 0.5 : 1,
                }}
              >
                {cloning && <Spinner />}
                Clone Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
