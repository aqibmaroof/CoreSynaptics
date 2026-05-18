import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-8: Decision memory ────────────────────────────────────────────
// READ-ONLY. Rows are written by the system (approval completion, automation
// runs, recommendation acceptance, escalation, readiness gates). The "Why?"
// tab on entity detail reads via subjectLineage; project views aggregate via
// projectLineage / projectTimeline.

const base = "/decision-memory";

const csv = (xs) => (Array.isArray(xs) && xs.length ? xs.join(",") : undefined);

export const subjectLineage = (subjectType, subjectId, limit) =>
  sendRequest({
    url: `${base}/subject`,
    method: "GET",
    params: { subjectType, subjectId, limit },
  });

export const projectLineage = (cxProjectId, kinds, limit) =>
  sendRequest({
    url: `${base}/project`,
    method: "GET",
    params: { cxProjectId, limit, kinds: csv(kinds) },
  });

export const projectTimeline = (cxProjectId, limit) =>
  sendRequest({
    url: `${base}/timeline`,
    method: "GET",
    params: { cxProjectId, limit },
  });

export const DECISION_LINEAGE_KINDS = [
  "RECOMMENDATION",
  "ESCALATION",
  "AUTOMATION_RUN",
  "APPROVAL_DECISION",
  "READINESS_GATE",
  "ANOMALY_RESPONSE",
  "PREDICTION_ACK",
];

export const DECISION_KIND_STYLE = {
  RECOMMENDATION: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  ESCALATION: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  AUTOMATION_RUN: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  APPROVAL_DECISION: {
    color: "var(--rf-green)",
    bg: "rgba(34,197,94,0.16)",
  },
  READINESS_GATE: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  ANOMALY_RESPONSE: {
    color: "var(--rf-red)",
    bg: "rgba(239,68,68,0.16)",
  },
  PREDICTION_ACK: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
};
