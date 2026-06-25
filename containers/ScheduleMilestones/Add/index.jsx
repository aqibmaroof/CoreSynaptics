"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMilestone, listMilestones } from "@/services/ScheduleMilestones";
import { listPhases } from "@/services/Phases";
import { listV2Projects } from "@/services/CxProjectsV2";
import {
  required,
  lengthBetween,
  notDuplicate,
  validatePersonName,
  collectErrors,
  NAME_PATTERN,
} from "@/Utils/validation";

// Today as a YYYY-MM-DD string for the date input `min` (no past dates).
const todayStr = () => new Date().toISOString().slice(0, 10);

const MILESTONE_TYPES = [
  { value: "INTERNAL", label: "Internal — tracking only" },
  { value: "CONTRACT", label: "Contract — client-facing deadline" },
  { value: "OPS", label: "OPS — internal ops target" },
];

function toArr(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ?? data?.projects ?? data?.items ?? []);
}

// ─── rf-token style atoms (theme-aware light/dark) ───────────────────────────
const sCard = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border)",
  borderRadius: 14,
};
const sLabel = {
  display: "block",
  fontSize: 11,
  fontWeight: 800,
  color: "var(--rf-txt3)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 7,
};
const sInput = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--rf-bg)",
  border: "1px solid var(--rf-border)",
  borderRadius: 9,
  color: "var(--rf-txt)",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};
