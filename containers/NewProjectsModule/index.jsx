"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getV2Catalog,
  listV2Projects,
  finalizeV2Direct,
} from "../../services/CxProjectsV2";
import { getUsers, CreateUsers } from "../../services/Users";
import {
  getAssets,
  createAsset,
  bulkCreateAssets,
} from "../../services/AssetManagement";
import {
  getDocuments,
  requestUploadUrl,
  uploadFileToS3,
  confirmUpload,
} from "../../services/Documents";
import { getTeams, CreateTeam } from "../../services/Teams";
import {
  required,
  requiredSelection,
  numeric,
  lengthBetween,
  collectErrors,
  validateEmail,
  validatePhone,
  validatePersonName,
  dateOrder,
  notDuplicate,
  NAME_PATTERN,
  PERSON_NAME_PATTERN,
  MAX_NAME,
} from "../../Utils/validation";

// Allowed upload extensions + size cap for the Documents & Contracts step
// (DC_009 unsupported type, DC_010 size limit).
const ALLOWED_DOC_EXTS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "png",
  "jpg",
  "jpeg",
  "dwg",
];
const MAX_DOC_BYTES = 25 * 1024 * 1024; // 25 MB

/* ------------------------------------------------------------------ *
 * Static config
 * ------------------------------------------------------------------ */

const STEPS = [
  "Identity",
  "Facility (OPR)",
  "Stakeholders",
  "Scope & Levels",
  "Asset Register",
  "Documents & Contracts",
  "Baseline & Milestones",
  "Team",
];

const IDENTITY_FIELDS = [
  {
    key: "projectName",
    label: "Project Name",
    required: true,
    ph: "e.g. DFW39 · Garland",
  },
  { key: "projectCode", label: "Project Code", required: true, ph: "e.g. 25-DR323" },
  { key: "owner", label: "Owner / Customer", required: true, ph: "e.g. Digital Realty" },
  { key: "location", label: "Location", required: true, ph: "e.g. Garland, TX" },
  { key: "gc", label: "General Contractor", required: true, ph: "e.g. HITT" },
  { key: "ec", label: "Electrical Contractor (EC)", required: true, ph: "e.g. CEC" },
  { key: "mc", label: "Mechanical Contractor (MC)", required: true, ph: "e.g. TDIndustries" },
  { key: "bms", label: "Controls / BMS Contractor", required: true, ph: "e.g. Schneider" },
  { key: "fire", label: "Fire / Life-Safety Contractor", required: true, ph: "e.g. JCI" },
  { key: "neta", label: "Testing Agency (NETA)", required: true, ph: "e.g. Shermco" },
  { key: "cxa", label: "Commissioning Agent (CXA)", required: true, ph: "e.g. Iconicx" },
];

const REDUNDANCY_OPTS = ["N", "N+1", "N+2", "2N", "2N+1"];
const UPTIME_OPTS = ["Tier I", "Tier II", "Tier III", "Tier IV"];
const COOLING_OPTS = [
  "Chilled Water",
  "Air-Cooled (DX)",
  "Liquid / Immersion",
  "Evaporative",
  "Hybrid",
];
const VOLTAGE_CLASSES = [
  "34.5kV (35kV class)",
  "15kV",
  "13.8kV",
  "12.47kV",
  "4160V",
  "480/277V",
  "208/120V",
  "24VDC controls",
];

const STAKEHOLDER_ROLES = [
  "Owner",
  "Architect",
  "MEP Engineer",
  "Structural Engineer",
  "Owner Vendor",
  "Construction Manager (CM)",
  "AHJ",
];

const CX_LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6"];
const SAMPLING_OPTS = [
  "100% witness (every unit)",
  "First-of-type + 25% sample",
  "First-of-type + 10% sample",
  "Document review only",
];

// Categories accepted by the Asset Management module's createAsset endpoint.
const ASSET_REG_CATEGORIES = [
  "IT Equipment",
  "Vehicle",
  "Machinery",
  "Furniture",
  "Safety Equipment",
  "Tools",
  "Other",
];

// Furnish + order-status options for the per-asset detail editor. Order statuses
// are stored/sent as the backend enum; the FE shows a dash-joined Title label.
const ASSET_FURNISH = ["CFCI", "OFCI"];
const ASSET_ORDER_STATUSES = [
  "NOT_ORDERED",
  "ORDERED",
  "IN_TRANSIT",
  "RECEIVED",
  "INSTALLED",
  "COMMISSIONED",
];
const orderStatusLabel = (s) =>
  String(s)
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");

// Standard commissioning system list (BQ) — the canonical data-center asset
// taxonomy grouped by discipline/phase. These render alongside the API-driven
// Asset Register so a project can pick from the standard systems even before any
// asset has been registered in the Asset Management module. Each [code, label]
// pair becomes a selectable item (assetTag = code, category = discipline).
const STATIC_ASSET_BQ = [
  {
    disc: "Electrical",
    phase: "L2",
    types: [
      ["UTIL", "Utility Service Entrance"],
      ["MVSWGR", "MV Switchgear"],
      ["MVXFMR", "MV Transformer"],
      ["UNITSUB", "Unit Substation"],
      ["GEN", "Generator"],
      ["GENPARA", "Generator Paralleling Switchgear"],
      ["FUEL", "Fuel System / Day Tank"],
      ["ATS", "ATS (Automatic Transfer Switch)"],
      ["MTS", "MTS (Manual/Maintenance Transfer Switch)"],
      ["STS", "STS (Static Transfer Switch)"],
      ["SWBD", "LV Switchboard"],
      ["MCC", "Motor Control Center (MCC)"],
      ["DISTBRD", "Distribution Board / Panelboard"],
      ["UPS", "UPS"],
      ["BATT", "Battery System / VRLA-LiB"],
      ["FLYWHEEL", "Flywheel / Energy Storage"],
      ["PDU", "PDU"],
      ["RPP", "RPP / Remote Power Panel"],
      ["RDC", "Reactor / Rotary / RDC"],
      ["BUSWAY", "Busway / Bus Duct"],
      ["XFMR", "Dry-Type Transformer"],
      ["CAPBANK", "Capacitor / PFC Bank"],
      ["SURGE", "SPD / Surge Protection"],
      ["GROUND", "Grounding / Bonding System"],
      ["EPMS", "EPMS / Power Monitoring"],
      ["LIGHTING", "Lighting / Emergency Egress"],
      ["EPOSYS", "EPO System"],
    ],
  },
  {
    disc: "Mechanical",
    phase: "L2",
    types: [
      ["CH", "Chiller"],
      ["CRAH", "CRAH / CRAC"],
      ["CDU", "CDU / Liquid Cooling"],
      ["CT", "Cooling Tower"],
      ["PMP", "Pump"],
    ],
  },
  { disc: "Controls", phase: "L2", types: [["BMS", "BMS / Controls"]] },
  {
    disc: "Plumbing",
    phase: "L2",
    types: [
      ["MUW", "Make-up Water"],
      ["LEAK", "Leak Detection"],
    ],
  },
  {
    disc: "Fire/Life-Safety",
    phase: "L2",
    types: [
      ["VESDA", "VESDA"],
      ["AGENT", "Clean Agent"],
      ["FA", "Fire Alarm"],
      ["EPO", "EPO"],
    ],
  },
];

const DOC_ITEMS = [
  "IFP drawings",
  "IFC drawings",
  "Specifications",
  "Submittals register",
  "RFI register",
  "Change Requests (CR) register",
  "MOP / Method of Procedure",
  "CR-MOP register",
  "Contract documents",
  "Permits & inspections",
  "Subcontracts executed (all trades)",
  "Kickoff (KO) call held",
  "As-built drawings (closeout)",
];

const MILESTONE_DATES = [
  { key: "ntp", label: "NTP Issued" },
  { key: "gcMob", label: "GC Mobilization" },
  { key: "startup", label: "Start-Up & Cx" },
  { key: "substantial", label: "Substantial Completion" },
  { key: "final", label: "Final Completion" },
];

const TEAM_ROLES = [
  "Project Manager",
  "Superintendent",
  "CxA Lead",
  "Field Engineer",
  "QA/QC Manager",
  "Safety Officer",
];

// Max key-people rows in the creation wizard (TC_TEAM_027/054/055). The full
// crew is managed on the project Team page; this is just the initial seed list.
const MAX_TEAM_MEMBERS = 20;
const MAX_COMPANY = 150;

const SEED_PROJECTS = [];

/* ------------------------------------------------------------------ *
 * Backend (V2 API) mapping
 * ------------------------------------------------------------------ *
 * The wizard's display labels are normalized to the values the V2 API's
 * ValidationPipe accepts. Where the backend /catalog is reachable we prefer its
 * lists (loaded at runtime); these maps are the safety net for any FE label that
 * is not a 1:1 match with a backend enum.
 */

// FE cooling labels → backend COOLING_TYPE_OPTIONS [Air, Chilled Water, Liquid / DLC, Immersion]
const COOLING_TO_API = {
  "Chilled Water": "Chilled Water",
  "Air-Cooled (DX)": "Air",
  Air: "Air",
  "Liquid / Immersion": "Liquid / DLC",
  "Liquid / DLC": "Liquid / DLC",
  Immersion: "Immersion",
  Evaporative: "Air",
  Hybrid: "Chilled Water",
};

// FE redundancy labels → backend REDUNDANCY_OPTIONS [N, N+1, 2N, 2N+1]
const REDUNDANCY_TO_API = {
  N: "N",
  "N+1": "N+1",
  "N+2": "N+1",
  "2N": "2N",
  "2N+1": "2N+1",
};

// FE sampling labels → backend VERIFICATION_SAMPLING_OPTIONS
const SAMPLING_TO_API = {
  "100% witness (every unit)": "100% witness (every unit)",
  "First-of-type + 25% sample": "FOK + 25% spot witness",
  "First-of-type + 10% sample": "FOK + 10% spot witness",
  "Document review only": "First-of-Kind (FOK) — 1 per batch",
};

// FE stakeholder-role labels → backend STAKEHOLDER_ROLE_OPTIONS
const STAKEHOLDER_ROLE_TO_API = {
  Owner: "Owner",
  Architect: "Architect",
  "MEP Engineer": "MEP Engineer",
  "Structural Engineer": "Structural Engineer",
  "Owner Vendor": "Owner Vendor",
  "Construction Manager (CM)": "Construction Manager",
  AHJ: "AHJ / Inspector",
};

// FE doc-status pills → backend DocReadinessStatus
const DOC_STATUS_TO_API = {
  "In hand": "IN_HAND",
  "Under review": "UNDER_REVIEW",
  Pending: "PENDING",
  "N/A": "NA",
};
// Ordered status choices for the per-document readiness dropdown.
const DOC_STATUSES = Object.keys(DOC_STATUS_TO_API);

// FE doc-item label → backend ProjectDocType enum value
const DOC_LABEL_TO_TYPE = {
  "IFP drawings": "IFP_DRAWINGS",
  "IFC drawings": "IFC_DRAWINGS",
  Specifications: "SPECIFICATIONS",
  "Submittals register": "SUBMITTALS_REGISTER",
  "RFI register": "RFI_REGISTER",
  "Change Requests (CR) register": "CR_REGISTER",
  "MOP / Method of Procedure": "MOP",
  "CR-MOP register": "CR_MOP_REGISTER",
  "Contract documents": "CONTRACT_DOCUMENTS",
  "Permits & inspections": "PERMITS_INSPECTIONS",
  "Subcontracts executed (all trades)": "SUBCONTRACTS_EXECUTED",
  "Kickoff (KO) call held": "KICKOFF_CALL_HELD",
  "As-built drawings (closeout)": "AS_BUILT_DRAWINGS",
};

const num = (v) => {
  if (v === "" || v === null || v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};
const iso = (d) => (d ? new Date(d).toISOString() : undefined);
const clean = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  );

// Map a backend field path (e.g. "stakeholders.0.email") to a human-readable
// label so the user knows exactly which wizard field to fix.
const STEP_FOR_FIELD = {
  projectName: "Identity",
  customer: "Identity",
  projectCode: "Identity",
  siteAddress: "Identity",
  projectType: "Identity",
  oprSnapshot: "Facility (OPR)",
  cxScope: "Scope & Levels",
  milestones: "Baseline & Milestones",
  assets: "Asset Register",
  stakeholders: "Stakeholders",
  documents: "Documents & Contracts",
};
function humanizeFieldError(raw) {
  // raw e.g. "stakeholders.0.email must be an email"
  const m = /^([a-zA-Z0-9_.[\]]+)\s+(.*)$/.exec(raw);
  if (!m) return raw;
  const [, path, rest] = m;
  const root = path.split(".")[0];
  const leaf =
    path
      .split(".")
      .filter((p) => !/^\d+$/.test(p))
      .pop() || path;
  const step = STEP_FOR_FIELD[root];
  const label = leaf
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase());
  return `${step ? step + " — " : ""}${label}: ${rest}`;
}

/**
 * Flatten a backend ValidationError body into readable, field-aware lines.
 * Backend shape: { message, errors: { general?: string[], <field>?: string[] } }.
 */
function extractApiErrors(e) {
  const lines = [];
  const errs = e?.errors || e?.response?.data?.errors;
  if (errs && typeof errs === "object") {
    for (const [key, val] of Object.entries(errs)) {
      const items = Array.isArray(val) ? val : [val];
      for (const item of items) {
        lines.push(
          key === "general"
            ? humanizeFieldError(String(item))
            : `${key}: ${item}`,
        );
      }
    }
  }
  if (lines.length) return lines;
  // No structured errors — fall back to the top-level message.
  const msg = e?.message || e?.error || e?.response?.data?.message;
  if (Array.isArray(msg)) return msg.map(humanizeFieldError);
  if (typeof msg === "string" && msg) return [msg];
  return ["Failed to create project. Please review the fields and try again."];
}

