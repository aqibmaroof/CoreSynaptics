/**
 * ============================================================================
 * PHASE GATE VALIDATION ENGINE
 * ============================================================================
 *
 * Client-side rule evaluation system that mirrors the server-side PostgreSQL
 * function `evaluate_phase_readiness`. This engine:
 *
 *   1. Defines the canonical phase order and valid transitions
 *   2. Defines all required conditions per transition
 *   3. Evaluates whether a project can advance from its current phase
 *   4. Returns structured readiness reports per transition
 *
 * The server is the source of truth — this engine is used for instant UI
 * feedback before hitting the API.
 * ============================================================================
 */

// ─── PHASE ORDER ────────────────────────────────────────────────────────────

export const PHASES = ["L1", "L2", "PRE_E", "L3", "L4", "L5", "COMPLETE"];

export const PHASE_LABELS = {
  L1: "Level 1 — Factory Readiness",
  L2: "Level 2 — Site Readiness",
  PRE_E: "Pre-Energization",
  L3: "Level 3 — Startup",
  L4: "Level 4 — Functional Testing",
  L5: "Level 5 — IST & Acceptance",
  COMPLETE: "Complete",
};

// ─── TRANSITIONS ────────────────────────────────────────────────────────────

export const TRANSITIONS = {
  L1_TO_L2: { from: "L1", to: "L2", label: "L1 → L2" },
  L2_TO_PRE_E: { from: "L2", to: "PRE_E", label: "L2 → Pre-E" },
  PRE_E_TO_L3: { from: "PRE_E", to: "L3", label: "Pre-E → L3" },
  L3_TO_L4: { from: "L3", to: "L4", label: "L3 → L4" },
  L4_TO_L5: { from: "L4", to: "L5", label: "L4 → L5" },
  L5_TO_COMPLETE: { from: "L5", to: "COMPLETE", label: "L5 → Complete" },
};

// ─── REQUIRED CONDITIONS PER TRANSITION ─────────────────────────────────────

export const GATE_RULES = {
  L1_TO_L2: [
    { key: "factory_test_report_uploaded", name: "Factory test report uploaded", blocking: true },
    { key: "equipment_shipment_confirmed", name: "Equipment shipment confirmed", blocking: true },
  ],
  L2_TO_PRE_E: [
    { key: "trade_checklists_signed", name: "Trade checklists signed", blocking: true },
    { key: "clean_walk_completed", name: "Clean walk completed", blocking: true },
    { key: "mep_approval", name: "MEP approval", blocking: true },
    { key: "safety_clearance", name: "Safety clearance", blocking: true },
  ],
  PRE_E_TO_L3: [
    { key: "energization_event_recorded", name: "Energization event recorded", blocking: true },
    { key: "fse_approved", name: "FSE approved", blocking: true },
    { key: "vendor_checklist_assigned", name: "Vendor checklist assigned", blocking: true },
  ],
  L3_TO_L4: [
    { key: "oem_startup_report_signed", name: "OEM startup report signed", blocking: true },
    { key: "critical_alarms_cleared", name: "Critical alarms cleared", blocking: true },
    { key: "gc_qaqc_confirmation", name: "GC QA/QC confirmation", blocking: true },
  ],
  L4_TO_L5: [
    { key: "functional_tests_passed", name: "Functional tests passed", blocking: true },
    { key: "issues_closed_deferred", name: "Issues closed/deferred", blocking: true },
    { key: "customer_acceptance", name: "Customer acceptance", blocking: true },
  ],
  L5_TO_COMPLETE: [
    { key: "ist_report_signed", name: "IST report signed", blocking: true },
    { key: "turnover_docs_delivered", name: "Turnover docs delivered", blocking: true },
    { key: "warranty_start_date_set", name: "Warranty start date set", blocking: true },
  ],
};

// ─── ENGINE FUNCTIONS ───────────────────────────────────────────────────────

/**
 * Get the transition key for the current phase.
 * Returns null if project is already COMPLETE.
 */
export function getTransitionForPhase(currentPhase) {
  const map = {
    L1: "L1_TO_L2",
    L2: "L2_TO_PRE_E",
    PRE_E: "PRE_E_TO_L3",
    L3: "L3_TO_L4",
    L4: "L4_TO_L5",
    L5: "L5_TO_COMPLETE",
  };
  return map[currentPhase] || null;
}

