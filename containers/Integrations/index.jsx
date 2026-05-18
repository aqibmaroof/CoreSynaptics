"use client";

// ── Phase 5 PR-8: Integrations admin (3 tabs) ────────────────────────────────
// Tabs: Webhooks · Inbound · Credentials. Credentials are write-only — the
// API never returns secret material. The form encrypts before persistence.

import { useCallback, useEffect, useState } from "react";
import {
  listWebhooks,
  createWebhook,
  deactivateWebhook,
  listWebhookDeliveries,
  listInbound,
  ingestInbound,
  listCredentials,
  upsertCredential,
  rotateCredential,
  revokeCredential,
  WEBHOOK_STATUS_STYLE,
} from "@/services/Integrations";

export default function IntegrationsAdmin() {
  const [tab, setTab] = useState("webhooks");
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
          Integrations
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Outbound webhooks, inbound ingestion, and write-only credentials.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          className={`rf-btn ${tab === "webhooks" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("webhooks")}
        >
          Webhooks
        </button>
        <button
          className={`rf-btn ${tab === "inbound" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("inbound")}
        >
          Inbound
        </button>
        <button
          className={`rf-btn ${tab === "credentials" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("credentials")}
        >
          Credentials
        </button>
      </div>

      {tab === "webhooks" && <WebhooksTab />}
      {tab === "inbound" && <InboundTab />}
      {tab === "credentials" && <CredentialsTab />}
    </div>
  );
}

// ─── Webhooks tab ────────────────────────────────────────────────────────────
function WebhooksTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    url: "",
    secret: "",
    eventPatterns: "",
    isActive: true,
  });
  const [openDeliveries, setOpenDeliveries] = useState(null);
  const [deliveries, setDeliveries] = useState([]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listWebhooks();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    try {
      await createWebhook({
        name: draft.name,
        url: draft.url,
        secret: draft.secret,
        eventPatterns: draft.eventPatterns
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        isActive: !!draft.isActive,
      });
      setShowNew(false);
      setDraft({
        name: "",
        url: "",
        secret: "",
        eventPatterns: "",
        isActive: true,
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Create failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Deactivate this webhook?")) return;
    try {
      await deactivateWebhook(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Delete failed");
    }
  };

  const inspectDeliveries = async (id) => {
    setOpenDeliveries(id);
    setDeliveries([]);
    try {
      const xs = await listWebhookDeliveries(id, 50);
      setDeliveries(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load deliveries");
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowNew(true)}
        >
          + New webhook
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
          No webhooks yet.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Name</th>
                <th style={th}>URL</th>
                <th style={th}>Patterns</th>
                <th style={th}>Active</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{r.name}</td>
                  <td
                    style={{
                      ...td,
                      fontFamily: "monospace",
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.url}
                  </td>
                  <td style={td}>
                    {(r.eventPatterns ?? []).join(", ") || "—"}
                  </td>
                  <td style={td}>{r.isActive ? "Yes" : "No"}</td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      className="rf-btn"
                      onClick={() => inspectDeliveries(r.id)}
                      style={{ marginRight: 6 }}
                    >
                      Deliveries
                    </button>
                    <button className="rf-btn" onClick={() => remove(r.id)}>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {openDeliveries && (
        <div style={overlay} onClick={() => setOpenDeliveries(null)}>
          <div
            className="rf-card"
            style={{ padding: 16, maxWidth: 720, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>
                Recent deliveries
              </h2>
              <button
                className="rf-btn"
                onClick={() => setOpenDeliveries(null)}
              >
                ✕
              </button>
            </header>
            {deliveries.length === 0 ? (
              <div style={{ color: "var(--rf-txt3)" }}>None.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th}>Event</th>
                    <th style={th}>Status</th>
                    <th style={th}>HTTP</th>
                    <th style={th}>Attempts</th>
                    <th style={th}>Last</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((d) => {
                    const ps =
                      WEBHOOK_STATUS_STYLE[d.status] ||
                      WEBHOOK_STATUS_STYLE.PENDING;
                    return (
                      <tr
                        key={d.id}
                        style={{ borderTop: "1px solid var(--rf-border)" }}
                      >
                        <td style={td}>{d.eventName}</td>
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
                            {d.status}
                          </span>
                        </td>
                        <td style={td}>{d.responseStatus ?? "—"}</td>
                        <td style={td}>{d.attempts}</td>
                        <td style={td}>
                          {d.lastAttemptAt
                            ? new Date(d.lastAttemptAt).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {showNew && (
        <div style={overlay} onClick={() => setShowNew(false)}>
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 540, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              New webhook
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              <Field label="Name">
                <input
                  className="rf-input"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                />
              </Field>
              <Field label="URL">
                <input
                  className="rf-input"
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                  placeholder="https://example.com/hooks/c2m"
                />
              </Field>
              <Field label="Secret (HMAC key — stored server-side only)">
                <input
                  type="password"
                  className="rf-input"
                  value={draft.secret}
                  onChange={(e) =>
                    setDraft({ ...draft, secret: e.target.value })
                  }
                />
              </Field>
              <Field label="Event patterns (comma-separated, e.g. issue.*, turnover.package.*)">
                <input
                  className="rf-input"
                  value={draft.eventPatterns}
                  onChange={(e) =>
                    setDraft({ ...draft, eventPatterns: e.target.value })
                  }
                />
              </Field>
              <label
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!draft.isActive}
                  onChange={(e) =>
                    setDraft({ ...draft, isActive: e.target.checked })
                  }
                />
                Active
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button className="rf-btn" onClick={() => setShowNew(false)}>
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={save}
                disabled={!draft.name || !draft.url || !draft.secret}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Inbound tab ─────────────────────────────────────────────────────────────
function InboundTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState("");
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({
    provider: "",
    externalId: "",
    eventType: "",
    payload: {},
    emitAs: "",
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listInbound(provider || undefined, 50);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const send = async () => {
    try {
      await ingestInbound({
        provider: draft.provider,
        externalId: draft.externalId || undefined,
        eventType: draft.eventType,
        payload: draft.payload,
        emitAs: draft.emitAs || undefined,
      });
      setShow(false);
      setDraft({
        provider: "",
        externalId: "",
        eventType: "",
        payload: {},
        emitAs: "",
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Ingest failed");
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 10,
          alignItems: "center",
        }}
      >
        <input
          className="rf-input"
          placeholder="Filter by provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <button className="rf-btn" onClick={refresh}>
          Refresh
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShow(true)}
        >
          + Test ingest
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
          No inbound events.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Received</th>
                <th style={th}>Provider</th>
                <th style={th}>Event type</th>
                <th style={th}>External id</th>
                <th style={th}>Emitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    {r.receivedAt
                      ? new Date(r.receivedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td style={td}>{r.provider}</td>
                  <td style={td}>{r.eventType}</td>
                  <td style={td}>{r.externalId || "—"}</td>
                  <td style={td}>{r.emitted ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {show && (
        <div style={overlay} onClick={() => setShow(false)}>
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 540, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Test ingest
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              <Field label="Provider">
                <input
                  className="rf-input"
                  value={draft.provider}
                  onChange={(e) =>
                    setDraft({ ...draft, provider: e.target.value })
                  }
                />
              </Field>
              <Field label="Event type">
                <input
                  className="rf-input"
                  value={draft.eventType}
                  onChange={(e) =>
                    setDraft({ ...draft, eventType: e.target.value })
                  }
                />
              </Field>
              <Field label="External id (optional)">
                <input
                  className="rf-input"
                  value={draft.externalId}
                  onChange={(e) =>
                    setDraft({ ...draft, externalId: e.target.value })
                  }
                />
              </Field>
              <Field label="Emit as (optional internal event name)">
                <input
                  className="rf-input"
                  value={draft.emitAs}
                  onChange={(e) =>
                    setDraft({ ...draft, emitAs: e.target.value })
                  }
                />
              </Field>
              <Field label="Payload (JSON)">
                <textarea
                  className="rf-input"
                  rows={6}
                  value={JSON.stringify(draft.payload ?? {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setDraft({
                        ...draft,
                        payload: JSON.parse(e.target.value || "{}"),
                      });
                    } catch {
                      /* swallow */
                    }
                  }}
                />
              </Field>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button className="rf-btn" onClick={() => setShow(false)}>
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={send}
                disabled={!draft.provider || !draft.eventType}
              >
                Ingest
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Credentials tab ─────────────────────────────────────────────────────────
function CredentialsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState({
    provider: "",
    alias: "",
    credentials: {},
    isActive: true,
  });
  // PR-7 (v6): rotation dialog (id-only — body re-collected from user).
  const [rotateTarget, setRotateTarget] = useState(null);
  const [rotateDraft, setRotateDraft] = useState({});
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listCredentials();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    try {
      await upsertCredential({
        provider: draft.provider,
        alias: draft.alias,
        credentials: draft.credentials,
        isActive: !!draft.isActive,
      });
      setShow(false);
      setDraft({ provider: "", alias: "", credentials: {}, isActive: true });
      await refresh();
    } catch (e) {
      setError(e?.message || "Save failed");
    }
  };

  const doRotate = async () => {
    if (!rotateTarget) return;
    setBusy(true);
    try {
      await rotateCredential(rotateTarget.id, rotateDraft);
      setRotateTarget(null);
      setRotateDraft({});
      await refresh();
    } catch (e) {
      setError(e?.message || "Rotate failed");
    } finally {
      setBusy(false);
    }
  };

  const doRevoke = async (row) => {
    if (
      !confirm(
        `Revoke credential "${row.alias}" (${row.provider})? It will stop being used immediately.`
      )
    )
      return;
    setBusy(true);
    try {
      await revokeCredential(row.id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Revoke failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        style={{
          padding: 8,
          background: "rgba(245,158,11,0.10)",
          color: "var(--rf-yellow, #f59e0b)",
          borderRadius: 6,
          marginBottom: 10,
          fontSize: 12,
        }}
      >
        Secrets are write-only — reads return only provider/alias summaries.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShow(true)}
        >
          + New credential
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
          No credentials saved.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Provider</th>
                <th style={th}>Alias</th>
                <th style={th}>Active</th>
                <th style={th}>Updated</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{r.provider}</td>
                  <td style={td}>{r.alias}</td>
                  <td style={td}>{r.isActive ? "Yes" : "No"}</td>
                  <td style={td}>
                    {r.updatedAt
                      ? new Date(r.updatedAt).toLocaleString()
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      className="rf-btn"
                      onClick={() => {
                        setRotateTarget(r);
                        setRotateDraft({});
                      }}
                      disabled={busy}
                      style={{ marginRight: 6 }}
                    >
                      Rotate
                    </button>
                    <button
                      className="rf-btn"
                      onClick={() => doRevoke(r)}
                      disabled={busy || !r.isActive}
                      style={{ color: "var(--rf-red)" }}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rotateTarget && (
        <div style={overlay} onClick={() => setRotateTarget(null)}>
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 540, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Rotate credential
            </h2>
            <div
              style={{
                fontSize: 12,
                color: "var(--rf-txt3)",
                marginBottom: 12,
              }}
            >
              {rotateTarget.provider} · {rotateTarget.alias}
            </div>
            <Field label="New credentials (JSON — replaces the encrypted blob)">
              <textarea
                className="rf-input"
                rows={8}
                value={JSON.stringify(rotateDraft ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    setRotateDraft(JSON.parse(e.target.value || "{}"));
                  } catch {
                    /* swallow until valid */
                  }
                }}
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
                onClick={() => setRotateTarget(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={doRotate}
                disabled={busy || !Object.keys(rotateDraft).length}
              >
                {busy ? "Rotating…" : "Rotate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {show && (
        <div style={overlay} onClick={() => setShow(false)}>
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 540, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              New credential
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              <Field label="Provider">
                <input
                  className="rf-input"
                  value={draft.provider}
                  onChange={(e) =>
                    setDraft({ ...draft, provider: e.target.value })
                  }
                />
              </Field>
              <Field label="Alias">
                <input
                  className="rf-input"
                  value={draft.alias}
                  onChange={(e) =>
                    setDraft({ ...draft, alias: e.target.value })
                  }
                />
              </Field>
              <Field label="Credentials (JSON — write-only)">
                <textarea
                  className="rf-input"
                  rows={6}
                  value={JSON.stringify(draft.credentials ?? {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setDraft({
                        ...draft,
                        credentials: JSON.parse(e.target.value || "{}"),
                      });
                    } catch {
                      /* swallow */
                    }
                  }}
                />
              </Field>
              <label
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                  fontSize: 13,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!draft.isActive}
                  onChange={(e) =>
                    setDraft({ ...draft, isActive: e.target.checked })
                  }
                />
                Active
              </label>
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button className="rf-btn" onClick={() => setShow(false)}>
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={save}
                disabled={!draft.provider || !draft.alias}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 20,
};
