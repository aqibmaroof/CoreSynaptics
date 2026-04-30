import sendRequest from "../instance/sendRequest";

// ─── WIZARD DRAFT LIFECYCLE ───────────────────────────────────────────────────

const DRAFT_BASE = "/project-wizard/drafts";

/** POST /api/project-wizard/drafts — create a new blank draft */
export const startWizardDraft = async (payload) =>
  sendRequest({ url: DRAFT_BASE, method: "POST", data: payload });

/** GET /api/project-wizard/drafts — list all non-finalized drafts for the org */
export const listWizardDrafts = async () =>
  sendRequest({ url: DRAFT_BASE, method: "GET" });

/** GET /api/project-wizard/drafts/:id — load draft with all saved step data */
export const getWizardDraft = async (draftId) =>
  sendRequest({ url: `${DRAFT_BASE}/${draftId}`, method: "GET" });

/**
 * PATCH /api/project-wizard/drafts/:id/steps — save one wizard step (idempotent).
 * Repeated calls for the same stepKey overwrite the previous draft data for that step.
 * @param {string} step  API step key (e.g. "basics", "assets", "schedule")
 * @param {object} data  Step payload shaped per the integration guide
 */
export const saveWizardStep = async (draftId, step, data) =>
  sendRequest({
    url: `${DRAFT_BASE}/${draftId}/steps`,
    method: "PATCH",
    data: { step, data },
  });

/** POST /api/project-wizard/drafts/:id/finalize — validate all steps and atomically create the CxProject */
export const finalizeWizardDraft = async (draftId) =>
  sendRequest({ url: `${DRAFT_BASE}/${draftId}/finalize`, method: "POST" });

/** GET /api/project-wizard/org-catalog — returns active workflows, SOPs, and partner companies for wizard pickers */
export const getWizardOrgCatalog = async () =>
  sendRequest({ url: `${DRAFT_BASE.replace('/drafts', '')}/org-catalog`, method: "GET" });

// ─── ORG WORKFLOWS  (/api/org-workflows) ─────────────────────────────────────

const ORG_WF = "/org-workflows";

/** GET /api/org-workflows — list org workflow templates.
 *  @param {object} params  Optional: { activeOnly: "true", tag: "commissioning" }
 */
export const listOrgWorkflows = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${ORG_WF}${qs ? `?${qs}` : ""}`, method: "GET" });
};

/** GET /api/org-workflows/:id */
export const getOrgWorkflow = async (id) =>
  sendRequest({ url: `${ORG_WF}/${id}`, method: "GET" });

/** POST /api/org-workflows */
export const createOrgWorkflow = async (payload) =>
  sendRequest({ url: ORG_WF, method: "POST", data: payload });

/** PATCH /api/org-workflows/:id  (set isActive:false to deactivate) */
export const updateOrgWorkflow = async (id, payload) =>
  sendRequest({ url: `${ORG_WF}/${id}`, method: "PATCH", data: payload });

/** DELETE /api/org-workflows/:id → 204 */
export const deleteOrgWorkflow = async (id) =>
  sendRequest({ url: `${ORG_WF}/${id}`, method: "DELETE" });

// ─── ORG SOPs  (/api/org-sops) ───────────────────────────────────────────────

const ORG_SOP = "/org-sops";

/** GET /api/org-sops
 *  @param {object} params  Optional: { category, activeOnly: "true", tag }
 */
export const listOrgSOPs = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${ORG_SOP}${qs ? `?${qs}` : ""}`, method: "GET" });
};

/** GET /api/org-sops/:id */
export const getOrgSOP = async (id) =>
  sendRequest({ url: `${ORG_SOP}/${id}`, method: "GET" });

/** POST /api/org-sops */
export const createOrgSOP = async (payload) =>
  sendRequest({ url: ORG_SOP, method: "POST", data: payload });

/** PATCH /api/org-sops/:id */
export const updateOrgSOP = async (id, payload) =>
  sendRequest({ url: `${ORG_SOP}/${id}`, method: "PATCH", data: payload });

/** DELETE /api/org-sops/:id → 204 */
export const deleteOrgSOP = async (id) =>
  sendRequest({ url: `${ORG_SOP}/${id}`, method: "DELETE" });

