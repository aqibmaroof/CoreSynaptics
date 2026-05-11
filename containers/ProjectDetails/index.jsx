"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  getCxProjectById,
  updateCxProject,
  updateCxProjectStatus,
  getCxProjectAssets,
  createCxProjectAsset,
  updateCxProjectAsset,
  deleteCxProjectAsset,
  getCxProjectZones,
  createCxProjectZone,
  updateCxProjectZone,
  deleteCxProjectZone,
  getCxProjectStakeholders,
  createCxProjectStakeholder,
  updateCxProjectStakeholder,
  deleteCxProjectStakeholder,
  createCxProjectCompliance,
  updateCxProjectCompliance,
  deleteCxProjectCompliance,
  getCxProjectMobilization,
  createCxProjectMobilizationItem,
  updateCxProjectMobilizationItem,
  deleteCxProjectMobilizationItem,
  getCxProjectWorkflows,
  createCxProjectWorkflow,
  updateCxProjectWorkflow,
  deleteCxProjectWorkflow,
  getCxProjectSops,
  createCxProjectSop,
  updateCxProjectSop,
  deleteCxProjectSop,
  getCxProjectPartners,
  createCxProjectPartner,
  updateCxProjectPartner,
  deleteCxProjectPartner,
  getCxProjectMembers,
  addCxProjectMember,
  removeCxProjectMember,
} from "@/services/CxProjects";

// ── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  "Overview",
  "Assets",
  "Zones",
  "Stakeholders",
  "Compliance",
  "Mobilization",
  "Workflows",
  "SOPs",
  "Partners",
  "Members",
];

const MOB_STEP_KEYS = [
  "mob_site",
  "mob_ppe",
  "mob_supplies",
  "mob_trailer",
  "mob_house",
  "mob_tools",
];

const STATUS_OPTIONS = ["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"];

const PROCUREMENT_STATUSES = [
  "NOT_ORDERED",
  "ORDERED",
  "IN_TRANSIT",
  "RECEIVED",
  "INSTALLED",
  "COMMISSIONED",
];

const ZONE_TYPES = ["PUBLIC", "CREW", "RESTRICTED", "SECURE"];
const STAKEHOLDER_TIERS = [
  "EXEC_SPONSOR",
  "DECISION_MAKER",
  "INFLUENCER",
  "KEEP_INFORMED",
];
const COMPLIANCE_TYPES = ["PERMIT", "INSURANCE", "WORKER_CERTIFICATION"];
const COMPLIANCE_STATUSES = ["VALID", "EXPIRING", "EXPIRED", "MISSING"];

// ── Helper components ─────────────────────────────────────────────────────────

function LoadingRows({ cols = 4 }) {
  return Array.from({ length: 3 }).map((_, i) => (
    <tr key={i}>
      {Array.from({ length: cols }).map((__, j) => (
        <td key={j} style={{ padding: "10px 12px" }}>
          <div
            style={{
              height: 14,
              borderRadius: 6,
              background: "var(--rf-bg2)",
              animation: "pulse 1.5s ease-in-out infinite",
              width: j === 0 ? "60%" : "80%",
            }}
          />
        </td>
      ))}
    </tr>
  ));
}

function EmptyState({ message = "No records found." }) {
  return (
    <div
      style={{
        padding: "40px 20px",
        textAlign: "center",
        color: "var(--rf-txt2)",
        fontSize: 14,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
      {message}
    </div>
  );
}

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div
      style={{
        background: "var(--rf-red-soft, #fee2e2)",
        color: "var(--crimson, #dc2626)",
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 13,
        marginBottom: 12,
      }}
    >
      {error}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE: {
      bg: "var(--emerald-soft, #d1fae5)",
      color: "var(--emerald, #059669)",
    },
    ON_HOLD: {
      bg: "var(--amber-soft, #fef3c7)",
      color: "var(--amber, #d97706)",
    },
    COMPLETED: {
      bg: "var(--electric-soft, #dbeafe)",
      color: "var(--electric, #2563eb)",
    },
    ARCHIVED: {
      bg: "var(--stone-dark, #f3f4f6)",
      color: "var(--smoke, #6b7280)",
    },
    VALID: {
      bg: "var(--emerald-soft, #d1fae5)",
      color: "var(--emerald, #059669)",
    },
    EXPIRING: {
      bg: "var(--amber-soft, #fef3c7)",
      color: "var(--amber, #d97706)",
    },
    EXPIRED: {
      bg: "var(--rf-red-soft, #fee2e2)",
      color: "var(--crimson, #dc2626)",
    },
    MISSING: {
      bg: "var(--stone-dark, #f3f4f6)",
      color: "var(--smoke, #6b7280)",
    },
  };
  const s = map[status] || map.ARCHIVED;
  return (
    <span
      style={{
        ...s,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        display: "inline-block",
      }}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function InfoGrid({ items }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 20,
      }}
    >
      {items.map(({ label, value }) => (
        <div
          key={label}
          style={{
            background: "var(--rf-bg2)",
            borderRadius: 10,
            padding: "12px 16px",
            border: "1px solid var(--rf-border)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--rf-txt2)",
              marginBottom: 4,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </div>
          <div
            style={{ fontSize: 14, color: "var(--rf-txt)", fontWeight: 500 }}
          >
            {value || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--rf-txt2)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 10,
        marginTop: 24,
      }}
    >
      {children}
    </div>
  );
}

function Table({ headers, children }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ background: "var(--rf-bg2)" }}>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 12px",
                  textAlign: "left",
                  color: "var(--rf-txt2)",
                  fontWeight: 600,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: "1px solid var(--rf-border)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Tr({ children, even }) {
  return (
    <tr
      style={{
        background: even ? "var(--rf-bg2)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {children}
    </tr>
  );
}

function Td({ children }) {
  return (
    <td
      style={{
        padding: "10px 12px",
        color: "var(--rf-txt)",
        borderBottom: "1px solid var(--rf-border)",
        verticalAlign: "middle",
      }}
    >
      {children}
    </td>
  );
}

function ActionBtn({ onClick, danger, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: danger ? "var(--rf-red-soft, #fee2e2)" : "var(--rf-bg2)",
        color: danger ? "var(--crimson, #dc2626)" : "var(--rf-txt)",
        border: "1px solid var(--rf-border)",
        borderRadius: 6,
        padding: "4px 10px",
        fontSize: 12,
        cursor: "pointer",
        marginLeft: 4,
      }}
    >
      {children}
    </button>
  );
}

const inputSt = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1.5px solid var(--rf-border)",
  background: "var(--rf-bg2)",
  color: "var(--rf-txt)",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.15s",
};

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "var(--rf-bg)",
          border: "1px solid var(--rf-border)",
          borderRadius: 16,
          minWidth: 480,
          maxWidth: "94vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 24px 16px",
            borderBottom: "1px solid var(--rf-border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            background: "var(--rf-bg2)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--rf-txt)",
                lineHeight: 1.3,
              }}
            >
              {title}
            </div>
            {subtitle && (
              <div
                style={{ fontSize: 12, color: "var(--rf-txt2)", marginTop: 3 }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--rf-bg)",
              border: "1px solid var(--rf-border)",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--rf-txt2)",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ModalFooter({ onClose, onSave, saveLabel = "Save", saving }) {
  return (
    <div
      style={{
        padding: "34px 0px 20px 0px",
        // borderTop: "1px solid var(--rf-border)",
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        // background: "var(--rf-bg2)",
      }}
    >
      <button
        onClick={onClose}
        style={{
          padding: "9px 20px",
          borderRadius: 8,
          border: "1.5px solid var(--rf-border)",
          background: "transparent",
          color: "var(--rf-txt2)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Cancel
      </button>
      <button
        onClick={onSave}
        disabled={saving}
        style={{
          padding: "9px 22px",
          borderRadius: 8,
          border: "none",
          background: "var(--rf-accent, var(--electric, #3b82f6))",
          color: "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.65 : 1,
          fontFamily: "inherit",
        }}
      >
        {saving ? "Saving…" : saveLabel}
      </button>
    </div>
  );
}

function FormGrid({ cols = 2, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "14px 20px",
      }}
    >
      {children}
    </div>
  );
}

