import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B8: Job Hazard Analysis (JHA) ───────────────────────────
// Aggregate-driven state machine: DRAFT → PUBLISHED → IN_REVIEW → RETIRED
// Publish requires hazards.length > 0 AND requiredAttendeeUserIds.length > 0.
// Acknowledge is idempotent; render "Acknowledged" once the current user is
// in acknowledgedUserIds.

const base = "/jha";

/**
 * body: {
 *   cxProjectId, taskTitle, locationDesc?, scopeNotes?,
 *   linkedAssetId?, linkedPhaseKey?, linkedToolboxTopicId?, linkedPermitIds?,
 *   hazards?: [{ description, severity, mitigation, refOrgSopId? }]
 * }
 */
export const createJha = (body) =>
  sendRequest({
    url: base,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** body: { description, severity, mitigation, refOrgSopId? } */
export const addJhaHazard = (id, body) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/hazards`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const publishJha = (id, requiredAttendeeUserIds) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/publish`,
    method: "POST",
    data: { requiredAttendeeUserIds },
    mutationId: true,
  });

/** body: { signatureSha256?, device?, ipAddress? } */
export const acknowledgeJha = (id, body = {}) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/acknowledge`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const retireJha = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/retire`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const getJha = (id) =>
  sendRequest({ url: `${base}/${encodeURIComponent(id)}`, method: "GET" });

/** params: { cxProjectId?, status?, linkedAssetId?, linkedPhaseKey?, cursor?, limit? } */
export const listJha = (params = {}) =>
  sendRequest({ url: base, method: "GET", params });

export const JHA_STATUSES = ["DRAFT", "PUBLISHED", "IN_REVIEW", "RETIRED"];

export const JHA_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const JHA_STATUS_STYLE = {
  DRAFT: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  PUBLISHED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  IN_REVIEW: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RETIRED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const JHA_SEVERITY_STYLE = {
  LOW: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  MEDIUM: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  HIGH: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};
