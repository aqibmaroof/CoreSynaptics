"use client";

import { useCallback, useEffect, useState } from "react";
import { getProjectDependencies } from "@/services/CxProjects";

// ── Mock projects ─────────────────────────────────────────────────────────────
const MOCK_PROJECTS = [
  { id: "cx-p1", code: "MSFT-DC1", name: "Microsoft Atlanta Expansion" },
  { id: "cx-p2", code: "QTS-IRV-3", name: "QTS Irving Phase 3" },
  { id: "cx-p3", code: "CRWV-CHI", name: "CoreWeave Chicago Build" },
  { id: "cx-p4", code: "CRS0-RN0", name: "Crusoe Reno Pod-1" },
  { id: "cx-p5", code: "GLXY-DAL", name: "Galaxy Dallas Hyperscale" },
];

// ── Mock dependency graph ─────────────────────────────────────────────────────
const MOCK_GRAPH = {
  summary: {
    blockedAssetCount: 3,
    openHoldPointCount: 2,
    unresolvedBlockerCount: 5,
    criticalPathLength: 4,
  },
  graph: {
    nodes: [
      {
        id: "phase:L1",
        kind: "PHASE",
        label: "L1 — Pre-Energization",
        status: "COMPLETE",
      },
      {
        id: "phase:L2",
        kind: "PHASE",
        label: "L2 — Energization",
        status: "IN_PROGRESS",
      },
      {
        id: "phase:L3",
        kind: "PHASE",
        label: "L3 — Functional Test",
        status: "BLOCKED",
      },
      {
        id: "phase:L4",
        kind: "PHASE",
        label: "L4 — Integrated Test",
        status: "NOT_STARTED",
      },
      { id: "phase:IST", kind: "PHASE", label: "IST", status: "NOT_STARTED" },
      {
        id: "asset:a1",
        kind: "ASSET",
        label: "UPS-01",
        assetCode: "UPS-01",
        phase: "L2",
        status: "IN_PROGRESS",
      },
      {
        id: "asset:a2",
        kind: "ASSET",
        label: "CRAC-01",
        assetCode: "CRAC-01",
        phase: "L1",
        status: "BLOCKED",
      },
      {
        id: "asset:a3",
        kind: "ASSET",
        label: "GEN-01",
        assetCode: "GEN-01",
        phase: "L3",
        status: "IN_PROGRESS",
      },
      {
        id: "asset:a4",
        kind: "ASSET",
        label: "STS-01",
        assetCode: "STS-01",
        phase: "L3",
        status: "BLOCKED",
      },
      {
        id: "blocker:b1",
        kind: "BLOCKER",
        label: "HWP-022 — Hold Point",
        blockerType: "HOLD_POINT",
        severity: "HIGH",
      },
      {
        id: "blocker:b2",
        kind: "BLOCKER",
        label: "NCR-017 — Non-Conformance",
        blockerType: "NCR",
        severity: "HIGH",
      },
      {
        id: "blocker:b3",
        kind: "BLOCKER",
        label: "ISS-089 — Critical Issue",
        blockerType: "ISSUE",
        severity: "CRITICAL",
      },
    ],
    edges: [
      { source: "phase:L1", target: "phase:L2", kind: "PHASE_SEQUENCE" },
      { source: "phase:L2", target: "phase:L3", kind: "PHASE_SEQUENCE" },
      { source: "phase:L3", target: "phase:L4", kind: "PHASE_SEQUENCE" },
      { source: "phase:L4", target: "phase:IST", kind: "PHASE_SEQUENCE" },
      { source: "asset:a2", target: "blocker:b1", kind: "BLOCKED_BY" },
      { source: "asset:a4", target: "blocker:b2", kind: "BLOCKED_BY" },
      { source: "phase:L3", target: "blocker:b3", kind: "BLOCKED_BY" },
      { source: "asset:a1", target: "phase:L2", kind: "ASSET_IN_PHASE" },
      { source: "asset:a2", target: "phase:L1", kind: "ASSET_IN_PHASE" },
      { source: "asset:a3", target: "phase:L3", kind: "ASSET_IN_PHASE" },
      { source: "asset:a4", target: "phase:L3", kind: "ASSET_IN_PHASE" },
    ],
  },
};

// ── Node kind styles ──────────────────────────────────────────────────────────
const KIND_STYLE = {
  PHASE: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", icon: "◈" },
  ASSET: { bg: "rgba(14,165,233,0.1)", color: "#0ea5e9", icon: "⚙" },
  BLOCKER: { bg: "rgba(239,68,68,0.1)", color: "#dc2626", icon: "⛔" },
};

const STATUS_COLOR = {
  COMPLETE: "#16a34a",
  IN_PROGRESS: "#d97706",
  BLOCKED: "#dc2626",
  NOT_STARTED: "#94a3b8",
  HIGH: "#f97316",
  CRITICAL: "#dc2626",
};

const EDGE_KIND_LABEL = {
  PHASE_SEQUENCE: "→ next phase",
  BLOCKED_BY: "blocked by",
  ASSET_IN_PHASE: "in phase",
};

