import sendRequest from "../instance/sendRequest";
import { getUser } from "../instance/tokenService";

// ── Chat Rooms (single UI, dual endpoint) ─────────────────────────────────────
// There is ONE chat UI (containers/Chat). The backend exposes the SAME chat
// service behind two controller paths because tenant rooms are org-scoped and
// reject org-less platform users:
//   • tenant users  → /chat-rooms/*
//   • SUPERADMIN     → /platform/chat-rooms/*   (cross-org rooms + DMs)
// This service detects the caller and routes to the right base. The container
// is unchanged and works for both. A few enhancements (typing, receipts,
// archive, project-scoped rooms) exist only on the tenant path; for a platform
// user they degrade to safe no-ops so the shared UI never errors.

const isPlatformUser = () => {
  try {
    const u = JSON.parse(getUser() || "null");
    return Boolean(u?.isPlatformUser);
  } catch {
    return false;
  }
};

// Base path for the current caller. Platform users (SUPERADMIN) talk to the
// platform surface; everyone else to the org-scoped surface.
const base = () => (isPlatformUser() ? "/platform/chat-rooms" : "/chat-rooms");

// A resolved no-op for platform-unsupported enhancements (keeps the shared UI
// from throwing on features the platform surface doesn't expose).
const noop = async (value = null) => value;

/** Create a chat room.
 *  Tenant payload: { name, roomType, cxProjectId?, participantOrgIds?, participantUserIds? }
 *  Platform payload: { name, participantUserIds? }  (always a platform-owned room)
 */
export const createChatRoom = async (payload) =>
  sendRequest({ url: base(), method: "POST", data: payload });

/** List rooms visible to the caller. params: { cxProjectId?, roomType?, includeArchived? } */
export const listChatRooms = async (params = {}) =>
  sendRequest({ url: base(), method: "GET", params });

/** Get a single room by ID (includes members list). */
export const getChatRoom = async (id) =>
  sendRequest({ url: `${base()}/${id}`, method: "GET" });

/** Soft-archive a room (tenant owner only). Platform rooms aren't archivable → no-op. */
export const archiveChatRoom = async (id) => {
  if (isPlatformUser()) return noop();
  return sendRequest({ url: `/chat-rooms/${id}/archive`, method: "POST" });
};

/** List resolved members visible in a room (with names + role). */
export const listRoomMembers = async (roomId) =>
  sendRequest({ url: `${base()}/${roomId}/members`, method: "GET" });

/** Add explicit member userIds to a room. Tenant: same-org only; platform: any org. */
export const addRoomMembers = async (roomId, userIds) =>
  sendRequest({ url: `${base()}/${roomId}/members`, method: "POST", data: { userIds } });

/** Remove a single member from a room (tenant owner only). Not supported on platform path → no-op. */
export const removeRoomMember = async (roomId, userId) => {
  if (isPlatformUser()) return noop();
  return sendRequest({ url: `/chat-rooms/${roomId}/members/${userId}`, method: "DELETE" });
};

/** Users available for the member-picker.
 *  Tenant: teammates in the caller's org. Platform: active users across ALL orgs.
 */
export const listOrgUsers = async () => {
  if (isPlatformUser()) {
    const res = await sendRequest({ url: "/platform/chat-rooms/_directory/users", method: "GET" });
    return Array.isArray(res) ? res : res?.data || [];
  }
  return sendRequest({ url: "/chat-rooms/_directory/users", method: "GET" });
};

/** Open (find or create) a DIRECT 1:1 chat. Tenant: same-org peer; platform: any user. Idempotent. */
export const openDirectRoom = async (peerUserId) =>
  sendRequest({ url: `${base()}/direct/${peerUserId}`, method: "POST" });

/** Projects for scoping cross-org rooms (tenant only). Platform rooms aren't project-scoped → []. */
export const listChatProjects = async () => {
  if (isPlatformUser()) return noop([]);
  return sendRequest({ url: "/chat-rooms/_directory/projects", method: "GET" });
};

/** Paginated message history. params: { page?, limit?, before? } */
export const listMessages = async (roomId, params = {}) =>
  sendRequest({ url: `${base()}/${roomId}/messages`, method: "GET", params });

/** Post a new message.
 *  payload: { body, parentId?, mentionedUserIds?, attachmentIds? }
 *  - parentId       → threaded reply (CHAT_027); the response carries a
 *                     `replyTo` quoted preview of the parent.
 *  - attachmentIds  → ids returned by initAttachment + confirmed via
 *                     confirmAttachment (CHAT_020/021); bound to this message.
 *  The response includes `status` (SENT|DELIVERED|READ), `attachments[]`,
 *  `editedAt`, and `replyTo`.
 */
export const postMessage = async (roomId, payload) =>
  sendRequest({ url: `${base()}/${roomId}/messages`, method: "POST", data: payload });

