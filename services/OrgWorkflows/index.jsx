import sendRequest from "../instance/sendRequest";

const BASE = "/org-workflows";

export const listOrgWorkflows = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${BASE}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getOrgWorkflow = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "GET" });

export const createOrgWorkflow = (payload) =>
  sendRequest({ url: BASE, method: "POST", data: payload });

export const updateOrgWorkflow = (id, payload) =>
  sendRequest({ url: `${BASE}/${id}`, method: "PATCH", data: payload });

export const deleteOrgWorkflow = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "DELETE" });
