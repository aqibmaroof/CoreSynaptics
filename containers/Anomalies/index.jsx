"use client";

// ── Phase 7 PR-6: Anomaly inbox ──────────────────────────────────────────────
// Tabs: OPEN (default) · ACKNOWLEDGED · RESOLVED. Same component layout as the
// operational feed — anomalies extend it, not parallel to it.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listAnomalies,
  detectAnomalies,
  acknowledgeAnomaly,
  resolveAnomaly,
  ANOMALY_KINDS,
  ANOMALY_KIND_LABEL,
  ANOMALY_SEVERITY_STYLE,
  ANOMALY_STATUS_STYLE,
} from "@/services/Anomalies";

export default function AnomalyInbox({ cxProjectId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("OPEN");
  const [kindFilter, setKindFilter] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [expanded, setExpanded] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listAnomalies({
        cxProjectId: cxProjectId || undefined,
        kinds: kindFilter ? [kindFilter] : undefined,
        status: tab,
        limit: 100,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load anomalies");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId, kindFilter, tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const runDetect = async () => {
    if (!cxProjectId) {
      alert("Pick a cxProjectId to scope detection.");
      return;
    }
    setDetecting(true);
    try {
      await detectAnomalies(cxProjectId);
      await refresh();
    } catch (e) {
      setError(e?.message || "Detect failed");
    } finally {
      setDetecting(false);
    }
  };

  const ack = async (id) => {
    setBusyId(id);
    try {
      await acknowledgeAnomaly(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Acknowledge failed");
    } finally {
      setBusyId(null);
    }
  };

  const resolve = async (id) => {
    setBusyId(id);
    try {
      await resolveAnomaly(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Resolve failed");
    } finally {
      setBusyId(null);
    }
  };

  const counts = useMemo(() => {
    const c = { OPEN: 0, ACKNOWLEDGED: 0, RESOLVED: 0, DISMISSED: 0 };
    rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

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
            Anomalies
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Drift, stuck processes, delayed approvals, abnormal workflow.
            Deduped by fingerprint until resolved.
            {cxProjectId
              ? ` · project ${cxProjectId.slice(0, 8)}`
              : " · all projects"}
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={runDetect}
          disabled={detecting || !cxProjectId}
          title={
            cxProjectId ? "" : "Pick a cxProjectId in the URL to scope detection"
          }
        >
          {detecting ? "Detecting…" : "Run detection"}
        </button>
      </header>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {["OPEN", "ACKNOWLEDGED", "RESOLVED"].map((s) => (
          <button
            key={s}
            className={`rf-btn ${tab === s ? "rf-btn-primary" : ""}`}
            onClick={() => setTab(s)}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}{" "}
            {counts[s] ? `(${counts[s]})` : ""}
          </button>
        ))}
        <select
          className="rf-input"
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value)}
        >
          <option value="">All kinds</option>
          {ANOMALY_KINDS.map((k) => (
            <option key={k} value={k}>
              {ANOMALY_KIND_LABEL[k] || k}
            </option>
          ))}
        </select>
      </div>

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

      {loading ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          {tab === "OPEN" ? "No open anomalies." : `No ${tab.toLowerCase()} rows.`}
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((a) => {
            const sev =
              ANOMALY_SEVERITY_STYLE[a.severity] ||
              ANOMALY_SEVERITY_STYLE.LOW;
            const st =
              ANOMALY_STATUS_STYLE[a.status] || ANOMALY_STATUS_STYLE.OPEN;
            const open = !!expanded[a.id];
            return (
              <li
                key={a.id}
                className="rf-card"
                style={{ padding: 12, marginBottom: 8 }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                          padding: "2px 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: sev.bg,
                          color: sev.color,
                        }}
                      >
                        {a.severity}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {a.status}
                      </span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                        }}
                      >
                        {a.kind}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--rf-txt)",
                      }}
                    >
                      {a.title}
                    </div>
                    {a.detail && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--rf-txt2)",
                          marginTop: 2,
                        }}
                      >
                        {a.detail}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        marginTop: 4,
                      }}
                    >
                      detected{" "}
                      {a.detectedAt
                        ? new Date(a.detectedAt).toLocaleString()
                        : "—"}
                      {a.entityType
                        ? ` · ${a.entityType} ${a.entityId?.slice(0, 8) ?? ""}`
                        : ""}
                      {a.cxProjectId
                        ? ` · project ${a.cxProjectId.slice(0, 8)}`
                        : ""}
                    </div>
                    {open && (
                      <pre
                        style={{
                          marginTop: 8,
                          padding: 8,
                          background: "var(--rf-bg2)",
                          borderRadius: 6,
                          fontSize: 11,
                          overflow: "auto",
                          maxHeight: 280,
                        }}
                      >
                        {JSON.stringify(a.signals ?? {}, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <button
                      className="rf-btn"
                      onClick={() =>
                        setExpanded((m) => ({ ...m, [a.id]: !m[a.id] }))
                      }
                    >
                      {open ? "Hide signals" : "Signals"}
                    </button>
                    {a.status === "OPEN" && (
                      <button
                        className="rf-btn"
                        onClick={() => ack(a.id)}
                        disabled={busyId === a.id}
                      >
                        Acknowledge
                      </button>
                    )}
                    {(a.status === "OPEN" || a.status === "ACKNOWLEDGED") && (
                      <button
                        className="rf-btn rf-btn-primary"
                        onClick={() => resolve(a.id)}
                        disabled={busyId === a.id}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