// ─── ORG MOBILIZATION CATALOG  (/api/org-mobilization-catalog) ───────────────

const ORG_MOB = "/org-mobilization-catalog";

/**
 * GET /api/org-mobilization-catalog
 * @param {object} params  Optional: { stepKey: "mob_ppe", activeOnly: "true" }
 */
export const listOrgMobCatalog = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${ORG_MOB}${qs ? `?${qs}` : ""}`, method: "GET" });
};

/** GET /api/org-mobilization-catalog/:id */
export const getOrgMobCatalogItem = async (id) =>
  sendRequest({ url: `${ORG_MOB}/${id}`, method: "GET" });

/** POST /api/org-mobilization-catalog
 *  Required: stepKey (immutable), name, category
 */
export const createOrgMobCatalogItem = async (payload) =>
  sendRequest({ url: ORG_MOB, method: "POST", data: payload });

/** PATCH /api/org-mobilization-catalog/:id  (stepKey cannot be changed) */
export const updateOrgMobCatalogItem = async (id, payload) =>
  sendRequest({ url: `${ORG_MOB}/${id}`, method: "PATCH", data: payload });

/** DELETE /api/org-mobilization-catalog/:id → 204 */
export const deleteOrgMobCatalogItem = async (id) =>
  sendRequest({ url: `${ORG_MOB}/${id}`, method: "DELETE" });

// ─── ORG ASSET CATALOG  (/api/org-asset-catalog) ─────────────────────────────

const ORG_ASSET = "/org-asset-catalog";

/**
 * GET /api/org-asset-catalog
 * @param {object} params  Optional: { category, activeOnly: "true", page, limit }
 */
export const listOrgAssetCatalog = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({
    url: `${ORG_ASSET}${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
};

/** GET /api/org-asset-catalog/:id */
export const getOrgAssetCatalogItem = async (id) =>
  sendRequest({ url: `${ORG_ASSET}/${id}`, method: "GET" });

/** POST /api/org-asset-catalog  (required: category, abbr, name) */
export const createOrgAssetCatalogItem = async (payload) =>
  sendRequest({ url: ORG_ASSET, method: "POST", data: payload });

/** PATCH /api/org-asset-catalog/:id */
export const updateOrgAssetCatalogItem = async (id, payload) =>
  sendRequest({ url: `${ORG_ASSET}/${id}`, method: "PATCH", data: payload });

/** DELETE /api/org-asset-catalog/:id → 204 */
export const deleteOrgAssetCatalogItem = async (id) =>
  sendRequest({ url: `${ORG_ASSET}/${id}`, method: "DELETE" });

// ─── ORG SAFETY PLAN TEMPLATES  (/api/org-safety-plan-templates) ─────────────

const ORG_SAFETY = "/org-safety-plan-templates";

/** GET /api/org-safety-plan-templates — list all templates */
export const listOrgSafetyTemplates = async () =>
  sendRequest({ url: ORG_SAFETY, method: "GET" });

/** GET /api/org-safety-plan-templates/default — returns the isDefault:true template, or null */
export const getOrgSafetyDefault = async () =>
  sendRequest({ url: `${ORG_SAFETY}/default`, method: "GET" });

/** GET /api/org-safety-plan-templates/:id */
export const getOrgSafetyTemplate = async (id) =>
  sendRequest({ url: `${ORG_SAFETY}/${id}`, method: "GET" });

/** POST /api/org-safety-plan-templates  (required: name; setting isDefault:true auto-demotes previous) */
export const createOrgSafetyTemplate = async (payload) =>
  sendRequest({ url: ORG_SAFETY, method: "POST", data: payload });

/** PATCH /api/org-safety-plan-templates/:id */
export const updateOrgSafetyTemplate = async (id, payload) =>
  sendRequest({ url: `${ORG_SAFETY}/${id}`, method: "PATCH", data: payload });

/** DELETE /api/org-safety-plan-templates/:id → 204 */
export const deleteOrgSafetyTemplate = async (id) =>
  sendRequest({ url: `${ORG_SAFETY}/${id}`, method: "DELETE" });

