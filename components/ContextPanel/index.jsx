"use client";

// ── Phase 8 PR-7: Operational context panel ──────────────────────────────────
// Single-call right-rail panel. Backend picks the canonical bundle by entity
// type when preset='auto':
//   • Issue           → IssueContextBundle           (artifacts, approvals,
//                                                     comms, readiness blockers,
//                                                     linked risks, events,
//                                                     impact summary)
//   • ProcurementItem → ProcurementContextBundle     (delays, dependencies,
//                                                     risks, approvals, comms,
//                                                     operational impact)
//   • TurnoverPackage → TurnoverContextBundle        (readiness blockers,
//                                                     failed tests, NCRs,
//                                                     linked approvals,
//                                                     unresolved blockers)
//   • anything else   → generic ContextualBundle
//
// 404 on preset mismatch — we always pass 'auto'.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  entityContextBundle,
  isIssueBundle,
  isProcurementBundle,
  isTurnoverBundle,
  isGenericBundle,
  RELATED_VIA_LABEL,
} from "@/services/Relationships";
import { hrefForNode } from "@/services/KnowledgeGraph";

export default function ContextPanel({ entityType, entityId, preset = "auto" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError("");
    try {
      const res = await entityContextBundle(entityType, entityId, { preset });
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load context");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, preset]);

  useEffect(() => {
    load();
  }, [load]);

  if (!entityType || !entityId) return null;

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
        Context
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
      ) : isIssueBundle(data) ? (
        <IssueView bundle={data.bundle} />
      ) : isProcurementBundle(data) ? (
        <ProcurementView bundle={data.bundle} />
      ) : isTurnoverBundle(data) ? (
        <TurnoverView bundle={data.bundle} />
      ) : isGenericBundle(data) ? (
        <GenericView bundle={data} />
      ) : (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No context yet.
        </div>
      )}
    </aside>
  );
}

