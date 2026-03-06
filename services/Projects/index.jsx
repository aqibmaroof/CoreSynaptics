import sendRequest from "../instance/sendRequest";

export const getProjects = async (limit = 25, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/projects`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteProjects = async (id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateProjects = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const ArchiveProjects = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}/archive`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateProjects = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/projects`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetProjectsById = async (id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const AddUsersToProjects = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}/users`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteUsersToProjects = async (id, userId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}/users/${userId}`,
      method: "Delete",
    });
    return data;
  } catch (error) {
    throw error;
  }
};