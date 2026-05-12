import sendRequest from "../instance/sendRequest";

// ── PR-C: Chat Rooms ──────────────────────────────────────────────────────────
// Base: /chat-rooms
// Room visibility is scoped by org membership server-side — clients never
// filter by orgId manually; just pass projectId when creating PROJECT rooms.

/** Create a new chat room.
 *  payload: {
 *    name: string,
 *    roomType: "INTERNAL" | "CROSS" | "HORIZONTAL" | "PROJECT",
 *    projectId?: uuid   // required when roomType === "PROJECT"
 *  }
 *  INTERNAL  — same org only
 *  CROSS     — two specific orgs (GC ↔ OEM)
 *  HORIZONTAL — same discipline across orgs
 *  PROJECT   — all orgs on a project
 */
export const createChatRoom = async (payload) =>
  sendRequest({ url: "/chat-rooms", method: "POST", data: payload });

/** List rooms visible to the caller.
 *  params: { projectId?, orgId?, roomType?, page?, limit? }
 */
export const listChatRooms = async (params = {}) =>
  sendRequest({ url: "/chat-rooms", method: "GET", params });

/** Get a single room by ID (includes members list). */
export const getChatRoom = async (id) =>
  sendRequest({ url: `/chat-rooms/${id}`, method: "GET" });

/** Soft-archive a room (owner only). Archived rooms are hidden from list by default. */
export const archiveChatRoom = async (id) =>
  sendRequest({ url: `/chat-rooms/${id}/archive`, method: "PATCH" });

/** Paginated message history.
 *  params: { before?: ISO8601-cursor, limit?: number (default 50) }
 *  Returns messages newest-first; use `before` for infinite-scroll upward.
 */
export const listMessages = async (roomId, params = {}) =>
  sendRequest({ url: `/chat-rooms/${roomId}/messages`, method: "GET", params });

/** Post a new message.
 *  payload: { body: string, attachmentUrl?: string }
 */
export const postMessage = async (roomId, payload) =>
  sendRequest({ url: `/chat-rooms/${roomId}/messages`, method: "POST", data: payload });

/** Delete a message (own messages only, or room owner).
 *  Hard-delete — not recoverable.
 */
export const deleteChatMessage = async (roomId, msgId) =>
  sendRequest({ url: `/chat-rooms/${roomId}/messages/${msgId}`, method: "DELETE" });

// ── Legacy channel aliases (kept for backward compat with existing containers) ─

/** @deprecated Use listChatRooms instead */
export const getChannels = (params = {}) => listChatRooms(params);

/** @deprecated Use getChatRoom instead */
export const getChannelById = (id) => getChatRoom(id);

/** @deprecated Use createChatRoom instead */
export const createChannel = (payload) => createChatRoom(payload);

/** @deprecated Use listMessages instead */
export const getMessages = (channelId, params = {}) => listMessages(channelId, params);

/** @deprecated Use postMessage instead */
export const sendMessage = (channelId, payload) => postMessage(channelId, payload);

/** @deprecated Use deleteChatMessage instead */
export const deleteMessage = (roomId, msgId) => deleteChatMessage(roomId, msgId);

// ── Phase 4 PR-5: Presence · read receipts · typing · entity rooms ────────────

/** Mark all messages in a room as read up to `atIso` (defaults to now). */
export const markRoomRead = async (roomId, atIso) =>
  sendRequest({ url: `/chat-rooms/${roomId}/read`, method: "POST", data: { atIso } });

/** Get per-member read receipt timestamps for a room. */
export const getRoomReceipts = async (roomId) =>
  sendRequest({ url: `/chat-rooms/${roomId}/receipts`, method: "GET" });

/** Signal typing start (call on first keystroke per compose session). */
export const startTyping = async (roomId) =>
  sendRequest({ url: `/chat-rooms/${roomId}/typing/start`, method: "POST" });

/** Signal typing stop (call on send or blur). */
export const stopTyping = async (roomId) =>
  sendRequest({ url: `/chat-rooms/${roomId}/typing/stop`, method: "POST" });

/**
 * Create or retrieve a chat room linked to a platform entity.
 * body: {
 *   entityType: "Issue" | "CommissioningTest" | "Communication" | "Artifact" | "Procurement",
 *   entityId: string,
 *   participantOrgIds?: string[],
 *   participantUserIds?: string[]
 * }
 * Returns: { roomId, created, name }
 */
export const openEntityRoom = async (body) =>
  sendRequest({ url: "/chat-rooms/linked", method: "POST", data: body });
