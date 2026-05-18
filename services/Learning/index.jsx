import sendRequest from "../instance/sendRequest";

// ── Phase 12: Training, Simulation & Operational Learning ───────────────────
// Tenant-scoped read-side intelligence + state transitions on the four new
// projections (SimulationRun, SimulationOutcome, GuidedExecutionSession,
// CompetencyRecord). NEVER recompute scoring, competency derivation, replay
// ordering, scenario step parsing, or explainability on the client.

// ─── Scenarios (PR-2) ────────────────────────────────────────────────────────

const simBase = "/simulations";

/** params: { role?, difficulty?, limit? } */
export const listScenarios = (params = {}) =>
  sendRequest({ url: `${simBase}/scenarios`, method: "GET", params });

export const getScenario = (scenarioId) =>
  sendRequest({
    url: `${simBase}/scenarios/${encodeURIComponent(scenarioId)}`,
    method: "GET",
  });

// ─── Simulation runs (PR-2) ──────────────────────────────────────────────────

/**
 * Start a run. Pass `idempotencyKey` on retry — server is idempotent on it.
 * body: { scenarioId, cxProjectId?, idempotencyKey? }
 */
export const startSimulationRun = (body) =>
  sendRequest({
    url: `${simBase}/runs`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { status?, limit? } */
export const listSimulationRuns = (params = {}) =>
  sendRequest({ url: `${simBase}/runs`, method: "GET", params });

export const getSimulationRun = (runId) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}`,
    method: "GET",
  });

/**
 * Advance the run by one step. Server is strictly monotonic — sending the
 * same step twice returns 400. The UI MUST disable the button while pending.
 * body: { decision, evidence?, elapsedMs? }
 */
export const advanceSimulationRun = (runId, body) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}/advance`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const pauseSimulationRun = (runId) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}/pause`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const resumeSimulationRun = (runId) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}/resume`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const abortSimulationRun = (runId, reason) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}/abort`,
    method: "POST",
    data: { reason },
    mutationId: true,
  });

/** Instructor / admin only — server enforces. */
export const injectSimulationEvent = (runId, body) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}/inject`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** Idempotent. Re-finalising returns the existing outcome. */
export const finalizeSimulationRun = (runId) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}/finalize`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const replaySimulationRun = (runId) =>
  sendRequest({
    url: `${simBase}/runs/${encodeURIComponent(runId)}/replay`,
    method: "GET",
  });

// ─── Guided execution (PR-3) ─────────────────────────────────────────────────

const guidedBase = "/guided-execution";

/**
 * Snapshot the recommendation steps at start. The session retains the
 * snapshot even if the upstream recommendation regenerates.
 * body: { flowKey, steps: RecommendationStep[], cxProjectId?,
 *         sourceRecommendationId?, targetEntity? }
 */
export const startGuidedSession = (body) =>
  sendRequest({
    url: `${guidedBase}/sessions`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { status?, flowKey?, limit? } */
export const listGuidedSessions = (params = {}) =>
  sendRequest({ url: `${guidedBase}/sessions`, method: "GET", params });

export const getGuidedSession = (sessionId) =>
  sendRequest({
    url: `${guidedBase}/sessions/${encodeURIComponent(sessionId)}`,
    method: "GET",
  });

/**
 * Advance to the NEXT ordinal only. Skipping ordinals returns 400.
 * body: { ordinal, evidence?, note? }
 */
export const advanceGuidedSession = (sessionId, body) =>
  sendRequest({
    url: `${guidedBase}/sessions/${encodeURIComponent(sessionId)}/advance`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const pauseGuidedSession = (sessionId) =>
  sendRequest({
    url: `${guidedBase}/sessions/${encodeURIComponent(sessionId)}/pause`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const resumeGuidedSession = (sessionId) =>
  sendRequest({
    url: `${guidedBase}/sessions/${encodeURIComponent(sessionId)}/resume`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** Sticky terminal state — abandoned sessions cannot be resumed. */
export const abandonGuidedSession = (sessionId, reason) =>
  sendRequest({
    url: `${guidedBase}/sessions/${encodeURIComponent(sessionId)}/abandon`,
    method: "POST",
    data: { reason },
    mutationId: true,
  });

// ─── Competency (PR-4) ───────────────────────────────────────────────────────

/**
 * Costly upsert over ~1500 rows of evidence — call after a known evidence
 * change (cert update, simulation finalize), NOT on every render.
 */
export const recomputeCompetency = (userId) =>
  sendRequest({
    url: `/competency/users/${encodeURIComponent(userId)}/recompute`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const listCompetency = (userId) =>
  sendRequest({
    url: `/competency/users/${encodeURIComponent(userId)}`,
    method: "GET",
  });

/** params: { roleName?, targetLevel?, limit? } */
export const detectSkillGaps = (params = {}) =>
  sendRequest({ url: `/competency/gaps`, method: "GET", params });

// ─── Coaching (PR-6) ─────────────────────────────────────────────────────────

/** params: { limit? } */
export const coachingForUser = (userId, params = {}) =>
  sendRequest({
    url: `/learning/coaching/users/${encodeURIComponent(userId)}`,
    method: "GET",
    params,
  });

// ─── Governance (PR-8) ───────────────────────────────────────────────────────

/** params: { roleName?, limit? } */
export const governanceForUser = (userId, params = {}) =>
  sendRequest({
    url: `/learning/governance/users/${encodeURIComponent(userId)}`,
    method: "GET",
    params,
  });

// ─── Analytics (PR-7) ────────────────────────────────────────────────────────

export const learningKpis = () =>
  sendRequest({ url: `/learning/analytics/kpis`, method: "GET" });

export const simulationTrend = () =>
  sendRequest({ url: `/learning/analytics/simulation-trend`, method: "GET" });

export const scenarioWeakness = () =>
  sendRequest({
    url: `/learning/analytics/scenario-weakness`,
    method: "GET",
  });

export const competencyHeatmap = () =>
  sendRequest({
    url: `/learning/analytics/competency-heatmap`,
    method: "GET",
  });

export const certificationRisk = () =>
  sendRequest({
    url: `/learning/analytics/certification-risk`,
    method: "GET",
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const SIMULATION_RUN_STATUSES = [
  "PENDING",
  "RUNNING",
  "PAUSED",
  "ABORTED",
  "COMPLETED",
  "FAILED",
];

export const SIMULATION_OUTCOME_KINDS = [
  "SUCCESS",
  "PARTIAL",
  "FAILURE",
  "TIMEOUT",
  "ABORTED",
];

export const COMPETENCY_LEVELS = [
  "NOVICE",
  "INTERMEDIATE",
  "PROFICIENT",
  "EXPERT",
];

export const GUIDED_EXECUTION_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "COMPLETED",
  "ABANDONED",
];

export const DEFAULT_DECISIONS = [
  "PROCEED",
  "ESCALATE",
  "REJECT",
  "DEFER",
];

export const SIM_STATUS_STYLE = {
  PENDING: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  RUNNING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  PAUSED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  COMPLETED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  ABORTED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const OUTCOME_KIND_STYLE = {
  SUCCESS: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  PARTIAL: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  FAILURE: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  TIMEOUT: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  ABORTED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const COMPETENCY_LEVEL_STYLE = {
  NOVICE: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  INTERMEDIATE: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  PROFICIENT: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  EXPERT: {
    color: "var(--rf-purple, #8b5cf6)",
    bg: "rgba(139,92,246,0.16)",
  },
};

export const GUIDED_STATUS_STYLE = {
  ACTIVE: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  PAUSED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  COMPLETED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  ABANDONED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

// Client-side helper to filter coaching recs by lens (server tags
// recommendations but does NOT pre-filter — see §4 of v12 spec).
export const filterForLens = (recs, lens) => {
  if (!lens || !Array.isArray(recs)) return recs ?? [];
  return recs.filter(
    (r) => !r.lenses?.length || r.lenses.includes(lens)
  );
};
