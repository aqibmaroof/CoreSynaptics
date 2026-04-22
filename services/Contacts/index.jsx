import sendRequest from "../instance/sendRequest";

export const getContacts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({
    url: `/contacts${query ? `?${query}` : ""}`,
    method: "GET",
  });
};

export const getContactById = async (id) =>
  sendRequest({ url: `/contacts/${id}`, method: "GET" });

export const getContactsByCompany = async (companyId) =>
  sendRequest({ url: `/contacts/by-company/${companyId}`, method: "GET" });

export const createContact = async (payload) =>
  sendRequest({ url: `/contacts`, method: "POST", data: payload });

export const updateContact = async (id, payload) =>
  sendRequest({ url: `/contacts/${id}`, method: "PATCH", data: payload });

export const deleteContact = async (id) =>
  sendRequest({ url: `/contacts/${id}`, method: "DELETE" });
