"use client";

// Schedule · GC baseline Gantt view
// Mirrors the screenshot: page header, three view tabs, info banner, and a
// 7-month Gantt chart with asset rows and phase bars (L1-L5). TODAY is
// painted as a red vertical line with a red "TODAY" pin on every row.
// Status colors: closed = green, inProgress = orange, planned = grey.

import { useState } from "react";

// ─── Color tokens (Cobalt + Citrine palette, matches CommissioningTests) ──
const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  borderStrong: "#cbd5e1",
  text: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  brand: "#1e40af",
  brandH: "#1e3a8a",
  brandSoft: "#dbeafe",
  brandFade: "#eff6ff",
  green: "#16a34a",
  orange: "#f59e0b",
  planned: "#cbd5e1",
  plannedText: "#475569",
  red: "#dc2626",
};

const PHASE_STYLE = {
  closed: { bg: C.green, fg: "#fff" },
  inProgress: { bg: C.orange, fg: "#fff" },
  planned: { bg: C.planned, fg: C.plannedText },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const MONTH_COUNT = MONTHS.length;
const ASSET_COL_PX = 150;
// TODAY = May 5  →  4 months in + 5/31 of May
const TODAY = 4 + 5 / 31;

// Each phase has start/end expressed in "months since Jan 1"
// (so 0 = Jan 1, 1 = Feb 1, 4.5 = mid-May, etc.). Status drives the bar color.
const ASSETS = [
  {
    id: "UPS-01",
    type: "UPS",
    phases: [
      { phase: "L1", start: 0.05, end: 0.3, status: "closed" },
      { phase: "L2", start: 0.5, end: 2.5, status: "closed" },
      { phase: "L3", start: 2.6, end: 3.2, status: "closed" },
      { phase: "L4", start: 4.0, end: 4.25, status: "closed" },
      { phase: "L5", start: 5.7, end: 5.95, status: "planned" },
    ],
  },
  {
    id: "UPS-02",
    type: "UPS",
    phases: [
      { phase: "L1", start: 0.05, end: 0.3, status: "closed" },
      { phase: "L2", start: 0.7, end: 2.7, status: "closed" },
      { phase: "L3", start: 2.8, end: 3.4, status: "closed" },
      { phase: "L4", start: 4.0, end: 4.25, status: "closed" },
      { phase: "L5", start: 5.7, end: 5.95, status: "planned" },
    ],
  },
  {
    id: "UPS-03",
    type: "UPS",
    phases: [
      { phase: "L1", start: 0.2, end: 0.45, status: "closed" },
      { phase: "L2", start: 1.6, end: 3.95, status: "inProgress" },
      { phase: "L3", start: 4.2, end: 4.7, status: "planned" },
      { phase: "L4", start: 5.0, end: 5.25, status: "planned" },
      { phase: "L5", start: 5.6, end: 5.85, status: "planned" },
    ],
  },
  {
    id: "GEN-01",
    type: "GEN",
    phases: [
      { phase: "L1", start: 0.15, end: 0.4, status: "closed" },
      { phase: "L2", start: 0.7, end: 2.8, status: "closed" },
      { phase: "L3", start: 2.9, end: 3.5, status: "closed" },
      { phase: "L4", start: 4.0, end: 4.25, status: "closed" },
      { phase: "L5", start: 5.7, end: 5.95, status: "planned" },
    ],
  },
  {
    id: "GEN-02",
    type: "GEN",
    phases: [
      { phase: "L1", start: 0.15, end: 0.4, status: "closed" },
      { phase: "L2", start: 0.7, end: 3.95, status: "inProgress" },
      { phase: "L3", start: 4.5, end: 4.85, status: "planned" },
      { phase: "L4", start: 5.05, end: 5.3, status: "planned" },
      { phase: "L5", start: 5.6, end: 5.85, status: "planned" },
    ],
  },
  {
    id: "CHL-01",
    type: "CHILL",
    phases: [
      { phase: "L1", start: 0.3, end: 0.55, status: "closed" },
      { phase: "L2", start: 1.0, end: 3.95, status: "inProgress" },
      { phase: "L3", start: 4.5, end: 4.85, status: "planned" },
      { phase: "L4", start: 5.4, end: 5.6, status: "planned" },
      { phase: "L5", start: 5.65, end: 5.85, status: "planned" },
    ],
  },
  {
    id: "PDU-01",
    type: "PDU",
    phases: [
      { phase: "L1", start: 0.05, end: 0.3, status: "closed" },
      { phase: "L2", start: 0.5, end: 2.5, status: "closed" },
      { phase: "L3", start: 2.6, end: 3.2, status: "closed" },
      { phase: "L4", start: 3.9, end: 4.1, status: "closed" },
    ],
  },
  {
    id: "SWG-01",
    type: "MV_SWGR",
    phases: [
      { phase: "L1", start: 0.15, end: 0.4, status: "closed" },
      { phase: "L2", start: 0.6, end: 3.0, status: "closed" },
      { phase: "L3", start: 3.4, end: 4.0, status: "closed" },
      { phase: "L4", start: 4.0, end: 4.15, status: "closed" },
    ],
  },
];

const TABS = [
  { key: "baseline", label: "GC Baseline (read-only)" },
  { key: "hitt", label: "HITT Contracting view" },
  { key: "compare", label: "Compare baseline vs actual" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const pct = (n) => `${(n / MONTH_COUNT) * 100}%`;

function PhaseBar({ phase }) {
  const s = PHASE_STYLE[phase.status];
  const width = phase.end - phase.start;
  // For very narrow bars, hide the label rather than truncating awkwardly.
  const showLabel = width >= 0.18;
  return (
    <div
      title={`${phase.phase} · ${phase.status}`}
      style={{
        position: "absolute",
        left: pct(phase.start),
        width: pct(width),
        top: 18,
        height: 24,
        background: s.bg,
        color: s.fg,
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.3,
        boxShadow:
          phase.status === "planned"
            ? "inset 0 0 0 1px rgba(0,0,0,0.04)"
            : "0 1px 2px rgba(15,23,42,0.12)",
      }}
    >
      {showLabel ? phase.phase : ""}
    </div>
  );
}

function TodayMarker({ withPin }) {
  return (
    <>
      {/* Vertical red line spanning the row */}
      <div
        style={{
          position: "absolute",
          left: pct(TODAY),
          top: 0,
          bottom: 0,
          width: 2,
          background: C.red,
          transform: "translateX(-1px)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      {/* "TODAY" pin */}
      {withPin && (
        <div
          style={{
            position: "absolute",
            left: pct(TODAY),
            top: -2,
            transform: "translateX(-50%)",
            background: C.red,
            color: "#fff",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: 0.6,
            padding: "2px 6px",
            borderRadius: 3,
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          TODAY
        </div>
      )}
    </>
  );
}

function LegendSwatch({ color, label, isLine }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        color: C.textSoft,
        fontSize: 12,
      }}
    >
      <span
        style={
          isLine
            ? {
                width: 2,
                height: 14,
                background: color,
                display: "inline-block",
              }
            : {
                width: 18,
                height: 12,
                background: color,
                borderRadius: 3,
                display: "inline-block",
              }
        }
      />
      {label}
    </span>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Schedule() {
  const [tab, setTab] = useState("baseline");

  return (
    <div
      style={{
        padding: 24,
        background: C.bg,
        minHeight: "100%",
        color: C.text,
        fontFamily: "inherit",
      }}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              marginBottom: 6,
              letterSpacing: -0.4,
            }}
          >
            Schedule
          </h1>
          <p
            style={{
              color: C.textSoft,
              maxWidth: 760,
              lineHeight: 1.55,
              margin: 0,
              fontSize: 13,
            }}
          >
            Master baseline schedule for MSFT-DC1. The GC owns it; every company
            can see it. Today is highlighted in red. As GC, you can edit
            milestones.
          </p>
        </div>
        <button
          type="button"
          style={{
            background: C.brand,
            color: "#fff",
            border: 0,
            borderRadius: 8,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 2px rgba(30,64,175,0.25)",
          }}
        >
          + Edit baseline
        </button>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 14,
        }}
      >
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                background: "transparent",
                border: 0,
                borderBottom: `2px solid ${active ? C.brand : "transparent"}`,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? C.brand : C.textSoft,
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Info banner ───────────────────────────────────────────────── */}
      <div
        style={{
          background: C.brandFade,
          border: `1px solid ${C.brandSoft}`,
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 14,
          fontSize: 13,
          color: C.brandH,
          lineHeight: 1.55,
        }}
      >
        <b>How schedules work.</b> The GC publishes the baseline that everyone
        tracks against. Each company can also maintain their own{" "}
        <b>internal schedule</b> (not visible to others) and a{" "}
        <b>public schedule</b> they share with GC + customer. Trade tasks roll
        up to L2 phases; OEM milestones roll up to L1, L3.06, L4.
      </div>

      {/* ── Gantt chart ───────────────────────────────────────────────── */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* Month header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${ASSET_COL_PX}px 1fr`,
            background: C.bg,
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              color: C.textSoft,
              letterSpacing: 0.8,
            }}
          >
            ASSET
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${MONTH_COUNT}, 1fr)`,
            }}
          >
            {MONTHS.map((m) => (
              <div
                key={m}
                style={{
                  padding: "10px 14px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: C.textSoft,
                  letterSpacing: 0.8,
                  textAlign: "center",
                  borderLeft: `1px solid ${C.border}`,
                }}
              >
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {ASSETS.map((a) => (
          <div
            key={a.id}
            style={{
              display: "grid",
              gridTemplateColumns: `${ASSET_COL_PX}px 1fr`,
              borderTop: `1px solid ${C.border}`,
              alignItems: "stretch",
            }}
          >
            {/* Asset cell */}
            <div
              style={{
                padding: "14px 14px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {a.id}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: C.textMuted,
                  marginTop: 2,
                  letterSpacing: 0.5,
                }}
              >
                {a.type}
              </div>
            </div>
            {/* Chart cell */}
            <div
              style={{
                position: "relative",
                height: 60,
                background:
                  "repeating-linear-gradient(to right, transparent 0, transparent calc(100%/7 - 1px), " +
                  C.border +
                  " calc(100%/7 - 1px), " +
                  C.border +
                  " calc(100%/7))",
              }}
            >
              {a.phases.map((p) => (
                <PhaseBar key={p.phase} phase={p} />
              ))}
              <TodayMarker withPin />
            </div>
          </div>
        ))}
      </div>

      {/* ── Legend ────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 18,
          marginTop: 14,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <LegendSwatch color={C.green} label="Closed" />
        <LegendSwatch color={C.orange} label="In progress" />
        <LegendSwatch color={C.planned} label="Planned" />
        <span style={{ color: C.borderStrong }}>|</span>
        <LegendSwatch color={C.red} label="Today (May 5)" isLine />
      </div>
    </div>
  );
}
