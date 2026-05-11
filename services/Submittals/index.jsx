import sendRequest from "../instance/sendRequest";

// ── Core CRUD ────────────────────────────────────────────────────────────────

/** List submittals — all query params optional (projectId, status, type, search, page, limit, etc.) */
export const getSubmittals = async (params = {}) => {
  try {
    return await sendRequest({ url: "/submittals", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/** GET /api/submittals/statistics?projectId=... */
export const getSubmittalStatistics = async (params = {}) => {
  try {
    return await sendRequest({ url: "/submittals/statistics", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/** GET /api/submittals/:id */
export const getSubmittalById = async (id) => {
  try {
    return await sendRequest({ url: `/submittals/${id}`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** POST /api/submittals — creates a DRAFT submittal, number is auto-generated */
export const createSubmittal = async (payload) => {
  try {
    return await sendRequest({ url: "/submittals", method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/** PUT /api/submittals/:id — cannot update APPROVED or VOID submittals */
export const updateSubmittal = async (id, payload) => {
  try {
    return await sendRequest({ url: `/submittals/${id}`, method: "PUT", data: payload });
  } catch (error) {
    throw error;
  }
};

/** DELETE /api/submittals/:id — soft delete; approved submittals cannot be deleted */
export const deleteSubmittal = async (id) => {
  try {
    return await sendRequest({ url: `/submittals/${id}`, method: "DELETE" });
  } catch (error) {
    throw error;
  }
};

// ── Workflow Actions ──────────────────────────────────────────────────────────

/** POST /api/submittals/:id/submit — DRAFT → SUBMITTED, revision++ */
export const submitSubmittal = async (id) => {
  try {
    return await sendRequest({ url: `/submittals/${id}/submit`, method: "POST" });
  } catch (error) {
    throw error;
  }
};

/** POST /api/submittals/:id/start-review — SUBMITTED → UNDER_REVIEW */
export const startReview = async (id) => {
  try {
    return await sendRequest({ url: `/submittals/${id}/start-review`, method: "POST" });
  } catch (error) {
    throw error;
  }
};

/** POST /api/submittals/:id/approve — UNDER_REVIEW → APPROVED; comment optional */
export const approveSubmittal = async (id, payload = {}) => {
  try {
    return await sendRequest({ url: `/submittals/${id}/approve`, method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/** POST /api/submittals/:id/reject — UNDER_REVIEW → REJECTED; reason required */
export const rejectSubmittal = async (id, payload) => {
  try {
    return await sendRequest({ url: `/submittals/${id}/reject`, method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/** POST /api/submittals/:id/revise — UNDER_REVIEW → REVISE_RESUBMIT; comment required */
export const reviseSubmittal = async (id, payload) => {
  try {
    return await sendRequest({ url: `/submittals/${id}/revise`, method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/** POST /api/submittals/:id/resubmit?note=... — REJECTED|REVISE_RESUBMIT → SUBMITTED, revision++ */
export const resubmitSubmittal = async (id, note = "") => {
  try {
    return await sendRequest({
      url: `/submittals/${id}/resubmit`,
      method: "POST",
      params: note ? { note } : {},
    });
  } catch (error) {
    throw error;
  }
};

/** GET /api/submittals/:id/revisions */
export const getSubmittalRevisions = async (id) => {
  try {
    return await sendRequest({ url: `/submittals/${id}/revisions`, method: "GET" });
  } catch (error) {
    throw error;
  }
};
