"use client";

// ── Phase 14: Governance admin (tabbed) ──────────────────────────────────────
// Tabs:
//   • Overview     — KPIs + Top recommendations + quick-links
//   • Retention    — policies + archival records + due-for-archival
//   • Holds        — compliance holds list with release action
//   • Audit Exports— signed manifest exports with verify chip
//   • Replay       — replay authorizations + invocation history
//   • Lifecycle    — tenant state + allowed transitions + history
//   • Continuity   — checks with findings + score
//   • DR           — drills (plan/start/evidence/complete) + resiliency summary
//   • Storage      — tier + retention + projections
//   • Recommendations — governance-domain copilot stream
//
// Hard rule: every panel renders server data verbatim. No client-side
// recomputation of retention eligibility, hold counting, manifest signing,
// replay integrity, lifecycle transitions, or continuity scoring.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  // Reads
  listRetentionPolicies,
  listArchivalRecords,
  dueForArchival,
  listComplianceHolds,
  listComplianceExports,
  getComplianceExport,
  verifyComplianceExport,
  listReplayAuthorizations,
  listReplayInvocations,
  getTenantLifecycle,
  listLifecycleEvents,
  listContinuityChecks,
  listDRDrills,
  resiliencySummary,
  listStorageGovernance,
  storageProjections,
  governanceRecommendations,
  // Writes
  upsertRetentionPolicy,
  retireRetentionPolicy,
  markArchivalEligible,
  markArchivalArchived,
  markArchivalPurged,
  releaseComplianceHold,
  beginComplianceExport,
  completeComplianceExport,
  cancelComplianceExport,
  appendCustodyEntry,
  requestReplayAuthorization,
  approveReplayAuthorization,
  rejectReplayAuthorization,
  revokeReplayAuthorization,
  invokeReplay,
  transitionTenantLifecycle,
  runContinuityCheck,
  runAllContinuityChecks,
  planDRDrill,
  startDRDrill,
  appendDRDrillEvidence,
  completeDRDrill,
  cancelDRDrill,
  upsertStorageGovernance,
  // Constants / styles
  RETENTION_POLICY_STATUSES,
  ARCHIVAL_STATES,
  COMPLIANCE_HOLD_KINDS,
  CONTINUITY_CHECK_KINDS,
  DR_DRILL_KINDS,
  STORAGE_TIERS,
  TENANT_LIFECYCLE_STATES,
  LIFECYCLE_ALLOWED_TRANSITIONS,
  POLICY_STATUS_STYLE,
  ARCHIVAL_STATE_STYLE,
  HOLD_STATUS_STYLE,
  EXPORT_STATUS_STYLE,
  REPLAY_AUTH_STYLE,
  LIFECYCLE_STATE_STYLE,
  CONTINUITY_STATUS_STYLE,
  FINDING_SEVERITY_STYLE,
  DR_DRILL_STATUS_STYLE,
  STORAGE_TIER_STYLE,
} from "@/services/Governance";
import RecommendationsCard from "@/components/RecommendationsCard";
import LensFilter from "@/components/LensFilter";

