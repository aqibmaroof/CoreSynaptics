"use client";

import { useState } from "react";

const TOTAL = 6;
const SLIDE_NAMES = [
  "Cover",
  "Executive KPIs",
  "Phase Status",
  "Issues & Risk",
  "Quality & Tests",
  "Action Items",
];

const DATA = {
  project: {
    code: "MSFT-DC1",
    name: "Microsoft Atlanta Expansion",
    customer: "Microsoft",
    site: "Atlanta, GA",
  },
  date: "May 19",
  health: "red",
  healthLabel: "AT RISK",
  presenter: { name: "Carol Reyes", role: "GC QA/QC Lead" },
  company: { name: "HITT Contracting" },
  scopeLabel: "GC view · entire project",
  completion: 64,
  energized: 32,
  totalAssets: 50,
  issuesOpen: 18,
  issuesCrit: 3,
  issuesOverdue: 5,
  ncrsOpen: 4,
  readyToAdvance: 7,
  blocked: 11,
  handoffsPending: 9,
  handoffsRejected: 2,
  testStats: { filed: 142, required: 215, failed: 8, pending: 65 },
  stages: [
    {
      key: "COMMITTED",
      label: "L1 · Committed",
      count: 50,
      color: "var(--rf-txt3)",
    },
    {
      key: "INSTALLED",
      label: "L2 · Installed",
      count: 28,
      color: "var(--rf-purple)",
    },
    {
      key: "PRE_ENERG",
      label: "L3 · Pre-Energ.",
      count: 18,
      color: "var(--rf-yellow)",
    },
    {
      key: "ENERGIZED",
      label: "L4 · Energized",
      count: 12,
      color: "var(--rf-accent)",
    },
    {
      key: "COMMISSIONED",
      label: "L5 · Commissioned",
      count: 7,
      color: "var(--rf-green)",
    },
  ],
  topIssues: [
    {
      priority: "crit",
      title: "Switchgear SG-04 ground fault during pre-energization test",
      discipline: "Electrical",
      asset: "SG-04",
      source: "Field test",
      status: "open",
      overdue: true,
      dueText: "⚠ OVERDUE",
    },
    {
      priority: "crit",
      title: "UPS-2 battery cell imbalance — failed capacity test",
      discipline: "Power",
      asset: "UPS-02",
      source: "Vendor test",
      status: "in_review",
      overdue: true,
      dueText: "⚠ OVERDUE",
    },
    {
      priority: "high",
      title: "CRAC-7 condensate pump intermittent failure",
      discipline: "Mechanical",
      asset: "CRAC-07",
      source: "Walkdown",
      status: "open",
      overdue: false,
      dueText: "18h left",
    },
    {
      priority: "high",
      title: "Fiber pathway tray missing fire-stop seal at riser 4",
      discipline: "Telecom",
      asset: "Riser-04",
      source: "QA walk",
      status: "open",
      overdue: false,
      dueText: "36h left",
    },
    {
      priority: "med",
      title: "BMS alarm log discrepancy with mechanical PLC",
      discipline: "Controls",
      asset: "BMS",
      source: "Commissioning",
      status: "in_review",
      overdue: false,
      dueText: "3d left",
    },
  ],
  issuesByDiscipline: [
    { d: "Electrical", c: 7 },
    { d: "Mechanical", c: 4 },
    { d: "Controls", c: 3 },
    { d: "Telecom", c: 2 },
    { d: "Power", c: 2 },
  ],
  recentReports: [
    {
      pass: true,
      asset: "GEN-01",
      test: "Load bank · 100%",
      by: "M. Patel",
      at: "May 19 · 09:42",
    },
    {
      pass: false,
      asset: "UPS-02",
      test: "Battery capacity",
      by: "C. Reyes",
      at: "May 18 · 16:11",
    },
    {
      pass: true,
      asset: "ATS-04",
      test: "Transfer timing",
      by: "J. Cho",
      at: "May 18 · 11:30",
    },
    {
      pass: true,
      asset: "CRAC-03",
      test: "Cooling capacity",
      by: "L. Romero",
      at: "May 17 · 15:05",
    },
    {
      pass: false,
      asset: "SG-04",
      test: "Hi-pot dielectric",
      by: "C. Reyes",
      at: "May 17 · 10:22",
    },
  ],
};

