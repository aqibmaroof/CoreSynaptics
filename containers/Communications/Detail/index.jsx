"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getCommunication,
  updateCommunication,
  sendCommunication,
  acknowledgeCommunication,
  closeCommunication,
  reopenCommunication,
} from "@/services/Communications";

const TYPE_LABEL = {
  FORMAL_LETTER: "Formal Letter",
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

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const inputCls =
  "w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function CommunicationsDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [comm, setComm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit state (DRAFT only)
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Action state
  const [confirm, setConfirm] = useState(null);
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCommunication(id)
      .then((res) => setComm(res?.data ?? res))
      .catch(() => setError("Failed to load communication."))
      .finally(() => setLoading(false));
  }, [id]);

  const startEdit = () => {
    setEditForm({
      subject: comm.subject ?? "",
      body: comm.body ?? "",
      toCompanyCode: comm.toCompanyCode ?? "",
      audienceLabel: comm.audienceLabel ?? "",
    });
    setSaveError("");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateCommunication(id, {
        subject: editForm.subject.trim() || undefined,
        body: editForm.body.trim() || undefined,
        toCompanyCode: editForm.toCompanyCode.trim() || undefined,
        audienceLabel: editForm.audienceLabel.trim() || undefined,
      });
      setComm(updated?.data ?? updated);
      setEditing(false);
    } catch (err) {
      setSaveError(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async () => {
    if (!confirm) return;
    setActioning(true);
    try {
      let updated;
      if (confirm === "send") updated = await sendCommunication(id);
      else if (confirm === "acknowledge") updated = await acknowledgeCommunication(id);
      else if (confirm === "close") updated = await closeCommunication(id);
      else if (confirm === "reopen") updated = await reopenCommunication(id);
      setComm(updated?.data ?? updated ?? comm);
      setConfirm(null);
    } catch {
      setError("Action failed.");
    } finally {
      setActioning(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen text-white flex items-center justify-center p-6 text-gray-400">Loading…</div>
    );
  if (error)
    return (
      <div className="min-h-screen text-white p-6 text-red-300">{error}</div>
    );
  if (!comm) return null;

  const isDraft = comm.state === "DRAFT";
  const isSent = comm.state === "SENT";
  const isAcknowledged = comm.state === "ACKNOWLEDGED";
  const isClosed = comm.state === "CLOSED";

  return (
    <div className="min-h-screen text-white p-6">
      <div className="mx-auto">
        <button
          onClick={() => router.push("/Communications")}
          className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1"
        >
          ← Communications
        </button>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-sm text-gray-400">
                {comm.commNumber}
              </span>
              <span className="text-gray-500">·</span>
              <span className="text-sm text-gray-400">
                {TYPE_LABEL[comm.commType] ?? comm.commType}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono ${STATE_STYLES[comm.state] ?? "bg-gray-700 text-gray-400"}`}
              >
                {comm.state}
              </span>
              {comm.isOverdue && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-900/60 text-red-300 font-mono">
                  OVERDUE
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold">{comm.subject}</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isDraft && !editing && (
              <button
                onClick={startEdit}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Edit
              </button>
            )}
            {isDraft && (
              <button
                onClick={() => setConfirm("send")}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Send
              </button>
            )}
            {isSent && (
              <>
                <button
                  onClick={() => setConfirm("acknowledge")}
                  className="px-4 py-2 text-sm bg-yellow-700 hover:bg-yellow-600 rounded-lg transition-colors"
                >
                  Acknowledge
                </button>
                <button
                  onClick={() => setConfirm("close")}
                  className="px-4 py-2 text-sm bg-green-700 hover:bg-green-600 rounded-lg transition-colors"
                >
                  Close
                </button>
              </>
            )}
            {isAcknowledged && (
              <button
                onClick={() => setConfirm("close")}
                className="px-4 py-2 text-sm bg-green-700 hover:bg-green-600 rounded-lg transition-colors"
              >
                Close
              </button>
            )}
            {isClosed && (
              <button
                onClick={() => setConfirm("reopen")}
                className="px-4 py-2 text-sm bg-orange-700 hover:bg-orange-600 rounded-lg transition-colors"
              >
                Reopen
              </button>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            ["From", comm.fromCompanyCode],
            ["To", comm.toCompanyCode || "—"],
            ["SLA Deadline", fmtDate(comm.slaDeadline)],
            [
              "Days Open",
              comm.daysOpen != null ? `${comm.daysOpen} days` : "—",
            ],
            ["Sent", fmtDate(comm.sentAt)],
            ["Closed", fmtDate(comm.closedAt)],
            ["Created", fmtDate(comm.createdAt)],
            ["Updated", fmtDate(comm.updatedAt)],
          ].map(([label, val]) => (
            <div
              key={label}
              className="bg-gray-800 border border-gray-700 rounded-xl p-3"
            >
              <div className="text-xs text-gray-500 mb-1">{label}</div>
              <div className="text-sm font-medium truncate">{val}</div>
            </div>
          ))}
        </div>

        {comm.audienceLabel && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 mb-4">
            <div className="text-xs text-gray-500 mb-1">Audience</div>
            <div className="text-sm">{comm.audienceLabel}</div>
          </div>
        )}

        {/* Body / Edit */}
        {editing ? (
          <div className="space-y-4 bg-gray-800 border border-gray-700 rounded-xl p-4">
            {saveError && (
              <div className="p-3 bg-red-900/40 border border-red-700/40 rounded-lg text-red-300 text-sm">
                {saveError}
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Subject
              </label>
              <input
                className={inputCls}
                value={editForm.subject}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, subject: e.target.value }))
                }
                maxLength={200}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Body</label>
              <textarea
                className={`${inputCls} resize-none`}
                rows={8}
                value={editForm.body}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, body: e.target.value }))
                }
                maxLength={10000}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  To Company Code
                </label>
                <input
                  className={inputCls}
                  value={editForm.toCompanyCode}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      toCompanyCode: e.target.value,
                    }))
                  }
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Audience Label
                </label>
                <input
                  className={inputCls}
                  value={editForm.audienceLabel}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      audienceLabel: e.target.value,
                    }))
                  }
                  maxLength={200}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="text-xs text-gray-500 mb-2">Body</div>
            <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans leading-relaxed">
              {comm.body}
            </pre>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-2 capitalize">
              {confirm} Communication?
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
