"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createMeeting } from "@/services/Meetings";
import { getProjects } from "@/services/Projects";
import { GetSites } from "@/services/Sites";
import { GetZones } from "@/services/Zones";
import { getUsers } from "@/services/Users";

function toArray(data) {
  return Array.isArray(data)
    ? data
    : (data?.data ?? data?.projects ?? data?.users ?? data?.sites ?? data?.zones ?? []);
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

export default function MeetingAdd() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cascade lists
  const [projects,    setProjects]    = useState([]);
  const [sites,       setSites]       = useState([]);
  const [subProjects, setSubProjects] = useState([]);
  const [zones,       setZones]       = useState([]);
  const [users,       setUsers]       = useState([]);

  const [formData, setFormData] = useState({
    seriesName:   "",
    meetingDate:  "",
    projectId:    "",
    siteId:       "",
    subProjectId: "",
    zoneId:       "",
    location:     "",
    agenda:       "",
  });

  const [selectedAttendees, setSelectedAttendees] = useState([]);

  // Load projects + users on mount
  useEffect(() => {
    getProjects()
      .then((d) => setProjects(toArray(d)))
      .catch(() => {});
    getUsers()
      .then((d) => setUsers(toArray(d)))
      .catch(() => {});
  }, []);

  // Project → Sites
  useEffect(() => {
    setSites([]);
    setSubProjects([]);
    setZones([]);
    setFormData((p) => ({ ...p, siteId: "", subProjectId: "", zoneId: "" }));
    if (!formData.projectId) return;
    GetSites(formData.projectId)
      .then((d) => setSites(toArray(d)))
      .catch(() => {});
  }, [formData.projectId]);

  // Site → SubProjects
  useEffect(() => {
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
    setZones([]);
    setFormData((p) => ({ ...p, zoneId: "" }));
    if (!formData.subProjectId) return;
    GetZones(formData.subProjectId)
      .then((d) => setZones(toArray(d)))
      .catch(() => {});
  }, [formData.subProjectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAttendee = (userId) => {
    setSelectedAttendees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const validate = () => {
    if (!formData.seriesName.trim()) { setError("Meeting Series is required"); return false; }
    if (!formData.meetingDate)       { setError("Meeting Date is required");   return false; }
    if (!formData.projectId)         { setError("Project is required");        return false; }
    if (!formData.siteId)            { setError("Site is required");           return false; }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await createMeeting({
        seriesName:   formData.seriesName.trim(),
        meetingDate:  new Date(formData.meetingDate).toISOString(),
        projectId:    formData.projectId,
        siteId:       formData.siteId,
        subProjectId: formData.subProjectId || undefined,
        zoneId:       formData.zoneId       || undefined,
        location:     formData.location     || undefined,
        agenda:       formData.agenda       || undefined,
        attendees:    selectedAttendees.length ? selectedAttendees : undefined,
      });
      router.push("/Meeting/List");
    } catch (err) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Create Meeting</h1>
          <p className="text-gray-400">Schedule a new project meeting</p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Meeting Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-200">{error}</span>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Series Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" name="seriesName" value={formData.seriesName} onChange={handleChange}
                    placeholder="e.g. Weekly MEP Coordination"
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Meeting Date <span className="text-red-400">*</span>
                  </label>
                  <input type="datetime-local" name="meetingDate" value={formData.meetingDate} onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange}
                  placeholder="Meeting room or virtual link"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">Agenda</label>
                <textarea name="agenda" value={formData.agenda} onChange={handleChange}
                  rows={3} placeholder="Meeting agenda and topics…"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none" />
              </div>
            </div>

            {/* Project Hierarchy */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">Project Hierarchy</h3>

              {/* Project + Site */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Project <span className="text-red-400">*</span>
                  </label>
                  <AppSelect
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    options={projects.map((p) => ({ value: p.id, label: p.name }))}
                    placeholder="— Select Project —"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Site <span className="text-red-400">*</span>
                  </label>
                  <AppSelect
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleChange}
                    options={sites.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder={
                      formData.projectId
                        ? sites.length ? "— Select Site —" : "No sites found"
                        : "— Select Project First —"
                    }
                    disabled={!formData.projectId || sites.length === 0}
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
                    onChange={handleChange}
                    options={subProjects.map((s) => ({ value: s.id, label: s.name }))}
                    placeholder={
                      formData.siteId
                        ? subProjects.length ? "— Select Sub-Project —" : "No sub-projects found"
                        : "— Select Site First —"
                    }
                    disabled={!formData.siteId || subProjects.length === 0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Zone <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <AppSelect
                    name="zoneId"
                    value={formData.zoneId}
                    onChange={handleChange}
                    options={zones.map((z) => ({ value: z.id, label: z.name }))}
                    placeholder={
                      formData.subProjectId
                        ? zones.length ? "— Select Zone —" : "No zones found"
                        : "— Select Sub-Project First —"
                    }
                    disabled={!formData.subProjectId || zones.length === 0}
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
                      <button key={u.id} type="button" onClick={() => toggleAttendee(u.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-all ${
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

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-700">
              <button type="button" onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Meeting
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
