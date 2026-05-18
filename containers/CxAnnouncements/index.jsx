"use client";

// CxControl Announcements (GC funnel)
// Mirrors cxcontrol_v2.html renderAnnouncements():
// - State-tabs with red badge on PENDING_REVIEW
// - Author actions: Save / Submit for review / Resubmit
// - GC reviewer actions: Approve & publish / Reject (with reason)
// - Backed by Communications API (commType=ANNOUNCEMENT)

import { useEffect, useMemo, useState } from "react";
import {
  listCommunications,
  createCommunication,
  markCommunicationInternal,
  submitCommunicationForReview,
  approveAndPublishCommunication,
  rejectCommunication,
  COMM_STATE_LABELS,
  COMM_STATE_COLORS,
} from "@/services/Communications";

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  brand: "#1e40af",
  brandH: "#1e3a8a",
  brandFade: "#eff6ff",
  brandSoft: "#dbeafe",
  red: "#dc2626",
  bgSoft: "#f1f5f9",
};

const TABS = ["ALL", "DRAFT", "INTERNAL", "PENDING_REVIEW", "REJECTED", "SENT", "CLOSED"];

const Pill = ({ s }) => {
  const colorMap = {
    DRAFT: { bg: "#e2e8f0", fg: C.textSoft },
    INTERNAL: { bg: C.brandFade, fg: C.brandH },
    PENDING_REVIEW: { bg: "#fef3c7", fg: "#92400e" },
    REJECTED: { bg: "#fee2e2", fg: C.red },
    SENT: { bg: "#dcfce7", fg: "#15803d" },
    ACKNOWLEDGED: { bg: "#d1fae5", fg: "#047857" },
    CLOSED: { bg: "#e2e8f0", fg: C.textMuted },
  };
  const c = colorMap[s] ?? colorMap.DRAFT;
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {COMM_STATE_LABELS[s] ?? s}
    </span>
  );
};

const Toast = ({ message, onClose }) =>
  message ? (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 100,
        padding: "10px 16px",
        borderRadius: 8,
        background: message.type === "error" ? C.red : C.brand,
        color: "#fff",
        fontSize: 13,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        cursor: "pointer",
        maxWidth: 480,
      }}
    >
      {message.text}
    </div>
  ) : null;

