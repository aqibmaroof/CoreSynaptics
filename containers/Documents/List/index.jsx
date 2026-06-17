"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDocuments,
  getDownloadUrl,
  deleteDocument,
} from "@/services/Documents";
import { listV2Projects, listV2Assets } from "@/services/CxProjectsV2";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "COMMISSIONING",
  "QA_QC",
  "FIELD_EXECUTION",
  "ASSET",
  "SAFETY",
  "CONTRACT",
  "GENERAL",
];

const CATEGORY_TOKEN = {
  COMMISSIONING: "var(--rf-accent)",
  QA_QC: "var(--rf-purple)",
  FIELD_EXECUTION: "var(--rf-orange)",
  ASSET: "var(--rf-teal)",
  SAFETY: "var(--rf-red)",
  CONTRACT: "var(--rf-yellow)",
  GENERAL: "var(--rf-txt3)",
};

const categoryBadgeStyle = (category) => {
  const token = CATEGORY_TOKEN[category] || CATEGORY_TOKEN.GENERAL;
  return {
    background: `color-mix(in srgb, ${token} 14%, transparent)`,
    color: token,
    border: `1px solid color-mix(in srgb, ${token} 32%, transparent)`,
  };
};

const FILE_ICON = (mimeType = "", fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (mimeType.startsWith("image/"))
    return { icon: "", color: "text-pink-400" };
  if (ext === "pdf" || mimeType === "application/pdf")
    return { icon: "", color: "text-red-400" };
  if (["doc", "docx"].includes(ext))
    return { icon: "", color: "text-blue-400" };
  if (["xls", "xlsx"].includes(ext))
    return { icon: "", color: "text-green-400" };
  if (["ppt", "pptx"].includes(ext))
    return { icon: "", color: "text-orange-400" };
  if (["zip", "rar", "7z"].includes(ext))
    return { icon: "", color: "text-purple-400" };
  return { icon: "", color: "text-gray-400" };
};

