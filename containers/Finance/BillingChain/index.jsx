"use client";
import { useState, useEffect } from "react";
import { getAllBillingChains, getBillingChain, updateChainStageStatus } from "@/services/Finance/BillingChain";
import { formatCurrency } from "@/Utils/payrollCalculations";

const STAGES = ["Project", "Task", "Vendor", "Invoice", "Payment"];

const STAGE_STATUS_OPTIONS = {
  Project: ["Active", "On Hold", "Completed"],
  Task: ["Pending", "In Progress", "Completed"],
  Vendor: ["Quote Requested", "Quote Received", "Approved"],
  Invoice: ["Draft", "Sent", "Pending", "Paid", "Overdue"],
  Payment: ["Pending", "Partial", "Complete"],
};

const STAGE_BADGE = {
  // Green
  Completed: "badge-success",
  Paid: "badge-success",
  Complete: "badge-success",
  Approved: "badge-success",
  // Blue
  Active: "badge-info",
  "In Progress": "badge-info",
  Sent: "badge-info",
  "Quote Received": "badge-info",
  // Yellow
  Pending: "badge-warning",
  Partial: "badge-warning",
  "Quote Requested": "badge-warning",
  // Red
  "On Hold": "badge-error",
  Overdue: "badge-error",
  // Ghost
  Draft: "badge-ghost",
  "Task Pending": "badge-ghost",
};

const STAGE_EMOJI = {
  Project: "🏗️",
  Task: "✅",
  Vendor: "🏭",
  Invoice: "🧾",
  Payment: "💳",
};

