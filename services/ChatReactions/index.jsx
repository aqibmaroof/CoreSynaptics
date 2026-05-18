import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B9: Chat reactions + mentions ───────────────────────────
// Reactions are scoped per (message, user, kind). Toggling is idempotent.
// Mentions: the composer doesn't need to know about them — just type
// `@RFI-123`, `@NCR-7`, `@Issue:<uuid>`. The backend listener resolves and
// persists ChatMessageMention rows; read them from the message's `mentions`
// relation on the existing chat-room GET.

export const reactToMessage = (messageId, kind) =>
  sendRequest({
    url: `/chat-messages/${encodeURIComponent(messageId)}/reactions`,
    method: "POST",
    data: { kind },
    mutationId: true,
  });

export const unreactToMessage = (messageId, kind) =>
  sendRequest({
    url: `/chat-messages/${encodeURIComponent(messageId)}/reactions/${encodeURIComponent(kind)}`,
    method: "DELETE",
    mutationId: true,
  });

export const listMessageReactions = (messageId) =>
  sendRequest({
    url: `/chat-messages/${encodeURIComponent(messageId)}/reactions`,
    method: "GET",
  });

export const CHAT_REACTION_KINDS = [
  "THUMBS_UP",
  "CELEBRATE",
  "ACKNOWLEDGE",
  "CONCERN",
  "RESOLVED",
];

export const CHAT_REACTION_EMOJI = {
  THUMBS_UP: "👍",
  CELEBRATE: "🎉",
  ACKNOWLEDGE: "✅",
  CONCERN: "⚠️",
  RESOLVED: "☑️",
};

// Route a mention chip to the right detail screen.
export const MENTION_HREF = {
  Rfi: (id) => `/RFI/Edit/${id}`,
  RFI: (id) => `/RFI/Edit/${id}`,
  Issue: (id) => `/Issues/Edit/${id}`,
  Asset: (id) => `/Assets/List?focus=${id}`,
  PssrInspection: (id) => `/PSSR?focus=${id}`,
  Submittal: (id) => `/Submittals/Edit/${id}`,
  ChangeRequest: (id) => `/ChangeRequests?focus=${id}`,
};

export const mentionHref = (m) =>
  (MENTION_HREF[m.entityType] || ((id) => `/Search?q=${id}`))(m.entityId);
