"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../../services/instance/tokenService";
import TailwindDialog from "../../components/common/Modals/SearchModal";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PROJECT = {
  code: "MSFT-DC1",
  name: "MSFT Data Center – Sterling DC1",
  customer: "Microsoft",
  site: "Sterling, VA",
  pct: 64,
  phase: "L3 · ENERGIZE",
  health: "green",
  assets: 142,
  energized: 91,
  end: "Aug 15, 2026",
  rfis: { open: 12, total: 34 },
  issues: { critical: 3, open: 11 },
  budget: { total: 28.4, spent: 18.2 },
};

const COMPANIES = {
  hitt: {
    id: "hitt",
    name: "HITT Contracting",
    label: "General Contractor",
    type: "gc",
    headcount: 12,
    checklists: 142,
  },
  msft: {
    id: "msft",
    name: "Microsoft",
    label: "Owner / Customer",
    type: "customer",
    headcount: 4,
    checklists: 0,
  },
  rosendin: {
    id: "rosendin",
    name: "Rosendin Electric",
    label: "Electrical Trade",
    type: "trade",
    headcount: 48,
    checklists: 67,
  },
  mckinstry: {
    id: "mckinstry",
    name: "McKinstry",
    label: "Mechanical Trade",
    type: "trade",
    headcount: 24,
    checklists: 31,
  },
  shermco: {
    id: "shermco",
    name: "Shermco Industries",
    label: "NETA Testing",
    type: "oem",
    headcount: 6,
    checklists: 18,
  },
  delta: {
    id: "delta",
    name: "Delta Electronics",
    label: "UPS / PDU OEM",
    type: "oem",
    headcount: 3,
    checklists: 24,
    oemClass: "UPS / PDU",
  },
  cat: {
    id: "cat",
    name: "Caterpillar",
    label: "Generator OEM",
    type: "oem",
    headcount: 2,
    checklists: 8,
    oemClass: "Generator",
  },
  trane: {
    id: "trane",
    name: "Trane Technologies",
    label: "BMS / Controls",
    type: "oem",
    headcount: 3,
    checklists: 14,
  },
  atc: {
    id: "atc",
    name: "ATC Associates",
    label: "Commissioning Agent",
    type: "cxa",
    headcount: 4,
    checklists: 45,
  },
};

const EQUIPMENT = [
  {
    id: "UPS-01",
    name: "Uninterruptible Power Supply 01",
    cls: "UPS",
    owner: "delta",
    hall: "MER-A",
    stage: "COMMISSIONED",
    pigtails: true,
  },
  {
    id: "UPS-02",
    name: "Uninterruptible Power Supply 02",
    cls: "UPS",
    owner: "delta",
    hall: "MER-A",
    stage: "COMMISSIONED",
    pigtails: true,
  },
  {
    id: "UPS-03",
    name: "Uninterruptible Power Supply 03",
    cls: "UPS",
    owner: "delta",
    hall: "MER-B",
    stage: "ON_SITE",
    pigtails: false,
  },
  {
    id: "UPS-04",
    name: "Uninterruptible Power Supply 04",
    cls: "UPS",
    owner: "delta",
    hall: "MER-B",
    stage: "ON_SITE",
    pigtails: true,
  },
  {
    id: "GEN-01",
    name: "Generator 01 · 2MW Diesel",
    cls: "Generator",
    owner: "cat",
    hall: "Yard-N",
    stage: "COMMISSIONED",
    pigtails: true,
  },
  {
    id: "GEN-02",
    name: "Generator 02 · 2MW Diesel",
    cls: "Generator",
    owner: "cat",
    hall: "Yard-S",
    stage: "INSTALLED",
    pigtails: false,
  },
  {
    id: "PDU-A01",
    name: "Power Distribution Unit A01",
    cls: "PDU",
    owner: "delta",
    hall: "Floor-3A",
    stage: "ON_SITE",
    pigtails: false,
  },
  {
    id: "PDU-B01",
    name: "Power Distribution Unit B01",
    cls: "PDU",
    owner: "delta",
    hall: "Floor-3B",
    stage: "ON_SITE",
    pigtails: false,
  },
];

const ACTIVITY = [
  {
    time: "2m",
    icon: "",
    who: "Aaron Wright",
    action: "completed checklist",
    target: "UPS-01 · L2.05b pre-energization",
  },
  {
    time: "14m",
    icon: "",
    who: "Sarah Chen",
    action: "flagged issue",
    target: "GEN-02 · Fuel line inspection pending",
  },
  {
    time: "38m",
    icon: "",
    who: "Lisa Park",
    action: "submitted RFI",
    target: "RFI-047 · Load bank capacity",
  },
  {
    time: "1h",
    icon: "",
    who: "Jeff Coufal",
    action: "signed off",
    target: "L2.06 doc review · UPS-02",
  },
  {
    time: "2h",
    icon: "",
    who: "Rosendin PM",
    action: "updated PO status",
    target: "Cable trays · now in transit",
  },
  {
    time: "3h",
    icon: "",
    who: "McKinstry",
    action: "completed rough-in",
    target: "CRAH-08 · MER-B",
  },
];

const TRADE_TASKS = [
  {
    id: "tt1",
    name: "Rough-in · MER-B conduit",
    asset: "UPS-03",
    company: "rosendin",
    type: "electrical",
    location: "MER-B",
    crew: "J. Lee (6)",
    start: "Apr 28",
    due: "May 06",
    status: "in_prog",
    pct: 72,
    subPhase: "L2.01",
  },
  {
    id: "tt2",
    name: "Set in place · UPS-04 anchor",
    asset: "UPS-04",
    company: "rosendin",
    type: "electrical",
    location: "MER-B",
    crew: "J. Lee (4)",
    start: "May 01",
    due: "May 07",
    status: "in_prog",
    pct: 45,
    subPhase: "L2.03",
  },
  {
    id: "tt3",
    name: "Termination · UPS-03 feeder",
    asset: "UPS-03",
    company: "rosendin",
    type: "electrical",
    location: "MER-B",
    crew: "T. Brown (3)",
    start: "May 05",
    due: "May 09",
    status: "open",
    pct: 0,
    subPhase: "L2.04",
  },
  {
    id: "tt4",
    name: "Piping · CRAH-08 loop",
    asset: "CRAH-08",
    company: "mckinstry",
    type: "mechanical",
    location: "MER-B",
    crew: "D. Park (5)",
    start: "Apr 29",
    due: "May 08",
    status: "in_prog",
    pct: 58,
    subPhase: "L2.05d",
  },
  {
    id: "tt5",
    name: "LOTO · GEN-02 fuel system",
    asset: "GEN-02",
    company: "rosendin",
    type: "electrical",
    location: "Yard-S",
    crew: "LOTO crew",
    start: "May 03",
    due: "May 05",
    status: "in_prog",
    pct: 90,
    subPhase: "L2.01",
  },
];

const MATERIALS = [
  {
    item: "4/0 AWG Cable · 1200ft",
    qty: "1200ft",
    vendor: "Anixter",
    po: "PO-2841",
    ordered: "Apr 20",
    eta: "May 06",
    status: "in_transit",
    company: "rosendin",
  },
  {
    item: "Cable Trays · 200 LF",
    qty: "200 LF",
    vendor: "B-Line",
    po: "PO-2842",
    ordered: "Apr 22",
    eta: "May 07",
    status: "in_transit",
    company: "rosendin",
  },
  {
    item: "UPS-03 Pigtail Assembly",
    qty: "1 set",
    vendor: "Delta Electronics",
    po: null,
    ordered: null,
    eta: null,
    status: "requested",
    company: "delta",
  },
  {
    item: "Refrigerant R-410A · 50lb",
    qty: "2 cylinders",
    vendor: "Trane",
    po: "PO-2845",
    ordered: "Apr 25",
    eta: "May 04",
    status: "delivered",
    company: "mckinstry",
  },
  {
    item: "GEN-02 Fuel line adapters",
    qty: "12 units",
    vendor: "Cat parts",
    po: null,
    ordered: null,
    eta: null,
    status: "requested",
    company: "cat",
  },
  {
    item: "PDU-A01 breaker modules",
    qty: "8 units",
    vendor: "Delta Electronics",
    po: "PO-2848",
    ordered: "Apr 28",
    eta: "May 10",
    status: "pending",
    company: "delta",
  },
];

const TASKINGS = [
  {
    name: "L2.05a Electrical pre-energ",
    asset: "UPS-03",
    subPhase: "L2.05a",
    taskedTo: "rosendin",
    taskedToRole: "Trade QA/QC",
    due: "May 08",
    status: "in_prog",
  },
  {
    name: "L2.05b Vendor pre-energ",
    asset: "UPS-03",
    subPhase: "L2.05b",
    taskedTo: "delta",
    taskedToRole: "OEM QA/QC",
    due: "May 06",
    status: "open",
  },
  {
    name: "L2.05d Mechanical pre-energ",
    asset: "CRAH-08",
    subPhase: "L2.05d",
    taskedTo: "mckinstry",
    taskedToRole: "Trade QA/QC",
    due: "May 09",
    status: "open",
  },
  {
    name: "NETA acceptance test",
    asset: "UPS-01",
    subPhase: "L2.05b",
    taskedTo: "shermco",
    taskedToRole: "NETA Tester",
    due: "Apr 30",
    status: "closed",
  },
  {
    name: "L2.06 Document review",
    asset: "UPS-03",
    subPhase: "L2.06",
    taskedTo: "hitt",
    taskedToRole: "GC QA/QC",
    due: "May 10",
    status: "open",
  },
];

