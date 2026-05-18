"use client";

// ── Phase 11: Automation Intelligence admin ──────────────────────────────────
// Five tabs:
//   • Overview — summary + KPIs + top recs
//   • Health   — conflicts / loops / storms / dead chains / stuck / metrics
//   • Recs     — merged tuning recs (policy + optimization + escalation)
//   • Policies — three-pane versioning console (inventory / revisions / diff)
//   • Governance — inventory / policies audit / dependency graph / audit trail
//
// Hard rule: every panel renders server data verbatim. Never re-derive health
// colour, conflicts, loops, diffs, or recommendations on the client.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  automationSummary,
  automationHealthDetail,
  automationRecommendations,
  automationOptimization,
  automationPolicies,
  automationGovernance,
  policyRevisions,
  policyDiff,
  policyRollback,
  policySchedule,
  policyAttachApproval,
  policyPromote,
  HEALTH_STYLE,
  ORG_POLICY_TYPES,
  CONFLICT_KIND_LABEL,
  DEAD_CHAIN_REASON_LABEL,
} from "@/services/AutomationIntelligence";
import { listAutomationExecutions } from "@/services/Automation";
import LensFilter from "@/components/LensFilter";
import RecommendationsCard from "@/components/RecommendationsCard";
import ExecutionExplainDrawer from "@/components/ExecutionExplainDrawer";

export default function AutomationIntelligence() {
  const [tab, setTab] = useState("overview");
  const [lens, setLens] = useState();

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
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
            Automation Intelligence
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Adaptive policy, health and tuning intelligence over the existing
            automation engine. Every panel renders server-computed data.
          </p>
        </div>
        <LensFilter value={lens} onChange={setLens} />
      </header>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        {[
          ["overview", "Overview"],
          ["health", "Health"],
          ["recs", "Recommendations"],
          ["optimization", "Optimization"],
          ["policies", "Policies"],
          ["governance", "Governance"],
          ["explain", "Execution explain"],
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

      {tab === "overview" && <Overview lens={lens} />}
      {tab === "health" && <HealthTab />}
      {tab === "recs" && (
        <RecommendationsCard
          title="Tuning recommendations"
          fetcher={(p) =>
            automationRecommendations(p).then((xs) => ({
              recommendations: Array.isArray(xs) ? xs : xs?.items ?? [],
              evaluatedAt: new Date().toISOString(),
              lens: p?.lens || null,
            }))
          }
          lens={lens}
          topN={50}
          emptyMessage="No tuning suggestions right now."
        />
      )}
      {tab === "optimization" && (
        <RecommendationsCard
          title="Optimization"
          fetcher={(p) =>
            automationOptimization(p).then((xs) => ({
              recommendations: Array.isArray(xs) ? xs : xs?.items ?? [],
              evaluatedAt: new Date().toISOString(),
              lens: p?.lens || null,
            }))
          }
          lens={lens}
          topN={50}
          emptyMessage="No optimization opportunities right now."
        />
      )}
      {tab === "policies" && <PoliciesConsole />}
      {tab === "governance" && <GovernanceTab />}
      {tab === "explain" && <ExplainTab lens={lens} />}
    </div>
  );
}

// ─── Overview tab ────────────────────────────────────────────────────────────
function Overview({ lens }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await automationSummary(lens);
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, [lens]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (error)
    return (
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
    );
  if (loading && !data)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (!data) return null;

  const hs = data.health || {};
  const sty = HEALTH_STYLE[hs.health] || HEALTH_STYLE.GREEN;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section
        className="rf-card"
        style={{
          padding: 14,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 6,
            background: sty.bg,
            color: sty.color,
          }}
        >
          {hs.health || "—"}
        </span>
        <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          {hs.successRate30d != null
            ? `${(hs.successRate30d * 100).toFixed(1)}% success · 30d`
            : "—"}
        </span>
        <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          {hs.totalExecutions30d?.toLocaleString?.() ?? hs.totalExecutions30d}{" "}
          executions · 30d
        </span>
        {(hs.notes ?? []).map((n) => (
          <span
            key={n}
            style={{
              fontSize: 11,
              padding: "1px 8px",
              borderRadius: 4,
              background: "var(--rf-bg3)",
              color: "var(--rf-txt3)",
            }}
          >
            {n}
          </span>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 8,
        }}
      >
        <Tile label="Rules" value={data.counts?.rules} />
        <Tile label="Active" value={data.counts?.activeRules} />
        <Tile label="Policies" value={data.counts?.policies} />
        <Tile label="Active policies" value={data.counts?.activePolicies} />
        <Tile
          label="Dependency edges"
          value={data.counts?.dependencyEdges}
        />
      </section>

      <section className="rf-card" style={{ padding: 14 }}>
        <header
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--rf-txt2)",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.04,
          }}
        >
          Top recommendations
        </header>
        {(data.topRecommendations ?? []).length === 0 ? (
          <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Automation is healthy — nothing to tune.
          </div>
        ) : (
          <RecommendationsCard
            title=""
            fetcher={async () => ({
              recommendations: data.topRecommendations,
              evaluatedAt: data.evaluatedAt,
              lens: data.lens,
            })}
            topN={data.topRecommendations.length}
            showLens={false}
            emptyMessage=""
          />
        )}
      </section>
    </div>
  );
}

