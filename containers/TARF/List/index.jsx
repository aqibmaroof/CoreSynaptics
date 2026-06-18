"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getTARFs,
  approveTARF,
  rejectTARF,
  signInTARF,
  signOutTARF,
  deleteTARF,
} from "@/services/TARF";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

const TABS = ["All", "Pending", "Approved", "On Site", "Expired"];

/* ── Light-theme status palette ─────────────────────────────────────────────
   Each status maps to an --rf-* token; the badge is a soft tint of that token. */
const STATUS_TOKEN = {
  Pending: "var(--rf-yellow)",
  Approved: "var(--rf-accent)",
  "On Site": "var(--rf-green)",
  Expired: "var(--rf-red)",
  Rejected: "var(--rf-txt3)",
  "Signed Out": "var(--rf-purple)",
};

const statusStyle = (status) => {
  const t = STATUS_TOKEN[status] || STATUS_TOKEN.Rejected;
  return {
    background: `color-mix(in srgb, ${t} 14%, transparent)`,
    border: `1px solid color-mix(in srgb, ${t} 32%, transparent)`,
    color: t,
  };
};

/* Shared surfaces */
const CARD = {
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border2)",
};
const actionBtn = {
  background: "var(--rf-bg3)",
  border: "1px solid var(--rf-border2)",
};

function getTARFStatus(tarf) {
  const now = new Date();
  const end = tarf.expectedEnd ? new Date(tarf.expectedEnd) : null;
  if (!tarf.approved) return tarf.rejected ? "Rejected" : "Pending";
  if (tarf.isExpired || (end && end < now)) return "Expired";
  if (tarf.isActiveSession) return "On Site";
  if (tarf.signedInAt && tarf.signedOutAt) return "Signed Out";
  if (tarf.signedInAt && !tarf.signedOutAt) return "On Site";
  return "Approved";
}

function isExpired(tarf) {
  if (tarf.isExpired) return true;
  if (!tarf.expectedEnd) return false;
  return new Date(tarf.expectedEnd) < new Date();
}

