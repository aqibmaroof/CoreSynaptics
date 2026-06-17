"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChecklist, addChecklistItem } from "@/services/Checklist";
import { listV2Assets, listV2Projects } from "@/services/CxProjectsV2";

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
        className="w-full px-4 py-2 rounded-lg focus:outline-none appearance-none disabled:opacity-50"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border3)",
          color: "var(--rf-txt)",
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

// ─── ITEM CARD ────────────────────────────────────────────────────────────────
function ItemCard({ item, index, onChange, onRemove, canRemove }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--rf-bg3)",
        border: "1px solid var(--rf-border2)",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: "var(--rf-bg2)",
          borderBottom: "1px solid var(--rf-border2)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
            style={{
              background:
                "color-mix(in srgb, var(--rf-accent) 14%, transparent)",
              color: "var(--rf-accent)",
              border:
                "1px solid color-mix(in srgb, var(--rf-accent) 30%, transparent)",
            }}
          >
            {index + 1}
          </span>
          <span className="text-xs" style={{ color: "var(--rf-txt2)" }}>
            Item #{item.sequence}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--rf-txt2)" }}>
              Required
            </span>
            <button
              type="button"
              onClick={() => onChange(index, "isRequired", !item.isRequired)}
              className="relative w-9 h-5 rounded-full transition-colors"
              style={{
                background: item.isRequired
                  ? "var(--rf-accent)"
                  : "var(--rf-bg4)",
              }}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform ${item.isRequired ? "translate-x-4" : "translate-x-0.5"}`}
                style={{ background: "#fff" }}
              />
            </button>
          </div>
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: "var(--rf-txt3)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--rf-red)";
                e.currentTarget.style.background =
                  "color-mix(in srgb, var(--rf-red) 12%, transparent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--rf-txt3)";
                e.currentTarget.style.background = "transparent";
              }}
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
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--rf-txt2)" }}
          >
            Title <span style={{ color: "var(--rf-red)" }}>*</span>
          </label>
          <input
            type="text"
            value={item.title}
            onChange={(e) => onChange(index, "title", e.target.value)}
            placeholder="Item title…"
            className="w-full px-3 py-2 rounded-lg placeholder-gray-500 text-sm focus:outline-none"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border3)",
              color: "var(--rf-txt)",
            }}
          />
        </div>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--rf-txt2)" }}
          >
            Description
          </label>
          <textarea
            value={item.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            placeholder="What needs to be verified or checked…"
            rows={2}
            className="w-full px-3 py-2 rounded-lg placeholder-gray-500 text-sm focus:outline-none resize-none"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border3)",
              color: "var(--rf-txt)",
            }}
          />
        </div>
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "var(--rf-txt2)" }}
          >
            Notes
          </label>
          <textarea
            value={item.notes}
            onChange={(e) => onChange(index, "notes", e.target.value)}
            placeholder="Optional notes…"
            rows={2}
            className="w-full px-3 py-2 rounded-lg placeholder-gray-500 text-sm focus:outline-none resize-none"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border3)",
              color: "var(--rf-txt)",
            }}
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
  const [assets, setAssets] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    assetId: "",
    phase: "L1",
    checklistType: "INTERNAL",
  });

  const [items, setItems] = useState([makeItem(1)]);

  // Load projects on mount. Legacy /projects has no backend route;
  // cx-projects (V2 list) is the source of truth — fall back to it.
  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((v2) => setProjects(v2?.data ?? []))
      .catch(() => {}); 
  }, []);

  // Project → project-scoped assets (V2).
  useEffect(() => {
    setAssets([]);
    setFormData((p) => ({ ...p, assetId: "" }));
    if (!formData.projectId) return;
    listV2Assets(formData.projectId, { limit: 100 })
      .then((res) => setAssets(toArray(res)))
      .catch(() => {});
  }, [formData.projectId]);

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
      // Backend whitelist: cxProjectId / zoneId / assetId / projectAssetId /
      // phase / checklistType / title / description. Site and sub-project only
      // drive the cascade pickers here — sending them would be rejected by the
      // API's forbidNonWhitelisted validation.
      const checklist = await createChecklist({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        cxProjectId: formData.projectId,
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
    <div className="min-h-screen p-6 cl-page">
      <div className="mx-auto">
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: "var(--rf-txt)" }}
          >
            Create Checklist
          </h1>
          <p style={{ color: "var(--rf-txt2)" }}>
            Add a new project checklist with items
          </p>
        </div>

        {error && (
          <div
            className="rounded-lg p-4 mb-6 flex items-start gap-3"
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Checklist Details ── */}
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
                Checklist Details
              </h2>
            </div>

            <div className="p-6 space-y-5">
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
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. L1 Power Verification Checklist"
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
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--rf-txt)" }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Optional description…"
                  className="w-full px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none resize-none"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt)",
                  }}
                />
              </div>

              {/* Phase + Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
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
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
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
              <div
                className="pt-5"
                style={{ borderTop: "1px solid var(--rf-border2)" }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-4"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  Project Hierarchy
                </p>

                {/* Project */}
                <div className="mb-4">
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Project <span style={{ color: "var(--rf-red)" }}>*</span>
                  </label>
                  <AppSelect
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    options={projects.map((p) => ({
                      value: p.id,
                      label: p.name ?? p.projectName,
                    }))}
                    placeholder="— Select Project —"
                  />
                </div>

                {/* Asset (optional) */}
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
                    value={formData.assetId}
                    onChange={handleChange}
                    options={assets.map((a) => ({
                      value: a.id,
                      label: a.name,
                    }))}
                    placeholder={
                      formData.projectId
                        ? assets.length
                          ? "— Select Asset —"
                          : "No assets found"
                        : "— Select Project First —"
                    }
                    disabled={!formData.projectId || assets.length === 0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Items ── */}
          <div
            className="rounded-xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border2)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--rf-border2)" }}
            >
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--rf-txt)" }}
              >
                Checklist Items{" "}
                <span
                  className="ml-2 text-sm font-normal"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  ({items.length})
                </span>
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{ background: "var(--rf-green)", color: "#fff" }}
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
                className="w-full py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                style={{
                  border: "2px dashed var(--rf-border3)",
                  color: "var(--rf-txt3)",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--rf-accent)";
                  e.currentTarget.style.color = "var(--rf-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--rf-border3)";
                  e.currentTarget.style.color = "var(--rf-txt3)";
                }}
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
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg"
              style={{
                background: "var(--rf-accent)",
                color: "#fff",
                opacity: loading ? 0.6 : 1,
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
