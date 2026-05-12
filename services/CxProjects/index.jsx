import sendRequest from "../instance/sendRequest";

// ── Core CRUD ────────────────────────────────────────────────────────────────

export const getCxProjects = async (params = {}) => {
  try {
    const data = await sendRequest({ url: "/cx-projects", method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const getCxProjectById = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProject = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectStatus = async (id, status) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/status`, method: "PATCH", data: { status } });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProject = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Assets ───────────────────────────────────────────────────────────────────

export const getCxProjectAssets = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectAsset = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectAsset = async (id, assetId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets/${assetId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectAsset = async (id, assetId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/assets/${assetId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Zones ────────────────────────────────────────────────────────────────────

export const getCxProjectZones = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectZone = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectZone = async (id, zoneId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones/${zoneId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectZone = async (id, zoneId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/zones/${zoneId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Stakeholders ─────────────────────────────────────────────────────────────

export const getCxProjectStakeholders = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectStakeholder = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectStakeholder = async (id, sid, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders/${sid}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectStakeholder = async (id, sid) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/stakeholders/${sid}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Compliance ───────────────────────────────────────────────────────────────

export const createCxProjectCompliance = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/compliance`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectCompliance = async (id, cid, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/compliance/${cid}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectCompliance = async (id, cid) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/compliance/${cid}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Mobilization ─────────────────────────────────────────────────────────────

export const getCxProjectMobilization = async (id, params = {}) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization`, method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectMobilizationItem = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectMobilizationItem = async (id, mid, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization/${mid}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectMobilizationItem = async (id, mid) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/mobilization/${mid}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Workflows ────────────────────────────────────────────────────────────────

export const getCxProjectWorkflows = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectWorkflow = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectWorkflow = async (id, workflowId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows/${workflowId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectWorkflow = async (id, workflowId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/workflows/${workflowId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── SOPs ─────────────────────────────────────────────────────────────────────

export const getCxProjectSops = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectSop = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectSop = async (id, sopId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops/${sopId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectSop = async (id, sopId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/sops/${sopId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Partners ─────────────────────────────────────────────────────────────────

export const getCxProjectPartners = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const createCxProjectPartner = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateCxProjectPartner = async (id, partnerId, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners/${partnerId}`, method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const deleteCxProjectPartner = async (id, partnerId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/partners/${partnerId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Members ──────────────────────────────────────────────────────────────────

export const getCxProjectMembers = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/members`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

export const addCxProjectMember = async (id, payload) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/members`, method: "POST", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

export const removeCxProjectMember = async (id, userId) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/members/${userId}`, method: "DELETE" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── PR-D: CxProject Master Log + Turnover Readiness ──────────────────────────

/** Fetch the asset × phase commissioning matrix for a project.
 *  Returns: { assets: [...], phases: [...], matrix: { [assetId]: { [phase]: "NOT_STARTED"|"IN_PROGRESS"|"COMPLETE"|"WAIVED" } } }
 */
export const getMasterLog = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/master-log`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Fetch turnover readiness checks for a project.
 *  Returns: { overallPct: number, checks: [{ id, label, status, blockerCount }] }
 *  The "Generate package" button should be gated on overallPct === 100.
 */
export const getTurnoverReadiness = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/turnover-readiness`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Kick off async turnover package generation.
 *  Returns: { packageJobId: uuid } — poll GET /cx-projects/:id/turnover-readiness for completion.
 *  Only callable when overallPct === 100.
 */
export const generateTurnoverPackage = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/turnover-package`, method: "POST" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── PR-E: Dashboard digest ────────────────────────────────────────────────────

/** Single-call project dashboard aggregate — replaces multi-call fan-out.
 *  Returns: { kpis, phaseProgress, recentActivity, openIssueCount,
 *             procurementAlerts, upcomingMilestones, teamSummary }
 */
export const getProjectDashboard = async (id) => {
  try {
    const data = await sendRequest({ url: `/cx-projects/${id}/dashboard`, method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Phase 3: Readiness Engine (PR-2) ─────────────────────────────────────────

/** Asset × phase readiness matrix.
 *  Returns: AssetReadinessResponse
 *  { phases: CommissioningPhase[], assets: AssetReadinessRow[] }
 *  Each row has cells coloured by status: NO_WORK | PLANNED | IN_PROGRESS | READY | BLOCKED
 */
export const getAssetReadiness = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/readiness/asset`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** Phase-gate readiness + asset blocker rollup.
 *  Returns: PhaseReadinessResponse
 *  { currentPhase, targetPhase, canAdvance, blockingConditions[], advisoryConditions[], blockingAssets[] }
 */
export const getPhaseReadiness = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/readiness/phase`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

/** Turnover progression + per-check blocker hints.
 *  Supersedes getTurnoverReadiness from PR-D. Shape is a superset.
 *  Returns: TurnoverProgressionResponse
 *  { readinessPct, passingChecks, totalChecks, isReady, checks[] }
 *  Each check has blockingHint (human-readable reason, null when passing).
 */
export const getTurnoverProgression = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/readiness/turnover`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

// ── Phase 3: Dependency Engine (PR-3) ────────────────────────────────────────

/** Dependency graph: phase backbone + asset nodes + blocker nodes.
 *  Returns: ProjectDependencyResponse
 *  { graph: { nodes[], edges[] }, summary: { blockedAssetCount, openHoldPointCount, ... } }
 *  Node id format is stable: "<kind>:<uuid>" — safe to use as React keys.
 */
export const getProjectDependencies = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/dependencies`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

// ── Phase 3: Operational Health (PR-4) ───────────────────────────────────────

/** Composite GREEN/AMBER/RED health band with rationale.
 *  Returns: OperationalHealthResponse
 *  { band, cxScore, readinessPct, openCriticalIssues, activeEscalations, rationale[] }
 *  Replaces client-side health-band computation — this is the server-authoritative source.
 */
export const getProjectHealth = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/health`, method: "GET" });
  } catch (error) {
    throw error;
  }
};

// ── Phase 3: Portfolio (PR-6) ─────────────────────────────────────────────────

/** All CxProjects accessible to the caller's org with health band + top concern.
 *  Returns: PortfolioResponse
 *  { totalProjects, byBand: { GREEN, AMBER, RED, UNKNOWN }, projects: PortfolioProject[] }
 *  Each PortfolioProject has: cxScore, grade, band, topConcern, openCriticalIssues, etc.
 */
export const getPortfolio = async (params = {}) => {
  try {
    return await sendRequest({ url: "/portfolio", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

// ── Phase 4 PR-6: Timeline + QA orchestration ─────────────────────────────────

/** Full project timeline (phases, milestones, procurement, blockers) — server-cached 60s. */
export const getProjectTimeline = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/timeline`, method: "GET" });
  } catch (error) { throw error; }
};

/** Critical-path readiness — satisfied/blocked per L1–IST phase gate. */
export const getCriticalPath = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/critical-path`, method: "GET" });
  } catch (error) { throw error; }
};

/** Delay projection — late items + cumulative project slip days. */
export const getDelayProjection = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/delay-projection`, method: "GET" });
  } catch (error) { throw error; }
};

/** QA overview — NCR / holdPoint / witnessPoint / punchList / snag / tests / PSSR counts. */
export const getQaOverview = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/qa/overview`, method: "GET" });
  } catch (error) { throw error; }
};

/** QA bottlenecks — per-kind oldest-open + count. */
export const getQaBottlenecks = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/qa/bottlenecks`, method: "GET" });
  } catch (error) { throw error; }
};

