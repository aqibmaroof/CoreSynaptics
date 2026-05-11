import sendRequest from "../instance/sendRequest";

export const getDeals = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const data = await sendRequest({
      url: `/deals${query ? `?${query}` : ""}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getDealById = async (id) => {
  try {
    const data = await sendRequest({ url: `/deals/${id}`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createDeal = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/deals`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateDeal = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/deals/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteDeal = async (id) => {
  try {
    const data = await sendRequest({ url: `/deals/${id}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};
