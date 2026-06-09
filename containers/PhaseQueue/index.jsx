"use client";

import { useMemo, useState } from "react";

/* Border tokens carry hex fallbacks (cx theme remap omits --rf-border*). */
const C = {
  txt: "var(--rf-txt, #08142e)",
  txt2: "var(--rf-txt2, #3a5070)",
  txt3: "var(--rf-txt3, #6b84a0)",
  bg2: "var(--rf-bg2, #ffffff)",
  bg3: "var(--rf-bg3, #e8f0fa)",
  border: "var(--rf-border, #c5d2ea)",
  border2: "var(--rf-border2, #adbbd8)",
  accent: "var(--rf-accent, #0070bb)",
  blue: "#2563eb",
  green: "#16a34a",
  greenSoft: "#ecfdf3",
  greenBorder: "#bbf7d0",
  amber: "#b45309",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  red: "#dc2626",
  redSoft: "#fef2f2",
  redBorder: "#fecaca",
};

const STATUS = {
  ready: { label: "Ready to Advance", color: C.green, soft: C.greenSoft, border: C.greenBorder },
  watch: { label: "Watch", color: C.amber, soft: C.amberSoft, border: C.amberBorder },
  blocked: { label: "Blocked", color: C.red, soft: C.redSoft, border: C.redBorder },
};

const ASSETS = [
  {
    tag: "UPS-01", loc: "UPS-Rm-A", phase: "L4 → L5", name: "Delta DPS 750kVA", status: "ready",
    checklists: "8/8", tests: "Pass", pssr: "approved", ncrs: 0, punch: 0,
    note: "All L4 items closed. Ready for L5 IST queue.",
  },
  {
    tag: "GEN-01", loc: "Yard-N", phase: "L4 → L5", name: "CAT 3516E 2.5MW", status: "ready",
    checklists: "6/6", tests: "Pass", pssr: "approved", ncrs: 0, punch: 0,
    note: "Cleared by CxA May 6.",
  },
  {
    tag: "PDU-01", loc: "DH-01", phase: "L4 → L5", name: "Delta InfraSuite", status: "ready",
    checklists: "7/7", tests: "Pass", pssr: "approved", ncrs: 0, punch: 0,
    note: "All L4 items closed.",
  },
  {
    tag: "CRAH-02", loc: "DH-01", phase: "L3 → L4", name: "Vertiv PCW 80kW", status: "ready",
    checklists: "5/5", tests: "Pass", pssr: "approved", ncrs: 0, punch: 0,
    note: "Energized and verified.",
  },
  {
    tag: "SWGR-A", loc: "Elec-Rm", phase: "L3 → L4", name: "Square D MV Switchgear", status: "ready",
    checklists: "9/9", tests: "Pass", pssr: "approved", ncrs: 0, punch: 0,
    note: "NETA primary injection complete.",
  },
  {
    tag: "CHL-01", loc: "Mech-Yard", phase: "L1 → L2", name: "Chilled-Water System", status: "watch",
    checklists: "5/8", tests: "Pending", pssr: "n/a", ncrs: 0, punch: 2,
    note: "2 mitigating findings open — close before gate.",
  },
  {
    tag: "ATS-01", loc: "Elec-Rm", phase: "L4 → L5", name: "ASCO 7000 4000A", status: "blocked",
    checklists: "4/7", tests: "Fail", pssr: "pending", ncrs: 1, punch: 3,
    note: "Transfer-time test failed retest. Open NCR-118.",
  },
  {
    tag: "BMS-01", loc: "Ctrl-Rm", phase: "L3 → L4", name: "Niagara JACE Network", status: "blocked",
    checklists: "6/10", tests: "Pending", pssr: "n/a", ncrs: 2, punch: 4,
    note: "I/O point verification incomplete. 2 open NCRs.",
  },
  {
    tag: "FALARM-1", loc: "DH-01", phase: "L4 → L5", name: "Notifier AFP-3030", status: "blocked",
    checklists: "5/9", tests: "Pending", pssr: "pending", ncrs: 1, punch: 1,
    note: "AHJ inspection not scheduled.",
  },
];