// ─── ORG TOOLBOX TALK TOPICS  (/api/org-toolbox-talks) ───────────────────────

const ORG_TBT = "/org-toolbox-talks";

/**
 * GET /api/org-toolbox-talks
 * @param {object} params  Optional: { category, activeOnly: "true", page, limit }
 * category values: ORIENTATION | ELECTRICAL | FALLS | RIGGING | FIRE | CONFINED | ENV | GENERAL
 */
export const listOrgToolboxTalks = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${ORG_TBT}${qs ? `?${qs}` : ""}`, method: "GET" });
};

/** GET /api/org-toolbox-talks/:id */
export const getOrgToolboxTalk = async (id) =>
  sendRequest({ url: `${ORG_TBT}/${id}`, method: "GET" });

/** POST /api/org-toolbox-talks  (required: title) */
export const createOrgToolboxTalk = async (payload) =>
  sendRequest({ url: ORG_TBT, method: "POST", data: payload });

/** PATCH /api/org-toolbox-talks/:id */
export const updateOrgToolboxTalk = async (id, payload) =>
  sendRequest({ url: `${ORG_TBT}/${id}`, method: "PATCH", data: payload });

/** DELETE /api/org-toolbox-talks/:id → 204 */
export const deleteOrgToolboxTalk = async (id) =>
  sendRequest({ url: `${ORG_TBT}/${id}`, method: "DELETE" });

// ─── CX PROJECTS — CORE  (/api/cx-projects) ──────────────────────────────────

const CXP = "/cx-projects";

/**
 * GET /api/cx-projects
 * @param {object} params  Optional: { status, projectType, customer, page, limit }
 * status: DRAFT | ACTIVE | ON_HOLD | COMPLETED | ARCHIVED
 */
export const listCxProjects = async (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({ url: `${CXP}${qs ? `?${qs}` : ""}`, method: "GET" });
};

/** GET /api/cx-projects/:id — returns project with all child collections inline */
export const getCxProject = async (id) =>
  sendRequest({ url: `${CXP}/${id}`, method: "GET" });

/**
 * PATCH /api/cx-projects/:id — partial update (only sent fields are changed).
 * workflowIds / sopIds / partnerIds use replace semantics — send [] to clear.
 */
export const updateCxProject = async (id, payload) =>
  sendRequest({ url: `${CXP}/${id}`, method: "PATCH", data: payload });

/**
 * PATCH /api/cx-projects/:id/status
 * @param {string} status  ACTIVE | ON_HOLD | COMPLETED | ARCHIVED
 */
export const updateCxProjectStatus = async (id, status) =>
  sendRequest({
    url: `${CXP}/${id}/status`,
    method: "PATCH",
    data: { status },
  });

/** DELETE /api/cx-projects/:id → 204 (soft delete; all mutations return 400 after this) */
export const deleteCxProject = async (id) =>
  sendRequest({ url: `${CXP}/${id}`, method: "DELETE" });

// ─── CX PROJECTS — ASSETS ────────────────────────────────────────────────────

/** GET /api/cx-projects/:id/assets?page=&limit= */
export const listCxAssets = async (projectId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({
    url: `${CXP}/${projectId}/assets${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
};

/** POST /api/cx-projects/:id/assets → 201
 *  Required: abbr, name, assetType, quantity, procurementOwner (OFCI|CFCI)
 */
export const addCxAsset = async (projectId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/assets`,
    method: "POST",
    data: payload,
  });

/** PATCH /api/cx-projects/:id/assets/:assetId  (assetCatalogId cannot change) */
export const updateCxAsset = async (projectId, assetId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/assets/${assetId}`,
    method: "PATCH",
    data: payload,
  });

/** DELETE /api/cx-projects/:id/assets/:assetId → 204 */
export const removeCxAsset = async (projectId, assetId) =>
  sendRequest({
    url: `${CXP}/${projectId}/assets/${assetId}`,
    method: "DELETE",
  });

// ─── CX PROJECTS — ZONES ─────────────────────────────────────────────────────