const formatSize = (bytes) => {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// ─── Tolerant array extraction ──────────────────────────────────────────────────

const toRows = (res) => {
  const d = res?.data ?? res;
  return Array.isArray(d) ? d : (d?.data ?? d?.items ?? []);
};

export default function DocumentList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = useUserPermissions();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter state
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [selProject, setSelProject] = useState("");
  const [selAsset, setSelAsset] = useState("");

  // UI filters (client-side)
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Actions
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // Load projects on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await listV2Projects({ limit: 100 });
        if (active) setProjects(toRows(res));
      } catch {
        if (active) setProjects([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Load assets when the selected project changes
  useEffect(() => {
    setAssets([]);
    setSelAsset("");
    if (!selProject) return;
    let active = true;
    (async () => {
      try {
        const res = await listV2Assets(selProject, { limit: 100 });
        if (active) setAssets(toRows(res));
      } catch {
        if (active) setAssets([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [selProject]);

  const fetchDocuments = useCallback(async () => {
    if (!selProject) {
      setDocuments([]);
      return;
    }
    const params = {};
    if (selProject) params.projectId = selProject;
    if (selAsset) params.assetId = selAsset;

    setLoading(true);
    setError("");
    try {
      const res = await getDocuments(params);
      setDocuments(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load documents.");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [selProject, selAsset]);

  // Re-fetch when the selected project/asset changes.
  // fetchDocuments closes over selProject/selAsset and clears documents itself
  // when no project is selected.
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      const res = await getDownloadUrl(doc.id);
      const url = res?.downloadUrl || res?.data?.downloadUrl;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else setError("Could not get download URL.");
    } catch (err) {
      setError(err?.message || "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDocument(deleteTarget.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(err?.message || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // Client-side secondary filtering
  const filtered = documents.filter((doc) => {
    const matchSearch =
      !search ||
      doc.title?.toLowerCase().includes(search.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      doc.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      categoryFilter === "All" || doc.category === categoryFilter;
    return matchSearch || matchCat;
  });

  const canFetch = !!selProject;

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--rf-txt)" }}
          >
            Documents
          </h1>
          <p className="mt-1" style={{ color: "var(--rf-txt2)" }}>
            Manage project documents, files, and versions
          </p>
        </div>
        <Link
          href={canCreate(MODULE.DOCUMENTS) ? "/Document/Add" : "#"}
          {...permissionProps(canCreate(MODULE.DOCUMENTS), "upload a document")}
          className="px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          style={{ background: "var(--rf-accent)", color: "#fff" }}
        >
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
          Upload Document
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-lg p-4 text-sm flex items-center gap-2"
          style={{
            background:
              "color-mix(in srgb, var(--rf-red) 12%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
            color: "var(--rf-red)",
          }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
          <button
            className="ml-auto"
            style={{ color: "var(--rf-red)" }}
            onClick={() => setError("")}
          >
           
          </button>
        </div>
      )}

      {/* Filter Panel */}
      <div
        className="rounded-xl p-5 space-y-4"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border2)",
        }}
      >
        <h3
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: "var(--rf-txt2)" }}
        >
          Filter by
        </h3>

        {/* Project + Asset dropdowns */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label
              className="block mb-1 text-xs font-medium"
              style={{ color: "var(--rf-txt2)" }}
            >
              Project
            </label>
            <select
              value={selProject}
              onChange={(e) => setSelProject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                background: "var(--rf-bg2)",
                color: "var(--rf-txt)",
                boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
              }}
            >
              <option value="">— Select Project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name ?? p.projectName ?? p.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label
              className="block mb-1 text-xs font-medium"
              style={{ color: "var(--rf-txt2)" }}
            >
              Asset
            </label>
            <select
              value={selAsset}
              onChange={(e) => setSelAsset(e.target.value)}
              disabled={!selProject || assets.length === 0}
              className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none disabled:opacity-60"
              style={{
                background: "var(--rf-bg2)",
                color: "var(--rf-txt)",
                boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
              }}
            >
              <option value="">
                {!selProject
                  ? "— Select a project first —"
                  : assets.length === 0
                    ? "— No assets —"
                    : "— All assets —"}
              </option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name ?? a.id}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchDocuments}
            disabled={!canFetch || loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: "var(--rf-accent)",
              color: "#fff",
              opacity: !canFetch || loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>

        {/* Secondary filters */}
        {documents.length > 0 && (
          <div
            className="flex flex-wrap gap-3 pt-2"
            style={{ borderTop: "1px solid", borderColor: "var(--rf-border2)" }}
          >
            <input
              type="text"
              placeholder="Search title, filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg placeholder-gray-400 focus:outline-none text-sm w-56"
              style={{
                background: "var(--rf-bg2)",
                color: "var(--rf-txt)",
                boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
              }}
            />
            <div className="flex flex-wrap gap-1">
              {["All", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  style={
                    categoryFilter === c
                      ? { background: "var(--rf-accent)", color: "#fff" }
                      : { background: "var(--rf-bg3)", color: "var(--rf-txt2)" }
                  }
                >
                  {c.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prompt to apply filter */}
      {!canFetch && (
        <div
          className="text-center py-16"
          style={{ color: "var(--rf-txt3)" }}
        >
          <svg
            className="w-10 h-10 mx-auto mb-3 opacity-40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <p className="text-sm">
            Select a project (and optionally an asset) to list documents.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{
              borderColor: "var(--rf-accent)",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-sm" style={{ color: "var(--rf-txt2)" }}>
            Loading documents...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        canFetch &&
        filtered.length === 0 &&
        documents.length === 0 && (
          <div
            className="text-center py-16"
            style={{ color: "var(--rf-txt3)" }}
          >
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>No documents found.</p>
          </div>
        )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <>
          <p className="text-xs" style={{ color: "var(--rf-txt3)" }}>
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((doc) => {
              const { icon, color } = FILE_ICON(doc.mimeType, doc.fileName);
              return (
                <div
                  key={doc.id}
                  className="rounded-xl transition-all overflow-hidden"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border2)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--rf-accent)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--rf-border2)")
                  }
                >
                  {/* Card header */}
                  <div
                    className="p-4 flex items-start justify-between gap-2"
                    style={{ borderBottom: "1px solid var(--rf-border2)" }}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`text-2xl flex-shrink-0 ${color}`}>
                        {icon}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="font-semibold text-sm truncate"
                          style={{ color: "var(--rf-txt)" }}
                          title={doc.title}
                        >
                          {doc.title}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "var(--rf-txt2)" }}
                          title={doc.fileName}
                        >
                          {doc.fileName}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
                      <button
                        onClick={() => router.push(`/Document/Edit/${doc.id}`)}
                        {...permissionProps(canEdit(MODULE.DOCUMENTS), "edit document metadata")}
                        className="p-1.5 transition-colors"
                        style={{ color: "var(--rf-txt3)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--rf-accent)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--rf-txt3)")
                        }
                        title="Edit metadata"
                      >
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(doc)}
                        {...permissionProps(canDelete(MODULE.DOCUMENTS), "delete document")}
                        className="p-1.5 transition-colors"
                        style={{ color: "var(--rf-txt3)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--rf-red)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--rf-txt3)")
                        }
                        title="Delete"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={categoryBadgeStyle(doc.category)}
                      >
                        {doc.category?.replace("_", " ") || "GENERAL"}
                      </span>
                      {doc.version > 1 && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--rf-txt3)" }}
                        >
                          v{doc.version}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <div>
                        <span style={{ color: "var(--rf-txt3)" }}>Size</span>
                        <p style={{ color: "var(--rf-txt2)" }}>
                          {formatSize(doc.fileSize)}
                        </p>
                      </div>
                      <div>
                        <span style={{ color: "var(--rf-txt3)" }}>Type</span>
                        <p
                          className="truncate"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {doc.mimeType || "—"}
                        </p>
                      </div>
                      {doc.linkedToType && (
                        <div>
                          <span style={{ color: "var(--rf-txt3)" }}>
                            Linked to
                          </span>
                          <p style={{ color: "var(--rf-txt2)" }}>
                            {doc.linkedToType}
                          </p>
                        </div>
                      )}
                      <div>
                        <span style={{ color: "var(--rf-txt3)" }}>
                          Uploaded
                        </span>
                        <p style={{ color: "var(--rf-txt2)" }}>
                          {doc.createdAt
                            ? new Date(doc.createdAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {doc.description && (
                      <p
                        className="text-xs line-clamp-2 pt-1"
                        style={{
                          color: "var(--rf-txt2)",
                          borderTop: "1px solid var(--rf-border2)",
                        }}
                      >
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* Card footer */}
                  <div
                    className="px-4 py-3"
                    style={{ borderTop: "1px solid var(--rf-border2)" }}
                  >
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                      className="w-full py-1.5 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      style={{
                        background: "var(--rf-bg3)",
                        color: "var(--rf-txt)",
                        border: "1px solid var(--rf-border2)",
                      }}
                    >
                      {downloadingId === doc.id ? (
                        <span className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      )}
                      {downloadingId === doc.id ? "Getting URL..." : "Download"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl max-w-sm w-full shadow-2xl"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border2)",
            }}
          >
            <div className="p-6">
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--rf-txt)" }}
              >
                Delete Document?
              </h3>
              <p className="text-sm mb-1" style={{ color: "var(--rf-txt2)" }}>
                <span
                  className="font-medium"
                  style={{ color: "var(--rf-txt)" }}
                >
                  {deleteTarget.title}
                </span>
              </p>
              <p className="text-xs mb-5" style={{ color: "var(--rf-txt3)" }}>
                This is a soft delete — the file is marked as DELETED and cannot
                be recovered from the UI.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-lg transition-colors text-sm"
                  style={{
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt)",
                    border: "1px solid var(--rf-border2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-60"
                  style={{ background: "var(--rf-red)", color: "#fff" }}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
