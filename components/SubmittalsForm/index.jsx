"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listV2Projects } from "@/services/CxProjectsV2";
import { getAssets } from "@/services/AssetManagement";
import { getContactsByCompany } from "@/services/Contacts";
import { required, lengthBetween, collectErrors } from "@/Utils/validation";

// Today as a yyyy-mm-dd string, for the Due Date min= attribute and past-date guard.
const todayStr = () => new Date().toISOString().slice(0, 10);

// Spec Section is a coded field (e.g. CSI "16480" or "26 05 00"); allow digits,
// letters, spaces, dots and dashes only.
const SPEC_SECTION_PATTERN = /^[A-Za-z0-9.\s-]+$/;

const SUBMITTAL_TYPES = [
  { value: "SHOP_DRAWING", label: "Shop Drawing" },
  { value: "PRODUCT_DATA", label: "Product Data" },
  { value: "SAMPLE", label: "Sample" },
  { value: "OPERATION_MAINTENANCE", label: "O&M Manual" },
  { value: "CLOSEOUT", label: "Closeout" },
  { value: "TEST_REPORT", label: "Test Report" },
  { value: "OTHER", label: "Other" },
];

// Submittal workflow separation of duties (Procore/CxAlloy model): the trade
// that SUBMITS a document is a responsible contractor; the company that REVIEWS
// it is the design/commissioning authority. Scope each dropdown to the company
// types that play that role so users don't pick, e.g., a rigger as the reviewer.
const TRADE_COMPANY_TYPES = new Set([
  "TRADE",
  "MECHANICAL",
  "CONTROLS",
  "LOW_VOLTAGE",
  "RIGGER",
  "SECURITY",
  "FIRE",
  "INTEGRATOR",
  "BUILDER",
  "OEM",
  "SUBCONTRACTOR",
  "VENDOR",
]);
const REVIEWER_COMPANY_TYPES = new Set([
  "CXA",
  "AE",
  "GC",
  "CONSULTANT",
  "CUSTOMER",
  "OPERATIONS",
]);

// Filter companies to those whose type fits the role. Companies with an unknown
// /legacy type (or no type) fall through to BOTH lists so nothing is hidden by
// a missing classification.
const companiesForRole = (companies, typeSet) =>
  (companies ?? []).filter(
    (c) => !c.type || typeSet.has(c.type) || isUnclassified(c.type),
  );
const isUnclassified = (type) =>
  ["CLIENT", "PARTNER", "OTHER"].includes(type);

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