export default function CxAnnouncements({ cxProjectId, isGcReviewer = false }) {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showReject, setShowReject] = useState(null); // comm
  const [toast, setToast] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const params = { commType: "ANNOUNCEMENT", limit: 200 };
      if (cxProjectId) params.cxProjectId = cxProjectId;
      const page = await listCommunications(params);
      setItems(page?.data ?? []);
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cxProjectId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => {
    const c = { ALL: items.length };
    for (const t of TABS.slice(1)) c[t] = items.filter((i) => i.state === t).length;
    return c;
  }, [items]);

  const filtered =
    tab === "ALL" ? items : items.filter((i) => i.state === tab);

  const act = async (fn, okText) => {
    try {
      await fn();
      setToast({ type: "ok", text: okText });
      reload();
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Action failed" });
    }
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: C.text,
      }}
    >
      <Toast message={toast} onClose={() => setToast(null)} />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Announcements
          </h1>
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            Cross-company project messaging routed through the GC review
            funnel. Authors compose → submit → GC approves → published to
            audience.
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: C.brand,
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 0,
            cursor: "pointer",
          }}
        >
          + Compose announcement
        </button>
      </div>

      {/* Tabs with red badge on PENDING_REVIEW */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const isReview = t === "PENDING_REVIEW";
          const ct = counts[t] ?? 0;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: tab === t ? C.brand : C.surface,
                color: tab === t ? "#fff" : C.textSoft,
                border: `1px solid ${tab === t ? C.brand : C.border}`,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {COMM_STATE_LABELS[t] ?? t}
              <span
                style={{
                  background:
                    isReview && ct > 0 && tab !== t
                      ? C.red
                      : tab === t
                      ? "rgba(255,255,255,0.22)"
                      : C.bgSoft,
                  color:
                    isReview && ct > 0 && tab !== t
                      ? "#fff"
                      : tab === t
                      ? "#fff"
                      : C.textMuted,
                  padding: "1px 7px",
                  borderRadius: 999,
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                {ct}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gap: 10 }}>
        {loading && (
          <div
            style={{
              padding: 36,
              textAlign: "center",
              color: C.textMuted,
              background: C.surface,
              borderRadius: 10,
              border: `1px solid ${C.border}`,
            }}
          >
            Loading announcements…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div
            style={{
              padding: 36,
              textAlign: "center",
              color: C.textMuted,
              background: C.surface,
              borderRadius: 10,
              border: `1px solid ${C.border}`,
            }}
          >
            No announcements in this state.
          </div>
        )}
        {!loading &&
          filtered.map((c) => (
            <Card key={c.id} c={c} isGcReviewer={isGcReviewer} act={act} setShowReject={setShowReject} />
          ))}
      </div>

      {showCreate && (
        <ComposeModal
          cxProjectId={cxProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setToast({ type: "ok", text: "Draft created" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}

      {showReject && (
        <RejectModal
          comm={showReject}
          onClose={() => setShowReject(null)}
          onRejected={() => {
            setShowReject(null);
            setToast({ type: "ok", text: "Rejected · author notified" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}
    </div>
  );
}

function Card({ c, isGcReviewer, act, setShowReject }) {
  return (
    <div
      style={{
        background: C === undefined ? "#fff" : "#ffffff",
        border: `1px solid ${"#e5e7eb"}`,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Pill s={c.state} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            {c.commNumber}
          </span>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            from <b style={{ color: "#475569" }}>{c.fromCompanyCode}</b>
            {c.audienceLabel ? ` · → ${c.audienceLabel}` : ""}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8" }}>
          {new Date(c.createdAt).toLocaleString()}
        </div>
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
        {c.subject}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#475569",
          marginBottom: 10,
          whiteSpace: "pre-wrap",
        }}
      >
        {c.body}
      </div>

      {c.state === "REJECTED" && c.rejectionReason && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          <b>Rejection reason:</b> {c.rejectionReason}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {c.state === "DRAFT" && (
          <>
            <button
              style={btnSoft}
              onClick={() =>
                act(
                  () => markCommunicationInternal(c.id),
                  "Moved to INTERNAL (visible inside your company)"
                )
              }
            >
              Move to internal
            </button>
            <button
              style={btnPri}
              onClick={() =>
                act(
                  () => submitCommunicationForReview(c.id),
                  "Submitted to GC for review"
                )
              }
            >
              Submit for review
            </button>
          </>
        )}
        {c.state === "INTERNAL" && (
          <button
            style={btnPri}
            onClick={() =>
              act(
                () => submitCommunicationForReview(c.id),
                "Submitted to GC for review"
              )
            }
          >
            Submit for review
          </button>
        )}
        {c.state === "REJECTED" && (
          <button
            style={btnPri}
            onClick={() =>
              act(
                () => submitCommunicationForReview(c.id),
                "Resubmitted for review"
              )
            }
          >
            Revise & resubmit
          </button>
        )}
        {c.state === "PENDING_REVIEW" && isGcReviewer && (
          <>
            <button
              style={btnPri}
              onClick={() =>
                act(
                  () => approveAndPublishCommunication(c.id),
                  "Published to audience"
                )
              }
            >
              Approve & publish
            </button>
            <button
              style={{ ...btnSoft, color: "#dc2626", borderColor: "#fecaca" }}
              onClick={() => setShowReject(c)}
            >
              Reject
            </button>
          </>
        )}
        {c.state === "PENDING_REVIEW" && !isGcReviewer && (
          <span style={{ fontSize: 11, color: "#94a3b8" }}>
            Awaiting GC PM/Field reviewer.
          </span>
        )}
      </div>
    </div>
  );
}

function ComposeModal({ cxProjectId, onClose, onCreated, onError }) {
  const [form, setForm] = useState({
    cxProjectId: cxProjectId ?? "",
    commNumber: "",
    subject: "",
    body: "",
    fromCompanyCode: "",
    toCompanyCode: "",
    audienceLabel: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setBusy(true);
    try {
      await createCommunication({
        cxProjectId: form.cxProjectId,
        commType: "ANNOUNCEMENT",
        commNumber: form.commNumber,
        subject: form.subject,
        body: form.body,
        fromCompanyCode: form.fromCompanyCode,
        toCompanyCode: form.toCompanyCode || undefined,
        audienceLabel: form.audienceLabel || undefined,
      });
      onCreated();
    } catch (e) {
      onError(e?.message ?? "Failed to create");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="+ Compose announcement" onClose={onClose} onSubmit={submit} busy={busy}>
      <Field label="CxProject ID" v={form.cxProjectId} on={set("cxProjectId")} />
      <Field label="Comm number (e.g. ANN-001)" v={form.commNumber} on={set("commNumber")} />
      <Field label="From company code" v={form.fromCompanyCode} on={set("fromCompanyCode")} />
      <Field label="Audience label" v={form.audienceLabel} on={set("audienceLabel")} />
      <Field label="Subject" v={form.subject} on={set("subject")} />
      <Field label="Body" v={form.body} on={set("body")} multiline rows={6} />
    </Modal>
  );
}

function RejectModal({ comm, onClose, onRejected, onError }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await rejectCommunication(comm.id, { reason });
      onRejected();
    } catch (e) {
      onError(e?.message ?? "Failed to reject");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={`Reject · ${comm.commNumber}`}
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      disabled={!reason.trim()}
      submitLabel="Reject"
    >
      <Field label="Reason (mandatory)" v={reason} on={(e) => setReason(e.target.value)} multiline rows={4} />
      <div
        style={{
          fontSize: 12,
          background: "#fef3c7",
          color: "#92400e",
          padding: 10,
          borderRadius: 8,
          lineHeight: 1.5,
        }}
      >
        The author will see this reason. They can revise and resubmit.
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, onSubmit, busy, disabled, submitLabel = "Save", children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: 12,
          width: 560,
          maxWidth: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {title}
        </div>
        <div style={{ padding: 20, display: "grid", gap: 12 }}>{children}</div>
        <div
          style={{
            padding: "12px 20px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: C.bgSoft,
          }}
        >
          <button onClick={onClose} style={btnSoft}>Cancel</button>
          <button onClick={onSubmit} disabled={busy || disabled} style={btnPri}>
            {busy ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, v, on, multiline, rows = 4 }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: C.textSoft,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {multiline ? (
        <textarea
          rows={rows}
          value={v}
          onChange={on}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            marginTop: 4,
          }}
        />
      ) : (
        <input
          value={v}
          onChange={on}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            marginTop: 4,
          }}
        />
      )}
    </div>
  );
}

const btnPri = {
  background: C.brand,
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 6,
  border: 0,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const btnSoft = {
  background: C.brandFade,
  color: C.brandH,
  padding: "5px 10px",
  borderRadius: 6,
  border: `1px solid ${C.brandSoft}`,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};
