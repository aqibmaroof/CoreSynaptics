"use client";

// ── Phase 5 PR-3: Notification inbox ─────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  myNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NOTIFICATION_PRIORITY_STYLE,
  NOTIFICATION_CATEGORIES,
} from "@/services/Notifications";
import { useRealtimeSocket } from "@/lib/realtime/useRealtimeSocket";
import { onEnvelope } from "@/lib/realtime/envelope";

export default function NotificationsInbox() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("unread");
  const [category, setCategory] = useState("");
  const socket = useRealtimeSocket();

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit: 100 };
      if (tab === "unread") params.unreadOnly = true;
      if (category) params.category = category;
      const xs = await myNotifications(params);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [tab, category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!socket) return;
    const off = onEnvelope(socket, "notification.created", () => refresh());
    return () => off();
  }, [socket, refresh]);

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Mark-read failed");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      await refresh();
    } catch (e) {
      setError(e?.message || "Mark-all failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
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
            Notifications
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Your inbox across approvals, automation, and operational events.
          </p>
        </div>
        <Link href="/Notifications/Preferences" className="rf-btn">
          Preferences
        </Link>
      </header>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <button
          className={`rf-btn ${tab === "unread" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("unread")}
        >
          Unread
        </button>
        <button
          className={`rf-btn ${tab === "all" ? "rf-btn-primary" : ""}`}
          onClick={() => setTab("all")}
        >
          All
        </button>
        <select
          className="rf-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {NOTIFICATION_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div style={{ flex: 1 }} />
        <button className="rf-btn" onClick={handleMarkAll}>
          Mark all read
        </button>
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
          {tab === "unread" ? "All caught up." : "No notifications yet."}
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {rows.map((n) => {
              const ps =
                NOTIFICATION_PRIORITY_STYLE[n.priority] ||
                NOTIFICATION_PRIORITY_STYLE.NORMAL;
              const unread = !n.readAt;
              return (
                <li
                  key={n.id}
                  style={{
                    padding: 14,
                    borderTop: "1px solid var(--rf-border)",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    background: unread ? "var(--rf-bg2)" : "transparent",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      background: ps.bg,
                      color: ps.color,
                    }}
                  >
                    {n.priority}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--rf-txt)",
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--rf-txt2)",
                        marginTop: 2,
                      }}
                    >
                      {n.body}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        marginTop: 4,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span>{n.category}</span>
                      <span>·</span>
                      <span>{n.channel}</span>
                      <span>·</span>
                      <span>
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {n.linkUrl && (
                      <Link
                        href={n.linkUrl}
                        className="rf-btn"
                        onClick={() => handleRead(n.id)}
                      >
                        Open
                      </Link>
                    )}
                    {unread && (
                      <button
                        className="rf-btn"
                        onClick={() => handleRead(n.id)}
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
