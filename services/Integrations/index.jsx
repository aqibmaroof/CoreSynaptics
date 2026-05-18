import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-8: Integrations ───────────────────────────────────────────────
// Three surfaces: webhooks (outbound), inbound (provider → us), credentials
// (write-only secrets). Credentials reads NEVER return the secret blob.
//
// HMAC: each outbound POST carries
//   x-c2m-signature: hex(HMAC_SHA256(body, secret))
//   x-c2m-delivery-id: <uuid for receiver-side dedup>

const wh = "/integrations/webhooks";
const inb = "/integrations/inbound";
const cred = "/integrations/credentials";

// ─── Webhooks ────────────────────────────────────────────────────────────────

export const listWebhooks = () =>
  sendRequest({ url: wh, method: "GET" });

export const createWebhook = (body) =>
  sendRequest({
    url: wh,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const deactivateWebhook = (id) =>
  sendRequest({
    url: `${wh}/${id}`,
    method: "DELETE",
    mutationId: true,
  });

export const listWebhookDeliveries = (id, limit = 50) =>
  sendRequest({
    url: `${wh}/${id}/deliveries`,
    method: "GET",
    params: { limit },
  });

// ─── Inbound ─────────────────────────────────────────────────────────────────

/**
 * Ingest an event from an external provider.
 * body: {
 *   provider: string, externalId?: string, eventType: string,
 *   payload: Record<string, unknown>, emitAs?: string
 * }
 */
export const ingestInbound = (body) =>
  sendRequest({
    url: inb,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const listInbound = (provider, limit = 50) =>
  sendRequest({
    url: inb,
    method: "GET",
    params: { ...(provider ? { provider } : {}), limit },
  });

// ─── Credentials (write-only secrets) ────────────────────────────────────────

/**
 * Persist a credential. The server encrypts with AES-256-GCM before storage;
 * subsequent reads return only { provider, alias, isActive, ... } — never the
 * secret material.
 *
 * body: {
 *   provider: string, alias: string,
 *   credentials: Record<string, unknown>,   // arbitrary secret blob
 *   isActive?: boolean
 * }
 */
export const upsertCredential = (body) =>
  sendRequest({
    url: cred,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const listCredentials = () =>
  sendRequest({ url: cred, method: "GET" });

// ── Phase 6 PR-7: rotate + revoke ────────────────────────────────────────────
// Rotation replaces the encrypted credential blob in place — the same row stays;
// only the secret changes. Plaintext never travels back, so the UI must
// re-collect the new secret from the operator.
//
// Revoke is a soft delete: the row stays for audit, but isActive flips false.

export const rotateCredential = (id, credentials) =>
  sendRequest({
    url: `${cred}/${id}/rotate`,
    method: "POST",
    data: { credentials },
    mutationId: true,
  });

export const revokeCredential = (id) =>
  sendRequest({
    url: `${cred}/${id}`,
    method: "DELETE",
    mutationId: true,
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const WEBHOOK_DELIVERY_STATUSES = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "RETRY_SCHEDULED",
  "DEAD",
];

export const WEBHOOK_STATUS_STYLE = {
  PENDING: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  SUCCESS: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  RETRY_SCHEDULED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  DEAD: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.24)" },
};
