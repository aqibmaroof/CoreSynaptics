import sendRequest from "../instance/sendRequest";

const BASE = "/org-sops";

export const listOrgSOPs = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${BASE}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getOrgSOP = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "GET" });

export const createOrgSOP = (payload) =>
  sendRequest({ url: BASE, method: "POST", data: payload });

export const updateOrgSOP = (id, payload) =>
  sendRequest({ url: `${BASE}/${id}`, method: "PATCH", data: payload });

export const deleteOrgSOP = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "DELETE" });
