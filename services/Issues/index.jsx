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
