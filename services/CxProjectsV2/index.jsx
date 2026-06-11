import sendRequest from "../instance/sendRequest";

/**
 * Project Module V2 API client.
 *
 * Base URL (NEXT_PUBLIC_API_URL) already ends in `/api`, so paths here start at
 * `/v2/...`. Mirrors the backend's two-controller split:
 *   • /v2/project-wizard  — draft lifecycle + finalize (the ONLY create path)
 *   • /v2/cx-projects      — enriched read, root update, sub-resource CRUD, catalog
 *
 * Auth, refresh, x-request-id are handled by sendRequest/axiosConfig.
 */

const WIZARD = "/v2/project-wizard";
const PROJECTS = "/v2/cx-projects";

// ─── Reference catalog ────────────────────────────────────────────────────────

/** GET /v2/cx-projects/catalog — asset types, OPR/scope options, doc types, roles. */
export const getV2Catalog = async () =>
  sendRequest({ url: `${PROJECTS}/catalog`, method: "GET" });

// ─── Wizard drafts ────────────────────────────────────────────────────────────

/** POST /v2/project-wizard/drafts */
export const startV2Draft = async (payload = {}) =>
  sendRequest({ url: `${WIZARD}/drafts`, method: "POST", data: payload });

/** GET /v2/project-wizard/drafts */
export const listV2Drafts = async () =>
  sendRequest({ url: `${WIZARD}/drafts`, method: "GET" });

/** GET /v2/project-wizard/drafts/:draftId */
export const getV2Draft = async (draftId) =>
  sendRequest({ url: `${WIZARD}/drafts/${draftId}`, method: "GET" });

/** PATCH /v2/project-wizard/drafts/:draftId/step — save one step blob. */
export const saveV2Step = async (draftId, step, data) =>
  sendRequest({
    url: `${WIZARD}/drafts/${draftId}/step`,
    method: "PATCH",
    data: { step, data },
  });

/** DELETE /v2/project-wizard/drafts/:draftId — abandon a draft. */
export const abandonV2Draft = async (draftId) =>
  sendRequest({ url: `${WIZARD}/drafts/${draftId}`, method: "DELETE" });

/** POST /v2/project-wizard/drafts/:draftId/finalize — finalize a stored draft. */
export const finalizeV2Draft = async (draftId, payload) =>
  sendRequest({
    url: `${WIZARD}/drafts/${draftId}/finalize`,
    method: "POST",
    data: payload,
  });

/**
 * POST /v2/project-wizard/finalize — finalize directly from a nested payload
 * (no stored draft required). The single create path used by the wizard UI.
 */
export const finalizeV2Direct = async (payload) =>
  sendRequest({ url: `${WIZARD}/finalize`, method: "POST", data: payload });

// ─── Projects (enriched read + root update) ───────────────────────────────────

/** GET /v2/cx-projects — org-scoped, paginated list. */
export const listV2Projects = async (params = {}) =>
  sendRequest({ url: PROJECTS, method: "GET", params });

/** GET /v2/cx-projects/:id — full enriched aggregate. */
export const getV2Project = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}`, method: "GET" });

/** PATCH /v2/cx-projects/:id — partial update of root + OPR/scope/milestones. */
export const updateV2Project = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}`, method: "PATCH", data: payload });

// ─── Assets (+ instance reconciliation server-side) ───────────────────────────

export const listV2Assets = async (id, params = {}) =>
  sendRequest({ url: `${PROJECTS}/${id}/assets`, method: "GET", params });

export const addV2Asset = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/assets`, method: "POST", data: payload });

export const updateV2Asset = async (id, assetId, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/assets/${assetId}`, method: "PATCH", data: payload });

export const removeV2Asset = async (id, assetId) =>
  sendRequest({ url: `${PROJECTS}/${id}/assets/${assetId}`, method: "DELETE" });

// ─── Documents (upsert by docType) ────────────────────────────────────────────

export const listV2Documents = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/documents`, method: "GET" });

export const upsertV2Document = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/documents`, method: "POST", data: payload });

export const removeV2Document = async (id, docType) =>
  sendRequest({ url: `${PROJECTS}/${id}/documents/${docType}`, method: "DELETE" });

// ─── Stakeholders ─────────────────────────────────────────────────────────────

export const listV2Stakeholders = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/stakeholders`, method: "GET" });

export const addV2Stakeholder = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/stakeholders`, method: "POST", data: payload });

