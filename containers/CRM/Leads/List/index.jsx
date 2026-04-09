"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLeads, createLead, updateLead, deleteLead } from "@/services/Leads";
import { getUsers } from "@/services/Users";
import { getAllTasks, CreateTask } from "@/services/Tasks";

const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Won", "Lost"];
const LEAD_SOURCES = ["Website", "Referral", "LinkedIn", "Cold Call", "Trade Show", "Email Campaign", "Other"];

const STATUS_COLORS = {
  New: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Qualified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Won: "bg-green-500/20 text-green-400 border-green-500/30",
  Lost: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function LeadsList() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskLeadId, setTaskLeadId] = useState(null);
  const [taskForm, setTaskForm] = useState({ name: "", description: "", priority: "Medium", dueDate: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
    status: "New",
    source: "",
    notes: "",
    ownerId: "",
  });

  useEffect(() => {
    fetchLeads();
    fetchUsers();
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
      setLeads(Array.isArray(res) ? res : res?.data || []);
    } catch (err) {
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : res?.data || []);
    } catch {}
  };

  const resetForm = () => {
    setForm({ name: "", email: "", phone: "", companyId: "", status: "New", source: "", notes: "", ownerId: "" });
    setEditingLead(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };
  const openEdit = (lead) => {
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      companyId: lead.companyId || "",
      status: lead.status || "New",
      source: lead.source || "",
      notes: lead.notes || "",
      ownerId: lead.ownerId || "",
    });
    setEditingLead(lead);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { setMessage({ type: "error", text: "Name is required" }); return; }
    setSaving(true);
    try {
      if (editingLead) {
        await updateLead(editingLead.id, form);
        setMessage({ type: "success", text: "Lead updated successfully" });
      } else {
        await createLead(form);
        setMessage({ type: "success", text: "Lead created successfully" });
      }
      setShowModal(false);
      resetForm();
      await fetchLeads();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Failed to save lead" });
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
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete lead" });
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.name) return;
    try {
      await CreateTask({ ...taskForm, leadId: taskLeadId });
      setShowTaskModal(false);
      setTaskForm({ name: "", description: "", priority: "Medium", dueDate: "" });
      setMessage({ type: "success", text: "Task created for lead" });
    } catch {
      setMessage({ type: "error", text: "Failed to create task" });
    }
  };

  const handleStatusChange = async (lead, newStatus) => {
    try {
      await updateLead(lead.id, { ...lead, status: newStatus });
      await fetchLeads();
    } catch {}
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = (lead.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ─── KANBAN VIEW ──────────────────────────────────────────────
  const renderKanban = () => (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {LEAD_STATUSES.map((status) => {
        const items = filteredLeads.filter((l) => l.status === status);
        return (
          <div key={status} className="min-w-[280px] flex-shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">{status}</h3>
              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
            <div className="space-y-3 min-h-[200px] bg-gray-900/30 rounded-xl p-3 border border-gray-800/50">
              {items.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-gray-800/80 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-all cursor-pointer"
                  onClick={() => openEdit(lead)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm truncate">{lead.name}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                  </div>
                  {lead.email && <p className="text-gray-400 text-xs truncate">{lead.email}</p>}
                  {lead.source && <p className="text-gray-500 text-[10px] mt-1">Source: {lead.source}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-1">
                      {LEAD_STATUSES.filter((s) => s !== lead.status).slice(0, 2).map((s) => (
                        <button
                          key={s}
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(lead, s); }}
                          className="text-[10px] px-2 py-0.5 rounded bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setTaskLeadId(lead.id); setShowTaskModal(true); }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300"
                    >
                      + Task
                    </button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <p className="text-gray-600 text-xs text-center py-8">No leads</p>}
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
              {["Name", "Email", "Phone", "Status", "Source", "Owner", "Actions"].map((h) => (
                <th key={h} className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => {
              const owner = users.find((u) => u.id === lead.ownerId);
              return (
                <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium text-sm">{lead.name}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{lead.email || "—"}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{lead.phone || "—"}</td>
                  <td className="px-6 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border bg-transparent cursor-pointer ${STATUS_COLORS[lead.status]}`}
                    >
                      {LEAD_STATUSES.map((s) => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{lead.source || "—"}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{owner ? `${owner.firstName} ${owner.lastName}` : "—"}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(lead)} className="text-cyan-400 hover:text-cyan-300 text-xs">Edit</button>
                      <button onClick={() => { setTaskLeadId(lead.id); setShowTaskModal(true); }} className="text-green-400 hover:text-green-300 text-xs">+ Task</button>
                      <button onClick={() => setDeleteConfirm(lead.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredLeads.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-500 py-12">No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Message Toast */}
        {message && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-lg ${message.type === "success" ? "bg-green-900/80 border-green-500/30 text-green-300" : "bg-red-900/80 border-red-500/30 text-red-300"}`}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Leads</h1>
            <p className="text-gray-400">Manage your sales pipeline and leads</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : viewMode === "kanban" ? renderKanban() : renderList()}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
              <h3 className="text-white font-bold mb-2">Delete Lead?</h3>
              <p className="text-gray-400 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Lead Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-white font-bold text-lg mb-6">{editingLead ? "Edit Lead" : "Create Lead"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" placeholder="Lead name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Phone</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                      {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Source</label>
                    <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                      <option value="">Select source</option>
                      {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Owner</label>
                  <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                    <option value="">Assign owner</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" rows={3} placeholder="Additional notes..." />
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => { setShowModal(false); resetForm(); }} className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                  {saving ? "Saving..." : editingLead ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-white font-bold text-lg mb-4">Create Task for Lead</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Task Name *</label>
                  <input type="text" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Description</label>
                  <textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none" rows={2} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Priority</label>
                    <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Due Date</label>
                    <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setShowTaskModal(false)} className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm">Cancel</button>
                <button onClick={handleCreateTask} className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium">Create Task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
