// ── Phase 6 PR-1: Correlation IDs (client-side) ──────────────────────────────
// The server stamps `X-Request-Id` and `X-Trace-Id` on every HTTP response. If
// the client supplies them inbound, the server honors them and threads them
// through every log line, slow-query record, and event listener.
//
// We:
//   1. Generate and attach a fresh `X-Request-Id` on every outbound request.
//   2. Read both ids back off the response and stash them on
//      `window.__lastTrace` so error boundaries / support tickets can include
//      them.
//
// Keep this file dependency-free — it's hot-pathed by every HTTP call.

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const newRequestId = newId;

/**
 * Wire correlation onto an axios instance. Idempotent.
 */
export function installCorrelation(axiosInstance) {
  if (!axiosInstance || axiosInstance.__correlationInstalled) return;
  axiosInstance.__correlationInstalled = true;

  axiosInstance.interceptors.request.use((config) => {
    config.headers = config.headers || {};
    if (!config.headers["X-Request-Id"]) {
      config.headers["X-Request-Id"] = newId();
    }
    return config;
  });

  const capture = (res) => {
    if (typeof window === "undefined") return;
    const reqId =
      res?.headers?.["x-request-id"] || res?.headers?.["X-Request-Id"];
    const traceId =
      res?.headers?.["x-trace-id"] || res?.headers?.["X-Trace-Id"];
    if (reqId || traceId) {
      window.__lastTrace = {
        requestId: reqId || null,
        traceId: traceId || null,
        at: new Date().toISOString(),
      };
    }
  };

  axiosInstance.interceptors.response.use(
    (response) => {
      capture(response);
      return response;
    },
    (error) => {
      capture(error?.response);
      return Promise.reject(error);
    }
  );
}

/** Read the most recently captured trace ids (for error boundaries / forms). */
export function getLastTrace() {
  if (typeof window === "undefined") return null;
  return window.__lastTrace || null;
}
