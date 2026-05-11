import sendRequest from "../instance/sendRequest";

const BASE = "/org-toolbox-talks";

export const TBT_CATEGORIES = [
  "ORIENTATION",
  "ELECTRICAL",
  "FALLS",
  "RIGGING",
  "FIRE",
  "CONFINED",
  "ENV",
  "GENERAL",
];

export const listOrgToolboxTalks = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${BASE}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getOrgToolboxTalk = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "GET" });

export const createOrgToolboxTalk = (payload) =>
  sendRequest({ url: BASE, method: "POST", data: payload });

export const updateOrgToolboxTalk = (id, payload) =>
  sendRequest({ url: `${BASE}/${id}`, method: "PATCH", data: payload });

export const deleteOrgToolboxTalk = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "DELETE" });
