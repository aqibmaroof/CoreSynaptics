"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTARF } from "@/services/TARF";

// Replace with real API calls when available
const fetchProjects = async () => [];
const fetchCompanies = async () => [];

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
    project_id: "",
    person_name: "",
    company_id: "",
    company_name: "",
    role_on_site: "",
    expected_start: "",
    expected_end: "",
    safety_orientation_complete: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProjects().then(setProjects);
    fetchCompanies().then(setCompanies);
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

    // Auto-fill company_name when company is selected
    if (field === "company_id") {
      const co = companies.find((c) => c.id === e.target.value);
      if (co)
        setForm((prev) => ({
          ...prev,
          company_id: e.target.value,
          company_name: co.name,
        }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.project_id) e.project_id = "Project is required";
    if (!form.person_name.trim()) e.person_name = "Person name is required";
    if (!form.company_name.trim()) e.company_name = "Company name is required";
    if (!form.role_on_site) e.role_on_site = "Role on site is required";
    if (!form.expected_start) e.expected_start = "Start date is required";
    if (!form.expected_end) e.expected_end = "End date is required";
    if (
      form.expected_start &&
      form.expected_end &&
      form.expected_end < form.expected_start
    )
      e.expected_end = "End date must be after start date";
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
        // Strip company_id if no real company selected (typed name only)
        company_id: form.company_id || undefined,
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
          {/* Toast */}

          {message && (
            <div
              className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm flex items-center gap-2 ${message.type === "success"
                  ? "bg-green-900/80 border-green-500/30 text-green-300"
                  : "bg-red-900/80 border-red-500/30 text-red-300"
                }`}
            >
              {message.text}
            </div>
          )}
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
                value={form.project_id}
                onChange={set("project_id")}
                className={`${INPUT_CLS} ${errors.project_id ? "border-red-500" : ""}`}
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.project_id && (
                <p className="text-red-400 text-xs mt-1">{errors.project_id}</p>
              )}
            </FIELD>

            {/* Two-col: Person + Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FIELD label="Person Name" required>
                <input
                  type="text"
                  value={form.person_name}
                  onChange={set("person_name")}
                  placeholder="Full name of individual"
                  className={`${INPUT_CLS} ${errors.person_name ? "border-red-500" : ""}`}
                />
                {errors.person_name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.person_name}
                  </p>
                )}
              </FIELD>

              <FIELD
                label="Company"
                required
                hint="Select from list or type a company name below"
              >
                <select
                  value={form.company_id}
                  onChange={set("company_id")}
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
                value={form.company_name}
                onChange={set("company_name")}
                placeholder="e.g. ABC Electrical Services Inc."
                className={`${INPUT_CLS} ${errors.company_name ? "border-red-500" : ""}`}
              />
              {errors.company_name && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.company_name}
                </p>
              )}
            </FIELD>

            {/* Role on Site */}
            <FIELD label="Role on Site" required>
              <select
                value={form.role_on_site}
                onChange={set("role_on_site")}
                className={`${INPUT_CLS} ${errors.role_on_site ? "border-red-500" : ""}`}
              >
                <option value="">Select role...</option>
                {ROLES_ON_SITE.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role_on_site && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.role_on_site}
                </p>
              )}
            </FIELD>

            {/* Access Window */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FIELD label="Expected Start Date" required>
                <input
                  type="date"
                  value={form.expected_start}
                  onChange={set("expected_start")}
                  className={`${INPUT_CLS} ${errors.expected_start ? "border-red-500" : ""}`}
                />
                {errors.expected_start && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.expected_start}
                  </p>
                )}
              </FIELD>

              <FIELD label="Expected End Date" required>
                <input
                  type="date"
                  value={form.expected_end}
                  onChange={set("expected_end")}
                  min={form.expected_start || undefined}
                  className={`${INPUT_CLS} ${errors.expected_end ? "border-red-500" : ""}`}
                />
                {errors.expected_end && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.expected_end}
                  </p>
                )}
              </FIELD>
            </div>

            {/* Safety Orientation */}
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${form.safety_orientation_complete
                  ? "bg-green-900/20 border-green-500/30"
                  : "bg-yellow-900/10 border-yellow-600/20"
                }`}
            >
              <input
                id="safety"
                type="checkbox"
                checked={form.safety_orientation_complete}
                onChange={set("safety_orientation_complete")}
                className="mt-0.5 w-4 h-4 rounded accent-cyan-500 cursor-pointer"
              />
              <label htmlFor="safety" className="cursor-pointer">
                <p
                  className={`text-sm font-medium ${form.safety_orientation_complete ? "text-green-300" : "text-yellow-300"}`}
                >
                  Safety Orientation Complete
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  Personnel cannot sign in until safety orientation is
                  confirmed. This can be updated after submission.
                </p>
              </label>
            </div>
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
