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
  if (file.type?.startsWith("image/")) return "🖼️";
  const ext = file.name?.split(".").pop()?.toLowerCase();
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
  const [sites, setSites] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);

  // Linked entity dropdown
  const [linkedEntities, setLinkedEntities] = useState([]);
  const [loadingLinkedEntities, setLoadingLinkedEntities] = useState(false);

  // Metadata form (only editable fields per PATCH /api/documents/:id)
  const [metaForm, setMetaForm] = useState({
    title: "",
    description: "",
    category: "GENERAL",
    linkedToType: "",
    linkedToId: "",
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
        linkedToType: data.linkedToType || "",
        linkedToId: data.linkedToId || "",
      });
      setReuploadCategory(data.category || "GENERAL");

      // Load cascade lists so we can show names next to IDs
      if (data.projectId) {
        const pRes = await getProjects();
        setProjects(toArray(pRes));

        const sRes = await GetSites(data.projectId);
        setSites(toArray(sRes));

        if (data.siteId) {
          const spRes = await getProjects(25, 1, data.siteId, data.projectId);
          setSubProjects(toArray(spRes));

          if (data.subProjectId) {
            const zRes = await GetZones(data.subProjectId);
            setZones(toArray(zRes));

            if (data.zoneId) {
              const aRes = await GetEquipments(data.zoneId);
              setAssets(toArray(aRes));
            }
          }
        }
      }
    } catch (err) {
      setLoadError(err?.message || "Failed to load document.");
    } finally {
      setLoadingDoc(false);
    }
  };

  useEffect(() => {
    setLinkedEntities([]);
    const fetcher = LINKED_TYPE_FETCHERS[metaForm.linkedToType];
    if (!fetcher) return;

    let arg;
    if (metaForm.linkedToType === "CHECKLIST") {
      // Mirror ChecklistList: pass the deepest active hierarchy level from the document
      arg = doc?.assetId
        ? { assetId: doc.assetId }
        : doc?.zoneId
          ? { zoneId: doc.zoneId }
          : doc?.subProjectId
            ? { subProjectId: doc.subProjectId }
            : doc?.siteId
              ? { siteId: doc.siteId }
              : doc?.projectId
                ? { projectId: doc.projectId }
                : null;
      if (!arg) return;
    }

    setLoadingLinkedEntities(true);
    fetcher(arg)
      .then((d) => setLinkedEntities(toArray(d)))
      .catch(() => {})
      .finally(() => setLoadingLinkedEntities(false));
  }, [metaForm.linkedToType]);

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
    if (metaForm.linkedToType && !metaForm.linkedToId.trim()) {
      setMetaError("Linked Entity ID is required when Linked Type is set.");
      return;
    }

    setSavingMeta(true);
    try {
      const payload = { title: metaForm.title.trim() };
      if (metaForm.description.trim())
        payload.description = metaForm.description.trim();
      if (metaForm.category) payload.category = metaForm.category;
      if (metaForm.linkedToType) {
        payload.linkedToType = metaForm.linkedToType;
        payload.linkedToId = metaForm.linkedToId.trim();
      }
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
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading document...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{loadError}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm"
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
            <h1 className="text-4xl font-bold text-white mb-2">
              Edit Document
            </h1>
            <p className="text-gray-400">{doc?.title}</p>
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
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm mb-6">
            This document has been deleted and cannot be edited.
          </div>
        )}

        <div className="space-y-6">
          {/* ── Section 1: Metadata edit ── */}
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
                Document Information
              </h2>
            </div>

            <form onSubmit={handleMetaSave} className="p-6 space-y-5">
              {metaError && (
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
                  <span className="text-red-200">{metaError}</span>
                </div>
              )}
              {metaSuccess && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm flex items-center gap-2">
                  ✓ Metadata updated successfully.
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={metaForm.title}
                  onChange={handleMetaChange}
                  disabled={isDeleted || savingMeta}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={metaForm.description}
                  onChange={handleMetaChange}
                  rows={2}
                  disabled={isDeleted || savingMeta}
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
              <div className="border-t border-gray-700 pt-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Project Hierarchy{" "}
                  <span className="text-gray-600 font-normal normal-case ml-1">
                    (not editable)
                  </span>
                </p>

                {/* Project */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-white mb-2">
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

                {/* Site + Sub-Project */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Site
                    </label>
                    <AppSelect
                      name="siteId"
                      value={doc?.siteId || ""}
                      onChange={() => {}}
                      options={sites.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                      placeholder={
                        doc?.siteId ? nameOf(sites, doc.siteId) : "—"
                      }
                      disabled={true}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Sub-Project
                    </label>
                    <AppSelect
                      name="subProjectId"
                      value={doc?.subProjectId || ""}
                      onChange={() => {}}
                      options={subProjects.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
                      placeholder={
                        doc?.subProjectId
                          ? nameOf(subProjects, doc.subProjectId)
                          : "—"
                      }
                      disabled={true}
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
                      value={doc?.zoneId || ""}
                      onChange={() => {}}
                      options={zones.map((z) => ({
                        value: z.id,
                        label: z.name,
                      }))}
                      placeholder={
                        doc?.zoneId ? nameOf(zones, doc.zoneId) : "—"
                      }
                      disabled={true}
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
              </div>

              {/* ── Linked Entity ── */}
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
                      value={metaForm.linkedToType}
                      onChange={(e) =>
                        setMetaForm((p) => ({
                          ...p,
                          linkedToType: e.target.value,
                          linkedToId: "",
                        }))
                      }
                      options={LINKED_TYPES.map((t) => ({
                        value: t,
                        label: t,
                      }))}
                      placeholder="— None —"
                      disabled={isDeleted || savingMeta}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Linked Entity{" "}
                      {metaForm.linkedToType && (
                        <span className="text-red-400">*</span>
                      )}
                    </label>
                    {metaForm.linkedToType &&
                    metaForm.linkedToType !== "OTHER" ? (
                      <AppSelect
                        name="linkedToId"
                        value={metaForm.linkedToId}
                        onChange={handleMetaChange}
                        options={linkedEntities.map((e) => ({
                          value: e.id,
                          label: getEntityLabel(metaForm.linkedToType, e),
                        }))}
                        placeholder={
                          loadingLinkedEntities
                            ? "Loading…"
                            : linkedEntities.length
                              ? "— Select —"
                              : "No entities found"
                        }
                        disabled={
                          isDeleted ||
                          savingMeta ||
                          loadingLinkedEntities ||
                          linkedEntities.length === 0
                        }
                      />
                    ) : (
                      <input
                        type="text"
                        name="linkedToId"
                        value={metaForm.linkedToId}
                        onChange={handleMetaChange}
                        placeholder={
                          metaForm.linkedToType === "OTHER"
                            ? "Entity UUID"
                            : "Select a type first"
                        }
                        disabled={
                          isDeleted || savingMeta || !metaForm.linkedToType
                        }
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* File metadata (read-only) */}
              {doc && (
                <div className="border-t border-gray-700 pt-5 space-y-3 bg-gray-700/30 rounded-lg p-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Current File{" "}
                    <span className="text-gray-600 font-normal normal-case">
                      (read-only)
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">File Name</p>
                      <p
                        className="text-white truncate mt-0.5"
                        title={doc.fileName}
                      >
                        {doc.fileName || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Size</p>
                      <p className="text-white mt-0.5">
                        {formatSize(doc.fileSize)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Version</p>
                      <p className="text-white mt-0.5">v{doc.version || 1}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">MIME</p>
                      <p className="text-white mt-0.5 truncate">
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
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleted || savingMeta}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
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
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
              <div className="px-6 py-5 border-b border-gray-700 flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-orange-400"
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
                  <h2 className="text-lg font-semibold text-white">
                    Replace File
                  </h2>
                  <p className="text-gray-500 text-xs mt-0.5">
                    Archives the current file as v{doc?.version || 1} and
                    creates a new version
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {reuploadError && (
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
                    <span className="text-red-200">{reuploadError}</span>
                  </div>
                )}
                {reuploadStep === 4 && (
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 text-green-300 text-sm flex items-center gap-2">
                    ✓ File replaced. Now at v{(doc?.version || 1) + 1}.
                  </div>
                )}
                {reuploadStep === 2 && (
                  <div>
                    <p className="text-white text-sm mb-2">
                      Uploading... {reuploadProgress}%
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${reuploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {reuploadStep === 3 && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Confirming with server...
                  </div>
                )}

                {/* File picker */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Select Replacement File{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <label
                    htmlFor="reupload-input"
                    className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      reuploadFile
                        ? "border-orange-500 bg-orange-500/5"
                        : "border-gray-600 hover:border-orange-500/50"
                    } ${isReuploading ? "pointer-events-none opacity-50" : ""}`}
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
                        <p className="text-white font-medium text-sm">
                          {reuploadFile.name}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {(reuploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-orange-400 text-xs mt-2">
                          Click to change
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-8 h-8 text-gray-400 mb-2"
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
                        <p className="text-gray-300 text-sm">
                          Select replacement file
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Category for new version */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
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
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
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
