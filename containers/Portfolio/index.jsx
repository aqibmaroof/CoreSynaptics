"use client";

import { useState, useEffect } from "react";
import { getPortfolio } from "@/services/CxProjects";

// ─── Mock fallback ────────────────────────────────────────────────────────────

const MOCK_PORTFOLIO = {
  byBand: { GREEN: 2, AMBER: 2, RED: 1, UNKNOWN: 0 },
  projects: [
    {
      id: "p1",
      name: "Microsoft Data Center – L5 IST",
      customer: "Microsoft",
      currentPhase: "Level 5 Commissioning",
      cxScore: 91,
      grade: "A",
      healthBand: "GREEN",
      topConcern: null,
      openCriticalIssues: 0,
      openHoldPoints: 1,
    },
    {
      id: "p2",
      name: "Delta Electrical – Substation Upgrade",
      customer: "Delta Electrical",
      currentPhase: "Level 3 Pre-Power",
      cxScore: 78,
      grade: "B+",
      healthBand: "GREEN",
      topConcern: null,
      openCriticalIssues: 0,
      openHoldPoints: 0,
    },
    {
      id: "p3",
      name: "Shermco – NETA Acceptance Testing",
      customer: "Shermco Industries",
      currentPhase: "Level 4 Energisation",
      cxScore: 62,
      grade: "C+",
      healthBand: "AMBER",
      topConcern: "Load bank capacity unconfirmed for IST window",
      openCriticalIssues: 2,
      openHoldPoints: 3,
    },
    {
      id: "p4",
      name: "HITT – MEP Rough-In L6",
      customer: "HITT Contracting",
      currentPhase: "Level 6 Pre-Commission",
      cxScore: 55,
      grade: "C",
      healthBand: "AMBER",
      topConcern: "BMS contractor availability conflicts with OEM windows",
      openCriticalIssues: 1,
      openHoldPoints: 2,
    },
    {
      id: "p5",
      name: "General Dynamics – Turnover Package",
      customer: "General Dynamics",
      currentPhase: "Turnover",
      cxScore: 33,
      grade: "D",
      healthBand: "RED",
      topConcern: "3 open NCRs blocking substantial completion sign-off",
      openCriticalIssues: 4,
      openHoldPoints: 5,
    },
  ],
};

// ─── Constants ────────────────────────────────────────────────────────────────

const BAND_STYLE = {
  GREEN: {
    border: "var(--rf-green)",
    bg: "rgba(16,185,129,0.08)",
    dot: "var(--rf-green)",
    chip: { background: "rgba(16,185,129,0.15)", color: "var(--rf-green)" },
  },
  AMBER: {
    border: "var(--rf-yellow)",
    bg: "rgba(245,158,11,0.06)",
    dot: "var(--rf-yellow)",
    chip: { background: "rgba(245,158,11,0.15)", color: "var(--rf-yellow)" },
  },
  RED: {
    border: "var(--rf-red)",
    bg: "rgba(239,68,68,0.07)",
    dot: "var(--rf-red)",
    chip: { background: "rgba(239,68,68,0.15)", color: "var(--rf-red)" },
  },
  UNKNOWN: {
    border: "var(--rf-border)",
    bg: "transparent",
    dot: "var(--rf-txt3)",
    chip: { background: "var(--rf-bg3)", color: "var(--rf-txt3)" },
  },
};

const GRADE_COLOR = {
  A: "var(--rf-green)",
  "A-": "var(--rf-green)",
  "B+": "var(--rf-green)",
  B: "#60a5fa",
  "B-": "#60a5fa",
  "C+": "var(--rf-yellow)",
  C: "var(--rf-yellow)",
  "C-": "var(--rf-yellow)",
  D: "var(--rf-red)",
  F: "var(--rf-red)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function BandChip({ band, count }) {
  const s = BAND_STYLE[band] || BAND_STYLE.UNKNOWN;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 20px",
        borderRadius: 12,
        background: "var(--rf-bg2)",
        border: `1px solid ${s.border}`,
        flex: "1 1 110px",
        minWidth: 110,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: s.dot,
            lineHeight: 1,
          }}
        >
          {count}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginTop: 2,
          }}
        >
          {band}
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const color =
    score >= 80
      ? "var(--rf-green)"
      : score >= 60
        ? "var(--rf-yellow)"
        : "var(--rf-red)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          flex: 1,
          height: 5,
          borderRadius: 99,
          background: "var(--rf-bg3)",
          overflow: "hidden",
          minWidth: 60,
        }}
      >
        <div
          style={{
            width: `${score}%`,
            height: "100%",
            background: color,
            borderRadius: 99,
            transition: "width 0.4s",
          }}
        />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, whiteSpace: "nowrap" }}>
        {score}
      </span>
    </div>
  );
}

