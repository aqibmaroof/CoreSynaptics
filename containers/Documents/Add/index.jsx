"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  requestUploadUrl,
  uploadFileToS3,
  confirmUpload,
} from "@/services/Documents";
import { listV2Projects, listV2Assets } from "@/services/CxProjectsV2";

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

const FILE_ICON = (file) => {
  if (!file) return "";
  if (file.type.startsWith("image/")) return "";
  const ext = file.name.split(".").pop()?.toLowerCase();
  const map = {
    pdf: "",
    doc: "",
    docx: "",
    xls: "",
    xlsx: "",
    ppt: "",
    pptx: "",
    zip: "",
    txt: "",
  };
  return map[ext] || "";
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
        style={{
          background: "var(--rf-bg2)",
          color: "var(--rf-txt)",
          boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
        }}
        className="w-full px-4 py-2 rounded-lg outline-none appearance-none disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
        style={{ color: "var(--rf-txt3)" }}
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
  assetId: "",
  category: "GENERAL",
};

export default function DocumentAdd() {
  const router = useRouter();

  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Cascade lists
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);

  // Upload flow state
  const [step, setStep] = useState(0); // 0=idle 1=requesting 2=uploading 3=confirming 4=done
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // ── Cascade effects ────────────────────────────────────────────────────────

  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setAssets([]);
    setForm((p) => ({ ...p, assetId: "" }));
    if (!form.projectId) return;
    listV2Assets(form.projectId, { limit: 100 })
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, [form.projectId]);

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
    if (!selectedFile) return "Please select a file to upload.";
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
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
      };
      if (form.description.trim())
        payload.description = form.description.trim();
      if (form.projectId) payload.cxProjectId = form.projectId;
      if (form.assetId) payload.assetId = form.assetId;
      if (form.category) payload.category = form.category;

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
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--rf-txt)" }}
          >
            Upload Document
          </h1>
          <p style={{ color: "var(--rf-txt2)" }}>
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
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={
                    done
                      ? { background: "var(--rf-green)", color: "#fff" }
                      : active
                        ? { background: "var(--rf-accent)", color: "#fff" }
                        : { background: "var(--rf-bg3)", color: "var(--rf-txt3)" }
                  }
                >
                  {done ? "" : stepNum}
                </div>
                <span
                  className={`text-xs ${active ? "font-medium" : ""}`}
                  style={{
                    color: active
                      ? "var(--rf-txt)"
                      : done
                        ? "var(--rf-green)"
                        : "var(--rf-txt3)",
                  }}
                >
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className="w-8 h-px mx-1"
                    style={{ background: "var(--rf-border2)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Success */}
        {step === 4 && (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              background: "color-mix(in srgb, var(--rf-green) 12%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--rf-green) 30%, transparent)",
            }}
          >
            <div className="text-4xl mb-3"></div>
            <p
              className="font-semibold text-lg"
              style={{ color: "var(--rf-green)" }}
            >
              Document uploaded successfully!
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--rf-txt2)" }}>
              Redirecting...
            </p>
          </div>
        )}

        {step !== 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div
                className="rounded-lg p-4 mb-6 flex items-start gap-3"
                style={{
                  background:
                    "color-mix(in srgb, var(--rf-red) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
                }}
              >
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--rf-red)" }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span style={{ color: "var(--rf-red)" }}>{error}</span>
              </div>
            )}

            {/* Upload progress */}
            {step === 2 && (
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--rf-bg2)",
                  border: "1px solid var(--rf-border2)",
                }}
              >
                <p
                  className="text-sm font-medium mb-3"
                  style={{ color: "var(--rf-txt)" }}
                >
                  Uploading to S3... {progress}%
                </p>
                <div
                  className="w-full rounded-full h-2"
                  style={{ background: "var(--rf-bg4)" }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-200"
                    style={{
                      width: `${progress}%`,
                      background: "var(--rf-accent)",
                    }}
                  />
                </div>
              </div>
            )}
            {step === 3 && (
              <div
                className="rounded-xl p-5 flex items-center gap-3"
                style={{
                  background: "var(--rf-bg2)",
                  border: "1px solid var(--rf-border2)",
                }}
              >
                <div
                  className="w-5 h-5 border-2 rounded-full animate-spin flex-shrink-0"
                  style={{
                    borderColor: "var(--rf-accent)",
                    borderTopColor: "transparent",
                  }}
                />
                <p className="text-sm" style={{ color: "var(--rf-txt)" }}>
                  Confirming upload with the server...
                </p>
              </div>
            )}

            {/* ── Main form card ── */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              <div
                className="px-6 py-5 flex items-center gap-3"
                style={{ background: "var(--rf-accent)" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: "#fff" }}
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
                <h2 className="text-lg font-semibold" style={{ color: "#fff" }}>
                  Document Details
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* File picker */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    File <span style={{ color: "var(--rf-red)" }}>*</span>
                  </label>
                  <label
                    htmlFor="file-input"
                    className={`block rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isUploading ? "pointer-events-none opacity-50" : ""
                    }`}
                    style={
                      selectedFile
                        ? {
                            border: "2px dashed var(--rf-accent)",
                            background:
                              "color-mix(in srgb, var(--rf-accent) 6%, transparent)",
                          }
                        : { border: "2px dashed var(--rf-border3)" }
                    }
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
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {selectedFile.name}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {selectedFile.type} ·{" "}
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p
                          className="text-xs mt-2"
                          style={{ color: "var(--rf-accent)" }}
                        >
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-10 h-10 mb-2"
                          style={{ color: "var(--rf-accent)" }}
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
                        <p
                          className="font-medium"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          Drag & drop or click to select
                        </p>
                        <p
                          className="text-sm mt-1"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          Any file type supported
                        </p>
                      </div>
                    )}
                  </label>
                  {filePreview && (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="mt-3 max-h-40 rounded-lg border object-contain"
                      style={{ borderColor: "var(--rf-border2)" }}
                    />
                  )}
                </div>

                {/* Title + Description */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Title <span style={{ color: "var(--rf-red)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. L2 Power Test Report"
                    disabled={isUploading}
                    style={{
                      background: "var(--rf-bg2)",
                      color: "var(--rf-txt)",
                      boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                    }}
                    className="w-full px-4 py-2 rounded-lg outline-none placeholder-gray-400 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Optional description…"
                    disabled={isUploading}
                    style={{
                      background: "var(--rf-bg2)",
                      color: "var(--rf-txt)",
                      boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                    }}
                    className="w-full px-4 py-2 rounded-lg outline-none placeholder-gray-400 resize-none disabled:opacity-50"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
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
                <div
                  className="border-t pt-5"
                  style={{ borderColor: "var(--rf-border2)" }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-4"
                    style={{ color: "var(--rf-txt2)" }}
                  >
                    Project Hierarchy
                  </p>

                  {/* Project + Asset */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "var(--rf-txt)" }}
                      >
                        Project{" "}
                        <span
                          className="font-normal"
                          style={{ color: "var(--rf-txt3)" }}
                        >
                          (optional)
                        </span>
                      </label>
                      <AppSelect
                        name="projectId"
                        value={form.projectId}
                        onChange={handleChange}
                        options={projects.map((p) => ({
                          value: p.id,
                          label: p.projectName,
                        }))}
                        placeholder="— Select Project —"
                        disabled={isUploading}
                      />
                    </div>
                    <div>
                      <label
                        className="block text-sm font-semibold mb-2"
                        style={{ color: "var(--rf-txt)" }}
                      >
                        Asset{" "}
                        <span
                          className="font-normal"
                          style={{ color: "var(--rf-txt3)" }}
                        >
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
                          form.projectId
                            ? assets.length
                              ? "— Select Asset —"
                              : "No assets found"
                            : "— Select Project First —"
                        }
                        disabled={
                          isUploading || !form.projectId || assets.length === 0
                        }
                      />
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
                style={{
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt)",
                  border: "1px solid var(--rf-border2)",
                }}
                className="flex-1 px-4 py-3 disabled:opacity-50 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  opacity: isUploading || !selectedFile ? 0.6 : 1,
                }}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
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