/**
 * Map the wizard's local state → FinalizeCxProjectV2Dto.
 * Only fields the backend accepts are sent; org/project ids are derived server-side.
 */
// NOTE: `team` is intentionally not sent to finalize. The backend's
// ProjectAssignment.userId is required, but the wizard's Team step captures
// free-text Name/Company (people who may not yet be platform users). Mirroring
// V1, only the creator is auto-assigned at finalize; named team members are
// added on the project's Team page once resolved to real users.
function buildFinalizePayload({
  identity,
  facility,
  stakeholders,
  scope,
  assets,
  docs,
  milestones,
}) {
  // Step 5 — selected assets become ProjectAsset rows. Each selection carries a
  // detail object (qty / furnish / order status / PO# / manufacturer / model /
  // location) captured inline in the wizard.
  const assetRows = Object.entries(assets)
    .filter(([, d]) => d)
    .map(([name, raw]) => {
      const d = typeof raw === "object" ? raw : {};
      // Location and Lineup are separate inputs in the UI but the V2 asset DTO
      // only carries `location` (and rejects unknown fields via the backend's
      // forbidNonWhitelisted pipe), so combine them into one location string.
      const loc = [d.location, d.lineup].map((s) => (s || "").trim()).filter(Boolean);
      return clean({
        abbr: (d.assetTag || name).slice(0, 50),
        name,
        assetType: d.category || "General",
        quantity: num(d.qty) ?? 1,
        procurementOwner: d.furnish || "OFCI",
        procurementStatus: d.order,
        poNumber: d.po,
        manufacturer: d.manufacturer,
        model: d.model,
        location: loc.length ? loc.join(" — ") : undefined,
      });
    });

  // Step 6 — documents the user touched (status != default) are sent explicitly.
  const docRows = Object.entries(docs)
    .filter(([label]) => DOC_LABEL_TO_TYPE[label])
    .map(([label, row]) =>
      clean({
        docType: DOC_LABEL_TO_TYPE[label],
        status: DOC_STATUS_TO_API[row.status],
        note: row.note,
      }),
    );

  // Step 3 — stakeholders with a name.
  const stakeholderRows = stakeholders
    .filter((s) => (s.name || s.company || "").trim())
    .map((s) =>
      clean({
        name: (s.name || s.company || "Unnamed").trim(),
        role: STAKEHOLDER_ROLE_TO_API[s.role] || s.role,
        company: s.company,
        email: s.email,
        phone: s.phone,
      }),
    );

  const opr = clean({
    criticalItCapacityMw: num(facility.criticalCapacity),
    whiteSpaceSqFt: num(facility.whiteSpace),
    dataHalls: num(facility.dataHalls),
    redundancy: REDUNDANCY_TO_API[facility.redundancy],
    uptimeTarget: facility.uptime,
    coolingType: COOLING_TO_API[facility.cooling],
    designPue: num(facility.pue),
    voltageClasses: facility.voltages,
    tccfInScope: !!facility.tccf,
  });

  const cxScope = clean({
    commissioningLevels: scope.levels,
    verificationSamplingRate: SAMPLING_TO_API[scope.sampling],
    ownerCxaWitnessesL4L5: !!scope.ownerWitness,
  });

  const anchors = clean({
    ntpIssued: iso(milestones.ntp),
    gcMobilization: iso(milestones.gcMob),
    startupCx: iso(milestones.startup),
    substantialCompletion: iso(milestones.substantial),
    finalCompletion: iso(milestones.final),
    baselineScheduleReference: milestones.baselineRef,
  });
  const freezeWindows = (milestones.freezes || [])
    .filter((f) => f.label || f.from || f.to || f.reason || f.scope)
    .map((f) =>
      clean({
        label: f.label,
        startDate: iso(f.from),
        endDate: iso(f.to),
        reason: f.reason,
        scope: f.scope,
      }),
    );

  return clean({
    projectName: (identity.projectName || "").trim(),
    customer: (identity.owner || "").trim() || "Unspecified",
    projectCode: identity.projectCode,
    siteAddress: identity.location,
    projectType: facility.uptime ? "Data Center" : "Data Center",
    oprSnapshot: Object.keys(opr).length ? opr : undefined,
    cxScope: Object.keys(cxScope).length ? cxScope : undefined,
    milestones:
      Object.keys(anchors).length || freezeWindows.length
        ? clean({
            anchors: Object.keys(anchors).length ? anchors : undefined,
            freezeWindows,
          })
        : undefined,
    numDataHalls: num(facility.dataHalls),
    assets: assetRows.length ? assetRows : undefined,
    stakeholders: stakeholderRows.length ? stakeholderRows : undefined,
    documents: docRows.length ? docRows : undefined,
  });
}

// Map a V2 aggregate/list row → the list-card view model.
function toCard(p) {
  const proj = p.project || p;
  const loc = proj.siteAddress
    ? ` · ${String(proj.siteAddress).split(",")[0]}`
    : "";
  const bits = [
    proj.siteAddress,
    proj.customer && `Cust: ${proj.customer}`,
  ].filter(Boolean);
  return {
    id: proj.id,
    name: `${proj.projectName}${loc}`,
    meta: bits.join(" · ") || "Commissioning project",
    status: proj.status || "ACTIVE",
    phase: "In progress",
    comm: "0%",
    assets: (p.assets && p.assets.length) || 0,
    overdue: 0,
    subs: 0,
  };
}

/* ------------------------------------------------------------------ *
 * Shared styles
 * ------------------------------------------------------------------ */

const labelStyle = {
  // --rf-txt2 (not the fainter --rf-txt3) so 10px uppercase labels meet WCAG AA
  // contrast on the light card (ORP-FAC-061 and all wizard field labels).
  color: "var(--rf-txt2)",
  letterSpacing: "0.08em",
  fontSize: 10,
  fontWeight: 700,
};

// The border lives on a WRAPPER div, not on the <input>/<select> itself.
// The global [data-theme] input rule in globals.css pins input/select
// border-color with !important and high specificity, so a div is the only
// reliable place to draw a visible, theme-correct border.
const fieldBoxStyle = {
  display: "flex",
  alignItems: "center",
  background: "var(--rf-bg2)",
  border: "1.5px solid var(--rf-border3, #8daacf)",
  borderRadius: 12,
};

const bareControlStyle = {
  background: "transparent",
  border: "none",
  color: "var(--rf-txt)",
};

/* ------------------------------------------------------------------ *
 * Small building blocks
 * ------------------------------------------------------------------ */

