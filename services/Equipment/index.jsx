import sendRequest from "../instance/sendRequest";

// Equipment
export const CreateEquipment = async (projectId, payload) => {
  try {
    const data = await sendRequest({
      url: `/zones/${projectId}/equipment`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetEquipments = async (projectId) => {
  try {
    const data = await sendRequest({
      url: `/zones/${projectId}/equipment`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetEquipmentById = async (projectId, id) => {
  try {
    const data = await sendRequest({
      url: `/zones/${projectId}/equipment/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateEquipment = async (projectId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/zones/${projectId}/equipment/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteEquipment = async (projectId, id) => {
  try {
    const data = await sendRequest({
      url: `/zones/${projectId}/equipment/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Tasks
export const CreateEquipmentTask = async (projectId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/equipment/${id}/tasks`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetEquipmentTasks = async (projectId, id) => {
  try {
    const data = await sendRequest({
      url: `/equipment/${id}/tasks`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Subtasks
export const CreateEquipmentSubtask = async (projectId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/equipment/${projectId}/tasks/${id}`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetEquipmentSubtasks = async (projectId, id) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/equipment/${id}/subtasks`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};