const PRIORITY = {
  crit: { label: "CRIT", color: "var(--rf-red)" },
  high: { label: "HIGH", color: "var(--rf-orange)" },
  med: { label: "MED", color: "var(--rf-yellow)" },
  low: { label: "LOW", color: "var(--rf-txt3)" },
};

const STATUS = {
  open: {
    label: "OPEN",
    fg: "var(--rf-red)",
    bg: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
  },
  in_review: {
    label: "IN REVIEW",
    fg: "var(--rf-accent)",
    bg: "color-mix(in srgb, var(--rf-accent) 12%, transparent)",
  },
  closed: {
    label: "CLOSED",
    fg: "var(--rf-green)",
    bg: "color-mix(in srgb, var(--rf-green) 12%, transparent)",
  },
};

function healthColors(h) {
  if (h === "green")
    return {
      fg: "var(--rf-green2)",
      bg: "color-mix(in srgb, var(--rf-green) 14%, transparent)",
      dot: "var(--rf-green)",
    };
  if (h === "amber")
    return {
      fg: "var(--rf-yellow2)",
      bg: "color-mix(in srgb, var(--rf-yellow) 18%, transparent)",
      dot: "var(--rf-yellow)",
    };
  return {
    fg: "var(--rf-red2)",
    bg: "color-mix(in srgb, var(--rf-red) 14%, transparent)",
    dot: "var(--rf-red)",
  };
}

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

export default function Executive() {
  const [slide, setSlide] = useState(1);
  const [present, setPresent] = useState(false);
  const d = DATA;

  return (
    <div
      style={{
        padding: present ? 0 : 24,
        maxWidth: present ? "none" : "",
        margin: "0 auto",
        background: present ? "var(--rf-bg)" : "transparent",
        minHeight: present ? "100vh" : "auto",
      }}
    >
      {!present && (
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "var(--rf-txt)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span aria-hidden>🎤</span> Executive Summary
            </h1>
            <p style={{ color: "var(--rf-txt3)", fontSize: 13, marginTop: 4 }}>
              {d.scopeLabel} · for upper management presentation
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              className="rf-btn"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
            >
              🖨 Print / PDF
            </button>
            <button className="rf-btn" onClick={() => setPresent(true)}>
              ▶ Present mode
            </button>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() =>
                typeof window !== "undefined" &&
                window.alert("Send to leadership — wiring coming soon")
              }
            >
              📤 Send to leadership
            </button>
          </div>
        </header>
      )}

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          alignItems: "center",
          flexWrap: "wrap",
          ...(present
            ? {
                padding: "10px 14px",
                background: "var(--rf-bg3)",
                borderRadius: 8,
              }
            : {}),
        }}
      >
        <span
          style={{
            fontSize: 10,
            color: "var(--rf-txt3)",
            fontWeight: 700,
            letterSpacing: "0.05em",
            marginRight: 6,
          }}
        >
          SLIDES
        </span>
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map((n) => {
          const active = slide == n;

          return (
            <button
              key={n}
              className={`border border-1 rounded-lg border-gray-300 rf-btn ${active ? "border-green-500 bg-green-200 text-white" : ""}`}
              onClick={() => setSlide(n)}
              style={{ minWidth: 32 }}
            >
              {n}
            </button>
          );
        })}
        <span style={{ fontSize: 11, color: "var(--rf-txt3)", marginLeft: 10 }}>
          {SLIDE_NAMES[slide - 1]}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {slide > 1 && (
            <button className="rf-btn" onClick={() => setSlide(slide - 1)}>
              ← Prev
            </button>
          )}
          {slide < TOTAL && (
            <button className="rf-btn" onClick={() => setSlide(slide + 1)}>
              Next →
            </button>
          )}
          {present && (
            <button className="rf-btn" onClick={() => setPresent(false)}>
              ✕ Exit present
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 12,
          padding: present ? 48 : 32,
          minHeight: present ? "70vh" : 500,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          position: "relative",
        }}
      >
        {slide === 1 && <SlideCover d={d} present={present} />}
        {slide === 2 && <SlideKPIs d={d} present={present} />}
        {slide === 3 && <SlidePhase d={d} present={present} />}
        {slide === 4 && <SlideIssues d={d} present={present} />}
        {slide === 5 && <SlideQuality d={d} present={present} />}
        {slide === 6 && <SlideActions d={d} present={present} />}

        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 24,
            fontSize: 10,
            color: "var(--rf-txt3)",
            fontFamily: MONO,
          }}
        >
          {d.project.code} · {d.company.name} · slide {slide}/{TOTAL} · {d.date}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 1: Cover ──────────────────────────────────────────────────────────
