import sendRequest from "../instance/sendRequest";

// ── Phase 13: External Integrations & Ecosystem Expansion ───────────────────
// Tenant-scoped read-side intelligence + state transitions on the new
// connector / execution / sync / template / bundle / partner / federation /
// credential lifecycle projections. NEVER recompute health, sign webhooks,
// decrypt credentials, compute drift, or compose recommendations on the
// client. External systems adapt to our model — internal aggregates remain
// authoritative.

// ─── PR-1: Connectors ────────────────────────────────────────────────────────

const connBase = "/connectors";

/** params: { kind?, lifecycle?, health?, limit? } */
export const listConnectors = (params = {}) =>
  sendRequest({ url: connBase, method: "GET", params });

/**
 * body: { kind, name, provider, credentialAlias,
 *         capabilities?: string[], configuration?: Record<string, unknown> }
 */
export const registerConnector = (body) =>
  sendRequest({
    url: connBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const getConnector = (id) =>
  sendRequest({ url: `${connBase}/${encodeURIComponent(id)}`, method: "GET" });

export const updateConnectorConfiguration = (id, configuration) =>
  sendRequest({
    url: `${connBase}/${encodeURIComponent(id)}/configuration`,
    method: "PATCH",
    data: { configuration },
    mutationId: true,
  });

export const activateConnector = (id) =>
  sendRequest({
    url: `${connBase}/${encodeURIComponent(id)}/activate`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const pauseConnector = (id) =>
  sendRequest({
    url: `${connBase}/${encodeURIComponent(id)}/pause`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const retireConnector = (id) =>
  sendRequest({
    url: `${connBase}/${encodeURIComponent(id)}/retire`,
    method: "POST",
    data: {},
    mutationId: true,
  });

// ─── PR-2: Integration executions ────────────────────────────────────────────

const execBase = "/integrations/executions";

/** params: { connectorId?, status?, direction?, limit? } */
export const listIntegrationExecutions = (params = {}) =>
  sendRequest({ url: execBase, method: "GET", params });

export const getIntegrationExecution = (id) =>
  sendRequest({ url: `${execBase}/${encodeURIComponent(id)}`, method: "GET" });

export const retryIntegrationExecution = (id) =>
  sendRequest({
    url: `${execBase}/${encodeURIComponent(id)}/retry`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const cancelIntegrationExecution = (id) =>
  sendRequest({
    url: `${execBase}/${encodeURIComponent(id)}/cancel`,
    method: "POST",
    data: {},
    mutationId: true,
  });

// ─── PR-3: Sync jobs + mappings ──────────────────────────────────────────────

const syncBase = "/sync";

/** body: { connectorId, kind, idempotencyKey? } */
export const startSyncJob = (body) =>
  sendRequest({
    url: `${syncBase}/jobs`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { connectorId?, status?, kind?, limit? } */
export const listSyncJobs = (params = {}) =>
  sendRequest({ url: `${syncBase}/jobs`, method: "GET", params });

export const getSyncJob = (id) =>
  sendRequest({
    url: `${syncBase}/jobs/${encodeURIComponent(id)}`,
    method: "GET",
  });

/** body: { checkpoint?, processed, failed, driftCount? } */
export const checkpointSyncJob = (id, body) =>
  sendRequest({
    url: `${syncBase}/jobs/${encodeURIComponent(id)}/checkpoint`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const completeSyncJob = (id, body = {}) =>
  sendRequest({
    url: `${syncBase}/jobs/${encodeURIComponent(id)}/complete`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const failSyncJob = (id, error) =>
  sendRequest({
    url: `${syncBase}/jobs/${encodeURIComponent(id)}/fail`,
    method: "POST",
    data: { error },
    mutationId: true,
  });

export const cancelSyncJob = (id) =>
  sendRequest({
    url: `${syncBase}/jobs/${encodeURIComponent(id)}/cancel`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const upsertMapping = (body) =>
  sendRequest({
    url: `${syncBase}/mappings`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { connectorId?, entityType? } */
export const listMappings = (params = {}) =>
  sendRequest({ url: `${syncBase}/mappings`, method: "GET", params });

// ─── PR-4: Webhook templates ─────────────────────────────────────────────────

const tplBase = "/webhooks/templates";

export const listWebhookTemplates = () =>
  sendRequest({ url: tplBase, method: "GET" });

/**
 * Upserting creates a NEW version and deactivates the previous one.
 * body: { key, title, description?, eventPatterns: string[], payloadSchema? }
 */
export const upsertWebhookTemplate = (body) =>
  sendRequest({
    url: tplBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const getWebhookTemplate = (id) =>
  sendRequest({ url: `${tplBase}/${encodeURIComponent(id)}`, method: "GET" });

export const retireWebhookTemplate = (id) =>
  sendRequest({
    url: `${tplBase}/${encodeURIComponent(id)}/retire`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const webhookTemplateDiagnostics = (id) =>
  sendRequest({
    url: `${tplBase}/${encodeURIComponent(id)}/diagnostics`,
    method: "GET",
  });

// ─── PR-5: Import / export bundles ───────────────────────────────────────────

const imexBase = "/import-export/jobs";

/**
 * body: { kind, bundleKind, storageKey?, totalRecords?, fileSize?,
 *         idempotencyKey? }
 */
export const startImportExportJob = (body) =>
  sendRequest({
    url: imexBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** params: { kind?, status?, bundleKind?, limit? } */
export const listImportExportJobs = (params = {}) =>
  sendRequest({ url: imexBase, method: "GET", params });

export const getImportExportJob = (id) =>
  sendRequest({ url: `${imexBase}/${encodeURIComponent(id)}`, method: "GET" });

export const progressImportExport = (id, body) =>
  sendRequest({
    url: `${imexBase}/${encodeURIComponent(id)}/progress`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const completeImportExport = (id, body = {}) =>
  sendRequest({
    url: `${imexBase}/${encodeURIComponent(id)}/complete`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const failImportExport = (id, error) =>
  sendRequest({
    url: `${imexBase}/${encodeURIComponent(id)}/fail`,
    method: "POST",
    data: { error },
    mutationId: true,
  });

export const cancelImportExport = (id) =>
  sendRequest({
    url: `${imexBase}/${encodeURIComponent(id)}/cancel`,
    method: "POST",
    data: {},
    mutationId: true,
  });

// ─── PR-7: Partner tenancy ───────────────────────────────────────────────────

const partnerBase = "/federation/partners";

export const listPartners = () =>
  sendRequest({ url: partnerBase, method: "GET" });

/**
 * body: { partnerName, externalTenantRef, accessScope?,
 *         allowedCapabilities?, approvalChainId?, externalRoleMap? }
 */
export const registerPartner = (body) =>
  sendRequest({
    url: partnerBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const getPartner = (id) =>
  sendRequest({
    url: `${partnerBase}/${encodeURIComponent(id)}`,
    method: "GET",
  });

export const updatePartnerScope = (id, body) =>
  sendRequest({
    url: `${partnerBase}/${encodeURIComponent(id)}/scope`,
    method: "PATCH",
    data: body,
    mutationId: true,
  });

export const activatePartner = (id) =>
  sendRequest({
    url: `${partnerBase}/${encodeURIComponent(id)}/activate`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const pausePartner = (id) =>
  sendRequest({
    url: `${partnerBase}/${encodeURIComponent(id)}/pause`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const retirePartner = (id) =>
  sendRequest({
    url: `${partnerBase}/${encodeURIComponent(id)}/retire`,
    method: "POST",
    data: {},
    mutationId: true,
  });

// ─── PR-9: Workflow federation ───────────────────────────────────────────────

const fedBase = "/federation/workflows";

/**
 * body: { connectorId?, internalEntityType, internalEntityId,
 *         externalSystem, externalRef, status?, metadata? }
 */
export const upsertWorkflowFederation = (body) =>
  sendRequest({
    url: fedBase,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const workflowsForEntity = (entityType, entityId) =>
  sendRequest({
    url: `${fedBase}/by-entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
    method: "GET",
  });

export const getWorkflowFederation = (id) =>
  sendRequest({ url: `${fedBase}/${encodeURIComponent(id)}`, method: "GET" });

// ─── PR-8: Credential lifecycle ──────────────────────────────────────────────

const credBase = "/credentials";

export const listCredentialHealth = () =>
  sendRequest({ url: credBase, method: "GET" });

export const expiringCredentials = () =>
  sendRequest({ url: `${credBase}/expiring`, method: "GET" });

export const credentialHealthSummary = () =>
  sendRequest({ url: `${credBase}/summary`, method: "GET" });

/** body: { credentials, expiresAt?, rotationHint? } */
export const rotateCredentialLifecycle = (id, body) =>
  sendRequest({
    url: `${credBase}/${encodeURIComponent(id)}/rotate`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const revokeCredentialLifecycle = (id) =>
  sendRequest({
    url: `${credBase}/${encodeURIComponent(id)}/revoke`,
    method: "POST",
    data: {},
    mutationId: true,
  });

/** body: { expiresAt, rotationHint? } */
export const setCredentialExpiry = (id, body) =>
  sendRequest({
    url: `${credBase}/${encodeURIComponent(id)}/expiry`,
    method: "PATCH",
    data: body,
    mutationId: true,
  });

// ─── PR-6 + PR-10: Ecosystem observability + intelligence ────────────────────

const ecoBase = "/ecosystem";

export const ecosystemSummary = () =>
  sendRequest({ url: `${ecoBase}/summary`, method: "GET" });

export const ecosystemConnectorCards = () =>
  sendRequest({ url: `${ecoBase}/connectors`, method: "GET" });

export const ecosystemLatency = () =>
  sendRequest({ url: `${ecoBase}/latency`, method: "GET" });

export const ecosystemDependencyGraph = () =>
  sendRequest({ url: `${ecoBase}/dependency-graph`, method: "GET" });

/** params: { limit? } */
export const ecosystemRecommendations = (params = {}) =>
  sendRequest({
    url: `${ecoBase}/recommendations`,
    method: "GET",
    params,
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const CONNECTOR_KINDS = [
  "OEM",
  "BMS",
  "CMMS",
  "ERP",
  "SCHEDULING",
  "DOCUMENTS",
  "WORKFORCE",
  "PROCUREMENT",
  "PARTNER",
  "OTHER",
];

export const CONNECTOR_LIFECYCLES = ["DRAFT", "ACTIVE", "PAUSED", "RETIRED"];

export const CONNECTOR_HEALTHS = ["GREEN", "YELLOW", "RED", "UNKNOWN"];

export const EXECUTION_DIRECTIONS = ["INBOUND", "OUTBOUND"];

export const EXECUTION_STATUSES = [
  "PENDING",
  "RUNNING",
  "SUCCEEDED",
  "FAILED",
  "RETRYING",
  "DEAD_LETTER",
  "CANCELLED",
];

export const SYNC_JOB_KINDS = [
  "PROJECT",
  "EQUIPMENT",
  "WORKFORCE",
  "PROCUREMENT",
  "READINESS",
  "ISSUE",
  "CUSTOM",
];

export const SYNC_JOB_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "PARTIAL",
  "CANCELLED",
];

export const IMPORT_EXPORT_KINDS = ["IMPORT", "EXPORT"];
export const IMPORT_EXPORT_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "PARTIAL",
  "CANCELLED",
];

export const PARTNER_ACCESS_SCOPES = ["READ_ONLY", "READ_WRITE", "ADMIN"];

export const EXTERNAL_WORKFLOW_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
  "UNKNOWN",
];

export const CREDENTIAL_STATUSES = [
  "ACTIVE",
  "EXPIRING",
  "EXPIRED",
  "REVOKED",
  "INACTIVE",
];

export const BUNDLE_KINDS = [
  "readiness",
  "turnover",
  "issues",
  "procurement",
  "workforce",
  "audit",
  "analytics",
];

// ─── Style maps ──────────────────────────────────────────────────────────────

export const HEALTH_STYLE = {
  GREEN: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  YELLOW: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  UNKNOWN: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const LIFECYCLE_STYLE = {
  DRAFT: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  ACTIVE: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  PAUSED: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RETIRED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const EXECUTION_STATUS_STYLE = {
  PENDING: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  RUNNING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  SUCCEEDED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  RETRYING: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  DEAD_LETTER: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.24)" },
  CANCELLED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const SYNC_STATUS_STYLE = EXECUTION_STATUS_STYLE;
export const IMEX_STATUS_STYLE = EXECUTION_STATUS_STYLE;

export const CREDENTIAL_STATUS_STYLE = {
  ACTIVE: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  EXPIRING: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  EXPIRED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  REVOKED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  INACTIVE: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};

export const PARTNER_SCOPE_STYLE = {
  READ_ONLY: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  READ_WRITE: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  ADMIN: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
};

export const EXTERNAL_WORKFLOW_STATUS_STYLE = {
  PENDING: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  IN_PROGRESS: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  COMPLETED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  FAILED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  CANCELLED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  UNKNOWN: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
};

// Lens filter helper for ecosystem recommendations (server tags but does
// not filter).
export const filterRecsForLens = (recs, lens) => {
  if (!lens || !Array.isArray(recs)) return recs ?? [];
  return recs.filter((r) => !r.lenses?.length || r.lenses.includes(lens));
};
