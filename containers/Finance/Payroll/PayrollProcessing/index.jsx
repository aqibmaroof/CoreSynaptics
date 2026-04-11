"use client";
import { useState, useEffect } from "react";
import {
  getPayrollRuns,
  generatePayrollRun,
  approvePayrollRun,
  markPayrollPaid,
  voidPayrollRun,
  getPayrollLineItems,
} from "@/services/Payroll";
import {
  formatCurrency,
  formatHours,
  payPeriodLabel,
} from "@/Utils/payrollCalculations";

const FREQUENCIES = ["weekly", "biweekly", "monthly"];

const STATUS_BADGE = {
  DRAFT: "badge-warning",
  APPROVED: "badge-info",
  PAID: "badge-success",
  VOID: "badge-error",
};

const STATUS_FLOW = {
  DRAFT: ["APPROVED", "VOID"],
  APPROVED: ["PAID", "VOID"],
  PAID: [],
  VOID: [],
};

const EMPTY_GEN_FORM = {
  frequency: "monthly",
  period_start: new Date().toISOString().slice(0, 10),
};

export default function PayrollProcessing() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");

  // Generate modal
  const [showGenModal, setShowGenModal] = useState(false);
  const [genForm, setGenForm] = useState(EMPTY_GEN_FORM);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // Line items drawer
  const [viewRun, setViewRun] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Action modals
  const [actionTarget, setActionTarget] = useState(null); // { run, action }
  const [actionNote, setActionNote] = useState("");
  const [actioning, setActioning] = useState(false);

  // Mark paid modal
  const [paidTarget, setPaidTarget] = useState(null);
  const [paidDate, setPaidDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentRef, setPaymentRef] = useState("");
  const [markingPaid, setMarkingPaid] = useState(false);

  useEffect(() => {
    fetchRuns();
  }, []);

  async function fetchRuns() {
    setLoading(true);
    try {
      const res = await getPayrollRuns({ sort: "created_at:desc" });
      setRuns(res?.data?.items || res?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function openLineItems(run) {
    setViewRun(run);
    setLoadingItems(true);
    try {
      const res = await getPayrollLineItems(run.id);
      setLineItems(res?.data || []);
    } catch (e) {
      setLineItems([]);
    } finally {
      setLoadingItems(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenError("");
    try {
      await generatePayrollRun(genForm);
      setShowGenModal(false);
      setGenForm(EMPTY_GEN_FORM);
      fetchRuns();
    } catch (e) {
      setGenError(e?.response?.data?.message || "Failed to generate payroll run.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleApprove(run) {
    setActioning(true);
    try {
      await approvePayrollRun(run.id);
      setActionTarget(null);
      fetchRuns();
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(false);
    }
  }

  async function handleVoid(run) {
    setActioning(true);
    try {
      await voidPayrollRun(run.id, { reason: actionNote });
      setActionTarget(null);
      setActionNote("");
      fetchRuns();
    } catch (e) {
      console.error(e);
    } finally {
      setActioning(false);
    }
  }

  async function handleMarkPaid() {
    setMarkingPaid(true);
    try {
      await markPayrollPaid(paidTarget.id, {
        payment_date: paidDate,
        payment_reference: paymentRef,
      });
      setPaidTarget(null);
      setPaymentRef("");
      fetchRuns();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingPaid(false);
    }
  }

  const filtered = statusFilter === "All"
    ? runs
    : runs.filter((r) => r.status === statusFilter);

  const summary = {
    total: runs.length,
    draft: runs.filter((r) => r.status === "DRAFT").length,
    approved: runs.filter((r) => r.status === "APPROVED").length,
    paid: runs.filter((r) => r.status === "PAID").length,
    void: runs.filter((r) => r.status === "VOID").length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Payroll Processing</h1>
          <p className="text-sm text-gray-100 opacity-60 mt-0.5">
            Generate, review, approve, and mark payroll runs as paid
          </p>
        </div>
        <button
          className="btn btn-sm btn-info"
          onClick={() => setShowGenModal(true)}
        >
          + Generate Payroll Run
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Runs", value: summary.total, color: "text-info" },
          { label: "Draft", value: summary.draft, color: "text-warning" },
          { label: "Approved", value: summary.approved, color: "text-info" },
          { label: "Paid", value: summary.paid, color: "text-success" },
          { label: "Void", value: summary.void, color: "text-error" },
        ].map((s) => (
          <div key={s.label} className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-100 opacity-50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-4 rounded-xl flex-wrap">
        {["All", "DRAFT", "APPROVED", "PAID", "VOID"].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${statusFilter === s ? "btn-info rounded-lg" : "btn-ghost text-gray-100"}`}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Runs Table */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-100">Loading payroll runs...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-100">
            <p className="text-4xl mb-3">💳</p>
            <p>No payroll runs found.</p>
            <button
              className="btn btn-sm btn-info mt-4"
              onClick={() => setShowGenModal(true)}
            >
              Generate First Run
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-gray-100 opacity-60 text-xs">
                  <th>Pay Period</th>
                  <th>Frequency</th>
                  <th>Employees</th>
                  <th>Total Hours</th>
                  <th>Gross Pay</th>
                  <th>Deductions</th>
                  <th>Net Pay</th>
                  <th>Status</th>
                  <th>Paid On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((run) => (
                  <tr key={run.id} className="hover:bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900-hover">
                    <td>
                      <button
                        className="text-gray-100 font-medium text-left hover:text-info transition-colors text-sm"
                        onClick={() => openLineItems(run)}
                      >
                        {run.period_label ||
                          payPeriodLabel(run.frequency, run.period_start)}
                      </button>
                    </td>
                    <td className="text-gray-100 capitalize">{run.frequency}</td>
                    <td className="text-gray-100">{run.employee_count ?? "—"}</td>
                    <td className="text-gray-100">{formatHours(run.total_hours ?? 0)}</td>
                    <td className="text-gray-100 font-medium">{formatCurrency(run.total_gross)}</td>
                    <td className="text-gray-100 text-error">
                      {run.total_deductions ? `−${formatCurrency(run.total_deductions)}` : "—"}
                    </td>
                    <td className="text-gray-100 font-bold text-success">
                      {formatCurrency(run.total_net)}
                    </td>
                    <td>
                      <span
                        className={`badge badge-sm ${STATUS_BADGE[run.status] || "badge-ghost"}`}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="text-gray-100 text-xs opacity-60">
                      {run.payment_date
                        ? new Date(run.payment_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        <button
                          className="btn btn-xs btn-ghost text-gray-100"
                          onClick={() => openLineItems(run)}
                        >
                          View
                        </button>
                        {run.status === "DRAFT" && (
                          <button
                            className="btn btn-xs btn-info"
                            onClick={() => setActionTarget({ run, action: "approve" })}
                          >
                            Approve
                          </button>
                        )}
                        {run.status === "APPROVED" && (
                          <button
                            className="btn btn-xs btn-success"
                            onClick={() => setPaidTarget(run)}
                          >
                            Mark Paid
                          </button>
                        )}
                        {["DRAFT", "APPROVED"].includes(run.status) && (
                          <button
                            className="btn btn-xs btn-ghost text-error"
                            onClick={() => setActionTarget({ run, action: "void" })}
                          >
                            Void
                          </button>
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

      {/* Generate Modal */}
      {showGenModal && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-lg text-gray-100 mb-4">Generate Payroll Run</h3>
            <p className="text-sm text-gray-100 opacity-60 mb-4">
              The system will calculate gross pay, apply deductions, and create a draft
              run for all active payroll profiles matching the selected period.
            </p>

            <div className="space-y-3">
              <div>
                <label className="label text-xs text-gray-100 opacity-70">Pay Frequency</label>
                <select
                  className="select select-sm select-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                  value={genForm.frequency}
                  onChange={(e) => setGenForm({ ...genForm, frequency: e.target.value })}
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-xs text-gray-100 opacity-70">Period Start Date</label>
                <input
                  type="date"
                  className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                  value={genForm.period_start}
                  onChange={(e) =>
                    setGenForm({ ...genForm, period_start: e.target.value })
                  }
                />
                <p className="text-xs text-gray-100 opacity-50 mt-1">
                  Period end is calculated automatically based on frequency.
                </p>
              </div>

              {genError && (
                <div className="alert alert-error text-sm py-2">{genError}</div>
              )}
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => { setShowGenModal(false); setGenError(""); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-info btn-sm"
                onClick={handleGenerate}
                disabled={generating || !genForm.period_start}
              >
                {generating ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { setShowGenModal(false); setGenError(""); }}
          />
        </div>
      )}

      {/* Approve / Void Confirm Modal */}
      {actionTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">
              {actionTarget.action === "approve" ? "Approve Payroll Run?" : "Void Payroll Run?"}
            </h3>
            <p className="text-sm text-gray-100 opacity-70 mt-2">
              {actionTarget.action === "approve"
                ? `This will approve the payroll run for ${
                    actionTarget.run.period_label || actionTarget.run.period_start
                  } (${formatCurrency(actionTarget.run.total_net)} net). Once approved, you can mark it as Paid.`
                : `Voiding this run cannot be undone. Please provide a reason.`}
            </p>

            {actionTarget.action === "void" && (
              <textarea
                className="textarea textarea-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100 text-sm mt-3"
                rows={2}
                placeholder="Reason for voiding..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
            )}

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => { setActionTarget(null); setActionNote(""); }}
              >
                Cancel
              </button>
              <button
                className={`btn btn-sm ${
                  actionTarget.action === "approve" ? "btn-info" : "btn-error"
                }`}
                onClick={() =>
                  actionTarget.action === "approve"
                    ? handleApprove(actionTarget.run)
                    : handleVoid(actionTarget.run)
                }
                disabled={
                  actioning ||
                  (actionTarget.action === "void" && !actionNote.trim())
                }
              >
                {actioning
                  ? "Processing..."
                  : actionTarget.action === "approve"
                  ? "Confirm Approve"
                  : "Confirm Void"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => { setActionTarget(null); setActionNote(""); }}
          />
        </div>
      )}

      {/* Mark Paid Modal */}
      {paidTarget && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-sm">
            <h3 className="font-bold text-gray-100">Mark Payroll as Paid</h3>
            <p className="text-sm text-gray-100 opacity-70 mt-2 mb-4">
              Confirm payment for{" "}
              <strong>{paidTarget.period_label || paidTarget.period_start}</strong> —
              Net: <strong className="text-success">{formatCurrency(paidTarget.total_net)}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="label text-xs text-gray-100 opacity-70">Payment Date</label>
                <input
                  type="date"
                  className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                />
              </div>
              <div>
                <label className="label text-xs text-gray-100 opacity-70">
                  Payment Reference (optional)
                </label>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-gray-100"
                  placeholder="Bank transfer ID, cheque #, etc."
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setPaidTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={handleMarkPaid}
                disabled={markingPaid || !paidDate}
              >
                {markingPaid ? "Saving..." : "Confirm Payment"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setPaidTarget(null)} />
        </div>
      )}

      {/* Line Items Drawer */}
      {viewRun && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-3xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-100">
                  {viewRun.period_label || payPeriodLabel(viewRun.frequency, viewRun.period_start)}
                </h3>
                <p className="text-xs text-gray-100 opacity-50 capitalize">
                  {viewRun.frequency} · {viewRun.employee_count} employees ·{" "}
                  <span className={`badge badge-xs ${STATUS_BADGE[viewRun.status]}`}>
                    {viewRun.status}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-100 opacity-50">Net Total</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(viewRun.total_net)}
                </p>
              </div>
            </div>

            {loadingItems ? (
              <div className="p-6 text-center text-gray-100 opacity-50">Loading...</div>
            ) : lineItems.length === 0 ? (
              <div className="p-6 text-center text-gray-100 opacity-40">No line items found.</div>
            ) : (
              <div className="overflow-x-auto max-h-96">
                <table className="table table-xs w-full">
                  <thead>
                    <tr className="text-gray-100 opacity-60 text-xs">
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Hours</th>
                      <th>OT Hours</th>
                      <th>Gross</th>
                      <th>Deductions</th>
                      <th>Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900-hover">
                        <td>
                          <div className="text-gray-100 font-medium">{item.user_name}</div>
                          <div className="text-xs text-gray-100 opacity-50">{item.department}</div>
                        </td>
                        <td>
                          <span
                            className={`badge badge-xs ${
                              item.employment_type === "hourly"
                                ? "badge-secondary"
                                : "badge-info"
                            }`}
                          >
                            {item.employment_type}
                          </span>
                        </td>
                        <td className="text-gray-100">{formatHours(item.total_hours)}</td>
                        <td className="text-gray-100">
                          {item.overtime_hours > 0 ? (
                            <span className="text-warning">{formatHours(item.overtime_hours)}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="text-gray-100 font-medium">{formatCurrency(item.gross_pay)}</td>
                        <td className="text-error">
                          {item.total_deductions
                            ? `−${formatCurrency(item.total_deductions)}`
                            : "—"}
                        </td>
                        <td className="font-bold text-success">
                          {formatCurrency(item.net_pay)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="text-gray-100 font-semibold border-t border-base-300">
                      <td colSpan={4} className="text-right opacity-60 text-xs">
                        Totals:
                      </td>
                      <td className="font-bold">{formatCurrency(viewRun.total_gross)}</td>
                      <td className="text-error">
                        {viewRun.total_deductions
                          ? `−${formatCurrency(viewRun.total_deductions)}`
                          : "—"}
                      </td>
                      <td className="font-bold text-success">
                        {formatCurrency(viewRun.total_net)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => setViewRun(null)}
              >
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setViewRun(null)} />
        </div>
      )}
    </div>
  );
}
