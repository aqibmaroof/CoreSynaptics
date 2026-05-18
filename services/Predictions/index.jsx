import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-4: Predictions ────────────────────────────────────────────────
// Typed, severity-tagged forecasts. The endpoint enforces `supersededAt = null`
// — only live predictions are returned. `compute` is idempotent; safe to call
// after a milestone for an immediate refresh.

const base = "/predictions";

const csv = (xs) => (Array.isArray(xs) && xs.length ? xs.join(",") : undefined);

/**
 * params: { cxProjectId?, kinds?: PredictionKind[], minSeverity?, limit? }
 * Returns: Prediction[]
 */
export const listPredictions = (params = {}) =>
  sendRequest({
    url: base,
    method: "GET",
    params: {
      cxProjectId: params.cxProjectId,
      minSeverity: params.minSeverity,
      limit: params.limit,
      kinds: csv(params.kinds),
    },
  });

/** Returns: { generated } */
export const computePredictions = (cxProjectId) =>
  sendRequest({
    url: `${base}/compute`,
    method: "POST",
    data: { cxProjectId },
    mutationId: true,
  });

// ── Phase 9 PR-2..7: project-scoped predictive views ─────────────────────────
// All five endpoints return ProjectPredictionView { cxProjectId, evaluatedAt,
// kinds[], predictions[] }. `limit` clamped 1..500 server-side, default 100.

const cxBase = (id) => `/cx-projects/${id}/predictions`;

export const projectReadinessPredictions = (cxProjectId, limit) =>
  sendRequest({
    url: `${cxBase(cxProjectId)}/readiness`,
    method: "GET",
    params: limit ? { limit } : {},
  });

export const projectDriftPredictions = (cxProjectId, limit) =>
  sendRequest({
    url: `${cxBase(cxProjectId)}/drift`,
    method: "GET",
    params: limit ? { limit } : {},
  });

export const projectProcurementRisk = (cxProjectId, limit) =>
  sendRequest({
    url: `${cxBase(cxProjectId)}/procurement`,
    method: "GET",
    params: limit ? { limit } : {},
  });

export const projectWorkforceForecast = (cxProjectId, limit) =>
  sendRequest({
    url: `${cxBase(cxProjectId)}/workforce`,
    method: "GET",
    params: limit ? { limit } : {},
  });

export const projectEscalationForecast = (cxProjectId, limit) =>
  sendRequest({
    url: `${cxBase(cxProjectId)}/escalation`,
    method: "GET",
    params: limit ? { limit } : {},
  });

/** params: { status?, limit? } — project-scoped anomalies (v9). */
export const projectAnomalies = (cxProjectId, params = {}) =>
  sendRequest({
    url: `${cxBase(cxProjectId)}/anomalies`,
    method: "GET",
    params,
  });

// ── Phase 9 PR-8: explainability ─────────────────────────────────────────────

/**
 * GET /predictions/:id/explain
 * Returns the prediction row + an ExplainabilityBundle:
 *   { schemaVersion, detector, rawScore, factors[], evidence[], lineage[]?,
 *     notes[]?, evaluatedAt }
 * Pre-Phase-9 rows return an empty bundle with detector: 'legacy'.
 */
export const explainPrediction = (predictionId) =>
  sendRequest({
    url: `${base}/${predictionId}/explain`,
    method: "GET",
  });

// ── Phase 9 PR-9: portfolio rollup ───────────────────────────────────────────

/** params: { perProjectLimit?, cxProjectIds? (csv) } */
export const portfolioPredictions = (params = {}) => {
  const csv =
    Array.isArray(params.cxProjectIds) && params.cxProjectIds.length
      ? params.cxProjectIds.join(",")
      : undefined;
  return sendRequest({
    url: `/portfolio/predictions`,
    method: "GET",
    params: {
      perProjectLimit: params.perProjectLimit,
      cxProjectIds: csv,
    },
  });
};

// ─── Constants ───────────────────────────────────────────────────────────────

// ── Phase 9 PR-1: extended union ────────────────────────────────────────────
export const PREDICTION_KINDS = [
  // v7
  "READINESS_TREND",
  "TURNOVER_RISK",
  "SCHEDULE_DRIFT",
  "PROCUREMENT_DELAY",
  "WORKFORCE_SHORTAGE",
  "ISSUE_RECURRENCE",
  "OPERATIONAL_RISK",
  // v9 additions
  "DEPENDENCY_CASCADE",
  "APPROVAL_DELAY_RISK",
  "OPERATIONAL_BOTTLENECK",
  "ESCALATION_LIKELIHOOD",
  "OPERATIONAL_DEGRADATION",
];

export const PREDICTION_KIND_LABEL = {
  // v7
  READINESS_TREND: "Readiness trend",
  TURNOVER_RISK: "Turnover risk",
  SCHEDULE_DRIFT: "Schedule drift",
  PROCUREMENT_DELAY: "Procurement delay",
  WORKFORCE_SHORTAGE: "Workforce shortage",
  ISSUE_RECURRENCE: "Issue recurrence",
  OPERATIONAL_RISK: "Operational risk",
  // v9
  DEPENDENCY_CASCADE: "Dependency cascade",
  APPROVAL_DELAY_RISK: "Approval delay risk",
  OPERATIONAL_BOTTLENECK: "Operational bottleneck",
  ESCALATION_LIKELIHOOD: "Escalation forecast",
  OPERATIONAL_DEGRADATION: "Operational degradation",
};

export const PREDICTION_FACTOR_DIRECTION_STYLE = {
  INCREASES_RISK: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  DECREASES_RISK: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  NEUTRAL: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const INTELLIGENCE_SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const SEVERITY_STYLE = {
  LOW: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  MEDIUM: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  HIGH: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};
