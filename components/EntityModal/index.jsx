"use client";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { CreateProjects } from "@/services/Projects";
import { CreateSite } from "@/services/Sites";
import { CreateZone } from "@/services/Zones";
import { CreateEquipment } from "@/services/Equipment";
import { GetFields } from "@/services/Types";
import { getUser } from "@/services/instance/tokenService";
import { useParams } from "next/navigation";
import { CompanyDropdownForProjects } from "@/Utils/companyDropdown";
import { RFIDropdown } from "@/components/RfiDropDown";
import { ChecklistDropdownForProjects } from "@/Utils/checklistDropdown";
import { DocumentsDropdownForProjects } from "@/Utils/documentsDropdown";
import { MeetingsDropdownForProjects } from "@/Utils/meetingsDropdown";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CapitalizeText = (text) =>
  text
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

const PROJECT_CATEGORIES = [
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "DATA_CENTER", label: "Data Center" },
  { value: "MANUFACTURING", label: "Manufacturing" },
  { value: "INFRA", label: "Infrastructure" },
  { value: "HYBRID", label: "Hybrid" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "EST", label: "EST (Eastern Standard Time)" },
  { value: "EDT", label: "EDT (Eastern Daylight Time)" },
  { value: "CST", label: "CST (Central Standard Time)" },
  { value: "CDT", label: "CDT (Central Daylight Time)" },
  { value: "MST", label: "MST (Mountain Standard Time)" },
  { value: "MDT", label: "MDT (Mountain Daylight Time)" },
  { value: "PST", label: "PST (Pacific Standard Time)" },
  { value: "PDT", label: "PDT (Pacific Daylight Time)" },
  { value: "GMT", label: "GMT (Greenwich Mean Time)" },
  { value: "BST", label: "BST (British Summer Time)" },
  { value: "IST", label: "IST (Indian Standard Time)" },
  { value: "JST", label: "JST (Japan Standard Time)" },
  { value: "AEST", label: "AEST (Australian Eastern Standard Time)" },
  { value: "AEDT", label: "AEDT (Australian Eastern Daylight Time)" },
  { value: "NZST", label: "NZST (New Zealand Standard Time)" },
  { value: "NZDT", label: "NZDT (New Zealand Daylight Time)" },
];

