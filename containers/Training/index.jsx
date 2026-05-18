"use client";

// ── Phase 12: Training container (tabbed) ────────────────────────────────────
// Tabs:
//   • Scenarios  — picker + drawer with start button
//   • My Runs    — active runs + the player
//   • History    — terminal runs + replay timeline + outcome scorecard
//   • Analytics  — KPIs / trends / weakness / heatmap / cert risk
//
// Hard rule: every panel renders server data verbatim. Never compute scoring,
// success rate, or step ordering on the client.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getScenario,
  startSimulationRun,
  listSimulationRuns,
  finalizeSimulationRun,
  learningKpis,
  simulationTrend,
  scenarioWeakness,
  competencyHeatmap,
  certificationRisk,
  SIM_STATUS_STYLE,
} from "@/services/Learning";
import ScenarioPicker from "@/components/ScenarioPicker";
import SimulationRunner from "@/components/SimulationRunner";
import ReplayTimeline from "@/components/ReplayTimeline";
import OutcomeScorecard from "@/components/OutcomeScorecard";

const TERMINAL = new Set(["COMPLETED", "ABORTED", "FAILED"]);

export default function Training() {
  const [tab, setTab] = useState("scenarios");
  const [activeRunId, setActiveRunId] = useState(null);
  const [scenarioDetail, setScenarioDetail] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  const openScenario = useCallback(async (s) => {
    try {
      const detail = await getScenario(s.id);
      setScenarioDetail(detail);
    } catch (e) {
      setStartError(e?.message || "Failed to load scenario");
    }
  }, []);

  const start = useCallback(async (cxProjectId) => {
    if (!scenarioDetail) return;
    setStarting(true);
    setStartError("");
    try {
      const run = await startSimulationRun({
        scenarioId: scenarioDetail.id,
        cxProjectId: cxProjectId || undefined,
        idempotencyKey: `${scenarioDetail.id}-${Date.now()}`,
      });
      setActiveRunId(run.id);
      setScenarioDetail(null);
      setTab("runs");
    } catch (e) {
      setStartError(e?.message || "Start failed");
    } finally {
      setStarting(false);
    }
  }, [scenarioDetail]);

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--rf-txt)",
          }}
        >
          Training & Simulation
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Deterministic operational simulations with server-computed scoring
          and explainability.
        </p>
      </header>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          ["scenarios", "Scenarios"],
          ["runs", "My runs"],
          ["history", "History"],
          ["analytics", "Analytics"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`rf-btn ${tab === k ? "rf-btn-primary" : ""}`}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "scenarios" && (
        <>
          <ScenarioPicker onSelect={openScenario} />
          {scenarioDetail && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100,
                padding: 20,
              }}
              onClick={() => setScenarioDetail(null)}
            >
              <div
                className="rf-card"
                style={{
                  padding: 20,
                  maxWidth: 720,
                  width: "100%",
                  maxHeight: "92vh",
                  overflow: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <header style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>
                    {scenarioDetail.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
                    {scenarioDetail.role} · {scenarioDetail.difficulty} ·{" "}
                    {scenarioDetail.totalSteps} steps
                  </div>
                </header>
                <ol
                  style={{
                    listStyle: "decimal inside",
                    margin: 0,
                    padding: 0,
                    fontSize: 13,
                  }}
                >
                  {(scenarioDetail.steps ?? []).map((s) => (
                    <li
                      key={s.ordinal}
                      style={{
                        padding: 6,
                        borderTop: "1px solid var(--rf-border)",
                      }}
                    >
                      <strong>{s.title}</strong>
                      {s.prompt && (
                        <div
                          style={{
                            color: "var(--rf-txt2)",
                            fontSize: 12,
                          }}
                        >
                          {s.prompt}
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
                {startError && (
                  <div
                    style={{
                      padding: 8,
                      background: "rgba(239,68,68,0.12)",
                      color: "var(--rf-red)",
                      borderRadius: 6,
                      fontSize: 12,
                      marginTop: 10,
                    }}
                  >
                    {startError}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                    marginTop: 12,
                  }}
                >
                  <button
                    className="rf-btn"
                    onClick={() => setScenarioDetail(null)}
                    disabled={starting}
                  >
                    Cancel
                  </button>
                  <button
                    className="rf-btn rf-btn-primary"
                    onClick={() => start()}
                    disabled={starting}
                  >
                    {starting ? "Starting…" : "Start run"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "runs" && (
        <RunsTab
          activeRunId={activeRunId}
          setActiveRunId={setActiveRunId}
          showTerminal={false}
        />
      )}

      {tab === "history" && (
        <RunsTab
          activeRunId={activeRunId}
          setActiveRunId={setActiveRunId}
          showTerminal
        />
      )}

      {tab === "analytics" && <AnalyticsTab />}
    </div>
  );
}

// ─── Runs tab (active + history) ─────────────────────────────────────────────
function RunsTab({ activeRunId, setActiveRunId, showTerminal }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listSimulationRuns({ limit: 100 });
      setRuns(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load runs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(
    () =>
      runs.filter((r) =>
        showTerminal ? TERMINAL.has(r.status) : !TERMINAL.has(r.status)
      ),
    [runs, showTerminal]
  );

  // Auto-finalize on history view when row is selected. The call is
  // idempotent server-side per the v12 spec.
  useEffect(() => {
    if (!showTerminal || !activeRunId) return;
    let cancelled = false;
    (async () => {
      try {
        const o = await finalizeSimulationRun(activeRunId);
        if (!cancelled) setOutcome(o);
      } catch {
        /* swallow — user can hit Finalize manually inside the runner */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showTerminal, activeRunId]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.6fr)",
        gap: 16,
      }}
    >
      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <header
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            {showTerminal ? "History" : "Active runs"} ({filtered.length})
          </span>
          <button className="rf-btn" onClick={refresh} disabled={loading}>
            {loading ? "…" : "Refresh"}
          </button>
        </header>
        {error && (
          <div
            style={{
              padding: 10,
              background: "rgba(239,68,68,0.12)",
              color: "var(--rf-red)",
              borderRadius: 6,
              margin: 10,
            }}
          >
            {error}
          </div>
        )}
        {filtered.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
            {showTerminal
              ? "No completed runs yet."
              : "No active runs. Start one from the Scenarios tab."}
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filtered.map((r) => {
              const sty =
                SIM_STATUS_STYLE[r.status] || SIM_STATUS_STYLE.PENDING;
              const isActive = activeRunId === r.id;
              return (
                <li
                  key={r.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOutcome(null);
                      setActiveRunId(r.id);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      background: isActive
                        ? "var(--rf-bg2)"
                        : "transparent",
                      border: 0,
                      cursor: "pointer",
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
                          background: sty.bg,
                          color: sty.color,
                        }}
                      >
                        {r.status}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {r.scenarioTitle || r.scenarioId?.slice?.(0, 8) || "?"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        marginTop: 2,
                      }}
                    >
                      {r.role} · {r.difficulty} · step {r.currentStep}/
                      {r.totalSteps}
                      {r.startedAt
                        ? ` · ${new Date(r.startedAt).toLocaleString()}`
                        : ""}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div style={{ display: "grid", gap: 16 }}>
        {!activeRunId ? (
          <div style={{ color: "var(--rf-txt3)", padding: 14 }}>
            Pick a run.
          </div>
        ) : (
          <>
            <SimulationRunner
              runId={activeRunId}
              onFinalized={(o) => setOutcome(o)}
            />
            {showTerminal && (
              <>
                {outcome && <OutcomeScorecard outcome={outcome} />}
                <ReplayTimeline runId={activeRunId} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Analytics tab ───────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData] = useState({
    kpis: null,
    trend: null,
    weakness: null,
    heatmap: null,
    certRisk: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [kpis, trend, weakness, heatmap, certRisk] = await Promise.all([
        learningKpis().catch(() => null),
        simulationTrend().catch(() => null),
        scenarioWeakness().catch(() => null),
        competencyHeatmap().catch(() => null),
        certificationRisk().catch(() => null),
      ]);
      setData({ kpis, trend, weakness, heatmap, certRisk });
    } catch (e) {
      setError(e?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const k = data.kpis;
  const t = data.trend;
  const weakness = Array.isArray(data.weakness) ? data.weakness : [];
  const heatmap = Array.isArray(data.heatmap) ? data.heatmap : [];
  const certRisk = Array.isArray(data.certRisk) ? data.certRisk : [];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8,
        }}
      >
        <Tile label="Runs 30d" value={k?.totalRuns30d} />
        <Tile label="Completed" value={k?.completedRuns30d} />
        <Tile
          label="Aborted"
          value={k?.abortedRuns30d}
          tone={k?.abortedRuns30d > 0 ? "yellow" : null}
        />
        <Tile label="Avg score" value={k?.averageScore30d} />
        <Tile label="Active guided" value={k?.activeGuidedSessions} />
        <Tile label="Competency records" value={k?.competencyRecords} />
        <Tile
          label="Certs expiring"
          value={k?.expiringCertifications}
          tone={k?.expiringCertifications > 0 ? "yellow" : null}
        />
        <Tile
          label="Certs expired"
          value={k?.expiredCertifications}
          tone={k?.expiredCertifications > 0 ? "red" : null}
        />
      </section>

      <section className="rf-card" style={{ padding: 14 }}>
        <SectionHeader title="Simulation success trend" />
        {!t ? (
          <Muted>{loading ? "Loading…" : "No data."}</Muted>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 8,
            }}
          >
            <Tile label={`Window (d)`} value={t.windowDays} compact />
            <Tile label="Total" value={t.total} compact />
            <Tile
              label="Success"
              value={t.successCount}
              tone="green"
              compact
            />
            <Tile
              label="Partial"
              value={t.partialCount}
              tone="yellow"
              compact
            />
            <Tile
              label="Failure"
              value={t.failureCount}
              tone="red"
              compact
            />
            <Tile
              label="Success rate"
              value={
                t.successRate != null
                  ? `${(t.successRate * 100).toFixed(1)}%`
                  : "—"
              }
              compact
            />
          </div>
        )}
      </section>

      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Scenario weakness ({weakness.length})
        </div>
        {weakness.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Scenario</th>
                <th style={{ ...th, textAlign: "right" }}>Attempts</th>
                <th style={{ ...th, textAlign: "right" }}>Success rate</th>
                <th style={{ ...th, textAlign: "right" }}>Avg score</th>
              </tr>
            </thead>
            <tbody>
              {weakness.map((w) => (
                <tr
                  key={w.scenarioId}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    {w.scenarioTitle || w.scenarioId.slice(0, 8)}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {w.attempts}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color:
                        w.successRate < 0.5 ? "var(--rf-red)" : undefined,
                    }}
                  >
                    {(w.successRate * 100).toFixed(1)}%
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {w.avgScore?.toFixed?.(1) ?? w.avgScore}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="rf-card" style={{ padding: 14 }}>
        <SectionHeader
          title={`Role × skill heatmap (${heatmap.length} cells)`}
        />
        {heatmap.length === 0 ? (
          <Muted>No data.</Muted>
        ) : (
          <HeatmapGrid cells={heatmap} />
        )}
      </section>

      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Certification risk ({certRisk.length})
        </div>
        {certRisk.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Type</th>
                <th style={{ ...th, textAlign: "right" }}>Valid</th>
                <th style={{ ...th, textAlign: "right" }}>Expiring</th>
                <th style={{ ...th, textAlign: "right" }}>Expired</th>
                <th style={{ ...th, textAlign: "right" }}>Missing</th>
              </tr>
            </thead>
            <tbody>
              {certRisk.map((c) => (
                <tr
                  key={c.type}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{c.type}</td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {c.valid}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color:
                        c.expiring > 0
                          ? "var(--rf-yellow, #f59e0b)"
                          : undefined,
                    }}
                  >
                    {c.expiring}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: c.expired > 0 ? "var(--rf-red)" : undefined,
                    }}
                  >
                    {c.expired}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                      color: c.missing > 0 ? "var(--rf-red)" : undefined,
                    }}
                  >
                    {c.missing}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

// ─── Heatmap (role × skill) ──────────────────────────────────────────────────
function HeatmapGrid({ cells }) {
  // Group server cells into a pivot: roles × skills.
  const roles = Array.from(new Set(cells.map((c) => c.roleName))).sort();
  const skills = Array.from(new Set(cells.map((c) => c.skillKey))).sort();
  const byKey = new Map();
  for (const c of cells) byKey.set(`${c.roleName}|${c.skillKey}`, c);

  if (!roles.length || !skills.length)
    return <Muted>No data.</Muted>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
        <thead>
          <tr>
            <th style={th}></th>
            {skills.map((s) => (
              <th key={s} style={{ ...th, textAlign: "center" }}>
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr
              key={r}
              style={{ borderTop: "1px solid var(--rf-border)" }}
            >
              <td style={{ ...td, fontWeight: 600 }}>{r}</td>
              {skills.map((s) => {
                const cell = byKey.get(`${r}|${s}`);
                const share = cell?.share ?? null;
                const bg =
                  share == null
                    ? "var(--rf-bg3)"
                    : `rgba(34,197,94,${Math.max(0.05, Math.min(1, share)).toFixed(2)})`;
                return (
                  <td
                    key={s}
                    title={
                      cell
                        ? `${cell.proficientCount}/${cell.totalUsers} proficient`
                        : "no data"
                    }
                    style={{
                      ...td,
                      textAlign: "center",
                      background: bg,
                      fontFamily: "monospace",
                      fontSize: 11,
                    }}
                  >
                    {share == null ? "—" : `${Math.round(share * 100)}%`}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--rf-txt3)",
        textTransform: "uppercase",
        letterSpacing: 0.04,
        marginBottom: 6,
      }}
    >
      {title}
    </div>
  );
}

function Muted({ children }) {
  return (
    <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>{children}</div>
  );
}

function Tile({ label, value, tone, compact }) {
  const color =
    tone === "red"
      ? "var(--rf-red)"
      : tone === "yellow"
      ? "var(--rf-yellow, #f59e0b)"
      : tone === "green"
      ? "var(--rf-green)"
      : "var(--rf-txt)";
  return (
    <div
      className="rf-card"
      style={{
        padding: compact ? 8 : 12,
        display: "grid",
        gap: 2,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: compact ? 14 : 18,
          fontWeight: 700,
          fontFamily: "monospace",
          color,
        }}
      >
        {value == null
          ? "—"
          : typeof value === "number"
          ? value.toLocaleString()
          : value}
      </div>
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "8px 10px", fontSize: 12, color: "var(--rf-txt)" };
