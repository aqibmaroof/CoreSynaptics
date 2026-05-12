import sendRequest from "../instance/sendRequest";

// ── Phase 4 PR-9: Analytics ───────────────────────────────────────────────────
// All endpoints server-cached 30 minutes. Stop computing trends client-side.

const root = (id) => `/analytics/cx-projects/${id}`;

/** CX score trend — { points: [{ date, score, grade }] } */
export const getCxScoreTrend = (id, days = 30) =>
  sendRequest({ url: `${root(id)}/cx-score-trend`, method: "GET", params: { days } });

/** Readiness % trend — { points: [{ date, value }] } */
export const getReadinessTrend = (id, days = 30) =>
  sendRequest({ url: `${root(id)}/readiness-trend`, method: "GET", params: { days } });

/** Delay trend (cumulative slip days) — { points: [{ date, value }] } */
export const getDelayTrend = (id, days = 90) =>
  sendRequest({ url: `${root(id)}/delay-trend`, method: "GET", params: { days } });

/** Turnover forecast — { readinessPct, trendingTowardTurnoverDays: number|null } */
export const getTurnoverForecast = (id) =>
  sendRequest({ url: `${root(id)}/turnover-forecast`, method: "GET" });

/** Workforce forecast — { activeCrew, expiringWithin60d, expired } */
export const getWorkforceForecast = (id) =>
  sendRequest({ url: `${root(id)}/workforce-forecast`, method: "GET" });

/** Procurement forecast — { onSchedule, atRisk, delivered } */
export const getProcurementForecast = (id) =>
  sendRequest({ url: `${root(id)}/procurement-forecast`, method: "GET" });

/** Risk heat — { byBand: { low, medium, high, extreme } } */
export const getRiskHeat = (id) =>
  sendRequest({ url: `${root(id)}/risk-heat`, method: "GET" });

/** Bottleneck analysis — { byCategory: [{ category, events24h, criticalEvents24h }] } */
export const getBottleneckAnalysis = (id) =>
  sendRequest({ url: `${root(id)}/bottlenecks`, method: "GET" });
