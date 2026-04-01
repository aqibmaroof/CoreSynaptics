"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreateProjects, GetProjectsById } from "@/services/Projects";
import { CreateSite, GetSiteById } from "@/services/Sites";
import { CreateZone, GetZoneById } from "@/services/Zones";
import { CreateEquipment } from "@/services/Equipment";
import {
  TypeSelector,
  DynamicMetadataFields,
  TypeValidationMessage,
} from "@/components/TypeSystem";
import { validateTypeUsage } from "@/services/TypeSystem";
import {
  getCurrentOrganizationContext,
  getFriendlyTypeSystemError,
  getProjectCategoryOptions,
  sanitizeMetadata,
  validateMetadataAgainstType,
} from "@/services/TypeSystem/utils";

const READINESS_GATES = [
  { gate: "SAFETY_APPROVAL", status: "PENDING" },
  { gate: "PERMIT_APPROVAL", status: "PENDING" },
];

const initialProjectForm = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  timezone: "",
  address: "",
  contractValue: "",
  clientName: "",
  projectCategory: "",
};

const initialSiteForm = {
  name: "",
  type: "",
  location: "",
  status: "NOT_READY",
  safetyStatus: "PENDING",
  permitStatus: "PENDING",
  metadata: {},
};

const initialZoneForm = {
  name: "",
  type: "",
  metadata: {},
};

const initialEquipmentForm = {
  name: "",
  serialNumber: "",
  type: "",
  status: "",
  lifecyclePhase: "",
  certificationReq: "",
  metadata: {},
};

const statusMessageClass = {
  success: "bg-green-900/30 text-green-400 border border-green-500/30",
  error: "bg-red-900/30 text-red-400 border border-red-500/30",
  info: "bg-blue-900/30 text-blue-300 border border-blue-500/30",
};

const formatLabel = (value) =>
  value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const today = new Date().toISOString().slice(0, 16);

const buildAncestorTypes = ({ siteType, zoneType }) =>
  [siteType, zoneType].filter(Boolean);

