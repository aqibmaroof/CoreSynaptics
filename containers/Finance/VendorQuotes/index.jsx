"use client";
import { useState, useEffect } from "react";
import {
  getVendorQuotes,
  createVendorQuote,
  updateVendorQuote,
  deleteVendorQuote,
  approveVendorQuote,
  rejectVendorQuote,
  compareQuotes,
} from "@/services/Finance/VendorQuotes";
import { formatCurrency } from "@/Utils/payrollCalculations";

const QUOTE_STATUSES = ["Draft", "Submitted", "Under Review", "Approved", "Rejected"];
const STATUS_BADGE = {
  Draft: "badge-ghost",
  Submitted: "badge-warning",
  "Under Review": "badge-info",
  Approved: "badge-success",
  Rejected: "badge-error",
};

const EMPTY_FORM = {
  vendor_id: "",
  vendor_name: "",
  project_id: "",
  scope: "",
  quoted_amount: "",
  validity_date: "",
  status: "Draft",
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

  // Compare mode
  const [compareIds, setCompareIds] = useState([]);
  const [compareResult, setCompareResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  // Action modals
  const [actionTarget, setActionTarget] = useState(null); // { quote, type: 'approve'|'reject' }
  const [actionNote, setActionNote] = useState("");
  const [actioning, setActioning] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchQuotes(); }, []);

  async function fetchQuotes() {
    setLoading(true);
    try {
      const res = await getVendorQuotes();
      setQuotes(res?.data?.items || res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (q) => {
    setEditing(q);
    setForm({
      vendor_id: q.vendor_id || "",
      vendor_name: q.vendor_name || "",
      project_id: q.project_id || "",
      scope: q.scope || "",
      quoted_amount: q.quoted_amount || "",
      validity_date: q.validity_date?.slice(0, 10) || "",
      status: q.status || "Draft",
      notes: q.notes || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, quoted_amount: parseFloat(form.quoted_amount) || 0 };
      if (editing) await updateVendorQuote(editing.id, payload);
      else await createVendorQuote(payload);
      setShowModal(false);
      fetchQuotes();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteVendorQuote(deleteTarget.id);
      setDeleteTarget(null);
      fetchQuotes();
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const handleAction = async () => {
    setActioning(true);
    try {
      if (actionTarget.type === "approve") {
        await approveVendorQuote(actionTarget.quote.id, { notes: actionNote });
      } else {
        await rejectVendorQuote(actionTarget.quote.id, { reason: actionNote });
      }
      setActionTarget(null);
      setActionNote("");
      fetchQuotes();
    } catch (e) { console.error(e); }
    finally { setActioning(false); }
  };

  const toggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleCompare = async () => {
    setComparing(true);
    try {
      const res = await compareQuotes(compareIds);
      setCompareResult(res?.data || null);
    } catch (e) { console.error(e); }
    finally { setComparing(false); }
  };

  const filtered = quotes.filter((q) => {
    const ms = !search ||
      q.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.scope?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || q.status === statusFilter;
    return ms && mf;
  });

  const isExpired = (q) => q.validity_date && new Date(q.validity_date) < new Date();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Vendor Quotes</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Compare vendor quotations, attach documents, and approve/reject
          </p>
        </div>
        <div className="flex gap-2">
          {compareIds.length >= 2 && (
            <button className="btn btn-sm btn-secondary" onClick={handleCompare} disabled={comparing}>
              {comparing ? "Comparing..." : `Compare (${compareIds.length})`}
            </button>
          )}
          <button className="btn btn-sm btn-info" onClick={openAdd}>+ Request Quote</button>
        </div>
      </div>

      {/* Compare selection hint */}
      {compareIds.length > 0 && (
        <div className="alert alert-info rounded-xl py-2 text-sm">
          {compareIds.length} quote(s) selected for comparison. Select up to 3.
          <button className="btn btn-xs btn-ghost ml-auto" onClick={() => setCompareIds([])}>Clear</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <input type="text" placeholder="Search by vendor or scope..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-64"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {["All", ...QUOTE_STATUSES].map((s) => (
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
                  <th className="w-8">
                    <span className="text-gray-500 text-xs">Compare</span>
                  </th>
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
                      <input type="checkbox" className="checkbox checkbox-xs checkbox-info"
                        checked={compareIds.includes(q.id)}
                        onChange={() => toggleCompare(q.id)}
                        disabled={!compareIds.includes(q.id) && compareIds.length >= 3} />
                    </td>
                    <td>
                      <div className="text-gray-100 font-medium">{q.vendor_name || "—"}</div>
                      <div className="text-xs text-gray-400">{q.vendor_id}</div>
                    </td>
                    <td className="text-gray-300 text-xs">{q.project_name || q.project_id || "—"}</td>
                    <td className="text-gray-300 text-sm max-w-48 truncate" title={q.scope}>{q.scope}</td>
                    <td className="text-gray-100 font-medium">{formatCurrency(q.quoted_amount)}</td>
                    <td>
                      <span className={isExpired(q) ? "text-error text-xs" : "text-gray-400 text-xs"}>
                        {q.validity_date ? new Date(q.validity_date).toLocaleDateString() : "—"}
                        {isExpired(q) && <span className="badge badge-error badge-xs ml-1">Expired</span>}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[q.status] || "badge-ghost"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {q.status === "Submitted" || q.status === "Under Review" ? (
                          <>
                            <button className="btn btn-xs btn-success"
                              onClick={() => setActionTarget({ quote: q, type: "approve" })}>
                              Approve
                            </button>
                            <button className="btn btn-xs btn-error"
                              onClick={() => setActionTarget({ quote: q, type: "reject" })}>
                              Reject
                            </button>
                          </>
                        ) : null}
                        <button className="btn btn-xs btn-ghost text-gray-100" onClick={() => openEdit(q)}>Edit</button>
                        <button className="btn btn-xs btn-ghost text-error" onClick={() => setDeleteTarget(q)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compare Result Modal */}
      {compareResult && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-3xl">
            <h3 className="font-bold text-lg text-gray-100 mb-4">Quote Comparison</h3>
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="text-gray-400 text-xs">
                    <th>Field</th>
                    {compareResult.quotes?.map((q) => (
                      <th key={q.id}>{q.vendor_name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {["quoted_amount", "validity_date", "scope", "status"].map((field) => (
                    <tr key={field} className="hover:bg-slate-700">
                      <td className="text-gray-400 capitalize text-xs">{field.replace("_", " ")}</td>
                      {compareResult.quotes?.map((q) => (
                        <td key={q.id} className={`text-gray-100 text-sm ${field === "quoted_amount" && q.is_lowest ? "text-success font-bold" : ""
                          }`}>
                          {field === "quoted_amount" ? formatCurrency(q[field]) : q[field] || "—"}
                          {field === "quoted_amount" && q.is_lowest && (
                            <span className="badge badge-success badge-xs ml-1">Lowest</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setCompareResult(null)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setCompareResult(null)} />
        </div>
      )}

      {/* Approve / Reject Modal */}
      {actionTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">
              {actionTarget.type === "approve" ? "Approve Quote" : "Reject Quote"}
            </h3>
            <p className="text-sm text-gray-400 mt-2 mb-3">
              {actionTarget.quote.vendor_name} — {formatCurrency(actionTarget.quote.quoted_amount)}
            </p>
            <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
              placeholder={actionTarget.type === "approve" ? "Approval notes (optional)" : "Rejection reason..."}
              value={actionNote} onChange={(e) => setActionNote(e.target.value)} />
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => { setActionTarget(null); setActionNote(""); }}>Cancel</button>
              <button
                className={`btn btn-sm ${actionTarget.type === "approve" ? "btn-success" : "btn-error"}`}
                onClick={handleAction} disabled={actioning}>
                {actioning ? "Processing..." : actionTarget.type === "approve" ? "Confirm Approve" : "Confirm Reject"}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Vendor Name</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Vendor ID (optional)</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.vendor_id} onChange={(e) => setForm({ ...form, vendor_id: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Project ID</label>
                <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} />
              </div>
              <div>
                <label className="label text-xs text-gray-400">Scope of Work</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Quoted Amount ($)</label>
                  <input type="number" min="0" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.quoted_amount} onChange={(e) => setForm({ ...form, quoted_amount: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Valid Until</label>
                  <input type="date" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.validity_date} onChange={(e) => setForm({ ...form, validity_date: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Status</label>
                <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                  value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {QUOTE_STATUSES.map((s) => <option key={s}>{s}</option>)}
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
              <button className="btn btn-info btn-sm" onClick={handleSave}
                disabled={saving || !form.vendor_name}>
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Delete Quote?</h3>
            <p className="text-sm text-gray-400 mt-2">
              Delete quote from <strong className="text-gray-100">{deleteTarget.vendor_name}</strong>?
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