function SlideCover({ d, present }) {
  const h = healthColors(d.health);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: present ? "60vh" : "50vh",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: "var(--rf-txt3)",
          letterSpacing: "0.1em",
          marginBottom: 18,
        }}
      >
        {d.project.code} · QUARTERLY REVIEW · {d.date}
      </div>
      <div
        style={{
          fontSize: present ? 54 : 36,
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 14,
          color: "var(--rf-txt)",
        }}
      >
        {d.project.name}
      </div>
      <div
        style={{
          fontSize: present ? 22 : 16,
          color: "var(--rf-txt3)",
          marginBottom: 24,
        }}
      >
        {d.project.customer} · {d.project.site}
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 24px",
          background: h.bg,
          color: h.fg,
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: "0.05em",
          marginBottom: 42,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: h.dot,
            display: "inline-block",
          }}
        />
        {d.healthLabel.toUpperCase()}
      </div>
      <div
        style={{
          marginTop: 28,
          paddingTop: 24,
          borderTop: "1px solid var(--rf-border)",
          width: 300,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          PRESENTED BY
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--rf-txt)" }}>
          {d.presenter.name}
        </div>
        <div style={{ fontSize: 13, color: "var(--rf-txt3)", marginTop: 2 }}>
          {d.company.name} · {d.presenter.role}
        </div>
      </div>
      <div style={{ marginTop: 28, fontSize: 11, color: "var(--rf-txt3)" }}>
        {d.scopeLabel}
      </div>
    </div>
  );
}

// ─── Slide 2: Executive KPIs ─────────────────────────────────────────────────
function KPI({ label, value, sub, color, present }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px 18px",
        background: "var(--rf-bg3)",
        borderTop: `4px solid ${color}`,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: present ? 14 : 11,
          color: "var(--rf-txt3)",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: present ? 64 : 40,
          fontWeight: 800,
          color,
          lineHeight: 1,
          fontFamily: MONO,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: present ? 13 : 11,
          color: "var(--rf-txt3)",
          marginTop: 10,
          lineHeight: 1.5,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function SlideKPIs({ d, present }) {
  const ts = d.testStats;
  const filedPct = Math.round((100 * ts.filed) / ts.required);
  const healthIcon =
    d.health === "green" ? "🟢" : d.health === "amber" ? "🟡" : "🔴";
  const healthColor =
    d.health === "green"
      ? "var(--rf-green)"
      : d.health === "amber"
        ? "var(--rf-yellow)"
        : "var(--rf-red)";
  return (
    <div>
      <h2
        style={{
          fontSize: present ? 32 : 24,
          margin: "0 0 8px",
          fontWeight: 800,
          color: "var(--rf-txt)",
        }}
      >
        Executive snapshot
      </h2>
      <div
        style={{
          fontSize: present ? 15 : 13,
          color: "var(--rf-txt3)",
          marginBottom: 28,
        }}
      >
        {d.scopeLabel} · {d.date}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <KPI
          label="Project Completion"
          value={`${d.completion}%`}
          sub={`${d.energized} of ${d.totalAssets} assets energized or commissioned`}
          color="var(--rf-accent)"
          present={present}
        />
        <KPI
          label="Open Issues"
          value={d.issuesOpen}
          sub={`${d.issuesCrit} critical · ${d.issuesOverdue} overdue`}
          color={
            d.issuesCrit > 0 || d.issuesOverdue > 0
              ? "var(--rf-red)"
              : "var(--rf-accent)"
          }
          present={present}
        />
        <KPI
          label="Health Status"
          value={healthIcon}
          sub={d.healthLabel}
          color={healthColor}
          present={present}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
        }}
      >
        <KPI
          label="Test Reports Filed"
          value={`${ts.filed}/${ts.required}`}
          sub={`${filedPct}% complete · ${ts.failed} failed`}
          color={ts.failed > 0 ? "var(--rf-red)" : "var(--rf-green)"}
          present={present}
        />
        <KPI
          label="Ready to Advance"
          value={d.readyToAdvance}
          sub={`${d.blocked} blocked by prereqs`}
          color={d.readyToAdvance > 0 ? "var(--rf-green)" : "var(--rf-txt3)"}
          present={present}
        />
        <KPI
          label="Pending Handoffs"
          value={d.handoffsPending}
          sub={
            d.handoffsRejected > 0
              ? `${d.handoffsRejected} recently rejected`
              : "awaiting acknowledgment"
          }
          color={d.handoffsRejected > 0 ? "var(--rf-red)" : "var(--rf-accent)"}
          present={present}
        />
      </div>
    </div>
  );
}

