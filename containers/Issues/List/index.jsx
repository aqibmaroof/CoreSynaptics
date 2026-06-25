"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getIssues,
  createIssue,
  changeIssueStatus,
  assignIssue,
  verifyAndCloseIssue,
  deleteIssue,
  ISSUE_KINDS,
  ISSUE_KIND_LABELS,
  NCR_SUB_STATUS_LABELS,
  NCR_SUB_STATUSES,
  getEligibleVerifiers,
  getIssueAssignees,
} from "@/services/Issues";
import { getUsers } from "@/services/Users";
import { getCompanies } from "@/services/Companies";
import { listV2Projects, listV2Assets } from "@/services/CxProjectsV2";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

// ─── Style maps ───────────────────────────────────────────────────────────────

const PRIORITY_META = {
  CRIT: {
    label: "CRIT",
    bg: "rgba(231, 67, 67, 0.14)",
    color: "#dc2626",
    border: "rgba(239,68,68,0.28)",
    leftBorder: "#ef4444",
    rowBg: "rgba(255, 0, 0, 0.09)",
  },
  HIGH: {
    label: "HIGH",
    bg: "rgba(245,158,11,0.14)",
    color: "#b45309",
    border: "rgba(245,158,11,0.28)",
    leftBorder: "#f59e0b",
    rowBg: "rgba(255, 162, 0, 0.09)",
  },
  MED: {
    label: "MED",
    bg: "rgba(234,179,8,0.14)",
    color: "#a16207",
    border: "rgba(234,179,8,0.28)",
    leftBorder: "#eab308",
    rowBg: "rgba(25, 0, 255, 0.09)",
  },
  LOW: {
    label: "LOW",
    bg: "rgba(148,163,184,0.12)",
    color: "#64748b",
    border: "rgba(148,163,184,0.25)",
    leftBorder: "#94a3b8",
    rowBg: "rgba(0, 225, 255, 0.09)",
  },
};

const STATUS_META = {
  IN_PROGRESS: {
    label: "IN PROGRESS",
    bg: "rgba(245,158,11,0.18)",
    color: "#92400e",
    border: "rgba(245,158,11,0.35)",
  },
  OPEN: {
    label: "OPEN",
    bg: "transparent",
    color: "var(--rf-red)",
    border: "rgba(239,68,68,0.4)",
  },
  CX_VERIFIED: {
    label: "CX VERIFIED",
    bg: "transparent",
    color: "var(--rf-green)",
    border: "rgba(34,197,94,0.5)",
  },
  CLOSED: {
    label: "CLOSED",
    bg: "var(--rf-bg3)",
    color: "var(--rf-txt3)",
    border: "var(--rf-border)",
  },
  READY_FOR_VERIFICATION: {
    label: "RFV",
    bg: "rgba(99,102,241,0.12)",
    color: "#4338ca",
    border: "rgba(99,102,241,0.3)",
  },
  NEW: {
    label: "NEW",
    bg: "rgba(59,130,246,0.12)",
    color: "#1d4ed8",
    border: "rgba(59,130,246,0.3)",
  },
  DEFERRED: {
    label: "DEFERRED",
    bg: "var(--rf-bg3)",
    color: "var(--rf-txt3)",
    border: "var(--rf-border)",
  },
};

const DISCIPLINE_COLOR = {
  MECHANICAL: { bg: "rgba(148,163,184,0.12)", color: "#64748b" },
  ELECTRICAL: { bg: "rgba(148,163,184,0.12)", color: "#64748b" },
  VENDOR: { bg: "rgba(148,163,184,0.12)", color: "#64748b" },
  BMS: { bg: "rgba(148,163,184,0.12)", color: "#64748b" },
  SAFETY: { bg: "rgba(148,163,184,0.12)", color: "#64748b" },
  STRUCTURAL: { bg: "rgba(148,163,184,0.12)", color: "#64748b" },
};

// ─── API status mapping ───────────────────────────────────────────────────────

const STATUS_LABEL = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  READY_FOR_VERIFICATION: "Ready for Verification",
  CLOSED: "Closed",
  DEFERRED: "Deferred",
};

const TRANSITIONS = {
  NEW: ["IN_PROGRESS", "DEFERRED"],
  IN_PROGRESS: ["READY_FOR_VERIFICATION", "DEFERRED"],
  READY_FOR_VERIFICATION: ["IN_PROGRESS", "DEFERRED"],
  DEFERRED: ["NEW", "IN_PROGRESS"],
  CLOSED: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// API severity ↔ card priority. The card UI speaks CRIT/HIGH/MED/LOW; the
// backend (createIssue / getIssues) speaks LOW/MEDIUM/HIGH/CRITICAL.
const SEVERITY_TO_PRIORITY = {
  CRITICAL: "CRIT",
  HIGH: "HIGH",
  MEDIUM: "MED",
  LOW: "LOW",
};
const PRIORITY_TO_SEVERITY = {
  CRIT: "CRITICAL",
  HIGH: "HIGH",
  MED: "MEDIUM",
  LOW: "LOW",
};

const fullName = (u) =>
  u ? [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email : null;

// Map a raw API issue (see services/Issues getIssues) onto the card view-model
// the rest of this screen renders. `usersById` resolves assignee/raiser ids to
// display names.
const normalizeIssue = (it, usersById = {}) => {
  const assignee = it.assignedToUserId ? usersById[it.assignedToUserId] : null;
  const raiserId = it.raisedByUserId || it.createdByUserId || it.raisedBy;
  const raiser = raiserId ? usersById[raiserId] : null;
  const created = it.createdAt ? new Date(it.createdAt) : null;
  const slaDue = it.slaDueAt || it.dueAt;
  const overdue =
    typeof it.isOverdue === "boolean"
      ? it.isOverdue
      : slaDue
        ? new Date(slaDue).getTime() < Date.now()
        : false;
  const overdueHours =
    it.overdueHours ??
    (overdue && slaDue
      ? Math.max(
          1,
          Math.round((Date.now() - new Date(slaDue).getTime()) / 3.6e6),
        )
      : null);

  return {
    id: it.id,
    num:
      it.issueNumber ||
      it.num ||
      (it.id ? `ISS-${String(it.id).slice(0, 8)}` : ""),
    kind: it.kind || "GENERAL",
    priority: SEVERITY_TO_PRIORITY[it.severity] || "MED",
    title: it.title,
    // Keep the project id so the duplicate-title guard can scope by project.
    cxProjectId: it.cxProjectId || it.projectId || it.project?.id || "",
    description: it.description || "",
    discipline: it.discipline || null,
    asset:
      it.projectAsset?.abbr ||
      it.projectAsset?.name ||
      it.asset?.name ||
      it.assetName ||
      null,
    company: it.assignedToCompany?.name || it.company?.name || null,
    assigneeCompany: null,
    checklistRef: it.checklistRef || null,
    comments: it.commentCount ?? 0,
    blocker: it.blocksPhase ? it.blocksNote || "BLOCKS PHASE" : null,
    status: it.status || "NEW",
    isOverdue: overdue && it.status !== "CLOSED",
    overdueHours,
    sla: it.slaHours ? `${it.slaHours}h` : null,
    raisedBy: fullName(raiser) || it.raisedByName || "—",
    raisedDate: created
      ? created.toLocaleDateString("en-US", { month: "short", day: "2-digit" })
      : null,
    assignedTo:
      fullName(assignee) ||
      it.assignedToUserName ||
      (it.assignedToUserId ? "Assigned" : null),
    assignedToUserId: it.assignedToUserId || "",
    assignedToCompanyId: it.assignedToCompanyId || "",
    ncrSubStatus: it.ncrSubStatus,
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META.MED;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        padding: "2px 7px",
        borderRadius: 5,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {m.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.OPEN;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        padding: "3px 9px",
        borderRadius: 5,
        background: m.bg,
        color: m.color,
        border: `1px solid ${m.border}`,
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {m.label}
    </span>
  );
}

function Chip({ label, icon }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 10,
        fontWeight: 600,
        padding: "1px 6px",
        borderRadius: 4,
        background: "var(--rf-bg3)",
        color: "var(--rf-txt2)",
        border: "1px solid var(--rf-border)",
        whiteSpace: "nowrap",
        letterSpacing: "0.03em",
      }}
    >
      {icon && <span style={{ fontSize: 9 }}>{icon}</span>}
      {label}
    </span>
  );
}

