import sendRequest from "../instance/sendRequest";

/** List issues with optional filters and pagination.
 *  params: { projectId, assetId, projectAssetId, kind, status, severity,
 *            assignedToUserId, assignedToCompanyId, raisedBy, search,
 *            fromDate, toDate, page, limit }
 */
export const getIssues = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return sendRequest({ url: `/issues${query ? `?${query}` : ""}`, method: "GET" });
};

/** Get a single issue by ID.
 *  cxProjectId (optional) provides project scope for authorization on
 *  id-only routes — pass it when you know the issue's project.
 */
export const getIssueById = async (id, cxProjectId) => {
  const q = cxProjectId ? `?cxProjectId=${cxProjectId}` : "";
  return sendRequest({ url: `/issues/${id}${q}`, method: "GET" });
};

/** Create a new issue.
 *  payload: { cxProjectId?, assetId?, projectAssetId?, kind?, title,
 *             description?, severity, assignedToCompanyId?, assignedToUserId? }
 *  At least one of cxProjectId or assetId is required. projectAssetId links
 *  the issue to V2 project equipment for Playbook gate evaluation.
 */
export const createIssue = async (payload) => {
  return sendRequest({ url: `/issues`, method: "POST", data: payload });
};

/** Update issue fields (title, description, severity).
 *  Cannot update a CLOSED issue.
 */
export const updateIssue = async (id, payload) => {
  return sendRequest({ url: `/issues/${id}`, method: "PATCH", data: payload });
};

/** Delete an issue (only allowed on NEW status) */
export const deleteIssue = async (id) => {
  return sendRequest({ url: `/issues/${id}`, method: "DELETE" });
};

/**
 * Transition issue status via PATCH.
 * payload: { status: "NEW" | "IN_PROGRESS" | "READY_FOR_VERIFICATION" | "DEFERRED" }
 * Allowed transitions:
 *   NEW → IN_PROGRESS | DEFERRED
 *   IN_PROGRESS → READY_FOR_VERIFICATION | DEFERRED
 *   READY_FOR_VERIFICATION → IN_PROGRESS | DEFERRED
 *   DEFERRED → NEW | IN_PROGRESS
 * Do NOT use this to close — use verifyAndCloseIssue instead.
 */
export const changeIssueStatus = async (id, payload, cxProjectId) => {
  const q = cxProjectId ? `?cxProjectId=${cxProjectId}` : "";
  return sendRequest({ url: `/issues/${id}/status${q}`, method: "PATCH", data: payload });
};

/** Assign or reassign issue to a user and/or company via PATCH.
 *  payload: { assignedToUserId?, assignedToCompanyId? }
 *  At least one field required. Pass null to clear an assignment.
 *  Cannot assign a CLOSED issue.
 */
export const assignIssue = async (id, payload) => {
  return sendRequest({ url: `/issues/${id}/assign`, method: "PATCH", data: payload });
};

/**
 * Verify and close issue.
 * payload: { closeVerifiedBy: uuid }
 * Issue must be in READY_FOR_VERIFICATION. Sets status=CLOSED, resolvedAt, closeVerifiedBy.
 * CLOSED is terminal — no further changes allowed.
 */
export const verifyAndCloseIssue = async (id, payload, cxProjectId) => {
  const q = cxProjectId ? `?cxProjectId=${cxProjectId}` : "";
  return sendRequest({ url: `/issues/${id}/verify-close${q}`, method: "POST", data: payload });
};

/**
 * Issue.kind discriminator (PR3). Each kind reuses the standard
 * NEW → IN_PROGRESS → READY_FOR_VERIFICATION → CLOSED lifecycle but adds
 * creation-time invariants enforced server-side.
 */
export const ISSUE_KINDS = [
  "GENERAL",       // default — generic issue
  "HOLD_POINT",    // requires assignedToCompanyId
  "WITNESS_POINT", // assignment optional
  "PUNCH_LIST",    // pre-handover punch (PSSR auto-creates these)
  "NCR",           // requires non-empty description
  "SNAG",          // late-stage closeout
];

