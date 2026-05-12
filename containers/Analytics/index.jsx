"use client";

import { useState, useEffect } from "react";
import {
  getCxScoreTrend,
  getReadinessTrend,
  getDelayTrend,
  getTurnoverForecast,
  getWorkforceForecast,
  getProcurementForecast,
  getRiskHeat,
  getBottleneckAnalysis,
} from "@/services/Analytics";

// ─── Mock data ────────────────────────────────────────────────────────────────

const mkDays = (n, fn) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return { date: d.toISOString().slice(0, 10), ...fn(i) };
  });

const MOCK = {
  cxScoreTrend:  { points: mkDays(30, (i) => ({ score: 55 + Math.round(Math.sin(i / 4) * 8 + i * 0.8), grade: i < 10 ? "C" : i < 20 ? "C+" : "B" })) },
  readinessTrend: { points: mkDays(30, (i) => ({ value: 40 + Math.round(i * 1.7) })) },
  delayTrend:     { points: mkDays(90, (i) => ({ value: i < 45 ? 0 : Math.round((i - 45) * 0.4) })) },
  turnoverForecast: { readinessPct: 67, trendingTowardTurnoverDays: 42 },
  workforceForecast: { activeCrew: 24, expiringWithin60d: 3, expired: 1 },
  procurementForecast: { onSchedule: 11, atRisk: 3, delivered: 7 },
  riskHeat: { byBand: { low: 8, medium: 5, high: 3, extreme: 1 } },
  bottlenecks: { byCategory: [
    { category: "QA", events24h: 12, criticalEvents24h: 3 },
    { category: "PROCUREMENT", events24h: 7, criticalEvents24h: 1 },
    { category: "WORKFORCE", events24h: 4, criticalEvents24h: 0 },
    { category: "SCHEDULE", events24h: 6, criticalEvents24h: 2 },
    { category: "COMMS", events24h: 3, criticalEvents24h: 0 },
  ]},
};

// ─── Constants ────────────────────────────────────────────────────────────────

const RISK_COLOR = {
  extreme: "var(--rf-red)",
  high:    "var(--rf-yellow)",
  medium:  "#f97316",
  low:     "var(--rf-green)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 12, padding: "16px 20px", flex: "1 1 140px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "var(--rf-txt)", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Sparkline({ points, colorKey = "value", height = 56, valueKey = "value" }) {
  if (!points?.length) return <div style={{ height, background: "var(--rf-bg3)", borderRadius: 6 }} />;
  const values = points.map((p) => p[valueKey] ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 320;
  const step = w / (points.length - 1);
  const pts = points.map((p, i) => {
    const x = i * step;
    const y = height - ((( p[valueKey] ?? 0) - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });
  const lastVal = values[values.length - 1];
  const color = lastVal >= max * 0.8 ? "var(--rf-green)" : lastVal <= max * 0.4 ? "var(--rf-red)" : "var(--rf-accent)";

  return (
    <div style={{ position: "relative" }}>
      <svg width="100%" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", top: 4, right: 0, fontSize: 12, fontWeight: 700, color }}>{lastVal}</div>
    </div>
  );
}

function ChartCard({ title, children, sub }) {
  return (
    <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: "18px 20px", flex: "1 1 280px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--rf-txt)", marginBottom: 4 }}>{title}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginBottom: 10 }}>{sub}</div>}
      {children}
    </div>
  );
}

function BottleneckBar({ category, events24h, criticalEvents24h }) {
  const maxBars = 20;
  const pct = Math.min(100, (events24h / maxBars) * 100);
  const critPct = events24h > 0 ? (criticalEvents24h / events24h) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--rf-txt2)" }}>{category}</span>
        <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
          {events24h} events
          {criticalEvents24h > 0 && <span style={{ color: "var(--rf-red)", fontWeight: 700, marginLeft: 4 }}>· {criticalEvents24h} critical</span>}
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: "var(--rf-bg3)", overflow: "hidden" }}>
        <div style={{ display: "flex", height: "100%", width: `${pct}%` }}>
          <div style={{ flex: 100 - critPct, background: "var(--rf-accent)", borderRadius: "99px 0 0 99px" }} />
          {criticalEvents24h > 0 && <div style={{ flex: critPct, background: "var(--rf-red)", borderRadius: "0 99px 99px 0" }} />}
        </div>
      </div>
    </div>
  );
}

// ─── Main container ───────────────────────────────────────────────────────────

