import sendRequest from "../instance/sendRequest";

// ─── Tenants ──────────────────────────────────────────────────────────────────
export const getTenants = () =>
  sendRequest({ url: "/companies", method: "GET" });

export const getTenantById = (id) =>
  sendRequest({ url: `/companies/${id}`, method: "GET" });

export const updateTenant = (id, payload) =>
  sendRequest({ url: `/companies/${id}`, method: "PUT", data: payload });

export const deleteTenant = (id) =>
  sendRequest({ url: `/companies/${id}`, method: "DELETE" });

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const getSubscriptions = () =>
  sendRequest({ url: "/subscriptions", method: "GET" });

export const updateSubscription = (id, payload) =>
  sendRequest({ url: `/subscriptions/${id}`, method: "PATCH", data: payload });

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const getAuditLogs = (params = {}) =>
  sendRequest({ url: "/audit-logs", method: "GET", params });
