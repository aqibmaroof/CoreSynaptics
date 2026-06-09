"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ *
 * Theme colors — every border token carries a hex fallback because the
 * cx theme remap defines --rf-accent / bg / txt but NOT --rf-border*,
 * so a bare var(--rf-border) would drop the whole border declaration.
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
  green: "var(--rf-green, #16a34a)",
  greenSoft: "var(--rf-green-soft, #dcfce7)",
  red: "var(--rf-red, #dc2626)",
  redSoft: "var(--rf-red-soft, #fee2e2)",
  amber: "#d97706",
  amberSoft: "#fef3c7",
  amberBorder: "#fcd34d",
  amberText: "#92400e",
  teal: "#0d9488",
  tealSoft: "#ccfbf1",
};

/* ------------------------------------------------------------------ *
 * Mock data
 * ------------------------------------------------------------------ */

const SYSTEMS = [
  "CHL-01 — Chilled-Water System — CHL-01",
  "AHU-02 — Air-Handling Unit — AHU-02",
  "UPS-A — UPS System — UPS-A",
];

// Tag color follows the selected phase: L1 red · L2 yellow · L3 green · L4 blue · L5 white
const PHASE_TAG = {
  L1: { color: C.red, label: "Red tag" },
  L2: { color: "#ca8a04", label: "Yellow tag" },
  L3: { color: C.green, label: "Green tag" },
  L4: { color: "#2563eb", label: "Blue tag" },
  L5: { color: "#64748b", label: "White tag", dot: "#ffffff", dotBorder: true },
};

const SYSTEM_TAGS = [
  { label: "P&ID", ok: true },
  { label: "One-Line", ok: true },
  { label: "Submittal", ok: true },
  { label: "CR-014", ok: true },
  { label: "RFI-022 (open)", ok: false },
  { label: "Floor Plan", ok: true },
];

const INITIAL_ITEMS = {
  Mechanical: [
    {
      id: "M1",
      type: "WORK",
      ref: 'P&ID 3"-CHWS/CHWR',
      code: "M1",
      status: "done",
      text: "Chilled-water supply & return piped to CHL-01 per P&ID",
    },
    {
      id: "M2",
      type: "WORK",
      ref: "P&ID FV-CHL-01B",
      code: "M2",
      status: "flag",
      tier: "Mitigating",
      text: "Isolation valves FV-CHL-01A/B installed at locations shown",
      note: "FV-CHL-01B (pneumatic actuated) not roughed in — missed in install. Still construction, logging as mitigating; mechanical to install before L3.",
    },
    {
      id: "M3",
      type: "WORK",
      ref: "Spec 23 21 13",
      code: "M3",
      status: "done",
      text: "Pipe supports per spec (max 10 ft spacing), labeled",
    },
    {
      id: "M4",
      type: "TEST",
      ref: "Hydrostatic",
      code: "M4",
      status: "open",
      text: "Hydrostatic pressure test @150% design, hold 2h — report on file",
    },
    {
      id: "M5",
      type: "TEST",
      ref: "Leak detect",
      code: "M5",
      status: "open",
      text: "Glycol loop leak-detection check — report on file",
    },
  ],
  Electrical: [
    {
      id: "E1",
      type: "WORK",
      ref: "One-Line FDR-A",
      code: "E1",
      status: "done",
      text: "Feeder MSB-A → CHL-01 pulled & terminated per one-line",
    },
    {
      id: "E2",
      type: "WORK",
      ref: "Submittal/CR-014",
      code: "E2",
      status: "flag",
      tier: "Mitigating",
      text: "Disconnect switch rated & located per submittal",
      note: "Switch frame size per CR-014 pending vendor confirmation — logging as mitigating; close before gate.",
    },
    {
      id: "E3",
      type: "TEST",
      ref: "Megger",
      code: "E3",
      status: "open",
      text: "Insulation resistance (megger) test — report on file",
    },
  ],
  Controls: [
    {
      id: "C1",
      type: "WORK",
      ref: "BMS Points",
      code: "C1",
      status: "done",
      text: "BMS controller mounted, powered & discovered on network",
    },
    {
      id: "C3",
      type: "WORK",
      ref: "BMS I/O",
      code: "C3",
      status: "flag",
      tier: "Mitigating",
      text: "All I/O points wired & labeled per points list",
      note: "3 analog inputs not yet landed — logging as mitigating; close before gate.",
    },
    {
      id: "C4",
      type: "TEST",
      ref: "Cal/stroke",
      code: "C4",
      status: "open",
      text: "Valve calibration & stroke test — report on file",
    },
  ],
};

