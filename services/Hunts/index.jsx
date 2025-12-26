import sendRequest from "../instance/sendRequest";

export const getHunts = async (limit = 25, offset = 0, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/admin/listings?limit=${limit}&offset=${offset}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateHunt = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/admin/listings`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
