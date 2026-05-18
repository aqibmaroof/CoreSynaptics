import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch C1: Power-flow simulator ────────────────────────────────
// Server-side deterministic engine. Collect operator decisions client-side
// and POST them to /submit; render trace[] verbatim. Replay returns the exact
// same outcome the original submit produced — never re-grade in the browser.

const base = "/power-flow";

export const listPowerFlowScenarios = () =>
  sendRequest({ url: `${base}/scenarios`, method: "GET" });

/**
 * body: Omit<PowerFlowScenarioDto, 'id' | 'organizationId'>
 */
export const createPowerFlowScenario = (body) =>
  sendRequest({
    url: `${base}/scenarios`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const startPowerFlowRun = (scenarioId) =>
  sendRequest({
    url: `${base}/scenarios/${encodeURIComponent(scenarioId)}/runs`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** body: { decisions } — order ascending by atTick before sending. */
export const submitPowerFlowRun = (runId, decisions) =>
  sendRequest({
    url: `${base}/runs/${encodeURIComponent(runId)}/submit`,
    method: "POST",
    data: { decisions },
    mutationId: true,
  });

export const replayPowerFlowRun = (runId) =>
  sendRequest({
    url: `${base}/runs/${encodeURIComponent(runId)}/replay`,
    method: "GET",
  });

export const POWER_FLOW_DIFFICULTIES = [
  "BEGINNER",
  "INTERMEDIATE",
  "EXPERT",
];

export const POWER_FLOW_RUN_STATUSES = ["RUNNING", "COMPLETED", "ABORTED"];

export const POWER_NODE_KINDS = [
  "UTILITY",
  "GENERATOR",
  "ATS",
  "BREAKER",
  "TRANSFORMER",
  "SWITCHGEAR",
  "PDU",
  "UPS",
  "LOAD",
  "BUSWAY",
];
