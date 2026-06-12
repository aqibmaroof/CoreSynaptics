import sendRequest from "../instance/sendRequest";

const base = "/commissioning-tests";

/**
 * List commissioning tests with optional filters.
 * params: { cxProjectId, assetId, projectAssetId, phase, testType, result,
 *           performedByCompanyId, witnessedOnly, page, limit }
 */
export const listCommissioningTests = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    }, {})
  ).toString();
  return sendRequest({ url: `${base}${qs ? `?${qs}` : ""}`, method: "GET" });
};

export const getCommissioningTest = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "GET" });

/**
 * Create a commissioning test (starts in PENDING).
 * payload: { cxProjectId, assetId?, projectAssetId?, phase, testType,
 *            testName, specification?, performedByCompanyId?, previousTestId? }
 * projectAssetId links the test to V2 project equipment — a FAIL blocks
 * that equipment's phase gate in the Project Playbook.
 */
export const createCommissioningTest = (payload) =>
  sendRequest({ url: base, method: "POST", data: payload });

/**
 * Record the test execution result. Allowed once per test (immutable after).
 * payload: { result: 'PASS'|'FAIL'|'RETEST_REQUIRED', measuredValues?, notes?,
 *            performedByUserId, performedByCompanyId? }
 */
export const recordTestResult = (id, payload) =>
  sendRequest({
    url: `${base}/${id}/record-result`,
    method: "POST",
    data: payload,
  });

/**
 * Record witness sign-off (only allowed on a PASSed test, only once).
 * Triggers backend listener that auto-resolves any linked PhaseGate (TEST).
 * payload: { witnessedByUserId, witnessedByCompanyId? }
 */
export const recordTestWitness = (id, payload) =>
  sendRequest({
    url: `${base}/${id}/record-witness`,
    method: "POST",
    data: payload,
  });

/** Attach an evidence Artifact (PDF, photos, raw data). */
export const attachTestEvidence = (id, payload) =>
  sendRequest({
    url: `${base}/${id}/attach-evidence`,
    method: "POST",
    data: payload,
  });

/** Soft-delete (blocked once test satisfies a phase gate). */
export const deleteCommissioningTest = (id) =>
  sendRequest({ url: `${base}/${id}`, method: "DELETE" });

// Re-export enum-ish constants for UI reuse
export const TEST_TYPES = [
  "INSULATION_RESISTANCE",
  "POWER_FACTOR",
  "CONTACT_RESISTANCE",
  "HI_POT",
  "TORQUE",
  "GROUND_RESISTANCE",
  "FAT",
  "FUNCTIONAL",
  "LOAD_BANK",
  "IST",
  "OTHER",
];

export const TEST_RESULTS = ["PENDING", "PASS", "FAIL", "RETEST_REQUIRED"];

export const COMMISSIONING_PHASES = [
  "NONE",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "IST",
];