export const ISSUE_KIND_LABELS = {
  GENERAL: "General",
  HOLD_POINT: "Hold Point",
  WITNESS_POINT: "Witness Point",
  PUNCH_LIST: "Punch List",
  NCR: "NCR",
  SNAG: "Snag",
};

/** Tailwind classes per kind for chip rendering. */
export const ISSUE_KIND_COLORS = {
  GENERAL: "bg-slate-700/60 text-slate-300 border-slate-600/50",
  HOLD_POINT: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  WITNESS_POINT: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  PUNCH_LIST: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  NCR: "bg-red-500/20 text-red-300 border-red-500/30",
  SNAG: "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

// ── PR-A: NCR sub-status state machine ───────────────────────────────────────

/** Ordered NCR inner lifecycle steps. */
export const NCR_SUB_STATUSES = [
  "DRAFT",
  "UNDER_REVIEW",
  "NCR_NUMBER_ASSIGNED",
  "DISPOSITION_ISSUED",
  "CAR_OPEN",
  "READY_FOR_NCR_CLOSE",
];

export const NCR_SUB_STATUS_LABELS = {
  DRAFT: "Draft",
  UNDER_REVIEW: "Under Review",
  NCR_NUMBER_ASSIGNED: "NCR # Assigned",
  DISPOSITION_ISSUED: "Disposition Issued",
  CAR_OPEN: "CAR Open",
  READY_FOR_NCR_CLOSE: "Ready to Close",
};

/** Move NCR from DRAFT → UNDER_REVIEW */
export const beginNcrReview = async (id) =>
  sendRequest({ url: `/issues/${id}/ncr/begin-review`, method: "POST" });

/** Assign NCR number: UNDER_REVIEW → NCR_NUMBER_ASSIGNED
 *  payload: { ncrNumber: string }
 */
export const assignNcrNumber = async (id, payload) =>
  sendRequest({ url: `/issues/${id}/ncr/assign-number`, method: "PATCH", data: payload });

/** Record disposition: NCR_NUMBER_ASSIGNED → DISPOSITION_ISSUED
 *  payload: { disposition: "USE_AS_IS"|"REWORK"|"REJECT"|"REPAIR", dispositionNote?: string }
 */
export const setDisposition = async (id, payload) =>
  sendRequest({ url: `/issues/${id}/ncr/set-disposition`, method: "POST", data: payload });

/** Issue CAR: DISPOSITION_ISSUED → CAR_OPEN
 *  payload: { carNumber: string, carDueDate: ISO8601 }
 */
export const issueCar = async (id, payload) =>
  sendRequest({ url: `/issues/${id}/ncr/issue-car`, method: "POST", data: payload });

/** Mark CAR resolved, ready for final NCR close: CAR_OPEN → READY_FOR_NCR_CLOSE */
export const readyNcrForVerification = async (id) =>
  sendRequest({ url: `/issues/${id}/ncr/ready-close`, method: "POST" });

// ── PR-A: Hold Point / Witness Point coordination ────────────────────────────

/** Set or update scheduled inspection date.
 *  payload: { scheduledAt: ISO8601 }
 */
export const updateHoldPointSchedule = async (id, payload) =>
  sendRequest({ url: `/issues/${id}/hold-point/schedule`, method: "PATCH", data: payload });

/** Send notification to notifyCompanyId that hold point is ready for inspection. */
export const notifyHoldPoint = async (id) =>
  sendRequest({ url: `/issues/${id}/hold-point/notify`, method: "POST" });

/** Record inspection complete and release hold.
 *  payload: { completedNote?: string }
 */
export const completeHoldPoint = async (id, payload = {}) =>
  sendRequest({ url: `/issues/${id}/hold-point/complete`, method: "POST", data: payload });
