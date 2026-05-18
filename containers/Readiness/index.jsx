"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getAssetReadiness,
  getPhaseReadiness,
  getTurnoverProgression,
} from "@/services/CxProjects";

// ── Mock projects (matches Layout project switcher) ───────────────────────────
const MOCK_PROJECTS = [
  { id: "cx-p1", code: "MSFT-DC1", name: "Microsoft Atlanta Expansion" },
  { id: "cx-p2", code: "QTS-IRV-3", name: "QTS Irving Phase 3" },
  { id: "cx-p3", code: "CRWV-CHI", name: "CoreWeave Chicago Build" },
  { id: "cx-p4", code: "CRS0-RN0", name: "Crusoe Reno Pod-1" },
  { id: "cx-p5", code: "GLXY-DAL", name: "Galaxy Dallas Hyperscale" },
];

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_ASSET_READINESS = {
  phases: ["PRE_CX", "L1", "L2", "L3", "L4", "IST"],
  assets: [
    {
      id: "a1", assetCode: "UPS-01", name: "UPS Module A",
      cells: { PRE_CX: "READY", L1: "READY", L2: "IN_PROGRESS", L3: "PLANNED", L4: "NO_WORK", IST: "NO_WORK" },
    },
    {
      id: "a2", assetCode: "CRAC-01", name: "CRAC Unit 1",
      cells: { PRE_CX: "READY", L1: "BLOCKED", L2: "PLANNED", L3: "NO_WORK", L4: "NO_WORK", IST: "NO_WORK" },
    },
    {
      id: "a3", assetCode: "GEN-01", name: "Generator Set 1",
      cells: { PRE_CX: "READY", L1: "READY", L2: "READY", L3: "IN_PROGRESS", L4: "PLANNED", IST: "NO_WORK" },
    },
    {
      id: "a4", assetCode: "STS-01", name: "Static Transfer Switch",
      cells: { PRE_CX: "READY", L1: "READY", L2: "IN_PROGRESS", L3: "BLOCKED", L4: "NO_WORK", IST: "NO_WORK" },
    },
    {
      id: "a5", assetCode: "XFMR-01", name: "Transformer 1",
      cells: { PRE_CX: "READY", L1: "READY", L2: "READY", L3: "READY", L4: "IN_PROGRESS", IST: "PLANNED" },
    },
  ],
};

const MOCK_PHASE_READINESS = {
  currentPhase: "L2",
  targetPhase: "L3",
  canAdvance: false,
  blockingConditions: [
    "CRAC-01 still blocked at L1 — open hold point HWP-022",
    "STS-01 has active blocker at L3 — NCR-017 unresolved",
  ],
  advisoryConditions: [
    "UPS-01 L2 in progress — 3 of 8 test steps complete",
  ],
  blockingAssets: [
    { id: "a2", assetCode: "CRAC-01", phase: "L1", reason: "Hold point HWP-022 awaiting witness" },
    { id: "a4", assetCode: "STS-01", phase: "L3", reason: "NCR-017 open — corrective action pending" },
  ],
};

const MOCK_TURNOVER = {
  readinessPct: 62,
  passingChecks: 8,
  totalChecks: 13,
  isReady: false,
  checks: [
    { id: "tc1", label: "All L4 tests complete", status: "FAIL", blockingHint: "3 assets still in L3" },
    { id: "tc2", label: "No open Critical issues", status: "FAIL", blockingHint: "2 critical issues open" },
    { id: "tc3", label: "PSSR inspections complete", status: "PASS", blockingHint: null },
    { id: "tc4", label: "Punchlist items resolved", status: "FAIL", blockingHint: "7 punch items outstanding" },
    { id: "tc5", label: "As-built drawings submitted", status: "PASS", blockingHint: null },
    { id: "tc6", label: "O&M manuals delivered", status: "PASS", blockingHint: null },
    { id: "tc7", label: "Training records complete", status: "PASS", blockingHint: null },
    { id: "tc8", label: "Spare parts inventory logged", status: "PASS", blockingHint: null },
    { id: "tc9", label: "Commissioning authority sign-off", status: "FAIL", blockingHint: "Pending L4 completion" },
    { id: "tc10", label: "OEM final sign-off", status: "PASS", blockingHint: null },
    { id: "tc11", label: "All hold points released", status: "FAIL", blockingHint: "HWP-022 open" },
    { id: "tc12", label: "Emergency response plan filed", status: "PASS", blockingHint: null },
    { id: "tc13", label: "IST protocol approved", status: "PASS", blockingHint: null },
  ],
};

