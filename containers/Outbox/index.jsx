"use client";

// ── Phase v15 D: Outbox dead-letter explorer ───────────────────────────────
// Platform-only screen. Replay re-queues an event with attempts=0 and
// consumedBy=[]. The drain action forces one dispatcher cycle and is reserved
// for incident response. UI exposes attempt history but never recomputes the
// dispatcher state itself.

import { useCallback, useEffect, useState } from "react";
import {
  outboxDeadLetter,
  outboxAttempts,
  outboxReplay,
  outboxDrain,
  OUTBOX_STATUS_STYLE,
} from "@/services/Outbox";

export default function OutboxDeadLetterExplorer() {
  const [limit, setLimit] = useState(50);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [busy, setBusy] = useState(null);
  const [drainResult, setDrainResult] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await outboxDeadLetter(limit);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load dead-letter outbox");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!selected) {
      setAttempts([]);
      return;
    }
    let cancelled = false;
    outboxAttempts(selected.id)
      .then((xs) => {
        if (cancelled) return;
        setAttempts(Array.isArray(xs) ? xs : xs?.items ?? []);
      })
      .catch((e) => !cancelled && setError(e?.message || "Failed to load attempts"));
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const replay = async (id) => {
    if (!confirm("Replay this event? It will run through every handler again.")) return;
    setBusy(id);
    setError("");
    try {
      await outboxReplay(id);
      await reload();
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      setError(e?.message || "Replay failed");
    } finally {
      setBusy(null);
    }
  };

  const drain = async () => {
    if (!confirm("Force one dispatcher cycle? Use for incident response only.")) return;
    setBusy("drain");
    setError("");
    try {
      const r = await outboxDrain();
      setDrainResult(r);
      await reload();
    } catch (e) {
      setError(e?.message || "Drain failed");
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
            Outbox · dead-letter
          </h1>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            Platform-only. Replay re-queues a single event; drain runs one
            dispatcher cycle.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <select
            className="rf-input"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value) || 50)}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
          </select>
          <button className="rf-btn" onClick={reload} disabled={loading}>
            ⟳ Refresh
          </button>
          <button
            className="rf-btn rf-btn-primary"
            onClick={drain}
            disabled={busy === "drain"}
          >
            {busy === "drain" ? "Draining…" : "Force drain"}
          </button>
        </div>
      </header>

      {drainResult && (
        <div
          style={{
            padding: 10,
            background: "var(--rf-bg2)",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "monospace",
          }}
        >
          drain result · claimed {drainResult.claimed} · delivered{" "}
          {drainResult.delivered} · retried {drainResult.retried} · dead{" "}
          {drainResult.dead}
        </div>
      )}

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: selected ? "1.4fr 1fr" : "1fr",
          gap: 14,
        }}
      >
        <section className="rf-card" style={{ padding: 12 }}>
          {loading && rows.length === 0 ? (
            <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
          ) : rows.length === 0 ? (
            <div style={{ color: "var(--rf-txt3)" }}>
              No dead-letter events 🎉
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--rf-bg2)" }}>
                  <th style={th}>Event type</th>
                  <th style={th}>Aggregate</th>
                  <th style={{ ...th, textAlign: "right" }}>Attempts</th>
                  <th style={th}>Last error</th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const sty =
                    OUTBOX_STATUS_STYLE[r.status] ||
                    { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" };
                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelected(r)}
                      style={{
                        borderTop: "1px solid var(--rf-border)",
                        cursor: "pointer",
                        background:
                          selected?.id === r.id ? "var(--rf-bg2)" : undefined,
                      }}
                    >
                      <td style={td}>
                        <code style={{ fontSize: 11 }}>{r.eventType}</code>
                      </td>
                      <td style={{ ...td, fontFamily: "monospace", fontSize: 11 }}>
                        {String(r.aggregateId || "").slice(0, 8)}
                      </td>
                      <td
                        style={{ ...td, textAlign: "right", fontFamily: "monospace" }}
                      >
                        {r.attempts ?? 0}
                      </td>
                      <td style={{ ...td, color: "var(--rf-red)", fontSize: 11 }}>
                        {r.lastError ? String(r.lastError).slice(0, 80) : "—"}
                      </td>
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
                        <button
                          className="rf-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            replay(r.id);
                          }}
                          disabled={busy === r.id}
                          style={{ fontSize: 11 }}
                        >
                          Replay
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>

        {selected && (
          <aside className="rf-card" style={{ padding: 14 }}>
            <header
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                Attempt history
              </div>
              <button
                className="rf-btn"
                onClick={() => setSelected(null)}
                style={{ marginLeft: "auto", fontSize: 11 }}
              >
                ✕
              </button>
            </header>
            <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginBottom: 8 }}>
              <code>{selected.eventType}</code> ·{" "}
              <span style={{ fontFamily: "monospace" }}>
                {String(selected.id).slice(0, 12)}
              </span>
            </div>
            {attempts.length === 0 ? (
              <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
                Loading attempts…
              </div>
            ) : (
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "grid",
                  gap: 6,
                }}
              >
                {attempts.map((a, i) => (
                  <li
                    key={a.id || i}
                    style={{
                      padding: 8,
                      background: "var(--rf-bg2)",
                      borderRadius: 6,
                      fontSize: 11,
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
                      <span style={{ fontFamily: "monospace" }}>
                        #{a.attemptNumber ?? i + 1}
                      </span>
                      <span style={{ color: "var(--rf-txt3)" }}>
                        {a.startedAt
                          ? new Date(a.startedAt).toLocaleString()
                          : ""}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          color:
                            a.outcome === "OK"
                              ? "var(--rf-green)"
                              : "var(--rf-red)",
                          fontWeight: 700,
                        }}
                      >
                        {a.outcome || (a.error ? "FAIL" : "OK")}
                      </span>
                    </div>
                    {a.error && (
                      <div
                        style={{
                          marginTop: 4,
                          color: "var(--rf-red)",
                          fontFamily: "monospace",
                        }}
                      >
                        {a.error}
                      </div>
                    )}
                    {a.consumer && (
                      <div style={{ marginTop: 2, color: "var(--rf-txt3)" }}>
                        consumer · {a.consumer}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </aside>
        )}
      </div>
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
