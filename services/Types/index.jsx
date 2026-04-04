import sendRequest from "../instance/sendRequest";

// Types
export const GetFields = async (params) => {
  try {
    const data = await sendRequest({
      url: `/v1/types/grouped?${params}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
