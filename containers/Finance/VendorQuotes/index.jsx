"use client";
import { useState, useEffect } from "react";
import {
  getVendorQuotes,
  createVendorQuote,
  updateVendorQuote,
  submitVendorQuote,
  approveVendorQuote,
  rejectVendorQuote,
} from "@/services/Finance/VendorQuotes";
import { getProjects } from "@/services/Projects";
import { getSuppliers } from "@/services/Inventory";
import { formatCurrency } from "@/Utils/payrollCalculations";

const STATUS_BADGE = {
  DRAFT: "badge-ghost",
  SUBMITTED: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-error",
};

const EMPTY_FORM = {
  vendorId: "",
  vendorName: "",
  projectId: "",
  contractId: "",
  scopeOfWork: "",
  quotedAmount: "",
  validUntil: "",
  notes: "",
};

export default function VendorQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  // Form modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Action modals
  const [actionTarget, setActionTarget] = useState(null); // { quote, type: 'submit'|'approve'|'reject' }
  const [actionNote, setActionNote] = useState("");
  const [actioning, setActioning] = useState(false);

  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchQuotes();
    getProjects().then((res) => setProjects(res?.projects || [])).catch(() => {});
    getSuppliers().then((res) => setSuppliers(res?.data || [])).catch(() => {});
  }, []);

  async function fetchQuotes() {
    setLoading(true);
    try {
      const res = await getVendorQuotes();
      setQuotes(res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (q) => {
    setEditing(q);
    setForm({
      vendorId: q.vendorId || "",
      vendorName: q.vendorName || "",
      projectId: q.projectId || "",
      contractId: q.contractId || "",
      scopeOfWork: q.scopeOfWork || "",
      quotedAmount: q.quotedAmount || "",
      validUntil: q.validUntil?.slice(0, 10) || "",
      notes: q.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        quotedAmount: parseFloat(form.quotedAmount) || 0,
        validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      };
      if (!payload.contractId) delete payload.contractId;
      if (editing) await updateVendorQuote(editing.id, payload);
      else await createVendorQuote(payload);
      setShowModal(false);
      fetchQuotes();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleAction = async () => {
    setActioning(true);
    try {
      if (actionTarget.type === "submit") {
        await submitVendorQuote(actionTarget.quote.id);
      } else if (actionTarget.type === "approve") {
        await approveVendorQuote(actionTarget.quote.id);
      } else {
        await rejectVendorQuote(actionTarget.quote.id, { reason: actionNote });
      }
      setActionTarget(null);
      setActionNote("");
      fetchQuotes();
    } catch (e) { console.error(e); }
    finally { setActioning(false); }
  };

  const filtered = quotes.filter((q) => {
    const ms = !search ||
      q.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
      q.scopeOfWork?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || q.status === statusFilter;
    return ms && mf;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Vendor Quotes</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage vendor quotation requests and approvals
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={openAdd}>+ Request Quote</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <input type="text" placeholder="Search by vendor or scope..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-64"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {["All", "DRAFT", "SUBMITTED", "APPROVED", "REJECTED"].map((s) => (
            <button key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-info" : "btn-ghost text-gray-100"}`}
              onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading quotes...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-4xl mb-3">🏷️</p>
            <p>No vendor quotes found.</p>
            <button className="btn btn-sm btn-info mt-4" onClick={openAdd}>Request First Quote</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th>Vendor</th>
                  <th>Project</th>
                  <th>Scope</th>
                  <th>Quoted Amount</th>
                  <th>Valid Until</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-700">
                    <td>
                      <div className="text-gray-100 font-medium">
                        {suppliers.find((s) => s.id === q.vendorId)?.name || q.vendorName || "—"}
                      </div>
                      <div className="text-xs text-gray-400">{q.vendorId}</div>
                    </td>
                    <td className="text-gray-300 text-xs">
                      {projects.find((p) => p.id === q.projectId)?.name || q.projectId || "—"}
                    </td>
                    <td className="text-gray-300 text-sm max-w-48 truncate" title={q.scopeOfWork}>{q.scopeOfWork || "—"}</td>
                    <td className="text-gray-100 font-medium">{formatCurrency(q.quotedAmount)}</td>
                    <td>
                      <span className={q.isExpired ? "text-error text-xs" : "text-gray-400 text-xs"}>
                        {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—"}
                        {q.isExpired && <span className="badge badge-error badge-xs ml-1">Expired</span>}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[q.status] || "badge-ghost"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {q.status === "DRAFT" && (
                          <>
                            <button className="btn btn-xs btn-warning"
                              onClick={() => setActionTarget({ quote: q, type: "submit" })}>
                              Submit
                            </button>
                            <button className="btn btn-xs btn-ghost text-gray-100" onClick={() => openEdit(q)}>Edit</button>
                          </>
                        )}
                        {q.status === "SUBMITTED" && (
                          <>
                            <button className="btn btn-xs btn-success"
                              onClick={() => setActionTarget({ quote: q, type: "approve" })}>
                              Approve
                            </button>
                            <button className="btn btn-xs btn-error"
                              onClick={() => setActionTarget({ quote: q, type: "reject" })}>
                              Reject
                            </button>
                            <button className="btn btn-xs btn-ghost text-gray-100" onClick={() => openEdit(q)}>Edit</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit / Approve / Reject Modal */}
      {actionTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">
              {actionTarget.type === "submit" ? "Submit Quote for Review" :
                actionTarget.type === "approve" ? "Approve Quote" : "Reject Quote"}
            </h3>
            <p className="text-sm text-gray-400 mt-2 mb-3">
              {actionTarget.quote.vendorName} — {formatCurrency(actionTarget.quote.quotedAmount)}
            </p>
            {actionTarget.type === "reject" && (
              <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                placeholder="Rejection reason (optional)"
                value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
            )}
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => { setActionTarget(null); setActionNote(""); }}>Cancel</button>
              <button
                className={`btn btn-sm ${actionTarget.type === "approve" ? "btn-success" : actionTarget.type === "reject" ? "btn-error" : "btn-warning"}`}
                onClick={handleAction} disabled={actioning}>
                {actioning ? "Processing..." :
                  actionTarget.type === "submit" ? "Confirm Submit" :
                    actionTarget.type === "approve" ? "Confirm Approve" : "Confirm Reject"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { setActionTarget(null); setActionNote(""); }} />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-4">
              {editing ? "Edit Quote" : "Request Quote"}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="label text-xs text-gray-400">Vendor *</label>
                <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                  value={form.vendorId}
                  onChange={(e) => {
                    const sup = suppliers.find((s) => s.id === e.target.value);
                    setForm({ ...form, vendorId: e.target.value, vendorName: sup?.name || "" });
                  }}>
                  <option value="">— Select Vendor —</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Project *</label>
                  <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })}>
                    <option value="">— Select Project —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Contract ID (optional)</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.contractId} onChange={(e) => setForm({ ...form, contractId: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Scope of Work</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.scopeOfWork} onChange={(e) => setForm({ ...form, scopeOfWork: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Quoted Amount ($) *</label>
                  <input type="number" min="0.01" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.quotedAmount} onChange={(e) => setForm({ ...form, quotedAmount: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Valid Until *</label>
                  <input type="date" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Notes</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-info btn-sm" onClick={handleSave}
                disabled={saving || !form.vendorId || !form.projectId || !form.quotedAmount || !form.validUntil}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
