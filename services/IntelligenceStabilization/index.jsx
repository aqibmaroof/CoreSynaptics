import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-10: Intelligence stabilization (PLATFORM-ONLY) ────────────────
// Tenant-scoped on the server. Rebuild + compact are destructive — the UI
// must confirm before invocation. The integrity report is read-only and
// surfaces cross-tenant edges as a warning.

const base = "/intelligence-stabilization";

export const integrityReport = () =>
  sendRequest({ url: `${base}/integrity`, method: "GET" });

/** body: { cxProjectId } */
export const rebuildIntelligence = (cxProjectId) =>
  sendRequest({
    url: `${base}/rebuild`,
    method: "POST",
    data: { cxProjectId },
    mutationId: true,
  });

/** params: { keepDays? } — default 90 */
export const compactPredictions = (keepDays = 90) =>
  sendRequest({
    url: `${base}/compact`,
    method: "POST",
    params: { keepDays },
    mutationId: true,
  });
