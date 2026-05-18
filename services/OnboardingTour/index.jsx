import sendRequest from "../instance/sendRequest";

// ── Phase v15 Batch B10: 19-step onboarding tour ────────────────────────────
// start() is idempotent — calling on a user who already started returns the
// existing row. advance(N) marks step N complete and moves cursor to N+1.
// Step 19 = COMPLETED. Never advance(currentStep + k) for k > 1.

const base = "/onboarding/tour";

export const startTour = () =>
  sendRequest({
    url: `${base}/start`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const getMyTour = () =>
  sendRequest({ url: `${base}/me`, method: "GET" });

export const advanceTour = (step) =>
  sendRequest({
    url: `${base}/advance`,
    method: "POST",
    data: { step },
    mutationId: true,
  });

export const skipTour = () =>
  sendRequest({
    url: `${base}/skip`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const restartTour = () =>
  sendRequest({
    url: `${base}/restart`,
    method: "POST",
    data: {},
    mutationId: true,
  });

export const TOUR_STATUSES = [
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "ABANDONED",
];
