"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getUser } from "@/services/instance/tokenService";
import {
  listChatRooms,
  createChatRoom,
  archiveChatRoom,
  listMessages,
  postMessage,
  deleteChatMessage,
  listRoomMembers,
  addRoomMembers,
  removeRoomMember,
  listOrgUsers,
  openDirectRoom,
  listChatProjects,
} from "@/services/Chat";
import ChatReactionsBar from "@/components/ChatReactionsBar";
import ChatMessageBody from "@/components/ChatMessageBody";

// ─── API → UI shape normaliser ────────────────────────────────────────────────

const SECTION_BY_TYPE = {
  INTERNAL: "MY COMPANY",
  PROJECT: "PROJECT-WIDE",
  CROSS: "CROSS-ORG (1:1 WITH COMPANY)",
  HORIZONTAL: "HORIZONTAL",
  DIRECT: "DIRECT MESSAGES",
};

const normaliseRoom = (r) => ({
  id: r.id,
  name: r.name,
  roomType: r.roomType || r.type?.toUpperCase() || "INTERNAL",
  subtitle: r.subtitle || r.description || "",
  section: SECTION_BY_TYPE[r.roomType || r.type?.toUpperCase()] || "OTHER",
  organizationId: r.organizationId || null,
  participantUserIds: r.participantUserIds || [],
});

const normaliseMessage = (m, currentUser) => {
  const currentUserId = currentUser?.id ?? currentUser ?? "";
  // Backend returns senderUserId (not senderId/authorId) and no display name —
  // fall back to current user's name when the sender is the viewer.
  const senderId = m.senderUserId || m.senderId || m.authorId || "";
  const isOwn = senderId && senderId === currentUserId;
  const senderName =
    m.senderName ||
    m.authorName ||
    (isOwn ? currentUser?.name : null) ||
    "Unknown";
  return {
    id: m.id,
    senderId,
    senderName,
    senderCompany: m.senderCompany || m.authorCompany || "",
    initials: m.initials || nameToInitials(senderName),
    color: m.color || colorFor(senderName),
    body: m.body || m.content || "",
    mentions: Array.isArray(m.mentions) ? m.mentions : [],
    timeAgo: m.timeAgo || formatTime(m.createdAt),
    isOwn,
    canDelete: isOwn,
  };
};

