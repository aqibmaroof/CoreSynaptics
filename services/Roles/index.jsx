import sendRequest from "../instance/sendRequest";

export const getRoles = async (limit = 25, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/roles`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteRoles = async (id) => {
  try {
    const data = await sendRequest({
      url: `/roles/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateRoles = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/roles/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateRoles = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/roles`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetRolesById = async (id) => {
  try {
    const data = await sendRequest({
      url: `/roles/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