const sBtnPrimary = {
  padding: "10px 20px",
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
const sErr = {
  display: "block",
  marginTop: 6,
  fontSize: 12,
  fontWeight: 600,
  color: "var(--rf-red)",
};

function Chevron() {
  return (
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
  );
}

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

export default function ScheduleMilestoneAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [phases, setPhases] = useState([]);
  const [phasesLoading, setPhasesLoading] = useState(false);

  const [existingNames, setExistingNames] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  // Inline "discard unsaved changes?" confirmation (CM_TC_047). An inline confirm
  // (not a blocking window.confirm) keeps the UI responsive/accessible.
  const [confirmExit, setConfirmExit] = useState(false);

  const [form, setForm] = useState({
    name: "",
    date: "",
    type: "INTERNAL",
    isCritical: false,
    projectId: "",
    phaseId: "",
  });

  // The form is dirty if the user entered/changed anything from defaults.
  const isDirty = () =>
    form.name.trim() !== "" ||
    form.date !== "" ||
    form.type !== "INTERNAL" ||
    form.isCritical ||
    form.projectId !== "" ||
    form.phaseId !== "";

  // Request to leave the form. If there are unsaved changes, show the inline
  // confirm (CM_TC_047); otherwise leave immediately.
  const requestExit = () => {
    if (isDirty()) {
      setConfirmExit(true);
      return;
    }
    router.back();
  };

  // Load projects on mount
  useEffect(() => {
    listV2Projects()
      .then((d) => setProjects(toArr(d)))
      .catch(() => {})
      .finally(() => setProjectsLoading(false));
  }, []);

  // When project changes, reload phases + existing milestone names (for the
  // duplicate check) scoped to that project (or global when none).
  useEffect(() => {
    setForm((prev) => ({ ...prev, phaseId: "" }));
    setPhasesLoading(true);
    const params = form.projectId ? { projectId: form.projectId } : {};
    listPhases(params)
      .then((d) => setPhases(toArr(d)))
      .catch(() => setPhases([]))
      .finally(() => setPhasesLoading(false));

    listMilestones(params)
      .then((d) => setExistingNames(toArr(d).map((m) => m?.name).filter(Boolean)))
      .catch(() => setExistingNames([]));
  }, [form.projectId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear a field's inline error as the user edits it.
    setFieldErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  // Validate every field, returning the {field: message} map (empty = valid).
  // Name: required (CM_TC_005), 2–120 chars (CM_TC_007/008), letters-only
  // charset that rejects pure-numeric / symbols (CM_TC_009/010), and unique
  // against existing milestones (CM_TC_014). Type required (CM_TC_026).
  const validate = () =>
    collectErrors({
      name:
        required(form.name, "Milestone Name") ||
        lengthBetween(form.name, { min: 2, max: 120, label: "Milestone Name" }) ||
        validatePersonName(form.name, "Milestone Name", NAME_PATTERN) ||
        notDuplicate(form.name, existingNames, "Milestone Name"),
      date: required(form.date, "Target Date"),
      type: required(form.type, "Type"),
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

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
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          onClick={requestExit}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 9,
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border)",
            color: "var(--rf-txt2)",
            cursor: "pointer",
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: "var(--rf-txt)",
            }}
          >
            New Milestone
          </h1>
          <p
            style={{ margin: "4px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}
          >
            Leave Project blank to create a global org-level template.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 20,
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

      <form onSubmit={handleSubmit} style={{ ...sCard, padding: 24 }}>
        {/* Name */}
        <div style={{ marginBottom: 18 }}>
          <label style={sLabel}>
            Milestone Name <span style={{ color: "var(--rf-red)" }}>*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={120}
            placeholder="e.g. NTP Issued"
            style={sInput}
          />
          {fieldErrors.name && <span style={sErr}>{fieldErrors.name}</span>}
        </div>

        {/* Date */}
        <div style={{ marginBottom: 18 }}>
          <label style={sLabel}>
            Target Date <span style={{ color: "var(--rf-red)" }}>*</span>
          </label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            min={todayStr()}
            style={sInput}
          />
          {fieldErrors.date && <span style={sErr}>{fieldErrors.date}</span>}
        </div>

        {/* Type */}
        <div style={{ marginBottom: 18 }}>
          <label style={sLabel}>
            Type <span style={{ color: "var(--rf-red)" }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              style={{
                ...sInput,
                appearance: "none",
                paddingRight: 32,
                cursor: "pointer",
              }}
            >
              {MILESTONE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
          {fieldErrors.type && <span style={sErr}>{fieldErrors.type}</span>}
        </div>

        {/* isCritical */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            id="isCritical"
            name="isCritical"
            type="checkbox"
            checked={form.isCritical}
            onChange={handleChange}
            style={{
              width: 16,
              height: 16,
              accentColor: "var(--rf-accent)",
              cursor: "pointer",
            }}
          />
          <span style={{ fontSize: 14, color: "var(--rf-txt2)" }}>
            Mark as Critical Path{" "}
            <span style={{ color: "var(--rf-txt3)" }}>
              (shown with ◆ diamond indicator)
            </span>
          </span>
        </label>

        {/* Project dropdown */}
        <div style={{ marginBottom: 18 }}>
          <label style={sLabel}>Project (optional)</label>
          <div style={{ position: "relative" }}>
            <select
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              disabled={projectsLoading}
              style={{
                ...sInput,
                appearance: "none",
                paddingRight: 32,
                cursor: projectsLoading ? "default" : "pointer",
                opacity: projectsLoading ? 0.5 : 1,
              }}
            >
              <option value="">
                {projectsLoading
                  ? "Loading projects…"
                  : "— Global Template (no project) —"}
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName ?? p.id}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
        </div>

        {/* Phase dropdown — updates when project changes */}
        <div style={{ marginBottom: 22 }}>
          <label style={sLabel}>Phase (optional)</label>
          <div style={{ position: "relative" }}>
            <select
              name="phaseId"
              value={form.phaseId}
              onChange={handleChange}
              disabled={phasesLoading}
              style={{
                ...sInput,
                appearance: "none",
                paddingRight: 32,
                cursor: phasesLoading ? "default" : "pointer",
                opacity: phasesLoading ? 0.5 : 1,
              }}
            >
              <option value="">
                {phasesLoading
                  ? "Loading phases…"
                  : phases.length === 0
                    ? "No phases available"
                    : "— Unlinked —"}
              </option>
              {phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.id}
                </option>
              ))}
            </select>
            <Chevron />
          </div>
          <p
            style={{ margin: "7px 0 0", fontSize: 12, color: "var(--rf-txt3)" }}
          >
            {form.projectId
              ? "Showing phases for the selected project."
              : "Showing global template phases. Select a project above to see project-scoped phases."}
          </p>
        </div>

        {/* Unsaved-changes inline confirm (CM_TC_047) */}
        {confirmExit && (
          <div
            role="alertdialog"
            aria-label="Discard unsaved milestone?"
            style={{
              marginBottom: 16,
              border: "1px solid var(--rf-red)",
              borderRadius: 10,
              padding: "12px 14px",
              background: "var(--rf-bg3)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--rf-txt)",
                marginBottom: 10,
              }}
            >
              Discard this milestone? Your unsaved changes will be lost.
            </div>
            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                style={sBtnGhost}
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                style={{
                  ...sBtnPrimary,
                  background: "var(--rf-red)",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 12,
            paddingTop: 4,
          }}
        >
          <button type="button" onClick={requestExit} style={sBtnGhost}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...sBtnPrimary, opacity: loading ? 0.6 : 1 }}
          >
            {loading && <Spinner />}
            Create Milestone
          </button>
        </div>
      </form>
    </div>
  );
}