export default function Governance() {
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
            Governance
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Retention, compliance holds, audit exports, replay governance,
            tenant lifecycle, continuity, DR & resiliency, storage. Every
            calculation is server-side.
          </p>
        </div>
        {tab === "recs" && <LensFilter value={lens} onChange={setLens} />}
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
          ["retention", "Retention"],
          ["holds", "Holds"],
          ["audit", "Audit Exports"],
          ["replay", "Replay"],
          ["lifecycle", "Tenant Lifecycle"],
          ["continuity", "Continuity"],
          ["dr", "DR & Resiliency"],
          ["storage", "Storage"],
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
      {tab === "retention" && <RetentionTab />}
      {tab === "holds" && <HoldsTab />}
      {tab === "audit" && <AuditExportsTab />}
      {tab === "replay" && <ReplayTab />}
      {tab === "lifecycle" && <LifecycleTab />}
      {tab === "continuity" && <ContinuityTab />}
      {tab === "dr" && <DRTab />}
      {tab === "storage" && <StorageTab />}
      {tab === "recs" && (
        <RecommendationsCard
          title="Governance recommendations"
          fetcher={async (p) => {
            const recs = await governanceRecommendations({ limit: 50 });
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
          emptyMessage="No governance recommendations right now."
        />
      )}
    </div>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────
function OverviewTab() {
  const [resiliency, setResiliency] = useState(null);
  const [lifecycle, setLifecycle] = useState(null);
  const [holds, setHolds] = useState([]);
  const [due, setDue] = useState([]);
  const [auths, setAuths] = useState([]);
  const [failedChecks, setFailedChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [r, lc, h, d, a, ch] = await Promise.all([
        resiliencySummary().catch(() => null),
        getTenantLifecycle().catch(() => null),
        listComplianceHolds({ status: "ACTIVE", limit: 100 }).catch(
          () => []
        ),
        dueForArchival().catch(() => []),
        listReplayAuthorizations({ status: "PENDING", limit: 100 }).catch(
          () => []
        ),
        listContinuityChecks({ status: "FAILED", limit: 100 }).catch(() => []),
      ]);
      setResiliency(r);
      setLifecycle(lc);
      setHolds(Array.isArray(h) ? h : h?.items ?? []);
      setDue(Array.isArray(d) ? d : d?.items ?? []);
      setAuths(Array.isArray(a) ? a : a?.items ?? []);
      setFailedChecks(Array.isArray(ch) ? ch : ch?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Banner error={error} />
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 8,
        }}
      >
        <Tile label="Lifecycle" value={lifecycle?.state ?? "—"} />
        <Tile
          label="Resiliency"
          value={resiliency ? resiliency.overall : "—"}
          tone={
            resiliency?.overall != null && resiliency.overall < 60
              ? "red"
              : resiliency?.overall != null && resiliency.overall < 80
              ? "yellow"
              : "green"
          }
        />
        <Tile
          label="Active holds"
          value={holds.length}
          tone={holds.length > 0 ? "yellow" : null}
        />
        <Tile
          label="Due for archival"
          value={due.length}
        />
        <Tile
          label="Pending replay reqs"
          value={auths.length}
        />
        <Tile
          label="Failed continuity"
          value={failedChecks.length}
          tone={failedChecks.length > 0 ? "red" : null}
        />
      </section>

      <RecommendationsCard
        title="Top governance recommendations"
        fetcher={async (p) => {
          const recs = await governanceRecommendations({ limit: 12 });
          const list = Array.isArray(recs) ? recs : recs?.items ?? [];
          return {
            recommendations: list,
            evaluatedAt: new Date().toISOString(),
            lens: p?.lens || null,
          };
        }}
        topN={6}
        showLens={false}
        emptyMessage="No governance recommendations right now."
      />
    </div>
  );
}

// ─── Retention ───────────────────────────────────────────────────────────────
function RetentionTab() {
  const [policies, setPolicies] = useState([]);
  const [records, setRecords] = useState([]);
  const [due, setDue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNewPol, setShowNewPol] = useState(false);
  const [polDraft, setPolDraft] = useState({
    entityType: "",
    key: "",
    retentionDays: 365,
    archiveAfterDays: 365,
    purgeAfterDays: 730,
    graceDays: 0,
    description: "",
  });
  const [stateFilter, setStateFilter] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, r, d] = await Promise.all([
        listRetentionPolicies({ limit: 200 }).catch(() => []),
        listArchivalRecords({
          state: stateFilter || undefined,
          limit: 200,
        }).catch(() => []),
        dueForArchival().catch(() => []),
      ]);
      setPolicies(Array.isArray(p) ? p : p?.items ?? []);
      setRecords(Array.isArray(r) ? r : r?.items ?? []);
      setDue(Array.isArray(d) ? d : d?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [stateFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    setBusy(true);
    try {
      await upsertRetentionPolicy({
        entityType: polDraft.entityType,
        key: polDraft.key,
        retentionDays: Number(polDraft.retentionDays) || 0,
        archiveAfterDays: Number(polDraft.archiveAfterDays) || 0,
        purgeAfterDays: Number(polDraft.purgeAfterDays) || undefined,
        graceDays: Number(polDraft.graceDays) || undefined,
        description: polDraft.description || undefined,
      });
      setShowNewPol(false);
      setPolDraft({
        entityType: "",
        key: "",
        retentionDays: 365,
        archiveAfterDays: 365,
        purgeAfterDays: 730,
        graceDays: 0,
        description: "",
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Upsert failed");
    } finally {
      setBusy(false);
    }
  };

  const retire = async (id) => {
    if (!confirm("Retire this policy?")) return;
    setBusy(true);
    try {
      await retireRetentionPolicy(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Retire failed");
    } finally {
      setBusy(false);
    }
  };

  const transition = async (id, action) => {
    if (action === "purge" && !confirm("Purge this record? Cannot be undone."))
      return;
    setBusy(true);
    try {
      if (action === "eligible") await markArchivalEligible(id);
      else if (action === "archive") await markArchivalArchived(id);
      else if (action === "purge") await markArchivalPurged(id);
      await refresh();
    } catch (e) {
      setError(e?.message || `${action} failed`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Banner error={error} />

      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Policies ({policies.length})
          </span>
          <button
            className="rf-btn rf-btn-primary"
            onClick={() => setShowNewPol(true)}
          >
            + Upsert policy
          </button>
        </div>
        {policies.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Entity</th>
                <th style={th}>Key</th>
                <th style={th}>v</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Retain (d)</th>
                <th style={{ ...th, textAlign: "right" }}>Archive (d)</th>
                <th style={{ ...th, textAlign: "right" }}>Purge (d)</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => {
                const sty =
                  POLICY_STATUS_STYLE[p.status] ||
                  POLICY_STATUS_STYLE.DRAFT;
                return (
                  <tr
                    key={p.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>{p.entityType}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{p.key}</div>
                      {p.description && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          {p.description}
                        </div>
                      )}
                    </td>
                    <td style={td}>v{p.version}</td>
                    <td style={td}>
                      <Tag style={sty}>{p.status}</Tag>
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.retentionDays}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.archiveAfterDays}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.purgeAfterDays}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.status !== "RETIRED" && (
                        <button
                          className="rf-btn"
                          onClick={() => retire(p.id)}
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
        )}
      </section>

      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--rf-yellow, #f59e0b)",
          }}
        >
          Due for archival ({due.length})
        </div>
        {due.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
            Nothing eligible.
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {due.map((r) => {
              const sty =
                ARCHIVAL_STATE_STYLE[r.state] ||
                ARCHIVAL_STATE_STYLE.ACTIVE;
              return (
                <li
                  key={r.id}
                  style={{
                    padding: 8,
                    borderTop: "1px solid var(--rf-border)",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <Tag style={sty}>{r.state}</Tag>
                  <code style={{ fontSize: 11 }}>
                    {r.entityType}:{String(r.entityId).slice(0, 8)}
                  </code>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    eligible{" "}
                    {r.eligibleAt
                      ? new Date(r.eligibleAt).toLocaleDateString()
                      : "—"}
                    {r.holdCount > 0 ? ` · ${r.holdCount} hold(s)` : ""}
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    {r.state === "ACTIVE" && (
                      <button
                        className="rf-btn"
                        onClick={() => transition(r.id, "eligible")}
                        disabled={busy}
                      >
                        Mark eligible
                      </button>
                    )}
                    {r.state === "ELIGIBLE" && (
                      <button
                        className="rf-btn rf-btn-primary"
                        onClick={() => transition(r.id, "archive")}
                        disabled={busy}
                      >
                        Archive
                      </button>
                    )}
                    {r.state === "ARCHIVED" && (
                      <button
                        className="rf-btn"
                        onClick={() => transition(r.id, "purge")}
                        disabled={busy}
                        style={{ color: "var(--rf-red)" }}
                      >
                        Purge
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            All archival records ({records.length})
          </span>
          <select
            className="rf-input"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All states</option>
            {ARCHIVAL_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        {records.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Entity</th>
                <th style={th}>State</th>
                <th style={th}>Classified</th>
                <th style={th}>Eligible</th>
                <th style={th}>Archived</th>
                <th style={{ ...th, textAlign: "right" }}>Holds</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const sty =
                  ARCHIVAL_STATE_STYLE[r.state] ||
                  ARCHIVAL_STATE_STYLE.ACTIVE;
                return (
                  <tr
                    key={r.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {r.entityType}:{String(r.entityId).slice(0, 12)}
                    </td>
                    <td style={td}>
                      <Tag style={sty}>{r.state}</Tag>
                    </td>
                    <td style={td}>
                      {r.classifiedAt
                        ? new Date(r.classifiedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={td}>
                      {r.eligibleAt
                        ? new Date(r.eligibleAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={td}>
                      {r.archivedAt
                        ? new Date(r.archivedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color:
                          r.holdCount > 0 ? "var(--rf-red)" : undefined,
                      }}
                    >
                      {r.holdCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {showNewPol && (
        <Modal onClose={() => setShowNewPol(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Upsert retention policy
          </h2>
          <div
            style={{
              fontSize: 12,
              color: "var(--rf-txt3)",
              marginBottom: 12,
            }}
          >
            Server enforces archiveAfterDays ≤ retentionDays + graceDays.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Entity type">
              <input
                className="rf-input"
                value={polDraft.entityType}
                onChange={(e) =>
                  setPolDraft({ ...polDraft, entityType: e.target.value })
                }
              />
            </Field>
            <Field label="Key">
              <input
                className="rf-input"
                value={polDraft.key}
                onChange={(e) =>
                  setPolDraft({ ...polDraft, key: e.target.value })
                }
              />
            </Field>
            <Field label="Retention days">
              <input
                type="number"
                className="rf-input"
                value={polDraft.retentionDays}
                onChange={(e) =>
                  setPolDraft({
                    ...polDraft,
                    retentionDays: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Archive after days">
              <input
                type="number"
                className="rf-input"
                value={polDraft.archiveAfterDays}
                onChange={(e) =>
                  setPolDraft({
                    ...polDraft,
                    archiveAfterDays: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Purge after days">
              <input
                type="number"
                className="rf-input"
                value={polDraft.purgeAfterDays}
                onChange={(e) =>
                  setPolDraft({
                    ...polDraft,
                    purgeAfterDays: e.target.value,
                  })
                }
              />
            </Field>
            <Field label="Grace days">
              <input
                type="number"
                className="rf-input"
                value={polDraft.graceDays}
                onChange={(e) =>
                  setPolDraft({ ...polDraft, graceDays: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Description">
            <textarea
              className="rf-input"
              rows={2}
              value={polDraft.description}
              onChange={(e) =>
                setPolDraft({ ...polDraft, description: e.target.value })
              }
            />
          </Field>
          <ModalActions
            onCancel={() => setShowNewPol(false)}
            onSave={save}
            saveLabel="Upsert"
            saveDisabled={busy || !polDraft.entityType || !polDraft.key}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── Holds ───────────────────────────────────────────────────────────────────
function HoldsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState("ACTIVE");
  const [kind, setKind] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listComplianceHolds({
        status: status || undefined,
        kind: kind || undefined,
        limit: 200,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [status, kind]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const release = async (h) => {
    const reason = window.prompt("Release reason?");
    if (!reason) return;
    setBusyId(h.id);
    try {
      await releaseComplianceHold(h.id, reason);
      await refresh();
    } catch (e) {
      setError(e?.message || "Release failed");
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
          <option value="ACTIVE">Active</option>
          <option value="RELEASED">Released</option>
          <option value="EXPIRED">Expired</option>
        </select>
        <select
          className="rf-input"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="">All kinds</option>
          {COMPLIANCE_HOLD_KINDS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No holds match.</Empty>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Entity</th>
                <th style={th}>Kind</th>
                <th style={th}>Status</th>
                <th style={th}>Placed</th>
                <th style={th}>Expires</th>
                <th style={th}>Reason</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((h) => {
                const sty =
                  HOLD_STATUS_STYLE[h.status] || HOLD_STATUS_STYLE.ACTIVE;
                return (
                  <tr
                    key={h.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {h.entityType}:{String(h.entityId).slice(0, 12)}
                    </td>
                    <td style={td}>{h.kind}</td>
                    <td style={td}>
                      <Tag style={sty}>{h.status}</Tag>
                    </td>
                    <td style={td}>
                      {h.placedAt
                        ? new Date(h.placedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td style={td}>
                      {h.expiresAt
                        ? new Date(h.expiresAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td style={{ ...td, maxWidth: 320 }} title={h.reason}>
                      {h.reason?.slice(0, 60)}
                      {h.reason?.length > 60 ? "…" : ""}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      {h.status === "ACTIVE" && (
                        <button
                          className="rf-btn"
                          onClick={() => release(h)}
                          disabled={busyId === h.id}
                          title={
                            h.releaseApprovalChainId
                              ? `Requires chain ${h.releaseApprovalChainId.slice(0, 8)}… APPROVED`
                              : undefined
                          }
                        >
                          Release
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
    </>
  );
}

// ─── Audit / compliance exports ──────────────────────────────────────────────
function AuditExportsTab() {
  const [rows, setRows] = useState([]);
  const [verifyMap, setVerifyMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    scope: "",
    fromAt: "",
    toAt: "",
    entityTypes: "",
    eventNames: "",
    importExportJobId: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listComplianceExports({ limit: 200 });
      const list = Array.isArray(xs) ? xs : xs?.items ?? [];
      setRows(list);
      const next = {};
      await Promise.all(
        list
          .filter((e) => e.status === "COMPLETED")
          .map(async (e) => {
            try {
              next[e.id] = await verifyComplianceExport(e.id);
            } catch {
              next[e.id] = null;
            }
          })
      );
      setVerifyMap(next);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const begin = async () => {
    setBusyId("__new");
    try {
      await beginComplianceExport({
        scope: draft.scope,
        fromAt: draft.fromAt
          ? new Date(draft.fromAt).toISOString()
          : undefined,
        toAt: draft.toAt ? new Date(draft.toAt).toISOString() : undefined,
        entityTypes: draft.entityTypes
          ? draft.entityTypes
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        eventNames: draft.eventNames
          ? draft.eventNames
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        importExportJobId: draft.importExportJobId || undefined,
      });
      setShowNew(false);
      setDraft({
        scope: "",
        fromAt: "",
        toAt: "",
        entityTypes: "",
        eventNames: "",
        importExportJobId: "",
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Begin failed");
    } finally {
      setBusyId(null);
    }
  };

  const complete = async (id) => {
    setBusyId(id);
    try {
      await completeComplianceExport(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Complete failed");
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this export?")) return;
    setBusyId(id);
    try {
      await cancelComplianceExport(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Cancel failed");
    } finally {
      setBusyId(null);
    }
  };

  const addCustody = async (id) => {
    const action = window.prompt("Custody action label?");
    if (!action) return;
    const note = window.prompt("Note (optional)?") || undefined;
    setBusyId(id);
    try {
      await appendCustodyEntry(id, { action, note });
      await refresh();
    } catch (e) {
      setError(e?.message || "Custody append failed");
    } finally {
      setBusyId(null);
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
          + Begin export
        </button>
      </div>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No compliance exports yet.</Empty>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((e) => {
            const sty =
              EXPORT_STATUS_STYLE[e.status] || EXPORT_STATUS_STYLE.PENDING;
            const verified = verifyMap[e.id];
            return (
              <li
                key={e.id}
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
                  <Tag style={sty}>{e.status}</Tag>
                  <span style={{ fontWeight: 600 }}>{e.scope}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {e.startedAt
                      ? new Date(e.startedAt).toLocaleString()
                      : "—"}
                  </span>
                  {e.manifestSignature && (
                    <span
                      style={{
                        padding: "1px 6px",
                        fontSize: 10,
                        fontFamily: "monospace",
                        borderRadius: 4,
                        background: "var(--rf-bg3)",
                        color: "var(--rf-txt3)",
                      }}
                      title={`sha256=${e.manifestSignature}`}
                    >
                      sig {String(e.manifestSignature).slice(0, 12)}…
                    </span>
                  )}
                  {e.status === "COMPLETED" && (
                    <Tag
                      style={
                        verified === true
                          ? {
                              color: "var(--rf-green)",
                              bg: "rgba(34,197,94,0.16)",
                            }
                          : verified === false
                          ? {
                              color: "var(--rf-red)",
                              bg: "rgba(239,68,68,0.16)",
                            }
                          : {
                              color: "var(--rf-txt3)",
                              bg: "var(--rf-bg3)",
                            }
                      }
                    >
                      {verified === true
                        ? "verified"
                        : verified === false
                        ? "signature mismatch"
                        : "checking…"}
                    </Tag>
                  )}
                </div>
                {e.importExportJobId && (
                  <Link
                    href={`/Integrations?job=${e.importExportJobId}`}
                    style={{
                      fontSize: 11,
                      color: "var(--rf-blue, #3b82f6)",
                    }}
                  >
                    Open bundle job →
                  </Link>
                )}
                {(e.chainOfCustody ?? []).length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary
                      style={{
                        fontSize: 11,
                        cursor: "pointer",
                        color: "var(--rf-txt3)",
                      }}
                    >
                      Chain of custody ({e.chainOfCustody.length})
                    </summary>
                    <ol style={{ marginTop: 4, paddingLeft: 18 }}>
                      {e.chainOfCustody.map((c, i) => (
                        <li key={i} style={{ fontSize: 11 }}>
                          <code>{c.action}</code>
                          <span style={{ color: "var(--rf-txt3)" }}>
                            {" "}
                            ·{" "}
                            {c.at
                              ? new Date(c.at).toLocaleString()
                              : ""}{" "}
                            · {String(c.actor).slice(0, 8)}
                            {c.note ? ` — ${c.note}` : ""}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
                <div
                  style={{ marginTop: 8, display: "flex", gap: 6 }}
                >
                  {e.status === "BUILDING" && (
                    <button
                      className="rf-btn rf-btn-primary"
                      onClick={() => complete(e.id)}
                      disabled={busyId === e.id}
                    >
                      Complete & sign
                    </button>
                  )}
                  {(e.status === "PENDING" || e.status === "BUILDING") && (
                    <button
                      className="rf-btn"
                      onClick={() => cancel(e.id)}
                      disabled={busyId === e.id}
                      style={{ color: "var(--rf-red)" }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    className="rf-btn"
                    onClick={() => addCustody(e.id)}
                    disabled={busyId === e.id}
                  >
                    Add custody entry
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Begin compliance export
          </h2>
          <Field label="Scope (label)">
            <input
              className="rf-input"
              value={draft.scope}
              onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <Field label="From">
              <input
                type="datetime-local"
                className="rf-input"
                value={draft.fromAt}
                onChange={(e) =>
                  setDraft({ ...draft, fromAt: e.target.value })
                }
              />
            </Field>
            <Field label="To">
              <input
                type="datetime-local"
                className="rf-input"
                value={draft.toAt}
                onChange={(e) =>
                  setDraft({ ...draft, toAt: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Entity types (comma-separated, optional)">
            <input
              className="rf-input"
              value={draft.entityTypes}
              onChange={(e) =>
                setDraft({ ...draft, entityTypes: e.target.value })
              }
            />
          </Field>
          <Field label="Event names (comma-separated, optional)">
            <input
              className="rf-input"
              value={draft.eventNames}
              onChange={(e) =>
                setDraft({ ...draft, eventNames: e.target.value })
              }
            />
          </Field>
          <Field label="ImportExportJob id (optional)">
            <input
              className="rf-input"
              value={draft.importExportJobId}
              onChange={(e) =>
                setDraft({ ...draft, importExportJobId: e.target.value })
              }
            />
          </Field>
          <ModalActions
            onCancel={() => setShowNew(false)}
            onSave={begin}
            saveLabel="Begin"
            saveDisabled={busyId === "__new" || !draft.scope.trim()}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Replay governance ───────────────────────────────────────────────────────
function ReplayTab() {
  const [auths, setAuths] = useState([]);
  const [invocations, setInvocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    scope: "",
    reason: "",
    approvalChainId: "",
    expiresAt: "",
    filterEventName: "",
    filterCxProjectId: "",
    filterFromAt: "",
    filterToAt: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [a, i] = await Promise.all([
        listReplayAuthorizations({ limit: 100 }).catch(() => []),
        listReplayInvocations({ limit: 100 }).catch(() => []),
      ]);
      setAuths(Array.isArray(a) ? a : a?.items ?? []);
      setInvocations(Array.isArray(i) ? i : i?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async () => {
    setBusyId("__new");
    try {
      await requestReplayAuthorization({
        scope: draft.scope,
        reason: draft.reason,
        approvalChainId: draft.approvalChainId || undefined,
        expiresAt: draft.expiresAt
          ? new Date(draft.expiresAt).toISOString()
          : undefined,
        filterEventName: draft.filterEventName || undefined,
        filterCxProjectId: draft.filterCxProjectId || undefined,
        filterFromAt: draft.filterFromAt
          ? new Date(draft.filterFromAt).toISOString()
          : undefined,
        filterToAt: draft.filterToAt
          ? new Date(draft.filterToAt).toISOString()
          : undefined,
      });
      setShowNew(false);
      setDraft({
        scope: "",
        reason: "",
        approvalChainId: "",
        expiresAt: "",
        filterEventName: "",
        filterCxProjectId: "",
        filterFromAt: "",
        filterToAt: "",
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Request failed");
    } finally {
      setBusyId(null);
    }
  };

  const action = async (id, kind) => {
    if (kind === "invoke") {
      if (
        !confirm(
          "Invoke replay? This re-emits events on the canonical bus — downstream listeners will re-process."
        )
      )
        return;
    }
    setBusyId(id);
    try {
      if (kind === "approve") await approveReplayAuthorization(id);
      else if (kind === "reject") await rejectReplayAuthorization(id);
      else if (kind === "revoke") await revokeReplayAuthorization(id);
      else if (kind === "invoke") await invokeReplay(id);
      await refresh();
    } catch (e) {
      setError(e?.message || `${kind} failed`);
    } finally {
      setBusyId(null);
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
          + Request authorization
        </button>
      </div>

      <Banner error={error} />

      <section className="rf-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Authorizations ({auths.length})
        </div>
        {auths.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {auths.map((a) => {
              const sty =
                REPLAY_AUTH_STYLE[a.status] || REPLAY_AUTH_STYLE.PENDING;
              return (
                <li
                  key={a.id}
                  style={{
                    padding: 12,
                    borderTop: "1px solid var(--rf-border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      marginBottom: 2,
                      flexWrap: "wrap",
                    }}
                  >
                    <Tag style={sty}>{a.status}</Tag>
                    <span style={{ fontWeight: 600 }}>{a.scope}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--rf-txt2)" }}>
                    {a.reason}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                      marginTop: 4,
                    }}
                  >
                    by {String(a.requestedBy).slice(0, 8)} · expires{" "}
                    {a.expiresAt
                      ? new Date(a.expiresAt).toLocaleString()
                      : "never"}
                    {a.approvalChainId
                      ? ` · chain ${a.approvalChainId.slice(0, 8)}`
                      : ""}
                  </div>
                  <div
                    style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}
                  >
                    {a.status === "PENDING" && (
                      <>
                        <button
                          className="rf-btn rf-btn-primary"
                          onClick={() => action(a.id, "approve")}
                          disabled={busyId === a.id}
                          title={
                            a.approvalChainId
                              ? `Requires chain ${a.approvalChainId.slice(0, 8)}… APPROVED`
                              : undefined
                          }
                        >
                          Approve
                        </button>
                        <button
                          className="rf-btn"
                          onClick={() => action(a.id, "reject")}
                          disabled={busyId === a.id}
                          style={{ color: "var(--rf-red)" }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {a.status === "APPROVED" && (
                      <>
                        <button
                          className="rf-btn rf-btn-primary"
                          onClick={() => action(a.id, "invoke")}
                          disabled={busyId === a.id}
                        >
                          Invoke replay
                        </button>
                        <button
                          className="rf-btn"
                          onClick={() => action(a.id, "revoke")}
                          disabled={busyId === a.id}
                          style={{ color: "var(--rf-red)" }}
                        >
                          Revoke
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
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
          Invocation history ({invocations.length})
        </div>
        {invocations.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>When</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Events</th>
                <th style={th}>Integrity</th>
              </tr>
            </thead>
            <tbody>
              {invocations.map((i) => (
                <tr
                  key={i.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    {i.startedAt
                      ? new Date(i.startedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td style={td}>
                    <Tag>{i.status}</Tag>
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {i.eventsReplayed} / {i.eventsConsidered}
                  </td>
                  <td
                    style={{
                      ...td,
                      fontFamily: "monospace",
                      fontSize: 11,
                    }}
                  >
                    {i.integrityHash
                      ? String(i.integrityHash).slice(0, 16) + "…"
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Request replay authorization
          </h2>
          <Field label="Scope">
            <input
              className="rf-input"
              value={draft.scope}
              onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
            />
          </Field>
          <Field label="Reason (required)">
            <textarea
              className="rf-input"
              rows={3}
              value={draft.reason}
              onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <Field label="Approval chain id (optional)">
              <input
                className="rf-input"
                value={draft.approvalChainId}
                onChange={(e) =>
                  setDraft({ ...draft, approvalChainId: e.target.value })
                }
              />
            </Field>
            <Field label="Expires (optional)">
              <input
                type="datetime-local"
                className="rf-input"
                value={draft.expiresAt}
                onChange={(e) =>
                  setDraft({ ...draft, expiresAt: e.target.value })
                }
              />
            </Field>
            <Field label="Filter event name (optional)">
              <input
                className="rf-input"
                value={draft.filterEventName}
                onChange={(e) =>
                  setDraft({ ...draft, filterEventName: e.target.value })
                }
              />
            </Field>
            <Field label="Filter cxProjectId (optional)">
              <input
                className="rf-input"
                value={draft.filterCxProjectId}
                onChange={(e) =>
                  setDraft({ ...draft, filterCxProjectId: e.target.value })
                }
              />
            </Field>
            <Field label="Filter from">
              <input
                type="datetime-local"
                className="rf-input"
                value={draft.filterFromAt}
                onChange={(e) =>
                  setDraft({ ...draft, filterFromAt: e.target.value })
                }
              />
            </Field>
            <Field label="Filter to">
              <input
                type="datetime-local"
                className="rf-input"
                value={draft.filterToAt}
                onChange={(e) =>
                  setDraft({ ...draft, filterToAt: e.target.value })
                }
              />
            </Field>
          </div>
          <ModalActions
            onCancel={() => setShowNew(false)}
            onSave={create}
            saveLabel="Request"
            saveDisabled={
              busyId === "__new" || !draft.scope || !draft.reason.trim()
            }
          />
        </Modal>
      )}
    </>
  );
}

// ─── Lifecycle ───────────────────────────────────────────────────────────────
function LifecycleTab() {
  const [lifecycle, setLifecycle] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [lc, ev] = await Promise.all([
        getTenantLifecycle().catch(() => null),
        listLifecycleEvents().catch(() => []),
      ]);
      setLifecycle(lc);
      setEvents(Array.isArray(ev) ? ev : ev?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const transition = async (toState) => {
    const reason = window.prompt(`Reason for transition to ${toState}?`);
    if (!reason) return;
    const approvalChainId =
      toState === "ARCHIVED" || toState === "DECOMMISSIONED"
        ? window.prompt("Approval chain id (required for this transition)?")
        : null;
    setBusy(true);
    try {
      await transitionTenantLifecycle({
        toState,
        reason,
        approvalChainId: approvalChainId || undefined,
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Transition failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !lifecycle)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (!lifecycle) return <Empty>No lifecycle row.</Empty>;

  const sty =
    LIFECYCLE_STATE_STYLE[lifecycle.state] || LIFECYCLE_STATE_STYLE.ACTIVE;
  const next = LIFECYCLE_ALLOWED_TRANSITIONS[lifecycle.state] || [];

  return (
    <>
      <Banner error={error} />

      <section className="rf-card" style={{ padding: 14, marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <Tag style={sty}>{lifecycle.state}</Tag>
          {lifecycle.pendingApprovalChainId && (
            <Tag
              style={{
                color: "var(--rf-yellow, #f59e0b)",
                bg: "rgba(245,158,11,0.16)",
              }}
            >
              approval pending {lifecycle.pendingApprovalChainId.slice(0, 8)}…
            </Tag>
          )}
          <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            updated{" "}
            {lifecycle.updatedAt
              ? new Date(lifecycle.updatedAt).toLocaleString()
              : "—"}
          </span>
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            textTransform: "uppercase",
            letterSpacing: 0.04,
            marginBottom: 6,
          }}
        >
          Transition
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {next.length === 0 ? (
            <em
              style={{
                fontSize: 12,
                color: "var(--rf-txt3)",
              }}
            >
              Terminal state — no transitions out
            </em>
          ) : (
            next.map((s) => (
              <button
                key={s}
                className="rf-btn"
                onClick={() => transition(s)}
                disabled={busy}
                style={
                  s === "DECOMMISSIONED"
                    ? { color: "var(--rf-red)" }
                    : undefined
                }
              >
                → {s}
              </button>
            ))
          )}
        </div>
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
          History ({events.length})
        </div>
        {events.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {events.map((e) => (
              <li
                key={e.id}
                style={{
                  padding: 10,
                  borderTop: "1px solid var(--rf-border)",
                }}
              >
                <div style={{ fontSize: 12 }}>
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "var(--rf-txt3)",
                    }}
                  >
                    {e.occurredAt
                      ? new Date(e.occurredAt).toLocaleString()
                      : "—"}
                  </span>{" "}
                  <strong>{e.fromState}</strong> → <strong>{e.toState}</strong>
                </div>
                {e.reason && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--rf-txt2)",
                      marginTop: 2,
                    }}
                  >
                    {e.reason}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                    marginTop: 2,
                  }}
                >
                  by{" "}
                  {e.actorUserId
                    ? String(e.actorUserId).slice(0, 8)
                    : "system"}
                  {e.approvalChainId
                    ? ` · chain ${e.approvalChainId.slice(0, 8)}`
                    : ""}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

// ─── Continuity ──────────────────────────────────────────────────────────────
function ContinuityTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listContinuityChecks({
        status: statusFilter || undefined,
        limit: 200,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const run = async (kind) => {
    setBusy(true);
    try {
      await runContinuityCheck(kind);
      await refresh();
    } catch (e) {
      setError(e?.message || "Run failed");
    } finally {
      setBusy(false);
    }
  };

  const runAll = async () => {
    setBusy(true);
    try {
      await runAllContinuityChecks();
      await refresh();
    } catch (e) {
      setError(e?.message || "Run-all failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          className="rf-btn rf-btn-primary"
          onClick={runAll}
          disabled={busy}
        >
          Run all checks
        </button>
        {CONTINUITY_CHECK_KINDS.map((k) => (
          <button
            key={k}
            className="rf-btn"
            onClick={() => run(k)}
            disabled={busy}
            style={{ fontSize: 11 }}
          >
            Run {k}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <select
          className="rf-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="PASSED">Passed</option>
          <option value="WARNING">Warning</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <Banner error={error} />

      {rows.length === 0 && !loading ? (
        <Empty>No continuity checks run yet.</Empty>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((c) => {
            const sty =
              CONTINUITY_STATUS_STYLE[c.status] ||
              CONTINUITY_STATUS_STYLE.PENDING;
            return (
              <li
                key={c.id}
                className="rf-card"
                style={{ padding: 12, marginBottom: 8 }}
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
                  <Tag style={sty}>{c.status}</Tag>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {c.checkKind}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    score · {c.score} ·{" "}
                    {c.startedAt
                      ? new Date(c.startedAt).toLocaleString()
                      : ""}
                  </span>
                </div>
                {(c.findings ?? []).length > 0 && (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {c.findings.map((f, i) => {
                      const fsty =
                        FINDING_SEVERITY_STYLE[f.severity] ||
                        FINDING_SEVERITY_STYLE.INFO;
                      return (
                        <li
                          key={i}
                          style={{
                            padding: 4,
                            display: "flex",
                            gap: 6,
                            alignItems: "flex-start",
                          }}
                        >
                          <Tag style={fsty}>{f.severity}</Tag>
                          <span style={{ fontSize: 12 }}>{f.detail}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

// ─── DR drills + resiliency ──────────────────────────────────────────────────
function DRTab() {
  const [drills, setDrills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    kind: "BACKUP_VERIFICATION",
    scenario: "",
    rtoSeconds: 3600,
    rpoSeconds: 300,
    plannedAt: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [d, s] = await Promise.all([
        listDRDrills({ limit: 100 }).catch(() => []),
        resiliencySummary().catch(() => null),
      ]);
      setDrills(Array.isArray(d) ? d : d?.items ?? []);
      setSummary(s);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const plan = async () => {
    setBusy(true);
    try {
      await planDRDrill({
        kind: draft.kind,
        scenario: draft.scenario,
        rtoSeconds: Number(draft.rtoSeconds) || undefined,
        rpoSeconds: Number(draft.rpoSeconds) || undefined,
        plannedAt: draft.plannedAt
          ? new Date(draft.plannedAt).toISOString()
          : undefined,
      });
      setShowNew(false);
      setDraft({
        kind: "BACKUP_VERIFICATION",
        scenario: "",
        rtoSeconds: 3600,
        rpoSeconds: 300,
        plannedAt: "",
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Plan failed");
    } finally {
      setBusy(false);
    }
  };

  const start = async (id) => {
    setBusy(true);
    try {
      await startDRDrill(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Start failed");
    } finally {
      setBusy(false);
    }
  };

  const appendEvidence = async (id) => {
    const step = window.prompt("Step description?");
    if (!step) return;
    const result = window
      .prompt("Result (OK / WARN / FAIL)?")
      ?.toUpperCase()
      ?.trim();
    if (!["OK", "WARN", "FAIL"].includes(result || "")) return;
    const note = window.prompt("Note (optional)?") || undefined;
    setBusy(true);
    try {
      await appendDRDrillEvidence(id, { step, result, note });
      await refresh();
    } catch (e) {
      setError(e?.message || "Append failed");
    } finally {
      setBusy(false);
    }
  };

  const complete = async (id) => {
    const passed = window.confirm("Drill PASSED? (Cancel = FAILED)");
    const measuredRtoSeconds = Number(
      window.prompt("Measured RTO (seconds, optional)?") || NaN
    );
    const measuredRpoSeconds = Number(
      window.prompt("Measured RPO (seconds, optional)?") || NaN
    );
    setBusy(true);
    try {
      await completeDRDrill(id, {
        passed,
        measuredRtoSeconds: Number.isFinite(measuredRtoSeconds)
          ? measuredRtoSeconds
          : undefined,
        measuredRpoSeconds: Number.isFinite(measuredRpoSeconds)
          ? measuredRpoSeconds
          : undefined,
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Complete failed");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this drill?")) return;
    setBusy(true);
    try {
      await cancelDRDrill(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Cancel failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {summary && (
        <section className="rf-card" style={{ padding: 14, marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <ScoreDial value={summary.overall} />
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  textTransform: "uppercase",
                  letterSpacing: 0.04,
                }}
              >
                Resiliency by component
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: 4,
                  padding: 0,
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                {(summary.byComponent ?? []).map((c) => (
                  <li
                    key={c.component}
                    style={{
                      fontSize: 12,
                      fontFamily: "monospace",
                    }}
                  >
                    {c.component}: <strong>{c.score}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowNew(true)}
        >
          + Plan drill
        </button>
      </div>

      <Banner error={error} />

      {drills.length === 0 && !loading ? (
        <Empty>No drills planned or completed.</Empty>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {drills.map((d) => {
            const sty =
              DR_DRILL_STATUS_STYLE[d.status] ||
              DR_DRILL_STATUS_STYLE.PLANNED;
            return (
              <li
                key={d.id}
                className="rf-card"
                style={{ padding: 12, marginBottom: 8 }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Tag style={sty}>{d.status}</Tag>
                  <span style={{ fontWeight: 600 }}>{d.kind}</span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    target RTO {d.rtoSeconds ?? "?"}s · measured{" "}
                    {d.measuredRtoSeconds ?? "—"}s · target RPO{" "}
                    {d.rpoSeconds ?? "?"}s · measured{" "}
                    {d.measuredRpoSeconds ?? "—"}s
                  </span>
                </div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{d.scenario}</div>
                {(d.evidenceLog ?? []).length > 0 && (
                  <details style={{ marginTop: 6 }}>
                    <summary
                      style={{
                        fontSize: 11,
                        cursor: "pointer",
                        color: "var(--rf-txt3)",
                      }}
                    >
                      Evidence log ({d.evidenceLog.length})
                    </summary>
                    <ol
                      style={{
                        margin: 4,
                        paddingLeft: 18,
                        fontSize: 11,
                      }}
                    >
                      {d.evidenceLog.map((ev, i) => (
                        <li key={i}>
                          <code>{ev.result}</code> · {ev.step}
                          {ev.note ? ` — ${ev.note}` : ""}
                          <span style={{ color: "var(--rf-txt3)" }}>
                            {" "}
                            ·{" "}
                            {ev.at
                              ? new Date(ev.at).toLocaleString()
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}
                <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {d.status === "PLANNED" && (
                    <>
                      <button
                        className="rf-btn rf-btn-primary"
                        onClick={() => start(d.id)}
                        disabled={busy}
                      >
                        Start drill
                      </button>
                      <button
                        className="rf-btn"
                        onClick={() => cancel(d.id)}
                        disabled={busy}
                        style={{ color: "var(--rf-red)" }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {d.status === "RUNNING" && (
                    <>
                      <button
                        className="rf-btn"
                        onClick={() => appendEvidence(d.id)}
                        disabled={busy}
                      >
                        Append evidence
                      </button>
                      <button
                        className="rf-btn rf-btn-primary"
                        onClick={() => complete(d.id)}
                        disabled={busy}
                      >
                        Complete drill
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
            Plan DR drill
          </h2>
          <Field label="Kind">
            <select
              className="rf-input"
              value={draft.kind}
              onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
            >
              {DR_DRILL_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Scenario">
            <textarea
              className="rf-input"
              rows={3}
              value={draft.scenario}
              onChange={(e) =>
                setDraft({ ...draft, scenario: e.target.value })
              }
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            <Field label="RTO target (s)">
              <input
                type="number"
                className="rf-input"
                value={draft.rtoSeconds}
                onChange={(e) =>
                  setDraft({ ...draft, rtoSeconds: e.target.value })
                }
              />
            </Field>
            <Field label="RPO target (s)">
              <input
                type="number"
                className="rf-input"
                value={draft.rpoSeconds}
                onChange={(e) =>
                  setDraft({ ...draft, rpoSeconds: e.target.value })
                }
              />
            </Field>
            <Field label="Planned at">
              <input
                type="datetime-local"
                className="rf-input"
                value={draft.plannedAt}
                onChange={(e) =>
                  setDraft({ ...draft, plannedAt: e.target.value })
                }
              />
            </Field>
          </div>
          <ModalActions
            onCancel={() => setShowNew(false)}
            onSave={plan}
            saveLabel="Plan"
            saveDisabled={busy || !draft.scenario.trim()}
          />
        </Modal>
      )}
    </>
  );
}

// ─── Storage ─────────────────────────────────────────────────────────────────
function StorageTab() {
  const [rows, setRows] = useState([]);
  const [projections, setProjections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    entityType: "",
    storageTier: "HOT",
    retentionDays: 365,
    costHintPerGb: "",
    estimatedRows: "",
    estimatedBytes: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [r, p] = await Promise.all([
        listStorageGovernance().catch(() => []),
        storageProjections().catch(() => []),
      ]);
      setRows(Array.isArray(r) ? r : r?.items ?? []);
      setProjections(Array.isArray(p) ? p : p?.items ?? []);
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
      await upsertStorageGovernance({
        entityType: draft.entityType,
        storageTier: draft.storageTier,
        retentionDays: Number(draft.retentionDays) || 0,
        costHintPerGb: draft.costHintPerGb
          ? Number(draft.costHintPerGb)
          : undefined,
        estimatedRows: draft.estimatedRows
          ? Number(draft.estimatedRows)
          : undefined,
        estimatedBytes: draft.estimatedBytes
          ? Number(draft.estimatedBytes)
          : undefined,
      });
      setShowNew(false);
      setDraft({
        entityType: "",
        storageTier: "HOT",
        retentionDays: 365,
        costHintPerGb: "",
        estimatedRows: "",
        estimatedBytes: "",
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Save failed");
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
          + Upsert storage rule
        </button>
      </div>

      <Banner error={error} />

      <section className="rf-card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--rf-border)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Projections ({projections.length})
        </div>
        {projections.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Entity</th>
                <th style={th}>Tier</th>
                <th style={{ ...th, textAlign: "right" }}>Retention</th>
                <th style={{ ...th, textAlign: "right" }}>Live</th>
                <th style={{ ...th, textAlign: "right" }}>Archived</th>
                <th style={{ ...th, textAlign: "right" }}>Held</th>
                <th style={{ ...th, textAlign: "right" }}>Purged</th>
                <th style={{ ...th, textAlign: "right" }}>Est. monthly</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => {
                const sty =
                  STORAGE_TIER_STYLE[p.storageTier] ||
                  STORAGE_TIER_STYLE.HOT;
                return (
                  <tr
                    key={p.entityType}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>{p.entityType}</td>
                    <td style={td}>
                      <Tag style={sty}>{p.storageTier}</Tag>
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.retentionDays}d
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.liveRecordCount}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.archivedRecordCount}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color:
                          p.heldRecordCount > 0
                            ? "var(--rf-red)"
                            : undefined,
                      }}
                    >
                      {p.heldRecordCount}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.purgedRecordCount}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.estimatedMonthlyCost != null
                        ? `$${p.estimatedMonthlyCost}`
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
          Storage rules ({rows.length})
        </div>
        {rows.length === 0 ? (
          <div style={{ padding: 14, color: "var(--rf-txt3)" }}>None.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Entity</th>
                <th style={th}>Tier</th>
                <th style={{ ...th, textAlign: "right" }}>Retention</th>
                <th style={{ ...th, textAlign: "right" }}>Cost/GB</th>
                <th style={{ ...th, textAlign: "right" }}>Est. rows</th>
                <th style={{ ...th, textAlign: "right" }}>Est. bytes</th>
                <th style={th}>Last evaluated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sty =
                  STORAGE_TIER_STYLE[r.storageTier] ||
                  STORAGE_TIER_STYLE.HOT;
                return (
                  <tr
                    key={r.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>{r.entityType}</td>
                    <td style={td}>
                      <Tag style={sty}>{r.storageTier}</Tag>
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {r.retentionDays}d
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {r.costHintPerGb != null
                        ? `$${r.costHintPerGb}`
                        : "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {r.estimatedRows ?? "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {r.estimatedBytes ?? "—"}
                    </td>
                    <td style={td}>
                      {r.lastEvaluatedAt
                        ? new Date(r.lastEvaluatedAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            Upsert storage rule
          </h2>
          <div
            style={{
              fontSize: 12,
              color: "var(--rf-txt3)",
              marginBottom: 12,
            }}
          >
            Metadata only — no data movement.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <Field label="Entity type">
              <input
                className="rf-input"
                value={draft.entityType}
                onChange={(e) =>
                  setDraft({ ...draft, entityType: e.target.value })
                }
              />
            </Field>
            <Field label="Tier">
              <select
                className="rf-input"
                value={draft.storageTier}
                onChange={(e) =>
                  setDraft({ ...draft, storageTier: e.target.value })
                }
              >
                {STORAGE_TIERS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Retention days">
              <input
                type="number"
                className="rf-input"
                value={draft.retentionDays}
                onChange={(e) =>
                  setDraft({ ...draft, retentionDays: e.target.value })
                }
              />
            </Field>
            <Field label="Cost hint $/GB">
              <input
                type="number"
                className="rf-input"
                value={draft.costHintPerGb}
                onChange={(e) =>
                  setDraft({ ...draft, costHintPerGb: e.target.value })
                }
              />
            </Field>
            <Field label="Estimated rows">
              <input
                type="number"
                className="rf-input"
                value={draft.estimatedRows}
                onChange={(e) =>
                  setDraft({ ...draft, estimatedRows: e.target.value })
                }
              />
            </Field>
            <Field label="Estimated bytes">
              <input
                type="number"
                className="rf-input"
                value={draft.estimatedBytes}
                onChange={(e) =>
                  setDraft({ ...draft, estimatedBytes: e.target.value })
                }
              />
            </Field>
          </div>
          <ModalActions
            onCancel={() => setShowNew(false)}
            onSave={save}
            saveLabel="Save"
            saveDisabled={busy || !draft.entityType}
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

function Tag({ children, style }) {
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

function ScoreDial({ value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const color =
    pct >= 80
      ? "var(--rf-green)"
      : pct >= 60
      ? "var(--rf-yellow, #f59e0b)"
      : "var(--rf-red)";
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
      <span
        style={{
          fontSize: 28,
          fontWeight: 800,
          fontFamily: "monospace",
          color,
        }}
      >
        {pct}
      </span>
      <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>/ 100</span>
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
