"use client";

// ── Phase 9 PR-2..7: Reusable predictions card ───────────────────────────────
// Single renderer used by Readiness / Drift / Procurement / Workforce /
// Escalation surfaces. Pass a `fetcher` that returns ProjectPredictionView and
// the card handles state, severity sorting, entity deep-links, and Why?
// launching via the shared WhyPanel.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  PREDICTION_KIND_LABEL,
  SEVERITY_STYLE,
} from "@/services/Predictions";
import { hrefForNode } from "@/services/KnowledgeGraph";
import WhyPanel from "@/components/WhyPanel";

const SEV_RANK = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function PredictionsCard({
  title,
  cxProjectId,
  fetcher,
  limit = 100,
  emptyMessage = "No active predictions in this window.",
  topN = 8,
  onComputeRequested,
}) {
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whyId, setWhyId] = useState(null);

  const load = useCallback(async () => {
    if (!cxProjectId || !fetcher) return;
    setLoading(true);
    setError("");
    try {
      const v = await fetcher(cxProjectId, limit);
      setView(v);
    } catch (e) {
      setError(e?.message || "Failed to load predictions");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId, fetcher, limit]);

  useEffect(() => {
    load();
  }, [load]);

  if (!cxProjectId) return null;

  const sorted = [...(view?.predictions ?? [])].sort(
    (a, b) =>
      (SEV_RANK[a.severity] ?? 9) - (SEV_RANK[b.severity] ?? 9) ||
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
  const top = sorted.slice(0, topN);

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--rf-txt)",
              textTransform: "uppercase",
              letterSpacing: 0.04,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            {view?.evaluatedAt
              ? `Evaluated ${new Date(view.evaluatedAt).toLocaleString()}`
              : ""}
            {sorted.length
              ? ` · ${sorted.length} active`
              : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="rf-btn" onClick={load} disabled={loading}>
            {loading ? "…" : "Refresh"}
          </button>
          {onComputeRequested && (
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => onComputeRequested(cxProjectId)}
            >
              Recompute
            </button>
          )}
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            fontSize: 12,
            marginBottom: 8,
          }}
        >
          {error}
        </div>
      )}

      {loading && !view ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : top.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          {emptyMessage}
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {top.map((p) => (
            <PredictionRow
              key={p.id}
              prediction={p}
              onWhy={() => setWhyId(p.id)}
            />
          ))}
        </ul>
      )}

      {whyId && (
        <div style={{ marginTop: 12 }}>
          <WhyPanel predictionId={whyId} onClose={() => setWhyId(null)} />
        </div>
      )}
    </section>
  );
}

function PredictionRow({ prediction: p, onWhy }) {
  const sev = SEVERITY_STYLE[p.severity] || SEVERITY_STYLE.LOW;
  return (
    <li
      style={{
        padding: 8,
        borderTop: "1px solid var(--rf-border)",
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
            padding: "1px 8px",
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 4,
            background: sev.bg,
            color: sev.color,
          }}
        >
          {p.severity}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "var(--rf-txt3)",
          }}
        >
          {PREDICTION_KIND_LABEL[p.kind] || p.kind}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            flex: 1,
            minWidth: 0,
          }}
        >
          {p.title}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          {p.confidence}%
        </span>
      </div>
      {p.detail && (
        <div
          style={{
            fontSize: 12,
            color: "var(--rf-txt2)",
            marginBottom: 4,
          }}
        >
          {p.detail}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          fontSize: 11,
          color: "var(--rf-txt3)",
        }}
      >
        {p.entityType && p.entityId && (
          <Link
            href={hrefForNode({
              entityType: p.entityType,
              entityId: p.entityId,
            })}
            style={{
              color: "var(--rf-txt3)",
              textDecoration: "none",
              padding: "1px 6px",
              borderRadius: 4,
              background: "var(--rf-bg3)",
            }}
          >
            Open {p.entityType}
          </Link>
        )}
        {p.validUntil && (
          <span>
            valid until {new Date(p.validUntil).toLocaleDateString()}
          </span>
        )}
        <span style={{ marginLeft: "auto" }}>
          <button className="rf-btn" onClick={onWhy} style={{ fontSize: 11 }}>
            Why?
          </button>
        </span>
      </div>
    </li>
  );
}
