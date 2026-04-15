"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { CreateProjects } from "@/services/Projects";
import { CreateSite } from "@/services/Sites";
import { CreateZone } from "@/services/Zones";
import { CreateEquipment } from "@/services/Equipment";
import { GetFields } from "@/services/Types";
import { getUser } from "@/services/instance/tokenService";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CapitalizeText = (text) =>
  text
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const d = new Date();
const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const READINESS_GATES = [
  { gate: "SAFETY_APPROVAL", status: "PENDING" },
  { gate: "PERMIT_APPROVAL", status: "PENDING" },
];

const PROJECT_CATEGORIES = [
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "DATA_CENTER", label: "Data Center" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "INFRA", label: "Infrastructure" },
  { value: "HYBRID", label: "Hybrid" },
];

const ORG_TYPES = [
  { value: "GC", label: "GC — General Contractor" },
  { value: "OEM", label: "OEM — Equipment Manufacturer" },
];

// ─── METADATA SCHEMA PARSER ───────────────────────────────────────────────────
// Merges metadataSchema.required[] + type.requiredFields[] into one required set.
// Both arrays from BE are checked — whichever marks a field required wins.
function parseMetadataSchema(metadataSchema, requiredFields = []) {
  if (!metadataSchema || typeof metadataSchema !== "object") return [];

  const props = metadataSchema.properties || {};
  const schemaReq = Array.isArray(metadataSchema.required)
    ? metadataSchema.required
    : [];
  const typeReq = Array.isArray(requiredFields) ? requiredFields : [];
  const requiredSet = new Set([...schemaReq, ...typeReq]);

  return Object.entries(props).map(([key, s]) => {
    let fieldType = "text";
    if (s.enum) fieldType = "select";
    else if (s.type === "boolean") fieldType = "boolean";
    else if (s.type === "number") fieldType = "number";
    else if (s.format === "date") fieldType = "date";
    else if (s.type === "array") fieldType = "array";

    return {
      name: key,
      label: CapitalizeText(key.replace(/_/g, " ")),
      type: fieldType,
      options: s.enum || [],
      required: requiredSet.has(key),
      min: s.minimum ?? undefined,
      max: s.maximum ?? undefined,
    };
  });
}

// ─── COERCE VALUE BY FIELD TYPE ───────────────────────────────────────────────
// Called inside every metadata onChange handler.
// number fields → parseFloat (keeps "" as "" so empty stays empty, not NaN)
// boolean fields → convert "true"/"false" string to actual boolean
// everything else → raw string
function coerceValue(rawValue, fieldType) {
  if (fieldType === "number") {
    // Keep empty string as empty string (user hasn't typed yet)
    if (rawValue === "" || rawValue === null || rawValue === undefined)
      return "";
    const parsed = parseFloat(rawValue);
    // If the parsed result is NaN (e.g. user typed letters), keep the raw string
    // so the input doesn't freeze — validation will catch it on submit
    return isNaN(parsed) ? rawValue : parsed;
  }
  if (fieldType === "boolean") {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;
    return rawValue; // empty string = not yet selected
  }
  return rawValue; // text, select enum, date, array — stay as string
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const cls = {
  input:
    "input w-full bg-transparent backdrop-blur-[42px] border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl px-4 text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-white/[0.03] focus:border-t-white/[0.09] h-13",
  select:
    "w-full bg-transparent backdrop-blur-[42px] border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl px-4 text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-white/[0.03] focus:border-t-white/[0.09] h-13 [&_option]:bg-gray-800 [&_option]:text-white",
  label: "block text-[12.5px] font-[600] text-[#fff] mb-1.5 tracking-wide",
  field: "flex flex-col",
  card: "w-full rounded-2xl border-2 border-white/20 bg-gradient-to-bl from-[#582CFF]/20 via-black/30 to-[#582CFF]/0 p-8 flex flex-col gap-7",
  grid2: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5",
  sectionTitle:
    "text-[11px] font-[700] uppercase tracking-[0.12em] text-[#fff] mb-5 flex items-center gap-2",
  divider: "border-t border-[#edf2f7] my-6",
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div className={cls.field}>
      <label className={cls.label}>
        {label}
        {required && <span className="text-[#e53e3e] ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-[#a0aec0] mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, required, hint, children, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <div className="relative">
        <select className={cls.select} {...props}>
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0]"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </Field>
  );
}