export default function CreateProject() {
  const router = useRouter();
  const params = useParams();
  const { projectType, id, type, subId } = params;

  const isSiteForm = projectType === "Project" && type === "Sites";
  const isSubProjectForm = projectType === "Site" && type === "Projects";
  const isZoneForm = projectType === "Projects" && type === "Zones";
  const isEquipmentForm = projectType === "Zone" && type === "Assets";
  const isRootProjectForm =
    !isSiteForm && !isSubProjectForm && !isZoneForm && !isEquipmentForm;

  const [message, setMessage] = useState({ type: "", text: "" });
  const [projectForm, setProjectForm] = useState(initialProjectForm);
  const [siteForm, setSiteForm] = useState(initialSiteForm);
  const [zoneForm, setZoneForm] = useState(initialZoneForm);
  const [equipmentForm, setEquipmentForm] = useState(initialEquipmentForm);
  const [siteTypeDetails, setSiteTypeDetails] = useState(null);
  const [zoneTypeDetails, setZoneTypeDetails] = useState(null);
  const [equipmentTypeDetails, setEquipmentTypeDetails] = useState(null);
  const [metadataErrors, setMetadataErrors] = useState({});
  const [typeValidation, setTypeValidation] = useState(null);
  const [loadingContext, setLoadingContext] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [context, setContext] = useState({
    orgType: null,
    organizationId: null,
    rootProjectId: null,
    projectCategory: "",
    siteId: null,
    siteType: null,
    subProjectId: null,
    zoneId: null,
    zoneType: null,
  });

  const projectCategoryOptions = getProjectCategoryOptions();

  const currentTypeDetails = isSiteForm
    ? siteTypeDetails
    : isZoneForm
      ? zoneTypeDetails
      : isEquipmentForm
        ? equipmentTypeDetails
        : null;

  const currentMetadata = isSiteForm
    ? siteForm.metadata
    : isZoneForm
      ? zoneForm.metadata
      : isEquipmentForm
        ? equipmentForm.metadata
        : {};

  const currentTypeCode = isSiteForm
    ? siteForm.type
    : isZoneForm
      ? zoneForm.type
      : isEquipmentForm
        ? equipmentForm.type
        : "";

  const currentLevel = isSiteForm
    ? "SITE"
    : isZoneForm
      ? "ZONE"
      : isEquipmentForm
        ? "ASSET"
        : null;

  const contextSummary = useMemo(() => {
    if (isRootProjectForm) {
      return "Root project creation defines the program category and organization context.";
    }

    if (loadingContext) {
      return "Loading hierarchy context from the backend.";
    }

    if (isSiteForm) {
      return `Create a site under the selected root project. Available site types are filtered by ${context.projectCategory || "project category"} and ${context.orgType || "organization context"}.`;
    }

    if (isSubProjectForm) {
      return "Create a sub-project under the selected site. Sub-projects inherit the root project category and do not expose type selection.";
    }

    if (isZoneForm) {
      return `Create a flat zone under this sub-project. Nested zones are disabled because the backend does not support parentZoneId. Parent site type: ${context.siteType || "unknown"}.`;
    }

    if (isEquipmentForm) {
      return `Create an asset under the selected zone. Asset type, metadata, and status are constrained by the backend Type System.`;
    }

    return "";
  }, [context, isEquipmentForm, isRootProjectForm, isSiteForm, isSubProjectForm, isZoneForm, loadingContext]);

  useEffect(() => {
    const loadContext = async () => {
      const authContext = getCurrentOrganizationContext();

      const baseContext = {
        orgType: authContext.orgType,
        organizationId: authContext.organizationId,
        rootProjectId: null,
        projectCategory: "",
        siteId: null,
        siteType: null,
        subProjectId: null,
        zoneId: null,
        zoneType: null,
      };

      if (isRootProjectForm) {
        setContext(baseContext);
        setLoadingContext(false);
        return;
      }

      try {
        if (isSiteForm) {
          const project = await GetProjectsById(id);
          setContext({
            ...baseContext,
            rootProjectId: project.id,
            projectCategory: project.projectCategory || "",
          });
        } else if (isSubProjectForm) {
          const site = await GetSiteById(subId, id);
          const rootProject = await GetProjectsById(subId);
          setContext({
            ...baseContext,
            rootProjectId: rootProject.id,
            projectCategory: rootProject.projectCategory || "",
            siteId: site.id,
            siteType: site.type || null,
          });
        } else if (isZoneForm) {
          const subProject = await GetProjectsById(id);
          setContext({
            ...baseContext,
            rootProjectId: null,
            projectCategory: subProject.projectCategory || "",
            siteId: subProject.parentSiteId || subId || null,
            siteType: subProject.parentSiteType || null,
            subProjectId: subProject.id,
          });
        } else if (isEquipmentForm) {
          const zone = await GetZoneById(id, subId);
          setContext({
            ...baseContext,
            rootProjectId: null,
            projectCategory: zone.projectCategory || "",
            siteId: zone.siteId || null,
            siteType: zone.siteType || null,
            subProjectId: subId || zone.projectId,
            zoneId: zone.id,
            zoneType: zone.type || null,
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: getFriendlyTypeSystemError(error),
        });
      } finally {
        setLoadingContext(false);
      }
    };

    loadContext();
  }, [id, isEquipmentForm, isRootProjectForm, isSiteForm, isSubProjectForm, isZoneForm, subId]);

  useEffect(() => {
    setMetadataErrors({});
    setTypeValidation(null);
  }, [currentTypeCode, currentLevel]);

  const handleProjectChange = (event) => {
    const { name, value } = event.target;
    setProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiteChange = (event) => {
    const { name, value } = event.target;
    setSiteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleZoneChange = (event) => {
    const { name, value } = event.target;
    setZoneForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (event) => {
    const { name, value } = event.target;
    setEquipmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateSelectedType = async (typeCode, metadata = {}) => {
    const projectIdForValidation =
      context.subProjectId || context.rootProjectId;

    if (!typeCode || !projectIdForValidation || !context.organizationId) {
      return null;
    }

    const payload = {
      typeCode,
      projectId: isSiteForm ? context.rootProjectId : projectIdForValidation,
      organizationId: context.organizationId,
      parentTypeCode: isZoneForm
        ? context.siteType
        : isEquipmentForm
          ? context.zoneType
          : undefined,
      level: currentLevel || undefined,
      metadata: sanitizeMetadata(metadata),
    };

    const result = await validateTypeUsage(payload);

    if (currentTypeDetails?.requiresAncestorType) {
      const ancestors = buildAncestorTypes({
        siteType: context.siteType,
        zoneType: context.zoneType,
      });

      if (!ancestors.includes(currentTypeDetails.requiresAncestorType)) {
        result.isValid = false;
        result.errors = [
          ...(result.errors || []),
          `Type requires ancestor "${currentTypeDetails.requiresAncestorType}" in the current hierarchy.`,
        ];
      }
    }

    setTypeValidation(result);
    return result;
  };

  const validateDynamicMetadata = async () => {
    if (!currentTypeDetails) {
      return true;
    }

    const errors = validateMetadataAgainstType(currentTypeDetails, currentMetadata);
    setMetadataErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    const validationResult = await validateSelectedType(currentTypeCode, currentMetadata);
    return validationResult ? validationResult.isValid : true;
  };

  const createRootProject = async () => {
    const payload = {
      name: projectForm.name,
      description: projectForm.description || undefined,
      startDate: projectForm.startDate || undefined,
      endDate: projectForm.endDate || undefined,
      timezone: projectForm.timezone || undefined,
      address: projectForm.address || undefined,
      projectCategory: projectForm.projectCategory || undefined,
      metadata: sanitizeMetadata({
        contractValue: projectForm.contractValue
          ? Number(projectForm.contractValue)
          : undefined,
        clientName: projectForm.clientName || undefined,
      }),
    };

    if (!payload.name || !payload.projectCategory) {
      throw new Error("Project name and category are required.");
    }

    await CreateProjects(payload);
  };

  const createSubProject = async () => {
    const payload = {
      name: projectForm.name,
      description: projectForm.description || undefined,
      startDate: projectForm.startDate || undefined,
      endDate: projectForm.endDate || undefined,
      timezone: projectForm.timezone || undefined,
      address: projectForm.address || undefined,
      parentSiteId: id,
      metadata: sanitizeMetadata({
        contractValue: projectForm.contractValue
          ? Number(projectForm.contractValue)
          : undefined,
        clientName: projectForm.clientName || undefined,
      }),
    };

    if (!payload.name || !payload.parentSiteId) {
      throw new Error("Sub-project name and parent site are required.");
    }

    await CreateProjects(payload);
  };

  const createSiteEntity = async () => {
    if (!(await validateDynamicMetadata())) {
      throw new Error("Site type validation failed.");
    }

    const payload = {
      name: siteForm.name,
      type: siteForm.type,
      location: siteForm.location || undefined,
      status: siteForm.status || undefined,
      safetyStatus: siteForm.safetyStatus || undefined,
      permitStatus: siteForm.permitStatus || undefined,
      readinessGates: READINESS_GATES,
      metadata: sanitizeMetadata(siteForm.metadata),
    };

    if (!payload.name || !payload.type) {
      throw new Error("Site name and site type are required.");
    }

    await CreateSite(id, payload);
  };

  const createZoneEntity = async () => {
    if (!(await validateDynamicMetadata())) {
      throw new Error("Zone type validation failed.");
    }

    const payload = {
      name: zoneForm.name,
      type: zoneForm.type || undefined,
      metadata: sanitizeMetadata(zoneForm.metadata),
    };

    if (!payload.name || !payload.type) {
      throw new Error("Zone name and zone type are required.");
    }

    await CreateZone(id, payload);
  };

  const createEquipmentEntity = async () => {
    if (!(await validateDynamicMetadata())) {
      throw new Error("Asset type validation failed.");
    }

    if (
      equipmentTypeDetails?.allowedStatuses?.length > 0 &&
      equipmentForm.status &&
      !equipmentTypeDetails.allowedStatuses.includes(equipmentForm.status)
    ) {
      throw new Error("Selected asset status is not allowed for this type.");
    }

    const payload = {
      name: equipmentForm.name,
      serialNumber: equipmentForm.serialNumber || undefined,
      type: equipmentForm.type,
      status:
        equipmentForm.status ||
        equipmentTypeDetails?.allowedStatuses?.[0] ||
        undefined,
      lifecyclePhase: equipmentForm.lifecyclePhase || undefined,
      certificationReq: equipmentForm.certificationReq || undefined,
      metadata: sanitizeMetadata(equipmentForm.metadata),
    };

    if (!payload.name || !payload.type) {
      throw new Error("Asset name and type are required.");
    }

    await CreateEquipment(id, payload);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    setSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      if (isRootProjectForm) {
        await createRootProject();
      } else if (isSubProjectForm) {
        await createSubProject();
      } else if (isSiteForm) {
        await createSiteEntity();
      } else if (isZoneForm) {
        await createZoneEntity();
      } else if (isEquipmentForm) {
        await createEquipmentEntity();
      }

      setMessage({
        type: "success",
        text: `${isRootProjectForm ? "Project" : isSubProjectForm ? "Sub-project" : isSiteForm ? "Site" : isZoneForm ? "Zone" : "Asset"} created successfully.`,
      });

      setTimeout(() => router.back(), 900);
    } catch (error) {
      setMessage({
        type: "error",
        text: getFriendlyTypeSystemError(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-6 font-gilroy text-white">
      <div className="flex items-start gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isRootProjectForm
              ? "Create Root Project"
              : isSubProjectForm
                ? "Create Sub Project"
                : isSiteForm
                  ? "Create Site"
                  : isZoneForm
                    ? "Create Zone"
                    : "Create Asset"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-[#A0AEC0]">
            {contextSummary}
          </p>
        </div>

        <div className="ml-auto flex flex-col items-end gap-3">
          {message.text && (
            <div
              className={`rounded-lg px-3 py-2 text-sm ${statusMessageClass[message.type] || statusMessageClass.info}`}
            >
              {message.text}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={loadingContext || submitting}
            className="w-52 rounded-xl bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] px-4 py-2 font-[510] text-white transition-all disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Create"}
          </button>
        </div>
      </div>

      <div className="mt-6 mb-6 w-full text-[#A0AEC0]">
        {(loadingContext || (!context.orgType && !isRootProjectForm)) && (
          <div className="rounded-xl border border-white/10 bg-[#11163b]/40 px-4 py-3 text-sm text-blue-200">
            Loading backend context for hierarchy validation.
          </div>
        )}

        {isRootProjectForm && (
          <>
            <TextField
              label="Name"
              name="name"
              value={projectForm.name}
              placeholder="TX Alloy Data Center Program - Dallas"
              onChange={handleProjectChange}
            />
            <TextField
              label="Description"
              name="description"
              value={projectForm.description}
              placeholder="Enterprise delivery program for Dallas campus buildout"
              onChange={handleProjectChange}
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="datetime-local"
              min={today}
              value={projectForm.startDate}
              onChange={handleProjectChange}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="datetime-local"
              min={projectForm.startDate || today}
              value={projectForm.endDate}
              onChange={handleProjectChange}
            />
            <TextField
              label="Time Zone"
              name="timezone"
              value={projectForm.timezone}
              placeholder="America/Chicago"
              onChange={handleProjectChange}
            />
            <TextField
              label="Address"
              name="address"
              value={projectForm.address}
              placeholder="1750 Telecom Parkway, Dallas, TX"
              onChange={handleProjectChange}
            />
            <TextField
              label="Contract Value"
              name="contractValue"
              value={projectForm.contractValue}
              placeholder="85000000"
              onChange={handleProjectChange}
            />
            <TextField
              label="Client Name"
              name="clientName"
              value={projectForm.clientName}
              placeholder="TX Alloy"
              onChange={handleProjectChange}
            />

            <div className="mt-4 flex items-center gap-8">
              <h2 className="w-40 shrink-0 text-white">Project Category:</h2>
              <select
                name="projectCategory"
                value={projectForm.projectCategory}
                onChange={handleProjectChange}
                className="h-10 w-[28rem] rounded-md border border-white/10 bg-[#12153d] px-3 text-sm text-white focus:outline-none"
              >
                <option value="">Select Project Category</option>
                {projectCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {isSubProjectForm && (
          <>
            <TextField
              label="Name"
              name="name"
              value={projectForm.name}
              placeholder="Phase 1 - Core Infrastructure"
              onChange={handleProjectChange}
            />
            <TextField
              label="Description"
              name="description"
              value={projectForm.description}
              placeholder="Electrical and mechanical package for initial buildout"
              onChange={handleProjectChange}
            />
            <TextField
              label="Start Date"
              name="startDate"
              type="datetime-local"
              min={today}
              value={projectForm.startDate}
              onChange={handleProjectChange}
            />
            <TextField
              label="End Date"
              name="endDate"
              type="datetime-local"
              min={projectForm.startDate || today}
              value={projectForm.endDate}
              onChange={handleProjectChange}
            />
            <TextField
              label="Time Zone"
              name="timezone"
              value={projectForm.timezone}
              placeholder="America/Chicago"
              onChange={handleProjectChange}
            />
            <TextField
              label="Address"
              name="address"
              value={projectForm.address}
              placeholder="Dallas Data Center Campus"
              onChange={handleProjectChange}
            />
            <TextField
              label="Contract Value"
              name="contractValue"
              value={projectForm.contractValue}
              placeholder="16000000"
              onChange={handleProjectChange}
            />
            <TextField
              label="Client Name"
              name="clientName"
              value={projectForm.clientName}
              placeholder="TX Alloy"
              onChange={handleProjectChange}
            />
            <InfoBanner>
              Sub-projects inherit the root project category of{" "}
              <strong>{context.projectCategory || "the selected site"}</strong>.
              Type selection is intentionally disabled for this level.
            </InfoBanner>
          </>
        )}

        {isSiteForm && (
          <>
            <TextField
              label="Name"
              name="name"
              value={siteForm.name}
              placeholder="Dallas Data Center Site - TX Alloy"
              onChange={handleSiteChange}
            />
            <TextField
              label="Location"
              name="location"
              value={siteForm.location}
              placeholder="Dallas, Texas"
              onChange={handleSiteChange}
            />

            <div className="mt-4 flex items-start gap-8">
              <h2 className="mt-2 w-40 shrink-0 text-white">Type:</h2>
              <div className="w-[28rem]">
                <TypeSelector
                  level="SITE"
                  projectCategory={context.projectCategory}
                  orgType={context.orgType}
                  value={siteForm.type}
                  onChange={(selected) =>
                    setSiteForm((prev) => ({ ...prev, type: selected }))
                  }
                  onTypeDetails={setSiteTypeDetails}
                  placeholder="Select site type"
                  required
                />
              </div>
            </div>

            <SelectField
              label="Status"
              name="status"
              value={siteForm.status}
              onChange={handleSiteChange}
              options={["NOT_READY", "READY", "ACTIVE", "COMPLETE"]}
            />
            <SelectField
              label="Safety Status"
              name="safetyStatus"
              value={siteForm.safetyStatus}
              onChange={handleSiteChange}
              options={["PENDING", "APPROVED", "RESTRICTED"]}
            />
            <SelectField
              label="Permit Status"
              name="permitStatus"
              value={siteForm.permitStatus}
              onChange={handleSiteChange}
              options={["PENDING", "APPROVED", "REJECTED"]}
            />
          </>
        )}

        {isZoneForm && (
          <>
            <TextField
              label="Name"
              name="name"
              value={zoneForm.name}
              placeholder="Electrical Infrastructure"
              onChange={handleZoneChange}
            />

            <div className="mt-4 flex items-start gap-8">
              <h2 className="mt-2 w-40 shrink-0 text-white">Type:</h2>
              <div className="w-[28rem]">
                <TypeSelector
                  level="ZONE"
                  projectCategory={context.projectCategory}
                  orgType={context.orgType}
                  parentTypeCode={context.siteType}
                  value={zoneForm.type}
                  onChange={(selected) =>
                    setZoneForm((prev) => ({ ...prev, type: selected }))
                  }
                  onTypeDetails={setZoneTypeDetails}
                  placeholder="Select zone type"
                  required
                />
              </div>
            </div>

            <InfoBanner>
              Zones are flat under the sub-project. Nested zone chains like
              Building → Data Hall → Pod are blocked in the UI until backend
              support for <code>parentZoneId</code> exists.
            </InfoBanner>
          </>
        )}

        {isEquipmentForm && (
          <>
            <TextField
              label="Name"
              name="name"
              value={equipmentForm.name}
              placeholder="UPS System - Pod A"
              onChange={handleEquipmentChange}
            />
            <TextField
              label="Serial Number"
              name="serialNumber"
              value={equipmentForm.serialNumber}
              placeholder="UPS-DAL-PODA-001"
              onChange={handleEquipmentChange}
            />

            <div className="mt-4 flex items-start gap-8">
              <h2 className="mt-2 w-40 shrink-0 text-white">Type:</h2>
              <div className="w-[28rem]">
                <TypeSelector
                  level="ASSET"
                  projectCategory={context.projectCategory}
                  orgType={context.orgType}
                  parentTypeCode={context.zoneType}
                  value={equipmentForm.type}
                  onChange={(selected) =>
                    setEquipmentForm((prev) => ({
                      ...prev,
                      type: selected,
                      status: "",
                    }))
                  }
                  onTypeDetails={setEquipmentTypeDetails}
                  placeholder="Select asset type"
                  required
                />
              </div>
            </div>

            <SelectField
              label="Status"
              name="status"
              value={equipmentForm.status}
              onChange={handleEquipmentChange}
              options={
                equipmentTypeDetails?.allowedStatuses?.length
                  ? equipmentTypeDetails.allowedStatuses
                  : [
                      "ORDERED",
                      "MANUFACTURING",
                      "FAT",
                      "SHIPPED",
                      "INSTALLED",
                      "COMMISSIONED",
                    ]
              }
            />
            <TextField
              label="Lifecycle Phase"
              name="lifecyclePhase"
              value={equipmentForm.lifecyclePhase}
              placeholder="Factory Acceptance Testing"
              onChange={handleEquipmentChange}
            />
            <TextField
              label="Certification Req"
              name="certificationReq"
              value={equipmentForm.certificationReq}
              placeholder="UL 1778"
              onChange={handleEquipmentChange}
            />
          </>
        )}

        {currentTypeDetails && (
          <div className="mt-6 max-w-3xl rounded-2xl border border-white/10 bg-[#0f1635]/60 p-4">
            <DynamicMetadataFields
              typeDefinition={currentTypeDetails}
              metadata={currentMetadata}
              onChange={(metadata) => {
                setMetadataErrors({});
                if (isSiteForm) {
                  setSiteForm((prev) => ({ ...prev, metadata }));
                } else if (isZoneForm) {
                  setZoneForm((prev) => ({ ...prev, metadata }));
                } else if (isEquipmentForm) {
                  setEquipmentForm((prev) => ({ ...prev, metadata }));
                }
              }}
              errors={metadataErrors}
            />
          </div>
        )}

        {typeValidation && (
          <div className="mt-4 max-w-3xl">
            <TypeValidationMessage validation={typeValidation} showWhen />
          </div>
        )}

        {!isRootProjectForm && !loadingContext && (!context.orgType || !context.projectCategory) && (
          <div className="mt-4 max-w-3xl rounded-xl border border-red-500/20 bg-red-900/20 px-4 py-3 text-sm text-red-300">
            The frontend could not resolve organization or project-category context from the current session. Reload after login, or refresh the parent record before creating children.
          </div>
        )}
      </div>
    </div>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) {
  return (
    <div className="mt-4 flex items-center gap-8">
      <h2 className="w-40 shrink-0 text-white">{label}:</h2>
      <input
        className="w-[28rem] border-none bg-neutral-secondary-medium text-[18px] font-[600] text-[#656A80] outline-none placeholder:text-body"
        type={type}
        name={name}
        value={value}
        min={min}
        onChange={onChange}
        placeholder={placeholder || formatLabel(name)}
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="mt-4 flex items-center gap-8">
      <h2 className="w-40 shrink-0 text-white">{label}:</h2>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="h-10 w-[28rem] rounded-md border border-white/10 bg-[#12153d] px-3 text-sm text-white focus:outline-none"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoBanner({ children }) {
  return (
    <div className="mt-5 max-w-3xl rounded-xl border border-blue-500/20 bg-blue-900/20 px-4 py-3 text-sm text-blue-200">
      {children}
    </div>
  );
}
