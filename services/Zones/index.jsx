import sendRequest from "../instance/sendRequest";

// Zones
export const CreateZone = async (subProjectId, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${subProjectId}/zones`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetZones = async (subProjectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${subProjectId}/zones`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetZoneById = async (id, subProjectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${subProjectId}/zones/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateZone = async (subProjectId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${subProjectId}/zones/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteZone = async (subProjectId, id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${subProjectId}/zones/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
