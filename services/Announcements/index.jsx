import sendRequest from "../instance/sendRequest";

/** GET /api/announcements — filter: projectId, status, visibility */
export const getAnnouncements = async (params = {}) => {
  try {
    return await sendRequest({ url: "/announcements", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/** GET /api/announcements/:id */
export const getAnnouncementById = async (id) => {
  try {
    return await sendRequest({ url: `/announcements/${id}`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** POST /api/announcements — required: title, body, projectId */
export const createAnnouncement = async (payload) => {
  try {
    return await sendRequest({ url: "/announcements", method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/** PATCH /api/announcements/:id */
export const updateAnnouncement = async (id, payload) => {
  try {
    return await sendRequest({ url: `/announcements/${id}`, method: "PATCH", data: payload });
  } catch (error) {
    throw error;
  }
};

/** DELETE /api/announcements/:id */
export const deleteAnnouncement = async (id) => {
  try {
    return await sendRequest({ url: `/announcements/${id}`, method: "DELETE" });
  } catch (error) {
    throw error;
  }
};

/** PUT /api/announcements/:id/submit — INTERNAL → PENDING (submit to GC for review) */
export const submitAnnouncementForReview = async (id) => {
  try {
    return await sendRequest({ url: `/announcements/${id}/submit`, method: "PUT" });
  } catch (error) {
    throw error;
  }
};

/** PUT /api/announcements/:id/approve — PENDING → PUBLISHED (GC approves & publishes) */
export const approveAnnouncement = async (id) => {
  try {
    return await sendRequest({ url: `/announcements/${id}/approve`, method: "PUT" });
  } catch (error) {
    throw error;
  }
};

/** PUT /api/announcements/:id/reject — PENDING → REJECTED with feedback */
export const rejectAnnouncement = async (id, payload) => {
  try {
    return await sendRequest({ url: `/announcements/${id}/reject`, method: "PUT", data: payload });
  } catch (error) {
    throw error;
  }
};

/** GET /api/announcements/:id/comments */
export const getAnnouncementComments = async (id) => {
  try {
    return await sendRequest({ url: `/announcements/${id}/comments`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** POST /api/announcements/:id/comments */
export const addAnnouncementComment = async (id, payload) => {
  try {
    return await sendRequest({ url: `/announcements/${id}/comments`, method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/** POST /api/announcements/:id/react */
export const reactToAnnouncement = async (id, payload) => {
  try {
    return await sendRequest({ url: `/announcements/${id}/react`, method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

/** POST /api/announcements/:id/save */
export const saveAnnouncement = async (id) => {
  try {
    return await sendRequest({ url: `/announcements/${id}/save`, method: "POST" });
  } catch (error) {
    throw error;
  }
};
