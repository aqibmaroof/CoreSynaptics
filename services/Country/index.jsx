import sendRequest from "../instance/sendRequest";

export const getCountries = async (limit = 25, currentPage) => {
  try {
    const data = await sendRequest({
      url: `/country-codes?limit=${limit}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const UpdateCountry = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/country-codes/${id}`,
      method: "PUT",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const DeleteCountry = async (id) => {
  try {
    const data = await sendRequest({
      url: `/country-codes/${id}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const CreateCountry = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/country-codes`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