function DisciplineChip({ label }) {
  const s = DISCIPLINE_COLOR[label] || DISCIPLINE_COLOR.MECHANICAL;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "1px 6px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        letterSpacing: "0.05em",
        border: "1px solid rgba(148,163,184,0.2)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function IssueCard({
  issue,
  canVerify = false,
  onStatusChange,
  onAssign,
  onVerify,
  onDelete,
}) {
  const pm = PRIORITY_META[issue.priority] || PRIORITY_META.MED;
  const showOverdue = issue.isOverdue && issue.overdueHours;

  return (
    <div
      style={{
        background: pm.rowBg || "var(--rf-bg2)",
        border: "1px solid var(--rf-border)",
        borderLeft: `4px solid ${pm.leftBorder}`,
        borderRadius: "0 10px 10px 0",
        padding: "14px 16px 12px",
        marginBottom: 8,
        transition: "box-shadow 0.15s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* ── Left: main content ──────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Row 1: issue number + priority + title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--rf-txt3)",
                fontFamily: "monospace",
                whiteSpace: "nowrap",
              }}
            >
              {issue.num}
            </span>
            <PriorityBadge priority={issue.priority} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--rf-txt)",
                lineHeight: 1.4,
                flex: 1,
                minWidth: 0,
              }}
            >
              {issue.title}
            </span>
          </div>

          {/* Row 2: tags */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              flexWrap: "wrap",
              marginBottom: 7,
            }}
          >
            {issue.discipline && <DisciplineChip label={issue.discipline} />}
            {issue.asset && <Chip label={issue.asset} icon="⬤" />}
            {issue.company && <Chip label={issue.company} icon="" />}
            {issue.assigneeCompany && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--rf-accent)",
                  whiteSpace: "nowrap",
                }}
              >
                {issue.assigneeCompany}
              </span>
            )}
            {issue.checklistRef && <Chip label={issue.checklistRef} icon="" />}
            {issue.comments > 0 && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span></span> {issue.comments}
              </span>
            )}
            {issue.blocker && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "1px 7px",
                  borderRadius: 4,
                  background: "rgba(239,68,68,0.1)",
                  color: "var(--rf-red)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  letterSpacing: "0.04em",
                }}
              >
                {issue.blocker}
              </span>
            )}
          </div>

          {/* Row 3: raised by / assigned to */}
          <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            Raised by{" "}
            <span style={{ fontWeight: 600, color: "var(--rf-txt2)" }}>
              {issue.raisedBy}
            </span>
            {issue.raisedDate && ` · ${issue.raisedDate}`}
            {issue.assignedTo && (
              <>
                {" · assigned to "}
                <span style={{ fontWeight: 600, color: "var(--rf-txt2)" }}>
                  {issue.assignedTo}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ── Right: status + time ─────────────────────────────────── */}
        <div style={{ flexShrink: 0, textAlign: "right", minWidth: 120 }}>
          <div style={{ marginBottom: 4 }}>
            <StatusBadge status={issue.status} />
          </div>

          {showOverdue ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--rf-red)",
                marginBottom: 2,
              }}
            >
              OVERDUE {issue.overdueHours}h
            </div>
          ) : issue.timeLeft ? (
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--rf-yellow)",
                marginBottom: 2,
              }}
            >
              ⏱ {issue.timeLeft}
            </div>
          ) : issue.status === "CLOSED" ? (
            <div
              style={{ fontSize: 11, color: "var(--rf-txt3)", marginBottom: 2 }}
            >
              closed
            </div>
          ) : issue.status === "CX_VERIFIED" ? (
            <div
              style={{ fontSize: 11, color: "var(--rf-txt3)", marginBottom: 2 }}
            >
              awaiting close
            </div>
          ) : null}

          {issue.sla && (
            <div style={{ fontSize: 10, color: "var(--rf-txt3)" }}>
              SLA {issue.sla}
            </div>
          )}

          {/* NCR sub-status stepper */}
          {issue.kind === "NCR" && issue.ncrSubStatus && (
            <div style={{ marginTop: 8, textAlign: "left" }}>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  color: "var(--rf-txt3)",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                NCR PROGRESS
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {NCR_SUB_STATUSES.map((step) => {
                  const stepIdx = NCR_SUB_STATUSES.indexOf(step);
                  const curIdx = NCR_SUB_STATUSES.indexOf(issue.ncrSubStatus);
                  const done = stepIdx < curIdx;
                  const active = stepIdx === curIdx;
                  return (
                    <div
                      key={step}
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: done
                            ? "var(--rf-green)"
                            : active
                              ? "var(--rf-accent)"
                              : "var(--rf-border)",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: active ? 800 : 500,
                          color: done
                            ? "var(--rf-green)"
                            : active
                              ? "var(--rf-accent)"
                              : "var(--rf-txt3)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {NCR_SUB_STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick action row */}
          <div
            style={{
              display: "flex",
              gap: 4,
              justifyContent: "flex-end",
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            {(TRANSITIONS[issue.status] || []).map((next) => (
              <button
                key={next}
                onClick={() => onStatusChange(issue, next)}
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 5,
                  border: "1px solid var(--rf-border)",
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt2)",
                  cursor: "pointer",
                }}
              >
                →{" "}
                {next === "READY_FOR_VERIFICATION" ? "RFV" : STATUS_LABEL[next]}
              </button>
            ))}
            {issue.status === "READY_FOR_VERIFICATION" && canVerify && (
              <button
                onClick={() => onVerify(issue)}
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 5,
                  border: "1px solid rgba(34,197,94,0.4)",
                  background: "rgba(34,197,94,0.08)",
                  color: "var(--rf-green)",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Close
              </button>
            )}
            {issue.status !== "CLOSED" && (
              <button
                onClick={() => onAssign(issue)}
                style={{
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 5,
                  border: "1px solid var(--rf-border)",
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt3)",
                  cursor: "pointer",
                }}
              >
                Assign
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Raise Issue Modal ────────────────────────────────────────────────────────

const PRIORITY_SLA = {
  CRIT: "24h SLA",
  HIGH: "48h SLA",
  MED: "72h SLA",
  LOW: "168h SLA",
};
const PRIORITY_ACTIVE_BG = {
  CRIT: "#dc2626",
  HIGH: "#d97706",
  MED: "#d97706",
  LOW: "#64748b",
};

const DISCIPLINES = [
  "Mechanical",
  "Electrical",
  "Vendor",
  "BMS",
  "Safety",
  "Structural",
  "Civil",
  "IT/Network",
  "Plumbing",
  "Fire Protection",
];
const SOURCES = [
  "Field Observation",
  "Inspection",
  "Test Result",
  "Document Review",
  "Customer Request",
  "RFI Response",
  "Submittal Review",
  "Safety Audit",
];
const BLOCK_OPTIONS = [
  "Blocks L3 energization",
  "Blocks L4 load bank",
  "Blocks L5 IST",
  "Blocks substantial completion",
  "Blocks closeout",
];

const EMPTY_FORM = {
  title: "",
  description: "",
  kind: "GENERAL",
  priority: "MED",
  discipline: "Electrical",
  source: "Field Observation",
  projectId: "",
  projectAssetId: "",
  assignedToCompanyId: "",
  notifyCompany: "",
  assignedTo: "",
  slaOverride: "",
  blocksPhase: false,
  blocksNote: "Blocks L3 energization",
};

const KIND_DESCRIPTIONS = {
  GENERAL: "Generic issue",
  HOLD_POINT:
    "Work must stop — requires notified party to sign off before proceeding",
  WITNESS_POINT:
    "Notified party should observe test — work may continue if they are absent",
  PUNCH_LIST: "Pre-handover punch item",
  NCR: "Non-conformance — requires description + NCR workflow",
  SNAG: "Late-stage closeout deficiency",
};

function RaiseIssueModal({
  onClose,
  onSubmit,
  users,
  companies = [],
  companiesError = "",
  usersUnavailable = false,
  existingIssues = [],
  projects = [],
  initialKind,
}) {
  // Default the kind to the ?kind= deep-link (if it's a valid kind) so a
  // kind-scoped view raises that kind by default.
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    kind: ISSUE_KINDS.includes(initialKind) ? initialKind : EMPTY_FORM.kind,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [confirmClose, setConfirmClose] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Dirty if the user has typed/picked anything beyond the defaults (title or
  // description — the fields they'd lose). Used to warn before discarding.
  const isDirty = () =>
    !!form.title.trim() || !!(form.description && form.description.trim());

  // Route every close path (Escape, backdrop, X, Cancel) through here so an
  // unsaved entry prompts a confirm instead of silently vanishing (RHP_TC_057).
  const requestClose = () => {
    if (isDirty()) {
      setConfirmClose(true);
      return;
    }
    onClose();
  };

  // Close on Escape (RHP/RPI-054) — but warn first if there are unsaved changes.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // requestClose closes over form; re-bind when title/description change.
  }, [form.title, form.description]);

  // Project → V2 equipment. Linking equipment lets the issue gate its phase in
  // the Project Playbook (same behaviour as Issues/Add).
  useEffect(() => {
    setEquipment([]);
    setForm((f) => ({ ...f, projectAssetId: "" }));
    if (!form.projectId) return;
    let cancelled = false;
    listV2Assets(form.projectId, { limit: 100 })
      .then((res) => {
        if (!cancelled)
          setEquipment(Array.isArray(res) ? res : res?.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [form.projectId]);

  // createIssue needs at least a project. HOLD_POINT additionally requires a
  // responding company AND a notify company (the latter is marked required and
  // is the party that gets the sign-off notification), and NCR requires a
  // description (all enforced server-side too).
  const companyRequired =
    form.kind === "HOLD_POINT" &&
    (!form.assignedToCompanyId || !form.notifyCompany);
  const descriptionRequired = form.kind === "NCR" && !form.description.trim();

  // Block an obvious duplicate: same title (case-insensitive) on the same
  // project. Prevents accidentally raising the same Hold Point twice
  // (RHP_TC_059). Server still owns the source of truth; this is a UX guard.
  const trimmedTitle = form.title.trim();
  const isDuplicateTitle =
    !!trimmedTitle &&
    !!form.projectId &&
    existingIssues.some(
      (i) =>
        (i.cxProjectId === form.projectId || i.projectId === form.projectId) &&
        (i.title || "").trim().toLowerCase() === trimmedTitle.toLowerCase(),
    );

  const canSubmit =
    trimmedTitle &&
    form.projectId &&
    !companyRequired &&
    !descriptionRequired &&
    !isDuplicateTitle;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      // Parent surfaces the error toast; keep the modal open for a retry.
    } finally {
      setSubmitting(false);
    }
  };

  const inp = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    fontFamily: "inherit",
    border: "1px solid var(--rf-border)",
    background: "var(--rf-bg)",
    color: "var(--rf-txt)",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const lbl = {
    display: "block",
    fontSize: 10,
    fontWeight: 800,
    color: "var(--rf-txt3)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 6,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && requestClose()}
    >
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 680,
          boxShadow: "0 28px 56px rgba(0,0,0,0.35)",
          maxHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px 14px",
            borderBottom: "1px solid var(--rf-border)",
            flexShrink: 0,
          }}
        >
          <span
            style={{ fontSize: 15, fontWeight: 800, color: "var(--rf-txt)" }}
          >
            + Raise issue
          </span>
          <button
            onClick={requestClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--rf-txt3)",
              fontSize: 18,
              lineHeight: 1,
              padding: 2,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {/* Unsaved-changes confirm (RHP_TC_057) */}
          {confirmClose && (
            <div
              role="alertdialog"
              aria-label="Discard unsaved issue?"
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                borderRadius: 8,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.35)",
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
                Discard this issue? Your unsaved changes will be lost.
              </div>
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button
                  type="button"
                  onClick={() => setConfirmClose(false)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border: "1px solid var(--rf-border)",
                    background: "transparent",
                    color: "var(--rf-txt2)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 8,
                    border: "none",
                    background: "var(--rf-red)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Discard
                </button>
              </div>
            </div>
          )}
          {/* Issue Kind */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>ISSUE KIND</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 6,
                marginBottom: 8,
              }}
            >
              {ISSUE_KINDS.map((k) => {
                const active = form.kind === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => set("kind", k)}
                    style={{
                      padding: "7px 6px",
                      borderRadius: 7,
                      cursor: "pointer",
                      textAlign: "center",
                      border: active
                        ? "2px solid var(--rf-accent)"
                        : "1px solid var(--rf-border)",
                      background: active
                        ? "rgba(var(--rf-accent-rgb,99,102,241),0.12)"
                        : "var(--rf-bg3)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: active ? "var(--rf-accent)" : "var(--rf-txt)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {ISSUE_KIND_LABELS[k]}
                    </div>
                  </button>
                );
              })}
            </div>
            {form.kind && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  fontStyle: "italic",
                }}
              >
                {KIND_DESCRIPTIONS[form.kind]}
              </div>
            )}
          </div>

          {/* Notify company — required for HOLD_POINT, visible for WITNESS_POINT */}
          {(form.kind === "HOLD_POINT" || form.kind === "WITNESS_POINT") && (
            <div
              style={{
                marginBottom: 16,
                padding: "12px 14px",
                borderRadius: 8,
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.28)",
              }}
            >
              <label style={{ ...lbl, color: "var(--rf-yellow)" }}>
                NOTIFY COMPANY
                {form.kind === "HOLD_POINT" ? (
                  <span style={{ color: "var(--rf-red)" }}> *</span>
                ) : (
                  " (optional)"
                )}
              </label>
              <select
                value={form.notifyCompany}
                onChange={(e) => set("notifyCompany", e.target.value)}
                style={{
                  ...inp,
                  borderColor:
                    form.kind === "HOLD_POINT" && !form.notifyCompany
                      ? "rgba(239,68,68,0.4)"
                      : "var(--rf-border)",
                }}
              >
                {/* Store the company id (not the name) so the picked notify
                    company is actually sent to the backend and notified. */}
                <option value="">— Select company to notify —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div
                style={{ fontSize: 10, color: "var(--rf-txt3)", marginTop: 5 }}
              >
                {form.kind === "HOLD_POINT"
                  ? "This company must sign off before work resumes. They will be notified automatically."
                  : "This company will be invited to observe. Their absence will not block work."}
              </div>
              {/* Surface a failed/empty company load instead of leaving the user
                  stuck on an empty required dropdown. */}
              {companiesError ? (
                <div
                  role="alert"
                  style={{
                    fontSize: 11,
                    color: "var(--rf-red)",
                    marginTop: 6,
                    fontWeight: 600,
                  }}
                >
                  {companiesError}
                </div>
              ) : companies.length === 0 ? (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                    marginTop: 6,
                  }}
                >
                  No companies registered yet — add one in the Companies module
                  first.
                </div>
              ) : null}
            </div>
          )}

          {/* NCR description requirement hint */}
          {form.kind === "NCR" && (
            <div
              style={{
                marginBottom: 12,
                padding: "8px 12px",
                borderRadius: 7,
                background: "rgba(239,68,68,0.07)",
                border: "1px solid rgba(239,68,68,0.22)",
                fontSize: 11,
                color: "var(--rf-red)",
              }}
            >
              NCR requires a detailed description of the non-conformance. The
              issue will enter the NCR review workflow after creation.
            </div>
          )}

          {/* Title */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>
              TITLE <span style={{ color: "var(--rf-red)" }}>*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              maxLength={500}
              aria-label="Issue title"
              placeholder="Short summary · e.g. 'Torque marks missing on 3 lugs at PDU-B1'"
              style={{
                ...inp,
                borderColor:
                  !form.title.trim() || isDuplicateTitle
                    ? "rgba(239,68,68,0.3)"
                    : "var(--rf-border)",
              }}
            />
            {isDuplicateTitle && (
              <div
                role="alert"
                style={{
                  fontSize: 11,
                  color: "var(--rf-red)",
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                An open issue with this title already exists on this project.
              </div>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>DESCRIPTION</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={5000}
              aria-label="Issue description"
              placeholder="What was found · what was checked · investigation steps · next steps"
              rows={4}
              style={{ ...inp, resize: "vertical", lineHeight: 1.55 }}
            />
          </div>

          {/* Priority */}
          <div style={{ marginBottom: 18 }}>
            <label style={lbl}>PRIORITY</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {["CRIT", "HIGH", "MED", "LOW"].map((p) => {
                const active = form.priority === p;
                const activeBg = PRIORITY_ACTIVE_BG[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("priority", p)}
                    style={{
                      padding: "10px 4px",
                      borderRadius: 8,
                      cursor: "pointer",
                      textAlign: "center",
                      border: active
                        ? `2px solid ${activeBg}`
                        : "1px solid var(--rf-border)",
                      background: active ? activeBg : "var(--rf-bg3)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: active ? "#fff" : "var(--rf-txt)",
                        marginBottom: 2,
                      }}
                    >
                      {p}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: active
                          ? "rgba(255,255,255,0.75)"
                          : "var(--rf-txt3)",
                      }}
                    >
                      {PRIORITY_SLA[p]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discipline + Source */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div>
              <label style={lbl}>DISCIPLINE</label>
              <select
                value={form.discipline}
                onChange={(e) => set("discipline", e.target.value)}
                style={{ ...inp }}
              >
                {DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>SOURCE</label>
              <select
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
                style={{ ...inp }}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project (required to satisfy createIssue) */}
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>
              PROJECT <span style={{ color: "var(--rf-red)" }}>*</span>
            </label>
            <select
              value={form.projectId}
              onChange={(e) => set("projectId", e.target.value)}
              style={{
                ...inp,
                borderColor: !form.projectId
                  ? "rgba(239,68,68,0.3)"
                  : "var(--rf-border)",
              }}
            >
              <option value="">— Select project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.projectName}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment + Responder company */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div>
              <label style={lbl}>AFFECTED EQUIPMENT</label>
              <select
                value={form.projectAssetId}
                onChange={(e) => set("projectAssetId", e.target.value)}
                disabled={!form.projectId || !equipment.length}
                style={{ ...inp }}
              >
                <option value="">
                  {form.projectId
                    ? equipment.length
                      ? "— None —"
                      : "No equipment on project"
                    : "Select a project first"}
                </option>
                {equipment.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.abbr ? `${a.abbr} — ${a.name}` : a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>
                AFFECTED COMPANY{" "}
                <span style={{ textTransform: "none", fontSize: 9 }}>
                  (responder)
                  {form.kind === "HOLD_POINT" && (
                    <span style={{ color: "var(--rf-red)" }}> *</span>
                  )}
                </span>
              </label>
              <select
                value={form.assignedToCompanyId}
                onChange={(e) => set("assignedToCompanyId", e.target.value)}
                style={{
                  ...inp,
                  borderColor:
                    form.kind === "HOLD_POINT" && !form.assignedToCompanyId
                      ? "rgba(239,68,68,0.4)"
                      : "var(--rf-border)",
                }}
              >
                <option value="">— Select responding company —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.type ? ` (${c.type})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Assigned to + SLA override */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 16,
            }}
          >
            <div>
              <label style={lbl}>
                ASSIGNED TO{" "}
                <span style={{ textTransform: "none", fontSize: 9 }}>
                  (specific person)
                </span>
              </label>
              <select
                value={form.assignedTo}
                onChange={(e) => set("assignedTo", e.target.value)}
                style={{ ...inp }}
              >
                <option value="">— None · let company assign —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
              {usersUnavailable && (
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--rf-txt3)",
                    marginTop: 4,
                  }}
                >
                  Direct assignment to a person needs admin access — leave as
                  &ldquo;None&rdquo; and the responsible company will assign.
                </div>
              )}
            </div>
            <div>
              <label style={lbl}>
                SLA OVERRIDE{" "}
                <span style={{ textTransform: "none", fontSize: 9 }}>
                  (hrs · QA only)
                </span>
              </label>
              <input
                type="text"
                value={form.slaOverride}
                onChange={(e) => set("slaOverride", e.target.value)}
                placeholder="Defaults from priority"
                style={{ ...inp }}
              />
            </div>
          </div>

          {/* Blocks phase */}
          <div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                userSelect: "none",
                marginBottom: form.blocksPhase ? 10 : 0,
              }}
            >
              <input
                type="checkbox"
                checked={form.blocksPhase}
                onChange={(e) => set("blocksPhase", e.target.checked)}
                style={{
                  width: 15,
                  height: 15,
                  cursor: "pointer",
                  accentColor: "var(--rf-accent)",
                }}
              />
              <span style={{ fontSize: 13, color: "var(--rf-txt2)" }}>
                This issue{" "}
                <strong style={{ color: "var(--rf-txt)" }}>
                  blocks phase advancement
                </strong>{" "}
                until resolved
              </span>
            </label>
            {form.blocksPhase && (
              <select
                value={form.blocksNote}
                onChange={(e) => set("blocksNote", e.target.value)}
                style={{ ...inp, marginTop: 4 }}
              >
                {BLOCK_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 24px",
            borderTop: "1px solid var(--rf-border)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={requestClose}
            style={{
              padding: "9px 20px",
              borderRadius: 9,
              border: "1px solid var(--rf-border)",
              background: "transparent",
              color: "var(--rf-txt2)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              padding: "9px 22px",
              borderRadius: 9,
              border: "none",
              background: canSubmit ? "var(--rf-accent)" : "var(--rf-bg3)",
              color: canSubmit ? "#fff" : "var(--rf-txt3)",
              cursor: canSubmit ? "pointer" : "default",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 7,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <span></span> {submitting ? "Raising..." : "Raise issue"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalShell({ onClose, children, width = 440 }) {
  return (
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
        zIndex: 1000,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 14,
          padding: 24,
          width: "100%",
          maxWidth: width,
          boxShadow: "0 24px 48px rgba(0,0,0,0.28)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 2000,
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        background: "var(--rf-bg2)",
        border: `1px solid ${message.type === "success" ? "var(--rf-green)" : "var(--rf-red)"}`,
        color: message.type === "success" ? "var(--rf-green)" : "var(--rf-red)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      }}
    >
      {message.type === "success" ? "" : ""} {message.text}
    </div>
  );
}

// Page heading per ?kind= deep-link. Falls back to the generic Issues header
// when no (or an unknown) kind is supplied.
const KIND_PAGE = {
  GENERAL: {
    title: "Issues",
    subtitle: "Day-to-day field issues",
    action: "Raise Issue",
  },
  PUNCH_LIST: {
    title: "Punch List",
    subtitle: "Pre-handover punch items",
    action: "Raise Punch List",
  },
  HOLD_POINT: {
    title: "Hold Points",
    subtitle: "Work stops until the notified party signs off",
    action: "Raise Hold Point",
  },
  WITNESS_POINT: {
    title: "Witness Points",
    subtitle: "Notified party observes — work may continue",
    action: "Raise Witness Point",
  },
  NCR: {
    title: "NCRs",
    subtitle: "Non-conformance reports & dispositions",
    action: "Raise NCR",
  },
  SNAG: {
    title: "Snags",
    subtitle: "Late-stage closeout deficiencies",
    action: "Raise Snag",
  },
};
const DEFAULT_PAGE = {
  title: "Issues",
  subtitle: "Day-to-day field issues",
  action: "Raise Issue",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function IssuesList() {
  const searchparams = useSearchParams();
  const issueKind = searchparams.get("kind");
  const page = KIND_PAGE[issueKind] || DEFAULT_PAGE;
  const { user, canCreate, canEdit, canDelete, canApprove } =
    useUserPermissions();

  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companiesError, setCompaniesError] = useState("");
  const [usersUnavailable, setUsersUnavailable] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Filters
  const [activeTab, setActiveTab] = useState("all_open");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDiscipline, setFilterDiscipline] = useState("");

  // Modals
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [verifyModal, setVerifyModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignForm, setAssignForm] = useState({
    assignedToUserId: "",
    assignedToCompanyId: "",
  });
  const [verifyForm, setVerifyForm] = useState({ closeVerifiedBy: "" });

  // RBAC-scoped people pickers (replace the admin-only full-user list, which
  // 403s for project roles and left the Verify/Assign dropdowns empty):
  //  • verifiers  = users with issue approve authority (org-wide)
  //  • assignees  = the issue's project team, fetched per-issue on open
  const [verifiers, setVerifiers] = useState([]);
  const [assignees, setAssignees] = useState([]);
  // The current user may verify & close only if they hold issue-approve
  // authority — i.e. they appear in the eligible-verifiers list. Gates the
  // "Close" (Verify & Close) button so non-verifiers don't hit a 403.
  const canVerifyIssues = !!user?.id && verifiers.some((v) => v.id === user.id);

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
    fetchProjects();
    fetchVerifiers();
  }, []);

  const fetchVerifiers = async () => {
    try {
      const res = await getEligibleVerifiers();
      setVerifiers(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setVerifiers([]);
    }
  };

  // Load the project team for the assign picker whenever an assign modal opens.
  useEffect(() => {
    const pid = assignModal?.cxProjectId;
    if (!pid) {
      setAssignees([]);
      return;
    }
    let alive = true;
    getIssueAssignees(pid)
      .then((res) => {
        if (alive) setAssignees(Array.isArray(res) ? res : res?.data || []);
      })
      .catch(() => {
        if (alive) setAssignees([]);
      });
    return () => {
      alive = false;
    };
  }, [assignModal]);

  // Re-normalize issues once the users list is available so assignee/raiser
  // names resolve (fetchUsers and fetchIssues race on mount). Also refetch when
  // the ?kind= deep-link changes so the server-side filter follows the URL.
  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, issueKind]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const usersById = Object.fromEntries((users || []).map((u) => [u.id, u]));
      const params = { limit: 100 };
      if (issueKind) params.kind = issueKind;
      const res = await getIssues(params);
      const raw = Array.isArray(res) ? res : res?.data || [];
      setIssues(raw.map((it) => normalizeIssue(it, usersById)));
    } catch {
      // Backend unreachable — keep the mock sample so the screen is still usable.
      setIssues([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : res?.data || []);
      setUsersUnavailable(false);
    } catch {
      // The user directory is company-admin-only, so a project-only role gets a
      // 403 here. "Assigned To" is optional (a company can self-assign), so this
      // isn't fatal — but flag it so the dropdown explains the empty list
      // instead of looking broken.
      setUsers([]);
      setUsersUnavailable(true);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await getCompanies();
      setCompanies(Array.isArray(res) ? res : res?.data || []);
      setCompaniesError("");
    } catch (err) {
      // Don't silently swallow — a HOLD_POINT requires picking a company, so an
      // empty dropdown with no explanation leaves the user stuck. Surface it.
      setCompanies([]);
      setCompaniesError(
        err?.response?.status === 403
          ? "You don't have permission to view companies. Ask an admin for Contacts access."
          : "Couldn't load companies. Please try again.",
      );
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await listV2Projects({ limit: 100 });
      setProjects(Array.isArray(res) ? res : res?.data || []);
    } catch {}
  };

  // Returns true on success / false on failure so callers can keep a modal open
  // (and not show a false "done") when the action was rejected.
  const withAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      setMessage({ type: "success", text: successMsg });
      await fetchIssues();
      return true;
    } catch (err) {
      // Surface the specific backend field errors instead of a generic message.
      const fieldErrs =
        err?.errors && typeof err.errors === "object"
          ? Object.values(err.errors).flat().filter(Boolean)
          : [];
      const text = fieldErrs.length
        ? fieldErrs.join(" ")
        : err?.message || "Action failed";
      setMessage({ type: "error", text });
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    await withAction(
      () =>
        changeIssueStatus(statusModal.issue.id, {
          status: statusModal.nextStatus,
        }),
      `Status changed to "${STATUS_LABEL[statusModal.nextStatus] || statusModal.nextStatus}"`,
    );
    setStatusModal(null);
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    const ok = await withAction(
      () =>
        assignIssue(assignModal.id, {
          assignedToUserId: assignForm.assignedToUserId || null,
          assignedToCompanyId: assignForm.assignedToCompanyId || null,
        }),
      "Issue assigned successfully",
    );
    if (!ok) return;
    setAssignModal(null);
    setAssignForm({ assignedToUserId: "", assignedToCompanyId: "" });
  };

  const handleVerifyClose = async () => {
    if (!verifyModal || !verifyForm.closeVerifiedBy) return;
    const ok = await withAction(
      () =>
        verifyAndCloseIssue(verifyModal.id, {
          closeVerifiedBy: verifyForm.closeVerifiedBy,
        }),
      "Issue verified and closed",
    );
    // Keep the modal open on failure so the error is visible and retryable.
    if (!ok) return;
    setVerifyModal(null);
    setVerifyForm({ closeVerifiedBy: "" });
  };

  const handleDelete = async (id) => {
    await withAction(() => deleteIssue(id), "Issue deleted");
    setDeleteConfirm(null);
  };

  // ── Filter logic ────────────────────────────────────────────────────────────
  const myUserId = user?.id;
  const myCompanyId = user?.companyId || user?.company?.id;
  const overdue = issues.filter((i) => i.isOverdue && i.status !== "CLOSED");
  const mine = issues.filter(
    (i) => i.assignedToUserId === myUserId && i.status !== "CLOSED",
  );
  const myCompany = issues.filter(
    (i) => i.assignedToCompanyId === myCompanyId && i.status !== "CLOSED",
  );
  const allOpen = issues.filter((i) => i.status !== "CLOSED");

  const tabBase =
    activeTab === "mine"
      ? mine
      : activeTab === "my_company"
        ? myCompany
        : activeTab === "overdue"
          ? overdue
          : allOpen;

  const filtered = tabBase.filter((i) => {
    const mp = !filterPriority || i.priority === filterPriority;
    const ms = !filterStatus || i.status === filterStatus;
    const md = !filterDiscipline || i.discipline === filterDiscipline;
    const mk = !issueKind || i.kind === issueKind;
    return mp && ms && md && mk;
  });

  const disciplines = [
    ...new Set(issues.map((i) => i.discipline).filter(Boolean)),
  ];

  const tabs = [
    { key: "all_open", label: "All open", count: allOpen.length },
    { key: "mine", label: "Mine", count: mine.length },
    { key: "my_company", label: "My company", count: myCompany.length },
    { key: "overdue", label: "Overdue", count: overdue.length, alert: true },
  ];

  const selStyle = {
    padding: "6px 10px",
    borderRadius: 7,
    border: "1px solid var(--rf-border)",
    background: "var(--rf-bg2)",
    color: "var(--rf-txt2)",
    fontSize: 12,
    fontFamily: "inherit",
    cursor: "pointer",
    outline: "none",
  };

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      <Toast message={message} onDone={() => setMessage(null)} />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 4,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: "var(--rf-txt)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span></span> {page.title}
          </h1>
          <p
            style={{ margin: "5px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}
          >
            {page.subtitle} · {issues.length} total · {overdue.length} overdue
          </p>
        </div>
        <button
          onClick={() => setShowRaiseModal(true)}
          {...permissionProps(canCreate(MODULE.RMA_RCA), "raise an issue")}
          style={{
            padding: "9px 18px",
            borderRadius: 9,
            border: "none",
            background: "var(--rf-accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + {page.action}
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--rf-border)",
          marginTop: 18,
          marginBottom: 14,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "9px 16px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: activeTab === t.key ? 700 : 500,
              color:
                activeTab === t.key ? "var(--rf-accent)" : "var(--rf-txt2)",
              borderBottom:
                activeTab === t.key
                  ? "2px solid var(--rf-accent)"
                  : "2px solid transparent",
              marginBottom: -1,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {t.alert && <span style={{ fontSize: 12 }}>⏱</span>}
            {t.label}
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                minWidth: 18,
                height: 18,
                borderRadius: 99,
                padding: "0 4px",
                background:
                  t.alert && t.count > 0 ? "var(--rf-red)" : "var(--rf-bg3)",
                color: t.alert && t.count > 0 ? "#fff" : "var(--rf-txt3)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Filter row ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          FILTER:
        </span>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={selStyle}
        >
          <option value="">All priorities</option>
          {["CRIT", "HIGH", "MED", "LOW"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={selStyle}
        >
          <option value="">All statuses</option>
          {[
            "NEW",
            "IN_PROGRESS",
            "READY_FOR_VERIFICATION",
            "CLOSED",
            "DEFERRED",
          ].map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s] || s}
            </option>
          ))}
        </select>
        <select
          value={filterDiscipline}
          onChange={(e) => setFilterDiscipline(e.target.value)}
          style={selStyle}
        >
          <option value="">All disciplines</option>
          {disciplines.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <span
          style={{ marginLeft: "auto", fontSize: 12, color: "var(--rf-txt3)" }}
        >
          Showing {filtered.length} of {issues.length}
        </span>
      </div>

      {/* ── Issue cards ────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--rf-txt3)",
            fontSize: 13,
          }}
        >
          Loading {page.title}...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--rf-txt3)",
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}></div>
          No {page.title} match the current filter.
        </div>
      ) : (
        <div>
          {filtered.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              canVerify={canVerifyIssues}
              onStatusChange={(iss, next) =>
                setStatusModal({ issue: iss, nextStatus: next })
              }
              onAssign={(iss) => {
                setAssignModal(iss);
                setAssignForm({
                  assignedToUserId: iss.assignedToUserId || "",
                  assignedToCompanyId: iss.assignedToCompanyId || "",
                });
              }}
              onVerify={(iss) => setVerifyModal(iss)}
              onDelete={(iss) => setDeleteConfirm(iss.id)}
            />
          ))}
        </div>
      )}

      {/* ── Status change modal ────────────────────────────────────── */}
      {statusModal && (
        <ModalShell onClose={() => setStatusModal(null)}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Change Status
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: "var(--rf-txt3)",
            }}
          >
            Move &ldquo;{statusModal.issue.title}&rdquo; →{" "}
            <strong style={{ color: "var(--rf-txt)" }}>
              {STATUS_LABEL[statusModal.nextStatus] || statusModal.nextStatus}
            </strong>
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setStatusModal(null)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "transparent",
                color: "var(--rf-txt2)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleStatusChange}
              disabled={actionLoading}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "var(--rf-accent)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              {actionLoading ? "Updating..." : "Confirm"}
            </button>
          </div>
        </ModalShell>
      )}

      {/* ── Assign modal ───────────────────────────────────────────── */}
      {assignModal && (
        <ModalShell onClose={() => setAssignModal(null)}>
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Assign Issue
          </h3>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: 12,
              color: "var(--rf-txt3)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {assignModal.title}
          </p>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 5,
            }}
          >
            Assign to User
          </label>
          <select
            value={assignForm.assignedToUserId}
            onChange={(e) =>
              setAssignForm({ ...assignForm, assignedToUserId: e.target.value })
            }
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--rf-border)",
              background: "var(--rf-bg3)",
              color: "var(--rf-txt)",
              fontSize: 13,
              fontFamily: "inherit",
              marginBottom: 20,
            }}
          >
            <option value="">No user assigned</option>
            {(() => {
              // Always include the issue's current assignee as an option so the
              // pre-selection renders even if they aren't (or are no longer) in
              // the fetched project team.
              const list = [...assignees];
              const curId = assignModal?.assignedToUserId;
              if (curId && !list.some((u) => u.id === curId)) {
                const name = assignModal?.assignedTo;
                const [firstName, ...rest] = (name || "Current assignee").split(
                  " ",
                );
                list.unshift({
                  id: curId,
                  firstName,
                  lastName: rest.join(" "),
                  roleName: null,
                });
              }
              return list.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName}
                  {u.roleName ? ` · ${u.roleName}` : ""}
                </option>
              ));
            })()}
          </select>
          {assignModal?.cxProjectId && assignees.length === 0 && (
            <div
              style={{
                fontSize: 11,
                color: "var(--rf-txt3)",
                marginTop: -12,
                marginBottom: 16,
              }}
            >
              No team members are assigned to this issue&rsquo;s project yet.
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setAssignModal(null)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "transparent",
                color: "var(--rf-txt2)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={actionLoading}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "var(--rf-yellow)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              {actionLoading ? "Assigning..." : "Save"}
            </button>
          </div>
        </ModalShell>
      )}

      {/* ── Verify & close modal ───────────────────────────────────── */}
      {verifyModal && (
        <ModalShell
          onClose={() => {
            setVerifyModal(null);
            setVerifyForm({ closeVerifiedBy: "" });
          }}
        >
          <h3
            style={{
              margin: "0 0 6px",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Verify & Close Issue
          </h3>
          <p
            style={{
              margin: "0 0 18px",
              fontSize: 12,
              color: "var(--rf-txt3)",
            }}
          >
            This action is irreversible — sets resolvedAt timestamp.
          </p>
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "var(--rf-bg3)",
              border: "1px solid var(--rf-border)",
              fontSize: 12,
              color: "var(--rf-txt2)",
              marginBottom: 18,
            }}
          >
            {verifyModal.title}
          </div>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 5,
            }}
          >
            Verified By *
          </label>
          <select
            value={verifyForm.closeVerifiedBy}
            onChange={(e) => setVerifyForm({ closeVerifiedBy: e.target.value })}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--rf-border)",
              background: "var(--rf-bg3)",
              color: "var(--rf-txt)",
              fontSize: 13,
              fontFamily: "inherit",
              marginBottom: 20,
            }}
          >
            <option value="">Select verifier...</option>
            {verifiers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
                {u.roleName ? ` · ${u.roleName}` : ""}
              </option>
            ))}
          </select>
          {verifiers.length === 0 && (
            <div
              style={{
                fontSize: 11,
                color: "var(--rf-txt3)",
                marginTop: -12,
                marginBottom: 16,
              }}
            >
              No one in your organization has issue-verification authority yet.
              An admin must grant it before issues can be verified &amp; closed.
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => {
                setVerifyModal(null);
                setVerifyForm({ closeVerifiedBy: "" });
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "transparent",
                color: "var(--rf-txt2)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleVerifyClose}
              disabled={actionLoading || !verifyForm.closeVerifiedBy}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "var(--rf-green)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                opacity: actionLoading || !verifyForm.closeVerifiedBy ? 0.5 : 1,
              }}
            >
              {actionLoading ? "Closing..." : "Verify & Close"}
            </button>
          </div>
        </ModalShell>
      )}

      {/* ── Raise issue modal ──────────────────────────────────────── */}
      {showRaiseModal && (
        <RaiseIssueModal
          onClose={() => setShowRaiseModal(false)}
          users={users}
          companies={companies}
          companiesError={companiesError}
          usersUnavailable={usersUnavailable}
          existingIssues={issues}
          projects={projects}
          initialKind={issueKind}
          onSubmit={async (form) => {
            const payload = {
              kind: form.kind,
              title: form.title.trim(),
              description: form.description?.trim() || undefined,
              severity: PRIORITY_TO_SEVERITY[form.priority] || "MEDIUM",
            };
            if (form.projectId) payload.cxProjectId = form.projectId;
            if (form.projectAssetId)
              payload.projectAssetId = form.projectAssetId;
            if (form.assignedToCompanyId)
              payload.assignedToCompanyId = form.assignedToCompanyId;
            // Notify the company the user explicitly picked in NOTIFY COMPANY
            // (form.notifyCompany now holds its id). Fall back to the responder
            // company only if no separate notify company was chosen.
            const notifyId = form.notifyCompany || form.assignedToCompanyId;
            if (notifyId) payload.notifyCompanyId = notifyId;
            if (form.assignedTo) payload.assignedToUserId = form.assignedTo;
            try {
              await createIssue(payload);
              setMessage({
                type: "success",
                text: "Issue raised successfully",
              });
              await fetchIssues();
            } catch (err) {
              // Surface the SPECIFIC field errors the backend returned instead
              // of the generic "Some fields have errors" message, so the user
              // knows what to fix.
              const fieldErrs = err?.errors && typeof err.errors === "object"
                ? Object.values(err.errors)
                    .flat()
                    .filter(Boolean)
                : [];
              const text = fieldErrs.length
                ? fieldErrs.join(" ")
                : err?.message || "Failed to raise issue";
              setMessage({ type: "error", text });
              throw err; // keep the modal open so the user can retry
            }
          }}
        />
      )}

      {/* ── Delete confirm ─────────────────────────────────────────── */}
      {deleteConfirm && (
        <ModalShell onClose={() => setDeleteConfirm(null)} width={480}>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Delete Issue?
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 13,
              color: "var(--rf-txt3)",
            }}
          >
            Only NEW issues can be deleted. This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setDeleteConfirm(null)}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "transparent",
                color: "var(--rf-txt2)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(deleteConfirm)}
              disabled={actionLoading}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                background: "var(--rf-red)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 700,
                opacity: actionLoading ? 0.6 : 1,
              }}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
