"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  listCommunications,
  sendCommunication,
  acknowledgeCommunication,
  closeCommunication,
  reopenCommunication,
  deleteCommunication,
} from "@/services/Communications";

function toArray(res) {
  return Array.isArray(res) ? res : (res?.data ?? []);
}

const TYPES = [
  "FORMAL_LETTER",
  "RFI",
  "TRANSMITTAL",
  "SUBMITTAL",
  "CHANGE_ORDER",
  "MEETING_MINUTES",
];

const STATES = ["DRAFT", "SENT", "ACKNOWLEDGED", "CLOSED"];

const TYPE_LABEL = {
  FORMAL_LETTER: "Letter",
  RFI: "RFI",
  TRANSMITTAL: "Transmittal",
  SUBMITTAL: "Submittal",
  CHANGE_ORDER: "Change Order",
  MEETING_MINUTES: "Meeting Minutes",
};

const STATE_STYLES = {
  DRAFT: "bg-gray-700 text-gray-300",
  SENT: "bg-blue-900/50 text-blue-300",
  ACKNOWLEDGED: "bg-yellow-900/40 text-yellow-300",
  CLOSED: "bg-green-900/40 text-green-400",
};

const TYPE_STYLES = {
  FORMAL_LETTER: "bg-gray-700 text-gray-300",
  RFI: "bg-blue-900/40 text-blue-300",
  TRANSMITTAL: "bg-purple-900/40 text-purple-300",
  SUBMITTAL: "bg-orange-900/40 text-orange-300",
  CHANGE_ORDER: "bg-red-900/40 text-red-300",
  MEETING_MINUTES: "bg-teal-900/40 text-teal-300",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function CommunicationsList() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [actioning, setActioning] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const params = { page, limit: 20 };
    if (typeFilter) params.commType = typeFilter;
    if (stateFilter) params.state = stateFilter;
    listCommunications(params)
      .then((res) => {
        setItems(toArray(res));
        setTotal(res?.total ?? 0);
      })
      .catch(() => setError("Failed to load communications."))
      .finally(() => setLoading(false));
  }, [page, typeFilter, stateFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const resetPage = () => setPage(1);

  const handleAction = async () => {
    if (!confirm) return;
    setActioning(true);
    try {
      if (confirm.action === "send") await sendCommunication(confirm.id);
      else if (confirm.action === "acknowledge")
        await acknowledgeCommunication(confirm.id);
      else if (confirm.action === "close") await closeCommunication(confirm.id);
      else if (confirm.action === "reopen")
        await reopenCommunication(confirm.id);
      else if (confirm.action === "delete")
        await deleteCommunication(confirm.id);
      setConfirm(null);
      load();
    } catch {
      setError(`Action failed.`);
    } finally {
      setActioning(false);
    }
  };

  const totalPages = Math.ceil(total / 20) || 1;

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Communications</h1>
            <p className="text-gray-400 text-sm mt-1">
              RFIs, transmittals, submittals, letters &amp; more
            </p>
          </div>
          <button
            onClick={() => router.push("/Communications/Add")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            + New
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex gap-1 flex-wrap">
            {["", ...TYPES].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTypeFilter(t);
                  resetPage();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === t ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                {t ? TYPE_LABEL[t] : "All Types"}
              </button>
            ))}
          </div>
          <div className="w-px bg-gray-700 mx-1" />
          <div className="flex gap-1 flex-wrap">
            {["", ...STATES].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStateFilter(s);
                  resetPage();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${stateFilter === s ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
              >
                {s || "All States"}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No communications found.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((c) => (
              <div
                key={c.id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-gray-400">
                      {c.commNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono ${TYPE_STYLES[c.commType] ?? "bg-gray-700 text-gray-400"}`}
                    >
                      {TYPE_LABEL[c.commType] ?? c.commType}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono ${STATE_STYLES[c.state] ?? "bg-gray-700 text-gray-400"}`}
                    >
                      {c.state}
                    </span>
                    {c.isOverdue && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-900/60 text-red-300 font-mono">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  <p className="font-semibold truncate">{c.subject}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500 font-mono flex-wrap">
                    <span>From: {c.fromCompanyCode}</span>
                    {c.toCompanyCode && <span>To: {c.toCompanyCode}</span>}
                    {c.slaDeadline && (
                      <span>SLA: {fmtDate(c.slaDeadline)}</span>
                    )}
                    {c.daysOpen != null && <span>{c.daysOpen}d open</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <button
                    onClick={() => router.push(`/Communications/${c.id}`)}
                    className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  {c.state === "DRAFT" && (
                    <>
                      <button
                        onClick={() =>
                          setConfirm({
                            action: "send",
                            id: c.id,
                            label: "Send",
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 rounded-lg transition-colors"
                      >
                        Send
                      </button>
                      <button
                        onClick={() =>
                          setConfirm({
                            action: "delete",
                            id: c.id,
                            label: "Delete",
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {c.state === "SENT" && (
                    <>
                      <button
                        onClick={() =>
                          setConfirm({
                            action: "acknowledge",
                            id: c.id,
                            label: "Acknowledge",
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-yellow-900/40 hover:bg-yellow-900/60 text-yellow-300 rounded-lg transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button
                        onClick={() =>
                          setConfirm({
                            action: "close",
                            id: c.id,
                            label: "Close",
                          })
                        }
                        className="px-3 py-1.5 text-xs bg-green-900/40 hover:bg-green-900/60 text-green-300 rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </>
                  )}
                  {c.state === "ACKNOWLEDGED" && (
                    <button
                      onClick={() =>
                        setConfirm({
                          action: "close",
                          id: c.id,
                          label: "Close",
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-green-900/40 hover:bg-green-900/60 text-green-300 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  )}
                  {c.state === "CLOSED" && (
                    <button
                      onClick={() =>
                        setConfirm({
                          action: "reopen",
                          id: c.id,
                          label: "Reopen",
                        })
                      }
                      className="px-3 py-1.5 text-xs bg-orange-900/40 hover:bg-orange-900/60 text-orange-300 rounded-lg transition-colors"
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-3 mt-6 justify-center">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2">
              {confirm.label} Communication?
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              This will update the communication state.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleAction}
                disabled={actioning}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {actioning ? "Processing…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
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
