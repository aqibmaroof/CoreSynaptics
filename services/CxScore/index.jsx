import sendRequest from "../instance/sendRequest";

const base = (projectId) => `/cx-projects/${projectId}/cx-score`;

/**
 * Latest snapshot if one exists; otherwise a live compute (no persistence).
 * Use this for the header score badge — fast, indexed read.
 */
export const getCxScoreCurrent = (projectId) =>
  sendRequest({ url: `${base(projectId)}/current`, method: "GET" });

/**
 * Force a live compute, bypassing snapshots. Slower; use for diagnostics
 * ("what would the score be right now?").
 */
export const computeCxScoreLive = (projectId) =>
  sendRequest({ url: `${base(projectId)}/compute`, method: "GET" });

/**
 * Compute and persist a snapshot for today (idempotent per UTC day).
 * Intended for a daily scheduled job; also useful as a manual trigger after a
 * major event (phase advance, large checklist signoff).
 */
export const snapshotCxScore = (projectId) =>
  sendRequest({ url: `${base(projectId)}/snapshot`, method: "POST" });

/**
 * Daily snapshot trend (ascending by date). Default window: 90 days. Max: 365.
 * params: { fromDate?, toDate?, limit? }
 */
export const getCxScoreTrend = (projectId, params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {})
  ).toString();
  return sendRequest({
    url: `${base(projectId)}/trend${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
};

// Grade → Tailwind classes for header chip
export const GRADE_CLASSES = {
  A: "bg-green-500/20 text-green-300 border-green-500/40",
  B: "bg-lime-500/20 text-lime-300 border-lime-500/40",
  C: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  D: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  F: "bg-red-500/20 text-red-300 border-red-500/40",
};
