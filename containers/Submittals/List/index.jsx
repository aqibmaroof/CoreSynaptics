"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getSubmittals,
  deleteSubmittal,
  submitSubmittal,
  startReview,
  approveSubmittal,
  rejectSubmittal,
  reviseSubmittal,
  resubmitSubmittal,
} from "@/services/Submittals";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

const STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "REVISE_RESUBMIT",
  "VOID",
];
const TYPES = [
  "SHOP_DRAWING",
  "PRODUCT_DATA",
  "SAMPLE",
  "OPERATION_MAINTENANCE",
  "CLOSEOUT",
  "TEST_REPORT",
  "OTHER",
];

const STATUS_LABELS = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVISE_RESUBMIT: "Revise & Resubmit",
  VOID: "Void",
};

const TYPE_LABELS = {
  SHOP_DRAWING: "Shop Drawing",
  PRODUCT_DATA: "Product Data",
  SAMPLE: "Sample",
  OPERATION_MAINTENANCE: "O&M",
  CLOSEOUT: "Closeout",
  TEST_REPORT: "Test Report",
  OTHER: "Other",
};

// Maps each status to an rf token for the badge color.
const STATUS_TOKENS = {
  DRAFT: "var(--rf-txt3)",
  SUBMITTED: "var(--rf-accent)",
  UNDER_REVIEW: "var(--rf-yellow)",
  APPROVED: "var(--rf-green)",
  REJECTED: "var(--rf-red)",
  REVISE_RESUBMIT: "var(--rf-yellow)",
  VOID: "var(--rf-txt3)",
};

// Token-based badge style: tinted bg + token text + tinted border.
function statusBadgeStyle(status) {
  const token = STATUS_TOKENS[status] ?? "var(--rf-txt3)";
  return {
    background: `color-mix(in srgb, ${token} 14%, transparent)`,
    color: token,
    border: `1px solid color-mix(in srgb, ${token} 32%, transparent)`,
  };
}

function getAvailableActions(sub) {
  const s = sub.status;
  const actions = [];
  if (s === "DRAFT")
    actions.push({ key: "submit", label: "Submit", color: "var(--rf-accent)" });
  if (s === "SUBMITTED")
    actions.push({
      key: "start-review",
      label: "Start Review",
      color: "var(--rf-yellow)",
    });
  if (s === "UNDER_REVIEW") {
    actions.push({ key: "approve", label: "Approve", color: "var(--rf-green)" });
    actions.push({ key: "revise", label: "Revise", color: "var(--rf-yellow)" });
    actions.push({ key: "reject", label: "Reject", color: "var(--rf-red)" });
  }
  if (s === "REJECTED" || s === "REVISE_RESUBMIT") {
    actions.push({
      key: "resubmit",
      label: "Resubmit",
      color: "var(--rf-accent)",
    });
  }
  return actions;
}

