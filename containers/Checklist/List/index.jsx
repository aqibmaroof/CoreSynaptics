"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getChecklists, deleteChecklist } from "@/services/Checklist";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";
import { listV2Assets, listV2Projects } from "@/services/CxProjectsV2";
const PHASES = ["NONE", "L1", "L2", "L3", "L4", "L5", "IST"];
const CHECKLIST_TYPES = ["VENDOR", "GC", "CX_AGENT", "TRADE", "INTERNAL"];
const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "VERIFIED"];

const STATUS_LABELS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  VERIFIED: "Verified",
};

function getStatusColor(status) {
  let token;
  switch (status) {
    case "IN_PROGRESS":
      token = "var(--rf-accent)";
      break;
    case "COMPLETED":
      token = "var(--rf-green)";
      break;
    case "VERIFIED":
      token = "var(--rf-purple)";
      break;
    case "NOT_STARTED":
    default:
      token = "var(--rf-txt3)";
      break;
  }
  return {
    background: `color-mix(in srgb, ${token} 14%, transparent)`,
    color: token,
    border: `1px solid color-mix(in srgb, ${token} 32%, transparent)`,
  };
}

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

export default function ChecklistList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = useUserPermissions();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Cascade filter state ──────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);

  const [selProject, setSelProject] = useState("");
  const [selAsset, setSelAsset] = useState("");

  const [appliedFilter, setAppliedFilter] = useState(null);

  // ── Client-side filters ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPhase, setFilterPhase] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load projects on mount
  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
  }, []);

  // Project → Assets
  useEffect(() => {
    setAssets([]);
    setSelAsset("");
    if (!selProject) return;
    listV2Assets(selProject, { limit: 100 })
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, [selProject]);

  // Build the filter params — pass every selected level (project and/or asset)
  // so the API scopes by both when both are chosen.
  const filterParams = {};
  if (selProject) filterParams.cxProjectId = selProject;
  if (selAsset) filterParams.assetId = selAsset;
  const hasFilter = Object.keys(filterParams).length > 0;
  // useEffect(() => {
  //   fetchChecklists();
  // }, []);
  const fetchChecklists = async () => {
    if (!hasFilter) {
      setError("Select at least a project to load checklists.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await getChecklists(filterParams);
      setChecklists(toArray(data));
      setAppliedFilter(filterParams);
    } catch (err) {
      setError(err?.message || "Failed to load checklists");
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteChecklist(id);
      setChecklists((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || "Failed to delete checklist");
    }
  };

  const filteredChecklists = checklists.filter((c) => {
    const matchesSearch =
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = !filterPhase || c.phase === filterPhase;
    const matchesType = !filterType || c.checklistType === filterType;
    const matchesStatus = !filterStatus || c.status === filterStatus;
    return matchesSearch && matchesPhase && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen p-6 cl-page">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "var(--rf-txt)" }}
            >
              Checklists
            </h1>
            <p style={{ color: "var(--rf-txt2)" }}>
              Manage and track project checklists
            </p>
          </div>
          {
            <Link
              href={canCreate(MODULE.CHECKLISTS) ? "/Checklist/Add" : "#"}
              {...permissionProps(
                canCreate(MODULE.CHECKLISTS),
                "create a checklist",
              )}
              className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
              style={{ background: "var(--rf-accent)", color: "#fff" }}
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Checklist
            </Link>
          }
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 rounded-lg p-4 flex items-start gap-3"
            style={{
              background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
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

        {/* ── Hierarchy filter ── */}
        <div
          className="rounded-xl shadow-lg p-6 mb-4"
          style={{
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border2)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--rf-txt2)" }}
            >
              Load Checklists By
            </h3>
            {hasFilter && (
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{
                  background:
                    "color-mix(in srgb, var(--rf-accent) 12%, transparent)",
                  color: "var(--rf-accent)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-accent) 30%, transparent)",
                }}
              >
                Filtering by:{" "}
                <span className="font-semibold">
                  {Object.keys(filterParams).join(", ")}
                </span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            {/* Project */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--rf-txt2)" }}
              >
                Project
              </label>
              <div className="relative">
                <select
                  value={selProject}
                  onChange={(e) => setSelProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none [&_option]:bg-gray-700 appearance-none"
                  style={{
                    background: "var(--rf-bg3)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt3)",
                  }}
                >
                  <option value="">— Select —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--rf-txt3)" }}
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Asset */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--rf-txt2)" }}
              >
                Asset
              </label>
              <div className="relative">
                <select
                  value={selAsset}
                  onChange={(e) => setSelAsset(e.target.value)}
                  disabled={!selProject || assets.length === 0}
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none [&_option]:bg-gray-700 appearance-none disabled:opacity-40"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt)",
                  }}
                >
                  <option value="">— Select —</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--rf-txt3)" }}
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchChecklists}
              disabled={!hasFilter || loading}
              className="px-6 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              style={{
                background: "var(--rf-accent)",
                color: "#fff",
                opacity: !hasFilter || loading ? 0.5 : 1,
              }}
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
                  Loading…
                </>
              ) : (
                "Load Checklists"
              )}
            </button>
          </div>
        </div>

        {/* Client-side filters — shown after load */}
        {appliedFilter && (
          <div
            className="rounded-xl shadow-lg p-6 mb-6"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border2)",
            }}
          >
            <h3
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: "var(--rf-txt)" }}
            >
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters &amp; Search
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Title, ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt)",
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  Phase
                </label>
                <select
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none [&_option]:bg-gray-700"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt)",
                  }}
                >
                  <option value="">All Phases</option>
                  {PHASES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none [&_option]:bg-gray-700"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt)",
                  }}
                >
                  <option value="">All Types</option>
                  {CHECKLIST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none [&_option]:bg-gray-700"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt)",
                  }}
                >
                  <option value="">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterPhase("");
                    setFilterType("");
                    setFilterStatus("");
                  }}
                  className="w-full px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt)",
                    border: "1px solid var(--rf-border2)",
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {appliedFilter && !loading && (
          <div className="mb-4 text-sm" style={{ color: "var(--rf-txt2)" }}>
            Showing {filteredChecklists.length} of {checklists.length}{" "}
            checklists
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg
                className="w-12 h-12 animate-spin mx-auto mb-4"
                style={{ color: "var(--rf-accent)" }}
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
              <p style={{ color: "var(--rf-txt2)" }}>Loading checklists…</p>
            </div>
          </div>
        ) : !appliedFilter ? (
          <div className="text-center py-16">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--rf-txt3)" }}
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
            <p className="text-lg mb-1" style={{ color: "var(--rf-txt2)" }}>
              No checklists loaded
            </p>
            <p className="text-sm" style={{ color: "var(--rf-txt3)" }}>
              Select a project (and optionally drill down) then click Load
              Checklists
            </p>
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: "var(--rf-txt2)" }}>
              No checklists found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist) => (
              <div
                key={checklist.id}
                className={`rounded-xl p-6 transition-all group ${canEdit(MODULE.CHECKLISTS) ? "cursor-pointer" : ""}`}
                style={{
                  background: "var(--rf-bg2)",
                  border: "1px solid var(--rf-border2)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--rf-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--rf-border2)";
                }}
                onClick={() => {
                  if (canEdit(MODULE.CHECKLISTS))
                    router.push(`/Checklist/Edit/${checklist.id}`);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <p
                      className="text-xs mb-1"
                      style={{ color: "var(--rf-txt3)" }}
                    >
                      {checklist.checklistType || "—"} · Phase{" "}
                      {checklist.phase || "—"}
                    </p>
                    <h3
                      className="text-base font-semibold transition-colors truncate"
                      style={{ color: "var(--rf-txt)" }}
                    >
                      {checklist.title}
                    </h3>
                    {checklist.description && (
                      <p
                        className="text-xs mt-1 line-clamp-2"
                        style={{ color: "var(--rf-txt2)" }}
                      >
                        {checklist.description}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-full"
                    style={getStatusColor(checklist.status)}
                  >
                    {STATUS_LABELS[checklist.status] ?? checklist.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm"
                      style={{ color: "var(--rf-txt2)" }}
                    >
                      {checklist.completedItems}/{checklist.totalItems} items
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--rf-txt)" }}
                    >
                      {checklist.completionPercentage ?? 0}%
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-2"
                    style={{ background: "var(--rf-bg4)" }}
                  >
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${checklist.completionPercentage ?? 0}%`,
                        background: "var(--rf-accent)",
                      }}
                    />
                  </div>
                </div>

                {checklist.lockedAt && (
                  <p
                    className="text-xs mb-3 flex items-center gap-1"
                    style={{ color: "var(--rf-purple)" }}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Locked
                  </p>
                )}

                {(canEdit(MODULE.CHECKLISTS) ||
                  canDelete(MODULE.CHECKLISTS)) && (
                  <div
                    className="flex gap-2 pt-4"
                    style={{ borderTop: "1px solid var(--rf-border2)" }}
                  >
                    {canEdit(MODULE.CHECKLISTS) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/Checklist/Edit/${checklist.id}`);
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-lg transition-colors"
                        style={{
                          background: "var(--rf-accent)",
                          color: "#fff",
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete(MODULE.CHECKLISTS) && !checklist.lockedAt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirm(checklist.id);
                        }}
                        className="px-3 py-2 text-xs rounded-lg transition-colors"
                        style={{ background: "var(--rf-red)", color: "#fff" }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div
              className="rounded-xl max-w-sm mx-4 shadow-2xl p-6"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "var(--rf-txt)" }}
              >
                Delete Checklist?
              </h3>
              <p className="mb-6" style={{ color: "var(--rf-txt2)" }}>
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt)",
                    border: "1px solid var(--rf-border2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors"
                  style={{ background: "var(--rf-red)", color: "#fff" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
