"use client";
import sendRequest from "../../instance/sendRequest";

export const getProcurementItems = (params = {}) =>
  sendRequest({ method: "GET", url: "/procurement", params });

export const getProcurementItemById = (id) =>
  sendRequest({ method: "GET", url: `/procurement/${id}` });

export const createProcurementItem = (data) =>
  sendRequest({ method: "POST", url: "/procurement", data });

export const updateProcurementItem = (id, data) =>
  sendRequest({ method: "PATCH", url: `/procurement/${id}`, data });

export const orderProcurementItem = (id) =>
  sendRequest({ method: "POST", url: `/procurement/${id}/order`, data: {} });

export const markProcurementDelayed = (id, data) =>
  sendRequest({ method: "POST", url: `/procurement/${id}/mark-delayed`, data });

export const markProcurementDelivered = (id) =>
  sendRequest({ method: "POST", url: `/procurement/${id}/mark-delivered`, data: {} });

// ── PR-B: Long-lead lifecycle ─────────────────────────────────────────────────

/** Stamp one of the 6 long-lead milestones with an actual completion timestamp.
 *  payload: {
 *    milestone: "SPEC_LOCKED"|"PO_ISSUED"|"MFG_CONFIRMED"|"FAT_COMPLETE"|"SHIPPED"|"DELIVERED",
 *    actualAt: ISO8601   // must be >= previous milestone actualAt (server enforces monotonic order)
 *  }
 */
export const stampProcurementMilestone = (id, payload) =>
  sendRequest({ method: "PATCH", url: `/procurement/${id}/milestone`, data: payload });

/** Update the rolling delivery forecast.
 *  payload: { forecastDelivery: ISO8601, delayReason?: string }
 *  Server recalculates longLeadProgressPct after save.
 */
export const updateProcurementForecast = (id, payload) =>
  sendRequest({ method: "PATCH", url: `/procurement/${id}/forecast`, data: payload });

/** Fetch only items flagged as long-lead for a given project.
 *  Equivalent to GET /procurement?longLeadOnly=true&projectId=<projectId>
 *  Extra params (page, limit, status, etc.) are passed through.
 */
export const getLongLeadItems = (projectId, params = {}) =>
  sendRequest({ method: "GET", url: "/procurement", params: { ...params, longLeadOnly: true, projectId } });

// ── Phase 4 PR-7: Delivery confidence ────────────────────────────────────────

/** AI-assisted delivery confidence score for a single long-lead item.
 *  Returns: { procurementId, score, band: "GREEN"|"AMBER"|"RED", rationale: string[], forecastSlipDays }
 */
export const getDeliveryConfidence = (procId) =>
  sendRequest({ method: "GET", url: `/procurement/${procId}/delivery-confidence` });

/** Update the shift status of a crew assignment. */
export const setShiftStatus = (assignmentId, status) =>
  sendRequest({ method: "PATCH", url: `/dispatch/shifts/${assignmentId}/status`, data: { status } });
