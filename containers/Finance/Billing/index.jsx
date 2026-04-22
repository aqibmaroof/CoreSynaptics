"use client";
import { useState, useEffect } from "react";
import {
  getInvoices,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
} from "@/services/Finance/Billing";
import { formatCurrency } from "@/Utils/payrollCalculations";

const INVOICE_STATUSES = ["DRAFT", "PENDING", "OVERDUE", "PAID"];

const STATUS_BADGE = {
  DRAFT: "badge-ghost",
  PENDING: "badge-warning",
  OVERDUE: "badge-error",
  PAID: "badge-success",
};

let invoiceCounter = 1000;
function nextInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${String(++invoiceCounter).padStart(3, "0")}`;
}

const EMPTY_FORM = {
  invoiceNumber: "",
  projectId: "",
  taskId: "",
  partyType: "VENDOR",
  partyId: "",
  partyName: "",
  contractId: "",
  vendorQuoteId: "",
  amount: "",
  taxAmount: "",
  dueDate: "",
  description: "",
};

export default function FinanceBilling() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [markingPaid, setMarkingPaid] = useState(null);

  useEffect(() => { fetchInvoices(); }, []);

  async function fetchInvoices() {
    setLoading(true);
    try {
      const res = await getInvoices();
      setInvoices(res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, invoiceNumber: nextInvoiceNumber() });
    setShowModal(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({
      invoiceNumber: inv.invoiceNumber || "",
      projectId: inv.projectId || "",
      taskId: inv.taskId || "",
      partyType: inv.partyType || "VENDOR",
      partyId: inv.partyId || "",
      partyName: inv.partyName || "",
      contractId: inv.contractId || "",
      vendorQuoteId: inv.vendorQuoteId || "",
      amount: inv.amount || "",
      taxAmount: inv.taxAmount || "",
      dueDate: inv.dueDate?.slice(0, 10) || "",
      description: inv.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        // Only the 7 editable fields per spec
        const payload = {};
        if (form.partyName) payload.partyName = form.partyName;
        if (form.contractId !== undefined) payload.contractId = form.contractId || null;
        if (form.vendorQuoteId !== undefined) payload.vendorQuoteId = form.vendorQuoteId || null;
        if (form.amount) payload.amount = parseFloat(form.amount);
        if (form.taxAmount !== "") payload.taxAmount = parseFloat(form.taxAmount) || 0;
        if (form.dueDate) payload.dueDate = new Date(form.dueDate).toISOString();
        if (form.description !== undefined) payload.description = form.description;
        await updateInvoice(editing.id, payload);
      } else {
        const payload = {
          invoiceNumber: form.invoiceNumber,
          projectId: form.projectId,
          partyType: form.partyType,
          partyId: form.partyId,
          partyName: form.partyName,
          amount: parseFloat(form.amount),
          dueDate: new Date(form.dueDate).toISOString(),
        };
        if (form.taskId) payload.taskId = form.taskId;
        if (form.contractId) payload.contractId = form.contractId;
        if (form.vendorQuoteId) payload.vendorQuoteId = form.vendorQuoteId;
        if (form.taxAmount) payload.taxAmount = parseFloat(form.taxAmount);
        if (form.description) payload.description = form.description;
        await createInvoice(payload);
      }
      setShowModal(false);
      fetchInvoices();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleMarkPaid = async (inv) => {
    setMarkingPaid(inv.id);
    try {
      await markInvoicePaid(inv.id);
      fetchInvoices();
    } catch (e) { console.error(e); }
    finally { setMarkingPaid(null); }
  };

  const filtered = invoices.filter((inv) => {
    const ms = !search ||
      inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      inv.partyName?.toLowerCase().includes(search.toLowerCase()) ||
      inv.projectId?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || inv.status === statusFilter;
    return ms && mf;
  });

  const totals = {
    all: invoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    paid: invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + (i.totalAmount || 0), 0),
    pending: invoices.filter((i) => i.status === "PENDING").reduce((s, i) => s + (i.totalAmount || 0), 0),
    overdue: invoices.filter((i) => i.status === "OVERDUE" || i.isOverdue).reduce((s, i) => s + (i.totalAmount || 0), 0),
  };

  const canMarkPaid = (inv) => inv.status === "PENDING" || inv.status === "OVERDUE";
  const isLocked = (inv) => inv.status === "PAID";

  const createDisabled = !form.invoiceNumber || !form.projectId || !form.partyId ||
    !form.partyName || !form.amount || !form.dueDate;
  const editDisabled = editing && isLocked(editing);

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
        <input
          type="text"
          placeholder="Search invoices..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-56"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {["All", ...INVOICE_STATUSES].map((s) => (
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
                  <th>Project</th>
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
                  const overdue = inv.isOverdue || (inv.status !== "PAID" && inv.dueDate && new Date(inv.dueDate) < new Date());
                  return (
                    <tr key={inv.id} className={`hover:bg-slate-700 ${overdue ? "border-l-2 border-error" : ""}`}>
                      <td className="text-gray-100 font-mono text-xs">{inv.invoiceNumber}</td>
                      <td>
                        <div className="text-gray-100 text-xs">{inv.projectId || "—"}</div>
                        {inv.taskId && <div className="text-gray-500 text-xs">Task: {inv.taskId}</div>}
                      </td>
                      <td>
                        <div className="text-gray-100 text-sm">{inv.partyName}</div>
                        <div className="text-xs text-gray-500">{inv.partyType}</div>
                      </td>
                      <td className="text-gray-100 font-medium">{formatCurrency(inv.amount)}</td>
                      <td className="text-gray-400 text-xs">{inv.taxAmount ? formatCurrency(inv.taxAmount) : "—"}</td>
                      <td className="text-gray-100 font-bold">{formatCurrency(inv.totalAmount)}</td>
                      <td>
                        <span className={`text-xs ${overdue ? "text-error font-medium" : "text-gray-400"}`}>
                          {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
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
                          {canMarkPaid(inv) && (
                            <button
                              className="btn btn-xs btn-ghost text-success"
                              onClick={() => handleMarkPaid(inv)}
                              disabled={markingPaid === inv.id}
                            >
                              {markingPaid === inv.id ? "..." : "Mark Paid"}
                            </button>
                          )}
                          <button
                            className="btn btn-xs btn-ghost text-gray-100"
                            onClick={() => openEdit(inv)}
                            disabled={isLocked(inv)}
                          >
                            Edit
                          </button>
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-4">
              {editing ? "Edit Invoice" : "New Invoice"}
            </h3>
            {editing && isLocked(editing) && (
              <div className="alert alert-warning mb-3 text-xs py-2">
                Paid invoices cannot be edited.
              </div>
            )}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Invoice Number</label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100 disabled:opacity-50"
                    value={form.invoiceNumber}
                    disabled={!!editing}
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Party Type</label>
                  <select
                    className="select select-sm select-bordered w-full bg-slate-700 text-gray-100 disabled:opacity-50"
                    value={form.partyType}
                    disabled={!!editing}
                    onChange={(e) => setForm({ ...form, partyType: e.target.value })}
                  >
                    <option value="VENDOR">VENDOR</option>
                    <option value="CLIENT">CLIENT</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Project ID</label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100 disabled:opacity-50"
                    value={form.projectId}
                    disabled={!!editing}
                    onChange={(e) => setForm({ ...form, projectId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Task ID (optional)</label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100 disabled:opacity-50"
                    value={form.taskId}
                    disabled={!!editing}
                    onChange={(e) => setForm({ ...form, taskId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Party ID</label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100 disabled:opacity-50"
                    value={form.partyId}
                    disabled={!!editing}
                    onChange={(e) => setForm({ ...form, partyId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Party Name</label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.partyName}
                    onChange={(e) => setForm({ ...form, partyName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Contract ID (optional)</label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.contractId}
                    onChange={(e) => setForm({ ...form, contractId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Vendor Quote ID (optional)</label>
                  <input
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.vendorQuoteId}
                    onChange={(e) => setForm({ ...form, vendorQuoteId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Amount ($)</label>
                  <input
                    type="number" min="0.01" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Tax Amount ($)</label>
                  <input
                    type="number" min="0" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.taxAmount}
                    onChange={(e) => setForm({ ...form, taxAmount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Due Date</label>
                <input
                  type="date"
                  className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label text-xs text-gray-400">Description</label>
                <textarea
                  className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="btn btn-info btn-sm"
                onClick={handleSave}
                disabled={saving || (editing ? editDisabled : createDisabled)}
              >
                {saving ? "Saving..." : editing ? "Update Invoice" : "Create Invoice"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
