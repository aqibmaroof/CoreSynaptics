import sendRequest from "../instance/sendRequest";

export const getProjects = async ({
  limit = 25,
  page = 1,
  parentProjectId,
  parentSiteId,
  status,
  search,
} = {}) => {
  try {
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));

    if (parentProjectId !== undefined) {
      query.set("parentProjectId", parentProjectId === null ? "null" : parentProjectId);
    }

    if (parentSiteId !== undefined) {
      query.set("parentSiteId", parentSiteId === null ? "null" : parentSiteId);
    }

    if (status) {
      query.set("status", status);
    }

    if (search) {
      query.set("search", search);
    }

    const data = await sendRequest({
      url: `/projects?${query.toString()}`,
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


export const AddTeamsToProjects = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}/assign-team`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteTeamsToProjects = async (id, teamId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${id}/unassign-team`,
      method: "Delete",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
