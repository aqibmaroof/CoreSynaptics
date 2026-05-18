"use client";

// ── Phase 6 PR-9: SRE dashboard ──────────────────────────────────────────────
// Platform-only. Five polled endpoints — no WS push for SRE data by design.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getSreHealth,
  getSreCheckpoints,
  getSreThroughput,
  getSreDeadLetters,
  getSreQueueStatus,
  PROJECTION_STATUS_STYLE,
} from "@/services/Sre";
import { DEAD_LETTER_GROUPS } from "@/services/EventLog";

export default function SreDashboard() {
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
          SRE
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Platform-only health, throughput, queue depth, and projection
          checkpoints.
        </p>
      </header>

      <HealthStrip />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        <CheckpointBoard />
        <QueueStatusCard />
      </div>

      <div style={{ marginTop: 16 }}>
        <Throughput />
      </div>

      <div style={{ marginTop: 16 }}>
        <DeadLetters />
      </div>
    </div>
  );
}

// ─── Polling hook ────────────────────────────────────────────────────────────
// Callers may pass an inline arrow function — we keep the latest in a ref so
// the polling interval is only torn down when intervalMs changes.
function usePoll(fn, intervalMs) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fnRef.current();
        if (!cancelled) {
          setData(r);
          setError("");
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    tick();
    const t = setInterval(tick, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [intervalMs]);

  return { data, error, loading };
}

// ─── Health strip ────────────────────────────────────────────────────────────
function HealthStrip() {
  const { data, error } = usePoll(() => getSreHealth(), 15_000);
  if (error) return <Banner error={error} />;
  if (!data) return <Card>Loading health…</Card>;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 8,
      }}
    >
      <Tile
        label="Overall"
        value={data.ok ? "OK" : "DOWN"}
        tone={data.ok ? "green" : "red"}
      />
      <Tile
        label="DB"
        value={`${data.db?.latencyMs ?? "?"}ms`}
        tone={data.db?.ok ? "green" : "red"}
      />
      <Tile
        label="WS local"
        value={(data.ws?.localConnections ?? 0).toLocaleString()}
      />
      <Tile
        label="Presence keys"
        value={(data.ws?.presenceKeys ?? 0).toLocaleString()}
      />
      <Tile
        label="Throttle keys"
        value={(data.ws?.throttleKeys ?? 0).toLocaleString()}
      />
      <Tile
        label="Cache hit"
        value={`${((data.projectionCache?.ratio ?? 0) * 100).toFixed(1)}%`}
      />
      <Tile
        label="Cache invalidations"
        value={(data.projectionCache?.invalidations ?? 0).toLocaleString()}
      />
    </div>
  );
}

// ─── Checkpoint board ────────────────────────────────────────────────────────
function CheckpointBoard() {
  const { data, error, loading } = usePoll(
    () => getSreCheckpoints(),
    60_000
  );
  return (
    <Card>
      <SectionHeader title="Projection checkpoints" />
      {error && <Banner error={error} />}
      {loading && !data ? (
        <Muted>Loading…</Muted>
      ) : !data ? (
        <Muted>No data.</Muted>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 10,
              fontSize: 12,
            }}
          >
            <span>HEALTHY: {data.byStatus?.HEALTHY ?? 0}</span>
            <span>LAGGING: {data.byStatus?.LAGGING ?? 0}</span>
            <span>REBUILDING: {data.byStatus?.REBUILDING ?? 0}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Projection</th>
                <th style={th}>Status</th>
                <th style={th}>Last event</th>
                <th style={th}>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {(data.rows ?? []).map((r) => {
                const ps =
                  PROJECTION_STATUS_STYLE[r.status] ||
                  PROJECTION_STATUS_STYLE.HEALTHY;
                return (
                  <tr
                    key={r.projection}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>{r.projection}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "2px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: ps.bg,
                          color: ps.color,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ ...td, fontFamily: "monospace" }}>
                      {r.lastEventId?.slice(0, 8) || "—"}
                    </td>
                    <td style={td}>
                      {r.lastOccurredAt
                        ? new Date(r.lastOccurredAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </Card>
  );
}

// ─── Queue status ────────────────────────────────────────────────────────────
function QueueStatusCard() {
  const { data, error, loading } = usePoll(() => getSreQueueStatus(), 15_000);
  return (
    <Card>
      <SectionHeader title="Queue depth" />
      {error && <Banner error={error} />}
      {loading && !data ? (
        <Muted>Loading…</Muted>
      ) : !data ? (
        <Muted>No data.</Muted>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <QueueRow
            title="Notifications"
            pending={data.notifications?.pending}
            failed={data.notifications?.failed}
          />
          <QueueRow
            title="Webhooks"
            pending={data.webhooks?.pending}
            failed={data.webhooks?.dead}
            failedLabel="dead"
          />
          <QueueRow
            title="Automations"
            pending={data.automations?.pending}
            failed={0}
          />
        </div>
      )}
    </Card>
  );
}

function QueueRow({ title, pending, failed, failedLabel = "failed" }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        padding: 8,
        background: "var(--rf-bg2)",
        borderRadius: 6,
      }}
    >
      <span style={{ fontWeight: 600 }}>{title}</span>
      <span style={{ fontFamily: "monospace", fontSize: 12 }}>
        pending {pending ?? 0}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          color: failed > 0 ? "var(--rf-red)" : "var(--rf-txt3)",
        }}
      >
        {failedLabel} {failed ?? 0}
      </span>
    </div>
  );
}

