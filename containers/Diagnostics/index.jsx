"use client";

// ── Phase 6 PR-2: Event diagnostics ──────────────────────────────────────────
// Org-admin facing. Tabs: Failure inbox · Throughput · Failures (listener) ·
// Slow spans · Trace lookup. Platform users see all orgs; org admins see only
// their org (server-enforced).

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getDeadLetters,
  getEventThroughput,
  getTrace,
  getFailures,
  getSlowSpans,
  DEAD_LETTER_GROUPS,
  TRACE_SPAN_STATUS_STYLE,
} from "@/services/EventLog";

export default function Diagnostics() {
  const [tab, setTab] = useState("deadLetters");
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
          Diagnostics
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Failure inbox, event throughput, and trace lookup. Org-scoped by
          default.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          ["deadLetters", "Failure inbox"],
          ["throughput", "Throughput"],
          ["failures", "Listener failures"],
          ["slowSpans", "Slow spans"],
          ["trace", "Trace lookup"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`rf-btn ${tab === k ? "rf-btn-primary" : ""}`}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "deadLetters" && <DeadLetters />}
      {tab === "throughput" && <Throughput />}
      {tab === "failures" && <Failures />}
      {tab === "slowSpans" && <SlowSpans />}
      {tab === "trace" && <TraceLookup />}
    </div>
  );
}

