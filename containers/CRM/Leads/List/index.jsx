"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLeads, createLead, updateLead, deleteLead } from "@/services/Leads";
import { getUsers } from "@/services/Users";
import { getCompanies } from "@/services/Companies";
import { createContact } from "@/services/Contacts";
import CompanySelect from "@/components/CRM/CompanySelect";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";

const LEAD_SOURCES = [
  "Website",
  "Referral",
  "LinkedIn",
  "Cold Call",
  "Trade Show",
  "Email Campaign",
  "Other",
];

const LEAD_STATUSES = [
  { value: "IN_DISCUSSION", label: "In Discussion" },
  { value: "CONVERTED", label: "Converted" },
];

const STATUS_BADGE = {
  IN_DISCUSSION: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  CONVERTED: "bg-green-500/20 text-green-300 border border-green-500/30",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  companyId: "",
  source: "",
  status: "",
  notes: "",
};

export default function LeadsList() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [timelineEntity, setTimelineEntity] = useState(null); // { id, name }

  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchLeads();
    getCompanies()
      .then((res) => setCompanies(Array.isArray(res) ? res : res?.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await getLeads();
      setLeads(res?.data || []);
    } catch {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingLead(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (lead) => {
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      companyId: lead.companyId || "",
      source: lead.source || "",
      status: lead.status || "In Discussion",
      notes: lead.notes || "",
    });
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      setMessage({ type: "error", text: "Name is required" });
      return;
    }
    setSaving(true);
    try {
      const wasConverted =
        editingLead?.status !== "Converted" && form.status === "Converted";
      if (editingLead) {
        await updateLead(editingLead.id, form);
      } else {
        await createLead(form);
      }
      // Auto-create contact on conversion
      if (wasConverted) {
        try {
          const [firstName, ...rest] = form.name.trim().split(" ");
          await createContact({
            firstName,
            lastName: rest.join(" ") || "",
            email: form.email || undefined,
            phone: form.phone || undefined,
            companyId: form.companyId || undefined,
          });
        } catch {}
      }
      setMessage({
        type: "success",
        text: editingLead
          ? "Lead updated successfully"
          : "Lead created successfully",
      });
      setShowModal(false);
      resetForm();
      await fetchLeads();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to save lead",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLead(id);
      setLeads(leads.filter((l) => l.id !== id));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Lead deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete lead" });
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ─── KANBAN VIEW ────────────────────────────────────────────────
  const KANBAN_COLUMNS = LEAD_STATUSES;

  const renderKanban = () => (
    <div className="grid grid-cols-2 gap-4">
      {KANBAN_COLUMNS.map((status) => {
        const colLeads = filteredLeads.filter(
          (l) => (l.status || "In Discussion") === status,
        );
        return (
          <div
            key={status}
            className="bg-gray-900/60 rounded-xl border border-gray-800 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {status}
              </h3>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                {colLeads.length}
              </span>
            </div>
            <div className="space-y-3">
              {colLeads.map((lead) => {
                const company = companies.find((c) => c.id === lead.companyId);
                const isConverted = lead.status === "Converted";
                return (
                  <div
                    key={lead.id}
                    className="bg-gray-800/80 rounded-lg p-3 border border-gray-700/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => router.push(`/CRM/Leads/Detail/${lead.id}`)}
                        className="text-white font-medium text-sm hover:text-cyan-400 text-left"
                      >
                        {lead.name}
                      </button>
                      {isConverted && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-300 flex-shrink-0">
                          Converted
                        </span>
                      )}
                    </div>
                    {lead.email && (
                      <p className="text-gray-400 text-xs mt-1">{lead.email}</p>
                    )}
                    {company && (
                      <p className="text-cyan-400 text-xs mt-1">
                        {company.name}
                      </p>
                    )}
                    <div className="flex items-center justify-end mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTimelineEntity({ id: lead.id, name: lead.name });
                        }}
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Timeline
                      </button>
                    </div>
                  </div>
                );
              })}
              {colLeads.length === 0 && (
                <p className="text-center text-gray-600 text-xs py-4">
                  No leads
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── LIST VIEW ────────────────────────────────────────────────
  const renderList = () => (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {[
                "Name",
                "Email",
                "Phone",
                "Source",
                "Status",
                "Company",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => {
              const company = companies.find((c) => c.id === lead.companyId);
              const isConverted = lead.status === "Converted";
              return (
                <tr
                  key={lead.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/CRM/Leads/Detail/${lead.id}`)}
                      className="text-white font-medium text-sm hover:text-cyan-400 text-left"
                    >
                      {lead.name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {lead.email || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {lead.phone || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {lead.source || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 capitalize rounded-full ${STATUS_BADGE[lead.status || "IN_DISCUSSION"]}`}
                    >
                      {lead.status?.replace(/_/g, " ").toLowerCase() ||
                        "IN_DISCUSSION"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {company ? company.name : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(lead)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setTimelineEntity({ id: lead.id, name: lead.name })
                        }
                        className="text-purple-400 hover:text-purple-300 text-xs"
                      >
                        Timeline
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(lead.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 py-12">
                  No leads found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Leads</h1>
            <p className="text-gray-400">
              Manage your sales pipeline and leads
            </p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <div
                className={`z-50 px-4 py-3 rounded-lg border shadow-lg ${message.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"}`}
              >
                {message.text}
              </div>
            )}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "list" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === "kanban" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                Kanban
              </button>
            </div>
            <button
              onClick={openCreate}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Lead
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === "kanban" ? (
          renderKanban()
        ) : (
          renderList()
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white font-bold mb-2">Delete Lead?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Lead Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-white font-bold text-lg mb-6">
                {editingLead ? "Edit Lead" : "Create Lead"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Lead name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Source
                    </label>
                    <select
                      value={form.source}
                      onChange={(e) =>
                        setForm({ ...form, source: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="">Select source</option>
                      {LEAD_SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      {LEAD_STATUSES.map((s, i) => (
                        <option key={i} value={s.value}>
                          {s?.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <CompanySelect
                  value={form.companyId}
                  onChange={(id) => setForm({ ...form, companyId: id })}
                  companies={companies}
                  onCreated={(company) =>
                    setCompanies((prev) => [...prev, company])
                  }
                  label="Assign to Company"
                />
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Notes
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                {form.status === "Converted" && !editingLead && (
                  <p className="text-xs text-green-400 bg-green-900/20 border border-green-500/20 rounded-lg px-3 py-2">
                    A Contact will be automatically created from this lead on
                    save.
                  </p>
                )}
                {form.status === "Converted" &&
                  editingLead &&
                  editingLead.status !== "Converted" && (
                    <p className="text-xs text-green-400 bg-green-900/20 border border-green-500/20 rounded-lg px-3 py-2">
                      Setting to Converted will create a new Contact from this
                      lead.
                    </p>
                  )}
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingLead ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Modal */}
        {timelineEntity && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setTimelineEntity(null)}
          >
            <div
              className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 shrink-0">
                <h3 className="text-white font-bold">
                  Timeline — {timelineEntity.name}
                </h3>
                <button
                  onClick={() => setTimelineEntity(null)}
                  className="text-gray-400 hover:text-white text-lg leading-none"
                >
                  ✕
                </button>
              </div>
              <div className="p-5 overflow-y-auto">
                <ActivityTimeline
                  entityType="lead"
                  entityId={timelineEntity.id}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
