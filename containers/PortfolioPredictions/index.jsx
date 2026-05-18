"use client";

// ── Phase 9 PR-9: Portfolio predictions ──────────────────────────────────────
// Org-wide rollup. Server returns totals { critical, high, medium, low } and
// top-N predictions per project. Use the row "Open" link to deep-dive into a
// single project; click any prediction title to open Why?

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  portfolioPredictions,
  SEVERITY_STYLE,
  PREDICTION_KIND_LABEL,
} from "@/services/Predictions";
import WhyPanel from "@/components/WhyPanel";

export default function PortfolioPredictions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [perProjectLimit, setPerProjectLimit] = useState(5);
  const [whyId, setWhyId] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await portfolioPredictions({ perProjectLimit });
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, [perProjectLimit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sorted = [...(data?.byProject ?? [])].sort(
    (a, b) =>
      b.totals.critical * 1000 +
      b.totals.high * 100 +
      b.totals.medium * 10 +
      b.totals.low -
      (a.totals.critical * 1000 +
        a.totals.high * 100 +
        a.totals.medium * 10 +
        a.totals.low)
  );

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
            Portfolio predictions
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Cross-project risk rollup. Sorted by critical → high → medium →
            low.
            {data?.evaluatedAt
              ? ` · evaluated ${new Date(data.evaluatedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            Top-N per project
          </label>
          <select
            className="rf-input"
            value={perProjectLimit}
            onChange={(e) => setPerProjectLimit(Number(e.target.value))}
            style={{ width: 80 }}
          >
            {[3, 5, 10, 20].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button className="rf-btn" onClick={refresh} disabled={loading}>
            {loading ? "…" : "Refresh"}
          </button>
        </div>
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

      {loading && !data ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : sorted.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No active predictions across the portfolio.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Project</th>
                <th style={{ ...th, textAlign: "center" }}>Critical</th>
                <th style={{ ...th, textAlign: "center" }}>High</th>
                <th style={{ ...th, textAlign: "center" }}>Medium</th>
                <th style={{ ...th, textAlign: "center" }}>Low</th>
                <th style={th}>Top predictions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr
                  key={p.cxProjectId}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    <Link
                      href={`/ProjectOverview?cxProjectId=${p.cxProjectId}`}
                      style={{
                        textDecoration: "none",
                        color: "var(--rf-txt)",
                        fontWeight: 600,
                      }}
                    >
                      {p.projectName || p.cxProjectId.slice(0, 8)}
                    </Link>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        fontFamily: "monospace",
                      }}
                    >
                      {p.cxProjectId.slice(0, 8)}
                    </div>
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "center",
                      color:
                        p.totals.critical > 0
                          ? "var(--rf-red)"
                          : "var(--rf-txt3)",
                      fontWeight: p.totals.critical > 0 ? 700 : 400,
                      fontFamily: "monospace",
                    }}
                  >
                    {p.totals.critical}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "center",
                      color:
                        p.totals.high > 0
                          ? "var(--rf-yellow, #f59e0b)"
                          : "var(--rf-txt3)",
                      fontWeight: p.totals.high > 0 ? 700 : 400,
                      fontFamily: "monospace",
                    }}
                  >
                    {p.totals.high}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "center",
                      fontFamily: "monospace",
                    }}
                  >
                    {p.totals.medium}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "center",
                      fontFamily: "monospace",
                    }}
                  >
                    {p.totals.low}
                  </td>
                  <td style={td}>
                    <ol
                      style={{
                        listStyle: "decimal inside",
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {(p.topPredictions ?? []).map((tp) => {
                        const sev =
                          SEVERITY_STYLE[tp.severity] || SEVERITY_STYLE.LOW;
                        return (
                          <li
                            key={tp.id}
                            style={{
                              padding: "2px 0",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setWhyId(tp.id)}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "var(--rf-txt)",
                                fontSize: 12,
                                textAlign: "left",
                                padding: 0,
                              }}
                            >
                              <span
                                style={{
                                  padding: "1px 6px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  borderRadius: 4,
                                  background: sev.bg,
                                  color: sev.color,
                                  marginRight: 6,
                                }}
                              >
                                {tp.severity}
                              </span>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 10,
                                  color: "var(--rf-txt3)",
                                  marginRight: 4,
                                }}
                              >
                                {PREDICTION_KIND_LABEL[tp.kind] || tp.kind}
                              </span>
                              {tp.title}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {whyId && (
        <div style={{ marginTop: 16 }}>
          <WhyPanel predictionId={whyId} onClose={() => setWhyId(null)} />
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
