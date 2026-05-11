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

/**
 * GC approve (first leg of the two-stage funnel).
 * Transitions PENDING_GC → PENDING_CUSTOMER. Endpoint name preserved for
 * backwards compatibility; semantics narrowed to GC review only.
 */
export const approveTARF = async (id) => {
  return sendRequest({ url: `/tarf/${id}/approve`, method: "POST" });
};

/**
 * Customer approve (second leg of the two-stage funnel).
 * Transitions PENDING_CUSTOMER → APPROVED. Site sign-in becomes permitted
 * once safety orientation is also complete.
 */
export const customerApproveTARF = async (id) => {
  return sendRequest({ url: `/tarf/${id}/customer-approve`, method: "POST" });
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

// ─── Two-stage funnel constants (PR4) ────────────────────────────────────────

export const TARF_APPROVAL_STAGES = [
  "PENDING_GC",        // initial — awaiting GC review
  "PENDING_CUSTOMER",  // GC approved; awaiting customer
  "APPROVED",          // both approved; sign-in permitted
  "REJECTED",          // terminal
];

export const TARF_STAGE_LABELS = {
  PENDING_GC: "Awaiting GC",
  PENDING_CUSTOMER: "Awaiting Customer",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

/** Tailwind classes for funnel stage chips. */
export const TARF_STAGE_COLORS = {
  PENDING_GC: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  PENDING_CUSTOMER: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  APPROVED: "bg-green-500/20 text-green-300 border-green-500/30",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
};
