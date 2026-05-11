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

// ─── Sub-phase progress (PR2) ────────────────────────────────────────────────

/**
 * Sub-phase progress projection — L2.0x and L3.06 markers grouped by owner.
 *
 * Returns advisory sub-phase markers (do NOT block top-level transitions —
 * for that use evaluatePhaseReadiness). Useful for the L-Phase matrix view
 * and role-aware "what I own next" dashboards (CXA, OEM, GC_QAQC, TRADE, BMS).
 *
 * Response: {
 *   projectId, totalSteps, completedSteps, percentComplete,
 *   byOwner: Record<owner, item[]>,
 *   items: SubPhaseProgressItem[],   // flat, ordered by phase + conditionKey
 *   evaluatedAt
 * }
 */
export const getSubPhaseProgress = async (projectId) =>
  sendRequest({
    url: `/phase-gates/${projectId}/sub-progress`,
    method: "GET",
  });

/** Display labels for sub-phase owner taxonomy (matches HTML PHASE_REFERENCE). */
export const SUB_PHASE_OWNER_LABELS = {
  TRADE: "Trade",
  TRADE_M: "Mech. Trade",
  CXA: "CxA",
  OEM: "OEM",
  OEM_OR_TRADE: "OEM / Trade",
  GC_QAQC: "GC QA/QC",
  BMS: "BMS",
};

/** Tailwind classes per owner for column headers. */
export const SUB_PHASE_OWNER_COLORS = {
  TRADE: "text-blue-400 border-blue-500/40",
  TRADE_M: "text-cyan-400 border-cyan-500/40",
  CXA: "text-violet-400 border-violet-500/40",
  OEM: "text-amber-400 border-amber-500/40",
  OEM_OR_TRADE: "text-orange-400 border-orange-500/40",
  GC_QAQC: "text-emerald-400 border-emerald-500/40",
  BMS: "text-pink-400 border-pink-500/40",
};
