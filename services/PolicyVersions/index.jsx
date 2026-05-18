import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch C4: Org-policy versioning ────────────────────────────────
// Rollback creates a NEW version (audit chain stays append-only). Diff is
// server-side — render diff.diff verbatim without recomputing.

const base = (policyId) =>
  `/org-policies/${encodeURIComponent(policyId)}/versions`;

export const listPolicyVersions = (policyId) =>
  sendRequest({ url: base(policyId), method: "GET" });

/** body: { value, notes? } → { version } */
export const addPolicyVersion = (policyId, value, notes) =>
  sendRequest({
    url: base(policyId),
    method: "POST",
    data: { value, notes },
    mutationId: true,
  });

export const policyVersionDiff = (policyId, a, b) =>
  sendRequest({
    url: `${base(policyId)}/diff/${a}/${b}`,
    method: "GET",
  });

/** body: { notes? } → { rolledBackTo, newVersion } */
export const rollbackPolicyVersion = (policyId, to, notes) =>
  sendRequest({
    url: `${base(policyId)}/rollback/${to}`,
    method: "POST",
    data: { notes },
    mutationId: true,
  });
