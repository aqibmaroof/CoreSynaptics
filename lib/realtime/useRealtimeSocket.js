"use client";

// ── PR-10: React hook wrapper around the singleton socket ────────────────────
// The singleton from socket.js survives across component remounts; this hook
// exposes it via useSyncExternalStore.
//
// Contract: getSnapshot must be a pure read returning a stable reference
// between subscribe notifications. We therefore cache the latest socket
// reference at module scope and only mutate it from inside `subscribe` (which
// React calls in commit, before any subsequent render can observe a change).
// Kicking off the dynamic socket.io-client import inside subscribe — rather
// than inside getSnapshot — guarantees the onSocketReady listener is
// registered before the stub→real swap can fire, so the cache update is
// always paired with a React notification.

import { useSyncExternalStore } from "react";
import { getSocket, onSocketReady } from "./socket";

let _cached = null;

function readSocket() {
  return typeof window === "undefined" ? null : getSocket();
}

const subscribe = (cb) => {
  if (_cached === null && typeof window !== "undefined") {
    _cached = readSocket();
  }
  return onSocketReady(() => {
    _cached = readSocket();
    cb();
  });
};

const getSnapshot = () => _cached;
const getServerSnapshot = () => null;

export function useRealtimeSocket() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
