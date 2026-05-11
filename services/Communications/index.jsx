import sendRequest from "../instance/sendRequest";

const base = "/communications";

export const listCommunications = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${base}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getCommunication = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

export const createCommunication = (payload) =>
  sendRequest({ url: base, method: "POST", data: payload });

export const updateCommunication = (id, payload) =>
  sendRequest({ url: `${base}/${id}`, method: "PATCH", data: payload });

export const sendCommunication = (id) =>
  sendRequest({ url: `${base}/${id}/send`, method: "POST" });

export const acknowledgeCommunication = (id) =>
  sendRequest({ url: `${base}/${id}/acknowledge`, method: "POST" });

export const closeCommunication = (id) =>
  sendRequest({ url: `${base}/${id}/close`, method: "POST" });

export const reopenCommunication = (id) =>
  sendRequest({
    url: `${base}/${id}/reopen`,
    method: "POST",
  });

export const deleteCommunication = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "DELETE" });
