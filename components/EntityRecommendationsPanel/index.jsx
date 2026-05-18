"use client";

// ── Phase 10 PR-3: Entity-detail Recommendations panel ───────────────────────
// Thin wrapper around the shared RecommendationsCard. Drop into the right rail
// of any entity-detail screen. Lens-routed at the caller's discretion.
//
// Usage:
//   <EntityRecommendationsPanel entityType="Issue" entityId={id} />
//   <EntityRecommendationsPanel entityType="Submittal" entityId={id} lens="qa" />

import RecommendationsCard from "@/components/RecommendationsCard";
import { entityRecommendations } from "@/services/Copilot";

export default function EntityRecommendationsPanel({
  entityType,
  entityId,
  lens,
  cxProjectId,
  title = "Recommendations",
}) {
  if (!entityType || !entityId) return null;
  return (
    <RecommendationsCard
      title={title}
      fetcher={(p) => entityRecommendations(entityType, entityId, p)}
      lens={lens}
      cxProjectId={cxProjectId}
      topN={8}
      emptyMessage="No recommendations for this entity."
    />
  );
}
