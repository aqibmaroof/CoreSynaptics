"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listV2Projects,
  getPlaybookSummary,
  advanceAssetPhase,
  revertAssetPhase,
  listLookahead,
  createLookahead,
  updateLookahead,
  removeLookahead,
  flagLookaheadConstraint,
  clearLookaheadConstraint,
  listTeamCompanies,
  revokeTeamCompany,
  listV2Stakeholders,
} from "../../services/CxProjectsV2";
import {
  getIssues,
  getIssueById,
  changeIssueStatus,
  verifyAndCloseIssue,
} from "../../services/Issues";
import { getUser } from "../../services/instance/tokenService";
import {
  getChecklists,
  changeChecklistStatus,
  signChecklist,
} from "../../services/Checklist";
import {
  listCommissioningTests,
  recordTestResult,
} from "../../services/CommissioningTests";
import { listMilestones } from "../../services/ScheduleMilestones";
import { getSubmittals } from "../../services/Submittals";
import { getTARFs } from "../../services/TARF";
import { getProcurementItems } from "../../services/Procurement";
import { getProjectFeed } from "../../services/OperationalFeed";
import { getDocuments } from "../../services/Documents";
import { getAllTasks, updateTask } from "../../services/Tasks";
import {
  listSafetyItems,
  createSafetyItem,
  removeSafetyItem,
} from "../../services/SafetyItems";

/* ================================================================== *
 * Project Playbook — the whole project on one screen, scoped to the
 * signed-in company type + role. Ported from the CxControl playbook.
 * Base surfaces use --rf-* tokens (with hex fallbacks so borders show in
 * the cx theme); semantic status colors are fixed hexes.
 * ================================================================== */

const P = {
  paper: "var(--rf-bg, #eef1f4)",
  card: "var(--rf-bg2, #ffffff)",
  soft: "var(--rf-bg3, #eef1f4)",
  ink: "var(--rf-txt, #111a24)",
  smoke: "var(--rf-txt3, #5c6773)",
  line: "var(--rf-border3, #d6dce2)",
  navy: "#0c447c",
  teal: "#0f7a5e",
  amber: "#b6791c",
  rust: "#b23b2e",
  electric: "#2563c9",
  violet: "#3b2a66",
};

const P_ALL = ["view", "create", "close", "advance", "verify", "admin"];
const R = (role, icon, blurb, perms) => ({ role, icon, blurb, perms });

const COMPANY_TYPES = {
  gc: {
    name: "General Contractor",
    roles: [
      R("Project Manager", "📋", "Full project view, all modules", P_ALL),
      R("MEP Superintendent", "🛠️", "MEP field oversight + QA/QC", [
        "view",
        "create",
        "close",
      ]),
      R("QA/QC Manager", "🔍", "Findings, gates, drawing checks", [
        "view",
        "create",
        "close",
        "verify",
      ]),
      R("Safety Manager", "🦺", "Safety program, AHAs, inspections", [
        "view",
        "create",
      ]),
      R("Foreman", "👷", "Crew lead, daily production", ["view", "create"]),
      R("Scheduler / Planner", "📅", "Schedule across the project", [
        "view",
        "create",
      ]),
      R("Subcontractor", "🔗", "Lane-scoped — admin defines access", ["view"]),
      R("Company Admin", "🔑", "Manages users & access", P_ALL),
    ],
  },
  cxa: {
    name: "Commissioning Authority (CxA)",
    roles: [
      R("Cx Lead", "✅", "Cx authority, gate sign-off", [
        "view",
        "create",
        "close",
        "advance",
        "verify",
        "admin",
      ]),
      R("Commissioning Agent", "🔎", "Phase advancement, witness points", [
        "view",
        "create",
        "close",
        "advance",
        "verify",
      ]),
      R("Cx PM", "📋", "Cx scope, schedule, reporting", ["view", "create"]),
      R("Cx Tech", "🧰", "Field witness & verification", ["view", "verify"]),
    ],
  },
  ec: {
    name: "Electrical Contractor",
    roles: [
      R("Electrical Lead", "⚡", "Electrical checklists & tests", [
        "view",
        "create",
        "close",
      ]),
      R("Project Manager", "📋", "EC scope, schedule, billing", [
        "view",
        "create",
        "close",
      ]),
      R("Field Engineer", "📐", "Terminations, QC, coordination", [
        "view",
        "create",
      ]),
      R("QC", "🔍", "Discipline quality checks", ["view", "create", "close"]),
      R("Company Admin", "🔑", "Manages users & access", P_ALL),
    ],
  },
  mc: {
    name: "Mechanical Contractor",
    roles: [
      R("Mechanical Lead", "🔧", "Mechanical checklists & tests", [
        "view",
        "create",
        "close",
      ]),
      R("Project Manager", "📋", "MC scope, schedule, billing", [
        "view",
        "create",
        "close",
      ]),
      R("Field Engineer", "📐", "Piping, QC, coordination", ["view", "create"]),
      R("QC", "🔍", "Discipline quality checks", ["view", "create", "close"]),
    ],
  },
  controls: {
    name: "Controls / BMS",
    roles: [
      R("Controls Lead", "🎛️", "Sensors, actuation, BMS", [
        "view",
        "create",
        "close",
      ]),
      R("BMS Integrator", "🖥️", "Point-to-point, integration", [
        "view",
        "create",
        "close",
      ]),
      R("Field Engineer", "📐", "I/O, terminations, QC", ["view", "create"]),
      R("QC", "🔍", "Points verification", ["view", "create", "close"]),
    ],
  },
  oem: {
    name: "OEM / Vendor",
    roles: [
      R("OEM Project Manager", "📋", "Unit status, integrator handoff", [
        "view",
        "create",
        "close",
      ]),
      R("Field Service Manager", "🗂️", "Tasks FSEs to sites, manpower", [
        "view",
        "create",
      ]),
      R("Field Service Engineer", "⚙️", "On-site startup, PFC, load bank", [
        "view",
        "create",
      ]),
      R("Logistics / Spares", "📦", "Shipping, RMA, parts to site", [
        "view",
        "create",
      ]),
      R("Scheduler / Planner", "📅", "FSE dispatch & forecast", [
        "view",
        "create",
      ]),
    ],
  },
  owner: {
    name: "Owner / Operator",
    roles: [
      R("Owner's Project Manager", "📋", "Owner-side delivery lead", [
        "view",
        "create",
        "close",
      ]),
      R("Construction Manager", "🏗️", "Owner's construction oversight", [
        "view",
        "create",
        "close",
      ]),
      R("Owner Representative", "🏢", "Oversight, scores, turnover", [
        "view",
        "close",
      ]),
      R("Facilities / Operations", "🏭", "Ops readiness & turnover", ["view"]),
      R("Owner's Cx Authority", "✅", "Owner-held Cx authority", [
        "view",
        "close",
        "advance",
        "verify",
      ]),
    ],
  },
  neta: {
    name: "NETA Testing",
    roles: [
      R("NETA Test Tech", "🔬", "Acceptance testing on gear", [
        "view",
        "create",
      ]),
      R("Project Manager", "📋", "Test scope & scheduling", [
        "view",
        "create",
        "close",
      ]),
      R("QC", "🔍", "Report QA, data review", ["view", "create", "close"]),
    ],
  },
  integrator: {
    name: "Integrator (Pod/Skid)",
    roles: [
      R("Integration PM", "🏗️", "Pod/skid build, FAT, ship to site", [
        "view",
        "create",
        "close",
      ]),
      R("Production / Shop Manager", "🏭", "Shop floor, throughput, schedule", [
        "view",
        "create",
      ]),
      R("QA/QC Inspector", "🔍", "In-shop QC + factory acceptance", [
        "view",
        "create",
        "close",
        "verify",
      ]),
      R("Logistics / Shipping", "📦", "Crating, transport, delivery", [
        "view",
        "create",
      ]),
    ],
  },
  fls: {
    name: "Fire / Life Safety",
    roles: [
      R("FLS PM", "🧯", "Fire alarm / suppression scope", [
        "view",
        "create",
        "close",
      ]),
      R("Fire Alarm Technician", "🚨", "FACP install + programming", [
        "view",
        "create",
      ]),
      R("NICET Technician", "📋", "Certified test / inspection (ITM)", [
        "view",
        "create",
        "verify",
      ]),
      R("Inspector", "🔍", "AHJ inspections, acceptance", ["view", "verify"]),
    ],
  },
  security: {
    name: "Security / Access",
    roles: [
      R("Security PM", "🛡️", "CCTV / access control scope", [
        "view",
        "create",
        "close",
      ]),
      R("Access Control Technician", "🚪", "Door controllers, readers, locks", [
        "view",
        "create",
      ]),
      R(
        "Security Systems Programmer",
        "💻",
        "Head-end, integration, credentials",
        ["view", "create"],
      ),
    ],
  },
  staffing: {
    name: "Staffing / Labor",
    roles: [
      R("Account Manager", "🤝", "Client accounts, fulfillment", [
        "view",
        "create",
      ]),
      R("Dispatcher / Coordinator", "📞", "Assign & dispatch labor to sites", [
        "view",
        "create",
      ]),
      R("Field Supervisor", "👷", "On-site oversight of placed crews", [
        "view",
        "create",
      ]),
    ],
  },
};

const MODULES = [
  { id: "overview", ic: "◎", name: "Project Overview", types: "all" },
  { id: "activity", ic: "▤", name: "Activity / Updates", types: "all" },
  { id: "completion", ic: "◇", name: "To Completion", types: "all" },
  { id: "mypart", ic: "⌖", name: "Your Part", types: "all" },
  { id: "schedule", ic: "▦", name: "Schedule & Milestones", types: "all" },
  {
    id: "lookahead",
    ic: "▥",
    name: "6-Week Lookahead",
    types: [
      "gc",
      "ec",
      "mc",
      "controls",
      "oem",
      "neta",
      "fls",
      "security",
      "integrator",
      "staffing",
    ],
  },
  { id: "readiness", ic: "◈", name: "Equipment Readiness", types: "all" },
  { id: "issues", ic: "⚠", name: "Issues / NCRs", types: "all", hot: true },
  { id: "punch", ic: "☑", name: "Punch List", types: "all" },
  { id: "holds", ic: "⊘", name: "Hold Points", types: ["gc", "cxa", "owner"] },
  // {
  //   id: "tests",
  //   ic: "⚗",
  //   name: "Test Records",
  //   types: ["gc", "cxa", "ec", "mc", "controls", "neta", "owner"],
  // },
  { id: "drawings", ic: "▧", name: "Drawings & P&ID", types: "all" },
  {
    id: "submittals",
    ic: "▣",
    name: "Submittals",
    types: ["gc", "cxa", "ec", "mc", "controls", "oem", "owner"],
  },
  // Commented out per request — these steps are hidden for now.
  // {
  //   id: "fsr",
  //   ic: "▢",
  //   name: "Field Service Reports",
  //   types: ["oem", "cxa", "gc", "owner"],
  // },
  // {
  //   id: "manpower",
  //   ic: "⚒",
  //   name: "Manpower / Crew",
  //   types: ["gc", "ec", "mc", "controls", "oem", "staffing", "integrator"],
  // },
  {
    id: "procurement",
    ic: "▦",
    name: "Procurement / Long-Lead",
    types: ["gc", "oem", "owner", "integrator", "ec", "mc", "controls"],
  },
  {
    id: "tarf",
    ic: "▭",
    name: "Site Arrivals (TARF)",
    types: [
      "gc",
      "ec",
      "mc",
      "controls",
      "oem",
      "neta",
      "fls",
      "security",
      "staffing",
      "integrator",
    ],
  },
  { id: "safety", ic: "✚", name: "Safety", types: "all", hot: true },
  { id: "team", ic: "▥", name: "Project Team", types: "all" },
  { id: "stakeholders", ic: "⬡", name: "Key Stakeholders", types: "all" },
  {
    id: "turnover",
    ic: "✦",
    name: "Turnover & Acceptance",
    types: ["gc", "cxa", "owner"],
  },
];

const LIFECYCLE = [
  { ph: "L1", nm: "FAT", meta: "Factory acceptance — cleared to ship" },
  { ph: "L2", nm: "Install", meta: "Receipt & installation verified" },
  { ph: "L3", nm: "Energize", meta: "Energization readiness & PFC" },
  { ph: "L4", nm: "Functional", meta: "Load bank / fault scenarios" },
  { ph: "L5", nm: "Integrated (IST)", meta: "System-level integrated test" },
  { ph: "L6", nm: "Turnover", meta: "O&M, training, acceptance" },
];
const PHASES = ["L1", "L2", "L3", "L4", "L5"];