// ─── Slide 3: Phase Status ───────────────────────────────────────────────────
function SlidePhase({ d, present }) {
  const max = Math.max(...d.stages.map((s) => s.count), 1);
  return (
    <div>
      <h2
        style={{
          fontSize: present ? 32 : 24,
          margin: "0 0 8px",
          fontWeight: 800,
          color: "var(--rf-txt)",
        }}
      >
        Phase status · {d.totalAssets} assets
      </h2>
      <div
        style={{
          fontSize: present ? 15 : 13,
          color: "var(--rf-txt3)",
          marginBottom: 24,
        }}
      >
        Distribution across the L1-L5 commissioning lifecycle
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${d.stages.length}, 1fr)`,
          gap: 8,
          marginBottom: 24,
        }}
      >
        {d.stages.map((s) => {
          const pct = (s.count / max) * 100;
          return (
            <div key={s.key} style={{ textAlign: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  height: present ? 200 : 140,
                }}
              >
                <div
                  style={{
                    background: s.color,
                    width: "80%",
                    height: `${Math.max(pct, 2)}%`,
                    minHeight: s.count > 0 ? 24 : 4,
                    borderRadius: "6px 6px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontFamily: MONO,
                    fontSize: present ? 18 : 14,
                    padding: "8px 0",
                  }}
                >
                  {s.count > 0 ? s.count : ""}
                </div>
              </div>
              <div
                style={{
                  fontSize: present ? 11 : 9,
                  color: "var(--rf-txt3)",
                  padding: "8px 4px 0",
                  fontWeight: 600,
                  fontFamily: MONO,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div
          style={{
            padding: 18,
            background: "color-mix(in srgb, var(--rf-green) 12%, transparent)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: "var(--rf-green2)",
              marginBottom: 8,
            }}
          >
            ✓ READY TO ADVANCE
          </div>
          <div
            style={{
              fontSize: present ? 40 : 28,
              fontWeight: 800,
              color: "var(--rf-green2)",
              fontFamily: MONO,
            }}
          >
            {d.readyToAdvance}
          </div>
          <div
            style={{ fontSize: 11, color: "var(--rf-green2)", marginTop: 6 }}
          >
            assets meet all prereqs for next phase
          </div>
        </div>
        <div
          style={{
            padding: 18,
            background:
              d.blocked > 0
                ? "color-mix(in srgb, var(--rf-red) 12%, transparent)"
                : "var(--rf-bg3)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              color: d.blocked > 0 ? "var(--rf-red2)" : "var(--rf-txt3)",
              marginBottom: 8,
            }}
          >
            ⚠ BLOCKED
          </div>
          <div
            style={{
              fontSize: present ? 40 : 28,
              fontWeight: 800,
              color: d.blocked > 0 ? "var(--rf-red2)" : "var(--rf-txt3)",
              fontFamily: MONO,
            }}
          >
            {d.blocked}
          </div>
          <div
            style={{
              fontSize: 11,
              color: d.blocked > 0 ? "var(--rf-red2)" : "var(--rf-txt3)",
              marginTop: 6,
            }}
          >
            missing checklists, tests, or attestations
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 4: Issues & Risk ──────────────────────────────────────────────────
function SlideIssues({ d, present }) {
  return (
    <div>
      <h2
        style={{
          fontSize: present ? 32 : 24,
          margin: "0 0 8px",
          fontWeight: 800,
          color: "var(--rf-txt)",
        }}
      >
        Issues &amp; risk
      </h2>
      <div
        style={{
          fontSize: present ? 15 : 13,
          color: "var(--rf-txt3)",
          marginBottom: 18,
        }}
      >
        {d.issuesOpen} open · {d.issuesCrit} critical · {d.issuesOverdue}{" "}
        overdue · {d.ncrsOpen} formal NCRs
      </div>
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            letterSpacing: "0.05em",
            marginBottom: 10,
          }}
        >
          TOP 5 ISSUES BY PRIORITY
        </div>
        {d.topIssues.map((i, idx) => {
          const p = PRIORITY[i.priority];
          const s = STATUS[i.status];
          return (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 12,
                padding: "10px 14px",
                border: "1px solid var(--rf-border)",
                borderLeft: `4px solid ${p.color}`,
                borderRadius: 6,
                marginBottom: 6,
                background: i.overdue
                  ? "color-mix(in srgb, var(--rf-red) 10%, transparent)"
                  : "var(--rf-bg2)",
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 9,
                  fontWeight: 800,
                  color: p.color,
                  padding: "2px 6px",
                  background: `color-mix(in srgb, ${p.color} 14%, transparent)`,
                  borderRadius: 3,
                  alignSelf: "center",
                }}
              >
                {p.label}
              </span>
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.4,
                    color: "var(--rf-txt)",
                  }}
                >
                  {i.title}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--rf-txt3)",
                    marginTop: 3,
                  }}
                >
                  {i.discipline} · {i.asset} · {i.source}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    background: s.bg,
                    color: s.fg,
                    borderRadius: 3,
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  {s.label}
                </span>
                <div
                  style={{
                    fontSize: 9,
                    color: i.overdue ? "var(--rf-red)" : "var(--rf-txt3)",
                    marginTop: 3,
                    fontWeight: i.overdue ? 700 : 400,
                    fontFamily: MONO,
                  }}
                >
                  {i.dueText}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            letterSpacing: "0.05em",
            marginBottom: 10,
          }}
        >
          OPEN BY DISCIPLINE
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${d.issuesByDiscipline.length}, 1fr)`,
            gap: 10,
          }}
        >
          {d.issuesByDiscipline.map((x) => (
            <div
              key={x.d}
              style={{
                padding: 14,
                background: "var(--rf-bg3)",
                borderRadius: 6,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: present ? 30 : 22,
                  fontWeight: 800,
                  color: "var(--rf-accent)",
                  fontFamily: MONO,
                }}
              >
                {x.c}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  marginTop: 4,
                  fontWeight: 600,
                }}
              >
                {x.d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 5: Quality & Tests ────────────────────────────────────────────────
function SlideQuality({ d, present }) {
  const ts = d.testStats;
  const filedPct = Math.round((100 * ts.filed) / ts.required);
  const failedPct = Math.round((100 * ts.failed) / ts.required);
  const filedW = (100 * ts.filed) / ts.required;
  const failedW = (100 * ts.failed) / ts.required;
  return (
    <div>
      <h2
        style={{
          fontSize: present ? 32 : 24,
          margin: "0 0 8px",
          fontWeight: 800,
          color: "var(--rf-txt)",
        }}
      >
        Quality &amp; testing
      </h2>
      <div
        style={{
          fontSize: present ? 15 : 13,
          color: "var(--rf-txt3)",
          marginBottom: 18,
        }}
      >
        Test execution + report filing status
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: 20,
            background: "color-mix(in srgb, var(--rf-green) 12%, transparent)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--rf-green2)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            FILED
          </div>
          <div
            style={{
              fontSize: present ? 48 : 34,
              fontWeight: 800,
              color: "var(--rf-green2)",
              fontFamily: MONO,
            }}
          >
            {ts.filed}
          </div>
          <div
            style={{ fontSize: 12, color: "var(--rf-green2)", marginTop: 6 }}
          >
            {filedPct}% of required
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: 20,
            background:
              ts.failed > 0
                ? "color-mix(in srgb, var(--rf-red) 12%, transparent)"
                : "var(--rf-bg3)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: ts.failed > 0 ? "var(--rf-red2)" : "var(--rf-txt3)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            FAILED
          </div>
          <div
            style={{
              fontSize: present ? 48 : 34,
              fontWeight: 800,
              color: ts.failed > 0 ? "var(--rf-red2)" : "var(--rf-txt3)",
              fontFamily: MONO,
            }}
          >
            {ts.failed}
          </div>
          <div
            style={{
              fontSize: 12,
              color: ts.failed > 0 ? "var(--rf-red2)" : "var(--rf-txt3)",
              marginTop: 6,
            }}
          >
            {failedPct}% failure rate
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            padding: 20,
            background: "var(--rf-bg3)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--rf-txt3)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            PENDING
          </div>
          <div
            style={{
              fontSize: present ? 48 : 34,
              fontWeight: 800,
              color: "var(--rf-txt3)",
              fontFamily: MONO,
            }}
          >
            {ts.pending}
          </div>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)", marginTop: 6 }}>
            awaiting upload
          </div>
        </div>
      </div>
      <div
        style={{
          padding: 14,
          background: "var(--rf-bg3)",
          borderRadius: 8,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            letterSpacing: "0.05em",
            marginBottom: 8,
          }}
        >
          PROGRESS BAR
        </div>
        <div
          style={{
            height: 18,
            background: "var(--rf-bg)",
            borderRadius: 9,
            overflow: "hidden",
            display: "flex",
            border: "1px solid var(--rf-border)",
          }}
        >
          <div style={{ background: "var(--rf-green)", width: `${filedW}%` }} />
          <div style={{ background: "var(--rf-red)", width: `${failedW}%` }} />
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            marginTop: 6,
            fontFamily: MONO,
          }}
        >
          {ts.filed} filed · {ts.failed} failed · {ts.pending} pending ·{" "}
          {ts.required} required
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt3)",
          letterSpacing: "0.05em",
          marginBottom: 8,
        }}
      >
        RECENT REPORTS
      </div>
      {d.recentReports.map((r, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto auto",
            gap: 12,
            padding: "8px 12px",
            border: "1px solid var(--rf-border)",
            borderRadius: 6,
            marginBottom: 5,
            alignItems: "center",
            fontSize: 12,
            background: "var(--rf-bg2)",
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              background: r.pass
                ? "color-mix(in srgb, var(--rf-green) 14%, transparent)"
                : "color-mix(in srgb, var(--rf-red) 14%, transparent)",
              color: r.pass ? "var(--rf-green2)" : "var(--rf-red2)",
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 10,
            }}
          >
            {r.pass ? "✓ PASS" : "✗ FAIL"}
          </span>
          <div style={{ color: "var(--rf-txt)" }}>
            <b style={{ fontFamily: MONO, fontSize: 11 }}>{r.asset}</b>
            <span style={{ marginLeft: 8 }}>{r.test}</span>
          </div>
          <span style={{ fontSize: 10, color: "var(--rf-txt3)" }}>{r.by}</span>
          <span
            style={{ fontSize: 10, color: "var(--rf-txt3)", fontFamily: MONO }}
          >
            {r.at}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Slide 6: Action Items ───────────────────────────────────────────────────
function SlideActions({ d, present }) {
  const items = [];
  if (d.issuesCrit > 0)
    items.push({
      icon: "🚨",
      text: `${d.issuesCrit} CRITICAL issues require immediate attention`,
      urgency: "high",
    });
  if (d.issuesOverdue > 0)
    items.push({
      icon: "⏱",
      text: `${d.issuesOverdue} issues overdue · review SLA + escalation`,
      urgency: "high",
    });
  if (d.handoffsPending > 0)
    items.push({
      icon: "🤝",
      text: `${d.handoffsPending} pending handoffs awaiting acknowledgment from receiving discipline`,
      urgency: "med",
    });
  if (d.handoffsRejected > 0)
    items.push({
      icon: "✗",
      text: `${d.handoffsRejected} recently REJECTED handoffs · investigate and remediate`,
      urgency: "high",
    });
  if (d.testStats.failed > 0)
    items.push({
      icon: "🧪",
      text: `${d.testStats.failed} FAILED test reports · disposition required`,
      urgency: "high",
    });
  if (d.testStats.pending > 5)
    items.push({
      icon: "📤",
      text: `${d.testStats.pending} test reports awaiting upload · dispatch to responsible parties`,
      urgency: "med",
    });
  if (d.blocked > 0)
    items.push({
      icon: "🚦",
      text: `${d.blocked} assets blocked from phase advancement · drive prereq closure`,
      urgency: "med",
    });
  if (d.ncrsOpen > 0)
    items.push({
      icon: "⚠",
      text: `${d.ncrsOpen} formal NCRs open · engineering disposition needed`,
      urgency: "med",
    });
  if (d.readyToAdvance > 0)
    items.push({
      icon: "⏭",
      text: `${d.readyToAdvance} assets ready to advance · execute next phase transition`,
      urgency: "low",
    });
  if (items.length === 0)
    items.push({
      icon: "✓",
      text: "All systems on track · no critical action items at this time",
      urgency: "low",
    });

  const asks = [
    "Approval to escalate CRIT issues to formal NCR",
    "Decision authority to release blocked phases under controlled risk",
    "Confirm RFS (Ready for Service) target date alignment with customer",
  ];

  const palette = {
    high: {
      fg: "var(--rf-red)",
      bg: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
    },
    med: {
      fg: "var(--rf-yellow)",
      bg: "color-mix(in srgb, var(--rf-yellow) 14%, transparent)",
    },
    low: { fg: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  };

  return (
    <div>
      <h2
        style={{
          fontSize: present ? 32 : 24,
          margin: "0 0 8px",
          fontWeight: 800,
          color: "var(--rf-txt)",
        }}
      >
        Action items &amp; asks
      </h2>
      <div
        style={{
          fontSize: present ? 15 : 13,
          color: "var(--rf-txt3)",
          marginBottom: 24,
        }}
      >
        Top items requiring leadership attention
      </div>
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            letterSpacing: "0.05em",
            marginBottom: 10,
          }}
        >
          PRIORITY ACTIONS
        </div>
        {items.map((i, idx) => {
          const c = palette[i.urgency];
          return (
            <div
              key={idx}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 14,
                padding: "14px 18px",
                background: c.bg,
                borderLeft: `4px solid ${c.fg}`,
                borderRadius: 6,
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: present ? 24 : 20 }}>{i.icon}</div>
              <div
                style={{
                  fontSize: present ? 14 : 13,
                  lineHeight: 1.5,
                  color: "var(--rf-txt)",
                }}
              >
                {i.text}
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: c.fg,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                }}
              >
                {i.urgency.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--rf-txt3)",
            letterSpacing: "0.05em",
            marginBottom: 10,
          }}
        >
          ASKS FROM LEADERSHIP
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 24,
            lineHeight: 1.6,
            color: "var(--rf-txt)",
          }}
        >
          {asks.map((a, i) => (
            <li
              key={i}
              style={{ marginBottom: 6, fontSize: present ? 14 : 13 }}
            >
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
