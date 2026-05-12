import sendRequest from "../instance/sendRequest";

// ── Phase 4 PR-10: Training Simulator ────────────────────────────────────────
// Wires into the HTML training/simulator/opssim stubs.
// Backend storage is now real — these are live endpoints.

/** List available scenarios, optionally filtered by role. */
export const listScenarios = (role) =>
  sendRequest({ url: "/training-sim/scenarios", method: "GET", params: role ? { role } : {} });

/** Get full scenario including steps. */
export const getScenario = (id) =>
  sendRequest({ url: `/training-sim/scenarios/${id}`, method: "GET" });

/** Create a new scenario (admin / training coord only).
 *  body: { title, role, difficulty: "easy"|"medium"|"hard", steps? }
 */
export const createScenario = (body) =>
  sendRequest({ url: "/training-sim/scenarios", method: "POST", data: body });

/** Start a new session for a scenario. Returns: { id } */
export const startSession = (scenarioId) =>
  sendRequest({ url: `/training-sim/scenarios/${scenarioId}/sessions`, method: "POST", data: {} });

/** Complete a session with score + decisions log.
 *  body: { score: number, decisions?: unknown }
 */
export const completeSession = (sessionId, body) =>
  sendRequest({ url: `/training-sim/sessions/${sessionId}/complete`, method: "POST", data: body });

/** Caller's session history. Returns: TrainingSessionSummary[] */
export const myHistory = () =>
  sendRequest({ url: "/training-sim/me/history", method: "GET" });
