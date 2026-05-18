import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-9: Event log + replay (PLATFORM-ONLY) ─────────────────────────
// Replay re-emits N events, which fans out to projections and webhooks. Keep
// this UI behind a platform-admin gate. The dry-run path returns the count
// without emitting.

const base = "/event-log";

/**
 * params: { eventName?, cxProjectId?, since?, until?, limit? }
 */
export const listEvents = (params = {}) =>
  sendRequest({ url: base, method: "GET", params });

export const getEvent = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

export const listProjectionCheckpoints = () =>
  sendRequest({ url: `${base}/checkpoints`, method: "GET" });

/**
 * body: { eventName?, cxProjectId?, organizationId?, since?, until?, limit?, dryRun? }
 */
export const runReplay = (body) =>
  sendRequest({
    url: `${base}/replay`,
    method: "POST",
    data: body,
    mutationId: true,
  });

// ── Phase 6 PR-8: Projection rebuild ─────────────────────────────────────────

/**
 * body: { projection, eventNamePrefix?, organizationId?, since?, limit? }
 * Returns: { projection, replayed }
 */
export const rebuildProjection = (body) =>
  sendRequest({
    url: `${base}/rebuild-projection`,
    method: "POST",
    data: body,
    mutationId: true,
  });

// ── Phase 6 PR-2: Diagnostics ────────────────────────────────────────────────
// All five endpoints below are org-admin (org-scoped) by default; platform
// users see all orgs. The server applies the filter automatically.

const diag = `${base}/diagnostics`;

/** params: { since?, limit? } */
export const getDeadLetters = (params = {}) =>
  sendRequest({ url: `${diag}/dead-letters`, method: "GET", params });

/** params: { since?, limit? } */
export const getEventThroughput = (params = {}) =>
  sendRequest({ url: `${diag}/throughput`, method: "GET", params });

/** Returns: TraceSpan[] */
export const getTrace = (traceId) =>
  sendRequest({ url: `${diag}/traces/${traceId}`, method: "GET" });

/** params: { since?, limit?, kindPrefix? } */
export const getFailures = (params = {}) =>
  sendRequest({ url: `${diag}/failures`, method: "GET", params });

/** params: { since?, limit?, minMs? } */
export const getSlowSpans = (params = {}) =>
  sendRequest({ url: `${diag}/slow-spans`, method: "GET", params });

// ── Constants ───────────────────────────────────────────────────────────────

export const DEAD_LETTER_GROUPS = [
  { key: "automationFailures", label: "Automation failures" },
  { key: "webhookDead", label: "Dead webhooks" },
  { key: "notificationFailures", label: "Failed notifications" },
  { key: "listenerFailures", label: "Listener failures" },
];

export const TRACE_SPAN_STATUS_STYLE = {
  OK: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  SLOW: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};
