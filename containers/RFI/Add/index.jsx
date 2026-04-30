"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createRFI } from "@/services/RFI";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { GetEquipments } from "@/services/Equipment";
import { getCompanies } from "@/services/Companies";
import CompanySelect from "@/components/CRM/CompanySelect";

const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ??
        data?.projects ??
        data?.sites ??
        data?.zones ??
        data?.equipment ??
        data?.companies ??
        []);
}

function AppSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export default function RFIAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cascade lists
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    rfiNumber: "",
    subject: "",
    question: "",
    priority: "MEDIUM",
    projectId: "",
    siteId: "",
    subProjectId: "",
    zoneId: "",
    assetId: "",
    assignedToCompanyId: "",
    dueDate: "",
  });

  // Load projects + companies on mount
  useEffect(() => {
    getProjects()
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
    getCompanies()
      .then((d) => setCompanies(toArray(d)))
      .catch(() => {});
  }, []);

  // Project → Sites
  useEffect(() => {
    setSites([]);
    setSubProjects([]);
    setZones([]);
    setAssets([]);
    setFormData((p) => ({
      ...p,
      siteId: "",
      subProjectId: "",
      zoneId: "",
      assetId: "",
    }));
    if (!formData.projectId) return;
    GetSites(formData.projectId)
      .then((d) => setSites(toArray(d)))
      .catch(() => {});
  }, [formData.projectId]);

  // Site → SubProjects
  useEffect(() => {
    setSubProjects([]);
    setZones([]);
    setAssets([]);
    setFormData((p) => ({ ...p, subProjectId: "", zoneId: "", assetId: "" }));
    if (!formData.siteId) return;
    getProjects(25, 1, formData.siteId, formData.projectId)
      .then((d) => setSubProjects(toArray(d)))
      .catch(() => {});
  }, [formData.siteId]);

  // SubProject → Zones
  useEffect(() => {
    setZones([]);
    setAssets([]);
    setFormData((p) => ({ ...p, zoneId: "", assetId: "" }));
    if (!formData.subProjectId) return;
    GetZones(formData.subProjectId)
      .then((d) => setZones(toArray(d)))
      .catch(() => {});
  }, [formData.subProjectId]);

  // Zone → Assets
  useEffect(() => {
    setAssets([]);
    setFormData((p) => ({ ...p, assetId: "" }));
    if (!formData.zoneId) return;
    GetEquipments(formData.zoneId)
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, [formData.zoneId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.rfiNumber.trim()) {
      setError("RFI Number is required");
      return false;
    }
    if (!formData.subject.trim()) {
      setError("Subject is required");
      return false;
    }
    if (!formData.question.trim()) {
      setError("Question is required");
      return false;
    }
    if (!formData.projectId) {
      setError("Project is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createRFI({
        rfiNumber: formData.rfiNumber.trim(),
        subject: formData.subject.trim(),
        question: formData.question.trim(),
        priority: formData.priority,
        projectId: formData.projectId,
        siteId: formData.siteId || undefined,
        subProjectId: formData.subProjectId || undefined,
        zoneId: formData.zoneId || undefined,
        assetId: formData.assetId || undefined,
        assignedToCompanyId: formData.assignedToCompanyId || undefined,
        dueDate: formData.dueDate
          ? new Date(formData.dueDate).toISOString()
          : undefined,
      });
      router.push("/RFI/List");
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500";

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create RFI</h1>
          <p className="text-gray-400">Request for Information</p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              RFI Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-red-200">{error}</span>
              </div>
            )}

            {/* ── Basic Information ── */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    RFI Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="rfiNumber"
                    value={formData.rfiNumber}
                    onChange={handleChange}
                    placeholder="e.g. RFI-001"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Priority
                  </label>
                  <AppSelect
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={PRIORITIES}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief description of the clarification needed"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Question <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Detailed question requiring clarification…"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            {/* ── Project Hierarchy ── */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Project Hierarchy
              </h3>

              {/* Project */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Project <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                </label>
                <AppSelect
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  options={projects.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  placeholder="— Select Project —"
                />
              </div>

              {/* Site + Sub-Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Site{" "}
                    <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <AppSelect
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleChange}
                    options={sites.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder={
                      formData.projectId
                        ? sites.length
                          ? "— Select Site —"
                          : "No sites found"
                        : "— Select Project First —"
                    }
                    disabled={!formData.projectId || sites.length === 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Sub-Project{" "}
                    <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <AppSelect
                    name="subProjectId"
                    value={formData.subProjectId}
                    onChange={handleChange}
                    options={subProjects.map((s) => ({
                      value: s.id,
                      label: s.name,
                    }))}
                    placeholder={
                      formData.siteId
                        ? subProjects.length
                          ? "— Select Sub-Project —"
                          : "No sub-projects found"
                        : "— Select Site First —"
                    }
                    disabled={!formData.siteId || subProjects.length === 0}
                  />
                </div>
              </div>

              {/* Zone + Asset */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Zone{" "}
                    <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <AppSelect
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleChange}
                    options={zones.map((z) => ({ value: z.id, label: z.name }))}
                    placeholder={
                      formData.subProjectId
                        ? zones.length
                          ? "— Select Zone —"
                          : "No zones found"
                        : "— Select Sub-Project First —"
                    }
                    disabled={!formData.subProjectId || zones.length === 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Asset{" "}
                    <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <AppSelect
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleChange}
                    options={assets.map((a) => ({
                      value: a.id,
                      label: a.name,
                    }))}
                    placeholder={
                      formData.zoneId
                        ? assets.length
                          ? "— Select Asset —"
                          : "No assets found"
                        : "— Select Zone First —"
                    }
                    disabled={!formData.zoneId || assets.length === 0}
                  />
                </div>
              </div>
            </div>

            {/* ── Assignment ── */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <CompanySelect
                    value={formData.assignedToCompanyId}
                    onChange={(id) =>
                      setFormData((prev) => ({
                        ...prev,
                        assignedToCompanyId: id,
                      }))
                    }
                    companies={companies}
                    onCreated={(company) =>
                      setCompanies((prev) => [...prev, company])
                    }
                    label="Assign to Company"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Due Date{" "}
                    <span className="text-gray-500 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create RFI
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
