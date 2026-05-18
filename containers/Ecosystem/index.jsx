"use client";

// ── Phase 13: Ecosystem admin (tabbed) ───────────────────────────────────────
// Tabs:
//   • Overview     — health pill + KPIs + connector cards + latency + deps
//   • Connectors   — list with register/activate/pause/retire
//   • Executions   — retry-aware integration execution log
//   • Sync         — jobs + external entity mappings
//   • Templates    — versioned webhook templates + diagnostics
//   • Bundles      — import/export job log
//   • Partners     — federation tenancy with approval gate
//   • Credentials  — lifecycle (rotate / revoke / expiry)
//   • Recs         — ecosystem recommendations (lens-filtered via shared card)
//
// Hard rule: every panel renders server data verbatim — no client-side
// recomputation of health, drift, signatures, encryption, or retry schedules.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  // Reads
  listConnectors,
  listIntegrationExecutions,
  listSyncJobs,
  listMappings,
  listWebhookTemplates,
  webhookTemplateDiagnostics,
  listImportExportJobs,
  listPartners,
  listCredentialHealth,
  expiringCredentials,
  credentialHealthSummary,
  ecosystemSummary,
  ecosystemConnectorCards,
  ecosystemLatency,
  ecosystemDependencyGraph,
  ecosystemRecommendations,
  // Writes
  registerConnector,
  activateConnector,
  pauseConnector,
  retireConnector,
  retryIntegrationExecution,
  cancelIntegrationExecution,
  startSyncJob,
  cancelSyncJob,
  upsertWebhookTemplate,
  retireWebhookTemplate,
  startImportExportJob,
  registerPartner,
  activatePartner,
  pausePartner,
  retirePartner,
  rotateCredentialLifecycle,
  revokeCredentialLifecycle,
  setCredentialExpiry,
  // Constants
  CONNECTOR_KINDS,
  CONNECTOR_LIFECYCLES,
  EXECUTION_STATUSES,
  SYNC_JOB_KINDS,
  PARTNER_ACCESS_SCOPES,
  BUNDLE_KINDS,
  HEALTH_STYLE,
  LIFECYCLE_STYLE,
  EXECUTION_STATUS_STYLE,
  SYNC_STATUS_STYLE,
  IMEX_STATUS_STYLE,
  CREDENTIAL_STATUS_STYLE,
  PARTNER_SCOPE_STYLE,
} from "@/services/Ecosystem";
import RecommendationsCard from "@/components/RecommendationsCard";
import LensFilter from "@/components/LensFilter";

