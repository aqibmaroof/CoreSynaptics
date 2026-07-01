"use client";

import { useEffect, useState } from "react";
import { getContactsByCompany } from "@/services/Contacts";
import { required, lengthBetween, collectErrors } from "@/Utils/validation";

// Spec Section is a coded field (e.g. CSI "16480" or "26 05 00"); allow digits,
// letters, spaces, dots and dashes only. Mirrors SubmittalsForm (create).
const SPEC_SECTION_PATTERN = /^[A-Za-z0-9.\s-]+$/;

// The API enum values — must match SubmittalType on the backend. The previous
// version of this form sent human-readable labels ("Product Data") which the
// UpdateSubmittalDto @IsEnum rejected with a 400.
const SUBMITTAL_TYPES = [
  { value: "SHOP_DRAWING", label: "Shop Drawing" },
  { value: "PRODUCT_DATA", label: "Product Data" },
  { value: "SAMPLE", label: "Sample" },
  { value: "OPERATION_MAINTENANCE", label: "O&M Manual" },
  { value: "CLOSEOUT", label: "Closeout" },
  { value: "TEST_REPORT", label: "Test Report" },
  { value: "OTHER", label: "Other" },
];

// Submittal workflow separation of duties (see SubmittalsForm for the rationale):
// scope the Trade vs Reviewer company dropdowns to the company types that play
// each role so a trade can't be picked as its own reviewer.
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
const isUnclassified = (type) => ["CLIENT", "PARTNER", "OTHER"].includes(type);
const companiesForRole = (companies, typeSet) =>
  (companies ?? []).filter(
    (c) => !c.type || typeSet.has(c.type) || isUnclassified(c.type),
  );

function toArray(data) {
  return Array.isArray(data) ? data : (data?.data ?? []);
}

// The API returns dueDate as an ISO timestamp; the <input type="date"> control
// needs a bare yyyy-mm-dd. Empty/invalid → "".
const isoToDateInput = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

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

// Edit form — mirrors SubmittalsForm's field vocabulary and payload shape so the
// PUT body only ever contains fields UpdateSubmittalDto whitelists. `data` is the
// camelCase SubmittalResponseDto from GET /submittals/:id. Project + Submittal
// Number are shown read-only (the API does not allow changing them on update).
export default function SubmittalEditForm({
  data,
  onSubmit,
  loading,
  projects,
  companies,
  users, // kept for prop compatibility; reviewers now come from company contacts
}) {
  const [errors, setErrors] = useState({});
  // "Reviewed By" is the reviewer company's contacts (matches create form).
  const [reviewers, setReviewers] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "SHOP_DRAWING",
    specSection: "",
    tradeCompanyId: "",
    reviewerCompanyId: "",
    reviewerUserId: "",
    dueDate: "",
  });

  // Hydrate from the API response using the SAME camelCase keys the API returns.
  // Defer the setState off the effect body (matches SubmittalsForm) so we don't
  // trip react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!data) return;
    let alive = true;
    Promise.resolve().then(() => {
      if (!alive) return;
      setForm({
        title: data.title || "",
        description: data.description || "",
        type: data.type || "SHOP_DRAWING",
        specSection: data.specSection || "",
        tradeCompanyId: data.tradeCompanyId || "",
        reviewerCompanyId: data.reviewerCompanyId || "",
        reviewerUserId: data.reviewerUserId || "",
        dueDate: isoToDateInput(data.dueDate),
      });
    });
    return () => {
      alive = false;
    };
  }, [data]);

  // Load the reviewer pool (reviewer company's contacts) when it changes.
  useEffect(() => {
    let alive = true;
    const companyId = form.reviewerCompanyId;
    if (!companyId) {
      Promise.resolve().then(() => {
        if (alive) setReviewers([]);
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
    setForm((prev) => {
      // Changing the reviewer company invalidates a previously-picked reviewer.
      if (name === "reviewerCompanyId" && value !== prev.reviewerCompanyId) {
        return { ...prev, reviewerCompanyId: value, reviewerUserId: "" };
      }
      return { ...prev, [name]: value };
    });
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const specSection = form.specSection.trim();
    const fieldErrors = collectErrors({
      title:
        required(form.title, "Title") ||
        lengthBetween(form.title, { max: 200, label: "Title" }),
      specSection:
        specSection && !SPEC_SECTION_PATTERN.test(specSection)
          ? "Spec Section may only contain letters, numbers, spaces, dots and dashes."
          : "",
      // Separation of duties — trade and reviewer companies must differ when both set.
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
    // Build a payload containing ONLY whitelisted UpdateSubmittalDto fields.
    const payload = {
      title: form.title.trim(),
      description: form.description,
      type: form.type,
      specSection: form.specSection.trim(),
      tradeCompanyId: form.tradeCompanyId,
      reviewerCompanyId: form.reviewerCompanyId,
      reviewerUserId: form.reviewerUserId,
      dueDate: form.dueDate
        ? new Date(form.dueDate).toISOString()
        : "",
    };
    // Strip empty optionals so we never send "" for a UUID/enum field.
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
  const readOnlyStyle = {
    ...inputStyle,
    opacity: 0.7,
    cursor: "not-allowed",
  };
  const labelClass = "text-sm mb-1 block";
  const labelStyle = { color: "var(--rf-txt2)" };
  const fieldError = (msg) =>
    msg ? (
      <p className="text-xs mt-1" style={{ color: "var(--rf-red)" }}>
        {msg}
      </p>
    ) : null;

  const projectLabel = (() => {
    const p = (projects ?? []).find((x) => x.id === data?.cxProjectId);
    return (
      p?.projectName ?? p?.name ?? p?.code ?? data?.cxProjectId ?? "—"
    );
  })();

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border2)",
      }}
    >
      {/* HEADER */}
      <div
        className="p-6"
        style={{
          background: "var(--rf-accent)",
          borderBottom: "1px solid var(--rf-border2)",
        }}
      >
        <h2
          className="flex items-center gap-2 text-xl font-semibold"
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
        {/* ── Project Hierarchy (read-only) ── */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: "var(--rf-txt2)" }}
          >
            Project Hierarchy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Project
              </label>
              <input
                value={projectLabel}
                readOnly
                disabled
                className={inputClass}
                style={readOnlyStyle}
              />
            </div>
            <div className="flex flex-col">
              <label className={labelClass} style={labelStyle}>
                Submittal Number
              </label>
              <input
                value={data?.submittalNumber ?? "—"}
                readOnly
                disabled
                className={inputClass}
                style={readOnlyStyle}
              />
            </div>
          </div>
        </div>

        {/* ── Submittal Info ── */}
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
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
              />
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
              maxLength={5000}
              placeholder="Describe the submittal content, scope, and relevant details..."
            />
          </div>
        </div>

        {/* ── Review & Assignment ── */}
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
                      (u.jobTitle ? ` · ${u.jobTitle}` : "") ||
                    u.email ||
                    u.id,
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

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-4 py-3 rounded-lg font-medium transition-all"
          style={{
            background: "var(--rf-accent)",
            color: "#fff",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Updating..." : "Update Submittal"}
        </button>
      </form>
    </div>
  );
}