/** Edit a message body (own messages only).
 *  Mirrors the delete route; the server stamps an editedAt timestamp which the
 *  client surfaces as an "edited" indicator.
 *  payload echoed back: { id, body, editedAt, ... }
 */
export const editChatMessage = async (_roomId, msgId, body) =>
  sendRequest({ url: `/chat-rooms/messages/${msgId}`, method: "PATCH", data: { body } });

/** Delete a message (own messages only).
 *  Soft-delete — row is preserved for audit, body is hidden.
 */
export const deleteChatMessage = async (_roomId, msgId) =>
  sendRequest({ url: `/chat-rooms/messages/${msgId}`, method: "DELETE" });

// ── Presence · read receipts · typing · entity rooms (tenant-only enhancements) ──
// These exist only on the org-scoped surface. For platform users they degrade
// to no-ops so the shared chat UI behaves identically without 404s.

/** Mark all messages in a room as read up to `atIso` (defaults to now) — CHAT_010.
 *  Advances the caller's read (+ delivery) watermark and broadcasts a read
 *  receipt so senders see "Read".
 */
export const markRoomRead = async (roomId, atIso) => {
  if (isPlatformUser()) return noop();
  return sendRequest({ url: `/chat-rooms/${roomId}/read`, method: "POST", data: { atIso } });
};

/** Mark a room's messages delivered to the caller (CHAT_009) — advances only the
 *  delivery watermark and broadcasts a "Delivered" receipt. Call when messages
 *  arrive without the room being opened/focused.
 */
export const markRoomDelivered = async (roomId, atIso) => {
  if (isPlatformUser()) return noop();
  return sendRequest({ url: `/chat-rooms/${roomId}/delivered`, method: "POST", data: { atIso } });
};

/** Get per-member receipt watermarks for a room.
 *  Each row: { userId, lastReadAt, lastDeliveredAt, lastSeenAt }.
 */
export const getRoomReceipts = async (roomId) => {
  if (isPlatformUser()) return noop({ receipts: [] });
  return sendRequest({ url: `/chat-rooms/${roomId}/receipts`, method: "GET" });
};

/** Online/offline snapshot for a room's members (CHAT_012/013).
 *  Returns [{ userId, online }]. Seed the UI with this, then keep it current via
 *  the `chat.presence.changed` socket event.
 */
export const getRoomPresence = async (roomId) => {
  if (isPlatformUser()) return noop([]);
  return sendRequest({ url: `/chat-rooms/${roomId}/presence`, method: "GET" });
};

/** Signal typing start (call on first keystroke per compose session). */
export const startTyping = async (roomId) => {
  if (isPlatformUser()) return noop();
  return sendRequest({ url: `/chat-rooms/${roomId}/typing/start`, method: "POST" });
};

/** Signal typing stop (call on send or blur). */
export const stopTyping = async (roomId) => {
  if (isPlatformUser()) return noop();
  return sendRequest({ url: `/chat-rooms/${roomId}/typing/stop`, method: "POST" });
};

/**
 * Create or retrieve a chat room linked to a platform entity (tenant only).
 * body: { entityType, entityId, participantOrgIds?, participantUserIds? }
 */
export const openEntityRoom = async (body) => {
  if (isPlatformUser()) return noop(null);
  return sendRequest({ url: "/chat-rooms/linked", method: "POST", data: body });
};

// ── Attachments (CHAT_020–024) ───────────────────────────────────────────────
// Chat-native presign flow: init (server validates type + size BEFORE issuing a
// URL) → PUT to S3 → confirm → bind via attachmentIds on postMessage. Download
// is a presigned GET. Platform path doesn't expose attachments → safe no-ops.

/** Allowed types + size limit — mirrors the backend (single source for the UI). */
export const CHAT_ATTACHMENT_RULES = {
  extensions: ["pdf", "doc", "docx"],
  mimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxBytes: 10 * 1024 * 1024, // 10 MB
};

/** Validate + reserve an upload. body: { fileName, mimeType, fileSize }.
 *  Returns { attachmentId, uploadUrl, expiresIn }. Throws 400 on bad type/size.
 */
export const initAttachment = async (roomId, body) => {
  if (isPlatformUser()) return noop(null);
  return sendRequest({ url: `/chat-rooms/${roomId}/attachments/init`, method: "POST", data: body });
};

/** Confirm an upload finished. Returns { ok, fileName }. */
export const confirmAttachment = async (attachmentId) => {
  if (isPlatformUser()) return noop(null);
  return sendRequest({ url: `/chat-rooms/attachments/${attachmentId}/confirm`, method: "POST" });
};

/** Get a fresh presigned download URL for a received attachment (CHAT_024).
 *  Returns { downloadUrl, expiresIn, fileName }.
 */
export const getAttachmentDownload = async (attachmentId) => {
  if (isPlatformUser()) return noop(null);
  return sendRequest({ url: `/chat-rooms/attachments/${attachmentId}/download`, method: "GET" });
};