export default function SubmittalsList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete: canDeletePerm, canApprove } = useUserPermissions();
  const [submittals, setSubmittals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { id, action, submittal }
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubmittals();
  }, []);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchSubmittals = async () => {
    try {
      setLoading(true);
      const res = await getSubmittals();
      setSubmittals(Array.isArray(res) ? res : (res?.data ?? []));
      setError("");
    } catch {
      setError("Failed to load submittals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubmittal(id);
      setSubmittals((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
      setMessage({ type: "success", text: "Submittal deleted" });
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Failed to delete" });
    }
  };

  const handleWorkflowAction = async () => {
    if (!actionModal) return;
    const { id, action } = actionModal;

    // Validate required notes
    if ((action === "reject" || action === "revise") && !actionNotes.trim())
      return;

    setActionLoading(true);
    try {
      if (action === "submit") await submitSubmittal(id);
      else if (action === "start-review") await startReview(id);
      else if (action === "approve")
        await approveSubmittal(id, { comment: actionNotes });
      else if (action === "reject")
        await rejectSubmittal(id, { reason: actionNotes });
      else if (action === "revise")
        await reviseSubmittal(id, { comment: actionNotes });
      else if (action === "resubmit") await resubmitSubmittal(id, actionNotes);

      const actionLabel = STATUS_LABELS[action] ?? action;
      setMessage({
        type: "success",
        text: `Submittal ${actionLabel.toLowerCase()} successful`,
      });
      setActionModal(null);
      setActionNotes("");
      await fetchSubmittals();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || `Failed to ${action}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const isOverdue = (sub) => {
    if (!sub.dueDate) return false;
    if (sub.status === "APPROVED" || sub.status === "VOID") return false;
    return new Date(sub.dueDate) < new Date();
  };

  const filtered = submittals.filter((s) => {
    const matchSearch =
      (s.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.submittalNumber || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (s.specSection || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !filterStatus || s.status === filterStatus;
    const matchType = !filterType || s.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  // Stats from real status values
  const stats = {
    total: submittals.length,
    draft: submittals.filter((s) => s.status === "DRAFT").length,
    underReview: submittals.filter((s) => s.status === "UNDER_REVIEW").length,
    approved: submittals.filter((s) => s.status === "APPROVED").length,
    overdue: submittals.filter(isOverdue).length,
  };

  const needsNote =
    actionModal?.action === "reject" || actionModal?.action === "revise";

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* Toast */}
        {message && (
          <div
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm"
            style={
              message.type === "success"
                ? {
                    background:
                      "color-mix(in srgb, var(--rf-green) 14%, transparent)",
                    color: "var(--rf-green)",
                    border:
                      "1px solid color-mix(in srgb, var(--rf-green) 32%, transparent)",
                  }
                : {
                    background:
                      "color-mix(in srgb, var(--rf-red) 14%, transparent)",
                    color: "var(--rf-red)",
                    border:
                      "1px solid color-mix(in srgb, var(--rf-red) 32%, transparent)",
                  }
            }
          >
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "var(--rf-txt)" }}
            >
              Submittals
            </h1>
            <p style={{ color: "var(--rf-txt2)" }}>
              Manage technical documentation submissions and approvals
            </p>
          </div>
          {(
            <button
              onClick={() => router.push("/Submittals/Add")}
              {...permissionProps(canCreate(MODULE.SUBMITTALS), "create a submittal")}
              className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
              style={{ background: "var(--rf-accent)", color: "#fff" }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Submittal
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "var(--rf-txt)" },
            { label: "Draft", value: stats.draft, color: "var(--rf-txt2)" },
            {
              label: "Under Review",
              value: stats.underReview,
              color: "var(--rf-yellow)",
            },
            {
              label: "Approved",
              value: stats.approved,
              color: "var(--rf-green)",
            },
            { label: "Overdue", value: stats.overdue, color: "var(--rf-red)" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              <p
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--rf-txt3)" }}
              >
                {s.label}
              </p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: s.color }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title, number, spec section…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] max-w-md px-4 py-2.5 rounded-lg placeholder-gray-500 focus:outline-none text-sm"
            style={{
              background: "var(--rf-bg2)",
              color: "var(--rf-txt)",
              boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
            }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              background: "var(--rf-bg2)",
              color: "var(--rf-txt)",
              boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
            }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-lg text-sm focus:outline-none"
            style={{
              background: "var(--rf-bg2)",
              color: "var(--rf-txt)",
              boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
            }}
          >
            <option value="">All Types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-6 rounded-lg p-4 text-sm"
            style={{
              background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
              color: "var(--rf-red)",
            }}
          >
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{
                borderColor: "var(--rf-accent)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border2)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b"
                    style={{ borderColor: "var(--rf-border2)" }}
                  >
                    {[
                      "#",
                      "Title",
                      "Type",
                      "Spec Section",
                      "Status",
                      "Due Date",
                      "Rev",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "var(--rf-txt2)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub) => {
                    const overdue = isOverdue(sub);
                    const actions = getAvailableActions(sub);
                    const rowDeletable =
                      sub.status !== "APPROVED" && sub.status !== "VOID";
                    return (
                      <tr
                        key={sub.id}
                        className="border-b transition-colors"
                        style={{
                          borderColor: "var(--rf-border)",
                          background: overdue
                            ? "color-mix(in srgb, var(--rf-red) 6%, transparent)"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--rf-bg3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = overdue
                            ? "color-mix(in srgb, var(--rf-red) 6%, transparent)"
                            : "transparent";
                        }}
                      >
                        <td
                          className="px-5 py-4 font-mono text-sm font-medium whitespace-nowrap"
                          style={{ color: "var(--rf-accent)" }}
                        >
                          {sub.submittalNumber}
                        </td>
                        <td
                          className="px-5 py-4 text-sm max-w-[200px] truncate"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {sub.title}
                        </td>
                        <td
                          className="px-5 py-4 text-sm whitespace-nowrap"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {TYPE_LABELS[sub.type] ?? sub.type ?? "—"}
                        </td>
                        <td
                          className="px-5 py-4 text-sm"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {sub.specSection || "—"}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={statusBadgeStyle(sub.status)}
                          >
                            {STATUS_LABELS[sub.status] ?? sub.status}
                          </span>
                        </td>
                        <td
                          className="px-5 py-4 text-sm whitespace-nowrap"
                          style={{
                            color: overdue ? "var(--rf-red)" : "var(--rf-txt2)",
                            fontWeight: overdue ? 500 : undefined,
                          }}
                        >
                          {sub.dueDate
                            ? new Date(sub.dueDate).toLocaleDateString()
                            : "—"}
                          {overdue && (
                            <span
                              className="ml-1 text-[10px] uppercase"
                              style={{ color: "var(--rf-red)" }}
                            >
                              overdue
                            </span>
                          )}
                        </td>
                        <td
                          className="px-5 py-4 text-sm font-mono"
                          style={{ color: "var(--rf-txt3)" }}
                        >
                          {sub.currentRevision ?? 0}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {actions
                              .filter((a) => {
                                // Approve/reject actions require approve perm; others require edit.
                                const isApprove = a.key === "approve" || a.key === "reject";
                                return isApprove
                                  ? canApprove(MODULE.SUBMITTALS)
                                  : canEdit(MODULE.SUBMITTALS);
                              })
                              .map((a) => (
                                <button
                                  key={a.key}
                                  onClick={() =>
                                    setActionModal({
                                      id: sub.id,
                                      action: a.key,
                                      submittal: sub,
                                    })
                                  }
                                  className="hover:opacity-80 text-[11px] px-2 py-0.5 rounded whitespace-nowrap"
                                  style={{
                                    color: a.color,
                                    background: "var(--rf-bg3)",
                                  }}
                                >
                                  {a.label}
                                </button>
                              ))}
                            {canEdit(MODULE.SUBMITTALS) && (
                              <button
                                onClick={() =>
                                  router.push(`/Submittals/Edit/${sub.id}`)
                                }
                                className="hover:opacity-80 text-[11px] px-2 py-0.5 rounded"
                                style={{
                                  color: "var(--rf-accent)",
                                  background: "var(--rf-bg3)",
                                }}
                              >
                                Edit
                              </button>
                            )}
                            {canDeletePerm(MODULE.SUBMITTALS) && rowDeletable && (
                              <button
                                onClick={() => setDeleteConfirm(sub.id)}
                                className="hover:opacity-80 text-[11px] px-2 py-0.5 rounded"
                                style={{
                                  color: "var(--rf-red)",
                                  background: "var(--rf-bg3)",
                                }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-12"
                        style={{ color: "var(--rf-txt3)" }}
                      >
                        No submittals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div
              className="rounded-xl p-6 max-w-sm w-full"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              <h3
                className="font-bold mb-2"
                style={{ color: "var(--rf-txt)" }}
              >
                Delete Submittal?
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--rf-txt2)" }}>
                Approved submittals cannot be deleted. This is a soft delete.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt)",
                    border: "1px solid var(--rf-border2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{ background: "var(--rf-red)", color: "#fff" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Workflow Action Modal */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div
              className="rounded-xl p-6 max-w-md w-full"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border2)",
              }}
            >
              <h3
                className="font-bold text-lg mb-1 capitalize"
                style={{ color: "var(--rf-txt)" }}
              >
                {actionModal.action === "start-review"
                  ? "Start Review"
                  : actionModal.action}{" "}
                Submittal
              </h3>
              <p className="text-sm mb-4" style={{ color: "var(--rf-txt2)" }}>
                <span
                  className="font-mono"
                  style={{ color: "var(--rf-accent)" }}
                >
                  {actionModal.submittal?.submittalNumber}
                </span>
                {" — "}
                {actionModal.submittal?.title}
              </p>

              {(needsNote ||
                actionModal.action === "resubmit" ||
                actionModal.action === "approve") && (
                <div className="mb-6">
                  <label
                    className="block text-xs font-bold mb-2 uppercase"
                    style={{ color: "var(--rf-txt2)" }}
                  >
                    {actionModal.action === "reject"
                      ? "Rejection Reason *"
                      : actionModal.action === "revise"
                        ? "Revision Comment *"
                        : actionModal.action === "resubmit"
                          ? "Resubmit Note (optional)"
                          : "Approval Comment (optional)"}
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg text-sm focus:outline-none resize-none"
                    style={{
                      background: "var(--rf-bg2)",
                      color: "var(--rf-txt)",
                      boxShadow: "inset 0 0 0 1px var(--rf-border3, #8daacf)",
                    }}
                    placeholder={
                      actionModal.action === "reject"
                        ? "Reason for rejection…"
                        : actionModal.action === "revise"
                          ? "What needs to be revised…"
                          : "Notes…"
                    }
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setActionModal(null);
                    setActionNotes("");
                  }}
                  className="px-5 py-2.5 rounded-lg text-sm"
                  style={{
                    background: "var(--rf-bg3)",
                    color: "var(--rf-txt)",
                    border: "1px solid var(--rf-border2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleWorkflowAction}
                  disabled={actionLoading || (needsNote && !actionNotes.trim())}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{
                    color: "#fff",
                    background:
                      actionModal.action === "reject"
                        ? "var(--rf-red)"
                        : actionModal.action === "approve"
                          ? "var(--rf-green)"
                          : actionModal.action === "revise"
                            ? "var(--rf-yellow)"
                            : actionModal.action === "start-review"
                              ? "var(--rf-yellow)"
                              : "var(--rf-accent)",
                  }}
                >
                  {actionLoading ? "Processing…" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
