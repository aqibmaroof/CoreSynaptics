"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getIssues,
  changeIssueStatus,
  assignIssue,
  verifyAndCloseIssue,
  deleteIssue,
  ISSUE_KINDS,
  ISSUE_KIND_LABELS,
  NCR_SUB_STATUS_LABELS,
  NCR_SUB_STATUSES,
} from "@/services/Issues";
import { getUsers } from "@/services/Users";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

// ─── Mock fallback data (matches screenshot) ──────────────────────────────────

const MOCK_ISSUES = [
  {
    id: "i1",
    num: "ISS-2026-001",
    priority: "CRIT",
    title: "Refrigerant leak detected · DH01-CRAC-03 schrader valve",
    discipline: "MECHANICAL",
    asset: "CRAC-03",
    company: "McKinstry",
    assigneeCompany: "Stulz Vendor",
    checklistRef: "Checklist · L2.05d MC Pre-Energ",
    comments: 3,
    blocker: "BLOCKS L3",
    status: "IN_PROGRESS",
    isOverdue: true,
    overdueHours: 144,
    sla: "24h",
    raisedBy: "Anna Petrov",
    raisedDate: "May 02",
    assignedTo: "Eli Kim",
  },
  {
    id: "i2",
    num: "ISS-2026-003",
    priority: "CRIT",
    title: "Temporary electrical cables not rated for outdoor use",
    discipline: "ELECTRICAL",
    asset: null,
    company: "Rosendin Electric",
    assigneeCompany: null,
    checklistRef: "Inspection",
    comments: 0,
    blocker: null,
    status: "OPEN",
    isOverdue: true,
    overdueHours: 120,
    sla: "24h",
    raisedBy: "Mike Davis",
    raisedDate: "May 03",
    assignedTo: "Rob Pryke",
  },
  {
    id: "i3",
    num: "ISS-2026-007",
    priority: "HIGH",
    title: "Megger reading low on UPS-A1 input cable",
    discipline: "ELECTRICAL",
    asset: "UPS-A1",
    company: "Rosendin Electric",
    assigneeCompany: "Inglett & Stubbs",
    checklistRef: "Checklist · L2.05a EC Pre-Energ",
    comments: 2,
    blocker: null,
    status: "CX_VERIFIED",
    isOverdue: false,
    overdueHours: null,
    sla: "48h",
    raisedBy: "Rob Pryke",
    raisedDate: "May 04",
    assignedTo: "Rob Pryke",
  },
  {
    id: "i4",
    num: "ISS-2026-010",
    priority: "HIGH",
    title: "IT rack burn-in cert not received",
    discipline: "VENDOR",
    asset: null,
    company: "Delta Electronics",
    assigneeCompany: null,
    checklistRef: "Checklist · L1 Factory Test",
    comments: 0,
    blocker: null,
    status: "CLOSED",
    isOverdue: false,
    overdueHours: null,
    sla: "48h",
    raisedBy: "Carol Reyes",
    raisedDate: "May 05",
    assignedTo: "Chris Beauchamp",
  },
  {
    id: "i5",
    num: "ISS-2026-006",
    priority: "MED",
    title: "Phase imbalance 4.2% during energization · PDU-A1",
    discipline: "ELECTRICAL",
    asset: "PDU-A1",
    company: "Shermco Industries",
    assigneeCompany: "Shermco Industries",
    checklistRef: "Checklist · L3 Energization",
    comments: 0,
    blocker: null,
    status: "OPEN",
    isOverdue: false,
    timeLeft: "8h left",
    sla: "72h",
    raisedBy: "Adam Krol",
    raisedDate: "May 06",
    assignedTo: "Fiona Walsh",
  },
  {
    id: "i6",
    num: "ISS-2026-012",
    priority: "HIGH",
    title: "BMS point-to-point mismatch on Level 4 AHU-04",
    discipline: "BMS",
    asset: "AHU-04",
    company: "Schneider Building Auto",
    assigneeCompany: null,
    checklistRef: "Checklist · L4 Pre-Commissioning",
    comments: 1,
    blocker: null,
    status: "OPEN",
    isOverdue: true,
    overdueHours: 48,
    sla: "48h",
    raisedBy: "Carol Reyes",
    raisedDate: "May 04",
    assignedTo: "Tom Greene",
  },
  {
    id: "i7",
    num: "ISS-2026-014",
    priority: "LOW",
    title: "Missing safety sign-in sheets — Week 19 toolbox talks",
    discipline: "SAFETY",
    asset: null,
    company: "HITT Contracting",
    assigneeCompany: null,
    checklistRef: "Safety Compliance · Week 19",
    comments: 0,
    blocker: null,
    status: "OPEN",
    isOverdue: false,
    timeLeft: "72h left",
    sla: "96h",
    raisedBy: "David Park",
    raisedDate: "May 07",
    assignedTo: "David Park",
  },
  {
    id: "i8",
    num: "ISS-2026-015",
    priority: "MED",
    title: "RFI-042 response overdue — structural penetration seal",
    discipline: "STRUCTURAL",
    asset: null,
    company: "HITT Contracting",
    assigneeCompany: null,
    checklistRef: "RFI · L3 Structural",
    comments: 0,
    blocker: null,
    status: "OPEN",
    isOverdue: true,
    overdueHours: 36,
    sla: "72h",
    raisedBy: "Sarah Chen",
    raisedDate: "May 05",
    assignedTo: "Joe Martinez",
  },
  {
    id: "i9",
    num: "ISS-2026-016",
    priority: "CRIT",
    title: "Arc flash label missing on MDB-L3 switchgear",
    discipline: "SAFETY",
    asset: "MDB-L3",
    company: "HITT Contracting",
    assigneeCompany: null,
    checklistRef: "Safety · Pre-Energization L3",
    comments: 0,
    blocker: "BLOCKS ENERGIZE",
    status: "OPEN",
    isOverdue: true,
    overdueHours: 96,
    sla: "24h",
    raisedBy: "Priya Nair",
    raisedDate: "May 06",
    assignedTo: "Joe Martinez",
  },
  {
    id: "i10",
    num: "ISS-2026-017",
    priority: "MED",
    title: "Load bank cable routing conflicts with L5 cable tray",
    discipline: "ELECTRICAL",
    asset: "L5-CABLE-TRAY",
    company: "Delta Electrical",
    assigneeCompany: "Inglett & Stubbs",
    checklistRef: "Checklist · L5 IST Readiness",
    comments: 4,
    blocker: null,
    status: "OPEN",
    isOverdue: false,
    timeLeft: "24h left",
    sla: "72h",
    raisedBy: "Tom Greene",
    raisedDate: "May 08",
    assignedTo: "Mike Torres",
  },
];

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

