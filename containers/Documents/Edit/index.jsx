"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getDocumentById,
  updateDocument,
  requestReuploadUrl,
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
  if (file.type?.startsWith("image/")) return "";
  const ext = file.name?.split(".").pop()?.toLowerCase();
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

const formatSize = (bytes) => {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
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
        className="w-full px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none appearance-none disabled:opacity-50"
        style={{
          background: "var(--rf-bg2)",
          color: "var(--rf-txt)",
          boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
        }}
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

export default function DocumentEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Document
  const [doc, setDoc] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Cascade lookups (to resolve names for the read-only hierarchy display)
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);

  // Metadata form (only editable fields per PATCH /api/documents/:id)
  const [metaForm, setMetaForm] = useState({
    title: "",
    description: "",
    category: "GENERAL",
  });
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSuccess, setMetaSuccess] = useState(false);
  const [metaError, setMetaError] = useState("");

  // Re-upload state
  const [reuploadFile, setReuploadFile] = useState(null);
  const [reuploadCategory, setReuploadCategory] = useState("GENERAL");
  const [reuploadStep, setReuploadStep] = useState(0); // 0=idle 1=requesting 2=uploading 3=confirming 4=done
  const [reuploadProgress, setReuploadProgress] = useState(0);
  const [reuploadError, setReuploadError] = useState("");

  // ── Load document then cascade hierarchy names ─────────────────────────────

  useEffect(() => {
    if (!id) return;
    loadDoc();
  }, [id]);

  const loadDoc = async () => {
    setLoadingDoc(true);
    setLoadError("");
    try {
      const res = await getDocumentById(id);
      const data = res?.data || res;
      setDoc(data);
      setMetaForm({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "GENERAL",
      });
      setReuploadCategory(data.category || "GENERAL");

      // Load V2 projects + assets so we can show names next to IDs
      const pRes = await listV2Projects({ limit: 100 });
      setProjects(toArray(pRes));

      if (data.projectId) {
        const aRes = await listV2Assets(data.projectId, { limit: 100 });
        setAssets(toArray(aRes));
      }
    } catch (err) {
      setLoadError(err?.message || "Failed to load document.");
    } finally {
      setLoadingDoc(false);
    }
  };

  // Helper: resolve name from list by id
  const nameOf = (list, id) => list.find((x) => x.id === id)?.name || id || "—";

  // ── Metadata save ─────────────────────────────────────────────────────────

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMetaForm((p) => ({ ...p, [name]: value }));
  };

  const handleMetaSave = async (e) => {
    e.preventDefault();
    setMetaError("");
    setMetaSuccess(false);
    if (!metaForm.title.trim()) {
      setMetaError("Title is required.");
      return;
    }

    setSavingMeta(true);
    try {
      const payload = { title: metaForm.title.trim() };
      if (metaForm.description.trim())
        payload.description = metaForm.description.trim();
      if (metaForm.category) payload.category = metaForm.category;
      const res = await updateDocument(id, payload);
      setDoc(res?.data || res);
      setMetaSuccess(true);
      setTimeout(() => setMetaSuccess(false), 3000);
    } catch (err) {
      setMetaError(err?.message || "Failed to update metadata.");
    } finally {
      setSavingMeta(false);
    }
  };

  // ── Re-upload flow ────────────────────────────────────────────────────────

  const handleReuploadFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) setReuploadFile(file);
  };

  const handleReupload = async () => {
    if (!reuploadFile) {
      setReuploadError("Please select a file.");
      return;
    }
    setReuploadError("");
    try {
      setReuploadStep(1);
      const { uploadUrl } = await requestReuploadUrl(id, {
        fileName: reuploadFile.name,
        mimeType: reuploadFile.type,
        fileSize: reuploadFile.size,
        ...(reuploadCategory && { category: reuploadCategory }),
      });

      setReuploadStep(2);
      setReuploadProgress(0);
      await uploadFileToS3(uploadUrl, reuploadFile, setReuploadProgress);

      setReuploadStep(3);
      const res = await confirmUpload(id);
      setDoc(res?.data || res);

      setReuploadStep(4);
      setReuploadFile(null);
      setTimeout(() => setReuploadStep(0), 2500);
    } catch (err) {
      setReuploadError(err?.message || "Re-upload failed.");
      setReuploadStep(0);
    }
  };

  const isReuploading = reuploadStep > 0 && reuploadStep < 4;

  // ── Render guards ─────────────────────────────────────────────────────────

  if (loadingDoc) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{
              borderColor: "var(--rf-accent)",
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: "var(--rf-txt2)" }}>Loading document...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4" style={{ color: "var(--rf-red)" }}>
            {loadError}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg text-sm"
            style={{
              background: "var(--rf-bg3)",
              color: "var(--rf-txt)",
              border: "1px solid var(--rf-border2)",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isDeleted = doc?.status === "DELETED";

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "var(--rf-txt)" }}
            >
              Edit Document
            </h1>
            <p style={{ color: "var(--rf-txt2)" }}>{doc?.title}</p>
          </div>
          {doc?.status && (
            <span
              className={`mt-1 text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                doc.status === "ACTIVE"
                  ? "bg-green-500/20 text-green-300"
                  : doc.status === "DELETED"
                    ? "bg-red-500/20 text-red-300"
                    : "bg-gray-500/20 text-gray-300"
              }`}
            >
              {doc.status}
            </span>
          )}
        </div>

        {isDeleted && (
          <div
            className="rounded-xl p-4 text-sm mb-6"
            style={{
              background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
              color: "var(--rf-red)",
            }}
          >
            This document has been deleted and cannot be edited.
          </div>
        )}

        <div className="space-y-6">
          {/* ── Section 1: Metadata edit ── */}
          <div
            className="rounded-xl overflow-hidden shadow-2xl"
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
                Document Information
              </h2>
            </div>

            <form onSubmit={handleMetaSave} className="p-6 space-y-5">
              {metaError && (
                <div
                  className="rounded-lg p-4 flex items-start gap-3"
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
                  <span style={{ color: "var(--rf-red)" }}>{metaError}</span>
                </div>
              )}
              {metaSuccess && (
                <div
                  className="rounded-lg p-3 text-sm flex items-center gap-2"
                  style={{
                    background:
                      "color-mix(in srgb, var(--rf-green) 12%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--rf-green) 30%, transparent)",
                    color: "var(--rf-green)",
                  }}
                >
                  Metadata updated successfully.
                </div>
              )}

              {/* Title */}
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
                  value={metaForm.title}
                  onChange={handleMetaChange}
                  disabled={isDeleted || savingMeta}
                  className="w-full px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none disabled:opacity-50"
                  style={{
                    background: "var(--rf-bg2)",
                    color: "var(--rf-txt)",
                    boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--rf-txt)" }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={metaForm.description}
                  onChange={handleMetaChange}
                  rows={2}
                  disabled={isDeleted || savingMeta}
                  className="w-full px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50"
                  style={{
                    background: "var(--rf-bg2)",
                    color: "var(--rf-txt)",
                    boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                  }}
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
                  value={metaForm.category}
                  onChange={handleMetaChange}
                  options={CATEGORIES.map((c) => ({
                    value: c,
                    label: c.replace(/_/g, " "),
                  }))}
                  disabled={isDeleted || savingMeta}
                />
              </div>

              {/* ── Project Hierarchy (read-only display) ── */}
              <div
                className="pt-5"
                style={{ borderTop: "1px solid var(--rf-border2)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  Project Hierarchy{" "}
                  <span
                    className="font-normal normal-case ml-1"
                    style={{ color: "var(--rf-txt3)" }}
                  >
                    (not editable)
                  </span>
                </p>

                {/* Project */}
                <div className="mb-4">
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Project
                  </label>
                  <AppSelect
                    name="projectId"
                    value={doc?.projectId || ""}
                    onChange={() => {}}
                    options={projects.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                    placeholder={
                      doc?.projectId ? nameOf(projects, doc.projectId) : "—"
                    }
                    disabled={true}
                  />
                </div>

                {/* Asset */}
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
                    value={doc?.assetId || ""}
                    onChange={() => {}}
                    options={assets.map((a) => ({
                      value: a.id,
                      label: a.name,
                    }))}
                    placeholder={
                      doc?.assetId ? nameOf(assets, doc.assetId) : "—"
                    }
                    disabled={true}
                  />
                </div>
              </div>

              {/* File metadata (read-only) */}
              {doc && (
                <div
                  className="pt-5 space-y-3 rounded-lg p-4"
                  style={{
                    borderTop: "1px solid var(--rf-border2)",
                    background: "var(--rf-bg3)",
                  }}
                >
                  <h4
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--rf-txt2)" }}
                  >
                    Current File{" "}
                    <span
                      className="font-normal normal-case"
                      style={{ color: "var(--rf-txt3)" }}
                    >
                      (read-only)
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
                        File Name
                      </p>
                      <p
                        className="truncate mt-0.5"
                        style={{ color: "var(--rf-txt)" }}
                        title={doc.fileName}
                      >
                        {doc.fileName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
                        Size
                      </p>
                      <p className="mt-0.5" style={{ color: "var(--rf-txt)" }}>
                        {formatSize(doc.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
                        Version
                      </p>
                      <p className="mt-0.5" style={{ color: "var(--rf-txt)" }}>
                        v{doc.version || 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
                        MIME
                      </p>
                      <p
                        className="mt-0.5 truncate"
                        style={{ color: "var(--rf-txt)" }}
                      >
                        {doc.mimeType || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-3 rounded-xl font-medium transition-colors"
                  style={{
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt)",
                    border: "1px solid var(--rf-border2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleted || savingMeta}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
                  style={{
                    background: "var(--rf-accent)",
                    color: "#fff",
                    opacity: isDeleted || savingMeta ? 0.6 : 1,
                  }}
                >
                  {savingMeta ? (
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
                      Saving…
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Section 2: Replace File ── */}
          {!isDeleted && (
            <div
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              <div
                className="px-6 py-5 flex items-center gap-3"
                style={{ borderBottom: "1px solid var(--rf-border2)" }}
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: "var(--rf-accent)" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Replace File
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--rf-txt3)" }}>
                    Archives the current file as v{doc?.version || 1} and
                    creates a new version
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {reuploadError && (
                  <div
                    className="rounded-lg p-4 flex items-start gap-3"
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
                    <span style={{ color: "var(--rf-red)" }}>
                      {reuploadError}
                    </span>
                  </div>
                )}
                {reuploadStep === 4 && (
                  <div
                    className="rounded-lg p-3 text-sm flex items-center gap-2"
                    style={{
                      background:
                        "color-mix(in srgb, var(--rf-green) 12%, transparent)",
                      border:
                        "1px solid color-mix(in srgb, var(--rf-green) 30%, transparent)",
                      color: "var(--rf-green)",
                    }}
                  >
                    File replaced. Now at v{(doc?.version || 1) + 1}.
                  </div>
                )}
                {reuploadStep === 2 && (
                  <div>
                    <p className="text-sm mb-2" style={{ color: "var(--rf-txt)" }}>
                      Uploading... {reuploadProgress}%
                    </p>
                    <div
                      className="w-full rounded-full h-2"
                      style={{ background: "var(--rf-bg4)" }}
                    >
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${reuploadProgress}%`,
                          background: "var(--rf-accent)",
                        }}
                      />
                    </div>
                  </div>
                )}
                {reuploadStep === 3 && (
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--rf-txt2)" }}
                  >
                    <span
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: "var(--rf-accent)",
                        borderTopColor: "transparent",
                      }}
                    />
                    Confirming with server...
                  </div>
                )}

                {/* File picker */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Select Replacement File{" "}
                    <span style={{ color: "var(--rf-red)" }}>*</span>
                  </label>
                  <label
                    htmlFor="reupload-input"
                    className={`block rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isReuploading ? "pointer-events-none opacity-50" : ""
                    }`}
                    style={
                      reuploadFile
                        ? {
                            border: "2px dashed var(--rf-accent)",
                            background:
                              "color-mix(in srgb, var(--rf-accent) 6%, transparent)",
                          }
                        : { border: "2px dashed var(--rf-border3)" }
                    }
                  >
                    <input
                      id="reupload-input"
                      type="file"
                      className="hidden"
                      onChange={handleReuploadFileSelect}
                      disabled={isReuploading}
                    />
                    {reuploadFile ? (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1.5">
                          {FILE_ICON(reuploadFile)}
                        </span>
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {reuploadFile.name}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {(reuploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p
                          className="text-xs mt-2"
                          style={{ color: "var(--rf-accent)" }}
                        >
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-8 h-8 mb-2"
                          style={{ color: "var(--rf-txt3)" }}
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
                        <p className="text-sm" style={{ color: "var(--rf-txt2)" }}>
                          Select replacement file
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Category for new version */}
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Category for new version
                  </label>
                  <AppSelect
                    name="reuploadCategory"
                    value={reuploadCategory}
                    onChange={(e) => setReuploadCategory(e.target.value)}
                    options={CATEGORIES.map((c) => ({
                      value: c,
                      label: c.replace(/_/g, " "),
                    }))}
                    disabled={isReuploading}
                  />
                </div>

                <button
                  onClick={handleReupload}
                  disabled={!reuploadFile || isReuploading}
                  className="w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: "var(--rf-accent)",
                    color: "#fff",
                    opacity: !reuploadFile || isReuploading ? 0.6 : 1,
                  }}
                >
                  {isReuploading ? (
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
                      {reuploadStep === 1
                        ? "Requesting URL..."
                        : reuploadStep === 2
                          ? `Uploading ${reuploadProgress}%...`
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
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      Replace File (create new version)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
