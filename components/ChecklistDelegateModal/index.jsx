"use client";

// ── Phase v15 B5: Cross-company checklist delegation modal ──────────────────
// Server enforces: one active delegation per checklist. UI surfaces 409s.

import { useState } from "react";
import { delegateChecklist } from "@/services/ChecklistDelegation";

export default function ChecklistDelegateModal({
  open,
  onClose,
  checklistId,
  onCreated,
}) {
  const [toCompanyId, setToCompanyId] = useState("");
  const [toUserId, setToUserId] = useState("");
  const [message, setMessage] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!toCompanyId) {
      setError("Target company is required");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await delegateChecklist(checklistId, {
        toCompanyId,
        toUserId: toUserId || undefined,
        message: message || undefined,
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      onCreated?.(created);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Delegation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 999,
        display: "grid",
        placeItems: "center",
      }}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="rf-card"
        style={{
          width: 460,
          maxWidth: "92vw",
          padding: 18,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          Delegate this checklist
        </div>
        <label style={lbl}>
          To company ID
          <input
            className="rf-input"
            value={toCompanyId}
            onChange={(e) => setToCompanyId(e.target.value)}
            required
          />
        </label>
        <label style={lbl}>
          To user ID (optional)
          <input
            className="rf-input"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            placeholder="If unset, any user in the company can accept"
          />
        </label>
        <label style={lbl}>
          Message
          <textarea
            className="rf-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </label>
        <label style={lbl}>
          Due at (optional)
          <input
            className="rf-input"
            type="datetime-local"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
          />
        </label>
        {error && (
          <div
            style={{
              padding: 8,
              background: "rgba(239,68,68,0.12)",
              color: "var(--rf-red)",
              borderRadius: 6,
              fontSize: 12,
            }}
          >
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="rf-btn"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rf-btn rf-btn-primary"
            disabled={busy}
          >
            {busy ? "Delegating…" : "Delegate"}
          </button>
        </div>
      </form>
    </div>
  );
}

const lbl = {
  display: "grid",
  gap: 4,
  fontSize: 12,
  color: "var(--rf-txt2)",
};
