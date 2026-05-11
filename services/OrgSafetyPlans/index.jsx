import sendRequest from "../instance/sendRequest";

const BASE = "/org-safety-plan-templates";

export const listOrgSafetyPlans = () =>
  sendRequest({ url: BASE, method: "GET" });

export const getOrgSafetyDefault = () =>
  sendRequest({ url: `${BASE}/default`, method: "GET" });

export const getOrgSafetyPlan = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "GET" });

export const createOrgSafetyPlan = (payload) =>
  sendRequest({ url: BASE, method: "POST", data: payload });

export const updateOrgSafetyPlan = (id, payload) =>
  sendRequest({ url: `${BASE}/${id}`, method: "PATCH", data: payload });

export const deleteOrgSafetyPlan = (id) =>
  sendRequest({ url: `${BASE}/${id}`, method: "DELETE" });