function ProjectRow({ project }) {
  const band = BAND_STYLE[project.healthBand] || BAND_STYLE.UNKNOWN;
  const gradeColor = GRADE_COLOR[project.grade] || "var(--rf-txt2)";

  return (
    <tr
      style={{ borderBottom: "1px solid var(--rf-border)", transition: "background 0.15s", cursor: "pointer" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-bg3)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Health band left-border indicator */}
      <td style={{ padding: 0, width: 4 }}>
        <div
          style={{
            width: 4,
            height: "100%",
            minHeight: 56,
            background: band.border,
            borderRadius: "2px 0 0 2px",
          }}
        />
      </td>

      <td style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-txt)" }}>
          {project.name}
        </div>
        <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 2 }}>
          {project.customer}
        </div>
      </td>

      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--rf-txt2)", whiteSpace: "nowrap" }}>
        {project.currentPhase}
      </td>

      <td style={{ padding: "14px 16px", minWidth: 120 }}>
        <ScoreBar score={project.cxScore} />
      </td>

      <td style={{ padding: "14px 16px", textAlign: "center" }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: gradeColor,
          }}
        >
          {project.grade}
        </span>
      </td>

      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: band.dot,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              ...band.chip,
              padding: "2px 8px",
              borderRadius: 99,
              letterSpacing: "0.04em",
            }}
          >
            {project.healthBand}
          </span>
        </div>
      </td>

      <td style={{ padding: "14px 16px", maxWidth: 220 }}>
        {project.topConcern ? (
          <span
            style={{
              fontSize: 11,
              color: "var(--rf-yellow)",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.topConcern}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>—</span>
        )}
      </td>

      <td style={{ padding: "14px 16px", textAlign: "center" }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: project.openCriticalIssues > 0 ? "var(--rf-red)" : "var(--rf-txt3)",
          }}
        >
          {project.openCriticalIssues}
        </span>
      </td>

      <td style={{ padding: "14px 16px", textAlign: "center" }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: project.openHoldPoints > 0 ? "var(--rf-yellow)" : "var(--rf-txt3)",
          }}
        >
          {project.openHoldPoints}
        </span>
      </td>
    </tr>
  );
}

function LoadingRow() {
  return (
    <tr>
      <td colSpan={9} style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>
        Loading portfolio...
      </td>
    </tr>
  );
}

// ─── Main Container ───────────────────────────────────────────────────────────

export default function Portfolio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bandFilter, setBandFilter] = useState("ALL");

  useEffect(() => {
    (async () => {
      try {
        const res = await getPortfolio();
        if (res && res.projects?.length) {
          setData(res);
        } else {
          setData(MOCK_PORTFOLIO);
        }
      } catch {
        setData(MOCK_PORTFOLIO);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byBand = data?.byBand || MOCK_PORTFOLIO.byBand;
  const allProjects = data?.projects || [];
  const filtered =
    bandFilter === "ALL"
      ? allProjects
      : allProjects.filter((p) => p.healthBand === bandFilter);

  const totalProjects = allProjects.length;

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--rf-txt)" }}>
            Portfolio Health
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}>
            {totalProjects} commissioning project{totalProjects !== 1 ? "s" : ""} · live health snapshot
          </p>
        </div>

        {/* Band filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["ALL", "GREEN", "AMBER", "RED"].map((b) => {
            const active = bandFilter === b;
            const s = b === "ALL" ? null : BAND_STYLE[b];
            return (
              <button
                key={b}
                onClick={() => setBandFilter(b)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: `1px solid ${active ? (s?.border || "var(--rf-accent)") : "var(--rf-border)"}`,
                  background: active ? (s ? s.chip.background : "rgba(99,102,241,0.15)") : "transparent",
                  color: active ? (s?.chip.color || "var(--rf-accent)") : "var(--rf-txt2)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                  transition: "all 0.15s",
                }}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Band KPI row ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        {["GREEN", "AMBER", "RED", "UNKNOWN"].map((band) => (
          <BandChip key={band} band={band} count={byBand[band] ?? 0} />
        ))}
        <div
          style={{
            flex: "1 1 140px",
            padding: "12px 20px",
            borderRadius: 12,
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--rf-txt)", lineHeight: 1 }}>
            {totalProjects}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginTop: 2,
            }}
          >
            Total Projects
          </div>
        </div>
      </div>

      {/* ── Project table ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rf-border)", background: "var(--rf-bg3)" }}>
                <th style={{ width: 4, padding: 0 }} />
                {[
                  "Project",
                  "Current Phase",
                  "CX Score",
                  "Grade",
                  "Health",
                  "Top Concern",
                  "Critical",
                  "Hold Points",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 16px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--rf-txt3)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <LoadingRow />
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "48px 24px",
                      textAlign: "center",
                      color: "var(--rf-txt3)",
                      fontSize: 13,
                    }}
                  >
                    No projects in {bandFilter} band.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => <ProjectRow key={p.id} project={p} />)
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid var(--rf-border)",
              fontSize: 11,
              color: "var(--rf-txt3)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <span>
              Showing {filtered.length} of {totalProjects} project{totalProjects !== 1 ? "s" : ""}
            </span>
            <span style={{ marginLeft: "auto" }}>
              CX Score = weighted commissioning health index · Grade = A–F letter equivalent
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
