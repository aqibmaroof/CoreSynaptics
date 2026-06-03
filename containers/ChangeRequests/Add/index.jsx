"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createChangeRequest } from "@/services/ChangeRequests";
import { listCxProjects } from "@/services/ProjectWizard";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

const softBg = (token, pct = 16) =>
  `color-mix(in srgb, ${token} ${pct}%, transparent)`;

const IMPACT_TYPES = ["COST", "SCHEDULE", "BOTH", "NONE"];

const inputClass =
  "w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] focus:border-[var(--rf-accent)]";
const labelStyle = { color: "var(--rf-txt2)" };

const EMPTY = {
  title: "",
  description: "",
  impactType: "NONE",
  costImpact: "",
  scheduleDays: "",
};

export default function ChangeRequestAdd() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get("projectId") ?? "";

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(initialProjectId);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listCxProjects()
      .then((res) => {
        const list = toArray(res);
        setProjects(list);
        if (!initialProjectId && list.length > 0)
          setProjectId(String(list[0].id));
      })
      .catch(() => {});
  }, [initialProjectId]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!projectId) {
      setError("Please select a project.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createChangeRequest(projectId, {
        title: form.title.trim(),
        description: form.description || undefined,
        impactType: form.impactType,
        costImpact:
          form.costImpact !== "" ? parseFloat(form.costImpact) : undefined,
        scheduleDays:
          form.scheduleDays !== "" ? parseInt(form.scheduleDays) : undefined,
      });
      router.push("/ChangeRequests");
    } catch (err) {
      setError(err?.message || "Failed to create change request.");
    } finally {
      setLoading(false);
    }
  };

  const showCost = form.impactType === "COST" || form.impactType === "BOTH";
  const showDays = form.impactType === "SCHEDULE" || form.impactType === "BOTH";

  return (
    <div className="min-h-screen p-6" style={{ color: "var(--rf-txt)" }}>
      <div className="mx-auto">
        <button
          onClick={() => router.back()}
          className="text-sm mb-4 flex items-center gap-1 transition-colors text-[var(--rf-txt2)] hover:text-[var(--rf-txt)]"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold mb-6">New Change Request</h1>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{ background: softBg("var(--rf-red)", 14), border: `1px solid ${softBg("var(--rf-red)", 40)}`, color: "var(--rf-red)" }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={labelStyle}>
              Project <span style={{ color: "var(--rf-red)" }}>*</span>
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={`${inputClass} [&_option]:bg-[var(--rf-bg2)]`}
            >
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName ?? p.name ?? p.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1" style={labelStyle}>
              Title <span style={{ color: "var(--rf-red)" }}>*</span>
            </label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Additional rack installation"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={labelStyle}>
              Description
            </label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the scope change…"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={labelStyle}>
              Impact Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {IMPACT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("impactType", t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${form.impactType === t ? "bg-[var(--rf-accent)] text-white" : "bg-[var(--rf-bg3)] text-[var(--rf-txt2)] hover:bg-[var(--rf-bg4)]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {(showCost || showDays) && (
            <div className="grid grid-cols-2 gap-4">
              {showCost && (
                <div>
                  <label className="block text-sm mb-1" style={labelStyle}>
                    Cost Impact ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={form.costImpact}
                    onChange={(e) => set("costImpact", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              )}
              {showDays && (
                <div>
                  <label className="block text-sm mb-1" style={labelStyle}>
                    Schedule Impact (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={form.scheduleDays}
                    onChange={(e) => set("scheduleDays", e.target.value)}
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50 bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)]"
            >
              {loading ? "Creating…" : "Submit Change Request"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg font-medium transition-colors bg-[var(--rf-bg3)] hover:bg-[var(--rf-bg4)] text-[var(--rf-txt)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
