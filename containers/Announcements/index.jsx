"use client";

import { useState, useEffect } from "react";
import {
  getReviewQueue,
  getReviewQueueCount,
  getCommTimeline,
  ackCommByOrg,
  approveAndPublishCommunication,
  rejectCommunication,
} from "@/services/Communications";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_POSTS = [
  {
    id: 1,
    status: "PENDING",
    authorInitials: "LP",
    authorColor: "#2ecc71",
    authorName: "Lisa Park",
    authorCompany: "Microsoft",
    authorRole: "Owner's Rep",
    timeAgo: "30m ago",
    title: "Customer request: Add load bank capacity for L5 IST",
    body: "Microsoft would like to expand load bank capacity for the May 19 IST window — 4MW total instead of 3MW currently planned. Need HITT to coordinate with Delta + Shermco on the additional infrastructure. Budget impact assessment requested. Schedule impact: aiming for zero. David approved on our side.",
    timeline: [
      {
        icon: "📋",
        label: "Drafted by customer",
        actor: "Lisa Park (MSFT)",
        time: "45s ago",
        active: false,
      },
      {
        icon: "🏠",
        label: "Submitted to GC for review",
        actor: "Lisa Park (MSFT)",
        time: "38m ago",
        active: false,
      },
      {
        icon: "❓",
        label: "Awaiting GC decision",
        actor: null,
        time: null,
        active: true,
      },
    ],
    comments: 0,
    reactions: 0,
    saves: 0,
  },
  {
    id: 2,
    status: "PUBLISHED",
    authorInitials: "SC",
    authorColor: "#3b82f6",
    authorName: "Sarah Chen",
    authorCompany: "HITT Contracting",
    authorRole: "GC Project Manager",
    timeAgo: "3d ago",
    title: "Welcome Shermo to the project",
    body: "Welcome Shermo Industries to MSFT-DC!! Adam Krol leading their NETA acceptance testing scope. They start L3.05 work next Monday. Their scope sheet is in Documents.",
    timeline: [
      {
        icon: "📋",
        label: "Drafted by GC PM",
        actor: "Sarah Chen (HITT)",
        time: "3d ago",
        active: false,
      },
      {
        icon: "📢",
        label: "Published direct",
        actor: "Sarah Chen (HITT)",
        time: "3d ago",
        active: false,
      },
    ],
    comments: 3,
    reactions: 8,
    saves: 4,
  },
];

const TABS = [
  { key: "all", label: "All visible", count: 9 },
  { key: "internal", label: "Internal", count: 0 },
  { key: "awaiting", label: "Awaiting my review", count: 3 },
  { key: "review_queue", label: "Pending GC Review", count: 0 },
  { key: "published", label: "Published", count: 6 },
  { key: "my", label: "My posts", count: 3 },
];

// ─── Escalation level label helper ────────────────────────────────────────────
const escalationLabel = (level) =>
  level > 0 ? `Level ${level} escalation` : "On time";
const escalationColor = (level) =>
  level >= 2 ? "var(--rf-red)" : level === 1 ? "var(--rf-yellow)" : "var(--rf-green)";