// ── Main export ───────────────────────────────────────────────────────────────
export default function Dependencies() {
  const [projectId, setProjectId] = useState(MOCK_PROJECTS[0].id);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterKind, setFilterKind] = useState("ALL");
  const [expandedNodeId, setExpandedNodeId] = useState(null);

  const load = useCallback(async (pid) => {
    setLoading(true);
    try {
      const res = await getProjectDependencies(pid);
      setData(res && res.graph ? res : MOCK_GRAPH);
    } catch {
      setData(MOCK_GRAPH);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(projectId);
  }, [projectId, load]);

  const nodes = data?.graph?.nodes ?? [];
  const edges = data?.graph?.edges ?? [];
  const summary = data?.summary ?? MOCK_GRAPH.summary;

  const filteredNodes =
    filterKind === "ALL" ? nodes : nodes.filter((n) => n.kind === filterKind);

  // Build adjacency: for each node, which edges connect to it?
  const edgesFor = (nodeId) =>
    edges.filter((e) => e.source === nodeId || e.target === nodeId);

  const KPI_ITEMS = [
    {
      label: "Blocked Assets",
      value: summary.blockedAssetCount,
      color: "#dc2626",
    },
    {
      label: "Open Hold Points",
      value: summary.openHoldPointCount,
      color: "#f97316",
    },
    {
      label: "Unresolved Blockers",
      value: summary.unresolvedBlockerCount,
      color: "#d97706",
    },
    {
      label: "Critical Path Length",
      value: summary.criticalPathLength,
      color: "#6366f1",
    },
  ];

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              color: "var(--rf-txt, #0f172a)",
            }}
          >
            Dependency Graph
          </h1>
          <div
            style={{
              fontSize: 13,
              color: "var(--rf-txt-muted, #64748b)",
              marginTop: 2,
            }}
          >
            Phase backbone · asset nodes · blocker links
          </div>
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid var(--rf-border, #e2e8f0)",
            background: "var(--rf-surface, #fff)",
            color: "var(--rf-txt, #0f172a)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {MOCK_PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} · {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--rf-txt-muted)",
          }}
        >
          Loading…
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {KPI_ITEMS.map((k) => (
              <div
                key={k.label}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "var(--rf-surface, #fff)",
                  border: "1px solid var(--rf-border, #e2e8f0)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: k.color }}>
                  {k.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--rf-txt-muted)",
                    marginTop: 2,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 600,
                  }}
                >
                  {k.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filter buttons */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {["ALL", "PHASE", "ASSET", "BLOCKER"].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilterKind(k)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1px solid ${filterKind === k ? "var(--rf-accent, #6366f1)" : "var(--rf-border, #e2e8f0)"}`,
                  background:
                    filterKind === k
                      ? "var(--rf-accent, #6366f1)"
                      : "transparent",
                  color:
                    filterKind === k ? "#fff" : "var(--rf-txt-muted, #64748b)",
                  cursor: "pointer",
                }}
              >
                {k === "ALL"
                  ? "All nodes"
                  : k === "PHASE"
                    ? "Phases"
                    : k === "ASSET"
                      ? "Assets"
                      : "Blockers"}
              </button>
            ))}
          </div>

          {/* Node list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredNodes.map((node) => {
              const ks = KIND_STYLE[node.kind] || KIND_STYLE.ASSET;
              const statusColor =
                STATUS_COLOR[node.status] ||
                STATUS_COLOR[node.severity] ||
                "#64748b";
              const connected = edgesFor(node.id);
              const isExpanded = expandedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${isExpanded ? "var(--rf-accent, #6366f1)" : "var(--rf-border, #e2e8f0)"}`,
                    background: "var(--rf-surface, #fff)",
                    overflow: "hidden",
                  }}
                >
                  {/* Node header */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedNodeId(isExpanded ? null : node.id)
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      width: "100%",
                      padding: "12px 16px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: ks.bg,
                        color: ks.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {ks.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "var(--rf-txt, #0f172a)",
                        }}
                      >
                        {node.label}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "var(--rf-txt-muted)" }}
                      >
                        {node.kind} · ID: {node.id}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                    >
                      {(node.status || node.severity) && (
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: 20,
                            background: `${statusColor}18`,
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {node.status || node.severity}
                        </span>
                      )}
                      <span
                        style={{ fontSize: 11, color: "var(--rf-txt-muted)" }}
                      >
                        {connected.length} link
                        {connected.length !== 1 ? "s" : ""}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--rf-txt-muted)",
                          fontWeight: 700,
                        }}
                      >
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </button>

                  {/* Edge list */}
                  {isExpanded && connected.length > 0 && (
                    <div
                      style={{
                        borderTop: "1px solid var(--rf-border, #e2e8f0)",
                        padding: "10px 16px 14px",
                        background: "var(--rf-bg-soft, #f8fafc)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          color: "var(--rf-txt-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 8,
                        }}
                      >
                        Connections
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        {connected.map((edge, i) => {
                          const isSource = edge.source === node.id;
                          const otherId = isSource ? edge.target : edge.source;
                          const otherNode = nodes.find((n) => n.id === otherId);
                          return (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                fontSize: 12,
                                color: "var(--rf-txt, #0f172a)",
                                padding: "5px 0",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--rf-txt-muted)",
                                  fontSize: 11,
                                  width: 60,
                                  textAlign: "right",
                                  flexShrink: 0,
                                }}
                              >
                                {isSource ? "→" : "←"}
                              </span>
                              <span style={{ fontWeight: 600 }}>
                                {otherNode?.label ?? otherId}
                              </span>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: 10,
                                  background: "rgba(99,102,241,0.1)",
                                  color: "#6366f1",
                                  fontSize: 10,
                                  fontWeight: 700,
                                }}
                              >
                                {EDGE_KIND_LABEL[edge.kind] || edge.kind}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {isExpanded && connected.length === 0 && (
                    <div
                      style={{
                        borderTop: "1px solid var(--rf-border)",
                        padding: "10px 16px",
                        color: "var(--rf-txt-muted)",
                        fontSize: 12,
                      }}
                    >
                      No connections
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