// ─── Issue ───────────────────────────────────────────────────────────────────
function IssueView({ bundle: b }) {
  return (
    <>
      <Section title="Related artifacts" items={b.relatedArtifacts} />
      <Section title="Approvals" items={b.approvals} />
      <Section title="Communications" items={b.communications} />
      <Section title="Readiness blockers" items={b.readinessBlockers} />
      <Section title="Linked risks" items={b.linkedRisks} />
      {(b.operationalEvents ?? []).length > 0 && (
        <div style={{ marginTop: 10 }}>
          <SectionHeader title="Operational events" />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {b.operationalEvents.slice(0, 8).map((ev) => (
              <li
                key={ev.id}
                style={{
                  padding: 6,
                  borderTop: "1px solid var(--rf-border)",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                    color: "var(--rf-txt2)",
                  }}
                >
                  {ev.eventName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                  }}
                >
                  {ev.severity} ·{" "}
                  {ev.occurredAt
                    ? new Date(ev.occurredAt).toLocaleString()
                    : "—"}
                  {ev.target ? ` · ${ev.target}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ImpactStrip impact={b.impact} />
    </>
  );
}

// ─── Procurement ─────────────────────────────────────────────────────────────
function ProcurementView({ bundle: b }) {
  return (
    <>
      <Section title="Delays" items={b.delays} severityFirst />
      <Section title="Dependencies" items={b.dependencies} />
      <Section title="Risks" items={b.risks} severityFirst />
      <Section title="Approvals" items={b.approvals} />
      <Section title="Communications" items={b.communications} />
      {(b.operationalImpact ?? []).length > 0 && (
        <div style={{ marginTop: 10 }}>
          <SectionHeader title="Operational impact" />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {b.operationalImpact.slice(0, 6).map((n) => (
              <li
                key={n.nodeId}
                style={{
                  padding: 6,
                  borderTop: "1px solid var(--rf-border)",
                }}
              >
                <BundleRow item={n} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ─── Turnover ────────────────────────────────────────────────────────────────
function TurnoverView({ bundle: b }) {
  return (
    <>
      <Section title="Readiness blockers" items={b.readinessBlockers} severityFirst />
      <Section title="Failed tests" items={b.failedTests} />
      <Section title="Open NCRs" items={b.openNCRs} severityFirst />
      <Section title="Linked approvals" items={b.linkedApprovals} />
      <Section
        title="All unresolved blockers"
        items={b.unresolvedBlockers}
        collapsibleAt={6}
      />
    </>
  );
}

// ─── Generic ─────────────────────────────────────────────────────────────────
function GenericView({ bundle: b }) {
  return (
    <>
      {(b.direct ?? []).length > 0 && (
        <div style={{ marginTop: 4 }}>
          <SectionHeader title="Direct neighbors" />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {b.direct.slice(0, 8).map((n) => (
              <li
                key={n.edgeId}
                style={{
                  padding: 6,
                  borderTop: "1px solid var(--rf-border)",
                }}
              >
                <BundleRow item={n.node} extra={n.kind} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <Section title="Contextual" items={b.contextual} />
      <Section title="Approval associations" items={b.approvalAssociations} />
      <Section title="Communication associations" items={b.communicationAssociations} />
      <Section title="Asset associations" items={b.assetAssociations} />
    </>
  );
}

// ─── Reusable section ────────────────────────────────────────────────────────
function Section({ title, items, severityFirst, collapsibleAt }) {
  const list = (items ?? []).slice();
  if (!list.length) return null;
  if (severityFirst) {
    const rank = (s) =>
      s === "CRITICAL" ? 0 : s === "HIGH" ? 1 : s === "MEDIUM" ? 2 : 3;
    list.sort((a, b) => rank(a.severity) - rank(b.severity));
  }
  const visible =
    collapsibleAt && list.length > collapsibleAt
      ? list.slice(0, collapsibleAt)
      : list;
  const hidden = list.length - visible.length;
  return (
    <div style={{ marginTop: 10 }}>
      <SectionHeader title={title} right={list.length} />
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {visible.map((it) => (
          <li
            key={`${it.entityType}:${it.entityId}`}
            style={{ padding: 6, borderTop: "1px solid var(--rf-border)" }}
          >
            <BundleRow item={it} />
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            marginTop: 4,
          }}
        >
          + {hidden} more
        </div>
      )}
    </div>
  );
}

function BundleRow({ item, extra }) {
  const href = hrefForNode({
    entityType: item.entityType,
    entityId: item.entityId,
  });
  return (
    <Link
      href={href}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
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
          {item.entityType}
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
          {item.title}
        </span>
        {extra && (
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "var(--rf-txt3)",
            }}
          >
            {extra}
          </span>
        )}
      </div>
      {(item.severity || item.status || item.via) && (
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            marginTop: 2,
          }}
        >
          {[item.severity, item.status]
            .filter(Boolean)
            .concat(item.via ? [`via ${RELATED_VIA_LABEL[item.via] || item.via}`] : [])
            .join(" · ")}
        </div>
      )}
    </Link>
  );
}

function ImpactStrip({ impact }) {
  if (!impact) return null;
  const stats = [
    ["Blocked", (impact.blockedDownstream ?? []).length, "var(--rf-red)"],
    [
      "Dependent",
      (impact.dependentDownstream ?? []).length,
      "var(--rf-yellow, #f59e0b)",
    ],
    ["Approvals", (impact.approvalChains ?? []).length, "var(--rf-green)"],
    ["Caused", (impact.causedIssues ?? []).length, "var(--rf-red)"],
    ["Resolved", (impact.resolvedBy ?? []).length, "var(--rf-green)"],
  ];
  return (
    <div style={{ marginTop: 10 }}>
      <SectionHeader title="Impact" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))",
          gap: 6,
        }}
      >
        {stats.map(([label, count, color]) => (
          <div
            key={label}
            style={{
              border: "1px solid var(--rf-border)",
              borderRadius: 6,
              padding: 6,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "monospace",
                color,
              }}
            >
              {count}
            </div>
            <div style={{ fontSize: 10, color: "var(--rf-txt3)" }}>{label}</div>
          </div>
        ))}
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
        <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>{right}</span>
      )}
    </div>
  );
}