export default function Analytics() {
  const [projectId] = useState("p1");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const results = await Promise.allSettled([
        getCxScoreTrend(projectId, 30),
        getReadinessTrend(projectId, 30),
        getDelayTrend(projectId, 90),
        getTurnoverForecast(projectId),
        getWorkforceForecast(projectId),
        getProcurementForecast(projectId),
        getRiskHeat(projectId),
        getBottleneckAnalysis(projectId),
      ]);
      const [cxScore, readiness, delay, turnover, workforce, procurement, risk, bottlenecks] = results;
      setData({
        cxScoreTrend:       cxScore.status === "fulfilled" && cxScore.value ? cxScore.value : MOCK.cxScoreTrend,
        readinessTrend:     readiness.status === "fulfilled" && readiness.value ? readiness.value : MOCK.readinessTrend,
        delayTrend:         delay.status === "fulfilled" && delay.value ? delay.value : MOCK.delayTrend,
        turnoverForecast:   turnover.status === "fulfilled" && turnover.value ? turnover.value : MOCK.turnoverForecast,
        workforceForecast:  workforce.status === "fulfilled" && workforce.value ? workforce.value : MOCK.workforceForecast,
        procurementForecast: procurement.status === "fulfilled" && procurement.value ? procurement.value : MOCK.procurementForecast,
        riskHeat:           risk.status === "fulfilled" && risk.value ? risk.value : MOCK.riskHeat,
        bottlenecks:        bottlenecks.status === "fulfilled" && bottlenecks.value ? bottlenecks.value : MOCK.bottlenecks,
      });
      setLoading(false);
    })();
  }, [projectId]);

  const tf = data.turnoverForecast || MOCK.turnoverForecast;
  const wf = data.workforceForecast || MOCK.workforceForecast;
  const pf = data.procurementForecast || MOCK.procurementForecast;
  const rh = data.riskHeat?.byBand || MOCK.riskHeat.byBand;
  const bn = data.bottlenecks?.byCategory || MOCK.bottlenecks.byCategory;

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--rf-txt)" }}>Analytics</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}>
          Server-computed trends and forecasts · cached 30 min
        </p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiCard label="Turnover Readiness" value={`${tf.readinessPct}%`} sub={tf.trendingTowardTurnoverDays ? `~${tf.trendingTowardTurnoverDays}d to turnover` : "Forecast pending"} color={tf.readinessPct >= 80 ? "var(--rf-green)" : tf.readinessPct >= 60 ? "var(--rf-yellow)" : "var(--rf-red)"} />
        <KpiCard label="Active Crew" value={wf.activeCrew} sub={wf.expired > 0 ? `${wf.expired} expired cert` : "All certs current"} color={wf.expired > 0 ? "var(--rf-red)" : "var(--rf-txt)"} />
        <KpiCard label="Procurement On Track" value={pf.onSchedule} sub={`${pf.atRisk} at risk · ${pf.delivered} delivered`} color={pf.atRisk > 0 ? "var(--rf-yellow)" : "var(--rf-green)"} />
        <KpiCard label="Risk Extreme" value={rh.extreme} sub={`${rh.high} high · ${rh.medium} medium · ${rh.low} low`} color={rh.extreme > 0 ? "var(--rf-red)" : "var(--rf-txt3)"} />
      </div>

      {/* Trend charts row */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <ChartCard title="CX Score Trend" sub="30-day rolling score">
          <Sparkline points={data.cxScoreTrend?.points} valueKey="score" />
        </ChartCard>
        <ChartCard title="Readiness %" sub="30-day readiness progression">
          <Sparkline points={data.readinessTrend?.points} />
        </ChartCard>
        <ChartCard title="Cumulative Delay" sub="90-day slip days accumulation">
          <Sparkline points={data.delayTrend?.points} />
        </ChartCard>
      </div>

      {/* Risk heat + bottlenecks */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: "18px 20px", flex: "1 1 240px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--rf-txt)", marginBottom: 14 }}>Risk Heat</div>
          {Object.entries(rh).map(([band, count]) => (
            <div key={band} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: RISK_COLOR[band], flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 12, color: "var(--rf-txt2)", textTransform: "capitalize" }}>{band}</div>
              <div style={{ width: `${Math.min(160, count * 16)}px`, height: 6, borderRadius: 99, background: RISK_COLOR[band], opacity: 0.7 }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: RISK_COLOR[band], minWidth: 20, textAlign: "right" }}>{count}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: "18px 20px", flex: "2 1 400px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--rf-txt)", marginBottom: 4 }}>Bottleneck Analysis</div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginBottom: 14 }}>Events in last 24 h by category</div>
          {bn.map((b) => <BottleneckBar key={b.category} {...b} />)}
        </div>
      </div>
    </div>
  );
}
