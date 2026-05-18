"use client";

// ── Phase v15 B1: Announcements workspace ────────────────────────────────────
// Drives the DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → PUBLISHED workflow
// via the dedicated endpoints. Never compute "can publish?" locally; the
// server enforces every gate.

import { useCallback, useEffect, useState } from "react";
import {
  listAnnouncements,
  announcementTabCounts,
  createAnnouncement,
  submitAnnouncement,
  startAnnouncementReview,
  approveAnnouncement,
  publishAnnouncement,
  rejectAnnouncement,
  archiveAnnouncement,
  ANNOUNCEMENT_SCOPES,
  ANNOUNCEMENT_TABS,
  ANNOUNCEMENT_STATUS_STYLE,
} from "@/services/Announcements";

const TAB_TO_STATUS = {
  pending: "SUBMITTED",
  published: "PUBLISHED",
  rejected: "REJECTED",
};

export default function Announcements({ cxProjectId }) {
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const reload = useCallback(
    async (reset = true) => {
      setLoading(true);
      setError("");
      try {
        const [list, t] = await Promise.all([
          listAnnouncements({
            tab,
            cursor: reset ? undefined : cursor || undefined,
            limit: 50,
          }),
          announcementTabCounts(cxProjectId).catch(() => ({})),
        ]);
        const items = Array.isArray(list?.data)
          ? list.data
          : Array.isArray(list)
          ? list
          : list?.items ?? [];
        setRows((prev) => (reset ? items : [...prev, ...items]));
        setCursor(list?.nextCursor ?? null);
        setCounts(t || {});
      } catch (e) {
        setError(e?.message || "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    },
    [tab, cursor, cxProjectId]
  );

  useEffect(() => {
    reload(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            📢 Announcements
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Server-owned DRAFT → SUBMITTED → APPROVED → PUBLISHED workflow.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setComposeOpen(true)}
        >
          + New post
        </button>
      </header>

      <div
        style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}
      >
        {ANNOUNCEMENT_TABS.map((t) => {
          const statusKey = TAB_TO_STATUS[t];
          const count = statusKey ? counts[statusKey] : undefined;
          return (
            <button
              key={t}
              className={`rf-btn ${tab === t ? "rf-btn-primary" : ""}`}
              onClick={() => setTab(t)}
            >
              {t}
              {count != null ? ` (${count})` : ""}
            </button>
          );
        })}
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

      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No announcements in this tab.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              onReview={() => setReviewTarget(a)}
              onChange={() => reload(true)}
            />
          ))}
        </ul>
      )}

      {cursor && (
        <button
          className="rf-btn"
          onClick={() => reload(false)}
          disabled={loading}
          style={{ marginTop: 12 }}
        >
          {loading ? "…" : "Load more"}
        </button>
      )}

      {composeOpen && (
        <ComposeModal
          cxProjectId={cxProjectId}
          onClose={() => setComposeOpen(false)}
          onCreated={() => {
            setComposeOpen(false);
            reload(true);
          }}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          announcement={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onChange={() => {
            setReviewTarget(null);
            reload(true);
          }}
        />
      )}
    </div>
  );
}

function AnnouncementCard({ announcement: a, onReview, onChange }) {
  const sty =
    ANNOUNCEMENT_STATUS_STYLE[a.status] || ANNOUNCEMENT_STATUS_STYLE.DRAFT;
  const [busy, setBusy] = useState(false);

  const action = async (fn) => {
    setBusy(true);
    try {
      await fn();
      onChange?.();
    } catch (e) {
      alert(e?.message || "Action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="rf-card" style={{ padding: 14, marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 4,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 4,
            background: sty.bg,
            color: sty.color,
          }}
        >
          {a.status}
        </span>
        <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>{a.scope}</span>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{a.title}</span>
      </div>
      <div style={{ fontSize: 13, color: "var(--rf-txt2)" }}>{a.body}</div>
      <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 6 }}>
        by {String(a.authorUserId).slice(0, 8)}
        {a.publishedAt
          ? ` · published ${new Date(a.publishedAt).toLocaleString()}`
          : a.submittedAt
          ? ` · submitted ${new Date(a.submittedAt).toLocaleString()}`
          : a.createdAt
          ? ` · created ${new Date(a.createdAt).toLocaleString()}`
          : ""}
        {" · "}
        {a.reactionCount ?? 0} reactions · {a.commentCount ?? 0} comments
      </div>
      {a.rejectionReason && (
        <div
          style={{
            marginTop: 6,
            padding: 6,
            background: "rgba(239,68,68,0.08)",
            color: "var(--rf-red)",
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          Rejected: {a.rejectionReason}
        </div>
      )}
      <div
        style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}
      >
        {a.status === "DRAFT" && (
          <button
            className="rf-btn rf-btn-primary"
            disabled={busy}
            onClick={() => action(() => submitAnnouncement(a.id))}
          >
            Submit to GC
          </button>
        )}
        {(a.status === "SUBMITTED" || a.status === "UNDER_REVIEW") && (
          <button
            className="rf-btn"
            disabled={busy}
            onClick={() => action(() => startAnnouncementReview(a.id))}
          >
            Claim & review
          </button>
        )}
        {(a.status === "SUBMITTED" || a.status === "UNDER_REVIEW") && (
          <button className="rf-btn" disabled={busy} onClick={onReview}>
            Approve / Reject
          </button>
        )}
        {a.status === "APPROVED" && (
          <button
            className="rf-btn rf-btn-primary"
            disabled={busy}
            onClick={() => action(() => publishAnnouncement(a.id))}
          >
            Publish
          </button>
        )}
        {(a.status === "PUBLISHED" || a.status === "REJECTED") && (
          <button
            className="rf-btn"
            disabled={busy}
            onClick={() => action(() => archiveAnnouncement(a.id))}
            style={{ color: "var(--rf-txt3)" }}
          >
            Archive
          </button>
        )}
      </div>
    </li>
  );
}