function InputField({ label, required, hint, ...props }) {
  return (
    <Field label={label} required={required} hint={hint}>
      <input className={cls.input} {...props} />
    </Field>
  );
}

// ─── ARRAY FIELD ─────────────────────────────────────────────────────────────
function ArrayField({ field, value, onChange }) {
  const items = Array.isArray(value)
    ? value
    : value
      ? String(value)
          .split(",")
          .map((s) => s.trim())
      : [];

  const sync = (newItems) => {
    // Emit as a real array — the metadata handler stores it as-is
    onChange({
      target: { name: field.name, value: newItems, __fieldType: "array" },
    });
  };

  const handleItemChange = (i, v) => {
    const next = [...items];
    next[i] = v;
    sync(next);
  };
  const handleAdd = () => sync([...items, ""]);
  const handleRemove = (i) => sync(items.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(i, e.target.value)}
            className={cls.input}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
          <button
            type="button"
            onClick={() => handleRemove(i)}
            className="px-3 py-2 bg-red-500/80 text-white rounded-xl hover:bg-red-600 text-sm"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="text-[12px] text-blue-400 hover:text-blue-300 font-[600]"
      >
        + Add {field.label}
      </button>
    </div>
  );
}

// ─── ORG BADGE ────────────────────────────────────────────────────────────────
function OrgBadge({ ctx }) {
  if (!ctx) return null;
  const styles = {
    OEM: "bg-violet-200 text-violet-700 border-violet-200",
    GC: "bg-orange-200 text-orange-700 border-orange-200",
    BOTH: "bg-sky-200    text-sky-700    border-sky-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-[700] uppercase tracking-wider border px-2 py-0.5 rounded-full ${styles[ctx] || styles.BOTH}`}
    >
      {ctx === "BOTH" ? "OEM · GC" : ctx}
    </span>
  );
}

// ─── TYPE PILL ────────────────────────────────────────────────────────────────
function TypePill({ type }) {
  if (!type) return null;
  return (
    <div className="flex items-center gap-2.5 mt-3 px-4 py-3 bg-[#bbbcc4] border border-[#dce3f5] rounded-xl">
      {type.color && (
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: type.color }}
        />
      )}
      <span className="text-[13px] font-[600] text-[#1a202c]">
        {type.displayName}
      </span>
      <OrgBadge ctx={type.orgContext} />
      {type.description && (
        <span className="text-[11px] text-[#718096] ml-auto truncate max-w-[260px]">
          {type.description}
        </span>
      )}
    </div>
  );
}

// ─── DYNAMIC FIELD ────────────────────────────────────────────────────────────
// Renders the correct input for each field type inferred from metadataSchema.
// The displayed value for number fields uses the raw state value so the user
// can type freely; coercion to actual number happens in the onChange handler.
function DynamicField({ field, value, onChange }) {
  const chevron = (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0]"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  if (field.type === "select") {
    return (
      <div className="relative">
        <select
          className={cls.select}
          name={field.name}
          value={value ?? ""}
          onChange={onChange}
          data-field-type={field.type}
        >
          <option value="">— Select —</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        {chevron}
      </div>
    );
  }

  if (field.type === "boolean") {
    // Display the string "true"/"false" in the select, coercion happens in handler
    const displayVal =
      value === true ? "true" : value === false ? "false" : (value ?? "");
    return (
      <div className="relative">
        <select
          className={cls.select}
          name={field.name}
          value={displayVal}
          onChange={onChange}
          data-field-type={field.type}
        >
          <option value="">— Select —</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        {chevron}
      </div>
    );
  }

  if (field.type === "array") {
    return <ArrayField field={field} value={value} onChange={onChange} />;
  }

  // text / number / date — all use <input>
  // For number: value in state is already a number (or ""), display as string
  return (
    <input
      className={cls.input}
      name={field.name}
      type={
        field.type === "number"
          ? "number"
          : field.type === "date"
            ? "date"
            : "text"
      }
      value={value ?? ""}
      onChange={onChange}
      placeholder={field.label}
      min={field.min}
      max={field.max}
      step={field.type === "number" ? "any" : undefined}
      data-field-type={field.type}
    />
  );
}

