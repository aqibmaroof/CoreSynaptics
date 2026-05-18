"use client";

// ── Phase 9 PR-8: Prediction explainability panel ────────────────────────────
// Renders the structured "Why?" bundle returned by /predictions/:id/explain:
//   • Factors — signed bars by direction (red/green/grey) with weight + threshold
//   • Evidence — entities tied to roles (BLOCKER / DEPENDENCY / TARGET / …)
//   • Lineage — KG path snippets (uses v8 edge-kind labels)
//   • Notes — free-text caveats
// Legacy predictions (detector: 'legacy') get an empty bundle — render the
// row's title/detail as a fallback.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  explainPrediction,
  PREDICTION_KIND_LABEL,
  PREDICTION_FACTOR_DIRECTION_STYLE,
  SEVERITY_STYLE,
} from "@/services/Predictions";
import { RECOMMENDATION_KIND_LABEL } from "@/services/Copilot";
import {
  hrefForNode,
  EDGE_KIND_LABEL,
  EDGE_KIND_COLOR,
} from "@/services/KnowledgeGraph";

/**
 * WhyPanel renders an explainability bundle (factors / evidence / lineage /
 * notes). The bundle shape is identical for v9 predictions and v10
 * recommendations — only the fetcher and the id-prop key differ.
 *
 * Default behavior: fetch via `explainPrediction(predictionId)` (Phase 9).
 *
 * To use for a Phase-10 recommendation, pass a custom `fetcher` and the id:
 *   <WhyPanel
 *     predictionId={rec.id}
 *     fetcher={(id) => explainRecommendation(id, cxProjectId)}
 *     onClose={…}
 *   />
 */
