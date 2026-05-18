"use client";

// ── Phase 10 PR-9: Portfolio Copilot page ────────────────────────────────────
// Org-wide rollup with the same lens filter. Each row shows totals by priority
// and a top-N list of recommendations. Clicking a recommendation opens the
// shared WhyPanel.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  portfolioRecommendations,
  explainRecommendation,
  RECOMMENDATION_KIND_LABEL,
  COPILOT_PRIORITY_STYLE,
} from "@/services/Copilot";
import LensFilter from "@/components/LensFilter";
import WhyPanel from "@/components/WhyPanel";

export default function PortfolioCopilot() {
  const [lens, setLens] = useState();
  const [perProjectLimit, setPerProjectLimit] = useState(3);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whyId, setWhyId] = useState(null);
  const [whyProjectId, setWhyProjectId] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await portfolioRecommendations({
        perProjectLimit,
        lens,
      });
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load portfolio copilot");
    } finally {
      setLoading(false);
    }
  }, [perProjectLimit, lens]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const rows = [...(data?.byProject ?? [])].sort(
    (a, b) =>
      b.totals.critical * 1000 +
      b.totals.high * 100 +
      b.totals.normal * 10 +
      b.totals.low -
      (a.totals.critical * 1000 +
        a.totals.high * 100 +
        a.totals.normal * 10 +
        a.totals.low)
  );

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
            Portfolio Copilot
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Cross-project recommendation rollup. Sorted by critical → high →
            normal → low.
            {data?.evaluatedAt
              ? ` · evaluated ${new Date(data.evaluatedAt).toLocaleString()}`
              : ""}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <LensFilter value={lens} onChange={setLens} />
          <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            Top-N
          </label>
          <select
            className="rf-input"
            value={perProjectLimit}
            onChange={(e) => setPerProjectLimit(Number(e.target.value))}
            style={{ width: 80 }}
          >
            {[3, 5, 10].map((n) => (
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
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No active recommendations across the portfolio.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Project</th>
                <th style={{ ...th, textAlign: "center" }}>Critical</th>
                <th style={{ ...th, textAlign: "center" }}>High</th>
                <th style={{ ...th, textAlign: "center" }}>Normal</th>
                <th style={{ ...th, textAlign: "center" }}>Low</th>
                <th style={th}>Top recommendations</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.cxProjectId}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    <Link
                      href={`/ProjectCopilot?cxProjectId=${p.cxProjectId}`}
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
                    {p.totals.normal}
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
                      {(p.topRecommendations ?? []).map((r) => {
                        const ps =
                          COPILOT_PRIORITY_STYLE[r.priority] ||
                          COPILOT_PRIORITY_STYLE.NORMAL;
                        return (
                          <li
                            key={r.id}
                            style={{
                              padding: "2px 0",
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setWhyId(r.id);
                                setWhyProjectId(p.cxProjectId);
                              }}
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
                                  background: ps.bg,
                                  color: ps.color,
                                  marginRight: 6,
                                }}
                              >
                                {r.priority}
                              </span>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 10,
                                  color: "var(--rf-txt3)",
                                  marginRight: 4,
                                }}
                              >
                                {RECOMMENDATION_KIND_LABEL[r.kind] || r.kind}
                              </span>
                              {r.title}
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
          <WhyPanel
            predictionId={whyId}
            fetcher={(id) =>
              explainRecommendation(id, whyProjectId || undefined)
            }
            onClose={() => {
              setWhyId(null);
              setWhyProjectId(null);
            }}
          />
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
