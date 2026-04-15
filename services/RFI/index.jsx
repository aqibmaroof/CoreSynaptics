import sendRequest from "../instance/sendRequest";

// ── Core CRUD ────────────────────────────────────────────────────────────────

/**
 * POST /api/rfis
 * Required: rfiNumber, projectId, subject, question
 * Optional: siteId, subProjectId, zoneId, assetId, priority, assignedToCompanyId, dueDate
 */
export const createRFI = async (payload) => {
  try {
    return await sendRequest({ url: "/rfis", method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/rfis
 * Filters: projectId, siteId, subProjectId, zoneId, assetId, status, priority,
 *          assignedToCompanyId, submittedByUserId, search, dueBefore, dueAfter, page, limit
 */
export const getRFIs = async (filters = {}) => {
  try {
    return await sendRequest({ url: "/rfis", method: "GET", params: filters });
  } catch (error) {
    throw error;
  }
};

/** GET /api/rfis/statistics?projectId=... */
export const getRFIStatistics = async (params = {}) => {
  try {
    return await sendRequest({ url: "/rfis/statistics", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/rfis/export
 * params: same as getRFIs filters + format: 'json' | 'csv'
 */
export const exportRFIs = async (params = {}) => {
  try {
    return await sendRequest({ url: "/rfis/export", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/rfis/search
 * params: q (required), projectId, page, limit
 */
export const searchRFIs = async (params = {}) => {
  try {
    return await sendRequest({ url: "/rfis/search", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/** GET /api/rfis/:id */
export const getRFIById = async (id) => {
  try {
    return await sendRequest({ url: `/rfis/${id}`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/**
 * PUT /api/rfis/:id
 * Editable: subject, question, priority, siteId, subProjectId, zoneId, assetId,
 *           assignedToCompanyId, dueDate
 * Cannot update a CLOSED RFI.
 */
export const updateRFI = async (id, payload) => {
  try {
    return await sendRequest({ url: `/rfis/${id}`, method: "PUT", data: payload });
  } catch (error) {
    throw error;
  }
};

/** DELETE /api/rfis/:id — soft delete */
export const deleteRFI = async (id) => {
  try {
    return await sendRequest({ url: `/rfis/${id}`, method: "DELETE" });
  } catch (error) {
    throw error;
  }
};

// ── Workflow Actions ──────────────────────────────────────────────────────────

/**
 * PUT /api/rfis/:id/answer — OPEN → ANSWERED
 * payload: { officialAnswer: string } (required)
 */
export const answerRFI = async (id, officialAnswer) => {
  try {
    return await sendRequest({
      url: `/rfis/${id}/answer`,
      method: "PUT",
      data: { officialAnswer },
    });
  } catch (error) {
    throw error;
  }
};

/** PUT /api/rfis/:id/close — ANSWERED → CLOSED */
export const closeRFI = async (id) => {
  try {
    return await sendRequest({ url: `/rfis/${id}/close`, method: "PUT" });
  } catch (error) {
    throw error;
  }
};

// ── Bulk Operations ───────────────────────────────────────────────────────────

/**
 * POST /api/rfis/bulk-delete
 * payload: { ids: string[] } — min 1, max 100 UUIDs
 */
export const bulkDeleteRFIs = async (ids) => {
  try {
    return await sendRequest({ url: "/rfis/bulk-delete", method: "POST", data: { ids } });
  } catch (error) {
    throw error;
  }
};
