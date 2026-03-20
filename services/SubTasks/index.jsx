import sendRequest from "../instance/sendRequest";

export const createSubTask = async (taskId, payload) => {
  try {
    const data = await sendRequest({
      url: `/tasks/${taskId}/subtasks`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSubTasksByTaskId = async (taskId) => {
  try {
    const data = await sendRequest({
      url: `/tasks/${taskId}/subtasks`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getSubTaskByTaskId = async (taskId, id) => {
  try {
    const data = await sendRequest({
      url: `/tasks/${taskId}/subtasks/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateSubTaskByTaskId = async (taskId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/tasks/${taskId}/subtasks/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteSubTaskByTaskId = async (taskId, id) => {
  try {
    const data = await sendRequest({
      url: `/tasks/${taskId}/subtasks/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
