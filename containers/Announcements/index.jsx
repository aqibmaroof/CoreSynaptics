"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
} from "@/services/Announcements";
import { getUser, getOrganization } from "@/services/instance/tokenService";

// ── UI maps ──────────────────────────────────────────────────────────────────

const TAB_META = {
  all:       { label: "All visible",        icon: null },
  internal:  { label: "Internal",           icon: "💼" },
  pending:   { label: "Pending GC review",  icon: "⏳" },
  published: { label: "Published",          icon: "📣" },
  mine:      { label: "My posts",           icon: null },
  rejected:  { label: "Rejected",           icon: "✗" },
};

// Maps tab → count-bucket key returned by announcementTabCounts. Unknown
// keys fall back to 0 in the UI; the server is the source of truth.
const TAB_COUNT_KEYS = {
  all: "ALL",
  internal: "INTERNAL",
  pending: "SUBMITTED",
  published: "PUBLISHED",
  mine: "MINE",
  rejected: "REJECTED",
};

const STATUS_DISPLAY = {
  DRAFT: {
    label: "DRAFT", icon: "📝",
    fg: "var(--rf-txt3)",
    bg: "var(--rf-bg3)",
    border: "var(--rf-border)",
  },
  SUBMITTED: {
    label: "PENDING", icon: "⏳",
    fg: "var(--rf-yellow2)",
    bg: "color-mix(in srgb, var(--rf-yellow) 18%, transparent)",
    border: "var(--rf-yellow)",
  },
  UNDER_REVIEW: {
    label: "IN REVIEW", icon: "👁",
    fg: "var(--rf-yellow2)",
    bg: "color-mix(in srgb, var(--rf-yellow) 18%, transparent)",
    border: "var(--rf-yellow)",
  },
  APPROVED: {
    label: "APPROVED", icon: "✓",
    fg: "var(--rf-green2)",
    bg: "color-mix(in srgb, var(--rf-green) 16%, transparent)",
    border: "var(--rf-green)",
  },
  PUBLISHED: {
    label: "PUBLISHED", icon: "📣",
    fg: "var(--rf-green2)",
    bg: "color-mix(in srgb, var(--rf-green) 18%, transparent)",
    border: "transparent",
  },
  REJECTED: {
    label: "REJECTED", icon: "✗",
    fg: "var(--rf-red2)",
    bg: "color-mix(in srgb, var(--rf-red) 14%, transparent)",
    border: "var(--rf-red)",
  },
  ARCHIVED: {
    label: "ARCHIVED", icon: "📦",
    fg: "var(--rf-txt3)",
    bg: "var(--rf-bg3)",
    border: "var(--rf-border)",
  },
};

const AVATAR_PALETTE = [
  "var(--rf-accent)",
  "var(--rf-accent2)",
  "var(--rf-purple)",
  "var(--rf-teal)",
  "var(--rf-orange)",
  "var(--rf-green)",
];

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

// ── Helpers ──────────────────────────────────────────────────────────────────

function safeParseJSON(s) {
  if (!s || typeof s !== "string") return null;
  try { return JSON.parse(s); } catch { return null; }
}

