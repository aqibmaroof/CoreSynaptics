"use client";

import { useState, useEffect } from "react";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { GetEquipments } from "@/services/Equipment";

const SUBMITTAL_TYPES = [
  { value: "SHOP_DRAWING", label: "Shop Drawing" },
  { value: "PRODUCT_DATA", label: "Product Data" },
  { value: "SAMPLE", label: "Sample" },
  { value: "OPERATION_MAINTENANCE", label: "O&M Manual" },
  { value: "CLOSEOUT", label: "Closeout" },
  { value: "TEST_REPORT", label: "Test Report" },
  { value: "OTHER", label: "Other" },
];

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ??
        data?.projects ??
        data?.sites ??
        data?.zones ??
        data?.equipment ??
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
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all [&_option]:bg-gray-700 appearance-none disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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

export default function SubmittalForm({ onSubmit, loading, companies, users }) {
  // ── Cascade state ─────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);

  const [form, setForm] = useState({
    projectId: "",
    siteId: "",
    subProjectId: "",
    zoneId: "",
    assetId: "",
    title: "",
    description: "",
    type: "SHOP_DRAWING",
    specSection: "",
    tradeCompanyId: "",
    reviewerCompanyId: "",
    reviewerUserId: "",
    taskId: "",
    dueDate: "",
  });

  // Load projects on mount
  useEffect(() => {
    getProjects()
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
  }, []);

  // Project → Sites
  useEffect(() => {
    setSites([]);
    setSubProjects([]);
    setZones([]);
    setAssets([]);
    setForm((p) => ({
      ...p,
      siteId: "",
      subProjectId: "",
      zoneId: "",
      assetId: "",
    }));
    if (!form.projectId) return;
    GetSites(form.projectId)
      .then((d) => setSites(toArray(d)))
      .catch(() => {});
  }, [form.projectId]);

  // Site → SubProjects
  useEffect(() => {
    setSubProjects([]);
    setZones([]);
    setAssets([]);
    setForm((p) => ({ ...p, subProjectId: "", zoneId: "", assetId: "" }));
    if (!form.siteId) return;
    getProjects(25, 1, form.siteId, form.projectId)
      .then((d) => setSubProjects(toArray(d)))
      .catch(() => {});
  }, [form.siteId]);

  // SubProject → Zones
  useEffect(() => {
    setZones([]);
    setAssets([]);
    setForm((p) => ({ ...p, zoneId: "", assetId: "" }));
    if (!form.subProjectId) return;
    GetZones(form.subProjectId)
      .then((d) => setZones(toArray(d)))
      .catch(() => {});
  }, [form.subProjectId]);

  // Zone → Assets
  useEffect(() => {
    setAssets([]);
    setForm((p) => ({ ...p, assetId: "" }));
    if (!form.zoneId) return;
    GetEquipments(form.zoneId)
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, [form.zoneId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.dueDate)
      payload.dueDate = new Date(payload.dueDate).toISOString();
    // Strip empty optional fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === null) delete payload[key];
    });
    onSubmit(payload);
  };

  const inputClass =
    "w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all";
  const labelClass = "text-sm text-gray-300 mb-1 block";

  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
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
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
          </svg>
          Submittal Details
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 space-y-6">
        {/* ── Section 1: Project Hierarchy ── */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Project Hierarchy
          </h3>

          {/* Project */}
          <div className="mb-4">
            <label className={labelClass}>Project *</label>
            <AppSelect
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              placeholder="— Select Project —"
              required
            />
          </div>

          {/* Site + Sub-Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Site</label>
              <AppSelect
                name="siteId"
                value={form.siteId}
                onChange={handleChange}
                options={sites.map((s) => ({ value: s.id, label: s.name }))}
                placeholder={
                  form.projectId
                    ? sites.length
                      ? "— Select Site —"
                      : "No sites found"
                    : "— Select Project First —"
                }
                disabled={!form.projectId || sites.length === 0}
              />
            </div>
            <div>
              <label className={labelClass}>Sub-Project</label>
              <AppSelect
                name="subProjectId"
                value={form.subProjectId}
                onChange={handleChange}
                options={subProjects.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                placeholder={
                  form.siteId
                    ? subProjects.length
                      ? "— Select Sub-Project —"
                      : "No sub-projects found"
                    : "— Select Site First —"
                }
                disabled={!form.siteId || subProjects.length === 0}
              />
            </div>
          </div>

          {/* Zone + Asset */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Zone <span className="text-gray-500">(optional)</span>
              </label>
              <AppSelect
                name="zoneId"
                value={form.zoneId}
                onChange={handleChange}
                options={zones.map((z) => ({ value: z.id, label: z.name }))}
                placeholder={
                  form.subProjectId
                    ? zones.length
                      ? "— Select Zone —"
                      : "No zones found"
                    : "— Select Sub-Project First —"
                }
                disabled={!form.subProjectId || zones.length === 0}
              />
            </div>
            <div>
              <label className={labelClass}>
                Asset <span className="text-gray-500">(optional)</span>
              </label>
              <AppSelect
                name="assetId"
                value={form.assetId}
                onChange={handleChange}
                options={assets.map((a) => ({ value: a.id, label: a.name }))}
                placeholder={
                  form.zoneId
                    ? assets.length
                      ? "— Select Asset —"
                      : "No assets found"
                    : "— Select Zone First —"
                }
                disabled={!form.zoneId || assets.length === 0}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Submittal Info ── */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Submittal Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Title */}
            <div className="lg:col-span-2 flex flex-col">
              <label className={labelClass}>Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. UPS-101 Shop Drawing - Primary Feed"
                className={inputClass}
                required
              />
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label className={labelClass}>Type *</label>
              <AppSelect
                name="type"
                value={form.type}
                onChange={handleChange}
                options={SUBMITTAL_TYPES}
                required
              />
            </div>

            {/* Spec Section */}
            <div className="flex flex-col">
              <label className={labelClass}>Spec Section</label>
              <input
                name="specSection"
                value={form.specSection}
                onChange={handleChange}
                placeholder="e.g. 16480"
                className={inputClass}
              />
            </div>

            {/* Due Date */}
            <div className="flex flex-col">
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col mt-5">
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputClass} h-28 resize-none`}
              placeholder="Describe the submittal content, scope, and relevant details..."
            />
          </div>
        </div>

        {/* ── Section 3: Review & Assignment ── */}
        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Review &amp; Assignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Trade Company */}
            <div className="flex flex-col">
              <label className={labelClass}>Trade Company</label>
              <AppSelect
                name="tradeCompanyId"
                value={form.tradeCompanyId}
                onChange={handleChange}
                options={(companies ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder="— Select Company —"
              />
            </div>

            {/* Reviewer Company */}
            <div className="flex flex-col">
              <label className={labelClass}>Reviewer Company</label>
              <AppSelect
                name="reviewerCompanyId"
                value={form.reviewerCompanyId}
                onChange={handleChange}
                options={(companies ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder="— Select Company —"
              />
            </div>

            {/* Reviewer User */}
            <div className="flex flex-col">
              <label className={labelClass}>Reviewed By</label>
              <AppSelect
                name="reviewerUserId"
                value={form.reviewerUserId}
                onChange={handleChange}
                options={(users ?? []).map((u) => ({
                  value: u.id,
                  label:
                    `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                    u.email ||
                    u.id,
                }))}
                placeholder="— Select User —"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
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
            "Create Submittal"
          )}
        </button>
      </form>
    </div>
  );
}