const mergeWithMock = (apiData) => {
  if (!apiData.length) return MOCK_ISSUES;
  return apiData.map((issue, i) => ({
    ...MOCK_ISSUES[i % MOCK_ISSUES.length],
    ...issue,
    num:
      issue.issueNumber || issue.num || MOCK_ISSUES[i % MOCK_ISSUES.length].num,
    priority:
      issue.severity === "CRITICAL"
        ? "CRIT"
        : issue.severity === "MEDIUM"
          ? "MED"
          : issue.severity || "MED",
    discipline:
      issue.discipline || MOCK_ISSUES[i % MOCK_ISSUES.length].discipline,
  }));
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

function IssueCard({ issue, onStatusChange, onAssign, onVerify, onDelete }) {
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
            {issue.checklistRef && (
              <Chip label={issue.checklistRef} icon="" />
            )}
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
              <div style={{ fontSize: 9, fontWeight: 800, color: "var(--rf-txt3)", letterSpacing: "0.06em", marginBottom: 4 }}>NCR PROGRESS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {NCR_SUB_STATUSES.map((step) => {
                  const stepIdx = NCR_SUB_STATUSES.indexOf(step);
                  const curIdx = NCR_SUB_STATUSES.indexOf(issue.ncrSubStatus);
                  const done = stepIdx < curIdx;
                  const active = stepIdx === curIdx;
                  return (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        background: done ? "var(--rf-green)" : active ? "var(--rf-accent)" : "var(--rf-border)",
                      }} />
                      <span style={{
                        fontSize: 9,
                        fontWeight: active ? 800 : 500,
                        color: done ? "var(--rf-green)" : active ? "var(--rf-accent)" : "var(--rf-txt3)",
                        whiteSpace: "nowrap",
                      }}>
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
            {issue.status === "READY_FOR_VERIFICATION" && (
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
const ASSETS_LIST = [
  "— None —",
  "CRAC-03",
  "UPS-A1",
  "PDU-A1",
  "AHU-04",
  "MDB-L3",
  "L5-CABLE-TRAY",
  "UPS-Rm-B",
  "DH01",
  "MSB-L4",
];
const COMPANIES_LIST = [
  "— Select responding company —",
  "HITT Contracting",
  "McKinstry",
  "Rosendin Electric",
  "Delta Electronics",
  "Shermco Industries",
  "Schneider Building Auto",
  "CxA Group",
  "Vertiv",
  "Caterpillar",
  "Inglett & Stubbs",
  "Stulz Vendor",
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
  asset: "— None —",
  responderCompany: "— Select responding company —",
  notifyCompany: "— Select company to notify —",
  assignedTo: "",
  slaOverride: "",
  blocksPhase: false,
  blocksNote: "Blocks L3 energization",
};

const KIND_DESCRIPTIONS = {
  GENERAL: "Generic issue",
  HOLD_POINT: "Work must stop — requires notified party to sign off before proceeding",
  WITNESS_POINT: "Notified party should observe test — work may continue if they are absent",
  PUNCH_LIST: "Pre-handover punch item",
  NCR: "Non-conformance — requires description + NCR workflow",
  SNAG: "Late-stage closeout deficiency",
};

function RaiseIssueModal({ onClose, onSubmit, users }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const notifyRequired = form.kind === "HOLD_POINT" && form.notifyCompany === "— Select company to notify —";
  const canSubmit = form.title.trim() && !notifyRequired;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    await onSubmit(form);
    setSubmitting(false);
    onClose();
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
      onClick={(e) => e.target === e.currentTarget && onClose()}
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
            onClick={onClose}
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
          {/* Issue Kind */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>ISSUE KIND</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 8 }}>
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
                      border: active ? "2px solid var(--rf-accent)" : "1px solid var(--rf-border)",
                      background: active ? "rgba(var(--rf-accent-rgb,99,102,241),0.12)" : "var(--rf-bg3)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 800, color: active ? "var(--rf-accent)" : "var(--rf-txt)", letterSpacing: "0.03em" }}>
                      {ISSUE_KIND_LABELS[k]}
                    </div>
                  </button>
                );
              })}
            </div>
            {form.kind && (
              <div style={{ fontSize: 11, color: "var(--rf-txt3)", fontStyle: "italic" }}>
                {KIND_DESCRIPTIONS[form.kind]}
              </div>
            )}
          </div>

          {/* Notify company — required for HOLD_POINT, visible for WITNESS_POINT */}
          {(form.kind === "HOLD_POINT" || form.kind === "WITNESS_POINT") && (
            <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.28)" }}>
              <label style={{ ...lbl, color: "var(--rf-yellow)" }}>
                NOTIFY COMPANY{form.kind === "HOLD_POINT" ? <span style={{ color: "var(--rf-red)" }}> *</span> : " (optional)"}
              </label>
              <select
                value={form.notifyCompany}
                onChange={(e) => set("notifyCompany", e.target.value)}
                style={{
                  ...inp,
                  borderColor: form.kind === "HOLD_POINT" && form.notifyCompany === "— Select company to notify —" ? "rgba(239,68,68,0.4)" : "var(--rf-border)",
                }}
              >
                <option value="— Select company to notify —">— Select company to notify —</option>
                {COMPANIES_LIST.slice(1).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div style={{ fontSize: 10, color: "var(--rf-txt3)", marginTop: 5 }}>
                {form.kind === "HOLD_POINT"
                  ? "This company must sign off before work resumes. They will be notified automatically."
                  : "This company will be invited to observe. Their absence will not block work."}
              </div>
            </div>
          )}

          {/* NCR description requirement hint */}
          {form.kind === "NCR" && (
            <div style={{ marginBottom: 12, padding: "8px 12px", borderRadius: 7, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)", fontSize: 11, color: "var(--rf-red)" }}>
              NCR requires a detailed description of the non-conformance. The issue will enter the NCR review workflow after creation.
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
              placeholder="Short summary · e.g. 'Torque marks missing on 3 lugs at PDU-B1'"
              style={{
                ...inp,
                borderColor: !form.title.trim()
                  ? "rgba(239,68,68,0.3)"
                  : "var(--rf-border)",
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>DESCRIPTION</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
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

          {/* Asset + Responder company */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div>
              <label style={lbl}>AFFECTED ASSET</label>
              <select
                value={form.asset}
                onChange={(e) => set("asset", e.target.value)}
                style={{ ...inp }}
              >
                {ASSETS_LIST.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={lbl}>
                AFFECTED COMPANY{" "}
                <span style={{ textTransform: "none", fontSize: 9 }}>
                  (responder)
                </span>
              </label>
              <select
                value={form.responderCompany}
                onChange={(e) => set("responderCompany", e.target.value)}
                style={{ ...inp }}
              >
                {COMPANIES_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
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
            onClick={onClose}
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
              background: canSubmit
                ? "var(--rf-accent)"
                : "var(--rf-bg3)",
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function IssuesList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete, canApprove } = useUserPermissions();

  const [issues, setIssues] = useState(MOCK_ISSUES);
  const [users, setUsers] = useState([]);
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

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await getIssues();
      const raw = Array.isArray(res) ? res : res?.data || [];
      setIssues(raw.length ? mergeWithMock(raw) : MOCK_ISSUES);
    } catch {
      setIssues(MOCK_ISSUES);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : res?.data || []);
    } catch {}
  };

  const withAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      setMessage({ type: "success", text: successMsg });
      await fetchIssues();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Action failed" });
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
    await withAction(
      () =>
        assignIssue(assignModal.id, {
          assignedToUserId: assignForm.assignedToUserId || null,
          assignedToCompanyId: assignForm.assignedToCompanyId || null,
        }),
      "Issue assigned successfully",
    );
    setAssignModal(null);
    setAssignForm({ assignedToUserId: "", assignedToCompanyId: "" });
  };

  const handleVerifyClose = async () => {
    if (!verifyModal || !verifyForm.closeVerifiedBy) return;
    await withAction(
      () =>
        verifyAndCloseIssue(verifyModal.id, {
          closeVerifiedBy: verifyForm.closeVerifiedBy,
        }),
      "Issue verified and closed",
    );
    setVerifyModal(null);
    setVerifyForm({ closeVerifiedBy: "" });
  };

  const handleDelete = async (id) => {
    await withAction(() => deleteIssue(id), "Issue deleted");
    setDeleteConfirm(null);
  };

  // ── Filter logic ────────────────────────────────────────────────────────────
  const overdue = issues.filter((i) => i.isOverdue && i.status !== "CLOSED");
  const mine = issues.filter(
    (i) => i.assignedTo === "Sarah Chen" && i.status !== "CLOSED",
  );
  const myCompany = issues.filter(
    (i) => i.company === "HITT Contracting" && i.status !== "CLOSED",
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
    return mp && ms && md;
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
            <span></span> Issues
          </h1>
          <p
            style={{ margin: "5px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}
          >
            Day-to-day field issues · {issues.length} total · {overdue.length}{" "}
            overdue
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
          + Raise issue
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
            "OPEN",
            "IN_PROGRESS",
            "CX_VERIFIED",
            "CLOSED",
            "NEW",
            "DEFERRED",
          ].map((s) => (
            <option key={s} value={s}>
              {s}
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
          Loading issues...
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
          No issues match the current filter.
        </div>
      ) : (
        <div>
          {filtered.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
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
            Move "{statusModal.issue.title}" →{" "}
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
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
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
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
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
          onSubmit={async (form) => {
            const newIssue = {
              id: "i" + Date.now(),
              num:
                "ISS-" +
                new Date().getFullYear() +
                "-" +
                String(Math.floor(Math.random() * 900) + 100).padStart(3, "0"),
              kind: form.kind,
              priority: form.priority,
              title: form.title,
              discipline: form.discipline.toUpperCase(),
              asset: form.asset === "— None —" ? null : form.asset,
              company:
                form.responderCompany === "— Select responding company —"
                  ? null
                  : form.responderCompany,
              notifyCompany:
                form.notifyCompany === "— Select company to notify —"
                  ? null
                  : form.notifyCompany,
              assigneeCompany: null,
              checklistRef: null,
              comments: 0,
              blocker: form.blocksPhase ? form.blocksNote : null,
              status: "OPEN",
              isOverdue: false,
              ncrSubStatus: form.kind === "NCR" ? "DRAFT" : undefined,
              sla:
                form.slaOverride ||
                PRIORITY_SLA[form.priority]?.replace(" SLA", ""),
              raisedBy: "You",
              raisedDate: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
              }),
              assignedTo: form.assignedTo || null,
            };
            setIssues((prev) => [newIssue, ...prev]);
            setMessage({ type: "success", text: "Issue raised successfully" });
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
