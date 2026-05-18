"use client";

// ── Phase 5 PR-5: Lineage + Evidence side panel ──────────────────────────────
// Drop into the existing artifact detail screen as two tabs.
//
// Usage:
//   <ArtifactLineagePanel artifactId={a.id} />

import { useCallback, useEffect, useState } from "react";
import {
  listArtifactRelationships,
  lineageFor,
  unlinkArtifacts,
  RELATIONSHIP_KINDS,
} from "@/services/ArtifactIntelligence";

export default function ArtifactLineagePanel({ artifactId, onChange }) {
  const [tab, setTab] = useState("relationships");
  const [rels, setRels] = useState([]);
  const [lineage, setLineage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!artifactId) return;
    setLoading(true);
    setError("");
    try {
      if (tab === "relationships") {
        const xs = await listArtifactRelationships(artifactId);
        setRels(Array.isArray(xs) ? xs : xs?.items ?? []);
      } else {
        const xs = await lineageFor(artifactId);
        setLineage(Array.isArray(xs) ? xs : xs?.items ?? []);
      }
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [artifactId, tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = async (id) => {
    if (!confirm("Remove this relationship?")) return;
    try {
      await unlinkArtifacts(id);
      await refresh();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Remove failed");
    }
  };

  return (
    <section className="rf-card" style={{ padding: 16 }}>
      <header style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          className={`rf-btn ${tab === "relationships" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("relationships")}
        >
          Relationships
        </button>
        <button
          className={`rf-btn ${tab === "lineage" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("lineage")}
        >
          Lineage
        </button>
      </header>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 10,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : tab === "relationships" ? (
        rels.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            No relationships yet.
          </div>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {rels.map((r) => (
              <li
                key={r.id}
                style={{
                  padding: 8,
                  borderTop: "1px solid var(--rf-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    padding: "2px 6px",
                    fontSize: 11,
                    fontWeight: 700,
                    background: "var(--rf-bg3)",
                    borderRadius: 4,
                  }}
                >
                  {r.kind}
                </span>
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div>
                    {r.parentArtifactId.slice(0, 8)} →{" "}
                    {r.childArtifactId.slice(0, 8)}
                  </div>
                  {r.targetEntityType && (
                    <div style={{ color: "var(--rf-txt3)", fontSize: 11 }}>
                      target · {r.targetEntityType} ·{" "}
                      {r.targetEntityId?.slice(0, 8)}
                    </div>
                  )}
                  {r.note && (
                    <div style={{ color: "var(--rf-txt3)", fontSize: 11 }}>
                      {r.note}
                    </div>
                  )}
                </div>
                <button className="rf-btn" onClick={() => remove(r.id)}>
                 
                </button>
              </li>
            ))}
          </ul>
        )
      ) : lineage.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No prior revisions.
        </div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {lineage.map((node) => (
            <li
              key={node.id}
              style={{
                padding: 8,
                borderTop: "1px solid var(--rf-border)",
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {node.revision !== null
                  ? `Rev ${node.revision}`
                  : "Initial"}
              </div>
              <div style={{ color: "var(--rf-txt3)", fontSize: 11 }}>
                {node.id.slice(0, 8)} ·{" "}
                {node.createdAt
                  ? new Date(node.createdAt).toLocaleString()
                  : ""}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 10, fontSize: 11, color: "var(--rf-txt3)" }}>
        Kinds: {RELATIONSHIP_KINDS.join(", ")}
      </div>
    </section>
  );
}
