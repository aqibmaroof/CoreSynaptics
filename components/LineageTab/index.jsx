"use client";

// ── Phase 8 PR-3: Lineage tab ────────────────────────────────────────────────
// Three sections per entity:
//   • Root cause — upstream walk along CAUSED_BY / GENERATED_FROM / RAISED_FROM
//   • Upstream context — generic UPSTREAM walk
//   • Impact summary — five buckets returned by mode=IMPACT
// Used on Issue / NCR / Submittal / RFI / Turnover detail screens.
//
// The server clamps depth (≤6) and maxNodes (≤500). `truncated: true` means
// stop expanding — render the "Expand" affordance.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { entityLineage } from "@/services/Relationships";
import {
  hrefForNode,
  EDGE_KIND_LABEL,
  EDGE_KIND_COLOR,
} from "@/services/KnowledgeGraph";

export default function LineageTab({ entityType, entityId }) {
  const [rootCause, setRootCause] = useState(null);
  const [upstream, setUpstream] = useState(null);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [depth, setDepth] = useState(3);

  const load = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError("");
    try {
      const [rc, up, im] = await Promise.all([
        entityLineage(entityType, entityId, "ROOT_CAUSE", { depth: 4 }).catch(
          () => null
        ),
        entityLineage(entityType, entityId, "UPSTREAM", { depth }).catch(
          () => null
        ),
        entityLineage(entityType, entityId, "IMPACT", { depth: 1 }).catch(
          () => null
        ),
      ]);
      setRootCause(rc);
      setUpstream(up);
      setImpact(im);
    } catch (e) {
      setError(e?.message || "Failed to load lineage");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, depth]);

  useEffect(() => {
    load();
  }, [load]);

  if (!entityType || !entityId) return null;

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
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--rf-txt2)",
            textTransform: "uppercase",
            letterSpacing: 0.04,
          }}
        >
          Lineage
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <label style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            Depth
          </label>
          <select
            className="rf-input"
            value={depth}
            onChange={(e) => setDepth(Number(e.target.value))}
            style={{ width: 70 }}
          >
            {[1, 2, 3, 4, 5, 6].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <button className="rf-btn" onClick={load} disabled={loading}>
            {loading ? "…" : "Refresh"}
          </button>
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

      <Section title="Root cause" result={rootCause} />
      <Section title="Upstream context" result={upstream} />
      <ImpactGrid summary={impact} />
    </section>
  );
}

function Section({ title, result }) {
  if (!result) {
    return (
      <div style={{ marginTop: 12 }}>
        <SectionHeader title={title} />
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>—</div>
      </div>
    );
  }
  if (!result.seed) {
    return (
      <div style={{ marginTop: 12 }}>
        <SectionHeader title={title} />
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Not yet projected (will appear after the next event).
        </div>
      </div>
    );
  }
  const edgesByTarget = new Map();
  (result.edges ?? []).forEach((e) => {
    const list = edgesByTarget.get(e.toNodeId) ?? [];
    list.push(e);
    edgesByTarget.set(e.toNodeId, list);
  });
  const nodes = (result.nodes ?? [])
    .filter((n) => n.nodeId !== result.seed.nodeId)
    .sort((a, b) => a.depth - b.depth);
  return (
    <div style={{ marginTop: 12 }}>
      <SectionHeader
        title={title}
        right={result.truncated ? "truncated" : `${nodes.length} nodes`}
      />
      {nodes.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No connected nodes.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {nodes.map((n) => (
            <li
              key={n.nodeId}
              style={{
                padding: 6,
                borderTop: "1px solid var(--rf-border)",
                paddingLeft: 8 + (n.depth - 1) * 14,
              }}
            >
              <NodeRow node={n} edgeKinds={edgesByTarget.get(n.nodeId)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImpactGrid({ summary }) {
  if (!summary) return null;
  const groups = [
    { key: "blockedDownstream", label: "Blocked downstream", tone: "red" },
    {
      key: "dependentDownstream",
      label: "Dependent downstream",
      tone: "amber",
    },
    { key: "approvalChains", label: "Approval chains", tone: "green" },
    { key: "causedIssues", label: "Caused issues", tone: "red" },
    { key: "resolvedBy", label: "Resolved by", tone: "green" },
  ];
  const total = groups.reduce(
    (acc, g) => acc + ((summary[g.key] ?? []).length || 0),
    0
  );
  return (
    <div style={{ marginTop: 12 }}>
      <SectionHeader title="Impact" right={`${total} total`} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 8,
        }}
      >
        {groups.map((g) => {
          const rows = summary[g.key] ?? [];
          return (
            <div
              key={g.key}
              style={{
                border: "1px solid var(--rf-border)",
                borderRadius: 8,
                padding: 10,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.04,
                }}
              >
                {g.label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color:
                    g.tone === "red"
                      ? "var(--rf-red)"
                      : g.tone === "amber"
                      ? "var(--rf-yellow, #f59e0b)"
                      : g.tone === "green"
                      ? "var(--rf-green)"
                      : "var(--rf-txt)",
                }}
              >
                {rows.length}
              </div>
              {rows.length > 0 && (
                <ul
                  style={{
                    listStyle: "none",
                    margin: "6px 0 0",
                    padding: 0,
                  }}
                >
                  {rows.slice(0, 4).map((n) => (
                    <li
                      key={n.nodeId}
                      style={{
                        fontSize: 11,
                        padding: "2px 0",
                        borderTop: "1px solid var(--rf-border)",
                      }}
                    >
                      <NodeRow node={n} compact />
                    </li>
                  ))}
                  {rows.length > 4 && (
                    <li
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        padding: "2px 0",
                      }}
                    >
                      + {rows.length - 4} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NodeRow({ node, edgeKinds, compact }) {
  const href = hrefForNode(node);
  return (
    <Link
      href={href}
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
          {node.entityType}
        </span>
        <span
          style={{
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {node.title}
        </span>
        {!compact && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "var(--rf-txt3)",
            }}
          >
            d{node.depth}
          </span>
        )}
      </div>
      {edgeKinds && edgeKinds.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 4,
            marginTop: 2,
            flexWrap: "wrap",
          }}
        >
          {edgeKinds.map((e) => {
            const c = EDGE_KIND_COLOR[e.kind] || {};
            return (
              <span
                key={e.edgeId}
                style={{
                  padding: "1px 6px",
                  borderRadius: 4,
                  background: c.bg || "var(--rf-bg3)",
                  color: c.color || "var(--rf-txt3)",
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {EDGE_KIND_LABEL[e.kind] || e.kind}
              </span>
            );
          })}
        </div>
      )}
    </Link>
  );
}

function SectionHeader({ title, right }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
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
      {right && (
        <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>{right}</span>
      )}
    </div>
  );
}
