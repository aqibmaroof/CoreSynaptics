"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUser } from "@/services/instance/tokenService";
import {
  listChatRooms,
  getChatRoom,
  createChatRoom,
  archiveChatRoom,
  listMessages,
  postMessage,
  deleteChatMessage,
} from "@/services/Chat";

// ─── API → UI shape normaliser ────────────────────────────────────────────────

const SECTION_BY_TYPE = {
  INTERNAL: "MY COMPANY",
  PROJECT: "PROJECT-WIDE",
  CROSS: "DIRECT (1:1 WITH COMPANY)",
  HORIZONTAL: "HORIZONTAL",
};

const normaliseRoom = (r) => ({
  id: r.id,
  name: r.name,
  roomType: r.roomType || r.type?.toUpperCase() || "INTERNAL",
  subtitle: r.subtitle || r.description || "",
  section: SECTION_BY_TYPE[r.roomType || r.type?.toUpperCase()] || "OTHER",
});

const normaliseMessage = (m, currentUserId) => ({
  id: m.id,
  senderId: m.senderId || m.authorId || "",
  senderName: m.senderName || m.authorName || "Unknown",
  senderCompany: m.senderCompany || m.authorCompany || "",
  initials: m.initials || nameToInitials(m.senderName || m.authorName || "?"),
  color: m.color || colorFor(m.senderName || m.authorName || "?"),
  body: m.body || m.content || "",
  timeAgo: m.timeAgo || formatTime(m.createdAt),
  isOwn: (m.senderId || m.authorId) === currentUserId,
  canDelete: (m.senderId || m.authorId) === currentUserId,
});

