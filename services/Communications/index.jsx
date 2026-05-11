import sendRequest from "../instance/sendRequest";

const base = "/communications";

export const listCommunications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${base}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getCommunication = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

export const createCommunication = (payload) =>
  sendRequest({ url: base, method: "POST", data: payload });

export const updateCommunication = (id, payload) =>
  sendRequest({ url: `${base}/${id}`, method: "PATCH", data: payload });

export const sendCommunication = (id) =>
  sendRequest({ url: `${base}/${id}/send`, method: "POST" });

export const acknowledgeCommunication = (id) =>
  sendRequest({ url: `${base}/${id}/acknowledge`, method: "POST" });

export const closeCommunication = (id) =>
  sendRequest({ url: `${base}/${id}/close`, method: "POST" });

export const reopenCommunication = (id) =>
  sendRequest({
    url: `${base}/${id}/reopen`,
    method: "POST",
  });

export const deleteCommunication = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "DELETE" });

// ─── GC funnel transitions (PR5) ─────────────────────────────────────────────
// Lifecycle for announcements:
//   DRAFT → markInternal → INTERNAL
//   {DRAFT|INTERNAL|REJECTED} → submitForReview → PENDING_REVIEW
//   PENDING_REVIEW → approveAndPublish → SENT   (requires GC PM/FIELD lens)
//   PENDING_REVIEW → reject → REJECTED          (requires GC PM/FIELD lens; reason required)
//   REJECTED → submitForReview → PENDING_REVIEW (resubmit after revise)

export const markCommunicationInternal = (id) =>
  sendRequest({ url: `${base}/${id}/mark-internal`, method: "POST" });

export const submitCommunicationForReview = (id) =>
  sendRequest({ url: `${base}/${id}/submit-for-review`, method: "POST" });

export const approveAndPublishCommunication = (id) =>
  sendRequest({ url: `${base}/${id}/approve-and-publish`, method: "POST" });

/** payload: { reason: string } — mandatory, max 2000 chars */
export const rejectCommunication = (id, payload) =>
  sendRequest({ url: `${base}/${id}/reject`, method: "POST", data: payload });

// ─── Type / state constants ──────────────────────────────────────────────────

export const COMMUNICATION_TYPES = [
  "FORMAL_LETTER",
  "RFI",
  "TRANSMITTAL",
  "SUBMITTAL",
  "CHANGE_ORDER",
  "MEETING_MINUTES",
  "ANNOUNCEMENT",
];

export const COMMUNICATION_STATES = [
  "DRAFT",
  "INTERNAL",
  "PENDING_REVIEW",
  "REJECTED",
  "SENT",
  "ACKNOWLEDGED",
  "CLOSED",
];

export const COMM_STATE_LABELS = {
  DRAFT: "Draft",
  INTERNAL: "Internal",
  PENDING_REVIEW: "Pending Review",
  REJECTED: "Rejected",
  SENT: "Published",
  ACKNOWLEDGED: "Acknowledged",
  CLOSED: "Closed",
};

export const COMM_STATE_COLORS = {
  DRAFT: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  INTERNAL: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  PENDING_REVIEW: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  REJECTED: "bg-red-500/20 text-red-300 border-red-500/30",
  SENT: "bg-green-500/20 text-green-300 border-green-500/30",
  ACKNOWLEDGED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  CLOSED: "bg-gray-600/30 text-gray-400 border-gray-600/40",
};
