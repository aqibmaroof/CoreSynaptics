"use client";

// ── Phase 5 PR-3: Top-bar notification bell ──────────────────────────────────
// Mounted by containers/Layout. Wires `notification.created` from the realtime
// gateway and exposes a popover with the latest unread deliveries.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  myNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NOTIFICATION_PRIORITY_STYLE,
} from "@/services/Notifications";
import { useRealtimeSocket } from "@/lib/realtime/useRealtimeSocket";
import { onEnvelope } from "@/lib/realtime/envelope";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const socket = useRealtimeSocket();
  const wrapRef = useRef(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await myNotifications({ unreadOnly: true, limit: 20 });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live invalidation — backend emits `notification.created` to the user channel.
  useEffect(() => {
    if (!socket) return;
    const off = onEnvelope(socket, "notification.created", () => refresh());
    return () => off();
  }, [socket, refresh]);

  // Click-outside close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const unreadCount = useMemo(() => rows.length, [rows]);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setRows((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      setError(e?.message || "Mark-read failed");
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setRows([]);
    } catch (e) {
      setError(e?.message || "Mark-all failed");
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="cx-tb-icon"
        title="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        🔔
        {unreadCount > 0 && <span className="cx-tb-bell-dot" />}
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 6px)",
            background: "var(--cx-surface)",
            border: "1px solid var(--cx-border)",
            borderRadius: 10,
            width: 360,
            maxHeight: 480,
            overflow: "auto",
            boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
            zIndex: 70,
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: "1px solid var(--cx-border)",
              position: "sticky",
              top: 0,
              background: "var(--cx-surface)",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--cx-text)",
                }}
              >
                Notifications
              </div>
              <div style={{ fontSize: 11, color: "var(--cx-text-muted)" }}>
                {unreadCount} unread
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  style={menuBtn}
                >
                  Mark all
                </button>
              )}
              <Link
                href="/Notifications"
                onClick={() => setOpen(false)}
                style={{ ...menuBtn, textDecoration: "none" }}
              >
                Inbox
              </Link>
            </div>
          </header>

          {error && (
            <div
              style={{
                padding: 10,
                color: "var(--rf-red, #ef4444)",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                padding: 20,
                fontSize: 12,
                color: "var(--cx-text-muted)",
              }}
            >
              Loading…
            </div>
          ) : rows.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                color: "var(--cx-text-muted)",
                fontSize: 12,
              }}
            >
              You&apos;re all caught up.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rows.map((n) => {
                const ps =
                  NOTIFICATION_PRIORITY_STYLE[n.priority] ||
                  NOTIFICATION_PRIORITY_STYLE.NORMAL;
                return (
                  <li
                    key={n.id}
                    style={{
                      padding: "10px 14px",
                      borderTop: "1px solid var(--cx-border)",
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background: ps.color,
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--cx-text)",
                        }}
                      >
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--cx-text-muted)",
                          whiteSpace: "normal",
                          overflow: "hidden",
                        }}
                      >
                        {n.body}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--cx-text-muted)",
                          marginTop: 4,
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        <span>{n.category}</span>
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
                        gap: 4,
                      }}
                    >
                      {n.linkUrl && (
                        <Link
                          href={n.linkUrl}
                          onClick={() => {
                            handleMarkRead(n.id);
                            setOpen(false);
                          }}
                          style={{ ...menuBtn, textDecoration: "none" }}
                        >
                          Open
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        style={menuBtn}
                      >
                        Read
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <footer
            style={{
              padding: "8px 14px",
              borderTop: "1px solid var(--cx-border)",
              fontSize: 11,
              textAlign: "center",
            }}
          >
            <Link
              href="/Notifications/Preferences"
              onClick={() => setOpen(false)}
              style={{ color: "var(--cx-text-muted)" }}
            >
              Notification preferences
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}

const menuBtn = {
  background: "transparent",
  border: "1px solid var(--cx-border)",
  borderRadius: 6,
  padding: "3px 8px",
  fontSize: 11,
  color: "var(--cx-text)",
  cursor: "pointer",
};