// ── Cell status styles ────────────────────────────────────────────────────────
const CELL_STYLE = {
  NO_WORK:     { bg: "var(--rf-bg-soft, #f1f5f9)", color: "var(--rf-txt-muted, #94a3b8)", label: "—" },
  PLANNED:     { bg: "rgba(99,102,241,0.12)",       color: "#6366f1",                       label: "P" },
  IN_PROGRESS: { bg: "rgba(245,158,11,0.15)",       color: "#d97706",                       label: "IP" },
  READY:       { bg: "rgba(34,197,94,0.15)",        color: "#16a34a",                       label: "" },
  BLOCKED:     { bg: "rgba(239,68,68,0.15)",        color: "#dc2626",                       label: "!" },
};

const CHECK_STYLE = {
  PASS: { bg: "rgba(34,197,94,0.12)", color: "#16a34a", icon: "" },
  FAIL: { bg: "rgba(239,68,68,0.12)", color: "#dc2626", icon: "" },
  NA:   { bg: "var(--rf-bg-soft)",    color: "var(--rf-txt-muted)", icon: "—" },
};

// ── Sub-components ────────────────────────────────────────────────────────────
function StatusCell({ status }) {
  const s = CELL_STYLE[status] || CELL_STYLE.NO_WORK;
  return (
    <td
      style={{
        textAlign: "center",
        padding: "6px 8px",
        background: s.bg,
        color: s.color,
        fontWeight: 700,
        fontSize: 11,
        border: "1px solid var(--rf-border, #e2e8f0)",
        minWidth: 54,
      }}
      title={status}
    >
      {s.label}
    </td>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
      {Object.entries(CELL_STYLE).map(([k, v]) => (
        <span
          key={k}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            color: v.color,
            background: v.bg,
            padding: "2px 8px",
            borderRadius: 6,
            fontWeight: 600,
            border: "1px solid var(--rf-border, #e2e8f0)",
          }}
        >
          <span style={{ fontSize: 10 }}>{v.label}</span> {k.replace("_", " ")}
        </span>
      ))}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Readiness() {
  const [projectId, setProjectId] = useState(MOCK_PROJECTS[0].id);
  const [tab, setTab] = useState("asset");
  const [assetData, setAssetData] = useState(null);
  const [phaseData, setPhaseData] = useState(null);
  const [turnoverData, setTurnoverData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (pid) => {
    setLoading(true);
    const [assetRes, phaseRes, turnoverRes] = await Promise.allSettled([
      getAssetReadiness(pid),
      getPhaseReadiness(pid),
      getTurnoverProgression(pid),
    ]);
    setAssetData(assetRes.status === "fulfilled" && assetRes.value ? assetRes.value : MOCK_ASSET_READINESS);
    setPhaseData(phaseRes.status === "fulfilled" && phaseRes.value ? phaseRes.value : MOCK_PHASE_READINESS);
    setTurnoverData(turnoverRes.status === "fulfilled" && turnoverRes.value ? turnoverRes.value : MOCK_TURNOVER);
    setLoading(false);
  }, []);

  useEffect(() => { load(projectId); }, [projectId, load]);

  const proj = MOCK_PROJECTS.find((p) => p.id === projectId) || MOCK_PROJECTS[0];

  const TABS = [
    { key: "asset", label: "Asset Matrix" },
    { key: "phase", label: "Phase Gates" },
    { key: "turnover", label: "Turnover Readiness" },
  ];

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "var(--rf-txt, #0f172a)" }}>
            Readiness Engine
          </h1>
          <div style={{ fontSize: 13, color: "var(--rf-txt-muted, #64748b)", marginTop: 2 }}>
            Asset matrix · phase gates · turnover progression
          </div>
        </div>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={{
            padding: "7px 12px",
            borderRadius: 8,
            border: "1px solid var(--rf-border, #e2e8f0)",
            background: "var(--rf-surface, #fff)",
            color: "var(--rf-txt, #0f172a)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {MOCK_PROJECTS.map((p) => (
            <option key={p.id} value={p.id}>{p.code} · {p.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--rf-border, #e2e8f0)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? "var(--rf-accent, #6366f1)" : "var(--rf-txt-muted, #64748b)",
              background: "transparent",
              border: "none",
              borderBottom: tab === t.key ? "2px solid var(--rf-accent, #6366f1)" : "2px solid transparent",
              cursor: "pointer",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--rf-txt-muted)" }}>Loading…</div>
      ) : (
        <>
          {/* ── Asset Matrix tab ───────────────────────────────────────────── */}
          {tab === "asset" && assetData && (
            <div>
              <Legend />
              <div style={{ overflowX: "auto" }}>
                <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          background: "var(--rf-bg-soft, #f8fafc)",
                          border: "1px solid var(--rf-border, #e2e8f0)",
                          fontWeight: 700,
                          fontSize: 11,
                          color: "var(--rf-txt-muted, #64748b)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          minWidth: 220,
                        }}
                      >
                        Asset
                      </th>
                      {assetData.phases.map((ph) => (
                        <th
                          key={ph}
                          style={{
                            textAlign: "center",
                            padding: "8px 8px",
                            background: "var(--rf-bg-soft, #f8fafc)",
                            border: "1px solid var(--rf-border, #e2e8f0)",
                            fontWeight: 700,
                            fontSize: 11,
                            color: "var(--rf-txt-muted, #64748b)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            minWidth: 54,
                          }}
                        >
                          {ph}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assetData.assets.map((asset) => (
                      <tr key={asset.id}>
                        <td
                          style={{
                            padding: "8px 12px",
                            border: "1px solid var(--rf-border, #e2e8f0)",
                            background: "var(--rf-surface, #fff)",
                          }}
                        >
                          <span style={{ fontWeight: 700, fontSize: 12, color: "var(--rf-accent, #6366f1)", marginRight: 8 }}>
                            {asset.assetCode}
                          </span>
                          <span style={{ color: "var(--rf-txt, #0f172a)" }}>{asset.name}</span>
                        </td>
                        {assetData.phases.map((ph) => (
                          <StatusCell key={ph} status={asset.cells?.[ph] || "NO_WORK"} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Phase Gates tab ────────────────────────────────────────────── */}
          {tab === "phase" && phaseData && (
            <div style={{ maxWidth: 700 }}>
              {/* Gate status card */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 10,
                  border: `2px solid ${phaseData.canAdvance ? "#16a34a" : "#dc2626"}`,
                  background: phaseData.canAdvance ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.06)",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: phaseData.canAdvance ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    flexShrink: 0,
                  }}
                >
                  {phaseData.canAdvance ? "" : ""}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--rf-txt, #0f172a)", marginBottom: 2 }}>
                    {phaseData.canAdvance
                      ? `Ready to advance: ${phaseData.currentPhase} → ${phaseData.targetPhase}`
                      : `Cannot advance: ${phaseData.currentPhase} → ${phaseData.targetPhase}`}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--rf-txt-muted, #64748b)" }}>
                    Current phase <strong>{phaseData.currentPhase}</strong> · Target <strong>{phaseData.targetPhase}</strong>
                  </div>
                </div>
              </div>

              {/* Blocking conditions */}
              {phaseData.blockingConditions?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--rf-txt-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                    Blocking Conditions
                  </div>
                  {phaseData.blockingConditions.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "rgba(239,68,68,0.07)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        marginBottom: 6,
                        fontSize: 13,
                        color: "var(--rf-txt, #0f172a)",
                      }}
                    >
                      <span style={{ color: "#dc2626", fontWeight: 700, flexShrink: 0 }}></span>
                      {c}
                    </div>
                  ))}
                </div>
              )}

              {/* Advisory conditions */}
              {phaseData.advisoryConditions?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--rf-txt-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                    Advisory
                  </div>
                  {phaseData.advisoryConditions.map((c, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: "rgba(245,158,11,0.07)",
                        border: "1px solid rgba(245,158,11,0.2)",
                        marginBottom: 6,
                        fontSize: 13,
                        color: "var(--rf-txt, #0f172a)",
                      }}
                    >
                      <span style={{ color: "#d97706", fontWeight: 700, flexShrink: 0 }}></span>
                      {c}
                    </div>
                  ))}
                </div>
              )}

              {/* Blocking assets */}
              {phaseData.blockingAssets?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "var(--rf-txt-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                    Blocking Assets
                  </div>
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                    <thead>
                      <tr>
                        {["Asset", "Blocked At Phase", "Reason"].map((h) => (
                          <th
                            key={h}
                            style={{
                              textAlign: "left",
                              padding: "7px 12px",
                              background: "var(--rf-bg-soft)",
                              border: "1px solid var(--rf-border, #e2e8f0)",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "var(--rf-txt-muted)",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {phaseData.blockingAssets.map((a) => (
                        <tr key={a.id}>
                          <td style={{ padding: "8px 12px", border: "1px solid var(--rf-border, #e2e8f0)", fontWeight: 700, color: "var(--rf-accent, #6366f1)" }}>
                            {a.assetCode}
                          </td>
                          <td style={{ padding: "8px 12px", border: "1px solid var(--rf-border, #e2e8f0)", fontWeight: 700 }}>
                            {a.phase}
                          </td>
                          <td style={{ padding: "8px 12px", border: "1px solid var(--rf-border, #e2e8f0)", color: "var(--rf-txt, #0f172a)" }}>
                            {a.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Turnover Readiness tab ─────────────────────────────────────── */}
          {tab === "turnover" && turnoverData && (
            <div style={{ maxWidth: 680 }}>
              {/* Progress strip */}
              <div
                style={{
                  padding: 20,
                  borderRadius: 10,
                  border: "1px solid var(--rf-border, #e2e8f0)",
                  background: "var(--rf-surface, #fff)",
                  marginBottom: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: turnoverData.isReady ? "#16a34a" : "var(--rf-txt, #0f172a)" }}>
                      {turnoverData.readinessPct}%
                    </div>
                    <div style={{ fontSize: 12, color: "var(--rf-txt-muted)" }}>
                      {turnoverData.passingChecks} / {turnoverData.totalChecks} checks passing
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      background: turnoverData.isReady ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
                      color: turnoverData.isReady ? "#16a34a" : "#dc2626",
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    {turnoverData.isReady ? "TURNOVER READY" : "NOT READY"}
                  </div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 8, borderRadius: 4, background: "var(--rf-bg-soft, #f1f5f9)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${turnoverData.readinessPct}%`,
                      background: turnoverData.readinessPct === 100 ? "#16a34a" : turnoverData.readinessPct >= 70 ? "#d97706" : "#dc2626",
                      borderRadius: 4,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>

              {/* Generate package button */}
              {turnoverData.isReady && (
                <div style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    style={{
                      padding: "9px 20px",
                      borderRadius: 8,
                      background: "var(--rf-accent, #6366f1)",
                      color: "#fff",
                      border: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                    onClick={() => alert("Turnover package generation queued.")}
                  >
                    Generate Turnover Package
                  </button>
                </div>
              )}

              {/* Checks list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {turnoverData.checks.map((check) => {
                  const s = CHECK_STYLE[check.status] || CHECK_STYLE.NA;
                  return (
                    <div
                      key={check.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 14px",
                        borderRadius: 8,
                        background: s.bg,
                        border: `1px solid ${check.status === "PASS" ? "rgba(34,197,94,0.2)" : check.status === "FAIL" ? "rgba(239,68,68,0.2)" : "var(--rf-border)"}`,
                      }}
                    >
                      <span style={{ color: s.color, fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{s.icon}</span>
                      <span style={{ flex: 1, fontSize: 13, color: "var(--rf-txt, #0f172a)", fontWeight: check.status === "FAIL" ? 600 : 400 }}>
                        {check.label}
                      </span>
                      {check.blockingHint && (
                        <span style={{ fontSize: 11, color: "#dc2626", fontStyle: "italic", maxWidth: 240, textAlign: "right" }}>
                          {check.blockingHint}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