function readCurrentUser() {
  const u = safeParseJSON(getUser()) || {};
  const o = safeParseJSON(getOrganization()) || {};
  const name =
    u.fullName ||
    u.name ||
    [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
    u.email ||
    "";
  return {
    name,
    company: o.name || o.legalName || u.companyName || "your company",
  };
}

function timeAgo(iso) {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (!t || Number.isNaN(t)) return "";
  const sec = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 86400 * 30) return `${Math.floor(sec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(name) {
  if (!name) return "??";
  const parts = String(name).trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return String(name).slice(0, 2).toUpperCase();
}

function avatarColor(seed) {
  if (!seed) return AVATAR_PALETTE[0];
  let h = 0;
  for (let i = 0; i < String(seed).length; i++) {
    h = (h * 31 + String(seed).charCodeAt(i)) % 9973;
  }
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
}

// ── Main component ──────────────────────────────────────────────────────────

export default function Announcements({ cxProjectId }) {
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({});
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const me = useMemo(() => readCurrentUser(), []);

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

  const totalPosts = useMemo(() => {
    const c = counts || {};
    if (typeof c.ALL === "number") return c.ALL;
    // fall back to sum of known status buckets
    return ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "PUBLISHED", "REJECTED"]
      .reduce((acc, k) => acc + (typeof c[k] === "number" ? c[k] : 0), 0);
  }, [counts]);

  const visibleCount = useMemo(() => {
    const k = TAB_COUNT_KEYS[tab];
    if (k && typeof counts?.[k] === "number") return counts[k];
    return rows.length;
  }, [counts, tab, rows.length]);

  return (
    <div style={{ padding: 24, margin: "0 auto" }}>
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
        <div style={{ maxWidth: 720 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--rf-txt)", margin: 0 }}>
            Announcements
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
            Posts flow through the GC. Companies post internally, submit to the GC for review,
            and the GC publishes project-wide so all companies see it.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setComposeOpen(true)}
        >
          + New post
        </button>
      </header>

      {/* Compose stub */}
      <button
        type="button"
        onClick={() => setComposeOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: 12,
          marginBottom: 14,
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
          border: "1px solid var(--rf-border)",
          borderRadius: 999,
          background: "var(--rf-bg2)",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: avatarColor(me.name || "me"),
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials(me.name) || "CR"}
        </div>
        <div style={{ flex: 1, color: "var(--rf-txt3)", fontSize: 13 }}>
          Share an update from {me.company || "your company"}…
        </div>
        <span
          className="rf-btn"
          style={{ pointerEvents: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          📣 Compose
        </span>
      </button>

      {/* Tabs (underlined) */}
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 14,
          borderBottom: "1px solid var(--rf-border)",
          flexWrap: "wrap",
        }}
      >
        {ANNOUNCEMENT_TABS.map((t) => {
          const meta = TAB_META[t] || { label: t, icon: null };
          const countKey = TAB_COUNT_KEYS[t];
          let count = 0;
          if (countKey && typeof counts?.[countKey] === "number") count = counts[countKey];
          else if (t === tab) count = rows.length;
          const active = tab === t;
          return (
            <button
              key={t}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t)}
              style={{
                background: "transparent",
                border: "none",
                padding: "10px 14px",
                marginBottom: -1,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "var(--rf-accent)" : "var(--rf-txt2)",
                borderBottom: active
                  ? "2px solid var(--rf-accent)"
                  : "2px solid transparent",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {meta.icon && <span aria-hidden>{meta.icon}</span>}
              <span>{meta.label}</span>
              <span
                style={{
                  background: active
                    ? "color-mix(in srgb, var(--rf-accent) 16%, transparent)"
                    : "var(--rf-bg3)",
                  color: active ? "var(--rf-accent)" : "var(--rf-txt3)",
                  padding: "1px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 22,
                  textAlign: "center",
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info banner */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          padding: "12px 16px",
          background: "color-mix(in srgb, var(--rf-accent) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--rf-accent) 18%, transparent)",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>💡</span>
        <div style={{ fontSize: 12, color: "var(--rf-txt2)", lineHeight: 1.5 }}>
          <b style={{ color: "var(--rf-txt)" }}>How announcement flow works.</b>{" "}
          {me.name ? `${me.name} sees ` : "You see "}
          <b>
            {visibleCount} of {totalPosts || visibleCount} posts
          </b>
          . Internal posts at {me.company || "your company"} stay inside {me.company || "your company"}.
          To broadcast project-wide, submit to GC — they review internally and publish.
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
            color: "var(--rf-red2)",
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", padding: 16 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 36,
            textAlign: "center",
            color: "var(--rf-txt3)",
            background: "var(--rf-bg2)",
            border: "1px dashed var(--rf-border)",
            borderRadius: 10,
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

// ── Card ─────────────────────────────────────────────────────────────────────

function AnnouncementCard({ announcement: a, onReview, onChange }) {
  const display = STATUS_DISPLAY[a.status] || STATUS_DISPLAY.DRAFT;
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

  const authorName =
    a.authorName ||
    a.author?.name ||
    a.authorFullName ||
    (a.authorUserId ? `User ${String(a.authorUserId).slice(0, 6)}` : "Unknown author");
  const authorCompany = a.authorCompany || a.author?.company || a.companyName || "";
  const authorRole = a.authorRole || a.author?.role || "";
  const postedAt = a.publishedAt || a.submittedAt || a.createdAt;
  const ago = timeAgo(postedAt);
  const avBg = avatarColor(String(a.authorUserId || authorName));

  // Build the workflow flow chain from server-provided timestamps.
  const flow = [];
  if (a.createdAt) {
    flow.push({
      icon: "📝",
      label: a.scope === "INTERNAL" ? "Drafted internally" : "Drafted by author",
      by: authorName + (authorCompany ? ` (${authorCompany})` : ""),
      when: timeAgo(a.createdAt),
    });
  }
  if (a.submittedAt) {
    flow.push({
      icon: "📤",
      label: "Submitted to GC for review",
      by: authorName + (authorCompany ? ` (${authorCompany})` : ""),
      when: timeAgo(a.submittedAt),
    });
  }
  if (a.publishedAt) {
    flow.push({
      icon: "📣",
      label: a.submittedAt ? "Published by GC" : "Published direct",
      by: authorName + (authorCompany ? ` (${authorCompany})` : ""),
      when: timeAgo(a.publishedAt),
    });
  }
  let tail = null;
  if (a.status === "SUBMITTED" || a.status === "UNDER_REVIEW") {
    tail = { icon: "❓", label: "Awaiting GC decision", pending: true };
  } else if (a.status === "REJECTED" && !a.publishedAt) {
    tail = { icon: "✗", label: "Rejected by GC", error: true };
  } else if (a.status === "APPROVED" && !a.publishedAt) {
    tail = { icon: "✓", label: "Approved · awaiting publish", pending: true };
  }

  const hasReactions = (a.reactionCount ?? 0) > 0;

  return (
    <li
      className="rf-card"
      style={{
        padding: 16,
        marginBottom: 12,
        borderLeft: `4px solid ${display.border}`,
        position: "relative",
      }}
    >
      {/* Top row: avatar + author + status pill */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div
          aria-hidden
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: avBg,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials(authorName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--rf-txt)" }}>
            {authorName}
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 2 }}>
            {[authorCompany, authorRole, ago].filter(Boolean).join(" · ")}
          </div>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "4px 10px",
            background: display.bg,
            color: display.fg,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.05em",
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          <span aria-hidden>{display.icon}</span>
          {display.label}
        </span>
      </div>

      {/* Title + body */}
      <div style={{ marginTop: 12, marginLeft: 52 }}>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--rf-txt)",
            marginBottom: 6,
          }}
        >
          {a.title}
        </div>
        {a.body && (
          <div
            style={{
              fontSize: 13,
              color: "var(--rf-txt2)",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
            }}
          >
            {a.body}
          </div>
        )}
      </div>

      {/* Rejection reason */}
      {a.rejectionReason && (
        <div
          style={{
            marginTop: 10,
            marginLeft: 52,
            padding: 10,
            background: "color-mix(in srgb, var(--rf-red) 10%, transparent)",
            color: "var(--rf-red2)",
            borderRadius: 6,
            fontSize: 12,
            borderLeft: "3px solid var(--rf-red)",
          }}
        >
          <b>Rejected:</b> {a.rejectionReason}
        </div>
      )}

      {/* Workflow flow chain */}
      {(flow.length > 0 || tail) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            alignItems: "center",
            marginTop: 12,
            marginLeft: 52,
            padding: "10px 12px",
            background: "var(--rf-bg3)",
            borderRadius: 8,
          }}
        >
          {flow.map((step, i) => (
            <FlowChip key={i} step={step} arrow={i < flow.length - 1 || !!tail} />
          ))}
          {tail && <FlowChip step={tail} arrow={false} />}
        </div>
      )}

      {/* Bottom row: social + workflow actions + reaction tallies */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          marginLeft: 52,
          paddingTop: 10,
          borderTop: "1px solid var(--rf-border)",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <SocialBtn icon="💬" label={`${a.commentCount ?? 0} comments`} />
          <SocialBtn icon="👏" label="React" color="var(--rf-orange)" />
          <SocialBtn icon="🚩" label="Save" color="var(--rf-red)" />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {a.status === "PUBLISHED" && hasReactions && (
            <span
              style={{
                padding: "4px 10px",
                background: "var(--rf-bg3)",
                borderRadius: 999,
                fontSize: 12,
                color: "var(--rf-txt2)",
              }}
            >
              👍 {a.reactionCount}
            </span>
          )}
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
            <>
              <button
                className="rf-btn"
                disabled={busy}
                onClick={() => action(() => startAnnouncementReview(a.id))}
              >
                Claim &amp; review
              </button>
              <button
                className="rf-btn rf-btn-primary"
                disabled={busy}
                onClick={onReview}
              >
                Approve / Reject
              </button>
            </>
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
      </div>
    </li>
  );
}

function FlowChip({ step, arrow }) {
  const pending = step.pending;
  const error = step.error;
  const bg = pending
    ? "color-mix(in srgb, var(--rf-yellow) 16%, transparent)"
    : error
    ? "color-mix(in srgb, var(--rf-red) 12%, transparent)"
    : "var(--rf-bg2)";
  const border = pending
    ? "1px dashed var(--rf-yellow)"
    : error
    ? "1px solid var(--rf-red)"
    : "1px solid var(--rf-border)";
  const color = pending
    ? "var(--rf-yellow2)"
    : error
    ? "var(--rf-red2)"
    : "var(--rf-txt2)";
  return (
    <>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          background: bg,
          border,
          borderRadius: 6,
          fontSize: 11,
          color,
        }}
      >
        <span aria-hidden>{step.icon}</span>
        <span style={{ fontWeight: 600 }}>{step.label}</span>
        {step.by && (
          <span style={{ color: "var(--rf-txt3)" }}>· {step.by}</span>
        )}
        {step.when && (
          <span
            style={{
              color: "var(--rf-txt3)",
              fontSize: 10,
              fontFamily: MONO,
              marginLeft: 2,
            }}
          >
            {step.when}
          </span>
        )}
      </div>
      {arrow && (
        <span aria-hidden style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          →
        </span>
      )}
    </>
  );
}

function SocialBtn({ icon, label, color }) {
  return (
    <button
      type="button"
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "var(--rf-txt2)",
      }}
    >
      <span aria-hidden style={{ fontSize: 14, color: color || undefined }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

// ── Modals (unchanged behavior) ──────────────────────────────────────────────

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
        New post
      </h2>
      {error && (
        <div
          style={{
            padding: 8,
            background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
            color: "var(--rf-red2)",
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
              {s === "PROJECT" ? "Project-wide (submit to GC)" : "My company only"}
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
          {scope === "PROJECT" ? "Submit to GC" : "Publish internally"}
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
            background: "color-mix(in srgb, var(--rf-red) 12%, transparent)",
            color: "var(--rf-red2)",
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
          Approve &amp; publish
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
