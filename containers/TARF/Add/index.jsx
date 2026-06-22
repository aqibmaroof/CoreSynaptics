"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTARF, getTARFs } from "@/services/TARF";
import { listV2Projects } from "@/services/CxProjectsV2";
import { getCompanies } from "@/services/Companies";
import { PERSON_NAME_PATTERN } from "@/Utils/validation";

const ROLES_ON_SITE = [
  "General Contractor",
  "Electrical Contractor",
  "Mechanical Contractor",
  "Plumbing Contractor",
  "Safety Officer",
  "Project Manager",
  "Site Engineer",
  "Inspector",
  "Commissioning Technician",
  "Field Service Engineer",
  "Delivery / Logistics",
  "Visitor",
  "Other",
];

/* ── Shared light-theme styles ─────────────────────────────────────────────── */
const CARD = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border2)",
};
const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-lg text-sm outline-none placeholder-gray-500";
// Border drawn as an inset ring so it survives the global input overrides.
const fieldStyle = (err) => ({
  background: "var(--rf-bg2)",
  color: "var(--rf-txt)",
  boxShadow: `inset 0 0 0 1px ${err ? "var(--rf-red)" : "var(--rf-border3, #8daacf)"}`,
});

const FIELD = ({ label, required, children, hint }) => (
  <div>
    <label
      className="block text-xs font-bold uppercase tracking-wider mb-1.5"
      style={{ color: "var(--rf-txt2)" }}
    >
      {label} {required && <span style={{ color: "var(--rf-red)" }}>*</span>}
    </label>
    {children}
    {hint && (
      <p className="text-xs mt-1" style={{ color: "var(--rf-txt3)" }}>
        {hint}
      </p>
    )}
  </div>
);

const ErrText = ({ children }) =>
  children ? (
    <p className="text-xs mt-1" style={{ color: "var(--rf-red)" }}>
      {children}
    </p>
  ) : null;

