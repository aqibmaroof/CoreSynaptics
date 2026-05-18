import sendRequest from "../instance/sendRequest";

// ── Phase 5 PR-7: Turnover packages ──────────────────────────────────────────
// Generation creates an approval chain in the background. The Deliver button
// is enabled only after status === 'APPROVED'.

const cx = (id) => `/cx-projects/${id}/turnover-packages`;

export const listTurnoverPackages = (cxProjectId) =>
  sendRequest({ url: cx(cxProjectId), method: "GET" });

export const generateTurnoverPackage = (cxProjectId) =>
  sendRequest({
    url: `${cx(cxProjectId)}/generate`,
    method: "POST",
    mutationId: true,
  });

export const getTurnoverPackage = (cxProjectId, packageId) =>
  sendRequest({ url: `${cx(cxProjectId)}/${packageId}`, method: "GET" });

export const deliverTurnoverPackage = (cxProjectId, packageId) =>
  sendRequest({
    url: `${cx(cxProjectId)}/${packageId}/deliver`,
    method: "POST",
    mutationId: true,
  });

export const TURNOVER_PACKAGE_STATUSES = [
  "DRAFT",
  "READINESS_FAILED",
  "PENDING_APPROVAL",
  "APPROVED",
  "DELIVERED",
  "REJECTED",
];

export const TURNOVER_STATUS_STYLE = {
  DRAFT: { color: "var(--rf-txt3)", bg: "var(--rf-bg3)" },
  READINESS_FAILED: {
    color: "var(--rf-red)",
    bg: "rgba(239,68,68,0.16)",
  },
  PENDING_APPROVAL: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  APPROVED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  DELIVERED: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.24)" },
  REJECTED: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};