const normaliseMember = (m) => ({
  id: m.id || m.userId,
  name:
    m.name ||
    m.displayName ||
    `${m.firstName || ""} ${m.lastName || ""}`.trim(),
  role: m.role || m.jobTitle || "",
  initials: m.initials || nameToInitials(m.name || m.displayName || "?"),
  color: m.color || colorFor(m.name || m.displayName || "?"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const groupBySection = (rooms) => {
  const order = [
    "MY COMPANY",
    "PROJECT-WIDE",
    "DIRECT (1:1 WITH COMPANY)",
    "HORIZONTAL",
    "OTHER",
  ];
  const groups = {};
  for (const r of rooms) {
    if (!groups[r.section]) groups[r.section] = [];
    groups[r.section].push(r);
  }
  return order.filter((s) => groups[s]).map((s) => [s, groups[s]]);
};

const nameToInitials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();

const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#f97316",
  "#0ea5e9",
  "#6366f1",
  "#f43f5e",
  "#14b8a6",
];
const colorFor = (str) =>
  AVATAR_COLORS[(str?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const formatTime = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 36 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: color + "22",
        border: `1.5px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.33,
        fontWeight: 700,
        color,
        userSelect: "none",
      }}
    >
      {initials}
    </div>
  );
}

function ChannelItem({ room, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        border: "none",
        cursor: "pointer",
        padding: "9px 14px",
        borderRadius: 8,
        transition: "background 0.15s",
        background: active ? "var(--rf-accent)" : "transparent",
        display: "block",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--rf-bg3)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: active ? 700 : 500,
          color: active ? "#fff" : "var(--rf-txt)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: "monospace",
          letterSpacing: "-0.01em",
        }}
      >
        {room.name}
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 1,
          color: active ? "rgba(255,255,255,0.7)" : "var(--rf-txt3)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {room.subtitle}
      </div>
    </button>
  );
}

function SectionLabel({ label }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--rf-txt3)",
        padding: "14px 14px 4px",
      }}
    >
      {label}
    </div>
  );
}

function MessageBubble({ msg, onDelete }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 20px",
        transition: "background 0.12s",
        position: "relative",
        background: hover ? "var(--rf-bg3)" : "transparent",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Avatar initials={msg.initials} color={msg.color} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 3,
          }}
        >
          <span
            style={{ fontSize: 13, fontWeight: 700, color: "var(--rf-txt)" }}
          >
            {msg.senderName}
          </span>
          {msg.senderCompany && (
            <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
              {msg.senderCompany}
            </span>
          )}
          <span
            style={{
              fontSize: 11,
              color: "var(--rf-txt3)",
              marginLeft: "auto",
              whiteSpace: "nowrap",
            }}
          >
            {msg.timeAgo}
          </span>
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "var(--rf-txt2)",
            lineHeight: 1.55,
          }}
        >
          {msg.body}
        </p>
      </div>
      {hover && msg.canDelete && (
        <button
          onClick={() => onDelete(msg.id)}
          title="Delete message"
          style={{
            position: "absolute",
            right: 16,
            top: 10,
            background: "var(--rf-bg3)",
            border: "1px solid var(--rf-border)",
            borderRadius: 6,
            padding: "2px 8px",
            cursor: "pointer",
            fontSize: 11,
            color: "var(--rf-red)",
            fontWeight: 600,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function MembersModal({ roomId, roomName, members, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 16,
          padding: 24,
          width: 360,
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            {roomName} · Members
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--rf-txt3)",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        {members.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              color: "var(--rf-txt3)",
              fontSize: 13,
            }}
          >
            Loading members...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 4px",
                }}
              >
                <Avatar initials={m.initials} color={m.color} size={32} />
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--rf-txt)",
                    }}
                  >
                    {m.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                    {m.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ROOM_TYPE_LABELS = {
  INTERNAL: "Internal (my org only)",
  CROSS: "Cross-org (1:1 with company)",
  HORIZONTAL: "Horizontal (same discipline)",
  PROJECT: "Project-wide (all orgs)",
};

function CreateRoomModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [roomType, setRoomType] = useState("INTERNAL");
  const [projectId, setProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (roomType === "PROJECT" && !projectId.trim()) {
      setError("Project ID is required for project-wide rooms.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onCreate({
        name: name.trim(),
        roomType,
        projectId: projectId.trim() || undefined,
      });
      onClose();
    } catch (e) {
      setError(e?.message || "Failed to create room.");
    } finally {
      setBusy(false);
    }
  };

  const inp = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid var(--rf-border)",
    background: "var(--rf-bg)",
    color: "var(--rf-txt)",
    fontSize: 13,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const lbl = {
    display: "block",
    fontSize: 10,
    fontWeight: 800,
    color: "var(--rf-txt3)",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: 5,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 440,
          boxShadow: "0 28px 56px rgba(0,0,0,0.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px 14px",
            borderBottom: "1px solid var(--rf-border)",
          }}
        >
          <span
            style={{ fontSize: 15, fontWeight: 800, color: "var(--rf-txt)" }}
          >
            New chat room
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--rf-txt3)",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <label style={lbl}>
              ROOM NAME <span style={{ color: "var(--rf-red)" }}>*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="#e.g. hitt-and-rosendin"
              style={inp}
            />
          </div>
          <div>
            <label style={lbl}>ROOM TYPE</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(ROOM_TYPE_LABELS).map(([type, label]) => {
                const active = roomType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRoomType(type)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      textAlign: "left",
                      border: active
                        ? "2px solid var(--rf-accent)"
                        : "1px solid var(--rf-border)",
                      background: active
                        ? "rgba(99,102,241,0.08)"
                        : "var(--rf-bg3)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: active ? "var(--rf-accent)" : "var(--rf-txt)",
                      }}
                    >
                      {type}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        marginTop: 1,
                      }}
                    >
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {roomType === "PROJECT" && (
            <div>
              <label style={lbl}>
                PROJECT ID <span style={{ color: "var(--rf-red)" }}>*</span>
              </label>
              <input
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="UUID of the project"
                style={inp}
              />
            </div>
          )}
          {error && (
            <div
              style={{
                fontSize: 12,
                color: "var(--rf-red)",
                padding: "6px 10px",
                borderRadius: 6,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "12px 24px",
            borderTop: "1px solid var(--rf-border)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              border: "1px solid var(--rf-border)",
              background: "transparent",
              color: "var(--rf-txt2)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || busy}
            style={{
              padding: "9px 20px",
              borderRadius: 9,
              border: "none",
              background: name.trim() ? "var(--rf-accent)" : "var(--rf-bg3)",
              color: name.trim() ? "#fff" : "var(--rf-txt3)",
              cursor: name.trim() ? "pointer" : "default",
              fontSize: 13,
              fontWeight: 700,
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Creating..." : "Create room"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Container ───────────────────────────────────────────────────────────

export default function Chat() {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState("ch-internal");
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomMembers, setRoomMembers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: "Sarah Chen",
    initials: "SC",
    color: "#3b82f6",
    id: "u1",
  });
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Boot: resolve current user ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = getUser();
      if (raw) {
        const u = JSON.parse(raw);
        const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "You";
        setCurrentUser({
          name,
          initials: nameToInitials(name),
          color: colorFor(name),
          id: u.id || "me",
        });
      }
    } catch {
      /* keep default */
    }

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ── Load rooms list ────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setRoomsLoading(true);
    try {
      const res = await listChatRooms();
      const raw = Array.isArray(res) ? res : res?.data || res?.rooms || [];
      setRooms(raw.length ? raw.map(normaliseRoom) : MOCK_ROOMS);
    } catch {
      setRooms(MOCK_ROOMS);
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ── Load messages when active room changes ─────────────────────────────────
  const fetchMessages = useCallback(
    async (roomId) => {
      setMessagesLoading(true);
      try {
        const res = await listMessages(roomId, { limit: 50 });
        // API returns newest-first per spec — reverse to show oldest-first in UI
        const raw = Array.isArray(res) ? res : res?.data || res?.messages || [];
        if (raw.length) {
          setMessages(
            [...raw].reverse().map((m) => normaliseMessage(m, currentUser.id)),
          );
        } else {
          setMessages(
            (MOCK_MESSAGES[roomId] || []).map((m) =>
              normaliseMessage(m, currentUser.id),
            ),
          );
        }
      } catch {
        setMessages(
          (MOCK_MESSAGES[roomId] || []).map((m) =>
            normaliseMessage(m, currentUser.id),
          ),
        );
      } finally {
        setMessagesLoading(false);
      }
    },
    [currentUser.id],
  );

  useEffect(() => {
    fetchMessages(activeRoomId);
  }, [activeRoomId, fetchMessages]);

  // ── Load room members when members modal opens ─────────────────────────────
  useEffect(() => {
    if (!showMembers) return;
    setRoomMembers([]);
    (async () => {
      try {
        const res = await getChatRoom(activeRoomId);
        const raw = res?.members || res?.data?.members || [];
        setRoomMembers(
          raw.length
            ? raw.map(normaliseMember)
            : MOCK_MEMBERS[activeRoomId] || [],
        );
      } catch {
        setRoomMembers(MOCK_MEMBERS[activeRoomId] || []);
      }
    })();
  }, [showMembers, activeRoomId]);

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const body = inputValue.trim();
    if (!body || sending) return;

    const optimistic = {
      id: "opt-" + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderCompany: "HITT Contracting",
      initials: currentUser.initials,
      color: currentUser.color,
      body,
      timeAgo: "just now",
      isOwn: true,
      canDelete: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInputValue("");
    inputRef.current?.focus();
    setSending(true);

    try {
      const res = await postMessage(activeRoomId, { body });
      const saved = res?.data || res;
      if (saved?.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id
              ? normaliseMessage({ ...saved, canDelete: true }, currentUser.id)
              : m,
          ),
        );
      }
    } catch {
      // keep the optimistic message — it'll be reconciled on next reload
    } finally {
      setSending(false);
    }
  };

  // ── Delete message ─────────────────────────────────────────────────────────
  const handleDeleteMessage = async (msgId) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await deleteChatMessage(activeRoomId, msgId);
    } catch {
      await fetchMessages(activeRoomId);
    }
  };

  // ── Create room ────────────────────────────────────────────────────────────
  const handleCreateRoom = async (payload) => {
    const res = await createChatRoom(payload);
    const created = res?.data || res;
    if (created?.id) {
      const room = normaliseRoom(created);
      setRooms((prev) => [...prev, room]);
      setActiveRoomId(room.id);
    } else {
      await fetchRooms();
    }
  };

  // ── Archive room ───────────────────────────────────────────────────────────
  const handleArchiveRoom = async () => {
    if (
      !window.confirm(
        `Archive "${activeRoom?.name}"? This will hide it from the list.`,
      )
    )
      return;
    try {
      await archiveChatRoom(activeRoomId);
      setRooms((prev) => prev.filter((r) => r.id !== activeRoomId));
      const remaining = rooms.filter((r) => r.id !== activeRoomId);
      if (remaining.length) setActiveRoomId(remaining[0].id);
    } catch {
      /* ignore */
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectRoom = (id) => {
    setActiveRoomId(id);
    if (isMobile) setSidebarOpen(false);
  };

  const activeRoom =
    rooms?.length > 0 && rooms?.find((r) => r.id === activeRoomId);
  const groups = groupBySection(rooms);

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ──────────────────────────────────────────────────────────── */}
      {(sidebarOpen || !isMobile) && (
        <aside
          style={{
            width: isMobile ? "100%" : 248,
            flexShrink: 0,
            background: "var(--rf-bg2)",
            borderRight: "1px solid var(--rf-border)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            ...(isMobile ? { position: "absolute", inset: 0, zIndex: 50 } : {}),
          }}
        >
          {/* Sidebar header */}
          <div
            style={{
              padding: "16px 14px 10px",
              borderBottom: "1px solid var(--rf-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "var(--rf-txt)",
                }}
              >
                Messages
              </div>
              <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                {roomsLoading ? "Loading rooms..." : `${rooms.length} rooms`}
              </div>
            </div>
            <button
              onClick={() => setShowCreateRoom(true)}
              style={{
                background: "var(--rf-accent)",
                border: "none",
                borderRadius: 7,
                color: "#fff",
                fontSize: 18,
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
              title="New chat room"
            >
              +
            </button>
          </div>

          {/* Room groups */}
          <div style={{ flex: 1, paddingBottom: 16 }}>
            {groups.map(([section, sectionRooms]) => (
              <div key={section}>
                <SectionLabel label={section} />
                {sectionRooms.map((room) => (
                  <div key={room.id} style={{ padding: "1px 6px" }}>
                    <ChannelItem
                      room={room}
                      active={room.id === activeRoomId}
                      onClick={() => selectRoom(room.id)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* ── Main chat area ───────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: "var(--rf-bg)",
        }}
      >
        {/* Room header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--rf-border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--rf-bg2)",
            flexShrink: 0,
          }}
        >
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--rf-txt2)",
                fontSize: 20,
                padding: 0,
                marginRight: 4,
              }}
            >
              ☰
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--rf-txt)",
                fontFamily: "monospace",
              }}
            >
              {activeRoom?.name || ""}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 1 }}
            >
              {activeRoom?.subtitle || ""}
              {activeRoom?.roomType ? ` · ${activeRoom.roomType}` : ""} ·{" "}
              {messages.length} messages
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setShowMembers(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "var(--rf-bg3)",
                color: "var(--rf-txt2)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--rf-bg4,var(--rf-bg3))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--rf-bg3)")
              }
            >
              <span style={{ fontSize: 14 }}>👥</span> Members
            </button>
            <button
              onClick={handleArchiveRoom}
              title="Archive this room"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "var(--rf-bg3)",
                color: "var(--rf-txt2)",
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--rf-bg4,var(--rf-bg3))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--rf-bg3)")
              }
            >
              ⚙
            </button>
          </div>
        </div>

        {/* Messages list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {messagesLoading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "var(--rf-txt3)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 24px",
                color: "var(--rf-txt3)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
              <div>No messages yet. Be the first to say something!</div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onDelete={handleDeleteMessage}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div
          style={{
            padding: "12px 20px 16px",
            borderTop: "1px solid var(--rf-border)",
            background: "var(--rf-bg2)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "var(--rf-bg)",
                border: "1px solid var(--rf-border)",
                borderRadius: 10,
                padding: "0 14px",
                transition: "border-color 0.15s",
              }}
              onFocusCapture={(e) =>
                (e.currentTarget.style.borderColor = "var(--rf-accent)")
              }
              onBlurCapture={(e) =>
                (e.currentTarget.style.borderColor = "var(--rf-border)")
              }
            >
              <input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activeRoom?.name || ""}...`}
                disabled={sending}
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  padding: "12px 0",
                  fontSize: 13,
                  color: "var(--rf-txt)",
                  fontFamily: "inherit",
                }}
              />
              {inputValue && (
                <button
                  onClick={() => setInputValue("")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--rf-txt3)",
                    fontSize: 16,
                    padding: "0 0 0 6px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || sending}
              style={{
                padding: "11px 22px",
                borderRadius: 10,
                border: "none",
                background:
                  inputValue.trim() && !sending
                    ? "var(--rf-accent)"
                    : "var(--rf-bg3)",
                color:
                  inputValue.trim() && !sending ? "#fff" : "var(--rf-txt3)",
                fontSize: 13,
                fontWeight: 700,
                cursor: inputValue.trim() && !sending ? "pointer" : "default",
                transition: "background 0.15s, color 0.15s",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--rf-txt3)",
              marginTop: 6,
              paddingLeft: 2,
            }}
          >
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>

      {/* ── Members modal ──────────────────────────────────────────────────── */}
      {showMembers && activeRoom && (
        <MembersModal
          roomId={activeRoomId}
          roomName={activeRoom.name}
          members={roomMembers}
          onClose={() => setShowMembers(false)}
        />
      )}

      {/* ── Create room modal ──────────────────────────────────────────────── */}
      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreate={handleCreateRoom}
        />
      )}
    </div>
  );
}
