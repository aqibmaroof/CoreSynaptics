import sendRequest from "../instance/sendRequest";

export const getDisputes = async (limit = 25, offset = 0, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/admin/disputes?limit=${limit}&offset=${offset}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateDispute = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/admin/disputes/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
