import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-3: Notification orchestration ─────────────────────────────────
// Router-only client surface. Backends fan a single delivery event out across
// the user's enabled channels (WEBSOCKET / OP_FEED / EMAIL / SMS / PUSH).
// `notification.created` arrives on the user channel; subscribe via PR-10's
// envelope helper to bump the bell.

const base = "/notifications";

// ─── My inbox ────────────────────────────────────────────────────────────────

/** params: { unreadOnly?, limit?, cursor? } */
export const myNotifications = (params = {}) =>
  sendRequest({ url: `${base}/me/deliveries`, method: "GET", params });

export const markNotificationRead = (id) =>
  sendRequest({
    url: `${base}/deliveries/${id}/read`,
    method: "PATCH",
    mutationId: true,
  });

export const markAllNotificationsRead = () =>
  sendRequest({
    url: `${base}/me/deliveries/read-all`,
    method: "POST",
    mutationId: true,
  });

// ─── Preferences ─────────────────────────────────────────────────────────────

export const myNotificationPreferences = () =>
  sendRequest({ url: `${base}/me/preferences`, method: "GET" });

/**
 * Upsert a single preference row.
 * body: {
 *   category: string,
 *   channel: 'WEBSOCKET'|'OP_FEED'|'EMAIL'|'SMS'|'PUSH',
 *   enabled?: boolean,
 *   minPriority?: 'LOW'|'NORMAL'|'HIGH'|'CRITICAL',
 *   digestEnabled?: boolean,
 *   digestHour?: number  // 0–23, UTC
 * }
 */
export const upsertNotificationPreference = (body) =>
  sendRequest({
    url: `${base}/me/preferences`,
    method: "PUT",
    data: body,
    mutationId: true,
  });

// ─── Admin send ──────────────────────────────────────────────────────────────

/**
 * Admin / system-triggered send.
 * body: {
 *   userIds?: string[],
 *   roleNames?: string[],
 *   cxProjectId?: string,
 *   category: string,
 *   priority?: 'LOW'|'NORMAL'|'HIGH'|'CRITICAL',
 *   title: string,
 *   body: string,
 *   linkUrl?: string,
 *   channels?: NotificationChannel[],
 *   metadata?: Record<string, unknown>
 * }
 */
export const sendNotification = (body) =>
  sendRequest({
    url: `${base}/send`,
    method: "POST",
    data: body,
    mutationId: true,
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const NOTIFICATION_CHANNELS = [
  "WEBSOCKET",
  "OP_FEED",
  "EMAIL",
  "SMS",
  "PUSH",
];

export const NOTIFICATION_PRIORITIES = ["LOW", "NORMAL", "HIGH", "CRITICAL"];

export const NOTIFICATION_DELIVERY_STATUSES = [
  "PENDING",
  "DELIVERED",
  "FAILED",
  "SKIPPED",
  "RETRY_SCHEDULED",
];

export const NOTIFICATION_PRIORITY_STYLE = {
  LOW: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  NORMAL: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  HIGH: { color: "var(--rf-yellow, #f59e0b)", bg: "rgba(245,158,11,0.16)" },
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const NOTIFICATION_CATEGORIES = [
  "approvals",
  "automation",
  "comms",
  "issues",
  "schedule",
  "turnover",
  "safety",
  "score",
  "phase",
  "system",
];
