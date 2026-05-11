"use client";
import { useState, useEffect } from "react";
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
} from "@/services/Finance/Contracts";
import { getProjects } from "@/services/Projects";
import { formatCurrency } from "@/Utils/payrollCalculations";

const STATUS_BADGE = {
  DRAFT: "badge-ghost",
  ACTIVE: "badge-success",
  CLOSED: "badge-neutral",
};

const EMPTY_FORM = {
  title: "",
  projectId: "",
  counterpartyName: "",
  counterpartyId: "",
  contractValue: "",
  totalBudget: "",
  startDate: "",
  endDate: "",
  notes: "",
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

  // Detail view modal
  const [detailContract, setDetailContract] = useState(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Project lookup
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchContracts();
    getProjects()
      .then((res) => setProjects(res?.projects || []))
      .catch(() => {});
  }, []);

  async function fetchContracts() {
    setLoading(true);
    try {
      const res = await getContracts();
      setContracts(res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditing(c);
    setForm({
      title: c.title || "",
      projectId: c.projectId || "",
      counterpartyName: c.counterpartyName || "",
      counterpartyId: c.counterpartyId || "",
      contractValue: c.contractValue ?? "",
      totalBudget: c.totalBudget ?? "",
      startDate: c.startDate?.slice(0, 10) || "",
      endDate: c.endDate?.slice(0, 10) || "",
      notes: c.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        counterpartyName: form.counterpartyName,
        notes: form.notes || undefined,
      };
      if (!editing && form.projectId) payload.projectId = form.projectId;
      if (form.counterpartyId) payload.counterpartyId = form.counterpartyId;
      if (form.contractValue !== "")
        payload.contractValue = parseFloat(form.contractValue);
      if (form.totalBudget !== "")
        payload.totalBudget = parseFloat(form.totalBudget);
      if (form.startDate)
        payload.startDate = new Date(form.startDate).toISOString();
      if (form.endDate) payload.endDate = new Date(form.endDate).toISOString();
      if (editing) {
        // status can be updated; include if already editing
        await updateContract(editing.id, payload);
      } else {
        await createContract(payload);
      }
      setShowModal(false);
      fetchContracts();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (contract, newStatus) => {
    try {
      await updateContract(contract.id, { status: newStatus });
      fetchContracts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContract(deleteTarget.id);
      setDeleteTarget(null);
      fetchContracts();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = contracts.filter((c) => {
    const ms =
      !search ||
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.counterpartyName?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || c.status === statusFilter;
    return ms && mf;
  });

  // Budget utilisation: totalBudget as ceiling, contractValue as the committed amount
  const budgetPct = (c) => {
    if (!c.totalBudget || !c.contractValue) return 0;
    return Math.min(100, Math.round((c.contractValue / c.totalBudget) * 100));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Contracts & Budget
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage project contracts, counterparties, and financial commitments
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={openAdd}>
          + New Contract
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <input
          type="text"
          placeholder="Search by title or counterparty..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {["All", "DRAFT", "ACTIVE", "CLOSED"].map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-info" : "btn-ghost text-gray-100"}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="p-10 text-center text-gray-400">
          Loading contracts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">📋</p>
          <p>No contracts found.</p>
          <button className="btn btn-sm btn-info mt-4" onClick={openAdd}>
            Create First Contract
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const pct = budgetPct(c);
            return (
              <div
                key={c.id}
                className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-100 truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {c.counterpartyName || "—"}
                    </p>
                  </div>
                  <span
                    className={`badge badge-sm flex-shrink-0 ${STATUS_BADGE[c.status] || "badge-ghost"}`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Contract Value</p>
                    <p className="text-gray-100 font-medium">
                      {c.contractValue != null
                        ? formatCurrency(c.contractValue)
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Total Budget</p>
                    <p className="text-gray-100 font-medium">
                      {c.totalBudget != null
                        ? formatCurrency(c.totalBudget)
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Contract value vs budget bar */}
                {c.contractValue != null && c.totalBudget != null && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Value / Budget</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${pct > 100 ? "bg-error" : pct > 85 ? "bg-warning" : "bg-success"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {c.startDate
                    ? new Date(c.startDate).toLocaleDateString()
                    : "—"}{" "}
                  →{" "}
                  {c.endDate
                    ? new Date(c.endDate).toLocaleDateString()
                    : "Ongoing"}
                </div>

                {/* Status quick-change (DRAFT → ACTIVE → CLOSED) */}
                {c.status !== "CLOSED" && (
                  <div className="flex gap-1">
                    {c.status === "DRAFT" && (
                      <button
                        className="btn btn-xs btn-success flex-1"
                        onClick={() => handleStatusChange(c, "ACTIVE")}
                      >
                        Activate
                      </button>
                    )}
                    {c.status === "ACTIVE" && (
                      <button
                        className="btn btn-xs btn-neutral flex-1"
                        onClick={() => handleStatusChange(c, "CLOSED")}
                      >
                        Close
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    className="btn btn-xs btn-info flex-1"
                    onClick={() => setDetailContract(c)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn btn-xs btn-ghost text-gray-100"
                    onClick={() => openEdit(c)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => setDeleteTarget(c)}
                  >
                    Del
                  </button>
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
                <label className="label text-xs text-gray-400">
                  Contract Title *
                </label>
                <input
                  className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">
                    Project *
                  </label>
                  <select
                    className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={form.projectId}
                    onChange={(e) =>
                      setForm({ ...form, projectId: e.target.value })
                    }
                  >
                    <option value="">— Select Project —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs text-gray-400">
                    Counterparty Name *
                  </label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    placeholder="Vendor / Client name"
                    value={form.counterpartyName}
                    onChange={(e) =>
                      setForm({ ...form, counterpartyName: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">
                  Counterparty ID (optional)
                </label>
                <input
                  className="input input-sm input-bordered w-full bg-slate-700 text-gray-100 font-mono"
                  placeholder="UUID"
                  value={form.counterpartyId}
                  onChange={(e) =>
                    setForm({ ...form, counterpartyId: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">
                    Contract Value ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.contractValue}
                    onChange={(e) =>
                      setForm({ ...form, contractValue: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">
                    Total Budget ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.totalBudget}
                    onChange={(e) =>
                      setForm({ ...form, totalBudget: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              {editing && (
                <div>
                  <label className="label text-xs text-gray-400">Status</label>
                  <select
                    className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={editing.status}
                    onChange={(e) =>
                      setEditing({ ...editing, status: e.target.value })
                    }
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              )}
              <div>
                <label className="label text-xs text-gray-400">Notes</label>
                <textarea
                  className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-info btn-sm"
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.title ||
                  !form.projectId ||
                  !form.counterpartyName
                }
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}

      {/* Contract Detail Modal */}
      {detailContract && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-bold text-lg text-gray-100">
                {detailContract.title}
              </h3>
              <span
                className={`badge badge-sm ml-2 flex-shrink-0 ${STATUS_BADGE[detailContract.status] || "badge-ghost"}`}
              >
                {detailContract.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              {detailContract.counterpartyName}
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Contract Value",
                    value:
                      detailContract.contractValue != null
                        ? formatCurrency(detailContract.contractValue)
                        : "—",
                    color: "text-info",
                  },
                  {
                    label: "Total Budget",
                    value:
                      detailContract.totalBudget != null
                        ? formatCurrency(detailContract.totalBudget)
                        : "—",
                    color: "text-warning",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-700 rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className={`font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Project ID</span>
                  <span className="text-gray-100 font-mono text-xs">
                    {detailContract.projectId}
                  </span>
                </div>
                {detailContract.counterpartyId && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Counterparty ID</span>
                    <span className="text-gray-100 font-mono text-xs">
                      {detailContract.counterpartyId}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Date</span>
                  <span className="text-gray-100">
                    {detailContract.startDate
                      ? new Date(detailContract.startDate).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">End Date</span>
                  <span className="text-gray-100">
                    {detailContract.endDate
                      ? new Date(detailContract.endDate).toLocaleDateString()
                      : "Ongoing"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-gray-100">
                    {detailContract.createdAt
                      ? new Date(detailContract.createdAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>

              {detailContract.notes && (
                <div className="bg-slate-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-100 text-sm">
                    {detailContract.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setDetailContract(null)}
              >
                Close
              </button>
              <button
                className="btn btn-info btn-sm"
                onClick={() => {
                  setDetailContract(null);
                  openEdit(detailContract);
                }}
              >
                Edit
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDetailContract(null)}
          />
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Delete Contract?</h3>
            <p className="text-sm text-gray-400 mt-2">
              Delete{" "}
              <strong className="text-gray-100">{deleteTarget.title}</strong>?
              This action is a soft delete and can be recovered.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setDeleteTarget(null)}
          />
        </div>
      )}
    </div>
  );
}