/** GET /api/cx-projects/:id/zones?page=&limit= */
export const listCxZones = async (projectId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({
    url: `${CXP}/${projectId}/zones${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
};

/** POST /api/cx-projects/:id/zones → 201
 *  Required: name, zoneType (PUBLIC|CREW|RESTRICTED|SECURE)
 */
export const addCxZone = async (projectId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/zones`,
    method: "POST",
    data: payload,
  });

/** PATCH /api/cx-projects/:id/zones/:zoneId */
export const updateCxZone = async (projectId, zoneId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/zones/${zoneId}`,
    method: "PATCH",
    data: payload,
  });

/** DELETE /api/cx-projects/:id/zones/:zoneId → 204 */
export const removeCxZone = async (projectId, zoneId) =>
  sendRequest({ url: `${CXP}/${projectId}/zones/${zoneId}`, method: "DELETE" });

// ─── CX PROJECTS — STAKEHOLDERS ──────────────────────────────────────────────

/** GET /api/cx-projects/:id/stakeholders?page=&limit=
 *  Response includes contactId + companyId (null when not CRM-linked)
 */
export const listCxStakeholders = async (projectId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({
    url: `${CXP}/${projectId}/stakeholders${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
};

/** POST /api/cx-projects/:id/stakeholders → 201
 *  Required: name (snapshot), tier (EXEC_SPONSOR|DECISION_MAKER|INFLUENCER|KEEP_INFORMED)
 */
export const addCxStakeholder = async (projectId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/stakeholders`,
    method: "POST",
    data: payload,
  });

/** PATCH /api/cx-projects/:id/stakeholders/:sid */
export const updateCxStakeholder = async (projectId, sid, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/stakeholders/${sid}`,
    method: "PATCH",
    data: payload,
  });

/** DELETE /api/cx-projects/:id/stakeholders/:sid → 204 */
export const removeCxStakeholder = async (projectId, sid) =>
  sendRequest({
    url: `${CXP}/${projectId}/stakeholders/${sid}`,
    method: "DELETE",
  });

// ─── CX PROJECTS — COMPLIANCE RECORDS ────────────────────────────────────────

/** POST /api/cx-projects/:id/compliance → 201
 *  Required: recordType (PERMIT|INSURANCE|WORKER_CERTIFICATION), name
 */
export const addCxCompliance = async (projectId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/compliance`,
    method: "POST",
    data: payload,
  });

/** PATCH /api/cx-projects/:id/compliance/:cid */
export const updateCxCompliance = async (projectId, cid, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/compliance/${cid}`,
    method: "PATCH",
    data: payload,
  });

/** DELETE /api/cx-projects/:id/compliance/:cid → 204 */
export const removeCxCompliance = async (projectId, cid) =>
  sendRequest({
    url: `${CXP}/${projectId}/compliance/${cid}`,
    method: "DELETE",
  });

// ─── CX PROJECTS — MOBILIZATION ITEMS ────────────────────────────────────────

/**
 * GET /api/cx-projects/:id/mobilization?stepKey=mob_ppe&page=&limit=
 * stepKey: mob_site | mob_ppe | mob_supplies | mob_trailer | mob_house | mob_tools
 */
