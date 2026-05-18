import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch D: Anomaly suppression ──────────────────────────────────
// Server accepts 1m–30d. Anomaly detectors still run; suppressed detections
// just skip the inbox + feed. After expiry the fingerprint re-surfaces.

const base = "/anomalies/suppressions";

/** body: { kind, fingerprint, minutes, reason? } */
export const createSuppression = (body) =>
  sendRequest({
    url: base,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const deleteSuppression = (kind, fingerprint) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(kind)}/${encodeURIComponent(fingerprint)}`,
    method: "DELETE",
    mutationId: true,
  });

export const listSuppressions = () =>
  sendRequest({ url: base, method: "GET" });
