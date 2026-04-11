"use client";
import sendRequest from "../instance/sendRequest";

// ─── Payroll Profiles ──────────────────────────────────────────────────────

export const getPayrollProfiles = (params = {}) =>
  sendRequest({ method: "GET", url: "/payroll/profiles", params });

export const getPayrollProfileById = (id) =>
  sendRequest({ method: "GET", url: `/payroll/profiles/${id}` });

export const createPayrollProfile = (data) =>
  sendRequest({ method: "POST", url: "/payroll/profiles", data });

export const updatePayrollProfile = (id, data) =>
  sendRequest({ method: "PATCH", url: `/payroll/profiles/${id}`, data });

export const deletePayrollProfile = (id) =>
  sendRequest({ method: "DELETE", url: `/payroll/profiles/${id}` });

// ─── Timesheets / Time Entries ─────────────────────────────────────────────

export const getTimesheets = (params = {}) =>
  sendRequest({ method: "GET", url: "/payroll/timesheets", params });

export const getTimesheetById = (id) =>
  sendRequest({ method: "GET", url: `/payroll/timesheets/${id}` });

export const clockIn = (data) =>
  sendRequest({ method: "POST", url: "/payroll/timesheets/clock-in", data });

export const clockOut = (timesheetId, data) =>
  sendRequest({ method: "PATCH", url: `/payroll/timesheets/${timesheetId}/clock-out`, data });

export const updateTimeEntry = (id, data) =>
  sendRequest({ method: "PATCH", url: `/payroll/timesheets/${id}`, data });

export const deleteTimeEntry = (id) =>
  sendRequest({ method: "DELETE", url: `/payroll/timesheets/${id}` });

export const getActiveClockIn = (userId) =>
  sendRequest({ method: "GET", url: `/payroll/timesheets/active/${userId}` });

// ─── Payroll Runs / Processing ─────────────────────────────────────────────

export const getPayrollRuns = (params = {}) =>
  sendRequest({ method: "GET", url: "/payroll/runs", params });

export const getPayrollRunById = (id) =>
  sendRequest({ method: "GET", url: `/payroll/runs/${id}` });

export const generatePayrollRun = (data) =>
  sendRequest({ method: "POST", url: "/payroll/runs/generate", data });

export const approvePayrollRun = (id) =>
  sendRequest({ method: "PATCH", url: `/payroll/runs/${id}/approve` });

export const markPayrollPaid = (id, data) =>
  sendRequest({ method: "PATCH", url: `/payroll/runs/${id}/mark-paid`, data });

export const voidPayrollRun = (id, data) =>
  sendRequest({ method: "PATCH", url: `/payroll/runs/${id}/void`, data });

// ─── Payroll Line Items (per-employee records within a run) ───────────────

export const getPayrollLineItems = (runId) =>
  sendRequest({ method: "GET", url: `/payroll/runs/${runId}/items` });

export const updatePayrollLineItem = (runId, itemId, data) =>
  sendRequest({ method: "PATCH", url: `/payroll/runs/${runId}/items/${itemId}`, data });

// ─── Deductions & Allowances ──────────────────────────────────────────────

export const getDeductions = (profileId) =>
  sendRequest({ method: "GET", url: `/payroll/profiles/${profileId}/deductions` });

export const addDeduction = (profileId, data) =>
  sendRequest({ method: "POST", url: `/payroll/profiles/${profileId}/deductions`, data });

export const removeDeduction = (profileId, deductionId) =>
  sendRequest({ method: "DELETE", url: `/payroll/profiles/${profileId}/deductions/${deductionId}` });

// ─── Dashboard Stats ───────────────────────────────────────────────────────

export const getPayrollDashboardStats = (params = {}) =>
  sendRequest({ method: "GET", url: "/payroll/dashboard/stats", params });
