"use client";
import sendRequest from "../../instance/sendRequest";

/**
 * Procurement Register V2 API client.
 *
 * Base URL (NEXT_PUBLIC_API_URL) already ends in `/api`, so paths start at
 * `/v2/procurement`. Matches the backend's isolated Procurement Register V2
 * module (mockup-exact): description, ownership (OFCI/CFCI), status
 * (NOT_ORDERED|ORDERED|IN_TRANSIT|DELIVERED), free-text vendor, etc.
 *
 * Item shape (response):
 *   { id, organizationId, cxProjectId?, projectAssetId?, poSubmittalNo?,
 *     description, ownership, manufacturer?, model?, status, location?,
 *     vendor?, poc?, createdBy, updatedBy?, createdAt, updatedAt }
 */

const BASE = "/v2/procurement";

/** GET /v2/procurement?cxProjectId=&ownership=&status= — list (returns array). */
export const getProcurementV2Items = async (params = {}) =>
  sendRequest({ url: BASE, method: "GET", params });

/** GET /v2/procurement/summary?cxProjectId= — { ofci, cfci, all, byStatus }. */
export const getProcurementV2Summary = async (params = {}) =>
  sendRequest({ url: `${BASE}/summary`, method: "GET", params });

/** GET /v2/procurement/:id */
export const getProcurementV2ItemById = async (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "GET" });

/** POST /v2/procurement — create a register item. */
export const createProcurementV2Item = async (data) =>
  sendRequest({ url: BASE, method: "POST", data });

/** PATCH /v2/procurement/:id — update fields (incl. status dropdown). */
export const updateProcurementV2Item = async (id, data) =>
  sendRequest({ url: `${BASE}/${id}`, method: "PATCH", data });

/** DELETE /v2/procurement/:id — soft delete. */
export const deleteProcurementV2Item = async (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "DELETE" });
