import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B6: Crew dispatch board ─────────────────────────────────
// Visibility: GC org sees every assignment; non-GC sees only their own
// employees' rows. Server enforces — the UI just renders what it gets.
// On `assign`, always inspect `res.conflict` (not an error — the row is
// created, the flag is informational).

const base = "/dispatch";

export const dispatchForDay = (cxProjectId, date) =>
  sendRequest({
    url: `${base}/cx-projects/${encodeURIComponent(cxProjectId)}/day`,
    method: "GET",
    params: { date },
  });

export const dispatchForWeek = (cxProjectId, from) =>
  sendRequest({
    url: `${base}/cx-projects/${encodeURIComponent(cxProjectId)}/week`,
    method: "GET",
    params: { from },
  });

/**
 * body: { cxProjectId, crewMemberId, shiftDate, shiftStart, shiftEnd,
 *         task, assetCode?, location? }
 * Returns: { id, conflict, conflictingAssignmentId? }
 */
export const assignDispatch = (body) =>
  sendRequest({
    url: base,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** status: PLANNED | DISPATCHED | ON_SITE | DONE | NO_SHOW (linear forward) */
export const updateDispatchStatus = (assignmentId, status) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(assignmentId)}/status`,
    method: "PATCH",
    data: { status },
    mutationId: true,
  });

export const CREW_SHIFT_STATUSES = [
  "PLANNED",
  "DISPATCHED",
  "ON_SITE",
  "DONE",
  "NO_SHOW",
];

export const SHIFT_STATUS_STYLE = {
  PLANNED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  DISPATCHED: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  ON_SITE: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  DONE: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  NO_SHOW: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};