/** Hold & witness point schedule — all open items with notify party + dates. */
export const getHoldWitnessSchedule = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/qa/hold-witness-schedule`, method: "GET" });
  } catch (error) { throw error; }
};

// ── Phase 4 PR-7: Workforce + dispatch ───────────────────────────────────────

/** Long-lead item overview KPI strip for a project. */
export const getLongLeadOverview = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/long-lead/overview`, method: "GET" });
  } catch (error) { throw error; }
};

/** Workforce readiness snapshot — cert status per crew member. */
export const getWorkforceReadiness = async (id) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/workforce-readiness`, method: "GET" });
  } catch (error) { throw error; }
};

/** Crew dispatch roster for a given ISO date (YYYY-MM-DD). */
export const getDispatchForDay = async (id, dateIso) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/dispatch`, method: "GET", params: { date: dateIso } });
  } catch (error) { throw error; }
};

/** Assign a crew member to a shift.
 *  body: { crewMemberId, shiftDate, shiftStart, shiftEnd, task, assetCode?, location? }
 *  Returns: { id, conflict, conflictingAssignmentId? }
 */
export const assignShift = async (id, body) => {
  try {
    return await sendRequest({ url: `/cx-projects/${id}/dispatch/shifts`, method: "POST", data: body });
  } catch (error) { throw error; }
};

// ── Phase 4 PR-8: Command-center projections ──────────────────────────────────

/** Per-project lens projection — replaces per-role dashboard fan-out. */
export const getLensProjection = async (cxProjectId, lens) => {
  try {
    return await sendRequest({ url: `/cx-projects/${cxProjectId}/command-center/${lens}`, method: "GET" });
  } catch (error) { throw error; }
};
