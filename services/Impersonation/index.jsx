import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch D: Impersonation audit ──────────────────────────────────
// Wire the persona-switcher to:
//   1. POST /governance/impersonation with { targetUserId, reason } → auditId
//   2. Swap the JWT / actAs claim in the client session
//   3. On switch back: POST /governance/impersonation/:auditId/end

const base = "/governance/impersonation";

/** body: { targetUserId, reason? } → { id, ... } */
export const startImpersonation = (body) =>
  sendRequest({
    url: base,
    method: "POST",
    data: body,
    mutationId: true,
  });

export const endImpersonation = (auditId) =>
  sendRequest({
    url: `${base}/${encodeURIComponent(auditId)}/end`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const listImpersonationAudit = () =>
  sendRequest({ url: base, method: "GET" });
