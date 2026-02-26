import sendRequest from "../instance/sendRequest";

export const getPermissions = async (limit = 25, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/permissions`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeletePermissions = async (id) => {
  try {
    const data = await sendRequest({
      url: `/permissions/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdatePermissions = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/permissions/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreatePermissions = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/permissions`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetPermissionsById = async (id) => {
  try {
    const data = await sendRequest({
      url: `/permissions/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