export default function Ecosystem() {
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
            Ecosystem
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Connectors, integrations, sync, webhook templates, bundles,
            partners, credentials. External systems adapt to our model.
          </p>
        </div>
        {tab === "recs" && <LensFilter value={lens} onChange={setLens} />}
      </header>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          ["overview", "Overview"],
          ["connectors", "Connectors"],
          ["executions", "Executions"],
          ["sync", "Sync"],
          ["templates", "Webhook templates"],
          ["bundles", "Bundles"],
          ["partners", "Partners"],
          ["credentials", "Credentials"],
          ["recs", "Recommendations"],
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

      {tab === "overview" && <OverviewTab />}
      {tab === "connectors" && <ConnectorsTab />}
      {tab === "executions" && <ExecutionsTab />}
      {tab === "sync" && <SyncTab />}
      {tab === "templates" && <TemplatesTab />}
      {tab === "bundles" && <BundlesTab />}
      {tab === "partners" && <PartnersTab />}
      {tab === "credentials" && <CredentialsTab />}
      {tab === "recs" && (
        <RecommendationsCard
          title="Ecosystem recommendations"
          fetcher={async (p) => {
            const recs = await ecosystemRecommendations({ limit: 50 });
            const list = Array.isArray(recs) ? recs : recs?.items ?? [];
            return {
              recommendations: p?.lens
                ? list.filter(
                    (r) => !r.lenses?.length || r.lenses.includes(p.lens)
                  )
                : list,
              evaluatedAt: new Date().toISOString(),
              lens: p?.lens || null,
            };
          }}
          lens={lens}
          topN={50}
          emptyMessage="No ecosystem recommendations right now."
        />
      )}
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [summary, setSummary] = useState(null);
  const [cards, setCards] = useState([]);
  const [latency, setLatency] = useState([]);
  const [deps, setDeps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, c, l, d] = await Promise.all([
        ecosystemSummary().catch(() => null),
        ecosystemConnectorCards().catch(() => []),
        ecosystemLatency().catch(() => []),
        ecosystemDependencyGraph().catch(() => []),
      ]);
      setSummary(s);
      setCards(Array.isArray(c) ? c : c?.items ?? []);
      setLatency(Array.isArray(l) ? l : l?.items ?? []);
      setDeps(Array.isArray(d) ? d : d?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading && !summary)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;

  const sty =
    HEALTH_STYLE[summary?.health] || HEALTH_STYLE.UNKNOWN;

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

      {summary && (
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
            {summary.health}
          </span>
          {(summary.notes ?? []).map((n) => (
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
          <button
            className="rf-btn"
            onClick={refresh}
            disabled={loading}
            style={{ marginLeft: "auto" }}
          >
            {loading ? "…" : "Refresh"}
          </button>
        </section>
      )}

      {summary && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 8,
          }}
        >
          <Tile label="Connectors" value={summary.connectors?.total} />
          <Tile
            label="Active"
            value={summary.connectors?.active}
            tone="green"
          />
          <Tile
            label="Red"
            value={summary.connectors?.red}
            tone={summary.connectors?.red > 0 ? "red" : null}
          />
          <Tile
            label="Executions 24h"
            value={summary.executions?.last24hTotal}
          />
          <Tile
            label="Success rate"
            value={
              summary.executions?.successRate24h != null
                ? `${(summary.executions.successRate24h * 100).toFixed(1)}%`
                : "—"
            }
          />
          <Tile
            label="Dead-letter"
            value={summary.executions?.deadLetter}
            tone={summary.executions?.deadLetter > 0 ? "red" : null}
          />
          <Tile
            label="Webhook DEAD"
            value={summary.webhooks?.deadCount}
            tone={summary.webhooks?.deadCount > 0 ? "red" : null}
          />
          <Tile label="Active syncs" value={summary.sync?.activeJobs} />
          <Tile
            label="Drift"
            value={summary.sync?.totalDrift}
            tone={summary.sync?.totalDrift > 0 ? "yellow" : null}
          />
          <Tile
            label="Imp/Exp 7d"
            value={
              (summary.importExport?.completedJobs7d ?? 0) +
              (summary.importExport?.failedJobs7d ?? 0)
            }
          />
          <Tile
            label="Ext workflows in progress"
            value={summary.externalWorkflows?.inProgress}
          />
        </section>
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
          Connectors ({cards.length})
        </div>
        {cards.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Name</th>
                <th style={th}>Kind</th>
                <th style={th}>Health</th>
                <th style={th}>Lifecycle</th>
                <th style={{ ...th, textAlign: "right" }}>Fail 24h</th>
                <th style={{ ...th, textAlign: "right" }}>Retry queue</th>
                <th style={{ ...th, textAlign: "right" }}>Success 24h</th>
                <th style={th}>Last check</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => {
                const hSty =
                  HEALTH_STYLE[c.health] || HEALTH_STYLE.UNKNOWN;
                const lSty =
                  LIFECYCLE_STYLE[c.lifecycle] || LIFECYCLE_STYLE.DRAFT;
                return (
                  <tr
                    key={c.connectorId}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                    </td>
                    <td style={td}>{c.kind}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "1px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: hSty.bg,
                          color: hSty.color,
                        }}
                      >
                        {c.health}
                      </span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "1px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: lSty.bg,
                          color: lSty.color,
                        }}
                      >
                        {c.lifecycle}
                      </span>
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: c.failedExecutions24h > 0 ? "var(--rf-red)" : undefined,
                      }}
                    >
                      {c.failedExecutions24h}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color:
                          c.retryQueueDepth > 0
                            ? "var(--rf-yellow, #f59e0b)"
                            : undefined,
                      }}
                    >
                      {c.retryQueueDepth}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {c.successRate24h != null
                        ? `${(c.successRate24h * 100).toFixed(0)}%`
                        : "—"}
                    </td>
                    <td style={td}>
                      {c.lastHealthCheck
                        ? new Date(c.lastHealthCheck).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          Latency ({latency.length})
        </div>
        {latency.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Connector</th>
                <th style={{ ...th, textAlign: "right" }}>Samples</th>
                <th style={{ ...th, textAlign: "right" }}>Avg ms</th>
                <th style={{ ...th, textAlign: "right" }}>p50 ms</th>
                <th style={{ ...th, textAlign: "right" }}>p95 ms</th>
              </tr>
            </thead>
            <tbody>
              {latency.map((row) => (
                <tr
                  key={row.connectorId}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{row.name}</td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {row.samples}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {row.avgMs ?? "—"}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {row.p50Ms ?? "—"}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {row.p95Ms ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          Dependency graph ({deps.length} edges)
        </div>
        {deps.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
            No mappings → no edges yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>From connector</th>
                <th style={th}>Entity type</th>
                <th style={{ ...th, textAlign: "right" }}>Count</th>
              </tr>
            </thead>
            <tbody>
              {deps.map((d, i) => (
                <tr
                  key={`${d.fromConnectorId}-${d.toEntityType}-${i}`}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{d.fromName}</td>
                  <td style={td}>{d.toEntityType}</td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {d.externalCount}
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

// ─── Connectors ──────────────────────────────────────────────────────────────
function ConnectorsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    kind: "OEM",
    name: "",
    provider: "",
    credentialAlias: "",
    capabilities: "",
    configuration: {},
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listConnectors({ limit: 200 });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    setBusy(true);
    try {
      await registerConnector({
        kind: draft.kind,
        name: draft.name,
        provider: draft.provider,
        credentialAlias: draft.credentialAlias,
        capabilities: draft.capabilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        configuration: draft.configuration,
      });
      setShowNew(false);
      setDraft({
        kind: "OEM",
        name: "",
        provider: "",
        credentialAlias: "",
        capabilities: "",
        configuration: {},
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Register failed");
    } finally {
      setBusy(false);
    }
  };

  const lifecycle = async (id, action) => {
    if (action === "retire" && !confirm("Retire this connector? Active syncs halt."))
      return;
    setBusy(true);
    try {
      if (action === "activate") await activateConnector(id);
      else if (action === "pause") await pauseConnector(id);
      else if (action === "retire") await retireConnector(id);
      await refresh();
    } catch (e) {
      setError(e?.message || `${action} failed`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowNew(true)}
        >
          + Register connector
        </button>
      </div>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No connectors registered.</Empty>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Name</th>
                <th style={th}>Kind</th>
                <th style={th}>Provider · Alias</th>
                <th style={th}>Health</th>
                <th style={th}>Lifecycle</th>
                <th style={th}>Capabilities</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const hSty =
                  HEALTH_STYLE[c.health] || HEALTH_STYLE.UNKNOWN;
                const lSty =
                  LIFECYCLE_STYLE[c.lifecycle] || LIFECYCLE_STYLE.DRAFT;
                return (
                  <tr
                    key={c.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                    </td>
                    <td style={td}>{c.kind}</td>
                    <td style={td}>
                      {c.provider} · {c.credentialAlias}
                    </td>
                    <td style={td}>
                      <Tag style={hSty}>{c.health}</Tag>
                    </td>
                    <td style={td}>
                      <Tag style={lSty}>{c.lifecycle}</Tag>
                    </td>
                    <td style={td}>
                      {(c.capabilities ?? []).join(", ") || "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.lifecycle === "DRAFT" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(c.id, "activate")}
                          disabled={busy}
                          style={{ marginRight: 6 }}
                        >
                          Activate
                        </button>
                      )}
                      {c.lifecycle === "ACTIVE" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(c.id, "pause")}
                          disabled={busy}
                          style={{ marginRight: 6 }}
                        >
                          Pause
                        </button>
                      )}
                      {c.lifecycle === "PAUSED" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(c.id, "activate")}
                          disabled={busy}
                          style={{ marginRight: 6 }}
                        >
                          Activate
                        </button>
                      )}
                      {c.lifecycle !== "RETIRED" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(c.id, "retire")}
                          disabled={busy}
                          style={{ color: "var(--rf-red)" }}
                        >
                          Retire
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Register connector
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Kind">
              <select
                className="rf-input"
                value={draft.kind}
                onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
              >
                {CONNECTOR_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Name">
              <input
                className="rf-input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="Provider">
              <input
                className="rf-input"
                value={draft.provider}
                onChange={(e) =>
                  setDraft({ ...draft, provider: e.target.value })
                }
              />
            </Field>
            <Field label="Credential alias">
              <input
                className="rf-input"
                value={draft.credentialAlias}
                onChange={(e) =>
                  setDraft({ ...draft, credentialAlias: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Capabilities (comma-separated)">
            <input
              className="rf-input"
              value={draft.capabilities}
              onChange={(e) =>
                setDraft({ ...draft, capabilities: e.target.value })
              }
              placeholder="sync.project, webhook.outbound"
            />
          </Field>
          <Field label="Configuration (JSON)">
            <textarea
              className="rf-input"
              rows={6}
              value={JSON.stringify(draft.configuration ?? {}, null, 2)}
              onChange={(e) => {
                try {
                  setDraft({
                    ...draft,
                    configuration: JSON.parse(e.target.value || "{}"),
                  });
                } catch {
                  /* swallow until valid */
                }
              }}
            />
          </Field>
          <ModalActions
            onCancel={() => setShowNew(false)}
            onSave={save}
            saveLabel="Register"
            saveDisabled={
              busy ||
              !draft.name ||
              !draft.provider ||
              !draft.credentialAlias
            }
          />
        </Modal>
      )}
    </>
  );
}

// ─── Executions ──────────────────────────────────────────────────────────────
function ExecutionsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listIntegrationExecutions({
        status: status || undefined,
        limit: 100,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const retry = async (id) => {
    setBusyId(id);
    try {
      await retryIntegrationExecution(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Retry failed");
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this execution?")) return;
    setBusyId(id);
    try {
      await cancelIntegrationExecution(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Cancel failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          className="rf-input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {EXECUTION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No executions match.</Empty>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>When</th>
                <th style={th}>Direction</th>
                <th style={th}>Operation</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Attempts</th>
                <th style={{ ...th, textAlign: "right" }}>Duration</th>
                <th style={th}>Next retry</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const sty =
                  EXECUTION_STATUS_STYLE[e.status] ||
                  EXECUTION_STATUS_STYLE.PENDING;
                const open = !!expanded[e.id];
                return (
                  <Fragment2 key={e.id}>
                    <tr style={{ borderTop: "1px solid var(--rf-border)" }}>
                      <td style={td}>
                        {e.startedAt
                          ? new Date(e.startedAt).toLocaleString()
                          : "—"}
                      </td>
                      <td style={td}>{e.direction}</td>
                      <td
                        style={{
                          ...td,
                          fontFamily: "monospace",
                          fontSize: 11,
                        }}
                      >
                        {e.operation}
                      </td>
                      <td style={td}>
                        <Tag style={sty}>{e.status}</Tag>
                      </td>
                      <td
                        style={{
                          ...td,
                          textAlign: "right",
                          fontFamily: "monospace",
                        }}
                      >
                        {e.attempts}
                      </td>
                      <td
                        style={{
                          ...td,
                          textAlign: "right",
                          fontFamily: "monospace",
                        }}
                      >
                        {e.durationMs != null ? `${e.durationMs} ms` : "—"}
                      </td>
                      <td style={td}>
                        {e.nextRetryAt
                          ? new Date(e.nextRetryAt).toLocaleString()
                          : "—"}
                      </td>
                      <td
                        style={{
                          ...td,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <button
                          className="rf-btn"
                          onClick={() =>
                            setExpanded((m) => ({ ...m, [e.id]: !m[e.id] }))
                          }
                          style={{ marginRight: 6 }}
                        >
                          {open ? "Hide" : "Details"}
                        </button>
                        {(e.status === "RETRYING" ||
                          e.status === "DEAD_LETTER") && (
                          <button
                            className="rf-btn rf-btn-primary"
                            disabled={busyId === e.id}
                            onClick={() => retry(e.id)}
                            style={{ marginRight: 6 }}
                          >
                            Retry now
                          </button>
                        )}
                        {["PENDING", "RUNNING", "RETRYING"].includes(
                          e.status
                        ) && (
                          <button
                            className="rf-btn"
                            disabled={busyId === e.id}
                            onClick={() => cancel(e.id)}
                            style={{ color: "var(--rf-red)" }}
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                    {open && (
                      <tr style={{ borderTop: "1px solid var(--rf-border)" }}>
                        <td colSpan={8} style={{ padding: 10 }}>
                          {e.lastError && (
                            <div
                              style={{
                                color: "var(--rf-red)",
                                fontSize: 12,
                                marginBottom: 6,
                              }}
                            >
                              {e.lastError}
                            </div>
                          )}
                          <details>
                            <summary
                              style={{
                                fontSize: 11,
                                color: "var(--rf-txt3)",
                                cursor: "pointer",
                              }}
                            >
                              payload
                            </summary>
                            <pre style={preStyle}>
                              {JSON.stringify(e.payload ?? {}, null, 2)}
                            </pre>
                          </details>
                          <details>
                            <summary
                              style={{
                                fontSize: 11,
                                color: "var(--rf-txt3)",
                                cursor: "pointer",
                              }}
                            >
                              result
                            </summary>
                            <pre style={preStyle}>
                              {JSON.stringify(e.result ?? {}, null, 2)}
                            </pre>
                          </details>
                        </td>
                      </tr>
                    )}
                  </Fragment2>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// Helper because React Fragment needs key only at array boundary.
function Fragment2({ children }) {
  return <>{children}</>;
}

// ─── Sync ────────────────────────────────────────────────────────────────────
function SyncTab() {
  const [jobs, setJobs] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [startDraft, setStartDraft] = useState({
    connectorId: "",
    kind: "PROJECT",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [j, m] = await Promise.all([
        listSyncJobs({ limit: 100 }).catch(() => []),
        listMappings({}).catch(() => []),
      ]);
      setJobs(Array.isArray(j) ? j : j?.items ?? []);
      setMappings(Array.isArray(m) ? m : m?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const start = async () => {
    setBusy(true);
    try {
      await startSyncJob({
        connectorId: startDraft.connectorId,
        kind: startDraft.kind,
        idempotencyKey: `manual-${startDraft.connectorId}-${startDraft.kind}-${Date.now()}`,
      });
      setShowStart(false);
      setStartDraft({ connectorId: "", kind: "PROJECT" });
      await refresh();
    } catch (e) {
      setError(e?.message || "Start failed");
    } finally {
      setBusy(false);
    }
  };

  const cancelJob = async (id) => {
    if (!confirm("Cancel this sync job?")) return;
    setBusy(true);
    try {
      await cancelSyncJob(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Cancel failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowStart(true)}
        >
          Start sync
        </button>
      </div>

      <Banner error={error} />

      <section
        className="rf-card"
        style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}
      >
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Sync jobs ({jobs.length})
        </div>
        {jobs.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>When</th>
                <th style={th}>Connector</th>
                <th style={th}>Kind</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Processed</th>
                <th style={{ ...th, textAlign: "right" }}>Failed</th>
                <th style={{ ...th, textAlign: "right" }}>Drift</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => {
                const sty =
                  SYNC_STATUS_STYLE[j.status] ||
                  SYNC_STATUS_STYLE.PENDING;
                return (
                  <tr
                    key={j.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      {j.startedAt
                        ? new Date(j.startedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {j.connectorId?.slice?.(0, 8)}
                    </td>
                    <td style={td}>{j.kind}</td>
                    <td style={td}>
                      <Tag style={sty}>{j.status}</Tag>
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {j.totalProcessed}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: j.totalFailed > 0 ? "var(--rf-red)" : undefined,
                      }}
                    >
                      {j.totalFailed}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color:
                          j.driftCount > 0
                            ? "var(--rf-yellow, #f59e0b)"
                            : undefined,
                      }}
                    >
                      {j.driftCount}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {["PENDING", "RUNNING"].includes(j.status) && (
                        <button
                          className="rf-btn"
                          onClick={() => cancelJob(j.id)}
                          disabled={busy}
                          style={{ color: "var(--rf-red)" }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
          External entity mappings ({mappings.length})
        </div>
        {mappings.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Entity</th>
                <th style={th}>Internal id</th>
                <th style={th}>External id</th>
                <th style={th}>Last synced</th>
                <th style={th}>Hash</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr
                  key={m.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{m.entityType}</td>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: 11 }}>
                    {String(m.internalId).slice(0, 12)}
                  </td>
                  <td style={{ ...td, fontFamily: "monospace", fontSize: 11 }}>
                    {m.externalId}
                  </td>
                  <td style={td}>
                    {m.lastSyncedAt
                      ? new Date(m.lastSyncedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td style={td}>
                    {m.externalHash ? "hashed" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showStart && (
        <Modal onClose={() => setShowStart(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Start sync
          </h2>
          <Field label="Connector id">
            <input
              className="rf-input"
              value={startDraft.connectorId}
              onChange={(e) =>
                setStartDraft({ ...startDraft, connectorId: e.target.value })
              }
            />
          </Field>
          <Field label="Kind">
            <select
              className="rf-input"
              value={startDraft.kind}
              onChange={(e) =>
                setStartDraft({ ...startDraft, kind: e.target.value })
              }
            >
              {SYNC_JOB_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <ModalActions
            onCancel={() => setShowStart(false)}
            onSave={start}
            saveLabel="Start"
            saveDisabled={busy || !startDraft.connectorId}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Webhook templates ───────────────────────────────────────────────────────
function TemplatesTab() {
  const [rows, setRows] = useState([]);
  const [diag, setDiag] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    key: "",
    title: "",
    description: "",
    eventPatterns: "",
    payloadSchema: {},
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listWebhookTemplates();
      const list = Array.isArray(xs) ? xs : xs?.items ?? [];
      setRows(list);
      const next = {};
      await Promise.all(
        list
          .filter((t) => t.isActive)
          .map(async (t) => {
            try {
              next[t.id] = await webhookTemplateDiagnostics(t.id);
            } catch {
              /* ignore per-row */
            }
          })
      );
      setDiag(next);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    setBusy(true);
    try {
      await upsertWebhookTemplate({
        key: draft.key,
        title: draft.title,
        description: draft.description || undefined,
        eventPatterns: draft.eventPatterns
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        payloadSchema: draft.payloadSchema,
      });
      setShowNew(false);
      setDraft({
        key: "",
        title: "",
        description: "",
        eventPatterns: "",
        payloadSchema: {},
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Upsert failed");
    } finally {
      setBusy(false);
    }
  };

  const retire = async (id) => {
    if (!confirm("Retire this template version?")) return;
    setBusy(true);
    try {
      await retireWebhookTemplate(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Retire failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowNew(true)}
        >
          + Upsert template (new version)
        </button>
      </div>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No templates registered.</Empty>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((t) => {
            const d = diag[t.id];
            const rate = d?.successRate ?? null;
            const rateColor =
              rate == null
                ? "var(--rf-txt3)"
                : rate >= 0.95
                ? "var(--rf-green)"
                : rate >= 0.8
                ? "var(--rf-yellow, #f59e0b)"
                : "var(--rf-red)";
            return (
              <li
                key={t.id}
                className="rf-card"
                style={{ padding: 12, marginBottom: 8 }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700 }}>
                    {t.title}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {t.key} · v{t.version}
                  </span>
                  {t.organizationId === null && <Tag>platform</Tag>}
                  {!t.isActive && <Tag tone="muted">retired</Tag>}
                </div>
                {t.description && (
                  <div style={{ fontSize: 12, color: "var(--rf-txt2)" }}>
                    {t.description}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                    marginTop: 4,
                  }}
                >
                  Events: {(t.eventPatterns ?? []).join(", ") || "—"}
                </div>
                {d && (
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      color: rateColor,
                    }}
                  >
                    {d.matchingSubscriptions} subs · {d.deliveriesLast7d}{" "}
                    deliveries (7d) ·{" "}
                    {d.deliveriesLast7d
                      ? `${(d.successRate * 100).toFixed(1)}% success`
                      : "n/a"}{" "}
                    · retry queue {d.retryQueueDepth}
                  </div>
                )}
                {t.isActive && t.organizationId !== null && (
                  <div style={{ marginTop: 6 }}>
                    <button
                      className="rf-btn"
                      onClick={() => retire(t.id)}
                      disabled={busy}
                      style={{ color: "var(--rf-red)" }}
                    >
                      Retire
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Upsert webhook template
          </h2>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)", marginBottom: 12 }}>
            This creates a NEW version. The server deactivates the previous one.
          </div>
          <Field label="Key">
            <input
              className="rf-input"
              value={draft.key}
              onChange={(e) => setDraft({ ...draft, key: e.target.value })}
            />
          </Field>
          <Field label="Title">
            <input
              className="rf-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Description (optional)">
            <textarea
              className="rf-input"
              rows={2}
              value={draft.description}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
            />
          </Field>
          <Field label="Event patterns (comma-separated)">
            <input
              className="rf-input"
              value={draft.eventPatterns}
              onChange={(e) =>
                setDraft({ ...draft, eventPatterns: e.target.value })
              }
              placeholder="issue.*, turnover.package.*"
            />
          </Field>
          <Field label="Payload schema (JSON)">
            <textarea
              className="rf-input"
              rows={5}
              value={JSON.stringify(draft.payloadSchema ?? {}, null, 2)}
              onChange={(e) => {
                try {
                  setDraft({
                    ...draft,
                    payloadSchema: JSON.parse(e.target.value || "{}"),
                  });
                } catch {
                  /* swallow */
                }
              }}
            />
          </Field>
          <ModalActions
            onCancel={() => setShowNew(false)}
            onSave={save}
            saveLabel="Upsert"
            saveDisabled={busy || !draft.key || !draft.title}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Bundles (import/export) ─────────────────────────────────────────────────
function BundlesTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listImportExportJobs({ limit: 100 });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startExport = async (bundleKind) => {
    setBusy(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await startImportExportJob({
        kind: "EXPORT",
        bundleKind,
        idempotencyKey: `export-${bundleKind}-${today}`,
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="rf-card" style={{ padding: 14, marginBottom: 12 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--rf-txt2)",
            textTransform: "uppercase",
            letterSpacing: 0.04,
            marginBottom: 8,
          }}
        >
          Start an export
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {BUNDLE_KINDS.map((b) => (
            <button
              key={b}
              className="rf-btn"
              onClick={() => startExport(b)}
              disabled={busy}
            >
              Export {b}
            </button>
          ))}
        </div>
      </section>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No bundle jobs yet.</Empty>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>When</th>
                <th style={th}>Kind</th>
                <th style={th}>Bundle</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Records</th>
                <th style={th}>Storage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => {
                const sty =
                  IMEX_STATUS_STYLE[j.status] || IMEX_STATUS_STYLE.PENDING;
                const downloadable =
                  (j.status === "COMPLETED" || j.status === "PARTIAL") &&
                  j.storageKey;
                return (
                  <tr
                    key={j.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      {j.startedAt
                        ? new Date(j.startedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td style={td}>{j.kind}</td>
                    <td style={td}>{j.bundleKind}</td>
                    <td style={td}>
                      <Tag style={sty}>{j.status}</Tag>
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {j.processedRecords}
                      {j.totalRecords ? ` / ${j.totalRecords}` : ""}
                      {j.failedRecords ? ` (${j.failedRecords} fail)` : ""}
                    </td>
                    <td style={td}>
                      {downloadable ? (
                        <a
                          href={`/api/admin/storage/${encodeURIComponent(j.storageKey)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Partners ────────────────────────────────────────────────────────────────
function PartnersTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    partnerName: "",
    externalTenantRef: "",
    accessScope: "READ_ONLY",
    allowedCapabilities: "",
    approvalChainId: "",
    externalRoleMap: {},
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listPartners();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    setBusy(true);
    try {
      await registerPartner({
        partnerName: draft.partnerName,
        externalTenantRef: draft.externalTenantRef,
        accessScope: draft.accessScope,
        allowedCapabilities: draft.allowedCapabilities
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        approvalChainId: draft.approvalChainId || undefined,
        externalRoleMap: draft.externalRoleMap,
      });
      setShowNew(false);
      setDraft({
        partnerName: "",
        externalTenantRef: "",
        accessScope: "READ_ONLY",
        allowedCapabilities: "",
        approvalChainId: "",
        externalRoleMap: {},
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Register failed");
    } finally {
      setBusy(false);
    }
  };

  const lifecycle = async (id, action) => {
    if (action === "retire" && !confirm("Retire this partner?")) return;
    setBusy(true);
    try {
      if (action === "activate") await activatePartner(id);
      else if (action === "pause") await pausePartner(id);
      else if (action === "retire") await retirePartner(id);
      await refresh();
    } catch (e) {
      setError(e?.message || `${action} failed`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowNew(true)}
        >
          + Register partner
        </button>
      </div>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No partners registered.</Empty>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Partner</th>
                <th style={th}>External ref</th>
                <th style={th}>Scope</th>
                <th style={th}>Status</th>
                <th style={th}>Approval</th>
                <th style={th}>Capabilities</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const sSty =
                  PARTNER_SCOPE_STYLE[p.accessScope] ||
                  PARTNER_SCOPE_STYLE.READ_ONLY;
                const lSty =
                  LIFECYCLE_STYLE[p.status] || LIFECYCLE_STYLE.DRAFT;
                return (
                  <tr
                    key={p.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{p.partnerName}</div>
                    </td>
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {p.externalTenantRef}
                    </td>
                    <td style={td}>
                      <Tag style={sSty}>{p.accessScope}</Tag>
                    </td>
                    <td style={td}>
                      <Tag style={lSty}>{p.status}</Tag>
                    </td>
                    <td style={td}>
                      {p.approvalChainId ? (
                        <a
                          href={`/Approvals/MyPending?chain=${p.approvalChainId}`}
                          style={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            color: "var(--rf-blue, #3b82f6)",
                          }}
                        >
                          {p.approvalChainId.slice(0, 8)}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={td}>
                      {(p.allowedCapabilities ?? []).join(", ") || "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.status === "DRAFT" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(p.id, "activate")}
                          disabled={busy}
                          title={
                            p.approvalChainId
                              ? "Activation requires the linked approval chain to be APPROVED"
                              : undefined
                          }
                          style={{ marginRight: 6 }}
                        >
                          Activate
                        </button>
                      )}
                      {p.status === "ACTIVE" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(p.id, "pause")}
                          disabled={busy}
                          style={{ marginRight: 6 }}
                        >
                          Pause
                        </button>
                      )}
                      {p.status === "PAUSED" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(p.id, "activate")}
                          disabled={busy}
                          style={{ marginRight: 6 }}
                        >
                          Activate
                        </button>
                      )}
                      {p.status !== "RETIRED" && (
                        <button
                          className="rf-btn"
                          onClick={() => lifecycle(p.id, "retire")}
                          disabled={busy}
                          style={{ color: "var(--rf-red)" }}
                        >
                          Retire
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Register partner
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Partner name">
              <input
                className="rf-input"
                value={draft.partnerName}
                onChange={(e) =>
                  setDraft({ ...draft, partnerName: e.target.value })
                }
              />
            </Field>
            <Field label="External tenant ref">
              <input
                className="rf-input"
                value={draft.externalTenantRef}
                onChange={(e) =>
                  setDraft({ ...draft, externalTenantRef: e.target.value })
                }
              />
            </Field>
            <Field label="Access scope">
              <select
                className="rf-input"
                value={draft.accessScope}
                onChange={(e) =>
                  setDraft({ ...draft, accessScope: e.target.value })
                }
              >
                {PARTNER_ACCESS_SCOPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Approval chain id (optional)">
              <input
                className="rf-input"
                value={draft.approvalChainId}
                onChange={(e) =>
                  setDraft({ ...draft, approvalChainId: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Allowed capabilities (comma-separated)">
            <input
              className="rf-input"
              value={draft.allowedCapabilities}
              onChange={(e) =>
                setDraft({ ...draft, allowedCapabilities: e.target.value })
              }
              placeholder="sync.project, webhook.outbound"
            />
          </Field>
          <Field label="External role map (JSON)">
            <textarea
              className="rf-input"
              rows={4}
              value={JSON.stringify(draft.externalRoleMap ?? {}, null, 2)}
              onChange={(e) => {
                try {
                  setDraft({
                    ...draft,
                    externalRoleMap: JSON.parse(e.target.value || "{}"),
                  });
                } catch {
                  /* swallow */
                }
              }}
            />
          </Field>
          <ModalActions
            onCancel={() => setShowNew(false)}
            onSave={save}
            saveLabel="Register"
            saveDisabled={
              busy || !draft.partnerName || !draft.externalTenantRef
            }
          />
        </Modal>
      )}
    </>
  );
}

// ─── Credentials ─────────────────────────────────────────────────────────────
function CredentialsTab() {
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [rotateTarget, setRotateTarget] = useState(null);
  const [rotateDraft, setRotateDraft] = useState({});
  const [expiryDraft, setExpiryDraft] = useState({});
  const [expiryTarget, setExpiryTarget] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, all, exp] = await Promise.all([
        credentialHealthSummary().catch(() => null),
        listCredentialHealth().catch(() => []),
        expiringCredentials().catch(() => []),
      ]);
      setSummary(s);
      setRows(Array.isArray(all) ? all : all?.items ?? []);
      setExpiring(Array.isArray(exp) ? exp : exp?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rotate = async () => {
    if (!rotateTarget) return;
    if (!Object.keys(rotateDraft || {}).length) return;
    setBusy(true);
    try {
      await rotateCredentialLifecycle(rotateTarget.id, {
        credentials: rotateDraft,
      });
      setRotateTarget(null);
      setRotateDraft({});
      await refresh();
    } catch (e) {
      setError(e?.message || "Rotate failed");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (row) => {
    if (
      !confirm(
        `Revoke "${row.alias}" (${row.provider})? Downstream connectors will fail until re-bound.`
      )
    )
      return;
    setBusy(true);
    try {
      await revokeCredentialLifecycle(row.id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Revoke failed");
    } finally {
      setBusy(false);
    }
  };

  const saveExpiry = async () => {
    if (!expiryTarget) return;
    const at = expiryDraft.expiresAt;
    if (!at) return;
    setBusy(true);
    try {
      await setCredentialExpiry(expiryTarget.id, {
        expiresAt: new Date(at).toISOString(),
        rotationHint: expiryDraft.rotationHint || undefined,
      });
      setExpiryTarget(null);
      setExpiryDraft({});
      await refresh();
    } catch (e) {
      setError(e?.message || "Set expiry failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {summary && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Tile label="Total" value={summary.total} />
          <Tile label="Active" value={summary.active} tone="green" />
          <Tile
            label="Expiring"
            value={summary.expiring}
            tone={summary.expiring > 0 ? "yellow" : null}
          />
          <Tile
            label="Expired"
            value={summary.expired}
            tone={summary.expired > 0 ? "red" : null}
          />
          <Tile label="Revoked" value={summary.revoked} />
          <Tile label="Inactive" value={summary.inactive} />
        </section>
      )}

      <Banner error={error} />

      {expiring.length > 0 && (
        <section className="rf-card" style={{ padding: 14, marginBottom: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--rf-yellow, #f59e0b)",
              marginBottom: 8,
            }}
          >
            Expiring soon ({expiring.length})
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {expiring.map((c) => (
              <li
                key={c.id}
                style={{
                  padding: 6,
                  borderTop: "1px solid var(--rf-border)",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {c.provider}/{c.alias}
                </span>
                <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                  expires in {c.daysUntilExpiry}d
                  {c.expiresAt
                    ? ` (${new Date(c.expiresAt).toLocaleDateString()})`
                    : ""}
                </span>
                <button
                  className="rf-btn"
                  style={{ marginLeft: "auto" }}
                  onClick={() => {
                    setRotateTarget(c);
                    setRotateDraft({});
                  }}
                >
                  Rotate
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {rows.length === 0 && !loading ? (
        <Empty>No credentials.</Empty>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Provider</th>
                <th style={th}>Alias</th>
                <th style={th}>Version</th>
                <th style={th}>Status</th>
                <th style={th}>Expires</th>
                <th style={th}>Last rotated</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const sty =
                  CREDENTIAL_STATUS_STYLE[c.status] ||
                  CREDENTIAL_STATUS_STYLE.INACTIVE;
                return (
                  <tr
                    key={c.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>{c.provider}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{c.alias}</div>
                    </td>
                    <td style={{ ...td, fontFamily: "monospace" }}>
                      v{c.version}
                    </td>
                    <td style={td}>
                      <Tag style={sty}>{c.status}</Tag>
                    </td>
                    <td style={td}>
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={td}>
                      {c.lastRotatedAt
                        ? new Date(c.lastRotatedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <button
                        className="rf-btn"
                        onClick={() => {
                          setRotateTarget(c);
                          setRotateDraft({});
                        }}
                        disabled={busy}
                        style={{ marginRight: 6 }}
                      >
                        Rotate
                      </button>
                      <button
                        className="rf-btn"
                        onClick={() => {
                          setExpiryTarget(c);
                          setExpiryDraft({});
                        }}
                        disabled={busy}
                        style={{ marginRight: 6 }}
                      >
                        Set expiry
                      </button>
                      {c.status !== "REVOKED" && (
                        <button
                          className="rf-btn"
                          onClick={() => revoke(c)}
                          disabled={busy}
                          style={{ color: "var(--rf-red)" }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rotateTarget && (
        <Modal onClose={() => setRotateTarget(null)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Rotate credential
          </h2>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)", marginBottom: 12 }}>
            {rotateTarget.provider} · {rotateTarget.alias} · v{rotateTarget.version}
          </div>
          <Field label="New credentials (JSON — write-only)">
            <textarea
              className="rf-input"
              rows={8}
              value={JSON.stringify(rotateDraft ?? {}, null, 2)}
              onChange={(e) => {
                try {
                  setRotateDraft(JSON.parse(e.target.value || "{}"));
                } catch {
                  /* swallow */
                }
              }}
            />
          </Field>
          <ModalActions
            onCancel={() => setRotateTarget(null)}
            onSave={rotate}
            saveLabel="Rotate"
            saveDisabled={busy || !Object.keys(rotateDraft).length}
          />
        </Modal>
      )}

      {expiryTarget && (
        <Modal onClose={() => setExpiryTarget(null)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Set expiry
          </h2>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)", marginBottom: 12 }}>
            {expiryTarget.provider} · {expiryTarget.alias}
          </div>
          <Field label="Expires at">
            <input
              type="datetime-local"
              className="rf-input"
              value={expiryDraft.expiresAt || ""}
              onChange={(e) =>
                setExpiryDraft({ ...expiryDraft, expiresAt: e.target.value })
              }
            />
          </Field>
          <Field label="Rotation hint (optional)">
            <input
              className="rf-input"
              value={expiryDraft.rotationHint || ""}
              onChange={(e) =>
                setExpiryDraft({ ...expiryDraft, rotationHint: e.target.value })
              }
            />
          </Field>
          <ModalActions
            onCancel={() => setExpiryTarget(null)}
            onSave={saveExpiry}
            saveLabel="Save"
            saveDisabled={busy || !expiryDraft.expiresAt}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Primitives ──────────────────────────────────────────────────────────────
function Tile({ label, value, tone }) {
  const color =
    tone === "red"
      ? "var(--rf-red)"
      : tone === "yellow"
      ? "var(--rf-yellow, #f59e0b)"
      : tone === "green"
      ? "var(--rf-green)"
      : "var(--rf-txt)";
  return (
    <div className="rf-card" style={{ padding: 10, display: "grid", gap: 2 }}>
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
          fontSize: 16,
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

function Tag({ children, style, tone }) {
  if (tone === "muted") {
    return (
      <span
        style={{
          padding: "1px 8px",
          fontSize: 10,
          fontWeight: 700,
          borderRadius: 4,
          background: "var(--rf-bg3)",
          color: "var(--rf-txt3)",
          marginLeft: 4,
        }}
      >
        {children}
      </span>
    );
  }
  const sty = style || {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  };
  return (
    <span
      style={{
        padding: "1px 8px",
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 4,
        background: sty.bg,
        color: sty.color,
      }}
    >
      {children}
    </span>
  );
}

function Banner({ error }) {
  if (!error) return null;
  return (
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
  );
}

function Empty({ children }) {
  return (
    <div
      style={{
        padding: 32,
        textAlign: "center",
        color: "var(--rf-txt3)",
      }}
    >
      {children}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
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
      onClick={onClose}
    >
      <div
        className="rf-card"
        style={{
          padding: 20,
          maxWidth: 640,
          width: "100%",
          maxHeight: "92vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, saveLabel, saveDisabled }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        justifyContent: "flex-end",
        marginTop: 14,
      }}
    >
      <button className="rf-btn" onClick={onCancel}>
        Cancel
      </button>
      <button
        className="rf-btn rf-btn-primary"
        onClick={onSave}
        disabled={saveDisabled}
      >
        {saveLabel}
      </button>
    </div>
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
const preStyle = {
  margin: "4px 0 0",
  padding: 8,
  background: "var(--rf-bg2)",
  borderRadius: 6,
  fontSize: 11,
  overflow: "auto",
  maxHeight: 240,
};
