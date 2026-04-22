"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  requestUploadUrl,
  uploadFileToS3,
  confirmUpload,
} from "@/services/Documents";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { GetEquipments } from "@/services/Equipment";
import { getAllTasks } from "@/services/Tasks";
import { getChecklists } from "@/services/Checklist";
import { getAssets } from "@/services/AssetManagement";
import { getIssues } from "@/services/Issues";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "GENERAL",
  "COMMISSIONING",
  "QA_QC",
  "FIELD_EXECUTION",
  "ASSET",
  "SAFETY",
  "CONTRACT",
];
const LINKED_TYPES = ["TASK", "CHECKLIST", "ASSET", "QA", "OTHER"];
const STEP_LABELS = ["Fill Details", "Uploading to S3", "Confirming"];

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ??
        data?.projects ??
        data?.sites ??
        data?.zones ??
        data?.equipment ??
        data?.tasks ??
        data?.checklists ??
        data?.assets ??
        data?.issues ??
        []);
}

const LINKED_TYPE_FETCHERS = {
  TASK: () => getAllTasks(),
  CHECKLIST: (filter) => getChecklists(filter),
  ASSET: () => getAssets(),
  QA: () => getIssues(),
};

function getEntityLabel(type, entity) {
  if (type === "ASSET") return entity.name || entity.id;
  return entity.title || entity.name || entity.id;
}

const FILE_ICON = (file) => {
  if (!file) return "📁";
  if (file.type.startsWith("image/")) return "🖼️";
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    xls: "📊",
    xlsx: "📊",
    ppt: "🎪",
    pptx: "🎪",
    zip: "🗜️",
    txt: "📄",
  };
  return map[ext] || "📁";
};

// ─── Reusable select (matches Checklist pattern) ──────────────────────────────

