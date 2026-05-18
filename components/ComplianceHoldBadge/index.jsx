"use client";

// ── Phase 14 PR-2: Compliance hold badge ─────────────────────────────────────
// Shows active holds on the entity + admin-only "Place hold" action. The
// badge is hidden when there are no active holds AND no error to display.
// "Is entity held?" is determined server-side — the badge never computes it
// from other state.

import { useCallback, useEffect, useState } from "react";
import {
  listComplianceHolds,
  placeComplianceHold,
  releaseComplianceHold,
  COMPLIANCE_HOLD_KINDS,
  HOLD_STATUS_STYLE,
} from "@/services/Governance";

export default function ComplianceHoldBadge({
  entityType,
  entityId,
  cxProjectId,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [showPlace, setShowPlace] = useState(false);
  const [draft, setDraft] = useState({
    kind: "LEGAL",
    reason: "",
    externalCaseRef: "",
    releaseApprovalChainId: "",
    expiresAt: "",
  });

  const refresh = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await listComplianceHolds({
        entityType,
        entityId,
        status: "ACTIVE",
        limit: 50,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load holds");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!entityType || !entityId) return null;
  // Always show the "Place hold" affordance even if no active holds exist.
  // The button is admin-gated server-side; here we just expose it.

  const place = async () => {
    if (!draft.reason.trim()) return;
    setBusyId("__new");
    try {
      await placeComplianceHold({
        entityType,
        entityId,
        cxProjectId: cxProjectId || undefined,
        kind: draft.kind,
        reason: draft.reason.trim(),
        externalCaseRef: draft.externalCaseRef || undefined,
        releaseApprovalChainId: draft.releaseApprovalChainId || undefined,
        expiresAt: draft.expiresAt
          ? new Date(draft.expiresAt).toISOString()
          : undefined,
      });
      setShowPlace(false);
      setDraft({
        kind: "LEGAL",
        reason: "",
        externalCaseRef: "",
        releaseApprovalChainId: "",
        expiresAt: "",
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Place failed");
    } finally {
      setBusyId(null);
    }
  };

  const release = async (h) => {
    const reason = window.prompt("Release reason?");
    if (!reason) return;
    setBusyId(h.id);
    try {
      await releaseComplianceHold(h.id, reason);
      await refresh();
    } catch (e) {
      setError(e?.message || "Release failed");
    } finally {
      setBusyId(null);
    }
  };

  const count = rows.length;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            background: count
              ? "rgba(239,68,68,0.16)"
              : "var(--rf-bg3)",
            color: count ? "var(--rf-red)" : "var(--rf-txt3)",
            border: 0,
            cursor: "pointer",
          }}
        >
          {count
            ? `Compliance hold · ${count}`
            : "No active holds"}{" "}
          {open ? "▾" : "▸"}
        </button>
        <button
          type="button"
          className="rf-btn"
          onClick={() => setShowPlace(true)}
          style={{ fontSize: 11 }}
        >
          + Place hold
        </button>
      </div>

      {open && (
        <div
          className="rf-card"
          style={{ padding: 10, minWidth: 360, maxWidth: 520 }}
        >
          {error && (
            <div
              style={{
                padding: 8,
                background: "rgba(239,68,68,0.12)",
                color: "var(--rf-red)",
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              {error}
            </div>
          )}
          {loading && rows.length === 0 ? (
            <div style={{ color: "var(--rf-txt3)", fontSize: 12 }}>
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div style={{ color: "var(--rf-txt3)", fontSize: 12 }}>
              No active holds.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rows.map((h) => {
                const sty =
                  HOLD_STATUS_STYLE[h.status] || HOLD_STATUS_STYLE.ACTIVE;
                return (
                  <li
                    key={h.id}
                    style={{
                      padding: 8,
                      borderTop: "1px solid var(--rf-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          padding: "1px 6px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: sty.bg,
                          color: sty.color,
                        }}
                      >
                        {h.status}
                      </span>
                      <span
                        style={{
                          padding: "1px 6px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: "var(--rf-bg3)",
                          color: "var(--rf-txt3)",
                        }}
                      >
                        {h.kind}
                      </span>
                    </div>
                    <div style={{ fontSize: 13 }}>{h.reason}</div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        marginTop: 2,
                      }}
                    >
                      placed{" "}
                      {h.placedAt
                        ? new Date(h.placedAt).toLocaleString()
                        : "—"}
                      {h.expiresAt
                        ? ` · expires ${new Date(h.expiresAt).toLocaleDateString()}`
                        : ""}
                      {h.externalCaseRef
                        ? ` · case ${h.externalCaseRef}`
                        : ""}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <button
                        className="rf-btn"
                        disabled={busyId === h.id}
                        onClick={() => release(h)}
                        title={
                          h.releaseApprovalChainId
                            ? `Release requires chain ${h.releaseApprovalChainId.slice(0, 8)}… APPROVED`
                            : undefined
                        }
                      >
                        Release
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {showPlace && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setShowPlace(false)}
        >
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 540, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Place compliance hold
            </h2>
            <div
              style={{
                fontSize: 12,
                color: "var(--rf-txt3)",
                marginBottom: 12,
              }}
            >
              {entityType} · {String(entityId).slice(0, 12)}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <Field label="Kind">
                <select
                  className="rf-input"
                  value={draft.kind}
                  onChange={(e) =>
                    setDraft({ ...draft, kind: e.target.value })
                  }
                >
                  {COMPLIANCE_HOLD_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Expires (optional)">
                <input
                  className="rf-input"
                  type="datetime-local"
                  value={draft.expiresAt}
                  onChange={(e) =>
                    setDraft({ ...draft, expiresAt: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Reason (required)">
              <textarea
                className="rf-input"
                rows={3}
                value={draft.reason}
                onChange={(e) =>
                  setDraft({ ...draft, reason: e.target.value })
                }
              />
            </Field>
            <Field label="External case ref (optional)">
              <input
                className="rf-input"
                value={draft.externalCaseRef}
                onChange={(e) =>
                  setDraft({ ...draft, externalCaseRef: e.target.value })
                }
              />
            </Field>
            <Field label="Release approval chain id (optional)">
              <input
                className="rf-input"
                value={draft.releaseApprovalChainId}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    releaseApprovalChainId: e.target.value,
                  })
                }
                placeholder="If set, release requires this chain APPROVED"
              />
            </Field>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button
                className="rf-btn"
                onClick={() => setShowPlace(false)}
                disabled={busyId === "__new"}
              >
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={place}
                disabled={busyId === "__new" || !draft.reason.trim()}
              >
                Place hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--rf-txt3)",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