const normaliseMember = (m) => {
  const name =
    m.name ||
    m.displayName ||
    `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
    m.email ||
    "Unknown";
  return {
    id: m.id || m.userId,
    name,
    email: m.email || "",
    role: m.roleName || m.role || m.jobTitle || "",
    initials: m.initials || nameToInitials(name),
    color: m.color || colorFor(name),
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const groupBySection = (rooms) => {
  const order = [
    "DIRECT MESSAGES",
    "MY COMPANY",
    "PROJECT-WIDE",
    "CROSS-ORG (1:1 WITH COMPANY)",
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

// Pull the nicest available message out of an axios error / thrown error.
// Falls back to `fallback` so the UI always has *something* to show.
const extractErrorMessage = (err, fallback) =>
  err?.message ||
  err?.response?.data?.message ||
  err?.data?.message ||
  (typeof err === "string" ? err : null) ||
  fallback;

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

function MessageBubble({ msg, onDelete, currentUserId }) {
  const [hover, setHover] = useState(false);
  const isOwn = !!msg.isOwn;
  const bubbleBg = isOwn ? "var(--rf-blue, #3b82f6)" : "var(--rf-bg3)";
  const bubbleColor = isOwn ? "white" : "var(--rf-txt)";
  const metaColor = isOwn ? "rgba(255,255,255,0.75)" : "var(--rf-txt3)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        gap: 10,
        padding: "6px 20px",
        position: "relative",
        alignItems: "flex-end",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Avatar initials={msg.initials} color={msg.color} size={32} />
      <div
        style={{
          maxWidth: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {!isOwn && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--rf-txt)",
              marginBottom: 2,
              paddingLeft: 2,
            }}
          >
            {msg.senderName}
            {msg.senderCompany && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  fontWeight: 400,
                  marginLeft: 6,
                }}
              >
                {msg.senderCompany}
              </span>
            )}
          </div>
        )}
        <div
          style={{
            position: "relative",
            background: bubbleBg,
            color: bubbleColor,
            borderRadius: 14,
            borderBottomRightRadius: isOwn ? 4 : 14,
            borderBottomLeftRadius: isOwn ? 14 : 4,
            padding: "8px 12px",
            fontSize: 13,
            lineHeight: 1.45,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
          }}
        >
          <ChatMessageBody message={msg} />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 3,
            paddingLeft: isOwn ? 0 : 2,
            paddingRight: isOwn ? 2 : 0,
            fontSize: 10,
            color: "var(--rf-txt3)",
          }}
        >
          <span>{msg.timeAgo}</span>
        </div>
        <div style={{ marginTop: 4, alignSelf: isOwn ? "flex-end" : "flex-start" }}>
          <ChatReactionsBar
            messageId={msg.id}
            currentUserId={currentUserId}
          />
        </div>
      </div>
      {hover && msg.canDelete && (
        <button
          onClick={() => onDelete(msg.id)}
          title="Delete message"
          aria-label="Delete message"
          style={{
            position: "absolute",
            top: 6,
            ...(isOwn ? { left: 16 } : { right: 16 }),
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "var(--rf-bg2)",
            border: "1px solid var(--rf-border)",
            borderRadius: 6,
            padding: "3px 8px",
            cursor: "pointer",
            fontSize: 11,
            color: "var(--rf-red, #ef4444)",
            fontWeight: 600,
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
          Delete
        </button>
      )}
    </div>
  );
}

function MembersModal({
  roomName,
  members,
  currentUserId,
  onAdd,
  onRemove,
  onClose,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [orgUsers, setOrgUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const memberIds = new Set(members.map((m) => m.id));

  useEffect(() => {
    if (!showPicker) return;
    setLoadingUsers(true);
    setError(null);
    (async () => {
      try {
        const res = await listOrgUsers();
        const raw = Array.isArray(res) ? res : res?.data || res?.users || [];
        setOrgUsers(raw);
      } catch (e) {
        setError("Failed to load users");
      } finally {
        setLoadingUsers(false);
      }
    })();
  }, [showPicker]);

  const candidates = orgUsers
    .filter((u) => !memberIds.has(u.id))
    .filter((u) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      return name.includes(q) || (u.email || "").toLowerCase().includes(q);
    });

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submitAdd = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      await onAdd([...selected]);
      setSelected(new Set());
      setShowPicker(false);
      setQuery("");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to add members");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (userId) => {
    setBusy(true);
    setError(null);
    try {
      await onRemove(userId);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to remove member");
    } finally {
      setBusy(false);
    }
  };

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
          width: 420,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
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
            {roomName} · Members ({members.length})
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--rf-txt3)",
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "var(--rf-red, #ef4444)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8,
              padding: "8px 10px",
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}

        {!showPicker ? (
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginBottom: 12,
              }}
            >
              {members.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: "var(--rf-txt3)",
                    fontSize: 13,
                  }}
                >
                  No members yet.
                </div>
              ) : (
                members.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 4px",
                      borderBottom: "1px solid var(--rf-border)",
                    }}
                  >
                    <Avatar initials={m.initials} color={m.color} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--rf-txt)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.name}
                        {m.id === currentUserId && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "var(--rf-txt3)",
                              fontWeight: 400,
                              marginLeft: 6,
                            }}
                          >
                            (you)
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.role || m.email}
                      </div>
                    </div>
                    {m.id !== currentUserId && (
                      <button
                        onClick={() => remove(m.id)}
                        disabled={busy}
                        style={{
                          background: "transparent",
                          color: "var(--rf-red, #ef4444)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          borderRadius: 6,
                          padding: "3px 8px",
                          fontSize: 11,
                          cursor: busy ? "not-allowed" : "pointer",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowPicker(true)}
              style={{
                width: "100%",
                background: "var(--rf-blue, #3b82f6)",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              + Add members
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              autoFocus
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: 13,
                background: "var(--rf-bg)",
                color: "var(--rf-txt)",
                border: "1px solid var(--rf-border)",
                borderRadius: 8,
                marginBottom: 10,
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                marginBottom: 12,
                minHeight: 100,
              }}
            >
              {loadingUsers ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "var(--rf-txt3)",
                    fontSize: 13,
                  }}
                >
                  Loading…
                </div>
              ) : candidates.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 20,
                    color: "var(--rf-txt3)",
                    fontSize: 13,
                  }}
                >
                  No matches.
                </div>
              ) : (
                candidates.map((u) => {
                  const name =
                    `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                    u.email;
                  const isOn = selected.has(u.id);
                  return (
                    <label
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 4px",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--rf-border)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isOn}
                        onChange={() => toggle(u.id)}
                      />
                      <Avatar
                        initials={nameToInitials(name)}
                        color={colorFor(name)}
                        size={28}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--rf-txt)",
                          }}
                        >
                          {name}
                        </div>
                        <div
                          style={{ fontSize: 11, color: "var(--rf-txt3)" }}
                        >
                          {u.email}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => {
                  setShowPicker(false);
                  setSelected(new Set());
                  setQuery("");
                }}
                disabled={busy}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "var(--rf-txt2)",
                  border: "1px solid var(--rf-border)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitAdd}
                disabled={busy || selected.size === 0}
                style={{
                  flex: 1,
                  background: "var(--rf-blue, #3b82f6)",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    busy || selected.size === 0 ? "not-allowed" : "pointer",
                  opacity: busy || selected.size === 0 ? 0.6 : 1,
                }}
              >
                Add {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
            </div>
          </>
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
  const [cxProjectId, setCxProjectId] = useState("");
  const [selectedOrgIds, setSelectedOrgIds] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const needsProject = roomType !== "INTERNAL";
  const needsOrgs = roomType === "CROSS" || roomType === "HORIZONTAL";

  // Load projects + their member orgs in one call.
  useEffect(() => {
    setProjectsLoading(true);
    (async () => {
      try {
        const res = await listChatProjects();
        const list = Array.isArray(res) ? res : res?.data || [];
        setProjects(list);
      } catch (e) {
        setError(extractErrorMessage(e, "Failed to load projects"));
      } finally {
        setProjectsLoading(false);
      }
    })();
  }, []);

  // When the chosen project changes, pull its already-attached member orgs
  // (no extra request — they came back with the project list).
  useEffect(() => {
    if (!needsOrgs || !cxProjectId) {
      setPartners([]);
      return;
    }
    const proj = projects.find((p) => p.id === cxProjectId);
    setSelectedOrgIds([]);
    setPartners(
      (proj?.memberOrgs || []).map((m) => ({
        id: m.id,
        name: m.name,
        role: m.isOwner ? "OWNER" : m.role || "",
        isOwner: !!m.isOwner,
      })),
    );
    setPartnersLoading(false);
  }, [cxProjectId, needsOrgs, projects]);

  // Switching room type invalidates the org selection.
  useEffect(() => {
    setSelectedOrgIds([]);
    setError("");
    if (!needsProject) setCxProjectId("");
  }, [roomType, needsProject]);

  const toggleOrg = (id) => {
    setSelectedOrgIds((prev) => {
      if (roomType === "CROSS") {
        // Single-select.
        return prev[0] === id ? [] : [id];
      }
      return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    if (needsProject && !cxProjectId) {
      setError("Project is required for this room type.");
      return;
    }
    if (roomType === "CROSS" && selectedOrgIds.length !== 1) {
      setError("Pick exactly one partner organization for a CROSS room.");
      return;
    }
    if (roomType === "HORIZONTAL" && selectedOrgIds.length < 1) {
      setError("Pick at least one partner organization for a HORIZONTAL room.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await onCreate({
        name: name.trim(),
        roomType,
        cxProjectId: needsProject ? cxProjectId : undefined,
        participantOrgIds: needsOrgs ? selectedOrgIds : undefined,
      });
      onClose();
    } catch (e) {
      setError(extractErrorMessage(e, "Failed to create room."));
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
          {needsProject && (
            <div>
              <label style={lbl}>
                PROJECT <span style={{ color: "var(--rf-red)" }}>*</span>
              </label>
              <select
                value={cxProjectId}
                onChange={(e) => setCxProjectId(e.target.value)}
                disabled={projectsLoading}
                style={inp}
              >
                <option key="__placeholder" value="">
                  {projectsLoading ? "Loading projects…" : "— pick a project —"}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName || p.name || p.id}
                  </option>
                ))}
              </select>
            </div>
          )}
          {needsOrgs && cxProjectId && (
            <div>
              <label style={lbl}>
                {roomType === "CROSS"
                  ? "PARTNER ORG (pick 1)"
                  : "PARTNER ORGS (pick at least 1)"}{" "}
                <span style={{ color: "var(--rf-red)" }}>*</span>
              </label>
              {partnersLoading ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--rf-txt3)",
                    padding: "8px 0",
                  }}
                >
                  Loading partners…
                </div>
              ) : partners.length === 0 ? (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--rf-txt3)",
                    padding: "8px 0",
                  }}
                >
                  No partner organizations on this project. Add partners to the
                  project first, then create the room.
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxHeight: 180,
                    overflowY: "auto",
                    border: "1px solid var(--rf-border)",
                    borderRadius: 8,
                    padding: 4,
                  }}
                >
                  {partners.filter((p) => !p.isOwner).map((p) => {
                    const checked = selectedOrgIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                          background: checked
                            ? "rgba(99,102,241,0.08)"
                            : "transparent",
                        }}
                      >
                        <input
                          type={roomType === "CROSS" ? "radio" : "checkbox"}
                          name="partner-org"
                          checked={checked}
                          onChange={() => toggleOrg(p.id)}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--rf-txt)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.name}
                          </div>
                          {p.role && (
                            <div
                              style={{
                                fontSize: 10,
                                color: "var(--rf-txt3)",
                              }}
                            >
                              {p.role}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
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

// ─── Fallback data (used when API fails or returns empty) ─────────────────────
// ─── Main Container ───────────────────────────────────────────────────────────

export default function Chat() {
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomMembers, setRoomMembers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [people, setPeople] = useState([]);
  const [openingDmFor, setOpeningDmFor] = useState(null);
  const [lastError, setLastError] = useState(null);
  // currentUser stays null until we resolve it from the auth store. We refuse
  // to render the chat / accept sends until a real user id is available — the
  // old "u1" / "me" placeholders silently broke ownership and DM peer checks.
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Boot: resolve current user ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = getUser();
      if (!raw) {
        setAuthError("Not signed in");
        return;
      }
      const u = JSON.parse(raw);
      if (!u?.id) {
        setAuthError("Signed-in user has no id");
        return;
      }
      const name = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "You";
      setCurrentUser({
        name,
        initials: nameToInitials(name),
        color: colorFor(name),
        id: u.id,
      });
    } catch (err) {
      setAuthError("Failed to read signed-in user");
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
      const next = raw.map(normaliseRoom);
      setRooms(next);
      setActiveRoomId((current) =>
        next.some((r) => r.id === current) ? current : next[0]?.id ?? current,
      );
    } catch (err) {
      setRooms([]);
      setLastError(extractErrorMessage(err, "Failed to load chat rooms"));
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ── Load org directory (for People sidebar + DM-name resolution) ───────────
  const fetchPeople = useCallback(async () => {
    try {
      const res = await listOrgUsers();
      const raw = Array.isArray(res) ? res : res?.data || res?.users || [];
      setPeople(raw);
    } catch (err) {
      setPeople([]);
      setLastError(extractErrorMessage(err, "Failed to load people"));
    }
  }, []);

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  // ── Start a DM with a user (find-or-create DIRECT room) ────────────────────
  const handleStartDm = useCallback(
    async (peerUserId) => {
      if (
        !currentUser?.id ||
        !peerUserId ||
        peerUserId === currentUser.id ||
        openingDmFor
      ) {
        return;
      }
      setOpeningDmFor(peerUserId);
      try {
        const room = await openDirectRoom(peerUserId);
        const created = room?.data || room;
        if (created?.id) {
          setRooms((prev) =>
            prev.some((r) => r.id === created.id)
              ? prev
              : [normaliseRoom(created), ...prev],
          );
          setActiveRoomId(created.id);
        }
      } catch (err) {
        setLastError(extractErrorMessage(err, "Failed to open direct message"));
      } finally {
        setOpeningDmFor(null);
      }
    },
    [currentUser?.id, openingDmFor],
  );

  // ── Load messages when active room changes ─────────────────────────────────
  const fetchMessages = useCallback(
    async (roomId) => {
      if (!roomId || !currentUser) {
        setMessages([]);
        setMessagesLoading(false);
        return;
      }
      setMessagesLoading(true);
      try {
        const res = await listMessages(roomId, { limit: 50 });
        // API returns newest-first per spec — reverse to show oldest-first in UI
        const raw = Array.isArray(res) ? res : res?.data || res?.messages || [];
        setMessages(
          [...raw].reverse().map((m) => normaliseMessage(m, currentUser)),
        );
      } catch (err) {
        setMessages([]);
        setLastError(extractErrorMessage(err, "Failed to load messages"));
      } finally {
        setMessagesLoading(false);
      }
    },
    [currentUser],
  );

  useEffect(() => {
    fetchMessages(activeRoomId);
  }, [activeRoomId, fetchMessages]);

  // ── Load room members when members modal opens ─────────────────────────────
  const refreshMembers = useCallback(async () => {
    if (!activeRoomId) return;
    try {
      const res = await listRoomMembers(activeRoomId);
      const raw = Array.isArray(res) ? res : res?.data || [];
      setRoomMembers(raw.map(normaliseMember));
    } catch (err) {
      setRoomMembers([]);
      setLastError(extractErrorMessage(err, "Failed to load members"));
    }
  }, [activeRoomId]);

  useEffect(() => {
    if (!showMembers || !activeRoomId) return;
    setRoomMembers([]);
    refreshMembers();
  }, [showMembers, activeRoomId, refreshMembers]);

  const handleAddMembers = useCallback(
    async (userIds) => {
      if (!activeRoomId || !userIds?.length) return;
      await addRoomMembers(activeRoomId, userIds);
      await refreshMembers();
    },
    [activeRoomId, refreshMembers],
  );

  const handleRemoveMember = useCallback(
    async (userId) => {
      if (!activeRoomId || !userId) return;
      await removeRoomMember(activeRoomId, userId);
      await refreshMembers();
    },
    [activeRoomId, refreshMembers],
  );

  // ── Auto-scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const body = inputValue.trim();
    if (!body || sending || !activeRoomId || !currentUser) return;

    const optimistic = {
      id: "opt-" + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
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
              ? normaliseMessage({ ...saved, canDelete: true }, currentUser)
              : m,
          ),
        );
      }
    } catch (err) {
      // Roll the optimistic message back so the user sees the failure.
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInputValue(body);
      setLastError(extractErrorMessage(err, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  // ── Delete message ─────────────────────────────────────────────────────────
  const handleDeleteMessage = async (msgId) => {
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await deleteChatMessage(activeRoomId, msgId);
    } catch (err) {
      setLastError(extractErrorMessage(err, "Failed to delete message"));
      await fetchMessages(activeRoomId);
    }
  };

  // ── Create room ────────────────────────────────────────────────────────────
  const handleCreateRoom = async (payload) => {
    try {
      const res = await createChatRoom(payload);
      const created = res?.data || res;
      if (created?.id) {
        const room = normaliseRoom(created);
        setRooms((prev) => [...prev, room]);
        setActiveRoomId(room.id);
      } else {
        await fetchRooms();
      }
    } catch (err) {
      setLastError(extractErrorMessage(err, "Failed to create room"));
      throw err;
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
      const remaining = rooms.filter((r) => r.id !== activeRoomId);
      setRooms(remaining);
      setActiveRoomId(remaining[0]?.id ?? null);
    } catch (err) {
      setLastError(extractErrorMessage(err, "Failed to archive room"));
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

  // Refuse to render the chat shell until the signed-in user is resolved.
  // Without this guard, the placeholder id would silently break ownership
  // checks, DM peer detection, and the "(you)" badge.
  if (!currentUser) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 80px)",
          padding: 24,
          fontSize: 13,
          color: "var(--rf-txt3)",
          gap: 8,
        }}
      >
        {authError ? (
          <span style={{ color: "var(--rf-red, #ef4444)" }}>
            Chat unavailable — {authError}. Please sign in again.
          </span>
        ) : (
          <span>Loading chat…</span>
        )}
      </div>
    );
  }

  // Resolve per-viewer display name for DIRECT rooms (show the *other* user's name).
  const peopleById = new Map(people.map((u) => [u.id, u]));
  const decoratedRooms = rooms.map((r) => {
    if (r.roomType !== "DIRECT") return r;
    const peerId = (r.participantUserIds || []).find(
      (id) => id && id !== currentUser.id,
    );
    const peer = peerId ? peopleById.get(peerId) : null;
    const peerName = peer
      ? `${peer.firstName || ""} ${peer.lastName || ""}`.trim() || peer.email
      : r.name;
    return { ...r, name: peerName, peerId };
  });

  const activeRoom =
    decoratedRooms?.length > 0 &&
    decoratedRooms?.find((r) => r.id === activeRoomId);
  const groups = groupBySection(decoratedRooms);
  const peopleWithoutSelf = people.filter((u) => u.id !== currentUser.id);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      {/* ── Inline error toast ───────────────────────────────────────────────── */}
      {lastError && (
        <div
          role="alert"
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(239,68,68,0.95)",
            color: "white",
            border: "1px solid rgba(239,68,68,1)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            maxWidth: 420,
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ flex: 1 }}>{lastError}</span>
          <button
            onClick={() => setLastError(null)}
            aria-label="Dismiss error"
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: 16,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      )}

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

            {/* People section — click to start a direct message */}
            {peopleWithoutSelf.length > 0 && (
              <div>
                <SectionLabel label="PEOPLE" />
                {peopleWithoutSelf.map((u) => {
                  const name =
                    `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                    u.email;
                  const opening = openingDmFor === u.id;
                  return (
                    <div key={u.id} style={{ padding: "1px 6px" }}>
                      <button
                        onClick={() => handleStartDm(u.id)}
                        disabled={opening}
                        title={`Direct message ${name}`}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 8px",
                          background: "transparent",
                          border: "none",
                          borderRadius: 6,
                          cursor: opening ? "wait" : "pointer",
                          color: "var(--rf-txt2)",
                          textAlign: "left",
                          fontSize: 13,
                          opacity: opening ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--rf-bg3)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Avatar
                          initials={nameToInitials(name)}
                          color={colorFor(name)}
                          size={24}
                        />
                        <span
                          style={{
                            flex: 1,
                            minWidth: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
              aria-label="Open rooms list"
              title="Open rooms list"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--rf-txt2)",
                padding: 4,
                marginRight: 4,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
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
              aria-label="Members"
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Members
            </button>
            <button
              onClick={handleArchiveRoom}
              title="Archive this room"
              aria-label="Archive this room"
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
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="21 8 21 21 3 21 3 8" />
                <rect x="1" y="3" width="22" height="5" />
                <line x1="10" y1="12" x2="14" y2="12" />
              </svg>
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
              <div style={{ fontSize: 28, marginBottom: 10 }}></div>
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
              <div style={{ fontSize: 36, marginBottom: 12 }}></div>
              <div>No messages yet. Be the first to say something!</div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onDelete={handleDeleteMessage}
                currentUserId={currentUser?.id}
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
                  aria-label="Clear message"
                  title="Clear"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--rf-txt3)",
                    padding: "0 0 0 6px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
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
          roomName={activeRoom.name}
          members={roomMembers}
          currentUserId={currentUser.id}
          onAdd={handleAddMembers}
          onRemove={handleRemoveMember}
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
