"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createIssue } from "@/services/Issues";
import { getProjects } from "@/services/Projects";
import { getCompanies } from "@/services/Companies";
import { getUsers } from "@/services/Users";
import { getAssets } from "../../../services/AssetManagement";
import CompanySelect from "@/components/CRM/CompanySelect";

const fetchAssets = async () => [];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const SEVERITY_STYLES = {
  LOW:      { ring: "border-gray-600",       bg: "bg-gray-800/40",     dot: "bg-gray-400",   label: "text-gray-300" },
  MEDIUM:   { ring: "border-yellow-600/50",  bg: "bg-yellow-900/10",   dot: "bg-yellow-400", label: "text-yellow-300" },
  HIGH:     { ring: "border-orange-600/50",  bg: "bg-orange-900/10",   dot: "bg-orange-400", label: "text-orange-300" },
  CRITICAL: { ring: "border-red-600/50",     bg: "bg-red-900/10",      dot: "bg-red-400",    label: "text-red-300" },
};

const INPUT_CLS =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

export default function IssuesAdd() {
  const router = useRouter();

  const [projects, setProjects]   = useState([]);
  const [assets, setAssets]       = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers]         = useState([]);

  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState(null);
  const [errors, setErrors]     = useState({});

  const [form, setForm] = useState({
    title:               "",
    description:         "",
    severity:            "MEDIUM",
    projectId:           "",
    assetId:             "",
    assignedToCompanyId: "",
    assignedToUserId:    "",
  });

  useEffect(() => {
    getProjects().then((res) => setProjects(res?.projects || [])).catch(() => {});
    getAssets().then((res) => setAssets(res?.data || [])).catch(() => {});
    getCompanies().then((res) => setCompanies(Array.isArray(res) ? res : res?.data || [])).catch(() => {});
    getUsers()
      .then((res) => setUsers(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const setSeverity = (sev) => setForm((prev) => ({ ...prev, severity: sev }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.projectId && !form.assetId)
      e.projectId = "At least one of Project or Asset must be selected";
    if (!form.severity) e.severity = "Severity is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await createIssue({
        title:               form.title,
        description:         form.description || undefined,
        severity:            form.severity,
        projectId:           form.projectId           || undefined,
        assetId:             form.assetId             || undefined,
        assignedToCompanyId: form.assignedToCompanyId || undefined,
        assignedToUserId:    form.assignedToUserId    || undefined,
      });
      setMessage({ type: "success", text: "Issue raised successfully" });
      setTimeout(() => router.push("/Issues/List"), 1400);
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Failed to create issue" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">

        <div className="flex items-center justify-between">
          <button onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Issues
          </button>
          {message && (
            <div className={`z-50 px-4 py-3 rounded-lg border shadow-lg text-sm flex items-center gap-2 ${message.type === "success"
              ? "bg-green-900/80 border-green-500/30 text-green-300"
              : "bg-red-900/80 border-red-500/30 text-red-300"
              }`}>
              {message.text}
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">Raise an Issue</h1>
        <p className="text-gray-400 mb-8">Log a new issue against a project or asset for tracking and resolution</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">

            {/* ── Core Details ── */}
            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
                Issue Details
              </h2>

              <div>
                <FieldLabel required>Title</FieldLabel>
                <input
                  type="text" value={form.title} onChange={set("title")}
                  placeholder="Brief, descriptive summary of the issue"
                  className={`${INPUT_CLS} ${errors.title ? "border-red-500" : ""}`}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={form.description} onChange={set("description")}
                  rows={4}
                  placeholder="Detailed description of the issue, steps to reproduce, observed vs expected behaviour..."
                  className={`${INPUT_CLS} resize-none`}
                />
              </div>

              <div>
                <FieldLabel required>Severity</FieldLabel>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                  {SEVERITIES.map((sev) => {
                    const s = SEVERITY_STYLES[sev];
                    const selected = form.severity === sev;
                    return (
                      <button
                        key={sev} type="button" onClick={() => setSeverity(sev)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${selected
                          ? `${s.bg} ${s.ring} ${s.label} ring-1 ring-inset`
                          : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                          }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${selected ? s.dot : "bg-gray-600"}`} />
                        {sev[0] + sev.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
                {errors.severity && <p className="text-red-400 text-xs mt-1">{errors.severity}</p>}
              </div>
            </section>

            {/* ── Link to Project / Asset ── */}
            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
              <div className="border-b border-gray-800 pb-3 flex items-start justify-between">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
                  Link to Project / Asset
                </h2>
                <span className="text-gray-500 text-xs">At least one required</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Project</FieldLabel>
                  <select value={form.projectId} onChange={set("projectId")}
                    className={`${INPUT_CLS} ${errors.projectId ? "border-red-500" : ""}`}>
                    <option value="">Select project...</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <FieldLabel>Asset</FieldLabel>
                  <select value={form.assetId} onChange={set("assetId")} className={INPUT_CLS}>
                    <option value="">Select asset...</option>
                    {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              {errors.projectId && (
                <p className="text-red-400 text-xs">{errors.projectId}</p>
              )}
            </section>

            {/* ── Assignment ── */}
            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
                Assignment <span className="text-gray-500 font-normal normal-case tracking-normal text-xs ml-1">(optional — can be set later)</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Assign to User</FieldLabel>
                  <select value={form.assignedToUserId} onChange={set("assignedToUserId")} className={INPUT_CLS}>
                    <option value="">No user assigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <CompanySelect
                    value={form.assignedToCompanyId}
                    onChange={(id) => setForm((prev) => ({ ...prev, assignedToCompanyId: id }))}
                    companies={companies}
                    onCreated={(company) => setCompanies((prev) => [...prev, company])}
                    label="Assign to Company"
                  />
                </div>
              </div>
            </section>

          </div>

          <div className="flex gap-4 mt-6 justify-end">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-2.5 border border-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2">
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? "Raising Issue..." : "Raise Issue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
