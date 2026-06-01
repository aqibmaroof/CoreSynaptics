import sendRequest from "../instance/sendRequest";

const base = "/cx-flow-diagrams";

export const getCxFlowDiagrams = (params) =>
  sendRequest({ url: base, method: "GET", params });

export const getCxFlowDiagramById = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

export const createCxFlowDiagram = (data) =>
  sendRequest({ url: base, method: "POST", data, mutationId: true });

export const updateCxFlowDiagram = (id, data) =>
  sendRequest({
    url: `${base}/${id}`,
    method: "PATCH",
    data,
    mutationId: true,
  });

export const deleteCxFlowDiagram = (id) =>
  sendRequest({
    url: `${base}/${id}`,
    method: "DELETE",
    mutationId: true,
  });

export const getCxFlowPersonas = () =>
  sendRequest({ url: `${base}/personas`, method: "GET" });

export const getCxFlowNodes = (flowId) =>
  sendRequest({ url: `${base}/${flowId}/nodes`, method: "GET" });

export const createCxFlowNode = (flowId, data) =>
  sendRequest({
    url: `${base}/${flowId}/nodes`,
    method: "POST",
    data,
    mutationId: true,
  });

export const updateCxFlowNode = (flowId, nodeId, data) =>
  sendRequest({
    url: `${base}/${flowId}/nodes/${nodeId}`,
    method: "PATCH",
    data,
    mutationId: true,
  });

export const deleteCxFlowNode = (flowId, nodeId) =>
  sendRequest({
    url: `${base}/${flowId}/nodes/${nodeId}`,
    method: "DELETE",
    mutationId: true,
  });