// ─── Health tab ──────────────────────────────────────────────────────────────
function HealthTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await automationHealthDetail();
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (error)
    return (
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
    );
  if (loading && !data)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (!data) return null;

  const summary = data.summary || {};
  const sty = HEALTH_STYLE[summary.health] || HEALTH_STYLE.GREEN;

  const sortedMetrics = [...(data.metrics ?? [])].sort(
    (a, b) => (a.successRate ?? 0) - (b.successRate ?? 0)
  );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section
        className="rf-card"
        style={{
          padding: 14,
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "4px 12px",
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 6,
            background: sty.bg,
            color: sty.color,
          }}
        >
          {summary.health || "—"}
        </span>
        <Tile label="Rules" value={summary.totalRules} compact />
        <Tile label="Active" value={summary.activeRules} compact />
        <Tile
          label="Success 30d"
          value={
            summary.successRate30d != null
              ? `${(summary.successRate30d * 100).toFixed(1)}%`
              : "—"
          }
          compact
        />
        <Tile
          label="Failing"
          value={summary.failingRules}
          tone={summary.failingRules > 0 ? "red" : null}
          compact
        />
        <Tile
          label="Silent"
          value={summary.silentRules}
          tone={summary.silentRules > 0 ? "yellow" : null}
          compact
        />
        <Tile
          label="Conflicts"
          value={summary.conflicts}
          tone={summary.conflicts > 0 ? "yellow" : null}
          compact
        />
        <Tile
          label="Loops"
          value={summary.loops}
          tone={summary.loops > 0 ? "red" : null}
          compact
        />
        <Tile
          label="Storms"
          value={summary.notificationStorms}
          tone={summary.notificationStorms > 0 ? "yellow" : null}
          compact
        />
      </section>

      <CollapsibleList
        title={`Conflicts (${(data.conflicts ?? []).length})`}
        items={data.conflicts}
        renderItem={(c) => (
          <div
            key={c.ruleIds.join("|")}
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
                  padding: "1px 6px",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 4,
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt3)",
                }}
              >
                {CONFLICT_KIND_LABEL[c.kind] || c.kind}
              </span>
              {c.eventName && (
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                  }}
                >
                  {c.eventName}
                </span>
              )}
            </div>
            <div style={{ fontSize: 13 }}>{c.detail}</div>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginTop: 4,
                flexWrap: "wrap",
              }}
            >
              {(c.ruleNames ?? []).map((n, i) => (
                <span
                  key={`${n}-${i}`}
                  style={{
                    fontSize: 11,
                    padding: "1px 8px",
                    border: "1px solid var(--rf-border)",
                    borderRadius: 4,
                  }}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}
      />

      <CollapsibleList
        title={`Loops (${(data.loops ?? []).length})`}
        items={data.loops}
        renderItem={(l) => (
          <div
            key={l.cycleKey}
            style={{
              padding: 8,
              borderTop: "1px solid var(--rf-border)",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--rf-red)",
              }}
            >
              {(l.ruleNames ?? []).join(" → ")} (hops: {l.hops})
            </div>
            <div style={{ fontSize: 12, color: "var(--rf-txt2)" }}>
              {l.detail}
            </div>
          </div>
        )}
      />

      <CollapsibleList
        title={`Notification storms (${(data.storms ?? []).length})`}
        items={data.storms}
        renderItem={(s) => (
          <div
            key={`${s.category}|${s.windowStart}`}
            style={{
              padding: 8,
              borderTop: "1px solid var(--rf-border)",
            }}
          >
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>{s.category}</span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                }}
              >
                {s.count}/{s.threshold}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--rf-txt2)" }}>
              {new Date(s.windowStart).toLocaleString()} →{" "}
              {new Date(s.windowEnd).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
              {s.detail}
            </div>
          </div>
        )}
      />

      <CollapsibleList
        title={`Dead chains (${(data.deadChains ?? []).length})`}
        items={data.deadChains}
        renderItem={(d) => (
          <div
            key={d.ruleId}
            style={{
              padding: 8,
              borderTop: "1px solid var(--rf-border)",
              display: "flex",
              gap: 6,
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 600 }}>{d.ruleName}</span>
            <span
              style={{
                fontSize: 11,
                color: "var(--rf-txt3)",
              }}
            >
              · {DEAD_CHAIN_REASON_LABEL[d.reason] || d.reason}
            </span>
          </div>
        )}
      />

      <CollapsibleList
        title={`Stuck executions (${(data.stuck ?? []).length})`}
        items={data.stuck}
        renderItem={(e) => (
          <div
            key={e.executionId}
            style={{
              padding: 8,
              borderTop: "1px solid var(--rf-border)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{e.ruleName}</div>
            <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
              {e.status} · {e.ageMinutes}m old · started{" "}
              {new Date(e.startedAt).toLocaleString()}
            </div>
          </div>
        )}
      />

      <section className="rf-card" style={{ overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Per-rule metrics ({sortedMetrics.length}) · worst first
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rf-bg2)" }}>
              <th style={th}>Rule</th>
              <th style={{ ...th, textAlign: "right" }}>Runs</th>
              <th style={{ ...th, textAlign: "right" }}>Success</th>
              <th style={{ ...th, textAlign: "right" }}>Fail</th>
              <th style={{ ...th, textAlign: "right" }}>24h fail</th>
              <th style={{ ...th, textAlign: "right" }}>Avg ms</th>
              <th style={{ ...th, textAlign: "right" }}>p95 ms</th>
              <th style={th}>Last run</th>
            </tr>
          </thead>
          <tbody>
            {sortedMetrics.map((m) => (
              <tr
                key={m.ruleId}
                style={{ borderTop: "1px solid var(--rf-border)" }}
              >
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{m.ruleName}</div>
                  <div style={{ fontSize: 10, color: "var(--rf-txt3)" }}>
                    {m.isActive ? "active" : "inactive"}
                  </div>
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontFamily: "monospace",
                  }}
                >
                  {m.totalExecutions}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontFamily: "monospace",
                  }}
                >
                  {((m.successRate ?? 0) * 100).toFixed(0)}%
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontFamily: "monospace",
                    color: m.failureCount > 0 ? "var(--rf-red)" : undefined,
                  }}
                >
                  {m.failureCount}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontFamily: "monospace",
                    color:
                      m.failuresLast24h > 0 ? "var(--rf-red)" : undefined,
                  }}
                >
                  {m.failuresLast24h}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontFamily: "monospace",
                  }}
                >
                  {m.avgLatencyMs ?? "—"}
                </td>
                <td
                  style={{
                    ...td,
                    textAlign: "right",
                    fontFamily: "monospace",
                  }}
                >
                  {m.p95LatencyMs ?? "—"}
                </td>
                <td style={td}>
                  {m.lastExecutionAt
                    ? new Date(m.lastExecutionAt).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// ─── Policies versioning console ─────────────────────────────────────────────
function PoliciesConsole() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null); // { policyType, key }
  const [revs, setRevs] = useState([]);
  const [diffPair, setDiffPair] = useState({ from: null, to: null });
  const [diff, setDiff] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({
    config: {},
    activateAt: "",
    changeNote: "",
  });
  const [attachId, setAttachId] = useState({});

  const refreshInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await automationPolicies();
      setInventory(Array.isArray(res) ? res : res?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load policies");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshInventory();
  }, [refreshInventory]);

  const loadRevs = useCallback(async () => {
    if (!active) {
      setRevs([]);
      return;
    }
    try {
      const xs = await policyRevisions(active.policyType, active.key);
      setRevs(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load revisions");
    }
  }, [active]);

  useEffect(() => {
    loadRevs();
  }, [loadRevs]);

  // Auto-load diff when both versions chosen.
  useEffect(() => {
    if (
      !active ||
      diffPair.from == null ||
      diffPair.to == null ||
      diffPair.from === diffPair.to
    ) {
      setDiff(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await policyDiff(
          active.policyType,
          active.key,
          diffPair.from,
          diffPair.to
        );
        if (!cancelled) setDiff(res);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Diff failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [active, diffPair]);

  const doRollback = async (rev) => {
    if (!active) return;
    if (
      !confirm(
        `Rollback ${active.policyType}/${active.key} to v${rev.version}? This creates a new version copying that config.`
      )
    )
      return;
    setBusy(true);
    try {
      await policyRollback(active.policyType, active.key, rev.version, {
        changeNote: `rollback to v${rev.version}`,
      });
      await loadRevs();
      await refreshInventory();
    } catch (e) {
      setError(e?.message || "Rollback failed");
    } finally {
      setBusy(false);
    }
  };

  const doPromote = async (rev) => {
    if (!confirm(`Promote v${rev.version} now?`)) return;
    setBusy(true);
    try {
      await policyPromote(rev.id);
      await loadRevs();
      await refreshInventory();
    } catch (e) {
      setError(e?.message || "Promote failed");
    } finally {
      setBusy(false);
    }
  };

  const doAttach = async (rev) => {
    const chainId = (attachId[rev.id] || "").trim();
    if (!chainId) return;
    setBusy(true);
    try {
      await policyAttachApproval(rev.id, chainId);
      setAttachId((m) => ({ ...m, [rev.id]: "" }));
      await loadRevs();
    } catch (e) {
      setError(e?.message || "Attach failed");
    } finally {
      setBusy(false);
    }
  };

  const doSchedule = async () => {
    if (!active) return;
    const activateAt = scheduleDraft.activateAt;
    if (!activateAt) return alert("Pick an activation timestamp.");
    if (new Date(activateAt).getTime() < Date.now() + 60_000)
      return alert("activateAt must be ≥ now + 1 minute.");
    setBusy(true);
    try {
      await policySchedule(active.policyType, active.key, {
        config: scheduleDraft.config,
        activateAt: new Date(activateAt).toISOString(),
        changeNote: scheduleDraft.changeNote || undefined,
      });
      setScheduleDraft({ config: {}, activateAt: "", changeNote: "" });
      await loadRevs();
      await refreshInventory();
    } catch (e) {
      setError(e?.message || "Schedule failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1fr) minmax(280px, 1fr) minmax(280px, 1.4fr)",
        gap: 16,
      }}
    >
      {error && (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {/* Inventory pane */}
      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Policies ({inventory.length})
        </div>
        {loading && inventory.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>Loading…</div>
        ) : inventory.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {inventory.map((p) => {
              const isActive =
                active?.policyType === p.policyType && active?.key === p.key;
              return (
                <li
                  key={p.policyId}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActive({ policyType: p.policyType, key: p.key })
                    }
                    style={{
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
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: "var(--rf-bg3)",
                          color: "var(--rf-txt3)",
                        }}
                      >
                        {p.policyType}
                      </span>
                      <span style={{ fontWeight: 600 }}>{p.key}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                        }}
                      >
                        v{p.version}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        gap: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      {p.hasScheduledActivation && <Tag>scheduled</Tag>}
                      {p.hasPendingApproval && <Tag>pending approval</Tag>}
                      {!p.isActive && <Tag tone="muted">inactive</Tag>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Revisions pane */}
      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Revisions {active ? `· ${active.key}` : ""}
        </div>
        {!active ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
            Select a policy.
          </div>
        ) : revs.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
            No revisions.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {revs.map((r) => (
              <li
                key={r.id}
                style={{
                  padding: "10px 14px",
                  borderTop: "1px solid var(--rf-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontWeight: 700,
                    }}
                  >
                    v{r.version}
                  </span>
                  {r.isActive && <Tag tone="ok">active</Tag>}
                  {r.scheduledActivationAt && (
                    <Tag>
                      scheduled ·{" "}
                      {new Date(r.scheduledActivationAt).toLocaleString()}
                    </Tag>
                  )}
                  {r.pendingApprovalChainId && (
                    <Tag>
                      approval · {r.pendingApprovalChainId.slice(0, 8)}…
                    </Tag>
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                  by {r.createdBy?.slice?.(0, 8) ?? "—"} on{" "}
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : "—"}
                </div>
                {r.changeNote && (
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    {r.changeNote}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="rf-btn"
                    onClick={() =>
                      setDiffPair((dp) => ({ ...dp, from: r.version }))
                    }
                  >
                    Diff from
                  </button>
                  <button
                    className="rf-btn"
                    onClick={() =>
                      setDiffPair((dp) => ({ ...dp, to: r.version }))
                    }
                  >
                    Diff to
                  </button>
                  <button
                    className="rf-btn"
                    onClick={() => doRollback(r)}
                    disabled={busy || r.isActive}
                  >
                    Rollback
                  </button>
                  {r.scheduledActivationAt && !r.isActive && (
                    <button
                      className="rf-btn rf-btn-primary"
                      onClick={() => doPromote(r)}
                      disabled={busy}
                    >
                      Promote now
                    </button>
                  )}
                  {!r.pendingApprovalChainId && !r.isActive && (
                    <span
                      style={{
                        display: "inline-flex",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      <input
                        className="rf-input"
                        placeholder="approvalChainId"
                        value={attachId[r.id] || ""}
                        onChange={(e) =>
                          setAttachId((m) => ({
                            ...m,
                            [r.id]: e.target.value,
                          }))
                        }
                        style={{ width: 160, fontSize: 11 }}
                      />
                      <button
                        className="rf-btn"
                        onClick={() => doAttach(r)}
                        disabled={busy || !(attachId[r.id] || "").trim()}
                      >
                        Attach approval
                      </button>
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Diff + schedule pane */}
      <section className="rf-card" style={{ padding: 14 }}>
        <header
          style={{
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Diff
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: "var(--rf-txt3)",
              fontWeight: 400,
            }}
          >
            {diffPair.from != null ? `v${diffPair.from}` : "?"} →{" "}
            {diffPair.to != null ? `v${diffPair.to}` : "?"}
          </span>
        </header>
        {!diff ? (
          <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Pick "Diff from" and "Diff to" on two revisions.
          </div>
        ) : (
          <DiffView diff={diff} />
        )}

        <hr
          style={{
            margin: "16px 0",
            border: "none",
            borderTop: "1px solid var(--rf-border)",
          }}
        />

        <header
          style={{
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Schedule future activation
        </header>
        {!active ? (
          <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Select a policy first.
          </div>
        ) : (
          <>
            <Field label="Config (JSON)">
              <textarea
                className="rf-input"
                rows={6}
                value={JSON.stringify(scheduleDraft.config ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    setScheduleDraft({
                      ...scheduleDraft,
                      config: JSON.parse(e.target.value || "{}"),
                    });
                  } catch {
                    /* swallow */
                  }
                }}
              />
            </Field>
            <Field label="Activate at (must be ≥ now + 1 min)">
              <input
                className="rf-input"
                type="datetime-local"
                value={scheduleDraft.activateAt}
                onChange={(e) =>
                  setScheduleDraft({
                    ...scheduleDraft,
                    activateAt: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Change note (optional)">
              <input
                className="rf-input"
                value={scheduleDraft.changeNote}
                onChange={(e) =>
                  setScheduleDraft({
                    ...scheduleDraft,
                    changeNote: e.target.value,
                  })
                }
              />
            </Field>
            <button
              className="rf-btn rf-btn-primary"
              onClick={doSchedule}
              disabled={busy || !scheduleDraft.activateAt}
            >
              {busy ? "Scheduling…" : "Schedule"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

function DiffView({ diff }) {
  const added = Object.entries(diff.added ?? {});
  const removed = Object.entries(diff.removed ?? {});
  const changed = Object.entries(diff.changed ?? {});
  if (!added.length && !removed.length && !changed.length) {
    return (
      <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
        No differences.
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <DiffBlock
        title={`Added (${added.length})`}
        rows={added}
        color="var(--rf-green)"
      />
      <DiffBlock
        title={`Removed (${removed.length})`}
        rows={removed}
        color="var(--rf-red)"
      />
      <DiffBlock
        title={`Changed (${changed.length})`}
        rows={changed.map(([k, v]) => [k, v])}
        isChanged
        color="var(--rf-yellow, #f59e0b)"
      />
    </div>
  );
}

function DiffBlock({ title, rows, color, isChanged }) {
  if (!rows.length) return null;
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color,
          textTransform: "uppercase",
          letterSpacing: 0.04,
          marginBottom: 4,
        }}
      >
        {title}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {rows.map(([key, value]) => (
          <li
            key={key}
            style={{
              padding: 6,
              borderTop: "1px solid var(--rf-border)",
              fontFamily: "monospace",
              fontSize: 11,
            }}
          >
            <div style={{ fontWeight: 700 }}>{key}</div>
            {isChanged ? (
              <>
                <div style={{ color: "var(--rf-red)" }}>
                  - {JSON.stringify(value.from)}
                </div>
                <div style={{ color: "var(--rf-green)" }}>
                  + {JSON.stringify(value.to)}
                </div>
              </>
            ) : (
              <div style={{ color: "var(--rf-txt3)" }}>
                {JSON.stringify(value)}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Governance tab ──────────────────────────────────────────────────────────
function GovernanceTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sub, setSub] = useState("inventory");
  // Highlight nodes whose ruleId appears in any health-loop detection.
  const [loopIds, setLoopIds] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const [gov, health] = await Promise.all([
          automationGovernance(),
          automationHealthDetail().catch(() => null),
        ]);
        if (cancelled) return;
        setData(gov);
        const ids = new Set();
        (health?.loops ?? []).forEach((l) =>
          (l.ruleIds ?? []).forEach((id) => ids.add(id))
        );
        setLoopIds(ids);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load governance");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error)
    return (
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
    );
  if (loading && !data)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (!data) return null;

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[
          ["inventory", `Rules (${(data.inventory ?? []).length})`],
          ["policies", `Policies (${(data.policyInventory ?? []).length})`],
          [
            "deps",
            `Dependencies (${(data.dependencyGraph ?? []).length} edges)`,
          ],
          ["audit", `Audit (${(data.auditTrail ?? []).length})`],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`rf-btn ${sub === k ? "rf-btn-primary" : ""}`}
            onClick={() => setSub(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {sub === "inventory" && <InventoryTable rows={data.inventory ?? []} />}
      {sub === "policies" && (
        <PolicyAuditTable rows={data.policyInventory ?? []} />
      )}
      {sub === "deps" && (
        <DependencyEdgesTable
          edges={data.dependencyGraph ?? []}
          loopIds={loopIds}
        />
      )}
      {sub === "audit" && <AuditTimeline rows={data.auditTrail ?? []} />}
    </div>
  );
}

function InventoryTable({ rows }) {
  if (rows.length === 0)
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--rf-txt3)",
        }}
      >
        No rules.
      </div>
    );
  return (
    <div className="rf-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--rf-bg2)" }}>
            <th style={th}>Rule</th>
            <th style={th}>Trigger</th>
            <th style={th}>Event / cron</th>
            <th style={th}>Actions</th>
            <th style={th}>Active</th>
            <th style={th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.ruleId}
              style={{ borderTop: "1px solid var(--rf-border)" }}
            >
              <td style={td}>
                <div style={{ fontWeight: 600 }}>{r.ruleName}</div>
                {r.description && (
                  <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                    {r.description}
                  </div>
                )}
              </td>
              <td style={td}>{r.trigger}</td>
              <td style={{ ...td, fontFamily: "monospace" }}>
                {r.eventName || r.cronExpr || "—"}
              </td>
              <td style={td}>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {(r.actionKinds ?? []).map((k, i) => (
                    <span
                      key={`${k}-${i}`}
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: "var(--rf-bg3)",
                        color: "var(--rf-txt3)",
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </td>
              <td style={td}>{r.isActive ? "Yes" : "No"}</td>
              <td style={td}>
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PolicyAuditTable({ rows }) {
  if (rows.length === 0)
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--rf-txt3)",
        }}
      >
        No policies.
      </div>
    );
  return (
    <div className="rf-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--rf-bg2)" }}>
            <th style={th}>Type</th>
            <th style={th}>Key</th>
            <th style={th}>Version</th>
            <th style={th}>Active</th>
            <th style={th}>Scheduled</th>
            <th style={th}>Pending approval</th>
            <th style={th}>Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr
              key={p.policyId}
              style={{ borderTop: "1px solid var(--rf-border)" }}
            >
              <td style={td}>{p.policyType}</td>
              <td style={td}>
                <div style={{ fontWeight: 600 }}>{p.key}</div>
              </td>
              <td style={td}>v{p.version}</td>
              <td style={td}>{p.isActive ? "Yes" : "No"}</td>
              <td style={td}>
                {p.hasScheduledActivation ? "Yes" : "—"}
              </td>
              <td style={td}>{p.hasPendingApproval ? "Yes" : "—"}</td>
              <td style={td}>
                {p.createdAt
                  ? new Date(p.createdAt).toLocaleString()
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DependencyEdgesTable({ edges, loopIds }) {
  if (edges.length === 0)
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--rf-txt3)",
        }}
      >
        No dependency edges.
      </div>
    );
  return (
    <div className="rf-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--rf-bg2)" }}>
            <th style={th}>From</th>
            <th style={th}>Emits</th>
            <th style={th}>To</th>
          </tr>
        </thead>
        <tbody>
          {edges.map((e, i) => {
            const fromInLoop = loopIds.has(e.fromRuleId);
            const toInLoop = loopIds.has(e.toRuleId);
            return (
              <tr
                key={`${e.fromRuleId}-${e.toRuleId}-${i}`}
                style={{
                  borderTop: "1px solid var(--rf-border)",
                  background:
                    fromInLoop && toInLoop
                      ? "rgba(239,68,68,0.06)"
                      : undefined,
                }}
              >
                <td style={td}>
                  {e.fromRuleName}
                  {fromInLoop && <Tag tone="red">in loop</Tag>}
                </td>
                <td
                  style={{
                    ...td,
                    fontFamily: "monospace",
                    color: "var(--rf-txt3)",
                  }}
                >
                  {e.emits}
                </td>
                <td style={td}>
                  {e.toRuleName}
                  {toInLoop && <Tag tone="red">in loop</Tag>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AuditTimeline({ rows }) {
  if (rows.length === 0)
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--rf-txt3)",
        }}
      >
        No audit rows.
      </div>
    );
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rows.map((r) => (
        <li
          key={`${r.kind}-${r.refId}`}
          className="rf-card"
          style={{ padding: 10, marginBottom: 6 }}
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
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 4,
                background: "var(--rf-bg3)",
                color: "var(--rf-txt3)",
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
              {r.timestamp
                ? new Date(r.timestamp).toLocaleString()
                : "—"}
            </span>
            {r.actor && (
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "monospace",
                  color: "var(--rf-txt3)",
                }}
              >
                · {r.actor.slice(0, 8)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13 }}>{r.summary}</div>
        </li>
      ))}
    </ul>
  );
}

// ─── Execution Explain tab ───────────────────────────────────────────────────
function ExplainTab({ lens }) {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const xs = await listAutomationExecutions({ limit: 50 });
        if (!cancelled)
          setExecutions(Array.isArray(xs) ? xs : xs?.items ?? []);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Failed to load executions");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.5fr)",
        gap: 16,
      }}
    >
      {error && (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Recent executions
        </div>
        {loading && executions.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>Loading…</div>
        ) : executions.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {executions.map((e) => {
              const id = e.id || e.executionId;
              const isActive = selected === id;
              return (
                <li
                  key={id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setSelected(id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      border: 0,
                      background: isActive
                        ? "var(--rf-bg2)"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {e.ruleName || e.ruleId?.slice?.(0, 8) || id?.slice?.(0, 8)}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                      }}
                    >
                      {e.status} ·{" "}
                      {e.startedAt
                        ? new Date(e.startedAt).toLocaleString()
                        : "—"}
                      {e.sourceEventName ? ` · ${e.sourceEventName}` : ""}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div>
        {selected ? (
          <ExecutionExplainDrawer
            executionId={selected}
            lens={lens}
            onClose={() => setSelected(null)}
          />
        ) : (
          <div
            style={{
              color: "var(--rf-txt3)",
              fontSize: 13,
              padding: 14,
            }}
          >
            Pick an execution to view its policy resolution + explainability
            bundle.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────
function Tile({ label, value, tone, compact }) {
  const color =
    tone === "red"
      ? "var(--rf-red)"
      : tone === "yellow"
      ? "var(--rf-yellow, #f59e0b)"
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
        {typeof value === "number" ? value.toLocaleString() : value ?? "—"}
      </div>
    </div>
  );
}

function CollapsibleList({ title, items = [], renderItem }) {
  const [open, setOpen] = useState(items.length > 0);
  return (
    <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "10px 14px",
          background: "transparent",
          border: 0,
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          color: "var(--rf-txt)",
        }}
      >
        {open ? "▾" : "▸"} {title}
      </button>
      {open && (items.length === 0 ? (
        <div style={{ padding: 14, color: "var(--rf-txt3)", fontSize: 13 }}>
          None.
        </div>
      ) : (
        items.map((it, i) => renderItem(it, i))
      ))}
    </section>
  );
}

function Tag({ children, tone }) {
  const sty =
    tone === "ok"
      ? { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" }
      : tone === "red"
      ? { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" }
      : tone === "muted"
      ? { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" }
      : { color: "var(--rf-blue, #3b82f6)", bg: "rgba(59,130,246,0.16)" };
  return (
    <span
      style={{
        padding: "1px 8px",
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 4,
        background: sty.bg,
        color: sty.color,
        marginLeft: 4,
      }}
    >
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--rf-txt3)",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
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
