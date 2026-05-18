"use client";

// ── Phase 6 PR-3: WS reconnect resync ────────────────────────────────────────
// When the socket reconnects after a drop, ask the server for the backlog of
// missed events instead of cold-loading the project.
//
// Wire once at app boot (or wherever your project becomes current):
//
//   const socket = useRealtimeSocket();
//   useEffect(() => {
//     if (!socket || !activeCxProjectId) return;
//     return attachReconnectResync(socket, () => activeCxProjectId);
//   }, [socket, activeCxProjectId]);
//
// Consumers listen for window events `feed:event` (one frame per missed event)
// and `feed:cold-reload-required` (gap too large — fall back to full reload).
//
// The existing feed.event reducer MUST be idempotent on operationalEventId —
// during reconnect, the second copy of any duplicated frame is a no-op.

const stateBySocket = new WeakMap();

function dispatchCold() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("feed:cold-reload-required"));
}

function dispatchEvent(payload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("feed:event", { detail: payload }));
}

/**
 * @param {object} socket — the singleton from lib/realtime/socket.js
 * @param {() => string|null} getCxProjectId — read the current project on demand
 * @returns {() => void} cleanup
 */
export function attachReconnectResync(socket, getCxProjectId) {
  if (!socket || typeof socket.on !== "function") return () => {};

  // Track the last event we've rendered so we know where to resume from.
  const onFeed = (evt) => {
    const cxProjectId = getCxProjectId();
    if (!cxProjectId || !evt?.operationalEventId) return;
    stateBySocket.set(socket, {
      cxProjectId,
      lastEventId: evt.operationalEventId,
      lastEventTime: new Date().toISOString(),
    });
  };

  const onReconnect = async () => {
    const state = stateBySocket.get(socket);
    if (!state || !state.cxProjectId) return;

    const reply = await new Promise((resolve) => {
      const timer = setTimeout(
        () => resolve({ ok: false, error: "timeout" }),
        10_000
      );
      try {
        socket.emit(
          "reconnect:resync",
          {
            cxProjectId: state.cxProjectId,
            sinceEventId: state.lastEventId,
            sinceTime: state.lastEventTime,
          },
          (ack) => {
            clearTimeout(timer);
            resolve(ack);
          }
        );
      } catch (err) {
        clearTimeout(timer);
        resolve({ ok: false, error: err?.message || "emit-failed" });
      }
    });

    if (!reply || !reply.ok) {
      console.warn("[realtime] reconnect:resync failed", reply);
      return;
    }
    if (reply.truncated) {
      console.warn("[realtime] reconnect:resync truncated — cold reload");
      dispatchCold();
      return;
    }
    for (const ev of reply.events || []) {
      dispatchEvent(ev);
    }
  };

  socket.on("feed.event", onFeed);
  socket.on("reconnect", onReconnect);

  return () => {
    try {
      socket.off?.("feed.event", onFeed);
      socket.off?.("reconnect", onReconnect);
    } catch {
      /* stub socket may not implement off */
    }
  };
}

/**
 * Read the last known resume cursor for the socket (testing helper).
 */
export function getResyncState(socket) {
  return stateBySocket.get(socket) || null;
}
