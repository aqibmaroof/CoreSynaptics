import sendRequest from "../instance/sendRequest";

// ── Phase 11: Adaptive Automation & Policy Intelligence ─────────────────────
// Read-only intelligence over the existing automation/policy/approval modules
// plus a handful of policy-versioning write endpoints that route through the
// canonical approvals pipeline. NEVER recompute health / conflicts / loops /
// diffs / explainability / policy-resolution on the client — call the API.

const base = "/automation/intelligence";

// ─── Reads ───────────────────────────────────────────────────────────────────

/** GET /automation/intelligence ?lens — top-level summary + topRecommendations */
export const automationSummary = (lens) =>
  sendRequest({ url: base, method: "GET", params: lens ? { lens } : {} });

/** GET /automation/intelligence/health — deep health detail */
export const automationHealthDetail = () =>
  sendRequest({ url: `${base}/health`, method: "GET" });

/** GET /automation/intelligence/recommendations ?lens&limit — merged stream */
export const automationRecommendations = (params = {}) =>
  sendRequest({
    url: `${base}/recommendations`,
    method: "GET",
    params,
  });

/** GET /automation/intelligence/policies — policy inventory flat list */
export const automationPolicies = () =>
  sendRequest({ url: `${base}/policies`, method: "GET" });

/** GET /automation/intelligence/optimization ?lens&limit — optimization recs */
export const automationOptimization = (params = {}) =>
  sendRequest({
    url: `${base}/optimization`,
    method: "GET",
    params,
  });

/** GET /automation/intelligence/governance — inventory + deps + audit */
export const automationGovernance = () =>
  sendRequest({ url: `${base}/governance`, method: "GET" });

/** GET /automation/intelligence/explain/:executionId ?lens */
export const automationExplainExecution = (executionId, lens) =>
  sendRequest({
    url: `${base}/explain/${encodeURIComponent(executionId)}`,
    method: "GET",
    params: lens ? { lens } : {},
  });

/** GET /automation/intelligence/policy-preview/:ruleId ?lens&cxProjectId */
export const policyPreviewForRule = (ruleId, params = {}) =>
  sendRequest({
    url: `${base}/policy-preview/${encodeURIComponent(ruleId)}`,
    method: "GET",
    params,
  });

/** GET /automation/intelligence/policy-revisions/:policyType/:key */
export const policyRevisions = (policyType, key) =>
  sendRequest({
    url: `${base}/policy-revisions/${encodeURIComponent(policyType)}/${encodeURIComponent(key)}`,
    method: "GET",
  });

/** GET /automation/intelligence/policy-diff/:policyType/:key?from&to */
export const policyDiff = (policyType, key, from, to) =>
  sendRequest({
    url: `${base}/policy-diff/${encodeURIComponent(policyType)}/${encodeURIComponent(key)}`,
    method: "GET",
    params: { from, to },
  });

// ─── Writes (route through existing governance/approvals) ────────────────────

/**
 * Rollback creates a NEW version copying the targeted config. Confirm before
 * firing. body: { changeNote? }
 */
export const policyRollback = (policyType, key, version, body = {}) =>
  sendRequest({
    url: `${base}/policy-rollback/${encodeURIComponent(policyType)}/${encodeURIComponent(key)}/${version}`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/**
 * Schedule a future activation. activateAt MUST be ≥ now + 1 minute.
 * body: { config, activateAt: ISO, changeNote? }
 */
export const policySchedule = (policyType, key, body) =>
  sendRequest({
    url: `${base}/policy-schedule/${encodeURIComponent(policyType)}/${encodeURIComponent(key)}`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** Bind an existing ApprovalChainRow.id (do NOT create a new chain). */
export const policyAttachApproval = (policyVersionId, approvalChainId) =>
  sendRequest({
    url: `${base}/policy-attach-approval/${encodeURIComponent(policyVersionId)}`,
    method: "POST",
    data: { approvalChainId },
    mutationId: true,
  });

/** Manual override of the cron promoter; idempotent server-side. */
export const policyPromote = (policyVersionId) =>
  sendRequest({
    url: `${base}/policy-promote/${encodeURIComponent(policyVersionId)}`,
    method: "POST",
    data: {},
    mutationId: true,
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const ORG_POLICY_TYPES = [
  "SLA",
  "ESCALATION",
  "APPROVAL",
  "AUTOMATION",
  "NOTIFICATION",
  "TURNOVER_GATE",
];

export const HEALTH_STYLE = {
  GREEN: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  YELLOW: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const POLICY_SCOPE_STYLE = {
  ORGANIZATION: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  LENS: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  PROJECT: {
    color: "var(--rf-purple, #8b5cf6)",
    bg: "rgba(139,92,246,0.16)",
  },
};

// Conflict kind labels (rendered as-is — do not re-derive on client).
export const CONFLICT_KIND_LABEL = {
  SAME_EVENT_DIFFERENT_RULES: "Same event · different rules",
  CONTRADICTORY_ACTIONS: "Contradictory actions",
  REDUNDANT_RULES: "Redundant rules",
};

export const DEAD_CHAIN_REASON_LABEL = {
  NO_EXECUTIONS_60D: "No executions in 60 days",
  ALL_FAILURES: "All recent runs failed",
  NEVER_SUCCEEDED: "Never succeeded",
};

// v11 adds three new recommendation kinds layered over v10.
export const V11_RECOMMENDATION_KIND_LABEL = {
  POLICY_TUNING: "Policy tuning",
  AUTOMATION_OPTIMIZATION: "Optimization",
  ESCALATION_POLICY_TUNING: "Escalation tuning",
};
