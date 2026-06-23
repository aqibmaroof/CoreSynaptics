"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { getUser } from "@/services/instance/tokenService";
import {
  listChatRooms,
  createChatRoom,
  archiveChatRoom,
  listMessages,
  postMessage,
  editChatMessage,
  deleteChatMessage,
  listRoomMembers,
  addRoomMembers,
  removeRoomMember,
  listOrgUsers,
  openDirectRoom,
  listChatProjects,
  markRoomRead,
  markRoomDelivered,
  getRoomReceipts,
  getRoomPresence,
  getDirectoryPresence,
  startTyping,
  stopTyping,
  initAttachment,
  confirmAttachment,
  getAttachmentDownload,
  CHAT_ATTACHMENT_RULES,
} from "@/services/Chat";
import { uploadFileToS3 } from "@/services/Documents";
import { useRealtimeSocket } from "@/lib/realtime/useRealtimeSocket";
import { onEnvelope } from "@/lib/realtime/envelope";
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
  // Project linkage — needed to scope attachment uploads through the Documents
  // service (which requires a project hierarchy). INTERNAL rooms have none.
  projectId: r.cxProjectId || r.projectId || null,
  siteId: r.siteId || null,
  subProjectId: r.subProjectId || null,
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
  // Edited indicator: prefer an explicit editedAt, else infer from updatedAt
  // diverging from createdAt by more than a second (clock jitter guard).
  const createdAt = m.createdAt || m.created_at || m.sentAt || null;
  const editedAt =
    m.editedAt ||
    m.edited_at ||
    (m.updatedAt && createdAt && new Date(m.updatedAt) - new Date(createdAt) > 1000
      ? m.updatedAt
      : null);
  // Attachments: backend returns an `attachments[]` array, each
  // { id, fileName, mimeType, fileSize, downloadUrl }. Older/optimistic shapes
  // may carry a single attachmentUrl — fold both into one normalized list.
  const rawAttachments = Array.isArray(m.attachments) ? m.attachments : [];
  const attachments = rawAttachments.map((a) => ({
    id: a.id,
    name: a.fileName || a.name || "file",
    type: a.mimeType || a.type || "",
    size: a.fileSize ?? a.size ?? null,
    url: a.downloadUrl || a.url || null,
  }));
  if (attachments.length === 0 && (m.attachmentUrl || m.attachment_url)) {
    attachments.push({
      id: m.attachmentId || null,
      name: m.attachmentName || m.attachment_name || "file",
      type: m.attachmentType || m.attachment_type || "",
      size: null,
      url: m.attachmentUrl || m.attachment_url,
    });
  }

  // Reply preview: backend returns a `replyTo` object
  // { id, senderName, body, deleted }. Fall back to flat fields for optimistic
  // messages composed locally before the server echo.
  const replyTo = m.replyTo
    ? {
        id: m.replyTo.id,
        senderName: m.replyTo.senderName || "",
        body: m.replyTo.body || "",
        deleted: !!m.replyTo.deleted,
      }
    : m.replyToId || m.parentId
      ? {
          id: m.replyToId || m.parentId,
          senderName: m.replyToSender || "",
          body: m.replyToBody || "",
          deleted: false,
        }
      : null;

  // Per-message status (CHAT_009/010): backend sends SENT|DELIVERED|READ.
  // Normalize to the lowercase tokens the StatusTick component renders.
  const rawStatus = (m.status || "").toString().toUpperCase();
  const status = m.pending
    ? "sending"
    : rawStatus === "READ"
      ? "read"
      : rawStatus === "DELIVERED"
        ? "delivered"
        : "sent";

  return {
    id: m.id,
    senderId,
    senderName,
    senderCompany: m.senderCompany || m.authorCompany || "",
    initials: m.initials || nameToInitials(senderName),
    color: m.color || colorFor(senderName),
    body: m.body || m.content || "",
    mentions: Array.isArray(m.mentions) ? m.mentions : [],
    createdAt,
    editedAt,
    attachments,
    // Per-message delivery status for the sender's own messages.
    status,
    // Reply reference (display + scroll-to).
    replyToId: replyTo?.id || null,
    replyToBody: replyTo?.deleted ? "This message was deleted" : replyTo?.body || "",
    replyToSender: replyTo?.senderName || "",
    timeAgo: m.timeAgo || formatTime(createdAt),
    isOwn,
    canDelete: isOwn,
    // `pending` marks an optimistic, not-yet-acknowledged message.
    pending: !!m.pending,
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

// Curated quick-pick emojis for the composer picker. Native unicode — the
// message body renderer emits them as-is, so they display correctly everywhere.
const EMOJIS = [
  "😀", "😄", "😁", "😂", "🤣", "😊", "😍", "😎", "🤩", "😘",
  "🙂", "😉", "😅", "😇", "🤔", "🤗", "🙌", "👏", "👍", "👎",
  "👌", "🙏", "💪", "🔥", "✨", "🎉", "🚀", "✅", "❌", "⚠️",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "💯", "👀", "😴", "🤝",
];

const formatTime = (iso) => {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// Absolute clock time in the viewer's local timezone, e.g. "3:42 PM".
const formatClock = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

// Full local date+time for hover tooltips, e.g. "Jun 2, 2026, 3:42:07 PM".
const formatFull = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
};

// A day separator label ("Today", "Yesterday", or a local date).
const formatDayLabel = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const today = new Date();
  const yest = new Date();
  yest.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yest)) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};

const dayKey = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toDateString();
};

// File-upload policy — must mirror the backend (CHAT_020–023). Only PDF / DOC /
// DOCX are accepted, with a 10 MB ceiling. The server re-validates and is the
// source of truth; this client check just gives instant, clear feedback.
const MAX_UPLOAD_BYTES = CHAT_ATTACHMENT_RULES.maxBytes; // 10 MB
const ALLOWED_EXTS = CHAT_ATTACHMENT_RULES.extensions; // ['pdf','doc','docx']
const ALLOWED_MIMES = CHAT_ATTACHMENT_RULES.mimeTypes;
const isImageName = (name = "", type = "") =>
  /^image\//.test(type) || /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(name);
const fileExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";
const humanSize = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
// Validate a chosen file; returns an error string or null when acceptable.
// CHAT_022: unsupported types blocked. CHAT_023: oversize blocked with the limit.
const validateUploadFile = (file) => {
  if (!file) return "No file selected.";
  const ext = fileExt(file.name);
  const typeOk =
    ALLOWED_EXTS.includes(ext) &&
    (!file.type || ALLOWED_MIMES.includes(file.type));
  if (!typeOk) {
    return `"${file.name}" is not a supported file type. Allowed: ${ALLOWED_EXTS.map(
      (e) => "." + e
    ).join(", ")} (PDF, DOC, DOCX).`;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `"${file.name}" is too large (${humanSize(
      file.size
    )}). The maximum attachment size is ${humanSize(MAX_UPLOAD_BYTES)}.`;
  }
  return null;
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

// Small presence dot: green when online, hollow grey when offline.
function PresenceDot({ online, size = 9, title }) {
  return (
    <span
      title={title || (online ? "Online" : "Offline")}
      aria-label={online ? "Online" : "Offline"}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "inline-block",
        background: online ? "#22c55e" : "var(--rf-bg3)",
        border: online ? "1px solid #16a34a" : "1.5px solid var(--rf-txt3)",
        boxShadow: online ? "0 0 0 2px rgba(34,197,94,0.25)" : "none",
      }}
    />
  );
}

