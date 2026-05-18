import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-3: Operational copilot ────────────────────────────────────────
// Structured operational guidance — NOT a chatbot. Returns typed `kind`,
// `priority`, `targetEntity`, `rationale[]`. Render as inputs to existing
// components, not as free-form text. No LLM call; deterministic rules.

const base = "/copilot";

/** params: { lens? } */
export const getInbox = (lens) =>
  sendRequest({ url: `${base}/inbox`, method: "GET", params: { lens } });

export const getBlockers = (entityType, entityId) =>
  sendRequest({
    url: `${base}/blockers`,
    method: "GET",
    params: { entityType, entityId },
  });

export const getReadinessGuidance = (cxProjectId) =>
  sendRequest({
    url: `${base}/readiness-guidance`,
    method: "GET",
    params: { cxProjectId },
  });

export const getContextHint = (entityType, entityId) =>
  sendRequest({
    url: `${base}/context-hint`,
    method: "GET",
    params: { entityType, entityId },
  });

/** May return null. */
export const getEscalationSuggestion = (entityType, entityId) =>
  sendRequest({
    url: `${base}/escalation-suggestion`,
    method: "GET",
    params: { entityType, entityId },
  });

// ── Phase 10: Operational Copilot & Recommendation Engine ────────────────────
// v10 is a strict superset of v7. Every endpoint accepts `lens=…` and
// returns RecommendationPage { organizationId, cxProjectId, lens, evaluatedAt,
// recommendations: OperationalRecommendation[] }. Each recommendation carries
// the same ExplainabilityBundle shape as a Phase-9 prediction, plus an
// optional `steps[]` for guided flows.
//
// Deterministic id: `rec_<sha1>` — stable across requests for the same state.
// 404 on /explain means the underlying state changed; refresh the list.

const v10 = "/copilot";

/** GET /copilot/next-actions ?cxProjectId&lens&limit */
export const nextActions = (params = {}) =>
  sendRequest({ url: `${v10}/next-actions`, method: "GET", params });

/** GET /copilot/recommendations ?cxProjectId&lens&limit */
export const recommendations = (params = {}) =>
  sendRequest({ url: `${v10}/recommendations`, method: "GET", params });

/** GET /copilot/project/:cxProjectId ?lens&limit */
export const projectRecommendations = (cxProjectId, params = {}) =>
  sendRequest({
    url: `${v10}/project/${cxProjectId}`,
    method: "GET",
    params,
  });

/** GET /copilot/blockers/:cxProjectId ?lens&limit */
export const blockersForProject = (cxProjectId, params = {}) =>
  sendRequest({
    url: `${v10}/blockers/${cxProjectId}`,
    method: "GET",
    params,
  });

/** GET /copilot/escalations/:cxProjectId ?lens&limit */
export const escalationsForProject = (cxProjectId, params = {}) =>
  sendRequest({
    url: `${v10}/escalations/${cxProjectId}`,
    method: "GET",
    params,
  });

/** GET /copilot/readiness/:cxProjectId ?lens&limit */
export const readinessForProject = (cxProjectId, params = {}) =>
  sendRequest({
    url: `${v10}/readiness/${cxProjectId}`,
    method: "GET",
    params,
  });