export default function BillingChain() {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Detail view
  const [detailChain, setDetailChain] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Stage update
  const [updatingStage, setUpdatingStage] = useState(null);

  useEffect(() => { fetchChains(); }, []);

  async function fetchChains() {
    setLoading(true);
    try {
      const res = await getAllBillingChains();
      setChains(res?.data?.items || res?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function openDetail(chain) {
    setDetailChain(chain);
    setLoadingDetail(true);
    try {
      const res = await getBillingChain(chain.project_id || chain.id);
      setDetailData(res?.data || null);
    } catch (e) { setDetailData(null); }
    finally { setLoadingDetail(false); }
  }

  async function handleStageUpdate(chainId, stage, status) {
    setUpdatingStage(stage);
    try {
      await updateChainStageStatus(chainId, stage.toLowerCase(), { status });
      // Refresh detail
      const res = await getBillingChain(detailChain.project_id || detailChain.id);
      setDetailData(res?.data || null);
    } catch (e) { console.error(e); }
    finally { setUpdatingStage(null); }
  }

  // Derive chain health color from stage statuses
  function chainHealth(chain) {
    if (chain.has_overdue) return "border-error";
    if (chain.payment_status === "Complete") return "border-success";
    if (chain.payment_status === "Partial") return "border-warning";
    return "border-info";
  }

  const filtered = chains.filter((c) =>
    !search || c.project_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Billing Chain</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Full lifecycle: Project → Task → Vendor → Invoice → Payment
        </p>
      </div>

      {/* Search */}
      <input type="text" placeholder="Search by project name..."
        className="input input-sm input-bordered bg-slate-700 text-gray-100 w-64"
        value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Chain Cards */}
      {loading ? (
        <div className="p-10 text-center text-gray-400">Loading billing chains...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          <p className="text-4xl mb-3">🔗</p>
          <p>No billing chains found.</p>
          <p className="text-xs mt-2">Chains are auto-created when a project has tasks with vendor billing.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((chain) => (
            <div key={chain.id}
              className={`bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl shadow-sm border-l-4 ${chainHealth(chain)} overflow-hidden`}>
              {/* Chain Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                <div>
                  <p className="font-semibold text-gray-100">{chain.project_name || "Unnamed Project"}</p>
                  <p className="text-xs text-gray-400">{chain.task_count} task(s) · {chain.vendor_count} vendor(s)</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total Billed</p>
                    <p className="font-bold text-gray-100">{formatCurrency(chain.total_billed || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Paid</p>
                    <p className="font-bold text-success">{formatCurrency(chain.total_paid || 0)}</p>
                  </div>
                  <button className="btn btn-xs btn-info" onClick={() => openDetail(chain)}>
                    View Chain
                  </button>
                </div>
              </div>

              {/* Stage Pipeline Row */}
              <div className="flex items-center gap-0 overflow-x-auto px-5 py-4">
                {STAGES.map((stage, idx) => {
                  const stageData = chain.stages?.[stage.toLowerCase()] || {};
                  const status = stageData.status || "—";
                  return (
                    <div key={stage} className="flex items-center flex-shrink-0">
                      <div className="text-center w-28">
                        <div className="text-lg mb-1">{STAGE_EMOJI[stage]}</div>
                        <p className="text-xs text-gray-400 font-medium mb-1">{stage}</p>
                        <span className={`badge badge-xs ${STAGE_BADGE[status] || "badge-ghost"}`}>
                          {status}
                        </span>
                      </div>
                      {idx < STAGES.length - 1 && (
                        <div className="w-8 flex items-center justify-center text-gray-600 text-lg flex-shrink-0">
                          →
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detailChain && (
        <div className="modal modal-open">
          <div className="modal-box bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 max-w-3xl">
            <h3 className="font-bold text-lg text-gray-100 mb-1">
              {detailChain.project_name} — Billing Chain
            </h3>
            <p className="text-xs text-gray-400 mb-5">Full lifecycle status tracking</p>

            {loadingDetail ? (
              <div className="p-6 text-center text-gray-400">Loading chain details...</div>
            ) : !detailData ? (
              <div className="p-6 text-center text-gray-500">No chain data available.</div>
            ) : (
              <div className="space-y-4">
                {STAGES.map((stage) => {
                  const stageData = detailData.stages?.[stage.toLowerCase()] || {};
                  const items = stageData.items || [];
                  const status = stageData.status || "Pending";
                  const statusOptions = STAGE_STATUS_OPTIONS[stage] || [];
                  const isUpdating = updatingStage === stage;

                  return (
                    <div key={stage} className="bg-slate-700 rounded-xl overflow-hidden">
                      {/* Stage header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{STAGE_EMOJI[stage]}</span>
                          <span className="font-semibold text-gray-100">{stage}</span>
                          <span className={`badge badge-sm ${STAGE_BADGE[status] || "badge-ghost"}`}>
                            {status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            className="select select-xs select-bordered bg-slate-600 text-gray-100"
                            value={status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStageUpdate(detailChain.id, stage, e.target.value)
                            }
                          >
                            {statusOptions.map((s) => <option key={s}>{s}</option>)}
                          </select>
                          {isUpdating && (
                            <span className="loading loading-spinner loading-xs text-info" />
                          )}
                        </div>
                      </div>

                      {/* Stage items */}
                      {items.length === 0 ? (
                        <p className="text-gray-500 text-sm px-4 py-3">No items at this stage.</p>
                      ) : (
                        <div className="divide-y divide-slate-600">
                          {items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-2">
                              <div>
                                <p className="text-gray-100 text-sm">{item.name || item.title || item.invoice_number || "—"}</p>
                                {item.assigned_to && (
                                  <p className="text-xs text-gray-400">Assigned: {item.assigned_to}</p>
                                )}
                              </div>
                              <div className="text-right">
                                {item.amount != null && (
                                  <p className="text-gray-100 text-sm font-medium">{formatCurrency(item.amount)}</p>
                                )}
                                {item.status && (
                                  <span className={`badge badge-xs ${STAGE_BADGE[item.status] || "badge-ghost"}`}>
                                    {item.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Totals */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { label: "Total Billed", value: detailData.total_billed, color: "text-info" },
                    { label: "Total Paid", value: detailData.total_paid, color: "text-success" },
                    { label: "Outstanding", value: (detailData.total_billed || 0) - (detailData.total_paid || 0), color: "text-warning" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-700 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">{s.label}</p>
                      <p className={`font-bold ${s.color}`}>{formatCurrency(s.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm text-gray-100"
                onClick={() => { setDetailChain(null); setDetailData(null); }}>Close</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => { setDetailChain(null); setDetailData(null); }} />
        </div>
      )}
    </div>
  );
}
