import sendRequest from "../instance/sendRequest";

// Zones
export const CreateZone = async (siteId, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetZones = async (siteId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetZoneById = async (id,siteId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateZone = async (siteId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteZone = async (siteId, id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Tasks
export const CreateZoneTask = async (siteId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones/${id}/tasks`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetZoneTasks = async (siteId, id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones/${id}/tasks`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Subtasks
export const CreateZoneSubtask = async (siteId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones/${id}/subtasks`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetZoneSubtasks = async (siteId, id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${siteId}/zones/${id}/subtasks`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