const NCRS = [
  {
    id: "NCR-001",
    asset: "UPS-03",
    issue: "Torque specs not met on busbar connections",
    status: "open",
    raised: "May 02",
    by: "HITT QA/QC",
  },
  {
    id: "NCR-002",
    asset: "GEN-02",
    issue: "Fuel line routing deviation from drawing",
    status: "in_progress",
    raised: "Apr 28",
    by: "HITT QA/QC",
  },
  {
    id: "NCR-003",
    asset: "UPS-01",
    issue: "Missing UL label on bypass switch",
    status: "closed",
    raised: "Apr 10",
    by: "CxA",
  },
];

const PUNCH_ITEMS = [
  {
    id: "PI-001",
    asset: "UPS-03",
    description: "Touch-up paint on right side panel",
    status: "open",
    priority: "low",
    by: "CxA",
  },
  {
    id: "PI-002",
    asset: "GEN-02",
    description: "Exhaust silencer mounting bracket loose",
    status: "open",
    priority: "medium",
    by: "HITT QA/QC",
  },
  {
    id: "PI-003",
    asset: "UPS-01",
    description: "Cable labeling incomplete in MEB",
    status: "closed",
    priority: "medium",
    by: "CxA",
  },
  {
    id: "PI-004",
    asset: "PDU-A01",
    description: "Nameplate missing on breaker #14",
    status: "open",
    priority: "low",
    by: "HITT QA/QC",
  },
];

const TEST_RESULTS = [
  {
    asset: "UPS-01",
    test: "NETA acceptance",
    phase: "L2.05b",
    pass: true,
    by: "Shermco",
    date: "Apr 20",
  },
  {
    asset: "UPS-02",
    test: "NETA acceptance",
    phase: "L2.05b",
    pass: true,
    by: "Shermco",
    date: "Apr 22",
  },
  {
    asset: "UPS-03",
    test: "Insulation resistance",
    phase: "L2.04",
    pass: false,
    by: "Rosendin",
    date: "May 01",
  },
  {
    asset: "GEN-01",
    test: "No-load run test",
    phase: "L2.05b",
    pass: true,
    by: "Caterpillar",
    date: "Apr 18",
  },
];

const PSSR_RECORDS = [
  { asset: "UPS-03", status: "in_progress", items: 40, closed: 28 },
  { asset: "GEN-02", status: "in_progress", items: 40, closed: 15 },
  { asset: "UPS-04", status: "open", items: 40, closed: 0 },
];

const RISK_REGISTER = [
  {
    id: "R-01",
    description: "L5 IST delay if UPS-03 not energized by May 14",
    probability: 3,
    impact: 5,
    status: "active",
    owner: "HITT PM",
  },
  {
    id: "R-02",
    description: "GEN-02 fuel system deviation — potential NCR escalation",
    probability: 2,
    impact: 4,
    status: "active",
    owner: "HITT QA/QC",
  },
  {
    id: "R-03",
    description: "Cable delivery delay (PO-2841) blocking termination",
    probability: 2,
    impact: 3,
    status: "monitoring",
    owner: "Rosendin PM",
  },
  {
    id: "R-04",
    description: "BMS points list not finalized for IST integration",
    probability: 1,
    impact: 4,
    status: "monitoring",
    owner: "Trane BMS",
  },
];

const SAFETY_DATA = {
  jhas: [
    {
      id: "jha1",
      title: "Energized electrical work — UPS feeder",
      trade: "Electrical",
      hazards: ["Arc flash > 40 cal/cm²", "Shock > 480V"],
      ppe: "Minimum CAT 4 PPE: arc flash suit 40+ cal, voltage-rated gloves Class 2, face shield, hard hat.",
      last: "Apr 28",
    },
    {
      id: "jha2",
      title: "Confined space — generator vault entry",
      trade: "General",
      hazards: ["Oxygen deficiency", "Toxic gas (CO)"],
      ppe: "Continuous air monitor, SCBA standby, attendant at entry.",
      last: "Apr 20",
    },
    {
      id: "jha3",
      title: "Heavy equipment rigging — UPS set-in-place",
      trade: "Electrical",
      hazards: ["Dropped load > 5000 lbs", "Crush hazard"],
      ppe: "Rigger certification required, tag lines, exclusion zone 1.5× load height.",
      last: "Apr 15",
    },
  ],
  ahas: [
    {
      activity: "L2.05b UPS-03 pre-energization",
      date: "May 06",
      leadCo: "Delta Electronics",
      controls: "Isolation, verify dead, PPE CAT 2",
      signedBy: "Pending",
    },
    {
      activity: "Generator load bank test",
      date: "May 08",
      leadCo: "Caterpillar",
      controls: "Load resistor, exhaust clearance",
      signedBy: "Sarah Chen",
    },
  ],
  toolboxTalks: [
    {
      date: "May 05",
      topic: "Heat stress awareness",
      lead: "Safety Officer",
      attendance: 82,
    },
    {
      date: "May 04",
      topic: "LOTO procedures — live energization",
      lead: "Safety Officer",
      attendance: 91,
    },
    {
      date: "May 03",
      topic: "Arc flash refresher · 40 cal PPE",
      lead: "Safety Officer",
      attendance: 78,
    },
    {
      date: "May 01",
      topic: "Rigging and crane safety",
      lead: "Safety Officer",
      attendance: 64,
    },
    {
      date: "Apr 30",
      topic: "Confined space re-certification",
      lead: "Safety Officer",
      attendance: 45,
    },
  ],
  evacuation: {
    rallyPoint: "East parking lot · Gate 4A · 200ft from main entrance",
    routes: [
      "Floor 1 (MER-A/B): Exit through East corridor → Gate 4A",
      "Floor 2-3: Emergency stairs Bay C → Ground → Gate 4A",
      "Yard / outdoor: Walk to Gate 4A, do not re-enter",
    ],
    headcount: 142,
    lastDrill: "Mar 12, 2026",
    nextDrill: "Jun 04, 2026",
  },
  osha: [
    {
      code: "OSHA 1910.333",
      title: "Selection and use of work practices",
      summary:
        "All energized electrical work requires LOTO verification, PPE CAT rating, and two-person rule.",
    },
    {
      code: "OSHA 1926.417",
      title: "Lockout and tagging of circuits",
      summary:
        "Construction LOTO — all circuits must be de-energized and tagged before work begins.",
    },
  ],
  nfpa: [
    {
      code: "NFPA 70E 130.5",
      title: "Arc flash risk assessment",
      summary:
        "Perform incident energy analysis for all equipment ≥ 50V before energizing.",
    },
    {
      code: "NFPA 110 §7",
      title: "Emergency power system installation",
      summary:
        "Generator testing: 30min at 100% nameplate load minimum for acceptance.",
    },
  ],
  emergencyLog: [
    {
      time: "07:12",
      event: "All clear — daily startup walk complete",
      by: "Safety Officer",
    },
    {
      time: "06:45",
      event: "Personnel count confirmed: 142 on site",
      by: "Gate security",
    },
    {
      time: "00:00",
      event: "Night shift handoff — no incidents",
      by: "Night super",
    },
  ],
};

const FSE_SEQUENCE = [
  { step: 1, phase: "L1", label: "Factory Acceptance Test", status: "done" },
  { step: 2, phase: "L2.01", label: "Rough-in complete", status: "done" },
  { step: 3, phase: "L2.03", label: "Set in place", status: "done" },
  { step: 4, phase: "L2.04", label: "Termination", status: "done" },
  { step: 5, phase: "L2.05a", label: "Trade pre-energization", status: "done" },
  {
    step: 6,
    phase: "L2.05b",
    label: "Vendor pre-energization",
    status: "active",
  },
  { step: 7, phase: "L3", label: "Energization", status: "todo" },
  { step: 8, phase: "L4/L5", label: "Load bank / IST", status: "todo" },
];

// ─── Role → Lens ──────────────────────────────────────────────────────────────

const ROLE_LENS = {
  gc_pm: "gc_pm",
  gc_admin: "gc_pm",
  SUPERADMIN: "gc_pm",
  executive: "gc_pm",
  superintendent: "gc_sup",
  qa_manager: "gc_qaqc",
  safety_officer: "safety",
  finance: "finance",
  oem_pm: "oem_pm",
  oem_admin: "oem_pm",
  fsm: "fsm",
  fse: "fse",
  ASP: "trade",
};
const getLens = (role) => ROLE_LENS[role] || "gc_pm";

// ─── Micro-components ─────────────────────────────────────────────────────────

const s = {
  card: {
    background: "var(--rf-bg2)",
    border: "1px solid var(--rf-border)",
    borderRadius: 10,
    padding: "14px 16px",
    marginBottom: 14,
  },
  txt: { color: "var(--rf-txt)" },
  txt2: { color: "var(--rf-txt2)" },
  txt3: { color: "var(--rf-txt3)" },
  border: { borderBottom: "1px solid var(--rf-border)" },
  mono: { fontFamily: "monospace" },
};

function Card({ children, style }) {
  return <div style={{ ...s.card, ...style }}>{children}</div>;
}

function KPI({ label, value, unit, delta, tone }) {
  const tops = {
    brand: "var(--rf-accent)",
    green: "var(--rf-green)",
    amber: "var(--rf-yellow)",
    red: "var(--rf-red)",
  };
  return (
    <div
      style={{
        ...s.card,
        marginBottom: 0,
        borderTop: tops[tone] ? `2px solid ${tops[tone]}` : undefined,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1, ...s.txt }}>
        {value}
        {unit && (
          <span
            style={{ fontSize: 13, fontWeight: 500, ...s.txt3, marginLeft: 3 }}
          >
            {unit}
          </span>
        )}
      </div>
      {delta && (
        <div style={{ fontSize: 12, marginTop: 4, ...s.txt2 }}>{delta}</div>
      )}
    </div>
  );
}

function KPIs({ children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
        gap: 12,
        marginBottom: 20,
      }}
    >
      {children}
    </div>
  );
}

function SecH({ children, action, onClick }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        margin: "20px 0 10px",
        fontWeight: 700,
        fontSize: 13,
        ...s.txt,
        ...s.border,
        paddingBottom: 8,
      }}
    >
      <span>{children}</span>
      {action && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--rf-accent)",
            cursor: "pointer",
          }}
          onClick={onClick}
        >
          {action}
        </span>
      )}
    </div>
  );
}

