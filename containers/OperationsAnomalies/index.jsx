"use client";

// ── Phase 9 PR-9: Org-wide operations anomalies ──────────────────────────────
// Single org-wide view across all projects. Kinds filter is multi-select via
// chip toggles (matches the doc's recommended UX). Same severity/status
// palette as the v7 project-scoped inbox.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  operationsAnomalies,
  ANOMALY_KINDS,
  ANOMALY_KIND_LABEL,
  ANOMALY_SEVERITY_STYLE,
  ANOMALY_STATUS_STYLE,
} from "@/services/Anomalies";

const STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"];

export default function OperationsAnomaliesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [kinds, setKinds] = useState([]);
  const [evaluatedAt, setEvaluatedAt] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await operationsAnomalies({
        status,
        kinds: kinds.length ? kinds : undefined,
        limit: 200,
      });
      setRows(res?.anomalies ?? (Array.isArray(res) ? res : []));
      setEvaluatedAt(res?.evaluatedAt || null);
    } catch (e) {
      setError(e?.message || "Failed to load operations anomalies");
    } finally {
      setLoading(false);
    }
  }, [status, kinds]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleKind = (k) =>
    setKinds((xs) => (xs.includes(k) ? xs.filter((x) => x !== k) : [...xs, k]));

  const counts = useMemo(() => {
    const c = { OPEN: 0, ACKNOWLEDGED: 0, RESOLVED: 0, DISMISSED: 0 };
    rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

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
          Operations Anomalies
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Org-wide anomaly inbox across all projects.
          {evaluatedAt
            ? ` · evaluated ${new Date(evaluatedAt).toLocaleString()}`
            : ""}
        </p>
      </header>

      {/* status tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={`rf-btn ${status === s ? "rf-btn-primary" : ""}`}
            onClick={() => setStatus(s)}
          >
            {s.charAt(0) + s.slice(1).toLowerCase()}
            {counts[s] ? ` (${counts[s]})` : ""}
          </button>
        ))}
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
      </div>

      {/* kind filter chips */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {ANOMALY_KINDS.map((k) => {
          const active = kinds.includes(k);
          return (
            <button
              key={k}
              className={`rf-btn ${active ? "rf-btn-primary" : ""}`}
              onClick={() => toggleKind(k)}
              style={{ fontSize: 11 }}
            >
              {ANOMALY_KIND_LABEL[k] || k}
            </button>
          );
        })}
        {kinds.length > 0 && (
          <button
            className="rf-btn"
            onClick={() => setKinds([])}
            style={{ fontSize: 11, color: "var(--rf-txt3)" }}
          >
            Clear kinds
          </button>
        )}
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

      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No {status.toLowerCase()} anomalies in the org.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Kind</th>
                <th style={th}>Severity</th>
                <th style={th}>Status</th>
                <th style={th}>Project</th>
                <th style={th}>Title</th>
                <th style={th}>Detected</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const sev =
                  ANOMALY_SEVERITY_STYLE[a.severity] ||
                  ANOMALY_SEVERITY_STYLE.LOW;
                const st =
                  ANOMALY_STATUS_STYLE[a.status] || ANOMALY_STATUS_STYLE.OPEN;
                return (
                  <tr
                    key={a.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      {ANOMALY_KIND_LABEL[a.kind] || a.kind}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: sev.bg,
                          color: sev.color,
                        }}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td style={td}>
                      {a.cxProjectId ? (
                        <Link
                          href={`/Anomalies?cxProjectId=${a.cxProjectId}`}
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {a.cxProjectId.slice(0, 8)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      {a.detail && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          {a.detail}
                        </div>
                      )}
                    </td>
                    <td style={td}>
                      {a.detectedAt
                        ? new Date(a.detectedAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "10px 12px", fontSize: 13, color: "var(--rf-txt)" };
