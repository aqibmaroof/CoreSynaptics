import sendRequest from "../instance/sendRequest";

// ── Phase 8: Relationship navigation ─────────────────────────────────────────
// Read-only surface built on top of the v7 knowledge-graph projection. Every
// endpoint is tenant-scoped (JWT) and cross-tenant edges are filtered
// server-side. No mutation API — relationships are derived, not authored.

const base = "/relationships";

const enc = (s) => encodeURIComponent(s);

// ─── PR-5: Navigation surface ────────────────────────────────────────────────

/** GET /entity/:type/:id — one-hop neighbors, both directions. */
export const entityNeighbors = (entityType, entityId, limit = 25) =>
  sendRequest({
    url: `${base}/entity/${enc(entityType)}/${enc(entityId)}`,
    method: "GET",
    params: { limit },
  });

/**
 * GET /context/:type/:id
 * preset: 'auto' (default) | 'issue' | 'procurement' | 'turnover'
 *   - 'auto' returns the canonical bundle for known types, else the generic
 *     ContextualBundle.
 *   - explicit presets 404 on type mismatch — fall back to 'auto'.
 */
export const entityContextBundle = (
  entityType,
  entityId,
  { preset = "auto", limit } = {}
) =>
  sendRequest({
    url: `${base}/context/${enc(entityType)}/${enc(entityId)}`,
    method: "GET",
    params: { preset, limit },
  });

/**
 * GET /lineage/:type/:id
 * mode: 'UPSTREAM' (default) | 'DOWNSTREAM' | 'DEPENDENCY' | 'ROOT_CAUSE'
 *     | 'APPROVAL' | 'IMPACT'
 * depth ≤ 6, maxNodes ≤ 500 — clamped server-side.
 */
export const entityLineage = (
  entityType,
  entityId,
  mode = "UPSTREAM",
  { depth, maxNodes, kinds } = {}
) =>
  sendRequest({
    url: `${base}/lineage/${enc(entityType)}/${enc(entityId)}`,
    method: "GET",
    params: {
      mode,
      depth,
      maxNodes,
      kinds:
        Array.isArray(kinds) && kinds.length ? kinds.join(",") : undefined,
    },
  });

/**
 * GET /related/:type/:id — deduped, ranked list of related entities. Use this
 * for "Related" sidebars instead of the v7 contextual-associations endpoint
 * when you want shared-context (project / asset / approval / comms) merged in.
 */
export const relatedEntities = (entityType, entityId, limit = 30) =>
  sendRequest({
    url: `${base}/related/${enc(entityType)}/${enc(entityId)}`,
    method: "GET",
    params: { limit },
  });

// ─── PR-6: Cross-domain associations ─────────────────────────────────────────

/**
 * GET /cross-domain?channel=&cxProjectId=&limit=
 * Without channel, returns { channels: string[] }.
 */
export const crossDomainAssociations = (
  channel,
  cxProjectId,
  limit = 50
) =>
  sendRequest({
    url: `${base}/cross-domain`,
    method: "GET",
    params: { channel, cxProjectId, limit },
  });

export const listCrossDomainChannels = () =>
  sendRequest({ url: `${base}/cross-domain`, method: "GET" });

// ─── Constants ───────────────────────────────────────────────────────────────

export const LINEAGE_MODES = [
  "UPSTREAM",
  "DOWNSTREAM",
  "DEPENDENCY",
  "ROOT_CAUSE",
  "APPROVAL",
  "IMPACT",
];

export const RELATED_VIA = [
  "GRAPH_EDGE",
  "SHARED_PROJECT",
  "SHARED_PHASE",
  "SHARED_WORKFLOW",
  "SHARED_ASSET",
  "SHARED_APPROVAL_CHAIN",
  "SHARED_OPERATIONAL_EVENT",
  "SHARED_COMMUNICATION_THREAD",
];

export const RELATED_VIA_LABEL = {
  GRAPH_EDGE: "edge",
  SHARED_PROJECT: "project",
  SHARED_PHASE: "phase",
  SHARED_WORKFLOW: "workflow",
  SHARED_ASSET: "asset",
  SHARED_APPROVAL_CHAIN: "approval",
  SHARED_OPERATIONAL_EVENT: "event",
  SHARED_COMMUNICATION_THREAD: "comm",
};

export const CROSS_DOMAIN_CHANNELS = [
  { key: "qa-procurement", label: "QA ↔ Procurement" },
  { key: "procurement-risk", label: "Procurement ↔ Risk" },
  { key: "risk-readiness", label: "Risk ↔ Readiness" },
  { key: "approvals-communications", label: "Approvals ↔ Comms" },
  { key: "workforce-certifications", label: "Workforce ↔ Certs" },
  { key: "schedule-blockers", label: "Schedule ↔ Blockers" },
  { key: "issue-operational-health", label: "Issue ↔ Health" },
  { key: "turnover-readiness", label: "Turnover ↔ Readiness" },
];

// Discriminate the AutoContextBundle response.
export const isIssueBundle = (x) => x?.kind === "issue" && !!x.bundle;
export const isProcurementBundle = (x) =>
  x?.kind === "procurement" && !!x.bundle;
export const isTurnoverBundle = (x) => x?.kind === "turnover" && !!x.bundle;
export const isGenericBundle = (x) =>
  !x?.kind &&
  (Array.isArray(x?.direct) || Array.isArray(x?.contextual));
