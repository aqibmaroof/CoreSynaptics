"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ *
 * Theme colors — border tokens carry hex fallbacks (the cx theme remap
 * defines bg/txt/accent but NOT --rf-border*, so a bare var() would drop
 * the whole border declaration).
 * ------------------------------------------------------------------ */
const C = {
  txt: "var(--rf-txt, #08142e)",
  txt2: "var(--rf-txt2, #3a5070)",
  txt3: "var(--rf-txt3, #6b84a0)",
  bg: "var(--rf-bg, #dde6f5)",
  bg2: "var(--rf-bg2, #ffffff)",
  bg3: "var(--rf-bg3, #e8f0fa)",
  border: "var(--rf-border, #c5d2ea)",
  border2: "var(--rf-border2, #adbbd8)",
  border3: "var(--rf-border3, #8daacf)",
  accent: "var(--rf-accent, #0070bb)",
  blue: "#2563eb",
  blueSoft: "#eff6ff",
  purple: "#7c3aed",
  purpleSoft: "#f5f3ff",
  amber: "#b45309",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
};

/* ------------------------------------------------------------------ *
 * Static config
 * ------------------------------------------------------------------ */

const TABS = [
  { key: "analyze", label: "Analyze a Drawing", icon: "🖌️" },
  { key: "checklist", label: "Generate Checklist", icon: "📋" },
  { key: "glossary", label: "Symbol Glossary", icon: "📖" },
  { key: "guide", label: "Drawing Type Guide", icon: "📘" },
];

const DRAWING_TYPES = [
  { key: "oneline", icon: "⚡", title: "Electrical One-Line", desc: "Single-line diagrams, switchgear layouts, breaker schedules, load schedules" },
  { key: "pid", icon: "🌀", title: "P&ID Drawing", desc: "Piping and instrumentation diagrams, cooling loops, valve schematics" },
  { key: "floor", icon: "📄", title: "Floor Plan / Layout", desc: "Equipment layouts, cable tray routing, raised floor plans, room layouts" },
  { key: "control", icon: "🛠️", title: "Control Schematic", desc: "BMS control wiring, interlock diagrams, relay logic, ATS control schematics" },
];

const ROLES = [
  { key: "pm", icon: "📋", label: "Project Manager" },
  { key: "qaqc", icon: "🔍", label: "QA/QC Engineer" },
  { key: "sup", icon: "🌲", label: "Superintendent" },
  { key: "oem", icon: "⚙️", label: "OEM FSE" },
  { key: "cxa", icon: "✅", label: "Commissioning Agent" },
  { key: "elec", icon: "⚡", label: "Electrician" },
];

const SUGGESTIONS = [
  "What do I need to test?",
  "What's the work sequence?",
  "Are there safety concerns?",
  "What's missing or unclear?",
];

const CHECKLIST_SYSTEMS = [
  { tag: "CHL-01", items: 12, name: "Chilled-Water System — CHL-01", meta: "SAMPLE Project P&ID (synthetic) · Mech-Yard" },
  { tag: "UPS-03", items: 9, name: "Static UPS — UPS-03", meta: "Electrical One-Line (synthetic) · UPS-Rm-B / DH-01" },
];

const PID_SYMBOLS = [
  { code: "— (solid line)", desc: "Physical pipe or conductor" },
  { code: "- - - (dashed)", desc: "Signal/control line or future work" },
  { code: "▷ Triangle", desc: "Control valve or check valve" },
  { code: "⊕ Circle with X", desc: "Gate valve (normally open or closed)" },
  { code: "PSV / PRV", desc: "Pressure Safety Valve / Pressure Relief Valve" },
  { code: "FT / FI", desc: "Flow Transmitter / Flow Indicator" },
  { code: "TT / TI", desc: "Temperature Transmitter / Indicator" },
  { code: "PT / PI", desc: "Pressure Transmitter / Indicator" },
  { code: "LT / LI", desc: "Level Transmitter / Indicator" },
];

const ELEC_SYMBOLS = [
  { code: "VCB", desc: "Vacuum Circuit Breaker (medium voltage)" },
  { code: "MCCB", desc: "Molded Case Circuit Breaker (low voltage)" },
  { code: "ACB", desc: "Air Circuit Breaker (large frame LV)" },
  { code: "CT / PT", desc: "Current Transformer / Potential Transformer" },
  { code: "87 / 51 / 27 / 59", desc: "Diff protection / Overcurrent / Undervolt / Overvolt relay" },
  { code: "TDNE / TDEN", desc: "Time Delay Normal-to-Emergency / Emergency-to-Normal (ATS)" },
  { code: "N+1 / 2N", desc: "One spare / Full dual redundancy" },
];

