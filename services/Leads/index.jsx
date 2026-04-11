import sendRequest from "../instance/sendRequest";

export const getLeads = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const data = await sendRequest({
      url: `/leads${query ? `?${query}` : ""}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getLeadById = async (id) => {
  try {
    const data = await sendRequest({ url: `/leads/${id}`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createLead = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/leads`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateLead = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/leads/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteLead = async (id) => {
  try {
    const data = await sendRequest({ url: `/leads/${id}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};