function Pill({ children }) {
  return (
    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: C.bg3, color: C.txt3 }}>
      {children}
    </span>
  );
}

function Metric({ value, label, color }) {
  return (
    <div className="text-center rounded-xl py-3" style={{ background: C.greenSoft, border: `1px solid ${C.greenBorder}` }}>
      <p className="font-bold text-sm" style={{ color: color || C.green }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide mt-0.5" style={{ color: C.txt3 }}>{label}</p>
    </div>
  );
}

export default function PhaseQueue() {
  const [filter, setFilter] = useState("all");

  const counts = useMemo(
    () => ({
      ready: ASSETS.filter((a) => a.status === "ready").length,
      watch: ASSETS.filter((a) => a.status === "watch").length,
      blocked: ASSETS.filter((a) => a.status === "blocked").length,
    }),
    [],
  );

  const FILTERS = [
    { key: "all", label: `All · ${ASSETS.length}` },
    { key: "ready", label: `Ready · ${counts.ready}` },
    { key: "watch", label: `Watch · ${counts.watch}` },
    { key: "blocked", label: `Blocked · ${counts.blocked}` },
  ];

  const visible = filter === "all" ? ASSETS : ASSETS.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen font-gilroy p-6" style={{ color: C.txt }}>
      <h1 className="font-bold text-2xl">Phase Advancement Queue</h1>
      <p className="text-sm mt-1 mb-5" style={{ color: C.txt2 }}>
        Assets ready or blocked from advancing to the next commissioning phase
      </p>

      {/* Summary tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {[
          { n: counts.ready, label: "Ready to advance", s: STATUS.ready },
          { n: counts.watch, label: "Watch / minor issues", s: STATUS.watch },
          { n: counts.blocked, label: "Blocked", s: STATUS.blocked },
        ].map((t) => (
          <div key={t.label} className="rounded-2xl py-6 text-center" style={{ background: t.s.soft, border: `1px solid ${t.s.border}` }}>
            <p className="font-bold text-3xl" style={{ color: t.s.color }}>{t.n}</p>
            <p className="text-sm mt-1" style={{ color: C.txt2 }}>{t.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
              style={
                active
                  ? { background: C.accent, color: "#fff", border: `1px solid ${C.accent}` }
                  : { background: C.bg2, color: C.txt2, border: `1px solid ${C.border2}` }
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Asset cards */}
      <div className="flex flex-col gap-4">
        {visible.map((a) => {
          const s = STATUS[a.status];
          return (
            <div key={a.tag} className="rounded-2xl p-5" style={{ background: C.bg2, border: `1px solid ${C.border2}` }}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base" style={{ color: C.blue }}>{a.tag}</span>
                    <Pill>{a.loc}</Pill>
                    <Pill>{a.phase}</Pill>
                  </div>
                  <p className="text-sm mt-1.5" style={{ color: C.txt2 }}>{a.name}</p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap"
                  style={{ background: s.soft, color: s.color, border: `1px solid ${s.border}` }}
                >
                  {s.label}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                <Metric value={a.checklists} label="Checklists" />
                <Metric value={a.tests} label="Tests" color={a.tests === "Fail" ? C.red : C.green} />
                <Metric value={a.pssr} label="PSSR" />
                <Metric value={a.ncrs} label="Open NCRs" color={a.ncrs > 0 ? C.red : C.green} />
                <Metric value={a.punch} label="Punch items" color={a.punch > 0 ? C.amber : C.green} />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                <p className="text-xs italic" style={{ color: C.txt3 }}>{a.note}</p>
                <button type="button" className="text-sm font-bold whitespace-nowrap" style={{ color: C.blue }}>
                  Findings &amp; Gate →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
