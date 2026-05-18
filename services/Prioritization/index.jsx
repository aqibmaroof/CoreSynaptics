import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-5: Adaptive prioritization ────────────────────────────────────
// Drop-in replacement for the v3 next-action sort. Same NextAction shape,
// plus adaptiveScore + score-breakdown fields:
//   { baseScore, lensBoost, dependencyBoost, predictionBoost, adaptiveScore, rationale[] }
// Render `rationale` so users understand why an item ranked where it did.

const base = "/prioritization";

/**
 * params: { lens?, cxProjectId?, limit? }
 * Returns: { evaluatedAt, actions: AdaptiveAction[] }
 */
export const adaptiveActions = (params = {}) =>
  sendRequest({ url: `${base}/actions`, method: "GET", params });

/**
 * params: { lens?, perProjectLimit?, limit? }
 * Returns: { evaluatedAt, perProjectLimit, actions: AdaptiveAction[] }
 */
export const portfolioActions = (params = {}) =>
  sendRequest({ url: `${base}/portfolio`, method: "GET", params });

export const ADAPTIVE_PRIORITY_STYLE = {
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  HIGH: { color: "var(--rf-yellow, #f59e0b)", bg: "rgba(245,158,11,0.16)" },
  NORMAL: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  LOW: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};
