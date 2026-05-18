import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-1: Workflow automation engine ─────────────────────────────────
// Org-wide automation rules. EVENT/SCHEDULE/CONDITION triggers ⇒ N actions.
//
// AutomationRule {
//   id, organizationId, name, description,
//   trigger: 'EVENT'|'SCHEDULE'|'CONDITION',
//   eventName, cronExpr,
//   conditions, actions: AutomationAction[],
//   idempotent, isActive, createdBy, createdAt, updatedAt
// }
//
// AutomationAction { kind, params }
//   kind: EMIT_EVENT | RECORD_OP_EVENT | NOTIFY | ESCALATE |
//         WEBHOOK_DISPATCH | APPROVAL_REQUEST | RECORD_AUDIT
//
// AutomationExecution {
//   id, ruleId, status: 'PENDING'|'RUNNING'|'SUCCEEDED'|'FAILED'|'SKIPPED',
//   startedAt, finishedAt, sourceEventName, sourceEventId,
//   actionResults: [{ kind, ok, error?, details? }], error
// }

const base = "/automation";

// ─── Rules ───────────────────────────────────────────────────────────────────

export const listAutomationRules = (params = {}) =>
  sendRequest({ url: `${base}/rules`, method: "GET", params });

export const getAutomationRule = (id) =>
  sendRequest({ url: `${base}/rules/${id}`, method: "GET" });

export const createAutomationRule = (payload) =>
  sendRequest({
    url: `${base}/rules`,
    method: "POST",
    data: payload,
    mutationId: true,
  });

export const updateAutomationRule = (id, payload) =>
  sendRequest({
    url: `${base}/rules/${id}`,
    method: "PATCH",
    data: payload,
    mutationId: true,
  });

export const deleteAutomationRule = (id) =>
  sendRequest({
    url: `${base}/rules/${id}`,
    method: "DELETE",
    mutationId: true,
  });

// ─── Executions ──────────────────────────────────────────────────────────────

export const listAutomationExecutions = (params = {}) =>
  sendRequest({ url: `${base}/executions`, method: "GET", params });

// ─── Debug fire (dry-run with hand-built fact) ───────────────────────────────

/**
 * Fire a rule with an arbitrary fact bag. Used for debugging — production
 * triggering goes through the backend dispatcher. Returns { executionId }.
 */
export const fireAutomationRule = (id, fact) =>
  sendRequest({
    url: `${base}/rules/${id}/fire`,
    method: "POST",
    data: { fact },
    mutationId: true,
  });

// ─── Constants for the rule editor UI ────────────────────────────────────────

export const AUTOMATION_TRIGGERS = ["EVENT", "SCHEDULE", "CONDITION"];

export const AUTOMATION_ACTION_KINDS = [
  "EMIT_EVENT",
  "RECORD_OP_EVENT",
  "NOTIFY",
  "ESCALATE",
  "WEBHOOK_DISPATCH",
  "APPROVAL_REQUEST",
  "RECORD_AUDIT",
];

export const AUTOMATION_EXEC_STATUSES = [
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "SKIPPED",
];

export const CONDITION_OPS = [
  "eq",
  "neq",
  "in",
  "nin",
  "gt",
  "gte",
  "lt",
  "lte",
  "contains",
  "exists",
];

export const AUTOMATION_EXEC_BADGE = {
  PENDING: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  RUNNING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  SUCCEEDED: "bg-green-500/20 text-green-300 border-green-500/30",
  FAILED: "bg-red-500/20 text-red-300 border-red-500/30",
  SKIPPED: "bg-gray-600/30 text-gray-400 border-gray-600/40",
};

// ── Phase 7 PR-7: Automation intelligence ────────────────────────────────────
// Health / conflicts / recommendations roll up data the engine already
// collects. Read-only — recommendations are SUGGESTIONS, never auto-applied.

/** Returns: AutomationRuleHealth[] */
export const automationHealth = () =>
  sendRequest({ url: `${base}/health`, method: "GET" });

/** Returns: AutomationConflict[] (grouped by eventName) */
export const automationConflicts = () =>
  sendRequest({ url: `${base}/conflicts`, method: "GET" });

/** Returns: AutomationRecommendation[] */
export const automationRecommendations = () =>
  sendRequest({ url: `${base}/recommendations`, method: "GET" });

export const AUTOMATION_HEALTH_STYLE = {
  GREEN: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  YELLOW: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const AUTOMATION_RECOMMENDATION_KINDS = [
  "NEW_RULE_SUGGESTION",
  "DEACTIVATE_SUGGESTION",
  "CONFLICT_NOTE",
];