// ─── Throughput ──────────────────────────────────────────────────────────────
function Throughput() {
  const [sinceMin, setSinceMin] = useState(60);
  const fn = useCallback(
    () => getSreThroughput({ sinceMin, limit: 50 }),
    [sinceMin]
  );
  const { data, error, loading } = usePoll(fn, 30_000);

  const max = useMemo(() => {
    const counts = data?.eventCounts ?? [];
    return counts.length ? Math.max(...counts.map((r) => r.count)) : 1;
  }, [data]);

  return (
    <Card>
      <SectionHeader
        title="Throughput"
        right={
          <select
            className="rf-input"
            value={sinceMin}
            onChange={(e) => setSinceMin(Number(e.target.value))}
          >
            <option value={15}>last 15m</option>
            <option value={60}>last 1h</option>
            <option value={360}>last 6h</option>
            <option value={1440}>last 24h</option>
          </select>
        }
      />
      {error && <Banner error={error} />}
      {loading && !data ? (
        <Muted>Loading…</Muted>
      ) : !data?.eventCounts?.length ? (
        <Muted>No events.</Muted>
      ) : (
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
      )}
    </Card>
  );
}

// ─── Dead-letters roll-up ────────────────────────────────────────────────────
function DeadLetters() {
  const [sinceMin, setSinceMin] = useState(1440);
  const fn = useCallback(
    () => getSreDeadLetters({ sinceMin, limit: 100 }),
    [sinceMin]
  );
  const { data, error, loading } = usePoll(fn, 60_000);

  return (
    <Card>
      <SectionHeader
        title="Dead-letter roll-up"
        right={
          <select
            className="rf-input"
            value={sinceMin}
            onChange={(e) => setSinceMin(Number(e.target.value))}
          >
            <option value={60}>last 1h</option>
            <option value={360}>last 6h</option>
            <option value={1440}>last 24h</option>
            <option value={10080}>last 7d</option>
          </select>
        }
      />
      {error && <Banner error={error} />}
      {loading && !data ? (
        <Muted>Loading…</Muted>
      ) : !data ? (
        <Muted>No data.</Muted>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {DEAD_LETTER_GROUPS.map(({ key, label }) => {
            const rows = data[key] ?? [];
            return (
              <div
                key={key}
                style={{
                  border: "1px solid var(--rf-border)",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
                  <span
                    style={{
                      fontSize: 12,
                      color:
                        rows.length > 0
                          ? "var(--rf-red)"
                          : "var(--rf-txt3)",
                    }}
                  >
                    {rows.length}
                  </span>
                </div>
                <a
                  href="/Diagnostics"
                  style={{
                    fontSize: 11,
                    color: "var(--rf-txt3)",
                  }}
                >
                  Open failure inbox →
                </a>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// ─── primitives ──────────────────────────────────────────────────────────────
function Card({ children }) {
  return <section className="rf-card" style={{ padding: 14 }}>{children}</section>;
}

function SectionHeader({ title, right }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--rf-txt)" }}>
        {title}
      </div>
      {right}
    </header>
  );
}

function Tile({ label, value, tone }) {
  const toneStyle =
    tone === "green"
      ? { color: "var(--rf-green)" }
      : tone === "red"
      ? { color: "var(--rf-red)" }
      : { color: "var(--rf-txt)" };
  return (
    <div
      className="rf-card"
      style={{
        padding: 12,
        display: "grid",
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          fontFamily: "monospace",
          ...toneStyle,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Banner({ error }) {
  if (!error) return null;
  return (
    <div
      style={{
        padding: 8,
        background: "rgba(239,68,68,0.12)",
        color: "var(--rf-red)",
        borderRadius: 6,
        marginBottom: 8,
        fontSize: 12,
      }}
    >
      {error}
    </div>
  );
}

function Muted({ children }) {
  return (
    <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>{children}</div>
  );
}

const th = {
  textAlign: "left",
  padding: "6px 8px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "6px 8px", fontSize: 12, color: "var(--rf-txt)" };
