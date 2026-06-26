"use client";

import { useState, useEffect, useCallback } from "react";
import { listV2Projects } from "@/services/CxProjectsV2";
import {
  required,
  validatePersonName,
  lengthBetween,
  dateOrder,
  notDuplicate,
  collectErrors,
  NAME_PATTERN,
} from "@/Utils/validation";
 import { listSafetyItems,
  getSafetySummary,
  createSafetyItem,
  removeSafetyItem,
} from "@/services/SafetyItems";

/* ------------------------------------------------------------------ *
 * Config
 * ------------------------------------------------------------------ */

const CATEGORIES = [
  { key: "CERTIFICATION", label: "Training / Certification" },
  { key: "PTP_AHA_JSA", label: "PTP / AHA / JSA" },
  { key: "INSPECTION", label: "Inspection" },
  { key: "LIFT_PLAN", label: "Lift Plan" },
  { key: "SDS_DOCUMENT", label: "SDS / Document" },
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
const fieldCls = "w-full px-3 py-2.5 rounded-lg text-sm outline-none";

// Inset ring turns red when the field has an error.
const fieldStyle = (err) => ({
  background: "var(--rf-bg2)",
  color: "var(--rf-txt)",
  boxShadow: `inset 0 0 0 1px ${err ? "var(--rf-red)" : "var(--rf-border3, #8daacf)"}`,
});
const ErrText = ({ msg }) =>
  msg ? (
    <span role="alert" className="text-xs mt-1 block" style={{ color: "var(--rf-red)" }}>
      {msg}
    </span>
  ) : null;

const toRows = (res) => {
  const d = res?.data ?? res;
  return Array.isArray(d) ? d : (d?.data ?? d?.items ?? []);
};

const statusTone = (status) => {
  if (status === "EXPIRED" || status === "EXPIRING") return "var(--rf-yellow)";
  if (status === "VOID") return "var(--rf-txt3)";
  return "var(--rf-txt3)";
};

const statusLabel = (item) => {
  if (item.status === "EXPIRED") return `Expired ${item.expiresAt?.slice(0, 10) ?? ""}`;
  if (item.status === "EXPIRING") return `Expiring ${item.expiresAt?.slice(0, 10) ?? ""}`;
  if (item.status === "COMPLETED") return "Completed";
  if (item.status === "VOID") return "Void";
  return item.expiresAt ? `Valid · ${item.expiresAt.slice(0, 10)}` : "Active";
};

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export default function Safety() {
  const [projects, setProjects] = useState([]);

  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [expiringSoon, setExpiringSoon] = useState(0);

  const [tab, setTab] = useState("CERTIFICATION");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [flash, setFlash] = useState(null); // { type: "success"|"error", text }

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((res) => setProjects(toRows(res)))
      .catch(() => setProjects([]));
  }, []);

  const projectLabel = (p) => p.name ?? p.projectName ?? p.code ?? p.id;
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  // TC_035 — a non-blocking warning when the expiry date is already in the past.
  // Recording a historical (already-expired) cert is allowed, so this never
  // blocks submit; it just flags that the record will land as expired.
  const expiryInPast =
    form.expires && form.expires < new Date().toISOString().slice(0, 10);

  // Listing is independent of the create-form's project picker — it's
  // aggregated across every project the org has, tagging each item with
  // the project it came from so remove() knows which project to hit.
  const fetchItems = useCallback(async () => {
    if (projects.length === 0) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled(
        projects.map((p) =>
          listSafetyItems(p.id, { kind: tab }).then((res) =>
            toRows(res).map((item) => ({ ...item, _projectId: p.id })),
          ),
        ),
      );
      setItems(
        results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value),
      );
    } catch (err) {
      setError(err?.message || "Failed to load safety items.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [projects, tab]);

  const refreshSummary = useCallback(async () => {
    if (projects.length === 0) return;
    try {
      const results = await Promise.allSettled(
        projects.map((p) => getSafetySummary(p.id)),
      );
      const totals = {};
      let expiring = 0;
      results.forEach((r) => {
        if (r.status !== "fulfilled") return;
        const d = r.value?.data ?? r.value ?? {};
        const perKind = d.counts ?? d.byKind ?? {};
        Object.entries(perKind).forEach(([k, v]) => {
          totals[k] = (totals[k] ?? 0) + (v ?? 0);
        });
        expiring += d.expiringCount ?? 0;
      });
      setCounts(totals);
      setExpiringSoon(expiring);
    } catch {
      // summary is a nice-to-have; ignore failures
    }
  }, [projects]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Mirrors the QA contract for this Add form (TC_007..TC_043).
  const validateSafety = () => {
    const errs = collectErrors({
      projectId: required(form.projectId, "Project"), // TC_007
      name:
        required(form.name, "Certification") || // TC_008
        lengthBetween(form.name, { max: 120, label: "Certification" }), // TC_019
      worker:
        required(form.worker, "Worker name") || // TC_009
        validatePersonName(form.worker, "Worker name", NAME_PATTERN), // TC_020, TC_021
      company: required(form.company, "Company / trade"), // TC_010
      issued: required(form.issued, "Issued date"), // TC_011
      expires:
        required(form.expires, "Expiry date") || // TC_012
        dateOrder(form.issued, form.expires, { label: "Expiry date" }), // TC_014
    });
    // TC_017 — duplicate certification (same cert + worker in this category).
    // `items` is already scoped to the active tab (listSafetyItems is fetched
    // with { kind: tab }), and each row carries the API shape — title /
    // workerName — NOT the form field names. Comparing against i.name / i.worker
    // here silently matched nothing, so duplicates slipped through.
    if (!errs.name && !errs.worker) {
      const existingNames = items
        .filter(
          (i) =>
            (i.workerName || "").trim().toLowerCase() ===
            form.worker.trim().toLowerCase(),
        )
        .map((i) => i.title);
      const dup = notDuplicate(form.name, existingNames, "Certification");
      if (dup) errs.name = dup;
    }
    return errs;
  };

  // Auto-clear the flash so a message never lingers after it's resolved (TC_002).
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(t);
  }, [flash]);
  useEffect(() => {
    refreshSummary();
  }, [refreshSummary]);

  // Runs the QA validation (inline errors + dup-check) THEN persists to the
  // backend. Combines the QA-fix contract with the API-wired create flow.
  const handleAdd = async () => {
    const errs = validateSafety();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setFlash({ type: "error", text: "Please fix the highlighted fields." });
      return;
    }
    setErrors({});
    setSaving(true);
    setError("");
    try {
      await createSafetyItem(form.projectId, {
        kind: tab,
        // TC_043 — trim text so leading/trailing spaces never persist.
        title: form.name.trim(),
        workerName: form.worker.trim() || undefined,
        companyTrade: form.company.trim() || undefined,
        issuedAt: form.issued || undefined,
        expiresAt: form.expires || undefined,
      });
      setForm(EMPTY_FORM);
      setShowAdd(false);
      await Promise.all([fetchItems(), refreshSummary()]);
      setFlash({ type: "success", text: "Safety record added." }); // TC_001
    } catch (err) {
      setError(err?.message || "Could not add safety item.");
      setFlash({ type: "error", text: "Could not add safety item." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    try {
      await removeSafetyItem(item._projectId, item.id);
      await refreshSummary();
      setFlash({ type: "success", text: "Record deleted." }); // TC_001 (delete)
    } catch (err) {
      setError(err?.message || "Could not remove safety item.");
      setFlash({ type: "error", text: "Could not remove safety item." });
      fetchItems();
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto">
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

        {/* Action result — fixed slot so showing it never shifts layout (TC_003) */}
        {flash && (
          <div
            className="px-4 py-2.5 rounded-lg text-sm font-medium mb-4"
            role="alert"
            style={
              flash.type === "success"
                ? {
                    background: "color-mix(in srgb, var(--rf-green) 14%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--rf-green) 32%, transparent)",
                    color: "var(--rf-green)",
                  }
                : {
                    background: "color-mix(in srgb, var(--rf-red) 14%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--rf-red) 32%, transparent)",
                    color: "var(--rf-red)",
                  }
            }
          >
            {flash.text}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="rounded-lg p-3 text-sm mb-4 flex items-center gap-2"
            style={{
              background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
              border: "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
              color: "var(--rf-red)",
            }}
          >
            {error}
            <button className="ml-auto" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}

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
                onClick={() => {
                  setTab(cat.key);
                  setShowAdd(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-bold"
                style={
                  active
                    ? { background: "var(--rf-accent)", color: "#fff" }
                    : { background: "var(--rf-bg3)", color: "var(--rf-txt2)" }
                }
              >
                {cat.label} ({counts[cat.key] ?? 0})
              </button>
            );
          })}
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="rounded-2xl p-4 mb-4" style={CARD}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Project — attach the record to a project (listV2Projects) */}
              <div className="md:col-span-3">
                <select
                  className={fieldCls}
                  style={fieldStyle(errors.projectId)}
                  value={form.projectId}
                  onChange={(e) => set("projectId", e.target.value)}
                >
                  <option value="">— Attach to project * —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {projectLabel(p)}
                    </option>
                  ))}
                </select>
                <ErrText msg={errors.projectId} />
              </div>

              <div>
                <input
                  className={fieldCls}
                  style={fieldStyle(errors.name)}
                  placeholder="Certification (e.g. OSHA 30) *"
                  title="Name of the certification, training, plan, or document (e.g. OSHA 30, Lift Plan)"
                  maxLength={120}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
                <ErrText msg={errors.name} />
              </div>
              <div>
                <input
                  className={fieldCls}
                  style={fieldStyle(errors.worker)}
                  placeholder="Worker name *"
                  title="Full name of the worker this record applies to (letters, spaces, hyphens, apostrophes)"
                  maxLength={100}
                  value={form.worker}
                  onChange={(e) => set("worker", e.target.value)}
                />
                <ErrText msg={errors.worker} />
              </div>
              <div>
                <input
                  className={fieldCls}
                  style={fieldStyle(errors.company)}
                  placeholder="Company / trade *"
                  title="Company or trade the worker belongs to (e.g. Acme Electrical)"
                  maxLength={120}
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                />
                <ErrText msg={errors.company} />
              </div>

              <div>
                <label
                  className="block uppercase font-bold mb-1.5"
                  style={{ color: "var(--rf-txt3)", fontSize: 10, letterSpacing: "0.08em" }}
                >
                  Issued *
                </label>
                <input
                  type="date"
                  className={fieldCls}
                  style={fieldStyle(errors.issued)}
                  title="Date the certification or document was issued"
                  value={form.issued}
                  onChange={(e) => set("issued", e.target.value)}
                />
                <ErrText msg={errors.issued} />
              </div>
              <div>
                <label
                  className="block uppercase font-bold mb-1.5"
                  style={{ color: "var(--rf-txt3)", fontSize: 10, letterSpacing: "0.08em" }}
                >
                  Expires *
                </label>
                <input
                  type="date"
                  className={fieldCls}
                  style={fieldStyle(errors.expires)}
                  title="Date the certification expires — must be on or after the issued date"
                  min={form.issued || undefined}
                  value={form.expires}
                  onChange={(e) => set("expires", e.target.value)}
                />
                <ErrText msg={errors.expires} />
                {!errors.expires && expiryInPast && (
                  <span
                    role="status"
                    className="text-xs mt-1 block"
                    style={{ color: "var(--rf-yellow)" }}
                  >
                    This expiry date is in the past — the record will be saved as
                    already expired.
                  </span>
                )}
              </div>
              <button
                className="self-start rounded-lg text-sm font-bold disabled:opacity-60"
                style={{
                  background: "var(--rf-accent)",
                  color: "#fff",
                  padding: "10px 16px",
                }}
                disabled={saving}
                onClick={handleAdd}
              >
                {saving ? "Adding…" : "Add to project"}
              </button>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div
            className="rounded-2xl p-10 text-center text-sm"
            style={{ ...CARD, color: "var(--rf-txt3)" }}
          >
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center text-sm"
            style={{ ...CARD, color: "var(--rf-txt3)" }}
          >
            No {CATEGORIES.find((c) => c.key === tab)?.label} records yet.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((item) => {
              const tone = statusTone(item.status);
              return (
                <div
                  key={item.id}
                  className="rounded-xl px-5 py-3.5 flex items-center justify-between gap-3"
                  style={CARD}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold" style={{ color: "var(--rf-txt)" }}>
                      {item.title}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--rf-txt3)" }}>
                      {[item.workerName, item.companyTrade].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-bold"
                      style={{
                        background: `color-mix(in srgb, ${tone} 14%, transparent)`,
                        color: tone,
                        border: `1px solid color-mix(in srgb, ${tone} 32%, transparent)`,
                      }}
                    >
                      {statusLabel(item)}
                    </span>
                    <button
                      onClick={() => remove(item)}
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