export const listCxMobilization = async (projectId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({
    url: `${CXP}/${projectId}/mobilization${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
};

/** POST /api/cx-projects/:id/mobilization → 201
 *  Required: stepKey (immutable), name, category, quantity, unitCost
 */
export const addCxMobilizationItem = async (projectId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/mobilization`,
    method: "POST",
    data: payload,
  });

/** PATCH /api/cx-projects/:id/mobilization/:mid  (stepKey cannot change) */
export const updateCxMobilizationItem = async (projectId, mid, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/mobilization/${mid}`,
    method: "PATCH",
    data: payload,
  });

/** DELETE /api/cx-projects/:id/mobilization/:mid → 204 */
export const removeCxMobilizationItem = async (projectId, mid) =>
  sendRequest({
    url: `${CXP}/${projectId}/mobilization/${mid}`,
    method: "DELETE",
  });

// ─── CX PROJECTS — TEAM MEMBERS (ProjectAssignment) ──────────────────────────

/** GET /api/cx-projects/:id/members — returns array (not paginated) */
export const listCxMembers = async (projectId) =>
  sendRequest({ url: `${CXP}/${projectId}/members`, method: "GET" });

/** POST /api/cx-projects/:id/members → 201
 *  Required: userId (valid UUID). Idempotent — updates record if userId already exists.
 */
export const addCxMember = async (projectId, payload) =>
  sendRequest({
    url: `${CXP}/${projectId}/members`,
    method: "POST",
    data: payload,
  });

/** DELETE /api/cx-projects/:id/members/:userId → 204 */
export const removeCxMember = async (projectId, userId) =>
  sendRequest({
    url: `${CXP}/${projectId}/members/${userId}`,
    method: "DELETE",
  });

// ─── CX PROJECTS — CHANGE REQUESTS ───────────────────────────────────────────

const crBase = (projectId) => `${CXP}/${projectId}/change-requests`;

/**
 * POST /api/cx-projects/:projectId/change-requests → 201
 * Required: title. code (CR-0001…) is auto-generated — do not send.
 * impactType: COST | SCHEDULE | BOTH | NONE
 */
export const createChangeRequest = async (projectId, payload) =>
  sendRequest({ url: crBase(projectId), method: "POST", data: payload });

/** GET /api/cx-projects/:projectId/change-requests?status=PENDING&page=&limit= */
export const listChangeRequests = async (projectId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return sendRequest({
    url: `${crBase(projectId)}${qs ? `?${qs}` : ""}`,
    method: "GET",
  });
};

/** GET /api/cx-projects/:projectId/change-requests/summary
 *  Returns: { counts: { PENDING, APPROVED, REJECTED, WITHDRAWN }, totalApprovedCostImpact }
 */
export const getChangeRequestSummary = async (projectId) =>
  sendRequest({ url: `${crBase(projectId)}/summary`, method: "GET" });

/** GET /api/cx-projects/:projectId/change-requests/:id */
export const getChangeRequest = async (projectId, id) =>
  sendRequest({ url: `${crBase(projectId)}/${id}`, method: "GET" });

/** PATCH /api/cx-projects/:projectId/change-requests/:id — only PENDING CRs can be updated */
export const updateChangeRequest = async (projectId, id, payload) =>
  sendRequest({
    url: `${crBase(projectId)}/${id}`,
    method: "PATCH",
    data: payload,
  });

/** PATCH /api/cx-projects/:projectId/change-requests/:id/review
 *  @param {object} payload  { decision: "APPROVED"|"REJECTED", reviewNotes? }
 *  Only PENDING CRs can be reviewed. Once approved/rejected, the CR is immutable.
 */
export const reviewChangeRequest = async (projectId, id, payload) =>
  sendRequest({
    url: `${crBase(projectId)}/${id}/review`,
    method: "PATCH",
    data: payload,
  });

/** PATCH /api/cx-projects/:projectId/change-requests/:id/withdraw — no body, PENDING only */
export const withdrawChangeRequest = async (projectId, id) =>
  sendRequest({ url: `${crBase(projectId)}/${id}/withdraw`, method: "PATCH" });

/** DELETE /api/cx-projects/:projectId/change-requests/:id → 204 */
export const deleteChangeRequest = async (projectId, id) =>
  sendRequest({ url: `${crBase(projectId)}/${id}`, method: "DELETE" });

// ─── TARF (Trade Access Request Forms)  (/api/tarfs) ─────────────────────────

/**
 * POST /api/tarfs → 201
 * Required: cxProjectId, companyName (snapshot).
 * Optional: zoneId (must belong to the same cxProjectId — validated server-side).
 */
export const createTARF = async (payload) =>
  sendRequest({ url: "/tarfs", method: "POST", data: payload });

/** GET /api/tarfs/:id — response includes zoneId (null when not set) */
export const getTARF = async (id) =>
  sendRequest({ url: `/tarfs/${id}`, method: "GET" });

/** PATCH /api/tarfs/:id — pass zoneId:null to clear zone scope */
export const updateTARF = async (id, payload) =>
  sendRequest({ url: `/tarfs/${id}`, method: "PATCH", data: payload });
