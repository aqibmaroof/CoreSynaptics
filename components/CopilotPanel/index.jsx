"use client";

// ── Phase 7 PR-3: Entity-detail copilot panel ────────────────────────────────
// Right-rail panel that fetches contextual guidance for the entity in view:
//   • Blockers strip
//   • Context hint
//   • Escalation suggestion (may be null)
// Drop into any entity detail screen — Submittals, RFIs, Issues, Tasks, etc.

import { useCallback, useEffect, useState } from "react";
import {
  getBlockers,
  getContextHint,
  getEscalationSuggestion,
  COPILOT_PRIORITY_STYLE,
} from "@/services/Copilot";

export default function CopilotPanel({ entityType, entityId }) {
  const [blockers, setBlockers] = useState([]);
  const [hints, setHints] = useState([]);
  const [escalation, setEscalation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError("");
    try {
      const [b, h, e] = await Promise.all([
        getBlockers(entityType, entityId).catch(() => []),
        getContextHint(entityType, entityId).catch(() => []),
        getEscalationSuggestion(entityType, entityId).catch(() => null),
      ]);
      setBlockers(Array.isArray(b) ? b : b?.items ?? []);
      setHints(Array.isArray(h) ? h : h?.items ?? []);
      setEscalation(e || null);
    } catch (ex) {
      setError(ex?.message || "Failed to load copilot");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!entityType || !entityId) return null;
  const empty =
    !loading &&
    blockers.length === 0 &&
    hints.length === 0 &&
    !escalation &&
    !error;
  if (empty) return null;

  return (
    <aside className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--rf-txt2)",
            textTransform: "uppercase",
            letterSpacing: 0.04,
          }}
        >
          Copilot
        </span>
        {loading && (
          <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            updating…
          </span>
        )}
      </header>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 8,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {escalation && (
        <Section title="Escalation">
          <RecommendationRow rec={escalation} />
        </Section>
      )}

      {blockers.length > 0 && (
        <Section title="Blockers">
          {blockers.map((b, i) => (
            <RecommendationRow key={`b-${i}`} rec={b} />
          ))}
        </Section>
      )}

      {hints.length > 0 && (
        <Section title="Context hints">
          {hints.map((h, i) => (
            <RecommendationRow key={`h-${i}`} rec={h} />
          ))}
        </Section>
      )}
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gap: 6 }}>{children}</div>
    </div>
  );
}

function RecommendationRow({ rec }) {
  const ps =
    COPILOT_PRIORITY_STYLE[rec.priority] || COPILOT_PRIORITY_STYLE.NORMAL;
  return (
    <div
      style={{
        padding: 8,
        border: "1px solid var(--rf-border)",
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <span
          style={{
            padding: "1px 6px",
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 4,
            background: ps.bg,
            color: ps.color,
          }}
        >
          {rec.priority}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{rec.title}</span>
      </div>
      {rec.detail && (
        <div style={{ fontSize: 12, color: "var(--rf-txt2)" }}>
          {rec.detail}
        </div>
      )}
      {(rec.rationale ?? []).length > 0 && (
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            marginTop: 4,
          }}
        >
          {rec.rationale.join(" · ")}
        </div>
      )}
    </div>
  );
}
