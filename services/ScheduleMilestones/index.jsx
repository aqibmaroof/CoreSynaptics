import sendRequest from "../instance/sendRequest";

export const listMilestones = async (params = {}) => {
  try {
    return await sendRequest({ url: "/schedule-milestones", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

export const getMilestoneById = async (id) => {
  try {
    return await sendRequest({ url: `/schedule-milestones/${id}`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

export const createMilestone = async (payload) => {
  try {
    return await sendRequest({
      url: "/schedule-milestones",
      method: "POST",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const updateMilestone = async (id, payload) => {
  try {
    return await sendRequest({
      url: `/schedule-milestones/${id}`,
      method: "PATCH",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};

export const deleteMilestone = async (id) => {
  try {
    return await sendRequest({
      url: `/schedule-milestones/${id}`,
      method: "DELETE",
    });
  } catch (error) {
    throw error;
  }
};

export const cloneMilestone = async (id, payload) => {
  try {
    return await sendRequest({
      url: `/schedule-milestones/${id}/clone`,
      method: "POST",
      data: payload,
    });
  } catch (error) {
    throw error;
  }
};