function Feed({ time, icon, who, action, target, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 0",
        ...s.border,
      }}
    >
      {time && (
        <div
          style={{
            fontSize: 11,
            width: 34,
            flexShrink: 0,
            paddingTop: 2,
            ...s.txt3,
          }}
        >
          {time}
        </div>
      )}
      {icon && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "var(--rf-bg3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, ...s.txt }}>
          <strong>{who}</strong>
          {action ? ` ${action}` : ""}
        </div>
        {target && (
          <div style={{ fontSize: 12, marginTop: 2, ...s.txt2 }}>{target}</div>
        )}
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

function Tag({ children, tone = "gray" }) {
  const map = {
    gray: ["var(--rf-bg3)", "var(--rf-txt2)", "var(--rf-border)"],
    green: ["rgba(34,197,94,0.12)", "var(--rf-green)", "var(--rf-green)"],
    amber: ["rgba(255,204,0,0.12)", "var(--rf-yellow)", "var(--rf-yellow)"],
    red: ["rgba(240,69,69,0.12)", "var(--rf-red)", "var(--rf-red)"],
    teal: ["rgba(0,212,200,0.12)", "var(--rf-teal)", "var(--rf-teal)"],
    brand: ["var(--rf-glow)", "var(--rf-accent)", "var(--rf-accent)"],
    purple: ["rgba(153,102,255,0.12)", "var(--rf-purple)", "var(--rf-purple)"],
  };
  const [bg, color, border] = map[tone] || map.gray;
  return (
    <span
      style={{
        background: bg,
        color,
        border: `1px solid ${border}`,
        borderRadius: 5,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Bar({ pct, tone }) {
  const c =
    {
      brand: "var(--rf-accent)",
      green: "var(--rf-green)",
      amber: "var(--rf-yellow)",
      red: "var(--rf-red)",
    }[tone] || "var(--rf-accent)";
  return (
    <div
      style={{
        background: "var(--rf-bg3)",
        borderRadius: 4,
        height: 6,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.min(100, pct)}%`,
          height: "100%",
          background: c,
          borderRadius: 4,
        }}
      />
    </div>
  );
}

function Banner({ icon = "", tone = "brand", children }) {
  const map = {
    brand: ["var(--rf-glow)", "var(--rf-border2)", "var(--rf-accent)"],
    amber: ["rgba(255,204,0,0.08)", "var(--rf-yellow)", "var(--rf-yellow)"],
    green: ["rgba(34,197,94,0.08)", "var(--rf-green)", "var(--rf-green)"],
    red: ["rgba(240,69,69,0.08)", "var(--rf-red)", "var(--rf-red)"],
  };
  const [bg, border] = map[tone] || map.brand;
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 16,
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        fontSize: 13,
        ...s.txt2,
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function Grid2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {children}
    </div>
  );
}

function Tbl({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={s.border}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 10px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 700,
                  ...s.txt3,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={s.border}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: "8px 10px",
                    ...s.txt,
                    verticalAlign: "top",
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PH({ title, subtitle, actions }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 20,
        paddingBottom: 16,
        ...s.border,
      }}
    >
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, ...s.txt }}>
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: 13,
              margin: "4px 0 0",
              maxWidth: 560,
              lineHeight: 1.5,
              ...s.txt2,
            }}
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
          {actions}
        </div>
      )}
    </div>
  );
}

function Btn({ children, primary, sm, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: primary ? "var(--rf-accent)" : "var(--rf-bg3)",
        color: primary ? "#fff" : "var(--rf-txt)",
        border: primary ? "none" : "1px solid var(--rf-border2)",
        borderRadius: 7,
        padding: sm ? "5px 12px" : "7px 14px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        boxShadow: primary ? "0 2px 8px var(--rf-glow)" : "none",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function PhaseBar() {
  const phases = [
    ["L1 · FAT", "done"],
    ["L2 · INSTALL", "done"],
    ["L3 · ENERGIZE", "active"],
    ["L4 · LOAD BANK", "todo"],
    ["L5 · IST", "todo"],
  ];
  return (
    <div style={{ display: "flex", gap: 6, margin: "10px 0" }}>
      {phases.map(([label, st]) => {
        const bg =
          st === "done"
            ? "var(--rf-green)"
            : st === "active"
              ? "var(--rf-accent)"
              : "var(--rf-bg3)";
        const color = st === "todo" ? "var(--rf-txt3)" : "#fff";
        return (
          <div
            key={label}
            style={{
              flex: 1,
              background: bg,
              color,
              borderRadius: 6,
              padding: "6px 8px",
              textAlign: "center",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

// ─── Invite Company Modal ─────────────────────────────────────────────────────

function InviteTemplateCard({ tone, icon, title, subtitle, onClick }) {
  const tones = {
    blue: {
      bg: "color-mix(in srgb, var(--rf-accent) 10%, var(--rf-bg2))",
      border: "color-mix(in srgb, var(--rf-accent) 35%, var(--rf-border))",
      chip: "var(--rf-accent)",
    },
    orange: {
      bg: "color-mix(in srgb, var(--rf-orange) 10%, var(--rf-bg2))",
      border: "color-mix(in srgb, var(--rf-orange) 35%, var(--rf-border))",
      chip: "var(--rf-orange)",
    },
    purple: {
      bg: "color-mix(in srgb, var(--rf-purple) 10%, var(--rf-bg2))",
      border: "color-mix(in srgb, var(--rf-purple) 35%, var(--rf-border))",
      chip: "var(--rf-purple)",
    },
  };
  const t = tones[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 10,
        padding: "14px 14px 12px",
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: t.chip,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, ...s.txt }}>{title}</div>
        <div style={{ fontSize: 12, marginTop: 2, ...s.txt3 }}>{subtitle}</div>
      </div>
    </button>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 6,
          ...s.txt2,
        }}
      >
        {label}
        {required && <span style={{ color: "var(--rf-red)" }}> *</span>}
        {hint && (
          <span style={{ fontWeight: 400, ...s.txt3 }}> {hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "var(--rf-bg)",
  border: "1px solid var(--rf-border2)",
  borderRadius: 7,
  padding: "9px 11px",
  fontSize: 13,
  color: "var(--rf-txt)",
  outline: "none",
  boxSizing: "border-box",
};

function InviteCompanyModal({ open, onClose }) {
  const [form, setForm] = useState({
    companyName: "",
    companyType: "Subcontractor",
    email: "",
    phone: "",
  });

  if (!open) return null;

  const update = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyTemplate = (type) =>
    setForm((f) => ({ ...f, companyType: type }));

  const handleSubmit = () => {
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 9, 26, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 12,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "18px 20px 14px",
            borderBottom: "1px solid var(--rf-border)",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, ...s.txt }}>
              Invite Company
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, ...s.txt2 }}>
              Send invitations to companies to join your project network
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--rf-txt3)",
              fontSize: 22,
              lineHeight: 1,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        <div>
          {/* Quick Templates */}
          <div style={{ padding: "16px 20px 4px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                ...s.txt3,
                marginBottom: 10,
              }}
            >
              Quick Invite Templates
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <InviteTemplateCard
                tone="blue"
                title="Trusted Subcontractor"
                subtitle="Pre-approved partner"
                onClick={() => applyTemplate("Subcontractor")}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2l8 4v6c0 5-3.5 9.3-8 10-4.5-.7-8-5-8-10V6l8-4z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
              <InviteTemplateCard
                tone="orange"
                title="Material Vendor"
                subtitle="Supply chain partner"
                onClick={() => applyTemplate("Vendor")}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 7l9-4 9 4-9 4-9-4z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 7v10l9 4 9-4V7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 11v10"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                }
              />
              <InviteTemplateCard
                tone="purple"
                title="Equipment Rental"
                subtitle="Equipment provider"
                onClick={() => applyTemplate("Equipment Rental")}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M2 7h11v9H2z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M13 10h5l3 3v3h-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <circle cx="6.5" cy="17.5" r="1.8" fill="currentColor" />
                    <circle cx="17.5" cy="17.5" r="1.8" fill="currentColor" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Company Information */}
          <div style={{ padding: "18px 20px 4px" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                ...s.txt3,
                marginBottom: 12,
              }}
            >
              Company Information
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <Field label="Company Name" required>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={update("companyName")}
                  placeholder="Enter company name"
                  style={inputStyle}
                />
              </Field>
              <Field label="Company Type">
                <select
                  value={form.companyType}
                  onChange={update("companyType")}
                  style={inputStyle}
                >
                  <option>Subcontractor</option>
                  <option>Vendor</option>
                  <option>Equipment Rental</option>
                  <option>Consultant</option>
                  <option>OEM</option>
                </select>
              </Field>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Field label="Primary Contact Email" required>
                <input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="company@example.com"
                  style={inputStyle}
                />
              </Field>
              <Field label="Contact Phone" hint="(optional)">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  placeholder="+1 (555) 123-4567"
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              padding: "18px 20px",
              marginTop: 8,
              borderTop: "1px solid var(--rf-border)",
            }}
          >
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn primary onClick={handleSubmit}>
              Send Invitation
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Status Report Modal ──────────────────────────────────────────────────────

function SectionCard({ tone, icon, title, count, children, action }) {
  const tones = {
    orange: "var(--rf-orange)",
    blue: "var(--rf-accent)",
    green: "var(--rf-green)",
    yellow: "var(--rf-yellow)",
    red: "var(--rf-red)",
    purple: "var(--rf-purple)",
  };
  const accent = tones[tone] || "var(--rf-accent)";
  return (
    <div
      style={{
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: `color-mix(in srgb, ${accent} 18%, var(--rf-bg2))`,
              color: accent,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
          <strong style={{ fontSize: 13, ...s.txt }}>{title}</strong>
          {typeof count !== "undefined" && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 99,
                background: `color-mix(in srgb, ${accent} 18%, var(--rf-bg2))`,
                color: accent,
              }}
            >
              {count}
            </span>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusReportModal({ open, onClose, projectName }) {
  const [form, setForm] = useState({
    project: projectName || "MSFT Data Center – Sterling DC1",
    date: "",
    dayNo: 1,
    work: "",
    manpower: 0,
    material: "Available",
    hours: "",
    equipment: "",
  });

  if (!open) return null;

  const update = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const sparkle = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"
        fill="currentColor"
      />
      <path
        d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 9, 26, 0.55)",
        backdropFilter: "blur(2px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 820,
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 12,
          boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "18px 20px 14px",
            borderBottom: "1px solid var(--rf-border)",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background:
                  "color-mix(in srgb, var(--rf-green) 18%, var(--rf-bg2))",
                color: "var(--rf-green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    ...s.txt,
                  }}
                >
                  Daily Status Report
                </h3>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 99,
                    background:
                      "color-mix(in srgb, var(--rf-green) 15%, var(--rf-bg2))",
                    color: "var(--rf-green)",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--rf-green)",
                    }}
                  />
                  Auto-Saved
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13, ...s.txt2 }}>
                Update your daily project status — your work auto-saves as you
                type
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--rf-purple)",
                color: "#fff",
                border: "none",
                borderRadius: 7,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {sparkle}
              Generate AI Report
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--rf-txt3)",
                fontSize: 22,
                lineHeight: 1,
                cursor: "pointer",
                padding: 4,
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: "16px 20px" }}>
          {/* Project Info */}
          <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
            <Field label="Project">
              <select
                value={form.project}
                onChange={update("project")}
                style={inputStyle}
              >
                <option>MSFT Data Center – Sterling DC1</option>
                <option>AWS Region Build – Ashburn</option>
                <option>Meta DC – Eagle Mountain</option>
              </select>
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={update("date")}
                style={inputStyle}
              />
            </Field>
            <div style={{ width: 110, flexShrink: 0 }}>
              <Field label="Day No">
                <input
                  type="number"
                  min={1}
                  value={form.dayNo}
                  onChange={update("dayNo")}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>

          {/* Work Performed Today */}
          <div style={{ marginBottom: 14 }}>
            <SectionCard
              tone="orange"
              title="Work Performed Today"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h12M4 12h16M4 18h10"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              }
              action={
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "var(--rf-purple)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {sparkle}
                    AI Assist
                  </button>
                  <button
                    type="button"
                    style={{
                      background: "var(--rf-bg3)",
                      color: "var(--rf-txt)",
                      border: "1px solid var(--rf-border2)",
                      borderRadius: 6,
                      padding: "5px 10px",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Insert Template
                  </button>
                </div>
              }
            >
              <textarea
                value={form.work}
                onChange={update("work")}
                placeholder="Add work performed today..."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", minHeight: 88 }}
              />
            </SectionCard>
          </div>

          {/* Manpower + Material */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <SectionCard
              tone="blue"
              title="Manpower On-Site"
              count={form.manpower}
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="9"
                    cy="8"
                    r="3.2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="17"
                    cy="9"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M15 19c0-2.5 1.8-4.5 4-4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
            >
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  min={0}
                  value={form.manpower}
                  onChange={update("manpower")}
                  style={inputStyle}
                />
                <button
                  type="button"
                  style={{
                    background: "var(--rf-accent)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 7,
                    padding: "0 14px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add
                </button>
              </div>
            </SectionCard>

            <SectionCard
              tone="green"
              title="Material Status"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 7l9-4 9 4-9 4-9-4z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 7v10l9 4 9-4V7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            >
              <select
                value={form.material}
                onChange={update("material")}
                style={inputStyle}
              >
                <option>Available</option>
                <option>Partially Available</option>
                <option>Shortage</option>
                <option>Awaiting Delivery</option>
              </select>
            </SectionCard>
          </div>

          {/* Hours Worked */}
          <div style={{ marginBottom: 14 }}>
            <SectionCard
              tone="yellow"
              title="Hours Worked"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 7v5l3 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              }
            >
              <input
                type="text"
                value={form.hours}
                onChange={update("hours")}
                placeholder="e.g. 8.5"
                style={inputStyle}
              />
            </SectionCard>
          </div>

          {/* Equipment Used */}
          <div>
            <SectionCard
              tone="red"
              title="Equipment Used"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 7h11v9H2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M13 10h5l3 3v3h-8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <circle cx="6.5" cy="17.5" r="1.8" fill="currentColor" />
                  <circle cx="17.5" cy="17.5" r="1.8" fill="currentColor" />
                </svg>
              }
            >
              <input
                type="text"
                value={form.equipment}
                onChange={update("equipment")}
                placeholder="List equipment used..."
                style={inputStyle}
              />
            </SectionCard>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "14px 20px",
            borderTop: "1px solid var(--rf-border)",
          }}
        >
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary onClick={onClose}>
            Submit Report
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboards ───────────────────────────────────────────────────────────────

function DashGCPM({ user, router }) {
  const pr = PROJECT;
  const name = user?.firstName || "there";
  const [inviteOpen, setInviteOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  return (
    <div>
      <PH
        title={`Hi ${name}`}
        subtitle={`Here's the program view for <b>${pr.code}</b>. As GC PM you own the whole project — every company, every phase, every checklist.`}
        actions={
          <>
            <Btn onClick={() => setStatusOpen(true)}>Status report</Btn>
            <Btn primary onClick={() => setInviteOpen(true)}>
              + Invite company
            </Btn>
          </>
        }
      />
      <InviteCompanyModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
      <StatusReportModal
        open={statusOpen}
        onClose={() => setStatusOpen(false)}
        projectName={pr.name}
      />
      <KPIs>
        <KPI
          label="Assets energized"
          value={pr.energized}
          unit={`/${pr.assets}`}
          delta="+8 this week"
          tone="brand"
        />
        <KPI
          label="Open RFIs"
          value={pr.rfis.open}
          unit={`/${pr.rfis.total}`}
          delta="4 awaiting customer"
          tone="amber"
        />
        <KPI
          label="Critical issues"
          value={pr.issues.critical}
          unit={`/${pr.issues.open} open`}
          delta="last 2h"
          tone="red"
        />
        <KPI
          label="Budget burned"
          value={`$${pr.budget.spent}M`}
          unit={`/$${pr.budget.total}M`}
          delta={`${Math.round((pr.budget.spent / pr.budget.total) * 100)}%`}
          tone="green"
        />
      </KPIs>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <strong style={s.txt}>Phase progress</strong>
          <span style={{ fontSize: 12, ...s.txt3 }}>
            {pr.pct}% · {pr.phase}
          </span>
        </div>
        <PhaseBar />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 8,
            fontSize: 11,
            ...s.txt3,
            fontFamily: "monospace",
          }}
        >
          <span>Jan 15, 2026</span>
          <span style={{ color: "var(--rf-accent)", fontWeight: 700 }}>
            Today · May 12
          </span>
          <span>{pr.end}</span>
        </div>
      </Card>
      <Grid2>
        <div>
          <SecH action="View all →" onClick={() => router.push("/Companies")}>
            Companies on this project
          </SecH>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {Object.values(COMPANIES)
              .slice(0, 6)
              .map((c) => (
                <Card
                  key={c.id}
                  style={{
                    cursor: "pointer",
                    padding: "12px 14px",
                    marginBottom: 0,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, ...s.txt }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, marginBottom: 8, ...s.txt3 }}>
                    {c.label}
                  </div>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, ...s.txt }}>
                        {c.headcount}
                      </div>
                      <div style={{ fontSize: 10, ...s.txt3 }}>people</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, ...s.txt }}>
                        {c.checklists}
                      </div>
                      <div style={{ fontSize: 10, ...s.txt3 }}>checklists</div>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
        <div>
          <SecH>Latest activity</SecH>
          <Card>
            {ACTIVITY.map((a, i) => (
              <Feed
                key={i}
                time={a.time}
                icon={a.icon}
                who={a.who}
                action={a.action}
                target={a.target}
              />
            ))}
          </Card>
        </div>
      </Grid2>
    </div>
  );
}

function DashGCSup({ user }) {
  const trades = [
    ["Rough-In", 93, "brand"],
    ["Set in Place", 69, "green"],
    ["Termination", 45, "amber"],
    ["LOTO/Safety", 41, "red"],
    ["NETA Test", 30, "purple"],
  ];
  return (
    <div>
      <PH
        title={`Field execution · ${user?.firstName || "Superintendent"}'s view`}
        subtitle="As Superintendent you drive trade work and CFCI accountability. Rough-in, SIP, termination, LOTO, NETA — all feed into progress."
      />
      <KPIs>
        <KPI
          label="Personnel on site"
          value={142}
          delta="across 9 trades"
          tone="brand"
        />
        <KPI label="Days no incident" value={142} delta="YTD" tone="green" />
        <KPI label="Open RFIs" value={12} tone="amber" />
        <KPI label="Active LOTO permits" value={12} />
      </KPIs>
      <SecH>Trade work progress · 5 phases</SecH>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10,
        }}
      >
        {trades.map(([name, pct, tone]) => (
          <Card key={name} style={{ cursor: "pointer", marginBottom: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                ...s.txt3,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {name}
            </div>
            <div
              style={{ fontSize: 28, fontWeight: 800, ...s.txt, marginTop: 6 }}
            >
              {pct}
              <span style={{ fontSize: 13, fontWeight: 500, ...s.txt3 }}>
                %
              </span>
            </div>
            <Bar pct={pct} tone={tone} />
          </Card>
        ))}
      </div>
      <SecH>Today's coordination</SecH>
      <Card>
        {ACTIVITY.slice(0, 5).map((a, i) => (
          <Feed
            key={i}
            time={a.time}
            icon={a.icon}
            who={a.who}
            action={a.action}
            target={a.target}
          />
        ))}
      </Card>
    </div>
  );
}

function DashSafety() {
  const sd = SAFETY_DATA;
  return (
    <div>
      <PH
        title="Safety dashboard"
        subtitle="Daily near-miss log, JHAs, AHAs, OSHA + NFPA references, toolbox talks, evacuation plan, emergency log."
        actions={
          <>
            <Btn onClick={() => {}}>Report incident</Btn>
            <Btn primary onClick={() => {}}>
              + New JHA
            </Btn>
          </>
        }
      />
      <KPIs>
        <KPI label="Days no recordable" value={142} delta="YTD" tone="green" />
        <KPI
          label="On site today"
          value={sd.evacuation.headcount}
          delta="all badged in"
        />
        <KPI label="Open LOTO permits" value={12} tone="amber" />
        <KPI label="JHAs current" value={sd.jhas.length} />
      </KPIs>
      <Banner tone="green" icon="">
        <strong>Site is GREEN — 142 days without recordable incident.</strong>{" "}
        All toolbox talks current · all LOTO permits logged · 0 near-misses last
        7 days.
      </Banner>
      <Grid2>
        <div>
          <SecH>Job Hazard Analyses</SecH>
          <Card>
            {sd.jhas.map((j) => (
              <Feed
                key={j.id}
                icon=""
                who={j.title}
                target={`${j.trade} · ${j.hazards.join(" · ")}`}
                right={<Tag tone="gray">{j.last}</Tag>}
              />
            ))}
          </Card>
          <SecH>Activity Hazard Analyses</SecH>
          <Card>
            {sd.ahas.map((a, i) => (
              <Feed
                key={i}
                icon={a.signedBy === "Pending" ? "" : ""}
                who={a.activity}
                target={`${a.date} · lead: ${a.leadCo} · ${a.controls}`}
                right={
                  <Tag tone={a.signedBy === "Pending" ? "amber" : "green"}>
                    {a.signedBy}
                  </Tag>
                }
              />
            ))}
          </Card>
          <SecH>Toolbox talks (last 5)</SecH>
          <Card>
            {sd.toolboxTalks.map((t, i) => (
              <Feed
                key={i}
                time={t.date}
                icon=""
                who={t.topic}
                target={`${t.lead} · ${t.attendance} attended`}
              />
            ))}
          </Card>
        </div>
        <div>
          <SecH>Evacuation plan</SecH>
          <Card>
            <div
              style={{
                padding: "10px 12px",
                background: "rgba(240,69,69,0.08)",
                borderLeft: "4px solid var(--rf-red)",
                borderRadius: 6,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  color: "var(--rf-red)",
                }}
              >
                RALLY POINT
              </div>
              <div style={{ fontSize: 13, marginTop: 4, ...s.txt2 }}>
                {sd.evacuation.rallyPoint}
              </div>
            </div>
            {sd.evacuation.routes.map((r, i) => (
              <div
                key={i}
                style={{
                  fontSize: 12,
                  padding: "6px 0",
                  ...s.border,
                  ...s.txt2,
                }}
              >
                {r}
              </div>
            ))}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                ...s.txt3,
                paddingTop: 10,
                borderTop: "1px solid var(--rf-border)",
              }}
            >
              <span>
                Last drill:{" "}
                <strong style={s.txt}>{sd.evacuation.lastDrill}</strong>
              </span>
              <span>
                Next:{" "}
                <strong style={{ color: "var(--rf-accent)" }}>
                  {sd.evacuation.nextDrill}
                </strong>
              </span>
            </div>
          </Card>
          <SecH>OSHA / NFPA references</SecH>
          <Card>
            {[...sd.osha, ...sd.nfpa].map((r, i) => (
              <Feed
                key={i}
                icon={
                  <span
                    style={{
                      ...s.mono,
                      fontSize: 10,
                      fontWeight: 700,
                      background: "var(--rf-glow)",
                      color: "var(--rf-accent)",
                      padding: "3px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {r.code}
                  </span>
                }
                who={r.title}
                target={r.summary}
              />
            ))}
          </Card>
          <SecH>⏱ Emergency log</SecH>
          <Card>
            {sd.emergencyLog.map((e, i) => (
              <Feed
                key={i}
                time={e.time}
                icon="●"
                who={e.event}
                target={e.by}
              />
            ))}
          </Card>
        </div>
      </Grid2>
    </div>
  );
}

function DashFinance() {
  const pr = PROJECT;
  const subs = [
    ["Rosendin Electric", "$8.4M", "$5.2M", "$4.8M", "$0.4M"],
    ["McKinstry", "$3.2M", "$1.8M", "$1.6M", "$0.2M"],
    ["Shermco", "$0.8M", "$0.5M", "$0.5M", "$0"],
    ["Delta Electronics", "$5.4M", "$3.2M", "$3.2M", "$0"],
    ["Caterpillar", "$2.8M", "$2.1M", "$1.4M", "$0.7M"],
  ];
  return (
    <div>
      <PH
        title="Finance & billing"
        subtitle="Project commercial — budget burn, billing chain, change orders, AR/AP."
      />
      <KPIs>
        <KPI label="Budget authorized" value={`$${pr.budget.total}M`} />
        <KPI
          label="Spent to date"
          value={`$${pr.budget.spent}M`}
          unit={`/${Math.round((pr.budget.spent / pr.budget.total) * 100)}%`}
          tone="amber"
        />
        <KPI
          label="Change orders"
          value={14}
          unit="approved"
          delta="$2.1M total"
        />
        <KPI label="AR open" value="$3.4M" />
      </KPIs>
      <Card>
        <div
          style={{ fontWeight: 700, fontSize: 14, ...s.txt, marginBottom: 12 }}
        >
          Subcontractor billing
        </div>
        <Tbl
          headers={["Trade", "Contracted", "Billed", "Paid", "Open"]}
          rows={subs.map(([n, c, b, p, o]) => [
            <strong>{n}</strong>,
            <span style={s.mono}>{c}</span>,
            <span style={s.mono}>{b}</span>,
            <span style={s.mono}>{p}</span>,
            <strong style={s.mono}>{o}</strong>,
          ])}
        />
      </Card>
    </div>
  );
}

function DashOEMPM({ user }) {
  const co = COMPANIES.delta;
  const myUnits = EQUIPMENT.filter((e) => e.owner === co.id);
  return (
    <div>
      <PH
        title={`${co.name} fleet command`}
        subtitle={`As OEM National PM you see all sites where ${co.name} has ${co.oemClass || "equipment"} deployed.`}
        actions={
          <>
            <Btn onClick={() => {}}>+ Dispatch FSE</Btn>
            <Btn primary onClick={() => {}}>
              Fleet overview
            </Btn>
          </>
        }
      />
      <KPIs>
        <KPI label="Active sites" value={8} tone="amber" />
        <KPI label="Units deployed" value={142} />
        <KPI label="In commissioning" value={76} />
        <KPI label="In warranty" value={28} tone="green" />
      </KPIs>
      <SecH>Equipment at {PROJECT.code}</SecH>
      <Card>
        {myUnits.map((e) => (
          <Feed
            key={e.id}
            icon=""
            who={e.id}
            action={`· ${e.name}`}
            target={e.hall}
            right={
              <Tag
                tone={
                  e.stage === "COMMISSIONED"
                    ? "green"
                    : e.stage === "ON_SITE"
                      ? "amber"
                      : "gray"
                }
              >
                {e.stage}
              </Tag>
            }
          />
        ))}
      </Card>
      <SecH>Latest activity</SecH>
      <Card>
        {ACTIVITY.slice(0, 4).map((a, i) => (
          <Feed
            key={i}
            time={a.time}
            icon={a.icon}
            who={a.who}
            action={a.action}
            target={a.target}
          />
        ))}
      </Card>
    </div>
  );
}

function DashFSM({ user }) {
  const co = COMPANIES.delta;
  const myEquip = EQUIPMENT.filter(
    (e) => e.owner === co.id && e.stage === "ON_SITE",
  );
  return (
    <div>
      <PH
        title={`${user?.firstName || "FSM"}'s FSE dispatch desk`}
        subtitle="As Field Service Manager you dispatch FSEs to sites. L2.05b vendor pre-energization. L4 load bank windows. Crew rotation."
      />
      <KPIs>
        <KPI
          label="FSEs deployed"
          value={3}
          delta="5 on rotation"
          tone="amber"
        />
        <KPI label="L2.05b pending" value={myEquip.length} />
        <KPI label="L4 scheduled" value={2} delta="May 8 + May 12" />
        <KPI label="Warranty open" value={3} tone="green" />
      </KPIs>
      <SecH>L2.05b pre-energization · awaiting dispatch</SecH>
      <Card>
        {myEquip.map((e) => (
          <Feed
            key={e.id}
            time={<span style={{ ...s.mono, fontSize: 10 }}>{e.id}</span>}
            icon=""
            who={e.name}
            target={`${e.hall} · pigtails: ${e.pigtails ? "staged" : "pending"}`}
            right={
              <Btn primary sm onClick={() => {}}>
                + Dispatch
              </Btn>
            }
          />
        ))}
      </Card>
      <SecH>FSE crew rotation</SecH>
      <Card>
        <Tbl
          headers={["FSE", "Site", "Day", "Replacement", "Status"]}
          rows={[
            [
              <strong>Aaron Wright</strong>,
              "MSFT-DC1",
              "Day 8/10",
              "Marcus Lee · May 7",
              <Tag tone="green">ACTIVE</Tag>,
            ],
            [
              <strong>Jeff Coufal</strong>,
              "MSFT-DC1",
              "Day 4/14",
              "—",
              <Tag tone="green">ACTIVE</Tag>,
            ],
            [
              <strong>Marcus Lee</strong>,
              "—",
              "—",
              "—",
              <Tag tone="gray">STANDBY</Tag>,
            ],
          ]}
        />
      </Card>
    </div>
  );
}

function DashFSE({ user }) {
  return (
    <div>
      <PH
        title="Today on site"
        subtitle="As an FSE you see ONE site, ONE assignment, today's tasks, your position in the universal 8-step sequence."
      />
      <KPIs>
        <KPI
          label="Current step"
          value="1"
          unit="of 8"
          delta="L2.05b · UPS-03"
          tone="amber"
        />
        <KPI label="Site" value="MSFT-DC1" delta="Day 8/10" tone="brand" />
        <KPI label="Checklist" value="0" unit="/14" />
        <KPI label="FSRs filed" value={12} tone="green" />
      </KPIs>
      <SecH>Your position in the FSE 8-step</SecH>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8,1fr)",
          gap: 8,
        }}
      >
        {FSE_SEQUENCE.map((s) => {
          const bg =
            s.status === "done"
              ? "rgba(34,197,94,0.1)"
              : s.status === "active"
                ? "rgba(255,204,0,0.12)"
                : "var(--rf-bg3)";
          const border =
            s.status === "done"
              ? "var(--rf-green)"
              : s.status === "active"
                ? "var(--rf-yellow)"
                : "var(--rf-border)";
          const vc =
            s.status === "done"
              ? "var(--rf-green)"
              : s.status === "active"
                ? "var(--rf-yellow)"
                : "var(--rf-txt3)";
          return (
            <div
              key={s.step}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: 8,
                padding: "12px 10px",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--rf-txt3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                Step {s.step}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: vc,
                  marginTop: 4,
                }}
              >
                {s.phase}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt)",
                  marginTop: 6,
                  lineHeight: 1.4,
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashCustomer({ user }) {
  const pr = PROJECT;
  const milestones = [
    {
      date: "May 06",
      day: "Tue",
      label: "L2.05b vendor pre-energization",
      co: "UPS-03 · Delta",
      urgent: true,
    },
    {
      date: "May 08",
      day: "Thu",
      label: "L4 load bank witness · 4hr",
      co: "UPS-01/02 · Delta",
      urgent: false,
    },
    {
      date: "May 12",
      day: "Mon",
      label: "GEN-02 startup test",
      co: "GEN-02 · Cat",
      urgent: false,
    },
    {
      date: "May 19",
      day: "Mon",
      label: "IST scenarios begin",
      co: "Multi-vendor",
      urgent: false,
    },
  ];
  return (
    <div>
      <PH
        title={`Customer oversight · ${user?.firstName || ""}'s view`}
        subtitle="You watch the GC, milestones, handover readiness, commercial. You don't manage execution — you accept it."
      />
      <KPIs>
        <KPI
          label="Project health"
          value="ON TRACK"
          delta="+2 days vs baseline"
          tone="green"
        />
        <KPI label="RFIs awaiting me" value={4} tone="amber" />
        <KPI label="Milestone" value="L3 · 64%" />
        <KPI label="Handover ready" value={28} unit={`/${pr.assets}`} />
      </KPIs>
      <SecH>Upcoming milestones</SecH>
      <Card>
        {milestones.map((m, i) => (
          <Feed
            key={i}
            time={
              <div>
                <div style={{ fontSize: 10, ...s.txt3, fontWeight: 700 }}>
                  {m.day}
                </div>
                <div style={{ ...s.mono, fontSize: 12, fontWeight: 600 }}>
                  {m.date}
                </div>
              </div>
            }
            icon={m.urgent ? "⏰" : "◷"}
            who={m.label}
            target={m.co}
            right={m.urgent ? <Tag tone="amber">URGENT</Tag> : undefined}
          />
        ))}
      </Card>
    </div>
  );
}

function DashTrade({ user }) {
  const co = COMPANIES.rosendin;
  const myTasks = TRADE_TASKS.filter((t) => t.company === co.id);
  const myMats = MATERIALS.filter((m) => m.company === co.id);
  const overall = myTasks.length
    ? Math.round(myTasks.reduce((acc, t) => acc + t.pct, 0) / myTasks.length)
    : 0;
  return (
    <div>
      <PH
        title={`${co.name} · ${user?.activeRole?.name?.replace(/_/g, " ") || "Trade PM"}`}
        subtitle="You think in <b>work</b>: rough-in, set-in-place, termination — not L2.0x labels."
        actions={
          <>
            <Btn onClick={() => {}}>Procurement</Btn>
            <Btn primary onClick={() => {}}>
              Phase reference
            </Btn>
          </>
        }
      />
      <KPIs>
        <KPI
          label="Active tasks"
          value={myTasks.length}
          delta={`${myTasks.filter((t) => t.status !== "closed").length} open`}
        />
        <KPI label="Overall progress" value={overall} unit="%" tone="amber" />
        <KPI label="Crew on site" value={co.headcount} tone="green" />
        <KPI
          label="Materials in transit"
          value={
            myMats.filter(
              (m) => m.status === "in_transit" || m.status === "pending",
            ).length
          }
        />
      </KPIs>
      <SecH>Active work items</SecH>
      <Card>
        {myTasks.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              ...s.border,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, ...s.txt }}>
                {t.name}
              </div>
              <div style={{ fontSize: 11, marginTop: 2, ...s.txt2 }}>
                {t.asset} · {t.location} · {t.crew}
              </div>
            </div>
            <div style={{ width: 100 }}>
              <Bar pct={t.pct} tone="amber" />
              <div style={{ fontSize: 10, ...s.mono, marginTop: 3, ...s.txt3 }}>
                {t.pct}%
              </div>
            </div>
            <Tag tone="gray">{t.subPhase}</Tag>
          </div>
        ))}
      </Card>
      <Grid2>
        <div>
          <SecH>Materials & procurement</SecH>
          <Card>
            {myMats.map((m, i) => (
              <Feed
                key={i}
                icon=""
                who={m.item}
                target={`${m.qty} · ${m.vendor} · PO ${m.po || "pending"}`}
                right={
                  <Tag
                    tone={
                      m.status === "delivered"
                        ? "green"
                        : m.status === "in_transit" || m.status === "pending"
                          ? "amber"
                          : "red"
                    }
                  >
                    {m.status.toUpperCase().replace("_", " ")}
                  </Tag>
                }
              />
            ))}
          </Card>
        </div>
        <div>
          <SecH>GC-tasked checklists</SecH>
          <Card>
            {TASKINGS.filter((t) => t.taskedTo === co.id).length === 0 ? (
              <div
                style={{
                  padding: 14,
                  ...s.txt3,
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                No taskings assigned.
              </div>
            ) : (
              TASKINGS.filter((t) => t.taskedTo === co.id).map((t, i) => (
                <Feed
                  key={i}
                  icon={t.status === "closed" ? "" : ""}
                  who={t.name}
                  target={`${t.asset} · ${t.subPhase} · due ${t.due}`}
                  right={
                    <Tag
                      tone={
                        t.status === "closed"
                          ? "green"
                          : t.status === "in_prog"
                            ? "amber"
                            : "gray"
                      }
                    >
                      {t.status.toUpperCase().replace("_", " ")}
                    </Tag>
                  }
                />
              ))
            )}
          </Card>
        </div>
      </Grid2>
    </div>
  );
}

