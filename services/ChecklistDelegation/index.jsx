import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B5: Cross-company checklist delegation ──────────────────
// Server blocks a second active delegation on the same checklist. Only the
// originator can cancel; target user (matching toUserId or anyone in
// toCompanyId) can accept/complete. SLA cron escalates overdue rows every
// 10 minutes.

/**
 * body: { toCompanyId, toUserId?, message?, dueAt? }
 */
export const delegateChecklist = (checklistId, body) =>
  sendRequest({
    url: `/checklists/${encodeURIComponent(checklistId)}/delegate`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const acceptDelegation = (delegationId) =>
  sendRequest({
    url: `/checklists/delegations/${encodeURIComponent(delegationId)}/accept`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const completeDelegation = (delegationId, notes) =>
  sendRequest({
    url: `/checklists/delegations/${encodeURIComponent(delegationId)}/complete`,
    method: "POST",
    data: { notes },
    mutationId: true,
  });

export const cancelDelegation = (delegationId, notes) =>
  sendRequest({
    url: `/checklists/delegations/${encodeURIComponent(delegationId)}/cancel`,
    method: "POST",
    data: { notes },
    mutationId: true,
  });

export const listDelegations = (checklistId) =>
  sendRequest({
    url: `/checklists/delegations`,
    method: "GET",
    params: checklistId ? { checklistId } : {},
  });

export const DELEGATION_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "COMPLETED",
  "CANCELLED",
  "ESCALATED",
];

export const DELEGATION_STATUS_STYLE = {
  PENDING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  ACCEPTED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  COMPLETED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  CANCELLED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  ESCALATED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};
