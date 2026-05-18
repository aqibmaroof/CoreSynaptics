import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B4: Schedule baselines + variance diff ──────────────────
// Variance and status are server-decided. Render `varianceDays` + `status`
// exactly as returned — never compute in the browser.

const base = "/schedule-baselines";

/** Freeze a new active baseline. body: { cxProjectId, label, notes? } */
export const freezeBaseline = (cxProjectId, label, notes) =>
  sendRequest({
    url: base,
    method: "POST",
    data: { cxProjectId, label, notes },
    mutationId: true,
  });

export const listBaselines = (cxProjectId) =>
  sendRequest({
    url: `${base}/project/${encodeURIComponent(cxProjectId)}`,
    method: "GET",
  });

export const activateBaseline = (baselineId) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(baselineId)}/activate`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** GET diff vs active or specified baseline. */
export const baselineDiff = (cxProjectId, baselineId) =>
  sendRequest({
    url: `${base}/project/${encodeURIComponent(cxProjectId)}/diff`,
    method: "GET",
    params: baselineId ? { baselineId } : {},
  });

export const VARIANCE_STATUS_STYLE = {
  ahead: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  onTrack: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  behind: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  unknown: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};
