import sendRequest from "../instance/sendRequest";

const base = (projectId) => `/cx-projects/${projectId}/change-requests`;

export const listChangeRequests = (projectId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${base(projectId)}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getChangeRequestSummary = (projectId) =>
  sendRequest({ url: `${base(projectId)}/summary`, method: "GET" });

export const getChangeRequest = (projectId, id) =>
  sendRequest({ url: `${base(projectId)}/${id}`, method: "GET" });

export const createChangeRequest = (projectId, payload) =>
  sendRequest({ url: base(projectId), method: "POST", data: payload });

export const updateChangeRequest = (projectId, id, payload) =>
  sendRequest({ url: `${base(projectId)}/${id}`, method: "PATCH", data: payload });

export const reviewChangeRequest = (projectId, id, payload) =>
  sendRequest({ url: `${base(projectId)}/${id}/review`, method: "PATCH", data: payload });

export const withdrawChangeRequest = (projectId, id) =>
  sendRequest({ url: `${base(projectId)}/${id}/withdraw`, method: "PATCH" });

export const deleteChangeRequest = (projectId, id) =>
  sendRequest({ url: `${base(projectId)}/${id}`, method: "DELETE" });
