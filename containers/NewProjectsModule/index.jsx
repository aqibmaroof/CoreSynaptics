"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getV2Catalog,
  listV2Projects,
  finalizeV2Direct,
} from "../../services/CxProjectsV2";
import { getUsers, CreateUsers } from "../../services/Users";
import { getAssets, createAsset } from "../../services/AssetManagement";
import {
  getDocuments,
  requestUploadUrl,
  uploadFileToS3,
  confirmUpload,
} from "../../services/Documents";
import { getTeams, CreateTeam } from "../../services/Teams";

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
  { key: "projectCode", label: "Project Code", ph: "e.g. 25-DR323" },
  { key: "owner", label: "Owner / Customer", ph: "e.g. Digital Realty" },
  { key: "location", label: "Location", ph: "e.g. Garland, TX" },
  { key: "gc", label: "General Contractor", ph: "e.g. HITT" },
  { key: "ec", label: "Electrical Contractor (EC)", ph: "e.g. CEC" },
  { key: "mc", label: "Mechanical Contractor (MC)", ph: "e.g. TDIndustries" },
  { key: "bms", label: "Controls / BMS Contractor", ph: "e.g. Schneider" },
  { key: "fire", label: "Fire / Life-Safety Contractor", ph: "e.g. JCI" },
  { key: "neta", label: "Testing Agency (NETA)", ph: "e.g. Shermco" },
  { key: "cxa", label: "Commissioning Agent (CXA)", ph: "e.g. Iconicx" },
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
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""));

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
  const leaf = path.split(".").filter((p) => !/^\d+$/.test(p)).pop() || path;
  const step = STEP_FOR_FIELD[root];
  const label = leaf.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
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
        lines.push(key === "general" ? humanizeFieldError(String(item)) : `${key}: ${item}`);
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
function buildFinalizePayload({ identity, facility, stakeholders, scope, assets, docs, milestones }) {
  // Step 5 — selected assets become ProjectAsset rows. Each selection carries a
  // detail object (qty / furnish / order status / PO# / manufacturer / model /
  // location) captured inline in the wizard.
  const assetRows = Object.entries(assets)
    .filter(([, d]) => d)
    .map(([name, raw]) => {
      const d = typeof raw === "object" ? raw : {};
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
        location: d.location,
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
    .filter((f) => f.label || f.from || f.to)
    .map((f) => clean({ label: f.label, startDate: iso(f.from), endDate: iso(f.to) }));

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
        ? clean({ anchors: Object.keys(anchors).length ? anchors : undefined, freezeWindows })
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
  const loc = proj.siteAddress ? ` · ${String(proj.siteAddress).split(",")[0]}` : "";
  const bits = [proj.siteAddress, proj.customer && `Cust: ${proj.customer}`].filter(Boolean);
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
  color: "var(--rf-txt3)",
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

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="uppercase" style={labelStyle}>
        {label}
        {required && <span style={{ color: "var(--rf-red)" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ className, style, ...props }) {
  return (
    <div className={`np-fieldbox ${className || ""}`} style={fieldBoxStyle}>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-transparent"
        style={{ ...bareControlStyle, ...(style || {}) }}
      />
    </div>
  );
}

function SelectInput({ children, className, ...props }) {
  return (
    <div
      className={`np-fieldbox relative ${className || ""}`}
      style={fieldBoxStyle}
    >
      <select
        {...props}
        className="w-full pl-3.5 pr-9 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer bg-transparent"
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
      className="px-3.5 py-2 rounded-lg text-xs font-bold transition-all"
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
        className="sr-only"
      />
      <span
        className="flex items-center justify-center flex-shrink-0 transition-all"
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
        <span className="flex-shrink-0 text-xs" style={{ color: "var(--rf-txt3)" }}>
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
function MiniText({ className, style, ...props }) {
  return (
    <div className={`np-fieldbox ${className || ""}`} style={miniBox}>
      <input
        {...props}
        className="w-full px-3 py-2 rounded-[10px] text-sm outline-none bg-transparent"
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
        className="w-full pl-3 pr-8 py-2 rounded-[10px] text-sm outline-none appearance-none cursor-pointer bg-transparent"
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
  const [projects, setProjects] = useState(SEED_PROJECTS);
  const [catalog, setCatalog] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [identity, setIdentity] = useState({});
  const [facility, setFacility] = useState({
    redundancy: "2N",
    uptime: "Tier III",
    cooling: "Chilled Water",
    voltages: ["34.5kV (35kV class)", "480/277V"],
    tccf: false,
  });
  const [stakeholders, setStakeholders] = useState([
    { company: "", role: "Owner", name: "", email: "", phone: "" },
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
  const [team, setTeam] = useState([
    { name: "", company: "", role: "Project Manager" },
  ]);

  /* ---- BE module catalogs for the linked wizard steps ---- */
  const [users, setUsers] = useState([]);
  const [assetCatalog, setAssetCatalog] = useState([]);
  const [teamCatalog, setTeamCatalog] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]); // created via the add flow
  const [documentsCatalog, setDocumentsCatalog] = useState([]); // from the API
  const [selectedDocIds, setSelectedDocIds] = useState([]);
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
    (res?.data?.data ?? res?.data ?? res?.results ?? (Array.isArray(res) ? res : [])) || [];

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
    setStep(0);
    setIdentity({});
    setFacility({
      redundancy: "2N",
      uptime: "Tier III",
      cooling: "Chilled Water",
      voltages: ["34.5kV (35kV class)", "480/277V"],
      tccf: false,
    });
    setStakeholders([
      { company: "", role: "Owner", name: "", email: "", phone: "" },
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
    setTeam([{ name: "", company: "", role: "Project Manager" }]);
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
  };

  const cancel = () => {
    resetWizard();
    setError("");
    setView("list");
  };

  const createProject = async () => {
    setError("");
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

    setSubmitting(true);
    try {
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
    if (!newUser.email.trim()) {
      setError("New user needs an email.");
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
    if (!newAsset.assetTag.trim() || !newAsset.name.trim()) {
      setError("New asset needs a tag and a name.");
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

  // Documents ← Documents: real S3 upload (standalone — title + file are enough,
  // project hierarchy is optional and resolved later on the project page).
  const submitNewDoc = async () => {
    if (!newDoc.title.trim() || !newDoc.file) {
      setError("Document needs a title and a file.");
      return;
    }
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
      setError(extractApiErrors(e));
    } finally {
      setModuleBusy(false);
      setDocUploadPct(null);
    }
  };
  const toggleDoc = (id) =>
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  /* --------------------------- step bodies --------------------------- */

  const renderIdentity = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {IDENTITY_FIELDS.map((f) => (
        <Field key={f.key} label={f.label} required={f.required}>
          <TextInput
            placeholder={f.ph}
            value={identity[f.key] || ""}
            onChange={(e) =>
              setIdentity((p) => ({ ...p, [f.key]: e.target.value }))
            }
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
        <Field label="Critical IT Capacity (MW)">
          <TextInput
            placeholder="e.g. 36"
            value={facility.criticalCapacity || ""}
            onChange={(e) =>
              setFacility((p) => ({ ...p, criticalCapacity: e.target.value }))
            }
          />
        </Field>
        <Field label="White Space (Sq Ft)">
          <TextInput
            placeholder="e.g. 120000"
            value={facility.whiteSpace || ""}
            onChange={(e) =>
              setFacility((p) => ({ ...p, whiteSpace: e.target.value }))
            }
          />
        </Field>
        <Field label="Data Halls / Pods">
          <TextInput
            placeholder="e.g. 2"
            value={facility.dataHalls || ""}
            onChange={(e) =>
              setFacility((p) => ({ ...p, dataHalls: e.target.value }))
            }
          />
        </Field>
        <Field label="Redundancy">
          <SelectInput
            value={facility.redundancy}
            onChange={(e) =>
              setFacility((p) => ({ ...p, redundancy: e.target.value }))
            }
          >
            {opts.redundancy.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Uptime Target">
          <SelectInput
            value={facility.uptime}
            onChange={(e) =>
              setFacility((p) => ({ ...p, uptime: e.target.value }))
            }
          >
            {opts.uptime.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Cooling Type">
          <SelectInput
            value={facility.cooling}
            onChange={(e) =>
              setFacility((p) => ({ ...p, cooling: e.target.value }))
            }
          >
            {opts.cooling.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Design PUE">
          <TextInput
            placeholder="e.g. 1.3"
            value={facility.pue || ""}
            onChange={(e) =>
              setFacility((p) => ({ ...p, pue: e.target.value }))
            }
          />
        </Field>
      </div>

      <div className="mt-6">
        <label className="uppercase block mb-2.5" style={labelStyle}>
          Voltage Classes Present
        </label>
        <div className="flex flex-wrap gap-2">
          {opts.voltages.map((v) => (
            <Chip
              key={v}
              active={facility.voltages.includes(v)}
              onClick={() => toggleVoltage(v)}
            >
              {v}
            </Chip>
          ))}
        </div>
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

  const updateStakeholder = (i, key, val) =>
    setStakeholders((p) =>
      p.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    );

  const renderStakeholders = () => {
    const q = search.users.trim().toLowerCase();
    const userRows = users.filter(
      (u) =>
        !q ||
        userLabel(u).toLowerCase().includes(q) ||
        String(u.email || "").toLowerCase().includes(q),
    );
    return (
    <>
      <StepIntro>
        Stakeholder directory — link platform users from the Users module (or add
        new ones), then refine company / role below. {stakeholders.length}{" "}
        row(s).
      </StepIntro>

      <ModulePicker
        title="Platform users"
        hint="Select existing users to add as stakeholders, or create a new user."
        search={search.users}
        onSearch={(e) =>
          setSearch((p) => ({ ...p, users: e.target.value }))
        }
        addLabel="+ New user"
        addOpen={addOpen.users}
        onToggleAdd={() => setAddOpen((p) => ({ ...p, users: !p.users }))}
        loading={moduleLoading.users}
        isEmpty={userRows.length === 0}
        emptyText="No users found."
        addForm={
          <div className="flex flex-col gap-3">
            <TextInput
              placeholder="Email *"
              value={newUser.email}
              onChange={(e) =>
                setNewUser((p) => ({ ...p, email: e.target.value }))
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextInput
                placeholder="First name"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser((p) => ({ ...p, firstName: e.target.value }))
                }
              />
              <TextInput
                placeholder="Last name"
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
            <TextInput
              placeholder="Company / org"
              value={s.company}
              onChange={(e) => updateStakeholder(i, "company", e.target.value)}
            />
            <SelectInput
              value={s.role}
              onChange={(e) => updateStakeholder(i, "role", e.target.value)}
            >
              {opts.stakeholderRoles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </SelectInput>
            <TextInput
              placeholder="Name"
              value={s.name}
              onChange={(e) => updateStakeholder(i, "name", e.target.value)}
            />
            <TextInput
              placeholder="Email"
              value={s.email}
              onChange={(e) => updateStakeholder(i, "email", e.target.value)}
            />
            <div className="flex gap-2">
              <TextInput
                placeholder="Phone"
                value={s.phone}
                onChange={(e) => updateStakeholder(i, "phone", e.target.value)}
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
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setStakeholders((p) => [
            ...p,
            { company: "", role: "Owner", name: "", email: "", phone: "" },
          ])
        }
        className="mt-3 text-sm font-bold"
        style={{ color: "var(--rf-accent)" }}
      >
        + Add stakeholder
      </button>
    </>
    );
  };

  const toggleLevel = (l) =>
    setScope((p) => ({
      ...p,
      levels: p.levels.includes(l)
        ? p.levels.filter((x) => x !== l)
        : [...p.levels, l],
    }));

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
      <p className="text-xs mt-2.5" style={{ color: "var(--rf-txt3)" }}>
        L1 Factory · L2 Install · L3 Energize · L4 Functional/Fault · L5 IST.
        Each level is a gate that must close before the next.
      </p>

      <div className="mt-6 max-w-3xl">
        <Field label="Verification Sampling Rate">
          <SelectInput
            value={scope.sampling}
            onChange={(e) =>
              setScope((p) => ({ ...p, sampling: e.target.value }))
            }
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
    category: a?.category || "",
    assetTag: a?.assetTag || "",
  });
  // Toggle by asset object: select → attach a detail object, deselect → drop it.
  const toggleAsset = (a) =>
    setAssets((p) => {
      const next = { ...p };
      if (next[a.name]) delete next[a.name];
      else next[a.name] = defaultAssetDetail(a);
      return next;
    });
  const updateAssetField = (name, key, val) =>
    setAssets((p) => ({ ...p, [name]: { ...p[name], [key]: val } }));

  const renderAssets = () => {
    // Group the registered assets by their `category` so the select UI matches
    // the original category-card layout — but driven entirely by the API.
    const groups = [];
    const byTitle = {};
    assetCatalog.forEach((a) => {
      const title = a.category || "Uncategorized";
      if (!byTitle[title]) {
        byTitle[title] = { title, items: [] };
        groups.push(byTitle[title]);
      }
      byTitle[title].items.push(a);
    });
    return (
    <>
      <StepIntro>
        Select assets from the Asset Register (grouped by category), or register a
        new asset. Selected items become project assets you can detail (quantity,
        furnish, POH) on the project page. {assetCount} selected.
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

      {moduleLoading.assets ? (
        <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
          Loading assets…
        </p>
      ) : groups.length === 0 ? (
        <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
          No registered assets found — register one above to get started.
        </p>
      ) : (
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
                      {d && (
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
                              className="w-16"
                              value={d.qty}
                              onChange={(e) =>
                                updateAssetField(a.name, "qty", e.target.value)
                              }
                            />
                            <MiniSelect
                              className="w-24"
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
                              value={d.order}
                              onChange={(e) =>
                                updateAssetField(a.name, "order", e.target.value)
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
                              value={d.po}
                              onChange={(e) =>
                                updateAssetField(a.name, "po", e.target.value)
                              }
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <MiniText
                              placeholder="manufacturer"
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
                              value={d.model}
                              onChange={(e) =>
                                updateAssetField(a.name, "model", e.target.value)
                              }
                            />
                            <MiniText
                              placeholder="location / lineup"
                              value={d.location}
                              onChange={(e) =>
                                updateAssetField(
                                  a.name,
                                  "location",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
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
        Select documents from the Documents module, or upload a new one. Uploads
        are stored immediately and can be linked to this project from the
        Documents page. {selectedDocIds.length} selected.
      </StepIntro>

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
              value={newDoc.title}
              onChange={(e) =>
                setNewDoc((p) => ({ ...p, title: e.target.value }))
              }
            />
            <label
              htmlFor="np-doc-file"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) setNewDoc((p) => ({ ...p, file: f }));
              }}
              className="block rounded-xl p-6 text-center cursor-pointer transition-all"
              style={{
                border: `2px dashed ${newDoc.file ? "var(--rf-accent)" : "var(--rf-border3, #8daacf)"}`,
                background: newDoc.file ? "var(--rf-bg3)" : "var(--rf-bg2)",
              }}
            >
              <input
                id="np-doc-file"
                type="file"
                className="hidden"
                onChange={(e) =>
                  setNewDoc((p) => ({
                    ...p,
                    file: e.target.files?.[0] || null,
                  }))
                }
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
                    {(newDoc.file.size / 1024 / 1024).toFixed(2)} MB · click to
                    change
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
            return (
              <div
                key={d.id}
                className="rounded-lg px-3 py-2.5"
                style={{
                  background: selected ? "var(--rf-bg3)" : "var(--rf-bg2)",
                  border: `1px solid ${selected ? "var(--rf-accent)" : "var(--rf-border2, #adbbd8)"}`,
                }}
              >
                <Checkbox
                  checked={selected}
                  onChange={() => toggleDoc(d.id)}
                  label={d.title || d.fileName || "Document"}
                />
                {(d.fileName || d.category) && (
                  <div
                    className="text-xs mt-1 ml-7 flex flex-wrap gap-x-2"
                    style={{ color: "var(--rf-txt3)" }}
                  >
                    {d.fileName && (
                      <span className="truncate">{d.fileName}</span>
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

  const renderBaseline = () => (
    <>
      <StepIntro>
        Key milestone dates and a reference to the baseline schedule (the full
        P6 activity list lives in the Schedule module — this is just the anchor
        dates).
      </StepIntro>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
        {MILESTONE_DATES.map((m) => (
          <Field key={m.key} label={m.label}>
            <TextInput
              type="date"
              value={milestones[m.key] || ""}
              onChange={(e) =>
                setMilestones((p) => ({ ...p, [m.key]: e.target.value }))
              }
            />
          </Field>
        ))}
      </div>

      <div className="mt-5">
        <Field label="Baseline Schedule Reference">
          <TextInput
            placeholder="e.g. DLR-DFW39-28-R0 (P6 Update 28)"
            value={milestones.baselineRef || ""}
            onChange={(e) =>
              setMilestones((p) => ({ ...p, baselineRef: e.target.value }))
            }
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
          {milestones.freezes.map((fz, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <TextInput
                placeholder="Label (e.g. Holiday freeze)"
                value={fz.label}
                onChange={(e) =>
                  setMilestones((p) => ({
                    ...p,
                    freezes: p.freezes.map((x, idx) =>
                      idx === i ? { ...x, label: e.target.value } : x,
                    ),
                  }))
                }
              />
              <TextInput
                type="date"
                value={fz.from}
                onChange={(e) =>
                  setMilestones((p) => ({
                    ...p,
                    freezes: p.freezes.map((x, idx) =>
                      idx === i ? { ...x, from: e.target.value } : x,
                    ),
                  }))
                }
              />
              <div className="flex gap-2">
                <TextInput
                  type="date"
                  value={fz.to}
                  onChange={(e) =>
                    setMilestones((p) => ({
                      ...p,
                      freezes: p.freezes.map((x, idx) =>
                        idx === i ? { ...x, to: e.target.value } : x,
                      ),
                    }))
                  }
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
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setMilestones((p) => ({
              ...p,
              freezes: [...p.freezes, { label: "", from: "", to: "" }],
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

  const updateTeam = (i, key, val) =>
    setTeam((p) => p.map((t, idx) => (idx === i ? { ...t, [key]: val } : t)));

  const renderTeam = () => {
    const q = search.teams.trim().toLowerCase();
    const teamRows = teamCatalog.filter(
      (t) => !q || String(t.name || "").toLowerCase().includes(q),
    );
    return (
    <>
      <StepIntro>
        Link teams from the Teams module (or create one), and/or add key people
        below. Manage the full crew on the project Team page.
      </StepIntro>

      <ModulePicker
        title="Teams"
        hint="Select existing teams to attach, or create a new team."
        search={search.teams}
        onSearch={(e) =>
          setSearch((p) => ({ ...p, teams: e.target.value }))
        }
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

      <label className="uppercase block mb-2.5" style={labelStyle}>
        Key people
      </label>
      <div className="flex flex-col gap-3">
        {team.map((t, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <TextInput
              placeholder="Name"
              value={t.name}
              onChange={(e) => updateTeam(i, "name", e.target.value)}
            />
            <TextInput
              placeholder="Company"
              value={t.company}
              onChange={(e) => updateTeam(i, "company", e.target.value)}
            />
            <div className="flex gap-2">
              <SelectInput
                value={t.role}
                onChange={(e) => updateTeam(i, "role", e.target.value)}
              >
                {opts.teamRoles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </SelectInput>
              {team.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setTeam((p) => p.filter((_, idx) => idx !== i))
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
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          setTeam((p) => [
            ...p,
            { name: "", company: "", role: "Project Manager" },
          ])
        }
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
            <Stepper steps={STEPS} current={step} onJump={setStep} />
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
                onClick={() =>
                  isLast ? createProject() : setStep((s) => s + 1)
                }
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {isLast ? (submitting ? "Creating…" : "Create project") : "Next"}
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
            className="rounded-2xl p-5"
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
                  className="px-2 py-0.5 rounded text-[10px] font-bold"
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
              onClick={() => router.push("/projectsDetailNew")}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
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
