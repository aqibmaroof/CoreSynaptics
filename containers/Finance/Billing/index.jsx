"use client";
import { useState, useEffect } from "react";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markInvoicePaid,
  recordPayment,
  getInvoicePayments,
} from "@/services/Finance/Billing";
import { formatCurrency } from "@/Utils/payrollCalculations";

const INVOICE_STATUSES = ["Draft", "Sent", "Pending", "Paid", "Overdue", "Cancelled"];
const STATUS_BADGE = {
  Draft: "badge-ghost",
  Sent: "badge-info",
  Pending: "badge-warning",
  Paid: "badge-success",
  Overdue: "badge-error",
  Cancelled: "badge-neutral",
};

let invoiceCounter = 1000;
function nextInvoiceNumber() {
  return `INV-${String(++invoiceCounter).padStart(6, "0")}`;
}

const EMPTY_FORM = {
  invoice_number: "",
  project_id: "",
  task_id: "",
  party_name: "",
  party_type: "Vendor",
  amount: "",
  tax_amount: "",
  due_date: "",
  status: "Draft",
  description: "",
};

const EMPTY_PAYMENT = {
  amount: "",
  payment_date: new Date().toISOString().slice(0, 10),
  method: "Bank Transfer",
  reference: "",
};

const PAYMENT_METHODS = ["Bank Transfer", "Cheque", "Cash", "Credit Card", "ACH", "Wire"];

