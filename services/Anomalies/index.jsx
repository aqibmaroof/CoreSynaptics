import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-6: Anomaly detection ──────────────────────────────────────────
// Deduped server-side by fingerprint — the same drift will reappear with the
// same `id` until resolved. Detector is triggered on demand (no cron); use
// /anomalies/detect after a milestone or schedule via v5 automation rules.

const base = "/anomalies";

const csv = (xs) => (Array.isArray(xs) && xs.length ? xs.join(",") : undefined);

/**
 * params: { cxProjectId?, kinds?: AnomalyKind[], status?: AnomalyStatus, limit? }
 * Returns: Anomaly[]
 */
export const listAnomalies = (params = {}) =>
  sendRequest({
    url: base,
    method: "GET",
    params: {
      cxProjectId: params.cxProjectId,
      status: params.status,
      limit: params.limit,
      kinds: csv(params.kinds),
    },
  });

export const detectAnomalies = (cxProjectId) =>
  sendRequest({
    url: `${base}/detect`,
    method: "POST",
    data: { cxProjectId },
    mutationId: true,
  });

export const acknowledgeAnomaly = (id) =>
  sendRequest({
    url: `${base}/${id}/acknowledge`,
    method: "POST",
    mutationId: true,
  });

export const resolveAnomaly = (id) =>
  sendRequest({
    url: `${base}/${id}/resolve`,
    method: "POST",
    mutationId: true,
  });

// ── Phase 9 PR-9: org-wide operations anomalies ──────────────────────────────
// params: { status?, kinds?: string[], limit? }
// Returns: OperationsAnomaliesView { organizationId, evaluatedAt, anomalies[] }
export const operationsAnomalies = (params = {}) => {
  const csv =
    Array.isArray(params.kinds) && params.kinds.length
      ? params.kinds.join(",")
      : undefined;
  return sendRequest({
    url: `/operations/anomalies`,
    method: "GET",
    params: { status: params.status, limit: params.limit, kinds: csv },
  });
};

// ─── Constants ───────────────────────────────────────────────────────────────

// ── Phase 9 PR-1/PR-6: extended union ───────────────────────────────────────
export const ANOMALY_KINDS = [
  // v7
  "DRIFT",
  "STUCK_PROCESS",
  "ABNORMAL_ESCALATION",
  "COMMUNICATION_SILENCE",
  "DELAYED_APPROVAL",
  "READINESS_ANOMALY",
  "WORKFORCE_UTILIZATION",
  "ABNORMAL_WORKFLOW",
  // v9 additions
  "ISSUE_CLUSTERING",
  "OPERATIONAL_INACTIVITY",
];

export const ANOMALY_KIND_LABEL = {
  DRIFT: "Drift",
  STUCK_PROCESS: "Stuck process",
  ABNORMAL_ESCALATION: "Abnormal escalation",
  COMMUNICATION_SILENCE: "Comms silence",
  DELAYED_APPROVAL: "Delayed approval",
  READINESS_ANOMALY: "Readiness regression",
  WORKFORCE_UTILIZATION: "Workforce utilization",
  ABNORMAL_WORKFLOW: "Abnormal workflow",
  ISSUE_CLUSTERING: "Issue clustering",
  OPERATIONAL_INACTIVITY: "Operational inactivity",
};

export const ANOMALY_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "RESOLVED",
  "DISMISSED",
];

export const ANOMALY_SEVERITY_STYLE = {
  LOW: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  MEDIUM: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  HIGH: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const ANOMALY_STATUS_STYLE = {
  OPEN: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  ACKNOWLEDGED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RESOLVED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  DISMISSED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};
