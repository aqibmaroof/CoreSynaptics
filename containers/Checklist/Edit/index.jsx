"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getChecklistById,
  updateChecklist,
  signChecklist,
  getChecklistItems,
  addChecklistItem,
  completeChecklistItem,
  deleteChecklistItem,
} from "@/services/Checklist";
import { listV2Projects, listV2Assets } from "@/services/CxProjectsV2";
import { getUser } from "@/services/instance/tokenService";
import ChecklistDelegateModal from "@/components/ChecklistDelegateModal";
import ChecklistDelegationHistory from "@/components/ChecklistDelegationHistory";

const PHASES = ["NONE", "L1", "L2", "L3", "L4", "L5", "IST"];
const CHECKLIST_TYPES = ["VENDOR", "GC", "CX_AGENT", "TRADE", "INTERNAL"];

const STATUS_LABELS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  VERIFIED: "Verified",
};

const STATUS_TOKENS = {
  NOT_STARTED: "var(--rf-txt3)",
  IN_PROGRESS: "var(--rf-accent)",
  COMPLETED: "var(--rf-green)",
  VERIFIED: "var(--rf-purple)",
};

function statusBadgeStyle(status) {
  const token = STATUS_TOKENS[status] ?? "var(--rf-txt3)";
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

// ─── ITEM ROW ────────────────────────────────────────────────────────────────
function ItemRow({ item, locked, onComplete, onDelete }) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border transition-all"
      style={
        item.isCompleted
          ? {
              background: "color-mix(in srgb, var(--rf-green) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--rf-green) 28%, transparent)",
            }
          : {
              background: "var(--rf-bg3)",
              border: "1px solid var(--rf-border2)",
            }
      }
    >
      <div
        className="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
        style={
          item.isCompleted
            ? { background: "var(--rf-green)", borderColor: "var(--rf-green)" }
            : { borderColor: "var(--rf-border3)" }
        }
      >
        {item.isCompleted && (
          <svg
            className="w-3 h-3"
            style={{ color: "#fff" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-sm font-medium ${item.isCompleted ? "line-through" : ""}`}
            style={{
              color: item.isCompleted ? "var(--rf-txt3)" : "var(--rf-txt)",
            }}
          >
            {item.title}
          </span>
          {item.isRequired && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                background: "color-mix(in srgb, var(--rf-accent) 14%, transparent)",
                color: "var(--rf-accent)",
                border: "1px solid color-mix(in srgb, var(--rf-accent) 30%, transparent)",
              }}
            >
              Required
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs mb-1" style={{ color: "var(--rf-txt2)" }}>
            {item.description}
          </p>
        )}
        {item.notes && (
          <p className="text-xs italic" style={{ color: "var(--rf-txt3)" }}>
            {item.notes}
          </p>
        )}
        {item.isCompleted && item.completedAt && (
          <p className="text-xs mt-1" style={{ color: "var(--rf-green)" }}>
            Completed {new Date(item.completedAt).toLocaleString()}
          </p>
        )}
      </div>
      {!locked && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {!item.isCompleted && (
            <button
              type="button"
              onClick={() => onComplete(item.id)}
              className="px-3 py-1.5 text-xs rounded-lg transition-all"
              style={{
                background: "color-mix(in srgb, var(--rf-green) 14%, transparent)",
                color: "var(--rf-green)",
                border: "1px solid color-mix(in srgb, var(--rf-green) 30%, transparent)",
              }}
            >
              Complete
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(item.id)}
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
        </div>
      )}
    </div>
  );
}

// ─── ADD ITEM INLINE FORM ────────────────────────────────────────────────────
function AddItemForm({ nextSequence, onAdd, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErr("Title is required");
      return;
    }
    setSaving(true);
    try {
      await onAdd({
        title: title.trim(),
        description: description.trim() || undefined,
        sequence: nextSequence,
        isRequired,
        notes: notes.trim() || undefined,
      });
    } catch (e) {
      setErr(e?.message || "Failed to add item");
      setSaving(false);
    }
  };

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{
        background: "color-mix(in srgb, var(--rf-accent) 8%, transparent)",
        border: "1px solid color-mix(in srgb, var(--rf-accent) 24%, transparent)",
      }}
    >
      <h4 className="text-sm font-semibold" style={{ color: "var(--rf-accent)" }}>
        New Item #{nextSequence}
      </h4>
      {err && (
        <p className="text-xs" style={{ color: "var(--rf-red)" }}>
          {err}
        </p>
      )}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Item title *"
        className="w-full px-3 py-2 rounded-lg placeholder-gray-400 text-sm focus:outline-none"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border3)",
          color: "var(--rf-txt)",
        }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full px-3 py-2 rounded-lg placeholder-gray-400 text-sm focus:outline-none resize-none"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border3)",
          color: "var(--rf-txt)",
        }}
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={1}
        className="w-full px-3 py-2 rounded-lg placeholder-gray-400 text-sm focus:outline-none resize-none"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border3)",
          color: "var(--rf-txt)",
        }}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--rf-txt2)" }}>
            Required
          </span>
          <button
            type="button"
            onClick={() => setIsRequired((v) => !v)}
            className="relative w-9 h-5 rounded-full transition-colors"
            style={{
              background: isRequired ? "var(--rf-accent)" : "var(--rf-bg4)",
            }}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-transform ${isRequired ? "translate-x-4" : "translate-x-0.5"}`}
              style={{ background: "#fff" }}
            />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors"
            style={{
              background: "var(--rf-bg3)",
              color: "var(--rf-txt)",
              border: "1px solid var(--rf-border2)",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-3 py-1.5 text-xs rounded-lg transition-colors"
            style={{
              background: "var(--rf-accent)",
              color: "#fff",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Adding…" : "Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ChecklistEdit() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState("");
  const [checklist, setChecklist] = useState(null);
  const [items, setItems] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    try {
      const raw = getUser();
      if (raw) {
        const u = JSON.parse(raw);
        setCurrentUserId(u?.id || null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ── Cascade lists ─────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phase: "L1",
    checklistType: "INTERNAL",
    projectId: "",
    assetId: "",
  });

  // Track whether initial cascade load is in progress (suppress re-trigger)
  const initialLoadDone = useRef(false);

  // ── Load checklist + initial cascade data ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setPageLoading(true);
        const [cl, its, projs] = await Promise.all([
          getChecklistById(id),
          getChecklistItems(id),
          listV2Projects({ limit: 100 }),
        ]);

        setChecklist(cl);
        setItems(toArray(its));
        setProjects(toArray(projs));

        const fd = {
          title: cl.title ?? "",
          description: cl.description ?? "",
          phase: cl.phase ?? "L1",
          checklistType: cl.checklistType ?? "INTERNAL",
          projectId: cl.projectId ?? "",
          assetId: cl.assetId ?? "",
        };
        setFormData(fd);

        // Pre-load assets for the existing project
        if (fd.projectId) {
          await listV2Assets(fd.projectId, { limit: 100 })
            .then((res) => setAssets(toArray(res)))
            .catch(() => {});
        }

        initialLoadDone.current = true;
        setError("");
      } catch (err) {
        setError(err?.message || "Failed to load checklist");
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, [id]);

  // ── Cascade effects (only after initial load) ─────────────────────────────

  // Project → Assets
  useEffect(() => {
    if (!initialLoadDone.current) return;
    setAssets([]);
    setFormData((p) => ({ ...p, assetId: "" }));
    if (!formData.projectId) return;
    listV2Assets(formData.projectId, { limit: 100 })
      .then((res) => setAssets(toArray(res)))
      .catch(() => {});
  }, [formData.projectId]);

  const isLocked = !!checklist?.lockedAt;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateChecklist(id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        phase: formData.phase || undefined,
        checklistType: formData.checklistType || undefined,
        assetId: formData.assetId || undefined,
      });
      setChecklist(updated);
      setError("");
      router.back();
    } catch (err) {
      setError(err?.message || "Failed to update checklist");
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      const updated = await signChecklist(id);
      setChecklist(updated);
      setError("");
    } catch (err) {
      setError(err?.message || "Failed to sign checklist");
    } finally {
      setSigning(false);
    }
  };

  const handleCompleteItem = async (itemId) => {
    try {
      const updatedItem = await completeChecklistItem(id, itemId);
      setItems((prev) => prev.map((i) => (i.id === itemId ? updatedItem : i)));
      const cl = await getChecklistById(id);
      setChecklist(cl);
    } catch (err) {
      setError(err?.message || "Failed to complete item");
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await deleteChecklistItem(id, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      const cl = await getChecklistById(id);
      setChecklist(cl);
    } catch (err) {
      setError(err?.message || "Failed to delete item");
    }
  };

  const handleAddItem = async (payload) => {
    const newItem = await addChecklistItem(id, payload);
    setItems((prev) => [...prev, newItem]);
    const cl = await getChecklistById(id);
    setChecklist(cl);
    setShowAddItem(false);
  };

  const completedCount = items.filter((i) => i.isCompleted).length;
  const pct =
    checklist?.completionPercentage ??
    (items.length ? Math.round((completedCount / items.length) * 100) : 0);

  if (pageLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
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
          <p style={{ color: "var(--rf-txt2)" }}>Loading checklist…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 cl-page">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "var(--rf-txt)" }}
            >
              Edit Checklist
            </h1>
            {checklist && (
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 text-xs font-semibold rounded-full"
                  style={statusBadgeStyle(checklist.status)}
                >
                  {STATUS_LABELS[checklist.status] ?? checklist.status}
                </span>
                {isLocked && (
                  <span
                    className="flex items-center gap-1 text-xs"
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
                  </span>
                )}
              </div>
            )}
          </div>
          {!isLocked && checklist && (
            <button
              type="button"
              onClick={() => setDelegateOpen(true)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
              style={{ background: "var(--rf-purple)", color: "#fff", marginRight: 8 }}
            >
              Delegate
            </button>
          )}
          {checklist?.status === "COMPLETED" && !isLocked && (
            <button
              type="button"
              onClick={handleSign}
              disabled={signing}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
              style={{ background: "var(--rf-purple)", color: "#fff", opacity: signing ? 0.6 : 1 }}
            >
              {signing ? (
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
                  Signing…
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Sign &amp; Lock
                </>
              )}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-lg p-4 mb-6 flex items-start gap-3"
            style={{
              background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
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

        {/* v15 B5 — Cross-company delegation history */}
        <div style={{ marginBottom: 16 }}>
          <ChecklistDelegationHistory
            checklistId={id}
            currentUserId={currentUserId}
          />
        </div>

        <ChecklistDelegateModal
          open={delegateOpen}
          onClose={() => setDelegateOpen(false)}
          checklistId={id}
          onCreated={() => setDelegateOpen(false)}
        />

        <form onSubmit={handleSave} className="space-y-6">
          {/* ── Metadata Card ── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border2)" }}
          >
            <div className="px-6 py-5" style={{ background: "var(--rf-accent)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "#fff" }}>
                Checklist Details
              </h2>
            </div>
            <div className="p-6 space-y-5">
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
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isLocked}
                  placeholder="Checklist title…"
                  className="w-full px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none disabled:opacity-50"
                  style={{
                    background: "var(--rf-bg2)",
                    border: "1px solid var(--rf-border3)",
                    color: "var(--rf-txt)",
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
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLocked}
                  rows={2}
                  placeholder="Optional description…"
                  className="w-full px-4 py-2 rounded-lg placeholder-gray-400 focus:outline-none resize-none disabled:opacity-50"
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
                    disabled={isLocked}
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
                    disabled={isLocked}
                    options={CHECKLIST_TYPES.map((t) => ({
                      value: t,
                      label: t,
                    }))}
                  />
                </div>
              </div>

              {/* ── Hierarchy (read-only project/site/subProject; editable zone/asset) ── */}
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

                {/* Project (display only — cannot change after creation) */}
                <div className="mb-4">
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: "var(--rf-txt)" }}
                  >
                    Project
                  </label>
                  <AppSelect
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    disabled={isLocked}
                    options={projects.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                    placeholder="— Select Project —"
                  />
                </div>

                {/* Asset (editable — allowed by PATCH API) */}
                <div className="mb-4">
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
                    disabled={
                      isLocked || !formData.projectId || assets.length === 0
                    }
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
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Items Card ── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border2)" }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{ borderColor: "var(--rf-border2)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold" style={{ color: "var(--rf-txt)" }}>
                  Checklist Items
                  <span
                    className="ml-2 text-sm font-normal"
                    style={{ color: "var(--rf-txt2)" }}
                  >
                    ({items.length})
                  </span>
                </h2>
                {!isLocked && (
                  <button
                    type="button"
                    onClick={() => setShowAddItem((v) => !v)}
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
                )}
              </div>
              <div className="space-y-1">
                <div
                  className="flex justify-between text-xs"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  <span>
                    {completedCount}/{items.length} completed
                  </span>
                  <span className="font-semibold" style={{ color: "var(--rf-txt)" }}>
                    {pct}%
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--rf-bg4)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background:
                        "linear-gradient(90deg, var(--rf-accent), var(--rf-green))",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {showAddItem && (
                <AddItemForm
                  nextSequence={items.length + 1}
                  onAdd={handleAddItem}
                  onCancel={() => setShowAddItem(false)}
                />
              )}
              {items.length === 0 && !showAddItem ? (
                <p
                  className="text-sm text-center py-8"
                  style={{ color: "var(--rf-txt3)" }}
                >
                  No items yet. Add the first one above.
                </p>
              ) : (
                items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    locked={isLocked}
                    onComplete={handleCompleteItem}
                    onDelete={handleDeleteItem}
                  />
                ))
              )}
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
              Back
            </button>
            {!isLocked && (
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{ background: "var(--rf-accent)", color: "#fff", opacity: saving ? 0.6 : 1 }}
              >
                {saving ? (
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
                  "Save Changes"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
