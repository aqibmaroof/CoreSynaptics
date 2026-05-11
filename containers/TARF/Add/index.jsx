"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTARF } from "@/services/TARF";
import { getProjects } from "@/services/Projects";
import { getCompanies } from "@/services/Companies";

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

const FIELD = ({ label, required, children, hint }) => (
  <div>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
  </div>
);

const INPUT_CLS =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";

export default function TARFAdd() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    projectId: "",
    personName: "",
    companyId: "",
    companyName: "",
    roleOnSite: "",
    expectedStart: "",
    expectedEnd: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res?.projects || []))
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
    if (!form.projectId) e.projectId = "Project is required";
    if (!form.personName.trim()) e.personName = "Person name is required";
    if (!form.companyName.trim()) e.companyName = "Company name is required";
    if (!form.roleOnSite) e.roleOnSite = "Role on site is required";
    if (!form.expectedStart) e.expectedStart = "Start date is required";
    if (!form.expectedEnd) e.expectedEnd = "End date is required";
    if (
      form.expectedStart &&
      form.expectedEnd &&
      form.expectedEnd < form.expectedStart
    )
      e.expectedEnd = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
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
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition-colors"
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
            <h1 className="text-4xl font-bold text-white mb-2">
              New TARF Request
            </h1>
            <p className="text-gray-400">
              Submit a trade access request for site entry approval
            </p>
          </div>

          {message && (
            <div
              className={`z-50 px-4 py-3 rounded-lg border shadow-lg text-sm flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-900/80 border-green-500/30 text-green-300"
                  : "bg-red-900/80 border-red-500/30 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

        {/* Lifecycle notice */}
        <div className="mb-6 bg-cyan-900/20 border border-cyan-500/20 rounded-xl p-4 flex gap-3">
          <svg
            className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5"
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
          <div className="text-sm text-cyan-300/80">
            <strong className="text-cyan-300">Access Lifecycle:</strong> Submit
            → Approval required → Safety orientation → Sign In → Sign Out.
            Access is automatically blocked after the expected end date.
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-6">
            {/* Project */}
            <FIELD label="Project" required>
              <select
                value={form.projectId}
                onChange={set("projectId")}
                className={`${INPUT_CLS} ${errors.projectId ? "border-red-500" : ""}`}
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && (
                <p className="text-red-400 text-xs mt-1">{errors.projectId}</p>
              )}
            </FIELD>

            {/* Two-col: Person + Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FIELD label="Person Name" required>
                <input
                  type="text"
                  value={form.personName}
                  onChange={set("personName")}
                  placeholder="Full name of individual"
                  className={`${INPUT_CLS} ${errors.personName ? "border-red-500" : ""}`}
                />
                {errors.personName && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.personName}
                  </p>
                )}
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
                className={`${INPUT_CLS} ${errors.companyName ? "border-red-500" : ""}`}
              />
              {errors.companyName && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.companyName}
                </p>
              )}
            </FIELD>

            {/* Role on Site */}
            <FIELD label="Role on Site" required>
              <select
                value={form.roleOnSite}
                onChange={set("roleOnSite")}
                className={`${INPUT_CLS} ${errors.roleOnSite ? "border-red-500" : ""}`}
              >
                <option value="">Select role...</option>
                {ROLES_ON_SITE.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.roleOnSite && (
                <p className="text-red-400 text-xs mt-1">{errors.roleOnSite}</p>
              )}
            </FIELD>

            {/* Access Window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FIELD label="Expected Start Date" required>
                <input
                  type="date"
                  value={form.expectedStart}
                  onChange={set("expectedStart")}
                  className={`${INPUT_CLS} ${errors.expectedStart ? "border-red-500" : ""}`}
                />
                {errors.expectedStart && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.expectedStart}
                  </p>
                )}
              </FIELD>

              <FIELD label="Expected End Date" required>
                <input
                  type="date"
                  value={form.expectedEnd}
                  onChange={set("expectedEnd")}
                  min={form.expectedStart || undefined}
                  className={`${INPUT_CLS} ${errors.expectedEnd ? "border-red-500" : ""}`}
                />
                {errors.expectedEnd && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.expectedEnd}
                  </p>
                )}
              </FIELD>
            </div>

            {/* Safety Orientation */}
            {/* <div
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${form.safetyOrientationComplete
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-yellow-900/10 border-yellow-600/20"
                }`}
            >
              <input
                id="safety"
                type="checkbox"
                checked={form.safetyOrientationComplete}
                onChange={set("safetyOrientationComplete")}
                className="mt-0.5 w-4 h-4 rounded accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="safety" className="cursor-pointer">
                <p
                  className={`text-sm font-medium ${form.safetyOrientationComplete ? "text-green-300" : "text-yellow-300"}`}
                >
                  Safety Orientation Complete
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Personnel cannot sign in until safety orientation is
                  confirmed. This can be updated after submission.
                </p>
              </label>
            </div> */}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-6 justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
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
