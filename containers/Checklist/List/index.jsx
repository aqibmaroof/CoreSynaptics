"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getChecklists, deleteChecklist } from "@/services/Checklist";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { GetEquipments } from "@/services/Equipment";

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
  switch (status) {
    case "NOT_STARTED":
      return "bg-gray-900/30 text-gray-300 border-gray-700/30";
    case "IN_PROGRESS":
      return "bg-blue-900/30 text-blue-300 border-blue-700/30";
    case "COMPLETED":
      return "bg-green-900/30 text-green-300 border-green-700/30";
    case "VERIFIED":
      return "bg-purple-900/30 text-purple-300 border-purple-700/30";
    default:
      return "bg-gray-900/30 text-gray-300 border-gray-700/30";
  }
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
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Cascade filter state ──────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);

  const [selProject, setSelProject] = useState("");
  const [selSite, setSelSite] = useState("");
  const [selSubProject, setSelSubProject] = useState("");
  const [selZone, setSelZone] = useState("");
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
    getProjects()
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
  }, []);

  // Project → Sites
  useEffect(() => {
    setSites([]);
    setSelSite("");
    setSubProjects([]);
    setSelSubProject("");
    setZones([]);
    setSelZone("");
    setAssets([]);
    setSelAsset("");
    if (!selProject) return;
    GetSites(selProject)
      .then((d) => setSites(toArray(d)))
      .catch(() => {});
  }, [selProject]);

  // Site → SubProjects
  useEffect(() => {
    setSubProjects([]);
    setSelSubProject("");
    setZones([]);
    setSelZone("");
    setAssets([]);
    setSelAsset("");
    if (!selSite) return;
    getProjects(25, 1, selSite)
      .then((d) => setSubProjects(toArray(d)))
      .catch(() => {});
  }, [selSite]);

  // SubProject → Zones
  useEffect(() => {
    setZones([]);
    setSelZone("");
    setAssets([]);
    setSelAsset("");
    if (!selSubProject) return;
    GetZones(selSubProject)
      .then((d) => setZones(toArray(d)))
      .catch(() => {});
  }, [selSubProject]);

  // Zone → Assets
  useEffect(() => {
    setAssets([]);
    setSelAsset("");
    if (!selZone) return;
    GetEquipments(selZone)
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, [selZone]);

  // Derive the deepest active filter (exactly one required by API)
  const activeFilter = selAsset
    ? { key: "assetId", value: selAsset }
    : selZone
      ? { key: "zoneId", value: selZone }
      : selSubProject
        ? { key: "subProjectId", value: selSubProject }
        : selSite
          ? { key: "siteId", value: selSite }
          : selProject
            ? { key: "projectId", value: selProject }
            : null;

  const fetchChecklists = async () => {
    if (!activeFilter) {
      setError("Select at least a project to load checklists.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const data = await getChecklists({
        [activeFilter.key]: activeFilter.value,
      });
      setChecklists(toArray(data));
      setAppliedFilter(activeFilter);
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
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Checklists</h1>
            <p className="text-gray-400">Manage and track project checklists</p>
          </div>
          <Link
            href="/Checklist/Add"
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
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
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
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

        {/* ── Hierarchy filter ── */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Load Checklists By
            </h3>
            {activeFilter && (
              <span className="text-xs text-blue-400 bg-blue-900/20 border border-blue-700/30 px-2.5 py-1 rounded-full">
                Filtering by:{" "}
                <span className="font-semibold">{activeFilter.key}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Project */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Project
              </label>
              <div className="relative">
                <select
                  value={selProject}
                  onChange={(e) => setSelProject(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none"
                >
                  <option value="">— Select —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
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

            {/* Site */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Site
              </label>
              <div className="relative">
                <select
                  value={selSite}
                  onChange={(e) => setSelSite(e.target.value)}
                  disabled={!selProject || sites.length === 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none disabled:opacity-40"
                >
                  <option value="">— Select —</option>
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
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

            {/* Sub-Project */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Sub-Project
              </label>
              <div className="relative">
                <select
                  value={selSubProject}
                  onChange={(e) => setSelSubProject(e.target.value)}
                  disabled={!selSite || subProjects.length === 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none disabled:opacity-40"
                >
                  <option value="">— Select —</option>
                  {subProjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
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

            {/* Zone */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Zone
              </label>
              <div className="relative">
                <select
                  value={selZone}
                  onChange={(e) => setSelZone(e.target.value)}
                  disabled={!selSubProject || zones.length === 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none disabled:opacity-40"
                >
                  <option value="">— Select —</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
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
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Asset
              </label>
              <div className="relative">
                <select
                  value={selAsset}
                  onChange={(e) => setSelAsset(e.target.value)}
                  disabled={!selZone || assets.length === 0}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none disabled:opacity-40"
                >
                  <option value="">— Select —</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
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
              disabled={!activeFilter || loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
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
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Title, ID…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phase
                </label>
                <select
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700"
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
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        {appliedFilter && !loading && (
          <div className="mb-4 text-sm text-gray-400">
            Showing {filteredChecklists.length} of {checklists.length}{" "}
            checklists
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4"
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
              <p className="text-gray-400">Loading checklists…</p>
            </div>
          </div>
        ) : !appliedFilter ? (
          <div className="text-center py-16">
            <svg
              className="w-12 h-12 text-gray-500 mx-auto mb-4"
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
            <p className="text-gray-400 text-lg mb-1">No checklists loaded</p>
            <p className="text-gray-500 text-sm">
              Select a project (and optionally drill down) then click Load
              Checklists
            </p>
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No checklists found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((checklist) => (
              <div
                key={checklist.id}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => router.push(`/Checklist/Edit/${checklist.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-xs text-gray-500 mb-1">
                      {checklist.checklistType || "—"} · Phase{" "}
                      {checklist.phase || "—"}
                    </p>
                    <h3 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                      {checklist.title}
                    </h3>
                    {checklist.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {checklist.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(checklist.status)}`}
                  >
                    {STATUS_LABELS[checklist.status] ?? checklist.status}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {checklist.completedItems}/{checklist.totalItems} items
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {checklist.completionPercentage ?? 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${checklist.completionPercentage ?? 0}%`,
                      }}
                    />
                  </div>
                </div>

                {checklist.lockedAt && (
                  <p className="text-xs text-purple-400 mb-3 flex items-center gap-1">
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

                <div className="flex gap-2 pt-4 border-t border-gray-700">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/Checklist/Edit/${checklist.id}`);
                    }}
                    className="flex-1 px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  {!checklist.lockedAt && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(checklist.id);
                      }}
                      className="px-3 py-2 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-sm mx-4 shadow-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Delete Checklist?
              </h3>
              <p className="text-gray-400 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
