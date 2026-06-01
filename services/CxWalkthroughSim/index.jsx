import sendRequest from "../instance/sendRequest";

const base = "/cx-walkthrough-sims";

export const getCxSimulations = (params) =>
  sendRequest({ url: base, method: "GET", params });

export const getCxSimulationById = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

export const createCxSimulation = (data) =>
  sendRequest({ url: base, method: "POST", data, mutationId: true });

export const updateCxSimulation = (id, data) =>
  sendRequest({
    url: `${base}/${id}`,
    method: "PATCH",
    data,
    mutationId: true,
  });

export const deleteCxSimulation = (id) =>
  sendRequest({
    url: `${base}/${id}`,
    method: "DELETE",
    mutationId: true,
  });

export const startCxSimulationSession = (simulationId) =>
  sendRequest({
    url: `${base}/${simulationId}/sessions`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const getCxSimulationSession = (sessionId) =>
  sendRequest({
    url: `${base}/sessions/${sessionId}`,
    method: "GET",
  });

export const submitCxSimulationAnswer = (sessionId, data) =>
  sendRequest({
    url: `${base}/sessions/${sessionId}/answer`,
    method: "POST",
    data,
    mutationId: true,
  });

export const completeCxSimulationSession = (sessionId) =>
  sendRequest({
    url: `${base}/sessions/${sessionId}/complete`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const submitCxSimulationFeedback = (simulationId, data) =>
  sendRequest({
    url: `${base}/${simulationId}/feedback`,
    method: "POST",
    data,
    mutationId: true,
  });

export const getCxSimulationFeedback = (simulationId) =>
  sendRequest({
    url: `${base}/${simulationId}/feedback`,
    method: "GET",
  });