function AppSelect({
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full px-4 py-3 rounded-lg outline-none appearance-none disabled:opacity-50"
        style={{
          background: "var(--rf-bg2)",
          color: "var(--rf-txt)",
          boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
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
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
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

export default function SubmittalForm({ onSubmit, loading, companies, users }) {
  // ── Project + Asset (V2) ───────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [errors, setErrors] = useState({});
  // "Reviewed By" lists the people who work at the chosen REVIEWER COMPANY
  // (the reviewing engineer/CxA firm) — i.e. that company's contacts — not the
  // org user directory. A reviewer is a person at the reviewing firm.
  const [reviewers, setReviewers] = useState([]);
  // Inline "discard unsaved changes?" confirmation (TC_SUB_047).
  const router = useRouter();
  const [confirmExit, setConfirmExit] = useState(false);

  const [form, setForm] = useState({
    cxProjectId: "",
    assetId: "",
    title: "",
    description: "",
    type: "SHOP_DRAWING",
    specSection: "",
    tradeCompanyId: "",
    reviewerCompanyId: "",
    reviewerUserId: "",
    taskId: "",
    dueDate: "",
  });

  // Load projects + org asset register on mount. The Asset field references the
  // ORG-LEVEL asset register (GET /assets), which is what POST /api/submittals
  // validates `assetId` against — NOT the project-scoped V2 ProjectAsset list.
  // Sourcing options from listV2Assets here sent a ProjectAsset.id, which never
  // matches the Asset table and 404'd every submission with an asset selected.
  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
    getAssets({ limit: 100 })
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, []);

  // Load the reviewer pool (the reviewer company's contacts) whenever the
  // selected Reviewer Company changes. Clear a stale reviewer selection too.
  useEffect(() => {
    let alive = true;
    const companyId = form.reviewerCompanyId;
    if (!companyId) {
      Promise.resolve().then(() => {
        if (alive) {
          setReviewers([]);
          setForm((prev) =>
            prev.reviewerUserId ? { ...prev, reviewerUserId: "" } : prev,
          );
        }
      });
      return () => {
        alive = false;
      };
    }
    getContactsByCompany(companyId)
      .then((d) => {
        if (alive) setReviewers(toArray(d));
      })
      .catch(() => {
        if (alive) setReviewers([]);
      });
    return () => {
      alive = false;
    };
  }, [form.reviewerCompanyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // Dirty if any field differs from its empty default. `type` defaults to
  // SHOP_DRAWING, so it's excluded from the dirty check.
  const isDirty = () =>
    Object.entries(form).some(
      ([k, v]) => k !== "type" && (v ?? "").toString().trim() !== "",
    );

  // Leave the form: warn first if there are unsaved changes (TC_SUB_047).
  const requestExit = () => {
    if (isDirty()) {
      setConfirmExit(true);
      return;
    }
    router.back();
  };

  const validate = () => {
    const today = todayStr();
    const specSection = form.specSection.trim();
    const fieldErrors = collectErrors({
      cxProjectId: required(form.cxProjectId, "Project"),
      // Titles are free text and need NOT be unique: the server auto-generates
      // the unique submittalNumber, so two submittals may share a title
      // (TC_SUB_037). Only enforce presence + length here, no duplicate block.
      title:
        required(form.title, "Title") ||
        lengthBetween(form.title, { max: 200, label: "Title" }),
      // Spec Section is optional; only validate format when something is entered.
      specSection:
        specSection && !SPEC_SECTION_PATTERN.test(specSection)
          ? "Spec Section may only contain letters, numbers, spaces, dots and dashes."
          : "",
      dueDate:
        required(form.dueDate, "Due Date") ||
        (form.dueDate && form.dueDate < today
          ? "Due Date cannot be in the past."
          : ""),
      // Separation of duties: the submitting trade and the reviewing
      // engineer/consultant must be different companies — a trade cannot
      // independently review its own submittal (Procore/industry submittal
      // workflow). Only enforced when both are chosen (both are optional).
      reviewerCompanyId:
        form.tradeCompanyId &&
        form.reviewerCompanyId &&
        form.tradeCompanyId === form.reviewerCompanyId
          ? "Reviewer Company must differ from the Trade Company."
          : "",
    });
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return; // guard against duplicate submission while saving
    if (!validate()) return;
    const payload = { ...form };
    payload.title = payload.title.trim();
    if (payload.specSection) payload.specSection = payload.specSection.trim();
    if (payload.dueDate)
      payload.dueDate = new Date(payload.dueDate).toISOString();
    // Strip empty optional fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === "" || payload[key] === null) delete payload[key];
    });
    onSubmit(payload);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-lg outline-none placeholder-gray-400";
  const inputStyle = {
    background: "var(--rf-bg2)",
    color: "var(--rf-txt)",
    boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
  };
  const labelClass = "text-sm mb-1 block";
  const labelStyle = { color: "var(--rf-txt2)" };
  // Inline per-field error line, matching the rest of the form's typography.
  const fieldError = (msg) =>
    msg ? (
      <p className="text-xs mt-1" style={{ color: "var(--rf-red)" }}>
        {msg}
      </p>
    ) : null;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border2)",
      }}
    >
      {/* Header */}
      <div
        className="p-6"
        style={{
          background: "var(--rf-accent)",
          borderBottom: "1px solid var(--rf-border2)",
        }}
      >
        <h2
          className="text-xl font-semibold flex items-center gap-2"
          style={{ color: "#fff" }}
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
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
          </svg>
          Submittal Details
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="p-6 space-y-6"
        style={{ background: "var(--rf-bg)" }}
      >
        {/* ── Section 1: Project Hierarchy ── */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--rf-txt2)" }}
          >
            Project Hierarchy
          </h3>

          {/* Project */}
          <div className="mb-4">
            <label className={labelClass} style={labelStyle}>
              Project *
            </label>
            <AppSelect
              name="cxProjectId"
              value={form.cxProjectId}
              onChange={handleChange}
              options={projects.map((p) => ({
                value: p.id,
                label: p.projectName ?? p.name ?? p.code ?? p.id,
              }))}
              placeholder="— Select Project —"
              required
            />
            {fieldError(errors.cxProjectId)}
          </div>

          {/* Asset */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>
                Asset{" "}
                <span style={{ color: "var(--rf-txt3)" }}>(optional)</span>
              </label>
              <AppSelect
                name="assetId"
                value={form.assetId}
                onChange={handleChange}
                options={assets.map((a) => ({ value: a.id, label: a.name }))}
                placeholder={
                  assets.length ? "— Select Asset —" : "No assets found"
                }
                disabled={assets.length === 0}
              />
            </div>
          </div>
        </div>

        {/* ── Section 2: Submittal Info ── */}
        <div
          className="border-t pt-6"
          style={{ borderColor: "var(--rf-border2)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--rf-txt2)" }}
          >
            Submittal Info
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Title */}
            <div className="lg:col-span-2 flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Title *
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. UPS-101 Shop Drawing - Primary Feed"
                className={inputClass}
                style={inputStyle}
                maxLength={200}
                required
              />
              {fieldError(errors.title)}
            </div>

            {/* Type */}
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Type *
              </label>
              <AppSelect
                name="type"
                value={form.type}
                onChange={handleChange}
                options={SUBMITTAL_TYPES}
                required
              />
            </div>

            {/* Spec Section */}
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Spec Section
              </label>
              <input
                name="specSection"
                value={form.specSection}
                onChange={handleChange}
                placeholder="e.g. 16480"
                className={inputClass}
                style={inputStyle}
                maxLength={50}
              />
              {fieldError(errors.specSection)}
            </div>

            {/* Due Date */}
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                min={todayStr()}
                className={inputClass}
                style={inputStyle}
                required
              />
              {fieldError(errors.dueDate)}
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col mt-5">
            <label className={labelClass} style={labelStyle}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={`${inputClass} h-28 resize-none`}
              style={inputStyle}
              placeholder="Describe the submittal content, scope, and relevant details..."
            />
          </div>
        </div>

        {/* ── Section 3: Review & Assignment ── */}
        <div
          className="border-t pt-6"
          style={{ borderColor: "var(--rf-border2)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--rf-txt2)" }}
          >
            Review &amp; Assignment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Trade Company */}
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Trade Company
              </label>
              <AppSelect
                name="tradeCompanyId"
                value={form.tradeCompanyId}
                onChange={handleChange}
                options={companiesForRole(companies, TRADE_COMPANY_TYPES).map(
                  (c) => ({ value: c.id, label: c.name }),
                )}
                placeholder="— Select Company —"
              />
            </div>

            {/* Reviewer Company */}
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Reviewer Company
              </label>
              <AppSelect
                name="reviewerCompanyId"
                value={form.reviewerCompanyId}
                onChange={handleChange}
                options={companiesForRole(
                  companies,
                  REVIEWER_COMPANY_TYPES,
                ).map((c) => ({ value: c.id, label: c.name }))}
                placeholder="— Select Company —"
              />
              {fieldError(errors.reviewerCompanyId)}
            </div>

            {/* Reviewer User */}
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Reviewed By
              </label>
              <AppSelect
                name="reviewerUserId"
                value={form.reviewerUserId}
                onChange={handleChange}
                options={reviewers.map((u) => ({
                  value: u.id,
                  label:
                    `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() +
                      (u.jobTitle ? ` · ${u.jobTitle}` : "") || u.email || u.id,
                }))}
                placeholder={
                  !form.reviewerCompanyId
                    ? "— Select a reviewer company first —"
                    : reviewers.length
                      ? "— Select Reviewer —"
                      : "No contacts at this company"
                }
                disabled={!form.reviewerCompanyId || reviewers.length === 0}
              />
            </div>
          </div>
        </div>

        {/* Unsaved-changes confirm (TC_SUB_047) */}
        {confirmExit && (
          <div
            role="alertdialog"
            aria-label="Discard unsaved submittal?"
            className="rounded-lg p-4"
            style={{
              background: "color-mix(in srgb, var(--rf-red) 8%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--rf-red) 35%, transparent)",
            }}
          >
            <p
              className="text-sm font-semibold mb-3"
              style={{ color: "var(--rf-txt)" }}
            >
              Discard this submittal? Your unsaved changes will be lost.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmExit(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{
                  border: "1px solid var(--rf-border2)",
                  color: "var(--rf-txt2)",
                }}
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: "var(--rf-red)", color: "#fff" }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={requestExit}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-medium"
            style={{
              border: "1px solid var(--rf-border2)",
              color: "var(--rf-txt2)",
              background: "transparent",
            }}
          >
            Cancel
          </button>
          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
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
            "Create Submittal"
          )}
          </button>
        </div>
      </form>
    </div>
  );
}