/* ------------------------------------------------------------------ *
 * Small building blocks
 * ------------------------------------------------------------------ */

function Tag({ ok, label }) {
  const color = ok ? C.green : C.amber;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ border: `1px solid ${color}`, color, background: C.bg2 }}
    >
      <span
        className="rounded-full"
        style={{ width: 6, height: 6, background: color }}
      />
      {label} {ok ? "✓" : "!"}
    </span>
  );
}

function StatusIcon({ status }) {
  if (status === "done") {
    return (
      <span
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: C.greenSoft,
          border: `1.5px solid ${C.green}`,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.green}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (status === "flag") {
    return (
      <span
        className="flex items-center justify-center flex-shrink-0 font-bold"
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          background: C.amberSoft,
          border: `1.5px solid ${C.amber}`,
          color: C.amber,
          fontSize: 13,
        }}
      >
        !
      </span>
    );
  }
  return (
    <span
      className="flex-shrink-0"
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        border: `2px solid ${C.border3}`,
        background: C.bg2,
      }}
    />
  );
}

function TypeBadge({ type }) {
  const isTest = type === "TEST";
  return (
    <span
      className="uppercase font-bold tracking-wider"
      style={{
        fontSize: 9,
        padding: "2px 6px",
        borderRadius: 4,
        background: isTest ? C.tealSoft : C.bg3,
        color: isTest ? C.teal : C.txt3,
      }}
    >
      {type}
    </span>
  );
}

function TierBtn({ active, color, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 rounded-md text-xs font-bold transition-all"
      style={
        active
          ? { background: color, color: "#fff", border: `1px solid ${color}` }
          : {
              background: C.bg2,
              color: C.txt2,
              border: `1px solid ${C.border2}`,
            }
      }
    >
      {children}
    </button>
  );
}

