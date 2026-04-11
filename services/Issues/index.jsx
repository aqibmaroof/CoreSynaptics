import sendRequest from "../instance/sendRequest";

/** List issues with optional filters: project_id, asset_id, status, severity */
export const getIssues = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({ url: `/issues${query ? `?${query}` : ""}`, method: "GET" });
};

/** Get a single issue by ID */
export const getIssueById = async (id) => {
  return sendRequest({ url: `/issues/${id}`, method: "GET" });
};

/** Create a new issue */
export const createIssue = async (payload) => {
  return sendRequest({ url: `/issues`, method: "POST", data: payload });
};

/** Update issue fields (title, description, severity, assignment, etc.) */
export const updateIssue = async (id, payload) => {
  return sendRequest({ url: `/issues/${id}`, method: "PATCH", data: payload });
};

/** Delete an issue (only allowed on New status) */
export const deleteIssue = async (id) => {
  return sendRequest({ url: `/issues/${id}`, method: "DELETE" });
};

/**
 * Transition issue status.
 * Server enforces valid transitions:
 *   New → In Progress | Deferred
 *   In Progress → Ready for Verification | Deferred
 *   Ready for Verification → In Progress | Deferred
 *   Deferred → New | In Progress
 */
export const changeIssueStatus = async (id, payload) => {
  // payload: { status: string }
  return sendRequest({ url: `/issues/${id}/status`, method: "POST", data: payload });
};

/** Assign issue to a user and/or company */
export const assignIssue = async (id, payload) => {
  // payload: { assigned_to_user_id, assigned_to_company_id }
  return sendRequest({ url: `/issues/${id}/assign`, method: "POST", data: payload });
};

/**
 * Verify and close issue.
 * Requires close_verified_by (user ID).
 * Server sets status = Closed and resolved_at = now().
 */
export const verifyAndCloseIssue = async (id, payload) => {
  // payload: { close_verified_by: uuid, verification_notes?: string }
  return sendRequest({ url: `/issues/${id}/verify-close`, method: "POST", data: payload });
};
