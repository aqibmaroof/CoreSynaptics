import sendRequest from "../instance/sendRequest";

// Sites
export const CreateSite = async (projectId, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/sites`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetSites = async (projectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/sites`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetSiteById = async (projectId, id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/sites/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateSite = async (projectId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/sites/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteSite = async (projectId, id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/sites/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
