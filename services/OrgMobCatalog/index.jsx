import sendRequest from "../instance/sendRequest";

const BASE = "/org-mobilization-catalog";

export const MOB_STEP_KEYS = [
  "mob_site",
  "mob_ppe",
  "mob_supplies",
  "mob_trailer",
  "mob_house",
  "mob_tools",
];

export const listOrgMobCatalog = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${BASE}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getOrgMobCatalogItem = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "GET" });

export const createOrgMobCatalogItem = (payload) =>
  sendRequest({ url: BASE, method: "POST", data: payload });

export const updateOrgMobCatalogItem = (id, payload) =>
  sendRequest({ url: `${BASE}/${id}`, method: "PATCH", data: payload });

export const deleteOrgMobCatalogItem = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "DELETE" });