function ChannelItem({ room, active, unread = 0, onClick }) {
  const hasUnread = unread > 0 && !active;
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
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--rf-bg3)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: active || hasUnread ? 700 : 500,
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
      </div>
      {hasUnread && (
        <span
          style={{
            background: "var(--rf-red, #ef4444)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            borderRadius: 10,
            padding: "1px 6px",
            minWidth: 16,
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {unread}
        </span>
      )}
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

// Single/double tick read-status indicator for the sender's own messages.
function StatusTick({ status }) {
  if (status === "sending") {
    return (
      <span style={{ fontSize: 10, opacity: 0.8 }} title="Sending…">
        · sending…
      </span>
    );
  }
  const read = status === "read";
  return (
    <span
      title={read ? "Read" : "Delivered"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        // Read uses a green that's legible on the light page; Delivered inherits
        // the (now readable) meta color (TC_BUG_047).
        color: read ? "var(--rf-green, #16a34a)" : "inherit",
        fontWeight: 600,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M1.5 12.5l4 4 8-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* second tick for the "read" state */}
        <path
          d="M8.5 16.5l1 1 8-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={read ? 1 : 0}
        />
      </svg>
      <span style={{ fontSize: 10 }}>{read ? "Read" : "Delivered"}</span>
    </span>
  );
}

function Attachment({ attachmentId, url, name, type }) {
  const [busy, setBusy] = useState(false);

  // CHAT_024 — resolve a fresh presigned download URL on click. The URL baked
  // into the message list can expire; re-fetching guarantees the download works.
  const handleDownload = useCallback(
    async (e) => {
      if (!attachmentId) return; // fall through to the href (optimistic/local)
      e.preventDefault();
      if (busy) return;
      setBusy(true);
      try {
        const res = await getAttachmentDownload(attachmentId);
        const fresh = (res?.data || res)?.downloadUrl || url;
        if (fresh) window.open(fresh, "_blank", "noopener,noreferrer");
      } catch {
        if (url) window.open(url, "_blank", "noopener,noreferrer");
      } finally {
        setBusy(false);
      }
    },
    [attachmentId, url, busy]
  );

  const isImg = isImageName(name || url, type);
  if (isImg) {
    return (
      <a
        href={url || "#"}
        onClick={handleDownload}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block" }}
      >
        <img
          src={url}
          alt={name || "attachment"}
          style={{
            maxWidth: 240,
            maxHeight: 240,
            borderRadius: 8,
            display: "block",
            objectFit: "cover",
            border: "1px solid var(--rf-border)",
          }}
        />
      </a>
    );
  }
  return (
    <a
      href={url || "#"}
      onClick={handleDownload}
      target="_blank"
      rel="noopener noreferrer"
      download={name || true}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 8,
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border)",
        color: "var(--rf-txt)",
        textDecoration: "none",
        maxWidth: 260,
        opacity: busy ? 0.6 : 1,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 18 15 15" />
      </svg>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {name || "Download file"}
      </span>
    </a>
  );
}

function MessageBubble({
  msg,
  onDelete,
  onForward,
  onReply,
  onReplyClick,
  onEdit,
  currentUserId,
  status,
  registerRef,
  highlighted,
  isEditing,
  editValue,
  onEditChange,
  onEditSave,
  onEditCancel,
}) {
  const [hover, setHover] = useState(false);
  const isOwn = !!msg.isOwn;
  const bubbleBg = isOwn ? "var(--rf-blue, #3b82f6)" : "var(--rf-bg3)";
  const bubbleColor = isOwn ? "white" : "var(--rf-txt)";
  // The meta row (time / Delivered / edited) renders BELOW the bubble on the
  // light page background, NOT inside the coloured bubble — so white (own) was
  // invisible and the faint --rf-txt3 (incoming) was too low-contrast to read
  // (TC_BUG_046 time, TC_BUG_047 Delivered). Use a readable muted token for both.
  const metaColor = "var(--rf-txt2, #3a5070)";

  return (
    <div
      ref={registerRef}
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        gap: 10,
        padding: "6px 20px",
        position: "relative",
        alignItems: "flex-end",
        background: highlighted ? "rgba(59,130,246,0.12)" : "transparent",
        transition: "background 0.4s",
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

        {/* Reply reference */}
        {msg.replyToId && (
          <button
            type="button"
            onClick={() => onReplyClick?.(msg.replyToId)}
            style={{
              textAlign: "left",
              maxWidth: "100%",
              marginBottom: 3,
              padding: "5px 9px",
              borderLeft: "3px solid var(--rf-accent)",
              // Slightly tinted panel + readable text so the quoted reply isn't
              // faded/low-contrast (TC_UI_CHAT_001). The sender is accent-coloured
              // and bold; the body uses the primary text token, not the muted one.
              background: "var(--rf-bg3)",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 11,
              color: "var(--rf-txt)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title="Jump to replied message"
          >
            <span style={{ fontWeight: 700, color: "var(--rf-accent)" }}>
              {msg.replyToSender || "Reply"}
            </span>{" "}
            <span style={{ color: "var(--rf-txt2)" }}>
              {msg.replyToBody || "View message"}
            </span>
          </button>
        )}

        <div
          style={{
            position: "relative",
            // While editing, drop the coloured bubble for a neutral panel so the
            // edit form (light textarea + buttons) is aligned and readable rather
            // than crammed inside a blue bubble (TC_UI_CHAT_003).
            background: isEditing ? "var(--rf-bg2)" : bubbleBg,
            color: isEditing ? "var(--rf-txt)" : bubbleColor,
            border: isEditing ? "1px solid var(--rf-border)" : "none",
            borderRadius: 14,
            borderBottomRightRadius: isEditing ? 14 : isOwn ? 4 : 14,
            borderBottomLeftRadius: isEditing ? 14 : isOwn ? 14 : 4,
            padding: isEditing ? "10px" : "8px 12px",
            fontSize: 13,
            lineHeight: 1.45,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            boxShadow: isEditing ? "none" : "0 1px 1px rgba(0,0,0,0.08)",
            maxWidth: "100%",
          }}
        >
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 260 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--rf-txt2)",
                }}
              >
                Edit message
              </div>
              <textarea
                value={editValue}
                autoFocus
                onChange={(e) => onEditChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onEditSave?.();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    onEditCancel?.();
                  }
                }}
                rows={2}
                style={{
                  width: "100%",
                  resize: "vertical",
                  borderRadius: 8,
                  border: "1px solid var(--rf-border)",
                  background: "var(--rf-bg)",
                  color: "var(--rf-txt)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  padding: "6px 8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button
                  onClick={() => onEditCancel?.()}
                  style={{
                    background: "transparent",
                    border: "1px solid var(--rf-border)",
                    color: "var(--rf-txt2)",
                    borderRadius: 7,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => onEditSave?.()}
                  style={{
                    background: "var(--rf-accent)",
                    border: "none",
                    color: "#fff",
                    borderRadius: 7,
                    padding: "4px 12px",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </div>
              <div style={{ fontSize: 10, color: metaColor }}>
                Enter to save · Esc to cancel
              </div>
            </div>
          ) : (
            <>
              {msg.body && <ChatMessageBody message={msg} />}
              {msg.attachments?.length > 0 && (
                <div
                  style={{
                    marginTop: msg.body ? 6 : 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {msg.attachments.map((att, i) => (
                    <Attachment
                      key={att.id || i}
                      attachmentId={att.id}
                      url={att.url}
                      name={att.name}
                      type={att.type}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 3,
            paddingLeft: isOwn ? 0 : 2,
            paddingRight: isOwn ? 2 : 0,
            fontSize: 10,
            color: metaColor,
          }}
        >
          <span title={formatFull(msg.createdAt)}>
            {formatClock(msg.createdAt) || msg.timeAgo}
          </span>
          {msg.editedAt && (
            <span title={`Edited ${formatFull(msg.editedAt)}`} style={{ fontStyle: "italic" }}>
              · edited
            </span>
          )}
          {isOwn && <StatusTick status={status} />}
        </div>

        <div style={{ marginTop: 4, alignSelf: isOwn ? "flex-end" : "flex-start" }}>
          <ChatReactionsBar messageId={msg.id} currentUserId={currentUserId} />
        </div>
      </div>

      {/* Hover action bar — anchored to the SAME side as the bubble, just
          inboard of the avatar, so Reply/Forward sit right next to the message.
          The old code anchored to the opposite edge of the full-width row
          (`isOwn ? left:16 : right:16`), which pushed the buttons far from the
          bubble and OFF-SCREEN on wide viewports — so users couldn't reply or
          forward at all. */}
      {hover && !msg.pending && !isEditing && (
        <div
          style={{
            position: "absolute",
            top: 6,
            ...(isOwn ? { right: 52 } : { left: 52 }),
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: "var(--rf-bg2, #fff)",
            borderRadius: 8,
            boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
            padding: "2px 4px",
            zIndex: 5,
          }}
        >
          <button
            onClick={() => onReply?.(msg)}
            title="Reply"
            aria-label="Reply to message"
            style={hoverActionStyle}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
            Reply
          </button>
          <button
            onClick={() => onForward?.(msg)}
            title="Forward message"
            aria-label="Forward message"
            style={hoverActionStyle}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 17 20 12 15 7" />
              <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
            </svg>
            Forward
          </button>
          {msg.canDelete && msg.body && (
            <button
              onClick={() => onEdit?.(msg)}
              title="Edit message"
              aria-label="Edit message"
              style={hoverActionStyle}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
          {msg.canDelete && (
            <button
              onClick={() => onDelete(msg.id)}
              title="Delete message"
              aria-label="Delete message"
              style={{ ...hoverActionStyle, color: "var(--rf-red, #ef4444)" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const hoverActionStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "var(--rf-bg2)",
  border: "1px solid var(--rf-border)",
  borderRadius: 6,
  padding: "3px 8px",
  cursor: "pointer",
  fontSize: 11,
  color: "var(--rf-txt2)",
  fontWeight: 600,
};

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

  // ── Audit additions ───────────────────────────────────────────────────────
  const [roomSearch, setRoomSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState(null);
  const [unreadByRoom, setUnreadByRoom] = useState({}); // { roomId: count }
  const [othersReadAt, setOthersReadAt] = useState(null); // ISO: latest read by any other member
  const [typingNames, setTypingNames] = useState([]); // names currently typing in active room
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null); // message being forwarded
  const [highlightId, setHighlightId] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(() => new Set()); // presence
  const [replyTo, setReplyTo] = useState(null); // message being replied to
  const [editingId, setEditingId] = useState(null); // message id being edited
  const [editingValue, setEditingValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  // Attachment compose state — multiple files, each individually removable.
  const [pendingFiles, setPendingFiles] = useState([]); // [{ id, file, previewUrl }]
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null); // 0–100 or null

  const socket = useRealtimeSocket();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageRefs = useRef({}); // { messageId: HTMLElement } for reply scroll-to
  const activeRoomIdRef = useRef(null); // latest active room for socket/poll closures
  const notifiedIdsRef = useRef(new Set()); // de-dupe in-app notifications
  const typingTimersRef = useRef({}); // { userId: timeoutId } to expire typing indicators
  const typingSentRef = useRef(0); // throttle outbound typing-start signals
  const membersByIdRef = useRef({}); // { userId: { name } } for typing-name lookup
  const flashSuccess = useCallback((text) => {
    setSuccessMsg(text);
    setTimeout(() => setSuccessMsg((cur) => (cur === text ? null : cur)), 3000);
  }, []);

  // Auto-dismiss error banners after 5s (TC_BUG_050) — covers BOTH the general
  // error banner (lastError) AND the unsupported/oversize file error, which is
  // a separate uploadError state with its own banner. The user can still close
  // either sooner via its × button. Re-arms whenever a new error appears.
  useEffect(() => {
    if (!lastError) return;
    const t = setTimeout(() => setLastError(null), 5000);
    return () => clearTimeout(t);
  }, [lastError]);
  useEffect(() => {
    if (!uploadError) return;
    const t = setTimeout(() => setUploadError(""), 5000);
    return () => clearTimeout(t);
  }, [uploadError]);

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

  // Keep a ref of the active room for socket/poll closures, reset per-room
  // ephemeral state, clear that room's unread badge, and mark it read server-side.
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
    setTypingNames([]);
    setOthersReadAt(null);
    if (!activeRoomId) return;
    setUnreadByRoom((prev) => {
      if (!prev[activeRoomId]) return prev;
      const next = { ...prev };
      delete next[activeRoomId];
      return next;
    });
    markRoomRead(activeRoomId).catch(() => {});
  }, [activeRoomId]);

  // ── Read receipts: poll who has read up to where (Delivered → Read) ─────────
  const refreshReceipts = useCallback(async () => {
    const roomId = activeRoomIdRef.current;
    if (!roomId || !currentUser) return;
    try {
      const res = await getRoomReceipts(roomId);
      const raw = Array.isArray(res) ? res : res?.data || res?.receipts || [];
      // Latest read timestamp among *other* members.
      let latest = null;
      for (const r of raw) {
        const uid = r.userId || r.memberId || r.id;
        if (uid === currentUser.id) continue;
        const at = r.readAt || r.lastReadAt || r.at || r.readUpTo;
        if (at && (!latest || new Date(at) > new Date(latest))) latest = at;
      }
      setOthersReadAt(latest);
    } catch {
      /* receipts endpoint optional — ignore */
    }
  }, [currentUser]);

  useEffect(() => {
    if (!activeRoomId || !currentUser) return;
    refreshReceipts();
    const t = setInterval(refreshReceipts, 8000);
    return () => clearInterval(t);
  }, [activeRoomId, currentUser, refreshReceipts]);

  // Re-mark read whenever new messages land while the room is focused, so the
  // peer's "Read" status advances without a refresh.
  useEffect(() => {
    if (!activeRoomId || messages.length === 0) return;
    markRoomRead(activeRoomId).catch(() => {});
  }, [activeRoomId, messages.length]);

  // Keep a live ref of rooms for closures (notifications need room names).
  const roomsRef = useRef([]);
  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  // Keep a userId → name map for the typing indicator (which only gets a
  // userId on the wire). Sourced from loaded members + message senders.
  useEffect(() => {
    const map = { ...membersByIdRef.current };
    for (const m of roomMembers) if (m.id) map[m.id] = { name: m.name };
    for (const m of messages) if (m.senderId) map[m.senderId] = { name: m.senderName };
    membersByIdRef.current = map;
  }, [roomMembers, messages]);

  // ── Incoming message handling (shared by socket + poll) ─────────────────────
  const ingestIncoming = useCallback(
    (rawMsg, roomId) => {
      if (!rawMsg?.id || !currentUser) return;
      const isActive = roomId === activeRoomIdRef.current;
      if (isActive) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === rawMsg.id)) return prev; // de-dupe
          return [...prev, normaliseMessage(rawMsg, currentUser)];
        });
      } else {
        // Bump unread badge + raise a single in-app notification per message.
        const senderId =
          rawMsg.senderUserId || rawMsg.senderId || rawMsg.authorId || "";
        if (senderId && senderId !== currentUser.id) {
          setUnreadByRoom((prev) => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1,
          }));
          if (!notifiedIdsRef.current.has(rawMsg.id)) {
            notifiedIdsRef.current.add(rawMsg.id);
            const room = roomsRef.current.find((r) => r.id === roomId);
            const preview = String(rawMsg.body || rawMsg.content || "Attachment");
            flashSuccess(
              `New message in ${room?.name || "a conversation"}: ${preview.slice(0, 60)}`
            );
          }
        }
      }
    },
    [currentUser, flashSuccess]
  );

  // ── Realtime socket wiring (best-effort; polling below is the guarantee) ────
  useEffect(() => {
    if (!socket || !currentUser) return;
    const offs = [];

    const onCreated = ({ data }) => {
      const msg = data?.message || data;
      const roomId = data?.roomId || msg?.roomId || msg?.chatRoomId;
      if (!roomId) return;
      ingestIncoming(msg, roomId);
      // CHAT_009 — acknowledge delivery for messages from others. If the room is
      // focused this also re-marks read; markDelivered just advances the
      // delivery watermark so the sender sees "Delivered" even when unfocused.
      const senderId = msg?.senderUserId || msg?.senderId;
      if (senderId && senderId !== currentUser.id) {
        markRoomDelivered(roomId).catch(() => {});
      }
    };

    const onUpdated = ({ data }) => {
      const msg = data?.message || data;
      const id = data?.messageId || msg?.id;
      if (!id) return;
      // Apply the edit live to whichever room it belongs to (CHAT_025).
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? normaliseMessage({ ...msg, id, pending: false }, currentUser)
            : m
        )
      );
    };

    const onDeleted = ({ data }) => {
      const id = data?.messageId || data?.id;
      if (id) setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const onTyping = ({ data }) => {
      const roomId = data?.roomId;
      if (roomId !== activeRoomIdRef.current) return;
      const uid = data?.userId;
      if (!uid || uid === currentUser.id) return;
      const name =
        membersByIdRef.current?.[uid]?.name || data?.userName || data?.name || "Someone";
      // Backend payload: { roomId, userId, isTyping }. isTyping === false stops.
      if (data?.isTyping === false) {
        clearTimeout(typingTimersRef.current[uid]);
        setTypingNames((prev) => prev.filter((n) => n !== name));
        return;
      }
      setTypingNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
      clearTimeout(typingTimersRef.current[uid]);
      // Auto-expire if no stop/refresh arrives (the indicator must disappear
      // shortly after typing stops — CHAT_011).
      typingTimersRef.current[uid] = setTimeout(() => {
        setTypingNames((prev) => prev.filter((n) => n !== name));
      }, 4000);
    };

    // CHAT_009/010 — a receipt advances the read watermark for the room. The
    // sender's own messages flip Delivered → Read off this signal.
    const onReceipt = ({ data }) => {
      if (data?.roomId !== activeRoomIdRef.current) return;
      if (!data?.userId || data.userId === currentUser.id) return;
      if (data?.kind === "read" && data?.at) {
        setOthersReadAt((prev) =>
          !prev || new Date(data.at) > new Date(prev) ? data.at : prev
        );
      } else {
        // Delivery-only receipt — refresh from the authoritative endpoint.
        refreshReceipts();
      }
    };

    offs.push(onEnvelope(socket, "chat.message.created", onCreated));
    offs.push(onEnvelope(socket, "chat.message.updated", onUpdated));
    offs.push(onEnvelope(socket, "chat.message.deleted", onDeleted));
    offs.push(onEnvelope(socket, "chat.typing", onTyping));
    offs.push(onEnvelope(socket, "chat.receipt.updated", onReceipt));

    return () => offs.forEach((off) => off && off());
  }, [socket, currentUser, ingestIncoming, refreshReceipts]);

  // ── Join the active room's socket channel ───────────────────────────────────
  // The gateway only fans chat events to subscribers of `chatroom:<roomId>`;
  // we must explicitly subscribe (and re-subscribe on reconnect) or no live
  // message/typing/receipt events arrive for the open room.
  //
  // The subscribe must reach the gateway AFTER it has set socket.data.auth in
  // handleConnection. Two timing hazards make a single attempt unreliable:
  //   1. The gateway's `connected` event is a ONE-SHOT — if it fires before this
  //      React effect attaches its listener (very common, because the stub→real
  //      socket swap re-runs the effect a beat after the real socket already
  //      emitted `connected`), the join never happens and live typing/receipts
  //      silently break for the room (presence still works — that channel is
  //      joined server-side).
  //   2. Emitting on the raw `connect` event can race auth and be rejected as
  //      "Unauthenticated".
  // Fix: drive the join off the gateway's ACK. subscribe:chatroom replies with
  // { ok, channel?, error? }. We attempt immediately (covers the already-authed
  // case), retry briefly on a not-yet-authed rejection, and also re-join on both
  // `connect` (reconnect) and `connected` (fresh auth). Idempotent: re-joining a
  // channel the socket is already in is a no-op server-side.
  useEffect(() => {
    if (!socket || !activeRoomId) return;
    let cancelled = false;
    let retry = null;

    const join = (attempt = 0) => {
      if (cancelled) return;
      socket.emit?.("subscribe:chatroom", { roomId: activeRoomId }, (ack) => {
        // No ack (older gateway / stub) → assume best-effort success.
        if (cancelled || !ack || ack.ok) return;
        // Rejected (usually auth not ready yet) — back off and retry a few times.
        if (attempt < 5) {
          retry = setTimeout(() => join(attempt + 1), 400 * (attempt + 1));
        }
      });
    };

    // Attempt right away; if the socket isn't authed yet the ack-retry recovers.
    join();
    socket.on?.("connect", () => join()); // socket.io transport (re)connect
    socket.on?.("connected", () => join()); // gateway server-confirmed auth
    return () => {
      cancelled = true;
      if (retry) clearTimeout(retry);
      socket.emit?.("unsubscribe", { channel: `chatroom:${activeRoomId}` });
      socket.off?.("connect", join);
      socket.off?.("connected", join);
    };
  }, [socket, activeRoomId]);

  // ── Presence: who's online (CHAT_012/013) ──────────────────────────────────
  // Live edge updates arrive on the org channel as `chat.presence.changed`
  // { userId, online }. The gateway joins the caller's org channel on connect,
  // so no extra subscribe is needed. We also send a 25s heartbeat so our own
  // presence key never expires while the tab is open.
  useEffect(() => {
    if (!socket || !currentUser) return;
    const onChanged = ({ data }) => {
      const id = data?.userId;
      const online = !!data?.online;
      if (!id) return;
      setOnlineUserIds((prev) => {
        if (online === prev.has(id)) return prev;
        const next = new Set(prev);
        if (online) next.add(id);
        else next.delete(id);
        return next;
      });
    };
    const off = onEnvelope(socket, "chat.presence.changed", onChanged);

    // Heartbeat keeps OUR own presence key alive (30s TTL on the server). Send
    // it well inside the TTL window so we never flicker offline to peers, and
    // include the active room so the per-room presence snapshot stays accurate
    // for the people we're actually looking at.
    const beat = () =>
      socket.emit?.("presence:heartbeat", {
        roomId: activeRoomIdRef.current || undefined,
      });
    beat();
    const hb = setInterval(beat, 15000);
    return () => {
      off && off();
      clearInterval(hb);
    };
  }, [socket, currentUser]);

  // Seed the presence snapshot for the open room's members (CHAT_012/013), then
  // live `chat.presence.changed` events keep it current. Re-seed on room switch.
  //
  // The snapshot is ADDITIVE only: it may mark a peer online, but it must NOT
  // mark a peer offline. The REST snapshot (getRoomPresence) reads a 30s-TTL
  // heartbeat key that can briefly lag behind a peer who is genuinely connected
  // (e.g. a freshly-joined peer, or the gap between heartbeats). Letting a stale
  // "offline" row delete someone the live `chat.presence.changed` event already
  // told us is online made the header flicker back to "Offline" while the peer
  // was right there typing. Going-offline is therefore driven exclusively by the
  // authoritative live edge event, never by this poll.
  useEffect(() => {
    if (!activeRoomId || !currentUser) return;
    let cancelled = false;
    const seed = async () => {
      try {
        const res = await getRoomPresence(activeRoomId);
        const list = Array.isArray(res) ? res : res?.data || [];
        if (cancelled) return;
        setOnlineUserIds((prev) => {
          let changed = false;
          const next = new Set(prev);
          for (const row of list) {
            if (row?.userId && row.online && !next.has(row.userId)) {
              next.add(row.userId);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      } catch {
        /* presence is best-effort — dots just stay as they were */
      }
    };
    seed();
    // Re-seed on a slow cadence so a peer who connected while we were already in
    // the room (and whose live edge we somehow missed) still lights up, without
    // ever flipping anyone off.
    const t = setInterval(seed, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [activeRoomId, currentUser]);

  // Seed presence for the ENTIRE org directory (not just the open room), so the
  // sidebar People list + DM rows show an accurate online dot for everyone the
  // moment chat loads — including peers who were already online before we
  // connected (whose live `chat.presence.changed` edge we'd never have seen).
  // Additive only, same as the room seed: it can light someone up but never
  // turns anyone off (live edge events own going-offline).
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    const seedAll = async () => {
      try {
        const list = await getDirectoryPresence();
        if (cancelled || !Array.isArray(list)) return;
        setOnlineUserIds((prev) => {
          let changed = false;
          const next = new Set(prev);
          for (const row of list) {
            if (row?.userId && row.online && !next.has(row.userId)) {
              next.add(row.userId);
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      } catch {
        /* best-effort */
      }
    };
    seedAll();
    const t = setInterval(seedAll, 15000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [currentUser]);

  // ── Polling fallback: active-room messages + room unread (no refresh needed) ─
  useEffect(() => {
    if (!currentUser) return;
    const tick = async () => {
      const roomId = activeRoomIdRef.current;
      if (!roomId || document.hidden) return;
      try {
        const res = await listMessages(roomId, { limit: 50 });
        const raw = Array.isArray(res) ? res : res?.data || res?.messages || [];
        const next = [...raw].reverse();
        setMessages((prev) => {
          // Preserve optimistic (pending) messages not yet returned by the API.
          const serverIds = new Set(next.map((m) => m.id));
          const pendings = prev.filter((m) => m.pending && !serverIds.has(m.id));
          const merged = [
            ...next.map((m) => normaliseMessage(m, currentUser)),
            ...pendings,
          ];
          // Skip state churn when nothing changed.
          if (
            merged.length === prev.length &&
            merged.every((m, i) => m.id === prev[i]?.id && m.body === prev[i]?.body)
          ) {
            return prev;
          }
          return merged;
        });
      } catch {
        /* transient — try again next tick */
      }
    };
    const t = setInterval(tick, 6000);
    return () => clearInterval(t);
  }, [currentUser]);

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

  // ── Typing signals (outbound) ──────────────────────────────────────────────
  const signalTyping = useCallback(() => {
    if (!activeRoomId) return;
    const now = Date.now();
    // Throttle "start" to at most once every 2.5s per compose session.
    if (now - typingSentRef.current > 2500) {
      typingSentRef.current = now;
      startTyping(activeRoomId).catch(() => {});
    }
  }, [activeRoomId]);

  const stopTypingNow = useCallback(() => {
    if (!activeRoomId) return;
    typingSentRef.current = 0;
    stopTyping(activeRoomId).catch(() => {});
  }, [activeRoomId]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (e.target.value) signalTyping();
    else stopTypingNow();
  };

  // ── File selection + validation (multiple, append, any format) ─────────────
  const handleFilePick = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file(s)
    if (!files.length) return;

    const accepted = [];
    const errors = [];
    for (const file of files) {
      const err = validateUploadFile(file);
      if (err) {
        errors.push(err);
        continue;
      }
      accepted.push({
        id: `f-${Date.now()}-${Math.round(file.size)}-${file.name}`,
        file,
        previewUrl: isImageName(file.name, file.type)
          ? URL.createObjectURL(file)
          : null,
      });
    }
    setUploadError(errors.join(" "));
    if (accepted.length) {
      setPendingFiles((prev) => [...prev, ...accepted]);
    }
  };

  const removePendingFile = (id) => {
    setPendingFiles((prev) => {
      const found = prev.find((p) => p.id === id);
      if (found?.previewUrl) URL.revokeObjectURL(found.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearPendingFiles = () => {
    setPendingFiles((prev) => {
      prev.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
      return [];
    });
  };

  // ── Upload one attachment via the chat presign → S3 → confirm flow ──────────
  // CHAT_020–023: init validates type+size on the server BEFORE issuing a URL;
  // we PUT to S3, then confirm. Returns the attachmentId to bind on postMessage.
  const uploadOneAttachment = useCallback(
    async (file, room) => {
      // 1. Validate + reserve (server rejects bad type/size here with a message).
      const init = await initAttachment(room.id, {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        fileSize: file.size,
      });
      const data = init?.data || init || {};
      const attachmentId = data.attachmentId;
      const uploadUrl = data.uploadUrl;
      if (!attachmentId || !uploadUrl) {
        throw new Error("Upload could not be started.");
      }

      // 2. PUT the binary straight to S3.
      await uploadFileToS3(uploadUrl, file, (p) => setUploadProgress(p));

      // 3. Confirm so the server marks it ready to bind (CHAT_020/021).
      await confirmAttachment(attachmentId);

      return { attachmentId, name: file.name, type: file.type || "" };
    },
    []
  );

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    const body = inputValue.trim();
    const filesToSend = pendingFiles;
    const replyRef = replyTo;
    const room = activeRoom;
    if (
      (!body && filesToSend.length === 0) ||
      sending ||
      !activeRoomId ||
      !currentUser
    )
      return;

    stopTypingNow();
    setShowEmoji(false);
    const nowIso = new Date().toISOString();
    const first = filesToSend[0]?.file;
    const optimistic = normaliseMessage(
      {
        id: "opt-" + Date.now(),
        senderUserId: currentUser.id,
        senderName: currentUser.name,
        body,
        createdAt: nowIso,
        attachmentUrl: filesToSend[0]?.previewUrl || null,
        attachmentName: first?.name || "",
        attachmentType: first?.type || "",
        replyToId: replyRef?.id || null,
        replyToBody: replyRef?.body || replyRef?.attachmentName || "",
        replyToSender: replyRef?.senderName || "",
        pending: true,
      },
      currentUser
    );

    setMessages((prev) => [...prev, optimistic]);
    setInputValue("");
    // Detach the array from state without revoking the object URLs yet — we may
    // need to restore them if the send fails.
    setPendingFiles([]);
    setReplyTo(null);
    inputRef.current?.focus();
    setSending(true);

    try {
      // Upload any attachments first (chat presign → S3 → confirm). Each returns
      // an attachmentId we bind to the single outgoing message (CHAT_020/021).
      const attachmentIds = [];
      if (filesToSend.length > 0) {
        setUploadProgress(0);
        for (const pf of filesToSend) {
          const { attachmentId } = await uploadOneAttachment(pf.file, room);
          if (attachmentId) attachmentIds.push(attachmentId);
        }
        setUploadProgress(100);
      }

      // One message carries the text, the reply ref (parentId), and all files.
      const res = await postMessage(activeRoomId, {
        body,
        parentId: replyRef?.id || undefined,
        attachmentIds: attachmentIds.length ? attachmentIds : undefined,
      });

      const saved = res?.data || res;
      if (saved?.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimistic.id
              ? normaliseMessage({ ...saved, canDelete: true }, currentUser)
              : m
          )
        );
      }
      if (filesToSend.length > 0) {
        flashSuccess(
          `${filesToSend.length} file${filesToSend.length > 1 ? "s" : ""} uploaded.`
        );
        // Safe to release the local previews now that the upload succeeded.
        filesToSend.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
      }
    } catch (err) {
      // Roll the optimistic message back so the user sees the failure, and
      // restore whatever they had typed / attached so nothing is silently lost.
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      if (body) setInputValue(body);
      if (filesToSend.length > 0) setPendingFiles(filesToSend);
      if (replyRef) setReplyTo(replyRef);
      setLastError(extractErrorMessage(err, "Failed to send message"));
    } finally {
      setSending(false);
      setUploadProgress(null);
    }
  };

  // ── Edit a message (inline) ─────────────────────────────────────────────────
  const startEdit = (msg) => {
    if (!msg?.id) return;
    setEditingId(msg.id);
    setEditingValue(msg.body || "");
  };
  // Global ESC cancels edit mode regardless of focus (TC_UI_CHAT_002). The
  // textarea has its own onKeyDown ESC, but that only fires while it holds
  // focus — a document listener guarantees ESC always exits the edit state.
  useEffect(() => {
    if (!editingId) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setEditingId(null);
        setEditingValue("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editingId]);

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };
  const saveEdit = async () => {
    const id = editingId;
    const newBody = editingValue.trim();
    if (!id) return;
    const target = messages.find((m) => m.id === id);
    if (!target) {
      cancelEdit();
      return;
    }
    if (!newBody) {
      setLastError("Message can't be empty — delete it instead.");
      return;
    }
    if (newBody === target.body) {
      cancelEdit();
      return;
    }
    const snapshot = messages;
    const nowIso = new Date().toISOString();
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, body: newBody, editedAt: nowIso } : m))
    );
    cancelEdit();
    try {
      const res = await editChatMessage(activeRoomId, id, newBody);
      const saved = res?.data || res;
      // Reconcile with the server's authoritative row (real editedAt, etc.).
      if (saved?.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? normaliseMessage({ ...saved, canDelete: true }, currentUser)
              : m
          )
        );
      }
      flashSuccess("Message updated.");
    } catch (err) {
      // Restore the original so an edit never silently sticks on failure.
      setMessages(snapshot);
      setLastError(extractErrorMessage(err, "Failed to update message"));
    }
  };

  // ── Begin a reply (focus composer; preview banner shows above the input) ─────
  const beginReply = (msg) => {
    if (!msg?.id) return;
    setReplyTo(msg);
    setEditingId(null);
    inputRef.current?.focus();
  };

  // ── Insert an emoji at the caret in the message input ───────────────────────
  const insertEmoji = (emoji) => {
    const el = inputRef.current;
    if (el && typeof el.selectionStart === "number") {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      setInputValue((v) => v.slice(0, start) + emoji + v.slice(end));
      // Restore the caret just after the inserted emoji on the next tick.
      requestAnimationFrame(() => {
        try {
          el.focus();
          const pos = start + emoji.length;
          el.setSelectionRange(pos, pos);
        } catch {
          /* ignore */
        }
      });
    } else {
      setInputValue((v) => v + emoji);
    }
  };

  // ── Forward a message to another room (uses the confirmed postMessage API) ──
  // Forwards the text body. Attachments aren't re-bound across rooms (each is
  // tied to its original room/message), so a forwarded copy carries the text.
  const forwardBody = (msg) =>
    msg.body ||
    (msg.attachments?.length
      ? `[Attachment: ${msg.attachments[0].name}]`
      : "");

  const handleForward = async (targetRoomId) => {
    if (!forwardMsg || !targetRoomId) return;
    try {
      await postMessage(targetRoomId, { body: forwardBody(forwardMsg) });
      setForwardMsg(null);
      const room = rooms.find((r) => r.id === targetRoomId);
      flashSuccess(`Message forwarded to ${room?.name || "conversation"}.`);
      if (targetRoomId === activeRoomId) fetchMessages(activeRoomId);
    } catch (err) {
      setLastError(extractErrorMessage(err, "Failed to forward message"));
    }
  };

  // Forward to a PERSON (no existing room needed) — opens/creates the DM, then
  // posts the forwarded body there. Lets forwarding work even when the only
  // conversation is the one you're in (WhatsApp-style "forward to a contact").
  const handleForwardToPerson = async (person) => {
    if (!forwardMsg || !person?.id) return;
    try {
      const room = await openDirectRoom(person.id);
      const roomId = room?.id || room?.data?.id;
      if (!roomId) throw new Error("Could not open conversation");
      await postMessage(roomId, { body: forwardBody(forwardMsg) });
      setForwardMsg(null);
      flashSuccess(`Message forwarded to ${person.name || "contact"}.`);
      await fetchRooms();
    } catch (err) {
      setLastError(extractErrorMessage(err, "Failed to forward message"));
    }
  };

  // ── Scroll to / highlight a replied-to message ─────────────────────────────
  const scrollToMessage = (id) => {
    const el = messageRefs.current[id];
    if (!el) {
      setLastError("Original message is not loaded in this view.");
      return;
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(id);
    setTimeout(() => setHighlightId((cur) => (cur === id ? null : cur)), 1600);
  };

  // ── Delete message (confirm → delete → success feedback) ───────────────────
  const performDelete = async (msgId) => {
    setConfirmDeleteId(null);
    const snapshot = messages;
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      await deleteChatMessage(activeRoomId, msgId);
      flashSuccess("Message deleted.");
    } catch (err) {
      // Restore so the message never disappears silently on failure.
      setMessages(snapshot);
      setLastError(extractErrorMessage(err, "Failed to delete message"));
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

  // ── Conversation search (rooms + people) ──────────────────────────────────
  const search = roomSearch.trim().toLowerCase();
  const matchedRooms = search
    ? decoratedRooms.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(search) ||
          (r.subtitle || "").toLowerCase().includes(search)
      )
    : decoratedRooms;
  const groups = groupBySection(matchedRooms);

  const allPeopleWithoutSelf = people.filter((u) => u.id !== currentUser.id);
  const peopleWithoutSelf = search
    ? allPeopleWithoutSelf.filter((u) => {
        const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        return name.includes(search) || (u.email || "").toLowerCase().includes(search);
      })
    : allPeopleWithoutSelf;

  const hasSearchResults =
    matchedRooms.length > 0 || (search && peopleWithoutSelf.length > 0);
  const totalUnread = Object.values(unreadByRoom).reduce((a, b) => a + b, 0);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      {/* ── Inline success toast ─────────────────────────────────────────────── */}
      {successMsg && (
        <div
          role="status"
          style={{
            position: "absolute",
            top: lastError ? 56 : 12,
            right: 16,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(22,163,74,0.96)",
            color: "white",
            border: "1px solid rgba(22,163,74,1)",
            borderRadius: 8,
            padding: "8px 12px",
            fontSize: 12,
            fontWeight: 600,
            maxWidth: 420,
            boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
          }}
        >
          <span style={{ flex: 1 }}>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg(null)}
            aria-label="Dismiss"
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
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Messages
                {totalUnread > 0 && (
                  <span
                    style={{
                      background: "var(--rf-red, #ef4444)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      borderRadius: 10,
                      padding: "1px 6px",
                      minWidth: 16,
                      textAlign: "center",
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
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

          {/* Conversation search */}
          <div style={{ padding: "10px 12px 4px" }}>
            <div style={{ position: "relative" }}>
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
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--rf-txt3)",
                }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                placeholder="Search conversations…"
                style={{
                  width: "100%",
                  padding: "8px 10px 8px 30px",
                  fontSize: 12,
                  background: "var(--rf-bg)",
                  color: "var(--rf-txt)",
                  border: "1px solid var(--rf-border)",
                  borderRadius: 8,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {roomSearch && (
                <button
                  onClick={() => setRoomSearch("")}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--rf-txt3)",
                    fontSize: 16,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Room groups */}
          <div style={{ flex: 1, paddingBottom: 16 }}>
            {search && !hasSearchResults && (
              <div
                style={{
                  textAlign: "center",
                  padding: "28px 16px",
                  color: "var(--rf-txt3)",
                  fontSize: 12.5,
                }}
              >
                No results found for &ldquo;{roomSearch}&rdquo;
              </div>
            )}
            {groups.map(([section, sectionRooms]) => (
              <div key={section}>
                <SectionLabel label={section} />
                {sectionRooms.map((room) => (
                  <div key={room.id} style={{ padding: "1px 6px" }}>
                    <ChannelItem
                      room={room}
                      active={room.id === activeRoomId}
                      unread={unreadByRoom[room.id] || 0}
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
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <Avatar
                            initials={nameToInitials(name)}
                            color={colorFor(name)}
                            size={24}
                          />
                          <span
                            style={{
                              position: "absolute",
                              bottom: -1,
                              right: -1,
                              borderRadius: "50%",
                              padding: 1,
                              background: "var(--rf-bg2)",
                              display: "inline-flex",
                            }}
                          >
                            <PresenceDot
                              online={onlineUserIds.has(u.id)}
                              size={8}
                              title={`${name} is ${
                                onlineUserIds.has(u.id) ? "online" : "offline"
                              }`}
                            />
                          </span>
                        </div>
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
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {activeRoom?.name || ""}
              {activeRoom?.roomType === "DIRECT" && activeRoom?.peerId && (
                <PresenceDot online={onlineUserIds.has(activeRoom.peerId)} />
              )}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 1 }}
            >
              {activeRoom?.roomType === "DIRECT" && activeRoom?.peerId
                ? `${onlineUserIds.has(activeRoom.peerId) ? "Online" : "Offline"} · `
                : ""}
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
            messages.map((msg, i) => {
              const prev = messages[i - 1];
              const showDay =
                msg.createdAt &&
                (!prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt));
              // Status for the sender's own messages (CHAT_009/010). Combine two
              // signals and take the furthest-along: (a) the live read watermark
              // `othersReadAt` (advanced by chat.receipt.updated), and (b) the
              // server-derived per-message `msg.status`. Either alone is correct;
              // together they stay right whether the update arrived via socket or
              // the last fetch.
              let status = null;
              if (msg.pending) status = "sending";
              else if (msg.isOwn) {
                const readByWatermark =
                  othersReadAt &&
                  msg.createdAt &&
                  new Date(othersReadAt) >= new Date(msg.createdAt);
                const rank = { sent: 0, delivered: 1, read: 2 };
                const fromServer = msg.status === "read" || msg.status === "delivered" ? msg.status : "delivered";
                const fromWatermark = readByWatermark ? "read" : "delivered";
                status = rank[fromServer] >= rank[fromWatermark] ? fromServer : fromWatermark;
              }
              return (
                <Fragment key={msg.id}>
                  {showDay && (
                    <div
                      style={{
                        textAlign: "center",
                        margin: "10px 0 6px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--rf-txt3)",
                          background: "var(--rf-bg2)",
                          border: "1px solid var(--rf-border)",
                          borderRadius: 10,
                          padding: "2px 10px",
                        }}
                      >
                        {formatDayLabel(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    msg={msg}
                    onDelete={(id) => setConfirmDeleteId(id)}
                    onForward={(m) => setForwardMsg(m)}
                    onReply={beginReply}
                    onReplyClick={scrollToMessage}
                    onEdit={startEdit}
                    currentUserId={currentUser?.id}
                    status={status}
                    highlighted={highlightId === msg.id}
                    isEditing={editingId === msg.id}
                    editValue={editingValue}
                    onEditChange={setEditingValue}
                    onEditSave={saveEdit}
                    onEditCancel={cancelEdit}
                    registerRef={(el) => {
                      if (el) messageRefs.current[msg.id] = el;
                    }}
                  />
                </Fragment>
              );
            })
          )}

          {/* Typing indicator — WhatsApp-style animated bubble (CHAT_011) */}
          {typingNames.length > 0 && (
            <div style={{ padding: "2px 20px 8px" }}>
              <span className="cx-typing" aria-live="polite">
                <span className="cx-typing-bubble" aria-hidden="true">
                  <span className="cx-typing-dot" />
                  <span className="cx-typing-dot" />
                  <span className="cx-typing-dot" />
                </span>
                <span className="cx-typing-label">
                  {typingNames.length === 1
                    ? `${typingNames[0]} is typing…`
                    : `${typingNames.slice(0, 2).join(", ")}${
                        typingNames.length > 2 ? " and others" : ""
                      } are typing…`}
                </span>
              </span>
            </div>
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
          {/* Upload validation error */}
          {uploadError && (
            <div
              style={{
                fontSize: 12,
                color: "var(--rf-red, #ef4444)",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 8,
                padding: "6px 10px",
                marginBottom: 8,
              }}
            >
              {uploadError}
            </div>
          )}

          {/* Pending attachments — one removable chip per file */}
          {pendingFiles.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {pendingFiles.map(({ id, file, previewUrl }) => (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 8,
                    background: "var(--rf-bg)",
                    border: "1px solid var(--rf-border)",
                    maxWidth: 240,
                  }}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={file.name}
                      style={{
                        width: 36,
                        height: 36,
                        objectFit: "cover",
                        borderRadius: 6,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: "var(--rf-bg3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--rf-txt2)",
                        textTransform: "uppercase",
                        flexShrink: 0,
                      }}
                    >
                      {fileExt(file.name) || "file"}
                    </div>
                  )}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--rf-txt)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={file.name}
                    >
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                      {humanSize(file.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => removePendingFile(id)}
                    aria-label={`Remove ${file.name}`}
                    title="Remove"
                    style={{
                      background: "var(--rf-bg3)",
                      border: "none",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      cursor: "pointer",
                      color: "var(--rf-txt2)",
                      fontSize: 14,
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {pendingFiles.length > 1 && (
                <button
                  onClick={clearPendingFiles}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--rf-txt3)",
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: "underline",
                  }}
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Upload progress (shared) */}
          {uploadProgress !== null && (
            <div
              style={{
                height: 4,
                background: "var(--rf-bg3)",
                borderRadius: 2,
                marginBottom: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${uploadProgress}%`,
                  height: "100%",
                  background: "var(--rf-accent)",
                  transition: "width 0.2s",
                }}
              />
            </div>
          )}

          {/* Reply preview — shows which message the next send will reference */}
          {replyTo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
                padding: "6px 10px",
                borderLeft: "3px solid var(--rf-accent)",
                background: "var(--rf-bg)",
                border: "1px solid var(--rf-border)",
                borderRadius: 8,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--rf-accent)", flexShrink: 0 }}>
                <polyline points="9 17 4 12 9 7" />
                <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
              </svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--rf-txt2)" }}>
                  Replying to {replyTo.senderName || "message"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--rf-txt3)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {replyTo.body || replyTo.attachmentName || "Attachment"}
                </div>
              </div>
              <button
                onClick={() => setReplyTo(null)}
                aria-label="Cancel reply"
                title="Cancel reply"
                style={{
                  background: "var(--rf-bg3)",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  cursor: "pointer",
                  color: "var(--rf-txt2)",
                  fontSize: 14,
                  lineHeight: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilePick}
              style={{ display: "none" }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach files"
              aria-label="Attach files"
              disabled={sending}
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                border: "1px solid var(--rf-border)",
                background: "var(--rf-bg)",
                color: "var(--rf-txt2)",
                cursor: sending ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            {/* Emoji picker */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setShowEmoji((v) => !v)}
                title="Emoji"
                aria-label="Insert emoji"
                aria-expanded={showEmoji}
                disabled={sending}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  border: "1px solid var(--rf-border)",
                  background: showEmoji ? "var(--rf-bg3)" : "var(--rf-bg)",
                  color: "var(--rf-txt2)",
                  cursor: sending ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  lineHeight: 1,
                }}
              >
                😊
              </button>
              {showEmoji && (
                <>
                  {/* click-away backdrop */}
                  <div
                    onClick={() => setShowEmoji(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  />
                  <div
                    role="menu"
                    style={{
                      position: "absolute",
                      bottom: 50,
                      left: 0,
                      zIndex: 50,
                      width: 248,
                      padding: 8,
                      background: "var(--rf-bg2)",
                      border: "1px solid var(--rf-border)",
                      borderRadius: 12,
                      boxShadow: "0 16px 32px rgba(0,0,0,0.3)",
                      display: "grid",
                      gridTemplateColumns: "repeat(8, 1fr)",
                      gap: 2,
                    }}
                  >
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        title={emoji}
                        style={{
                          background: "transparent",
                          border: "none",
                          borderRadius: 6,
                          cursor: "pointer",
                          fontSize: 18,
                          lineHeight: 1,
                          padding: "5px 0",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--rf-bg3)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

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
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onBlur={stopTypingNow}
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
                  onClick={() => {
                    setInputValue("");
                    stopTypingNow();
                  }}
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
              disabled={
                (!inputValue.trim() && pendingFiles.length === 0) || sending
              }
              style={{
                padding: "11px 22px",
                borderRadius: 10,
                border: "none",
                background:
                  (inputValue.trim() || pendingFiles.length > 0) && !sending
                    ? "var(--rf-accent)"
                    : "var(--rf-bg3)",
                color:
                  (inputValue.trim() || pendingFiles.length > 0) && !sending
                    ? "#fff"
                    : "var(--rf-txt3)",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  (inputValue.trim() || pendingFiles.length > 0) && !sending
                    ? "pointer"
                    : "default",
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

      {/* ── Delete confirmation ────────────────────────────────────────────── */}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete message?"
          message="This message will be removed for everyone. This action cannot be undone."
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => performDelete(confirmDeleteId)}
        />
      )}

      {/* ── Forward modal ──────────────────────────────────────────────────── */}
      {forwardMsg && (
        <ForwardModal
          message={forwardMsg}
          rooms={decoratedRooms.filter((r) => r.id !== activeRoomId)}
          people={people.filter((u) => u.id !== currentUser.id)}
          onForward={handleForward}
          onForwardToPerson={handleForwardToPerson}
          onClose={() => setForwardMsg(null)}
        />
      )}
    </div>
  );
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 380,
          padding: 22,
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 800, color: "var(--rf-txt)" }}>
          {title}
        </h3>
        <p style={{ margin: "0 0 18px", fontSize: 13, color: "var(--rf-txt2)", lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              padding: "8px 16px",
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
            onClick={onConfirm}
            autoFocus
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              border: "none",
              background: danger ? "var(--rf-red, #ef4444)" : "var(--rf-accent)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Forward picker ───────────────────────────────────────────────────────────
function ForwardModal({
  message,
  rooms,
  people = [],
  onForward,
  onForwardToPerson,
  onClose,
}) {
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState(null);
  const q = query.trim().toLowerCase();

  // Forward targets = existing conversations PLUS people you can DM. People
  // already covered by an existing room are dropped so they don't appear twice.
  const roomPeerIds = new Set(rooms.map((r) => r.peerId).filter(Boolean));
  const roomItems = (
    q ? rooms.filter((r) => (r.name || "").toLowerCase().includes(q)) : rooms
  ).map((r) => ({ kind: "room", id: r.id, label: r.name, ref: r }));
  // The directory returns firstName/lastName/email (no `name`), so derive the
  // display name the same way the rest of the app does — otherwise the row
  // falls back to the raw email (e.g. "pm3@acme.com" instead of "Bob Lee").
  const personName = (u) =>
    u.name ||
    u.displayName ||
    `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
    u.email ||
    "Contact";
  const peopleItems = people
    .filter((u) => !roomPeerIds.has(u.id))
    .filter((u) =>
      q
        ? personName(u).toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q)
        : true,
    )
    .map((u) => ({
      kind: "person",
      id: `person:${u.id}`,
      label: personName(u),
      sub: u.email || "Start a direct message",
      ref: { ...u, name: personName(u) },
    }));
  const list = [...roomItems, ...peopleItems];

  const go = async (item) => {
    setBusyId(item.id);
    try {
      if (item.kind === "person") await onForwardToPerson(item.ref);
      else await onForward(item.ref.id);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
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
          maxWidth: 420,
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
            padding: "16px 20px 12px",
            borderBottom: "1px solid var(--rf-border)",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--rf-txt)" }}>
            Forward message
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--rf-txt3)",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "12px 20px 0" }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--rf-txt2)",
              background: "var(--rf-bg)",
              border: "1px solid var(--rf-border)",
              borderRadius: 8,
              padding: "8px 10px",
              marginBottom: 12,
              maxHeight: 70,
              overflow: "hidden",
            }}
          >
            {message.body || message.attachmentName || "Attachment"}
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people or conversations…"
            autoFocus
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 13,
              background: "var(--rf-bg)",
              color: "var(--rf-txt)",
              border: "1px solid var(--rf-border)",
              borderRadius: 8,
              boxSizing: "border-box",
              marginBottom: 8,
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
          {list.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 20,
                color: "var(--rf-txt3)",
                fontSize: 13,
              }}
            >
              {query.trim()
                ? "No people or conversations match."
                : "No one else to forward to yet."}
            </div>
          ) : (
            list.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item)}
                disabled={busyId !== null}
                style={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "10px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "transparent",
                  cursor: busyId !== null ? "wait" : "pointer",
                  color: "var(--rf-txt)",
                  fontSize: 13,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--rf-bg3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <span
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </span>
                  {item.sub && (
                    <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                      {item.sub}
                    </span>
                  )}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--rf-accent)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {busyId === item.id ? "Sending…" : "Forward →"}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