export default function WhyPanel({ predictionId, fetcher, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!predictionId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    const load = fetcher || explainPrediction;
    (async () => {
      try {
        const res = await load(predictionId);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load explanation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [predictionId, fetcher]);

  if (!predictionId) return null;

  const explain = data?.explainability;
  const isLegacy = explain?.detector === "legacy";
  // Predictions carry `severity`; v10 recommendations carry `priority` — same palette.
  const sevKey = data?.severity || data?.priority;
  const sevStyle = sevKey
    ? SEVERITY_STYLE[sevKey] || SEVERITY_STYLE.LOW
    : null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: 0.04,
            }}
          >
            Why?
          </span>
          {data && (
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--rf-txt)",
                marginTop: 2,
              }}
            >
              {data.title}
            </div>
          )}
          {data && (
            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 4,
                alignItems: "center",
                fontSize: 11,
                color: "var(--rf-txt3)",
                flexWrap: "wrap",
              }}
            >
              {sevStyle && (
                <span
                  style={{
                    padding: "1px 8px",
                    borderRadius: 4,
                    background: sevStyle.bg,
                    color: sevStyle.color,
                    fontWeight: 700,
                  }}
                >
                  {sevKey}
                </span>
              )}
              <span>
                {PREDICTION_KIND_LABEL[data.kind] ||
                  RECOMMENDATION_KIND_LABEL[data.kind] ||
                  data.kind}
              </span>
              <span>· {data.confidence}% confidence</span>
              {explain?.detector && (
                <span style={{ fontFamily: "monospace" }}>
                  · {explain.detector}
                </span>
              )}
            </div>
          )}
        </div>
        {onClose && (
          <button className="rf-btn" onClick={onClose} title="Close">
            ✕
          </button>
        )}
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

      {loading && !data ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : !data ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>No data.</div>
      ) : isLegacy || !explain?.factors?.length ? (
        <LegacyFallback row={data} explain={explain} />
      ) : (
        <>
          <Factors factors={explain.factors} rawScore={explain.rawScore} />
          {(explain.evidence ?? []).length > 0 && (
            <Evidence evidence={explain.evidence} />
          )}
          {(explain.lineage ?? []).length > 0 && (
            <Lineage lineage={explain.lineage} />
          )}
          {(explain.notes ?? []).length > 0 && (
            <Notes notes={explain.notes} />
          )}
          <div
            style={{
              fontSize: 11,
              color: "var(--rf-txt3)",
              marginTop: 8,
            }}
          >
            Evaluated{" "}
            {explain.evaluatedAt
              ? new Date(explain.evaluatedAt).toLocaleString()
              : "—"}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Factors ─────────────────────────────────────────────────────────────────
function Factors({ factors, rawScore }) {
  const maxWeight = Math.max(
    1,
    ...factors.map((f) => Math.abs(Number(f.weight) || 0))
  );
  return (
    <div style={{ marginTop: 8 }}>
      <SectionHeader title="Factors" right={`raw score ${rawScore ?? "—"}`} />
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {factors.map((f) => {
          const dir =
            PREDICTION_FACTOR_DIRECTION_STYLE[f.direction] ||
            PREDICTION_FACTOR_DIRECTION_STYLE.NEUTRAL;
          const widthPct = Math.min(
            100,
            (Math.abs(Number(f.weight) || 0) / maxWeight) * 100
          );
          return (
            <li
              key={f.key}
              style={{
                padding: "6px 0",
                borderTop: "1px solid var(--rf-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--rf-txt)",
                    flex: 1,
                  }}
                >
                  {f.label}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                  }}
                >
                  {formatValue(f.value)}
                  {f.threshold !== undefined && f.threshold !== null
                    ? ` (≥ ${formatValue(f.threshold)})`
                    : ""}
                </span>
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    background: dir.bg,
                    color: dir.color,
                  }}
                >
                  w{Math.round(Number(f.weight) || 0)}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "var(--rf-bg3)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    background: dir.color,
                  }}
                />
              </div>
              {f.note && (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                    marginTop: 2,
                  }}
                >
                  {f.note}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Evidence ────────────────────────────────────────────────────────────────
function Evidence({ evidence }) {
  return (
    <div style={{ marginTop: 10 }}>
      <SectionHeader title="Evidence" right={evidence.length} />
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {evidence.map((ev, i) => (
          <li
            key={`${ev.entityType}::${ev.entityId}::${i}`}
            style={{
              padding: 6,
              borderTop: "1px solid var(--rf-border)",
            }}
          >
            <Link
              href={hrefForNode({
                entityType: ev.entityType,
                entityId: ev.entityId,
              })}
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
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
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt3)",
                  }}
                >
                  {ev.role}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ev.title ||
                    `${ev.entityType} ${String(ev.entityId).slice(0, 8)}`}
                </span>
                {ev.severity && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {ev.severity}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Lineage ─────────────────────────────────────────────────────────────────
function Lineage({ lineage }) {
  return (
    <div style={{ marginTop: 10 }}>
      <SectionHeader title="Lineage" right={lineage.length} />
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {lineage.map((l, i) => {
          const c = EDGE_KIND_COLOR[l.edgeKind] || {};
          return (
            <li
              key={`${l.fromEntityId}-${l.toEntityId}-${i}`}
              style={{
                padding: 6,
                borderTop: "1px solid var(--rf-border)",
                fontSize: 12,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  gap: 4,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href={hrefForNode({
                    entityType: l.fromEntityType,
                    entityId: l.fromEntityId,
                  })}
                  style={{
                    color: "var(--rf-txt)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {l.fromEntityType}
                </Link>
                <span
                  style={{
                    padding: "1px 6px",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 4,
                    background: c.bg || "var(--rf-bg3)",
                    color: c.color || "var(--rf-txt3)",
                  }}
                >
                  {EDGE_KIND_LABEL[l.edgeKind] || l.edgeKind}
                </span>
                <Link
                  href={hrefForNode({
                    entityType: l.toEntityType,
                    entityId: l.toEntityId,
                  })}
                  style={{
                    color: "var(--rf-txt)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {l.toEntityType}
                </Link>
                {l.depth != null && (
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    d{l.depth}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── Notes ───────────────────────────────────────────────────────────────────
function Notes({ notes }) {
  return (
    <div style={{ marginTop: 10 }}>
      <SectionHeader title="Notes" />
      <ul
        style={{
          listStyle: "disc inside",
          margin: 0,
          padding: 0,
          color: "var(--rf-txt2)",
          fontSize: 12,
        }}
      >
        {notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

// ─── Legacy / empty bundle fallback ──────────────────────────────────────────
function LegacyFallback({ row, explain }) {
  return (
    <div style={{ fontSize: 13, color: "var(--rf-txt2)" }}>
      {row.detail && <p style={{ marginTop: 0 }}>{row.detail}</p>}
      <div
        style={{
          padding: 8,
          background: "var(--rf-bg2)",
          borderRadius: 6,
          fontSize: 11,
          color: "var(--rf-txt3)",
        }}
      >
        No structured explainability for this prediction
        {explain?.detector ? ` (detector: ${explain.detector})` : ""}. It will
        self-heal on the next `/predictions/compute` run.
      </div>
    </div>
  );
}

function SectionHeader({ title, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
        }}
      >
        {title}
      </span>
      {right != null && (
        <span
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            fontFamily: "monospace",
          }}
        >
          {right}
        </span>
      )}
    </div>
  );
}

function formatValue(v) {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "✓" : "✕";
  if (typeof v === "number") return v.toLocaleString();
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
    try {
      return new Date(v).toLocaleString();
    } catch {
      return v;
    }
  }
  return String(v);
}
