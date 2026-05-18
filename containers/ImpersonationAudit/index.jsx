"use client";

// ── Phase v15 D: Impersonation audit ───────────────────────────────────────
// Read-only audit of impersonation sessions. End-of-session is server-driven;
// UI just renders the trail.

import { useCallback, useEffect, useState } from "react";
import { listImpersonationAudit } from "@/services/Impersonation";

export default function ImpersonationAuditView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listImpersonationAudit();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load audit");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const filtered = rows.filter((r) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      String(r.actorUserId || "").toLowerCase().includes(q) ||
      String(r.targetUserId || "").toLowerCase().includes(q) ||
      String(r.reason || "").toLowerCase().includes(q)
    );
  });

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
            Impersonation audit
          </h1>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            All persona-switches with start/end timestamps and reason.
          </div>
        </div>
        <input
          className="rf-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by user / reason"
          style={{ marginLeft: "auto", minWidth: 260 }}
        />
        <button className="rf-btn" onClick={reload} disabled={loading}>
          ⟳ Refresh
        </button>
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
        {loading && rows.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)" }}>No audit rows.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Actor</th>
                <th style={th}>Target</th>
                <th style={th}>Started</th>
                <th style={th}>Ended</th>
                <th style={th}>Duration</th>
                <th style={th}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const dur =
                  r.startedAt && r.endedAt
                    ? Math.round(
                        (new Date(r.endedAt) - new Date(r.startedAt)) / 60000
                      )
                    : null;
                return (
                  <tr
                    key={r.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {String(r.actorUserId || "").slice(0, 10)}
                    </td>
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {String(r.targetUserId || "").slice(0, 10)}
                    </td>
                    <td style={td}>
                      {r.startedAt
                        ? new Date(r.startedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td style={td}>
                      {r.endedAt ? (
                        new Date(r.endedAt).toLocaleString()
                      ) : (
                        <span
                          style={{
                            padding: "1px 6px",
                            fontSize: 10,
                            fontWeight: 700,
                            borderRadius: 4,
                            background: "rgba(245,158,11,0.16)",
                            color: "var(--rf-yellow, #f59e0b)",
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        ...td,
                        fontFamily: "monospace",
                        fontSize: 11,
                      }}
                    >
                      {dur != null ? `${dur}m` : "—"}
                    </td>
                    <td style={{ ...td, color: "var(--rf-txt2)" }}>
                      {r.reason || "—"}
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
