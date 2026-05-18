"use client";

// Cx Score · Executive Dashboard
// Mirrors cxcontrol_v2.html renderCxScore():
// - Big circular grade badge with score + letter
// - 4 weighted breakdown bars (35/30/25/10)
// - "Snapshot now" + "Show trend" actions
// - Inputs explanation tooltip-style card

import { useEffect, useState } from "react";
import {
  getCxScoreCurrent,
  computeCxScoreLive,
  snapshotCxScore,
  getCxScoreTrend,
  GRADE_CLASSES,
} from "@/services/CxScore";

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  brand: "#1e40af",
  brandH: "#1e3a8a",
  brandFade: "#eff6ff",
  brandSoft: "#dbeafe",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#f59e0b",
  bgSoft: "#f1f5f9",
};

// Mirrors HTML cxScoreGrade(): A=90+, B=80+, C=70+, D=60+, F<60
const GRADE_DETAILS = {
  A: { color: "#16a34a", label: "Excellent" },
  B: { color: "#65a30d", label: "Good" },
  C: { color: "#ca8a04", label: "Fair" },
  D: { color: "#ea580c", label: "Needs Work" },
  F: { color: "#dc2626", label: "At Risk" },
};

const Toast = ({ message, onClose }) =>
  message ? (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 100,
        padding: "10px 16px",
        borderRadius: 8,
        background: message.type === "error" ? C.red : C.brand,
        color: "#fff",
        fontSize: 13,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        cursor: "pointer",
        maxWidth: 420,
      }}
    >
      {message.text}
    </div>
  ) : null;

export default function CxScoreDashboard({ projectId }) {
  const [score, setScore] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const reload = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [cur, tr] = await Promise.all([
        getCxScoreCurrent(projectId),
        getCxScoreTrend(projectId, { limit: 90 }).catch(() => []),
      ]);
      setScore(cur);
      setTrend(tr ?? []);
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to load score" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!projectId) {
    return (
      <div
        style={{
          background: C.bg,
          minHeight: "100vh",
          padding: 24,
          textAlign: "center",
          color: C.textMuted,
        }}
      >
        Select a project to see its Commissioning Score.
      </div>
    );
  }

  if (loading || !score) {
    return (
      <div
        style={{
          background: C.bg,
          minHeight: "100vh",
          padding: 24,
          textAlign: "center",
          color: C.textMuted,
        }}
      >
        Loading Commissioning Score…
      </div>
    );
  }

  const grade = GRADE_DETAILS[score.grade] ?? GRADE_DETAILS.F;

  const onSnapshot = async () => {
    setBusy(true);
    try {
      await snapshotCxScore(projectId);
      setToast({ type: "ok", text: "Snapshot saved for today" });
      reload();
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to snapshot" });
    } finally {
      setBusy(false);
    }
  };

  const onLive = async () => {
    setBusy(true);
    try {
      const live = await computeCxScoreLive(projectId);
      setScore(live);
      setToast({ type: "ok", text: "Live compute (not persisted)" });
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: C.text,
      }}
    >
      <Toast message={toast} onClose={() => setToast(null)} />

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h1
            style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}
          >
            Commissioning Score · Executive Dashboard
          </h1>
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            Weighted composite score: 35% checklists + 30% tests + 25% asset
            stage + 10% PSSR inspections. Computed at {fmt(score.computedAt)}.
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onLive} disabled={busy} style={btnSoft}>
            {busy ? "…" : "↻ Live recompute"}
          </button>
          <button onClick={onSnapshot} disabled={busy} style={btnPri}>
            {busy ? "…" : "Snapshot now"}
          </button>
        </div>
      </div>

      {/* Score block — big circle + breakdown */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 24,
          marginBottom: 18,
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 32,
          alignItems: "center",
        }}
      >
        {/* Score circle */}
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: `8px solid ${grade.color}`,
            color: grade.color,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: C.surface,
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1 }}>
            {score.overallScore}
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginTop: 6,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {score.grade} · {grade.label}
          </div>
        </div>

        {/* Breakdown */}
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.textMuted,
            }}
          >
            Score breakdown · weighted average
          </div>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <Bar label="Checklists" pct={score.checklistScore} weight="0.35" />
            <Bar label="Test results" pct={score.testScore} weight="0.30" />
            <Bar label="Asset stage" pct={score.assetScore} weight="0.25" />
            <Bar
              label="PSSR / inspections"
              pct={score.inspectionScore}
              weight="0.10"
            />
          </div>
        </div>
      </div>

      {/* Inputs / explainability */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.textMuted,
            marginBottom: 12,
          }}
        >
          What counts
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          <Fact
            label="Checklists"
            value={`${score.inputs.checklists.completedItems} / ${score.inputs.checklists.totalItems}`}
            sub={`${score.inputs.checklists.totalChecklists} checklist${score.inputs.checklists.totalChecklists === 1 ? "" : "s"}`}
          />
          <Fact
            label="Tests"
            value={`${score.inputs.tests.witnessedPass} / ${score.inputs.tests.totalNonPending}`}
            sub="witnessed PASS / non-pending"
          />
          <Fact
            label="Assets"
            value={
              score.inputs.assets.total === 0
                ? "—"
                : `${(
                    (score.inputs.assets.sumStageFraction /
                      score.inputs.assets.total) *
                    100
                  ).toFixed(0)}%`
            }
            sub={`${score.inputs.assets.total} asset${score.inputs.assets.total === 1 ? "" : "s"}`}
          />
          <Fact
            label="Inspections"
            value={`${score.inputs.inspections.signed} / ${score.inputs.inspections.total}`}
            sub="signed PSSRs"
          />
        </div>
      </div>

      {/* Trend */}
      {trend.length > 1 && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: 18,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: C.textMuted,
              marginBottom: 12,
            }}
          >
            Trend · last {trend.length} snapshot{trend.length === 1 ? "" : "s"}
          </div>
          <Sparkline data={trend} />
        </div>
      )}
    </div>
  );
}

