import sendRequest from "../instance/sendRequest";

/**
 * Project Safety API client.
 *
 * Base URL (NEXT_PUBLIC_API_URL) already ends in `/api`, so paths here start at
 * `/cx-projects/...`. Safety is an UNVERSIONED resource (no `/v2` prefix) — the
 * backend reserves `/v2` for the project domain that preserved a prior
 * implementation; Safety is brand-new and has no legacy version.
 *
 * Backend: src/modules/cx-projects-v2/safety.controller.ts
 *   GET    /cx-projects/:id/safety-items?kind=&projectAssetId=
 *   GET    /cx-projects/:id/safety-items/summary
 *   GET    /cx-projects/:id/safety-items/:itemId
 *   POST   /cx-projects/:id/safety-items
 *   PATCH  /cx-projects/:id/safety-items/:itemId
 *   DELETE /cx-projects/:id/safety-items/:itemId
 *   POST   /cx-projects/:id/safety-items/:itemId/attachments/presign
 *   POST   /cx-projects/:id/safety-items/:itemId/attachments
 *
 * Auth, refresh, x-request-id are handled by sendRequest/axiosConfig.
 */

const PROJECTS = "/cx-projects";

/** GET list (+ expiringCount). Optional { kind, projectAssetId } filters. */
export const listSafetyItems = async (id, params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
    ),
  ).toString();
  return sendRequest({
    url: `${PROJECTS}/${id}/safety-items${query ? `?${query}` : ""}`,
    method: "GET",
  });
};

/** GET per-tab counts + "N expiring within 30 days" badge. */
export const getSafetySummary = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/safety-items/summary`, method: "GET" });

/** GET one safety item. */
export const getSafetyItem = async (id, itemId) =>
  sendRequest({ url: `${PROJECTS}/${id}/safety-items/${itemId}`, method: "GET" });

/** POST create a safety item. */
export const createSafetyItem = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/safety-items`, method: "POST", data: payload });

/** PATCH update a safety item (or mark completed). */
export const updateSafetyItem = async (id, itemId, payload) =>
  sendRequest({
    url: `${PROJECTS}/${id}/safety-items/${itemId}`,
    method: "PATCH",
    data: payload,
  });

/** DELETE (soft-delete / void) a safety item. */
export const removeSafetyItem = async (id, itemId) =>
  sendRequest({ url: `${PROJECTS}/${id}/safety-items/${itemId}`, method: "DELETE" });

/** POST presign an S3 attachment upload. Returns { uploadUrl, s3Key, expiresIn }. */
export const presignSafetyAttachment = async (id, itemId, payload) =>
  sendRequest({
    url: `${PROJECTS}/${id}/safety-items/${itemId}/attachments/presign`,
    method: "POST",
    data: payload,
  });

/** POST record an uploaded attachment's metadata on the item. */
export const recordSafetyAttachment = async (id, itemId, payload) =>
  sendRequest({
    url: `${PROJECTS}/${id}/safety-items/${itemId}/attachments`,
    method: "POST",
    data: payload,
  });