export default function FinanceBilling() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Payment recording
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentForm, setPaymentForm] = useState(EMPTY_PAYMENT);
  const [recordingPayment, setRecordingPayment] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchInvoices(); }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await getInvoices();
      setInvoices(res?.data?.items || res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openPayments(invoice) {
    setPaymentTarget(invoice);
    try {
      const res = await getInvoicePayments(invoice.id);
      setPayments(res?.data || []);
    } catch (e) { setPayments([]); }
  }

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, invoice_number: nextInvoiceNumber() });
    setShowModal(true);
  };
  const openEdit = (inv) => {
    setEditing(inv);
    setForm({
      invoice_number: inv.invoice_number || "",
      project_id: inv.project_id || "",
      task_id: inv.task_id || "",
      party_name: inv.party_name || "",
      party_type: inv.party_type || "Vendor",
      amount: inv.amount || "",
      tax_amount: inv.tax_amount || "",
      due_date: inv.due_date?.slice(0, 10) || "",
      status: inv.status || "Draft",
      description: inv.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount) || 0,
        tax_amount: parseFloat(form.tax_amount) || 0,
      };
      if (editing) await updateInvoice(editing.id, payload);
      else await createInvoice(payload);
      setShowModal(false);
      fetchInvoices();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget.id);
      setDeleteTarget(null);
      fetchInvoices();
    } catch (e) { console.error(e); }
    finally { setDeleting(false); }
  };

  const handleRecordPayment = async () => {
    setRecordingPayment(true);
    try {
      await recordPayment(paymentTarget.id, {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
      });
      const res = await getInvoicePayments(paymentTarget.id);
      setPayments(res?.data || []);
      setPaymentForm(EMPTY_PAYMENT);
      fetchInvoices();
    } catch (e) { console.error(e); }
    finally { setRecordingPayment(false); }
  };

  const filtered = invoices.filter((inv) => {
    const ms = !search ||
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.party_name?.toLowerCase().includes(search.toLowerCase()) ||
      inv.project_name?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || inv.status === statusFilter;
    return ms && mf;
  });

  const totals = {
    all: invoices.reduce((s, i) => s + (i.amount || 0), 0),
    paid: invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + (i.amount || 0), 0),
    pending: invoices.filter((i) => ["Pending", "Sent"].includes(i.status)).reduce((s, i) => s + (i.amount || 0), 0),
    overdue: invoices.filter((i) => i.status === "Overdue").reduce((s, i) => s + (i.amount || 0), 0),
  };

  const isOverdue = (inv) =>
    inv.status !== "Paid" && inv.due_date && new Date(inv.due_date) < new Date();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Finance & Billing</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Invoice generation, payment tracking, and billing management
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={openAdd}>+ New Invoice</button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Invoiced", value: formatCurrency(totals.all), color: "text-info" },
          { label: "Paid", value: formatCurrency(totals.paid), color: "text-success" },
          { label: "Pending", value: formatCurrency(totals.pending), color: "text-warning" },
          { label: "Overdue", value: formatCurrency(totals.overdue), color: "text-error" },
        ].map((s) => (
          <div key={s.label} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <input type="text" placeholder="Search invoices..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-56"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {["All", ...INVOICE_STATUSES].map((s) => (
            <button key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-info" : "btn-ghost text-gray-100"}`}
              onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-4xl mb-3">🧾</p>
            <p>No invoices found.</p>
            <button className="btn btn-sm btn-info mt-4" onClick={openAdd}>Create First Invoice</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th>Invoice #</th>
                  <th>Project / Task</th>
                  <th>Vendor / Client</th>
                  <th>Amount</th>
                  <th>Tax</th>
                  <th>Total</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const total = (inv.amount || 0) + (inv.tax_amount || 0);
                  const overdue = isOverdue(inv);
                  return (
                    <tr key={inv.id} className={`hover:bg-slate-700 ${overdue ? "border-l-2 border-error" : ""}`}>
                      <td className="text-gray-100 font-mono text-xs">{inv.invoice_number}</td>
                      <td>
                        <div className="text-gray-100 text-xs">{inv.project_name || inv.project_id || "—"}</div>
                        {inv.task_id && <div className="text-gray-500 text-xs">Task: {inv.task_id}</div>}
                      </td>
                      <td>
                        <div className="text-gray-100 text-sm">{inv.party_name}</div>
                        <div className="text-xs text-gray-500">{inv.party_type}</div>
                      </td>
                      <td className="text-gray-100 font-medium">{formatCurrency(inv.amount)}</td>
                      <td className="text-gray-400 text-xs">{inv.tax_amount ? formatCurrency(inv.tax_amount) : "—"}</td>
                      <td className="text-gray-100 font-bold">{formatCurrency(total)}</td>
                      <td>
                        <span className={`text-xs ${overdue ? "text-error font-medium" : "text-gray-400"}`}>
                          {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                          {overdue && <span className="badge badge-error badge-xs ml-1">OVERDUE</span>}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-sm ${STATUS_BADGE[inv.status] || "badge-ghost"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-xs btn-ghost text-info"
                            onClick={() => openPayments(inv)}>Payments</button>
                          <button className="btn btn-xs btn-ghost text-gray-100"
                            onClick={() => openEdit(inv)}>Edit</button>
                          <button className="btn btn-xs btn-ghost text-error"
                            onClick={() => setDeleteTarget(inv)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-md">
            <h3 className="font-bold text-lg text-gray-100 mb-1">
              Payments — {paymentTarget.invoice_number}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Total: {formatCurrency((paymentTarget.amount || 0) + (paymentTarget.tax_amount || 0))} ·
              Status: <span className={`badge badge-xs ${STATUS_BADGE[paymentTarget.status]}`}>{paymentTarget.status}</span>
            </p>

            {/* Past payments */}
            <div className="max-h-36 overflow-y-auto space-y-2 mb-4">
              {payments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-2">No payments recorded.</p>
              ) : payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center bg-slate-700 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-gray-100 text-sm font-medium">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{p.method} · {p.reference || "—"}</p>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>

            {/* Record new payment */}
            {paymentTarget.status !== "Paid" && paymentTarget.status !== "Cancelled" && (
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Record Payment</p>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Amount" min="0" step="0.01"
                    className="input input-xs input-bordered bg-slate-700 text-gray-100"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                  <input type="date"
                    className="input input-xs input-bordered bg-slate-700 text-gray-100"
                    value={paymentForm.payment_date}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })} />
                  <select className="select select-xs select-bordered bg-slate-700 text-gray-100"
                    value={paymentForm.method}
                    onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}>
                    {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                  <input type="text" placeholder="Reference #"
                    className="input input-xs input-bordered bg-slate-700 text-gray-100"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} />
                </div>
                <button className="btn btn-xs btn-success w-full"
                  onClick={handleRecordPayment}
                  disabled={recordingPayment || !paymentForm.amount}>
                  {recordingPayment ? "Recording..." : "Record Payment"}
                </button>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setPaymentTarget(null)}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPaymentTarget(null)} />
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-4">
              {editing ? "Edit Invoice" : "New Invoice"}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Invoice Number</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Status</label>
                  <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {INVOICE_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Project ID</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Task ID (optional)</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.task_id} onChange={(e) => setForm({ ...form, task_id: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Vendor / Client Name</label>
                  <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.party_name} onChange={(e) => setForm({ ...form, party_name: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Party Type</label>
                  <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={form.party_type} onChange={(e) => setForm({ ...form, party_type: e.target.value })}>
                    <option>Vendor</option>
                    <option>Client</option>
                    <option>Subcontractor</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Amount ($)</label>
                  <input type="number" min="0" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Tax Amount ($)</label>
                  <input type="number" min="0" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.tax_amount} onChange={(e) => setForm({ ...form, tax_amount: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Due Date</label>
                <input type="date" className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div>
                <label className="label text-xs text-gray-400">Description</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-info btn-sm" onClick={handleSave}
                disabled={saving || !form.party_name || !form.amount}>
                {saving ? "Saving..." : editing ? "Update" : "Create Invoice"}
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
            <h3 className="font-bold text-gray-100">Delete Invoice?</h3>
            <p className="text-sm text-gray-400 mt-2">
              Delete <strong className="text-gray-100">{deleteTarget.invoice_number}</strong>?
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
