import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-2: Approval orchestration ─────────────────────────────────────
// One reusable chain shape works for Submittals, RFIs, Turnover Packages,
// Change Requests, etc. Steps with the same `order` are parallel; the chain
// only advances when every parallel step in the active order is APPROVED
// (when requireAll=true) or when any resolves (requireAll=false).

const base = "/approvals";

// ─── Chains ──────────────────────────────────────────────────────────────────

/**
 * Start a new approval chain.
 * body: {
 *   entityType: string,
 *   entityId: string,
 *   cxProjectId?: string,
 *   templateKey?: string,
 *   requireAll?: boolean,
 *   steps: Array<{
 *     name: string,
 *     approverUserId?: string,
 *     approverRoleName?: string,
 *     approverCompanyId?: string,
 *     isParallel?: boolean,
 *     dueInHours?: number,
 *     order?: number
 *   }>,
 *   metadata?: Record<string, unknown>
 * }
 * Returns: { chainId }
 */
export const startApprovalChain = (body) =>
  sendRequest({
    url: `${base}/chains`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const getApprovalChain = (chainId) =>
  sendRequest({ url: `${base}/chains/${chainId}`, method: "GET" });

export const listChainsForEntity = (entityType, entityId) =>
  sendRequest({
    url: `${base}/chains`,
    method: "GET",
    params: { entityType, entityId },
  });

export const cancelApprovalChain = (chainId) =>
  sendRequest({
    url: `${base}/chains/${chainId}`,
    method: "DELETE",
    mutationId: true,
  });

// ─── Per-user ────────────────────────────────────────────────────────────────

/** Caller's open ACTIVE steps across all chains. */
export const myPendingApprovals = () =>
  sendRequest({ url: `${base}/me/pending`, method: "GET" });

// ─── Decisions ───────────────────────────────────────────────────────────────

/**
 * Approve / reject / delegate a step.
 * body: { decision: 'APPROVE'|'REJECT'|'DELEGATE', comment?, delegateToUserId? }
 * Returns: { chainStatus }
 */
export const decideApprovalStep = (chainId, stepId, body) =>
  sendRequest({
    url: `${base}/chains/${chainId}/steps/${stepId}/decide`,
    method: "POST",
    data: body,
    mutationId: true,
  });

// ─── Constants for editor / UI ───────────────────────────────────────────────

export const APPROVAL_CHAIN_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

export const APPROVAL_STEP_STATUSES = [
  "PENDING",
  "ACTIVE",
  "APPROVED",
  "REJECTED",
  "SKIPPED",
  "DELEGATED",
  "EXPIRED",
];

export const APPROVAL_DECISIONS = ["APPROVE", "REJECT", "DELEGATE"];

export const APPROVAL_CHAIN_BADGE = {
  PENDING: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  APPROVED: "bg-green-500/20 text-green-300 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
  CANCELLED: "bg-gray-600/30 text-gray-400 border-gray-600/40",
};

export const APPROVAL_STEP_BADGE = {
  PENDING: { bg: "var(--rf-bg3)", color: "var(--rf-txt3)" },
  ACTIVE: { bg: "rgba(59,130,246,0.18)", color: "var(--rf-blue, #3b82f6)" },
  APPROVED: { bg: "rgba(34,197,94,0.16)", color: "var(--rf-green)" },
  REJECTED: { bg: "rgba(239,68,68,0.16)", color: "var(--rf-red)" },
  SKIPPED: { bg: "var(--rf-bg3)", color: "var(--rf-txt3)" },
  DELEGATED: { bg: "rgba(245,158,11,0.16)", color: "var(--rf-yellow, #f59e0b)" },
  EXPIRED: { bg: "rgba(239,68,68,0.10)", color: "var(--rf-red)" },
};
