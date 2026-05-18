"use client";

// ── Phase 5 PR-9: Event log + replay ─────────────────────────────────────────
// Platform-admin only. Replay is destructive — always prefer dryRun first.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listEvents,
  listProjectionCheckpoints,
  runReplay,
  rebuildProjection,
} from "@/services/EventLog";

export default function EventLogAdmin() {
  const [tab, setTab] = useState("events");
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
          Event log
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Platform-admin only. Replay re-emits events — always preview with
          dry-run.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`rf-btn ${tab === "events" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("events")}
        >
          Events
        </button>
        <button
          className={`rf-btn ${tab === "checkpoints" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("checkpoints")}
        >
          Checkpoints
        </button>
        <button
          className={`rf-btn ${tab === "replay" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("replay")}
        >
          Replay
        </button>
        <button
          className={`rf-btn ${tab === "rebuild" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("rebuild")}
        >
          Rebuild projection
        </button>
      </div>

      {tab === "events" && <EventsTab />}
      {tab === "checkpoints" && <CheckpointsTab />}
      {tab === "replay" && <ReplayTab />}
      {tab === "rebuild" && <RebuildTab />}
    </div>
  );
}

function EventsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    eventName: "",
    cxProjectId: "",
    since: "",
    until: "",
    limit: 100,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: filter.limit };
      if (filter.eventName) params.eventName = filter.eventName;
      if (filter.cxProjectId) params.cxProjectId = filter.cxProjectId;
      if (filter.since) params.since = filter.since;
      if (filter.until) params.until = filter.until;
      const xs = await listEvents(params);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <input
          className="rf-input"
          placeholder="event name"
          value={filter.eventName}
          onChange={(e) => setFilter({ ...filter, eventName: e.target.value })}
        />
        <input
          className="rf-input"
          placeholder="cxProjectId"
          value={filter.cxProjectId}
          onChange={(e) =>
            setFilter({ ...filter, cxProjectId: e.target.value })
          }
        />
        <input
          className="rf-input"
          type="datetime-local"
          value={filter.since}
          onChange={(e) => setFilter({ ...filter, since: e.target.value })}
        />
        <input
          className="rf-input"
          type="datetime-local"
          value={filter.until}
          onChange={(e) => setFilter({ ...filter, until: e.target.value })}
        />
        <button className="rf-btn" onClick={refresh}>
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
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No events match.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Occurred</th>
                <th style={th}>Event</th>
                <th style={th}>v</th>
                <th style={th}>Org / Project</th>
                <th style={th}>Actor</th>
                <th style={th}>Id</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr
                  key={e.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    {e.occurredAt
                      ? new Date(e.occurredAt).toLocaleString()
                      : "—"}
                  </td>
                  <td style={{ ...td, fontFamily: "monospace" }}>
                    {e.eventName}
                  </td>
                  <td style={td}>v{e.eventVersion}</td>
                  <td style={td}>
                    {e.organizationId?.slice(0, 8) || "—"}
                    {e.cxProjectId ? ` / ${e.cxProjectId.slice(0, 8)}` : ""}
                  </td>
                  <td style={td}>
                    {e.actorUserId?.slice(0, 8) || "—"}
                  </td>
                  <td style={{ ...td, fontFamily: "monospace" }}>
                    {e.id.slice(0, 8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function CheckpointsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const xs = await listProjectionCheckpoints();
        if (!cancelled) setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error)
    return (
      <div
        style={{
          padding: 10,
          background: "rgba(239,68,68,0.12)",
          color: "var(--rf-red)",
          borderRadius: 6,
        }}
      >
        {error}
      </div>
    );
  if (loading) return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;

  return (
    <div className="rf-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--rf-bg2)" }}>
            <th style={th}>Projection</th>
            <th style={th}>Last event</th>
            <th style={th}>Last at</th>
            <th style={th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr
              key={c.projection}
              style={{ borderTop: "1px solid var(--rf-border)" }}
            >
              <td style={td}>{c.projection}</td>
              <td style={{ ...td, fontFamily: "monospace" }}>
                {c.lastEventId?.slice(0, 8) || "—"}
              </td>
              <td style={td}>
                {c.lastOccurredAt
                  ? new Date(c.lastOccurredAt).toLocaleString()
                  : "—"}
              </td>
              <td style={td}>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReplayTab() {
  // PR-8 (v6) UX: default to dryRun, require at least one scope field, surface
  // scope verbatim in a confirmation modal before flipping dryRun off.
  const [draft, setDraft] = useState({
    eventName: "",
    cxProjectId: "",
    organizationId: "",
    since: "",
    until: "",
    limit: 1000,
  });
  const [dryResult, setDryResult] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const buildBody = (dryRun) => {
    const body = { ...draft, dryRun, limit: Number(draft.limit) || 1000 };
    Object.keys(body).forEach(
      (k) => (body[k] === "" || body[k] === undefined) && delete body[k]
    );
    return body;
  };

  const hasScope =
    !!draft.eventName ||
    !!draft.cxProjectId ||
    !!draft.organizationId ||
    !!draft.since;

  const submit = async (dryRun) => {
    setBusy(true);
    setError("");
    if (dryRun) setDryResult(null);
    else setResult(null);
    try {
      const r = await runReplay(buildBody(dryRun));
      if (dryRun) setDryResult(r);
      else setResult(r);
    } catch (e) {
      setError(e?.message || "Replay failed");
    } finally {
      setBusy(false);
    }
  };

  const scopeText = useMemo(() => {
    const parts = [];
    if (draft.eventName) parts.push(`type "${draft.eventName}"`);
    if (draft.cxProjectId)
      parts.push(`project ${draft.cxProjectId.slice(0, 8)}`);
    if (draft.organizationId)
      parts.push(`organization ${draft.organizationId.slice(0, 8)}`);
    if (draft.since) parts.push(`since ${draft.since}`);
    if (draft.until) parts.push(`until ${draft.until}`);
    return parts.join(" · ") || "(unscoped — server will reject)";
  }, [draft]);

  return (
    <div className="rf-card" style={{ padding: 16 }}>
      <div
        style={{
          padding: 10,
          background: "rgba(239,68,68,0.08)",
          color: "var(--rf-red)",
          borderRadius: 6,
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        Replay re-emits events. Run dry-run first.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Event name (optional)">
          <input
            className="rf-input"
            value={draft.eventName}
            onChange={(e) =>
              setDraft({ ...draft, eventName: e.target.value })
            }
          />
        </Field>
        <Field label="cxProjectId (optional)">
          <input
            className="rf-input"
            value={draft.cxProjectId}
            onChange={(e) =>
              setDraft({ ...draft, cxProjectId: e.target.value })
            }
          />
        </Field>
        <Field label="organizationId (optional)">
          <input
            className="rf-input"
            value={draft.organizationId}
            onChange={(e) =>
              setDraft({ ...draft, organizationId: e.target.value })
            }
          />
        </Field>
        <Field label="Limit">
          <input
            className="rf-input"
            type="number"
            value={draft.limit}
            onChange={(e) =>
              setDraft({ ...draft, limit: e.target.value })
            }
          />
        </Field>
        <Field label="Since (ISO)">
          <input
            className="rf-input"
            type="datetime-local"
            value={draft.since}
            onChange={(e) => setDraft({ ...draft, since: e.target.value })}
          />
        </Field>
        <Field label="Until (ISO)">
          <input
            className="rf-input"
            type="datetime-local"
            value={draft.until}
            onChange={(e) => setDraft({ ...draft, until: e.target.value })}
          />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          className="rf-btn"
          onClick={() => submit(true)}
          disabled={busy || !hasScope}
        >
          Dry-run
        </button>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setConfirmOpen(true)}
          disabled={busy || !hasScope}
        >
          Replay…
        </button>
        {!hasScope && (
          <span
            style={{
              fontSize: 12,
              color: "var(--rf-txt3)",
              alignSelf: "center",
            }}
          >
            At least one scope field is required.
          </span>
        )}
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginTop: 10,
          }}
        >
          {error}
        </div>
      )}

      {dryResult && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: "var(--rf-bg2)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Dry-run preview
          </div>
          <pre style={{ margin: 0, overflow: "auto" }}>
            {JSON.stringify(dryResult, null, 2)}
          </pre>
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: "rgba(34,197,94,0.10)",
            border: "1px solid var(--rf-green)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Replay complete
          </div>
          <pre style={{ margin: 0, overflow: "auto" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {confirmOpen && (
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
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 540, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              Confirm replay
            </h3>
            <p
              style={{ fontSize: 13, color: "var(--rf-txt2)", marginBottom: 12 }}
            >
              Replay events of {scopeText}.{" "}
              {dryResult
                ? `Dry-run reported ${dryResult.count ?? "?"} events.`
                : "Run a dry-run first to preview the count."}
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
              }}
            >
              <button
                className="rf-btn"
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={() => {
                  setConfirmOpen(false);
                  submit(false);
                }}
                disabled={busy}
              >
                Replay {dryResult ? `(${dryResult.count})` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PR-8: Rebuild projection ─────────────────────────────────────────────────
function RebuildTab() {
  const [draft, setDraft] = useState({
    projection: "operational-feed",
    eventNamePrefix: "",
    organizationId: "",
    since: "",
    limit: 5000,
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!confirm(`Rebuild projection "${draft.projection}"?`)) return;
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const body = { ...draft, limit: Number(draft.limit) || 5000 };
      Object.keys(body).forEach(
        (k) => (body[k] === "" || body[k] === undefined) && delete body[k]
      );
      const r = await rebuildProjection(body);
      setResult(r);
    } catch (e) {
      setError(e?.message || "Rebuild failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rf-card" style={{ padding: 16 }}>
      <div
        style={{
          padding: 10,
          background: "rgba(239,68,68,0.08)",
          color: "var(--rf-red)",
          borderRadius: 6,
          marginBottom: 12,
          fontSize: 12,
        }}
      >
        Rebuild flips the projection&apos;s checkpoint to REBUILDING. An
        interrupted rebuild leaves it stuck; use the Checkpoints tab to verify.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Field label="Projection">
          <input
            className="rf-input"
            value={draft.projection}
            onChange={(e) =>
              setDraft({ ...draft, projection: e.target.value })
            }
            placeholder="operational-feed"
          />
        </Field>
        <Field label="Event name prefix (optional)">
          <input
            className="rf-input"
            value={draft.eventNamePrefix}
            onChange={(e) =>
              setDraft({ ...draft, eventNamePrefix: e.target.value })
            }
            placeholder="issue."
          />
        </Field>
        <Field label="organizationId (optional)">
          <input
            className="rf-input"
            value={draft.organizationId}
            onChange={(e) =>
              setDraft({ ...draft, organizationId: e.target.value })
            }
          />
        </Field>
        <Field label="Limit">
          <input
            type="number"
            className="rf-input"
            value={draft.limit}
            onChange={(e) => setDraft({ ...draft, limit: e.target.value })}
          />
        </Field>
        <Field label="Since (ISO)">
          <input
            className="rf-input"
            type="datetime-local"
            value={draft.since}
            onChange={(e) => setDraft({ ...draft, since: e.target.value })}
          />
        </Field>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button
          className="rf-btn rf-btn-primary"
          onClick={submit}
          disabled={busy || !draft.projection}
        >
          {busy ? "Rebuilding…" : "Rebuild"}
        </button>
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginTop: 10,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <pre
          style={{
            marginTop: 12,
            padding: 10,
            background: "var(--rf-bg2)",
            borderRadius: 6,
            fontSize: 12,
            overflow: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
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

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "10px 12px", fontSize: 13, color: "var(--rf-txt)" };
