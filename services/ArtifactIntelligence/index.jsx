import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-5: Artifact intelligence ──────────────────────────────────────
// Lineage (graph of artifact-to-artifact relationships) and bundles (curated
// groupings of artifacts that ultimately roll into a turnover package).

const base = "/artifact-intelligence";

// ─── Relationships ───────────────────────────────────────────────────────────

/**
 * body: {
 *   parentArtifactId, childArtifactId,
 *   kind: 'SUPERSEDES'|'DERIVED_FROM'|'EVIDENCE_FOR'|'BUNDLED_IN'|'REFERENCES',
 *   targetEntityType?, targetEntityId?, note?
 * }
 */
export const linkArtifacts = (body) =>
  sendRequest({
    url: `${base}/relationships`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const unlinkArtifacts = (id) =>
  sendRequest({
    url: `${base}/relationships/${id}`,
    method: "DELETE",
    mutationId: true,
  });

export const listArtifactRelationships = (artifactId) =>
  sendRequest({
    url: `${base}/artifacts/${artifactId}/relationships`,
    method: "GET",
  });

export const lineageFor = (artifactId) =>
  sendRequest({
    url: `${base}/artifacts/${artifactId}/lineage`,
    method: "GET",
  });

export const evidenceFor = (entityType, entityId) =>
  sendRequest({
    url: `${base}/evidence`,
    method: "GET",
    params: { entityType, entityId },
  });

// ─── Bundles ─────────────────────────────────────────────────────────────────

export const createBundle = (body) =>
  sendRequest({
    url: `${base}/bundles`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const listBundles = (cxProjectId) =>
  sendRequest({
    url: `${base}/bundles`,
    method: "GET",
    params: cxProjectId ? { cxProjectId } : {},
  });

export const getBundle = (id) =>
  sendRequest({ url: `${base}/bundles/${id}`, method: "GET" });

export const addBundleItem = (id, body) =>
  sendRequest({
    url: `${base}/bundles/${id}/items`,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const removeBundleItem = (id, artifactId) =>
  sendRequest({
    url: `${base}/bundles/${id}/items/${artifactId}`,
    method: "DELETE",
    mutationId: true,
  });

export const setBundleStatus = (id, body) =>
  sendRequest({
    url: `${base}/bundles/${id}/status`,
    method: "PATCH",
    data: body,
    mutationId: true,
  });

// ─── Constants ───────────────────────────────────────────────────────────────

export const RELATIONSHIP_KINDS = [
  "SUPERSEDES",
  "DERIVED_FROM",
  "EVIDENCE_FOR",
  "BUNDLED_IN",
  "REFERENCES",
];

export const BUNDLE_STATUSES = [
  "DRAFT",
  "BUILDING",
  "READY",
  "PUBLISHED",
  "STALE",
];

export const BUNDLE_STATUS_STYLE = {
  DRAFT: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  BUILDING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
  READY: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  PUBLISHED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.24)" },
  STALE: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
};