function DashGCQAQC({ user }) {
  const open = TASKINGS.filter((t) => t.status !== "closed");
  const inProg = TASKINGS.filter((t) => t.status === "in_prog");
  const pssrIP = PSSR_RECORDS.filter((x) => x.status === "in_progress").length;
  const risksActive = RISK_REGISTER.filter((x) => x.status === "active").length;
  const toolkit = [
    {
      icon: "⭐",
      name: "Cx Score · Executive",
      desc: "Weighted composite KPI",
      stat: "78/100 · grade B",
    },
    {
      icon: "",
      name: "Cx Master Log",
      desc: `${EQUIPMENT.length} assets × phases`,
      stat: "Single-pane view",
    },
    {
      icon: "",
      name: "PSSR · Pre-Startup",
      desc: "OSHA 1910.119 · 6 cats · 40 items per asset",
      stat: `${pssrIP} in progress`,
    },
    {
      icon: "",
      name: "Risk Register",
      desc: `${RISK_REGISTER.length} risks tracked`,
      stat: `${risksActive} active`,
    },
    {
      icon: "",
      name: "Turnover Package",
      desc: "Final customer deliverable",
      stat: "72% ready",
    },
    {
      icon: "",
      name: "NCRs",
      desc: "Raised → CAR → closed",
      stat: `${NCRS.filter((n) => n.status !== "closed").length} open`,
    },
    {
      icon: "",
      name: "Punch List",
      desc: "Per-asset deficiency tracking",
      stat: `${PUNCH_ITEMS.filter((p) => p.status !== "closed").length} open`,
    },
    {
      icon: "",
      name: "Test Results",
      desc: "NETA acceptance · per device",
      stat: `${TEST_RESULTS.filter((t) => !t.pass).length} failures`,
    },
  ];
  return (
    <div>
      <PH
        title={`GC QA/QC · ${user?.firstName || ""}'s tasking desk`}
        subtitle="You task out checklists to every company's QA/QC and own the project's quality gate."
        actions={
          <>
            <Btn onClick={() => {}}>Phase reference</Btn>
            <Btn primary onClick={() => {}}>
              + Task out checklist
            </Btn>
          </>
        }
      />
      <SecH>⭐ GC QA/QC Toolkit</SecH>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {toolkit.map((tk) => (
          <Card
            key={tk.name}
            style={{
              cursor: "pointer",
              padding: "14px 16px",
              marginBottom: 0,
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 22 }}>{tk.icon}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, ...s.txt }}>
                {tk.name}
              </div>
              <div
                style={{
                  fontSize: 11,
                  ...s.txt3,
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {tk.desc}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--rf-accent)",
                  marginTop: 4,
                }}
              >
                {tk.stat}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <KPIs>
        <KPI label="Open taskings" value={open.length} tone="amber" />
        <KPI label="In progress" value={inProg.length} />
        <KPI label="L2.06 doc reviews" value={3} delta="my queue" />
        <KPI
          label="L2.08 clean walks"
          value={2}
          delta="scheduled"
          tone="green"
        />
      </KPIs>
      <Banner tone="brand">
        <strong>L2 sub-phase ownership.</strong> L2.01–L2.04 = trade · L2.05a =
        trade · L2.05b = OEM/vendor · L2.05c = BMS · L2.05d = mechanical ·{" "}
        <strong>L2.06 doc review = you</strong> · L2.07 = CxA punch ·{" "}
        <strong>L2.08 clean walk = you</strong>.
      </Banner>
      <SecH>Tasked checklists across all companies</SecH>
      <Card>
        <Tbl
          headers={[
            "Asset",
            "Sub-phase",
            "Checklist",
            "Tasked to",
            "Due",
            "Status",
          ]}
          rows={TASKINGS.map((tq) => {
            const co = COMPANIES[tq.taskedTo];
            return [
              <strong style={s.mono}>{tq.asset}</strong>,
              <Tag tone="gray">{tq.subPhase}</Tag>,
              tq.name,
              <div>
                <strong>{co ? co.name : tq.taskedTo}</strong>
                <div style={{ fontSize: 10, ...s.txt3 }}>{tq.taskedToRole}</div>
              </div>,
              <span style={{ ...s.mono, fontSize: 11 }}>{tq.due}</span>,
              <Tag
                tone={
                  tq.status === "closed"
                    ? "green"
                    : tq.status === "in_prog"
                      ? "amber"
                      : "gray"
                }
              >
                {tq.status.toUpperCase().replace("_", " ")}
              </Tag>,
            ];
          })}
        />
      </Card>
    </div>
  );
}

