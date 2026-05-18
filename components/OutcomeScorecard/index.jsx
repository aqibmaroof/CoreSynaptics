"use client";

// ── Phase 12 PR-5: Outcome scorecard ─────────────────────────────────────────
// Renders subscores + score + outcome kind, then mounts the v9 WhyPanel with
// the bundle the server signed (`signals.explainability`). No client-side
// score recomputation — ever.

import WhyPanel from "@/components/WhyPanel";
import { OUTCOME_KIND_STYLE } from "@/services/Learning";

export default function OutcomeScorecard({ outcome }) {
  if (!outcome) return null;
  const sty =
    OUTCOME_KIND_STYLE[outcome.kind] || OUTCOME_KIND_STYLE.PARTIAL;
  const sub = outcome.subscores || {};
  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 6,
            background: sty.bg,
            color: sty.color,
          }}
        >
          {outcome.kind}
        </span>
        <ScoreDial value={outcome.score} />
        <span
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          finalized{" "}
          {outcome.finalizedAt
            ? new Date(outcome.finalizedAt).toLocaleString()
            : "—"}
        </span>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <Sub label="Decision quality" value={sub.decisionQuality} />
        <Sub label="Timeliness" value={sub.timeliness} />
        <Sub label="Severity match" value={sub.severityMatch} />
        <Sub label="Resource efficiency" value={sub.resourceEfficiency} />
      </div>

      <WhyPanel
        predictionId={outcome.id}
        fetcher={async () => ({
          title: `Simulation outcome · ${outcome.kind}`,
          detail: `Score ${outcome.score}/100`,
          kind: "SIMULATION_OUTCOME",
          severity: null,
          confidence: outcome.score,
          explainability: outcome.signals?.explainability,
        })}
      />
    </section>
  );
}

function Sub({ label, value }) {
  return (
    <div
      className="rf-card"
      style={{ padding: 10, display: "grid", gap: 2 }}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "monospace",
          color: "var(--rf-txt)",
        }}
      >
        {value == null ? "—" : value}
      </div>
    </div>
  );
}

function ScoreDial({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    pct >= 80
      ? "var(--rf-green)"
      : pct >= 60
      ? "var(--rf-yellow, #f59e0b)"
      : "var(--rf-red)";
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          fontFamily: "monospace",
          color,
        }}
      >
        {pct}
      </span>
      <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>/ 100</span>
    </div>
  );
}
