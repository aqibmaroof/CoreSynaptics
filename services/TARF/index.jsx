import sendRequest from "../instance/sendRequest";

/** List TARF entries with optional filters (project_id, approved, active, expired) */
export const getTARFs = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({ url: `/tarf${query ? `?${query}` : ""}`, method: "GET" });
};

/** Get a single TARF by ID */
export const getTARFById = async (id) => {
  return sendRequest({ url: `/tarf/${id}`, method: "GET" });
};

/** Create a new TARF access request */
export const createTARF = async (payload) => {
  return sendRequest({ url: `/tarf`, method: "POST", data: payload });
};

/** Update TARF fields (pre-approval only) */
export const updateTARF = async (id, payload) => {
  return sendRequest({ url: `/tarf/${id}`, method: "PATCH", data: payload });
};

/** Delete a pending TARF request */
export const deleteTARF = async (id) => {
  return sendRequest({ url: `/tarf/${id}`, method: "DELETE" });
};

/** Approve a TARF — sets approved=true, approved_by, approved_at */
export const approveTARF = async (id) => {
  return sendRequest({ url: `/tarf/${id}/approve`, method: "POST" });
};

/** Reject a TARF with a reason */
export const rejectTARF = async (id, payload = {}) => {
  return sendRequest({ url: `/tarf/${id}/reject`, method: "POST", data: payload });
};

/** Sign in: records signed_in_at — blocked unless approved + safety_orientation_complete */
export const signInTARF = async (id) => {
  return sendRequest({ url: `/tarf/${id}/sign-in`, method: "POST" });
};

/** Sign out: records signed_out_at */
export const signOutTARF = async (id) => {
  return sendRequest({ url: `/tarf/${id}/sign-out`, method: "POST" });
};

/** List personnel currently on site (approved + signed_in + not signed_out + not expired) */
export const getActiveSitePersonnel = async (projectId) => {
  return sendRequest({ url: `/tarf/active?project_id=${projectId}`, method: "GET" });
};

/** List expired access entries (expectedEnd < today) */
export const getExpiredAccess = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({ url: `/tarf/expired${query ? `?${query}` : ""}`, method: "GET" });
};

/** Get sign-in / sign-out history for a TARF entry */
export const getSignLogs = async (id) => {
  return sendRequest({ url: `/tarf/${id}/sign-logs`, method: "GET" });
};