export const updateV2Stakeholder = async (id, sid, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/stakeholders/${sid}`, method: "PATCH", data: payload });

export const removeV2Stakeholder = async (id, sid) =>
  sendRequest({ url: `${PROJECTS}/${id}/stakeholders/${sid}`, method: "DELETE" });

// ─── Team (ProjectAssignment) ─────────────────────────────────────────────────

export const listV2Team = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/team`, method: "GET" });

export const addV2TeamMember = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/team`, method: "POST", data: payload });

export const removeV2TeamMember = async (id, userId) =>
  sendRequest({ url: `${PROJECTS}/${id}/team/${userId}`, method: "DELETE" });

// ─── Project Playbook ─────────────────────────────────────────────────────────
// Per-project dashboard surface: summary snapshot, per-asset gate ladder,
// 6-week lookahead, trade field progress, team companies, per-user rail.

/** GET /v2/cx-projects/:id/playbook — one consistent summary snapshot. */
export const getPlaybookSummary = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/playbook`, method: "GET" });

/** GET /v2/cx-projects/:id/playbook/readiness?assetId= — per-asset gate detail. */
export const getPlaybookReadiness = async (id, assetId) =>
  sendRequest({
    url: `${PROJECTS}/${id}/playbook/readiness?assetId=${assetId}`,
    method: "GET",
  });

/** GET /v2/cx-projects/:id/playbook/phase-log */
export const getPlaybookPhaseLog = async (id, assetId) =>
  sendRequest({
    url: `${PROJECTS}/${id}/playbook/phase-log${assetId ? `?assetId=${assetId}` : ""}`,
    method: "GET",
  });

/** POST /v2/cx-projects/:id/assets/:assetId/phase/advance (409 when blocked). */
export const advanceAssetPhase = async (id, assetId, payload = {}) =>
  sendRequest({
    url: `${PROJECTS}/${id}/assets/${assetId}/phase/advance`,
    method: "POST",
    data: payload,
  });

/** POST /v2/cx-projects/:id/assets/:assetId/phase/revert */
export const revertAssetPhase = async (id, assetId, payload = {}) =>
  sendRequest({
    url: `${PROJECTS}/${id}/assets/${assetId}/phase/revert`,
    method: "POST",
    data: payload,
  });

// Lookahead board
export const listLookahead = async (id, params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({
    url: `${PROJECTS}/${id}/lookahead${query ? `?${query}` : ""}`,
    method: "GET",
  });
};
export const createLookahead = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/lookahead`, method: "POST", data: payload });
export const updateLookahead = async (id, activityId, payload) =>
  sendRequest({
    url: `${PROJECTS}/${id}/lookahead/${activityId}`,
    method: "PATCH",
    data: payload,
  });
export const removeLookahead = async (id, activityId) =>
  sendRequest({ url: `${PROJECTS}/${id}/lookahead/${activityId}`, method: "DELETE" });
export const flagLookaheadConstraint = async (id, activityId, note) =>
  sendRequest({
    url: `${PROJECTS}/${id}/lookahead/${activityId}/constraint`,
    method: "POST",
    data: { note },
  });
export const clearLookaheadConstraint = async (id, activityId) =>
  sendRequest({
    url: `${PROJECTS}/${id}/lookahead/${activityId}/constraint`,
    method: "DELETE",
  });

// Trade field progress (field completion % by trade)
export const getTradeProgress = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/playbook/trade-progress`, method: "GET" });
export const upsertTradeProgress = async (id, payload) =>
  sendRequest({
    url: `${PROJECTS}/${id}/playbook/trade-progress`,
    method: "PUT",
    data: payload,
  });

// Team companies (ProjectMembership: INVITED → ACTIVE → REVOKED)
export const listTeamCompanies = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/team-companies`, method: "GET" });
export const inviteTeamCompany = async (id, payload) =>
  sendRequest({ url: `${PROJECTS}/${id}/team-companies`, method: "POST", data: payload });
export const activateTeamCompany = async (id, membershipId) =>
  sendRequest({
    url: `${PROJECTS}/${id}/team-companies/${membershipId}/activate`,
    method: "POST",
  });
export const revokeTeamCompany = async (id, membershipId) =>
  sendRequest({
    url: `${PROJECTS}/${id}/team-companies/${membershipId}`,
    method: "DELETE",
  });

// Per-user rail preference
export const getPlaybookRail = async (id) =>
  sendRequest({ url: `${PROJECTS}/${id}/playbook/rail`, method: "GET" });
export const updatePlaybookRail = async (id, rail) =>
  sendRequest({ url: `${PROJECTS}/${id}/playbook/rail`, method: "PUT", data: { rail } });
