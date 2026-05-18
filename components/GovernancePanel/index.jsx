"use client";

// ── Phase 12 PR-8: Governance panel ──────────────────────────────────────────
// Per-user learning-policy violations. Each row is an OperationalRecommendation
// — severity comes from `priority`. The endpoint never owns remediation state;
// follow-up actions route through existing modules (simulations, approvals).

import { useCallback } from "react";
import RecommendationsCard from "@/components/RecommendationsCard";
import { governanceForUser, filterForLens } from "@/services/Learning";

export default function GovernancePanel({ userId, roleName, lens, limit = 50 }) {
  const fetcher = useCallback(
    async (p) => {
      const recs = await governanceForUser(userId, {
        roleName: roleName || undefined,
        limit,
      });
      return {
        recommendations: filterForLens(
          Array.isArray(recs) ? recs : recs?.items ?? [],
          p?.lens || lens
        ),
        evaluatedAt: new Date().toISOString(),
        lens: p?.lens || lens || null,
      };
    },
    [userId, roleName, lens, limit]
  );

  if (!userId) return null;

  return (
    <RecommendationsCard
      title="Governance"
      fetcher={fetcher}
      lens={lens}
      topN={50}
      emptyMessage="Compliant with all configured learning policies."
    />
  );
}