export default function TARFList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete, canApprove } = useUserPermissions();
  const [tarfs, setTARFs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTARFs();
  }, []);
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchTARFs = async () => {
    try {
      setLoading(true);
      const res = await getTARFs();
      setTARFs(Array.isArray(res) ? res : res?.data || []);
      setError("");
    } catch {
      setError("Failed to load TARF entries");
    } finally {
      setLoading(false);
    }
  };

  const withAction = async (fn, successMsg) => {
    setActionLoading(true);
    try {
      await fn();
      setMessage({ type: "success", text: successMsg });
      await fetchTARFs();
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Action failed" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = (id) =>
    withAction(() => approveTARF(id), "TARF approved — access granted");

  const handleReject = async () => {
    if (!rejectModal) return;
    await withAction(
      () => rejectTARF(rejectModal, { reason: rejectReason }),
      "TARF rejected",
    );
    setRejectModal(null);
    setRejectReason("");
  };

  const handleSignIn = (id) =>
    withAction(() => signInTARF(id), "Signed in successfully");

  const handleSignOut = (id) =>
    withAction(() => signOutTARF(id), "Signed out successfully");

  const handleDelete = async (id) => {
    await withAction(() => deleteTARF(id), "TARF request deleted");
    setDeleteConfirm(null);
  };

  const filtered = tarfs.filter((t) => {
    const status = getTARFStatus(t);
    const matchTab =
      activeTab === "All" ||
      (activeTab === "Pending" && status === "Pending") ||
      (activeTab === "Approved" && status === "Approved") ||
      (activeTab === "On Site" && status === "On Site") ||
      (activeTab === "Expired" && status === "Expired");
    const matchSearch =
      !searchTerm ||
      (t.personName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.roleOnSite || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = {
    total: tarfs.length,
    pending: tarfs.filter((t) => getTARFStatus(t) === "Pending").length,
    onSite: tarfs.filter((t) => getTARFStatus(t) === "On Site").length,
    approved: tarfs.filter((t) => getTARFStatus(t) === "Approved").length,
    expired: tarfs.filter((t) => getTARFStatus(t) === "Expired").length,
  };

  return (
    <div className="p-6">
      <div className="mx-auto">
        {/* Toast */}
        {message && (
          <div
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
            style={
              message.type === "success"
                ? {
                    background:
                      "color-mix(in srgb, var(--rf-green) 14%, var(--rf-bg2))",
                    border:
                      "1px solid color-mix(in srgb, var(--rf-green) 32%, transparent)",
                    color: "var(--rf-green)",
                  }
                : {
                    background:
                      "color-mix(in srgb, var(--rf-red) 14%, var(--rf-bg2))",
                    border:
                      "1px solid color-mix(in srgb, var(--rf-red) 32%, transparent)",
                    color: "var(--rf-red)",
                  }
            }
          >
            {message.type === "success" ? (
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {message.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-start flex-wrap gap-3">
          <div>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ color: "var(--rf-txt)" }}
            >
              Site Access — TARF
            </h1>
            <p className="text-sm" style={{ color: "var(--rf-txt2)" }}>
              Trade Access Request Forms · Personnel sign-in/out tracking
            </p>
          </div>
          <button
            onClick={() => router.push("/TARF/Add")}
            // {...permissionProps(canCreate(MODULE.COMMISSIONING_TESTS), "create a TARF")}
            className="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg"
            style={{ background: "var(--rf-accent)", color: "var(--rf-bg2)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--rf-accent2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--rf-accent)")
            }
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
            New TARF Request
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total, color: "var(--rf-txt)" },
            {
              label: "Pending",
              value: stats.pending,
              color: "var(--rf-yellow)",
            },
            {
              label: "Approved",
              value: stats.approved,
              color: "var(--rf-accent)",
            },
            {
              label: "On Site",
              value: stats.onSite,
              color: "var(--rf-green)",
            },
            {
              label: "Expired",
              value: stats.expired,
              color: "var(--rf-red)",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4" style={CARD}>
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

        {/* Tabs + Search */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div
            className="flex rounded-lg overflow-hidden"
            style={CARD}
          >
            {TABS.map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                  style={
                    active
                      ? { background: "var(--rf-accent)", color: "var(--rf-bg2)" }
                      : { background: "transparent", color: "var(--rf-txt2)" }
                  }
                >
                  {tab}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            placeholder="Search by name, company, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[220px] max-w-sm px-4 py-2 rounded-lg text-sm outline-none placeholder-gray-500"
            style={{
              background: "var(--rf-bg2)",
              color: "var(--rf-txt)",
              boxShadow: "inset 0 0 0 1px var(--rf-border2)",
            }}
          />
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
          <div className="rounded-xl overflow-hidden" style={CARD}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--rf-border2)",
                      background: "var(--rf-bg3)",
                    }}
                  >
                    {[
                      "Person",
                      "Company",
                      "Role on Site",
                      "Access Window",
                      "Safety",
                      "Status",
                      "Signed In",
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
                  {filtered.map((tarf) => {
                    const status = getTARFStatus(tarf);
                    const expired = isExpired(tarf);
                    return (
                      <tr
                        key={tarf.id}
                        className="transition-colors"
                        style={{
                          borderBottom: "1px solid var(--rf-border)",
                          background: expired
                            ? "color-mix(in srgb, var(--rf-red) 5%, transparent)"
                            : "transparent",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--rf-bg3)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = expired
                            ? "color-mix(in srgb, var(--rf-red) 5%, transparent)"
                            : "transparent")
                        }
                      >
                        {/* Person */}
                        <td className="px-5 py-4">
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--rf-txt)" }}
                          >
                            {tarf.personName}
                          </p>
                          {tarf.approvedAt && (
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: "var(--rf-txt3)" }}
                            >
                              Approved{" "}
                              {new Date(tarf.approvedAt).toLocaleDateString()}
                            </p>
                          )}
                        </td>

                        {/* Company */}
                        <td
                          className="px-5 py-4 text-sm whitespace-nowrap"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {tarf.companyName || "—"}
                        </td>

                        {/* Role */}
                        <td
                          className="px-5 py-4 text-sm"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {tarf.roleOnSite || "—"}
                        </td>

                        {/* Access Window */}
                        <td className="px-5 py-4 text-sm whitespace-nowrap">
                          <span
                            style={{
                              color: expired
                                ? "var(--rf-red)"
                                : "var(--rf-txt2)",
                            }}
                          >
                            {tarf.expectedStart
                              ? new Date(
                                  tarf.expectedStart,
                                ).toLocaleDateString()
                              : "—"}
                            {" → "}
                            {tarf.expectedEnd
                              ? new Date(tarf.expectedEnd).toLocaleDateString()
                              : "—"}
                          </span>
                          {expired && (
                            <span
                              className="ml-1.5 text-[10px] uppercase font-bold"
                              style={{ color: "var(--rf-red)" }}
                            >
                              expired
                            </span>
                          )}
                        </td>

                        {/* Safety Orientation */}
                        <td className="px-5 py-4">
                          {tarf.safetyOrientationComplete ? (
                            <span
                              className="flex items-center gap-1 text-xs font-medium"
                              style={{ color: "var(--rf-green)" }}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Complete
                            </span>
                          ) : (
                            <span
                              className="flex items-center gap-1 text-xs font-medium"
                              style={{ color: "var(--rf-red)" }}
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Pending
                            </span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={statusStyle(status)}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Sign-in time */}
                        <td
                          className="px-5 py-4 text-xs whitespace-nowrap"
                          style={{ color: "var(--rf-txt3)" }}
                        >
                          {tarf.signedInAt
                            ? new Date(tarf.signedInAt).toLocaleString()
                            : "—"}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {status === "Pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(tarf.id)}
                                  disabled={actionLoading}
                                  className="text-[11px] px-2 py-0.5 rounded disabled:opacity-40"
                                  style={{
                                    ...actionBtn,
                                    color: "var(--rf-green)",
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectModal(tarf.id)}
                                  className="text-[11px] px-2 py-0.5 rounded"
                                  style={{
                                    ...actionBtn,
                                    color: "var(--rf-red)",
                                  }}
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(tarf.id)}
                                  className="text-[11px] px-2 py-0.5 rounded"
                                  style={{
                                    ...actionBtn,
                                    color: "var(--rf-txt3)",
                                  }}
                                >
                                  Delete
                                </button>
                              </>
                            )}

                            {status === "Approved" && (
                              <button
                                onClick={() => handleSignIn(tarf.id)}
                                disabled={
                                  !tarf.safetyOrientationComplete ||
                                  actionLoading
                                }
                                title={
                                  !tarf.safetyOrientationComplete
                                    ? "Safety orientation must be complete before sign-in"
                                    : ""
                                }
                                className="text-[11px] px-2 py-0.5 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                  ...actionBtn,
                                  color: "var(--rf-accent)",
                                }}
                              >
                                Sign In
                              </button>
                            )}

                            {status === "On Site" && (
                              <button
                                onClick={() => handleSignOut(tarf.id)}
                                disabled={actionLoading}
                                className="text-[11px] px-2 py-0.5 rounded disabled:opacity-40"
                                style={{
                                  ...actionBtn,
                                  color: "var(--rf-purple)",
                                }}
                              >
                                Sign Out
                              </button>
                            )}

                            {(status === "Approved" ||
                              status === "Pending") && (
                              <button
                                onClick={() =>
                                  router.push(`/TARF/Edit/${tarf.id}`)
                                }
                                className="text-[11px] px-2 py-0.5 rounded"
                                style={{
                                  ...actionBtn,
                                  color: "var(--rf-txt2)",
                                }}
                              >
                                Edit
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
                        className="text-center py-14"
                        style={{ color: "var(--rf-txt3)" }}
                      >
                        No TARF entries found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
              className="rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
              style={CARD}
            >
              <h3
                className="font-bold mb-2"
                style={{ color: "var(--rf-txt)" }}
              >
                Delete TARF Request?
              </h3>
              <p
                className="text-sm mb-6"
                style={{ color: "var(--rf-txt2)" }}
              >
                This action cannot be undone. Only pending requests can be
                deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-lg text-sm"
                  style={{
                    border: "1px solid var(--rf-border2)",
                    color: "var(--rf-txt2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: "var(--rf-red)", color: "var(--rf-bg2)" }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div
              className="rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              style={CARD}
            >
              <h3
                className="font-bold text-lg mb-1"
                style={{ color: "var(--rf-txt)" }}
              >
                Reject TARF Request
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: "var(--rf-txt2)" }}
              >
                Provide a reason for rejection. This will be recorded for audit
                purposes.
              </p>
              <div className="mb-5">
                <label
                  className="block text-xs font-bold mb-2 uppercase"
                  style={{ color: "var(--rf-txt2)" }}
                >
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Reason for rejecting access..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none resize-none placeholder-gray-500"
                  style={{
                    background: "var(--rf-bg2)",
                    color: "var(--rf-txt)",
                    boxShadow: "inset 0 0 0 1px var(--rf-border2)",
                  }}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  className="px-5 py-2.5 rounded-lg text-sm"
                  style={{
                    border: "1px solid var(--rf-border2)",
                    color: "var(--rf-txt2)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                  style={{ background: "var(--rf-red)", color: "var(--rf-bg2)" }}
                >
                  {actionLoading ? "Rejecting..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
