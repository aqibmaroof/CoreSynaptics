"use client";

// ── Phase 7 PR-9: Cross-lens dashboard ───────────────────────────────────────
// Single-call render — recommendations, priorities, anomalies, forecasts in
// one bundle per lens. The lens switcher flips the entire dashboard.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { lensBundle, LENS_LABEL } from "@/services/CrossLens";
import { COPILOT_LENSES, COPILOT_PRIORITY_STYLE } from "@/services/Copilot";
import { ANOMALY_SEVERITY_STYLE } from "@/services/Anomalies";
import { SEVERITY_STYLE as PRED_SEV_STYLE } from "@/services/Predictions";
import { ADAPTIVE_PRIORITY_STYLE } from "@/services/Prioritization";
import { hrefForNode } from "@/services/KnowledgeGraph";

export default function CrossLensDashboard({ cxProjectId }) {
  const [lens, setLens] = useState("pm");
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const b = await lensBundle(lens, cxProjectId || undefined, 10);
      setBundle(b);
    } catch (e) {
      setError(e?.message || "Failed to load lens bundle");
    } finally {
      setLoading(false);
    }
  }, [lens, cxProjectId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
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
            Cross-Lens Dashboard
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Composed view per lens. One call backs the whole page.
            {cxProjectId ? ` · project ${cxProjectId.slice(0, 8)}` : ""}
          </p>
        </div>
        <select
          className="rf-input"
          value={lens}
          onChange={(e) => setLens(e.target.value)}
        >
          {COPILOT_LENSES.map((l) => (
            <option key={l} value={l}>
              {LENS_LABEL[l] || l}
            </option>
          ))}
        </select>
      </header>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading && !bundle ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : !bundle ? (
        <div style={{ color: "var(--rf-txt3)" }}>No data.</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          <Column title="Recommendations">
            {bundle.recommendations?.length ? (
              bundle.recommendations.map((r, i) => (
                <RecommendationRow key={`r-${i}`} rec={r} />
              ))
            ) : (
              <Empty>No recommendations.</Empty>
            )}
          </Column>

          <Column title="Priorities">
            {bundle.priorities?.length ? (
              bundle.priorities.map((p) => (
                <ActionRow key={p.id} action={p} />
              ))
            ) : (
              <Empty>No priorities.</Empty>
            )}
          </Column>

          <Column title="Anomalies">
            {bundle.anomalies?.length ? (
              bundle.anomalies.map((a) => <AnomalyRow key={a.id} anomaly={a} />)
            ) : (
              <Empty>No open anomalies.</Empty>
            )}
          </Column>

          <Column title="Forecasts">
            {bundle.forecasts?.length ? (
              bundle.forecasts.map((f) => (
                <ForecastRow key={f.id} prediction={f} />
              ))
            ) : (
              <Empty>No active forecasts.</Empty>
            )}
          </Column>
        </div>
      )}
    </div>
  );
}

function Column({ title, children }) {
  return (
    <section className="rf-card" style={{ padding: 12 }}>
      <header
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--rf-txt2)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.04,
        }}
      >
        {title}
      </header>
      <div style={{ display: "grid", gap: 6 }}>{children}</div>
    </section>
  );
}

function Empty({ children }) {
  return (
    <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>{children}</div>
  );
}

function RecommendationRow({ rec }) {
  const ps =
    COPILOT_PRIORITY_STYLE[rec.priority] || COPILOT_PRIORITY_STYLE.NORMAL;
  const href = rec.targetEntity
    ? hrefForNode({
        entityType: rec.targetEntity.entityType,
        entityId: rec.targetEntity.entityId,
      })
    : null;
  const body = (
    <>
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
        <div style={{ fontSize: 12, color: "var(--rf-txt2)" }}>{rec.detail}</div>
      )}
    </>
  );
  return (
    <div
      style={{
        padding: 8,
        border: "1px solid var(--rf-border)",
        borderRadius: 6,
      }}
    >
      {href ? (
        <Link
          href={href}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </div>
  );
}

function ActionRow({ action: a }) {
  const ps =
    ADAPTIVE_PRIORITY_STYLE[a.priority] || ADAPTIVE_PRIORITY_STYLE.NORMAL;
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
          {a.priority}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{a.title}</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          {a.adaptiveScore?.toFixed?.(0) ?? a.rankScore}
        </span>
      </div>
      {(a.rationale ?? []).length > 0 && (
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            marginTop: 4,
          }}
        >
          {a.rationale.join(" · ")}
        </div>
      )}
    </div>
  );
}

function AnomalyRow({ anomaly: a }) {
  const ps =
    ANOMALY_SEVERITY_STYLE[a.severity] || ANOMALY_SEVERITY_STYLE.LOW;
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
          {a.severity}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          {a.kind}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
        {a.title}
      </div>
    </div>
  );
}

function ForecastRow({ prediction: p }) {
  const ps = PRED_SEV_STYLE[p.severity] || PRED_SEV_STYLE.LOW;
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
          {p.severity}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          {p.kind}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          {p.confidence}%
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>
        {p.title}
      </div>
      {p.detail && (
        <div style={{ fontSize: 12, color: "var(--rf-txt2)" }}>{p.detail}</div>
      )}
    </div>
  );
}
