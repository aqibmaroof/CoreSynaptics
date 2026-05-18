import sendRequest from "../instance/sendRequest";

// ── Phase 4 PR-3: Operational Feed ───────────────────────────────────────────
// One OperationalEvent per emission of ~30 existing domain events.
// Replaces ad-hoc activity feeds and AuditLog reads in the dashboard.

/**
 * Paginated project-scoped feed.
 * params: { limit?, cursor?, category?, severity? }
 *   category: "QA"|"PROCUREMENT"|"WORKFORCE"|"COMMS"|"SCHEDULE"|"TURNOVER"|"SCORE"|"PHASE"|"ESCALATION"|"SAFETY"
 *   severity: "INFO"|"WARN"|"CRITICAL"
 * Returns: { entries: FeedEntry[], nextCursor: string|null }
 * entries are cursor-paginated newest-first — pass nextCursor as ?cursor= for older pages.
 */
export const getProjectFeed = async (cxProjectId, params = {}) => {
  try {
    return await sendRequest({
      url: `/cx-projects/${cxProjectId}/feed`,
      method: "GET",
      params,
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Acknowledge a single feed entry (marks acknowledgedByMe = true).
 * Returns: { acknowledged: boolean }
 */
export const acknowledgeFeedEntry = async (opEventId) => {
  try {
    return await sendRequest({ url: `/feed/${opEventId}/ack`, method: "POST" });
  } catch (error) {
    throw error;
  }
};

// ── Severity style helpers ────────────────────────────────────────────────────
// Use these to drive badge color — do NOT compute severity client-side.

export const FEED_SEVERITY_STYLE = {
  CRITICAL: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.12)", dot: "var(--rf-red)" },
  WARN:     { color: "var(--rf-yellow)", bg: "rgba(245,158,11,0.10)", dot: "var(--rf-yellow)" },
  INFO:     { color: "var(--rf-txt3)", bg: "var(--rf-bg3)", dot: "var(--rf-txt3)" },
};

export const FEED_CATEGORY_ICON = {
  QA:          "",
  PROCUREMENT: "",
  WORKFORCE:   "",
  COMMS:       "",
  SCHEDULE:    "",
  TURNOVER:    "",
  SCORE:       "",
  PHASE:       "",
  ESCALATION:  "",
  SAFETY:      "",
};
