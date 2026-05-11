"use client";

import { useState, useEffect } from "react";
import { getActivities, createActivity, deleteActivity } from "@/services/Activities";

// API expects uppercase enum values
const API_TYPE_MAP = { Note: "NOTE", Call: "CALL_LOG", Meeting: "MEETING" };
// Map API values back to display labels
const DISPLAY_TYPE_MAP = { NOTE: "Note", CALL_LOG: "Call", MEETING: "Meeting" };

const ACTIVITY_TYPES = ["Note", "Call", "Meeting"];

const TYPE_COLOR = {
  Note: "bg-blue-500",
  Call: "bg-green-500",
  Meeting: "bg-purple-500",
};

const TYPE_ICON = {
  Note: "📝",
  Call: "📞",
  Meeting: "📅",
};

const EMPTY_FORM = {
  type: "Note",
  title: "",
  description: "",
  duration: "",
  scheduledAt: "",
};

/**
 * Reusable activity timeline.
 *
 * Props:
 *   entityType  – "LEAD" | "CONTACT" | "COMPANY" | "DEAL"
 *   entityId    – UUID of the entity
 */
export default function ActivityTimeline({ entityType, entityId }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Normalise to uppercase for API
  const linkedToType = entityType?.toUpperCase();

  useEffect(() => {
    if (entityId) fetchActivities();
  }, [entityId]);

  async function fetchActivities() {
    setLoading(true);
    try {
      const res = await getActivities(linkedToType, entityId);
      const list = Array.isArray(res) ? res : res?.data || [];
      // latest first
      setActivities([...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    if (!form.title.trim()) { setErr("Title is required"); return; }
    setSaving(true);
    setErr("");
    try {
      await createActivity({
        linkedToType,
        linkedToId: entityId,
        type: API_TYPE_MAP[form.type],
        title: form.title.trim(),
        description: form.description || undefined,
        duration: form.type === "Call" && form.duration ? Number(form.duration) : undefined,
        scheduledAt: form.type === "Meeting" && form.scheduledAt ? form.scheduledAt : undefined,
      });
      setShowForm(false);
      setForm(EMPTY_FORM);
      await fetchActivities();
    } catch (e) {
      setErr(e?.message || "Failed to save activity");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteActivity(id);
      setActivities((prev) => prev.filter((a) => a.id !== id));
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Activity Timeline</h4>
        <button
          onClick={() => { setShowForm((v) => !v); setErr(""); }}
          className="text-xs px-3 py-1.5 bg-cyan-700/40 hover:bg-cyan-700/70 text-cyan-300 rounded-lg transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Activity"}
        </button>
      </div>

      {/* Add activity form */}
      {showForm && (
        <div className="bg-gray-800/80 border border-gray-700 rounded-xl p-4 space-y-3">
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <div className="grid grid-cols-3 gap-2">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm({ ...EMPTY_FORM, type: t })}
                className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  form.type === t
                    ? "border-cyan-500 bg-cyan-600/20 text-cyan-300"
                    : "border-gray-600 text-gray-400 hover:text-white"
                }`}
              >
                {TYPE_ICON[t]} {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
          />
          <textarea
            placeholder={form.type === "Note" ? "Note content..." : "Details / notes..."}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
          />
          {form.type === "Call" && (
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          )}
          {form.type === "Meeting" && (
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
            />
          )}
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Activity"}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="text-center text-gray-500 text-sm py-4">Loading activities...</div>
      ) : activities.length === 0 ? (
        <div className="text-center text-gray-600 text-sm py-6">No activities yet.</div>
      ) : (
        <div className="relative space-y-3 pl-5 before:absolute before:left-[7px] before:top-0 before:bottom-0 before:w-px before:bg-gray-700">
          {activities.map((a) => {
            const displayType = DISPLAY_TYPE_MAP[a.type] || a.type;
            return (
              <div key={a.id} className="relative">
                {/* Dot */}
                <span className={`absolute -left-[18px] top-1.5 w-3 h-3 rounded-full ${TYPE_COLOR[displayType] || "bg-gray-500"}`} />
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-lg px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{TYPE_ICON[displayType] || "🔹"}</span>
                      <span className="text-white text-sm font-medium">{a.title}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 text-gray-400">{displayType}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                  {(a.description || a.content) && (
                    <p className="text-gray-400 text-xs mt-1">{a.description || a.content}</p>
                  )}
                  {a.duration && <p className="text-gray-500 text-xs mt-1">Duration: {a.duration} min</p>}
                  {a.scheduledAt && (
                    <p className="text-gray-500 text-xs mt-1">
                      Scheduled: {new Date(a.scheduledAt).toLocaleString()}
                    </p>
                  )}
                  <p className="text-gray-600 text-xs mt-1">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
