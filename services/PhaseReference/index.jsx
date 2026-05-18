import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B3: Phase reference (canonical taxonomy + overrides) ────
// The server already produces the merged tree. Render `overridden=true` nodes
// with a visual cue but NEVER deep-merge canonical + override values in the
// client.

const base = "/phase-reference";

export const phaseReferenceTree = () =>
  sendRequest({ url: `${base}/tree`, method: "GET" });

export const phaseOwnership = () =>
  sendRequest({ url: `${base}/ownership`, method: "GET" });

/**
 * body: { phaseKey, primaryOwner?, alternateOwners?, isHoldPoint?,
 *         isWitnessPoint?, title?, shortDesc? }
 */
export const upsertPhaseOverride = (body) =>
  sendRequest({
    url: `${base}/override`,
    method: "POST",
    data: body,
    mutationId: true,
  });

/** Platform-only one-shot seed (idempotent). */
export const seedCanonicalPhases = () =>
  sendRequest({
    url: `${base}/seed-canonical`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const PHASE_OWNERS = [
  "GC",
  "TRADE",
  "OEM",
  "CXA",
  "CUSTOMER",
  "BMS",
  "SAFETY",
  "NETA",
  "SHARED",
];

export const OWNER_STYLE = {
  GC: { color: "var(--rf-blue, #3b82f6)", bg: "rgba(59,130,246,0.16)" },
  TRADE: { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" },
  OEM: {
    color: "var(--rf-purple, #8b5cf6)",
    bg: "rgba(139,92,246,0.16)",
  },
  CXA: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  CUSTOMER: { color: "var(--rf-txt)", bg: "var(--rf-bg3)" },
  BMS: { color: "var(--rf-blue, #3b82f6)", bg: "rgba(59,130,246,0.16)" },
  SAFETY: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  NETA: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  SHARED: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
};
