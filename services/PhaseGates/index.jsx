import sendRequest from "../instance/sendRequest";

// ─── Phase Gate Conditions ──────────────────────────────────────────────────

/** Get all phase gate conditions for a project */
export const getPhaseGates = async (projectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-gates`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Get conditions for a specific transition */
export const getTransitionConditions = async (projectId, transition) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-gates?transition=${transition}`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Create a new phase gate condition */
export const createPhaseCondition = async (projectId, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-gates`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Update a condition's status (mark met/unmet, add evidence, notes) */
export const updateConditionStatus = async (projectId, conditionId, payload) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-gates/${conditionId}`,
      method: "PATCH",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Delete a custom (non-required) phase gate condition */
export const deletePhaseCondition = async (projectId, conditionId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-gates/${conditionId}`,
      method: "DELETE",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// ─── Phase Status & Advancement ─────────────────────────────────────────────

/** Get current phase status for a project */
export const getProjectPhaseStatus = async (projectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-status`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Evaluate readiness to advance to next phase */
export const evaluatePhaseReadiness = async (projectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-readiness`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Advance project to the next phase (will fail if blocking conditions unmet) */
export const advancePhase = async (projectId, payload = {}) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/advance-phase`,
      method: "POST",
      data: payload,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Get phase advancement history/audit log */
export const getAdvancementLog = async (projectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-log`,
      method: "GET",
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Seed/initialize all phase gate conditions for a new project */
export const initializePhaseGates = async (projectId) => {
  try {
    const data = await sendRequest({
      url: `/projects/${projectId}/phase-gates/initialize`,
      method: "POST",
    });
    return data;
  } catch (error) {
    throw error;
  }
};
