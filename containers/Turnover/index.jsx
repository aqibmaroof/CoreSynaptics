"use client";

// ── Phase 5 PR-7: Turnover packages list + detail ────────────────────────────
// Generation hits the existing readiness snapshot from v4 and creates an
// approval chain in the background.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listTurnoverPackages,
  generateTurnoverPackage,
  getTurnoverPackage,
  deliverTurnoverPackage,
  TURNOVER_STATUS_STYLE,
} from "@/services/TurnoverPackages";
import { getBundle } from "@/services/ArtifactIntelligence";
import ApprovalChainPanel from "@/components/ApprovalChainPanel";
import ContextPanel from "@/components/ContextPanel";
import LineageTab from "@/components/LineageTab";
import PredictionsCard from "@/components/PredictionsCard";
import {
  projectReadinessPredictions,
  projectDriftPredictions,
  projectProcurementRisk,
  projectWorkforceForecast,
  projectEscalationForecast,
  computePredictions,
} from "@/services/Predictions";
import { useRealtimeSocket } from "@/lib/realtime/useRealtimeSocket";
import { onEnvelope } from "@/lib/realtime/envelope";

export default function TurnoverPackages({ cxProjectId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [bundle, setBundle] = useState(null);
  const [generating, setGenerating] = useState(false);
  const socket = useRealtimeSocket();

  const refresh = useCallback(async () => {
    if (!cxProjectId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await listTurnoverPackages(cxProjectId);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load packages");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // live invalidation
  useEffect(() => {
    if (!socket) return;
    const evs = [
      "turnover.package.created",
      "turnover.package.approved",
      "turnover.package.rejected",
      "turnover.package.delivered",
    ];
    const offs = evs.map((ev) =>
      onEnvelope(socket, ev, async () => {
        await refresh();
        if (selected) {
          try {
            const fresh = await getTurnoverPackage(cxProjectId, selected.id);
            setSelected(fresh);
          } catch {
            /* ignore */
          }
        }
      })
    );
    return () => offs.forEach((off) => off());
  }, [socket, refresh, selected, cxProjectId]);

  // Load bundle when selection has one.
  useEffect(() => {
    let cancelled = false;
    setBundle(null);
    (async () => {
      if (!selected?.bundleId) return;
      try {
        const b = await getBundle(selected.bundleId);
        if (!cancelled) setBundle(b);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected?.bundleId]);

  const openPackage = async (pkg) => {
    try {
      const fresh = await getTurnoverPackage(cxProjectId, pkg.id);
      setSelected(fresh);
    } catch (e) {
      setError(e?.message || "Failed to open");
    }
  };

  const generate = async () => {
    setGenerating(true);
    try {
      await generateTurnoverPackage(cxProjectId);
      await refresh();
    } catch (e) {
      setError(e?.message || "Generate failed");
    } finally {
      setGenerating(false);
    }
  };

  const deliver = async () => {
    if (!selected) return;
    try {
      await deliverTurnoverPackage(cxProjectId, selected.id);
      await openPackage(selected);
      await refresh();
    } catch (e) {
      setError(e?.message || "Deliver failed");
    }
  };

  const canDeliver = selected?.status === "APPROVED";

  const readinessChecks = useMemo(
    () => selected?.readinessSnapshot?.checks ?? [],
    [selected]
  );

  if (!cxProjectId) {
    return (
      <div style={{ padding: 24, color: "var(--rf-txt3)" }}>
        Pick a project to view turnover packages.
      </div>
    );
  }

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
            Turnover packages
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Project · {cxProjectId.slice(0, 8)}
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={generate}
          disabled={generating}
        >
          {generating ? "Generating…" : "Generate package"}
        </button>
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

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}
      >
        <div className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--rf-border)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Packages
          </div>
          {loading ? (
            <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
              None yet.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rows.map((p) => {
                const ps =
                  TURNOVER_STATUS_STYLE[p.status] ||
                  TURNOVER_STATUS_STYLE.DRAFT;
                return (
                  <li
                    key={p.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <button
                      type="button"
                      onClick={() => openPackage(p)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background:
                          selected?.id === p.id
                            ? "var(--rf-bg2)"
                            : "transparent",
                        border: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          {p.packageNumber} · {p.title}
                        </span>
                        <span
                          style={{
                            marginLeft: "auto",
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 4,
                            background: ps.bg,
                            color: ps.color,
                          }}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                          marginTop: 2,
                        }}
                      >
                        Readiness {p.readinessPct}%
                        {p.generatedAt
                          ? ` · ${new Date(p.generatedAt).toLocaleDateString()}`
                          : ""}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rf-card" style={{ padding: 14 }}>
          {!selected ? (
            <div style={{ color: "var(--rf-txt3)" }}>
              Select a package to inspect readiness, approval and bundle.
            </div>
          ) : (
            <>
              <header
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {selected.packageNumber} · {selected.title}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "var(--rf-txt3)" }}
                  >
                    Status · {selected.status} · Readiness{" "}
                    {selected.readinessPct}%
                  </div>
                </div>
                {canDeliver && (
                  <button
                    className="rf-btn rf-btn-primary"
                    onClick={deliver}
                  >
                    Deliver
                  </button>
                )}
              </header>

              <Section title="Readiness checks">
                {readinessChecks.length === 0 ? (
                  <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
                    No checks recorded.
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {readinessChecks.map((c) => (
                      <li
                        key={c.id}
                        style={{
                          padding: 6,
                          borderTop: "1px solid var(--rf-border)",
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            background:
                              c.done === c.total
                                ? "var(--rf-green)"
                                : "var(--rf-yellow, #f59e0b)",
                          }}
                        />
                        <span style={{ flex: 1 }}>{c.label}</span>
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          {c.done}/{c.total}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {selected.approvalChainId && (
                <Section title="Approval">
                  <ApprovalChainPanel
                    chainId={selected.approvalChainId}
                    onChange={() => openPackage(selected)}
                  />
                </Section>
              )}

              {bundle && (
                <Section title={`Bundle · ${bundle.title}`}>
                  {(bundle.items ?? []).length === 0 ? (
                    <div
                      style={{ color: "var(--rf-txt3)", fontSize: 13 }}
                    >
                      Bundle is empty.
                    </div>
                  ) : (
                    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                      {(bundle.items ?? []).map((it) => (
                        <li
                          key={it.id}
                          style={{
                            padding: 6,
                            borderTop: "1px solid var(--rf-border)",
                            fontSize: 12,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            {it.section || "—"}
                          </span>
                          {" · "}
                          {it.caption ||
                            `Artifact ${it.artifactId.slice(0, 8)}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              )}

              {(selected.items ?? []).length > 0 && (
                <Section title="Items">
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {selected.items.map((it) => (
                      <li
                        key={it.id}
                        style={{
                          padding: 6,
                          borderTop: "1px solid var(--rf-border)",
                          fontSize: 12,
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{it.section}</span>
                        {" · "}
                        {it.entityType} · {it.entityId.slice(0, 8)} ·{" "}
                        {it.status}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* v8 PR-7: turnover-preset context + impact lineage */}
              <Section title="Operational context">
                <ContextPanel
                  entityType="TurnoverPackage"
                  entityId={selected.id}
                  preset="auto"
                />
              </Section>
              <Section title="Lineage">
                <LineageTab
                  entityType="TurnoverPackage"
                  entityId={selected.id}
                />
              </Section>
            </>
          )}
        </div>
      </div>

      {/* ── Phase 9: Predictive intelligence for this project ──────────── */}
      {cxProjectId && (
        <div
          style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: 16,
          }}
        >
          <PredictionsCard
            title="Readiness forecast"
            cxProjectId={cxProjectId}
            fetcher={projectReadinessPredictions}
            onComputeRequested={async (id) => {
              await computePredictions(id);
              await refresh();
            }}
            emptyMessage="No readiness predictions. Hit Recompute after a milestone."
          />
          <PredictionsCard
            title="Schedule drift & bottlenecks"
            cxProjectId={cxProjectId}
            fetcher={projectDriftPredictions}
            emptyMessage="No drift detected."
          />
          <PredictionsCard
            title="Procurement & supply risk"
            cxProjectId={cxProjectId}
            fetcher={projectProcurementRisk}
            emptyMessage="No procurement risks."
          />
          <PredictionsCard
            title="Workforce forecast"
            cxProjectId={cxProjectId}
            fetcher={projectWorkforceForecast}
            emptyMessage="No workforce shortages forecast."
          />
          <PredictionsCard
            title="Escalation forecast"
            cxProjectId={cxProjectId}
            fetcher={projectEscalationForecast}
            emptyMessage="No escalations forecast."
          />
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--rf-txt2)",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.04,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