function FormField({ label, required, hint, full, children }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined, marginBottom: 0 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt2)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--crimson, #dc2626)", marginLeft: 3 }}>
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: "var(--rf-txt2)", marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProjectDetails() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id;

  const [activeTab, setActiveTab] = useState("Overview");
  const [toast, setToast] = useState({ type: "", text: "" });

  // Overview
  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const [editingProject, setEditingProject] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Assets
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsError, setAssetsError] = useState(null);
  const [assetsFetched, setAssetsFetched] = useState(false);
  const [assetModal, setAssetModal] = useState(null); // null | 'add' | row
  const [assetForm, setAssetForm] = useState({});

  // Zones
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [zonesError, setZonesError] = useState(null);
  const [zonesFetched, setZonesFetched] = useState(false);
  const [zoneModal, setZoneModal] = useState(null);
  const [zoneForm, setZoneForm] = useState({});

  // Stakeholders
  const [stakeholders, setStakeholders] = useState([]);
  const [stakeholdersLoading, setStakeholdersLoading] = useState(false);
  const [stakeholdersError, setStakeholdersError] = useState(null);
  const [stakeholdersFetched, setStakeholdersFetched] = useState(false);
  const [stakeholderModal, setStakeholderModal] = useState(null);
  const [stakeholderForm, setStakeholderForm] = useState({});

  // Compliance
  const [compliance, setCompliance] = useState([]);
  const [complianceLoading, setComplianceLoading] = useState(false);
  const [complianceError, setComplianceError] = useState(null);
  const [complianceFetched, setComplianceFetched] = useState(false);
  const [complianceModal, setComplianceModal] = useState(null);
  const [complianceForm, setComplianceForm] = useState({});

  // Mobilization
  const [mobilization, setMobilization] = useState([]);
  const [mobilizationLoading, setMobilizationLoading] = useState(false);
  const [mobilizationError, setMobilizationError] = useState(null);
  const [mobilizationFetched, setMobilizationFetched] = useState(false);
  const [mobStepFilter, setMobStepFilter] = useState("");
  const [mobModal, setMobModal] = useState(null);
  const [mobForm, setMobForm] = useState({});

  // Workflows
  const [workflows, setWorkflows] = useState([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [workflowsError, setWorkflowsError] = useState(null);
  const [workflowsFetched, setWorkflowsFetched] = useState(false);
  const [workflowModal, setWorkflowModal] = useState(null);
  const [workflowForm, setWorkflowForm] = useState({});

  // SOPs
  const [sops, setSops] = useState([]);
  const [sopsLoading, setSopsLoading] = useState(false);
  const [sopsError, setSopsError] = useState(null);
  const [sopsFetched, setSopsFetched] = useState(false);
  const [sopModal, setSopModal] = useState(null);
  const [sopForm, setSopForm] = useState({});

  // Partners
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState(null);
  const [partnersFetched, setPartnersFetched] = useState(false);
  const [partnerModal, setPartnerModal] = useState(null);
  const [partnerForm, setPartnerForm] = useState({});

  // Members
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState(null);
  const [membersFetched, setMembersFetched] = useState(false);
  const [memberModal, setMemberModal] = useState(null);
  const [memberForm, setMemberForm] = useState({});

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast({ type: "", text: "" }), 4000);
  };

  // ── Load project overview on mount ───────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setProjectLoading(true);
    setProjectError(null);
    try {
      const res = await getCxProjectById(projectId);
      setProject(res);
      setEditForm({
        projectName: res.projectName || "",
        customer: res.customer || "",
        contractNumber: res.contractNumber || "",
        siteAddress: res.siteAddress || "",
        startDate: res.startDate || "",
        projectType: res.projectType || "",
      });
    } catch (e) {
      setProjectError(e?.message || "Failed to load project.");
    } finally {
      setProjectLoading(false);
    }
  };

  // ── Tab-activated lazy loaders ────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    if (activeTab === "Assets" && !assetsFetched) loadAssets();
    if (activeTab === "Zones" && !zonesFetched) loadZones();
    if (activeTab === "Stakeholders" && !stakeholdersFetched)
      loadStakeholders();
    if (activeTab === "Compliance" && !complianceFetched) loadCompliance();
    if (activeTab === "Mobilization" && !mobilizationFetched)
      loadMobilization();
    if (activeTab === "Workflows" && !workflowsFetched) loadWorkflows();
    if (activeTab === "SOPs" && !sopsFetched) loadSops();
    if (activeTab === "Partners" && !partnersFetched) loadPartners();
    if (activeTab === "Members" && !membersFetched) loadMembers();
  }, [activeTab, projectId]);

  const loadAssets = async () => {
    setAssetsLoading(true);
    setAssetsError(null);
    try {
      const res = await getCxProjectAssets(projectId);
      setAssets(res.data || res || []);
      setAssetsFetched(true);
    } catch (e) {
      setAssetsError(e?.message || "Failed to load assets.");
    } finally {
      setAssetsLoading(false);
    }
  };

  const loadZones = async () => {
    setZonesLoading(true);
    setZonesError(null);
    try {
      const res = await getCxProjectZones(projectId);
      setZones(res.data || res || []);
      setZonesFetched(true);
    } catch (e) {
      setZonesError(e?.message || "Failed to load zones.");
    } finally {
      setZonesLoading(false);
    }
  };

  const loadStakeholders = async () => {
    setStakeholdersLoading(true);
    setStakeholdersError(null);
    try {
      const res = await getCxProjectStakeholders(projectId);
      setStakeholders(res.data || res || []);
      setStakeholdersFetched(true);
    } catch (e) {
      setStakeholdersError(e?.message || "Failed to load stakeholders.");
    } finally {
      setStakeholdersLoading(false);
    }
  };

  const loadCompliance = async () => {
    setComplianceLoading(true);
    setComplianceError(null);
    try {
      const p = await getCxProjectById(projectId);
      setCompliance(p.compliance || []);
      setComplianceFetched(true);
    } catch (e) {
      setComplianceError(e?.message || "Failed to load compliance.");
    } finally {
      setComplianceLoading(false);
    }
  };

  const loadMobilization = async (stepKey = "") => {
    setMobilizationLoading(true);
    setMobilizationError(null);
    try {
      const params = stepKey ? { stepKey } : {};
      const res = await getCxProjectMobilization(projectId, params);
      setMobilization(res.data || res || []);
      setMobilizationFetched(true);
    } catch (e) {
      setMobilizationError(e?.message || "Failed to load mobilization.");
    } finally {
      setMobilizationLoading(false);
    }
  };

  const loadWorkflows = async () => {
    setWorkflowsLoading(true);
    setWorkflowsError(null);
    try {
      const res = await getCxProjectWorkflows(projectId);
      setWorkflows(Array.isArray(res) ? res : res.data || []);
      setWorkflowsFetched(true);
    } catch (e) {
      setWorkflowsError(e?.message || "Failed to load workflows.");
    } finally {
      setWorkflowsLoading(false);
    }
  };

  const loadSops = async () => {
    setSopsLoading(true);
    setSopsError(null);
    try {
      const res = await getCxProjectSops(projectId);
      setSops(Array.isArray(res) ? res : res.data || []);
      setSopsFetched(true);
    } catch (e) {
      setSopsError(e?.message || "Failed to load SOPs.");
    } finally {
      setSopsLoading(false);
    }
  };

  const loadPartners = async () => {
    setPartnersLoading(true);
    setPartnersError(null);
    try {
      const res = await getCxProjectPartners(projectId);
      setPartners(Array.isArray(res) ? res : res.data || []);
      setPartnersFetched(true);
    } catch (e) {
      setPartnersError(e?.message || "Failed to load partners.");
    } finally {
      setPartnersLoading(false);
    }
  };

  const loadMembers = async () => {
    setMembersLoading(true);
    setMembersError(null);
    try {
      const res = await getCxProjectMembers(projectId);
      setMembers(Array.isArray(res) ? res : res.data || []);
      setMembersFetched(true);
    } catch (e) {
      setMembersError(e?.message || "Failed to load members.");
    } finally {
      setMembersLoading(false);
    }
  };

  // ── Mobilization filter ───────────────────────────────────────────────────
  const handleMobFilter = (key) => {
    const next = mobStepFilter === key ? "" : key;
    setMobStepFilter(next);
    setMobilizationFetched(false);
    loadMobilization(next);
  };

  // ── Overview save ─────────────────────────────────────────────────────────
  const saveProject = async () => {
    try {
      await updateCxProject(projectId, editForm);
      await loadProject();
      setEditingProject(false);
      showToast("success", "Project updated.");
    } catch (e) {
      showToast("error", e?.message || "Failed to update project.");
    }
  };

  const changeStatus = async (status) => {
    try {
      await updateCxProjectStatus(projectId, status);
      await loadProject();
      showToast("success", `Status changed to ${status}.`);
    } catch (e) {
      showToast("error", e?.message || "Failed to change status.");
    }
  };

  // ── CRUD helpers (generic pattern) ───────────────────────────────────────
  const handleDeleteConfirm = (label, onConfirm) => {
    if (window.confirm(`Delete this ${label}?`)) onConfirm();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const tabBarStyle = {
    display: "flex",
    gap: 6,
    overflowX: "auto",
    padding: "0 0 12px 0",
    marginBottom: 20,
    borderBottom: "1px solid var(--rf-border)",
  };

  const tabStyle = (active) => ({
    padding: "7px 16px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
    border: "none",
    background: active ? "var(--rf-accent, var(--electric))" : "var(--rf-bg2)",
    color: active ? "#fff" : "var(--rf-txt2)",
    whiteSpace: "nowrap",
    transition: "all 0.15s",
  });

  const containerStyle = {
    padding: "28px 32px",
    background: "var(--rf-bg)",
    minHeight: "100vh",
    color: "var(--rf-txt)",
    fontFamily: "var(--wfont, sans-serif)",
  };

  const cardStyle = {
    background: "var(--rf-bg2)",
    border: "1px solid var(--rf-border)",
    borderRadius: 12,
    padding: "20px 24px",
    marginBottom: 20,
  };

  return (
    <div style={containerStyle}>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border)",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            color: "var(--rf-txt2)",
            fontSize: 13,
          }}
        >
          ← Back
        </button>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            color: "var(--rf-txt)",
          }}
        >
          {project?.projectName || "Project Details"}
        </h1>
        {project?.status && <StatusBadge status={project.status} />}
      </div>

      {/* Toast */}
      {toast.text && (
        <div
          style={{
            background:
              toast.type === "success"
                ? "var(--emerald-soft, #d1fae5)"
                : "var(--rf-red-soft, #fee2e2)",
            color:
              toast.type === "success"
                ? "var(--emerald, #059669)"
                : "var(--crimson, #dc2626)",
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {toast.text}
        </div>
      )}

      {/* Tab bar */}
      <div style={tabBarStyle}>
        {TABS.map((tab) => (
          <button
            key={tab}
            style={tabStyle(activeTab === tab)}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      {activeTab === "Overview" && (
        <div>
          {projectError && <ErrorBanner error={projectError} />}
          {projectLoading ? (
            <div style={{ color: "var(--rf-txt2)", fontSize: 14 }}>
              Loading project…
            </div>
          ) : project ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 20,
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <button
                  className="btn rf-btn rf-btn-primary"
                  onClick={() => setEditingProject(!editingProject)}
                >
                  {editingProject ? "Cancel" : "Update Project"}
                </button>
                <div className="flex items-center justify-end gap-4">
                  <p>Change Project Status</p>
                  <select
                    className="input input-select input-field"
                    style={{ width: "auto", padding: "6px 12px" }}
                    value={project.status}
                    onChange={(e) => changeStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingProject ? (
                <div style={{ ...cardStyle, marginBottom: 20 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      marginBottom: 16,
                      fontSize: 15,
                      color: "var(--rf-txt)",
                    }}
                  >
                    Edit Project Details
                  </div>
                  <FormGrid cols={2}>
                    {[
                      {
                        key: "projectName",
                        label: "Project Name",
                        required: true,
                      },
                      {
                        key: "customer",
                        label: "Customer / Client",
                        required: true,
                      },
                      { key: "contractNumber", label: "Contract Number" },
                      { key: "siteAddress", label: "Site Address" },
                      { key: "startDate", label: "Start Date", type: "date" },
                      { key: "projectType", label: "Project Type" },
                    ].map(({ key, label, type, required }) => (
                      <FormField key={key} label={label} required={required}>
                        <input
                          style={inputSt}
                          type={type || "text"}
                          value={editForm[key] || ""}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      </FormField>
                    ))}
                  </FormGrid>
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button
                      onClick={saveProject}
                      style={{
                        padding: "9px 22px",
                        borderRadius: 8,
                        border: "none",
                        background:
                          "var(--rf-accent, var(--electric, #3b82f6))",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingProject(false)}
                      style={{
                        padding: "9px 20px",
                        borderRadius: 8,
                        border: "1.5px solid var(--rf-border)",
                        background: "transparent",
                        color: "var(--rf-txt2)",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <SectionTitle>Project Info</SectionTitle>
              <InfoGrid
                items={[
                  { label: "Project Name", value: project.projectName },
                  { label: "Customer", value: project.customer },
                  { label: "Contract #", value: project.contractNumber },
                  { label: "Site Address", value: project.siteAddress },
                  {
                    label: "Start Date",
                    value: project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : null,
                  },
                  { label: "Project Type", value: project.projectType },
                  { label: "Status", value: project.status },
                ]}
              />

              {project.schedule && (
                <>
                  <SectionTitle>Schedule</SectionTitle>
                  <InfoGrid
                    items={[
                      { label: "Crew Size", value: project.schedule.crewSize },
                      {
                        label: "Duration (days)",
                        value: project.schedule.duration,
                      },
                      {
                        label: "Trailers",
                        value: project.schedule.trailerCount,
                      },
                      {
                        label: "Data Halls",
                        value: project.schedule.numDataHalls,
                      },
                      {
                        label: "Forecast Window",
                        value: project.schedule.forecastWindow,
                      },
                    ]}
                  />
                  {project.schedule.phases?.length > 0 && (
                    <>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          marginBottom: 8,
                          color: "var(--rf-txt2)",
                        }}
                      >
                        Phases
                      </div>
                      <Table headers={["Phase", "Start", "End"]}>
                        {project.schedule.phases.map((ph, i) => (
                          <Tr key={i} even={i % 2 === 0}>
                            <Td>{ph.name}</Td>
                            <Td>
                              {ph.startDate
                                ? new Date(ph.startDate).toLocaleDateString()
                                : "—"}
                            </Td>
                            <Td>
                              {ph.endDate
                                ? new Date(ph.endDate).toLocaleDateString()
                                : "—"}
                            </Td>
                          </Tr>
                        ))}
                      </Table>
                    </>
                  )}
                  {project.schedule.milestones?.length > 0 && (
                    <>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          margin: "16px 0 8px",
                          color: "var(--rf-txt2)",
                        }}
                      >
                        Milestones
                      </div>
                      <Table
                        headers={["Milestone", "Date", "Type", "Critical"]}
                      >
                        {project.schedule.milestones.map((m, i) => (
                          <Tr key={i} even={i % 2 === 0}>
                            <Td>{m.name}</Td>
                            <Td>
                              {m.date
                                ? new Date(m.date).toLocaleDateString()
                                : "—"}
                            </Td>
                            <Td>{m.type}</Td>
                            <Td>{m.critical ? "Yes" : "No"}</Td>
                          </Tr>
                        ))}
                      </Table>
                    </>
                  )}
                </>
              )}

              {project.financials && (
                <>
                  <SectionTitle>Financials</SectionTitle>
                  <InfoGrid
                    items={[
                      {
                        label: "Contract Value",
                        value:
                          project.financials.contractValue != null
                            ? `$${project.financials.contractValue.toLocaleString()}`
                            : null,
                      },
                      {
                        label: "Labor Budget",
                        value:
                          project.financials.laborBudget != null
                            ? `$${project.financials.laborBudget.toLocaleString()}`
                            : null,
                      },
                      {
                        label: "Equipment Budget",
                        value:
                          project.financials.equipmentBudget != null
                            ? `$${project.financials.equipmentBudget.toLocaleString()}`
                            : null,
                      },
                      {
                        label: "Retainage",
                        value:
                          project.financials.retainage != null
                            ? `${project.financials.retainage}%`
                            : null,
                      },
                      {
                        label: "Payment Terms",
                        value: project.financials.paymentTerms,
                      },
                    ]}
                  />
                </>
              )}

              {project.safetyPlan && (
                <>
                  <SectionTitle>Safety Plan</SectionTitle>
                  <InfoGrid
                    items={[
                      {
                        label: "Safety Manager",
                        value: project.safetyPlan.safetyManager,
                      },
                      {
                        label: "PPE Required",
                        value: project.safetyPlan.ppeRequired,
                      },
                      {
                        label: "OSHA 30 Required",
                        value:
                          project.safetyPlan.osha30Required != null
                            ? project.safetyPlan.osha30Required
                              ? "Yes"
                              : "No"
                            : null,
                      },
                      {
                        label: "OSHA 10 Required",
                        value:
                          project.safetyPlan.osha10Required != null
                            ? project.safetyPlan.osha10Required
                              ? "Yes"
                              : "No"
                            : null,
                      },
                    ]}
                  />
                </>
              )}
            </>
          ) : null}
        </div>
      )}

      {/* ── ASSETS ────────────────────────────────────────────────────────── */}
      {activeTab === "Assets" && (
        <div>
          <ErrorBanner error={assetsError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Assets</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setAssetForm({
                  procurementStatus: "NOT_ORDERED",
                  procurementOwner: "OFCI",
                });
                setAssetModal("add");
              }}
            >
              + Add Asset
            </button>
          </div>
          <Table
            headers={[
              "Abbr",
              "Name",
              "Type",
              "Qty",
              "Owner",
              "Procurement Status",
              "Actions",
            ]}
          >
            {assetsLoading ? (
              <LoadingRows cols={7} />
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState message="No assets yet." />
                </td>
              </tr>
            ) : (
              assets.map((a, i) => (
                <Tr key={a.id} even={i % 2 === 0}>
                  <Td>
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono, monospace)",
                        fontSize: 12,
                      }}
                    >
                      {a.abbr}
                    </span>
                  </Td>
                  <Td>{a.name}</Td>
                  <Td>{a.assetType}</Td>
                  <Td>{a.quantity}</Td>
                  <Td>{a.procurementOwner}</Td>
                  <Td>
                    <StatusBadge status={a.procurementStatus} />
                  </Td>
                  <Td>
                    <ActionBtn
                      onClick={() => {
                        setAssetForm({ ...a });
                        setAssetModal(a);
                      }}
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("asset", async () => {
                          try {
                            await deleteCxProjectAsset(projectId, a.id);
                            setAssets((prev) =>
                              prev.filter((x) => x.id !== a.id),
                            );
                            showToast("success", "Asset deleted.");
                          } catch (e) {
                            showToast("error", e?.message || "Delete failed.");
                          }
                        })
                      }
                    >
                      Delete
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {assetModal &&
            (() => {
              const saveAsset = async () => {
                try {
                  if (assetModal === "add") {
                    const created = await createCxProjectAsset(
                      projectId,
                      assetForm,
                    );
                    setAssets((p) => [...p, created]);
                  } else {
                    const updated = await updateCxProjectAsset(
                      projectId,
                      assetModal.id,
                      assetForm,
                    );
                    setAssets((p) =>
                      p.map((x) => (x.id === assetModal.id ? updated : x)),
                    );
                  }
                  setAssetModal(null);
                  showToast("success", "Asset saved.");
                } catch (e) {
                  showToast("error", e?.message || "Save failed.");
                }
              };
              return (
                <Modal
                  title={assetModal === "add" ? "Add Asset" : "Edit Asset"}
                  subtitle="Define the asset details and procurement tracking."
                  onClose={() => setAssetModal(null)}
                >
                  <FormGrid cols={2}>
                    <FormField label="Abbreviation" required>
                      <input
                        style={inputSt}
                        placeholder="e.g. UPS-01"
                        value={assetForm.abbr || ""}
                        onChange={(e) =>
                          setAssetForm((p) => ({ ...p, abbr: e.target.value }))
                        }
                      />
                    </FormField>
                    <FormField label="Asset Name" required>
                      <input
                        style={inputSt}
                        placeholder="e.g. Uninterruptible Power Supply"
                        value={assetForm.name || ""}
                        onChange={(e) =>
                          setAssetForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </FormField>
                    <FormField label="Asset Type" required>
                      <input
                        style={inputSt}
                        placeholder="e.g. UPS, BATTERY, PDU"
                        value={assetForm.assetType || ""}
                        onChange={(e) =>
                          setAssetForm((p) => ({
                            ...p,
                            assetType: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Quantity" required>
                      <input
                        style={inputSt}
                        type="number"
                        min={1}
                        placeholder="1"
                        value={assetForm.quantity || ""}
                        onChange={(e) =>
                          setAssetForm((p) => ({
                            ...p,
                            quantity: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Procurement Owner" required>
                      <select
                        style={inputSt}
                        value={assetForm.procurementOwner || "OFCI"}
                        onChange={(e) =>
                          setAssetForm((p) => ({
                            ...p,
                            procurementOwner: e.target.value,
                          }))
                        }
                      >
                        <option value="OFCI">
                          OFCI — Owner Furnished, Contractor Installed
                        </option>
                        <option value="CFCI">
                          CFCI — Contractor Furnished, Contractor Installed
                        </option>
                      </select>
                    </FormField>
                    <FormField label="Procurement Status">
                      <select
                        style={inputSt}
                        value={assetForm.procurementStatus || "NOT_ORDERED"}
                        onChange={(e) =>
                          setAssetForm((p) => ({
                            ...p,
                            procurementStatus: e.target.value,
                          }))
                        }
                      >
                        {PROCUREMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setAssetModal(null)}
                    onSave={saveAsset}
                    saveLabel={
                      assetModal === "add" ? "Create Asset" : "Save Changes"
                    }
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── ZONES ─────────────────────────────────────────────────────────── */}
      {activeTab === "Zones" && (
        <div>
          <ErrorBanner error={zonesError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Zones</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setZoneForm({ zoneType: "PUBLIC" });
                setZoneModal("add");
              }}
            >
              + Add Zone
            </button>
          </div>
          <Table
            headers={["Name", "Zone Type", "Access Requirements", "Actions"]}
          >
            {zonesLoading ? (
              <LoadingRows cols={4} />
            ) : zones.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState message="No zones yet." />
                </td>
              </tr>
            ) : (
              zones.map((z, i) => (
                <Tr key={z.id} even={i % 2 === 0}>
                  <Td>{z.name}</Td>
                  <Td>
                    <StatusBadge status={z.zoneType} />
                  </Td>
                  <Td>{z.accessRequirements || "—"}</Td>
                  <Td>
                    <ActionBtn
                      onClick={() => {
                        setZoneForm({ ...z });
                        setZoneModal(z);
                      }}
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("zone", async () => {
                          try {
                            await deleteCxProjectZone(projectId, z.id);
                            setZones((p) => p.filter((x) => x.id !== z.id));
                            showToast("success", "Zone deleted.");
                          } catch (e) {
                            showToast("error", e?.message || "Delete failed.");
                          }
                        })
                      }
                    >
                      Delete
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {zoneModal &&
            (() => {
              const saveZone = async () => {
                try {
                  if (zoneModal === "add") {
                    const created = await createCxProjectZone(
                      projectId,
                      zoneForm,
                    );
                    setZones((p) => [...p, created]);
                  } else {
                    const updated = await updateCxProjectZone(
                      projectId,
                      zoneModal.id,
                      zoneForm,
                    );
                    setZones((p) =>
                      p.map((x) => (x.id === zoneModal.id ? updated : x)),
                    );
                  }
                  setZoneModal(null);
                  showToast("success", "Zone saved.");
                } catch (e) {
                  showToast("error", e?.message || "Save failed.");
                }
              };
              return (
                <Modal
                  title={zoneModal === "add" ? "Add Zone" : "Edit Zone"}
                  subtitle="Define a physical or logical zone and its access requirements."
                  onClose={() => setZoneModal(null)}
                >
                  <FormGrid cols={2}>
                    <FormField label="Zone Name" required>
                      <input
                        style={inputSt}
                        placeholder="e.g. Data Hall A"
                        value={zoneForm.name || ""}
                        onChange={(e) =>
                          setZoneForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </FormField>
                    <FormField label="Zone Type" required>
                      <select
                        style={inputSt}
                        value={zoneForm.zoneType || "PUBLIC"}
                        onChange={(e) =>
                          setZoneForm((p) => ({
                            ...p,
                            zoneType: e.target.value,
                          }))
                        }
                      >
                        {ZONE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Access Requirements" full>
                      <input
                        style={inputSt}
                        placeholder="e.g. Badge required, escort required for visitors"
                        value={zoneForm.accessRequirements || ""}
                        onChange={(e) =>
                          setZoneForm((p) => ({
                            ...p,
                            accessRequirements: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setZoneModal(null)}
                    onSave={saveZone}
                    saveLabel={
                      zoneModal === "add" ? "Create Zone" : "Save Changes"
                    }
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── STAKEHOLDERS ──────────────────────────────────────────────────── */}
      {activeTab === "Stakeholders" && (
        <div>
          <ErrorBanner error={stakeholdersError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Stakeholders</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setStakeholderForm({ tier: "KEEP_INFORMED" });
                setStakeholderModal("add");
              }}
            >
              + Add Stakeholder
            </button>
          </div>
          <Table headers={["Name", "Tier", "Role", "Company", "Actions"]}>
            {stakeholdersLoading ? (
              <LoadingRows cols={5} />
            ) : stakeholders.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No stakeholders yet." />
                </td>
              </tr>
            ) : (
              stakeholders.map((s, i) => (
                <Tr key={s.id} even={i % 2 === 0}>
                  <Td>{s.name}</Td>
                  <Td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--electric, #2563eb)",
                      }}
                    >
                      {s.tier?.replace(/_/g, " ")}
                    </span>
                  </Td>
                  <Td>{s.role || "—"}</Td>
                  <Td>{s.company || "—"}</Td>
                  <Td>
                    <ActionBtn
                      onClick={() => {
                        setStakeholderForm({ ...s });
                        setStakeholderModal(s);
                      }}
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("stakeholder", async () => {
                          try {
                            await deleteCxProjectStakeholder(projectId, s.id);
                            setStakeholders((p) =>
                              p.filter((x) => x.id !== s.id),
                            );
                            showToast("success", "Stakeholder deleted.");
                          } catch (e) {
                            showToast("error", e?.message || "Delete failed.");
                          }
                        })
                      }
                    >
                      Delete
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {stakeholderModal &&
            (() => {
              const saveStakeholder = async () => {
                try {
                  if (stakeholderModal === "add") {
                    const created = await createCxProjectStakeholder(
                      projectId,
                      stakeholderForm,
                    );
                    setStakeholders((p) => [...p, created]);
                  } else {
                    const updated = await updateCxProjectStakeholder(
                      projectId,
                      stakeholderModal.id,
                      stakeholderForm,
                    );
                    setStakeholders((p) =>
                      p.map((x) =>
                        x.id === stakeholderModal.id ? updated : x,
                      ),
                    );
                  }
                  setStakeholderModal(null);
                  showToast("success", "Stakeholder saved.");
                } catch (e) {
                  showToast("error", e?.message || "Save failed.");
                }
              };
              return (
                <Modal
                  title={
                    stakeholderModal === "add"
                      ? "Add Stakeholder"
                      : "Edit Stakeholder"
                  }
                  subtitle="Track key stakeholders and their engagement tier."
                  onClose={() => setStakeholderModal(null)}
                >
                  <FormGrid cols={2}>
                    <FormField label="Full Name" required>
                      <input
                        style={inputSt}
                        placeholder="e.g. Jane Smith"
                        value={stakeholderForm.name || ""}
                        onChange={(e) =>
                          setStakeholderForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Engagement Tier" required>
                      <select
                        style={inputSt}
                        value={stakeholderForm.tier || "KEEP_INFORMED"}
                        onChange={(e) =>
                          setStakeholderForm((p) => ({
                            ...p,
                            tier: e.target.value,
                          }))
                        }
                      >
                        {STAKEHOLDER_TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Role / Title">
                      <input
                        style={inputSt}
                        placeholder="e.g. VP of Engineering"
                        value={stakeholderForm.role || ""}
                        onChange={(e) =>
                          setStakeholderForm((p) => ({
                            ...p,
                            role: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Company">
                      <input
                        style={inputSt}
                        placeholder="e.g. Acme Corp"
                        value={stakeholderForm.company || ""}
                        onChange={(e) =>
                          setStakeholderForm((p) => ({
                            ...p,
                            company: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setStakeholderModal(null)}
                    onSave={saveStakeholder}
                    saveLabel={
                      stakeholderModal === "add"
                        ? "Add Stakeholder"
                        : "Save Changes"
                    }
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── COMPLIANCE ────────────────────────────────────────────────────── */}
      {activeTab === "Compliance" && (
        <div>
          <ErrorBanner error={complianceError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Compliance</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setComplianceForm({ recordType: "PERMIT", status: "VALID" });
                setComplianceModal("add");
              }}
            >
              + Add Record
            </button>
          </div>
          <Table
            headers={[
              "Name",
              "Type",
              "Issuer",
              "Status",
              "Issued",
              "Expires",
              "Actions",
            ]}
          >
            {complianceLoading ? (
              <LoadingRows cols={7} />
            ) : compliance.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState message="No compliance records yet." />
                </td>
              </tr>
            ) : (
              compliance.map((c, i) => (
                <Tr key={c.id} even={i % 2 === 0}>
                  <Td>{c.name}</Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>
                      {c.recordType?.replace(/_/g, " ")}
                    </span>
                  </Td>
                  <Td>{c.issuer || "—"}</Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td>
                    {c.issuedAt
                      ? new Date(c.issuedAt).toLocaleDateString()
                      : "—"}
                  </Td>
                  <Td>
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString()
                      : "—"}
                  </Td>
                  <Td>
                    <ActionBtn
                      onClick={() => {
                        setComplianceForm({ ...c });
                        setComplianceModal(c);
                      }}
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("compliance record", async () => {
                          try {
                            await deleteCxProjectCompliance(projectId, c.id);
                            setCompliance((p) =>
                              p.filter((x) => x.id !== c.id),
                            );
                            showToast("success", "Compliance record deleted.");
                          } catch (e) {
                            showToast("error", e?.message || "Delete failed.");
                          }
                        })
                      }
                    >
                      Delete
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {complianceModal &&
            (() => {
              const saveCompliance = async () => {
                try {
                  if (complianceModal === "add") {
                    const created = await createCxProjectCompliance(
                      projectId,
                      complianceForm,
                    );
                    setCompliance((p) => [...p, created]);
                  } else {
                    const updated = await updateCxProjectCompliance(
                      projectId,
                      complianceModal.id,
                      complianceForm,
                    );
                    setCompliance((p) =>
                      p.map((x) => (x.id === complianceModal.id ? updated : x)),
                    );
                  }
                  setComplianceModal(null);
                  showToast("success", "Compliance record saved.");
                } catch (e) {
                  showToast("error", e?.message || "Save failed.");
                }
              };
              return (
                <Modal
                  title={
                    complianceModal === "add"
                      ? "Add Compliance Record"
                      : "Edit Compliance Record"
                  }
                  subtitle="Track permits, insurance, and worker certifications."
                  onClose={() => setComplianceModal(null)}
                >
                  <FormGrid cols={2}>
                    <FormField label="Record Name" required>
                      <input
                        style={inputSt}
                        placeholder="e.g. Electrical Permit #EP-2024"
                        value={complianceForm.name || ""}
                        onChange={(e) =>
                          setComplianceForm((p) => ({
                            ...p,
                            name: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Record Type" required>
                      <select
                        style={inputSt}
                        value={complianceForm.recordType || "PERMIT"}
                        onChange={(e) =>
                          setComplianceForm((p) => ({
                            ...p,
                            recordType: e.target.value,
                          }))
                        }
                      >
                        {COMPLIANCE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Issuing Authority">
                      <input
                        style={inputSt}
                        placeholder="e.g. City of Austin, OSHA"
                        value={complianceForm.issuer || ""}
                        onChange={(e) =>
                          setComplianceForm((p) => ({
                            ...p,
                            issuer: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Status">
                      <select
                        style={inputSt}
                        value={complianceForm.status || "VALID"}
                        onChange={(e) =>
                          setComplianceForm((p) => ({
                            ...p,
                            status: e.target.value,
                          }))
                        }
                      >
                        {COMPLIANCE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Issue Date">
                      <input
                        style={inputSt}
                        type="date"
                        value={
                          complianceForm.issuedAt
                            ? complianceForm.issuedAt.slice(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          setComplianceForm((p) => ({
                            ...p,
                            issuedAt: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Expiry Date">
                      <input
                        style={inputSt}
                        type="date"
                        value={
                          complianceForm.expiresAt
                            ? complianceForm.expiresAt.slice(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          setComplianceForm((p) => ({
                            ...p,
                            expiresAt: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Coverage Details" full>
                      <input
                        style={inputSt}
                        placeholder="e.g. General liability $2M, Workers comp"
                        value={complianceForm.coverage || ""}
                        onChange={(e) =>
                          setComplianceForm((p) => ({
                            ...p,
                            coverage: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setComplianceModal(null)}
                    onSave={saveCompliance}
                    saveLabel={
                      complianceModal === "add" ? "Add Record" : "Save Changes"
                    }
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── MOBILIZATION ──────────────────────────────────────────────────── */}
      {activeTab === "Mobilization" && (
        <div>
          <ErrorBanner error={mobilizationError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Mobilization</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setMobForm({
                  stepKey: mobStepFilter || "mob_site",
                  quantity: 1,
                  unitCost: 0,
                });
                setMobModal("add");
              }}
            >
              + Add Item
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <button
              style={{
                padding: "5px 14px",
                borderRadius: 20,
                fontSize: 12,
                border: "1px solid var(--rf-border)",
                cursor: "pointer",
                background: !mobStepFilter
                  ? "var(--rf-accent, var(--electric))"
                  : "var(--rf-bg2)",
                color: !mobStepFilter ? "#fff" : "var(--rf-txt2)",
              }}
              onClick={() => {
                setMobStepFilter("");
                setMobilizationFetched(false);
                loadMobilization("");
              }}
            >
              All
            </button>
            {MOB_STEP_KEYS.map((k) => (
              <button
                key={k}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  border: "1px solid var(--rf-border)",
                  cursor: "pointer",
                  background:
                    mobStepFilter === k
                      ? "var(--rf-accent, var(--electric))"
                      : "var(--rf-bg2)",
                  color: mobStepFilter === k ? "#fff" : "var(--rf-txt2)",
                }}
                onClick={() => handleMobFilter(k)}
              >
                {k.replace("mob_", "")}
              </button>
            ))}
          </div>
          <Table
            headers={[
              "Name",
              "Category",
              "Step",
              "Qty",
              "Unit Cost",
              "Vendor",
              "RFQ",
              "Delivery",
              "Actions",
            ]}
          >
            {mobilizationLoading ? (
              <LoadingRows cols={9} />
            ) : mobilization.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState message="No mobilization items." />
                </td>
              </tr>
            ) : (
              mobilization.map((m, i) => (
                <Tr key={m.id} even={i % 2 === 0}>
                  <Td>{m.name}</Td>
                  <Td>{m.category}</Td>
                  <Td>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "var(--electric)",
                      }}
                    >
                      {m.stepKey}
                    </span>
                  </Td>
                  <Td>{m.quantity}</Td>
                  <Td>${(m.unitCost || 0).toLocaleString()}</Td>
                  <Td>{m.vendor || "—"}</Td>
                  <Td>{m.rfqStatus || "—"}</Td>
                  <Td>
                    {m.deliveryDate
                      ? new Date(m.deliveryDate).toLocaleDateString()
                      : "—"}
                  </Td>
                  <Td>
                    <ActionBtn
                      onClick={() => {
                        setMobForm({ ...m });
                        setMobModal(m);
                      }}
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("mobilization item", async () => {
                          try {
                            await deleteCxProjectMobilizationItem(
                              projectId,
                              m.id,
                            );
                            setMobilization((p) =>
                              p.filter((x) => x.id !== m.id),
                            );
                            showToast("success", "Item deleted.");
                          } catch (e) {
                            showToast("error", e?.message || "Delete failed.");
                          }
                        })
                      }
                    >
                      Delete
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {mobModal &&
            (() => {
              const saveMob = async () => {
                try {
                  if (mobModal === "add") {
                    const created = await createCxProjectMobilizationItem(
                      projectId,
                      mobForm,
                    );
                    setMobilization((p) => [...p, created]);
                  } else {
                    const updated = await updateCxProjectMobilizationItem(
                      projectId,
                      mobModal.id,
                      mobForm,
                    );
                    setMobilization((p) =>
                      p.map((x) => (x.id === mobModal.id ? updated : x)),
                    );
                  }
                  setMobModal(null);
                  showToast("success", "Item saved.");
                } catch (e) {
                  showToast("error", e?.message || "Save failed.");
                }
              };
              return (
                <Modal
                  title={
                    mobModal === "add"
                      ? "Add Mobilization Item"
                      : "Edit Mobilization Item"
                  }
                  subtitle="Track equipment, supplies, and resources for site mobilization."
                  onClose={() => setMobModal(null)}
                >
                  <FormGrid cols={2}>
                    <FormField label="Step" required>
                      <select
                        style={inputSt}
                        value={mobForm.stepKey || "mob_site"}
                        onChange={(e) =>
                          setMobForm((p) => ({ ...p, stepKey: e.target.value }))
                        }
                      >
                        {MOB_STEP_KEYS.map((k) => (
                          <option key={k} value={k}>
                            {k.replace("mob_", "").charAt(0).toUpperCase() +
                              k.replace("mob_", "").slice(1)}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Category" required>
                      <input
                        style={inputSt}
                        placeholder="e.g. Electrical, Safety, Tools"
                        value={mobForm.category || ""}
                        onChange={(e) =>
                          setMobForm((p) => ({
                            ...p,
                            category: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Item Name" required full>
                      <input
                        style={inputSt}
                        placeholder="e.g. Hard Hat, Generator, Cable Drum"
                        value={mobForm.name || ""}
                        onChange={(e) =>
                          setMobForm((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </FormField>
                    <FormField label="Quantity" required>
                      <input
                        style={inputSt}
                        type="number"
                        min={1}
                        placeholder="1"
                        value={mobForm.quantity || ""}
                        onChange={(e) =>
                          setMobForm((p) => ({
                            ...p,
                            quantity: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Unit Cost ($)" required>
                      <input
                        style={inputSt}
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="0.00"
                        value={mobForm.unitCost ?? ""}
                        onChange={(e) =>
                          setMobForm((p) => ({
                            ...p,
                            unitCost: parseFloat(e.target.value) || 0,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Vendor">
                      <input
                        style={inputSt}
                        placeholder="e.g. Grainger, Fastenal"
                        value={mobForm.vendor || ""}
                        onChange={(e) =>
                          setMobForm((p) => ({ ...p, vendor: e.target.value }))
                        }
                      />
                    </FormField>
                    <FormField label="RFQ Status">
                      <input
                        style={inputSt}
                        placeholder="e.g. Pending, Submitted, Approved"
                        value={mobForm.rfqStatus || ""}
                        onChange={(e) =>
                          setMobForm((p) => ({
                            ...p,
                            rfqStatus: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                    <FormField label="Expected Delivery">
                      <input
                        style={inputSt}
                        type="date"
                        value={
                          mobForm.deliveryDate
                            ? mobForm.deliveryDate.slice(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          setMobForm((p) => ({
                            ...p,
                            deliveryDate: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setMobModal(null)}
                    onSave={saveMob}
                    saveLabel={mobModal === "add" ? "Add Item" : "Save Changes"}
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── WORKFLOWS ─────────────────────────────────────────────────────── */}
      {activeTab === "Workflows" && (
        <div>
          <ErrorBanner error={workflowsError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Workflows</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setWorkflowForm({ enabled: true });
                setWorkflowModal("add");
              }}
            >
              + Link Workflow
            </button>
          </div>
          <Table
            headers={["Workflow ID", "Enabled", "Custom Config", "Actions"]}
          >
            {workflowsLoading ? (
              <LoadingRows cols={4} />
            ) : workflows.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState message="No workflows linked." />
                </td>
              </tr>
            ) : (
              workflows.map((w, i) => (
                <Tr key={w.id} even={i % 2 === 0}>
                  <Td>
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono, monospace)",
                        fontSize: 11,
                      }}
                    >
                      {w.workflowId}
                    </span>
                  </Td>
                  <Td>
                    <button
                      style={{
                        background: w.enabled
                          ? "var(--emerald-soft, #d1fae5)"
                          : "var(--rf-bg2)",
                        color: w.enabled
                          ? "var(--emerald, #059669)"
                          : "var(--rf-txt2)",
                        border: "1px solid var(--rf-border)",
                        borderRadius: 20,
                        padding: "3px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        try {
                          const updated = await updateCxProjectWorkflow(
                            projectId,
                            w.workflowId,
                            { enabled: !w.enabled },
                          );
                          setWorkflows((p) =>
                            p.map((x) => (x.id === w.id ? updated : x)),
                          );
                          showToast("success", "Workflow updated.");
                        } catch (e) {
                          showToast("error", e?.message || "Update failed.");
                        }
                      }}
                    >
                      {w.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </Td>
                  <Td>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt2)",
                        fontFamily: "var(--wfont-mono, monospace)",
                      }}
                    >
                      {w.customConfig
                        ? JSON.stringify(w.customConfig).slice(0, 40) + "…"
                        : "—"}
                    </span>
                  </Td>
                  <Td>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("workflow", async () => {
                          try {
                            await deleteCxProjectWorkflow(
                              projectId,
                              w.workflowId,
                            );
                            setWorkflows((p) => p.filter((x) => x.id !== w.id));
                            showToast("success", "Workflow removed.");
                          } catch (e) {
                            showToast("error", e?.message || "Remove failed.");
                          }
                        })
                      }
                    >
                      Remove
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {workflowModal &&
            (() => {
              const saveWorkflow = async () => {
                try {
                  const created = await createCxProjectWorkflow(
                    projectId,
                    workflowForm,
                  );
                  setWorkflows((p) => [...p, created]);
                  setWorkflowModal(null);
                  showToast("success", "Workflow linked.");
                } catch (e) {
                  showToast("error", e?.message || "Link failed.");
                }
              };
              return (
                <Modal
                  title="Link Workflow"
                  subtitle="Associate an existing org workflow with this project."
                  onClose={() => setWorkflowModal(null)}
                >
                  <FormGrid cols={1}>
                    <FormField
                      label="Workflow ID"
                      required
                      hint="Enter the UUID of the workflow defined in your org settings."
                    >
                      <input
                        style={inputSt}
                        value={workflowForm.workflowId || ""}
                        onChange={(e) =>
                          setWorkflowForm((p) => ({
                            ...p,
                            workflowId: e.target.value,
                          }))
                        }
                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      />
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setWorkflowModal(null)}
                    onSave={saveWorkflow}
                    saveLabel="Link Workflow"
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── SOPs ──────────────────────────────────────────────────────────── */}
      {activeTab === "SOPs" && (
        <div>
          <ErrorBanner error={sopsError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>SOPs</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setSopForm({ autoAttach: true });
                setSopModal("add");
              }}
            >
              + Link SOP
            </button>
          </div>
          <Table
            headers={["SOP ID", "Auto Attach", "Asset Mapping", "Actions"]}
          >
            {sopsLoading ? (
              <LoadingRows cols={4} />
            ) : sops.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState message="No SOPs linked." />
                </td>
              </tr>
            ) : (
              sops.map((s, i) => (
                <Tr key={s.id} even={i % 2 === 0}>
                  <Td>
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono, monospace)",
                        fontSize: 11,
                      }}
                    >
                      {s.sopId}
                    </span>
                  </Td>
                  <Td>
                    <button
                      style={{
                        background: s.autoAttach
                          ? "var(--emerald-soft, #d1fae5)"
                          : "var(--rf-bg2)",
                        color: s.autoAttach
                          ? "var(--emerald, #059669)"
                          : "var(--rf-txt2)",
                        border: "1px solid var(--rf-border)",
                        borderRadius: 20,
                        padding: "3px 12px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                      onClick={async () => {
                        try {
                          const updated = await updateCxProjectSop(
                            projectId,
                            s.sopId,
                            { autoAttach: !s.autoAttach },
                          );
                          setSops((p) =>
                            p.map((x) => (x.id === s.id ? updated : x)),
                          );
                          showToast("success", "SOP updated.");
                        } catch (e) {
                          showToast("error", e?.message || "Update failed.");
                        }
                      }}
                    >
                      {s.autoAttach ? "Auto" : "Manual"}
                    </button>
                  </Td>
                  <Td>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt2)",
                        fontFamily: "var(--wfont-mono, monospace)",
                      }}
                    >
                      {s.assetMapping
                        ? JSON.stringify(s.assetMapping).slice(0, 40) + "…"
                        : "—"}
                    </span>
                  </Td>
                  <Td>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("SOP", async () => {
                          try {
                            await deleteCxProjectSop(projectId, s.sopId);
                            setSops((p) => p.filter((x) => x.id !== s.id));
                            showToast("success", "SOP removed.");
                          } catch (e) {
                            showToast("error", e?.message || "Remove failed.");
                          }
                        })
                      }
                    >
                      Remove
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {sopModal &&
            (() => {
              const saveSop = async () => {
                try {
                  const created = await createCxProjectSop(projectId, sopForm);
                  setSops((p) => [...p, created]);
                  setSopModal(null);
                  showToast("success", "SOP linked.");
                } catch (e) {
                  showToast("error", e?.message || "Link failed.");
                }
              };
              return (
                <Modal
                  title="Link Standard Operating Procedure"
                  subtitle="Attach an org SOP to this project for field team guidance."
                  onClose={() => setSopModal(null)}
                >
                  <FormGrid cols={2}>
                    <FormField
                      label="SOP ID"
                      required
                      hint="UUID of the SOP in your org library."
                      full
                    >
                      <input
                        style={inputSt}
                        value={sopForm.sopId || ""}
                        onChange={(e) =>
                          setSopForm((p) => ({ ...p, sopId: e.target.value }))
                        }
                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      />
                    </FormField>
                    <FormField
                      label="Auto Attach to Assets"
                      hint="Automatically attach this SOP to matching assets."
                    >
                      <select
                        style={inputSt}
                        value={sopForm.autoAttach ? "true" : "false"}
                        onChange={(e) =>
                          setSopForm((p) => ({
                            ...p,
                            autoAttach: e.target.value === "true",
                          }))
                        }
                      >
                        <option value="true">Yes — auto attach</option>
                        <option value="false">No — manual only</option>
                      </select>
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setSopModal(null)}
                    onSave={saveSop}
                    saveLabel="Link SOP"
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── PARTNERS ──────────────────────────────────────────────────────── */}
      {activeTab === "Partners" && (
        <div>
          <ErrorBanner error={partnersError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Partners</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setPartnerForm({});
                setPartnerModal("add");
              }}
            >
              + Add Partner
            </button>
          </div>
          <Table headers={["Partner ID", "Role", "Scope", "Actions"]}>
            {partnersLoading ? (
              <LoadingRows cols={4} />
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <EmptyState message="No partners linked." />
                </td>
              </tr>
            ) : (
              partners.map((p, i) => (
                <Tr key={p.id} even={i % 2 === 0}>
                  <Td>
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono, monospace)",
                        fontSize: 11,
                      }}
                    >
                      {p.partnerId}
                    </span>
                  </Td>
                  <Td>{p.role || "—"}</Td>
                  <Td>{p.scope || "—"}</Td>
                  <Td>
                    <ActionBtn
                      onClick={() => {
                        setPartnerForm({ ...p });
                        setPartnerModal(p);
                      }}
                    >
                      Edit
                    </ActionBtn>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("partner", async () => {
                          try {
                            await deleteCxProjectPartner(
                              projectId,
                              p.partnerId,
                            );
                            setPartners((prev) =>
                              prev.filter((x) => x.id !== p.id),
                            );
                            showToast("success", "Partner removed.");
                          } catch (e) {
                            showToast("error", e?.message || "Remove failed.");
                          }
                        })
                      }
                    >
                      Remove
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {partnerModal &&
            (() => {
              const savePartner = async () => {
                try {
                  if (partnerModal === "add") {
                    const created = await createCxProjectPartner(
                      projectId,
                      partnerForm,
                    );
                    setPartners((p) => [...p, created]);
                  } else {
                    const updated = await updateCxProjectPartner(
                      projectId,
                      partnerModal.partnerId,
                      { role: partnerForm.role, scope: partnerForm.scope },
                    );
                    setPartners((p) =>
                      p.map((x) => (x.id === partnerModal.id ? updated : x)),
                    );
                  }
                  setPartnerModal(null);
                  showToast("success", "Partner saved.");
                } catch (e) {
                  showToast("error", e?.message || "Save failed.");
                }
              };
              return (
                <Modal
                  title={
                    partnerModal === "add" ? "Add Partner" : "Edit Partner"
                  }
                  subtitle="Link a partner company and define their role and scope on this project."
                  onClose={() => setPartnerModal(null)}
                >
                  <FormGrid cols={partnerModal === "add" ? 1 : 2}>
                    {partnerModal === "add" && (
                      <FormField
                        label="Partner ID"
                        required
                        hint="UUID of the partner company in your org directory."
                        full
                      >
                        <input
                          style={inputSt}
                          value={partnerForm.partnerId || ""}
                          onChange={(e) =>
                            setPartnerForm((p) => ({
                              ...p,
                              partnerId: e.target.value,
                            }))
                          }
                          placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                        />
                      </FormField>
                    )}
                    <FormField label="Role">
                      <input
                        style={inputSt}
                        value={partnerForm.role || ""}
                        onChange={(e) =>
                          setPartnerForm((p) => ({
                            ...p,
                            role: e.target.value,
                          }))
                        }
                        placeholder="e.g. GC, TRADE, OEM"
                      />
                    </FormField>
                    <FormField label="Scope of Work">
                      <input
                        style={inputSt}
                        value={partnerForm.scope || ""}
                        onChange={(e) =>
                          setPartnerForm((p) => ({
                            ...p,
                            scope: e.target.value,
                          }))
                        }
                        placeholder="e.g. Electrical testing and commissioning"
                      />
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setPartnerModal(null)}
                    onSave={savePartner}
                    saveLabel={
                      partnerModal === "add" ? "Add Partner" : "Save Changes"
                    }
                  />
                </Modal>
              );
            })()}
        </div>
      )}

      {/* ── MEMBERS ───────────────────────────────────────────────────────── */}
      {activeTab === "Members" && (
        <div>
          <ErrorBanner error={membersError} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 16 }}>Team Members</span>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => {
                setMemberForm({});
                setMemberModal("add");
              }}
            >
              + Add Member
            </button>
          </div>
          <Table
            headers={[
              "User ID",
              "Role",
              "Assigned At",
              "Expires At",
              "Actions",
            ]}
          >
            {membersLoading ? (
              <LoadingRows cols={5} />
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState message="No team members yet." />
                </td>
              </tr>
            ) : (
              members.map((m, i) => (
                <Tr key={m.id} even={i % 2 === 0}>
                  <Td>
                    <span
                      style={{
                        fontFamily: "var(--wfont-mono, monospace)",
                        fontSize: 11,
                      }}
                    >
                      {m.userId}
                    </span>
                  </Td>
                  <Td>{m.roleLabel || "—"}</Td>
                  <Td>
                    {m.assignedAt
                      ? new Date(m.assignedAt).toLocaleDateString()
                      : "—"}
                  </Td>
                  <Td>
                    {m.expiresAt
                      ? new Date(m.expiresAt).toLocaleDateString()
                      : "—"}
                  </Td>
                  <Td>
                    <ActionBtn
                      danger
                      onClick={() =>
                        handleDeleteConfirm("member", async () => {
                          try {
                            await removeCxProjectMember(projectId, m.userId);
                            setMembers((p) => p.filter((x) => x.id !== m.id));
                            showToast("success", "Member removed.");
                          } catch (e) {
                            showToast("error", e?.message || "Remove failed.");
                          }
                        })
                      }
                    >
                      Remove
                    </ActionBtn>
                  </Td>
                </Tr>
              ))
            )}
          </Table>

          {memberModal &&
            (() => {
              const saveMember = async () => {
                try {
                  const created = await addCxProjectMember(
                    projectId,
                    memberForm,
                  );
                  setMembers((p) => [...p, created]);
                  setMemberModal(null);
                  showToast("success", "Member added.");
                } catch (e) {
                  showToast("error", e?.message || "Add failed.");
                }
              };
              return (
                <Modal
                  title="Add Team Member"
                  subtitle="Grant a user access to this project with an optional role and expiry."
                  onClose={() => setMemberModal(null)}
                >
                  <FormGrid cols={2}>
                    <FormField
                      label="User ID"
                      required
                      hint="UUID of the user in your org."
                      full
                    >
                      <input
                        style={inputSt}
                        value={memberForm.userId || ""}
                        onChange={(e) =>
                          setMemberForm((p) => ({
                            ...p,
                            userId: e.target.value,
                          }))
                        }
                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                      />
                    </FormField>
                    <FormField label="Role / Title">
                      <input
                        style={inputSt}
                        value={memberForm.roleLabel || ""}
                        onChange={(e) =>
                          setMemberForm((p) => ({
                            ...p,
                            roleLabel: e.target.value,
                          }))
                        }
                        placeholder="e.g. Project Manager, Site Lead"
                      />
                    </FormField>
                    <FormField
                      label="Access Expires (optional)"
                      hint="Leave blank for permanent access."
                    >
                      <input
                        style={inputSt}
                        type="date"
                        value={memberForm.expiresAt || ""}
                        onChange={(e) =>
                          setMemberForm((p) => ({
                            ...p,
                            expiresAt: e.target.value,
                          }))
                        }
                      />
                    </FormField>
                  </FormGrid>
                  <ModalFooter
                    onClose={() => setMemberModal(null)}
                    onSave={saveMember}
                    saveLabel="Add Member"
                  />
                </Modal>
              );
            })()}
        </div>
      )}
    </div>
  );
}
