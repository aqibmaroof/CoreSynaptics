"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDocuments,
  getDownloadUrl,
  deleteDocument,
} from "@/services/Documents";

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

const CATEGORY_BADGE = {
  COMMISSIONING: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  QA_QC: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  FIELD_EXECUTION: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  ASSET: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  SAFETY: "bg-red-500/20 text-red-300 border-red-500/30",
  CONTRACT: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  GENERAL: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const LINKED_TYPES = ["TASK", "CHECKLIST", "ASSET", "QA", "OTHER"];

const FILE_ICON = (mimeType = "", fileName = "") => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (mimeType.startsWith("image/"))
    return { icon: "🖼️", color: "text-pink-400" };
  if (ext === "pdf" || mimeType === "application/pdf")
    return { icon: "📄", color: "text-red-400" };
  if (["doc", "docx"].includes(ext))
    return { icon: "📝", color: "text-blue-400" };
  if (["xls", "xlsx"].includes(ext))
    return { icon: "📊", color: "text-green-400" };
  if (["ppt", "pptx"].includes(ext))
    return { icon: "🎪", color: "text-orange-400" };
  if (["zip", "rar", "7z"].includes(ext))
    return { icon: "🗜️", color: "text-purple-400" };
  return { icon: "📁", color: "text-gray-400" };
};

const formatSize = (bytes) => {
  if (!bytes) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// ─── Filter mode helpers ───────────────────────────────────────────────────────

const FILTER_MODES = [
  { label: "Project", key: "projectId" },
  { label: "Site", key: "siteId" },
  { label: "Sub-Project", key: "subProjectId" },
  { label: "Zone", key: "zoneId" },
  { label: "Asset", key: "assetId" },
  { label: "Linked Entity", key: "linked" },
];

export default function DocumentList() {
  const router = useRouter();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter state
  const [filterMode, setFilterMode] = useState("projectId");
  const [filterId, setFilterId] = useState("");
  const [linkedType, setLinkedType] = useState("TASK");
  const [linkedId, setLinkedId] = useState("");

  // UI filters (client-side)
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Actions
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchDocuments = useCallback(async () => {
    // Build the required filter param
    const params = {};
    if (filterMode === "linked") {
      if (!linkedType || !linkedId.trim()) return;
      params.linkedToType = linkedType;
      params.linkedToId = linkedId.trim();
    } else {
      if (!filterId.trim()) return;
      params[filterMode] = filterId.trim();
    }

    setLoading(true);
    setError("");
    try {
      const res = await getDocuments(params);
      console.log(res);
      setDocuments(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load documents.");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [filterMode, filterId, linkedType, linkedId]);

  // Re-fetch when filter changes and has a value
  useEffect(() => {
    if (filterMode === "linked" ? linkedType && linkedId : filterId) {
      fetchDocuments();
    } else {
      setDocuments([]);
    }
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

  const canFetch =
    filterMode === "linked"
      ? !!(linkedType && linkedId.trim())
      : !!filterId.trim();

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Documents</h1>
          <p className="text-gray-400 mt-1">
            Manage project documents, files, and versions
          </p>
        </div>
        <Link
          href="/Document/Add"
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
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
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-300 text-sm flex items-center gap-2">
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
            className="ml-auto text-red-400 hover:text-red-300"
            onClick={() => setError("")}
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Panel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          Filter by
        </h3>

        {/* Mode tabs */}
        <div className="flex flex-wrap gap-2">
          {FILTER_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                setFilterMode(m.key);
                setFilterId("");
                setLinkedId("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterMode === m.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* ID input */}
        {filterMode !== "linked" ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Enter ${FILTER_MODES.find((m) => m.key === filterMode)?.label} ID...`}
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDocuments()}
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              onClick={fetchDocuments}
              disabled={!filterId.trim() || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            <select
              value={linkedType}
              onChange={(e) => setLinkedType(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
            >
              {LINKED_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Linked entity ID..."
              value={linkedId}
              onChange={(e) => setLinkedId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchDocuments()}
              className="flex-1 min-w-48 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button
              onClick={fetchDocuments}
              disabled={!linkedId.trim() || loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
        )}

        {/* Secondary filters */}
        {documents.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-700">
            <input
              type="text"
              placeholder="Search title, filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm w-56"
            />
            <div className="flex flex-wrap gap-1">
              {["All", ...CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    categoryFilter === c
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
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
        <div className="text-center py-16 text-gray-500">
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
            Enter an ID above and click Load to list documents.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading documents...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        canFetch &&
        filtered.length === 0 &&
        documents.length === 0 && (
          <div className="text-center py-16 text-gray-500">
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
          <p className="text-xs text-gray-500">
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((doc) => {
              const { icon, color } = FILE_ICON(doc.mimeType, doc.fileName);
              return (
                <div
                  key={doc.id}
                  className="bg-gray-800 rounded-xl border border-gray-700 hover:border-blue-500/40 transition-all overflow-hidden"
                >
                  {/* Card header */}
                  <div className="p-4 flex items-start justify-between gap-2 border-b border-gray-700">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`text-2xl flex-shrink-0 ${color}`}>
                        {icon}
                      </span>
                      <div className="min-w-0">
                        <p
                          className="text-white font-semibold text-sm truncate"
                          title={doc.title}
                        >
                          {doc.title}
                        </p>
                        <p
                          className="text-gray-400 text-xs truncate"
                          title={doc.fileName}
                        >
                          {doc.fileName}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-1">
                      <button
                        onClick={() => router.push(`/Document/Edit/${doc.id}`)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
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
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
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
                        className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_BADGE[doc.category] || CATEGORY_BADGE.GENERAL}`}
                      >
                        {doc.category?.replace("_", " ") || "GENERAL"}
                      </span>
                      {doc.version > 1 && (
                        <span className="text-xs text-gray-500">
                          v{doc.version}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                      <div>
                        <span className="text-gray-500">Size</span>
                        <p className="text-gray-300">
                          {formatSize(doc.fileSize)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Type</span>
                        <p className="text-gray-300 truncate">
                          {doc.mimeType || "—"}
                        </p>
                      </div>
                      {doc.linkedToType && (
                        <div>
                          <span className="text-gray-500">Linked to</span>
                          <p className="text-gray-300">{doc.linkedToType}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Uploaded</span>
                        <p className="text-gray-300">
                          {doc.createdAt
                            ? new Date(doc.createdAt).toLocaleDateString()
                            : "—"}
                        </p>
                      </div>
                    </div>

                    {doc.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 pt-1 border-t border-gray-700">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="px-4 py-3 border-t border-gray-700">
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                      className="w-full py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
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
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Delete Document?
              </h3>
              <p className="text-gray-400 text-sm mb-1">
                <span className="text-white font-medium">
                  {deleteTarget.title}
                </span>
              </p>
              <p className="text-gray-500 text-xs mb-5">
                This is a soft delete — the file is marked as DELETED and cannot
                be recovered from the UI.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 text-white rounded-lg transition-colors text-sm font-medium"
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
