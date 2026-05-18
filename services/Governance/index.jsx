import sendRequest from "../instance/sendRequest";

// ── Phase 14: Final Governance, Compliance & Lifecycle Management ────────────
// Read-side governance state machines + admin transitions. NEVER recompute
// retention eligibility, hold counting, manifest signing, replay integrity
// hashing, lifecycle transitions, or continuity scoring on the client.
// Internal aggregates remain authoritative — Phase 14 only adds governance
// state on top.

// ─── PR-1: Retention policies ────────────────────────────────────────────────

const polBase = "/retention/policies";

/**
 * body: { entityType, key, retentionDays, archiveAfterDays,
 *         purgeAfterDays?, graceDays?, description? }
 * Server enforces archiveAfterDays <= retentionDays + graceDays.
 */
export const upsertRetentionPolicy = (body) =>
  sendRequest({
    url: polBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { entityType?, status?, limit? } */
export const listRetentionPolicies = (params = {}) =>
  sendRequest({ url: polBase, method: "GET", params });

export const getRetentionPolicy = (id) =>
  sendRequest({ url: `${polBase}/${encodeURIComponent(id)}`, method: "GET" });

export const retireRetentionPolicy = (id) =>
  sendRequest({
    url: `${polBase}/${encodeURIComponent(id)}/retire`,
    method: "POST",
    data: {},
    mutationId: true,
  });

// ─── PR-1: Archive ───────────────────────────────────────────────────────────

const archBase = "/archive/records";

/**
 * body: { entityType, entityId, cxProjectId?, rationale? }
 */
export const classifyEntityForArchival = (body) =>
  sendRequest({
    url: archBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { entityType?, state?, limit? } */
export const listArchivalRecords = (params = {}) =>
  sendRequest({ url: archBase, method: "GET", params });

export const dueForArchival = () =>
  sendRequest({ url: `${archBase}/due`, method: "GET" });

export const getArchivalRecord = (id) =>
  sendRequest({ url: `${archBase}/${encodeURIComponent(id)}`, method: "GET" });

export const markArchivalEligible = (id) =>
  sendRequest({
    url: `${archBase}/${encodeURIComponent(id)}/eligible`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const markArchivalArchived = (id) =>
  sendRequest({
    url: `${archBase}/${encodeURIComponent(id)}/archive`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const markArchivalPurged = (id) =>
  sendRequest({
    url: `${archBase}/${encodeURIComponent(id)}/purge`,
    method: "POST",
    data: {},
    mutationId: true,
  });

// ─── PR-2: Compliance holds ──────────────────────────────────────────────────

const holdBase = "/compliance/holds";

/**
 * body: { entityType, entityId, cxProjectId?, kind, reason,
 *         externalCaseRef?, releaseApprovalChainId?, expiresAt? }
 */
export const placeComplianceHold = (body) =>
  sendRequest({
    url: holdBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { status?, kind?, entityType?, entityId?, limit? } */
export const listComplianceHolds = (params = {}) =>
  sendRequest({ url: holdBase, method: "GET", params });

export const getComplianceHold = (id) =>
  sendRequest({ url: `${holdBase}/${encodeURIComponent(id)}`, method: "GET" });

/** body: { reason } */
export const releaseComplianceHold = (id, reason) =>
  sendRequest({
    url: `${holdBase}/${encodeURIComponent(id)}/release`,
    method: "POST",
    data: { reason },
    mutationId: true,
  });

// ─── PR-3: Audit / compliance exports ────────────────────────────────────────

const expBase = "/audit-exports";

/**
 * body: { scope, fromAt?, toAt?, entityTypes?: string[],
 *         eventNames?: string[], importExportJobId? }
 */
export const beginComplianceExport = (body) =>
  sendRequest({
    url: expBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { status?, limit? } */
export const listComplianceExports = (params = {}) =>
  sendRequest({ url: expBase, method: "GET", params });

export const getComplianceExport = (id) =>
  sendRequest({ url: `${expBase}/${encodeURIComponent(id)}`, method: "GET" });

export const completeComplianceExport = (id) =>
  sendRequest({
    url: `${expBase}/${encodeURIComponent(id)}/complete`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const failComplianceExport = (id, error) =>
  sendRequest({
    url: `${expBase}/${encodeURIComponent(id)}/fail`,
    method: "POST",
    data: { error },
    mutationId: true,
  });

export const cancelComplianceExport = (id) =>
  sendRequest({
    url: `${expBase}/${encodeURIComponent(id)}/cancel`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** body: { action, note? } */
export const appendCustodyEntry = (id, body) =>
  sendRequest({
    url: `${expBase}/${encodeURIComponent(id)}/custody`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** Returns: boolean — server-computed sha256 verification. */
export const verifyComplianceExport = (id) =>
  sendRequest({
    url: `${expBase}/${encodeURIComponent(id)}/verify`,
    method: "GET",
  });

// ─── PR-4: Replay governance ─────────────────────────────────────────────────

const repBase = "/replay/authorizations";

/**
 * body: { scope, reason, approvalChainId?, expiresAt?, filterEventName?,
 *         filterCxProjectId?, filterFromAt?, filterToAt? }
 */
export const requestReplayAuthorization = (body) =>
  sendRequest({
    url: repBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { status?, limit? } */
export const listReplayAuthorizations = (params = {}) =>
  sendRequest({ url: repBase, method: "GET", params });

export const getReplayAuthorization = (id) =>
  sendRequest({ url: `${repBase}/${encodeURIComponent(id)}`, method: "GET" });

export const approveReplayAuthorization = (id) =>
  sendRequest({
    url: `${repBase}/${encodeURIComponent(id)}/approve`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const rejectReplayAuthorization = (id) =>
  sendRequest({
    url: `${repBase}/${encodeURIComponent(id)}/reject`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const revokeReplayAuthorization = (id) =>
  sendRequest({
    url: `${repBase}/${encodeURIComponent(id)}/revoke`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const invokeReplay = (id) =>
  sendRequest({
    url: `${repBase}/${encodeURIComponent(id)}/invoke`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** params: { authorizationId?, status?, limit? } */
export const listReplayInvocations = (params = {}) =>
  sendRequest({ url: `/replay/invocations`, method: "GET", params });

// ─── PR-5: Tenant lifecycle ──────────────────────────────────────────────────

const lcBase = "/lifecycle/tenant";

export const getTenantLifecycle = () =>
  sendRequest({ url: lcBase, method: "GET" });

/**
 * body: { toState, reason?, approvalChainId?, metadata? }
 * Allowed transitions:
 *   ACTIVE → FROZEN | SUSPENDED | ARCHIVED
 *   FROZEN → ACTIVE | SUSPENDED | ARCHIVED
 *   SUSPENDED → ACTIVE | ARCHIVED
 *   ARCHIVED → ACTIVE | DECOMMISSIONED
 *   DECOMMISSIONED → (terminal — no transitions out)
 */
export const transitionTenantLifecycle = (body) =>
  sendRequest({
    url: `${lcBase}/transition`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** body: { approvalChainId } */
export const attachLifecycleApproval = (approvalChainId) =>
  sendRequest({
    url: `${lcBase}/attach-approval`,
    method: "PATCH",
    data: { approvalChainId },
    mutationId: true,
  });

export const listLifecycleEvents = () =>
  sendRequest({ url: `${lcBase}/events`, method: "GET" });

// ─── PR-6: Continuity ────────────────────────────────────────────────────────

/** body: { checkKind } */
export const runContinuityCheck = (checkKind) =>
  sendRequest({
    url: `/governance/continuity/run`,
    method: "POST",
    data: { checkKind },
    mutationId: true,
  });

export const runAllContinuityChecks = () =>
  sendRequest({
    url: `/governance/continuity/run-all`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** params: { checkKind?, status?, limit? } */
export const listContinuityChecks = (params = {}) =>
  sendRequest({
    url: `/governance/continuity/checks`,
    method: "GET",
    params,
  });

// ─── PR-7: DR drills + resiliency ────────────────────────────────────────────

const drBase = "/dr/drills";

/**
 * body: { kind, scenario, rtoSeconds?, rpoSeconds?, plannedAt? }
 */
export const planDRDrill = (body) =>
  sendRequest({
    url: drBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { kind?, status?, limit? } */
export const listDRDrills = (params = {}) =>
  sendRequest({ url: drBase, method: "GET", params });

export const getDRDrill = (id) =>
  sendRequest({ url: `${drBase}/${encodeURIComponent(id)}`, method: "GET" });

export const startDRDrill = (id) =>
  sendRequest({
    url: `${drBase}/${encodeURIComponent(id)}/start`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** body: { step, result: 'OK'|'WARN'|'FAIL', note? } */
export const appendDRDrillEvidence = (id, body) =>
  sendRequest({
    url: `${drBase}/${encodeURIComponent(id)}/evidence`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/**
 * body: { passed, measuredRtoSeconds?, measuredRpoSeconds?, notes? }
 * Completing a drill writes a resiliency score snapshot.
 */
export const completeDRDrill = (id, body) =>
  sendRequest({
    url: `${drBase}/${encodeURIComponent(id)}/complete`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const cancelDRDrill = (id) =>
  sendRequest({
    url: `${drBase}/${encodeURIComponent(id)}/cancel`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** params: { component? } */
export const listResiliencyScores = (component) =>
  sendRequest({
    url: `/resiliency/scores`,
    method: "GET",
    params: component ? { component } : {},
  });

export const resiliencySummary = () =>
  sendRequest({ url: `/resiliency/summary`, method: "GET" });

// ─── PR-8: Storage governance ────────────────────────────────────────────────

/**
 * body: { entityType, storageTier, retentionDays, costHintPerGb?,
 *         estimatedRows?, estimatedBytes? (BigInt-as-string) }
 * Metadata only — no data movement.
 */
export const upsertStorageGovernance = (body) =>
  sendRequest({
    url: `/governance/storage`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const listStorageGovernance = () =>
  sendRequest({ url: `/governance/storage`, method: "GET" });

export const storageProjections = () =>
  sendRequest({ url: `/governance/storage/projections`, method: "GET" });

// ─── PR-9: Governance recommendations ────────────────────────────────────────

/** params: { limit? } */
export const governanceRecommendations = (params = {}) =>
  sendRequest({
    url: `/governance/recommendations`,
    method: "GET",
    params,
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const RETENTION_POLICY_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUPERSEDED",
  "RETIRED",
];

export const ARCHIVAL_STATES = [
  "ACTIVE",
  "ELIGIBLE",
  "ARCHIVED",
  "PURGED",
  "HELD",
];

export const COMPLIANCE_HOLD_KINDS = [
  "LEGAL",
  "REGULATORY",
  "AUDIT",
  "INVESTIGATION",
];

export const COMPLIANCE_HOLD_STATUSES = ["ACTIVE", "RELEASED", "EXPIRED"];

export const COMPLIANCE_EXPORT_STATUSES = [
  "PENDING",
  "BUILDING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

export const REPLAY_AUTH_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVOKED",
  "EXPIRED",
];

export const REPLAY_INVOCATION_STATUSES = [
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

// Lifecycle allowed-transitions — mirror server-side. UI hides everything else.
export const LIFECYCLE_ALLOWED_TRANSITIONS = {
  ACTIVE: ["FROZEN", "SUSPENDED", "ARCHIVED"],
  FROZEN: ["ACTIVE", "SUSPENDED", "ARCHIVED"],
  SUSPENDED: ["ACTIVE", "ARCHIVED"],
  ARCHIVED: ["ACTIVE", "DECOMMISSIONED"],
  DECOMMISSIONED: [],
};

export const TENANT_LIFECYCLE_STATES = [
  "ACTIVE",
  "FROZEN",
  "SUSPENDED",
  "ARCHIVED",
  "DECOMMISSIONED",
];

export const CONTINUITY_CHECK_KINDS = [
  "projection-checkpoint-lag",
  "connector-health",
  "replay-readiness",
  "snapshot-freshness",
  "dr-cadence",
];

export const CONTINUITY_CHECK_STATUSES = [
  "PENDING",
  "PASSED",
  "WARNING",
  "FAILED",
];

export const DR_DRILL_KINDS = [
  "BACKUP_VERIFICATION",
  "RESTORE_REHEARSAL",
  "REPLAY_REHEARSAL",
  "FAILOVER_SIMULATION",
  "CHAOS_DRILL",
];

export const DR_DRILL_STATUSES = [
  "PLANNED",
  "RUNNING",
  "PASSED",
  "FAILED",
  "CANCELLED",
];

export const STORAGE_TIERS = ["HOT", "WARM", "COLD", "ARCHIVE"];

// ─── Style maps ──────────────────────────────────────────────────────────────

export const POLICY_STATUS_STYLE = {
  DRAFT: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  ACTIVE: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  SUPERSEDED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RETIRED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const ARCHIVAL_STATE_STYLE = {
  ACTIVE: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  ELIGIBLE: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  ARCHIVED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  PURGED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  HELD: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const HOLD_STATUS_STYLE = {
  ACTIVE: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RELEASED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  EXPIRED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const EXPORT_STATUS_STYLE = {
  PENDING: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  BUILDING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  COMPLETED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  CANCELLED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const REPLAY_AUTH_STYLE = {
  PENDING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  APPROVED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  REJECTED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  REVOKED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  EXPIRED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const LIFECYCLE_STATE_STYLE = {
  ACTIVE: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  FROZEN: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  SUSPENDED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  ARCHIVED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  DECOMMISSIONED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const CONTINUITY_STATUS_STYLE = {
  PENDING: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  PASSED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  WARNING: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const FINDING_SEVERITY_STYLE = {
  INFO: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  WARN: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export const DR_DRILL_STATUS_STYLE = {
  PLANNED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  RUNNING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  PASSED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  CANCELLED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const STORAGE_TIER_STYLE = {
  HOT: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  WARM: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  COLD: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  ARCHIVE: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

// Lens-filter helper for governance recommendations (server tags but does
// not filter).
export const filterRecsForLens = (recs, lens) => {
  if (!lens || !Array.isArray(recs)) return recs ?? [];
  return recs.filter((r) => !r.lenses?.length || r.lenses.includes(lens));
};
