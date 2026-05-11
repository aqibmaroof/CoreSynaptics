import sendRequest from "../instance/sendRequest";

const base = "/risks";

/**
 * List risks (default order: highest score first).
 * params: { cxProjectId, category, status, ownerUserId, minScore, maxScore,
 *           linkedIssueId, page, limit }
 */
export const listRisks = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {})
  ).toString();
  return sendRequest({ url: `${base}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getRisk = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

/**
 * Create a risk (status starts OPEN).
 * payload: { cxProjectId, title, description?, category,
 *            probability (1..5), impact (1..5), ownerUserId?, mitigationPlan? }
 */
export const createRisk = (payload) =>
  sendRequest({ url: base, method: "POST", data: payload });

/** Update — rating change recomputes score & band server-side. */
export const updateRisk = (id, payload) =>
  sendRequest({ url: `${base}/${id}`, method: "PATCH", data: payload });

/** OPEN ↔ MITIGATING (CLOSED requires the close endpoint). */
export const changeRiskStatus = (id, payload) =>
  sendRequest({
    url: `${base}/${id}/status`,
    method: "PATCH",
    data: payload,
  });

/**
 * Close a risk (terminal). reason=MITIGATED requires every linked Issue
 * to be CLOSED first; ACCEPTED / OBSOLETE accept any state.
 * payload: { reason: 'MITIGATED'|'ACCEPTED'|'OBSOLETE', notes? }
 */
export const closeRisk = (id, payload) =>
  sendRequest({ url: `${base}/${id}/close`, method: "POST", data: payload });

/** Link an Issue (this risk has materialized). payload: { issueId } */
export const linkRiskIssue = (id, payload) =>
  sendRequest({
    url: `${base}/${id}/link-issue`,
    method: "POST",
    data: payload,
  });

export const unlinkRiskIssue = (id, issueId) =>
  sendRequest({
    url: `${base}/${id}/link-issue/${issueId}`,
    method: "DELETE",
  });

export const deleteRisk = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "DELETE" });

// Re-export enum-ish constants
export const RISK_CATEGORIES = [
  "SCHEDULE",
  "QUALITY",
  "SCOPE",
  "SECURITY",
  "EXTERNAL",
  "SAFETY",
  "TECHNICAL",
  "COMMERCIAL",
];

export const RISK_STATUSES = ["OPEN", "MITIGATING", "CLOSED"];
export const RISK_CLOSE_REASONS = ["MITIGATED", "ACCEPTED", "OBSOLETE"];

/** Tailwind classes per heat-map band. */
export const RISK_BAND_CLASSES = {
  LOW: "bg-green-500/20 text-green-300 border-green-500/30",
  MEDIUM: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  HIGH: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  SEVERE: "bg-red-500/20 text-red-300 border-red-500/30",
};