function Bar({ label, pct, weight }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "150px 1fr 50px 50px",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 12, color: C.textSoft }}>{label}</span>
      <div
        style={{
          height: 10,
          background: C.bgSoft,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: C.brand,
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          fontWeight: 700,
          textAlign: "right",
        }}
      >
        {pct}%
      </span>
      <span
        style={{
          fontSize: 10,
          color: C.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
          textAlign: "right",
        }}
      >
        ×{weight}
      </span>
    </div>
  );
}

function Fact({ label, value, sub }) {
  return (
    <div
      style={{
        background: C.bgSoft,
        border: `1px solid ${C.border}`,
        padding: 12,
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: C.textMuted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginTop: 4,
          color: C.brandH,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>
        {sub}
      </div>
    </div>
  );
}

// Minimal SVG sparkline of overallScore vs snapshotDate
function Sparkline({ data }) {
  const w = 720;
  const h = 80;
  const pad = 8;
  const xs = data.map(
    (_, i) => pad + (i * (w - 2 * pad)) / Math.max(1, data.length - 1),
  );
  const ys = data.map((d) => {
    const v = d.overallScore ?? 0;
    return h - pad - (v / 100) * (h - 2 * pad);
  });
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`)
    .join(" ");
  const last = data[data.length - 1];
  return (
    <div>
      <svg
        width="100%"
        viewBox={`0 0 ${w} ${h + 24}`}
        style={{ display: "block" }}
      >
        {/* Y reference at 60 (D threshold) and 80 (B threshold) */}
        {[60, 80].map((y) => {
          const yp = h - pad - (y / 100) * (h - 2 * pad);
          return (
            <line
              key={y}
              x1={pad}
              x2={w - pad}
              y1={yp}
              y2={yp}
              stroke={C.border}
              strokeDasharray="2 4"
            />
          );
        })}
        <path d={path} stroke={C.brand} strokeWidth={2} fill="none" />
        {xs.map((x, i) => (
          <circle key={i} cx={x} cy={ys[i]} r={2.5} fill={C.brand} />
        ))}
        <text x={pad} y={h + 16} fontSize={10} fill={C.textMuted}>
          {fmt(data[0]?.snapshotDate)}
        </text>
        <text
          x={w - pad}
          y={h + 16}
          fontSize={10}
          fill={C.textMuted}
          textAnchor="end"
        >
          {fmt(last?.snapshotDate)} · {last?.overallScore} ({last?.grade})
        </text>
      </svg>
    </div>
  );
}

const fmt = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const btnPri = {
  background: C.brand,
  color: "#fff",
  padding: "8px 14px",
  borderRadius: 8,
  border: 0,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const btnSoft = {
  background: C.brandFade,
  color: C.brandH,
  padding: "8px 14px",
  borderRadius: 8,
  border: `1px solid ${C.brandSoft}`,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