// ─── METADATA FIELDS BLOCK ────────────────────────────────────────────────────
function MetadataFields({ schema, requiredFields, values, onChange }) {
  const fields = parseMetadataSchema(schema, requiredFields);
  if (!fields.length) return null;

  const required = fields.filter((f) => f.required);
  const optional = fields.filter((f) => !f.required);

  return (
    <div className="mt-6">
      {required.length > 0 && (
        <>
          <p className={cls.sectionTitle}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e53e3e]" />
            Required Fields
          </p>
          <div className={cls.grid2}>
            {required.map((f) => (
              <Field key={f.name} label={f.label} required>
                <DynamicField
                  field={f}
                  value={values[f.name]}
                  onChange={onChange}
                />
              </Field>
            ))}
          </div>
        </>
      )}

      {optional.length > 0 && (
        <>
          <div className={cls.divider} />
          <p className={cls.sectionTitle}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#cbd5e0]" />
            Additional Fields
          </p>
          <div className={cls.grid2}>
            {optional.map((f) => (
              <Field key={f.name} label={f.label}>
                <DynamicField
                  field={f}
                  value={values[f.name]}
                  onChange={onChange}
                />
              </Field>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── TYPE SELECTOR ────────────────────────────────────────────────────────────
function TypeSelector({
  label,
  types,
  selectedId,
  onTypeChange,
  metadata,
  onMetadataChange,
}) {
  const selected = types.find((t) => t.id === selectedId) || null;
  return (
    <div>
      <SelectField
        label={label}
        value={selectedId}
        onChange={(e) => onTypeChange(e.target.value)}
      >
        <option value="">— Select {label} —</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.displayName}
            {t.code ? ` (${t.code})` : ""}
          </option>
        ))}
      </SelectField>
      {selected && <TypePill type={selected} />}
      {selected && (
        <MetadataFields
          schema={selected.metadataSchema}
          requiredFields={selected.requiredFields}
          values={metadata}
          onChange={onMetadataChange}
        />
      )}
    </div>
  );
}

// ─── SECTION CARD ─────────────────────────────────────────────────────────────
function SectionCard({ title, dot, children }) {
  return (
    <div className={cls.card}>
      {title && (
        <p className={cls.sectionTitle}>
          {dot && (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: dot }}
            />
          )}
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── EMPTY / PROMPT STATE ─────────────────────────────────────────────────────
function TypesPlaceholder({ hasFilters, categoryLabel, orgLabel, loading }) {
  if (loading) return null;
  if (!hasFilters) {
    return (
      <p className="text-[13px] text-[#a0aec0] py-2">
        Select a Project Category and Org Role above to load types.
      </p>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-10 h-10 rounded-xl bg-[#f7f9ff] border border-[#dce3f5] flex items-center justify-center mb-3">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a0aec0"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-[13px] text-[#718096]">
        No types available for{" "}
        <span className="font-[600] text-[#4a5568]">{categoryLabel}</span> /{" "}
        <span className="font-[600] text-[#4a5568]">{orgLabel}</span>
      </p>
    </div>
  );
}

// ─── CATEGORY + ORG FILTER ────────────────────────────────────────────────────
function CategoryOrgFilter({
  projectCategory,
  setProjectCategory,
  orgType,
  setOrgType,
  loading,
}) {
  const categoryLabel =
    PROJECT_CATEGORIES.find((c) => c.value === projectCategory)?.label ?? "";
  const user = JSON.parse(getUser());
  const orgLabel =
    user?.orgType === "GC"
      ? "GC — General Contractor"
      : "OEM — Equipment Manufacturer";

  return (
    <SectionCard title="Project Category & Role">
      <div className={cls.grid2}>
        <SelectField
          label="Project Category"
          value={projectCategory}
          onChange={(e) => setProjectCategory(e.target.value)}
        >
          <option value="">— Select Category —</option>
          {PROJECT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </SelectField>

        {/* <SelectField
          label="Org Role"
          value={orgType}
          onChange={(e) => setOrgType(e.target.value)}
        >
          <option value="">— Select Role —</option>
          {ORG_TYPES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </SelectField> */}
      </div>

      {(categoryLabel || orgLabel || loading) && (
        <div className="flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-[#edf2f7]">
          {categoryLabel && (
            <span className="text-[11px] font-[600] bg-[#bbbcc4] border border-[#dce3f5] text-[#000] px-2.5 py-1 rounded-lg">
              {categoryLabel}
            </span>
          )}
          {/* {orgType && <OrgBadge ctx={orgType} />} */}
          {loading && (
            <div className="flex items-center gap-1.5 ml-1">
              <svg
                className="animate-spin text-[#3C71F0]"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-[11px] text-[#718096]">Loading types…</span>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

// ─── METADATA CHANGE FACTORY ──────────────────────────────────────────────────
// Returns a handler that coerces values by field type before storing in state.
// It looks up the field type from the parsed schema using e.target.name.
// For array fields, __fieldType is set by ArrayField; for others, data-field-type attr is used.
function makeMetaHandler(setter, schema, requiredFields) {
  return (e) => {
    const { name, value } = e.target;

    // ArrayField emits __fieldType on the synthetic event object
    if (e.target.__fieldType === "array") {
      setter((p) => ({ ...p, [name]: value })); // value is already a real array
      return;
    }

    // Look up the field type from the parsed schema to coerce correctly
    const fields = parseMetadataSchema(schema, requiredFields);
    const fieldDef = fields.find((f) => f.name === name);
    const fieldType = fieldDef?.type ?? "text";

    setter((p) => ({ ...p, [name]: coerceValue(value, fieldType) }));
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CreateProject() {
  const router = useRouter();
  const params = useParams();
  const user = JSON.parse(getUser());
  const {
    projectCategory: parentCategory,
    projectType,
    id,
    type,
    subId,
  } = params;

  const isSiteForm = projectType === "Project" && type === "Sites";
  const isZoneForm = projectType === "Projects" && type === "Zones";
  const isEquipmentForm = projectType === "Zone" && type === "Assets";
  const isProjectForm = !isSiteForm && !isZoneForm && !isEquipmentForm;

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [groupedTypes, setGroupedTypes] = useState({
    rootProjects: [],
    subProjects: [],
    sites: [],
    zones: [],
    assets: [],
  });

  const [projectCategory, setProjectCategory] = useState(parentCategory || "");
  const [orgType, setOrgType] = useState(user?.orgType || "GC");

  const [selectedRootType, setSelectedRootType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [selectedSiteType, setSelectedSiteType] = useState("");
  const [selectedZoneType, setSelectedZoneType] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("");

  const [rootMetadata, setRootMetadata] = useState({});
  const [subMetadata, setSubMetadata] = useState({});
  const [siteMetadata, setSiteMetadata] = useState({});
  const [zoneMetadata, setZoneMetadata] = useState({});
  const [assetMetadata, setAssetMetadata] = useState({});

  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    timezone: "",
    address: "",
    contractValue: "",
    clientName: "",
  });
  const [siteForm, setSiteForm] = useState({
    name: "",
    location: "",
    status: "NOT_READY",
    safetyStatus: "PENDING",
    permitStatus: "PENDING",
  });
  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    serialNumber: "",
    status: "ORDERED",
    lifecyclePhase: "",
    certificationReq: "",
  });

  // ── Fetch types ───────────────────────────────────────────────────────────
  const fetchGroupedTypes = useCallback(async () => {
    if (!projectCategory || !orgType) return;

    setLoadingTypes(true);
    setSelectedRootType("");
    setSelectedSubType("");
    setSelectedSiteType("");
    setSelectedZoneType("");
    setSelectedAssetType("");
    setRootMetadata({});
    setSubMetadata({});
    setSiteMetadata({});
    setZoneMetadata({});
    setAssetMetadata({});

    try {
      const qs = new URLSearchParams({ projectCategory, orgType }).toString();
      const data = await GetFields(qs);
      setGroupedTypes({
        rootProjects: data.rootProjects || [],
        subProjects: data.subProjects || [],
        sites: data.sites || [],
        zones: data.zones || [],
        assets: data.assets || [],
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: `Failed to load types: ${err?.message}`,
      });
    } finally {
      setLoadingTypes(false);
    }
  }, [projectCategory, orgType]);

  useEffect(() => {
    fetchGroupedTypes();
  }, [fetchGroupedTypes]);

  // ── Resolved active type objects ─────────────────────────────────────────
  const activeRootType =
    groupedTypes.rootProjects.find((t) => t.id === selectedRootType) || null;
  const activeSubType =
    groupedTypes.subProjects.find((t) => t.id === selectedSubType) || null;
  const activeSiteType =
    groupedTypes.sites.find((t) => t.id === selectedSiteType) || null;
  const activeZoneType =
    groupedTypes.zones.find((t) => t.id === selectedZoneType) || null;
  const activeAssetType =
    groupedTypes.assets.find((t) => t.id === selectedAssetType) || null;

  // ── Type-aware metadata handlers ─────────────────────────────────────────
  // Each handler is created with makeMetaHandler so it can look up the field's
  // type from the active type's metadataSchema and coerce the value correctly.
  const handleRootMeta = makeMetaHandler(
    setRootMetadata,
    activeRootType?.metadataSchema,
    activeRootType?.requiredFields,
  );
  const handleSubMeta = makeMetaHandler(
    setSubMetadata,
    activeSubType?.metadataSchema,
    activeSubType?.requiredFields,
  );
  const handleSiteMeta = makeMetaHandler(
    setSiteMetadata,
    activeSiteType?.metadataSchema,
    activeSiteType?.requiredFields,
  );
  const handleZoneMeta = makeMetaHandler(
    setZoneMetadata,
    activeZoneType?.metadataSchema,
    activeZoneType?.requiredFields,
  );
  const handleAssetMeta = makeMetaHandler(
    setAssetMetadata,
    activeAssetType?.metadataSchema,
    activeAssetType?.requiredFields,
  );

  // ── Core form handlers (not dynamic — no coercion needed) ─────────────────
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSiteChange = (e) =>
    setSiteForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleEquipChange = (e) =>
    setEquipmentForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const categoryLabel =
    PROJECT_CATEGORIES.find((c) => c.value === projectCategory)?.label ??
    projectCategory;
  const orgLabel =
    user?.orgType === "GC"
      ? "GC — General Contractor"
      : "OEM — Equipment Manufacturer";
  const hasFilters = Boolean(projectCategory && orgType);

  // ── createProject ─────────────────────────────────────────────────────────
  const createProject = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        timezone: form.timezone,
        address: form.address,
      };
      if (!id && !subId) {
        payload = {
          ...payload,
          metadata: { ...rootMetadata },
          projectCategory: projectCategory,
          type: activeRootType?.code,
        };
      }
      if (id && subId) {
        payload = {
          ...payload,
          parentProjectId: subId,
          parentSiteId: id,
          type: activeSubType?.code,
        };
        if (selectedSubType) {
          payload = {
            ...payload,
            metadata: { ...subMetadata },
          };
        }
      }
      const required = [
        "name",
        "description",
        "startDate",
        "endDate",
        "timezone",
        "address",
      ];
      for (const f of required) {
        if (!payload[f])
          return setMessage({
            type: "error",
            text: `${CapitalizeText(f)} is required.`,
          });
      }
      await CreateProjects(payload);
      setMessage({ type: "success", text: "Project created successfully! 🚀" });
      router.back();
    } catch (err) {
      setMessage({ type: "error", text: `Error: ${err?.message}` });
    }
  };

  // ── createSite ────────────────────────────────────────────────────────────
  const createSite = async (e) => {
    e.preventDefault();
    try {
      if (!siteForm.name || !siteForm.location)
        return setMessage({
          type: "error",
          text: "Name and Location are required.",
        });
      await CreateSite(id, {
        name: siteForm.name,
        location: siteForm.location,
        status: siteForm.status,
        readinessGates: READINESS_GATES,
        safetyStatus: siteForm.safetyStatus,
        permitStatus: siteForm.permitStatus,
        type: activeSiteType?.code,
        metadata: siteMetadata,
      });
      setMessage({ type: "success", text: "Site created successfully! 🚀" });
      router.back();
    } catch (err) {
      setMessage({ type: "error", text: `Error: ${err?.message}` });
    }
  };
  // ── createZone ────────────────────────────────────────────────────────────
  const createZone = async (e) => {
    e.preventDefault();
    try {
      if (!zoneMetadata.zone_name)
        return setMessage({ type: "error", text: "Zone Name is required." });
      await CreateZone(id, {
        name: zoneMetadata.zone_name,
        type: activeZoneType?.code,
        metadata: zoneMetadata,
      });
      setMessage({ type: "success", text: "Zone created successfully! 🚀" });
      router.back();
    } catch (err) {
      setMessage({ type: "error", text: `Error: ${err?.message}` });
    }
  };

  // ── createEquipment ───────────────────────────────────────────────────────
  const createEquipment = async (e) => {
    e.preventDefault();
    try {
      const required = ["name", "serialNumber", "lifecyclePhase"];
      for (const f of required) {
        if (!equipmentForm[f])
          return setMessage({
            type: "error",
            text: `${CapitalizeText(f)} is required.`,
          });
      }
      await CreateEquipment(id, {
        name: equipmentForm.name,
        serialNumber: equipmentForm.serialNumber,
        status: equipmentForm.status,
        lifecyclePhase: equipmentForm.lifecyclePhase,
        certificationReq: equipmentForm.certificationReq,
        type: activeAssetType?.code,
        zoneId: id,
        metadata: assetMetadata,
      });
      setMessage({
        type: "success",
        text: "Equipment created successfully! 🚀",
      });
      router.back();
    } catch (err) {
      setMessage({ type: "error", text: `Error: ${err?.message}` });
    }
  };

  // ── Unified submit — routing unchanged from original ──────────────────────
  const handleSubmit = (e) => {
    if (isSiteForm) return createSite(e);
    if (isZoneForm) return createZone(e);
    if (isEquipmentForm) return createEquipment(e);
    return createProject(e);
  };

  const btnLabel = isSiteForm
    ? "Create Site"
    : isZoneForm
      ? "Create Zone"
      : isEquipmentForm
        ? "Create Equipment"
        : id && subId ? "Create Area" : "Create Project";

  return (
    <div className="min-h-screen w-full font-gilroy p-6 text-[#1a202c]">
      {/* Top bar */}
      <div className="flex items-center gap-4 flex-wrap mb-6">
        {message.text && (
          <div
            className={`px-4 py-2.5 rounded-xl text-[13px] border flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <span className="font-bold">
              {message.type === "success" ? "✓" : "✕"}
            </span>
            {message.text}
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="ml-auto bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] hover:from-[#4d7ef5] hover:to-[#2347a0] text-white text-[13px] font-[600] py-2.5 px-6 rounded-xl transition-all duration-150 cursor-pointer shadow-lg shadow-[#3C71F0]/25"
        >
          {btnLabel}
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* ── Filters ── */}
        {!parentCategory && (
          <CategoryOrgFilter
            projectCategory={projectCategory}
            setProjectCategory={setProjectCategory}
            orgType={orgType}
            setOrgType={setOrgType}
            loading={loadingTypes}
          />
        )}

        {/* ══════════════════════ PROJECT FORM ══════════════════════════════ */}
        {isProjectForm && (
          <>
            <SectionCard
              title={id && subId ? "Area Details" : "Project Details"}
            >
              <div className={cls.grid2}>
                <InputField
                  label={id && subId ? "Area Name" : "Project Name"}
                  required
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Phoenix Data Center Phase 1"
                />

                <div className="md:col-span-1">
                  <InputField
                    label="Description"
                    required
                    type="text"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder={`Brief ${id && subId ? "area" : "project"} description`}
                  />
                </div>
                <InputField
                  label="Start Date"
                  required
                  type="datetime-local"
                  name="startDate"
                  min={today}
                  value={form.startDate}
                  onChange={handleChange}
                />
                <InputField
                  label="End Date"
                  required
                  type="datetime-local"
                  name="endDate"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={handleChange}
                />
                <InputField
                  label="Timezone"
                  required
                  type="text"
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  placeholder="e.g. America/New_York"
                />

                <div className="md:col-span-1">
                  <InputField
                    label="Address"
                    required
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder={`${id && subId ? "Area" : "Project"} site address`}
                  />
                </div>
              </div>
            </SectionCard>
            {!id && !subId && (
              <SectionCard title="Project Type" dot="#3C71F0">
                <p className="text-[12px] text-[#718096] mb-4">
                  Assign a project type to define metadata requirements.
                </p>
                {groupedTypes.rootProjects.length > 0 ? (
                  <TypeSelector
                    label="Root Project Type"
                    types={groupedTypes.rootProjects}
                    selectedId={selectedRootType}
                    onTypeChange={(val) => {
                      setSelectedRootType(val);
                      setRootMetadata({});
                    }}
                    metadata={rootMetadata}
                    onMetadataChange={handleRootMeta}
                  />
                ) : (
                  <TypesPlaceholder
                    hasFilters={hasFilters}
                    categoryLabel={categoryLabel}
                    orgLabel={orgLabel}
                    loading={loadingTypes}
                  />
                )}
              </SectionCard>
            )}

            {id && subId && groupedTypes.subProjects.length > 0 && (
              <SectionCard title="Area Type" dot="#10B981">
                <p className="text-[12px] text-[#718096] mb-4">
                  Optionally assign an area type.
                </p>
                <TypeSelector
                  label="Area Type"
                  types={groupedTypes.subProjects}
                  selectedId={selectedSubType}
                  onTypeChange={(val) => {
                    setSelectedSubType(val);
                    setSubMetadata({});
                  }}
                  metadata={subMetadata}
                  onMetadataChange={handleSubMeta}
                />
              </SectionCard>
            )}
          </>
        )}

        {/* ════════════════════════ SITE FORM ═══════════════════════════════ */}
        {isSiteForm && (
          <>
            <SectionCard title="Site Details">
              <div className={cls.grid2}>
                <InputField
                  label="Site Name"
                  required
                  type="text"
                  name="name"
                  value={siteForm.name}
                  onChange={handleSiteChange}
                  placeholder="e.g. East Wing Site A"
                />
                <InputField
                  label="Location"
                  required
                  type="text"
                  name="location"
                  value={siteForm.location}
                  onChange={handleSiteChange}
                  placeholder="Physical location or address"
                />
                <SelectField
                  label="Status"
                  name="status"
                  value={siteForm.status}
                  onChange={handleSiteChange}
                >
                  {(activeSiteType?.allowedStatuses?.length
                    ? activeSiteType.allowedStatuses
                    : ["NOT_READY", "READY", "ACTIVE", "COMPLETE"]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </SelectField>
                <div />
                <SelectField
                  label="Safety Status"
                  name="safetyStatus"
                  value={siteForm.safetyStatus}
                  onChange={handleSiteChange}
                >
                  {["PENDING", "APPROVED", "REJECTED"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  label="Permit Status"
                  name="permitStatus"
                  value={siteForm.permitStatus}
                  onChange={handleSiteChange}
                >
                  {["PENDING", "APPROVED", "REJECTED"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>
              </div>
            </SectionCard>

            <SectionCard title="Site Type & Configuration" dot="#4F46E5">
              {groupedTypes.sites.length > 0 ? (
                <TypeSelector
                  label="Site Type"
                  types={groupedTypes.sites}
                  selectedId={selectedSiteType}
                  onTypeChange={(val) => {
                    setSelectedSiteType(val);
                    setSiteMetadata({});
                  }}
                  metadata={siteMetadata}
                  onMetadataChange={handleSiteMeta}
                />
              ) : (
                <TypesPlaceholder
                  hasFilters={hasFilters}
                  categoryLabel={categoryLabel}
                  orgLabel={orgLabel}
                  loading={loadingTypes}
                />
              )}
            </SectionCard>
          </>
        )}

        {/* ════════════════════════ ZONE FORM ═══════════════════════════════ */}
        {isZoneForm && (
          <>
            {/* <SectionCard title="Zone Details">
              <InputField
                label="Zone Name"
                required
                type="text"
                name="name"
                value={zoneForm.name}
                onChange={handleZoneChange}
                placeholder="e.g. Excavation Zone 1 / Data Hall A"
              />
            </SectionCard> */}

            <SectionCard title="Zone Type & Configuration" dot="#6366F1">
              {groupedTypes.zones.length > 0 ? (
                <TypeSelector
                  label="Zone Type"
                  types={groupedTypes.zones}
                  selectedId={selectedZoneType}
                  onTypeChange={(val) => {
                    setSelectedZoneType(val);
                    setZoneMetadata({});
                  }}
                  metadata={zoneMetadata}
                  onMetadataChange={handleZoneMeta}
                />
              ) : (
                <TypesPlaceholder
                  hasFilters={hasFilters}
                  categoryLabel={categoryLabel}
                  orgLabel={orgLabel}
                  loading={loadingTypes}
                />
              )}
            </SectionCard>
          </>
        )}

        {/* ════════════════════════ EQUIPMENT FORM ══════════════════════════ */}
        {isEquipmentForm && (
          <>
            <SectionCard title="Equipment Details">
              <div className={cls.grid2}>
                <InputField
                  label="Equipment Name"
                  required
                  type="text"
                  name="name"
                  value={equipmentForm.name}
                  onChange={handleEquipChange}
                  placeholder="e.g. Excavator Unit 01"
                />
                <InputField
                  label="Serial Number"
                  required
                  type="text"
                  name="serialNumber"
                  value={equipmentForm.serialNumber}
                  onChange={handleEquipChange}
                  placeholder="Manufacturer serial number"
                />
                <SelectField
                  label="Status"
                  name="status"
                  value={equipmentForm.status}
                  onChange={handleEquipChange}
                >
                  {(activeAssetType?.allowedStatuses?.length
                    ? activeAssetType.allowedStatuses
                    : [
                        "ORDERED",
                        "ON_SITE",
                        "OPERATIONAL",
                        "MAINTENANCE",
                        "OFF_SITE",
                      ]
                  ).map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </SelectField>
                <InputField
                  label="Lifecycle Phase"
                  required
                  type="text"
                  name="lifecyclePhase"
                  value={equipmentForm.lifecyclePhase}
                  onChange={handleEquipChange}
                  placeholder="e.g. Procurement / Installation"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Certification Requirement"
                    type="text"
                    name="certificationReq"
                    value={equipmentForm.certificationReq}
                    onChange={handleEquipChange}
                    placeholder="e.g. UL Listed, CE Marked"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Asset Type & Specifications" dot="#EF4444">
              {groupedTypes.assets.length > 0 ? (
                <TypeSelector
                  label="Asset Type"
                  types={groupedTypes.assets}
                  selectedId={selectedAssetType}
                  onTypeChange={(val) => {
                    setSelectedAssetType(val);
                    setAssetMetadata({});
                  }}
                  metadata={assetMetadata}
                  onMetadataChange={handleAssetMeta}
                />
              ) : (
                <TypesPlaceholder
                  hasFilters={hasFilters}
                  categoryLabel={categoryLabel}
                  orgLabel={orgLabel}
                  loading={loadingTypes}
                />
              )}
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}
