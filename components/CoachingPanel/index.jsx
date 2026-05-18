"use client";

// ── Phase 12 PR-6: Coaching panel ────────────────────────────────────────────
// Wraps the shared v10 RecommendationsCard with the v12 coaching endpoint.
// Server returns OperationalRecommendation[] tagged with lens hints; the
// shared filterForLens helper applies the active lens on the client.

import { useCallback } from "react";
import RecommendationsCard from "@/components/RecommendationsCard";
import { coachingForUser, filterForLens } from "@/services/Learning";

export default function CoachingPanel({ userId, lens, limit = 20 }) {
  const fetcher = useCallback(
    async (p) => {
      const recs = await coachingForUser(userId, { limit });
      return {
        recommendations: filterForLens(
          Array.isArray(recs) ? recs : recs?.items ?? [],
          p?.lens || lens
        ),
        evaluatedAt: new Date().toISOString(),
        lens: p?.lens || lens || null,
      };
    },
    [userId, lens, limit]
  );

  if (!userId) return null;

  return (
    <RecommendationsCard
      title="Coaching"
      fetcher={fetcher}
      lens={lens}
      topN={20}
      emptyMessage="No coaching suggestions right now."
    />
  );
}