const PART = {
  gc: {
    owns: ["L2", "L6"],
    role: "Runs the project",
    recv: "Design, submittals, and trade mobilization",
    does: "Coordinates site, sequences trades, verifies L2 install, manages punch & schedule",
    hand: "Assembled turnover package → Owner; controls who else is invited & what they access",
  },
  cxa: {
    owns: ["L4", "L5"],
    role: "Independent verification & gate authority",
    recv: "Completed checklists & test data from the trades",
    does: "Witnesses L4, leads L5 IST, dispositions NCRs, signs off each phase gate",
    hand: "Verified gates → next phase; commissioning certificate → Owner",
  },
  ec: {
    owns: ["L3"],
    role: "Power distribution",
    recv: "Installed gear from GC / integrator (L2 complete)",
    does: "Terminations, torque, megger, energization readiness",
    hand: "Energized gear → OEM for PFC and NETA for acceptance testing",
  },
  mc: {
    owns: ["L2"],
    role: "Cooling & piping",
    recv: "Delivered mechanical equipment",
    does: "Sets equipment, piping, P&ID verification, pressure test",
    hand: "Installed mechanical → EC/Controls and CxA for verification",
  },
  controls: {
    owns: ["L5"],
    role: "Integration brain",
    recv: "Energized equipment + field devices from EC/MC",
    does: "Point-to-point, BMS/DCIM integration, alarm mapping",
    hand: "Integrated system → CxA for L5 IST",
  },
  oem: {
    owns: ["L1", "L4"],
    role: "Equipment maker & startup",
    recv: "Installed + energized unit (L3 complete)",
    does: "FAT (L1), PFC, OEM startup (L4), load bank",
    hand: "Started-up unit → CxA (L4 witness) and Controls (L5 integration)",
  },
  owner: {
    owns: ["L6"],
    role: "Final acceptance",
    recv: "Turnover package from GC + commissioning cert from CxA",
    does: "Reviews scores, ops-readiness walk, O&M training",
    hand: "Signed customer acceptance — project closeout",
  },
  neta: {
    owns: ["L3"],
    role: "Acceptance testing",
    recv: "Energized gear from EC",
    does: "NETA acceptance tests, protective relay, insulation",
    hand: "NETA reports → EC/CxA (releases the energization hold points)",
  },
  integrator: {
    owns: ["L1"],
    role: "Pod/skid builder",
    recv: "OEM units + integration BOM",
    does: "Builds pod/skid, in-shop QC, factory acceptance test",
    hand: "Integrated pod → site for GC L2 install",
  },
  fls: {
    owns: ["L4"],
    role: "Fire / life safety",
    recv: "Building & devices ready",
    does: "FACP install, programming, NICET ITM testing",
    hand: "FLS acceptance → CxA and AHJ inspection",
  },
  security: {
    owns: ["L5"],
    role: "Access & surveillance",
    recv: "Building & network ready",
    does: "Access control, CCTV, head-end integration",
    hand: "Security acceptance → Owner / Facilities",
  },
  staffing: {
    owns: ["L1"],
    role: "Skilled labor supply",
    recv: "Manpower requests & forecast from the trades",
    does: "Sources, vets, dispatches skilled crews to site",
    hand: "Placed crews → GC / trade contractors",
  },
};

const DISC_CT = {
  Electrical: "ec",
  Mechanical: "mc",
  Controls: "controls",
  BMS: "controls",
  Fire: "fls",
  Plumbing: "mc",
};
const ROLE_CT = {
  OEM: "oem",
  GC: "gc",
  EC: "ec",
  MC: "mc",
  BMS: "controls",
  NETA: "neta",
  CXA: "cxa",
  FIRE: "fls",
  TAB: "mc",
  LOADBANK: "ec",
};
const TRADE_OF = {
  gc: "GC",
  ec: "EC",
  mc: "MC",
  controls: "Controls",
  oem: "OEM",
  neta: "NETA",
  fls: "FIRE",
  cxa: "CXA",
};
const ctName = (k) => (COMPANY_TYPES[k] || {}).name || k;

const FOCUS = {
  gc: [
    "Overall schedule vs. milestones — are we on track for turnover",
    "Which trade is behind / holding a gate right now",
    "Open NCRs & punch across ALL trades, by accountable company",
    "Turnover-package readiness as L5 closes",
  ],
  cxa: [
    "Gate readiness per asset/system — can I sign this phase off",
    "Checklists verified vs. failed (evidence complete?)",
    "NCR disposition + open hold points",
    "Witness points & IST scheduled and witnessed",
  ],
  ec: [
    "My electrical checklists & energization readiness",
    "Megger / torque / phase-rotation records on file",
    "Open electrical NCRs & punch in my lane",
    "NETA hold points blocking energization",
  ],
  mc: [
    "Mechanical install & P&ID verification status",
    "Pressure-test / flush records complete",
    "Open mechanical punch & deficiencies",
    "Chilled-water / cooling readiness for IST",
  ],
  controls: [
    "Point-to-point progress (every sensor/actuator)",
    "Alarm points mapped vs. points list",
    "Integration NCRs & comms faults",
    "BMS/DCIM ready for L5 IST",
  ],
  oem: [
    "Where each of my units sits by phase (serial-by-serial)",
    "FSE dispatch & manpower vs. the GC schedule",
    "FSRs published; PFC / startup / load-bank done",
    "RMA / spares queue and warranty start dates",
  ],
  owner: [
    "% commissioned (L5) and the overall Cx score",
    "Outstanding gating items — what stands between me and acceptance",
    "Turnover package readiness (the 7 sections)",
    "Acceptance criteria met — ready for blue tag",
  ],
  neta: [
    "Which gear is energized and ready for acceptance testing",
    "Test requirements vs. results",
    "Report QA / data review before submission",
    "Hold points my reports release",
  ],
  integrator: [
    "Build & FAT status per pod/skid",
    "Shop throughput & ship dates vs. site need",
    "In-shop QC + factory acceptance results",
    "Integration BOM & long-lead items",
  ],
  fls: [
    "Device install & FACP programming progress",
    "NICET ITM test results",
    "AHJ inspection status",
    "FLS acceptance sign-off",
  ],
  security: [
    "Access-control & CCTV install progress",
    "Head-end integration & credentials",
    "Coverage / commissioning acceptance",
    "Handoff to Facilities",
  ],
  staffing: [
    "Open manpower requests vs. forecast",
    "Placements by site & trade",
    "Certs / onboarding / safety compliance",
    "Dispatch coverage gaps",
  ],
};

let _id = 0;
const nid = (p) => `${p}${(_id += 1)}`;
// All project-detail data is loaded from the Playbook V2 APIs (see refresh()).
// This skeleton only provides the shape so the UI renders empty states before
// the fetch resolves — no static/demo data.
const SEED = {
  project: { name: "", phase: "" },
  identity: null,
  activity: [],
  tasks: [],
  equipment: [],
  systems: [],
  checklists: [],
  findings: [],
  punchList: [],
  holdPoints: [],
  tests: [],
  milestones: [],
  stakeholders: [],
  safety: [],
  procurement: [],
  tarf: [],
  fieldProgress: [],
  lookahead: [],
  drawings: [],
  submittals: [],
  team: [],
  rail: [
    "overview",
    "activity",
    "completion",
    "lookahead",
    "mypart",
    "schedule",
    "readiness",
    "issues",
    "punch",
    "procurement",
    "tarf",
    "safety",
    "drawings",
    "submittals",
    "team",
    "stakeholders",
  ],
};

const isDone = (s) => s === "complete" || s === "verified";
const isOpen = (s) => s !== "resolved" && s !== "closed";
const isGate = (f) =>
  f.type === "NCR" ||
  f.type === "HoldPoint" ||
  f.sev === "Critical" ||
  f.sev === "Major";

function unit(db, val) {
  const [k, id] = (val || "").split(":");
  if (k === "sys") {
    const s = db.systems.find((x) => x.id === id);
    return {
      kind: "system",
      id,
      name: s ? s.name : id,
      ids: db.equipment.filter((e) => e.sys === id).map((e) => e.id),
    };
  }
  const e = db.equipment.find((x) => x.id === id);
  return {
    kind: "equipment",
    id,
    name: e ? `${e.id} — ${e.name}` : id,
    ids: id ? [id] : [],
    eq: e,
  };
}
function gateOf(db, u) {
  const cls = db.checklists.filter((c) => u.ids.includes(c.eq));
  const open = db.findings.filter(
    (f) => u.ids.includes(f.eq) && isOpen(f.status),
  );
  const gk = open.filter(isGate);
  const mit = open.filter((f) => !isGate(f));
  const phase =
    u.kind === "system"
      ? PHASES[
          Math.min(
            ...u.ids.map((id) => {
              const e = db.equipment.find((x) => x.id === id);
              return PHASES.indexOf(e ? e.phase : "L1");
            }),
          )
        ]
      : u.eq
        ? u.eq.phase
        : "L1";
  const phaseCls = cls.filter((c) => c.level === phase);
  const workDone = phaseCls.filter((c) => isDone(c.status)).length;
  const failed = cls.filter((c) => c.status === "failed");
  const tests = db.tests.filter((t) => u.ids.includes(t.eq));
  const blocked =
    gk.length > 0 ||
    failed.length > 0 ||
    (phaseCls.length > 0 && workDone < phaseCls.length);
  return {
    cls,
    open,
    gk,
    mit,
    phase,
    phaseCls,
    workDone,
    failed,
    tests,
    blocked,
  };
}
const gateAll = (db) => {
  const open = db.findings.filter((f) => isOpen(f.status));
  return { gk: open.filter(isGate), mit: open.filter((f) => !isGate(f)) };
};