// Asset Categories and Sub-Categories Mapping
const ASSET_CATEGORIES = {
  POWER_DISTRIBUTION: {
    label: "Power Distribution",
    subcategories: [
      "MV Switchgear",
      "MV Transformer",
      "MV Cable / Terminations",
      "Network Protector",
      "Fused Disconnect Switch",
      "Main Switchboard (MSB)",
      "Low Voltage Switchgear (LVSG)",
      "Power Distribution Unit (PDU)",
      "Remote Power Panel (RPP)",
      "Panelboard",
      "Motor Control Center (MCC)",
      "Busway / Busbar",
      "Automatic Transfer Switch (ATS)",
      "Static Transfer Switch (STS)",
      "Bypass Isolation Switch (BIS)",
      "Manual Transfer Switch (MTS)",
      "Dry-Type Transformer (LV)",
      "K-Rated Transformer",
      "Isolation Transformer",
      "Step-Down Transformer",
    ],
  },
  BACKUP_POWER: {
    label: "Backup Power",
    subcategories: [
      "UPS Module",
      "UPS Static Bypass",
      "UPS Maintenance Bypass",
      "UPS Battery Cabinet",
      "UPS Battery String",
      "Battery Monitoring System (BMS)",
      "UPS Distribution Module",
      "Diesel Generator Set",
      "Natural Gas Generator",
      "Generator Automatic Voltage Regulator (AVR)",
      "Generator Engine Control Panel",
      "Generator Paralleling Switchgear (KGPS)",
      "Generator Circuit Breaker",
      "Day Tank",
      "Belly Tank",
      "Fuel Transfer Pump",
      "Fuel Storage Tank (above/below ground)",
      "Fuel Polishing System",
      "Exhaust / Silencer System",
      "Generator Coolant / Radiator",
    ],
  },
  COOLING_MECHANICAL: {
    label: "Cooling & Mechanical",
    subcategories: [
      "CRAC Unit (Computer Room Air Conditioner)",
      "CRAH Unit (Computer Room Air Handler)",
      "In-Row Cooler",
      "Overhead Cooler",
      "Rear-Door Heat Exchanger",
      "Chiller (air-cooled)",
      "Chiller (water-cooled)",
      "Cooling Tower",
      "Dry Cooler / Fluid Cooler",
      "Chilled Water Pump (primary)",
      "Chilled Water Pump (secondary)",
      "Condenser Water Pump",
      "Plate Heat Exchanger",
      "Buffer Tank / Thermal Storage",
      "Expansion Tank",
      "Chemical Treatment System",
      "Variable Frequency Drive (VFD) — Pump",
      "Chilled Water Piping & Valves",
      "Chilled Water Distribution Unit (CWDU)",
      "Computer Room Air Handler (CRAH)",
      "Air Handler Unit (AHU)",
      "Fan Coil Unit (FCU)",
      "Economizer / Free Cooling Unit",
      "Spot Cooler",
      "Evaporative Cooler",
      "Adiabatic System",
    ],
  },
  BMS_CONTROLS: {
    label: "BMS & Controls",
    subcategories: [
      "BMS Controller / DDC Panel",
      "BMS Server / Workstation",
      "BMS Network Gateway",
      "BMS Field Device (sensor, actuator)",
      "EPMS Server / Workstation",
      "Power Meter (main)",
      "Power Meter (branch)",
      "EPMS Communication Gateway",
      "Revenue Grade Meter",
      "DCIM Server",
      "DCIM Environmental Sensor",
      "DCIM PDU Monitoring",
      "DCIM Network Infrastructure",
      "Clean Agent Suppression System (FM-200 / Novec 1230)",
      "Gaseous Suppression Panel",
      "Aspirating Smoke Detection (ASD / VESDA)",
      "Addressable Fire Alarm Panel (FACP)",
      "Smoke Detector",
      "Heat Detector",
      "Manual Pull Station",
      "Notification Appliance (horn/strobe)",
      "Pre-Action Sprinkler System",
      "Deluge Valve",
      "Access Control Panel",
      "Card Reader",
      "Door Contact / REX",
      "CCTV Camera",
      "NVR / DVR",
      "Visitor Management System",
    ],
  },
  NETWORK_COMMUNICATIONS: {
    label: "Network & Communications",
    subcategories: [
      "Core Router",
      "Aggregation Switch",
      "Top-of-Rack (TOR) Switch",
      "Out-of-Band (OOB) Management Switch",
      "Network Patch Panel",
      "Structured Cabling System",
      "Optical Distribution Frame (ODF)",
      "Fiber Patch Panel",
      "Fiber Trunk Cable",
      "MPO/MTP Fiber Cassette",
      "Console Server",
      "KVM Switch",
      "Terminal Server",
    ],
  },
  STRUCTURAL_CIVIL: {
    label: "Structural & Civil",
    subcategories: [
      "Raised Access Floor Panel",
      "Floor Support Pedestal",
      "Ceiling Tile System",
      "Hot Aisle Containment (HAC)",
      "Cold Aisle Containment (CAC)",
      "Chimney / Overhead Containment",
      "Server Rack (open)",
      "Server Cabinet (enclosed)",
      "Rack PDU (vertical / horizontal)",
      "Cage / Cage System",
    ],
  },
  SAFETY_COMPLIANCE: {
    label: "Safety & Compliance",
    subcategories: [
      "Lockout / Tagout (LOTO) Station",
      "Arc Flash PPE Station",
      "Safety Shower / Eyewash",
      "Emergency Lighting",
      "Exit Sign",
      "Grounding / Bonding System",
      "Lightning Protection System",
    ],
  },
};

// Phase configuration for project creation (max 4 fields per phase)
const PROJECT_PHASES = [
  {
    label: "Category & Type",
    id: "category_type",
    fields: ["projectCategory", "selectedRootType", "company", "rfi"],
  },
  {
    label: "Basic Info",
    id: "basic_info",
    fields: ["name", "description", "checklist", "document"],
  },
  {
    label: "Schedule",
    id: "schedule",
    fields: ["startDate", "endDate", "meeting"],
  },
  {
    label: "Location & Details",
    id: "location_details",
    fields: ["address", "contractValue", "clientName"],
  },
  {
    label: "Additional Info",
    id: "additional_info",
    isDynamic: true,
  },
];

// Phase configuration for sites (max 4 fields per phase)
const SITE_PHASES = [
  {
    label: "Type & Location",
    id: "type_location",
    fields: ["selectedSiteType", "name", "location"],
  },
  {
    label: "Status",
    id: "status",
    fields: ["status"],
  },
  {
    label: "Additional Details",
    id: "additional_details",
    isDynamic: true,
  },
];
// Phase configuration for zones (max 4 fields per phase)
const SUB_PROJECT_PHASES = [
  {
    label: "Category & Type",
    id: "category_type",
    fields: ["selectedSubProjectType"],
  },
  {
    label: "Basic Info",
    id: "basic_info",
    fields: ["name", "description"],
  },
  {
    label: "Schedule",
    id: "schedule",
    fields: ["startDate", "endDate", "timezone"],
  },
  {
    label: "Location & Details",
    id: "location_details",
    fields: ["address", "contractValue", "clientName"],
  },
  {
    label: "Additional Info",
    id: "additional_info",
    isDynamic: true,
  },
];

