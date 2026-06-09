"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getV2Catalog,
  listV2Projects,
  finalizeV2Direct,
} from "../../services/CxProjectsV2";

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

const ASSET_CATEGORIES = [
  {
    title: "Electrical",
    items: [
      "Utility Service Entrance",
      "MV Switchgear",
      "MV Transformer",
      "Unit Substation",
      "Generator",
      "Generator Paralleling Switchgear",
      "Fuel System / Day Tank",
      "ATS (Automatic Transfer Switch)",
      "MTS (Manual/Maintenance Transfer Switch)",
      "STS (Static Transfer Switch)",
      "LV Switchboard",
      "Motor Control Center (MCC)",
      "Distribution Board / Panelboard",
      "UPS",
      "Battery System / VRLA UB",
      "Flywheel / Energy Storage",
      "PDU",
      "RPP / Remote Power Panel",
      "Reactor / Rotary / RDC",
      "Busway / Bus Duct",
      "Dry Type Transformer",
      "Capacitor / PFC Bank",
      "SPD / Surge Protection",
      "Grounding / Bonding System",
      "EPMS / Power Monitoring",
      "Lighting / Emergency Egress",
      "EPO System",
    ],
  },
  {
    title: "Mechanical",
    items: [
      "Chiller",
      "CRAH / CRAC",
      "CDU / Liquid Cooling",
      "Cooling Tower",
      "Pump",
    ],
  },
  {
    title: "Controls",
    items: ["BMS / Controls"],
  },
  {
    title: "Plumbing",
    items: ["Make-up Water", "Leak Detection"],
  },
  {
    title: "Fire / Life-Safety",
    items: ["VESDA", "Clean Agent", "Fire Alarm", "EPO"],
  },
];

const DOC_STATUSES = ["In hand", "Under review", "Pending", "N/A"];
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
  // Step 5 — selected asset types become ProjectAsset rows (qty default 1; the
  // detailed qty/furnish/PO editing happens on the project page post-create).
  const assetRows = Object.keys(assets)
    .filter((k) => assets[k])
    .map((name) => ({
      abbr: name.slice(0, 50),
      name,
      assetType: "General",
      quantity: 1,
      procurementOwner: "OFCI",
    }));

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
      const msg =
        e?.message ||
        e?.error ||
        (Array.isArray(e?.message) ? e.message.join(", ") : "") ||
        "Failed to create project. Please review the fields and try again.";
      setError(typeof msg === "string" ? msg : "Failed to create project.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const renderStakeholders = () => (
    <>
      <StepIntro>
        Stakeholder directory — the decision-makers and partner orgs (owner,
        architect, MEP/structural engineers, owner vendors, CM, AHJ).{" "}
        {stakeholders.length} row(s).
      </StepIntro>
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

  const toggleAsset = (item) => setAssets((p) => ({ ...p, [item]: !p[item] }));

  const renderAssets = () => (
    <>
      <StepIntro>
        Pick the asset types on this project. Set <strong>quantity</strong>{" "}
        (fans out into numbered instances), <strong>furnish</strong>{" "}
        (OFCI/CFCI), POH, order status, and optional manufacturer / model /
        location. Works for any DC type — set the counts and makers for your
        project, {assetCount} selected.
      </StepIntro>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {ASSET_CATEGORIES.map((cat) => (
          <div
            key={cat.title}
            className="rounded-2xl p-4 h-full"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border2, #adbbd8)",
            }}
          >
            <h4 className="uppercase mb-3" style={labelStyle}>
              {cat.title}
            </h4>
            <div className="flex flex-col gap-2.5">
              {cat.items.map((item) => (
                <Checkbox
                  key={item}
                  checked={!!assets[item]}
                  onChange={() => toggleAsset(item)}
                  label={item}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const renderDocs = () => (
    <>
      <StepIntro>
        Document &amp; contract readiness — set where each item sits so the PM
        can see status at a glance. (As-builts are a closeout deliverable —
        default N/A.)
      </StepIntro>
      <div className="flex flex-col gap-2.5">
        {DOC_ITEMS.map((item) => {
          const row = docs[item];
          return (
            <div
              key={item}
              className="flex flex-col md:flex-row md:items-center gap-3"
            >
              <div
                className="md:w-56 flex-shrink-0 text-sm"
                style={{ color: "var(--rf-txt)" }}
              >
                {item}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                {DOC_STATUSES.map((st) => {
                  const active = row.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() =>
                        setDocs((p) => ({
                          ...p,
                          [item]: { ...p[item], status: st },
                        }))
                      }
                      className="px-2.5 py-1.5 rounded-md text-xs font-bold transition-all"
                      style={{
                        background: active ? "var(--rf-bg4)" : "var(--rf-bg2)",
                        color: active ? "var(--rf-txt)" : "var(--rf-txt3)",
                        border: `1px solid ${active ? "var(--rf-border3, #8daacf)" : "var(--rf-border2, #adbbd8)"}`,
                      }}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
              <TextInput
                placeholder="note (rev, owner, date…)"
                value={row.note}
                onChange={(e) =>
                  setDocs((p) => ({
                    ...p,
                    [item]: { ...p[item], note: e.target.value },
                  }))
                }
                className="flex-1"
              />
            </div>
          );
        })}
      </div>
    </>
  );

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

  const renderTeam = () => (
    <>
      <StepIntro>
        Add key people now (optional) — assign their role; manage the full crew
        on the Team page.
      </StepIntro>
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

          {error && (
            <div
              className="mt-6 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "var(--rf-red-soft, #fee2e2)",
                color: "var(--rf-red, #b91c1c)",
                border: "1px solid var(--rf-red, #b91c1c)",
              }}
            >
              {error}
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