/* ------------------------------ atoms ------------------------------ */
const eyebrow = {
  fontFamily: "monospace",
  fontSize: 9,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: P.smoke,
};
const PILL = {
  lvl: { background: P.soft, color: P.smoke, border: `1px solid ${P.line}` },
  role: { background: "#eaf1fa", color: P.navy },
  crit: { background: P.rust, color: "#fff" },
  major: { background: "#d9682e", color: "#fff" },
  minor: { background: P.amber, color: "#fff" },
  ncr: { background: "#7a1f18", color: "#fff" },
  hold: { background: P.violet, color: "#fff" },
  punch: { background: P.amber, color: "#fff" },
};
function Pill({ kind = "lvl", children, title }) {
  return (
    <span
      title={title}
      className="font-mono font-bold"
      style={{
        fontSize: 9,
        padding: "2px 7px",
        borderRadius: 6,
        whiteSpace: "nowrap",
        ...PILL[kind],
      }}
    >
      {children}
    </span>
  );
}
const STCLR = {
  not_started: P.smoke,
  in_progress: P.electric,
  complete: P.teal,
  verified: P.teal,
  failed: P.rust,
};
function St({ s, children }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 10,
        color: STCLR[s] || P.smoke,
        fontWeight:
          s === "complete" || s === "verified" || s === "failed" ? 700 : 400,
      }}
    >
      {children ?? String(s).replace("_", " ")}
    </span>
  );
}
function Card({ children, style }) {
  return (
    <div
      style={{
        background: P.card,
        border: `1px solid ${P.line}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
function SectLab({ children, style }) {
  return (
    <div style={{ ...eyebrow, fontSize: 9, margin: "2px 0 9px", ...style }}>
      {children}
    </div>
  );
}
function Row({ children, style }) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        padding: "9px 4px",
        borderTop: `1px solid ${P.line}`,
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
const Grow = ({ children }) => (
  <span className="flex-1 min-w-0 truncate">{children}</span>
);
function Kpi({ v, l, tone }) {
  const c =
    tone === "bad"
      ? P.rust
      : tone === "warn"
        ? P.amber
        : tone === "good"
          ? P.teal
          : P.ink;
  return (
    <div
      style={{
        border: `1px solid ${P.line}`,
        borderRadius: 10,
        padding: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 23, fontWeight: 800, lineHeight: 1, color: c }}>
        {v}
      </div>
      <div style={{ ...eyebrow, fontSize: 8, marginTop: 4 }}>{l}</div>
    </div>
  );
}
const Kpis = ({ children }) => (
  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
    {children}
  </div>
);
function Mark({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono"
      style={{
        fontSize: 10,
        color: P.teal,
        border: "1px solid #bee0d3",
        borderRadius: 6,
        padding: "2px 7px",
        background: "#f3faf7",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
const Empty = ({ children }) => (
  <div style={{ color: P.smoke, fontSize: 12, padding: "14px 4px" }}>
    {children}
  </div>
);
function LockMsg({ children, style }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: P.smoke,
        background: P.soft,
        border: `1px solid ${P.line}`,
        borderRadius: 9,
        padding: 11,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ============================== component ============================== */
export default function NewProjectDetail() {
  const [db, setDb] = useState(() => structuredClone(SEED));
  const [ct, setCt] = useState("gc");
  const [ri, setRi] = useState(0);
  const [mod, setMod] = useState("overview");
  const [sel, setSel] = useState(null);
  const [mode, setMode] = useState("project");
  const [actf, setActf] = useState("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [laAdd, setLaAdd] = useState(null); // { wk, trade, area } when add-activity modal open
  const [toast, setToast] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [safetyTab, setSafetyTab] = useState("CERTIFICATION");
  // controlled inline add-form for the active Safety tab
  const [safetyForm, setSafetyForm] = useState({
    title: "",
    workerName: "",
    companyTrade: "",
    issuedAt: "",
    expiresAt: "",
  });

  const role = COMPANY_TYPES[ct].roles[ri] || COMPANY_TYPES[ct].roles[0];
  const can = (p) => (mode === "standalone" ? true : role.perms.includes(p));
  const moduleAllowed = (m) =>
    mode === "standalone" ? true : m.types === "all" || m.types.includes(ct);
  const flash = (m) => {
    setToast(m);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(""), 1700);
  };
  const mutate = (fn) =>
    setDb((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  /* ---------- backend integration (Playbook V2 APIs) ---------- */
  const norm = (r) => r?.data ?? r;
  const isoMonday = (d = new Date()) => {
    const x = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    const day = x.getUTCDay();
    x.setUTCDate(x.getUTCDate() + (day === 0 ? -6 : 1 - day));
    return x;
  };
  const ago = (ts) => {
    const ms = Date.now() - new Date(ts).getTime();
    const m = Math.floor(ms / 60000),
      h = Math.floor(ms / 3600000),
      dy = Math.floor(ms / 86400000);
    return dy > 0
      ? `${dy}d ago`
      : h > 0
        ? `${h}h ago`
        : m > 0
          ? `${m}m ago`
          : "just now";
  };
  const CHK_FROM = {
    NOT_STARTED: "not_started",
    IN_PROGRESS: "in_progress",
    COMPLETED: "complete",
    VERIFIED: "verified",
  };
  const CHK_TO = {
    not_started: "NOT_STARTED",
    in_progress: "IN_PROGRESS",
    complete: "COMPLETED",
    verified: "VERIFIED",
  };
  const FND_TYPE = {
    NCR: "NCR",
    HOLD_POINT: "HoldPoint",
    WITNESS_POINT: "HoldPoint",
    PUNCH_LIST: "Punch",
    SNAG: "Deficiency",
    GENERAL: "Deficiency",
  };
  const SEV_FROM = {
    CRITICAL: "Critical",
    HIGH: "Major",
    MEDIUM: "Minor",
    LOW: "Minor",
  };
  const CHKTYPE_ROLE = {
    VENDOR: "OEM",
    GC: "GC",
    CX_AGENT: "CXA",
    TRADE: "TRADE",
    INTERNAL: "GC",
  };
  const TASK_FROM = {
    PENDING: "open",
    IN_PROGRESS: "in_progress",
    COMPLETED: "done",
  };
  const TASK_TO = {
    open: "PENDING",
    in_progress: "IN_PROGRESS",
    done: "COMPLETED",
  };

  const refresh = async (pid) => {
    const [
      summaryR,
      issuesR,
      chksR,
      testsR,
      laR,
      teamR,
      stakeR,
      milesR,
      subsR,
      tarfR,
      procR,
      feedR,
      tasksR,
      punchR,
      holdsR,
      docsR,
      safetyR,
    ] = await Promise.allSettled([
      getPlaybookSummary(pid),
      getIssues({ projectId: pid, limit: 100 }),
      getChecklists({ cxProjectId: pid }),
      listCommissioningTests({ cxProjectId: pid, limit: 100 }),
      listLookahead(pid, { limit: 200 }),
      listTeamCompanies(pid),
      listV2Stakeholders(pid),
      listMilestones({ projectId: pid }),
      getSubmittals({ cxProjectId: pid, limit: 100 }),
      getTARFs({ cxProjectId: pid }),
      getProcurementItems({ projectId: pid }),
      getProjectFeed(pid, { limit: 50 }),
      getAllTasks({ projectId: pid }),
      // Punch list + hold points are the same Issues resource, kind-scoped.
      getIssues({ projectId: pid, kind: "PUNCH_LIST", limit: 100 }),
      getIssues({ projectId: pid, kind: "HOLD_POINT", limit: 100 }),
      // Uploaded files (Document model), org- and project-scoped server-side.
      getDocuments({ cxProjectId: pid }),
      // Project safety items (cert / PTP / inspection / lift plan / SDS / orientation).
      listSafetyItems(pid),
    ]);
    const val = (r, fb) =>
      r.status === "fulfilled" ? (norm(r.value) ?? fb) : fb;
    const rows = (r) => {
      const v = val(r, []);
      // `entries` covers the operational-feed shape ({ entries, nextCursor }).
      return Array.isArray(v) ? v : (v?.data ?? v?.items ?? v?.entries ?? []);
    };

    const summary = val(summaryR, null);
    if (!summary) {
      flash("Could not load project playbook");
      // data load settled
      return;
    }

    // equipment: display code per asset, keep assetId for API calls
    const codeCount = {};
    const equipment = (summary.equipmentGlance ?? []).map((a) => {
      codeCount[a.abbr] = (codeCount[a.abbr] ?? 0) + 1;
      const code =
        codeCount[a.abbr] > 1
          ? `${a.abbr}-${String(codeCount[a.abbr]).padStart(2, "0")}`
          : a.abbr;
      return {
        id: code,
        assetId: a.assetId,
        name: a.name,
        disc: a.assetType,
        sys: null,
        phase: a.currentPhase,
        furnish: a.procurementOwner,
        blocked: a.blocked,
      };
    });
    const codeOf = {};
    equipment.forEach((e) => {
      codeOf[e.assetId] = e.id;
    });
    const eq = (projectAssetId) =>
      (projectAssetId && codeOf[projectAssetId]) || "—";
    const discOf = (projectAssetId) =>
      equipment.find((e) => e.assetId === projectAssetId)?.disc ?? "Electrical";

    // Shared mapping: raw Issue → the finding shape these modules render.
    const toFinding = (f) => ({
      id: f.id,
      eq: eq(f.projectAssetId),
      type: FND_TYPE[f.kind] ?? "Deficiency",
      sev: SEV_FROM[f.severity] ?? "Minor",
      title: f.title,
      status: f.status === "CLOSED" ? "resolved" : "open",
      disc: discOf(f.projectAssetId),
    });

    const monday = isoMonday();
    const next = {
      project: { name: summary.projectName, phase: summary.projectPhase },
      identity: summary.identity ?? null,
      rail: summary.rail?.moduleOrder?.length
        ? summary.rail.moduleOrder
        : structuredClone(SEED.rail),
      fieldProgress: (summary.tradeProgress ?? []).map((t) => ({
        disc: t.trade,
        pct: t.pct,
        note: t.note ?? "",
      })),
      equipment,
      systems: [],
      checklists: rows(chksR).map((c) => ({
        id: c.id,
        eq: eq(c.projectAssetId),
        level: c.phase === "NONE" ? "L1" : c.phase,
        role: CHKTYPE_ROLE[c.checklistType] ?? "GC",
        name: c.title,
        status: CHK_FROM[c.status] ?? "not_started",
      })),
      findings: rows(issuesR).map(toFinding),
      punchList: rows(punchR).map(toFinding),
      holdPoints: rows(holdsR).map(toFinding),
      tests: rows(testsR).map((t) => ({
        id: t.id,
        eq: eq(t.projectAssetId),
        name: t.testName,
        status: t.result === "PASS" ? "passed" : "pending",
      })),
      lookahead: rows(laR).map((a) => {
        const wk =
          Math.round(
            (new Date(a.weekStartDate).getTime() - monday.getTime()) /
              (7 * 86400000),
          ) + 1;
        return {
          id: a.id,
          wk: Math.min(6, Math.max(1, wk)),
          trade: a.trade,
          area: a.description,
          pct: a.pct,
          status: (a.status ?? "PLANNED").toLowerCase(),
          blocked: !!a.blocked,
          constraint: a.constraintNote ?? "",
        };
      }),
      team: [
        {
          ct: "gc",
          company: summary.lens?.isHost
            ? "Your organization (host)"
            : "Host organization",
          role: "GC — runs the project",
          access: "Full control",
          status: "host",
        },
        ...(val(teamR, []) ?? [])
          .filter((m) => m.status !== "REVOKED")
          .map((m) => ({
            membershipId: m.id,
            ct: (m.companyType ?? "gc").toLowerCase(),
            company: m.companyName,
            role: m.companyRole,
            access: `${m.companyRole} scope`,
            status: (m.status ?? "active").toLowerCase(),
          })),
      ],
      stakeholders: (val(stakeR, []) ?? []).map((s) => ({
        nm: s.name,
        sc: s.role ?? "",
        own: s.company ?? "",
      })),
      milestones: rows(milesR).map((m) => ({
        d: m.date ? String(m.date).slice(0, 10) : "TBD",
        ph: m.type ?? "",
        name: m.name,
        status: m.date && new Date(m.date) < new Date() ? "done" : "todo",
      })),
      submittals: rows(subsR).map((s) => ({
        name: s.title ?? s.name,
        eq: "",
        by: s.specSection ?? "",
        status: s.status ?? "",
      })),
      tarf: rows(tarfR).map((t) => ({
        crew: t.personName ?? t.crew,
        co: t.companyName ?? "",
        date: t.expectedStart ? String(t.expectedStart).slice(0, 10) : "",
        badge: t.approvalStage ?? "",
        orient: t.safetyOrientationComplete ? "Complete" : "Pending",
      })),
      procurement: rows(procR).map((p) => ({
        item: p.itemName ?? p.name ?? p.title ?? "Item",
        vendor: p.vendorName ?? "",
        po: p.poNumber ?? "",
        furnish: p.ownership ?? p.furnish ?? "",
        status: p.status ?? "",
        need: p.expectedDelivery ? String(p.expectedDelivery).slice(0, 10) : "",
      })),
      activity: rows(feedR).map((e) => ({
        when: ago(e.createdAt ?? Date.now()),
        // Operational-feed entries nest the actor under `actor`.
        who: e.actor?.displayName ?? e.actorDisplayName ?? "system",
        ct: (
          e.actor?.companyCode ??
          e.actorCompanyCode ??
          "gc"
        ).toLowerCase(),
        text: [e.action, e.target].filter(Boolean).join(" — "),
      })),
      tasks: rows(tasksR).map((t) => ({
        id: t.id,
        ct: ct,
        title: t.title,
        due: t.dueDate ? String(t.dueDate).slice(0, 10) : "",
        status: TASK_FROM[t.status] ?? "open",
      })),
      drawings: rows(docsR).map((d) => ({
        id: d.id,
        name: d.title || d.fileName,
        type: d.category ?? "GENERAL",
        eq: eq(d.assetId),
        verified: d.status === "VERIFIED" || d.status === "APPROVED",
      })),
      safety: rows(safetyR).map((s) => ({
        id: s.id,
        kind: s.kind,
        title: s.title,
        workerName: s.workerName || "",
        companyTrade: s.companyTrade || "",
        status: s.status,
        issuedAt: s.issuedAt ? String(s.issuedAt).slice(0, 10) : "",
        expiresAt: s.expiresAt ? String(s.expiresAt).slice(0, 10) : "",
        projectAssetId: s.projectAssetId || null,
        attachments: s.attachments || [],
      })),
    };
    setDb((prev) => ({ ...structuredClone(SEED), ...prev, ...next }));
    if (summary.lens?.companyType) {
      const lens = summary.lens.companyType.toLowerCase();
      if (COMPANY_TYPES[lens]) setCt(lens);
    }
    // data load settled
  };

  useEffect(() => {
    (async () => {
      try {
        const fromUrl = new URLSearchParams(window.location.search).get("id");
        let pid = fromUrl;
        if (!pid) {
          const list = norm(await listV2Projects({ limit: 1 }));
          pid = (list?.data ?? list ?? [])[0]?.id ?? null;
        }
        if (!pid) {
          flash("No V2 project found — create one from the Projects wizard");
          // data load settled
          return;
        }
        setProjectId(pid);
        await refresh(pid);
      } catch {
        flash("Could not load project playbook");
        // data load settled
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ci = PHASES.indexOf(db.project.phase);
  const g = useMemo(() => gateAll(db), [db]);
  const defaultSel = db.equipment[0] ? `eq:${db.equipment[0].id}` : "";
  const SELV = sel || defaultSel;

  // Equipment Readiness — fetch a single asset's checklists straight from the
  // Checklist API (scoped to this project + asset) and merge them into
  // db.checklists, keyed by the asset's display code, so the Readiness card,
  // status dropdown, and gate logic all reflect the live, asset-scoped list.
  // Reused after a status change to re-sync with the server's latest state.
  const loadChecklistsFor = (assetId, code) =>
    getChecklists({ cxProjectId: projectId, assetId })
      .then((res) => {
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : (data?.data ?? data?.items ?? []);
        const mapped = list.map((c) => ({
          id: c.id,
          eq: code,
          level: c.phase === "NONE" ? "L1" : c.phase,
          role: CHKTYPE_ROLE[c.checklistType] ?? "GC",
          name: c.title,
          status: CHK_FROM[c.status] ?? "not_started",
        }));
        setDb((prev) => ({
          ...prev,
          checklists: [
            ...prev.checklists.filter((x) => x.eq !== code),
            ...mapped,
          ],
        }));
      })
      .catch(() => {});

  useEffect(() => {
    if (mod !== "readiness" || !projectId) return;
    const u = unit(db, SELV);
    if (u.kind !== "equipment" || !u.eq?.assetId) return;
    loadChecklistsFor(u.eq.assetId, u.eq.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mod, SELV, projectId]);

  // Re-pull the operational feed whenever the Activity panel is opened, so
  // newly-recorded actions (added/updated/removed safety item, gate moves, …)
  // show up without a full page reload. Outbox dispatch is async (~5s), so we
  // fetch on open and again shortly after to catch the just-dispatched rows.
  useEffect(() => {
    if (mod !== "activity" || !projectId) return;
    let alive = true;
    const pull = async () => {
      try {
        const feed = norm(await getProjectFeed(projectId, { limit: 50 }));
        const entries = Array.isArray(feed)
          ? feed
          : (feed?.entries ?? feed?.data ?? feed?.items ?? []);
        if (!alive) return;
        mutate((d) => {
          d.activity = entries.map((e) => ({
            when: ago(e.createdAt ?? Date.now()),
            who: e.actor?.displayName ?? e.actorDisplayName ?? "system",
            ct: (e.actor?.companyCode ?? e.actorCompanyCode ?? "gc").toLowerCase(),
            text: [e.action, e.target].filter(Boolean).join(" — "),
          }));
        });
      } catch {
        // non-fatal — keep whatever activity we already have
      }
    };
    pull();
    const t = setTimeout(pull, 6000); // catch the next outbox dispatch tick
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [mod, projectId]);

  const counts = {
    issues: g.gk.length,
    punch: (db.punchList ?? []).filter((f) => isOpen(f.status)).length,
    holds: (db.holdPoints ?? []).filter((f) => isOpen(f.status)).length,
    readiness: db.equipment.length,
    tests: db.tests.length,
    schedule: db.milestones.length,
    // Only badge Safety when something is expiring/expired (red "hot" pill).
    safety:
      (db.safety ?? []).filter(
        (s) => s.status === "EXPIRING" || s.status === "EXPIRED",
      ).length || undefined,
  };
  // Always show every module in the left rail (add/remove customization removed)
  const railMods = MODULES;

  const selWrap = {
    flex: 1,
    minWidth: 240,
    height: 38,
    border: `1px solid ${P.line}`,
    borderRadius: 9,
    background: P.card,
    padding: "0 11px",
    fontSize: 14,
    fontWeight: 600,
    color: P.ink,
  };
  const topSel = {
    background: P.card,
    color: P.ink,
    border: `1px solid ${P.line}`,
    height: 32,
    padding: "0 8px",
    fontSize: 13,
    borderRadius: 6,
    maxWidth: 230,
  };

  /* ---------- mutations (wired to Playbook V2 + module APIs) ---------- */
  const apiErr = (err, fallback) =>
    flash(err?.response?.data?.message ?? err?.message ?? fallback);

  const advance = async (dir) => {
    const u = unit(db, SELV);
    if (u.kind !== "equipment") return;
    const e = db.equipment.find((x) => x.id === u.id);
    if (!e?.assetId || !projectId) return;
    try {
      const call = dir === "advance" ? advanceAssetPhase : revertAssetPhase;
      const res = norm(
        await call(projectId, e.assetId, { expectedPhase: e.phase }),
      );
      mutate((d) => {
        const x = d.equipment.find((y) => y.id === u.id);
        if (x) x.phase = res?.currentPhase ?? x.phase;
        d.activity.unshift({
          when: "just now",
          who: "You",
          ct,
          text: `Gate ${dir === "advance" ? "advanced" : "reverted"}: ${x.id} → ${x.phase}`,
        });
      });
      flash(dir === "advance" ? "Gate advanced" : "Gate reverted");
    } catch (err) {
      apiErr(err, "Gate is blocked — resolve outstanding items first");
    }
  };
  // `status` is a ChecklistStatus enum value — one of NOT_STARTED | IN_PROGRESS
  // | COMPLETED | VERIFIED (the only statuses the API accepts). The local store
  // keeps the lowercase form for rendering.
  const setChk = (id, status) => {
    const lower = CHK_FROM[status] ?? "not_started";
    const row = db.checklists.find((x) => x.id === id);
    const prev = row?.status;
    mutate((d) => {
      const c = d.checklists.find((x) => x.id === id);
      if (c) c.status = lower;
    });
    // VERIFIED goes through the sign endpoint (approval rights + required
    // items enforced server-side); other moves use the status transition API.
    const call =
      status === "VERIFIED"
        ? signChecklist(id)
        : changeChecklistStatus(id, { status });
    call
      .then(() => {
        // Re-fetch the owning asset's checklists so the card shows the server's
        // latest state (status, verification, derived fields) — not just the
        // optimistic local update.
        const e = db.equipment.find((x) => x.id === row?.eq);
        if (e?.assetId) loadChecklistsFor(e.assetId, e.id);
      })
      .catch((err) => {
        mutate((d) => {
          const c = d.checklists.find((x) => x.id === id);
          if (c && prev) c.status = prev;
        });
        apiErr(err, "Could not update checklist");
      });
  };
  const resolveFinding = async (id) => {
    mutate((d) => {
      const f = d.findings.find((x) => x.id === id);
      if (f) f.status = "resolved";
    });
    try {
      // Closing requires the full lifecycle: NEW/DEFERRED → IN_PROGRESS →
      // READY_FOR_VERIFICATION → verify-close (with the verifier's user id).
      let me = null;
      try {
        me = JSON.parse(getUser() || "null")?.id ?? null;
      } catch {
        me = null;
      }
      const detail = norm(await getIssueById(id, projectId));
      let st = detail?.status;
      if (st === "NEW" || st === "DEFERRED") {
        await changeIssueStatus(id, { status: "IN_PROGRESS" }, projectId);
        st = "IN_PROGRESS";
      }
      if (st === "IN_PROGRESS") {
        await changeIssueStatus(
          id,
          { status: "READY_FOR_VERIFICATION" },
          projectId,
        );
      }
      await verifyAndCloseIssue(id, { closeVerifiedBy: me }, projectId);
      flash("Finding resolved");
    } catch (err) {
      mutate((d) => {
        const f = d.findings.find((x) => x.id === id);
        if (f) f.status = "open";
      });
      apiErr(err, "Could not close finding (it may need verification first)");
    }
  };
  const passTest = (id) => {
    mutate((d) => {
      const t = d.tests.find((x) => x.id === id);
      if (t) {
        t.status = "passed";
        d.activity.unshift({
          when: "just now",
          who: "You",
          ct,
          text: `Test passed: ${t.name}`,
        });
      }
    });
    recordTestResult(id, { result: "PASS" }).then(
      () => flash("Test passed"),
      (err) => {
        mutate((d) => {
          const t = d.tests.find((x) => x.id === id);
          if (t) t.status = "pending";
        });
        apiErr(err, "Could not record test result");
      },
    );
  };
  const verifyDrawing = (id) => {
    mutate((d) => {
      const x = d.drawings.find((y) => y.id === id);
      if (x) x.verified = true;
    });
    flash("Drawing verified");
  };
  const cycleTask = (id) => {
    let nextStatus;
    mutate((d) => {
      const t = d.tasks.find((x) => x.id === id);
      if (!t) return;
      const o = ["open", "in_progress", "done"];
      t.status =
        t.status === "done" ? "open" : o[Math.min(o.indexOf(t.status) + 1, 2)];
      nextStatus = t.status;
    });
    if (nextStatus) {
      updateTask(id, { status: TASK_TO[nextStatus] ?? "PENDING" }).catch(
        (err) => apiErr(err, "Could not update task"),
      );
    }
  };
  const revoke = (i) => {
    const member = db.team[i];
    if (!member) return;
    if (!member.membershipId || !projectId) {
      flash("This company is managed by the host org");
      return;
    }
    mutate((d) => d.team.splice(i, 1));
    revokeTeamCompany(projectId, member.membershipId).then(
      () => flash("Access revoked"),
      (err) => {
        refresh(projectId);
        apiErr(err, "Could not revoke access (host only)");
      },
    );
  };
  const invite = (k) => {
    // Real invites need a registered tenant organization to link
    // (POST /v2/cx-projects/:id/team-companies { organizationId, companyRole }).
    // The modal only picks a company TYPE, so record the intent locally until
    // the org-directory picker lands.
    mutate((d) => {
      d.team.push({
        ct: k,
        company: `${COMPANY_TYPES[k].name} (invited)`,
        role: COMPANY_TYPES[k].roles[0].role,
        access: `${COMPANY_TYPES[k].name} scope`,
        status: "invited",
      });
      d.activity.unshift({
        when: "just now",
        who: "You",
        ct,
        text: `Company invited: ${COMPANY_TYPES[k].name}`,
      });
    });
    setInviteOpen(false);
    flash("Invite recorded — link a registered organization to grant access");
  };
  const laPatch = (id, payload, revertFn) =>
    projectId &&
    updateLookahead(projectId, id, payload).catch((err) => {
      if (revertFn) mutate(revertFn);
      apiErr(err, "Could not update activity");
    });
  const laStep = (id, delta) => {
    let pct;
    mutate((d) => {
      const a = d.lookahead.find((x) => x.id === id);
      if (!a) return;
      a.pct = Math.max(0, Math.min(100, a.pct + delta));
      a.status = a.pct === 100 ? "done" : a.pct > 0 ? "active" : "planned";
      pct = a.pct;
    });
    if (pct !== undefined) laPatch(id, { pct });
  };
  const laCycle = (id) => {
    let status;
    mutate((d) => {
      const a = d.lookahead.find((x) => x.id === id);
      if (!a) return;
      const o = ["planned", "active", "done"];
      a.status = o[(o.indexOf(a.status) + 1) % 3];
      a.pct = a.status === "done" ? 100 : a.status === "planned" ? 0 : a.pct;
      status = a.status;
    });
    if (status) laPatch(id, { status: status.toUpperCase() });
  };
  const laBlock = (id) => {
    const a = db.lookahead.find((x) => x.id === id);
    if (!a || !projectId) return;
    const blocking = !a.blocked;
    mutate((d) => {
      const x = d.lookahead.find((y) => y.id === id);
      if (x) {
        x.blocked = blocking;
        x.constraint = blocking ? x.constraint || "Blocked" : "";
      }
    });
    const call = blocking
      ? flagLookaheadConstraint(projectId, id, a.constraint || "Blocked")
      : clearLookaheadConstraint(projectId, id);
    call.catch((err) => apiErr(err, "Could not update constraint"));
  };
  const laRemove = (id) => {
    mutate((d) => {
      d.lookahead = d.lookahead.filter((x) => x.id !== id);
    });
    if (projectId) {
      removeLookahead(projectId, id).catch((err) =>
        apiErr(err, "Could not remove activity"),
      );
    }
  };
  const LA_TRADES = [
    "EC",
    "MC",
    "Controls",
    "OEM",
    "NETA",
    "FIRE",
    "GC",
    "CXA",
  ];
  const submitActivity = async () => {
    const area = (laAdd.area || "").trim();
    if (!area) {
      flash("Enter an activity / area");
      return;
    }
    const wk = Number(laAdd.wk);
    if (!projectId) return;
    try {
      const weekOf = new Date(isoMonday().getTime() + (wk - 1) * 7 * 86400000)
        .toISOString()
        .slice(0, 10);
      const created = norm(
        await createLookahead(projectId, {
          weekOf,
          trade: laAdd.trade,
          description: area,
        }),
      );
      mutate((d) => {
        d.lookahead.push({
          id: created?.id ?? nid("la"),
          wk,
          trade: laAdd.trade,
          area,
          pct: 0,
          status: "planned",
        });
      });
      setLaAdd(null);
      flash("Activity added");
    } catch (err) {
      apiErr(err, "Could not add activity");
    }
  };

  /* ---------- Safety (project safety items) ---------- */
  const SAFETY_TABS = [
    { id: "CERTIFICATION", label: "Training / Certification" },
    { id: "PTP_AHA_JSA", label: "PTP / AHA / JSA" },
    { id: "INSPECTION", label: "Inspection" },
    { id: "LIFT_PLAN", label: "Lift Plan" },
    { id: "SDS_DOCUMENT", label: "SDS / Document" },
    { id: "ORIENTATION", label: "Orientation" },
  ];
  const resetSafetyForm = () =>
    setSafetyForm({
      title: "",
      workerName: "",
      companyTrade: "",
      issuedAt: "",
      expiresAt: "",
    });
  const submitSafety = async () => {
    const title = (safetyForm.title || "").trim();
    if (!title) {
      flash("Enter a title");
      return;
    }
    if (!projectId) return;
    const payload = {
      kind: safetyTab,
      title,
      workerName: safetyForm.workerName?.trim() || undefined,
      companyTrade: safetyForm.companyTrade?.trim() || undefined,
      issuedAt: safetyForm.issuedAt || undefined,
      expiresAt: safetyForm.expiresAt || undefined,
    };
    try {
      const created = norm(await createSafetyItem(projectId, payload));
      mutate((d) => {
        (d.safety = d.safety || []).push({
          id: created?.id ?? nid("sf"),
          kind: created?.kind ?? safetyTab,
          title: created?.title ?? title,
          workerName: created?.workerName ?? payload.workerName ?? "",
          companyTrade: created?.companyTrade ?? payload.companyTrade ?? "",
          status: created?.status ?? "ACTIVE",
          issuedAt: created?.issuedAt
            ? String(created.issuedAt).slice(0, 10)
            : safetyForm.issuedAt || "",
          expiresAt: created?.expiresAt
            ? String(created.expiresAt).slice(0, 10)
            : safetyForm.expiresAt || "",
          projectAssetId: created?.projectAssetId ?? null,
          attachments: created?.attachments ?? [],
        });
      });
      resetSafetyForm();
      flash("Added to project");
    } catch (err) {
      apiErr(err, "Could not add safety item");
    }
  };
  const safetyRemove = (id) => {
    mutate((d) => {
      d.safety = (d.safety || []).filter((x) => x.id !== id);
    });
    if (projectId) {
      removeSafetyItem(projectId, id).catch((err) =>
        apiErr(err, "Could not remove safety item"),
      );
    }
  };

  /* ============================ panels ============================ */
  function Overview() {
    const verified = db.checklists.filter((c) => isDone(c.status)).length;
    const idy = db.identity || {};
    const fmtDate = (d) =>
      d ? new Date(d).toLocaleDateString() : "—";
    const titleCase = (s) =>
      s
        ? String(s)
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())
        : "—";
    const DETAILS = [
      ["Project Name", idy.projectName],
      ["Customer", idy.customer],
      ["Project Code", idy.projectCode],
      ["Contract Number", idy.contractNumber],
      ["Site Address", idy.siteAddress],
      ["Start Date", fmtDate(idy.startDate)],
      ["Project Type", idy.projectType],
      ["Start Mode", titleCase(idy.startMode)],
      ["Status", titleCase(idy.status)],
    ];
    return (
      <>
        <Card>
          <SectLab>Project Overview · {db.project.name}</SectLab>
          <Kpis>
            <Kpi v={db.equipment.length} l="Equipment" />
            <Kpi
              v={`${verified}/${db.checklists.length}`}
              l="Checklists done"
              tone="good"
            />
            <Kpi v={g.gk.length} l="Gatekeeping" tone="bad" />
            <Kpi v={g.mit.length} l="Mitigating" tone="warn" />
          </Kpis>
        </Card>
        {db.identity && (
          <Card>
            <SectLab>Project Details</SectLab>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
                marginTop: 4,
              }}
            >
              {DETAILS.map(([label, value]) => (
                <div key={label}>
                  <div style={eyebrow}>{label}</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: P.ink,
                      marginTop: 3,
                      wordBreak: "break-word",
                    }}
                  >
                    {value || "—"}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        <Card>
          <SectLab>Equipment at a glance</SectLab>
          {db.equipment.map((e, i) => {
            const gg = gateOf(db, unit(db, `eq:${e.id}`));
            return (
              <Row key={e.id} style={i === 0 ? { borderTop: 0 } : undefined}>
                <Pill kind="lvl">{e.phase}</Pill>
                {e.furnish && (
                  <Pill
                    kind={e.furnish === "OFCI" ? "hold" : "role"}
                    title={
                      e.furnish === "OFCI"
                        ? "Owner-Furnished, Contractor-Installed"
                        : "Contractor-Furnished & Installed"
                    }
                  >
                    {e.furnish}
                  </Pill>
                )}
                <Grow>
                  {e.id} — {e.name}
                </Grow>
                <St s={gg.blocked ? "failed" : "complete"}>
                  {gg.blocked ? "blocked" : "clear"}
                </St>
              </Row>
            );
          })}
        </Card>
      </>
    );
  }

  function Schedule() {
    return (
      <Card>
        <SectLab>Schedule &amp; Milestones</SectLab>
        {db.milestones.map((m, i) => {
          const c =
            m.status === "done"
              ? P.teal
              : m.status === "cur"
                ? P.electric
                : "#c3ccd5";
          return (
            <Row key={m.name} style={i === 0 ? { borderTop: 0 } : undefined}>
              <span
                className="font-mono"
                style={{ fontSize: 11, color: P.smoke, width: 62 }}
              >
                {m.d}
              </span>
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: c,
                }}
              />
              <Pill kind="lvl">{m.ph}</Pill>
              <Grow>{m.name}</Grow>
              <St
                s={
                  m.status === "done"
                    ? "complete"
                    : m.status === "cur"
                      ? "in_progress"
                      : "not_started"
                }
              >
                {m.status === "cur" ? "in progress" : m.status}
              </St>
            </Row>
          );
        })}
      </Card>
    );
  }

  function Readiness() {
    const u = unit(db, SELV);
    const gg = gateOf(db, u);
    const k = PHASES.indexOf(gg.phase);
    const next = PHASES[Math.min(k + 1, PHASES.length - 1)];
    // Only the backend ChecklistStatus enum values are selectable.
    const STAT = [
      ["NOT_STARTED", "Not Started"],
      ["IN_PROGRESS", "In Progress"],
      ["COMPLETED", "Completed"],
      ["VERIFIED", "Verified"],
    ];
    const canAdv = can("advance") && u.kind === "equipment";
    return (
      <>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
          <select
            value={SELV}
            onChange={(e) => setSel(e.target.value)}
            style={selWrap}
          >
            {db.equipment.map((e) => (
              <option key={e.id} value={`eq:${e.id}`}>
                {e.id} — {e.name}
              </option>
            ))}
            {db.systems.map((s) => (
              <option key={s.id} value={`sys:${s.id}`}>
                ▣ {s.name}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            background: gg.blocked ? "#fcf4f2" : "#f3faf7",
            border: `1px solid ${gg.blocked ? "#e6c2bc" : "#bee0d3"}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <div
            className="flex items-center gap-2"
            style={{ fontSize: 16, fontWeight: 800, marginBottom: 11 }}
          >
            {gg.blocked ? "⛔" : "✔"}{" "}
            {gg.blocked ? "Gate Blocked" : "Gate Clear — ready to advance"}
          </div>
          <Kpis>
            <Kpi
              v={`${gg.workDone}/${gg.phaseCls.length}`}
              l={`Work (${gg.phase})`}
            />
            <Kpi
              v={`${gg.tests.filter((t) => t.status === "passed").length}/${gg.tests.length}`}
              l="Tests passed"
            />
            <Kpi
              v={gg.gk.length}
              l="Gatekeeping"
              tone={gg.gk.length ? "bad" : undefined}
            />
            <Kpi
              v={gg.mit.length}
              l="Mitigating"
              tone={gg.mit.length ? "warn" : undefined}
            />
          </Kpis>
          <div
            className="flex items-center gap-2 flex-wrap"
            style={{
              marginTop: 13,
              paddingTop: 13,
              borderTop: `1px dashed ${P.line}`,
            }}
          >
            <span style={eyebrow}>Phase</span>
            {PHASES.map((L, idx) => (
              <span key={L} className="flex items-center gap-2">
                <span
                  className="font-mono font-bold"
                  style={{
                    fontSize: 11,
                    padding: "5px 8px",
                    borderRadius: 7,
                    whiteSpace: "nowrap",
                    ...(idx < k
                      ? {
                          background: "#e6f3ee",
                          color: P.teal,
                          border: "1px solid #bee0d3",
                        }
                      : idx === k
                        ? {
                            background: P.electric,
                            color: "#fff",
                            border: `1px solid ${P.electric}`,
                          }
                        : {
                            background: P.soft,
                            color: "#9aa6b2",
                            border: `1px solid ${P.line}`,
                          }),
                  }}
                >
                  {L}
                </span>
                {idx < PHASES.length - 1 && (
                  <span style={{ color: "#c3ccd5" }}>→</span>
                )}
              </span>
            ))}
            <span className="ml-auto flex gap-2">
              {u.kind === "equipment" ? (
                <>
                  {k > 0 && canAdv && (
                    <button
                      type="button"
                      onClick={() => advance("revert")}
                      className="font-mono"
                      style={{
                        height: 33,
                        padding: "0 12px",
                        borderRadius: 8,
                        border: `1px solid ${P.line}`,
                        background: P.card,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        color: P.smoke,
                      }}
                    >
                      ← Revert
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => advance("advance")}
                    disabled={!canAdv || gg.blocked || k >= PHASES.length - 1}
                    className="font-mono"
                    style={{
                      height: 33,
                      padding: "0 12px",
                      borderRadius: 8,
                      border: `1px solid ${P.teal}`,
                      background: P.teal,
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      opacity:
                        !canAdv || gg.blocked || k >= PHASES.length - 1
                          ? 0.4
                          : 1,
                    }}
                  >
                    {!can("advance")
                      ? "View only"
                      : k >= PHASES.length - 1
                        ? "Commissioned"
                        : `Advance → ${next}`}
                  </button>
                </>
              ) : (
                <span style={eyebrow}>
                  system advances when all members clear
                </span>
              )}
            </span>
          </div>
        </div>
        <Card>
          <SectLab>Checklists · {u.name}</SectLab>
          {gg.cls.length ? (
            gg.cls.map((c, i) => (
              <Row key={c.id} style={i === 0 ? { borderTop: 0 } : undefined}>
                <Pill kind="lvl">{c.level}</Pill>
                <Pill kind="role">{c.role}</Pill>
                <Grow>{c.name}</Grow>
                Status :
                {c.status === "failed" ? (
                  <St s="failed">failed</St>
                ) : can("create") ? (
                  <select
                    value={CHK_TO[c.status] ?? "NOT_STARTED"}
                    onChange={(e) => setChk(c.id, e.target.value)}
                    className="font-mono"
                    style={{
                      height: 26,
                      fontSize: 10,
                      border: `1px solid ${P.line}`,
                      borderRadius: 6,
                      background: P.card,
                      color: STCLR[c.status],
                    }}
                  >
                    {STAT.map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                ) : (
                  <St s={c.status} />
                )}
              </Row>
            ))
          ) : (
            <Empty>No checklists.</Empty>
          )}
        </Card>
      </>
    );
  }

  function Findings({ arr, title, note }) {
    return (
      <Card>
        <LockMsg style={{ marginBottom: 10 }}>{note}</LockMsg>
        <SectLab>{title}</SectLab>
        {arr.length ? (
          arr.map((f, i) => (
            <Row key={f.id} style={i === 0 ? { borderTop: 0 } : undefined}>
              <Pill
                kind={f.type === "HoldPoint" ? "hold" : f.type.toLowerCase()}
              >
                {f.type === "HoldPoint" ? "HOLD" : f.type.toUpperCase()}
              </Pill>
              <Pill kind={f.sev.toLowerCase()}>{f.sev}</Pill>
              <Grow>{f.title}</Grow>
              {can("close") ? (
                <Mark onClick={() => resolveFinding(f.id)}>Mark resolved</Mark>
              ) : (
                <St s="not_started">view only</St>
              )}
            </Row>
          ))
        ) : (
          <Empty>None.</Empty>
        )}
      </Card>
    );
  }

  function Tests() {
    return (
      <Card>
        <SectLab>Test Records</SectLab>
        {db.tests.map((t, i) => (
          <Row key={t.id} style={i === 0 ? { borderTop: 0 } : undefined}>
            <Grow>
              {t.name} <span style={eyebrow}>· {t.eq}</span>
            </Grow>
            <St s={t.status === "passed" ? "complete" : "in_progress"}>
              {t.status}
            </St>
            {t.status !== "passed" && can("verify") && (
              <Mark onClick={() => passTest(t.id)}>Mark passed</Mark>
            )}
          </Row>
        ))}
      </Card>
    );
  }

  function Drawings() {
    return (
      <Card>
        <SectLab>Drawings &amp; P&amp;ID</SectLab>
        {db.drawings.map((d, i) => (
          <Row key={d.id ?? d.name} style={i === 0 ? { borderTop: 0 } : undefined}>
            <Pill kind="lvl">{d.type}</Pill>
            <Grow>
              {d.name} <span style={eyebrow}>· {d.eq}</span>
            </Grow>
            <St s={d.verified ? "complete" : "in_progress"}>
              {d.verified ? "verified" : "unverified"}
            </St>
            {!d.verified && can("verify") && (
              <Mark onClick={() => verifyDrawing(d.id)}>Verify</Mark>
            )}
          </Row>
        ))}
      </Card>
    );
  }

  function Submittals() {
    const sc = (s) =>
      /Approved/.test(s)
        ? "complete"
        : /Revise/.test(s)
          ? "failed"
          : "in_progress";
    return (
      <Card>
        <SectLab>Submittals — review &amp; approval</SectLab>
        {db.submittals.map((s, i) => (
          <Row key={s.name} style={i === 0 ? { borderTop: 0 } : undefined}>
            <Pill kind="role">{s.by}</Pill>
            <Grow>
              {s.name} <span style={eyebrow}>· {s.eq}</span>
            </Grow>
            <St s={sc(s.status)}>{s.status}</St>
          </Row>
        ))}
      </Card>
    );
  }

  function Procurement() {
    const sc = (s) => (/Delivered/.test(s) ? "complete" : "in_progress");
    const ofci = db.procurement.filter((p) => p.furnish === "OFCI").length;
    const cfci = db.procurement.filter((p) => p.furnish === "CFCI").length;
    return (
      <Card>
        <SectLab>Procurement &amp; Long-Lead Log</SectLab>
        <LockMsg style={{ marginBottom: 10 }}>
          <b>Furnish responsibility:</b> {ofci} OFCI (Owner-Furnished,
          Contractor-Installed) · {cfci} CFCI (Contractor-Furnished &amp;
          Installed). OFCI items are the Owner&apos;s to deliver — a common
          schedule risk the GC tracks here.
        </LockMsg>
        {db.procurement.map((p, i) => (
          <Row key={p.item} style={i === 0 ? { borderTop: 0 } : undefined}>
            <Pill kind={p.furnish === "OFCI" ? "hold" : "role"}>
              {p.furnish}
            </Pill>
            <Grow>
              {p.item}{" "}
              <span style={eyebrow}>
                · {p.vendor} · {p.po}
              </span>
            </Grow>
            <span
              className="font-mono"
              style={{ fontSize: 10, color: P.smoke }}
            >
              need {p.need}
            </span>
            <St s={sc(p.status)}>{p.status}</St>
          </Row>
        ))}
      </Card>
    );
  }

  function Tarf() {
    const sc = (s) =>
      /Approved|Complete/.test(s)
        ? "complete"
        : /Submitted|Pending/.test(s)
          ? "in_progress"
          : "not_started";
    return (
      <Card>
        <SectLab>Site Arrivals — TARF (badging &amp; access)</SectLab>
        <LockMsg style={{ marginBottom: 10 }}>
          Who&apos;s arriving on site, badging/access status, and safety
          orientation. No crew works the floor until badged and oriented.
        </LockMsg>
        {db.tarf.map((t, i) => (
          <Row key={t.crew} style={i === 0 ? { borderTop: 0 } : undefined}>
            <Pill kind="role">{t.date}</Pill>
            <Grow>
              {t.crew} <span style={eyebrow}>· {t.co}</span>
            </Grow>
            <St s={sc(t.badge)}>badge: {t.badge}</St>
            <St s={sc(t.orient)}>orient: {t.orient}</St>
          </Row>
        ))}
      </Card>
    );
  }

  function Safety() {
    const edit = can("create");
    const items = db.safety || [];
    const tabItems = items.filter((s) => s.kind === safetyTab);
    const expiringTotal = items.filter(
      (s) => s.status === "EXPIRING" || s.status === "EXPIRED",
    ).length;
    const isCert = safetyTab === "CERTIFICATION";
    const isDoc = safetyTab === "SDS_DOCUMENT";
    const dated = isCert || isDoc;
    const titlePh = isCert
      ? "Certification (e.g. OSHA 30)"
      : safetyTab === "PTP_AHA_JSA"
        ? "Pre-task plan / AHA / JSA title"
        : safetyTab === "INSPECTION"
          ? "Inspection title"
          : safetyTab === "LIFT_PLAN"
            ? "Lift plan title"
            : isDoc
              ? "Document / SDS name"
              : "Orientation title";

    const inp = {
      height: 38,
      border: `1px solid ${P.line}`,
      borderRadius: 9,
      background: P.card,
      padding: "0 11px",
      fontSize: 14,
      color: P.ink,
      width: "100%",
    };
    const lab = {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 0.5,
      color: P.smoke,
      textTransform: "uppercase",
      marginBottom: 4,
      display: "block",
    };
    const setF = (k) => (e) =>
      setSafetyForm((p) => ({ ...p, [k]: e.target.value }));

    const chipFor = (s) => {
      if (s.status === "EXPIRED")
        return { background: P.rust, color: "#fff", text: `Expired ${s.expiresAt}` };
      if (s.status === "EXPIRING")
        return {
          background: "#fbf2dc",
          color: P.amber,
          text: `Expiring ${s.expiresAt}`,
        };
      if (s.status === "COMPLETED")
        return { background: "#e7f3ee", color: P.teal, text: "Completed" };
      if (s.status === "VOID")
        return { background: P.soft, color: P.smoke, text: "Void" };
      return {
        background: "#e7f3ee",
        color: P.teal,
        text: s.expiresAt ? `Valid · ${s.expiresAt}` : "Active",
      };
    };

    return (
      <Card>
        <SectLab>
          Safety — certifications, pre-task plans, inspections, lift plans, SDS,
          and orientations
        </SectLab>

        {expiringTotal > 0 && (
          <div
            style={{
              display: "inline-block",
              background: "#fbf2dc",
              color: P.amber,
              border: `1px solid ${P.amber}33`,
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            {expiringTotal} expiring within 30 days
          </div>
        )}

        {/* Tabs */}
        <div
          className="flex flex-wrap gap-2"
          style={{ marginBottom: 14 }}
        >
          {SAFETY_TABS.map((t) => {
            const c = items.filter((s) => s.kind === t.id).length;
            const active = t.id === safetyTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSafetyTab(t.id);
                  resetSafetyForm();
                }}
                style={{
                  height: 32,
                  padding: "0 12px",
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: `1px solid ${active ? P.navy : P.line}`,
                  background: active ? P.navy : P.card,
                  color: active ? "#fff" : P.ink,
                }}
              >
                {t.label} ({c})
              </button>
            );
          })}
        </div>

        {/* Create form (active tab) */}
        {edit && (
          <div
            style={{
              border: `1px solid ${P.line}`,
              borderRadius: 12,
              padding: 14,
              marginBottom: 14,
              background: P.paper,
            }}
          >
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: isCert ? "1fr 1fr 1fr" : "1fr" }}
            >
              <input
                style={inp}
                placeholder={titlePh}
                value={safetyForm.title}
                onChange={setF("title")}
                onKeyDown={(e) => e.key === "Enter" && submitSafety()}
              />
              {isCert && (
                <>
                  <input
                    style={inp}
                    placeholder="Worker name"
                    value={safetyForm.workerName}
                    onChange={setF("workerName")}
                  />
                  <input
                    style={inp}
                    placeholder="Company / trade"
                    value={safetyForm.companyTrade}
                    onChange={setF("companyTrade")}
                  />
                </>
              )}
            </div>
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: dated ? "1fr 1fr 1fr" : "1fr",
                marginTop: 10,
                alignItems: "end",
              }}
            >
              {dated && (
                <div>
                  <label style={lab}>Issued</label>
                  <input
                    type="date"
                    style={inp}
                    value={safetyForm.issuedAt}
                    onChange={setF("issuedAt")}
                  />
                </div>
              )}
              {dated && (
                <div>
                  <label style={lab}>Expires</label>
                  <input
                    type="date"
                    style={inp}
                    value={safetyForm.expiresAt}
                    onChange={setF("expiresAt")}
                  />
                </div>
              )}
              <button
                type="button"
                onClick={submitSafety}
                style={{
                  height: 38,
                  borderRadius: 9,
                  border: "none",
                  background: P.navy,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  padding: "0 18px",
                }}
              >
                Add to project
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {tabItems.length === 0 ? (
          <div
            style={{
              color: P.smoke,
              fontSize: 13,
              padding: "10px 2px",
            }}
          >
            No {SAFETY_TABS.find((t) => t.id === safetyTab)?.label.toLowerCase()}{" "}
            items yet.
          </div>
        ) : (
          tabItems.map((s) => {
            const chip = chipFor(s);
            const subtitle = [s.workerName, s.companyTrade]
              .filter(Boolean)
              .join(" · ");
            return (
              <div
                key={s.id}
                className="flex items-center"
                style={{
                  border: `1px solid ${P.line}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 8,
                  gap: 12,
                }}
              >
                <div className="min-w-0" style={{ flex: 1 }}>
                  <div
                    className="truncate"
                    style={{ fontWeight: 700, color: P.ink, fontSize: 14 }}
                  >
                    {s.title}
                  </div>
                  {subtitle && (
                    <div
                      className="truncate"
                      style={{ color: P.smoke, fontSize: 12, marginTop: 2 }}
                    >
                      {subtitle}
                    </div>
                  )}
                </div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 9px",
                    borderRadius: 7,
                    whiteSpace: "nowrap",
                    background: chip.background,
                    color: chip.color,
                  }}
                >
                  {chip.text}
                </span>
                {edit && (
                  <button
                    type="button"
                    title="Remove"
                    onClick={() => safetyRemove(s.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: P.smoke,
                      fontSize: 18,
                      lineHeight: 1,
                      cursor: "pointer",
                      padding: "0 2px",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })
        )}

        <LockMsg style={{ marginTop: 10 }}>
          Safety gates the field: an activity can&apos;t start until its AHA/JHA
          is approved and the crew is badged &amp; oriented.
        </LockMsg>
      </Card>
    );
  }

  function Stakeholders() {
    return (
      <Card>
        <SectLab>Key Stakeholders — who owns what across the lifecycle</SectLab>
        <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {db.stakeholders.map((s) => (
            <div
              key={s.nm}
              style={{
                border: `1px solid ${P.line}`,
                borderRadius: 9,
                padding: 10,
                background: P.paper,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13 }}>{s.nm}</div>
              <div style={{ fontSize: 11, color: P.smoke, marginTop: 2 }}>
                {s.sc}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 10, color: P.navy, marginTop: 5 }}
              >
                {s.own}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function Activity() {
    const a = db.activity || [];
    const cts = [...new Set(a.map((x) => x.ct).filter(Boolean))];
    const filtered = actf === "all" ? a : a.filter((x) => x.ct === actf);
    return (
      <Card>
        <div className="flex items-center justify-between gap-2">
          <SectLab style={{ margin: 0 }}>
            Activity / Updates — what&apos;s changed on the project
          </SectLab>
          <select
            value={actf}
            onChange={(e) => setActf(e.target.value)}
            style={{ ...selWrap, flex: "none", minWidth: 0, maxWidth: 200 }}
          >
            <option value="all">All companies</option>
            {cts.map((c) => (
              <option key={c} value={c}>
                {ctName(c)}
              </option>
            ))}
          </select>
        </div>
        <LockMsg style={{ margin: "10px 0" }}>
          Every gate advance, task update, constraint, verification and invite
          lands here — the GC&apos;s running log of who did what.
        </LockMsg>
        {filtered.length ? (
          filtered.map((x, i) => (
            <Row key={i}>
              <Pill kind="role">{x.when}</Pill>
              <Grow>{x.text}</Grow>
              <span
                className="font-mono"
                style={{ fontSize: 10, color: P.smoke }}
              >
                {x.who}
              </span>
            </Row>
          ))
        ) : (
          <Empty>No activity for this filter.</Empty>
        )}
      </Card>
    );
  }

  function outstanding() {
    const items = [];
    db.findings
      .filter((f) => isOpen(f.status))
      .forEach((f) => {
        const eq = db.equipment.find((e) => e.id === f.eq);
        items.push({
          ct: DISC_CT[f.disc] || "gc",
          what: `${f.type === "HoldPoint" ? "Hold point" : f.type}: ${f.title}`,
          eq: f.eq,
          gates: eq ? eq.phase : "",
          kind: isGate(f) ? "gate" : "punch",
        });
      });
    db.checklists
      .filter((c) => c.status === "failed")
      .forEach((c) =>
        items.push({
          ct: ROLE_CT[c.role] || "gc",
          what: `Failed checklist: ${c.name}`,
          eq: c.eq,
          gates: c.level,
          kind: "gate",
        }),
      );
    db.equipment.forEach((e) => {
      db.checklists
        .filter(
          (c) =>
            c.eq === e.id &&
            c.level === e.phase &&
            !isDone(c.status) &&
            c.status !== "failed",
        )
        .forEach((c) =>
          items.push({
            ct: ROLE_CT[c.role] || "gc",
            what: `Open checklist: ${c.name}`,
            eq: e.id,
            gates: c.level,
            kind: "work",
          }),
        );
    });
    db.tests
      .filter((t) => t.status !== "passed")
      .forEach((t) => {
        const eq = db.equipment.find((e) => e.id === t.eq);
        items.push({
          ct: eq && eq.disc ? DISC_CT[eq.disc] : "neta",
          what: `Pending test: ${t.name}`,
          eq: t.eq,
          gates: eq ? eq.phase : "",
          kind: "test",
        });
      });
    return items;
  }
  function Completion() {
    const items = outstanding();
    const byCt = {};
    items.forEach((it) => {
      (byCt[it.ct] = byCt[it.ct] || []).push(it);
    });
    const remaining = LIFECYCLE.slice(ci);
    const gateItems = items.filter(
      (i) => i.kind === "gate" || i.kind === "work",
    ).length;
    return (
      <>
        <Card>
          <SectLab>
            To Completion — what it takes to finish {db.project.name}
          </SectLab>
          <Kpis>
            <Kpi v={`${db.project.phase}→L6`} l="Phases left" />
            <Kpi v={gateItems} l="Gating items" tone="bad" />
            <Kpi v={items.length} l="Total outstanding" tone="warn" />
            <Kpi v={Object.keys(byCt).length} l="Companies on hook" />
          </Kpis>
          <LockMsg style={{ marginTop: 12 }}>
            Every open item is tagged to the <b>company accountable</b> for
            closing it and the <b>gate it holds</b>. Clear them in order and the
            project walks to L6 turnover.
          </LockMsg>
        </Card>
        <Card>
          <SectLab>Path to completion — remaining gates</SectLab>
          {remaining.map((s, i) => (
            <Row key={s.ph} style={i === 0 ? { borderTop: 0 } : undefined}>
              <Pill kind="lvl">{s.ph}</Pill>
              <Grow>
                {s.nm} — {s.meta}
              </Grow>
            </Row>
          ))}
        </Card>
        <SectLab style={{ margin: "0 2px 8px" }}>
          Outstanding by accountable company
        </SectLab>
        {Object.entries(byCt)
          .sort((a, b) => b[1].length - a[1].length)
          .map(([k, arr]) => (
            <Card key={k} style={{ padding: 12 }}>
              <div
                className="flex items-center gap-2"
                style={{ marginBottom: 6 }}
              >
                <Pill kind="role">{ctName(k)}</Pill>
                <span style={eyebrow}>
                  owes {arr.length} item{arr.length > 1 ? "s" : ""}
                </span>
              </div>
              {arr.map((it, i) => (
                <Row key={i} style={i === 0 ? { borderTop: 0 } : undefined}>
                  <Pill
                    kind={
                      it.kind === "gate"
                        ? "crit"
                        : it.kind === "punch"
                          ? "minor"
                          : "lvl"
                    }
                  >
                    {it.kind}
                  </Pill>
                  <Grow>
                    {it.what} <span style={eyebrow}>· {it.eq}</span>
                  </Grow>
                  <St s="in_progress">gates {it.gates}</St>
                </Row>
              ))}
            </Card>
          ))}
        {!Object.keys(byCt).length && (
          <Card>
            <Empty>Nothing outstanding — ready for turnover. 🎉</Empty>
          </Card>
        )}
      </>
    );
  }

  function MyPart() {
    const p = PART[ct] || { owns: [], role: "", recv: "", does: "", hand: "" };
    const cur = db.project.phase;
    const tr = TRADE_OF[ct];
    const myLa = tr ? db.lookahead.filter((a) => a.trade === tr) : [];
    const myTasks = db.tasks.filter((t) => t.ct === ct);
    return (
      <>
        <Card>
          <SectLab>Your Part — {ctName(ct)}</SectLab>
          <LockMsg style={{ marginBottom: 12 }}>
            <b>{p.role}.</b> Here&apos;s where you fit, how your work bridges to
            the next company, and what&apos;s on your plate.
          </LockMsg>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
          >
            {[
              ["⬇ You receive", p.recv, "upstream hand-off", P.electric],
              [
                "⚙ You do",
                p.does,
                `your scope · phases ${p.owns.join(", ")}`,
                P.navy,
              ],
              ["⬆ You hand off", p.hand, "downstream hand-off", P.teal],
            ].map(([t, s, o, c]) => (
              <div
                key={t}
                style={{
                  border: `1px solid ${P.line}`,
                  borderLeft: `3px solid ${c}`,
                  borderRadius: 9,
                  padding: 10,
                  background: P.paper,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t}</div>
                <div style={{ fontSize: 11, color: P.smoke, marginTop: 2 }}>
                  {s}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 10, color: P.navy, marginTop: 5 }}
                >
                  {o}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <SectLab>Phase overview — where the project is</SectLab>
          {LIFECYCLE.map((s, i) => {
            const isCur = s.ph === cur;
            const own = p.owns.includes(s.ph);
            return (
              <Row
                key={s.ph}
                style={{
                  ...(i === 0 ? { borderTop: 0 } : {}),
                  ...(isCur ? { background: "#eaf1fa", borderRadius: 8 } : {}),
                }}
              >
                <Pill kind={isCur ? "lvl" : own ? "role" : "lvl"}>{s.ph}</Pill>
                <Grow>
                  <b>{s.nm}</b> — {s.meta}
                  {own && (
                    <span style={{ ...eyebrow, color: P.teal }}>
                      {" "}
                      · you own this phase
                    </span>
                  )}
                </Grow>
                {isCur && <St s="in_progress">current</St>}
              </Row>
            );
          })}
        </Card>
        <Card>
          <SectLab>Where you fit in the schedule</SectLab>
          {myLa.length ? (
            myLa.map((a, i) => (
              <Row key={a.id} style={i === 0 ? { borderTop: 0 } : undefined}>
                <Pill kind="role">Week {a.wk}</Pill>
                <Grow>
                  {a.area}
                  {a.blocked && (
                    <span style={{ ...eyebrow, color: P.rust }}>
                      {" "}
                      · ⚠ {a.constraint}
                    </span>
                  )}
                </Grow>
                <St
                  s={
                    a.status === "done"
                      ? "complete"
                      : a.status === "active"
                        ? "in_progress"
                        : "not_started"
                  }
                >
                  {a.status === "active" ? `${a.pct}%` : a.status}
                </St>
              </Row>
            ))
          ) : (
            <Empty>
              No scheduled field activities — your work centers on phases{" "}
              <b>{p.owns.join(", ") || "—"}</b>.
            </Empty>
          )}
        </Card>
        <Card>
          <SectLab>My Work — your assignments</SectLab>
          {myTasks.length ? (
            myTasks.map((t, i) => (
              <Row key={t.id} style={i === 0 ? { borderTop: 0 } : undefined}>
                <St
                  s={
                    t.status === "done"
                      ? "complete"
                      : t.status === "in_progress"
                        ? "in_progress"
                        : "not_started"
                  }
                >
                  {t.status === "in_progress" ? "in progress" : t.status}
                </St>
                <Grow>{t.title}</Grow>
                <span
                  className="font-mono"
                  style={{ fontSize: 10, color: P.smoke }}
                >
                  {t.due}
                </span>
                {can("create") && (
                  <Mark onClick={() => cycleTask(t.id)}>
                    {t.status === "done" ? "reopen" : "advance"}
                  </Mark>
                )}
              </Row>
            ))
          ) : (
            <Empty>No tasks assigned.</Empty>
          )}
        </Card>
        <Card>
          <SectLab>What you&apos;re looking for — your priorities</SectLab>
          {(FOCUS[ct] || []).map((f) => (
            <Row key={f}>
              <Pill kind="role">watch</Pill>
              <Grow>{f}</Grow>
            </Row>
          ))}
        </Card>
      </>
    );
  }

  function Lookahead() {
    const fp = db.fieldProgress || [];
    const overall = fp.length
      ? Math.round(fp.reduce((a, b) => a + b.pct, 0) / fp.length)
      : 0;
    const blockedN = db.lookahead.filter((a) => a.blocked).length;
    const edit = can("create");
    const weeks = [1, 2, 3, 4, 5, 6];
    const bar = (pct, color) => (
      <div
        style={{
          height: 6,
          borderRadius: 4,
          background: P.soft,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: color }} />
      </div>
    );
    return (
      <>
        <Card>
          <SectLab>Field Completion Rate — rough-in by trade</SectLab>
          <Kpis>
            <Kpi
              v={`${overall}%`}
              l="Field complete"
              tone={overall >= 75 ? "good" : overall >= 50 ? "warn" : "bad"}
            />
            <Kpi
              v={
                db.lookahead.filter((a) => a.wk <= 2 && a.status === "active")
                  .length
              }
              l="Active fortnight"
            />
            <Kpi
              v={blockedN}
              l="Constraints"
              tone={blockedN ? "bad" : undefined}
            />
            <Kpi v={fp.length} l="Trades on site" />
          </Kpis>
          <div style={{ marginTop: 12 }}>
            {fp.map((d) => (
              <div key={d.disc} style={{ marginBottom: 8 }}>
                <div className="flex justify-between" style={{ fontSize: 12 }}>
                  <span style={{ fontWeight: 700 }}>{d.disc}</span>
                  <span
                    className="font-mono"
                    style={{ fontSize: 11, color: P.smoke }}
                  >
                    {d.pct}% · {d.note}
                  </span>
                </div>
                <div style={{ marginTop: 3 }}>
                  {bar(
                    d.pct,
                    d.pct >= 75 ? P.teal : d.pct >= 50 ? P.amber : P.rust,
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <SectLab style={{ margin: 0 }}>
              6-Week Lookahead — what&apos;s coming on the floor
            </SectLab>
            {edit && (
              <button
                type="button"
                onClick={() => setLaAdd({ wk: 1, trade: "EC", area: "" })}
                className="font-mono"
                style={{
                  fontSize: 10,
                  border: `1px dashed ${P.line}`,
                  background: "none",
                  borderRadius: 6,
                  padding: "3px 9px",
                  cursor: "pointer",
                  color: P.navy,
                }}
              >
                + Add activity
              </button>
            )}
          </div>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
              marginTop: 8,
            }}
          >
            {weeks.map((w) => {
              const acts = db.lookahead.filter((a) => a.wk === w);
              const near = w <= 2;
              return (
                <div
                  key={w}
                  style={{
                    border: `1px solid ${P.line}`,
                    borderRadius: 9,
                    background: near ? "#f3faf7" : P.paper,
                    padding: 8,
                  }}
                >
                  <div
                    style={{
                      ...eyebrow,
                      marginBottom: 6,
                      color: near ? P.teal : P.smoke,
                    }}
                  >
                    Week {w}
                    {w === 1 ? " · now" : ""}
                  </div>
                  {acts.length ? (
                    acts.map((a) => (
                      <div
                        key={a.id}
                        style={{
                          background: P.card,
                          border: `1px solid ${a.blocked ? "#e6c2bc" : P.line}`,
                          borderRadius: 7,
                          padding: 6,
                          marginBottom: 6,
                        }}
                      >
                        <div className="flex items-center gap-1 flex-wrap">
                          <Pill kind="role">{a.trade}</Pill>
                          {a.status === "done" && (
                            <span
                              className="font-mono"
                              style={{
                                fontSize: 8,
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: "#e6f3ee",
                                color: P.teal,
                              }}
                            >
                              done
                            </span>
                          )}
                          {a.blocked && (
                            <span
                              className="font-mono"
                              style={{
                                fontSize: 8,
                                padding: "2px 6px",
                                borderRadius: 6,
                                background: P.rust,
                                color: "#fff",
                              }}
                            >
                              ⚠
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            margin: "3px 0",
                            lineHeight: 1.25,
                          }}
                        >
                          {a.area}
                        </div>
                        {a.blocked && (
                          <div
                            className="font-mono"
                            style={{
                              fontSize: 9,
                              color: P.rust,
                              marginBottom: 3,
                            }}
                          >
                            ↳ {a.constraint || "blocked"}
                          </div>
                        )}
                        {bar(
                          a.pct,
                          a.status === "done"
                            ? P.teal
                            : a.status === "active"
                              ? P.electric
                              : "#c3ccd5",
                        )}
                        <div
                          className="flex items-center gap-1"
                          style={{ marginTop: 4 }}
                        >
                          <span
                            className="font-mono"
                            style={{ fontSize: 9, color: P.smoke, flex: 1 }}
                          >
                            {a.pct}% · {a.status}
                          </span>
                          {edit &&
                            [
                              ["−", () => laStep(a.id, -10)],
                              ["+", () => laStep(a.id, 10)],
                              ["⟳", () => laCycle(a.id)],
                              ["⚠", () => laBlock(a.id)],
                              ["×", () => laRemove(a.id)],
                            ].map(([t, fn], j) => (
                              <button
                                key={j}
                                type="button"
                                onClick={fn}
                                style={{
                                  width: 20,
                                  height: 20,
                                  border: `1px solid ${P.line}`,
                                  background: P.card,
                                  borderRadius: 5,
                                  fontSize: 11,
                                  cursor: "pointer",
                                  lineHeight: 1,
                                  padding: 0,
                                  color:
                                    t === "⚠" && a.blocked ? P.rust : P.smoke,
                                }}
                              >
                                {t}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: P.smoke, fontSize: 11, padding: 4 }}>
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </>
    );
  }

  function Team() {
    const isGCadmin = mode === "standalone" || (ct === "gc" && can("admin"));
    return (
      <Card>
        <LockMsg style={{ marginBottom: 12 }}>
          {isGCadmin ? (
            <>
              As the GC you <b>control the project team</b>. Invite a company
              and it gets a Playbook scoped to its role.
            </>
          ) : (
            <>
              Your access on this project is <b>managed by the GC</b>. Your
              company&apos;s row is highlighted — that&apos;s your lane.
            </>
          )}
        </LockMsg>
        <SectLab>Project Team — invited companies &amp; their access</SectLab>
        {db.team.map((t, i) => {
          const mine = t.ct === ct;
          const st =
            t.status === "active" || t.status === "host"
              ? "complete"
              : t.status === "invited"
                ? "in_progress"
                : "not_started";
          return (
            <Row
              key={i}
              style={{
                ...(i === 0 ? { borderTop: 0 } : {}),
                ...(mine ? { background: "#eaf1fa", borderRadius: 8 } : {}),
              }}
            >
              <Pill kind="role">{ctName(t.ct).split(" ")[0]}</Pill>
              <Grow>
                <b>{t.company}</b> <span style={eyebrow}>· {t.role}</span>
                <br />
                <span style={{ fontSize: 11, color: P.smoke }}>
                  access: {t.access}
                </span>
              </Grow>
              <St s={st}>{t.status}</St>
              {isGCadmin && t.status !== "host" && (
                <Mark onClick={() => revoke(i)}>Revoke</Mark>
              )}
            </Row>
          );
        })}
        {isGCadmin && (
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              style={{
                height: 33,
                padding: "0 12px",
                borderRadius: 8,
                border: `1px solid ${P.teal}`,
                background: P.teal,
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "monospace",
              }}
            >
              + Invite company
            </button>
          </div>
        )}
      </Card>
    );
  }

  function Turnover() {
    const secs = [
      "Project Overview",
      "Commissioning Documentation",
      "Test & Inspection Records",
      "NCRs & Issues — Disposition",
      "As-Built Documentation",
      "O&M Manuals & Training",
      "Customer Acceptance",
    ];
    return (
      <Card>
        <LockMsg style={{ marginBottom: 10 }}>
          The turnover package is assembled at <b>L6</b>.{" "}
          {can("close")
            ? "You can sign off sections."
            : "View only for your role."}
        </LockMsg>
        <SectLab>Turnover &amp; Acceptance Package</SectLab>
        {secs.map((s, i) => (
          <Row key={s} style={i === 0 ? { borderTop: 0 } : undefined}>
            <Pill kind="lvl">{i + 1}</Pill>
            <Grow>{s}</Grow>
            <St s="not_started">pending</St>
          </Row>
        ))}
      </Card>
    );
  }

  function Placeholder({ id }) {
    const n = (MODULES.find((x) => x.id === id) || {}).name || id;
    return (
      <Card>
        <SectLab>{n}</SectLab>
        <Empty>
          In your live app this is the {n} workspace scoped to this project.
          (Module wired; demo records not seeded.)
        </Empty>
      </Card>
    );
  }

  const activeMod = MODULES.find((m) => m.id === mod);
  let body;
  if (activeMod && !moduleAllowed(activeMod)) {
    body = (
      <Card>
        <LockMsg>
          🔒 <b>{activeMod.name}</b> isn&apos;t part of the {ctName(ct)} portal.
          Your visible modules are scoped to your company type. Switch company
          type up top to see its modules.
        </LockMsg>
      </Card>
    );
  } else {
    switch (mod) {
      case "overview":
        body = Overview();
        break;
      case "activity":
        body = Activity();
        break;
      case "completion":
        body = Completion();
        break;
      case "mypart":
        body = MyPart();
        break;
      case "schedule":
        body = Schedule();
        break;
      case "lookahead":
        body = Lookahead();
        break;
      case "readiness":
        body = Readiness();
        break;
      case "issues":
        body = Findings({
          arr: g.gk,
          title: "Issues / NCRs — gatekeeping",
          note: "These block phase gates.",
        });
        break;
      case "punch":
        body = Findings({
          arr: (db.punchList ?? []).filter((f) => isOpen(f.status)),
          title: "Punch List — mitigating",
          note: "Carry-forward items; they do not block gates.",
        });
        break;
      case "holds":
        body = Findings({
          arr: (db.holdPoints ?? []).filter((f) => isOpen(f.status)),
          title: "Hold Points",
          note: "Must be released before the gate clears.",
        });
        break;
      case "tests":
        body = Tests();
        break;
      case "drawings":
        body = Drawings();
        break;
      case "submittals":
        body = Submittals();
        break;
      case "procurement":
        body = Procurement();
        break;
      case "tarf":
        body = Tarf();
        break;
      case "safety":
        body = Safety();
        break;
      case "team":
        body = Team();
        break;
      case "stakeholders":
        body = Stakeholders();
        break;
      case "turnover":
        body = Turnover();
        break;
      default:
        body = Placeholder({ id: mod });
    }
  }

  /* ============================ shell ============================ */
  return (
    <div
      className="font-gilroy"
      style={{
        background: P.paper,
        color: P.ink,
        minHeight: "100vh",
        padding: 16,
      }}
    >
      {/* Lens toolbar 
      <div
        className="flex items-center gap-2 flex-wrap"
        style={{ marginBottom: 12, justifyContent: "flex-end" }}
      >
        <span style={{ ...eyebrow }}>viewing as</span>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={topSel}
        >
          <option value="project">Hosted by GC (project)</option>
          <option value="standalone">Standalone (my own)</option>
        </select>
        <select
          value={ct}
          onChange={(e) => {
            setCt(e.target.value);
            setRi(0);
          }}
          style={topSel}
        >
          {Object.entries(COMPANY_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v.name}
            </option>
          ))}
        </select>
        <select
          value={ri}
          onChange={(e) => setRi(+e.target.value)}
          style={topSel}
        >
          {COMPANY_TYPES[ct].roles.map((r, i) => (
            <option key={i} value={i}>
              {r.role}
            </option>
          ))}
        </select>
      </div>
*/}
      <h1
        className="flex items-center gap-2"
        style={{
          fontSize: 21,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "2px 0",
        }}
      >
        📖 Project <span style={{ color: P.navy }}>Playbook</span>
      </h1>
      <div
        style={{
          color: P.smoke,
          fontSize: 13,
          marginBottom: 14,
          maxWidth: 820,
        }}
      >
        The whole project on one screen, through your company&apos;s lens —
        lifecycle, schedule, readiness gates, findings, stakeholders, turnover.
        What you can see and do is scoped to your role&apos;s permissions, just
        like the left-hand nav.
      </div>

      {/* Rolebar */}
      <div
        className="flex items-center gap-3 flex-wrap"
        style={{
          background: P.card,
          border: `1px solid ${P.line}`,
          borderRadius: 12,
          padding: "11px 14px",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 22 }}>{role.icon}</span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800 }}>
            {role.role} · {ctName(ct)}
            {mode === "standalone" && (
              <span
                className="font-mono"
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  borderRadius: 6,
                  padding: "3px 8px",
                  background: "#e6f3ee",
                  color: P.teal,
                  border: "1px solid #bee0d3",
                  marginLeft: 8,
                }}
              >
                standalone
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: P.smoke }}>
            {mode === "standalone"
              ? "You own this Playbook — every module is available."
              : role.blurb}
          </div>
        </div>
        <div className="flex gap-1 flex-wrap" style={{ marginLeft: "auto" }}>
          {(mode === "standalone" ? P_ALL : role.perms).map((p) => (
            <span
              key={p}
              className="font-mono"
              style={{
                fontSize: 9,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                borderRadius: 6,
                padding: "3px 8px",
                ...(p === "admin"
                  ? {
                      background: "#f0eafb",
                      color: P.violet,
                      border: "1px solid #dccff5",
                    }
                  : {
                      background: "#eaf1fa",
                      color: P.navy,
                      border: "1px solid #cfe0f3",
                    }),
              }}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Lifecycle spine */}
      <div
        style={{
          background: P.card,
          border: `1px solid ${P.line}`,
          borderRadius: 12,
          padding: 14,
          marginBottom: 14,
        }}
      >
        <div style={{ ...eyebrow, marginBottom: 10 }}>
          Project Lifecycle — {db.project.name}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {LIFECYCLE.map((s, i) => {
            const cls = i < ci ? "done" : i === ci ? "cur" : "todo";
            const sx =
              cls === "done"
                ? { background: "#e6f3ee", borderColor: "#bee0d3" }
                : cls === "cur"
                  ? {
                      background: P.electric,
                      borderColor: P.electric,
                      color: "#fff",
                    }
                  : { opacity: 0.72 };
            const phC =
              cls === "done" ? P.teal : cls === "cur" ? "#fff" : P.ink;
            const mC = cls === "cur" ? "#fff" : P.smoke;
            return (
              <div
                key={s.ph}
                style={{
                  flex: 1,
                  minWidth: 120,
                  border: `1px solid ${P.line}`,
                  borderRadius: 9,
                  padding: 9,
                  background: P.paper,
                  ...sx,
                }}
              >
                <div
                  className="font-mono"
                  style={{ fontSize: 10, fontWeight: 700, color: phC }}
                >
                  {s.ph}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    margin: "2px 0",
                    color: cls === "cur" ? "#fff" : P.ink,
                  }}
                >
                  {s.nm}
                </div>
                <div style={{ fontSize: 10, color: mC }}>{s.meta}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rail + main */}
      <div
        className="grid gap-4 items-start"
        style={{ gridTemplateColumns: "222px 1fr" }}
      >
        <div
          style={{
            background: P.card,
            border: `1px solid ${P.line}`,
            borderRadius: 12,
            padding: 6,
            position: "sticky",
            top: 16,
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ padding: "8px 8px 4px" }}
          >
            <span style={eyebrow}>Modules</span>
          </div>
          {railMods.map((m) => {
            const allowed = moduleAllowed(m);
            const on = mod === m.id;
            const cnt = counts[m.id];
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMod(m.id)}
                className="flex items-center gap-2 w-full text-left"
                style={{
                  border: 0,
                  borderRadius: 9,
                  padding: "9px 10px",
                  fontSize: 13,
                  cursor: "pointer",
                  background: on ? "#eaf1fa" : "none",
                  color: on ? P.navy : P.ink,
                  fontWeight: on ? 700 : 400,
                  opacity: allowed ? 1 : 0.45,
                }}
              >
                <span style={{ width: 16, textAlign: "center" }}>{m.ic}</span>
                <span className="flex-1 truncate">{m.name}</span>
                {allowed && cnt !== undefined && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      borderRadius: 20,
                      padding: "1px 7px",
                      ...(m.hot && cnt
                        ? { background: "#fbeae7", color: P.rust }
                        : { background: P.soft, color: P.smoke }),
                    }}
                  >
                    {cnt}
                  </span>
                )}
                {!allowed && (
                  <span style={{ fontSize: 11, opacity: 0.6 }}>🔒</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="min-w-0">{body}</div>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <Modal
          onClose={() => setInviteOpen(false)}
          title="Invite a company to this project"
        >
          <LockMsg style={{ marginBottom: 10 }}>
            Pick the company type. They get a Playbook scoped to that role.
          </LockMsg>
          {Object.entries(COMPANY_TYPES).map(([k, v]) => (
            <div
              key={k}
              onClick={() => invite(k)}
              className="flex items-center gap-2"
              style={{
                padding: 9,
                border: `1px solid ${P.line}`,
                borderRadius: 9,
                marginBottom: 7,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              <span>{v.roles[0].icon}</span>
              <span className="flex-1">{v.name}</span>
              <span
                className="font-mono"
                style={{
                  fontSize: 9,
                  background: "#eaf1fa",
                  color: P.navy,
                  padding: "3px 8px",
                  borderRadius: 6,
                }}
              >
                scoped portal
              </span>
            </div>
          ))}
        </Modal>
      )}

      {/* Add lookahead activity modal */}
      {laAdd && (
        <div
          onClick={() => setLaAdd(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: P.card,
              border: `1px solid ${P.line}`,
              borderRadius: 12,
              padding: 16,
              width: "100%",
              maxWidth: 420,
            }}
          >
            <SectLab>Add a lookahead activity</SectLab>

            <label style={{ ...eyebrow, display: "block", marginBottom: 4 }}>
              Week
            </label>
            <select
              value={laAdd.wk}
              onChange={(e) => setLaAdd((p) => ({ ...p, wk: e.target.value }))}
              style={{
                ...selWrap,
                width: "100%",
                marginBottom: 12,
                fontWeight: 700,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>

            <label style={{ ...eyebrow, display: "block", marginBottom: 4 }}>
              Trade
            </label>
            <select
              value={laAdd.trade}
              onChange={(e) =>
                setLaAdd((p) => ({ ...p, trade: e.target.value }))
              }
              style={{ ...selWrap, width: "100%", marginBottom: 12 }}
            >
              {LA_TRADES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <label style={{ ...eyebrow, display: "block", marginBottom: 4 }}>
              Activity / Area
            </label>
            <input
              autoFocus
              value={laAdd.area}
              onChange={(e) =>
                setLaAdd((p) => ({ ...p, area: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && submitActivity()}
              placeholder="e.g. DH02 branch conduit rough-in"
              style={{
                width: "100%",
                height: 38,
                border: `1px solid ${P.line}`,
                borderRadius: 9,
                background: P.card,
                padding: "0 11px",
                fontSize: 14,
                color: P.ink,
                marginBottom: 14,
              }}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLaAdd(null)}
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: `1px solid ${P.line}`,
                  background: P.card,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  color: P.ink,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitActivity}
                style={{
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 8,
                  border: `1px solid ${P.teal}`,
                  background: P.teal,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Add activity
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 18,
            left: "50%",
            transform: "translateX(-50%)",
            background: P.ink,
            color: "#fff",
            padding: "9px 16px",
            borderRadius: 9,
            fontSize: 13,
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 40,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: P.card,
          border: `1px solid ${P.line}`,
          borderRadius: 12,
          padding: 16,
          width: "100%",
          maxWidth: 420,
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <SectLab>{title}</SectLab>
        {children}
        <div style={{ textAlign: "right", marginTop: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              height: 33,
              padding: "0 12px",
              borderRadius: 8,
              border: `1px solid ${P.line}`,
              background: P.card,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "monospace",
              color: P.ink,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