function Field({ label, required, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="uppercase" style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--rf-red)" }}> *</span>}
      </label>
      {children}
      {error && (
        <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

function TextInput({ className, style, error, ...props }) {
  return (
    <div
      className={`np-fieldbox ${className || ""}`}
      style={{
        ...fieldBoxStyle,
        ...(error ? { boxShadow: "inset 0 0 0 1px var(--rf-red)" } : {}),
      }}
    >
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-transparent"
        style={{ ...bareControlStyle, ...(style || {}) }}
      />
    </div>
  );
}

function SelectInput({ children, className, error, ...props }) {
  return (
    <div
      className={`np-fieldbox relative ${className || ""}`}
      style={{
        ...fieldBoxStyle,
        ...(error ? { border: "1px solid var(--rf-red, #ef4444)" } : {}),
      }}
    >
      <select
        {...props}
        aria-invalid={error ? true : undefined}
        className="w-full pl-3.5 pr-9 py-2.5 rounded-xl text-sm appearance-none cursor-pointer bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rf-accent)]"
        style={bareControlStyle}
      >
        {children}
      </select>
      <svg
        className="absolute pointer-events-none"
        style={{
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--rf-txt3)",
        }}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-3.5 py-2 rounded-lg text-xs font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rf-accent)]"
      style={{
        background: active ? "var(--rf-accent)" : "var(--rf-bg2)",
        color: active ? "#fff" : "var(--rf-txt2)",
        border: `1px solid ${active ? "var(--rf-accent)" : "var(--rf-border2, #adbbd8)"}`,
      }}
    >
      {children}
    </button>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label
      className="flex items-center gap-2.5 cursor-pointer text-sm select-none"
      style={{ color: checked ? "var(--rf-txt)" : "var(--rf-txt2)" }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        className="flex items-center justify-center flex-shrink-0 transition-all peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--rf-accent)]"
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          background: checked ? "var(--rf-accent)" : "var(--rf-bg2)",
          border: `2px solid ${checked ? "var(--rf-accent)" : "var(--rf-border3, #8daacf)"}`,
        }}
      >
        {checked && (
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </label>
  );
}

function Stepper({ steps, current, onJump }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        let bg = "var(--rf-bg3)";
        let color = "var(--rf-txt3)";
        let border = "1px solid transparent";
        if (active) {
          bg = "var(--rf-accent)";
          color = "#fff";
        } else if (done) {
          bg = "var(--rf-green-soft, #d1fae5)";
          color = "var(--rf-green)";
        }
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <button
              type="button"
              onClick={() => done && onJump(i)}
              className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
              style={{
                background: bg,
                color,
                border,
                cursor: done ? "pointer" : "default",
              }}
            >
              <span
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  background: active
                    ? "rgba(255,255,255,0.25)"
                    : done
                      ? "transparent"
                      : "var(--rf-bg4)",
                  color: active
                    ? "#fff"
                    : done
                      ? "var(--rf-green)"
                      : "var(--rf-txt3)",
                }}
              >
                {done ? "✓" : i + 1}
              </span>
              {step}
            </button>
            {i < steps.length - 1 && (
              <span
                className="px-1 text-xs"
                style={{ color: "var(--rf-txt3)" }}
              >
                ›
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepIntro({ children }) {
  return (
    <p className="text-xs mb-5" style={{ color: "var(--rf-txt3)" }}>
      {children}
    </p>
  );
}

/* A BE-linked picker panel: an inline "add new" form + a scrollable, searchable
 * list of records pulled from a backend module (Users / Assets / Teams / Docs). */
function ModulePicker({
  title,
  hint,
  search,
  onSearch,
  hideSearch,
  addLabel,
  addOpen,
  onToggleAdd,
  addForm,
  loading,
  isEmpty,
  emptyText,
  children,
}) {
  return (
    <div
      className="rounded-2xl p-4 mb-6"
      style={{
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border2, #adbbd8)",
      }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="uppercase" style={labelStyle}>
            {title}
          </h4>
          {hint && (
            <p className="text-xs mt-1" style={{ color: "var(--rf-txt3)" }}>
              {hint}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleAdd}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: addOpen ? "var(--rf-bg3)" : "var(--rf-accent)",
            color: addOpen ? "var(--rf-txt2)" : "#fff",
            border: `1px solid ${addOpen ? "var(--rf-border, #c5d2ea)" : "var(--rf-accent)"}`,
          }}
        >
          {addOpen ? "Close" : addLabel}
        </button>
      </div>

      {addOpen && (
        <div
          className="rounded-xl p-3 mb-3"
          style={{
            background: "var(--rf-bg)",
            border: "1px dashed var(--rf-border3, #8daacf)",
          }}
        >
          {addForm}
        </div>
      )}

      {!hideSearch && (
        <TextInput placeholder="Search…" value={search} onChange={onSearch} />
      )}

      <div
        className="flex flex-col gap-1.5 mt-2.5"
        style={{ maxHeight: 264, overflowY: "auto" }}
      >
        {loading ? (
          <p
            className="text-xs text-center py-4"
            style={{ color: "var(--rf-txt3)" }}
          >
            Loading…
          </p>
        ) : isEmpty ? (
          <p
            className="text-xs text-center py-4"
            style={{ color: "var(--rf-txt3)" }}
          >
            {emptyText}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function PickCheck({ selected }) {
  return (
    <span
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: 18,
        height: 18,
        borderRadius: 5,
        background: selected ? "var(--rf-accent)" : "var(--rf-bg2)",
        border: `2px solid ${selected ? "var(--rf-accent)" : "var(--rf-border3, #8daacf)"}`,
      }}
    >
      {selected && (
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
  );
}

function PickRow({ selected, onClick, title, subtitle, right }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-lg transition-all"
      style={{
        background: selected ? "var(--rf-bg3)" : "var(--rf-bg)",
        border: `1px solid ${selected ? "var(--rf-accent)" : "var(--rf-border2, #adbbd8)"}`,
      }}
    >
      <PickCheck selected={selected} />
      <span className="flex-1 min-w-0">
        <span
          className="block text-sm font-semibold truncate"
          style={{ color: "var(--rf-txt)" }}
        >
          {title}
        </span>
        {subtitle && (
          <span
            className="block text-xs truncate"
            style={{ color: "var(--rf-txt3)" }}
          >
            {subtitle}
          </span>
        )}
      </span>
      {right && (
        <span
          className="flex-shrink-0 text-xs"
          style={{ color: "var(--rf-txt3)" }}
        >
          {right}
        </span>
      )}
    </button>
  );
}

// Inputs for the per-asset detail editor (rounded, light-blue border to match
// the design). The border lives on the wrapper div (the global input rule pins
// input border-color), so the visible border is theme-correct.
const miniBox = {
  display: "flex",
  alignItems: "center",
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border, #c5d2ea)",
  borderRadius: 10,
};
function MiniText({ className, style, error, ...props }) {
  return (
    <div
      className={`np-fieldbox ${className || ""}`}
      style={{
        ...miniBox,
        ...(error ? { border: "1px solid var(--rf-red, #ef4444)" } : {}),
      }}
    >
      <input
        {...props}
        aria-invalid={error ? true : undefined}
        className="w-full px-3 py-2 rounded-[10px] text-sm bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rf-accent)]"
        style={{ ...bareControlStyle, ...(style || {}) }}
      />
    </div>
  );
}
function MiniSelect({ children, className, ...props }) {
  return (
    <div className={`np-fieldbox relative ${className || ""}`} style={miniBox}>
      <select
        {...props}
        className="w-full pl-3 pr-8 py-2 rounded-[10px] text-sm appearance-none cursor-pointer bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rf-accent)]"
        style={bareControlStyle}
      >
        {children}
      </select>
      <svg
        className="absolute pointer-events-none"
        style={{
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--rf-txt3)",
        }}
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Main component
 * ------------------------------------------------------------------ */

export default function NewProjectsModule() {
  const router = useRouter();
  const [view, setView] = useState("list"); // "list" | "wizard"
  const [step, setStep] = useState(0);
  // Per-step inline field errors, keyed by field key. Cleared as the user edits.
  const [stepErrors, setStepErrors] = useState({});
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [catalog, setCatalog] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [identity, setIdentity] = useState({});
  const [facility, setFacility] = useState({
    // Empty by default so the user must actively choose — a pre-selected value
    // would make the required validation (ORP-FAC-039/042/045) unreachable.
    redundancy: "",
    uptime: "",
    cooling: "",
    // Empty so the "at least one voltage class" requirement is reachable
    // (ORP-FAC-053) — a pre-selected set made it impossible to fail.
    voltages: [],
    tccf: false,
  });
  const [stakeholders, setStakeholders] = useState([
    // role empty so "no role selected" is reachable (TC_STK_007).
    { company: "", role: "", name: "", email: "", phone: "" },
  ]);
  const [scope, setScope] = useState({
    levels: ["L1", "L2", "L3", "L4", "L5"],
    sampling: SAMPLING_OPTS[0],
    ownerWitness: true,
  });
  const [assets, setAssets] = useState({}); // item -> true
  const [docs, setDocs] = useState(() => {
    const init = {};
    DOC_ITEMS.forEach((d) => {
      init[d] = {
        status: d.startsWith("As-built") ? "N/A" : "Pending",
        note: "",
      };
    });
    return init;
  });
  const [milestones, setMilestones] = useState({ freezes: [] });
  const [team, setTeam] = useState([{ name: "", company: "", role: "" }]);
  // Index of the team row pending delete-confirmation (TC_TEAM_050), or null.
  const [teamConfirmRemove, setTeamConfirmRemove] = useState(null);
  // Documents uploaded via the add flow + the set of selected doc ids. Declared
  // before the draft-persistence effects below so they're in scope there.
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [selectedDocIds, setSelectedDocIds] = useState([]);

  /* ---- Draft persistence: survive an accidental page refresh mid-wizard
     (TC_SL_021, TC_DC_028, TC_BM_030, TC_TEAM_025). Restored once on mount;
     saved on every change. Cleared when a project is finalized. ---- */
  const DRAFT_KEY = "np_wizard_draft_v1";
  const draftLoaded = useRef(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.identity) setIdentity(d.identity);
        if (d.facility) setFacility(d.facility);
        if (d.stakeholders) setStakeholders(d.stakeholders);
        if (d.scope) setScope(d.scope);
        if (d.assets) setAssets(d.assets);
        if (d.docs) setDocs(d.docs);
        // Uploaded docs already persisted server-side; restore the wizard's
        // reference to them so they survive a refresh / mid-upload reload
        // (DC_018 / DC_036).
        if (Array.isArray(d.uploadedDocs)) setUploadedDocs(d.uploadedDocs);
        if (Array.isArray(d.selectedDocIds)) setSelectedDocIds(d.selectedDocIds);
        if (d.milestones) setMilestones(d.milestones);
        if (d.team) setTeam(d.team);
        if (typeof d.step === "number") setStep(d.step);
      }
    } catch {
      /* corrupt draft — ignore */
    }
    draftLoaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!draftLoaded.current) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          identity,
          facility,
          stakeholders,
          scope,
          assets,
          docs,
          uploadedDocs,
          selectedDocIds,
          milestones,
          team,
          step,
        }),
      );
    } catch {
      /* storage full / unavailable — non-fatal */
    }
  }, [
    identity,
    facility,
    stakeholders,
    scope,
    assets,
    docs,
    uploadedDocs,
    selectedDocIds,
    milestones,
    team,
    step,
  ]);

  /* ---- BE module catalogs for the linked wizard steps ---- */
  const [users, setUsers] = useState([]);
  const [assetCatalog, setAssetCatalog] = useState([]);
  const [teamCatalog, setTeamCatalog] = useState([]);
  const [documentsCatalog, setDocumentsCatalog] = useState([]); // from the API
  const [linkedTeamIds, setLinkedTeamIds] = useState([]);
  const [moduleLoading, setModuleLoading] = useState({
    users: false,
    assets: false,
    teams: false,
    docs: false,
  });
  const [moduleBusy, setModuleBusy] = useState(false); // a create/upload is in flight
  const [docUploadPct, setDocUploadPct] = useState(null);
  const [search, setSearch] = useState({ users: "", assets: "", teams: "" });
  const [addOpen, setAddOpen] = useState({
    users: false,
    assets: false,
    docs: false,
    teams: false,
  });
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    roleId: "",
  });
  const [newAsset, setNewAsset] = useState({
    assetTag: "",
    name: "",
    category: "IT Equipment",
    procurementType: "OFCI",
  });
  const [newTeam, setNewTeam] = useState({ name: "" });
  const [newDoc, setNewDoc] = useState({ title: "", file: null });
  // Inline error for the doc upload form (type/size/duplicate/title — DC_009,
  // DC_010, DC_027, DC_028, DC_030, DC_031). Cleared as the user edits.
  const [docError, setDocError] = useState("");

  // Roles list (populated at login) drives the new-user role dropdown.
  const roles = useMemo(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("roles") || "[]");
    } catch {
      return [];
    }
  }, []);

  const assetCount = useMemo(
    () => Object.values(assets).filter(Boolean).length,
    [assets],
  );

  // Normalize the paginated/array response shapes the API may return.
  const rowsFrom = (res) =>
    (res?.data?.data ??
      res?.data ??
      res?.results ??
      (Array.isArray(res) ? res : [])) ||
    [];

  const loadProjects = async () => {
    setLoadingList(true);
    try {
      const res = await listV2Projects({ limit: 50 });
      const rows = rowsFrom(res);
      setProjects(rows.map(toCard));
    } catch (e) {
      // Non-fatal: leave the list empty and let the user still create.
      setProjects([]);
    } finally {
      setLoadingList(false);
    }
  };

  // Pull the selectable records for the BE-linked steps (Stakeholders ← Users,
  // Asset Register ← Assets, Team ← Teams). Each is independent and non-fatal.
  const loadModuleCatalogs = async () => {
    setModuleLoading({ users: true, assets: true, teams: true, docs: true });
    const fetchInto = async (fn, set, key) => {
      try {
        set(rowsFrom(await fn()));
      } catch {
        set([]);
      } finally {
        setModuleLoading((p) => ({ ...p, [key]: false }));
      }
    };
    fetchInto(() => getUsers(100), setUsers, "users");
    fetchInto(() => getAssets({ limit: 100 }), setAssetCatalog, "assets");
    fetchInto(() => getTeams(), setTeamCatalog, "teams");
    // Documents are hierarchy-scoped; best-effort here (no project yet). Any
    // documents uploaded via the add flow are merged in regardless.
    fetchInto(() => getDocuments(), setDocumentsCatalog, "docs");
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cat = await getV2Catalog();
        if (alive) setCatalog(cat?.data ?? cat ?? null);
      } catch {
        /* fall back to local option constants */
      }
    })();
    loadProjects();
    loadModuleCatalogs();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Option lists prefer the backend catalog (guaranteed to match the API), else
  // fall back to the local constants so the wizard still renders offline.
  const opts = useMemo(() => {
    const c = catalog || {};
    return {
      redundancy: c?.opr?.redundancy || REDUNDANCY_OPTS,
      uptime: c?.opr?.uptimeTarget || UPTIME_OPTS,
      cooling: c?.opr?.coolingType || COOLING_OPTS,
      voltages: c?.opr?.voltageClasses || VOLTAGE_CLASSES,
      levels: c?.scope?.commissioningLevels || CX_LEVELS,
      sampling: c?.scope?.verificationSamplingRates || SAMPLING_OPTS,
      stakeholderRoles: c?.stakeholderRoles || STAKEHOLDER_ROLES,
      teamRoles: c?.teamRoles || TEAM_ROLES,
    };
  }, [catalog]);

  const resetWizard = () => {
    // Project finalized (or wizard cancelled) — clear the saved draft.
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
    setStep(0);
    setIdentity({});
    setFacility({
      redundancy: "",
      uptime: "",
      cooling: "",
      voltages: [],
      tccf: false,
    });
    setStakeholders([
      { company: "", role: "", name: "", email: "", phone: "" },
    ]);
    setScope({
      levels: ["L1", "L2", "L3", "L4", "L5"],
      sampling: SAMPLING_OPTS[0],
      ownerWitness: true,
    });
    setAssets({});
    setDocs(() => {
      const init = {};
      DOC_ITEMS.forEach((d) => {
        init[d] = {
          status: d.startsWith("As-built") ? "N/A" : "Pending",
          note: "",
        };
      });
      return init;
    });
    setMilestones({ freezes: [] });
    setTeam([{ name: "", company: "", role: "" }]);
    setLinkedTeamIds([]);
    setUploadedDocs([]);
    setSelectedDocIds([]);
    setSearch({ users: "", assets: "", teams: "" });
    setAddOpen({ users: false, assets: false, docs: false, teams: false });
    setNewUser({ email: "", firstName: "", lastName: "", roleId: "" });
    setNewAsset({
      assetTag: "",
      name: "",
      category: "IT Equipment",
      procurementType: "OFCI",
    });
    setNewTeam({ name: "" });
    setNewDoc({ title: "", file: null });
    setDocError("");
  };

  const cancel = () => {
    resetWizard();
    setError("");
    setView("list");
  };

  const createProject = async () => {
    setError("");
    // Re-validate EVERY step before finalizing — not just the current one. The
    // stepper lets the user jump back, edit, and jump forward (forward-jumps and
    // Next only validate the step being left), and the final "Create project"
    // button submits from the last step. Without this sweep a user could reach
    // submit with an invalid earlier step (bad asset qty, oversized doc note,
    // missing NTP date, etc.), silently bypassing the per-step rules. This makes
    // the per-step validations un-bypassable regardless of navigation path.
    for (let s = 0; s < STEPS.length; s++) {
      const errs = validateStep(s);
      if (Object.keys(errs).length > 0) {
        setStep(s);
        setStepErrors(errs);
        return;
      }
    }
    if (!identity.projectName?.trim()) {
      setError("Project name is required.");
      setStep(0);
      return;
    }
    const payload = buildFinalizePayload({
      identity,
      facility,
      stakeholders,
      scope,
      assets,
      docs,
      milestones,
    });

    // Selected static BQ systems aren't registered assets yet — register them
    // in the Asset Management module via the atomic bulk endpoint. API-sourced
    // assets already exist, so they're excluded here.
    const staticAssetRows = Object.entries(assets)
      .filter(([, d]) => d && d.staticBq)
      .map(([name, d]) =>
        clean({
          name,
          category: d.bqCode || d.category,
          procurementType: d.furnish === "OFCI" ? "OFCI" : "CFCI",
        }),
      );

    setSubmitting(true);
    try {
      if (staticAssetRows.length) {
        await bulkCreateAssets({ assets: staticAssetRows });
      }
      // The ONLY V2 create path — one atomic finalize (no stored draft needed).
      const res = await finalizeV2Direct(payload);
      const created = res?.data ?? res;
      // Optimistically prepend, then refresh from the server for the source of truth.
      if (created?.project?.id) {
        setProjects((prev) => [toCard(created), ...prev]);
      }
      cancel();
      loadProjects();
    } catch (e) {
      // Surface the backend's specific field errors (e.g. "Stakeholders — Email:
      // must be an email"), not just the generic top-level message.
      setError(extractApiErrors(e));
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- BE-module link + add handlers (Users / Assets / Teams / Docs) ---- */

  const userLabel = (u) =>
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    u.name ||
    u.email ||
    "Unnamed user";

  // Stakeholders ← Users: selecting a user adds a prefilled stakeholder row,
  // keyed by userId so it flows into the finalize payload like a manual row.
  const userLinked = (u) => stakeholders.some((s) => s.userId === u.id);
  const linkUser = (u) =>
    setStakeholders((prev) =>
      prev.some((s) => s.userId === u.id)
        ? prev.filter((s) => s.userId !== u.id)
        : [
            ...prev,
            {
              company: u?.company?.name,
              role: u?.role?.name,
              name: userLabel(u),
              email: u.email || "",
              phone: "",
              userId: u.id,
            },
          ],
    );
  const submitNewUser = async () => {
    // Full inline validation for the add-team-member form (TC_TEAM_013-046):
    // email format, name charset + length, role required, duplicate email.
    const emailErr = validateEmail(newUser.email);
    const firstErr =
      required(newUser.firstName, "First name") ||
      validatePersonName(newUser.firstName, "First name", NAME_PATTERN);
    const lastErr = newUser.lastName
      ? validatePersonName(newUser.lastName, "Last name", NAME_PATTERN)
      : "";
    const roleErr = required(newUser.roleId, "Role");
    const firstError = emailErr || firstErr || lastErr || roleErr;
    if (firstError) {
      setError(firstError);
      return;
    }
    const dupEmail = (users || []).some(
      (u) =>
        (u.email || "").trim().toLowerCase() ===
        newUser.email.trim().toLowerCase(),
    );
    if (dupEmail) {
      setError("A team member with this email already exists.");
      return;
    }
    setModuleBusy(true);
    setError("");
    try {
      const res = await CreateUsers(
        clean({
          email: newUser.email.trim(),
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          roleId: newUser.roleId,
        }),
      );
      const created = res?.data ?? res;
      let list = [];
      try {
        list = rowsFrom(await getUsers(100));
        setUsers(list);
      } catch {
        /* keep stale list */
      }
      const u =
        (created?.id && created) ||
        list.find((x) => x.email === newUser.email.trim());
      if (u?.id && !userLinked(u)) linkUser(u);
      setNewUser({ email: "", firstName: "", lastName: "", roleId: "" });
      setAddOpen((p) => ({ ...p, users: false }));
    } catch (e) {
      setError(extractApiErrors(e));
    } finally {
      setModuleBusy(false);
    }
  };

  // Asset Register ← Assets: toggling reflects into the `assets` map (keyed by
  // name) so selected registry assets become ProjectAsset rows at finalize.
  const submitNewAsset = async () => {
    // Mandatory tag + name (TC_AR_029/030), length cap (TC_AR_023), and a
    // duplicate-name guard within the current selection (TC_AR_037).
    const tag = newAsset.assetTag.trim();
    const name = newAsset.name.trim();
    const vErr =
      required(tag, "Asset tag") ||
      required(name, "Asset name") ||
      lengthBetween(name, { max: 120, label: "Asset name" });
    if (vErr) {
      setError(vErr);
      return;
    }
    const dupNames = Object.keys(assets);
    if (dupNames.some((n) => n.trim().toLowerCase() === name.toLowerCase())) {
      setError(`Asset "${name}" is already in this project.`);
      return;
    }
    setModuleBusy(true);
    setError("");
    try {
      await createAsset(
        clean({
          assetTag: newAsset.assetTag.trim(),
          name: newAsset.name.trim(),
          category: newAsset.category,
          procurementType: newAsset.procurementType,
        }),
      );
      try {
        setAssetCatalog(rowsFrom(await getAssets({ limit: 100 })));
      } catch {
        /* keep stale list */
      }
      setAssets((p) => ({
        ...p,
        [newAsset.name.trim()]: defaultAssetDetail({
          procurementType: newAsset.procurementType,
          category: newAsset.category,
          assetTag: newAsset.assetTag.trim(),
        }),
      }));
      setNewAsset({
        assetTag: "",
        name: "",
        category: "IT Equipment",
        procurementType: "OFCI",
      });
      setAddOpen((p) => ({ ...p, assets: false }));
    } catch (e) {
      setError(extractApiErrors(e));
    } finally {
      setModuleBusy(false);
    }
  };

  // Team ← Teams: link existing teams or create one. (Captured for UI selection;
  // member assignment happens on the project Team page once the project exists.)
  const toggleTeamLink = (t) =>
    setLinkedTeamIds((prev) =>
      prev.includes(t.id) ? prev.filter((x) => x !== t.id) : [...prev, t.id],
    );
  const submitNewTeam = async () => {
    if (!newTeam.name.trim()) {
      setError("New team needs a name.");
      return;
    }
    setModuleBusy(true);
    setError("");
    try {
      const res = await CreateTeam({ name: newTeam.name.trim() });
      const created = res?.data ?? res;
      let list = [];
      try {
        list = rowsFrom(await getTeams());
        setTeamCatalog(list);
      } catch {
        /* keep stale list */
      }
      const t =
        (created?.id && created) ||
        list.find((x) => x.name === newTeam.name.trim());
      if (t?.id) {
        setLinkedTeamIds((prev) =>
          prev.includes(t.id) ? prev : [...prev, t.id],
        );
      }
      setNewTeam({ name: "" });
      setAddOpen((p) => ({ ...p, teams: false }));
    } catch (e) {
      setError(extractApiErrors(e));
    } finally {
      setModuleBusy(false);
    }
  };

  // Validate a picked file before it's accepted into newDoc: extension allow-list
  // (DC_009) and size cap (DC_010). Returns an error string, or "" when valid.
  const validateDocFile = (file) => {
    if (!file) return "";
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_DOC_EXTS.includes(ext))
      return `Unsupported file type ".${ext}". Allowed: ${ALLOWED_DOC_EXTS.join(", ")}.`;
    // Empty file = likely corrupted / failed read (DC_037). True corruption
    // can't be detected client-side, but a zero-byte file is always invalid.
    if (file.size === 0)
      return "This file appears to be empty or corrupted. Please choose another file.";
    if (file.size > MAX_DOC_BYTES)
      return `File is too large (max ${MAX_DOC_BYTES / 1024 / 1024} MB).`;
    // Guard against pathologically long filenames (DC_038); the name is stored
    // and shown — keep it within a sane bound.
    if ((file.name || "").length > 255)
      return "File name is too long (max 255 characters). Please rename the file.";
    return "";
  };

  // Accept a file from the input/drop zone, validating type+size up-front so the
  // user gets an inline error instead of a failed upload (DC_009 / DC_010).
  const pickDocFile = (file) => {
    if (!file) {
      setNewDoc((p) => ({ ...p, file: null }));
      return;
    }
    const err = validateDocFile(file);
    if (err) {
      setDocError(err);
      setNewDoc((p) => ({ ...p, file: null }));
      return;
    }
    setDocError("");
    setNewDoc((p) => ({ ...p, file }));
  };

  // Documents ← Documents: real S3 upload (standalone — title + file are enough,
  // project hierarchy is optional and resolved later on the project page).
  const submitNewDoc = async () => {
    const title = newDoc.title.trim();
    // Title required + length cap (DC_030 special chars allowed, DC_031 long
    // title), file required + type/size (DC_009/DC_010), duplicate title /
    // duplicate file name against already-known docs (DC_027 / DC_028).
    const knownTitles = [...uploadedDocs, ...documentsCatalog]
      .map((d) => d?.title)
      .filter(Boolean);
    const knownFileNames = [...uploadedDocs, ...documentsCatalog]
      .map((d) => d?.fileName)
      .filter(Boolean);
    const titleErr =
      required(title, "Document title") ||
      lengthBetween(title, { max: 200, label: "Document title" }) ||
      notDuplicate(title, knownTitles, "Document title");
    const fileErr = !newDoc.file
      ? "A file is required."
      : validateDocFile(newDoc.file) ||
        notDuplicate(newDoc.file.name, knownFileNames, "File");
    const firstErr = titleErr || fileErr;
    if (firstErr) {
      setDocError(firstErr);
      return;
    }
    setDocError("");
    setModuleBusy(true);
    setDocUploadPct(0);
    setError("");
    try {
      const res = await requestUploadUrl({
        title: newDoc.title.trim(),
        fileName: newDoc.file.name,
        mimeType: newDoc.file.type,
        fileSize: newDoc.file.size,
        category: "CONTRACT",
      });
      const { uploadUrl, documentId } = res?.data ?? res;
      await uploadFileToS3(uploadUrl, newDoc.file, setDocUploadPct);
      const confirmed = await confirmUpload(documentId);
      const doc = confirmed?.data ?? confirmed ?? {};
      const newId = doc.id ?? documentId;
      setUploadedDocs((prev) => [
        {
          id: newId,
          title: doc.title ?? newDoc.title.trim(),
          fileName: doc.fileName ?? newDoc.file.name,
          category: doc.category ?? "CONTRACT",
        },
        ...prev,
      ]);
      setSelectedDocIds((prev) =>
        prev.includes(newId) ? prev : [...prev, newId],
      );
      setNewDoc({ title: "", file: null });
      setAddOpen((p) => ({ ...p, docs: false }));
    } catch (e) {
      // Upload failed (e.g. network drop). Keep the title + file intact and
      // surface the error inline so the user can simply click "Upload document"
      // again to retry (DC_016).
      const lines = extractApiErrors(e);
      const msg = Array.isArray(lines) ? lines.join(" ") : String(lines);
      setDocError(`${msg} Please try again.`);
    } finally {
      setModuleBusy(false);
      setDocUploadPct(null);
    }
  };
  const toggleDoc = (id) =>
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Remove a document uploaded this session from the wizard list + selection
  // (DC_014). Only session-uploaded docs are removable here; catalog docs are
  // managed on the Documents page.
  const removeUploadedDoc = (id) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocIds((prev) => prev.filter((x) => x !== id));
  };

  /* --------------------------- validation ---------------------------- */

  // Set an identity field and clear its inline error as the user types.
  const setIdentityField = (key, value) => {
    setIdentity((p) => ({ ...p, [key]: value }));
    setStepErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };
  const setFacilityField = (key, value) => {
    setFacility((p) => ({ ...p, [key]: value }));
    setStepErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  // Numeric-input filter for the OPR capacity fields — sanitizes as the user
  // types so the field can only ever hold a valid number:
  //   • strips alphabets / special chars (ORP-FAC-003/047/048)
  //   • allows at most one decimal point when decimals are permitted
  //   • drops leading zeros so "007" → "7" and "0.5" stays "0.5" (ORP-FAC-057)
  //   • caps the digit length so absurdly long values can't be entered
  //     (ORP-FAC-056). `numeric()` still validates on Next as a backstop.
  const setFacilityNumeric = (
    key,
    raw,
    { allowDecimal = true, maxLen = 12 } = {},
  ) => {
    let cleaned = String(raw).replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, "");
    if (allowDecimal) {
      // collapse multiple dots to a single decimal point
      const firstDot = cleaned.indexOf(".");
      if (firstDot !== -1) {
        cleaned =
          cleaned.slice(0, firstDot + 1) +
          cleaned.slice(firstDot + 1).replace(/\./g, "");
      }
    }
    // Leading-zero handling: keep a single leading 0 only when it's "0" or the
    // integer part of a decimal ("0.x"); otherwise strip leading zeros.
    if (/^0\d/.test(cleaned)) {
      const dot = cleaned.indexOf(".");
      const intPart = dot === -1 ? cleaned : cleaned.slice(0, dot);
      const rest = dot === -1 ? "" : cleaned.slice(dot);
      cleaned = intPart.replace(/^0+(?=\d)/, "") + rest;
    }
    // Enforce a max length on the DIGITS (ignore the dot) so the limit is
    // intuitive regardless of decimal position.
    const digitCount = (cleaned.match(/\d/g) || []).length;
    if (digitCount > maxLen) {
      // trim from the end until within the digit budget
      let over = digitCount - maxLen;
      let out = "";
      for (let i = cleaned.length - 1; i >= 0; i--) {
        const ch = cleaned[i];
        if (/\d/.test(ch) && over > 0) {
          over--;
          continue;
        }
        out = ch + out;
      }
      cleaned = out;
    }
    setFacilityField(key, cleaned);
  };

  // Returns a field-error map for the given step ({} when the step is valid).
  const validateStep = (s) => {
    if (s === 0) {
      // Identity — every field is mandatory (TC_ID_016..026).
      return collectErrors(
        Object.fromEntries(
          IDENTITY_FIELDS.map((f) => [
            f.key,
            required(identity[f.key], f.label),
          ]),
        ),
      );
    }
    if (s === 2) {
      // Stakeholders — each begun row must be complete and valid: company, name,
      // role required (TC_STK_004/007), email format, phone rejects non-numeric
      // (TC_STK_006), and no duplicate Company/Org + Email pair (TC_STK_008).
      // A first row left entirely blank still errors so the user can't proceed
      // with zero stakeholders; extra fully-empty rows are skipped.
      const errs = {};
      const seen = new Set();
      stakeholders.forEach((row, i) => {
        const hasAny = (
          row.name ||
          row.company ||
          row.email ||
          row.phone ||
          row.role ||
          ""
        ).trim();
        // Skip extra empty rows, but require the very first row to be filled.
        if (!hasAny && i > 0) return;
        const rowErr = collectErrors({
          company: required(row.company, "Company / org"),
          name: required(row.name, "Name"),
          role: required(row.role, "Role"),
          email: row.email ? validateEmail(row.email) : "",
          phone: row.phone ? validatePhone(row.phone, "Phone number") : "",
        });
        // Duplicate = same Company/Org + Email (TC_STK_008).
        const key = `${(row.company || "").trim().toLowerCase()}|${(row.email || "").trim().toLowerCase()}`;
        if (row.company && row.email && seen.has(key)) {
          rowErr.email = "Duplicate stakeholder (same company and email).";
        }
        if (row.company && row.email) seen.add(key);
        if (Object.keys(rowErr).length) errs[i] = rowErr;
      });
      // Stash per-row errors in stepErrors under a namespaced key.
      return Object.keys(errs).length ? { __stakeholders: errs } : {};
    }
    if (s === 1) {
      // Facility (OPR) — numeric fields reject alphabets/special chars and are
      // mandatory; at least one voltage class must be chosen (ORP-FAC items).
      return collectErrors({
        criticalCapacity: numeric(facility.criticalCapacity, {
          label: "Critical IT Capacity",
          min: 0,
        }),
        whiteSpace: numeric(facility.whiteSpace, {
          label: "White Space",
          min: 0,
        }),
        dataHalls: numeric(facility.dataHalls, {
          label: "Data Halls / Pods",
          allowDecimal: false,
          min: 0,
        }),
        pue: numeric(facility.pue, { label: "Design PUE", min: 0 }),
        redundancy: required(facility.redundancy, "Redundancy"),
        uptime: required(facility.uptime, "Uptime Target"),
        cooling: required(facility.cooling, "Cooling Type"),
        voltages: requiredSelection(facility.voltages, "Voltage class"),
      });
    }
    if (s === 3) {
      // Scope & Levels — at least one commissioning level (TC_SL_020) and a
      // sampling rate must be chosen (TC_SL_019 ensures a sane default exists).
      return collectErrors({
        levels: requiredSelection(scope.levels, "At least one commissioning level"),
        sampling: required(scope.sampling, "Verification sampling rate"),
      });
    }
    if (s === 4) {
      // Asset Register — validate each selected asset's detail row.
      //   • Quantity: required whole number ≥ 1 (TC_AR_010/011/012/013/030).
      //   • PO#: optional, but if present only A–Z 0–9 and - _ / are allowed
      //     (TC_AR_019/020/021).
      //   • Manufacturer / Model: optional, length-capped at 100 (TC_AR_022/023/
      //     024/025).
      //   • Location / Lineup: optional, length-capped at 120 (TC_AR_026/027).
      //   • Notes: optional, length-capped at 1000 (TC_DC_022).
      const errs = {};
      Object.entries(assets).forEach(([name, d]) => {
        const rowErr = {};
        const qtyErr = numeric(d?.qty, {
          label: "Quantity",
          allowDecimal: false,
          min: 1,
        });
        if (qtyErr) rowErr.qty = qtyErr;

        if (d?.po && !/^[A-Za-z0-9\-_/]+$/.test(String(d.po).trim()))
          rowErr.po = "PO# may only contain letters, numbers, - _ and /.";

        const manuErr = d?.manufacturer
          ? lengthBetween(d.manufacturer, { max: 100, label: "Manufacturer" })
          : "";
        if (manuErr) rowErr.manufacturer = manuErr;

        const modelErr = d?.model
          ? lengthBetween(d.model, { max: 100, label: "Model" })
          : "";
        if (modelErr) rowErr.model = modelErr;

        const locErr = d?.location
          ? lengthBetween(d.location, { max: 120, label: "Location" })
          : "";
        if (locErr) rowErr.location = locErr;

        const lineupErr = d?.lineup
          ? lengthBetween(d.lineup, { max: 120, label: "Lineup" })
          : "";
        if (lineupErr) rowErr.lineup = lineupErr;

        const noteErr = d?.notes
          ? lengthBetween(d.notes, { max: 1000, label: "Notes" })
          : "";
        if (noteErr) rowErr.notes = noteErr;

        if (Object.keys(rowErr).length) errs[name] = rowErr;
      });
      return Object.keys(errs).length ? { __assets: errs } : {};
    }
    if (s === 5) {
      // Documents & Contracts — each package has a readiness status (always set,
      // so the required-status check at TC_DC_033 can never be left blank) and an
      // optional note. Notes accept any characters (TC_DC_023) but are
      // length-capped at 1000.
      const docErrs = {};
      Object.entries(docs).forEach(([label, row]) => {
        const noteErr = row?.note
          ? lengthBetween(row.note, { max: 1000, label: "Notes" })
          : "";
        if (noteErr) docErrs[label] = { note: noteErr };
      });
      return Object.keys(docErrs).length ? { __docs: docErrs } : {};
    }
    if (s === 6) {
      // Baseline & Milestones — milestone anchor dates must be chronological
      // (TC_BM_011), the baseline reference is length-capped (TC_BM_013), and
      // each freeze window the user began must have a label + a valid date
      // range (TC_BM_019/025/038), with no duplicate windows (TC_BM_029).
      const errs = {};
      // NTP Issued is the project start anchor — required so the schedule has a
      // zero date (TC_BM_038). The remaining anchors stay optional but, when
      // filled, must be chronological.
      if (!milestones.ntp) {
        errs.ntp = "NTP Issued date is required.";
      }
      // Milestone anchors are in declared chronological order; flag any that
      // precede the previous-filled anchor.
      let prevKey = null;
      MILESTONE_DATES.forEach((m) => {
        const v = milestones[m.key];
        if (!v) return;
        if (prevKey && dateOrder(milestones[prevKey], v)) {
          errs[m.key] = `${m.label} must be on or after ${
            MILESTONE_DATES.find((x) => x.key === prevKey).label
          }.`;
        }
        prevKey = m.key;
      });
      const refErr = milestones.baselineRef
        ? lengthBetween(milestones.baselineRef, {
            max: 100,
            label: "Baseline Schedule Reference",
          })
        : "";
      if (refErr) errs.baselineRef = refErr;
      // Freeze windows: validate each begun row, dedupe label|from|to.
      const freezeErrs = {};
      const seenFz = new Set();
      (milestones.freezes || []).forEach((fz, i) => {
        const hasAny = (
          fz.label ||
          fz.from ||
          fz.to ||
          fz.reason ||
          fz.scope ||
          ""
        ).trim();
        if (!hasAny) return;
        const rowErr = collectErrors({
          label:
            required(fz.label, "Freeze window label") ||
            lengthBetween(fz.label, { max: 500, label: "Freeze window label" }),
          from: required(fz.from, "Start date"),
          to:
            required(fz.to, "End date") ||
            dateOrder(fz.from, fz.to, { label: "End date" }),
          // Reason/Scope are optional, but length-capped when present
          // (TC_BM_021 / TC_BM_023).
          reason: fz.reason
            ? lengthBetween(fz.reason, { max: 500, label: "Reason" })
            : "",
          scope: fz.scope
            ? lengthBetween(fz.scope, { max: 500, label: "Scope" })
            : "",
        });
        const key = `${(fz.label || "").trim().toLowerCase()}|${fz.from}|${fz.to}`;
        if (hasAny && seenFz.has(key))
          rowErr.label = "Duplicate freeze window.";
        seenFz.add(key);
        if (Object.keys(rowErr).length) freezeErrs[i] = rowErr;
      });
      if (Object.keys(freezeErrs).length) errs.__freezes = freezeErrs;
      return errs;
    }
    if (s === 7) {
      // Team — each begun "key people" row must be complete: Name (required,
      // person-name charset so numbers/special chars are rejected — TC_TEAM_018/
      // 020, length-capped — TC_TEAM_016), Company (required — TC_TEAM_014/022,
      // length-capped — TC_TEAM_017), Role (required — TC_TEAM_015), with no
      // duplicate Name+Company pair (TC_TEAM_023). Empty rows are skipped so the
      // team list stays optional (an all-blank list passes).
      const teamErrs = {};
      const seen = new Set();
      team.forEach((t, i) => {
        const hasAny = (t.name || t.company || t.role || "").trim();
        if (!hasAny) return;
        const rowErr = collectErrors({
          name:
            required(t.name, "Name") ||
            validatePersonName(t.name, "Name", PERSON_NAME_PATTERN) ||
            lengthBetween(t.name, { max: MAX_NAME, label: "Name" }),
          company:
            required(t.company, "Company") ||
            lengthBetween(t.company, { max: MAX_COMPANY, label: "Company" }),
          role: required(t.role, "Role"),
        });
        const key = `${(t.name || "").trim().toLowerCase()}|${(t.company || "")
          .trim()
          .toLowerCase()}`;
        if (seen.has(key))
          rowErr.name = "Duplicate team member (same name and company).";
        seen.add(key);
        if (Object.keys(rowErr).length) teamErrs[i] = rowErr;
      });
      return Object.keys(teamErrs).length ? { __team: teamErrs } : {};
    }
    return {};
  };

  // Validate the current step; on failure set inline errors and block advance.
  const goNext = () => {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs);
      return;
    }
    setStepErrors({});
    setStep((s) => s + 1);
  };

  /* --------------------------- step bodies --------------------------- */

  const renderIdentity = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {IDENTITY_FIELDS.map((f) => (
        <Field key={f.key} label={f.label} required={f.required} error={stepErrors[f.key]}>
          <TextInput
            placeholder={f.ph}
            value={identity[f.key] || ""}
            error={stepErrors[f.key]}
            onChange={(e) => setIdentityField(f.key, e.target.value)}
          />
        </Field>
      ))}
    </div>
  );

  const toggleVoltage = (v) =>
    setFacility((p) => ({
      ...p,
      voltages: p.voltages.includes(v)
        ? p.voltages.filter((x) => x !== v)
        : [...p.voltages, v],
    }));

  const renderFacility = () => (
    <>
      <StepIntro>
        OPR snapshot — capacity, redundancy, uptime target — that drives the
        system list and gates.
      </StepIntro>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        <Field label="Critical IT Capacity (MW)" required error={stepErrors.criticalCapacity}>
          <TextInput
            placeholder="e.g. 36"
            inputMode="decimal"
            value={facility.criticalCapacity || ""}
            error={stepErrors.criticalCapacity}
            onChange={(e) =>
              setFacilityNumeric("criticalCapacity", e.target.value, {
                allowDecimal: true,
              })
            }
          />
        </Field>
        <Field label="White Space (Sq Ft)" required error={stepErrors.whiteSpace}>
          <TextInput
            placeholder="e.g. 120000"
            inputMode="numeric"
            value={facility.whiteSpace || ""}
            error={stepErrors.whiteSpace}
            onChange={(e) =>
              setFacilityNumeric("whiteSpace", e.target.value, {
                allowDecimal: false,
              })
            }
          />
        </Field>
        <Field label="Data Halls / Pods" required error={stepErrors.dataHalls}>
          <TextInput
            placeholder="e.g. 2"
            inputMode="numeric"
            value={facility.dataHalls || ""}
            error={stepErrors.dataHalls}
            onChange={(e) =>
              setFacilityNumeric("dataHalls", e.target.value, {
                allowDecimal: false,
              })
            }
          />
        </Field>
        <Field label="Redundancy" required error={stepErrors.redundancy}>
          <SelectInput
            value={facility.redundancy}
            error={stepErrors.redundancy}
            onChange={(e) => setFacilityField("redundancy", e.target.value)}
          >
            <option value="" disabled>
              Select redundancy…
            </option>
            {opts.redundancy.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Uptime Target" required error={stepErrors.uptime}>
          <SelectInput
            value={facility.uptime}
            error={stepErrors.uptime}
            onChange={(e) => setFacilityField("uptime", e.target.value)}
          >
            <option value="" disabled>
              Select uptime target…
            </option>
            {opts.uptime.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Cooling Type" required error={stepErrors.cooling}>
          <SelectInput
            value={facility.cooling}
            error={stepErrors.cooling}
            onChange={(e) => setFacilityField("cooling", e.target.value)}
          >
            <option value="" disabled>
              Select cooling type…
            </option>
            {opts.cooling.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Design PUE" required error={stepErrors.pue}>
          <TextInput
            placeholder="e.g. 1.3"
            inputMode="decimal"
            value={facility.pue || ""}
            error={stepErrors.pue}
            onChange={(e) =>
              setFacilityNumeric("pue", e.target.value, { allowDecimal: true })
            }
          />
        </Field>
      </div>

      <div className="mt-6">
        <label className="uppercase block mb-2.5" style={labelStyle}>
          Voltage Classes Present <span style={{ color: "var(--rf-red)" }}>*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {opts.voltages.map((v) => (
            <Chip
              key={v}
              active={facility.voltages.includes(v)}
              onClick={() => {
                toggleVoltage(v);
                setStepErrors((e) =>
                  e.voltages ? { ...e, voltages: undefined } : e,
                );
              }}
            >
              {v}
            </Chip>
          ))}
        </div>
        {stepErrors.voltages && (
          <span role="alert" className="text-xs mt-1.5 block" style={{ color: "var(--rf-red)" }}>
            {stepErrors.voltages}
          </span>
        )}
      </div>

      <div className="mt-6">
        <Checkbox
          checked={facility.tccf}
          onChange={(e) =>
            setFacility((p) => ({ ...p, tccf: e.target.checked }))
          }
          label="Uptime Institute Tier Certification of Constructed Facility (TCCF) in scope"
        />
        <p className="text-xs mt-1.5 ml-6" style={{ color: "var(--rf-txt3)" }}>
          Optional — only if the owner is pursuing Uptime Tier certification.
          Leave off otherwise.
        </p>
      </div>
    </>
  );

  const updateStakeholder = (i, key, val) => {
    setStakeholders((p) =>
      p.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    );
    // Clear this row's inline error as the user corrects it.
    setStepErrors((e) => {
      if (!e.__stakeholders?.[i]?.[key]) return e;
      const next = { ...e.__stakeholders, [i]: { ...e.__stakeholders[i], [key]: undefined } };
      return { ...e, __stakeholders: next };
    });
  };

  const renderStakeholders = () => {
    const q = search.users.trim().toLowerCase();
    const userRows = users.filter(
      (u) =>
        !q ||
        userLabel(u).toLowerCase().includes(q) ||
        String(u.email || "")
          .toLowerCase()
          .includes(q),
    );
    return (
      <>
        <StepIntro>
          Stakeholder directory — link platform users from the Users module (or
          add new ones), then refine company / role below. {stakeholders.length}{" "}
          row(s).
        </StepIntro>

        <ModulePicker
          title="Platform users"
          hint="Select existing users to add as stakeholders, or create a new user."
          search={search.users}
          onSearch={(e) => setSearch((p) => ({ ...p, users: e.target.value }))}
          addLabel="+ New user"
          addOpen={addOpen.users}
          onToggleAdd={() => setAddOpen((p) => ({ ...p, users: !p.users }))}
          loading={moduleLoading.users}
          isEmpty={userRows.length === 0}
          emptyText="No users found."
          addForm={
            <div className="flex flex-col gap-3">
              <TextInput
                type="email"
                placeholder="Email *"
                maxLength={254}
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((p) => ({ ...p, email: e.target.value }))
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextInput
                  placeholder="First name *"
                  maxLength={100}
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, firstName: e.target.value }))
                  }
                />
                <TextInput
                  placeholder="Last name"
                  maxLength={100}
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, lastName: e.target.value }))
                  }
                />
              </div>
              {roles.length > 0 && (
                <SelectInput
                  value={newUser.roleId}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, roleId: e.target.value }))
                  }
                >
                  <option value="">Select role…</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.description || r.name}
                    </option>
                  ))}
                </SelectInput>
              )}
              <button
                type="button"
                disabled={moduleBusy}
                onClick={submitNewUser}
                className="self-start px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: moduleBusy ? 0.6 : 1,
                }}
              >
                {moduleBusy ? "Creating…" : "Create user"}
              </button>
            </div>
          }
        >
          {userRows.map((u) => (
            <PickRow
              key={u.id}
              selected={userLinked(u)}
              onClick={() => linkUser(u)}
              title={userLabel(u)}
              subtitle={u.email}
            />
          ))}
        </ModulePicker>

        <div className="flex flex-col gap-3">
          {stakeholders.map((s, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <TextInput
                  placeholder="Company / org"
                  value={s.company}
                  error={stepErrors.__stakeholders?.[i]?.company}
                  onChange={(e) =>
                    updateStakeholder(i, "company", e.target.value)
                  }
                />
                {stepErrors.__stakeholders?.[i]?.company && (
                  <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
                    {stepErrors.__stakeholders[i].company}
                  </span>
                )}
              </div>
              <div>
                <SelectInput
                  value={s.role}
                  error={stepErrors.__stakeholders?.[i]?.role}
                  onChange={(e) => updateStakeholder(i, "role", e.target.value)}
                >
                  <option value="" disabled>
                    Select role…
                  </option>
                  {opts.stakeholderRoles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </SelectInput>
                {stepErrors.__stakeholders?.[i]?.role && (
                  <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
                    {stepErrors.__stakeholders[i].role}
                  </span>
                )}
              </div>
              <div>
                <TextInput
                  placeholder="Name"
                  value={s.name}
                  error={stepErrors.__stakeholders?.[i]?.name}
                  onChange={(e) => updateStakeholder(i, "name", e.target.value)}
                />
                {stepErrors.__stakeholders?.[i]?.name && (
                  <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
                    {stepErrors.__stakeholders[i].name}
                  </span>
                )}
              </div>
              <div>
                <TextInput
                  placeholder="Email"
                  value={s.email}
                  error={stepErrors.__stakeholders?.[i]?.email}
                  onChange={(e) => updateStakeholder(i, "email", e.target.value)}
                />
                {stepErrors.__stakeholders?.[i]?.email && (
                  <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
                    {stepErrors.__stakeholders[i].email}
                  </span>
                )}
              </div>
              <div>
                <div className="flex gap-2">
                  <TextInput
                    placeholder="Phone"
                    value={s.phone}
                    error={stepErrors.__stakeholders?.[i]?.phone}
                    onChange={(e) =>
                      updateStakeholder(i, "phone", e.target.value)
                    }
                  />
                  {stakeholders.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setStakeholders((p) => p.filter((_, idx) => idx !== i))
                      }
                      className="px-3 rounded-xl text-sm font-bold"
                      style={{
                        color: "var(--rf-red)",
                        border: "1px solid var(--rf-border, #c5d2ea)",
                      }}
                      title="Remove"
                    >
                      ×
                    </button>
                  )}
                </div>
                {stepErrors.__stakeholders?.[i]?.phone && (
                  <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
                    {stepErrors.__stakeholders[i].phone}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            // Validate the existing rows before appending a new blank one, so a
            // user can't add a stakeholder while the current one is empty/invalid
            // (TC_STK_004). If anything's wrong, surface the errors and don't add.
            const errs = validateStep(2);
            if (Object.keys(errs).length > 0) {
              setStepErrors(errs);
              return;
            }
            setStepErrors({});
            setStakeholders((p) => [
              ...p,
              { company: "", role: "", name: "", email: "", phone: "" },
            ]);
          }}
          className="mt-3 text-sm font-bold"
          style={{ color: "var(--rf-accent)" }}
        >
          + Add stakeholder
        </button>
      </>
    );
  };

  const toggleLevel = (l) => {
    setScope((p) => ({
      ...p,
      levels: p.levels.includes(l)
        ? p.levels.filter((x) => x !== l)
        : [...p.levels, l],
    }));
    setStepErrors((er) => (er.levels ? { ...er, levels: undefined } : er));
  };

  const renderScope = () => (
    <>
      <label className="uppercase block mb-2.5" style={labelStyle}>
        Commissioning Levels in Scope
      </label>
      <div className="flex flex-wrap gap-2">
        {opts.levels.map((l) => (
          <Chip
            key={l}
            active={scope.levels.includes(l)}
            onClick={() => toggleLevel(l)}
          >
            {l}
          </Chip>
        ))}
      </div>
      {stepErrors.levels && (
        <span role="alert" className="text-xs mt-2 block" style={{ color: "var(--rf-red)" }}>
          {stepErrors.levels}
        </span>
      )}
      <p className="text-xs mt-2.5" style={{ color: "var(--rf-txt3)" }}>
        L1 Factory · L2 Install · L3 Energize · L4 Functional/Fault · L5 IST.
        Each level is a gate that must close before the next.
      </p>

      <div className="mt-6 max-w-3xl">
        <Field
          label="Verification Sampling Rate"
          required
          error={stepErrors.sampling}
        >
          <SelectInput
            value={scope.sampling}
            onChange={(e) => {
              setScope((p) => ({ ...p, sampling: e.target.value }));
              setStepErrors((er) =>
                er.sampling ? { ...er, sampling: undefined } : er,
              );
            }}
          >
            {opts.sampling.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <div className="mt-5">
        <Checkbox
          checked={scope.ownerWitness}
          onChange={(e) =>
            setScope((p) => ({ ...p, ownerWitness: e.target.checked }))
          }
          label="Owner/CxA witnesses 100% of L4 & L5 tasks"
        />
      </div>
    </>
  );

  // Default detail captured when an asset is selected. Furnish seeds from the
  // registry asset's procurement type when available.
  const defaultAssetDetail = (a) => ({
    qty: 1,
    furnish: a?.procurementType || "CFCI",
    order: "NOT_ORDERED",
    po: "",
    manufacturer: "",
    model: "",
    location: "",
    lineup: "",
    notes: "",
    category: a?.category || "",
    assetTag: a?.assetTag || "",
    // Static BQ systems are not yet registered assets — flag them so they get
    // bulk-created via /assets/bulk at finalize. API assets already exist.
    staticBq: !!a?.staticBq,
    bqCode: a?.bqCode || "",
  });
  // Toggle by asset object: select → attach a detail object, deselect → drop it.
  const toggleAsset = (a) =>
    setAssets((p) => {
      const next = { ...p };
      if (next[a.name]) delete next[a.name];
      else next[a.name] = defaultAssetDetail(a);
      return next;
    });
  const updateAssetField = (name, key, val) => {
    let v = val;
    // Quantity: strip alphabets, decimals and the minus sign at input time so the
    // field only ever holds whole digits (TC_AR_013 rejects text, TC_AR_012
    // rejects negatives). We intentionally DON'T coerce 0 → 1 here — an empty or
    // zero quantity is surfaced as a validation error on save (TC_AR_011/030),
    // not silently rewritten, so the user gets feedback.
    if (key === "qty") {
      v = String(val).replace(/[^\d]/g, "");
    }
    setAssets((p) => ({ ...p, [name]: { ...p[name], [key]: v } }));
    // Clear this asset's matching inline error as the user edits that field.
    setStepErrors((e) =>
      e.__assets?.[name]?.[key]
        ? {
            ...e,
            __assets: {
              ...e.__assets,
              [name]: { ...e.__assets[name], [key]: undefined },
            },
          }
        : e,
    );
  };

  const renderAssets = () => {
    // Names already present in the API-driven Asset Register. Static BQ systems
    // are bulk-registered by their label at finalize, so once registered they
    // come back from the API by that same name — dedupe against this set so each
    // standard system shows once (the real registered asset wins).
    const apiAssetNames = new Set(
      assetCatalog
        .map((a) => (a.name || "").trim().toLowerCase())
        .filter(Boolean),
    );

    // Standard commissioning systems (BQ) — always available, grouped by
    // discipline/phase. Each [code, label] pair is shaped like an Asset Register
    // row so it reuses the same checkbox + per-asset detail editor. Static
    // systems already registered via the API are filtered out here.
    const staticGroups = STATIC_ASSET_BQ.map((d) => ({
      title: `${d.disc} · ${d.phase}`,
      items: d.types
        .filter(([, label]) => !apiAssetNames.has(label.trim().toLowerCase()))
        .map(([code, label]) => ({
          id: `bq-${d.disc}-${code}`,
          name: label,
          assetTag: code,
          category: d.disc,
          // BQ-specific: flag + type code so selected static systems can be
          // bulk-registered in the Asset Management module at finalize.
          staticBq: true,
          bqCode: code,
        })),
    })).filter((g) => g.items.length > 0);

    // Group the registered assets by their `category` so the select UI matches
    // the original category-card layout — but driven entirely by the API.
    const apiGroups = [];
    const byTitle = {};
    assetCatalog.forEach((a) => {
      const title = a.category || "Uncategorized";
      if (!byTitle[title]) {
        byTitle[title] = { title, items: [] };
        apiGroups.push(byTitle[title]);
      }
      byTitle[title].items.push(a);
    });

    // Standard systems first, then anything registered via the API.
    const groups = [...staticGroups, ...apiGroups];
    return (
      <>
        <StepIntro>
          Select assets from the Asset Register (grouped by category), or
          register a new asset. Selected items become project assets you can
          detail (quantity, furnish, POH) on the project page. {assetCount}{" "}
          selected.
        </StepIntro>

        <div className="flex items-center justify-between mb-4">
          <label className="uppercase" style={labelStyle}>
            Asset register
          </label>
          <button
            type="button"
            onClick={() => setAddOpen((p) => ({ ...p, assets: !p.assets }))}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: addOpen.assets ? "var(--rf-bg3)" : "var(--rf-accent)",
              color: addOpen.assets ? "var(--rf-txt2)" : "#fff",
              border: `1px solid ${addOpen.assets ? "var(--rf-border, #c5d2ea)" : "var(--rf-accent)"}`,
            }}
          >
            {addOpen.assets ? "Close" : "+ New asset"}
          </button>
        </div>

        {addOpen.assets && (
          <div
            className="rounded-xl p-3 mb-4"
            style={{
              background: "var(--rf-bg)",
              border: "1px dashed var(--rf-border3, #8daacf)",
            }}
          >
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <TextInput
                  placeholder="Asset tag * (e.g. IT-LAP-0042)"
                  value={newAsset.assetTag}
                  onChange={(e) =>
                    setNewAsset((p) => ({ ...p, assetTag: e.target.value }))
                  }
                />
                <TextInput
                  placeholder="Asset name *"
                  value={newAsset.name}
                  onChange={(e) =>
                    setNewAsset((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SelectInput
                  value={newAsset.category}
                  onChange={(e) =>
                    setNewAsset((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  {ASSET_REG_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </SelectInput>
                <SelectInput
                  value={newAsset.procurementType}
                  onChange={(e) =>
                    setNewAsset((p) => ({
                      ...p,
                      procurementType: e.target.value,
                    }))
                  }
                >
                  <option value="OFCI">OFCI</option>
                  <option value="CFCI">CFCI</option>
                </SelectInput>
              </div>
              <button
                type="button"
                disabled={moduleBusy}
                onClick={submitNewAsset}
                className="self-start px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: moduleBusy ? 0.6 : 1,
                }}
              >
                {moduleBusy ? "Registering…" : "Register asset"}
              </button>
            </div>
          </div>
        )}

        {moduleLoading.assets && (
          <p className="text-xs mb-3" style={{ color: "var(--rf-txt3)" }}>
            Loading registered assets…
          </p>
        )}
        <div className="flex flex-col gap-4">
          {groups.map((cat) => (
            <div
              key={cat.title}
              className="rounded-2xl p-4"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border2, #adbbd8)",
              }}
            >
              <h4 className="uppercase mb-3" style={labelStyle}>
                {cat.title}
              </h4>
              <div className="flex flex-col gap-2.5">
                {cat.items.map((a) => {
                  const d = assets[a.name];
                  return (
                    <div key={a.id}>
                      <Checkbox
                        checked={!!d}
                        onChange={() => toggleAsset(a)}
                        label={
                          a.assetTag && a.assetTag !== a.name
                            ? `${a.name} · ${a.assetTag}`
                            : a.name || a.assetTag || "Asset"
                        }
                      />
                      {d &&
                        (() => {
                          const rowErr = stepErrors.__assets?.[a.name] || {};
                          return (
                            <div className="mt-2.5 flex flex-col gap-2 pb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-[11px] font-bold tracking-wide"
                                  style={{ color: "var(--rf-txt3)" }}
                                >
                                  QTY
                                </span>
                                <MiniText
                                  type="number"
                                  min={1}
                                  step={1}
                                  inputMode="numeric"
                                  className="w-16"
                                  error={!!rowErr.qty}
                                  aria-label="Quantity"
                                  value={d.qty}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "qty",
                                      e.target.value,
                                    )
                                  }
                                />
                                <MiniSelect
                                  className="w-24"
                                  aria-label="Furnish (CFCI/OFCI)"
                                  value={d.furnish}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "furnish",
                                      e.target.value,
                                    )
                                  }
                                >
                                  {ASSET_FURNISH.map((o) => (
                                    <option key={o}>{o}</option>
                                  ))}
                                </MiniSelect>
                                <MiniSelect
                                  className="w-40"
                                  aria-label="Order status"
                                  value={d.order}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "order",
                                      e.target.value,
                                    )
                                  }
                                >
                                  {ASSET_ORDER_STATUSES.map((o) => (
                                    <option key={o} value={o}>
                                      {orderStatusLabel(o)}
                                    </option>
                                  ))}
                                </MiniSelect>
                                <MiniText
                                  className="flex-1 min-w-[90px]"
                                  placeholder="PO#"
                                  aria-label="PO number"
                                  error={!!rowErr.po}
                                  value={d.po}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "po",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              {(rowErr.qty || rowErr.po) && (
                                <span
                                  role="alert"
                                  className="text-xs"
                                  style={{ color: "var(--rf-red)" }}
                                >
                                  {rowErr.qty || rowErr.po}
                                </span>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                <MiniText
                                  placeholder="manufacturer"
                                  aria-label="Manufacturer"
                                  maxLength={100}
                                  error={!!rowErr.manufacturer}
                                  value={d.manufacturer}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "manufacturer",
                                      e.target.value,
                                    )
                                  }
                                />
                                <MiniText
                                  placeholder="model"
                                  aria-label="Model"
                                  maxLength={100}
                                  error={!!rowErr.model}
                                  value={d.model}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "model",
                                      e.target.value,
                                    )
                                  }
                                />
                                <MiniText
                                  placeholder="location"
                                  aria-label="Location"
                                  maxLength={120}
                                  error={!!rowErr.location}
                                  value={d.location}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "location",
                                      e.target.value,
                                    )
                                  }
                                />
                                <MiniText
                                  placeholder="lineup"
                                  aria-label="Lineup"
                                  maxLength={120}
                                  error={!!rowErr.lineup}
                                  value={d.lineup}
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "lineup",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                              {(rowErr.manufacturer ||
                                rowErr.model ||
                                rowErr.location ||
                                rowErr.lineup) && (
                                <span
                                  role="alert"
                                  className="text-xs"
                                  style={{ color: "var(--rf-red)" }}
                                >
                                  {rowErr.manufacturer ||
                                    rowErr.model ||
                                    rowErr.location ||
                                    rowErr.lineup}
                                </span>
                              )}
                              <div
                                className="np-fieldbox"
                                style={miniBox}
                              >
                                <textarea
                                  placeholder="notes (optional)"
                                  maxLength={1000}
                                  rows={2}
                                  value={d.notes || ""}
                                  aria-invalid={
                                    rowErr.notes ? true : undefined
                                  }
                                  onChange={(e) =>
                                    updateAssetField(
                                      a.name,
                                      "notes",
                                      e.target.value,
                                    )
                                  }
                                  className="w-full px-3 py-2 rounded-[10px] text-sm outline-none bg-transparent resize-y"
                                  style={bareControlStyle}
                                />
                              </div>
                              {rowErr.notes && (
                                <span
                                  role="alert"
                                  className="text-xs"
                                  style={{ color: "var(--rf-red)" }}
                                >
                                  {rowErr.notes}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderDocs = () => {
    // Merge documents fetched from the API with any uploaded this session,
    // de-duped by id, so the list is fully API-driven.
    const seen = {};
    const docList = [];
    [...uploadedDocs, ...documentsCatalog].forEach((d) => {
      if (!d || !d.id || seen[d.id]) return;
      seen[d.id] = true;
      docList.push(d);
    });
    return (
      <>
        <StepIntro>
          Set the readiness status of each required document package, then
          optionally select or upload supporting files. {selectedDocIds.length}{" "}
          file(s) selected.
        </StepIntro>

        {/* Document-readiness grid — a status + note per required package. The
            `docs` map (keyed by label) carries status/note into the finalize
            payload (docRows). */}
        <label className="uppercase block mb-2.5" style={labelStyle}>
          Document Readiness
        </label>
        <div className="flex flex-col gap-2.5 mb-6">
          {DOC_ITEMS.map((label) => {
            const row = docs[label] || { status: "Pending", note: "" };
            const noteErr = stepErrors.__docs?.[label]?.note;
            return (
              <div
                key={label}
                className="rounded-xl p-3"
                style={{
                  background: "var(--rf-bg2)",
                  border: "1px solid var(--rf-border2, #adbbd8)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-2.5 items-center">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    {label}
                  </span>
                  <SelectInput
                    aria-label={`${label} status`}
                    value={row.status}
                    onChange={(e) =>
                      setDocField(label, "status", e.target.value)
                    }
                  >
                    {DOC_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </SelectInput>
                </div>
                <div className="mt-2">
                  <TextInput
                    placeholder="Notes (optional)"
                    aria-label={`${label} notes`}
                    maxLength={1000}
                    error={!!noteErr}
                    value={row.note || ""}
                    onChange={(e) => setDocField(label, "note", e.target.value)}
                  />
                  {noteErr && (
                    <span
                      role="alert"
                      className="text-xs mt-1 block"
                      style={{ color: "var(--rf-red)" }}
                    >
                      {noteErr}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-4">
          <label className="uppercase" style={labelStyle}>
            Documents
          </label>
          <button
            type="button"
            onClick={() => setAddOpen((p) => ({ ...p, docs: !p.docs }))}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: addOpen.docs ? "var(--rf-bg3)" : "var(--rf-accent)",
              color: addOpen.docs ? "var(--rf-txt2)" : "#fff",
              border: `1px solid ${addOpen.docs ? "var(--rf-border, #c5d2ea)" : "var(--rf-accent)"}`,
            }}
          >
            {addOpen.docs ? "Close" : "+ Upload document"}
          </button>
        </div>

        {addOpen.docs && (
          <div
            className="rounded-xl p-3 mb-4"
            style={{
              background: "var(--rf-bg)",
              border: "1px dashed var(--rf-border3, #8daacf)",
            }}
          >
            <div className="flex flex-col gap-3">
              <TextInput
                placeholder="Document title *"
                maxLength={200}
                error={docError}
                value={newDoc.title}
                onChange={(e) => {
                  setNewDoc((p) => ({ ...p, title: e.target.value }));
                  if (docError) setDocError("");
                }}
              />
              <label
                htmlFor="np-doc-file"
                role="button"
                tabIndex={0}
                aria-label="Choose a document file to upload"
                onKeyDown={(e) => {
                  // The native file <input> is visually hidden, so the label
                  // itself must open the picker on Enter/Space for keyboard
                  // users (DC_040).
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    document.getElementById("np-doc-file")?.click();
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const f = e.dataTransfer.files?.[0];
                  if (f) pickDocFile(f);
                }}
                className="block rounded-xl p-6 text-center cursor-pointer transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rf-accent)]"
                style={{
                  border: `2px dashed ${newDoc.file ? "var(--rf-accent)" : "var(--rf-border3, #8daacf)"}`,
                  background: newDoc.file ? "var(--rf-bg3)" : "var(--rf-bg2)",
                }}
              >
                <input
                  id="np-doc-file"
                  type="file"
                  className="hidden"
                  accept={ALLOWED_DOC_EXTS.map((x) => `.${x}`).join(",")}
                  onChange={(e) => pickDocFile(e.target.files?.[0] || null)}
                />
                {newDoc.file ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--rf-accent)"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span
                      className="text-sm font-semibold break-all"
                      style={{ color: "var(--rf-txt)" }}
                    >
                      {newDoc.file.name}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--rf-txt3)" }}
                    >
                      {(newDoc.file.size / 1024 / 1024).toFixed(2)} MB · click
                      to change
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--rf-txt3)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 16a4 4 0 0 1-.88-7.903A5 5 0 1 1 15.9 6L16 6a5 5 0 0 1 1 9.9" />
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                    </svg>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--rf-txt)" }}
                    >
                      Drag &amp; drop or click to select
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--rf-txt3)" }}
                    >
                      Any file type supported
                    </span>
                  </div>
                )}
              </label>
              {docUploadPct !== null && (
                <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
                  Uploading… {docUploadPct}%
                </p>
              )}
              {docError && (
                <p
                  role="alert"
                  className="text-xs"
                  style={{ color: "var(--rf-red)" }}
                >
                  {docError}
                </p>
              )}
              <button
                type="button"
                disabled={moduleBusy}
                onClick={submitNewDoc}
                className="self-start px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: moduleBusy ? 0.6 : 1,
                }}
              >
                {moduleBusy ? "Uploading…" : "Upload document"}
              </button>
            </div>
          </div>
        )}

        {moduleLoading.docs ? (
          <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
            Loading documents…
          </p>
        ) : docList.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
            No documents found — upload one above to get started.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {docList.map((d) => {
              const selected = selectedDocIds.includes(d.id);
              const isUploaded = uploadedDocs.some((u) => u.id === d.id);
              return (
                <div
                  key={d.id}
                  className="rounded-lg px-3 py-2.5"
                  style={{
                    background: selected ? "var(--rf-bg3)" : "var(--rf-bg2)",
                    border: `1px solid ${selected ? "var(--rf-accent)" : "var(--rf-border2, #adbbd8)"}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Checkbox
                      checked={selected}
                      onChange={() => toggleDoc(d.id)}
                      label={d.title || d.fileName || "Document"}
                    />
                    {isUploaded && (
                      <button
                        type="button"
                        onClick={() => removeUploadedDoc(d.id)}
                        aria-label={`Remove ${d.title || d.fileName || "document"}`}
                        title="Remove"
                        className="flex-shrink-0 px-2.5 py-1 rounded-lg text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--rf-accent)]"
                        style={{
                          color: "var(--rf-red)",
                          border: "1px solid var(--rf-border, #c5d2ea)",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {(d.fileName || d.category) && (
                    <div
                      className="text-xs mt-1 ml-7 flex flex-wrap gap-x-2"
                      style={{ color: "var(--rf-txt3)" }}
                    >
                      {d.fileName && (
                        <span className="truncate max-w-full">{d.fileName}</span>
                      )}
                      {d.category && (
                        <span>· {String(d.category).replace(/_/g, " ")}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  };

  // Update one field on a freeze row and clear that row's inline error.
  const setFreezeField = (i, key, val) => {
    setMilestones((p) => ({
      ...p,
      freezes: p.freezes.map((x, idx) =>
        idx === i ? { ...x, [key]: val } : x,
      ),
    }));
    setStepErrors((er) =>
      er.__freezes?.[i]?.[key]
        ? {
            ...er,
            __freezes: {
              ...er.__freezes,
              [i]: { ...er.__freezes[i], [key]: undefined },
            },
          }
        : er,
    );
  };

  // Update one field (status / note) on a document-readiness row and clear that
  // row's inline note error. The `docs` map is keyed by the DOC_ITEM label.
  const setDocField = (label, key, val) => {
    setDocs((p) => ({ ...p, [label]: { ...p[label], [key]: val } }));
    if (key === "note") {
      setStepErrors((er) =>
        er.__docs?.[label]?.note
          ? {
              ...er,
              __docs: { ...er.__docs, [label]: undefined },
            }
          : er,
      );
    }
  };

  const renderBaseline = () => (
    <>
      <StepIntro>
        Key milestone dates and a reference to the baseline schedule (the full
        P6 activity list lives in the Schedule module — this is just the anchor
        dates).
      </StepIntro>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        {MILESTONE_DATES.map((m) => (
          <Field
            key={m.key}
            label={m.label}
            required={m.key === "ntp"}
            error={stepErrors[m.key]}
          >
            <TextInput
              type="date"
              error={stepErrors[m.key]}
              value={milestones[m.key] || ""}
              onChange={(e) => {
                const v = e.target.value;
                setMilestones((p) => ({ ...p, [m.key]: v }));
                setStepErrors((er) =>
                  er[m.key] ? { ...er, [m.key]: undefined } : er,
                );
              }}
            />
          </Field>
        ))}
      </div>

      <div className="mt-5">
        <Field
          label="Baseline Schedule Reference"
          error={stepErrors.baselineRef}
        >
          <TextInput
            placeholder="e.g. DLR-DFW39-28-R0 (P6 Update 28)"
            maxLength={100}
            error={stepErrors.baselineRef}
            value={milestones.baselineRef || ""}
            onChange={(e) => {
              const v = e.target.value;
              setMilestones((p) => ({ ...p, baselineRef: v }));
              setStepErrors((er) =>
                er.baselineRef ? { ...er, baselineRef: undefined } : er,
              );
            }}
          />
        </Field>
      </div>

      <div className="mt-6">
        <label className="uppercase block mb-1.5" style={labelStyle}>
          Freeze / Blackout Windows
        </label>
        <p className="text-xs mb-3" style={{ color: "var(--rf-txt3)" }}>
          Owner-imposed no-energization / no-cutover windows (peak/holiday
          freeze, tenant live-load, night-only). Work scheduling and gates
          should respect these.
        </p>
        <div className="flex flex-col gap-3">
          {milestones.freezes.map((fz, i) => {
            const fErr = stepErrors.__freezes?.[i] || {};
            return (
            <div key={i} className="flex flex-col gap-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TextInput
                placeholder="Label (e.g. Holiday freeze)"
                maxLength={500}
                error={fErr.label}
                value={fz.label}
                onChange={(e) => setFreezeField(i, "label", e.target.value)}
              />
              <TextInput
                type="date"
                error={fErr.from}
                value={fz.from}
                onChange={(e) => setFreezeField(i, "from", e.target.value)}
              />
              <div className="flex gap-2">
                <TextInput
                  type="date"
                  error={fErr.to}
                  value={fz.to}
                  onChange={(e) => setFreezeField(i, "to", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() =>
                    setMilestones((p) => ({
                      ...p,
                      freezes: p.freezes.filter((_, idx) => idx !== i),
                    }))
                  }
                  className="px-3 rounded-xl text-sm font-bold"
                  style={{
                    color: "var(--rf-red)",
                    border: "1px solid var(--rf-border, #c5d2ea)",
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Reason + Scope for the freeze (TC_BM_021 / TC_BM_023) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              <div>
                <TextInput
                  placeholder="Reason (why the schedule is locked)"
                  maxLength={500}
                  error={fErr.reason}
                  value={fz.reason || ""}
                  onChange={(e) => setFreezeField(i, "reason", e.target.value)}
                />
                {fErr.reason && (
                  <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
                    {fErr.reason}
                  </span>
                )}
              </div>
              <div>
                <TextInput
                  placeholder="Scope (what the freeze applies to)"
                  maxLength={500}
                  error={fErr.scope}
                  value={fz.scope || ""}
                  onChange={(e) => setFreezeField(i, "scope", e.target.value)}
                />
                {fErr.scope && (
                  <span role="alert" className="text-xs" style={{ color: "var(--rf-red)" }}>
                    {fErr.scope}
                  </span>
                )}
              </div>
            </div>
            {(fErr.label || fErr.from || fErr.to) && (
              <span
                role="alert"
                className="text-xs"
                style={{ color: "var(--rf-red)" }}
              >
                {fErr.label || fErr.from || fErr.to}
              </span>
            )}
            </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() =>
            setMilestones((p) => ({
              ...p,
              freezes: [...p.freezes, { label: "", from: "", to: "", reason: "", scope: "" }],
            }))
          }
          className="mt-3 text-sm font-bold"
          style={{ color: "var(--rf-accent)" }}
        >
          + Add freeze / blackout window
        </button>
      </div>
    </>
  );

  const updateTeam = (i, key, val) => {
    setTeam((p) => p.map((t, idx) => (idx === i ? { ...t, [key]: val } : t)));
    // Clear this row's matching inline error as the user edits that field.
    setStepErrors((er) =>
      er.__team?.[i]?.[key]
        ? {
            ...er,
            __team: { ...er.__team, [i]: { ...er.__team[i], [key]: undefined } },
          }
        : er,
    );
  };

  // Append a new key-people row only when the current rows are valid and the max
  // hasn't been reached (TC_TEAM_027/054/055 + validate-before-add).
  const addTeamRow = () => {
    const errs = validateStep(7);
    if (errs.__team) {
      setStepErrors(errs);
      return;
    }
    if (team.length >= MAX_TEAM_MEMBERS) {
      setError(`You can add at most ${MAX_TEAM_MEMBERS} team members here.`);
      return;
    }
    setError("");
    setTeam((p) => [...p, { name: "", company: "", role: "" }]);
  };

  // Remove a key-people row after an explicit inline confirmation (TC_TEAM_050).
  // An inline confirm (rather than a blocking window.confirm) keeps the UI
  // responsive and accessible.
  const removeTeamRow = (i) => {
    setTeam((p) => p.filter((_, idx) => idx !== i));
    setTeamConfirmRemove(null);
    setStepErrors((er) => {
      if (!er.__team) return er;
      const next = { ...er.__team };
      delete next[i];
      return { ...er, __team: next };
    });
  };

  const renderTeam = () => {
    const q = search.teams.trim().toLowerCase();
    const teamRows = teamCatalog.filter(
      (t) =>
        !q ||
        String(t.name || "")
          .toLowerCase()
          .includes(q),
    );
    return (
      <>
        <StepIntro>
          Link teams from the Teams module (or create one), and/or add key
          people below. Manage the full crew on the project Team page.
        </StepIntro>

        <ModulePicker
          title="Teams"
          hint="Select existing teams to attach, or create a new team."
          search={search.teams}
          onSearch={(e) => setSearch((p) => ({ ...p, teams: e.target.value }))}
          addLabel="+ New team"
          addOpen={addOpen.teams}
          onToggleAdd={() => setAddOpen((p) => ({ ...p, teams: !p.teams }))}
          loading={moduleLoading.teams}
          isEmpty={teamRows.length === 0}
          emptyText="No teams found."
          addForm={
            <div className="flex flex-col gap-3">
              <TextInput
                placeholder="Team name *"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, name: e.target.value }))
                }
              />
              <button
                type="button"
                disabled={moduleBusy}
                onClick={submitNewTeam}
                className="self-start px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: moduleBusy ? 0.6 : 1,
                }}
              >
                {moduleBusy ? "Creating…" : "Create team"}
              </button>
            </div>
          }
        >
          {teamRows.map((t) => (
            <PickRow
              key={t.id}
              selected={linkedTeamIds.includes(t.id)}
              onClick={() => toggleTeamLink(t)}
              title={t.name || "Team"}
              subtitle={
                t.memberCount != null ? `${t.memberCount} member(s)` : undefined
              }
            />
          ))}
        </ModulePicker>

        <label
          className="uppercase block mb-2.5 font-bold"
          style={{ ...labelStyle, color: "var(--rf-txt)" }}
        >
          Add Team Member
        </label>
        <div className="flex flex-col gap-3">
          {team.map((t, i) => {
            const rowErr = stepErrors.__team?.[i] || {};
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <TextInput
                    placeholder="Name"
                    aria-label="Team member name"
                    maxLength={MAX_NAME}
                    error={!!rowErr.name}
                    value={t.name}
                    onChange={(e) => updateTeam(i, "name", e.target.value)}
                  />
                  <TextInput
                    placeholder="Company"
                    aria-label="Team member company"
                    maxLength={MAX_COMPANY}
                    error={!!rowErr.company}
                    value={t.company}
                    onChange={(e) => updateTeam(i, "company", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <SelectInput
                      aria-label="Team member role"
                      error={!!rowErr.role}
                      value={t.role}
                      onChange={(e) => updateTeam(i, "role", e.target.value)}
                    >
                      <option value="" disabled>
                        Select role…
                      </option>
                      {opts.teamRoles.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </SelectInput>
                    {team.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setTeamConfirmRemove(i)}
                        className="px-3 rounded-xl text-sm font-bold"
                        style={{
                          color: "var(--rf-red)",
                          border: "1px solid var(--rf-border, #c5d2ea)",
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                {teamConfirmRemove === i && (
                  <div
                    role="alertdialog"
                    aria-label="Confirm remove team member"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 mt-1"
                    style={{
                      background: "var(--rf-bg3)",
                      border: "1px solid var(--rf-red, #ef4444)",
                    }}
                  >
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--rf-txt)" }}
                    >
                      Remove{" "}
                      {(team[i]?.name || team[i]?.company || "this team member")
                        .toString()
                        .trim()}
                      ?
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTeamRow(i)}
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{ background: "var(--rf-red, #ef4444)", color: "#fff" }}
                    >
                      Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamConfirmRemove(null)}
                      className="px-3 py-1 rounded-lg text-xs font-bold"
                      style={{
                        color: "var(--rf-txt2)",
                        border: "1px solid var(--rf-border, #c5d2ea)",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
                {(rowErr.name || rowErr.company || rowErr.role) && (
                  <span
                    role="alert"
                    className="text-xs"
                    style={{ color: "var(--rf-red)" }}
                  >
                    {rowErr.name || rowErr.company || rowErr.role}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addTeamRow}
          className="mt-3 text-sm font-bold"
          style={{ color: "var(--rf-accent)" }}
        >
          + Add another person
        </button>
      </>
    );
  };

  const STEP_BODIES = [
    renderIdentity,
    renderFacility,
    renderStakeholders,
    renderScope,
    renderAssets,
    renderDocs,
    renderBaseline,
    renderTeam,
  ];

  const isLast = step === STEPS.length - 1;

  /* ----------------------------- render ----------------------------- */

  return (
    <div
      className="np-form min-h-screen font-gilroy p-6"
      style={{ color: "var(--rf-txt)" }}
    >
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p
            className="uppercase mb-1"
            style={{ ...labelStyle, color: "var(--rf-txt3)" }}
          >
            Workspace
          </p>
          <h1 className="font-bold text-2xl">Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rf-txt2)" }}>
            Stand up a data-center commissioning project from scratch —
            facility, stakeholders, scope, assets (with procurement), doc
            readiness, and milestones.
          </p>
        </div>
        {view === "list" && (
          <button
            type="button"
            onClick={() => setView("wizard")}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: "var(--rf-accent)", color: "#fff" }}
          >
            + New Project
          </button>
        )}
      </div>

      {/* Wizard */}
      {view === "wizard" && (
        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border2, #adbbd8)",
          }}
        >
          <div className="mb-6">
            <Stepper
              steps={STEPS}
              current={step}
              onJump={(target) => {
                // Jumping back is always allowed; jumping forward must pass the
                // current step's validation so required fields can't be skipped.
                if (target <= step) {
                  setStepErrors({});
                  setStep(target);
                  return;
                }
                const errs = validateStep(step);
                if (Object.keys(errs).length > 0) {
                  setStepErrors(errs);
                  return;
                }
                setStepErrors({});
                setStep(target);
              }}
            />
          </div>

          {STEP_BODIES[step]()}

          {error && (error.length ?? 0) > 0 && (
            <div
              className="mt-6 px-4 py-3 rounded-xl text-sm"
              style={{
                background: "var(--rf-red-soft, #fee2e2)",
                color: "var(--rf-red, #b91c1c)",
                border: "1px solid var(--rf-red, #b91c1c)",
              }}
            >
              {(() => {
                const lines = Array.isArray(error) ? error : [error];
                if (lines.length === 1) {
                  return <span className="font-semibold">{lines[0]}</span>;
                }
                return (
                  <>
                    <p className="font-semibold mb-1.5">
                      Please fix the following {lines.length} fields:
                    </p>
                    <ul className="list-disc pl-5 space-y-0.5 font-medium">
                      {lines.map((l, i) => (
                        <li key={i}>{l}</li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </div>
          )}

          {/* Footer */}
          <div
            className="flex items-center justify-between mt-8 pt-5"
            style={{ borderTop: "1px solid var(--rf-border, #c5d2ea)" }}
          >
            <button
              type="button"
              onClick={cancel}
              className="text-sm font-semibold border border-1 px-3 py-2 rounded-lg"
              style={{ color: "var(--rf-txt2)" }}
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "var(--rf-bg2)",
                    color: "var(--rf-txt)",
                    border: "1px solid var(--rf-border, #c5d2ea)",
                  }}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                disabled={submitting}
                onClick={() => (isLast ? createProject() : goNext())}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {isLast
                  ? submitting
                    ? "Creating…"
                    : "Create project"
                  : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects list */}
      {view === "list" && !loadingList && projects.length === 0 && (
        <div
          className="rounded-2xl p-8 text-center text-sm"
          style={{
            background: "var(--rf-bg2)",
            border: "1px dashed var(--rf-border2, #adbbd8)",
            color: "var(--rf-txt3)",
          }}
        >
          No projects yet. Click <strong>+ New Project</strong> to stand up your
          first data-center commissioning project.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-2xl p-5 flex flex-col justify-between"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-accent)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="rounded-full flex-shrink-0"
                  style={{ width: 9, height: 9, background: "var(--rf-green)" }}
                />
                <h3
                  className="font-bold text-base"
                  style={{ color: "var(--rf-txt)" }}
                >
                  {p.name}
                </h3>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    color: "var(--rf-green)",
                    border: "1px solid var(--rf-green)",
                  }}
                >
                  {p.status}
                </span>
                <span
                  className="w-[max-content] px-2 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    background: "var(--rf-green-soft, #d1fae5)",
                    color: "var(--rf-green)",
                  }}
                >
                  {p.phase}
                </span>
              </div>
            </div>
            <p
              className="text-xs mt-1 mb-4"
              style={{ color: "var(--rf-txt2)" }}
            >
              {p.meta}
            </p>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { v: p.comm, l: "COMM.", accent: true },
                { v: p.assets, l: "ASSETS" },
                { v: p.overdue, l: "OVERDUE" },
                { v: p.subs, l: "SUBS" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <p
                    className="font-bold text-lg"
                    style={{
                      color: s.accent ? "var(--rf-green)" : "var(--rf-txt)",
                    }}
                  >
                    {s.v}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--rf-txt3)" }}
                  >
                    {s.l}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => router.push(`/projectsDetailNew/${p.id}`)}
              className="w-[max-content] px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer mt-auto hover:-translate-y-0.5 hover:shadow-md hover:brightness-110"
              style={{ background: "var(--rf-accent)", color: "#fff" }}
            >
              Go to Cx Readiness
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
