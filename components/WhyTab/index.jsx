"use client";

// ── Phase 7 PR-8: "Why was this done?" tab ───────────────────────────────────
// Read-only vertical timeline of decision-lineage rows for a subject. Drop
// into the entity detail screen as a tab/section.

import { useCallback, useEffect, useState } from "react";
import {
  subjectLineage,
  DECISION_KIND_STYLE,
} from "@/services/DecisionMemory";

export default function WhyTab({ subjectType, subjectId, limit = 100 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!subjectType || !subjectId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await subjectLineage(subjectType, subjectId, limit);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [subjectType, subjectId, limit]);

  useEffect(() => {
    load();
  }, [load]);

  if (!subjectType || !subjectId) return null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
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
        Why was this done?
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

      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No recorded decisions yet.
        </div>
      ) : (
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((r) => {
            const style =
              DECISION_KIND_STYLE[r.kind] || DECISION_KIND_STYLE.RECOMMENDATION;
            return (
              <li
                key={r.id}
                style={{
                  padding: "10px 0",
                  borderTop: "1px solid var(--rf-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 4,
                      background: style.bg,
                      color: style.color,
                    }}
                  >
                    {r.kind}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {r.recordedAt
                      ? new Date(r.recordedAt).toLocaleString()
                      : "—"}
                  </span>
                  {r.actorUserId && (
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                      }}
                    >
                      · {r.actorUserId.slice(0, 8)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: "var(--rf-txt)" }}>
                  {r.summary}
                </div>
                {r.sourceKind && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                      marginTop: 2,
                    }}
                  >
                    via {r.sourceKind} · {String(r.sourceId).slice(0, 12)}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
