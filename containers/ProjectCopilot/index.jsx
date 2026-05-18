"use client";

// ── Phase 10 PR-9: Project Copilot page ──────────────────────────────────────
// Ties everything together for a single project: lens filter at the top
// driving four panels — Next-best-actions / Blockers / Escalations /
// Readiness guidance. Each panel calls its own /copilot endpoint; the server
// re-ranks per lens.

import { useState } from "react";
import {
  nextActions,
  blockersForProject,
  escalationsForProject,
  readinessForProject,
  projectRecommendations,
} from "@/services/Copilot";
import LensFilter from "@/components/LensFilter";
import RecommendationsCard from "@/components/RecommendationsCard";

export default function ProjectCopilot({ cxProjectId }) {
  const [lens, setLens] = useState();

  if (!cxProjectId) {
    return (
      <div style={{ padding: 24, color: "var(--rf-txt3)" }}>
        Pick a project (set <code>?cxProjectId=…</code>) to view the copilot.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Project Copilot
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Lens-routed recommendations. Server filters and re-ranks — no
            client-side filtering.
            <br />
            <span style={{ fontFamily: "monospace", fontSize: 12 }}>
              project · {cxProjectId.slice(0, 8)}
            </span>
          </p>
        </div>
        <LensFilter value={lens} onChange={setLens} />
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 16,
        }}
      >
        <RecommendationsCard
          title="Next best actions"
          fetcher={(p) => nextActions({ cxProjectId, ...p })}
          lens={lens}
          cxProjectId={cxProjectId}
          emptyMessage="No actions in your queue for this project."
        />
        <RecommendationsCard
          title="Blockers"
          fetcher={(p) => blockersForProject(cxProjectId, p)}
          lens={lens}
          cxProjectId={cxProjectId}
          emptyMessage="No active blockers."
        />
        <RecommendationsCard
          title="Escalations"
          fetcher={(p) => escalationsForProject(cxProjectId, p)}
          lens={lens}
          cxProjectId={cxProjectId}
          topN={6}
          emptyMessage="Nothing to escalate."
        />
        <RecommendationsCard
          title="Readiness guidance"
          fetcher={(p) => readinessForProject(cxProjectId, p)}
          lens={lens}
          cxProjectId={cxProjectId}
          emptyMessage="No readiness gaps to address."
        />
      </div>

      <div style={{ marginTop: 16 }}>
        <RecommendationsCard
          title="All recommendations"
          fetcher={(p) => projectRecommendations(cxProjectId, p)}
          lens={lens}
          cxProjectId={cxProjectId}
          topN={50}
          emptyMessage="No recommendations for this project."
        />
      </div>
    </div>
  );
}
