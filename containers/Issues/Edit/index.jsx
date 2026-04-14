"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getIssueById, updateIssue } from "@/services/Issues";
import { getProjects } from "@/services/Projects";
import { getCompanies } from "@/services/Companies";
import { getUsers } from "@/services/Users";

const fetchAssets = async () => [];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const SEVERITY_STYLES = {
  LOW: {
    ring: "border-gray-600",
    bg: "bg-gray-800/40",
    dot: "bg-gray-400",
    label: "text-gray-300",
  },
  MEDIUM: {
    ring: "border-yellow-600/50",
    bg: "bg-yellow-900/10",
    dot: "bg-yellow-400",
    label: "text-yellow-300",
  },
  HIGH: {
    ring: "border-orange-600/50",
    bg: "bg-orange-900/10",
    dot: "bg-orange-400",
    label: "text-orange-300",
  },
  CRITICAL: {
    ring: "border-red-600/50",
    bg: "bg-red-900/10",
    dot: "bg-red-400",
    label: "text-red-300",
  },
};

const STATUS_BADGE = {
  NEW: "bg-blue-900/30 text-blue-300 border-blue-500/30",
  IN_PROGRESS: "bg-yellow-900/30 text-yellow-300 border-yellow-500/30",
  READY_FOR_VERIFICATION:
    "bg-purple-900/30 text-purple-300 border-purple-500/30",
  DEFERRED: "bg-gray-800/60 text-gray-400 border-gray-600/30",
  CLOSED: "bg-green-900/30 text-green-300 border-green-500/30",
};

const STATUS_LABEL = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  READY_FOR_VERIFICATION: "Ready for Verification",
  DEFERRED: "Deferred",
  CLOSED: "Closed",
};

const INPUT_CLS =
  "w-full px-4 py-2.5 bg-gray-800/60 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors";

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
    {children} {required && <span className="text-red-400">*</span>}
  </label>
);