// Phase configuration for zones (max 4 fields per phase)
const ZONE_PHASES = [
  {
    label: "Zone Setup",
    id: "zone_setup",
    fields: ["selectedZoneType", "name"],
  },
  {
    label: "Additional Info",
    id: "additional_info",
    isDynamic: true,
  },
];

// Phase configuration for equipment (max 4 fields per phase)
const EQUIPMENT_PHASES = [
  {
    label: "Category & Subcategory",
    id: "category_subcategory",
    fields: ["assetCategory", "assetSubcategory"],
  },
  {
    label: "Asset Info",
    id: "asset_info",
    fields: ["selectedAssetType", "name", "serialNumber"],
  },
  {
    label: "Status",
    id: "status",
    fields: ["status"],
  },
  {
    label: "Additional Details",
    id: "additional_details",
    isDynamic: true,
  },
];

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

function coerceValue(rawValue, fieldType) {
  if (fieldType === "number") {
    if (rawValue === "" || rawValue === null || rawValue === undefined)
      return "";
    const parsed = parseFloat(rawValue);
    return isNaN(parsed) ? rawValue : parsed;
  }
  if (fieldType === "boolean") {
    if (rawValue === "true") return true;
    if (rawValue === "false") return false;
    return rawValue;
  }
  return rawValue;
}

function makeMetaHandler(setter, schema, requiredFields) {
  return (e) => {
    const { name, value } = e.target;
    if (e.target.__fieldType === "array") {
      setter((p) => ({ ...p, [name]: value }));
      return;
    }
    const fields = parseMetadataSchema(schema, requiredFields);
    const fieldDef = fields.find((f) => f.name === name);
    const fieldType = fieldDef?.type ?? "text";
    setter((p) => ({ ...p, [name]: coerceValue(value, fieldType) }));
  };
}