function ComposeModal({ cxProjectId, onClose, onCreated }) {
  const [scope, setScope] = useState("PROJECT");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async (asDraftOnly) => {
    setBusy(true);
    setError("");
    try {
      const created = await createAnnouncement({
        scope,
        cxProjectId: scope === "PROJECT" ? cxProjectId || undefined : undefined,
        title,
        body,
      });
      if (!asDraftOnly) await submitAnnouncement(created.id);
      onCreated?.(created.id);
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        📢 New post
      </h2>
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
      <Field label="Scope">
        <select
          className="rf-input"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          {ANNOUNCEMENT_SCOPES.filter((s) => s !== "GLOBAL").map((s) => (
            <option key={s} value={s}>
              {s === "PROJECT" ? "Project-wide" : "My company only"}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Subject">
        <input
          className="rf-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
        />
      </Field>
      <Field label="Body">
        <textarea
          className="rf-input"
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
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
          onClick={() => save(true)}
          disabled={busy || !title.trim()}
        >
          Save draft
        </button>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => save(false)}
          disabled={busy || !title.trim() || !body.trim()}
        >
          Submit to GC
        </button>
      </div>
    </Modal>
  );
}

function ReviewModal({ announcement, onClose, onChange }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const approve = async (publishNow) => {
    setBusy(true);
    setError("");
    try {
      await approveAnnouncement(announcement.id, publishNow);
      onChange?.();
    } catch (e) {
      setError(e?.message || "Approve failed");
    } finally {
      setBusy(false);
    }
  };
  const reject = async () => {
    if (!reason.trim()) return;
    setBusy(true);
    setError("");
    try {
      await rejectAnnouncement(announcement.id, reason.trim());
      onChange?.();
    } catch (e) {
      setError(e?.message || "Reject failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Review</h2>
      <div style={{ fontSize: 12, color: "var(--rf-txt3)", marginBottom: 10 }}>
        {announcement.title}
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
      <div
        style={{
          fontSize: 13,
          color: "var(--rf-txt2)",
          padding: 10,
          background: "var(--rf-bg2)",
          borderRadius: 6,
          marginBottom: 10,
          whiteSpace: "pre-wrap",
        }}
      >
        {announcement.body}
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          className="rf-btn rf-btn-primary"
          disabled={busy}
          onClick={() => approve(true)}
        >
          Approve & publish
        </button>
        <button
          className="rf-btn"
          disabled={busy}
          onClick={() => approve(false)}
        >
          Approve (defer publish)
        </button>
      </div>
      <hr
        style={{
          margin: "12px 0",
          border: "none",
          borderTop: "1px solid var(--rf-border)",
        }}
      />
      <Field label="Reason for rejection (required to reject)">
        <input
          className="rf-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className="rf-btn" onClick={onClose}>
          Cancel
        </button>
        <button
          className="rf-btn"
          onClick={reject}
          disabled={busy || !reason.trim()}
          style={{ color: "var(--rf-red)" }}
        >
          Reject with feedback
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }) {
  return (
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
      onClick={onClose}
    >
      <div
        className="rf-card"
        style={{
          padding: 20,
          maxWidth: 640,
          width: "100%",
          maxHeight: "92vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
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
