import sendRequest from "../instance/sendRequest";

// ── Checklist CRUD ──────────────────────────────────────────────────────────

export const createChecklist = async (payload) => {
  try {
    return await sendRequest({ url: "/checklists", method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/**
 * Requires exactly one hierarchy filter:
 * { projectId, siteId, subProjectId, zoneId, or assetId }
 */
export const getChecklists = async (filter = {}) => {
  try {
    return await sendRequest({ url: "/checklists", method: "GET", params: filter });
  } catch (error) {
    throw error;
  }
};

export const getChecklistById = async (id) => {
  try {
    return await sendRequest({ url: `/checklists/${id}`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/**
 * Editable fields: title, description, phase, checklistType, zoneId, assetId
 * Locked/signed checklists cannot be updated.
 */
export const updateChecklist = async (id, payload) => {
  try {
    return await sendRequest({ url: `/checklists/${id}`, method: "PATCH", data: payload });
  } catch (error) {
    throw error;
  }
};

export const deleteChecklist = async (id) => {
  try {
    return await sendRequest({ url: `/checklists/${id}`, method: "DELETE" });
  } catch (error) {
    throw error;
  }
};

/**
 * Checklist must be in COMPLETED status before signing.
 * After signing, status becomes VERIFIED and checklist is locked.
 */
export const signChecklist = async (id) => {
  try {
    return await sendRequest({ url: `/checklists/${id}/sign`, method: "PUT" });
  } catch (error) {
    throw error;
  }
};

// ── Checklist Items ─────────────────────────────────────────────────────────

export const getChecklistItems = async (checklistId) => {
  try {
    return await sendRequest({ url: `/checklists/${checklistId}/items`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/**
 * Required: title, sequence (int >= 1)
 * Optional: description, isRequired (default true), notes
 */
export const addChecklistItem = async (checklistId, payload) => {
  try {
    return await sendRequest({
      url: `/checklists/${checklistId}/items`,
      method: "POST",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const updateChecklistItem = async (checklistId, itemId, payload) => {
  try {
    return await sendRequest({
      url: `/checklists/${checklistId}/items/${itemId}`,
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const completeChecklistItem = async (checklistId, itemId) => {
  try {
    return await sendRequest({
      url: `/checklists/${checklistId}/items/${itemId}/complete`,
      method: "PUT",
    });
  } catch (error) {
    throw error;
  }
};

export const deleteChecklistItem = async (checklistId, itemId) => {
  try {
    return await sendRequest({
      url: `/checklists/${checklistId}/items/${itemId}`,
      method: "DELETE",
    });
  } catch (error) {
    throw error;
  }
};
