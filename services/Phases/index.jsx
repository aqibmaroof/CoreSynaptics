import sendRequest from "../instance/sendRequest";

export const listPhases = async (params = {}) => {
  try {
    return await sendRequest({ url: "/phases", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

export const getPhaseById = async (id) => {
  try {
    return await sendRequest({ url: `/phases/${id}`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

export const createPhase = async (payload) => {
  try {
    return await sendRequest({ url: "/phases", method: "POST", data: payload });
  } catch (error) {
    throw error;
  }
};

export const updatePhase = async (id, payload) => {
  try {
    return await sendRequest({ url: `/phases/${id}`, method: "PATCH", data: payload });
  } catch (error) {
    throw error;
  }
};

export const deletePhase = async (id) => {
  try {
    return await sendRequest({ url: `/phases/${id}`, method: "DELETE" });
  } catch (error) {
    throw error;
  }
};

export const clonePhase = async (id, payload) => {
  try {
    return await sendRequest({
      url: `/phases/${id}/clone`,
      method: "POST",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const assignPhasesToProject = async (payload) => {
  try {
    return await sendRequest({
      url: "/phases/assign-to-project",
      method: "POST",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};
