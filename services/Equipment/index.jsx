import sendRequest from "../instance/sendRequest";

// Equipment
export const CreateEquipment = async (zoneId, payload) => {
  try {
    const data = await sendRequest({
      url: `/zones/${zoneId}/equipment`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetEquipments = async (zoneId) => {
  try {
    const data = await sendRequest({
      url: `/zones/${zoneId}/equipment`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetEquipmentById = async (zoneId, id) => {
  try {
    const data = await sendRequest({
      url: `/zones/${zoneId}/equipment/${id}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateEquipment = async (zoneId, id, payload) => {
  try {
    const data = await sendRequest({
      url: `/zones/${zoneId}/equipment/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteEquipment = async (zoneId, id) => {
  try {
    const data = await sendRequest({
      url: `/zones/${zoneId}/equipment/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
