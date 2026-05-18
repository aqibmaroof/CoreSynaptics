"use client";

// ── PR-10: WsEnvelope unwrap helper ──────────────────────────────────────────
// New v5 broadcasts arrive as { event, data, organizationId, cxProjectId,
// emittedAt, seq }. v3/v4 events stay as raw payloads. This helper normalises
// both into one shape so callers can register a single handler per channel.
//
// Usage:
//   import { getSocket } from "./socket";
//   import { onEnvelope, offEnvelope } from "./envelope";
//
//   const socket = getSocket();
//   const off = onEnvelope(socket, "approval.granted", ({ data, emittedAt }) => {
//     // data is the inner payload; emittedAt is the server's ISO timestamp
//   });
//   // later: off();

const isEnvelope = (p) =>
  !!p &&
  typeof p === "object" &&
  "event" in p &&
  "data" in p &&
  "emittedAt" in p;

export const unwrapEnvelope = (eventName, payload) => {
  if (isEnvelope(payload)) {
    return {
      event: payload.event ?? eventName,
      data: payload.data,
      organizationId: payload.organizationId ?? null,
      cxProjectId: payload.cxProjectId ?? null,
      emittedAt: payload.emittedAt,
      seq: payload.seq ?? null,
    };
  }
  return {
    event: eventName,
    data: payload,
    organizationId: null,
    cxProjectId: null,
    emittedAt: new Date().toISOString(),
    seq: null,
  };
};

/**
 * Register a typed envelope listener. Returns an off() cleanup.
 * The handler receives the unwrapped shape — never the raw envelope.
 */
export const onEnvelope = (socket, eventName, handler) => {
  if (!socket || typeof socket.on !== "function") return () => {};
  const wrapped = (payload) => handler(unwrapEnvelope(eventName, payload));
  socket.on(eventName, wrapped);
  return () => {
    try {
      socket.off?.(eventName, wrapped);
    } catch {
      /* socket may be in stub state */
    }
  };
};

export const offEnvelope = (socket, eventName, handler) => {
  try {
    socket.off?.(eventName, handler);
  } catch {
    /* ignore */
  }
};
