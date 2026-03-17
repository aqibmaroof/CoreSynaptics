"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CreateProjects } from "@/services/Projects";
import { CreateSite } from "@/services/Sites";
import { CreateZone } from "@/services/Zones";
import { CreateEquipment } from "@/services/Equipment";

const CapitalizeText = (text) => {
  return text
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
};

const date = new Date();
const yyyy = date.getFullYear();
const mm = String(date.getMonth() + 1).padStart(2, "0");
const dd = String(date.getDate()).padStart(2, "0");
const hh = String(date.getHours()).padStart(2, "0");
const min = String(date.getMinutes()).padStart(2, "0");
const today = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

const READINESS_GATES = [
  { gate: "SAFETY_APPROVAL", status: "PENDING" },
  { gate: "PERMIT_APPROVAL", status: "PENDING" },
];
export default function KanbanBoard() {
  const router = useRouter();
  const params = useParams();
  const { projectType, id, type, subId } = params;
  // type === "Sites" or "Zones"
  // id === projectId or siteId depending on type

  const [message, setMessage] = useState({ type: "", text: "" });
  // Project form
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    timezone: "",
    address: "",
    contractValue: null,
    clientName: "",
    projectType: "",
    parentProjectId: "",
    parentSiteId: "",
  });

  // Site form
  const [siteForm, setSiteForm] = useState({
    name: "",
    location: "",
    status: "NOT_READY",
    safetyStatus: "PENDING",
    permitStatus: "PENDING",
    metadata: {},
  });

  // Zone form
  const [zoneForm, setZoneForm] = useState({
    name: "",
    type: "",
    metadata: {
      capacity: "",
      coolingType: "",
    },
  });

  const [equipmentForm, setEquipmentForm] = useState({
    name: "",
    serialNumber: "",
    type: "",
    status: "ORDERED",
    lifecyclePhase: "",
    certificationReq: "",
    metadata: {},
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSiteChange = (e) => {
    const { name, value } = e.target;
    setSiteForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleZoneChange = (e) => {
    const { name, value } = e.target;
    if (name === "capacity" || name === "coolingType") {
      setZoneForm((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, [name]: value },
      }));
    } else {
      setZoneForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEquipmentChange = (e) => {
    const { name, value } = e.target;
    setEquipmentForm((prev) => ({ ...prev, [name]: value }));
  };

  const createEquipment = async (e) => {
    e.preventDefault();
    try {
      const requiredFields = ["name", "serialNumber", "type", "lifecyclePhase"];
      for (const field of requiredFields) {
        if (!equipmentForm[field]) {
          setMessage({
            type: "error",
            text: `Missing value for field: ${CapitalizeText(field)}`,
          });
          return;
        }
      }
      const payload = {
        name: equipmentForm.name,
        serialNumber: equipmentForm.serialNumber,
        type: equipmentForm.type,
        status: equipmentForm.status,
        lifecyclePhase: equipmentForm.lifecyclePhase,
        certificationReq: equipmentForm.certificationReq,
        zoneId: id, // id from useParams
        metadata: equipmentForm.metadata,
      };
      await CreateEquipment(id, payload); // id = projectId
      setMessage({
        type: "success",
        text: "Equipment Created successfully! 🚀",
      });
      router.back();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error creating Equipment: ${error?.message}`,
      });
    }
  };

  // ─── CREATE SITE ────────────────────────────────────────────
  const createSite = async (e) => {
    e.preventDefault();
    try {
      const requiredFields = ["name", "location"];
      for (const field of requiredFields) {
        if (!siteForm[field]) {
          setMessage({
            type: "error",
            text: `Missing value for field: ${CapitalizeText(field)}`,
          });
          return;
        }
      }
      const payload = {
        name: siteForm.name,
        location: siteForm.location,
        status: siteForm.status,
        readinessGates: READINESS_GATES,
        safetyStatus: siteForm.safetyStatus,
        permitStatus: siteForm.permitStatus,
        metadata: siteForm.metadata,
      };
      await CreateSite(id, payload); // id = projectId
      setMessage({ type: "success", text: "Site Created successfully! 🚀" });
      router.back();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error creating Site: ${error?.message}`,
      });
    }
  };

  // ─── CREATE ZONE ────────────────────────────────────────────
  const createZone = async (e) => {
    e.preventDefault();
    try {
      const requiredFields = ["name", "type"];
      for (const field of requiredFields) {
        if (!zoneForm[field]) {
          setMessage({
            type: "error",
            text: `Missing value for field: ${CapitalizeText(field)}`,
          });
          return;
        }
      }
      const payload = {
        name: zoneForm.name,
        type: zoneForm.type,
        metadata: {
          capacity: zoneForm.metadata.capacity,
          coolingType: zoneForm.metadata.coolingType,
        },
      };
      await CreateZone(id, payload); // id = siteId
      setMessage({ type: "success", text: "Zone Created successfully! 🚀" });
      router.back();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error creating Zone: ${error?.message}`,
      });
    }
  };

  // ─── CREATE PROJECT ─────────────────────────────────────────
  const createProject = async (e) => {
    e.preventDefault();
    try {
      let payload = {
        name: form?.name,
        description: form?.description,
        startDate: form?.startDate,
        endDate: form?.endDate,
        timezone: form?.timezone,
        address: form?.address,
        metadata: {
          contractValue: form?.contractValue,
          clientName: form?.clientName,
        },
        projectType: form?.projectType,
      };
      if (id && params.subId) {
        payload = {
          ...payload,
          parentProjectId: params?.subId,
          parentSiteId: id,
        };
      }
      const requiredFields = [
        "name",
        "description",
        "startDate",
        "endDate",
        "timezone",
        "address",
      ];
      for (const field of requiredFields) {
        const value = payload[field];
        if (value === undefined || value === null || value === "") {
          setMessage({
            type: "error",
            text: `Missing value for field: ${CapitalizeText(field)}`,
          });
          return;
        }
      }
      await CreateProjects(payload);
      setMessage({ type: "success", text: "Project Created successfully! 🚀" });
      router.back();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error creating Project: ${error?.message}`,
      });
    }
  };

  const handleAssignProject = async (e, selected) => {
    if (selected === "parentProjectId") {
      setForm({ ...form, parentProjectId: e.target.value });
    } else if (selected === "parentSiteId") {
      setForm({ ...form, parentSiteId: e.target.value });
    } else if (selected === "projectType") {
      setForm({ ...form, projectType: e.target.value });
    }
  };
  console.log(projectType, type);
  const isSiteForm = projectType === "Project" && type === "Sites";
  const isZoneForm = projectType === "Projects" && type === "Zones";
  const isEquipmentForm = projectType === "Zone" && type === "Assets";
  const isProjectForm = !isSiteForm && !isZoneForm && !isEquipmentForm;

  const handleSubmit = (e) => {
    if (isSiteForm) return createSite(e);
    if (isZoneForm) return createZone(e);
    if (isEquipmentForm) return createEquipment(e);
    return createProject(e);
  };

  return (
    <div className="min-h-screen w-full font-gilroy p-6 font-gilroy text-white">
      <div className="w-full flex items-center justtify-end">
        {/* Status Messages */}
        {message.text && (
          <div
            className={`p-3 rounded-lg mb-4 text-sm animate-fade-in ${
              message.type === "success"
                ? "bg-green-900/30 text-green-400 border border-green-500/30"
                : "bg-red-900/30 text-red-400 border border-red-500/30"
            }`}
          >
            {message.text}
          </div>
        )}
        <button
          onClick={handleSubmit}
          className="ml-auto bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white font-[510] py-2 px-4 border-none rounded-xl transition-all cursor-pointer w-50"
        >
          {isSiteForm
            ? "Create Site"
            : isZoneForm
              ? "Create Zone"
              : isEquipmentForm
                ? "Create Equipment"
                : "Create Project"}
        </button>
      </div>

      <div className="w-full font-gilroy mt-6 mb-6 text-[#A0AEC0]">
        {/* ─── SITE FORM ─── */}
        {isSiteForm && (
          <>
            <div className="flex justify-left gap-28 items-center">
              <h2>Name:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="name"
                value={siteForm.name}
                onChange={handleSiteChange}
                placeholder="Site Name"
              />
            </div>
            <div className="flex justify-left gap-24 items-center mt-3">
              <h2>Location:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="location"
                value={siteForm.location}
                onChange={handleSiteChange}
                placeholder="Site Location"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Status:</h2>
              <select
                name="status"
                value={siteForm.status}
                onChange={handleSiteChange}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="NOT_READY">NOT_READY</option>
                <option value="READY">READY</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Safety Status:</h2>
              <select
                name="safetyStatus"
                value={siteForm.safetyStatus}
                onChange={handleSiteChange}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Permit Status:</h2>
              <select
                name="permitStatus"
                value={siteForm.permitStatus}
                onChange={handleSiteChange}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </>
        )}

        {/* ─── ZONE FORM ─── */}
        {isZoneForm && (
          <>
            <div className="flex justify-left gap-28 items-center">
              <h2>Name:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="name"
                value={zoneForm.name}
                onChange={handleZoneChange}
                placeholder="Zone Name"
              />
            </div>
            <div className="flex justify-left gap-28 items-center mt-3">
              <h2>Type:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="type"
                value={zoneForm.type}
                onChange={handleZoneChange}
                placeholder="Zone Type e.g. server_room"
              />
            </div>
            <div className="flex justify-left gap-24 items-center mt-3">
              <h2>Capacity:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="capacity"
                value={zoneForm.metadata.capacity}
                onChange={handleZoneChange}
                placeholder="e.g. 100 racks"
              />
            </div>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Cooling Type:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="coolingType"
                value={zoneForm.metadata.coolingType}
                onChange={handleZoneChange}
                placeholder="e.g. hot-aisle containment"
              />
            </div>
          </>
        )}

        {/* ─── PROJECT FORM ─── */}
        {isProjectForm && (
          <>
            <div className="flex justify-left gap-28 items-center">
              <h2>Name:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="name"
                value={form?.name}
                onChange={handleChange}
                placeholder="Project Name"
              />
            </div>
            <div className="flex items-center justify-left gap-19 mt-3">
              <span className="text-slate-400">Description:</span>
              <input
                type="text"
                placeholder="Project Description"
                name="description"
                value={form?.description}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Start Date:</h2>
              <input
                type="datetime-local"
                name="startDate"
                min={today}
                value={form?.startDate}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-22 items-center mt-3">
              <h2>End Date:</h2>
              <input
                type="datetime-local"
                name="endDate"
                min={form.startDate}
                value={form?.endDate}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Time Zone:</h2>
              <input
                type="text"
                placeholder="Time Zone"
                name="timezone"
                value={form?.timezone}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-24 items-center mt-3">
              <h2>Address:</h2>
              <input
                type="text"
                placeholder="Address"
                name="address"
                value={form?.address}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-11 items-center mt-3">
              <h2>Contract Value:</h2>
              <input
                type="text"
                placeholder="Contract Value"
                name="contractValue"
                value={form?.contractValue}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-16 items-center mt-3">
              <h2>Client Name:</h2>
              <input
                type="text"
                placeholder="Client Name"
                name="clientName"
                value={form?.clientName}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Project Type:</h2>
              <select
                onChange={(e) => handleAssignProject(e, "projectType")}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="">Select Project Type</option>
                {[
                  { name: "ZONE" },
                  { name: "ASSETS" },
                  { name: "SITE" },
                  { name: "OTHERS" },
                ]
                  ?.filter((item) => item?.name !== projectType)
                  ?.map((item, index) => (
                    <option value={item.name} key={index}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}
        {/* ─── EQUIPMENT FORM ─── */}
        {isEquipmentForm && (
          <>
            <div className="flex justify-left gap-28 items-center">
              <h2>Name:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="name"
                value={equipmentForm.name}
                onChange={handleEquipmentChange}
                placeholder="Equipment Name"
              />
            </div>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Serial Number:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="serialNumber"
                value={equipmentForm.serialNumber}
                onChange={handleEquipmentChange}
                placeholder="Serial Number"
              />
            </div>
            <div className="flex justify-left gap-28 items-center mt-3">
              <h2>Type:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="type"
                value={equipmentForm.type}
                onChange={handleEquipmentChange}
                placeholder="Equipment Type"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Status:</h2>
              <select
                name="status"
                value={equipmentForm.status}
                onChange={handleEquipmentChange}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="ORDERED">ORDERED</option>
                <option value="MANUFACTURING">MANUFACTURING</option>
                <option value="FAT">FAT</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="INSTALLED">INSTALLED</option>
                <option value="COMMISSIONED">COMMISSIONED</option>
              </select>
            </div>
            <div className="flex justify-left gap-18 items-center mt-3">
              <h2>Lifecycle Phase:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="lifecyclePhase"
                value={equipmentForm.lifecyclePhase}
                onChange={handleEquipmentChange}
                placeholder="Lifecycle Phase"
              />
            </div>
            <div className="flex justify-left gap-14 items-center mt-3">
              <h2>Certification Req:</h2>
              <input
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
                type="text"
                name="certificationReq"
                value={equipmentForm.certificationReq}
                onChange={handleEquipmentChange}
                placeholder="Certification Requirement"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