function AppSelect({ name, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
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

// ─── Component ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  description: "",
  projectId: "",
  siteId: "",
  subProjectId: "",
  zoneId: "",
  assetId: "",
  category: "GENERAL",
  linkedToType: "",
  linkedToId: "",
};

export default function DocumentAdd() {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Cascade lists
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);

  // Linked entity dropdown
  const [linkedEntities, setLinkedEntities] = useState([]);
  const [loadingLinkedEntities, setLoadingLinkedEntities] = useState(false);

  // Upload flow state
  const [step, setStep] = useState(0); // 0=idle 1=requesting 2=uploading 3=confirming 4=done
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // ── Cascade effects (same as Checklist) ───────────────────────────────────

  useEffect(() => {
    getProjects()
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
  }, []);

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

  useEffect(() => {
    setZones([]);
    setAssets([]);
    setForm((p) => ({ ...p, zoneId: "", assetId: "" }));
    if (!form.subProjectId) return;
    GetZones(form.subProjectId)
      .then((d) => setZones(toArray(d)))
      .catch(() => {});
  }, [form.subProjectId]);

  useEffect(() => {
    setAssets([]);
    setForm((p) => ({ ...p, assetId: "" }));
    if (!form.zoneId) return;
    GetEquipments(form.zoneId)
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, [form.zoneId]);

  useEffect(() => {
    setLinkedEntities([]);
    setForm((p) => ({ ...p, linkedToId: "" }));
    const fetcher = LINKED_TYPE_FETCHERS[form.linkedToType];
    if (!fetcher) return;

    let arg;
    if (form.linkedToType === "CHECKLIST") {
      // Mirror ChecklistList: pass the deepest active hierarchy level
      arg = form.assetId
        ? { assetId: form.assetId }
        : form.zoneId
          ? { zoneId: form.zoneId }
          : form.subProjectId
            ? { subProjectId: form.subProjectId }
            : form.siteId
              ? { siteId: form.siteId }
              : form.projectId
                ? { projectId: form.projectId }
                : null;
      if (!arg) return; // no hierarchy selected yet — nothing to fetch
    }

    setLoadingLinkedEntities(true);
    fetcher(arg)
      .then((d) => setLinkedEntities(toArray(d)))
      .catch(() => {})
      .finally(() => setLoadingLinkedEntities(false));
  }, [form.linkedToType]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const validate = () => {
    if (!form.title.trim()) return "Title is required.";
    if (!form.projectId) return "Project is required.";
    if (!form.siteId) return "Site is required.";
    if (!form.subProjectId) return "Sub-Project is required.";
    if (!selectedFile) return "Please select a file to upload.";
    if (form.linkedToType && !form.linkedToId.trim())
      return "Linked Entity ID is required when Linked Type is set.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");

    try {
      // Step 1 — request presigned URL
      setStep(1);
      const payload = {
        title: form.title.trim(),
        projectId: form.projectId,
        siteId: form.siteId,
        subProjectId: form.subProjectId,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
      };
      if (form.description.trim())
        payload.description = form.description.trim();
      if (form.zoneId) payload.zoneId = form.zoneId;
      if (form.assetId) payload.assetId = form.assetId;
      if (form.category) payload.category = form.category;
      if (form.linkedToType) {
        payload.linkedToType = form.linkedToType;
        payload.linkedToId = form.linkedToId.trim();
      }

      const { uploadUrl, documentId } = await requestUploadUrl(payload);

      // Step 2 — PUT file to S3
      setStep(2);
      setProgress(0);
      await uploadFileToS3(uploadUrl, selectedFile, setProgress);

      // Step 3 — confirm
      setStep(3);
      await confirmUpload(documentId);

      setStep(4);
      setTimeout(() => router.push("/Document/List"), 1200);
    } catch (err) {
      setError(err?.message || "Upload failed. Please try again.");
      setStep(0);
    }
  };

  const isUploading = step > 0 && step < 4;

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Upload Document
          </h1>
          <p className="text-gray-400">
            3-step process: fill details → upload to S3 → confirm
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const active = step === stepNum;
            const done = step > stepNum || step === 4;
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    done
                      ? "bg-green-600 text-white"
                      : active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {done ? "✓" : stepNum}
                </div>
                <span
                  className={`text-xs ${active ? "text-white font-medium" : done ? "text-green-400" : "text-gray-500"}`}
                >
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className="w-8 h-px bg-gray-700 mx-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Success */}
        {step === 4 && (
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-green-300 font-semibold text-lg">
              Document uploaded successfully!
            </p>
            <p className="text-gray-400 text-sm mt-1">Redirecting...</p>
          </div>
        )}

        {step !== 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
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

            {/* Upload progress */}
            {step === 2 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <p className="text-white text-sm font-medium mb-3">
                  Uploading to S3... {progress}%
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <p className="text-white text-sm">
                  Confirming upload with the server...
                </p>
              </div>
            )}

            {/* ── Main form card ── */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-5 flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-white"
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
                <h2 className="text-lg font-semibold text-white">
                  Document Details
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* File picker */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    File <span className="text-red-400">*</span>
                  </label>
                  <label
                    htmlFor="file-input"
                    className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      selectedFile
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-gray-600 hover:border-blue-500/50"
                    } ${isUploading ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    {selectedFile ? (
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-2">
                          {FILE_ICON(selectedFile)}
                        </span>
                        <p className="text-white font-medium text-sm">
                          {selectedFile.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {selectedFile.type} ·{" "}
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-blue-400 text-xs mt-2">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-10 h-10 text-gray-400 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-white font-medium">
                          Drag & drop or click to select
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          Any file type supported
                        </p>
                      </div>
                    )}
                  </label>
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="mt-3 max-h-40 rounded-lg border border-gray-600 object-contain"
                    />
                  )}
                </div>

                {/* Title + Description */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. L2 Power Test Report"
                    disabled={isUploading}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Optional description…"
                    disabled={isUploading}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category
                  </label>
                  <AppSelect
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    options={CATEGORIES.map((c) => ({
                      value: c,
                      label: c.replace(/_/g, " "),
                    }))}
                    disabled={isUploading}
                  />
                </div>

                {/* ── Project Hierarchy ── */}
                <div className="border-t border-gray-700 pt-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Project Hierarchy
                  </p>

                  {/* Project */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-white mb-2">
                      Project <span className="text-red-400">*</span>
                    </label>
                    <AppSelect
                      name="projectId"
                      value={form.projectId}
                      onChange={handleChange}
                      options={projects.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                      placeholder="— Select Project —"
                      disabled={isUploading}
                    />
                  </div>

                  {/* Site + Sub-Project */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Site <span className="text-red-400">*</span>
                      </label>
                      <AppSelect
                        name="siteId"
                        value={form.siteId}
                        onChange={handleChange}
                        options={sites.map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                        placeholder={
                          form.projectId
                            ? sites.length
                              ? "— Select Site —"
                              : "No sites found"
                            : "— Select Project First —"
                        }
                        disabled={
                          isUploading || !form.projectId || sites.length === 0
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Sub-Project <span className="text-red-400">*</span>
                      </label>
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
                        disabled={
                          isUploading ||
                          !form.siteId ||
                          subProjects.length === 0
                        }
                      />
                    </div>
                  </div>

                  {/* Zone + Asset (optional) */}
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
                        value={form.zoneId}
                        onChange={handleChange}
                        options={zones.map((z) => ({
                          value: z.id,
                          label: z.name,
                        }))}
                        placeholder={
                          form.subProjectId
                            ? zones.length
                              ? "— Select Zone —"
                              : "No zones found"
                            : "— Select Sub-Project First —"
                        }
                        disabled={
                          isUploading ||
                          !form.subProjectId ||
                          zones.length === 0
                        }
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
                        value={form.assetId}
                        onChange={handleChange}
                        options={assets.map((a) => ({
                          value: a.id,
                          label: a.name,
                        }))}
                        placeholder={
                          form.zoneId
                            ? assets.length
                              ? "— Select Asset —"
                              : "No assets found"
                            : "— Select Zone First —"
                        }
                        disabled={
                          isUploading || !form.zoneId || assets.length === 0
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* ── Linked Entity (optional) ── */}
                <div className="border-t border-gray-700 pt-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    Link to Entity{" "}
                    <span className="text-gray-600 font-normal normal-case">
                      (optional)
                    </span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Linked Type
                      </label>
                      <AppSelect
                        name="linkedToType"
                        value={form.linkedToType}
                        onChange={handleChange}
                        options={LINKED_TYPES.map((t) => ({
                          value: t,
                          label: t,
                        }))}
                        placeholder="— None —"
                        disabled={isUploading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Linked Entity{" "}
                        {form.linkedToType && (
                          <span className="text-red-400">*</span>
                        )}
                      </label>
                      {form.linkedToType && form.linkedToType !== "OTHER" ? (
                        <AppSelect
                          name="linkedToId"
                          value={form.linkedToId}
                          onChange={handleChange}
                          options={linkedEntities.map((e) => ({
                            value: e.id,
                            label: getEntityLabel(form.linkedToType, e),
                          }))}
                          placeholder={
                            loadingLinkedEntities
                              ? "Loading…"
                              : linkedEntities.length
                                ? "— Select —"
                                : "No entities found"
                          }
                          disabled={
                            isUploading ||
                            loadingLinkedEntities ||
                            linkedEntities.length === 0
                          }
                        />
                      ) : (
                        <input
                          type="text"
                          name="linkedToId"
                          value={form.linkedToId}
                          onChange={handleChange}
                          placeholder={
                            form.linkedToType === "OTHER"
                              ? "Entity UUID"
                              : "Select a type first"
                          }
                          disabled={isUploading || !form.linkedToType}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-8">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isUploading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
              >
                {isUploading ? (
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
                    {step === 1
                      ? "Requesting URL..."
                      : step === 2
                        ? `Uploading ${progress}%...`
                        : "Confirming..."}
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
