import sendRequest from "../instance/sendRequest";

// ── PR-E: My-work inbox aggregate ─────────────────────────────────────────────
// Single endpoint replaces the multi-call fan-out pattern (Tasks + generic Tasks
// fetched separately) used in the MyAssignments container.

/** Fetch the caller's unified work inbox.
 *  Returns: {
 *    tasks: Task[],          // assigned platform tasks
 *    genericTasks: Task[],   // ad-hoc / checklist-linked tasks
 *    dueThisWeek: Task[],    // pre-filtered convenience list
 *    overdue: Task[],
 *    openIssues: Issue[],    // issues assigned to me
 *    checklistItems: ChecklistItem[]  // open items on my checklists
 *  }
 *  params: { projectId? }   // scope to a single project
 */
export const getMyWork = async (params = {}) => {
  try {
    const data = await sendRequest({ url: "/me/work", method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Get caller's profile (name, role, orgId, avatarUrl). */
export const getMyProfile = async () => {
  try {
    const data = await sendRequest({ url: "/me/profile", method: "GET" });
    return data;
  } catch (error) {
    throw error;
  }
};

/** Update caller's notification preferences.
 *  payload: { emailDigest?: boolean, pushEnabled?: boolean, digestFrequency?: "DAILY"|"WEEKLY" }
 */
export const updateMyNotificationPrefs = async (payload) => {
  try {
    const data = await sendRequest({ url: "/me/notification-prefs", method: "PATCH", data: payload });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Phase 3: Next-Action Engine (PR-6) ───────────────────────────────────────

/** Ranked personal queue across tasks, issues, PSSRs.
 *  Supersedes getMyWork for the inbox UI. getMyWork stays intact for callers
 *  that need the raw breakdown (sidebar badges, etc.).
 *  Returns: NextActionResponse
 *  { totalActions, actions: NextAction[] }
 *  actions are pre-sorted by rankScore DESC — do NOT re-sort client-side.
 *  Each action: { id, source, title, cxProjectId, priority, rankScore, dueDate, reason }
 *  source: "TASK" | "GENERIC_TASK" | "ISSUE_ASSIGNED" | "ISSUE_RAISED" | "PSSR_PENDING"
 */
export const getMyNextActions = async (params = {}) => {
  try {
    const data = await sendRequest({ url: "/me/next-actions", method: "GET", params });
    return data;
  } catch (error) {
    throw error;
  }
};

// ── Phase 4 PR-8: Command-center ─────────────────────────────────────────────

/**
 * Single call replaces per-role dashboard fan-out.
 * Backend resolves caller's lens from active role; pass `lens` to override.
 * params: { cxProjectId?: string, lens?: string }
 * Returns: CommandCenterProjection { lens, cxProjectId, generatedAt, kpis[], extras }
 * kpis[]: { label, value, delta?, unit?, tone? }
 */
export const getMyCommandCenter = async (params = {}) => {
  try {
    return await sendRequest({ url: "/me/command-center", method: "GET", params });
  } catch (error) {
    throw error;
  }
};

// ── Phase 4 PR-3: Personal feed ───────────────────────────────────────────────

/**
 * Caller's cross-project operational feed.
 * params: { limit?, cursor? }
 * Returns: { entries: FeedEntry[], nextCursor: string|null }
 */
export const getMyFeed = async (params = {}) => {
  try {
    return await sendRequest({ url: "/me/feed", method: "GET", params });
  } catch (error) {
    throw error;
  }
};
