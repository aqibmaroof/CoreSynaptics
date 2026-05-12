"use client";

// ── Phase 4 PR-2: WebSocket gateway singleton ─────────────────────────────────
// One instance for the entire app lifetime.
// JWT sourced from localStorage — same location as axiosConfig token attachment.

let _socket = null;
let _pending = [];          // queued emits before socket.io-client loads
let _handlers = [];         // queued on() registrations before socket.io-client loads

export function getSocket() {
  if (typeof window === "undefined") {
    throw new Error("getSocket() must run in the browser");
  }
  if (_socket) return _socket;

  // Build WS URL from the same base the REST client uses.
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const wsBase = apiBase.replace(/\/api\/?$/, "");
  const token = window.localStorage.getItem("token") || "";

  import("socket.io-client").then(({ io }) => {
    _socket = io(`${wsBase}/realtime`, {
      transports: ["websocket", "polling"],
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: 8,
    });

    _socket.on("connect", () =>
      console.debug("[realtime] connected", _socket.id)
    );
    _socket.on("disconnect", (reason) =>
      console.debug("[realtime] disconnected", reason)
    );
    _socket.on("connect_error", (err) =>
      console.warn("[realtime] connect_error", err.message)
    );

    // Drain queued registrations and emits.
    _handlers.forEach(([ev, fn]) => _socket.on(ev, fn));
    _pending.forEach(([ev, data]) => _socket.emit(ev, data));
    _handlers = [];
    _pending = [];
  });

  // Return a stub that buffers until the dynamic import resolves.
  return {
    _stub: true,
    on(ev, fn) { _handlers.push([ev, fn]); },
    off() {},
    emit(ev, data) { _pending.push([ev, data]); },
  };
}

/**
 * Disconnect and reset the singleton.
 * Call on sign-out so the next sign-in gets a fresh authenticated connection.
 */
export function disconnectSocket() {
  if (_socket && typeof _socket.disconnect === "function") {
    _socket.disconnect();
  }
  _socket = null;
  _pending = [];
  _handlers = [];
}
