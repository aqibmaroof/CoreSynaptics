"use client";
import sendRequest from "../../instance/sendRequest";

export const getProcurementItems = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/procurement", params });

export const getProcurementItemById = (id) =>
  sendRequest({ method: "GET", url: `/finance/procurement/${id}` });

export const createProcurementItem = (data) =>
  sendRequest({ method: "POST", url: "/finance/procurement", data });

export const updateProcurementItem = (id, data) =>
  sendRequest({ method: "PATCH", url: `/finance/procurement/${id}`, data });

export const deleteProcurementItem = (id) =>
  sendRequest({ method: "DELETE", url: `/finance/procurement/${id}` });

// Log a vendor delay against a procurement item
export const logVendorDelay = (id, data) =>
  sendRequest({ method: "POST", url: `/finance/procurement/${id}/delays`, data });

export const getProcurementDelays = (id) =>
  sendRequest({ method: "GET", url: `/finance/procurement/${id}/delays` });

export const resolveProcurementDelay = (id, delayId, data) =>
  sendRequest({ method: "PATCH", url: `/finance/procurement/${id}/delays/${delayId}/resolve`, data });

// Finance-level dashboard stats
export const getFinanceDashboardStats = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/dashboard/stats", params });

export const getMonthlySpend = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/dashboard/monthly-spend", params });

export const getBudgetVsActual = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/dashboard/budget-vs-actual", params });

export const getRecentTransactions = (params = {}) =>
  sendRequest({ method: "GET", url: "/finance/dashboard/transactions", params });
