"use client";
import { useState, useEffect } from "react";
import { getPayments, createPayment } from "@/services/Finance/BillingChain";
import { formatCurrency } from "@/Utils/payrollCalculations";

const PAYMENT_METHODS = ["CASH", "BANK", "ONLINE", "CHEQUE", "WIRE", "OTHER"];

const STATUS_BADGE = {
  PENDING: "badge-warning",
  SUCCESS: "badge-success",
  FAILED: "badge-error",
};

const METHOD_LABEL = {
  CASH: "Cash",
  BANK: "Bank Transfer",
  ONLINE: "Online",
  CHEQUE: "Cheque",
  WIRE: "Wire",
  OTHER: "Other",
};

const EMPTY_FORM = {
  invoiceId: "",
  amount: "",
  paidAt: "",
  method: "BANK",
  reference: "",
  status: "SUCCESS",
  notes: "",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [paidAfter, setPaidAfter] = useState("");
  const [paidBefore, setPaidBefore] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPayments(); }, []);

  async function fetchPayments() {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "All") params.status = statusFilter;
      if (paidAfter) params.paidAfter = new Date(paidAfter).toISOString();
      if (paidBefore) params.paidBefore = new Date(paidBefore).toISOString();
      const res = await getPayments(params);
      setPayments(res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  // Re-fetch when filters change
  useEffect(() => { fetchPayments(); }, [statusFilter, paidAfter, paidBefore]);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const payload = {
        invoiceId: form.invoiceId,
        amount: parseFloat(form.amount),
        paidAt: new Date(form.paidAt).toISOString(),
        method: form.method,
        status: form.status,
      };
      if (form.reference) payload.reference = form.reference;
      if (form.notes) payload.notes = form.notes;
      await createPayment(payload);
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchPayments();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const filtered = payments.filter((p) =>
    !invoiceSearch || p.invoiceId?.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  const summary = {
    total: payments.length,
    success: payments.filter((p) => p.status === "SUCCESS").length,
    pending: payments.filter((p) => p.status === "PENDING").length,
    failed: payments.filter((p) => p.status === "FAILED").length,
    totalCollected: payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((s, p) => s + (p.amount || 0), 0),
  };

  const isFormValid =
    form.invoiceId && form.amount && parseFloat(form.amount) > 0 && form.paidAt && form.method;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Payments</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Record and track payments against invoices
          </p>
        </div>
        <button className="btn btn-sm btn-info" onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
          + Record Payment
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Payments", value: summary.total, color: "text-info" },
          { label: "Successful", value: summary.success, color: "text-success" },
          { label: "Pending", value: summary.pending, color: "text-warning" },
          { label: "Failed", value: summary.failed, color: "text-error" },
          { label: "Total Collected", value: formatCurrency(summary.totalCollected), color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-4 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl">
        <input type="text" placeholder="Filter by Invoice ID..."
          className="input input-sm input-bordered bg-slate-700 text-gray-100 w-56"
          value={invoiceSearch} onChange={(e) => setInvoiceSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {["All", "PENDING", "SUCCESS", "FAILED"].map((s) => (
            <button key={s}
              className={`btn btn-sm ${statusFilter === s ? "btn-info" : "btn-ghost text-gray-100"}`}
              onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-gray-400">From</span>
          <input type="date" className="input input-sm input-bordered bg-slate-700 text-gray-100"
            value={paidAfter} onChange={(e) => setPaidAfter(e.target.value)} />
          <span className="text-xs text-gray-400">To</span>
          <input type="date" className="input input-sm input-bordered bg-slate-700 text-gray-100"
            value={paidBefore} onChange={(e) => setPaidBefore(e.target.value)} />
          {(paidAfter || paidBefore) && (
            <button className="btn btn-xs btn-ghost text-gray-400"
              onClick={() => { setPaidAfter(""); setPaidBefore(""); }}>Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading payments...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="text-4xl mb-3">💳</p>
            <p>No payments found.</p>
            <button className="btn btn-sm btn-info mt-4"
              onClick={() => { setForm(EMPTY_FORM); setShowModal(true); }}>
              Record First Payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-400 text-xs">
                  <th>Invoice ID</th>
                  <th>Amount</th>
                  <th>Paid At</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-700">
                    <td>
                      <div className="text-gray-100 text-sm font-mono">{p.invoiceId || "—"}</div>
                    </td>
                    <td>
                      <span className="text-gray-100 font-medium">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="text-gray-400 text-xs">
                      {p.paidAt ? new Date(p.paidAt).toLocaleString() : "—"}
                    </td>
                    <td>
                      <span className="text-gray-300 text-sm">{METHOD_LABEL[p.method] || p.method || "—"}</span>
                    </td>
                    <td>
                      <span className="text-gray-400 text-xs font-mono">{p.reference || "—"}</span>
                    </td>
                    <td>
                      <span className={`badge badge-sm ${STATUS_BADGE[p.status] || "badge-ghost"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-gray-400 text-xs max-w-40 truncate" title={p.notes}>
                      {p.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-lg">
            <h3 className="font-bold text-lg text-gray-100 mb-4">Record Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="label text-xs text-gray-400">Invoice ID *</label>
                <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100 font-mono"
                  placeholder="UUID of invoice"
                  value={form.invoiceId} onChange={(e) => setForm({ ...form, invoiceId: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Amount ($) *</label>
                  <input type="number" min="0.01" step="0.01"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Paid At *</label>
                  <input type="datetime-local"
                    className="input input-sm input-bordered w-full bg-slate-700 text-gray-100"
                    value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs text-gray-400">Method *</label>
                  <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>{METHOD_LABEL[m]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label text-xs text-gray-400">Status</label>
                  <select className="select select-sm select-bordered w-full bg-slate-700 text-gray-100"
                    value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="PENDING">PENDING</option>
                    <option value="FAILED">FAILED</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label text-xs text-gray-400">Reference</label>
                <input className="input input-sm input-bordered w-full bg-slate-700 text-gray-100 font-mono"
                  placeholder="Transaction ID, cheque no., wire ref..."
                  value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
              </div>
              <div>
                <label className="label text-xs text-gray-400">Notes</label>
                <textarea className="textarea textarea-bordered w-full bg-slate-700 text-gray-100 text-sm" rows={2}
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              {form.status === "SUCCESS" && (
                <div className="bg-slate-700 rounded-lg px-3 py-2 text-xs text-success">
                  This payment will be immediately applied to the invoice balance.
                  {form.amount && ` Amount: ${formatCurrency(parseFloat(form.amount) || 0)}`}
                </div>
              )}
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-info btn-sm" onClick={handleCreate}
                disabled={saving || !isFormValid}>
                {saving ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
}
