import sendRequest from "../instance/sendRequest";

// ── Phase 7 PR-9: Cross-lens orchestration ───────────────────────────────────
// Composes copilot inbox + adaptive priorities + open anomalies + active
// forecasts in one request — server-side, lens-filtered. Use for dashboards
// that flip the entire surface across PM / Exec / Field / etc.
//
// Do NOT fan out to /copilot/inbox + /prioritization/actions + /anomalies +
// /predictions when a single lens is in view — call /cross-lens/bundle.

const base = "/cross-lens";

/**
 * Returns: LensBundle {
 *   lens, cxProjectId, evaluatedAt,
 *   recommendations, priorities, anomalies, forecasts
 * }
 */
export const lensBundle = (lens, cxProjectId, limit = 10) =>
  sendRequest({
    url: `${base}/bundle`,
    method: "GET",
    params: { lens, cxProjectId, limit },
  });

/** Returns: Record<CopilotLens, LensBundle> */
export const allLenses = (cxProjectId, perLensLimit = 5) =>
  sendRequest({
    url: `${base}/all`,
    method: "GET",
    params: { cxProjectId, perLensLimit },
  });

export const LENS_LABEL = {
  pm: "Project Manager",
  exec: "Executive",
  field: "Field",
  oem: "OEM",
  safety: "Safety",
  qa: "QA",
  procurement: "Procurement",
};
