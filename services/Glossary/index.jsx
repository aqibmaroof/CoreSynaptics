import sendRequest from "../instance/sendRequest";

const base = "/glossary";

export const getGlossaryTerms = (params) =>
  sendRequest({ url: base, method: "GET", params });

export const getGlossaryTermById = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

export const createGlossaryTerm = (data) =>
  sendRequest({ url: base, method: "POST", data, mutationId: true });

export const updateGlossaryTerm = (id, data) =>
  sendRequest({
    url: `${base}/${id}`,
    method: "PATCH",
    data,
    mutationId: true,
  });

export const deleteGlossaryTerm = (id) =>
  sendRequest({
    url: `${base}/${id}`,
    method: "DELETE",
    mutationId: true,
  });

export const getGlossaryTermRequests = (params) =>
  sendRequest({ url: `${base}/requests`, method: "GET", params });

export const createGlossaryTermRequest = (data) =>
  sendRequest({
    url: `${base}/requests`,
    method: "POST",
    data,
    mutationId: true,
  });

export const approveGlossaryTermRequest = (requestId) =>
  sendRequest({
    url: `${base}/requests/${requestId}/approve`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const rejectGlossaryTermRequest = (requestId, data) =>
  sendRequest({
    url: `${base}/requests/${requestId}/reject`,
    method: "POST",
    data: data || {},
    mutationId: true,
  });