function DashProcurement({ user }) {
  const list = MATERIALS;
  return (
    <div>
      <PH
        title={`Procurement · ${user?.firstName || ""}`}
        subtitle="Materials across all trades on the project. Track POs, vendor commitments, deliveries."
        actions={
          <Btn primary onClick={() => {}}>
            + New PO
          </Btn>
        }
      />
      <KPIs>
        <KPI
          label="Not yet ordered"
          value={list.filter((m) => m.status === "requested").length}
          delta="awaiting PO"
          tone="red"
        />
        <KPI
          label="In transit"
          value={
            list.filter(
              (m) => m.status === "in_transit" || m.status === "pending",
            ).length
          }
          tone="amber"
        />
        <KPI
          label="Delivered"
          value={list.filter((m) => m.status === "delivered").length}
          tone="green"
        />
        <KPI label="Total tracked" value={list.length} />
      </KPIs>
      <SecH>Materials tracker</SecH>
      <Card>
        <Tbl
          headers={[
            "Item",
            "Qty",
            "Vendor",
            "PO",
            "Ordered",
            "ETA",
            "Status",
            "Trade",
          ]}
          rows={list.map((m) => {
            const co = COMPANIES[m.company];
            return [
              <strong>{m.item}</strong>,
              <span style={s.mono}>{m.qty}</span>,
              m.vendor,
              <span style={{ ...s.mono, fontSize: 11 }}>{m.po || "—"}</span>,
              <span style={{ ...s.mono, fontSize: 11, ...s.txt3 }}>
                {m.ordered || "—"}
              </span>,
              <span style={{ ...s.mono, fontSize: 11 }}>{m.eta || "—"}</span>,
              <Tag
                tone={
                  m.status === "delivered"
                    ? "green"
                    : m.status === "in_transit" || m.status === "pending"
                      ? "amber"
                      : "red"
                }
              >
                {m.status.toUpperCase().replace("_", " ")}
              </Tag>,
              co ? co.name : m.company,
            ];
          })}
        />
      </Card>
    </div>
  );
}