function DynamicField({ field, value, onChange }) {
  const chevron = (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white"
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
    const displayVal =
      value === true ? "true" : value === false ? "false" : (value ?? "");
    return (
      <div className="relative">
        <select
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white"
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

  return (
    <input
      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
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

const READINESS_GATES = [
  { gate: "SAFETY_APPROVAL", status: "PENDING" },
  { gate: "PERMIT_APPROVAL", status: "PENDING" },
];

// ─── PHASE INDICATOR COMPONENT ────────────────────────────────────────────────
function PhaseIndicator({ currentPhase, totalPhases, phases }) {
  return (
    <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-300">
          Phase {currentPhase} of {totalPhases}
        </span>
        <span className="text-sm font-semibold text-blue-400">
          {phases[currentPhase - 1]?.label || ""}
        </span>
      </div>
      <div className="flex gap-2">
        {phases.map((phase, idx) => (
          <div key={idx} className="flex-1">
            <div
              className={`h-1.5 rounded-full transition-all ${
                idx + 1 <= currentPhase ? "bg-blue-500" : "bg-gray-700"
              }`}
            />
            <div className="text-xs mt-1 text-gray-400 text-center truncate">
              {phase.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EntityModal({
  isOpen,
  onClose,
  entityType,
  parentId,
  projectCategory: initialCategory,
  onSuccess,
}) {
  const params = useParams();
  const { id, subId } = params;
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentPhase, setCurrentPhase] = useState(1);

  // Category selection (for projects)
  const [projectCategory, setProjectCategory] = useState(initialCategory || "");
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [groupedTypes, setGroupedTypes] = useState({
    rootProjects: [],
    subProjects: [],
    sites: [],
    zones: [],
    assets: [],
  });

  // Type selectors
  const [selectedRootType, setSelectedRootType] = useState("");
  const [selectedSubType, setSelectedSubType] = useState("");
  const [selectedSubProjectType, setSelectedSubProjectType] = useState("");
  const [selectedSiteType, setSelectedSiteType] = useState("");
  const [selectedZoneType, setSelectedZoneType] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState("");
  const [assetCategory, setAssetCategory] = useState("");
  const [assetSubcategory, setAssetSubcategory] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRFIs, setSelectedRFIs] = useState([]);
  const [selectedChecklist, setSelectedChecklist] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState("");

  // Base form states
  const [projectForm, setProjectForm] = useState({
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
  });
  const [zoneForm, setZoneForm] = useState({
    name: "",
  });
  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    serialNumber: "",
    status: "ORDERED",
  });

  // Metadata states
  const [rootMetadata, setRootMetadata] = useState({});
  const [subMetadata, setSubMetadata] = useState({});
  const [siteMetadata, setSiteMetadata] = useState({});
  const [zoneMetadata, setZoneMetadata] = useState({});
  const [assetMetadata, setAssetMetadata] = useState({});
  // Active type objects
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

  // Helper to split dynamic fields into chunks of 4
  const splitDynamicFields = (fields) => {
    const chunks = [];
    for (let i = 0; i < fields.length; i += 4) {
      chunks.push(fields.slice(i, i + 4));
    }
    return chunks;
  };
  const getRootTypeFields = () => {
    return parseMetadataSchema(
      activeRootType?.metadataSchema,
      activeRootType?.requiredFields,
    );
  };

  const getSubTypeFields = () => {
    return parseMetadataSchema(
      activeSubType?.metadataSchema,
      activeSubType?.requiredFields,
    );
  };

  const getSiteTypeFields = () => {
    return parseMetadataSchema(
      activeSiteType?.metadataSchema,
      activeSiteType?.requiredFields,
    );
  };

  const getZoneTypeFields = () => {
    return parseMetadataSchema(
      activeZoneType?.metadataSchema,
      activeZoneType?.requiredFields,
    );
  };

  const getAssetTypeFields = () => {
    return parseMetadataSchema(
      activeAssetType?.metadataSchema,
      activeAssetType?.requiredFields,
    );
  };

  // Determine which phases to use based on entity type, with dynamic phase pagination
  const getPhases = () => {
    let basePhasesConfig = [];
    if (entityType === "project") basePhasesConfig = PROJECT_PHASES;
    else if (entityType === "site") basePhasesConfig = SITE_PHASES;
    else if (entityType === "zone") basePhasesConfig = ZONE_PHASES;
    else if (entityType === "equipment") basePhasesConfig = EQUIPMENT_PHASES;
    else if (entityType === "subProjects")
      basePhasesConfig = SUB_PROJECT_PHASES;

    // Get dynamic fields based on entity type
    let allDynamicFields = [];
    if (entityType === "project") {
      allDynamicFields = [...getRootTypeFields()];
    } else if (entityType === "site") {
      allDynamicFields = getSiteTypeFields();
    } else if (entityType === "zone") {
      allDynamicFields = getZoneTypeFields();
    } else if (entityType === "equipment") {
      allDynamicFields = getAssetTypeFields();
    } else if (entityType === "subProjects") {
      allDynamicFields = [...getSubTypeFields()];
    }

    // If there are dynamic fields, split them into chunks of 4 and create additional phases
    if (allDynamicFields.length > 0) {
      const dynamicChunks = splitDynamicFields(allDynamicFields);
      return [
        ...basePhasesConfig.filter((p) => !p.isDynamic),
        ...dynamicChunks.map((chunk, idx) => ({
          label:
            dynamicChunks.length === 1
              ? "Additional Info"
              : `Additional Info ${idx + 1}`,
          id: `dynamic_${idx}`,
          isDynamic: true,
          dynamicFieldsChunk: chunk,
        })),
      ];
    }

    return basePhasesConfig;
  };

  const phases = getPhases();
  const totalPhases = phases.length;

  // Metadata handlers
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

  // Fetch grouped types when category changes
  useEffect(() => {
    if (!isOpen || entityType !== "project" || !projectCategory) return;

    const fetchGroupedTypes = async () => {
      setLoadingTypes(true);
      setSelectedRootType("");
      setSelectedSubType("");
      setRootMetadata({});
      setSubMetadata({});

      try {
        const user = JSON.parse(getUser());
        const qs = new URLSearchParams({
          projectCategory,
          orgType: user?.orgType || "GC",
        }).toString();
        const data = await GetFields(qs);
        setGroupedTypes({
          rootProjects: data.rootProjects || [],
          subProjects: data.subProjects || [],
          sites: data.sites || [],
          zones: data.zones || [],
          assets: data.assets || [],
        });
      } catch (err) {
        console.error("Failed to fetch types:", err);
        setMessage({
          type: "error",
          text: `Failed to load types: ${err?.message}`,
        });
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchGroupedTypes();
  }, [isOpen, entityType, projectCategory]);

  // Fetch types for non-project entities
  useEffect(() => {
    if (!isOpen || entityType === "project" || !projectCategory || !parentId)
      return;
    const fetchEntityTypes = async () => {
      setLoadingTypes(true);
      setSelectedSiteType("");
      setSelectedZoneType("");
      setSelectedAssetType("");
      setAssetCategory("");
      setAssetSubcategory("");
      setSiteMetadata({});
      setZoneMetadata({});
      setAssetMetadata({});

      try {
        const user = JSON.parse(getUser());
        const qs = new URLSearchParams({
          projectCategory,
          orgType: user?.organizationType || "GC",
        }).toString();
        const data = await GetFields(qs);
        setGroupedTypes({
          rootProjects: data.rootProjects || [],
          subProjects: data.subProjects || [],
          sites: data.sites || [],
          zones: data.zones || [],
          assets: data.assets || [],
        });
      } catch (err) {
        console.error("Failed to fetch types:", err);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchEntityTypes();
  }, [isOpen, entityType, projectCategory, parentId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (entityType === "project" || entityType === "subProjects") {
        let payload = {
          name: projectForm.name,
          description: projectForm.description,
          startDate: projectForm.startDate,
          endDate: projectForm.endDate,
          timezone: projectForm.timezone,
          address: projectForm.address,
        };
        // if (selectedCompany) {
        //   payload.companyId = selectedCompany;
        // }
        // if (selectedRFIs.length > 0) {
        //   payload.rfiIds = selectedRFIs;
        // }
        // if (selectedChecklist) {
        //   payload.checklistId = selectedChecklist;
        // }
        // if (selectedDocument) {
        //   payload.documentId = selectedDocument;
        // }
        // if (selectedMeeting) {
        //   payload.meetingId = selectedMeeting;
        // }
        if (!selectedSubType) {
          payload = {
            ...payload,
            metadata: { ...rootMetadata },
            projectCategory: projectCategory,
            type: activeRootType?.code,
          };
        }
        if (selectedSubType) {
          payload = {
            ...payload,
            parentProjectId: subId,
            parentSiteId: id,
            type: activeSubType?.code,
            metadata: { ...subMetadata },
          };
        }
        await CreateProjects(payload);
      } else if (entityType === "site") {
        const payload = {
          name: siteForm.name,
          location: siteForm.location,
          status: siteForm.status,
          readinessGates: READINESS_GATES,
          type: activeSiteType?.code,
          metadata: siteMetadata,
        };
        await CreateSite(parentId, payload);
      } else if (entityType === "zone") {
        const payload = {
          name: zoneMetadata?.zone_name,
          type: activeZoneType?.code,
          metadata: zoneMetadata,
        };
        await CreateZone(parentId, payload);
      } else if (entityType === "equipment") {
        const payload = {
          name: equipmentForm.name,
          serialNumber: equipmentForm.serialNumber,
          status: equipmentForm.status,
          type: activeAssetType?.code,
          metadata: {
            ...assetMetadata,
            // assetCategory,
            // assetSubcategory,
          },
        };
        await CreateEquipment(parentId, payload);
      }

      setMessage({
        type: "success",
        text: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} created successfully!`,
      });
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(entityType);
        }
        handleClose();
      }, 1000);
    } catch (err) {
      setMessage({ type: "error", text: `Failed: ${err?.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPhase(1);
    setProjectForm({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      timezone: "",
      address: "",
      contractValue: "",
      clientName: "",
    });
    setSiteForm({
      name: "",
      location: "",
      status: "NOT_READY",
    });
    setZoneForm({ name: "" });
    setEquipmentForm({
      name: "",
      serialNumber: "",
      status: "ORDERED",
    });
    setAssetCategory("");
    setAssetSubcategory("");
    setRootMetadata({});
    setSubMetadata({});
    setSiteMetadata({});
    setZoneMetadata({});
    setAssetMetadata({});
    setMessage({ type: "", text: "" });
    onClose();
  };

  const getEntityTitle = () => {
    if (entityType === "project") return "Create Project";
    if (entityType === "site") return "Add Site";
    if (entityType === "zone") return "Add Zone";
    if (entityType === "equipment") return "Add Asset";
    if (entityType === "subProjects") return "Add Sub-Project";
    return "Create Entity";
  };

  const canGoToNextPhase = () => {
    // Get current phase configuration
    const currentPhaseConfig = phases[currentPhase - 1];

    // Dynamic phases (Additional Info) are always optional - can skip through them
    if (currentPhaseConfig?.isDynamic) {
      return true;
    }

    // Handle fixed phases by entity type and phase number
    if (entityType === "project") {
      if (currentPhase === 1) return projectCategory && selectedRootType;
      if (currentPhase === 2)
        return projectForm.name && projectForm.description;
      if (currentPhase === 3)
        return projectForm.startDate && projectForm.endDate;
      if (currentPhase === 4)
        return projectForm.address && projectForm.timezone;
    }

    if (entityType === "subProjects") {
      if (currentPhase === 1) return selectedSubType;
      if (currentPhase === 2)
        return projectForm.name && projectForm.description;
      if (currentPhase === 3)
        return projectForm.startDate && projectForm.endDate;
      if (currentPhase === 4)
        return projectForm.address && projectForm.timezone;
    }
    if (entityType === "site") {
      if (currentPhase === 1)
        return selectedSiteType && siteForm.name && siteForm.location;
      if (currentPhase === 2) return siteForm.status;
    }
    if (entityType === "zone") {
      if (currentPhase === 1) return selectedZoneType;
    }
    if (entityType === "equipment") {
      if (currentPhase === 1) return assetCategory && assetSubcategory;
      if (currentPhase === 2)
        return (
          selectedAssetType && equipmentForm.name && equipmentForm.serialNumber
        );
      if (currentPhase === 3) return equipmentForm.status;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 sticky top-0 bg-gray-900">
          <h2 className="text-xl font-bold text-white">{getEntityTitle()}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Phase Indicator */}
        {totalPhases > 1 && (
          <PhaseIndicator
            currentPhase={currentPhase}
            totalPhases={totalPhases}
            phases={phases}
          />
        )}

        {/* Message */}
        {message.text && (
          <div
            className={`mx-6 mt-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/20 border border-green-500 text-green-400"
                : "bg-red-500/20 border border-red-500 text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form Content */}
        <form
          onSubmit={(e) => handleCreate(e)}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {/* ─── PROJECTS ─── */}
          {(entityType === "project" || entityType === "subProjects") && (
            <>
              {/* Phase 1: Category & Type (2 fields) */}
              {currentPhase === 1 && (
                <div className="space-y-4">
                  {!id && !subId && (
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Project Category *
                      </label>
                      <div className="relative">
                        <select
                          value={projectCategory}
                          onChange={(e) => setProjectCategory(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white"
                        >
                          <option value="">— Select Category —</option>
                          {PROJECT_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        {/* <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg> */}
                      </div>
                    </div>
                  )}

                  {!id && !subId && (
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Project Type *
                      </label>
                      <div className="relative">
                        <select
                          value={selectedRootType}
                          onChange={(e) => setSelectedRootType(e.target.value)}
                          disabled={loadingTypes}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white disabled:opacity-50"
                        >
                          <option value="">
                            {loadingTypes
                              ? "Loading types..."
                              : "— Select Type —"}
                          </option>
                          {groupedTypes.rootProjects.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.displayName || t.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {!id && !subId && (
                    <CompanyDropdownForProjects
                      entityType="Project"
                      selectedCompany={selectedCompany}
                      onCompanyChange={setSelectedCompany}
                      disabled={loading}
                    />
                  )}

                  {!id && !subId && (
                    <RFIDropdown
                      projectId={id || ""}
                      selectedRFIs={selectedRFIs}
                      onRFISelect={(value) => setSelectedRFIs(value)}
                    />
                  )}
                  {id && subId && (
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Sub Project Type *
                      </label>
                      <div className="relative">
                        <select
                          value={selectedSubType}
                          onChange={(e) => setSelectedSubType(e.target.value)}
                          disabled={loadingTypes}
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white disabled:opacity-50"
                        >
                          <option value="">
                            {loadingTypes
                              ? "Loading types..."
                              : "— Select Type —"}
                          </option>
                          {groupedTypes.subProjects.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.displayName || t.code}
                            </option>
                          ))}
                        </select>
                        {/* <svg
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg> */}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Phase 2: Basic Info (2 fields) */}
              {currentPhase === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectForm.name}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Description *
                    </label>
                    <textarea
                      value={projectForm.description}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter description"
                      rows="3"
                    />
                  </div>

                  {!id && !subId && (
                    <ChecklistDropdownForProjects
                      entityType="Project"
                      selectedChecklist={selectedChecklist}
                      onChecklistChange={setSelectedChecklist}
                      disabled={loading}
                    />
                  )}

                  {!id && !subId && (
                    <DocumentsDropdownForProjects
                      entityType="Project"
                      selectedDocument={selectedDocument}
                      onDocumentChange={setSelectedDocument}
                      disabled={loading}
                    />
                  )}
                </div>
              )}

              {/* Phase 3: Schedule (3 fields) */}
              {currentPhase === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={projectForm.startDate}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={projectForm.endDate}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {!id && !subId && (
                    <MeetingsDropdownForProjects
                      entityType="Project"
                      selectedMeeting={selectedMeeting}
                      onMeetingChange={setSelectedMeeting}
                      disabled={loading}
                    />
                  )}
                </div>
              )}

              {/* Phase 4: Location & Details (3 fields) */}
              {currentPhase === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Timezone *
                    </label>
                    <div className="relative">
                      <select
                        value={projectForm.timezone}
                        onChange={(e) =>
                          setProjectForm({
                            ...projectForm,
                            timezone: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white"
                      >
                        <option value="">— Select Timezone —</option>
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>
                            {tz.label}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={projectForm.address}
                      onChange={(e) =>
                        setProjectForm({
                          ...projectForm,
                          address: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Project address"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Phases: Additional Info (with field pagination) */}
              {currentPhase > 4 && (
                <div className="space-y-4">
                  {(() => {
                    const currentPhaseConfig = phases[currentPhase - 1];
                    const fieldsToRender =
                      currentPhaseConfig?.dynamicFieldsChunk || [];

                    return fieldsToRender.length > 0 ? (
                      fieldsToRender.map((field) => {
                        // Determine which metadata object and handler to use
                        const isRootField = getRootTypeFields().some(
                          (f) => f.name === field.name,
                        );
                        const isSubField = getSubTypeFields().some(
                          (f) => f.name === field.name,
                        );

                        const metaValue = isRootField
                          ? rootMetadata[field.name]
                          : isSubField
                            ? subMetadata[field.name]
                            : siteMetadata[field.name] ||
                              zoneMetadata[field.name] ||
                              assetMetadata[field.name];

                        const metaHandler = isRootField
                          ? handleRootMeta
                          : isSubField
                            ? handleSubMeta
                            : entityType === "site"
                              ? handleSiteMeta
                              : entityType === "zone"
                                ? handleZoneMeta
                                : handleAssetMeta;

                        return (
                          <div key={field.name} className="mb-4">
                            <label className="block text-sm font-semibold text-white mb-2">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            <DynamicField
                              field={field}
                              value={metaValue}
                              onChange={metaHandler}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No additional fields available
                      </p>
                    );
                  })()}
                </div>
              )}
            </>
          )}

          {/* ─── SITES ─── */}
          {entityType === "site" && (
            <>
              {/* Phase 1: Type & Location (3 fields) */}
              {currentPhase === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Site Type *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSiteType}
                        onChange={(e) => setSelectedSiteType(e.target.value)}
                        disabled={loadingTypes}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white disabled:opacity-50"
                      >
                        <option value="">
                          {loadingTypes
                            ? "Loading types..."
                            : "— Select Type —"}
                        </option>
                        {groupedTypes.sites.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.displayName || t.code}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      value={siteForm.name}
                      onChange={(e) =>
                        setSiteForm({ ...siteForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter site name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={siteForm.location}
                      onChange={(e) =>
                        setSiteForm({ ...siteForm, location: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter location"
                    />
                  </div>
                </div>
              )}

              {/* Phase 2: Status (1 field) */}
              {currentPhase === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={siteForm.status}
                        onChange={(e) =>
                          setSiteForm({ ...siteForm, status: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white"
                      >
                        <option value="NOT_READY">Not Ready</option>
                        <option value="READY">Ready</option>
                        <option value="ACTIVE">Active</option>
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  </div>
                </div>
              )}

              {/* Dynamic Phases: Additional Details (with field pagination) */}
              {currentPhase > 2 && (
                <div className="space-y-4">
                  {(() => {
                    const currentPhaseConfig = phases[currentPhase - 1];
                    const fieldsToRender =
                      currentPhaseConfig?.dynamicFieldsChunk || [];

                    return fieldsToRender.length > 0 ? (
                      fieldsToRender.map((field) => (
                        <div key={field.name} className="mb-4">
                          <label className="block text-sm font-semibold text-white mb-2">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <DynamicField
                            field={field}
                            value={siteMetadata[field.name]}
                            onChange={handleSiteMeta}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No additional fields available
                      </p>
                    );
                  })()}
                </div>
              )}
            </>
          )}

          {/* ─── ZONES ─── */}
          {entityType === "zone" && (
            <>
              {/* Phase 1: Zone Setup (2 fields) */}
              {currentPhase === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Zone Type *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedZoneType}
                        onChange={(e) => setSelectedZoneType(e.target.value)}
                        disabled={loadingTypes}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white disabled:opacity-50"
                      >
                        <option value="">
                          {loadingTypes
                            ? "Loading types..."
                            : "— Select Type —"}
                        </option>
                        {groupedTypes.zones.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.displayName || t.code}
                          </option>
                        ))}
                      </select>
                      {/* <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg> */}
                    </div>
                  </div>

                  {/* <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Zone Name *
                    </label>
                    <input
                      type="text"
                      value={zoneForm.name}
                      onChange={(e) =>
                        setZoneForm({ ...zoneForm, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter zone name"
                    />
                  </div> */}
                </div>
              )}

              {/* Dynamic Phases: Additional Info (with field pagination) */}
              {currentPhase > 1 && (
                <div className="space-y-4">
                  {(() => {
                    const currentPhaseConfig = phases[currentPhase - 1];
                    const fieldsToRender =
                      currentPhaseConfig?.dynamicFieldsChunk || [];

                    return fieldsToRender.length > 0 ? (
                      fieldsToRender.map((field) => (
                        <div key={field.name} className="mb-4">
                          <label className="block text-sm font-semibold text-white mb-2">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <DynamicField
                            field={field}
                            value={zoneMetadata[field.name]}
                            onChange={handleZoneMeta}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No additional fields available
                      </p>
                    );
                  })()}
                </div>
              )}
            </>
          )}

          {/* ─── EQUIPMENT ─── */}
          {entityType === "equipment" && (
            <>
              {/* Phase 1: Category & Subcategory */}
              {currentPhase === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Asset Category *
                    </label>
                    <div className="relative">
                      <select
                        value={assetCategory}
                        onChange={(e) => {
                          setAssetCategory(e.target.value);
                          setAssetSubcategory("");
                        }}
                        className="w-full px-4 py-2 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 border border-cyan-500/40 hover:border-cyan-500/60 focus:border-cyan-500/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 rounded-lg transition-all cursor-pointer appearance-none font-medium text-sm"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300c8ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 12px center",
                          paddingRight: "36px",
                        }}
                      >
                        <option value="">— Select Category —</option>
                        {Object.entries(ASSET_CATEGORIES).map(([key, cat]) => (
                          <option
                            key={key}
                            value={key}
                            style={{
                              backgroundColor: "var(--rf-bg3)",
                              color: "var(--rf-txt)",
                            }}
                          >
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Asset Subcategory *
                    </label>
                    <div className="relative">
                      <select
                        value={assetSubcategory}
                        onChange={(e) => setAssetSubcategory(e.target.value)}
                        disabled={!assetCategory}
                        className="w-full px-4 py-2 bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 border border-cyan-500/40 hover:border-cyan-500/60 focus:border-cyan-500/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 rounded-lg transition-all cursor-pointer appearance-none font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300c8ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 12px center",
                          paddingRight: "36px",
                        }}
                      >
                        <option value="">
                          {!assetCategory
                            ? "— Select Category First —"
                            : "— Select Subcategory —"}
                        </option>
                        {assetCategory &&
                          ASSET_CATEGORIES[assetCategory]?.subcategories.map(
                            (subcat) => (
                              <option
                                key={subcat}
                                value={subcat}
                                style={{
                                  backgroundColor: "#1f2937",
                                  color: "#f3f4f6",
                                }}
                              >
                                {subcat}
                              </option>
                            ),
                          )}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Phase 2: Asset Info (3 fields) */}
              {currentPhase === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Asset Type *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedAssetType}
                        onChange={(e) => setSelectedAssetType(e.target.value)}
                        disabled={loadingTypes}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white disabled:opacity-50"
                      >
                        <option value="">
                          {loadingTypes
                            ? "Loading types..."
                            : "— Select Type —"}
                        </option>
                        {groupedTypes.assets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.displayName || t.code}
                          </option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Asset Name *
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.name}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter asset name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Serial Number *
                    </label>
                    <input
                      type="text"
                      value={equipmentForm.serialNumber}
                      onChange={(e) =>
                        setEquipmentForm({
                          ...equipmentForm,
                          serialNumber: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Serial number"
                    />
                  </div>
                </div>
              )}

              {/* Phase 3: Status (1 field) */}
              {currentPhase === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={equipmentForm.status}
                        onChange={(e) =>
                          setEquipmentForm({
                            ...equipmentForm,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 [&_option]:bg-gray-800 [&_option]:text-white"
                      >
                        <option value="">- Select Status - </option>
                        {activeAssetType?.allowedStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      {/* <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg> */}
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Phases: Additional Details (with field pagination) */}
              {currentPhase > 2 && (
                <div className="space-y-4">
                  {(() => {
                    const currentPhaseConfig = phases[currentPhase - 1];
                    const fieldsToRender =
                      currentPhaseConfig?.dynamicFieldsChunk || [];

                    return fieldsToRender.length > 0 ? (
                      fieldsToRender.map((field) => (
                        <div key={field.name} className="mb-4">
                          <label className="block text-sm font-semibold text-white mb-2">
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </label>
                          <DynamicField
                            field={field}
                            value={assetMetadata[field.name]}
                            onChange={handleAssetMeta}
                          />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No additional fields available
                      </p>
                    );
                  })()}
                </div>
              )}
            </>
          )}
        </form>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800">
          {currentPhase > 1 && (
            <button
              type="button"
              onClick={() => setCurrentPhase(currentPhase - 1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          {currentPhase < totalPhases && (
            <button
              type="button"
              onClick={() =>
                canGoToNextPhase() && setCurrentPhase(currentPhase + 1)
              }
              disabled={!canGoToNextPhase()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              Next
            </button>
          )}
          {currentPhase === totalPhases && (
            <button
              type="submit"
              onClick={(e) => handleCreate(e)}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