const GUIDE_CARDS = [
  {
    icon: "⚡",
    title: "Electrical One-Line Diagram",
    desc: "Shows the entire electrical power distribution path from utility intake to rack-level loads. Uses single lines to represent 3-phase circuits.",
    look: [
      "Voltage levels at each point (33kV → 11kV → 480V → 208V)",
      "Breaker ratings and frame sizes (drives NETA injection type)",
      "ATS positions and redundancy paths (N+1, 2N)",
      "UPS input/output/bypass connections",
      "Generator connection point to ATS",
      "Metering and protection relay symbols",
    ],
    pm: "Identify all major equipment that needs OEM FSEs and schedule their factory tests.",
    qaqc: "Every breaker ≥400A needs primary injection. Every relay needs secondary injection. Build your test matrix from this drawing.",
    sup: "Work sequence follows the power path: utility → MV-SWG → transformers → LV switchboard → UPS → PDU → racks.",
  },
  {
    icon: "🌀",
    title: "P&ID (Piping & Instrumentation Diagram)",
    desc: "Shows all piping, valves, instruments, and control connections for mechanical systems (chilled water, coolant loops, CDUs).",
    look: [
      "Pipe sizes and pressure ratings (drives pressure test spec)",
      "Valve types — check, gate, control, isolation",
      "Instrument tags (TT, FT, PT) — every one needs P2P verification",
      "Loop controls (temperature control valves, VFDs)",
      "N+1 pump configurations",
      "Drain points, vent points, expansion tanks",
    ],
    pm: "Count all instrument tags — each requires P2P BMS verification. Budget 1 hr per 50 points.",
    qaqc: "Pressure test spec comes from the design pressure shown on the P&ID. Hydrostatic at 1.5× design. Every instrument needs calibration.",
    sup: "Flush sequence must follow the flow path shown. High points need vents. Low points need drains. Work from source to load.",
  },
  {
    icon: "📄",
    title: "Control Schematic / ATS Control",
    desc: "Shows electrical control wiring, relay logic, interlock sequences, and automation connections for equipment like ATS, BMS, fire systems.",
    look: [
      "Interlock contacts (Kirk Key positions)",
      "Time delay relay coils and contacts (TDNE, TDEN)",
      "Normally open vs normally closed contacts",
      "BMS hardwired dry contacts vs network points",
      "EPO (Emergency Power Off) circuit path",
      "Generator start circuit",
    ],
    pm: "Control schematics reveal the commissioning test sequence — the order of energization must match the interlock logic shown.",
    qaqc: "Every contact shown must be tested during P2P verification. ATS transfer logic must be verified by simulation before live load transfer.",
    sup: "Never operate controls you don't understand. Read the schematic, understand the interlock, or get the controls engineer on site first.",
  },
  {
    icon: "📖",
    title: "Floor Plan / Equipment Layout",
    desc: "Shows physical locations of equipment, cable tray routing, aisle containment, raised floor grids, and service clearances.",
    look: [
      'Equipment clearances (NFPA 70E requires 36" minimum for electrical panels)',
      "Cable tray fill (80% maximum per NEC)",
      "Emergency egress paths (must remain clear)",
      "Cold aisle / hot aisle orientation",
      "CDU and manifold routing for liquid cooling zones",
      "Fire suppression nozzle locations and coverage",
    ],
    pm: "Use layout drawings for long-lead equipment placement verification — confirm footprints match before construction.",
    qaqc: "Check clearances before energization. A blocked electrical panel is a NFPA 70E violation and an immediate stop-work condition.",
    sup: "Walk the layout with your crew before work starts. Identify where your work zone begins/ends. Know where EPO buttons and fire exits are.",
  },
];

/* ------------------------------------------------------------------ *
 * Building blocks
 * ------------------------------------------------------------------ */

const cardLabel = { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: C.txt3 };

function Card({ children, className = "", style = {} }) {
  return (
    <div className={`rounded-2xl ${className}`} style={{ background: C.bg2, border: `1px solid ${C.border2}`, ...style }}>
      {children}
    </div>
  );
}

