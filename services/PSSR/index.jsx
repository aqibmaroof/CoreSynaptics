import sendRequest from "../instance/sendRequest";

const base = "/pssr-inspections";

/**
 * List PSSR inspections.
 * params: { cxProjectId, assetId, status, page, limit }
 */
export const listPssrInspections = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {})
  ).toString();
  return sendRequest({ url: `${base}${qs ? `?${qs}` : ""}`, method: "GET" });
};

/** Get a single inspection (includes items array). */
export const getPssrInspection = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

/**
 * Create a PSSR inspection. If items[] is omitted, the backend seeds the
 * default 6-category template (~37 items) from the HTML PSSR_TEMPLATE.
 * payload: { cxProjectId, assetId?, title, description?,
 *            items?: [{ category, sequence, prompt }] }
 */
export const createPssrInspection = (payload) =>
  sendRequest({ url: base, method: "POST", data: payload });

/** Begin the inspection walk (DRAFT → WALKED). */
export const startPssrWalk = (id) =>
  sendRequest({ url: `${base}/${id}/start-walk`, method: "POST" });

/**
 * Answer one inspection item.
 * compliant=false auto-creates a finding Issue (kind=PUNCH_LIST, severity=HIGH)
 * and links it back via item.findingIssueId. Aggregate transitions to
 * PUNCHLIST_OPEN automatically.
 * payload: { compliant: boolean, notes? }
 */
export const answerPssrItem = (itemId, payload) =>
  sendRequest({
    url: `${base}/items/${itemId}/answer`,
    method: "POST",
    data: payload,
  });

/** Idempotent recompute of aggregate counts and status. */
export const recomputePssrCounts = (id) =>
  sendRequest({ url: `${base}/${id}/recompute`, method: "POST" });

/**
 * Sign-off (terminal). Allowed from WALKED (no findings) or PUNCHLIST_CLOSED
 * (all findings cleared). Refreshes counts before signing.
 */
export const signPssrInspection = (id) =>
  sendRequest({ url: `${base}/${id}/sign`, method: "POST" });

/** Soft-delete (blocked once SIGNED — regulated record). */
export const deletePssrInspection = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "DELETE" });

// Re-export enum-ish constants for UI reuse
export const PSSR_STATUSES = [
  "DRAFT",
  "WALKED",
  "PUNCHLIST_OPEN",
  "PUNCHLIST_CLOSED",
  "SIGNED",
];

export const PSSR_CATEGORIES = [
  "EQUIPMENT_INSTALLATION",
  "PROCESS_HAZARDS",
  "OPERATING_PROCEDURES",
  "TRAINING",
  "EMERGENCY_PROCEDURES",
  "MOC_RESOLVED",
];

export const PSSR_CATEGORY_LABELS = {
  EQUIPMENT_INSTALLATION: "Equipment Installation",
  PROCESS_HAZARDS: "Process Hazards",
  OPERATING_PROCEDURES: "Operating Procedures",
  TRAINING: "Training",
  EMERGENCY_PROCEDURES: "Emergency Procedures",
  MOC_RESOLVED: "MOC Resolved",
};
