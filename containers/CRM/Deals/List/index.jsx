"use client";

import { useState, useEffect } from "react";
import { getDeals, createDeal, updateDeal, deleteDeal } from "@/services/Deals";
import { getContacts } from "@/services/Contacts";
import { getUsers } from "@/services/Users";
import { CreateTask } from "@/services/Tasks";
import { getCompanies } from "@/services/Companies";

export default function DealsList() {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [companies, setCompanies] = useState([]);

  // Task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskDealId, setTaskDealId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    priority: "Medium",
    dueDate: "",
  });

  const [form, setForm] = useState({
    name: "",
    companyId: "",
    contactId: "",
    value: "",
    expectedCloseDate: "",
  });

  useEffect(() => {
    fetchDeals();
    fetchContacts();
    fetchUsers();
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

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await getDeals();
      setDeals(Array.isArray(res) ? res : res?.data || []);
    } catch {
      setError("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await getContacts();
      setContacts(Array.isArray(res) ? res : res?.data || []);
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(Array.isArray(res) ? res : res?.data || []);
    } catch {}
  };

  const resetForm = () => {
    setForm({
      name: "",
      companyId: "",
      contactId: "",
      value: "",
      expectedCloseDate: "",
    });
    setEditingDeal(null);
  };

  const openCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (deal) => {
    setForm({
      name: deal.name || "",
      companyId: deal.companyId || "",
      contactId: deal.contactId || "",
      value: deal.value || "",
      expectedCloseDate: deal.expectedCloseDate?.split("T")[0] || "",
    });
    setEditingDeal(deal);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      setMessage({ type: "error", text: "Deal name is required" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, value: form.value ? Number(form.value) : 0 };
      if (editingDeal) {
        await updateDeal(editingDeal.id, payload);
        setMessage({ type: "success", text: "Deal updated successfully" });
      } else {
        await createDeal(payload);
        setMessage({ type: "success", text: "Deal created successfully" });
      }
      setShowModal(false);
      resetForm();
      await fetchDeals();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to save deal",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeal(id);
      setDeals(deals.filter((d) => d.id !== id));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Deal deleted" });
    } catch {
      setMessage({ type: "error", text: "Failed to delete deal" });
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.name) return;
    try {
      await CreateTask({ ...taskForm, dealId: taskDealId });
      setShowTaskModal(false);
      setTaskForm({
        name: "",
        description: "",
        priority: "Medium",
        dueDate: "",
      });
      setMessage({ type: "success", text: "Task created for deal" });
    } catch {
      setMessage({ type: "error", text: "Failed to create task" });
    }
  };

  const formatCurrency = (val) => {
    if (!val) return "$0";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = (deal.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ─── KANBAN VIEW ────────────────────────────────────────────────
  const renderKanban = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredDeals.map((deal) => {
        const contact = contacts.find((c) => c.id === deal.contactId);
        const company = companies.find((c) => c.id === deal.companyId);
        return (
          <div
            key={deal.id}
            className="bg-gray-800/80 rounded-lg p-4 border border-gray-700/50 hover:border-cyan-500/30 transition-all cursor-pointer"
            onClick={() => openEdit(deal)}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-white font-medium text-base">{deal.name}</h4>
            </div>
            <p className="text-cyan-400 font-bold text-xl mb-2">
              {formatCurrency(deal.value)}
            </p>
            {contact && (
              <p className="text-gray-400 text-sm mb-1">
                {contact.firstName} {contact.lastName}
              </p>
            )}
            {company && (
              <p className="text-purple-400 text-sm mb-1">{company.name}</p>
            )}
            {deal.expectedCloseDate && (
              <p className="text-gray-500 text-xs mt-2">
                Expected Close: {deal.expectedCloseDate.split("T")[0]}
              </p>
            )}
            <div className="flex items-center justify-end mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskDealId(deal.id);
                  setShowTaskModal(true);
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300"
              >
                + Task
              </button>
            </div>
          </div>
        );
      })}
      {filteredDeals.length === 0 && (
        <div className="col-span-full text-center text-gray-500 py-12">
          No deals found
        </div>
      )}
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
                "Deal Name",
                "Value",
                "Contact",
                "Company",
                "Expected Close",
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
            {filteredDeals.map((deal) => {
              const contact = contacts.find((c) => c.id === deal.contactId);
              const company = companies.find((c) => c.id === deal.companyId);
              return (
                <tr
                  key={deal.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4 text-white font-medium text-sm">
                    {deal.name}
                  </td>
                  <td className="px-6 py-4 text-cyan-400 font-bold text-sm">
                    {formatCurrency(deal.value)}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {contact ? `${contact.firstName} ${contact.lastName}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {company ? company.name : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {deal.expectedCloseDate?.split("T")[0] || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(deal)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setTaskDealId(deal.id);
                          setShowTaskModal(true);
                        }}
                        className="text-green-400 hover:text-green-300 text-xs"
                      >
                        + Task
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(deal.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredDeals.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 py-12">
                  No deals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Pipeline total
  const totalPipeline = deals.reduce(
    (sum, d) => sum + (Number(d.value) || 0),
    0
  );

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
      

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Deals</h1>
            <p className="text-gray-400">
              Total Pipeline Value:{" "}
              <span className="text-cyan-400 font-bold">
                {formatCurrency(totalPipeline)}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
              {/* Message Toast */}
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
              Add Deal
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search deals..."
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
              <h3 className="text-white font-bold mb-2">Delete Deal?</h3>
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

        {/* Create/Edit Deal Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-lg w-full">
              <h3 className="text-white font-bold text-lg mb-6">
                {editingDeal ? "Edit Deal" : "Create Deal"}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Deal Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="Deal name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Value ($)
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Contact
                  </label>
                  <select
                    value={form.contactId}
                    onChange={(e) =>
                      setForm({ ...form, contactId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="">Select contact</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Expected Close Date
                  </label>
                  <input
                    type="date"
                    value={form.expectedCloseDate}
                    onChange={(e) =>
                      setForm({ ...form, expectedCloseDate: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Assign to Company
                  </label>
                  <select
                    value={form.companyId}
                    onChange={(e) =>
                      setForm({ ...form, companyId: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="">— Select Company —</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {saving ? "Saving..." : editingDeal ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-white font-bold text-lg mb-4">
                Create Task for Deal
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    value={taskForm.name}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                    Description
                  </label>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, description: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 resize-none"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Priority
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, priority: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg text-sm font-medium"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}