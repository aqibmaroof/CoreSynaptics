import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch C3: Per-asset turnover bundle ───────────────────────────
// Render bundle.summary.* counts verbatim. readinessScore is server-computed
// as (passingTests / totalTests) * 100 — the browser must not recompute.

export const assetTurnoverBundle = (assetId) =>
  sendRequest({
    url: `/turnover/asset/${encodeURIComponent(assetId)}/bundle`,
    method: "GET",
  });