export default function IssuesEdit() {
  const router = useRouter();
  const params = useParams();
  const editId = params?.id;

  const [projects, setProjects] = useState([]);
  const [assets, setAssets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [message, setMessage] = useState(null);
  const [errors, setErrors] = useState({});
  const [issueStatus, setIssueStatus] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "MEDIUM",
    projectId: "",
    assetId: "",
    assignedToCompanyId: "",
    assignedToUserId: "",
  });

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res?.projects || []))
      .catch(() => {});
    fetchAssets().then(setAssets);
    getCompanies()
      .then((res) => setCompanies(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
    getUsers()
      .then((res) => setUsers(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editId) return;
    setFetching(true);
    getIssueById(editId)
      .then((res) => {
        const d = res?.data ?? res;
        setIssueStatus(d.status);
        setForm({
          title: d.title ?? "",
          description: d.description ?? "",
          severity: d.severity ?? "MEDIUM",
          projectId: d.projectId ?? "",
          assetId: d.assetId ?? "",
          assignedToCompanyId: d.assignedToCompanyId ?? "",
          assignedToUserId: d.assignedToUserId ?? "",
        });
      })
      .catch(() =>
        setFetchError("Failed to load issue. It may have been deleted."),
      )
      .finally(() => setFetching(false));
  }, [editId]);

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
      await updateIssue(editId, {
        title: form.title,
        description: form.description || undefined,
        severity: form.severity,
      });
      setMessage({ type: "success", text: "Issue updated successfully" });
      setTimeout(() => router.push("/Issues/List"), 1400);
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to update issue",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          Loading issue...
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{fetchError}</p>
          <button
            onClick={() => router.back()}
            className="text-cyan-400 hover:text-cyan-300 text-sm underline"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isClosed = issueStatus === "CLOSED";

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between">
          {message && (
            <div
              className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-900/80 border-green-500/30 text-green-300"
                  : "bg-red-900/80 border-red-500/30 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
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
            Back to Issues
          </button>
        </div>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit Issue</h1>
            <p className="text-gray-400 font-mono text-sm">{editId}</p>
          </div>
          {issueStatus && (
            <span
              className={`px-3 py-1 rounded-full border text-xs font-semibold ${STATUS_BADGE[issueStatus] || "bg-gray-800 text-gray-400 border-gray-600"}`}
            >
              {STATUS_LABEL[issueStatus] || issueStatus}
            </span>
          )}
        </div>

        {isClosed && (
          <div className="mb-6 bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 flex gap-3">
            <svg
              className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <div className="text-sm text-yellow-300/80">
              <strong className="text-yellow-300">This issue is closed.</strong>{" "}
              Edits are not allowed on closed issues.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
                Issue Details
              </h2>

              <div>
                <FieldLabel required>Title</FieldLabel>
                <input
                  type="text"
                  value={form.title}
                  onChange={set("title")}
                  disabled={isClosed}
                  placeholder="Brief, descriptive summary of the issue"
                  className={`${INPUT_CLS} ${errors.title ? "border-red-500" : ""} disabled:opacity-50`}
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <FieldLabel>Description</FieldLabel>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  disabled={isClosed}
                  rows={4}
                  placeholder="Detailed description of the issue..."
                  className={`${INPUT_CLS} resize-none disabled:opacity-50`}
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
                        key={sev}
                        type="button"
                        onClick={() => !isClosed && setSeverity(sev)}
                        disabled={isClosed}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          selected
                            ? `${s.bg} ${s.ring} ${s.label} ring-1 ring-inset`
                            : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${selected ? s.dot : "bg-gray-600"}`}
                        />
                        {sev[0] + sev.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
                {errors.severity && (
                  <p className="text-red-400 text-xs mt-1">{errors.severity}</p>
                )}
              </div>
            </section>

            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
              <div className="border-b border-gray-800 pb-3 flex items-start justify-between">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">
                  Link to Project / Asset
                </h2>
                <span className="text-gray-500 text-xs">
                  At least one required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Project</FieldLabel>
                  <select
                    value={form.projectId}
                    onChange={set("projectId")}
                    disabled={isClosed}
                    className={`${INPUT_CLS} ${errors.projectId ? "border-red-500" : ""} disabled:opacity-50`}
                  >
                    <option value="">Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    {projects.length === 0 && form.projectId && (
                      <option value={form.projectId}>{form.projectId}</option>
                    )}
                  </select>
                </div>

                <div>
                  <FieldLabel>Asset</FieldLabel>
                  <select
                    value={form.assetId}
                    onChange={set("assetId")}
                    disabled={isClosed}
                    className={`${INPUT_CLS} disabled:opacity-50`}
                  >
                    <option value="">Select asset...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                    {assets.length === 0 && form.assetId && (
                      <option value={form.assetId}>{form.assetId}</option>
                    )}
                  </select>
                </div>
              </div>
              {errors.projectId && (
                <p className="text-red-400 text-xs">{errors.projectId}</p>
              )}
            </section>

            <section className="bg-gray-900/50 rounded-xl border border-gray-800/50 p-6 space-y-5">
              <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest border-b border-gray-800 pb-3">
                Assignment{" "}
                <span className="text-gray-500 font-normal normal-case tracking-normal text-xs ml-1">
                  (read-only — use Assign on the list page)
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Assigned User</FieldLabel>
                  <select
                    value={form.assignedToUserId}
                    disabled
                    className={`${INPUT_CLS} opacity-50 cursor-not-allowed`}
                  >
                    <option value="">No user assigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <FieldLabel>Assigned Company</FieldLabel>
                  <select
                    value={form.assignedToCompanyId}
                    disabled
                    className={`${INPUT_CLS} opacity-50 cursor-not-allowed`}
                  >
                    <option value="">No company assigned</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          </div>

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
              disabled={loading || isClosed}
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
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
