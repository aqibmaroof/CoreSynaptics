"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  listChangeRequests,
  getChangeRequestSummary,
  deleteChangeRequest,
  withdrawChangeRequest,
} from "@/services/ChangeRequests";
import { listCxProjects } from "@/services/ProjectWizard";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

const softBg = (token, pct = 16) =>
  `color-mix(in srgb, ${token} ${pct}%, transparent)`;

const NEUTRAL_BADGE = { background: "var(--rf-bg4)", color: "var(--rf-txt2)" };

const STATUS_STYLES = {
  PENDING: {
    background: softBg("var(--rf-yellow)"),
    color: "var(--rf-yellow)",
  },
  APPROVED: { background: softBg("var(--rf-green)"), color: "var(--rf-green)" },
  REJECTED: { background: softBg("var(--rf-red)"), color: "var(--rf-red)" },
  WITHDRAWN: NEUTRAL_BADGE,
};

const IMPACT_STYLES = {
  COST: { background: softBg("var(--rf-accent)"), color: "var(--rf-accent)" },
  SCHEDULE: {
    background: softBg("var(--rf-purple)"),
    color: "var(--rf-purple)",
  },
  BOTH: { background: softBg("var(--rf-orange)"), color: "var(--rf-orange)" },
  NONE: NEUTRAL_BADGE,
};

const BTN_WITHDRAW = {
  background: softBg("var(--rf-yellow)", 18),
  color: "var(--rf-yellow)",
};
const BTN_DELETE = {
  background: softBg("var(--rf-red)", 18),
  color: "var(--rf-red)",
};

export default function ChangeRequestList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = useUserPermissions();
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
      listChangeRequests(
        projectId,
        statusFilter ? { status: statusFilter } : {},
      ),
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
      setItems((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "WITHDRAWN" } : r)),
      );
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

  const fmtCurrency = (n) =>
    n != null ? `$${Number(n).toLocaleString()}` : "—";

  return (
    <div className="min-h-screen p-6" style={{ color: "var(--rf-txt)" }}>
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Change Requests</h1>
            <p className="text-sm mt-1" style={{ color: "var(--rf-txt2)" }}>
              Project scope, cost, and schedule changes
            </p>
          </div>
          {projectId && (
            <button
              onClick={() =>
                router.push(`/ChangeRequests/Add?projectId=${projectId}`)
              }
              {...permissionProps(
                canCreate(MODULE.PROJECTS),
                "create a change request",
              )}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)]"
            >
              + New CR
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm focus:outline-none appearance-none pr-8 bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] focus:border-[var(--rf-accent)] [&_option]:bg-[var(--rf-bg2)]"
            >
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName ?? p.name ?? p.id}
                </option>
              ))}
            </select>
          </div>
          {["", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? "bg-[var(--rf-accent)] text-white" : "bg-[var(--rf-bg3)] text-[var(--rf-txt2)] hover:bg-[var(--rf-bg4)]"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(summary.counts ?? {}).map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl p-3 text-center bg-[var(--rf-bg2)] border border-[var(--rf-border2)]"
              >
                <div className="text-2xl font-bold">{v}</div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  {k}
                </div>
              </div>
            ))}
            {summary.totalApprovedCostImpact != null && (
              <div
                className="rounded-xl p-3 text-center col-span-2 md:col-span-4"
                style={{
                  background: softBg("var(--rf-green)", 12),
                  border: `1px solid ${softBg("var(--rf-green)", 40)}`,
                }}
              >
                <div className="text-sm" style={{ color: "var(--rf-txt2)" }}>
                  Total Approved Cost Impact
                </div>
                <div
                  className="text-xl font-bold"
                  style={{ color: "var(--rf-green)" }}
                >
                  {fmtCurrency(summary.totalApprovedCostImpact)}
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              background: softBg("var(--rf-red)", 14),
              border: `1px solid ${softBg("var(--rf-red)", 40)}`,
              color: "var(--rf-red)",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div
            className="text-center py-16"
            style={{ color: "var(--rf-txt2)" }}
          >
            Loading…
          </div>
        ) : items.length === 0 ? (
          <div
            className="text-center py-16"
            style={{ color: "var(--rf-txt3)" }}
          >
            No change requests found.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((cr) => (
              <div
                key={cr.id}
                className="rounded-xl p-4 flex items-start justify-between gap-4 bg-[var(--rf-bg2)] border border-[var(--rf-border2)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="font-mono text-xs"
                      style={{ color: "var(--rf-accent)" }}
                    >
                      {cr.code}
                    </span>
                    <span className="font-semibold truncate">{cr.title}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-mono"
                      style={STATUS_STYLES[cr.status] ?? NEUTRAL_BADGE}
                    >
                      {cr.status}
                    </span>
                    {cr.impactType && (
                      <span
                        className="text-xs px-2 py-0.5 rounded font-mono"
                        style={IMPACT_STYLES[cr.impactType] ?? NEUTRAL_BADGE}
                      >
                        {cr.impactType}
                      </span>
                    )}
                  </div>
                  {cr.description && (
                    <p
                      className="text-sm truncate"
                      style={{ color: "var(--rf-txt2)" }}
                    >
                      {cr.description}
                    </p>
                  )}
                  <div
                    className="flex gap-4 mt-1 text-xs font-mono"
                    style={{ color: "var(--rf-txt3)" }}
                  >
                    {cr.costImpact != null && (
                      <span>Cost: {fmtCurrency(cr.costImpact)}</span>
                    )}
                    {cr.scheduleDays != null && (
                      <span>Schedule: {cr.scheduleDays}d</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      router.push(
                        `/ChangeRequests/Edit/${cr.id}?projectId=${projectId}`,
                      )
                    }
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors bg-[var(--rf-bg3)] hover:bg-[var(--rf-bg4)] text-[var(--rf-txt)]"
                  >
                    {cr.status === "PENDING" ? "Review" : "View"}
                  </button>
                  {cr.status === "PENDING" && (
                    <button
                      onClick={() =>
                        setActionTarget({ type: "withdraw", id: cr.id })
                      }
                      {...permissionProps(
                        canEdit(MODULE.PROJECTS),
                        "withdraw change request",
                      )}
                      className="px-3 py-1.5 text-xs rounded-lg transition-opacity hover:opacity-80"
                      style={BTN_WITHDRAW}
                    >
                      Withdraw
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setActionTarget({ type: "delete", id: cr.id })
                    }
                    {...permissionProps(
                      canDelete(MODULE.PROJECTS),
                      "delete change request",
                    )}
                    className="px-3 py-1.5 text-xs rounded-lg transition-opacity hover:opacity-80"
                    style={BTN_DELETE}
                  >
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
          <div
            className="rounded-xl p-6 w-80 bg-[var(--rf-bg2)] border border-[var(--rf-border2)]"
            style={{ color: "var(--rf-txt)" }}
          >
            <h3 className="font-semibold mb-2">
              {actionTarget.type === "delete" ? "Delete" : "Withdraw"} Change
              Request?
            </h3>
            <p className="text-sm mb-4" style={{ color: "var(--rf-txt2)" }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  actionTarget.type === "delete"
                    ? handleDelete(actionTarget.id)
                    : handleWithdraw(actionTarget.id)
                }
                disabled={actioning}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 bg-[var(--rf-red)] hover:opacity-90"
              >
                {actioning ? "Processing…" : "Confirm"}
              </button>
              <button
                onClick={() => setActionTarget(null)}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--rf-bg3)] hover:bg-[var(--rf-bg4)] text-[var(--rf-txt)]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
