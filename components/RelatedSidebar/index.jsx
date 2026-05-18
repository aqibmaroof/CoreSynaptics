"use client";

// ── Phase 8 PR-2: "Related to this" sidebar (v8 upgrade) ─────────────────────
// Switched from /knowledge-graph/contextual-associations (v7) to
// /relationships/related/:type/:id (v8). v8 returns a deduped, ranked list
// merging direct graph edges + shared-context refs (project / asset / approval
// / comms / phase / workflow / event), so the panel no longer has to fan out.
//
// Each row carries:
//   • via — how it was matched (GRAPH_EDGE | SHARED_*)
//   • edgeKinds — present when via === 'GRAPH_EDGE'
//   • weight — server-side rank; higher = more relevant

import { useEffect, useState } from "react";
import Link from "next/link";
import { relatedEntities, RELATED_VIA_LABEL } from "@/services/Relationships";
import {
  hrefForNode,
  EDGE_KIND_LABEL,
  EDGE_KIND_COLOR,
} from "@/services/KnowledgeGraph";

export default function RelatedSidebar({
  entityType,
  entityId,
  limit = 12,
  title = "Related",
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!entityType || !entityId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const xs = await relatedEntities(entityType, entityId, limit);
        if (!cancelled)
          setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Failed to load related items");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entityType, entityId, limit]);

  if (!entityType || !entityId) return null;
  if (loading && rows.length === 0) {
    return (
      <aside className="rf-card" style={{ padding: 14 }}>
        <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          Loading related…
        </div>
      </aside>
    );
  }
  if (!loading && rows.length === 0 && !error) return null;

  return (
    <aside className="rf-card" style={{ padding: 14 }}>
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

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map((r) => (
          <li
            key={`${r.entityType}::${r.entityId}`}
            style={{
              padding: "8px 0",
              borderTop: "1px solid var(--rf-border)",
            }}
          >
            <Link
              href={hrefForNode(r)}
              style={{
                textDecoration: "none",
                color: "var(--rf-txt)",
                display: "block",
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
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    background: "var(--rf-bg3)",
                    borderRadius: 4,
                    color: "var(--rf-txt3)",
                  }}
                >
                  {r.entityType}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                  {r.title}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "var(--rf-txt3)",
                  }}
                  title="ranking weight"
                >
                  w{typeof r.weight === "number" ? r.weight.toFixed(1) : "—"}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  fontSize: 10,
                }}
              >
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: 4,
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt3)",
                  }}
                >
                  via {RELATED_VIA_LABEL[r.via] || r.via?.toLowerCase()}
                </span>
                {(r.edgeKinds ?? []).map((k) => {
                  const c = EDGE_KIND_COLOR[k] || {};
                  return (
                    <span
                      key={k}
                      style={{
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: c.bg || "var(--rf-bg3)",
                        color: c.color || "var(--rf-txt3)",
                        fontWeight: 600,
                      }}
                    >
                      {EDGE_KIND_LABEL[k] || k}
                    </span>
                  );
                })}
                {(r.severity || r.status) && (
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: "var(--rf-bg3)",
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {[r.severity, r.status].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
