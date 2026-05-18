"use client";

// ── Phase 7 PR-4: Project health card ────────────────────────────────────────
// Drop into project overview / executive screens. Pulls /predictions and
// groups by severity for at-a-glance display.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listPredictions,
  computePredictions,
  SEVERITY_STYLE,
} from "@/services/Predictions";

export default function ProjectHealthCard({ cxProjectId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [computing, setComputing] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!cxProjectId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await listPredictions({
        cxProjectId,
        minSeverity: "MEDIUM",
        limit: 50,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load predictions");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const grouped = useMemo(() => {
    const out = { CRITICAL: [], HIGH: [], MEDIUM: [], LOW: [] };
    for (const r of rows) (out[r.severity] || out.LOW).push(r);
    return out;
  }, [rows]);

  const recompute = async () => {
    if (!cxProjectId) return;
    setComputing(true);
    try {
      await computePredictions(cxProjectId);
      await refresh();
    } catch (e) {
      setError(e?.message || "Compute failed");
    } finally {
      setComputing(false);
    }
  };

  if (!cxProjectId) return null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--rf-txt)",
              textTransform: "uppercase",
              letterSpacing: 0.04,
            }}
          >
            Project health
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            {rows.length} active prediction{rows.length === 1 ? "" : "s"}
          </div>
        </div>
        <button
          className="rf-btn"
          onClick={recompute}
          disabled={computing || loading}
        >
          {computing ? "Computing…" : "Recompute"}
        </button>
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

      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No active predictions above MEDIUM severity. Hit Recompute after a
          milestone to refresh.
        </div>
      ) : (
        ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => {
          const group = grouped[sev];
          if (!group?.length) return null;
          return (
            <div key={sev} style={{ marginBottom: 10 }}>
              <SeverityHeader severity={sev} count={group.length} />
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {group.map((p) => (
                  <PredictionRow key={p.id} prediction={p} />
                ))}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}

function SeverityHeader({ severity, count }) {
  const ps = SEVERITY_STYLE[severity] || SEVERITY_STYLE.LOW;
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        marginBottom: 4,
      }}
    >
      <span
        style={{
          padding: "1px 8px",
          fontSize: 10,
          fontWeight: 700,
          borderRadius: 4,
          background: ps.bg,
          color: ps.color,
        }}
      >
        {severity}
      </span>
      <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>{count}</span>
    </div>
  );
}

function PredictionRow({ prediction: p }) {
  return (
    <li
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
            fontFamily: "monospace",
            fontSize: 10,
            color: "var(--rf-txt3)",
          }}
        >
          {p.kind}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{p.title}</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          {p.confidence}%
        </span>
      </div>
      {p.detail && (
        <div style={{ fontSize: 12, color: "var(--rf-txt2)" }}>{p.detail}</div>
      )}
    </li>
  );
}