function DashGCEngineering({ user }) {
  const pr = PROJECT;
  return (
    <div>
      <PH
        title={`Project Engineering · ${user?.firstName || ""}`}
        subtitle="Engineering oversight: drawings, RFIs, submittals, design coordination."
      />
      <KPIs>
        <KPI label="Open RFIs" value={pr.rfis.open} tone="amber" />
        <KPI label="Submittals open" value={7} />
        <KPI label="Drawings revised" value={14} delta="this month" />
        <KPI label="Design closed" value={88} unit="%" tone="green" />
      </KPIs>
      <Card style={{ padding: "36px", textAlign: "center", ...s.txt3 }}>
        Drawings + RFI inbox — same content as RFI / Documents views,
        role-tailored.
        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <Btn onClick={() => {}}>Open RFIs</Btn>
          <Btn onClick={() => {}}>Open Documents</Btn>
        </div>
      </Card>
    </div>
  );
}

function DashOEMQAQC({ user }) {
  const co = COMPANIES.delta;
  const myUnits = EQUIPMENT.filter((e) => e.owner === co.id);
  const myTaskings = TASKINGS.filter((t) => t.taskedTo === co.id);
  return (
    <div>
      <PH
        title={`${co.name} OEM QA/QC · ${user?.firstName || ""}`}
        subtitle={`Verify ${co.name}'s checklists for every unit. L2.05b vendor pre-energization · L3.06 PFC · L4 load bank · L5 IST.`}
        actions={
          <Btn primary onClick={() => {}}>
            Open all checklists →
          </Btn>
        }
      />
      <KPIs>
        <KPI
          label="Open checklists"
          value={myTaskings.filter((t) => t.status !== "closed").length}
          tone="amber"
        />
        <KPI label="Units tracked" value={myUnits.length} />
        <KPI
          label="From GC tasking"
          value={myTaskings.length}
          delta={`${myTaskings.filter((t) => t.status === "open").length} not started`}
        />
        <KPI
          label="Closed YTD"
          value={myTaskings.filter((t) => t.status === "closed").length}
          tone="green"
        />
      </KPIs>
      <Grid2>
        <div>
          <SecH>GC-tasked checklists</SecH>
          <Card>
            {myTaskings.length === 0 ? (
              <div
                style={{
                  padding: 14,
                  ...s.txt3,
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                No taskings pending.
              </div>
            ) : (
              myTaskings.map((t, i) => (
                <Feed
                  key={i}
                  icon={t.status === "closed" ? "" : ""}
                  who={t.name}
                  target={`${t.asset} · ${t.subPhase} · due ${t.due}`}
                  right={
                    <Tag
                      tone={
                        t.status === "closed"
                          ? "green"
                          : t.status === "in_prog"
                            ? "amber"
                            : "gray"
                      }
                    >
                      {t.status.toUpperCase().replace("_", " ")}
                    </Tag>
                  }
                />
              ))
            )}
          </Card>
        </div>
        <div>
          <SecH>{co.name} units</SecH>
          <Card>
            {myUnits.map((u) => (
              <Feed
                key={u.id}
                icon=""
                who={u.id}
                action={`· ${u.name}`}
                target={u.hall}
                right={
                  <Tag
                    tone={
                      u.stage === "COMMISSIONED"
                        ? "green"
                        : u.stage === "ON_SITE"
                          ? "amber"
                          : "gray"
                    }
                  >
                    {u.stage}
                  </Tag>
                }
              />
            ))}
          </Card>
        </div>
      </Grid2>
    </div>
  );
}

function DashTradeQAQC({ user, assetType = "electrical" }) {
  const co = COMPANIES.rosendin;
  const isElec = assetType === "electrical";
  const myTasks = TRADE_TASKS.filter(
    (t) => t.company === co.id && t.type === assetType,
  );
  const myTaskings = TASKINGS.filter((t) => t.taskedTo === co.id);
  return (
    <div>
      <PH
        title={`${co.name} QA/QC · ${isElec ? "Electrical" : "Mechanical"} assets`}
        subtitle={`Sign off ${isElec ? "electrical" : "mechanical"} pre-energization for ${co.name}'s scope.`}
        actions={
          <>
            <Btn onClick={() => {}}>Phase reference</Btn>
            <Btn primary onClick={() => {}}>
              All checklists →
            </Btn>
          </>
        }
      />
      <KPIs>
        <KPI
          label={`${isElec ? "Electrical" : "Mechanical"} assets`}
          value={[...new Set(myTasks.map((t) => t.asset))].length}
          tone={isElec ? "amber" : "teal"}
        />
        <KPI label="Active tasks" value={myTasks.length} />
        <KPI
          label="Open"
          value={myTasks.filter((t) => t.status !== "closed").length}
          tone="amber"
        />
        <KPI
          label="Closed"
          value={myTasks.filter((t) => t.status === "closed").length}
          tone="green"
        />
      </KPIs>
      <Banner tone="brand">
        {isElec ? "" : ""} <strong>Your scope.</strong> You sign off L2.05
        {isElec ? "a" : "d"} pre-energization checklist before the OEM does
        L2.05b.
      </Banner>
      <SecH>{isElec ? "Electrical" : "Mechanical"} tasks</SecH>
      <Card>
        {myTasks.length === 0 ? (
          <div style={{ padding: 14, ...s.txt3, textAlign: "center" }}>
            No tasks of this type in your scope.
          </div>
        ) : (
          myTasks.map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                ...s.border,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, ...s.txt }}>
                  {t.name}
                </div>
                <div style={{ fontSize: 11, marginTop: 2, ...s.txt2 }}>
                  {t.asset} · {t.location} · {t.subPhase}
                </div>
              </div>
              <div style={{ width: 100 }}>
                <Bar pct={t.pct} tone="amber" />
              </div>
              <Tag tone="gray">{t.subPhase}</Tag>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

function DashCustomerQAQC({ user }) {
  const witnesses = [
    {
      date: "May 06",
      label: "L2.06 doc review · UPS-03",
      role: "Witness with HITT QA/QC",
    },
    {
      date: "May 08",
      label: "L4 load bank · UPS-01/02",
      role: "Customer witness",
    },
    {
      date: "May 12",
      label: "L4 load bank · GEN-02",
      role: "Customer witness",
    },
    {
      date: "May 19",
      label: "L5 IST scenarios begin",
      role: "Customer acceptance lead",
    },
  ];
  return (
    <div>
      <PH
        title={`Customer QA/QC · ${user?.firstName || ""}`}
        subtitle="As Microsoft's QA/QC, you witness key sign-offs and accept on the customer's behalf."
      />
      <KPIs>
        <KPI label="Witness queue" value={3} tone="amber" />
        <KPI label="Acceptance pending" value={2} />
        <KPI label="L4 windows" value={2} delta="May 8, May 12" />
        <KPI label="Accepted YTD" value={28} unit="/142" tone="green" />
      </KPIs>
      <SecH>Upcoming witness windows</SecH>
      <Card>
        {witnesses.map((w, i) => (
          <Feed
            key={i}
            time={
              <div style={{ ...s.mono, fontSize: 12, fontWeight: 600 }}>
                {w.date}
              </div>
            }
            icon="◷"
            who={w.label}
            target={w.role}
          />
        ))}
      </Card>
    </div>
  );
}

function DashBMS({ user }) {
  const co = COMPANIES.trane;
  return (
    <div>
      <PH
        title={`${co.name} · BMS scope`}
        subtitle="You own L2.05c — BMS pre-energization. Verify controls, points lists, network integration before any live data flows."
        actions={
          <Btn primary onClick={() => {}}>
            L2.05c reference →
          </Btn>
        }
      />
      <KPIs>
        <KPI
          label="Points to verify"
          value={428}
          delta="across 9 units"
          tone="amber"
        />
        <KPI label="L2.05c open" value={5} />
        <KPI label="Network drops" value={62} delta="2 pending" />
        <KPI label="Closed" value={186} tone="green" />
      </KPIs>
      <Banner tone="brand">
        <strong>L2.05c — BMS pre-energization.</strong> Before any asset is
        energized, BMS verifies monitoring points are mapped, network drops are
        live, and point-to-point integration tests pass.
      </Banner>
      <SecH>Asset BMS readiness</SecH>
      <Card>
        <Tbl
          headers={["Asset", "Points", "Mapped", "Verified", "Status"]}
          rows={EQUIPMENT.slice(0, 7).map((e, i) => {
            const pts = 40 + i * 8,
              mapped = i < 5 ? pts : Math.floor(pts * 0.6),
              verified = i < 4 ? mapped : Math.floor(mapped * 0.5);
            return [
              <strong style={s.mono}>{e.id}</strong>,
              <span style={s.mono}>{pts}</span>,
              <span style={{ ...s.mono, color: "var(--rf-green)" }}>
                {mapped}
              </span>,
              <span
                style={{
                  ...s.mono,
                  color:
                    verified === pts ? "var(--rf-green)" : "var(--rf-accent)",
                }}
              >
                {verified}/{pts}
              </span>,
              <Tag
                tone={
                  verified === pts
                    ? "green"
                    : verified > pts * 0.5
                      ? "amber"
                      : "gray"
                }
              >
                {verified === pts
                  ? "COMPLETE"
                  : verified > 0
                    ? "IN PROGRESS"
                    : "OPEN"}
              </Tag>,
            ];
          })}
        />
      </Card>
    </div>
  );
}

function DashCxA({ user }) {
  const myList = TASKINGS.filter((t) => t.taskedTo === "atc");
  return (
    <div>
      <PH
        title={`Verification queue · ${user?.firstName || ""}`}
        subtitle="As CxA you don't execute — you VERIFY. SIP at L2.03 · pre-energization punch at L2.07 · witness L4 load banks · sign off L5 IST."
      />
      <KPIs>
        <KPI
          label="Pending sign-offs"
          value={myList.filter((t) => t.status === "open").length}
          tone="amber"
        />
        <KPI label="L4 witnesses" value={2} />
        <KPI label="L5 IST" value={3} />
        <KPI
          label="Certs filed"
          value={myList.filter((t) => t.status === "closed").length}
          tone="green"
        />
      </KPIs>
      <SecH>My verification queue</SecH>
      <Card>
        {myList.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              ...s.txt3,
              fontSize: 13,
            }}
          >
            No items in queue.
          </div>
        ) : (
          myList.map((t, i) => (
            <Feed
              key={i}
              icon={t.status === "closed" ? "" : ""}
              who={t.name}
              target={`${t.asset} · ${t.subPhase} · due ${t.due}`}
              right={
                <Tag
                  tone={
                    t.status === "closed"
                      ? "green"
                      : t.status === "in_prog"
                        ? "amber"
                        : "gray"
                  }
                >
                  {t.status.toUpperCase().replace("_", " ")}
                </Tag>
              }
            />
          ))
        )}
      </Card>
    </div>
  );
}

function DashGeneric({ user }) {
  const role = user?.activeRole?.name || user?.role || "unknown";
  return (
    <div>
      <PH title="Dashboard" subtitle={`Generic view for <b>${role}</b>.`} />
      <Banner tone="brand">
        Your role (<strong>{role}</strong>) doesn't have a customised dashboard
        yet. Full module access is available via the sidebar.
      </Banner>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

function DashRouter({ user, router }) {
  const role = user?.activeRole?.name || user?.platformRole || user?.role || "";
  const lens = getLens(role);
  const p = { user, router };
  switch (lens) {
    case "gc_pm":
      return <DashGCPM {...p} />;
    case "gc_sup":
      return <DashGCSup {...p} />;
    case "gc_qaqc":
      return <DashGCQAQC {...p} />;
    case "gc_procurement":
      return <DashProcurement {...p} />;
    case "gc_engineering":
      return <DashGCEngineering {...p} />;
    case "safety":
      return <DashSafety />;
    case "finance":
      return <DashFinance />;
    case "oem_pm":
      return <DashOEMPM {...p} />;
    case "oem_qaqc":
      return <DashOEMQAQC {...p} />;
    case "fsm":
      return <DashFSM {...p} />;
    case "fse":
      return <DashFSE {...p} />;
    case "customer":
      return <DashCustomer {...p} />;
    case "customer_qaqc":
      return <DashCustomerQAQC {...p} />;
    case "trade":
      return <DashTrade {...p} />;
    case "trade_qaqc_e":
      return <DashTradeQAQC {...p} assetType="electrical" />;
    case "trade_qaqc_m":
      return <DashTradeQAQC {...p} assetType="mechanical" />;
    case "cxa":
      return <DashCxA {...p} />;
    case "bms":
      return <DashBMS {...p} />;
    default:
      return <DashGeneric {...p} />;
  }
}

// ─── Greeting helper ──────────────────────────────────────────────────────────

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

// ─── Main component ───────────────────────────────────────────────────────────

const HomePage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const t = localStorage.getItem("theme") || "dark";
    setTheme(t);
    const obs = new MutationObserver(() => {
      const val = document.documentElement.getAttribute("data-theme");
      if (val) setTheme(val);
    });
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const raw = getUser();
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--rf-bg)",
        color: "var(--rf-txt)",
      }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-cyan-900/20" : "bg-sky-200/40"}`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl ${isDark ? "bg-blue-900/20" : "bg-blue-100/50"}`}
        />
      </div>

      <div className="px-8 py-8 mx-auto relative z-10">
        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
            paddingBottom: 20,
            borderBottom: "1px solid var(--rf-border)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--rf-txt3)",
                marginBottom: 4,
              }}
            >
              {greeting()}
            </p>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 900,
                margin: 0,
                color: "var(--rf-txt)",
              }}
            >
              {user?.firstName || "Welcome"}{" "}
              <span style={{ color: "var(--rf-accent)" }}>
                {user?.lastName || ""}
              </span>
            </h1>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontWeight: 500,
                  background: "var(--rf-bg3)",
                  border: "1px solid var(--rf-border)",
                  color: "var(--rf-txt2)",
                }}
              >
                {(user?.activeRole?.description || user?.role || "User").replace(
                  /_/g,
                  " ",
                )}
              </span>
              {user?.organizationName && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontWeight: 500,
                    background: "var(--rf-bg3)",
                    border: "1px solid var(--rf-border)",
                    color: "var(--rf-txt2)",
                  }}
                >
                  {user.organizationName}
                </span>
              )}
            </div>
          </div>
          <div
            style={{ display: "none" }}
            className="md:flex flex-col items-end gap-1"
          >
            <div
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border)",
                borderRadius: 12,
                padding: "12px 18px",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--rf-txt3)",
                  marginBottom: 4,
                }}
              >
                System Status
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                  }}
                />
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}
                >
                  All Systems Operational
                </span>
              </div>
              <div
                style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 2 }}
              >
                Last synced: Just now
              </div>
            </div>
          </div>
        </div>

        {/* ── Role dashboard ── */}
        {user ? (
          <DashRouter user={user} router={router} />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 200,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                color: "var(--rf-txt2)",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid var(--rf-accent)",
                  borderTopColor: "transparent",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Loading dashboard...
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 20,
            borderTop: "1px solid var(--rf-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 12,
              color: "var(--rf-txt2)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--rf-yellow)",
                  display: "inline-block",
                }}
              />
              New updates available
            </span>
            <span style={{ color: "var(--rf-txt3)" }}>
              · Last synced: Just now
            </span>
          </div>
          <button
            style={{
              padding: "4px 12px",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
              background: "var(--rf-glow)",
              color: "var(--rf-accent)",
              border: "1px solid var(--rf-border2)",
              cursor: "pointer",
            }}
          >
            Update
          </button>
        </div>
      </div>

      {open && <TailwindDialog open={open} setOpen={(v) => setOpen(v)} />}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default HomePage;
