import sendRequest from "../instance/sendRequest";

// ── Phase 6 PR-9: SRE dashboard (PLATFORM-ONLY) ──────────────────────────────
// All endpoints are polling-friendly — refresh cadence is per-endpoint:
//   health           every 15s
//   queue-status     every 15s
//   throughput       every 30s
//   checkpoints      every 60s
//   dead-letters     every 60s
//
// PlatformGuard-protected on the server; hide the screen from non-platform
// users (`auth.isPlatformUser`).

const base = "/admin/sre";

export const getSreHealth = () =>
  sendRequest({ url: `${base}/health`, method: "GET" });

export const getSreCheckpoints = () =>
  sendRequest({ url: `${base}/checkpoints`, method: "GET" });

/** params: { sinceMin?, limit? } */
export const getSreThroughput = (params = {}) =>
  sendRequest({ url: `${base}/throughput`, method: "GET", params });

/** params: { sinceMin?, limit? } */
export const getSreDeadLetters = (params = {}) =>
  sendRequest({ url: `${base}/dead-letters`, method: "GET", params });

export const getSreQueueStatus = () =>
  sendRequest({ url: `${base}/queue-status`, method: "GET" });

export const PROJECTION_STATUSES = ["HEALTHY", "LAGGING", "REBUILDING"];

export const PROJECTION_STATUS_STYLE = {
  HEALTHY: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  LAGGING: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  REBUILDING: {
    color: "var(--rf-blue, #3b82f6)",
    bg: "rgba(59,130,246,0.16)",
  },
};