function SymbolList({ title, rows }) {
  return (
    <div>
      <h3 className="font-bold text-base mb-3" style={{ color: C.txt }}>{title}</h3>
      <Card>
        {rows.map((r, i) => (
          <div
            key={r.code}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderTop: i === 0 ? "none" : `1px solid ${C.border}` }}
          >
            <span
              className="font-mono text-xs px-2 py-1 rounded flex-shrink-0 whitespace-nowrap"
              style={{ background: C.bg3, color: C.txt2 }}
            >
              {r.code}
            </span>
            <span className="text-sm" style={{ color: C.txt2 }}>{r.desc}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function RoleNote({ tag, color, soft, text }) {
  return (
    <div className="rounded-lg px-3 py-2.5 text-xs" style={{ background: soft, color: C.txt2 }}>
      <span className="font-bold" style={{ color }}>{tag}:</span> {text}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */

export default function DrawingAnalyzer() {
  const [tab, setTab] = useState("analyze");
  const [drawingType, setDrawingType] = useState("oneline");
  const [role, setRole] = useState("qaqc");
  const [question, setQuestion] = useState("");

  return (
    <div className="min-h-screen font-gilroy p-6" style={{ color: C.txt }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span style={{ color: C.blue, fontSize: 22 }}>👁️</span>
        <h1 className="font-bold text-2xl">Drawing Analyzer</h1>
      </div>
      <p className="text-sm mt-1 mb-5" style={{ color: C.txt2 }}>
        Upload electrical one-lines, P&amp;IDs, or control schematics — AI explains what it means for your
        role and what actions to take
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-6 mb-6" style={{ borderBottom: `1px solid ${C.border}` }}>
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 pb-3 text-sm font-semibold transition-colors"
              style={{
                color: active ? C.blue : C.txt2,
                borderBottom: `2px solid ${active ? C.blue : "transparent"}`,
                marginBottom: -1,
              }}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab: Analyze a Drawing ───────────────────────────── */}
      {tab === "analyze" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* Drawing type */}
            <Card className="p-4">
              <p className="uppercase mb-3" style={cardLabel}>Drawing Type</p>
              <div className="flex flex-col gap-2">
                {DRAWING_TYPES.map((d) => {
                  const active = drawingType === d.key;
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => setDrawingType(d.key)}
                      className="text-left rounded-xl p-3 transition-all"
                      style={{
                        background: active ? C.blueSoft : C.bg2,
                        border: `1px solid ${active ? C.blue : C.border2}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span>{d.icon}</span>
                        <span className="text-sm font-bold" style={{ color: active ? C.blue : C.txt }}>{d.title}</span>
                      </div>
                      <p className="text-xs" style={{ color: C.txt3 }}>{d.desc}</p>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Your role */}
            <Card className="p-4">
              <p className="uppercase mb-3" style={cardLabel}>Your Role</p>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => {
                  const active = role === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRole(r.key)}
                      className="rounded-xl py-3 px-2 text-center transition-all"
                      style={{
                        background: active ? C.blueSoft : C.bg2,
                        border: `1px solid ${active ? C.blue : C.border2}`,
                      }}
                    >
                      <div style={{ fontSize: 16 }}>{r.icon}</div>
                      <div className="text-xs font-bold mt-1" style={{ color: active ? C.blue : C.txt }}>{r.label}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs mt-4 mb-2" style={{ color: C.txt3 }}>Custom question (optional)</p>
              <textarea
                rows={2}
                placeholder="What tests and inspections are required for the systems shown in this drawing? What are the hold points?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-3 py-2.5 text-sm outline-none resize-none"
                style={{ background: C.bg2, border: `1.5px solid ${C.border3}`, color: C.txt, borderRadius: 12 }}
              />
            </Card>

            {/* Upload */}
            <Card className="p-4">
              <p className="uppercase mb-3" style={cardLabel}>Upload Drawing</p>
              <div
                className="rounded-xl py-8 px-4 text-center cursor-pointer"
                style={{ border: `1.5px dashed ${C.border3}`, background: C.bg2 }}
              >
                <div style={{ fontSize: 22, color: C.txt3 }}>⬆️</div>
                <p className="text-sm mt-2" style={{ color: C.txt2 }}>Click to upload or drag &amp; drop</p>
                <p className="text-xs mt-0.5" style={{ color: C.txt3 }}>PNG, JPG, PDF supported</p>
              </div>
              <button
                type="button"
                className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#9aa6cf", color: "#fff" }}
              >
                🔍 Analyze Drawing
              </button>
              <button
                type="button"
                onClick={() => setTab("checklist")}
                className="w-full mt-2 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: C.bg2, border: `1px solid ${C.blue}`, color: C.blue }}
              >
                📋 Generate commissioning checklist →
              </button>
              <p className="text-xs mt-2" style={{ color: C.txt3 }}>
                Builds discipline checklists from this drawing type and opens them in Cx Readiness for the
                phase gate.
              </p>
            </Card>
          </div>

          {/* Right column — empty state */}
          <Card className="lg:col-span-2 p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: 420 }}>
            <div style={{ fontSize: 30, color: C.txt3 }}>👁️</div>
            <h2 className="font-bold text-lg mt-3" style={{ color: C.txt2 }}>Upload a drawing to get started</h2>
            <p className="text-sm mt-2 max-w-md" style={{ color: C.txt3 }}>
              AI will read your electrical one-line, P&amp;ID, or control schematic and explain it in plain
              language — tailored to your role.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="px-3 py-2 rounded-lg text-sm font-medium"
                  style={{ background: C.bg2, border: `1px solid ${C.border2}`, color: C.txt2 }}
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Generate Checklist ──────────────────────────── */}
      {tab === "checklist" && (
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="font-bold text-lg" style={{ color: C.txt }}>
              Generate a commissioning checklist from a drawing
            </h2>
            <p className="text-sm mt-1 mb-4" style={{ color: C.txt2 }}>
              The analyzer extracts the tag/asset register, then builds discipline checklists (Mechanical /
              Electrical / Controls) with work + test items and pushes them to{" "}
              <strong style={{ color: C.txt }}>Cx Readiness</strong> for the phase gate.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHECKLIST_SYSTEMS.map((s) => (
                <Card key={s.tag} className="p-4">
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-base" style={{ color: C.blue }}>{s.tag}</span>
                    <span className="text-xs px-2 py-1 rounded" style={{ background: C.bg3, color: C.txt3 }}>
                      {s.items} items
                    </span>
                  </div>
                  <p className="font-bold text-sm mt-2" style={{ color: C.txt }}>{s.name}</p>
                  <p className="text-xs mt-1" style={{ color: C.txt3 }}>{s.meta}</p>
                  <button type="button" className="mt-3 text-sm font-bold" style={{ color: C.blue }}>
                    Generate checklist →
                  </button>
                </Card>
              ))}
            </div>
          </Card>

          <div className="rounded-2xl p-4 flex gap-3" style={{ background: C.amberSoft, border: `1px solid ${C.amberBorder}` }}>
            <span style={{ color: C.amber }}>⚠️</span>
            <p className="text-sm" style={{ color: C.txt2 }}>
              <strong style={{ color: C.amber }}>Offline demo:</strong> these use built-in sample extractions
              so you can see the full flow end-to-end. When CxControl is connected to its backend, the{" "}
              <strong style={{ color: C.txt }}>Analyze a Drawing</strong> tab runs the real AI extraction on
              an uploaded drawing and produces this same structure automatically.
            </p>
          </div>
        </div>
      )}

      {/* ── Tab: Symbol Glossary ─────────────────────────────── */}
      {tab === "glossary" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <SymbolList title="P&ID Symbols" rows={PID_SYMBOLS} />
          <SymbolList title="Electrical Symbols & Relay Codes" rows={ELEC_SYMBOLS} />
        </div>
      )}

      {/* ── Tab: Drawing Type Guide ──────────────────────────── */}
      {tab === "guide" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {GUIDE_CARDS.map((g) => (
            <Card key={g.title} className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: 18 }}>{g.icon}</span>
                <h3 className="font-bold text-base" style={{ color: C.txt }}>{g.title}</h3>
              </div>
              <p className="text-sm mb-4" style={{ color: C.txt2 }}>{g.desc}</p>

              <p className="uppercase mb-2" style={cardLabel}>What to look for</p>
              <ul className="flex flex-col gap-1.5 mb-4">
                {g.look.map((l) => (
                  <li key={l} className="text-sm flex gap-2" style={{ color: C.txt2 }}>
                    <span style={{ color: C.blue }}>•</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2">
                <RoleNote tag="PM" color={C.blue} soft={C.blueSoft} text={g.pm} />
                <RoleNote tag="QA/QC" color={C.purple} soft={C.purpleSoft} text={g.qaqc} />
                <RoleNote tag="SUP" color={C.amber} soft={C.amberSoft} text={g.sup} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
