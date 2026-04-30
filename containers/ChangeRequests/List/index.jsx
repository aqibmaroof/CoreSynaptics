"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { listChangeRequests, getChangeRequestSummary, deleteChangeRequest, withdrawChangeRequest } from "@/services/ChangeRequests";
import { listCxProjects } from "@/services/ProjectWizard";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

const STATUS_STYLES = {
  PENDING:   "bg-yellow-900/40 text-yellow-300",
  APPROVED:  "bg-green-900/40 text-green-400",
  REJECTED:  "bg-red-900/40 text-red-300",
  WITHDRAWN: "bg-gray-700 text-gray-400",
};

const IMPACT_STYLES = {
  COST:     "bg-blue-900/30 text-blue-300",
  SCHEDULE: "bg-purple-900/30 text-purple-300",
  BOTH:     "bg-orange-900/30 text-orange-300",
  NONE:     "bg-gray-700 text-gray-400",
};

export default function ChangeRequestList() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionTarget, setActionTarget] = useState(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    listCxProjects()
      .then((res) => {
        const list = toArray(res);
        setProjects(list);
        if (list.length > 0) setProjectId(String(list[0].id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      listChangeRequests(projectId, statusFilter ? { status: statusFilter } : {}),
      getChangeRequestSummary(projectId),
    ])
      .then(([crRes, sumRes]) => {
        setItems(toArray(crRes));
        setSummary(sumRes?.data ?? sumRes);
      })
      .catch(() => setError("Failed to load change requests."))
      .finally(() => setLoading(false));
  }, [projectId, statusFilter]);

  const handleWithdraw = async (id) => {
    setActioning(true);
    try {
      await withdrawChangeRequest(projectId, id);
      setActionTarget(null);
      setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: "WITHDRAWN" } : r));
    } catch {
      setError("Withdraw failed.");
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async (id) => {
    setActioning(true);
    try {
      await deleteChangeRequest(projectId, id);
      setActionTarget(null);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Delete failed.");
    } finally {
      setActioning(false);
    }
  };

  const fmtCurrency = (n) => n != null ? `$${Number(n).toLocaleString()}` : "—";

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Change Requests</h1>
            <p className="text-gray-400 text-sm mt-1">Project scope, cost, and schedule changes</p>
          </div>
          {projectId && (
            <button onClick={() => router.push(`/ChangeRequests/Add?projectId=${projectId}`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              + New CR
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative">
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 [&_option]:bg-gray-700 appearance-none pr-8">
              <option value="">Select project…</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.projectName ?? p.name ?? p.id}</option>)}
            </select>
          </div>
          {["", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
              {s || "All"}
            </button>
          ))}
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(summary.counts ?? {}).map(([k, v]) => (
              <div key={k} className="bg-gray-800 border border-gray-700 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{v}</div>
                <div className="text-xs text-gray-400 mt-1">{k}</div>
              </div>
            ))}
            {summary.totalApprovedCostImpact != null && (
              <div className="bg-green-900/20 border border-green-800/40 rounded-xl p-3 text-center col-span-2 md:col-span-4">
                <div className="text-sm text-gray-400">Total Approved Cost Impact</div>
                <div className="text-xl font-bold text-green-400">{fmtCurrency(summary.totalApprovedCostImpact)}</div>
              </div>
            )}
          </div>
        )}

        {error && <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No change requests found.</div>
        ) : (
          <div className="space-y-3">
            {items.map((cr) => (
              <div key={cr.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-blue-400">{cr.code}</span>
                    <span className="font-semibold truncate">{cr.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${STATUS_STYLES[cr.status] ?? "bg-gray-700 text-gray-400"}`}>{cr.status}</span>
                    {cr.impactType && <span className={`text-xs px-2 py-0.5 rounded font-mono ${IMPACT_STYLES[cr.impactType] ?? ""}`}>{cr.impactType}</span>}
                  </div>
                  {cr.description && <p className="text-sm text-gray-400 truncate">{cr.description}</p>}
                  <div className="flex gap-4 mt-1 text-xs text-gray-500 font-mono">
                    {cr.costImpact != null && <span>Cost: {fmtCurrency(cr.costImpact)}</span>}
                    {cr.scheduleDays != null && <span>Schedule: {cr.scheduleDays}d</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => router.push(`/ChangeRequests/Edit/${cr.id}?projectId=${projectId}`)}
                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    {cr.status === "PENDING" ? "Review" : "View"}
                  </button>
                  {cr.status === "PENDING" && (
                    <button onClick={() => setActionTarget({ type: "withdraw", id: cr.id })}
                      className="px-3 py-1.5 text-xs bg-yellow-900/30 hover:bg-yellow-900/50 text-yellow-300 rounded-lg transition-colors">
                      Withdraw
                    </button>
                  )}
                  <button onClick={() => setActionTarget({ type: "delete", id: cr.id })}
                    className="px-3 py-1.5 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {actionTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2">{actionTarget.type === "delete" ? "Delete" : "Withdraw"} Change Request?</h3>
            <p className="text-sm text-gray-400 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => actionTarget.type === "delete" ? handleDelete(actionTarget.id) : handleWithdraw(actionTarget.id)}
                disabled={actioning}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium disabled:opacity-50">
                {actioning ? "Processing…" : "Confirm"}
              </button>
              <button onClick={() => setActionTarget(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
