import sendRequest from "../instance/sendRequest";

export const getUsers = async (limit = 25, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/Users`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateUserStatus = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/users/${id}/role`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
export const DeleteUsers = async (id) => {
  try {
    const data = await sendRequest({
      url: `/users/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateUsers = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/users/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateUsers = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/users`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetUsersById = async (id) => {
  try {
    const data = await sendRequest({
      url: `/users/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
