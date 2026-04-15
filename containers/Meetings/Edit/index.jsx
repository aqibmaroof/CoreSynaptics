"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getMeetingById,
  updateMeeting,
  publishMinutes,
  closeMeeting,
} from "@/services/Meetings";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { getUsers } from "@/services/Users";

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ?? data?.projects ?? data?.users ?? data?.sites ?? data?.zones ?? []);
}

function fmtDateTime(iso) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function AppSelect({ name, value, onChange, options, placeholder, disabled }) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export default function MeetingEdit() {
  const router = useRouter();
  const params = useParams();
  const meetingId = params.id;

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
  const [users,       setUsers]       = useState([]);

  const [currentStatus,     setCurrentStatus]     = useState("");
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  const [formData, setFormData] = useState({
    seriesName:   "",
    meetingDate:  "",
    location:     "",
    agenda:       "",
    projectId:    "",
    siteId:       "",
    subProjectId: "",
    zoneId:       "",
  });

  const initialLoadDone = useRef(false);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!meetingId) return;

    (async () => {
      try {
        setLoading(true);

        const [meeting, projectList, userList] = await Promise.all([
          getMeetingById(meetingId),
          getProjects().then(toArray).catch(() => []),
          getUsers().then(toArray).catch(() => []),
        ]);

        setProjects(projectList);
        setUsers(userList);

        const fd = {
          seriesName:   meeting.seriesName   ?? "",
          meetingDate:  fmtDateTime(meeting.meetingDate),
          location:     meeting.location     ?? "",
          agenda:       meeting.agenda       ?? "",
          projectId:    meeting.projectId    ?? "",
          siteId:       meeting.siteId       ?? "",
          subProjectId: meeting.subProjectId ?? "",
          zoneId:       meeting.zoneId       ?? "",
        };
        setFormData(fd);
        setCurrentStatus(meeting.status ?? "");
        setSelectedAttendees(
          Array.isArray(meeting.attendees)
            ? meeting.attendees.map((a) => (typeof a === "string" ? a : a.id ?? a.userId))
            : []
        );

        // Pre-load all cascade levels in parallel
        const cascadeLoads = [];
        if (fd.projectId)
          cascadeLoads.push(
            GetSites(fd.projectId).then(toArray).catch(() => []).then((d) => setSites(d))
          );
        if (fd.siteId)
          cascadeLoads.push(
            getProjects(25, 1, fd.siteId, fd.projectId).then(toArray).catch(() => []).then((d) => setSubProjects(d))
          );
        if (fd.subProjectId)
          cascadeLoads.push(
            GetZones(fd.subProjectId).then(toArray).catch(() => []).then((d) => setZones(d))
          );
        await Promise.all(cascadeLoads);

        initialLoadDone.current = true;
      } catch (err) {
        setError(err?.message || "Failed to load meeting");
      } finally {
        setLoading(false);
      }
    })();
  }, [meetingId]);

  // ── Cascade effects (only after initial load) ────────────────────────────────

  // Project → Sites
  useEffect(() => {
    if (!initialLoadDone.current) return;
    setSites([]);
    setSubProjects([]);
    setZones([]);
    setFormData((p) => ({ ...p, siteId: "", subProjectId: "", zoneId: "" }));
    if (!formData.projectId) return;
    GetSites(formData.projectId).then((d) => setSites(toArray(d))).catch(() => {});
  }, [formData.projectId]);

  // Site → SubProjects
  useEffect(() => {
    if (!initialLoadDone.current) return;
    setSubProjects([]);
    setZones([]);
    setFormData((p) => ({ ...p, subProjectId: "", zoneId: "" }));
    if (!formData.siteId) return;
    getProjects(25, 1, formData.siteId, formData.projectId)
      .then((d) => setSubProjects(toArray(d)))
      .catch(() => {});
  }, [formData.siteId]);

  // SubProject → Zones
  useEffect(() => {
    if (!initialLoadDone.current) return;
    setZones([]);
    setFormData((p) => ({ ...p, zoneId: "" }));
    if (!formData.subProjectId) return;
    GetZones(formData.subProjectId).then((d) => setZones(toArray(d))).catch(() => {});
  }, [formData.subProjectId]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAttendee = (userId) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.seriesName.trim()) { setError("Series Name is required"); return; }
    if (!formData.meetingDate)       { setError("Meeting Date is required"); return; }
    setError("");
    setSaving(true);
    try {
      await updateMeeting(meetingId, {
        seriesName:  formData.seriesName.trim(),
        meetingDate: new Date(formData.meetingDate).toISOString(),
        location:    formData.location || undefined,
        agenda:      formData.agenda   || undefined,
        attendees:   selectedAttendees.length ? selectedAttendees : undefined,
      });
      setMessage({ type: "success", text: "Meeting updated successfully" });
    } catch (err) {
      setError(err?.message || "Failed to update meeting");
    } finally {
      setSaving(false);
    }
  };

  const handleWorkflow = async (action) => {
    setWorkflowLoading(true);
    setError("");
    try {
      if (action === "publish") {
        await publishMinutes(meetingId);
        setCurrentStatus("MINUTES");
        setMessage({ type: "success", text: "Minutes published — meeting is now in MINUTES state" });
      } else if (action === "close") {
        await closeMeeting(meetingId);
        setCurrentStatus("CLOSED");
        setMessage({ type: "success", text: "Meeting closed successfully" });
      }
    } catch (err) {
      setError(err?.message || "Workflow action failed");
    } finally {
      setWorkflowLoading(false);
    }
  };

  // ── Status helpers ────────────────────────────────────────────────────────────
  const statusColor = {
    DRAFT:   "bg-yellow-900/30 text-yellow-300 border-yellow-700/30",
    MINUTES: "bg-blue-900/30 text-blue-300 border-blue-700/30",
    CLOSED:  "bg-green-900/30 text-green-300 border-green-700/30",
  };
  const isClosed = currentStatus === "CLOSED";

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-400">Loading meeting…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Edit Meeting</h1>
            <p className="text-gray-400">Update meeting details and manage workflow</p>
          </div>
          {currentStatus && (
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColor[currentStatus] ?? "bg-gray-700 text-gray-300 border-gray-600"}`}>
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
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Meeting Information
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Series Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="seriesName" value={formData.seriesName} onChange={handleChange}
                    disabled={isClosed}
                    placeholder="e.g. Weekly MEP Coordination"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Meeting Date <span className="text-red-400">*</span>
                  </label>
                  <input type="datetime-local" name="meetingDate" value={formData.meetingDate} onChange={handleChange}
                    disabled={isClosed}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange}
                  disabled={isClosed}
                  placeholder="Meeting room or virtual link"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 disabled:opacity-50" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Agenda</label>
                <textarea name="agenda" value={formData.agenda} onChange={handleChange}
                  disabled={isClosed}
                  rows={3} placeholder="Meeting agenda and topics…"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50" />
              </div>
            </div>

            {/* Project Hierarchy — read-only (hierarchy cannot change after creation) */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">Project Hierarchy</h3>
                <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded">read-only</span>
              </div>
              <p className="text-xs text-gray-500 -mt-2">Project, site, sub-project and zone are fixed at creation time.</p>

              {/* Project + Site */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Project</label>
                  <AppSelect
                    name="projectId"
                    value={formData.projectId}
                    onChange={() => {}}
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="— No Project —"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">Site</label>
                  <AppSelect
                    name="siteId"
                    value={formData.siteId}
                    onChange={() => {}}
                    options={sites.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder="— No Site —"
                    disabled
                  />
                </div>
              </div>

              {/* Sub-Project + Zone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Sub-Project <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <AppSelect
                    name="subProjectId"
                    value={formData.subProjectId}
                    onChange={() => {}}
                    options={subProjects.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder="— No Sub-Project —"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Zone <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <AppSelect
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={() => {}}
                    options={zones.map((z) => ({ value: z.id, label: z.name }))}
                    placeholder="— No Zone —"
                    disabled
                  />
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div className="space-y-3 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                Attendees
                {selectedAttendees.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-blue-400">{selectedAttendees.length} selected</span>
                )}
              </h3>
              {users.length === 0 ? (
                <p className="text-gray-500 text-sm">Loading users…</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                  {users.map((u) => {
                    const selected = selectedAttendees.includes(u.id);
                    return (
                      <button key={u.id} type="button" onClick={() => !isClosed && toggleAttendee(u.id)}
                        disabled={isClosed}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all disabled:opacity-50 ${
                          selected
                            ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                            : "bg-gray-700/40 border-gray-600 text-gray-300 hover:border-gray-500"
                        }`}>
                        <div className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${selected ? "bg-blue-500 border-blue-500" : "border-gray-500"}`}>
                          {selected && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="truncate">{u.name || u.email || u.id}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Workflow Actions */}
            {!isClosed && (
              <div className="pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-3">Workflow</h3>
                <div className="flex flex-wrap gap-3">
                  {currentStatus === "DRAFT" && (
                    <button type="button" onClick={() => handleWorkflow("publish")} disabled={workflowLoading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      {workflowLoading
                        ? <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      }
                      Publish Minutes
                    </button>
                  )}
                  {currentStatus === "MINUTES" && (
                    <button type="button" onClick={() => handleWorkflow("close")} disabled={workflowLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                      {workflowLoading
                        ? <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      }
                      Close Meeting
                    </button>
                  )}
                </div>
                {currentStatus === "MINUTES" && (
                  <p className="text-xs text-gray-500 mt-2">All action items must be RESOLVED or DEFERRED before closing.</p>
                )}
              </div>
            )}
            {isClosed && (
              <div className="pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-500">This meeting is closed and cannot be modified.</p>
              </div>
            )}

            {/* Actions */}
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
