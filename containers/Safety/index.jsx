"use client";

import { useState, useEffect, useMemo } from "react";
import { listV2Projects } from "@/services/CxProjectsV2";

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  { key: "TRAINING", label: "Training / Certification" },
  { key: "PTP", label: "PTP / AHA / JSA" },
  { key: "INSPECTION", label: "Inspection" },
  { key: "LIFT", label: "Lift Plan" },
  { key: "SDS", label: "SDS / Document" },
  { key: "ORIENTATION", label: "Orientation" },
];

const EMPTY_FORM = {
  projectId: "",
  name: "",
  worker: "",
  company: "",
  issued: "",
  expires: "",
};

/* ------------------------------------------------------------------ *
 * Shared styles (RequiredFlow light theme)
 * ------------------------------------------------------------------ */

const CARD = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border2)",
};
// Border drawn as an inset ring so it survives the global input overrides.
const FIELD = {
  background: "var(--rf-bg2)",
  color: "var(--rf-txt)",
  boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
};
const fieldCls = "w-full px-3 py-2.5 rounded-lg text-sm outline-none";

let _id = 0;

const daysUntil = (d) =>
  d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null;

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function Safety() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tab, setTab] = useState("TRAINING");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((res) => {
        const d = res?.data ?? res;
        setProjects(Array.isArray(d) ? d : (d?.data ?? d?.items ?? []));
      })
      .catch(() => {});
  }, []);

  const projectLabel = (p) => p.name ?? p.projectName ?? p.code ?? p.id;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const counts = useMemo(() => {
    const c = {};
    CATEGORIES.forEach((cat) => {
      c[cat.key] = items.filter((i) => i.category === cat.key).length;
    });
    return c;
  }, [items]);

  const expiringSoon = useMemo(
    () =>
      items.filter((i) => {
        const n = daysUntil(i.expires);
        return n !== null && n >= 0 && n <= 30;
      }).length,
    [items],
  );

  const filtered = useMemo(
    () => items.filter((i) => i.category === tab),
    [items, tab],
  );

  const handleAdd = () => {
    if (!form.name.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: `s${++_id}`, category: tab, ...form, name: form.name.trim() },
    ]);
    setForm(EMPTY_FORM);
    setShowAdd(false);
  };

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="p-6">
      <div className="mx-auto" style={{ maxWidth: 1240 }}>
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <p
              className="uppercase font-bold mb-1"
              style={{
                color: "var(--rf-txt3)",
                fontSize: 11,
                letterSpacing: "0.12em",
              }}
            >
              Project · Safety Register
            </p>
            <h1 className="text-2xl font-bold" style={{ color: "var(--rf-txt)" }}>
              Safety
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--rf-txt2)" }}>
              Certifications, pre-task plans, inspections, lift plans, SDS, and
              orientations — with cert-expiry alerts.
            </p>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "var(--rf-accent)", color: "#fff" }}
            onClick={() => setShowAdd((v) => !v)}
          >
            + Add
          </button>
        </div>

        {/* Expiry alert */}
        {expiringSoon > 0 && (
          <div
            className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold mb-4"
            style={{
              background: "color-mix(in srgb, var(--rf-yellow) 14%, transparent)",
              color: "var(--rf-yellow)",
              border: "1px solid color-mix(in srgb, var(--rf-yellow) 32%, transparent)",
            }}
          >
            {expiringSoon} expiring within 30 days
          </div>
        )}

        {/* Category tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {CATEGORIES.map((cat) => {
            const active = tab === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setTab(cat.key)}
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={
                  active
                    ? { background: "var(--rf-accent)", color: "#fff" }
                    : { background: "var(--rf-bg3)", color: "var(--rf-txt2)" }
                }
              >
                {cat.label} ({counts[cat.key]})
              </button>
            );
          })}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-2xl p-4 mb-4" style={CARD}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Project — attach the record to a project (listV2Projects) */}
              <select
                className={`${fieldCls} md:col-span-3`}
                style={FIELD}
                value={form.projectId}
                onChange={(e) => set("projectId", e.target.value)}
              >
                <option value="">— Attach to project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {projectLabel(p)}
                  </option>
                ))}
              </select>

              <input
                className={fieldCls}
                style={FIELD}
                placeholder="Certification (e.g. OSHA 30)"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
              <input
                className={fieldCls}
                style={FIELD}
                placeholder="Worker name"
                value={form.worker}
                onChange={(e) => set("worker", e.target.value)}
              />
              <input
                className={fieldCls}
                style={FIELD}
                placeholder="Company / trade"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />

              <div>
                <label
                  className="block uppercase font-bold mb-1.5"
                  style={{ color: "var(--rf-txt3)", fontSize: 10, letterSpacing: "0.08em" }}
                >
                  Issued
                </label>
                <input
                  type="date"
                  className={fieldCls}
                  style={FIELD}
                  value={form.issued}
                  onChange={(e) => set("issued", e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block uppercase font-bold mb-1.5"
                  style={{ color: "var(--rf-txt3)", fontSize: 10, letterSpacing: "0.08em" }}
                >
                  Expires
                </label>
                <input
                  type="date"
                  className={fieldCls}
                  style={FIELD}
                  value={form.expires}
                  onChange={(e) => set("expires", e.target.value)}
                />
              </div>
              <button
                className="self-end rounded-lg text-sm font-bold"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  padding: "10px 0",
                  opacity: form.name.trim() ? 1 : 0.6,
                }}
                disabled={!form.name.trim()}
                onClick={handleAdd}
              >
                Add to project
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center text-sm"
            style={{ ...CARD, color: "var(--rf-txt3)" }}
          >
            No {CATEGORIES.find((c) => c.key === tab)?.label} records yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((item) => {
              const n = daysUntil(item.expires);
              const soon = n !== null && n >= 0 && n <= 30;
              const tone = soon ? "var(--rf-yellow)" : "var(--rf-txt3)";
              return (
                <div
                  key={item.id}
                  className="rounded-xl px-5 py-3.5 flex items-center justify-between gap-3"
                  style={CARD}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold" style={{ color: "var(--rf-txt)" }}>
                      {item.name}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--rf-txt3)" }}>
                      {[item.worker, item.company].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.expires && (
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-bold"
                        style={{
                          background: `color-mix(in srgb, ${tone} 14%, transparent)`,
                          color: tone,
                          border: `1px solid color-mix(in srgb, ${tone} 32%, transparent)`,
                        }}
                      >
                        Expiring {item.expires}
                      </span>
                    )}
                    <button
                      onClick={() => remove(item.id)}
                      title="Remove"
                      className="px-1 text-lg leading-none"
                      style={{ color: "var(--rf-txt3)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--rf-red)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--rf-txt3)")}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
