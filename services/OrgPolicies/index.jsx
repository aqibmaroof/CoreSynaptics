import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-6: Org policy configuration ───────────────────────────────────
// Versioned policies that automation rules, approval templates, escalation
// timers and turnover gates consume. `config` is JSON — server-validated by
// consumers, not by the policy endpoint itself.

const base = "/org-policies";

/**
 * params: { policyType?, isActive?, limit? }
 */
export const listOrgPolicies = (params = {}) =>
  sendRequest({ url: base, method: "GET", params });

export const getOrgPolicy = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

/**
 * Upserts a policy. If a row with the same (policyType, key) exists, this
 * creates a NEW version and bumps `version`. Old versions stay readable for
 * audit.
 *
 * body: {
 *   policyType: 'SLA'|'ESCALATION'|'APPROVAL'|'AUTOMATION'|'NOTIFICATION'|'TURNOVER_GATE',
 *   key: string,
 *   config: Record<string, unknown>,
 *   isActive?: boolean
 * }
 */
export const upsertOrgPolicy = (body) =>
  sendRequest({
    url: base,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const setOrgPolicyActive = (id, isActive) =>
  sendRequest({
    url: `${base}/${id}/active`,
    method: "PATCH",
    data: { isActive },
    mutationId: true,
  });

export const ORG_POLICY_TYPES = [
  "SLA",
  "ESCALATION",
  "APPROVAL",
  "AUTOMATION",
  "NOTIFICATION",
  "TURNOVER_GATE",
];

export const ORG_POLICY_HINT = {
  SLA: 'e.g. { "category": "qa", "respondWithinHours": 24 }',
  ESCALATION: 'e.g. { "afterHours": 48, "level": 2 }',
  APPROVAL: 'e.g. { "template": "submittal-2step" }',
  AUTOMATION: 'e.g. { "throttlePerMinute": 60 }',
  NOTIFICATION: 'e.g. { "digestHour": 9 }',
  TURNOVER_GATE: 'e.g. { "minReadinessPct": 95 }',
};
