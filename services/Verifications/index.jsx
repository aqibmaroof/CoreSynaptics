import sendRequest from "../instance/sendRequest";

export const getVerifications = async (limit = 25, offset = 0, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/admin/verifications?limit=${limit}&offset=${offset}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateVerification = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/admin/verifications/${id}/review`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
