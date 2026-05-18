import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-1: Knowledge graph ────────────────────────────────────────────
// Server-side projection of canonical aggregates. Clients never write to it —
// the graph self-updates as listeners receive aggregate events. Use it from
// every entity detail screen to render "related to this", traversal, blockers.
//
// Guard rails (server-enforced):
//   • `depth` clamped to 1..4
//   • `maxNodes` clamped to 1..500
//   • cross-tenant edges filtered automatically — no client-side org check

const base = "/knowledge-graph";

const csv = (xs) =>
  Array.isArray(xs) && xs.length ? xs.join(",") : undefined;

/**
 * params: { entityType, entityId, kinds?: KnowledgeEdgeKind[], direction?: 'OUT'|'IN'|'BOTH', limit? }
 * Returns: KnowledgeNeighbor[]
 */
export const getNeighbors = (params) =>
  sendRequest({
    url: `${base}/neighbors`,
    method: "GET",
    params: {
      entityType: params.entityType,
      entityId: params.entityId,
      direction: params.direction,
      limit: params.limit,
      kinds: csv(params.kinds),
    },
  });

/**
 * params: { entityType, entityId, depth?, kinds?, direction?, maxNodes? }
 * Returns: TraversalResult { seed, nodes[], edges[], truncated }
 */
export const traverse = (params) =>
  sendRequest({
    url: `${base}/traverse`,
    method: "GET",
    params: {
      entityType: params.entityType,
      entityId: params.entityId,
      depth: params.depth,
      direction: params.direction,
      maxNodes: params.maxNodes,
      kinds: csv(params.kinds),
    },
  });

/**
 * params: { entityType, entityId, kinds?, limit? }
 * Returns: ContextualAssociation[] { node, sharedNeighbors, via[] }
 */
export const getContextualAssociations = (params) =>
  sendRequest({
    url: `${base}/contextual-associations`,
    method: "GET",
    params: {
      entityType: params.entityType,
      entityId: params.entityId,
      limit: params.limit,
      kinds: csv(params.kinds),
    },
  });

// ─── Constants ───────────────────────────────────────────────────────────────

// ── Phase 8 PR-1: Extended edge kinds ───────────────────────────────────────
// Five v8 additions (RELATED_TO, BLOCKED_BY, GENERATED_FROM, DUPLICATES,
// CAUSED_BY) widen the v7 union. Any consumer doing a switch over edge kinds
// must add a default arm or use this superset list.
export const KNOWLEDGE_EDGE_KINDS = [
  // v7 ──────────────────────────────────────
  "PROJECT_CONTAINS",
  "PHASE_CONTAINS",
  "ASSET_CONTAINS",
  "ARTIFACT_RELATIONSHIP",
  "RAISED_FROM",
  "RESOLVES",
  "ANSWERED_BY",
  "EVIDENCE_FOR",
  "BLOCKS",
  "DEPENDS_ON",
  "APPROVED_VIA",
  "TRIGGERS",
  "REFERENCES",
  "MENTIONS",
  "ATTACHED_TO",
  "WITNESSED",
  "PART_OF_TURNOVER",
  "PART_OF_BUNDLE",
  "RELATED_CROSS_PROJECT",
  "ASSIGNED_TO",
  "OWNED_BY",
  // v8 ──────────────────────────────────────
  "RELATED_TO",
  "BLOCKED_BY",
  "GENERATED_FROM",
  "DUPLICATES",
  "CAUSED_BY",
];

export const EDGE_KIND_LABEL = {
  // v7
  PROJECT_CONTAINS: "Project contains",
  PHASE_CONTAINS: "Phase contains",
  ASSET_CONTAINS: "Asset contains",
  ARTIFACT_RELATIONSHIP: "Artifact relation",
  RAISED_FROM: "Raised from",
  RESOLVES: "Resolves",
  ANSWERED_BY: "Answered by",
  EVIDENCE_FOR: "Evidence for",
  BLOCKS: "Blocks",
  DEPENDS_ON: "Depends on",
  APPROVED_VIA: "Approved via",
  TRIGGERS: "Triggers",
  REFERENCES: "References",
  MENTIONS: "Mentions",
  ATTACHED_TO: "Attached to",
  WITNESSED: "Witnessed",
  PART_OF_TURNOVER: "Part of turnover",
  PART_OF_BUNDLE: "Part of bundle",
  RELATED_CROSS_PROJECT: "Cross-project",
  ASSIGNED_TO: "Assigned to",
  OWNED_BY: "Owned by",
  // v8
  RELATED_TO: "Related to",
  BLOCKED_BY: "Blocked by",
  GENERATED_FROM: "Generated from",
  DUPLICATES: "Duplicates",
  CAUSED_BY: "Caused by",
};

// Chip-color hint. Anything not listed renders neutral.
export const EDGE_KIND_COLOR = {
  BLOCKS: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  BLOCKED_BY: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  CAUSED_BY: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  DUPLICATES: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  DEPENDS_ON: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  RESOLVES: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  APPROVED_VIA: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  GENERATED_FROM: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  PART_OF_TURNOVER: {
    color: "var(--rf-purple, #8b5cf6)",
    bg: "rgba(139,92,246,0.16)",
  },
  PART_OF_BUNDLE: {
    color: "var(--rf-purple, #8b5cf6)",
    bg: "rgba(139,92,246,0.16)",
  },
};

// Route map mirrors services/Search/SEARCH_ENTITY_HREF — keep them aligned.
// v8 PR-8 added Task/Checklist/Tarf/RiskItem/ScheduleMilestone as projector
// nodes; map them to existing list/edit screens.
export const ENTITY_HREF = {
  Project: (id) => `/Projects?focus=${id}`,
  CxProject: (id) => `/ProjectOverview?cxProjectId=${id}`,
  Asset: (id) => `/Assets/List?focus=${id}`,
  Issue: (id) => `/Issues/Edit/${id}`,
  Submittal: (id) => `/Submittals/Edit/${id}`,
  RFI: (id) => `/RFI/List?focus=${id}`,
  Rfi: (id) => `/RFI/List?focus=${id}`,
  Checklist: (id) => `/Checklist/Edit/${id}`,
  Task: (id) => `/Tasks/List?focus=${id}`,
  Document: (id) => `/Documents?focus=${id}`,
  Artifact: (id) => `/Documents?focus=${id}`,
  Communication: (id) => `/Communications?focus=${id}`,
  User: (id) => `/Users/List?focus=${id}`,
  Company: (id) => `/Company/Detail/${id}`,
  Meeting: (id) => `/Meeting/List?focus=${id}`,
  ChangeRequest: (id) => `/ChangeRequests?focus=${id}`,
  TurnoverPackage: (id) => `/Turnover?focus=${id}`,
  ApprovalChain: (id) => `/Approvals/MyPending?chain=${id}`,
  CommissioningTest: (id) => `/Commissioning/Tests?focus=${id}`,
  PssrInspection: (id) => `/PSSR?focus=${id}`,
  ProcurementItem: (id) => `/Finance/Procurement?focus=${id}`,
  // v8 PR-8 additions
  Tarf: (id) => `/CxTARF?focus=${id}`,
  TARF: (id) => `/CxTARF?focus=${id}`,
  RiskItem: (id) => `/Risk?focus=${id}`,
  ScheduleMilestone: (id) => `/ScheduleMilestones/List?focus=${id}`,
};

export const hrefForNode = (n) =>
  (ENTITY_HREF[n.entityType] || ((id) => `/Search?q=${id}`))(n.entityId);
