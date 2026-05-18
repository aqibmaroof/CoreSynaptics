import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-4: Operational search ─────────────────────────────────────────
// One endpoint over the indexed corpus. The indexer is async — newly created
// entities take a beat to appear. If an old entity is missing, ops can run
// platform replay (PR-9) on its create event to backfill.
//
// Use the same client from the top-bar; do NOT add a second search box.

const base = "/search";

/**
 * params: { q?, cxProjectId?, entityTypes?: string[], tags?: string[], limit?, offset? }
 * Returns: SearchPage { hits, total, offset, limit }
 */
export const search = (params = {}) => {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.cxProjectId) p.set("cxProjectId", params.cxProjectId);
  if (params.limit) p.set("limit", String(params.limit));
  if (params.offset) p.set("offset", String(params.offset));
  (params.entityTypes ?? []).forEach((t) => p.append("entityTypes", t));
  (params.tags ?? []).forEach((t) => p.append("tags", t));
  return sendRequest({
    url: `${base}?${p.toString()}`,
    method: "GET",
  });
};

// Common entity types in the index — used to populate the filter dropdown.
export const SEARCH_ENTITY_TYPES = [
  "Project",
  "CxProject",
  "Asset",
  "Issue",
  "Submittal",
  "RFI",
  "Checklist",
  "Task",
  "Document",
  "Artifact",
  "Communication",
  "User",
  "Company",
  "Meeting",
];

export const SEARCH_ENTITY_HREF = {
  Project: (id) => `/Projects?focus=${id}`,
  CxProject: (id) => `/ProjectOverview?cxProjectId=${id}`,
  Asset: (id) => `/Assets/List?focus=${id}`,
  Issue: (id) => `/Issues/Edit/${id}`,
  Submittal: (id) => `/Submittals/Edit/${id}`,
  RFI: (id) => `/RFI/List?focus=${id}`,
  Checklist: (id) => `/Checklist/Edit/${id}`,
  Task: (id) => `/Tasks/List?focus=${id}`,
  Document: (id) => `/Documents?focus=${id}`,
  Artifact: (id) => `/Documents?focus=${id}`,
  Communication: (id) => `/Communications?focus=${id}`,
  User: (id) => `/Users/List?focus=${id}`,
  Company: (id) => `/Company/Detail/${id}`,
  Meeting: (id) => `/Meeting/List?focus=${id}`,
};

export const hrefForHit = (hit) =>
  (SEARCH_ENTITY_HREF[hit.entityType] || ((id) => `/search?q=${id}`))(hit.entityId);

// ── Phase 7 PR-2: Semantic / contextual search ───────────────────────────────
// `/search` is unchanged. The three endpoints below re-rank or pivot on a seed
// entity. proximityWeight defaults to 0.35 server-side; push toward 0.6 for
// modal/entity-detail search (heavy contextual bias), toward 0.1 for the
// top-level bar (mostly full-text).

/**
 * params: {
 *   q?, cxProjectId?, entityTypes?: string[], tags?: string[], limit?, offset?,
 *   seedEntityType?, seedEntityId?, proximityWeight?
 * }
 * Returns: RankedSearchPage { hits[], total, offset, limit, rerankedWith? }
 */
export const contextualSearch = (params = {}) => {
  const p = new URLSearchParams();
  if (params.q) p.set("q", params.q);
  if (params.cxProjectId) p.set("cxProjectId", params.cxProjectId);
  if (params.limit != null) p.set("limit", String(params.limit));
  if (params.offset != null) p.set("offset", String(params.offset));
  if (params.seedEntityType) p.set("seedEntityType", params.seedEntityType);
  if (params.seedEntityId) p.set("seedEntityId", params.seedEntityId);
  if (params.proximityWeight != null)
    p.set("proximityWeight", String(params.proximityWeight));
  (params.entityTypes ?? []).forEach((t) => p.append("entityTypes", t));
  (params.tags ?? []).forEach((t) => p.append("tags", t));
  return sendRequest({
    url: `/search/contextual?${p.toString()}`,
    method: "GET",
  });
};

/**
 * params: { entityType, entityId, limit? }
 * Returns: ContextualAssociation[] (same shape as KG associations)
 */
export const relatedEntities = (params) =>
  sendRequest({ url: `/search/related`, method: "GET", params });

/**
 * params: { entityType, entityId, limit? }
 * Returns: RankedSearchHit[]
 */
export const similarEntities = (params) =>
  sendRequest({ url: `/search/similar`, method: "GET", params });

// Convenience: default proximity weight for two common call sites.
export const PROXIMITY_WEIGHT_DEFAULT = 0.35;
export const PROXIMITY_WEIGHT_MODAL = 0.6;
export const PROXIMITY_WEIGHT_TOPBAR = 0.1;
