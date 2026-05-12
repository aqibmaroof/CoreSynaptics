import sendRequest from "../instance/sendRequest";

/** GET /api/projects/:id/overview */
export const getProjectOverview = async (projectId) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}/overview`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** GET /api/projects/:id/phases */
export const getProjectPhases = async (projectId) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}/phases`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** GET /api/projects/:id/milestones */
export const getProjectMilestones = async (projectId) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}/milestones`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** GET /api/projects/:id/team */
export const getProjectTeam = async (projectId) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}/team`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** GET /api/projects/:id/issues — query: status, priority */
export const getProjectIssues = async (projectId, params = {}) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}/issues`, method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/** GET /api/projects/:id/assets — query: energized, phase */
export const getProjectAssets = async (projectId, params = {}) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}/assets`, method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/** GET /api/projects/:id/activity — query: limit, before */
export const getProjectActivity = async (projectId, params = {}) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}/activity`, method: "GET", params });
  } catch (error) {
    throw error;
  }
};

/** PATCH /api/projects/:id — update project metadata */
export const updateProject = async (projectId, payload) => {
  try {
    return await sendRequest({ url: `/projects/${projectId}`, method: "PATCH", data: payload });
  } catch (error) {
    throw error;
  }
};
