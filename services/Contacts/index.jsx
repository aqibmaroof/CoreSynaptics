import sendRequest from "../instance/sendRequest";

export const getContacts = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const data = await sendRequest({
      url: `/contacts${query ? `?${query}` : ""}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getContactById = async (id) => {
  try {
    const data = await sendRequest({ url: `/contacts/${id}`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createContact = async (payload) => {
  try {
    const data = await sendRequest({
      url: `/contacts`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateContact = async (id, payload) => {
  try {
    const data = await sendRequest({
      url: `/contacts/${id}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    const data = await sendRequest({ url: `/contacts/${id}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};