export default function TARFAdd() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    cxProjectId: "",
    personName: "",
    companyId: "",
    companyName: "",
    roleOnSite: "",
    expectedStart: "",
    expectedEnd: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    listV2Projects({ limit: 100 })
      .then((res) => {
        const d = res?.data ?? res;
        setProjects(Array.isArray(d) ? d : (d?.data ?? d?.items ?? []));
      })
      .catch(() => {});
    getCompanies()
      .then((res) => setCompanies(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const set = (field) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));

    // Auto-fill companyName when company is selected
    if (field === "companyId") {
      const co = companies.find((c) => c.id === e.target.value);
      if (co)
        setForm((prev) => ({
          ...prev,
          companyId: e.target.value,
          companyName: co.name,
        }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.cxProjectId) e.cxProjectId = "Project is required";
    const person = form.personName.trim();
    if (!person) e.personName = "Person name is required";
    else if (!PERSON_NAME_PATTERN.test(person))
      e.personName =
        "Person name may only contain letters, spaces, hyphens, apostrophes and periods";
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.roleOnSite) e.roleOnSite = "Role on site is required";
    if (!form.expectedStart) e.expectedStart = "Start date is required";
    else {
      // Start date cannot be in the past (TARF-047).
      const today = new Date().toISOString().slice(0, 10);
      if (form.expectedStart < today)
        e.expectedStart = "Start date cannot be in the past";
    }
    if (!form.expectedEnd) e.expectedEnd = "End date is required";
    // Single-day access (start === end) is allowed; only reject end before start.
    if (
      form.expectedStart &&
      form.expectedEnd &&
      form.expectedEnd < form.expectedStart
    )
      e.expectedEnd = "End date must be on or after the start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Guard against double-click / re-entry while a submit is in flight (TARF-050).
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    // Duplicate-request guard (TARF-048): an identical pending request for the
    // same person + company + project + window is rejected client-side.
    try {
      const res = await getTARFs({ cxProjectId: form.cxProjectId });
      const existing = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
      const dup = existing.find(
        (t) =>
          (t.personName || "").trim().toLowerCase() ===
            form.personName.trim().toLowerCase() &&
          (t.companyName || "").trim().toLowerCase() ===
            form.companyName.trim().toLowerCase() &&
          (t.expectedStart || "").slice(0, 10) === form.expectedStart &&
          (t.expectedEnd || "").slice(0, 10) === form.expectedEnd,
      );
      if (dup) {
        setMessage({
          type: "error",
          text: "A matching access request already exists for this person and window.",
        });
        setLoading(false);
        return;
      }
    } catch {
      // Non-fatal — if the dup check can't run, fall through to create.
    }
    try {
      await createTARF({
        ...form,
        // Strip companyId if no real company selected (typed name only)
        companyId: form.companyId || undefined,
      });
      setMessage({
        type: "success",
        text: "TARF request submitted — awaiting approval",
      });
      setTimeout(() => router.push("/TARF/List"), 1500);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to submit TARF request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm mb-3 transition-colors"
              style={{ color: "var(--rf-txt2)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--rf-txt)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--rf-txt2)")}
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to TARF List
            </button>
            <h1 className="text-2xl font-bold" style={{ color: "var(--rf-txt)" }}>
              New TARF Request
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--rf-txt2)" }}>
              Submit a trade access request for site entry approval
            </p>
          </div>

          {message && (
            <div
              className="px-4 py-2.5 rounded-lg text-sm font-medium"
              style={
                message.type === "success"
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
              {message.text}
            </div>
          )}
        </div>

        {/* Lifecycle notice */}
        <div
          className="mb-6 rounded-xl p-4 flex gap-3"
          style={{
            background: "color-mix(in srgb, var(--rf-accent) 9%, transparent)",
            border: "1px solid color-mix(in srgb, var(--rf-accent) 26%, transparent)",
          }}
        >
          <svg
            className="w-5 h-5 shrink-0 mt-0.5"
            style={{ color: "var(--rf-accent)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm" style={{ color: "var(--rf-txt2)" }}>
            <strong style={{ color: "var(--rf-accent)" }}>
              Access Lifecycle:
            </strong>{" "}
            Submit → Approval required → Safety orientation → Sign In → Sign Out.
            Access is automatically blocked after the expected end date.
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Form card with accent header bar */}
          <div className="rounded-2xl overflow-hidden" style={CARD}>
            <div
              className="px-6 py-4 flex items-center gap-2.5"
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h2 className="text-lg font-semibold" style={{ color: "#fff" }}>
                Trade Access Request
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Project */}
              <FIELD label="Project" required>
                <select
                  value={form.cxProjectId}
                  onChange={set("cxProjectId")}
                  className={INPUT_CLS}
                  style={fieldStyle(errors.cxProjectId)}
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectName ?? p.name ?? p.code ?? p.id}
                    </option>
                  ))}
                </select>
                <ErrText>{errors.cxProjectId}</ErrText>
              </FIELD>

              {/* Two-col: Person + Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FIELD label="Person Name" required>
                  <input
                    type="text"
                    value={form.personName}
                    onChange={set("personName")}
                    placeholder="Full name of individual"
                    className={INPUT_CLS}
                    style={fieldStyle(errors.personName)}
                  />
                  <ErrText>{errors.personName}</ErrText>
                </FIELD>

                <FIELD
                  label="Company"
                  required
                  hint="Select from list or type a company name below"
                >
                  <select
                    value={form.companyId}
                    onChange={set("companyId")}
                    className={INPUT_CLS}
                    style={fieldStyle(false)}
                  >
                    <option value="">Select company...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FIELD>
              </div>

              {/* Company name (always editable for audit history) */}
              <FIELD
                label="Company Name (as it appears on badge)"
                required
                hint="Stored for audit trail — kept even if company record changes"
              >
                <input
                  type="text"
                  value={form.companyName}
                  onChange={set("companyName")}
                  placeholder="e.g. ABC Electrical Services Inc."
                  className={INPUT_CLS}
                  style={fieldStyle(errors.companyName)}
                />
                <ErrText>{errors.companyName}</ErrText>
              </FIELD>

              {/* Role on Site */}
              <FIELD label="Role on Site" required>
                <select
                  value={form.roleOnSite}
                  onChange={set("roleOnSite")}
                  className={INPUT_CLS}
                  style={fieldStyle(errors.roleOnSite)}
                >
                  <option value="">Select role...</option>
                  {ROLES_ON_SITE.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <ErrText>{errors.roleOnSite}</ErrText>
              </FIELD>

              {/* Access Window */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FIELD label="Expected Start Date" required>
                  <input
                    type="date"
                    value={form.expectedStart}
                    onChange={set("expectedStart")}
                    min={new Date().toISOString().slice(0, 10)}
                    className={INPUT_CLS}
                    style={fieldStyle(errors.expectedStart)}
                  />
                  <ErrText>{errors.expectedStart}</ErrText>
                </FIELD>

                <FIELD label="Expected End Date" required>
                  <input
                    type="date"
                    value={form.expectedEnd}
                    onChange={set("expectedEnd")}
                    min={form.expectedStart || undefined}
                    className={INPUT_CLS}
                    style={fieldStyle(errors.expectedEnd)}
                  />
                  <ErrText>{errors.expectedEnd}</ErrText>
                </FIELD>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
              className="px-8 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: "var(--rf-accent)",
                color: "#fff",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading && (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
              {loading ? "Submitting..." : "Submit TARF Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