/**
 * Get the next phase after the current one.
 * Returns null if already COMPLETE.
 */
export function getNextPhase(currentPhase) {
  const idx = PHASES.indexOf(currentPhase);
  if (idx === -1 || idx >= PHASES.length - 1) return null;
  return PHASES[idx + 1];
}

/**
 * Get the phase index (0-based) for progress calculation.
 */
export function getPhaseIndex(phase) {
  return PHASES.indexOf(phase);
}

/**
 * Evaluate readiness for a single transition given the current conditions.
 *
 * @param {string} transitionKey - e.g. "L1_TO_L2"
 * @param {Array} conditions - array of condition objects from the API with { condition_key, condition_met, blocking_advance }
 * @returns {{ totalConditions, metConditions, blockingUnmet, readyToAdvance, details }}
 */
export function evaluateTransition(transitionKey, conditions = []) {
  const rules = GATE_RULES[transitionKey] || [];

  // Build a lookup from API conditions
  const conditionMap = {};
  conditions.forEach((c) => {
    conditionMap[c.condition_key || c.conditionKey] = c;
  });

  const details = rules.map((rule) => {
    const apiCondition = conditionMap[rule.key];
    const met = apiCondition?.condition_met ?? apiCondition?.conditionMet ?? false;
    const blocking = apiCondition?.blocking_advance ?? apiCondition?.blockingAdvance ?? rule.blocking;

    return {
      key: rule.key,
      name: rule.name,
      met,
      blocking,
      metAt: apiCondition?.met_at || apiCondition?.metAt || null,
      metBy: apiCondition?.met_by || apiCondition?.metBy || null,
      evidenceUrl: apiCondition?.evidence_url || apiCondition?.evidenceUrl || null,
    };
  });

  const totalConditions = details.length;
  const metConditions = details.filter((d) => d.met).length;
  const blockingUnmet = details.filter((d) => d.blocking && !d.met).length;
  const readyToAdvance = blockingUnmet === 0;

  return {
    transition: transitionKey,
    label: TRANSITIONS[transitionKey]?.label || transitionKey,
    totalConditions,
    metConditions,
    blockingUnmet,
    readyToAdvance,
    progress: totalConditions > 0 ? Math.round((metConditions / totalConditions) * 100) : 0,
    details,
  };
}

/**
 * Evaluate full project readiness — all transitions from current phase onward.
 *
 * @param {string} currentPhase - current project phase
 * @param {Array} allConditions - all phase gate conditions for this project
 * @returns {{ currentPhase, nextPhase, currentTransition, overallProgress, transitions }}
 */
export function evaluateProjectReadiness(currentPhase, allConditions = []) {
  const currentTransitionKey = getTransitionForPhase(currentPhase);
  const nextPhase = getNextPhase(currentPhase);

  // Group conditions by transition
  const groupedByTransition = {};
  allConditions.forEach((c) => {
    const t = c.transition;
    if (!groupedByTransition[t]) groupedByTransition[t] = [];
    groupedByTransition[t].push(c);
  });

  // Evaluate each transition
  const transitions = {};
  Object.keys(GATE_RULES).forEach((transitionKey) => {
    transitions[transitionKey] = evaluateTransition(
      transitionKey,
      groupedByTransition[transitionKey] || []
    );
  });

  // Overall progress: how many total conditions met across ALL transitions
  const allDetails = Object.values(transitions).flatMap((t) => t.details);
  const totalAll = allDetails.length;
  const metAll = allDetails.filter((d) => d.met).length;

  return {
    currentPhase,
    currentPhaseLabel: PHASE_LABELS[currentPhase],
    nextPhase,
    nextPhaseLabel: nextPhase ? PHASE_LABELS[nextPhase] : null,
    currentTransition: currentTransitionKey,
    canAdvance: currentTransitionKey ? transitions[currentTransitionKey]?.readyToAdvance : false,
    overallProgress: totalAll > 0 ? Math.round((metAll / totalAll) * 100) : 0,
    transitions,
  };
}
