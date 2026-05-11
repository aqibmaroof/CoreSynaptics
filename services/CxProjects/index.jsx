import sendRequest from "../instance/sendRequest";

// ── Core CRUD ────────────────────────────────────────────────────────────────

export const getCxProjects = async (params = {}) => {
  try {
    const data = await sendRequest({ url: "/cx-projects", method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCxProjectById = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProject = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectStatus = async (id, status) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/status`, method: "PATCH", data: { status } });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProject = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Assets ───────────────────────────────────────────────────────────────────

export const getCxProjectAssets = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectAsset = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectAsset = async (id, assetId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets/${assetId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectAsset = async (id, assetId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets/${assetId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Zones ────────────────────────────────────────────────────────────────────

export const getCxProjectZones = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectZone = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectZone = async (id, zoneId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones/${zoneId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectZone = async (id, zoneId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones/${zoneId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Stakeholders ─────────────────────────────────────────────────────────────

export const getCxProjectStakeholders = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectStakeholder = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectStakeholder = async (id, sid, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders/${sid}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectStakeholder = async (id, sid) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders/${sid}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Compliance ───────────────────────────────────────────────────────────────

export const createCxProjectCompliance = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/compliance`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectCompliance = async (id, cid, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/compliance/${cid}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectCompliance = async (id, cid) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/compliance/${cid}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Mobilization ─────────────────────────────────────────────────────────────

export const getCxProjectMobilization = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectMobilizationItem = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectMobilizationItem = async (id, mid, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization/${mid}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectMobilizationItem = async (id, mid) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization/${mid}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Workflows ────────────────────────────────────────────────────────────────

export const getCxProjectWorkflows = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectWorkflow = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectWorkflow = async (id, workflowId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows/${workflowId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectWorkflow = async (id, workflowId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows/${workflowId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── SOPs ─────────────────────────────────────────────────────────────────────

export const getCxProjectSops = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectSop = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectSop = async (id, sopId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops/${sopId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectSop = async (id, sopId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops/${sopId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Partners ─────────────────────────────────────────────────────────────────

export const getCxProjectPartners = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectPartner = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectPartner = async (id, partnerId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners/${partnerId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectPartner = async (id, partnerId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners/${partnerId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Members ──────────────────────────────────────────────────────────────────

export const getCxProjectMembers = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/members`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const addCxProjectMember = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/members`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const removeCxProjectMember = async (id, userId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/members/${userId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};