/** GET /copilot/entity/:type/:id ?lens&limit */
export const entityRecommendations = (entityType, entityId, params = {}) =>
  sendRequest({
    url: `${v10}/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
    method: "GET",
    params,
  });

/** GET /copilot/portfolio ?perProjectLimit&lens */
export const portfolioRecommendations = (params = {}) =>
  sendRequest({ url: `${v10}/portfolio`, method: "GET", params });

/**
 * GET /copilot/recommendations/:id/explain ?cxProjectId
 * Returns ExplainableRecommendationView (= OperationalRecommendation).
 * 404 means the recommendation is no longer current.
 */
export const explainRecommendation = (id, cxProjectId) =>
  sendRequest({
    url: `${v10}/recommendations/${id}/explain`,
    method: "GET",
    params: cxProjectId ? { cxProjectId } : {},
  });

// ─── Constants ───────────────────────────────────────────────────────────────

// v15 expanded the registry to 20 server-owned lenses. LensFilter pulls the
// authoritative list from `/lenses`; this static array is the seed/fallback.
// Keep the legacy v10 keys (pm/exec/field/oem/qa) so older surfaces that read
// them statically still work.
export const COPILOT_LENSES = [
  // legacy v10
  "pm",
  "exec",
  "field",
  "oem",
  "qa",
  "procurement",
  // v15 expansion — GC
  "gc_pm",
  "gc_sup",
  "gc_qaqc",
  "gc_procurement",
  "gc_engineering",
  // shared
  "safety",
  "finance",
  // v15 expansion — OEM / Field
  "oem_pm",
  "oem_qaqc",
  "fsm",
  "fse",
  // v15 expansion — customer / trade / specialist
  "customer",
  "customer_qaqc",
  "trade",
  "trade_qaqc_e",
  "trade_qaqc_m",
  "trade_field",
  "cxa",
  "bms",
  "generic",
];

export const RECOMMENDATION_LENS_LABEL = {
  // legacy
  pm: "PM",
  exec: "Exec",
  field: "Field",
  oem: "OEM",
  safety: "Safety",
  qa: "QA",
  procurement: "Procurement",
  // v15 expansion
  gc_pm: "GC PM",
  gc_sup: "GC Superintendent",
  gc_qaqc: "GC QA/QC",
  gc_procurement: "GC Procurement",
  gc_engineering: "GC Engineering",
  finance: "Finance",
  oem_pm: "OEM PM",
  oem_qaqc: "OEM QA/QC",
  fsm: "Field Service Manager",
  fse: "Field Service Engineer",
  customer: "Customer",
  customer_qaqc: "Customer QA/QC",
  trade: "Trade",
  trade_qaqc_e: "Trade QA/QC · E",
  trade_qaqc_m: "Trade QA/QC · M",
  trade_field: "Trade Field",
  cxa: "CxA",
  bms: "BMS",
  generic: "Generic",
};

// v7 + v10 + v11 kinds. Keep this list as the canonical union — render any
// unknown kind as the raw string with a neutral chip.
export const COPILOT_RECOMMENDATION_KINDS = [
  "NEXT_BEST_ACTION",
  "BLOCKER_GUIDANCE",
  "READINESS_GUIDANCE",
  "ESCALATION_SUGGESTION",
  "CONTEXT_HINT",
  // v10
  "PROCUREMENT_FOLLOWUP",
  "WORKFORCE_ACTION",
  "QA_FOLLOWUP",
  "TURNOVER_READINESS",
  "OPERATIONAL_RECOVERY",
  "GUIDED_FLOW",
  // v11
  "POLICY_TUNING",
  "AUTOMATION_OPTIMIZATION",
  "ESCALATION_POLICY_TUNING",
  // v12
  "COACHING_GUIDANCE",
  "SKILL_GAP_GUIDANCE",
  "RETRAINING_GUIDANCE",
  // v13
  "INTEGRATION_RELIABILITY",
  "SYNC_RISK",
  "CONNECTOR_OPTIMIZATION",
  "FEDERATION_GUIDANCE",
  // v14
  "RETENTION_RISK",
  "COMPLIANCE_RISK",
  "REPLAY_RISK",
  "ARCHIVAL_OPTIMIZATION",
  "RESILIENCY_GUIDANCE",
  "LIFECYCLE_GUIDANCE",
];

export const RECOMMENDATION_KIND_LABEL = {
  NEXT_BEST_ACTION: "Next best action",
  BLOCKER_GUIDANCE: "Blocker",
  READINESS_GUIDANCE: "Readiness",
  ESCALATION_SUGGESTION: "Escalate",
  CONTEXT_HINT: "Context",
  PROCUREMENT_FOLLOWUP: "Procurement follow-up",
  WORKFORCE_ACTION: "Workforce",
  QA_FOLLOWUP: "QA follow-up",
  TURNOVER_READINESS: "Turnover readiness",
  OPERATIONAL_RECOVERY: "Recovery",
  GUIDED_FLOW: "Guided flow",
  // v11
  POLICY_TUNING: "Policy tuning",
  AUTOMATION_OPTIMIZATION: "Optimization",
  ESCALATION_POLICY_TUNING: "Escalation tuning",
  // v12
  COACHING_GUIDANCE: "Coaching",
  SKILL_GAP_GUIDANCE: "Skill gap",
  RETRAINING_GUIDANCE: "Retraining",
  // v13
  INTEGRATION_RELIABILITY: "Reliability",
  SYNC_RISK: "Sync risk",
  CONNECTOR_OPTIMIZATION: "Connector optimization",
  FEDERATION_GUIDANCE: "Federation",
  // v14
  RETENTION_RISK: "Retention risk",
  COMPLIANCE_RISK: "Compliance risk",
  REPLAY_RISK: "Replay risk",
  ARCHIVAL_OPTIMIZATION: "Archival",
  RESILIENCY_GUIDANCE: "Resiliency",
  LIFECYCLE_GUIDANCE: "Lifecycle",
};

export const COPILOT_PRIORITY_STYLE = {
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  HIGH: { color: "var(--rf-yellow, #f59e0b)", bg: "rgba(245,158,11,0.16)" },
  NORMAL: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  LOW: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};