// ─── Failure inbox ───────────────────────────────────────────────────────────
function DeadLetters() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sinceHours, setSinceHours] = useState(24);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const since = new Date(Date.now() - sinceHours * 3600_000).toISOString();
      const res = await getDeadLetters({ since, limit: 100 });
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [sinceHours]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <>
      <Toolbar>
        <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          Since (hours)
        </label>
        <input
          type="number"
          className="rf-input"
          style={{ width: 100 }}
          value={sinceHours}
          min={1}
          onChange={(e) => setSinceHours(Math.max(1, Number(e.target.value) || 24))}
        />
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </Toolbar>

      <ErrorBanner error={error} />

      {!data ? (
        <div style={{ color: "var(--rf-txt3)" }}>
          {loading ? "Loading…" : "No data."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {DEAD_LETTER_GROUPS.map(({ key, label }) => {
            const rows = data[key] ?? [];
            return (
              <div
                key={key}
                className="rf-card"
                style={{ padding: 0, overflow: "hidden" }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--rf-border)",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    ({rows.length})
                  </span>
                </div>
                {rows.length === 0 ? (
                  <div
                    style={{ padding: 14, color: "var(--rf-txt3)", fontSize: 13 }}
                  >
                    None.
                  </div>
                ) : (
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {rows.map((r) => (
                      <li
                        key={`${r.kind}-${r.id}`}
                        style={{
                          padding: "10px 14px",
                          borderTop: "1px solid var(--rf-border)",
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            {r.eventName}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--rf-txt3)",
                              marginTop: 2,
                            }}
                          >
                            {new Date(r.at).toLocaleString()}
                            {r.attempts != null && ` · ×${r.attempts}`}
                            {" · ref "}
                            {String(r.ref).slice(0, 12)}
                          </div>
                          {r.error && (
                            <div
                              style={{
                                fontSize: 12,
                                color: "var(--rf-red)",
                                marginTop: 4,
                              }}
                            >
                              {r.error}
                            </div>
                          )}
                        </div>
                        {r.kind === "LISTENER" && (
                          <a
                            className="rf-btn"
                            href={`/Diagnostics?trace=${encodeURIComponent(r.ref)}`}
                          >
                            View trace
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Throughput ──────────────────────────────────────────────────────────────
function Throughput() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sinceHours, setSinceHours] = useState(1);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const since = new Date(Date.now() - sinceHours * 3600_000).toISOString();
      const res = await getEventThroughput({ since, limit: 50 });
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [sinceHours]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const max = useMemo(() => {
    if (!data?.eventCounts?.length) return 1;
    return Math.max(...data.eventCounts.map((r) => r.count));
  }, [data]);

  return (
    <>
      <Toolbar>
        <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          Since (hours)
        </label>
        <input
          type="number"
          className="rf-input"
          style={{ width: 100 }}
          value={sinceHours}
          min={1}
          onChange={(e) => setSinceHours(Math.max(1, Number(e.target.value) || 1))}
        />
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </Toolbar>

      <ErrorBanner error={error} />

      {!data ? (
        <div style={{ color: "var(--rf-txt3)" }}>
          {loading ? "Loading…" : "No data."}
        </div>
      ) : (data.eventCounts ?? []).length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>
          No events emitted in the window.
        </div>
      ) : (
        <div className="rf-card" style={{ padding: 14 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {data.eventCounts.map((r) => (
              <li
                key={r.eventName}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 220px 80px",
                  gap: 10,
                  alignItems: "center",
                  padding: "6px 0",
                  borderTop: "1px solid var(--rf-border)",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>
                  {r.eventName}
                </span>
                <div
                  style={{
                    background: "var(--rf-bg3)",
                    height: 8,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(r.count / max) * 100}%`,
                      background: "var(--rf-accent, #3b82f6)",
                      height: "100%",
                    }}
                  />
                </div>
                <span
                  style={{
                    textAlign: "right",
                    fontFamily: "monospace",
                    fontSize: 12,
                  }}
                >
                  {r.count.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

// ─── Listener failures ───────────────────────────────────────────────────────
function Failures() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sinceHours, setSinceHours] = useState(24);
  const [kindPrefix, setKindPrefix] = useState("listener:");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const since = new Date(Date.now() - sinceHours * 3600_000).toISOString();
      const xs = await getFailures({
        since,
        limit: 100,
        kindPrefix: kindPrefix || undefined,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [sinceHours, kindPrefix]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <Toolbar>
        <input
          className="rf-input"
          placeholder="kindPrefix"
          value={kindPrefix}
          onChange={(e) => setKindPrefix(e.target.value)}
        />
        <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          Since (hours)
        </label>
        <input
          type="number"
          className="rf-input"
          style={{ width: 100 }}
          value={sinceHours}
          min={1}
          onChange={(e) => setSinceHours(Math.max(1, Number(e.target.value) || 24))}
        />
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </Toolbar>

      <ErrorBanner error={error} />

      {rows.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>
          {loading ? "Loading…" : "No failures match."}
        </div>
      ) : (
        <SpanTable rows={rows} />
      )}
    </>
  );
}

// ─── Slow spans ──────────────────────────────────────────────────────────────
function SlowSpans() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sinceHours, setSinceHours] = useState(24);
  const [minMs, setMinMs] = useState(750);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const since = new Date(Date.now() - sinceHours * 3600_000).toISOString();
      const xs = await getSlowSpans({ since, limit: 100, minMs });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [sinceHours, minMs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <Toolbar>
        <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>min ms</label>
        <input
          type="number"
          className="rf-input"
          style={{ width: 100 }}
          value={minMs}
          min={1}
          onChange={(e) => setMinMs(Math.max(1, Number(e.target.value) || 750))}
        />
        <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
          Since (hours)
        </label>
        <input
          type="number"
          className="rf-input"
          style={{ width: 100 }}
          value={sinceHours}
          min={1}
          onChange={(e) => setSinceHours(Math.max(1, Number(e.target.value) || 24))}
        />
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </Toolbar>

      <ErrorBanner error={error} />

      {rows.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>
          {loading ? "Loading…" : "No slow spans in the window."}
        </div>
      ) : (
        <SpanTable rows={rows} />
      )}
    </>
  );
}

// ─── Trace lookup ────────────────────────────────────────────────────────────
function TraceLookup() {
  const initialTrace =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("trace") || ""
      : "";
  const [input, setInput] = useState(initialTrace);
  const [traceId, setTraceId] = useState(initialTrace);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const xs = await getTrace(id);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load trace");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialTrace) load(initialTrace);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tree = useMemo(() => buildTree(rows), [rows]);

  return (
    <>
      <Toolbar>
        <input
          className="rf-input"
          placeholder="Paste trace id"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ minWidth: 320 }}
        />
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => {
            setTraceId(input);
            load(input);
          }}
          disabled={loading || !input}
        >
          Lookup
        </button>
      </Toolbar>

      <ErrorBanner error={error} />

      {!traceId ? (
        <div style={{ color: "var(--rf-txt3)" }}>
          Trace lookup returns FAILED / SLOW spans (≥750ms). Successful fast
          spans live in logs only.
        </div>
      ) : loading ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : tree.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>
          No spans recorded for this trace.
        </div>
      ) : (
        <div className="rf-card" style={{ padding: 10 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {tree.map((n) => (
              <SpanNode key={n.id} node={n} depth={0} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function buildTree(spans) {
  const byId = new Map();
  for (const s of spans) byId.set(s.spanId, { ...s, children: [] });
  const roots = [];
  for (const node of byId.values()) {
    if (node.parentSpanId && byId.has(node.parentSpanId)) {
      byId.get(node.parentSpanId).children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function SpanNode({ node, depth }) {
  const style =
    TRACE_SPAN_STATUS_STYLE[node.status] || TRACE_SPAN_STATUS_STYLE.OK;
  return (
    <li
      style={{
        borderTop: depth ? "none" : "1px solid var(--rf-border)",
        padding: "6px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          paddingLeft: depth * 18,
        }}
      >
        <span
          style={{
            padding: "2px 6px",
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 4,
            background: style.bg,
            color: style.color,
          }}
        >
          {node.status}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 12 }}>{node.kind}</span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "monospace",
            fontSize: 12,
            color: "var(--rf-txt3)",
          }}
        >
          {node.durationMs}ms
        </span>
      </div>
      {node.error && (
        <div
          style={{
            paddingLeft: depth * 18 + 14,
            fontSize: 11,
            color: "var(--rf-red)",
          }}
        >
          {node.error}
        </div>
      )}
      {node.children.length > 0 && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {node.children.map((c) => (
            <SpanNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Span table (failures / slow spans) ──────────────────────────────────────
function SpanTable({ rows }) {
  return (
    <div className="rf-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--rf-bg2)" }}>
            <th style={th}>When</th>
            <th style={th}>Kind</th>
            <th style={th}>Status</th>
            <th style={th}>Duration</th>
            <th style={th}>Trace</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const style =
              TRACE_SPAN_STATUS_STYLE[s.status] || TRACE_SPAN_STATUS_STYLE.OK;
            return (
              <tr
                key={s.id}
                style={{ borderTop: "1px solid var(--rf-border)" }}
              >
                <td style={td}>
                  {s.occurredAt
                    ? new Date(s.occurredAt).toLocaleString()
                    : "—"}
                </td>
                <td style={{ ...td, fontFamily: "monospace" }}>{s.kind}</td>
                <td style={td}>
                  <span
                    style={{
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 4,
                      background: style.bg,
                      color: style.color,
                    }}
                  >
                    {s.status}
                  </span>
                  {s.error && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-red)",
                        marginTop: 2,
                      }}
                    >
                      {s.error}
                    </div>
                  )}
                </td>
                <td style={td}>{s.durationMs}ms</td>
                <td style={td}>
                  <a
                    href={`/Diagnostics?trace=${encodeURIComponent(s.traceId)}`}
                    className="rf-btn"
                  >
                    Open
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Toolbar({ children }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        marginBottom: 12,
        flexWrap: "wrap",
      }}
    >
      {children}
    </div>
  );
}

function ErrorBanner({ error }) {
  if (!error) return null;
  return (
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
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "10px 12px", fontSize: 13, color: "var(--rf-txt)" };
