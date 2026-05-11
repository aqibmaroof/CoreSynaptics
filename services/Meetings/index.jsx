import sendRequest from "../instance/sendRequest";

// ── Core CRUD ────────────────────────────────────────────────────────────────

/** POST /api/meetings — required: seriesName, meetingDate, projectId, siteId */
export const createMeeting = async (payload) => {
  try {
    return await sendRequest({ url: "/meetings", method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/**
 * GET /api/meetings — requires exactly one of: projectId | siteId | subProjectId
 * e.g. getMeetings({ projectId: "uuid" })
 */
export const getMeetings = async (filter = {}) => {
  try {
    return await sendRequest({ url: "/meetings", method: "GET", params: filter });
  } catch (error) {
    throw error;
  }
};

/** GET /api/meetings/:id */
export const getMeetingById = async (id) => {
  try {
    return await sendRequest({ url: `/meetings/${id}`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/**
 * PATCH /api/meetings/:id
 * Editable: seriesName, meetingDate, location, agenda, attendees, minutesDocumentId
 * Closed meetings cannot be updated.
 */
export const updateMeeting = async (id, payload) => {
  try {
    return await sendRequest({ url: `/meetings/${id}`, method: "PATCH", data: payload });
  } catch (error) {
    throw error;
  }
};

/** DELETE /api/meetings/:id — soft delete */
export const deleteMeeting = async (id) => {
  try {
    return await sendRequest({ url: `/meetings/${id}`, method: "DELETE" });
  } catch (error) {
    throw error;
  }
};

// ── Workflow Actions ──────────────────────────────────────────────────────────

/** PUT /api/meetings/:id/publish-minutes — DRAFT → MINUTES */
export const publishMinutes = async (id) => {
  try {
    return await sendRequest({ url: `/meetings/${id}/publish-minutes`, method: "PUT" });
  } catch (error) {
    throw error;
  }
};

/** PUT /api/meetings/:id/close — MINUTES → CLOSED; all action items must be RESOLVED/DEFERRED */
export const closeMeeting = async (id) => {
  try {
    return await sendRequest({ url: `/meetings/${id}/close`, method: "PUT" });
  } catch (error) {
    throw error;
  }
};

// ── Action Items ──────────────────────────────────────────────────────────────

/** GET /api/meetings/:id/action-items */
export const getActionItems = async (meetingId) => {
  try {
    return await sendRequest({ url: `/meetings/${meetingId}/action-items`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** POST /api/meetings/:id/action-items — required: title */
export const createActionItem = async (meetingId, payload) => {
  try {
    return await sendRequest({
      url: `/meetings/${meetingId}/action-items`,
      method: "POST",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

/** PATCH /api/meetings/:id/action-items/:itemId — status: OPEN|IN_PROGRESS|RESOLVED|DEFERRED */
export const updateActionItem = async (meetingId, itemId, payload) => {
  try {
    return await sendRequest({
      url: `/meetings/${meetingId}/action-items/${itemId}`,
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};
