"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getRFIById, updateRFI, answerRFI, closeRFI } from "@/services/RFI";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { GetEquipments } from "@/services/Equipment";
import { getCompanies } from "@/services/Companies";
import CompanySelect from "@/components/CRM/CompanySelect";

const PRIORITIES = [
  { value: "LOW",      label: "Low" },
  { value: "MEDIUM",   label: "Medium" },
  { value: "HIGH",     label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

const STATUS_COLORS = {
  OPEN:     "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
  ANSWERED: "bg-blue-900/30 text-blue-300 border-blue-700/30",
  CLOSED:   "bg-green-900/30 text-green-300 border-green-700/30",
};

const PRIORITY_COLORS = {
  LOW:      "text-blue-400",
  MEDIUM:   "text-gray-300",
  HIGH:     "text-orange-400",
  CRITICAL: "text-red-400",
};

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ?? data?.projects ?? data?.sites ?? data?.zones ?? data?.equipment ?? data?.companies ?? []);
}

function AppSelect({ name, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select
        name={name} value={value} onChange={onChange} disabled={disabled}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export default function RFIEdit() {
  const router = useRouter();
  const params = useParams();
  const rfiId = params.id;

  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [error,           setError]           = useState("");
  const [message,         setMessage]         = useState(null);

  // Cascade lists
  const [projects,    setProjects]    = useState([]);
  const [sites,       setSites]       = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones,       setZones]       = useState([]);
  const [assets,      setAssets]      = useState([]);
  const [companies,   setCompanies]   = useState([]);

  const [currentStatus,   setCurrentStatus]   = useState("");
  const [officialAnswer,  setOfficialAnswer]  = useState("");
  const [answeredAt,      setAnsweredAt]      = useState(null);

  const [formData, setFormData] = useState({
    subject:             "",
    question:            "",
    priority:            "MEDIUM",
    siteId:              "",
    subProjectId:        "",
    zoneId:              "",
    assetId:             "",
    assignedToCompanyId: "",
    dueDate:             "",
    // read-only display
    rfiNumber:  "",
    projectId:  "",
  });

  const initialLoadDone = useRef(false);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!rfiId) return;

    (async () => {
      try {
        setLoading(true);

        const [rfi, projectList, companyList] = await Promise.all([
          getRFIById(rfiId),
          getProjects().then(toArray).catch(() => []),
          getCompanies().then(toArray).catch(() => []),
        ]);

        setProjects(projectList);
        setCompanies(companyList);
        setCurrentStatus(rfi.status ?? "");
        setOfficialAnswer(rfi.officialAnswer ?? "");
        setAnsweredAt(rfi.answeredAt ?? null);

        const fd = {
          rfiNumber:           rfi.rfiNumber           ?? "",
          projectId:           rfi.projectId           ?? "",
          subject:             rfi.subject             ?? "",
          question:            rfi.question            ?? "",
          priority:            rfi.priority            ?? "MEDIUM",
          siteId:              rfi.siteId              ?? "",
          subProjectId:        rfi.subProjectId        ?? "",
          zoneId:              rfi.zoneId              ?? "",
          assetId:             rfi.assetId             ?? "",
          assignedToCompanyId: rfi.assignedToCompanyId ?? "",
          dueDate:             rfi.dueDate ? rfi.dueDate.slice(0, 10) : "",
        };
        setFormData(fd);

        // Pre-load all cascade levels in parallel
        const loads = [];
        if (fd.projectId)
          loads.push(GetSites(fd.projectId).then(toArray).catch(() => []).then(setSites));
        if (fd.siteId)
          loads.push(getProjects(25, 1, fd.siteId, fd.projectId).then(toArray).catch(() => []).then(setSubProjects));
        if (fd.subProjectId)
          loads.push(GetZones(fd.subProjectId).then(toArray).catch(() => []).then(setZones));
        if (fd.zoneId)
          loads.push(GetEquipments(fd.zoneId).then(toArray).catch(() => []).then(setAssets));
        await Promise.all(loads);

        initialLoadDone.current = true;
      } catch (err) {
        setError(err?.message || "Failed to load RFI");
      } finally {
        setLoading(false);
      }
    })();
  }, [rfiId]);

  // ── Cascade effects (after initial load only) ─────────────────────────────────
  useEffect(() => {
    if (!initialLoadDone.current) return;
    setSites([]); setSubProjects([]); setZones([]); setAssets([]);
    setFormData((p) => ({ ...p, siteId: "", subProjectId: "", zoneId: "", assetId: "" }));
    if (!formData.projectId) return;
    GetSites(formData.projectId).then((d) => setSites(toArray(d))).catch(() => {});
  }, [formData.projectId]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    setSubProjects([]); setZones([]); setAssets([]);
    setFormData((p) => ({ ...p, subProjectId: "", zoneId: "", assetId: "" }));
    if (!formData.siteId) return;
    getProjects(25, 1, formData.siteId, formData.projectId).then((d) => setSubProjects(toArray(d))).catch(() => {});
  }, [formData.siteId]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    setZones([]); setAssets([]);
    setFormData((p) => ({ ...p, zoneId: "", assetId: "" }));
    if (!formData.subProjectId) return;
    GetZones(formData.subProjectId).then((d) => setZones(toArray(d))).catch(() => {});
  }, [formData.subProjectId]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    setAssets([]);
    setFormData((p) => ({ ...p, assetId: "" }));
    if (!formData.zoneId) return;
    GetEquipments(formData.zoneId).then((d) => setAssets(toArray(d))).catch(() => {});
  }, [formData.zoneId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim()) { setError("Subject is required");  return; }
    if (!formData.question.trim()){ setError("Question is required"); return; }
    setError("");
    setSaving(true);
    try {
      await updateRFI(rfiId, {
        subject:             formData.subject.trim(),
        question:            formData.question.trim(),
        priority:            formData.priority,
        siteId:              formData.siteId              || undefined,
        subProjectId:        formData.subProjectId        || undefined,
        zoneId:              formData.zoneId              || undefined,
        assetId:             formData.assetId             || undefined,
        assignedToCompanyId: formData.assignedToCompanyId || undefined,
        dueDate:             formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });
      setMessage({ type: "success", text: "RFI updated successfully" });
    } catch (err) {
      setError(err?.message || "Failed to update RFI");
    } finally {
      setSaving(false);
    }
  };

  const handleAnswer = async () => {
    if (!officialAnswer.trim()) { setError("Official answer is required"); return; }
    setError("");
    setWorkflowLoading(true);
    try {
      const updated = await answerRFI(rfiId, officialAnswer.trim());
      setCurrentStatus("ANSWERED");
      setAnsweredAt(updated.answeredAt ?? new Date().toISOString());
      setMessage({ type: "success", text: "RFI answered — status is now ANSWERED" });
    } catch (err) {
      setError(err?.message || "Failed to answer RFI");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleClose = async () => {
    setWorkflowLoading(true);
    setError("");
    try {
      await closeRFI(rfiId);
      setCurrentStatus("CLOSED");
      setMessage({ type: "success", text: "RFI closed successfully" });
    } catch (err) {
      setError(err?.message || "Failed to close RFI");
    } finally {
      setWorkflowLoading(false);
    }
  };

  const isClosed = currentStatus === "CLOSED";
  const inputCls = `w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50`;

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading RFI…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit RFI</h1>
            <p className="text-gray-400">{formData.rfiNumber}</p>
          </div>
          {currentStatus && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${STATUS_COLORS[currentStatus] ?? "bg-gray-700 text-gray-300 border-gray-600"}`}>
              {currentStatus}
            </span>
          )}
        </div>

        {/* Feedback */}
        {error && (
          <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        )}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm border ${
            message.type === "success"
              ? "bg-green-900/20 border-green-500/30 text-green-300"
              : "bg-red-900/20 border-red-500/30 text-red-300"
          }`}>{message.text}</div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              RFI Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* ── Basic Information ── */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">RFI Number</label>
                  <input type="text" value={formData.rfiNumber} disabled className={`${inputCls} opacity-60`} />
                  <p className="text-xs text-gray-500 mt-1">RFI number cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Priority</label>
                  <AppSelect
                    name="priority" value={formData.priority} onChange={handleChange}
                    options={PRIORITIES}
                    disabled={isClosed}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange}
                  disabled={isClosed} placeholder="Brief description of the clarification needed"
                  className={inputCls} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Question <span className="text-red-400">*</span>
                </label>
                <textarea name="question" value={formData.question} onChange={handleChange}
                  disabled={isClosed} rows={4} placeholder="Detailed question requiring clarification…"
                  className={`${inputCls} resize-none`} />
              </div>
            </div>

            {/* ── Project Hierarchy ── */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Project Hierarchy</h3>

              {/* Project — read-only */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Project</label>
                <AppSelect
                  name="projectId" value={formData.projectId} onChange={() => {}}
                  options={projects.map((p) => ({ value: p.id, label: p.name }))}
                  placeholder="— No Project —"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Project cannot be changed after creation</p>
              </div>

              {/* Site + Sub-Project */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Site <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <AppSelect
                    name="siteId" value={formData.siteId} onChange={handleChange}
                    options={sites.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder={
                      formData.projectId
                        ? sites.length ? "— Select Site —" : "No sites found"
                        : "— No Project —"
                    }
                    disabled={isClosed || !formData.projectId || sites.length === 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Sub-Project <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <AppSelect
                    name="subProjectId" value={formData.subProjectId} onChange={handleChange}
                    options={subProjects.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder={
                      formData.siteId
                        ? subProjects.length ? "— Select Sub-Project —" : "No sub-projects found"
                        : "— Select Site First —"
                    }
                    disabled={isClosed || !formData.siteId || subProjects.length === 0}
                  />
                </div>
              </div>

              {/* Zone + Asset */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Zone <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <AppSelect
                    name="zoneId" value={formData.zoneId} onChange={handleChange}
                    options={zones.map((z) => ({ value: z.id, label: z.name }))}
                    placeholder={
                      formData.subProjectId
                        ? zones.length ? "— Select Zone —" : "No zones found"
                        : "— Select Sub-Project First —"
                    }
                    disabled={isClosed || !formData.subProjectId || zones.length === 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Asset <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <AppSelect
                    name="assetId" value={formData.assetId} onChange={handleChange}
                    options={assets.map((a) => ({ value: a.id, label: a.name }))}
                    placeholder={
                      formData.zoneId
                        ? assets.length ? "— Select Asset —" : "No assets found"
                        : "— Select Zone First —"
                    }
                    disabled={isClosed || !formData.zoneId || assets.length === 0}
                  />
                </div>
              </div>
            </div>

            {/* ── Assignment ── */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {isClosed ? (
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">Assign to Company</label>
                      <select disabled value={formData.assignedToCompanyId}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white opacity-50 cursor-not-allowed">
                        <option value="">— No Company —</option>
                        {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <CompanySelect
                      value={formData.assignedToCompanyId}
                      onChange={(id) => setFormData((prev) => ({ ...prev, assignedToCompanyId: id }))}
                      companies={companies}
                      onCreated={(company) => setCompanies((prev) => [...prev, company])}
                      label="Assign to Company"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Due Date</label>
                  <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange}
                    disabled={isClosed} className={inputCls} />
                </div>
              </div>
            </div>

            {/* ── Workflow ── */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Workflow</h3>

              {/* Official Answer — show for OPEN (to fill) and ANSWERED/CLOSED (read-only) */}
              {(currentStatus === "OPEN" || currentStatus === "ANSWERED" || currentStatus === "CLOSED") && (
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Official Answer
                    {currentStatus === "OPEN" && <span className="text-red-400 ml-1">*</span>}
                    {answeredAt && (
                      <span className="ml-2 text-xs font-normal text-gray-400">
                        Answered {new Date(answeredAt).toLocaleDateString()}
                      </span>
                    )}
                  </label>
                  <textarea
                    value={officialAnswer}
                    onChange={(e) => setOfficialAnswer(e.target.value)}
                    disabled={currentStatus !== "OPEN"}
                    rows={4}
                    placeholder={currentStatus === "OPEN" ? "Provide the official response…" : "No answer yet"}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {currentStatus === "OPEN" && (
                  <button type="button" onClick={handleAnswer} disabled={workflowLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    {workflowLoading
                      ? <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    }
                    Submit Answer
                  </button>
                )}
                {currentStatus === "ANSWERED" && (
                  <button type="button" onClick={handleClose} disabled={workflowLoading}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    {workflowLoading
                      ? <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    }
                    Close RFI
                  </button>
                )}
                {isClosed && (
                  <p className="text-sm text-gray-500">This RFI is closed and cannot be modified.</p>
                )}
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button type="button" onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving || isClosed}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
