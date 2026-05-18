import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B1: Announcements ────────────────────────────────────────
// State machine: DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → PUBLISHED
//                                                  ↘  REJECTED → DRAFT (on edit)
// Drive transitions via the dedicated endpoints — never compute "can publish?"
// locally. The audit trail is server-owned.

const base = "/announcements";

/**
 * params: { tab?, status?, scope?, cxProjectId?, authorUserId?, search?,
 *           cursor?, limit? }
 */
export const listAnnouncements = (params = {}) =>
  sendRequest({ url: base, method: "GET", params });

/** Tab counts keyed by AnnouncementStatus. */
export const announcementTabCounts = (cxProjectId) =>
  sendRequest({
    url: `${base}/tabs`,
    method: "GET",
    params: cxProjectId ? { cxProjectId } : {},
  });

export const getAnnouncement = (id) =>
  sendRequest({ url: `${base}/${encodeURIComponent(id)}`, method: "GET" });

/**
 * body: { scope, cxProjectId?, title, body, bodyRich?,
 *         targetRoleNames?, targetCompanyIds?, scheduledFor? }
 */
export const createAnnouncement = (body) =>
  sendRequest({
    url: base,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const updateAnnouncement = (id, body) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}`,
    method: "PATCH",
    data: body,
    mutationId: true,
  });

export const submitAnnouncement = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/submit`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const startAnnouncementReview = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/start-review`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** body: { publishNow? } */
export const approveAnnouncement = (id, publishNow = false) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/approve`,
    method: "POST",
    data: { publishNow },
    mutationId: true,
  });

export const publishAnnouncement = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/publish`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** body: { reason } */
export const rejectAnnouncement = (id, reason) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/reject`,
    method: "POST",
    data: { reason },
    mutationId: true,
  });

export const archiveAnnouncement = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/archive`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** kind: LIKE | CELEBRATE | ACKNOWLEDGE | CONCERN */
export const reactAnnouncement = (id, kind) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/reactions`,
    method: "POST",
    data: { kind },
    mutationId: true,
  });

export const unreactAnnouncement = (id, kind) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/reactions/${encodeURIComponent(kind)}`,
    method: "DELETE",
    mutationId: true,
  });

export const saveAnnouncement = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/save`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const unsaveAnnouncement = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/save`,
    method: "DELETE",
    mutationId: true,
  });

export const listAnnouncementComments = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/comments`,
    method: "GET",
  });

/** body: { body, parentCommentId? } */
export const commentAnnouncement = (id, body) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/comments`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const announcementAudit = (id) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(id)}/audit`,
    method: "GET",
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const ANNOUNCEMENT_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
  "ARCHIVED",
];

export const ANNOUNCEMENT_SCOPES = ["PROJECT", "INTERNAL", "GLOBAL"];

export const ANNOUNCEMENT_REACTIONS = [
  "LIKE",
  "CELEBRATE",
  "ACKNOWLEDGE",
  "CONCERN",
];

export const ANNOUNCEMENT_TABS = [
  "all",
  "pending",
  "published",
  "rejected",
  "mine",
  "internal",
];

export const ANNOUNCEMENT_STATUS_STYLE = {
  DRAFT: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  SUBMITTED: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  UNDER_REVIEW: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  APPROVED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  PUBLISHED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.24)" },
  REJECTED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  ARCHIVED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

// v7 backward-compat aliases (older code referenced these names) — keep
// them callable so legacy imports don't 500. New code should use the
// names above.
export const getAnnouncements = listAnnouncements;
export const getAnnouncementById = getAnnouncement;
export const submitAnnouncementForReview = submitAnnouncement;
export const reactToAnnouncement = (id, payload) =>
  reactAnnouncement(id, payload?.kind || payload);
export const addAnnouncementComment = (id, payload) =>
  commentAnnouncement(id, payload);
export const getAnnouncementComments = listAnnouncementComments;
