"use client";

// ── Phase v15 B5: Checklist delegation history side-strip ───────────────────
// Show active + historical delegations on a checklist. Allow accept/complete/
// cancel where the server permits the action; surface 4xx inline.

import { useCallback, useEffect, useState } from "react";
import {
  listDelegations,
  acceptDelegation,
  completeDelegation,
  cancelDelegation,
  DELEGATION_STATUS_STYLE,
} from "@/services/ChecklistDelegation";

export default function ChecklistDelegationHistory({ checklistId, currentUserId, onChange }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);

  const reload = useCallback(async () => {
    if (!checklistId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await listDelegations(checklistId);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load delegations");
    } finally {
      setLoading(false);
    }
  }, [checklistId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const act = async (id, fn) => {
    setBusy(id);
    setError("");
    try {
      await fn(id);
      await reload();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--rf-txt2)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
          marginBottom: 10,
        }}
      >
        Delegations
      </div>
      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}
      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No delegations yet.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((r) => {
            const sty =
              DELEGATION_STATUS_STYLE[r.status] || {
                color: "var(--rf-txt2)",
                bg: "var(--rf-bg3)",
              };
            const canAccept =
              r.status === "PENDING" &&
              (!r.toUserId || r.toUserId === currentUserId);
            const canComplete =
              r.status === "ACCEPTED" &&
              (!r.toUserId || r.toUserId === currentUserId);
            const canCancel =
              ["PENDING", "ACCEPTED"].includes(r.status) &&
              r.fromUserId === currentUserId;
            return (
              <li
                key={r.id}
                style={{
                  padding: 8,
                  borderTop: "1px solid var(--rf-border)",
                  fontSize: 12,
                  display: "grid",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexWrap: "wrap",
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
                    {r.status}
                  </span>
                  {r.dueAt && (
                    <span style={{ color: "var(--rf-txt3)" }}>
                      due {new Date(r.dueAt).toLocaleString()}
                    </span>
                  )}
                  <span
                    style={{
                      marginLeft: "auto",
                      color: "var(--rf-txt3)",
                      fontFamily: "monospace",
                      fontSize: 10,
                    }}
                  >
                    {String(r.id).slice(0, 8)}
                  </span>
                </div>
                <div style={{ color: "var(--rf-txt3)" }}>
                  → {r.toCompanyId} {r.toUserId ? `· user ${String(r.toUserId).slice(0, 8)}` : ""}
                </div>
                {r.message && <div>{r.message}</div>}
                {(canAccept || canComplete || canCancel) && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {canAccept && (
                      <button
                        className="rf-btn rf-btn-primary"
                        onClick={() => act(r.id, acceptDelegation)}
                        disabled={busy === r.id}
                        style={{ fontSize: 11 }}
                      >
                        Accept
                      </button>
                    )}
                    {canComplete && (
                      <button
                        className="rf-btn"
                        onClick={() =>
                          act(r.id, (id) =>
                            completeDelegation(
                              id,
                              window.prompt("Completion notes (optional)") ||
                                undefined
                            )
                          )
                        }
                        disabled={busy === r.id}
                        style={{ fontSize: 11 }}
                      >
                        Complete
                      </button>
                    )}
                    {canCancel && (
                      <button
                        className="rf-btn"
                        onClick={() =>
                          act(r.id, (id) =>
                            cancelDelegation(
                              id,
                              window.prompt("Cancellation reason (optional)") ||
                                undefined
                            )
                          )
                        }
                        disabled={busy === r.id}
                        style={{ fontSize: 11 }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
