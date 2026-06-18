"use client";

import { useState, useEffect } from "react";
import { listV2Projects, listV2Assets } from "@/services/CxProjectsV2";

const SUBMITTAL_TYPES = [
  { value: "SHOP_DRAWING", label: "Shop Drawing" },
  { value: "PRODUCT_DATA", label: "Product Data" },
  { value: "SAMPLE", label: "Sample" },
  { value: "OPERATION_MAINTENANCE", label: "O&M Manual" },
  { value: "CLOSEOUT", label: "Closeout" },
  { value: "TEST_REPORT", label: "Test Report" },
  { value: "OTHER", label: "Other" },
];

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

  // Load projects on mount
  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
  }, []);

  // Project → project-scoped assets (V2)
  useEffect(() => {
    setAssets([]);
    setForm((p) => ({ ...p, assetId: "" }));
    if (!form.cxProjectId) return;
    listV2Assets(form.cxProjectId, { limit: 100 })
      .then((d) => setAssets(toArray(d)))
      .catch(() => {});
  }, [form.cxProjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
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
                  form.cxProjectId
                    ? assets.length
                      ? "— Select Asset —"
                      : "No assets found"
                    : "— Select Project First —"
                }
                disabled={!form.cxProjectId || assets.length === 0}
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
                required
              />
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
              />
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
                options={(companies ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
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
                options={(companies ?? []).map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder="— Select Company —"
              />
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
                options={(users ?? []).map((u) => ({
                  value: u.id,
                  label:
                    `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                    u.email ||
                    u.id,
                }))}
                placeholder="— Select User —"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
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
      </form>
    </div>
  );
}
