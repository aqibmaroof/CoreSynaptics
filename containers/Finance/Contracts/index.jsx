"use client";
import { useState, useEffect } from "react";
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
  getContractBudgetSummary,
  getContractBudgetAllocations,
  createBudgetAllocation,
  deleteBudgetAllocation,
} from "@/services/Finance/Contracts";
import { formatCurrency } from "@/Utils/payrollCalculations";

const CONTRACT_STATUSES = ["Draft", "Active", "Completed", "Terminated"];
const STATUS_BADGE = {
  Draft: "badge-ghost",
  Active: "badge-success",
  Completed: "badge-info",
  Terminated: "badge-error",
};

const EMPTY_FORM = {
  project_id: "",
  title: "",
  contract_value: "",
  total_budget: "",
  start_date: "",
  end_date: "",
  status: "Draft",
  counterparty: "",
  notes: "",
};

const EMPTY_ALLOC = {
  task_id: "",
  label: "",
  allocated_amount: "",
};

export default function ContractsBudget() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Budget detail drawer
  const [detailContract, setDetailContract] = useState(null);
  const [summary, setSummary] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [allocForm, setAllocForm] = useState(EMPTY_ALLOC);
  const [addingAlloc, setAddingAlloc] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchContracts(); }, []);

  async function fetchContracts() {
    setLoading(true);
    try {
      const res = await getContracts();
      setContracts(res?.data?.items || res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openDetail(contract) {
    setDetailContract(contract);
    try {
      const [s, a] = await Promise.all([
        getContractBudgetSummary(contract.id),
        getContractBudgetAllocations(contract.id),
      ]);
      setSummary(s?.data || null);
      setAllocations(a?.data || []);
    } catch (e) {
      setSummary(null);
      setAllocations([]);
    }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      project_id: c.project_id || "",
      title: c.title || "",
      contract_value: c.contract_value || "",
      total_budget: c.total_budget || "",
      start_date: c.start_date?.slice(0, 10) || "",
      end_date: c.end_date?.slice(0, 10) || "",
      status: c.status || "Draft",
      counterparty: c.counterparty || "",
      notes: c.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        contract_value: parseFloat(form.contract_value) || 0,
        total_budget: parseFloat(form.total_budget) || 0,
      };
      if (editing) await updateContract(editing.id, payload);
      else await createContract(payload);
      setShowModal(false);
      fetchContracts();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContract(deleteTarget.id);
      setDeleteTarget(null);
      fetchContracts();
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const handleAddAlloc = async () => {
    setAddingAlloc(true);
    try {
      await createBudgetAllocation(detailContract.id, {
        ...allocForm,
        allocated_amount: parseFloat(allocForm.allocated_amount),
      });
      const res = await getContractBudgetAllocations(detailContract.id);
      setAllocations(res?.data || []);
      const s = await getContractBudgetSummary(detailContract.id);
      setSummary(s?.data || null);
      setAllocForm(EMPTY_ALLOC);
    } catch (e) { console.error(e); }
    finally { setAddingAlloc(false); }
  };

  const handleRemoveAlloc = async (allocId) => {
    try {
      await deleteBudgetAllocation(detailContract.id, allocId);
      setAllocations((prev) => prev.filter((a) => a.id !== allocId));
    } catch (e) { console.error(e); }
  };

  const filtered = contracts.filter((c) => {
    const ms = !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.counterparty?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || c.status === statusFilter;
    return ms && mf;
  });

  const spentPct = (c) => {
    if (!c.total_budget || !c.spent_amount) return 0;
    return Math.min(100, Math.round((c.spent_amount / c.total_budget) * 100));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Contracts & Budget</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Define project budgets, contract values, and task-level allocations
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={openAdd}>+ New Contract</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <input
          type="text"
          placeholder="Search contracts..."
          className="input input-sm input-bordered bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 w-56"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {["All", ...CONTRACT_STATUSES].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-info" : "btn-ghost text-gray-100"}`}
              onClick={() => setStatusFilter(s)}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="p-10 text-center text-gray-400">Loading contracts...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p>No contracts found.</p>
          <button className="btn btn-sm btn-info mt-4" onClick={openAdd}>Create First Contract</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const pct = spentPct(c);
            return (
              <div key={c.id} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-100">{c.title}</p>
                    <p className="text-xs text-gray-400">{c.counterparty || "—"}</p>
                  </div>
                  <span className={`badge badge-sm ${STATUS_BADGE[c.status] || "badge-ghost"}`}>
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Contract Value</p>
                    <p className="text-gray-100 font-medium">{formatCurrency(c.contract_value)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total Budget</p>
                    <p className="text-gray-100 font-medium">{formatCurrency(c.total_budget)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Spent</p>
                    <p className={`font-medium ${pct > 85 ? "text-error" : pct > 60 ? "text-warning" : "text-success"}`}>
                      {formatCurrency(c.spent_amount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Remaining</p>
                    <p className="text-gray-100 font-medium">
                      {formatCurrency((c.total_budget || 0) - (c.spent_amount || 0))}
                    </p>
                  </div>
                </div>

                {/* Budget progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Budget Usage</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${pct > 85 ? "bg-error" : pct > 60 ? "bg-warning" : "bg-success"
                        }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  {c.start_date ? new Date(c.start_date).toLocaleDateString() : "—"} →{" "}
                  {c.end_date ? new Date(c.end_date).toLocaleDateString() : "Ongoing"}
                </div>

                <div className="flex gap-2 pt-1">
                  <button className="btn btn-xs btn-info flex-1" onClick={() => openDetail(c)}>
                    Budget Detail
                  </button>
                  <button className="btn btn-xs btn-ghost text-gray-100" onClick={() => openEdit(c)}>Edit</button>
                  <button className="btn btn-xs btn-ghost text-error" onClick={() => setDeleteTarget(c)}>Del</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-4">
              {editing ? "Edit Contract" : "New Contract"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label text-xs text-gray-400">Contract Title</label>
                <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Project ID</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    placeholder="Project UUID"
                    value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Counterparty</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    placeholder="Vendor / Client name"
                    value={form.counterparty} onChange={(e) => setForm({ ...form, counterparty: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Contract Value ($)</label>
                  <input type="number" min="0" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Total Budget ($)</label>
                  <input type="number" min="0" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.total_budget} onChange={(e) => setForm({ ...form, total_budget: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Start Date</label>
                  <input type="date" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">End Date</label>
                  <input type="date" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Status</label>
                <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {CONTRACT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Notes</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-info btn-sm" onClick={handleSave} disabled={saving || !form.title}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}

      {/* Budget Detail Modal */}
      {detailContract && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-2xl">
            <h3 className="font-bold text-lg text-gray-100 mb-1">{detailContract.title}</h3>
            <p className="text-xs text-gray-400 mb-4">Budget allocations per task/subtask</p>

            {/* Summary bar */}
            {summary && (
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Total Budget", value: formatCurrency(summary.total_budget), color: "text-info" },
                  { label: "Allocated", value: formatCurrency(summary.allocated), color: "text-warning" },
                  { label: "Consumed", value: formatCurrency(summary.consumed), color: "text-error" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className={`font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Existing allocations */}
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {allocations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-3">No allocations yet.</p>
              ) : allocations.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-slate-700 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-gray-100 text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-gray-400">Task: {a.task_id || "—"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-100 font-medium text-sm">{formatCurrency(a.allocated_amount)}</span>
                    <button className="btn btn-xs btn-ghost text-error"
                      onClick={() => handleRemoveAlloc(a.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add allocation */}
            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Add Allocation</p>
              <div className="grid grid-cols-3 gap-2">
                <input placeholder="Label" className="input input-xs input-bordered bg-slate-700 text-gray-100"
                  value={allocForm.label} onChange={(e) => setAllocForm({ ...allocForm, label: e.target.value })} />
                <input placeholder="Task ID" className="input input-xs input-bordered bg-slate-700 text-gray-100"
                  value={allocForm.task_id} onChange={(e) => setAllocForm({ ...allocForm, task_id: e.target.value })} />
                <input type="number" placeholder="Amount" className="input input-xs input-bordered bg-slate-700 text-gray-100"
                  value={allocForm.allocated_amount} onChange={(e) => setAllocForm({ ...allocForm, allocated_amount: e.target.value })} />
              </div>
              <button className="btn btn-xs btn-info w-full mt-2"
                onClick={handleAddAlloc}
                disabled={addingAlloc || !allocForm.label || !allocForm.allocated_amount}>
                {addingAlloc ? "Adding..." : "Add Allocation"}
              </button>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setDetailContract(null)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDetailContract(null)} />
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Delete Contract?</h3>
            <p className="text-sm text-gray-400 mt-2">
              Permanently delete <strong className="text-gray-100">{deleteTarget.title}</strong>?
              All budget allocations will also be removed.
            </p>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-error btn-sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteTarget(null)} />
        </div>
      )}
    </div>
  );
}
