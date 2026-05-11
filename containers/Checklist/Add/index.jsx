"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChecklist, addChecklistItem } from "@/services/Checklist";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { GetEquipments } from "@/services/Equipment";

const PHASES = ["NONE", "L1", "L2", "L3", "L4", "L5", "IST"];
const CHECKLIST_TYPES = ["VENDOR", "GC", "CX_AGENT", "TRADE", "INTERNAL"];

let _itemCounter = 0;
const makeItem = (sequence) => ({
  _key: ++_itemCounter,
  title: "",
  description: "",
  sequence,
  isRequired: true,
  notes: "",
});

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

// ─── REUSABLE SELECT ──────────────────────────────────────────────────────────
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

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
function ItemCard({ item, index, onChange, onRemove, canRemove }) {
  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">
            {index + 1}
          </span>
          <span className="text-xs text-gray-400">Item #{item.sequence}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Required</span>
            <button
              type="button"
              onClick={() => onChange(index, "isRequired", !item.isRequired)}
              className={`relative w-9 h-5 rounded-full transition-colors ${item.isRequired ? "bg-blue-500" : "bg-gray-600"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.isRequired ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </button>
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
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
          )}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange(index, "title", e.target.value)}
            placeholder="Item title…"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={item.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            placeholder="What needs to be verified or checked…"
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Notes
          </label>
          <textarea
            value={item.notes}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            placeholder="Optional notes…"
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ChecklistAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Cascade lists ─────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [sites, setSites] = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [assets, setAssets] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    siteId: "",
    subProjectId: "",
    zoneId: "",
    assetId: "",
    phase: "L1",
    checklistType: "INTERNAL",
  });

  const [items, setItems] = useState([makeItem(1)]);

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
    getProjects(25, 1, formData.siteId, formData?.projectId)
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

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItem = () =>
    setItems((prev) => [...prev, makeItem(prev.length + 1)]);

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems((prev) =>
        prev
          .filter((_, i) => i !== index)
          .map((item, i) => ({ ...item, sequence: i + 1 })),
      );
    }
  };

  const validate = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.projectId) {
      setError("Project is required");
      return false;
    }
    if (!formData.siteId) {
      setError("Site is required");
      return false;
    }
    if (!formData.subProjectId) {
      setError("Sub-project is required");
      return false;
    }
    if (!items.some((i) => i.title.trim())) {
      setError("At least one item with a title is required");
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
      const checklist = await createChecklist({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        projectId: formData.projectId,
        siteId: formData.siteId,
        subProjectId: formData.subProjectId,
        zoneId: formData.zoneId || undefined,
        assetId: formData.assetId || undefined,
        phase: formData.phase || undefined,
        checklistType: formData.checklistType || undefined,
      });

      for (const item of items.filter((i) => i.title.trim())) {
        await addChecklistItem(checklist.id, {
          title: item.title.trim(),
          description: item.description.trim() || undefined,
          sequence: item.sequence,
          isRequired: item.isRequired,
          notes: item.notes.trim() || undefined,
        });
      }

      router.push("/Checklist/List");
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Create Checklist
          </h1>
          <p className="text-gray-400">
            Add a new project checklist with items
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Checklist Details ── */}
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
                Checklist Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
              {/* Title + Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. L1 Power Verification Checklist"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Optional description…"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Phase + Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Phase
                  </label>
                  <AppSelect
                    name="phase"
                    value={formData.phase}
                    onChange={handleChange}
                    options={PHASES.map((p) => ({ value: p, label: p }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Type
                  </label>
                  <AppSelect
                    name="checklistType"
                    value={formData.checklistType}
                    onChange={handleChange}
                    options={CHECKLIST_TYPES.map((t) => ({
                      value: t,
                      label: t,
                    }))}
                  />
                </div>
              </div>

              {/* ── Hierarchy ── */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Site <span className="text-red-400">*</span>
                    </label>
                    <AppSelect
                      name="siteId"
                      value={formData.siteId}
                      onChange={handleChange}
                      options={sites.map((s) => ({
                        value: s.id,
                        label: s.name,
                      }))}
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
                      Sub-Project <span className="text-red-400">*</span>
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
                      value={formData.zoneId}
                      onChange={handleChange}
                      options={zones.map((z) => ({
                        value: z.id,
                        label: z.name,
                      }))}
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
            </div>
          </div>

          {/* ── Items ── */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                Checklist Items{" "}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({items.length})
                </span>
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-all"
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
                Add Item
              </button>
            </div>

            <div className="p-6 space-y-4">
              {items.map((item, index) => (
                <ItemCard
                  key={item._key}
                  item={item}
                  index={index}
                  onChange={handleItemChange}
                  onRemove={removeItem}
                  canRemove={items.length > 1}
                />
              ))}
            </div>

            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-blue-500/50 rounded-xl text-gray-500 hover:text-blue-400 text-sm font-medium transition-all flex items-center justify-center gap-2 hover:bg-blue-600/5"
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
                Add another item
              </button>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-3 pb-8">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
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
                  Create Checklist
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
