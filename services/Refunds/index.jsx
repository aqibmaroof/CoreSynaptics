import sendRequest from "../instance/sendRequest";

export const getRefunds = async (limit = 25, offset = 0, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/admin/refunds?limit=${limit}&offset=${offset}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateRefund = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/admin/refunds/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
