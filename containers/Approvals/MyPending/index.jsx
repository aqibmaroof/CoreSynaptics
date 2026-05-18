"use client";

// ── Phase 5 PR-2: My pending approvals queue ─────────────────────────────────
// Caller's open ACTIVE steps across all chains. The "Pending GC review" tab
// from HTML L5417 is this list filtered by entityType=Communication.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  myPendingApprovals,
  decideApprovalStep,
  APPROVAL_STEP_BADGE,
} from "@/services/Approvals";
import { useRealtimeSocket } from "@/lib/realtime/useRealtimeSocket";
import { onEnvelope } from "@/lib/realtime/envelope";

export default function MyPendingApprovals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [busyId, setBusyId] = useState(null);
  const socket = useRealtimeSocket();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await myPendingApprovals();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live invalidation
  useEffect(() => {
    if (!socket) return;
    const offs = [
      "approval.step.activated",
      "approval.granted",
      "approval.rejected",
      "approval.delegated",
      "approval.escalated",
    ].map((ev) => onEnvelope(socket, ev, () => refresh()));
    return () => offs.forEach((off) => off());
  }, [socket, refresh]);

  const entityTypes = useMemo(() => {
    const set = new Set();
    rows.forEach((r) => set.add(r.chain?.entityType || ""));
    return [...set].filter(Boolean).sort();
  }, [rows]);

  const filtered = useMemo(
    () =>
      entityFilter
        ? rows.filter((r) => r.chain?.entityType === entityFilter)
        : rows,
    [rows, entityFilter]
  );

  const decide = async (step, decision) => {
    setBusyId(step.id);
    try {
      await decideApprovalStep(step.chainId, step.id, { decision });
      await refresh();
    } catch (e) {
      setError(e?.message || "Decision failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--rf-txt)",
          }}
        >
          My Pending Approvals
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Steps assigned to you (directly, by role, by company, or via
          delegation).
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          className="rf-input"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="">All entity types</option>
          {entityTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          Nothing waiting on you.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Step</th>
                <th style={th}>Entity</th>
                <th style={th}>Chain</th>
                <th style={th}>Due</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const badge =
                  APPROVAL_STEP_BADGE[s.status] || APPROVAL_STEP_BADGE.ACTIVE;
                return (
                  <tr
                    key={s.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div
                        style={{ fontSize: 11, color: "var(--rf-txt3)" }}
                      >
                        Step {s.order + 1}
                        {s.isParallel ? " · parallel" : ""}
                      </div>
                    </td>
                    <td style={td}>
                      <div>{s.chain?.entityType}</div>
                      <div
                        style={{ fontSize: 11, color: "var(--rf-txt3)" }}
                      >
                        {s.chain?.entityId?.slice(0, 8) ?? ""}
                      </div>
                    </td>
                    <td style={td}>
                      <div
                        style={{ fontSize: 11, color: "var(--rf-txt3)" }}
                      >
                        {s.chain?.status}
                      </div>
                      {s.chain?.cxProjectId && (
                        <div
                          style={{
                            fontSize: 10,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          Project · {s.chain.cxProjectId.slice(0, 8)}
                        </div>
                      )}
                    </td>
                    <td style={td}>
                      {s.dueAt
                        ? new Date(s.dueAt).toLocaleString()
                        : "—"}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <button
                        className="rf-btn rf-btn-primary"
                        disabled={busyId === s.id}
                        onClick={() => decide(s, "APPROVE")}
                        style={{ marginRight: 6 }}
                      >
                        Approve
                      </button>
                      <button
                        className="rf-btn"
                        disabled={busyId === s.id}
                        onClick={() => decide(s, "REJECT")}
                        style={{ color: "var(--rf-red)" }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--rf-txt3)",
  letterSpacing: 0.04,
};
const td = {
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--rf-txt)",
};
