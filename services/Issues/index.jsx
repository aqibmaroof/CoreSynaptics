import sendRequest from "../instance/sendRequest";

/** List issues with optional filters and pagination.
 *  params: { projectId, assetId, status, severity, assignedToUserId,
 *            assignedToCompanyId, raisedBy, search, fromDate, toDate, page, limit }
 */
export const getIssues = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({ url: `/issues${query ? `?${query}` : ""}`, method: "GET" });
};

/** Get a single issue by ID */
export const getIssueById = async (id) => {
  return sendRequest({ url: `/issues/${id}`, method: "GET" });
};

/** Create a new issue.
 *  payload: { projectId?, assetId?, title, description?, severity,
 *             assignedToCompanyId?, assignedToUserId? }
 *  At least one of projectId or assetId is required.
 */
export const createIssue = async (payload) => {
  return sendRequest({ url: `/issues`, method: "POST", data: payload });
};

/** Update issue fields (title, description, severity).
 *  Cannot update a CLOSED issue.
 */
export const updateIssue = async (id, payload) => {
  return sendRequest({ url: `/issues/${id}`, method: "PATCH", data: payload });
};

/** Delete an issue (only allowed on NEW status) */
export const deleteIssue = async (id) => {
  return sendRequest({ url: `/issues/${id}`, method: "DELETE" });
};

/**
 * Transition issue status via PATCH.
 * payload: { status: "NEW" | "IN_PROGRESS" | "READY_FOR_VERIFICATION" | "DEFERRED" }
 * Allowed transitions:
 *   NEW → IN_PROGRESS | DEFERRED
 *   IN_PROGRESS → READY_FOR_VERIFICATION | DEFERRED
 *   READY_FOR_VERIFICATION → IN_PROGRESS | DEFERRED
 *   DEFERRED → NEW | IN_PROGRESS
 * Do NOT use this to close — use verifyAndCloseIssue instead.
 */
export const changeIssueStatus = async (id, payload) => {
  return sendRequest({ url: `/issues/${id}/status`, method: "PATCH", data: payload });
};

/** Assign or reassign issue to a user and/or company via PATCH.
 *  payload: { assignedToUserId?, assignedToCompanyId? }
 *  At least one field required. Pass null to clear an assignment.
 *  Cannot assign a CLOSED issue.
 */
export const assignIssue = async (id, payload) => {
  return sendRequest({ url: `/issues/${id}/assign`, method: "PATCH", data: payload });
};

/**
 * Verify and close issue.
 * payload: { closeVerifiedBy: uuid }
 * Issue must be in READY_FOR_VERIFICATION. Sets status=CLOSED, resolvedAt, closeVerifiedBy.
 * CLOSED is terminal — no further changes allowed.
 */
export const verifyAndCloseIssue = async (id, payload) => {
  return sendRequest({ url: `/issues/${id}/verify-close`, method: "POST", data: payload });
};

/**
 * Issue.kind discriminator (PR3). Each kind reuses the standard
 * NEW → IN_PROGRESS → READY_FOR_VERIFICATION → CLOSED lifecycle but adds
 * creation-time invariants enforced server-side.
 */
export const ISSUE_KINDS = [
  "GENERAL",       // default — generic issue
  "HOLD_POINT",    // requires assignedToCompanyId
  "WITNESS_POINT", // assignment optional
  "PUNCH_LIST",    // pre-handover punch (PSSR auto-creates these)
  "NCR",           // requires non-empty description
  "SNAG",          // late-stage closeout
];

export const ISSUE_KIND_LABELS = {
  GENERAL: "General",
  HOLD_POINT: "Hold Point",
  WITNESS_POINT: "Witness Point",
  PUNCH_LIST: "Punch List",
  NCR: "NCR",
  SNAG: "Snag",
};

/** Tailwind classes per kind for chip rendering. */
export const ISSUE_KIND_COLORS = {
  GENERAL: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  HOLD_POINT: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  WITNESS_POINT: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  PUNCH_LIST: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  NCR: "bg-red-500/20 text-red-300 border-red-500/30",
  SNAG: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};