const REVIEW_ACTIONS = [
  { key: "approve", icon: "✅", label: "Approve & publish project-wide" },
  { key: "edit", icon: "✏️", label: "Edit and publish" },
  { key: "reject", icon: "✖", label: "Reject with feedback" },
  { key: "comment", icon: "💬", label: "Comment first" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.38,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: {
      label: "⏱ PENDING",
      background: "rgba(var(--rf-yellow-rgb, 200,144,0), 0.12)",
      color: "var(--rf-yellow)",
      border: "var(--rf-yellow)",
    },
    PUBLISHED: {
      label: "📢 PUBLISHED",
      background: "rgba(var(--rf-green-rgb, 22,163,74), 0.12)",
      color: "var(--rf-green)",
      border: "var(--rf-green)",
    },
    INTERNAL: {
      label: "🏠 INTERNAL",
      background: "var(--rf-glow)",
      color: "var(--rf-accent)",
      border: "var(--rf-accent)",
    },
    REJECTED: {
      label: "✖ REJECTED",
      background: "rgba(var(--rf-red-rgb, 220,38,38), 0.12)",
      color: "var(--rf-red)",
      border: "var(--rf-red)",
    },
  };
  const s = styles[status] ?? styles.PENDING;
  return (
    <span
      style={{
        background: s.background,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function Timeline({ steps }) {
  return (
    <div
      style={{
        background: "var(--rf-bg3)",
        border: "1px solid var(--rf-border)",
        borderRadius: 8,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 4,
        fontSize: 12,
        color: "var(--rf-txt2)",
        margin: "14px 0 0",
      }}
    >
      {steps.map((step, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {i > 0 && (
            <span
              style={{
                margin: "0 6px",
                color: "var(--rf-txt3)",
                fontWeight: 700,
              }}
            >
              →
            </span>
          )}
          <span
            style={
              step.active
                ? {
                    background: "rgba(var(--rf-yellow-rgb, 200,144,0), 0.15)",
                    border: "1.5px solid var(--rf-yellow)",
                    borderRadius: 6,
                    padding: "2px 10px",
                    color: "var(--rf-yellow)",
                    fontWeight: 600,
                  }
                : {}
            }
          >
            {step.icon}{" "}
            <strong style={{ fontWeight: 600, color: "var(--rf-txt)" }}>
              {step.label}
            </strong>
            {step.actor && (
              <span style={{ color: "var(--rf-txt3)" }}>
                {" "}
                · {step.actor} {step.time}
              </span>
            )}
          </span>
        </span>
      ))}
    </div>
  );
}

function ReviewActions({ postId, selected, onSelect }) {
  return (
    <div
      style={{
        background: "rgba(var(--rf-yellow-rgb, 200,144,0), 0.08)",
        border: "1px solid var(--rf-yellow)",
        borderRadius: 8,
        padding: "14px 16px",
        marginTop: 12,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--rf-yellow)",
          marginBottom: 10,
        }}
      >
        ⏱ Decide what to do with this submission
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {REVIEW_ACTIONS.map((action) => {
          const isSelected = selected === action.key;
          return (
            <button
              key={action.key}
              onClick={() => onSelect(postId, action.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 6,
                border: isSelected
                  ? "2px solid var(--rf-accent)"
                  : "1.5px solid var(--rf-border2)",
                background: isSelected ? "var(--rf-accent)" : "var(--rf-bg2)",
                color: isSelected ? "#fff" : "var(--rf-txt)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  e.currentTarget.style.borderColor = "var(--rf-accent)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.borderColor = "var(--rf-border2)";
              }}
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PostFooter({ comments, reactions, saves, showCounts }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 14,
        paddingTop: 12,
        borderTop: "1px solid var(--rf-border)",
      }}
    >
      <div style={{ display: "flex", gap: 18 }}>
        {[
          `💬 ${comments} comment${comments !== 1 ? "s" : ""}`,
          "👍 React",
          "📌 Save",
        ].map((label) => (
          <button
            key={label}
            style={{
              background: "none",
              border: "none",
              color: "var(--rf-txt2)",
              fontSize: 13,
              cursor: "pointer",
              padding: "2px 6px",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--rf-accent)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--rf-txt2)")
            }
          >
            {label}
          </button>
        ))}
      </div>
      {showCounts && (
        <div style={{ display: "flex", gap: 10 }}>
          <span
            style={{
              background: "var(--rf-bg3)",
              border: "1px solid var(--rf-border)",
              borderRadius: 20,
              padding: "2px 12px",
              fontSize: 13,
              color: "var(--rf-txt2)",
              fontWeight: 500,
            }}
          >
            👍 {reactions}
          </span>
          <span
            style={{
              background: "var(--rf-bg3)",
              border: "1px solid var(--rf-border)",
              borderRadius: 20,
              padding: "2px 12px",
              fontSize: 13,
              color: "var(--rf-txt2)",
              fontWeight: 500,
            }}
          >
            📌 {saves}
          </span>
        </div>
      )}
    </div>
  );
}

function PostCard({ post, reviewAction, onReviewSelect }) {
  return (
    <div
      style={{
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border)",
        borderRadius: 12,
        padding: "18px 20px",
        marginBottom: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar initials={post.authorInitials} color={post.authorColor} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{ fontWeight: 700, fontSize: 15, color: "var(--rf-txt)" }}
            >
              {post.authorName}
            </span>
            <StatusBadge status={post.status} />
          </div>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)", marginTop: 2 }}>
            {post.authorCompany} · {post.authorRole} · {post.timeAgo}
          </div>
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: "var(--rf-txt)",
          margin: "12px 0 6px",
        }}
      >
        {post.title}
      </div>

      {/* Body */}
      <div style={{ fontSize: 14, color: "var(--rf-txt2)", lineHeight: 1.6 }}>
        {post.body}
      </div>

      {/* Timeline */}
      <Timeline steps={post.timeline} />

      {/* Review actions for PENDING posts */}
      {post.status === "PENDING" && (
        <ReviewActions
          postId={post.id}
          selected={reviewAction}
          onSelect={onReviewSelect}
        />
      )}

      {/* Footer */}
      <PostFooter
        comments={post.comments}
        reactions={post.reactions}
        saves={post.saves}
        showCounts={post.status === "PUBLISHED" && post.reactions > 0}
      />
    </div>
  );
}

// ─── Main container ───────────────────────────────────────────────────────────

// ─── Review queue sub-component ──────────────────────────────────────────────

function ReviewQueueTab({ rows, loading, onApprove, onReject }) {
  if (loading)
    return <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>Loading review queue...</div>;
  if (!rows.length)
    return <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>No communications pending GC review.</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rf-border)", background: "var(--rf-bg3)" }}>
            {["Comm #", "Subject", "Type", "From", "Due", "Escalation", "Actions"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.communicationId} style={{ borderBottom: "1px solid var(--rf-border)", transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-bg3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <td style={{ padding: "11px 14px", fontWeight: 700, color: "var(--rf-accent)", whiteSpace: "nowrap" }}>{r.commNumber}</td>
              <td style={{ padding: "11px 14px", color: "var(--rf-txt)", maxWidth: 240 }}>{r.subject}</td>
              <td style={{ padding: "11px 14px", color: "var(--rf-txt3)", whiteSpace: "nowrap", fontSize: 11 }}>{r.commType}</td>
              <td style={{ padding: "11px 14px", color: "var(--rf-txt2)", whiteSpace: "nowrap" }}>{r.fromCompanyCode}</td>
              <td style={{ padding: "11px 14px", color: "var(--rf-txt3)", whiteSpace: "nowrap", fontSize: 12 }}>
                {r.reviewDueAt ? new Date(r.reviewDueAt).toLocaleDateString() : "—"}
              </td>
              <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: escalationColor(r.escalationLevel) }}>
                  {escalationLabel(r.escalationLevel)}
                </span>
              </td>
              <td style={{ padding: "11px 14px" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => onApprove(r.communicationId)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "rgba(16,185,129,0.15)", color: "var(--rf-green)", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    ✅ Approve
                  </button>
                  <button onClick={() => onReject(r.communicationId)}
                    style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "rgba(239,68,68,0.12)", color: "var(--rf-red)", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    ✖ Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AnnouncementsContainer() {
  const [activeTab, setActiveTab] = useState("all");
  const [reviewActions, setReviewActions] = useState({ 1: "approve" });
  const [reviewQueue, setReviewQueue] = useState([]);
  const [reviewQueueLoading, setReviewQueueLoading] = useState(false);
  const [queueCount, setQueueCount] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const cnt = await getReviewQueueCount();
        setQueueCount(cnt?.count ?? 0);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (activeTab !== "review_queue") return;
    (async () => {
      setReviewQueueLoading(true);
      try {
        const data = await getReviewQueue();
        setReviewQueue(Array.isArray(data) ? data : []);
      } catch {
        setReviewQueue([]);
      } finally {
        setReviewQueueLoading(false);
      }
    })();
  }, [activeTab]);

  const handleApprove = async (commId) => {
    try {
      await approveAndPublishCommunication(commId);
      setReviewQueue((prev) => prev.filter((r) => r.communicationId !== commId));
      setQueueCount((c) => Math.max(0, c - 1));
      setToast("Communication approved and published");
      setTimeout(() => setToast(null), 2800);
    } catch {
      setToast("Failed to approve");
      setTimeout(() => setToast(null), 2800);
    }
  };

  const handleReject = async (commId) => {
    const reason = window.prompt("Rejection reason (required):");
    if (!reason?.trim()) return;
    try {
      await rejectCommunication(commId, { reason });
      setReviewQueue((prev) => prev.filter((r) => r.communicationId !== commId));
      setQueueCount((c) => Math.max(0, c - 1));
      setToast("Communication rejected");
      setTimeout(() => setToast(null), 2800);
    } catch {
      setToast("Failed to reject");
      setTimeout(() => setToast(null), 2800);
    }
  };

  const handleReviewSelect = (postId, action) => {
    setReviewActions((prev) => ({ ...prev, [postId]: action }));
  };

  const tabsWithCount = TABS.map((t) =>
    t.key === "review_queue" ? { ...t, count: queueCount } : t
  );

  return (
    <div
      style={{
        fontFamily: "Gilroy, Inter, system-ui, sans-serif",
        margin: "0 auto",
        padding: "24px 16px",
        color: "var(--rf-txt)",
      }}
    >
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--rf-txt)",
              margin: 0,
            }}
          >
            Announcements
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--rf-accent)",
              margin: "4px 0 0",
              maxWidth: 520,
            }}
          >
            Posts flow through the GC. Companies post internally, submit to the
            GC for review, and the GC publishes project-wide so all companies
            see it.
          </p>
        </div>
        <button
          style={{
            background: "var(--rf-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "9px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 8px var(--rf-glow)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--rf-accent2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--rf-accent)")
          }
        >
          + New post
        </button>
      </div>

      {/* ── Compose bar ── */}
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 12,
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "20px 0 0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Avatar initials="SC" color="#3b82f6" size={36} />
        <input
          type="text"
          placeholder="Share an update from HITT Contracting…"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: 14,
            color: "var(--rf-txt2)",
            background: "transparent",
          }}
        />
        <button
          style={{
            background: "none",
            border: "1.5px solid var(--rf-border2)",
            borderRadius: 7,
            padding: "6px 14px",
            fontSize: 13,
            color: "var(--rf-txt)",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.borderColor = "var(--rf-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = "var(--rf-border2)")
          }
        >
          <span style={{ fontSize: 15 }}>📝</span> Compose
        </button>
      </div>

      {/* ── Review banner ── */}
      <div
        style={{
          background: "rgba(var(--rf-yellow-rgb, 200,144,0), 0.08)",
          border: "1px solid var(--rf-yellow)",
          borderRadius: 10,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          margin: "12px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>⏳</span>
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--rf-yellow)",
                fontSize: 14,
              }}
            >
              3 items awaiting your review
            </div>
            <div
              style={{ fontSize: 13, color: "var(--rf-txt2)", marginTop: 2 }}
            >
              As GC PM you decide what gets broadcast project-wide.{" "}
              <a
                href="#"
                style={{
                  color: "var(--rf-yellow)",
                  textDecoration: "underline",
                }}
              >
                Click to review →
              </a>
            </div>
          </div>
        </div>
        <button
          style={{
            background: "var(--rf-yellow)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 18px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--rf-yellow2)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--rf-yellow)")
          }
        >
          Review now
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "2px solid var(--rf-border)",
          margin: "20px 0 0",
          flexWrap: "wrap",
        }}
      >
        {tabsWithCount.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: "none",
                border: "none",
                borderBottom: isActive
                  ? "2px solid var(--rf-accent)"
                  : "2px solid transparent",
                marginBottom: -2,
                padding: "10px 14px",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "var(--rf-accent)" : "var(--rf-txt2)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
              <span
                style={{
                  background:
                    tab.key === "awaiting"
                      ? "var(--rf-yellow)"
                      : isActive
                        ? "var(--rf-glow)"
                        : "var(--rf-bg3)",
                  color:
                    tab.key === "awaiting"
                      ? "#fff"
                      : isActive
                        ? "var(--rf-accent)"
                        : "var(--rf-txt2)",
                  borderRadius: 12,
                  padding: "1px 7px",
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 20,
                  textAlign: "center",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Info banner ── */}
      <div
        style={{
          background: "var(--rf-glow)",
          border: "1px solid var(--rf-border2)",
          borderRadius: 10,
          padding: "12px 16px",
          margin: "16px 0",
          fontSize: 13,
          color: "var(--rf-txt2)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 18 }}>💡</span>
        <span>
          <strong style={{ color: "var(--rf-txt)" }}>
            How announcement flow works.
          </strong>{" "}
          Sarah Chen sees{" "}
          <strong style={{ color: "var(--rf-accent)" }}>9 of 13 posts</strong>.
          As GC PM at HITT Contracting, you also see pending submissions from
          other companies that need your review and approval before going
          project-wide.
        </span>
      </div>

      {/* ── Review queue tab body ── */}
      {activeTab === "review_queue" ? (
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, overflow: "hidden", marginTop: 16 }}>
          <ReviewQueueTab
            rows={reviewQueue}
            loading={reviewQueueLoading}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      ) : (
        /* ── Post cards ── */
        <div>
          {MOCK_POSTS.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              reviewAction={reviewActions[post.id]}
              onReviewSelect={handleReviewSelect}
            />
          ))}
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 2000, background: "var(--rf-bg2)", border: "1px solid var(--rf-green)", color: "var(--rf-green)", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
