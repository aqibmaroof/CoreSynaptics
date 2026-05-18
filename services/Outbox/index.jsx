import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch D: Transactional outbox dead-letter explorer ────────────
// Platform-only. Replay re-queues with attempts=0 and consumedBy=[] — every
// handler runs again, so consumer-side idempotency is what makes it safe.
// /outbox/drain forces one dispatch cycle (incident-response use only).

export const outboxDeadLetter = (limit = 50) =>
  sendRequest({ url: `/outbox/dead-letter`, method: "GET", params: { limit } });

export const outboxAttempts = (outboxEventId) =>
  sendRequest({
    url: `/outbox/attempts/${encodeURIComponent(outboxEventId)}`,
    method: "GET",
  });

/** Platform-only. */
export const outboxReplay = (outboxEventId) =>
  sendRequest({
    url: `/outbox/replay/${encodeURIComponent(outboxEventId)}`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** Platform-only. Returns { claimed, delivered, retried, dead }. */
export const outboxDrain = () =>
  sendRequest({
    url: `/outbox/drain`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const OUTBOX_STATUSES = [
  "PENDING",
  "IN_FLIGHT",
  "DELIVERED",
  "RETRY",
  "DEAD",
  "SUPPRESSED",
];

export const OUTBOX_STATUS_STYLE = {
  PENDING: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  IN_FLIGHT: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  DELIVERED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  RETRY: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  DEAD: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  SUPPRESSED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};
