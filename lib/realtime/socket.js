"use client";

// ── Phase 4 PR-2: WebSocket gateway singleton ─────────────────────────────────
// One instance for the entire app lifetime.
// JWT sourced from localStorage — same location as axiosConfig token attachment.

let _socket = null;
let _stub = null;           // cached stub returned while the dynamic import is in flight
let _loading = false;       // true once the io() import has been kicked off
const _pending = [];        // queued emits before socket.io-client loads
const _handlers = [];       // queued on() registrations before socket.io-client loads
const _listeners = new Set(); // notified once when the stub is swapped for the real socket

/** Subscribe to a single transition: stub → real socket. Fires at most once. */
export function onSocketReady(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function getSocket() {
  if (typeof window === "undefined") {
    throw new Error("getSocket() must run in the browser");
  }
  if (_socket) return _socket;
  if (_stub) return _stub;

  // Build WS URL from the same base the REST client uses.
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const wsBase = apiBase.replace(/\/api\/?$/, "");
  // Token is stored under "accessToken" by tokenService (same key the REST
  // client reads). The previous "token" key was always empty, so the socket
  // handshake authenticated with no token and the server dropped the
  // connection — silently breaking all realtime chat features.
  const token =
    window.localStorage.getItem("accessToken") ||
    window.localStorage.getItem("token") ||
    "";

  if (!_loading) {
    _loading = true;
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
      while (_handlers.length) {
        const [ev, fn] = _handlers.shift();
        _socket.on(ev, fn);
      }
      while (_pending.length) {
        const [ev, data] = _pending.shift();
        _socket.emit(ev, data);
      }

      // Drop the stub so future getSocket() calls return the real instance, and
      // notify any React hook subscribers so their snapshot is re-read.
      _stub = null;
      _listeners.forEach((cb) => {
        try {
          cb();
        } catch {
          /* swallow */
        }
      });
    });
  }

  // Return a stub that buffers until the dynamic import resolves. Cached at
  // the module level so repeated callers (and useSyncExternalStore's
  // getSnapshot) see the same reference until the real socket is ready.
  _stub = {
    _stub: true,
    on(ev, fn) {
      if (_socket) return _socket.on(ev, fn);
      _handlers.push([ev, fn]);
    },
    off(ev, fn) {
      if (_socket) return _socket.off(ev, fn);
    },
    emit(ev, data) {
      if (_socket) return _socket.emit(ev, data);
      _pending.push([ev, data]);
    },
  };
  return _stub;
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
  _stub = null;
  _loading = false;
  _pending.length = 0;
  _handlers.length = 0;
  _listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      /* swallow */
    }
  });
}
