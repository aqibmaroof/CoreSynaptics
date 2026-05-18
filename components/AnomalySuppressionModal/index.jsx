"use client";

// ── Phase v15 D: Anomaly suppression modal ─────────────────────────────────
// Server accepts 1m–30d. Don't preview wall-clock expiry — let server
// compute `expiresAt` and surface it on reload.

import { useState } from "react";
import { createSuppression } from "@/services/AnomalySuppressions";

const PRESETS = [
  { label: "15 min", min: 15 },
  { label: "1 hour", min: 60 },
  { label: "8 hours", min: 480 },
  { label: "1 day", min: 1440 },
  { label: "7 days", min: 7 * 1440 },
  { label: "30 days", min: 30 * 1440 },
];

export default function AnomalySuppressionModal({
  open,
  onClose,
  kind,
  fingerprint,
  onCreated,
}) {
  const [minutes, setMinutes] = useState(60);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!kind || !fingerprint) {
      setError("Missing anomaly fingerprint");
      return;
    }
    if (minutes < 1 || minutes > 30 * 1440) {
      setError("Duration must be between 1 minute and 30 days");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const created = await createSuppression({
        kind,
        fingerprint,
        minutes,
        reason: reason || undefined,
      });
      onCreated?.(created);
      onClose?.();
    } catch (err) {
      setError(err?.message || "Suppression failed");
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
        <div style={{ fontSize: 14, fontWeight: 700 }}>Suppress anomaly</div>
        <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          Detection keeps running — UI surfacing is what&apos;s silenced. After
          the window, the fingerprint re-surfaces automatically.
        </div>
        <div style={{ fontSize: 12 }}>
          <strong>{kind}</strong>{" "}
          <span style={{ fontFamily: "monospace", color: "var(--rf-txt3)" }}>
            {fingerprint}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRESETS.map((p) => (
            <button
              type="button"
              key={p.label}
              className={`rf-btn ${minutes === p.min ? "rf-btn-primary" : ""}`}
              onClick={() => setMinutes(p.min)}
              style={{ fontSize: 11 }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label style={lbl}>
          Custom minutes (1 – 43200)
          <input
            className="rf-input"
            type="number"
            min={1}
            max={30 * 1440}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value) || 0)}
          />
        </label>
        <label style={lbl}>
          Reason
          <textarea
            className="rf-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. known maintenance window, accepted drift"
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
          <button type="button" className="rf-btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="submit" className="rf-btn rf-btn-primary" disabled={busy}>
            {busy ? "Suppressing…" : "Suppress"}
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
