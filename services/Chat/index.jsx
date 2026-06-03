import sendRequest from "../instance/sendRequest";

// ── PR-C: Chat Rooms ──────────────────────────────────────────────────────────
// Base: /chat-rooms
// Room visibility is scoped by org membership server-side — clients never
// filter by orgId manually; just pass projectId when creating PROJECT rooms.

/** Create a new chat room.
 *  payload: {
 *    name: string,
 *    roomType: "INTERNAL" | "CROSS" | "HORIZONTAL" | "PROJECT",
 *    cxProjectId?: uuid        // required for CROSS, HORIZONTAL, PROJECT
 *    participantOrgIds?: uuid[] // required for CROSS (exactly 1), HORIZONTAL (≥ 1)
 *  }
 *  INTERNAL  — same org only
 *  CROSS     — two specific orgs (GC ↔ OEM); needs cxProjectId + 1 participantOrgId
 *  HORIZONTAL — multi-party; needs cxProjectId + ≥1 participantOrgIds
 *  PROJECT   — all orgs on a project; auto-provisioned on project creation
 */
export const createChatRoom = async (payload) =>
  sendRequest({ url: "/chat-rooms", method: "POST", data: payload });

/** List rooms visible to the caller.
 *  params: { cxProjectId?, roomType?, includeArchived? }
 */
export const listChatRooms = async (params = {}) =>
  sendRequest({ url: "/chat-rooms", method: "GET", params });

/** Get a single room by ID (includes members list). */
export const getChatRoom = async (id) =>
  sendRequest({ url: `/chat-rooms/${id}`, method: "GET" });

/** Soft-archive a room (owner only). Archived rooms are hidden from list by default. */
export const archiveChatRoom = async (id) =>
  sendRequest({ url: `/chat-rooms/${id}/archive`, method: "POST" });

/** List resolved members visible in a room (with names + role). */
export const listRoomMembers = async (roomId) =>
  sendRequest({ url: `/chat-rooms/${roomId}/members`, method: "GET" });

/** Add explicit member userIds to a room (owner org only). */
export const addRoomMembers = async (roomId, userIds) =>
  sendRequest({ url: `/chat-rooms/${roomId}/members`, method: "POST", data: { userIds } });

/** Remove a single member from a room (owner org only). */
export const removeRoomMember = async (roomId, userId) =>
  sendRequest({ url: `/chat-rooms/${roomId}/members/${userId}`, method: "DELETE" });

/** List users in the caller's organization (for member-picker).
 *  Hits the chat-scoped directory endpoint so non-admin users can still
 *  add teammates to rooms they own.
 */
export const listOrgUsers = async () =>
  sendRequest({ url: "/chat-rooms/_directory/users", method: "GET" });

/** Open (find or create) a DIRECT 1:1 chat with another user.
 *  Returns the ChatRoom DTO. Idempotent — repeated calls return the same room.
 */
export const openDirectRoom = async (peerUserId) =>
  sendRequest({ url: `/chat-rooms/direct/${peerUserId}`, method: "POST" });

/** Projects the caller can use to scope cross-org chat rooms.
 *  Each entry has { id, projectName, memberOrgs:[{id,name,role,isOwner}] }
 *  so the picker doesn't need a second request per project.
 */
export const listChatProjects = async () =>
  sendRequest({ url: "/chat-rooms/_directory/projects", method: "GET" });

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
