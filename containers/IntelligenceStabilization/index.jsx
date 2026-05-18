"use client";

// ── Phase 7 PR-10: Intelligence stabilization ops console ────────────────────
// Three sections: Integrity · Rebuild · Compact. Platform-only — gate the
// route behind `auth.isPlatformUser` in your shell.

import { useCallback, useEffect, useState } from "react";
import {
  integrityReport,
  rebuildIntelligence,
  compactPredictions,
} from "@/services/IntelligenceStabilization";

export default function IntelligenceStabilization() {
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
          Intelligence Stabilization
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Platform-only. Integrity check, per-project rebuild, prediction
          compaction.
        </p>
      </header>

      <div style={{ display: "grid", gap: 16 }}>
        <IntegritySection />
        <RebuildSection />
        <CompactSection />
      </div>
    </div>
  );
}

// ─── Integrity ───────────────────────────────────────────────────────────────
function IntegritySection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await integrityReport();
      setData(r);
    } catch (e) {
      setError(e?.message || "Failed to load integrity report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section className="rf-card" style={{ padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--rf-txt)",
          }}
        >
          Integrity
        </div>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 8,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {!data ? (
        <div style={{ color: "var(--rf-txt3)" }}>No report yet.</div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <Stat
              label="KG nodes"
              value={data.knowledgeGraph?.nodeCount ?? 0}
            />
            <Stat
              label="KG edges"
              value={data.knowledgeGraph?.edgeCount ?? 0}
            />
            <Stat
              label="Dangling edges"
              value={data.knowledgeGraph?.danglingEdges ?? 0}
              tone={
                (data.knowledgeGraph?.danglingEdges ?? 0) > 0 ? "yellow" : null
              }
            />
            <Stat
              label="Cross-tenant edges"
              value={data.knowledgeGraph?.crossTenantEdges ?? 0}
              tone={
                (data.knowledgeGraph?.crossTenantEdges ?? 0) > 0 ? "red" : null
              }
            />
            <Stat
              label="Soft-deleted nodes"
              value={data.knowledgeGraph?.softDeletedNodes ?? 0}
            />
            <Stat
              label="Active predictions"
              value={data.predictions?.activeCount ?? 0}
            />
            <Stat
              label="Duplicate predictions"
              value={data.predictions?.duplicatesByTarget ?? 0}
              tone={
                (data.predictions?.duplicatesByTarget ?? 0) > 0 ? "yellow" : null
              }
            />
            <Stat
              label="Open anomalies"
              value={data.anomalies?.openCount ?? 0}
            />
            <Stat
              label="Anomaly fingerprint collisions"
              value={data.anomalies?.fingerprintCollisions ?? 0}
              tone={
                (data.anomalies?.fingerprintCollisions ?? 0) > 0
                  ? "yellow"
                  : null
              }
            />
            <Stat
              label="Decision rows"
              value={data.decisionLineage?.rowCount ?? 0}
            />
          </div>

          {(data.warnings ?? []).length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--rf-txt2)",
                  marginBottom: 4,
                }}
              >
                Warnings
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {data.warnings.map((w, i) => (
                  <li
                    key={i}
                    style={{
                      padding: 6,
                      borderTop: "1px solid var(--rf-border)",
                      color: w.toLowerCase().includes("cross-tenant")
                        ? "var(--rf-red)"
                        : "var(--rf-yellow, #f59e0b)",
                      fontSize: 12,
                    }}
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div
            style={{
              fontSize: 11,
              color: "var(--rf-txt3)",
              marginTop: 8,
            }}
          >
            Evaluated{" "}
            {data.evaluatedAt
              ? new Date(data.evaluatedAt).toLocaleString()
              : "—"}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Rebuild ─────────────────────────────────────────────────────────────────
function RebuildSection() {
  const [cxProjectId, setCxProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!cxProjectId) return;
    if (
      !confirm(
        `Rebuild intelligence projection for project ${cxProjectId.slice(0, 8)}? This may take a while.`
      )
    )
      return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const r = await rebuildIntelligence(cxProjectId);
      setResult(r);
    } catch (e) {
      setError(e?.message || "Rebuild failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rf-card" style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--rf-txt)",
          marginBottom: 8,
        }}
      >
        Rebuild
      </div>
      <p style={{ fontSize: 12, color: "var(--rf-txt3)", marginBottom: 12 }}>
        Recompute knowledge graph + predictions + anomalies for a single
        project from canonical aggregates.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="rf-input"
          placeholder="cxProjectId"
          value={cxProjectId}
          onChange={(e) => setCxProjectId(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          className="rf-btn rf-btn-primary"
          onClick={submit}
          disabled={busy || !cxProjectId}
        >
          {busy ? "Rebuilding…" : "Rebuild"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginTop: 10,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: "rgba(34,197,94,0.10)",
            border: "1px solid var(--rf-green)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Done</div>
          <pre style={{ margin: 0, overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

// ─── Compact ─────────────────────────────────────────────────────────────────
function CompactSection() {
  const [keepDays, setKeepDays] = useState(90);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async () => {
    if (
      !confirm(
        `Compact predictions, keeping ${keepDays} days? Older rows will be deleted.`
      )
    )
      return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const r = await compactPredictions(keepDays);
      setResult(r);
    } catch (e) {
      setError(e?.message || "Compact failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rf-card" style={{ padding: 16 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--rf-txt)",
          marginBottom: 8,
        }}
      >
        Compact predictions
      </div>
      <p style={{ fontSize: 12, color: "var(--rf-txt3)", marginBottom: 12 }}>
        Delete superseded predictions older than the keep-window. Active rows
        are never deleted.
      </p>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          Keep days
        </label>
        <input
          type="range"
          min={1}
          max={365}
          value={keepDays}
          onChange={(e) => setKeepDays(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <input
          type="number"
          className="rf-input"
          style={{ width: 90 }}
          min={1}
          max={365}
          value={keepDays}
          onChange={(e) =>
            setKeepDays(Math.min(365, Math.max(1, Number(e.target.value) || 1)))
          }
        />
        <button
          className="rf-btn rf-btn-primary"
          onClick={submit}
          disabled={busy}
        >
          {busy ? "Compacting…" : "Compact"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginTop: 10,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: "var(--rf-bg2)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <pre style={{ margin: 0, overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

function Stat({ label, value, tone }) {
  const color =
    tone === "red"
      ? "var(--rf-red)"
      : tone === "yellow"
      ? "var(--rf-yellow, #f59e0b)"
      : "var(--rf-txt)";
  return (
    <div
      className="rf-card"
      style={{ padding: 10, display: "grid", gap: 2 }}
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
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "monospace",
          color,
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
