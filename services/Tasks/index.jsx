import sendRequest from "../instance/sendRequest";

export const getAllTasks = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const data = await sendRequest({
      url: `/tasks${query ? `?${query}` : ""}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateTask = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/tasks`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getTaskById = async (id) => {
  try {
    const data = await sendRequest({ url: `/tasks/${id}`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateTask = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/tasks/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteTask = async (id) => {
  try {
    const data = await sendRequest({ url: `/tasks/${id}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};
