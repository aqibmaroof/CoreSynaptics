"use client";

// ── Phase v15 B5: Cross-company checklist delegations overview ──────────────
// Surface every delegation across checklists. SLA cron escalates overdue rows
// every 10 minutes — UI just renders the current status set.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  listDelegations,
  acceptDelegation,
  completeDelegation,
  cancelDelegation,
  DELEGATION_STATUS_STYLE,
  DELEGATION_STATUSES,
} from "@/services/ChecklistDelegation";

export default function ChecklistDelegationsView({ currentUserId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [busy, setBusy] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listDelegations();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load delegations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = rows.filter((r) =>
    filter === "ALL" ? true : r.status === filter
  );

  const act = async (id, fn) => {
    setBusy(id);
    try {
      await fn(id);
      await reload();
    } catch (e) {
      setError(e?.message || "Action failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <header
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
            Checklist delegations
          </h1>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            Cross-company checklist hand-offs. SLA escalations run every 10
            minutes server-side.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            className={`rf-btn ${filter === "ALL" ? "rf-btn-primary" : ""}`}
            onClick={() => setFilter("ALL")}
            style={{ fontSize: 11 }}
          >
            All ({rows.length})
          </button>
          {DELEGATION_STATUSES.map((s) => {
            const n = rows.filter((r) => r.status === s).length;
            return (
              <button
                key={s}
                className={`rf-btn ${filter === s ? "rf-btn-primary" : ""}`}
                onClick={() => setFilter(s)}
                style={{ fontSize: 11 }}
              >
                {s} ({n})
              </button>
            );
          })}
          <button className="rf-btn" onClick={reload} disabled={loading}>
            ⟳
          </button>
        </div>
      </header>

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

      <section className="rf-card" style={{ padding: 12, overflowX: "auto" }}>
        {loading && filtered.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)" }}>No delegations match.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Status</th>
                <th style={th}>Checklist</th>
                <th style={th}>From → To</th>
                <th style={th}>Due</th>
                <th style={th}>Message</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
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
                  <tr
                    key={r.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
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
                    </td>
                    <td style={td}>
                      <Link
                        href={`/CheckList/Edit/${r.checklistId}`}
                        style={{ color: "var(--rf-blue, #3b82f6)" }}
                      >
                        {String(r.checklistId).slice(0, 8)}
                      </Link>
                    </td>
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {String(r.fromUserId || "").slice(0, 8)} →{" "}
                      {String(r.toCompanyId || "").slice(0, 8)}
                      {r.toUserId
                        ? `/${String(r.toUserId).slice(0, 6)}`
                        : ""}
                    </td>
                    <td style={td}>
                      {r.dueAt ? new Date(r.dueAt).toLocaleString() : "—"}
                    </td>
                    <td style={{ ...td, color: "var(--rf-txt2)" }}>
                      {r.message ? String(r.message).slice(0, 80) : "—"}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 4 }}>
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
                                  window.prompt(
                                    "Completion notes (optional)"
                                  ) || undefined
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
                                  window.prompt("Reason (optional)") ||
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}

const th = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "8px 10px", fontSize: 12, color: "var(--rf-txt)" };