function StatBox({ value, label, color }) {
  return (
    <div
      className="text-center rounded-xl py-3"
      style={{ border: `1px solid ${C.border2}`, background: C.bg2 }}
    >
      <p className="font-bold text-xl" style={{ color }}>
        {value}
      </p>
      <p
        className="text-[10px] uppercase tracking-wide mt-0.5"
        style={{ color: C.txt3 }}
      >
        {label}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */

const BLANK_SYSTEM = {
  tag: "",
  name: "",
  location: "",
  phase: "L2 — current phase",
};

export default function NewProjectDetail() {
  const router = useRouter();
  const [systems, setSystems] = useState(SYSTEMS);
  const [system, setSystem] = useState(SYSTEMS[0]);
  const [phase, setPhase] = useState("L1");
  const [activeDiscipline, setActiveDiscipline] = useState("Mechanical");
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [showAddSystem, setShowAddSystem] = useState(false);
  const [newSystem, setNewSystem] = useState(BLANK_SYSTEM);

  const disciplines = Object.keys(items);
  const allItems = useMemo(
    () => disciplines.flatMap((d) => items[d]),
    [items, disciplines],
  );

  const gate = useMemo(() => {
    const work = allItems.filter((i) => i.type === "WORK");
    const tests = allItems.filter((i) => i.type === "TEST");
    const workDone = work.filter((i) => i.status === "done").length;
    const testDone = tests.filter((i) => i.status === "done").length;
    const flagged = allItems.filter((i) => i.status === "flag");
    const mitigating = flagged.filter((i) => i.tier === "Mitigating").length;
    const gatekeeping = flagged.filter((i) => i.tier === "Gatekeeping").length;
    const outstandingTests = tests.filter((i) => i.status !== "done");
    const blocked = outstandingTests.length > 0 || flagged.length > 0;
    return {
      workDone,
      workTotal: work.length,
      testDone,
      testTotal: tests.length,
      mitigating,
      gatekeeping,
      outstandingTests,
      flagged,
      blocked,
    };
  }, [allItems]);

  const updateItem = (discipline, id, patch) =>
    setItems((prev) => ({
      ...prev,
      [discipline]: prev[discipline].map((it) =>
        it.id === id ? { ...it, ...patch } : it,
      ),
    }));

  const removeItem = (discipline, id) =>
    setItems((prev) => ({
      ...prev,
      [discipline]: prev[discipline].filter((it) => it.id !== id),
    }));

  const addSystem = () => {
    const tag = newSystem.tag.trim() || "NEW-01";
    const name = newSystem.name.trim() || "New System";
    const label = `${tag} — ${name} — ${tag}`;
    setSystems((prev) => [label, ...prev]);
    setSystem(label);
    setNewSystem(BLANK_SYSTEM);
    setShowAddSystem(false);
  };

  const selectStyle = {
    background: C.bg2,
    border: `1.5px solid ${C.border3}`,
    color: C.txt,
    borderRadius: 10,
  };
  const inputStyle = {
    background: C.bg2,
    border: `1.5px solid ${C.border3}`,
    color: C.txt,
    borderRadius: 12,
  };
  const outlineBtn = {
    background: C.bg2,
    border: `1px solid ${C.border2}`,
    color: C.txt2,
  };

  return (
    <div className="min-h-screen font-gilroy p-6" style={{ color: C.txt }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <p
            className="uppercase tracking-wider mb-1"
            style={{ fontSize: 10, fontWeight: 700, color: C.txt3 }}
          >
            QA/QC · Commissioning · MSFT-DC1 · Atlanta
          </p>
          <h1 className="font-bold text-2xl">
            Cx Readiness — Findings &amp; Gate
          </h1>
          <p className="text-sm mt-1" style={{ color: C.txt2 }}>
            Drawing-driven verification with severity-tiered findings —
            mitigating vs gatekeeping
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            className="px-3 py-2 text-sm outline-none cursor-pointer"
            style={selectStyle}
          >
            {systems.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddSystem((v) => !v)}
            className="px-3.5 py-2 rounded-lg text-sm font-bold"
            style={{ background: C.accent, color: "#fff" }}
          >
            + New system
          </button>
          <button
            type="button"
            onClick={() => router.push("/drawingAnalyzer")}
            className="px-3.5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            style={outlineBtn}
          >
            ↻ From a drawing
          </button>
          <button
            type="button"
            onClick={() => router.push("/phaseQueue")}
            className="px-3.5 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            style={outlineBtn}
          >
            ↗ Phase Queue
          </button>
        </div>
      </div>

      {/* ── Add a system panel ───────────────────────────────── */}
      {showAddSystem && (
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: C.bg2, border: `1px solid ${C.border2}` }}
        >
          <p
            className="uppercase tracking-wider mb-3"
            style={{ fontSize: 10, fontWeight: 700, color: C.txt3 }}
          >
            Add a system / asset to MSFT-DC1 · Atlanta
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              placeholder="Tag (e.g. CHL-02)"
              value={newSystem.tag}
              onChange={(e) =>
                setNewSystem((p) => ({ ...p, tag: e.target.value }))
              }
              className="px-3.5 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
            <input
              placeholder="Name"
              value={newSystem.name}
              onChange={(e) =>
                setNewSystem((p) => ({ ...p, name: e.target.value }))
              }
              className="px-3.5 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
            <input
              placeholder="Hall / location"
              value={newSystem.location}
              onChange={(e) =>
                setNewSystem((p) => ({ ...p, location: e.target.value }))
              }
              className="px-3.5 py-2.5 text-sm outline-none"
              style={inputStyle}
            />
            <select
              value={newSystem.phase}
              onChange={(e) =>
                setNewSystem((p) => ({ ...p, phase: e.target.value }))
              }
              className="px-3.5 py-2.5 text-sm outline-none cursor-pointer"
              style={inputStyle}
            >
              {["L1", "L2", "L3", "L4", "L5"].map((l) => (
                <option key={l}>{l} — current phase</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={addSystem}
              className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: C.accent, color: "#fff" }}
            >
              Add system
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddSystem(false);
                setNewSystem(BLANK_SYSTEM);
              }}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: C.bg2,
                color: C.txt2,
                border: `1px solid ${C.border2}`,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── System info card ─────────────────────────────────── */}
      <div
        className="rounded-2xl p-5 mb-6"
        style={{ background: C.bg2, border: `1px solid ${C.border2}` }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <p
            className="uppercase tracking-wider"
            style={{ fontSize: 10, fontWeight: 700, color: C.txt3 }}
          >
            Chilled-Water System — CHL-01 · Mech-Yard · Sample Project P&amp;ID
            (Synthetic)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="uppercase tracking-wider"
              style={{ fontSize: 10, fontWeight: 700, color: C.txt3 }}
            >
              Phase
            </span>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-semibold outline-none cursor-pointer"
              style={selectStyle}
            >
              {["L1", "L2", "L3", "L4", "L5"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            {(() => {
              const t = PHASE_TAG[phase] || PHASE_TAG.L1;
              return (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    border: `1px solid ${t.color}`,
                    color: t.color,
                    background: C.bg2,
                  }}
                >
                  <span
                    className="rounded-full"
                    style={{
                      width: 6,
                      height: 6,
                      background: t.dot || t.color,
                      border: t.dotBorder ? `1px solid ${t.color}` : "none",
                    }}
                  />
                  {t.label}
                </span>
              );
            })()}
            <span className="text-xs" style={{ color: C.txt3 }}>
              L1 · FAT → L2 · Install
            </span>
            <button
              type="button"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
              style={outlineBtn}
            >
              Delete system
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {SYSTEM_TAGS.map((t) => (
            <Tag key={t.label} ok={t.ok} label={t.label} />
          ))}
        </div>
      </div>

      {/* ── Body: findings (left) + gate (right) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — findings */}
        <div className="lg:col-span-3">
          {/* Discipline tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {disciplines.map((d) => {
              const count = items[d].filter((i) => i.type === "WORK").length;
              const active = d === activeDiscipline;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDiscipline(d)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  style={
                    active
                      ? {
                          background: C.accent,
                          color: "#fff",
                          border: `1px solid ${C.accent}`,
                        }
                      : {
                          background: C.bg2,
                          color: C.txt2,
                          border: `1px solid ${C.border2}`,
                        }
                  }
                >
                  {d} · {count}
                </button>
              );
            })}
          </div>

          {/* Finding items */}
          <div className="flex flex-col gap-2.5">
            {items[activeDiscipline].map((it) => (
              <div
                key={it.id}
                className="rounded-2xl p-4"
                style={{ background: C.bg2, border: `1px solid ${C.border2}` }}
              >
                <div className="flex gap-3">
                  <StatusIcon status={it.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <TypeBadge type={it.type} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: C.accent }}
                      >
                        {it.ref}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: C.txt3 }}
                      >
                        {it.code}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: C.txt }}>
                      {it.text}
                    </p>

                    {it.note && (
                      <div
                        className="mt-3 rounded-xl p-3"
                        style={{
                          background: C.amberSoft,
                          border: `1px solid ${C.amberBorder}`,
                        }}
                      >
                        <p className="text-sm" style={{ color: C.amberText }}>
                          {it.note}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <span
                            className="uppercase tracking-wider mr-1"
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: C.amber,
                            }}
                          >
                            Tier
                          </span>
                          <TierBtn
                            active={it.tier === "Mitigating"}
                            color={C.amber}
                            onClick={() =>
                              updateItem(activeDiscipline, it.id, {
                                tier: "Mitigating",
                              })
                            }
                          >
                            Mitigating
                          </TierBtn>
                          <TierBtn
                            active={it.tier === "Gatekeeping"}
                            color={C.red}
                            onClick={() =>
                              updateItem(activeDiscipline, it.id, {
                                tier: "Gatekeeping",
                              })
                            }
                          >
                            Gatekeeping
                          </TierBtn>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(activeDiscipline, it.id, {
                                status: "done",
                                note: undefined,
                                tier: undefined,
                              })
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-bold"
                            style={{
                              background: C.bg2,
                              color: C.txt2,
                              border: `1px solid ${C.border2}`,
                            }}
                          >
                            Mark resolved
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(activeDiscipline, it.id)}
                    className="flex-shrink-0 text-lg leading-none"
                    style={{ color: C.txt3 }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="mt-3 text-sm font-bold"
            style={{ color: C.accent }}
          >
            + Add {activeDiscipline} item
          </button>
        </div>

        {/* Right — gate + legend */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Gate card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: C.bg2, border: `1px solid ${C.border2}` }}
          >
            <p
              className="uppercase tracking-wider mb-3"
              style={{ fontSize: 10, fontWeight: 700, color: C.txt3 }}
            >
              {phase} · FAT → L2 · Install Gate
            </p>

            <div
              className="rounded-2xl py-6 text-center mb-4"
              style={{ background: C.redSoft, border: `1px solid ${C.red}` }}
            >
              <p
                className="font-bold text-2xl tracking-wide"
                style={{ color: C.red }}
              >
                {gate.blocked ? "GATE BLOCKED" : "GATE OPEN"}
              </p>
              <p className="text-sm mt-1" style={{ color: C.txt2 }}>
                {gate.blocked
                  ? "Resolve items below before advancing"
                  : "All gate criteria met"}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              <StatBox
                value={`${gate.workDone}/${gate.workTotal}`}
                label="Work"
                color={C.accent}
              />
              <StatBox
                value={`${gate.testDone}/${gate.testTotal}`}
                label="Tests"
                color={C.txt3}
              />
              <StatBox
                value={gate.mitigating}
                label="Mitigating"
                color={C.amber}
              />
              <StatBox
                value={gate.gatekeeping}
                label="Gatekeeping"
                color={C.green}
              />
            </div>

            <div className="flex flex-col gap-2">
              {gate.outstandingTests.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: C.redSoft, color: C.red }}
                >
                  <span className="font-bold">✕</span>
                  Test outstanding: {t.ref} ({t.code})
                </div>
              ))}
              {gate.flagged.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                  style={{ background: C.amberSoft, color: C.amberText }}
                >
                  <span className="font-bold" style={{ color: C.amber }}>
                    !
                  </span>
                  Close before gate: {f.code} {f.ref}
                </div>
              ))}
            </div>
          </div>

          {/* Severity legend */}
          <div
            className="rounded-2xl p-5"
            style={{ background: C.bg2, border: `1px solid ${C.border2}` }}
          >
            <p
              className="uppercase tracking-wider mb-3"
              style={{ fontSize: 10, fontWeight: 700, color: C.txt3 }}
            >
              How severity works
            </p>
            <p className="text-sm mb-3" style={{ color: C.txt2 }}>
              <span className="font-bold" style={{ color: C.amber }}>
                Mitigating
              </span>{" "}
              — a real deviation found during construction. Informs the trade;
              does <strong>not</strong> create an Issue/NCR and does{" "}
              <strong>not</strong> block today, but must close before the gate.
            </p>
            <p className="text-sm" style={{ color: C.txt2 }}>
              <span className="font-bold" style={{ color: C.red }}>
                Gatekeeping
              </span>{" "}
              — escalates now: hard-blocks the gate and spawns an Issue/NCR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
