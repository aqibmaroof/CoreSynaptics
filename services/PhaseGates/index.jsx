import sendRequest from "../instance/sendRequest";

// ─── Seed & Initialize ────────────────────────────────────────────────────────

/** Seed/initialize all phase gate conditions for a project (safe to call multiple times) */
export const seedPhaseGates = async (projectId) =>
  sendRequest({
    url: `/phase-gates/${projectId}/seed`,
    method: "POST",
  });

// ─── Phase State ──────────────────────────────────────────────────────────────

/** Get current project phase state (currentPhase, nextPhase, isAtTerminalPhase, etc.) */
export const getProjectPhaseState = async (projectId) =>
  sendRequest({
    url: `/phase-gates/project-phases/${projectId}`,
    method: "GET",
  });

// ─── Phase Gate Conditions ────────────────────────────────────────────────────

/** List all phase gate conditions for a project */
export const getPhaseGates = async (projectId) =>
  sendRequest({
    url: `/phase-gates/${projectId}`,
    method: "GET",
  });

// ─── Readiness Evaluation ─────────────────────────────────────────────────────

/** Evaluate readiness to advance to the next phase */
export const evaluatePhaseReadiness = async (projectId) =>
  sendRequest({
    url: `/phase-gates/${projectId}/readiness`,
    method: "GET",
  });

// ─── Phase Advancement ────────────────────────────────────────────────────────

/** Advance project to the next phase (fails if blocking conditions unmet) */
export const advancePhase = async (projectId, payload = {}) =>
  sendRequest({
    url: `/phase-gates/${projectId}/advance`,
    method: "POST",
    data: payload,
  });

// ─── Condition Actions ────────────────────────────────────────────────────────

/**
 * Mark a phase gate condition as met.
 * payload: { evidenceUrl?, evidenceNote? }
 */
export const markConditionMet = async (conditionId, payload = {}) =>
  sendRequest({
    url: `/phase-gates/conditions/${conditionId}/mark-met`,
    method: "PUT",
    data: payload,
  });

/**
 * Waive a phase gate condition with a recorded justification.
 * payload: { reason } — minimum 20 characters
 */
export const waiveCondition = async (conditionId, payload) =>
  sendRequest({
    url: `/phase-gates/conditions/${conditionId}/waive`,
    method: "PUT",
    data: payload,
  });

/**
 * Link a condition to an existing entity in the system.
 * payload: { linkedEntityId, linkedEntityType: 'Checklist'|'Document'|'Task'|'Rfi' }
 */
export const linkCondition = async (conditionId, payload) =>
  sendRequest({
    url: `/phase-gates/conditions/${conditionId}/link`,
    method: "PATCH",
    data: payload,
  });

// ─── Advancement History ──────────────────────────────────────────────────────

/** Get all recorded phase advancements (audit log) */
export const getAdvancementHistory = async (projectId) =>
  sendRequest({
    url: `/phase-gates/${projectId}/history`,
    method: "GET",
  });
