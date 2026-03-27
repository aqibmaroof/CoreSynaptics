import sendRequest from "../instance/sendRequest";

export const getTeams = async () => {
  try {
    const data = await sendRequest({
      url: `/teams`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetTeamById = async (id) => {
  try {
    const data = await sendRequest({
      url: `/teams/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateTeam = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/teams`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateTeam = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/teams/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteTeam = async (id) => {
  try {
    const data = await sendRequest({
      url: `/teams/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const RestoreTeam = async (id) => {
  try {
    const data = await sendRequest({
      url: `/teams/${id}/restore`,
      method: "PATCH",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetTeamMembers = async (id) => {
  try {
    const data = await sendRequest({
      url: `/teams/${id}/members`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const AddTeamMember = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/teams/${id}/members`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteTeamMember = async (teamId, userId) => {
  try {
    const data = await sendRequest({
      url: `/teams/${teamId}/members/${userId}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};