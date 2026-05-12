"use client";

import { useState, useEffect } from "react";
import {
  getProjectHealth,
  getAssetReadiness,
  getPhaseReadiness,
  getTurnoverProgression,
  getProjectDependencies,
} from "@/services/CxProjects";

// ─── Mock fallback data ───────────────────────────────────────────────────────

const PROJECT = {
  id: "msft-dc1", code: "MSFT-DC1", name: "Microsoft Atlanta Expansion",
  client: "Microsoft", location: "Atlanta, GA", currentPhase: "L3",
  currentPhaseLabel: "ENERGIZE", overallProgress: 64, totalAssets: 142,
  energized: 58, openIssues: 7, startDate: "2025-09-01",
  targetCompletion: "2026-11-30", contractValue: "$47.2M", spent: "$30.2M", burnPct: 64,
};

const PHASES = [
  { id: "L1", label: "FAT",       status: "done",    pct: 100, startDate: "2025-09-01", endDate: "2025-11-15", assets: 28 },
  { id: "L2", label: "INSTALL",   status: "done",    pct: 100, startDate: "2025-11-16", endDate: "2026-02-28", assets: 56 },
  { id: "L3", label: "ENERGIZE",  status: "active",  pct: 64,  startDate: "2026-03-01", endDate: "2026-06-30", assets: 38 },
  { id: "L4", label: "LOAD BANK", status: "pending", pct: 0,   startDate: "2026-07-01", endDate: "2026-09-30", assets: 12 },
  { id: "L5", label: "IST",       status: "pending", pct: 0,   startDate: "2026-10-01", endDate: "2026-11-30", assets: 8  },
];

const MILESTONES = [
  { id: "ms1", title: "L2 Substantial Completion",     date: "2026-02-28", status: "done",    phase: "L2" },
  { id: "ms2", title: "L3.05 IST Pre-Walk",            date: "2026-05-16", status: "upcoming", phase: "L3" },
  { id: "ms3", title: "L5 IST Window",                 date: "2026-05-19", status: "upcoming", phase: "L3" },
  { id: "ms4", title: "L3 Energization Complete",      date: "2026-06-30", status: "future",   phase: "L3" },
  { id: "ms5", title: "L4 Load Bank Testing Start",    date: "2026-07-01", status: "future",   phase: "L4" },
  { id: "ms6", title: "Final System Acceptance (IST)", date: "2026-11-30", status: "future",   phase: "L5" },
];

const TEAM = [
  { id: "u1", name: "Sarah Chen",   role: "GC PM",            company: "HITT Contracting",   initials: "SC", color: "#3b82f6" },
  { id: "u2", name: "Carol Reyes",  role: "Project Engineer", company: "HITT Contracting",   initials: "CR", color: "#8b5cf6" },
  { id: "u3", name: "Joe Martinez", role: "Superintendent",   company: "HITT Contracting",   initials: "JM", color: "#10b981" },
  { id: "u4", name: "Priya Nair",   role: "QA Manager",       company: "HITT Contracting",   initials: "PN", color: "#ec4899" },
  { id: "u5", name: "Lisa Park",    role: "Owner's Rep",      company: "Microsoft",          initials: "LP", color: "#0ea5e9" },
  { id: "u6", name: "Adam Krol",    role: "NETA Lead",        company: "Shermco Industries", initials: "AK", color: "#f97316" },
];

const ISSUES_MOCK = [
  { id: "i1", title: "Load bank capacity request — L5 IST (4MW vs 3MW)", priority: "high",   status: "open", phase: "L3", assignee: "SC" },
  { id: "i2", title: "Rosendin L2.05a sign-off pending",                  priority: "high",   status: "open", phase: "L3", assignee: "CR" },
  { id: "i3", title: "Cable tray PO still open — chasing Eaton",          priority: "medium", status: "open", phase: "L3", assignee: "TG" },
  { id: "i4", title: "Punch list item #14 — UPS-Rm-B terminations",       priority: "medium", status: "open", phase: "L2", assignee: "JM" },
  { id: "i5", title: "BMS contractor scheduling conflict w/ OEM window",  priority: "medium", status: "open", phase: "L3", assignee: "SC" },
  { id: "i6", title: "Missing shop drawings — Level 4 rough-in",          priority: "low",    status: "open", phase: "L3", assignee: "CR" },
  { id: "i7", title: "Safety sign-in sheets missing — Week 19",           priority: "low",    status: "open", phase: "L3", assignee: "DP" },
];

const ACTIVITY = [
  { id: "a1", actor: "Linda Wu",     action: "confirmed Q2 burn at 64% — on plan",             timeAgo: "25m ago", icon: "💰" },
  { id: "a2", actor: "Adam Krol",    action: "uploaded L3.05 scope sheet to Documents",         timeAgo: "3h ago",  icon: "📄" },
  { id: "a3", actor: "Sarah Chen",   action: "confirmed May 19 IST window locked",              timeAgo: "1h ago",  icon: "📅" },
  { id: "a4", actor: "Joe Martinez", action: "marked UPS-Rm-B termination crew work complete",  timeAgo: "4h ago",  icon: "✅" },
  { id: "a5", actor: "Carol Reyes",  action: "pulled L2.06 checklist for UPS-03 review",        timeAgo: "2h ago",  icon: "📋" },
  { id: "a6", actor: "Tom Greene",   action: "updated PO log — termination kits ETA May 12",   timeAgo: "45m ago", icon: "📦" },
];

// ─── Phase 3 mock fallbacks ───────────────────────────────────────────────────

const MOCK_HEALTH = {
  cxProjectId: "msft-dc1", band: "AMBER", cxScore: 82, readinessPct: 58,
  openCriticalIssues: 2,
  activeEscalations: { CRITICAL: 0, WARN: 2, INFO: 1, total: 3 },
  pssrPendingSignoff: 1,
  rationale: [
    "2 WARN escalations: NCR aging > 3 days",
    "CxScore 82 — above threshold but 3-point drop since last snapshot",
    "1 PSSR pending signoff before L3 can close",
  ],
};

const MOCK_PHASE_READINESS = {
  cxProjectId: "msft-dc1", currentPhase: "L3", targetPhase: "L4", canAdvance: false,
  blockingConditions: [
    { conditionId: "c1", conditionKey: "all-checklists-verified", description: "All L3 checklists must be VERIFIED", conditionType: "CHECKLIST", isBlocking: true },
    { conditionId: "c2", conditionKey: "critical-issues-closed",  description: "No open CRITICAL issues",            conditionType: "ISSUE",     isBlocking: true },
  ],
  advisoryConditions: [
    { conditionId: "c3", conditionKey: "pssr-signed", description: "PSSR signoff recommended before L4" },
  ],
  blockingAssets: [
    { assetId: "a1", assetTag: "UPS-A1",  assetName: "UPS Unit A1",  isBlocking: true, blockerCount: 1 },
    { assetId: "a3", assetTag: "CRAC-03", assetName: "CRAC Unit 3",  isBlocking: true, blockerCount: 2 },
  ],
};

const MOCK_ASSET_READINESS = {
  cxProjectId: "msft-dc1",
  phases: ["L1", "L2", "L3", "L4", "L5", "IST"],
  assets: [
    { assetId: "a1", assetTag: "UPS-A1",   assetName: "UPS Unit A1",         category: "Power",
      cells: [
        { phase: "L1", status: "READY",       testTotal: 4, testsPassing: 4, testsFailed: 0, checklistTotal: 2, checklistsVerified: 2, openCriticalIssueCount: 0 },
        { phase: "L2", status: "READY",       testTotal: 6, testsPassing: 6, testsFailed: 0, checklistTotal: 3, checklistsVerified: 3, openCriticalIssueCount: 0 },
        { phase: "L3", status: "BLOCKED",     testTotal: 8, testsPassing: 5, testsFailed: 1, checklistTotal: 4, checklistsVerified: 2, openCriticalIssueCount: 1 },
        { phase: "L4", status: "PLANNED",     testTotal: 4, testsPassing: 0, testsFailed: 0, checklistTotal: 2, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "L5", status: "NO_WORK",     testTotal: 0, testsPassing: 0, testsFailed: 0, checklistTotal: 0, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "IST", status: "PLANNED",    testTotal: 2, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
      ]
    },
    { assetId: "a2", assetTag: "PDU-A1",   assetName: "PDU Rack A1",         category: "Power",
      cells: [
        { phase: "L1", status: "READY",       testTotal: 2, testsPassing: 2, testsFailed: 0, checklistTotal: 1, checklistsVerified: 1, openCriticalIssueCount: 0 },
        { phase: "L2", status: "READY",       testTotal: 4, testsPassing: 4, testsFailed: 0, checklistTotal: 2, checklistsVerified: 2, openCriticalIssueCount: 0 },
        { phase: "L3", status: "IN_PROGRESS", testTotal: 6, testsPassing: 4, testsFailed: 0, checklistTotal: 3, checklistsVerified: 2, openCriticalIssueCount: 0 },
        { phase: "L4", status: "PLANNED",     testTotal: 3, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "L5", status: "NO_WORK",     testTotal: 0, testsPassing: 0, testsFailed: 0, checklistTotal: 0, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "IST", status: "PLANNED",    testTotal: 1, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
      ]
    },
    { assetId: "a3", assetTag: "CRAC-03",  assetName: "CRAC Unit 3",         category: "Cooling",
      cells: [
        { phase: "L1", status: "READY",       testTotal: 3, testsPassing: 3, testsFailed: 0, checklistTotal: 2, checklistsVerified: 2, openCriticalIssueCount: 0 },
        { phase: "L2", status: "READY",       testTotal: 5, testsPassing: 5, testsFailed: 0, checklistTotal: 3, checklistsVerified: 3, openCriticalIssueCount: 0 },
        { phase: "L3", status: "BLOCKED",     testTotal: 6, testsPassing: 3, testsFailed: 2, checklistTotal: 3, checklistsVerified: 1, openCriticalIssueCount: 2 },
        { phase: "L4", status: "PLANNED",     testTotal: 4, testsPassing: 0, testsFailed: 0, checklistTotal: 2, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "L5", status: "PLANNED",     testTotal: 2, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "IST", status: "PLANNED",    testTotal: 2, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
      ]
    },
    { assetId: "a4", assetTag: "AHU-04",   assetName: "Air Handler Unit 4",  category: "HVAC",
      cells: [
        { phase: "L1", status: "READY",       testTotal: 2, testsPassing: 2, testsFailed: 0, checklistTotal: 1, checklistsVerified: 1, openCriticalIssueCount: 0 },
        { phase: "L2", status: "IN_PROGRESS", testTotal: 4, testsPassing: 3, testsFailed: 0, checklistTotal: 2, checklistsVerified: 1, openCriticalIssueCount: 0 },
        { phase: "L3", status: "PLANNED",     testTotal: 4, testsPassing: 0, testsFailed: 0, checklistTotal: 2, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "L4", status: "PLANNED",     testTotal: 3, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "L5", status: "NO_WORK",     testTotal: 0, testsPassing: 0, testsFailed: 0, checklistTotal: 0, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "IST", status: "PLANNED",    testTotal: 1, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
      ]
    },
    { assetId: "a5", assetTag: "MDB-L3",   assetName: "Main DB Level 3",     category: "Electrical",
      cells: [
        { phase: "L1", status: "READY",       testTotal: 3, testsPassing: 3, testsFailed: 0, checklistTotal: 2, checklistsVerified: 2, openCriticalIssueCount: 0 },
        { phase: "L2", status: "READY",       testTotal: 4, testsPassing: 4, testsFailed: 0, checklistTotal: 2, checklistsVerified: 2, openCriticalIssueCount: 0 },
        { phase: "L3", status: "IN_PROGRESS", testTotal: 8, testsPassing: 6, testsFailed: 0, checklistTotal: 4, checklistsVerified: 3, openCriticalIssueCount: 0 },
        { phase: "L4", status: "PLANNED",     testTotal: 4, testsPassing: 0, testsFailed: 0, checklistTotal: 2, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "L5", status: "PLANNED",     testTotal: 2, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
        { phase: "IST", status: "PLANNED",    testTotal: 2, testsPassing: 0, testsFailed: 0, checklistTotal: 1, checklistsVerified: 0, openCriticalIssueCount: 0 },
      ]
    },
  ],
};

const MOCK_TURNOVER = {
  cxProjectId: "msft-dc1", readinessPct: 42, passingChecks: 5, totalChecks: 12, isReady: false,
  checks: [
    { id: "tc1", label: "All phase checklists verified",    done: 38, total: 48, required: true,  blockingHint: "10 remaining" },
    { id: "tc2", label: "No open critical issues",          done: 0,  total: 2,  required: true,  blockingHint: "2 critical issues open" },
    { id: "tc3", label: "All commissioning tests passed",   done: 85, total: 96, required: true,  blockingHint: "11 tests pending" },
    { id: "tc4", label: "PSSR complete",                    done: 0,  total: 1,  required: true,  blockingHint: "PSSR not yet signed" },
    { id: "tc5", label: "Turnover package generated",       done: 0,  total: 1,  required: true,  blockingHint: "Pending readiness" },
    { id: "tc6", label: "Punch list items closed",          done: 11, total: 14, required: false, blockingHint: "3 remaining" },
    { id: "tc7", label: "O&M documentation complete",       done: 4,  total: 6,  required: false, blockingHint: "2 documents pending" },
  ],
};

const MOCK_DEPENDENCIES = {
  cxProjectId: "msft-dc1",
  graph: {
    nodes: [
      { id: "phase:L2",   kind: "PHASE",       label: "L2 · INSTALL",                  phase: "L2",  isBlocking: false },
      { id: "phase:L3",   kind: "PHASE",       label: "L3 · ENERGIZE",                 phase: "L3",  isBlocking: true  },
      { id: "asset:ups",  kind: "ASSET",       label: "UPS-A1",                        isBlocking: true  },
      { id: "asset:crac", kind: "ASSET",       label: "CRAC-03",                       isBlocking: true  },
      { id: "hold:h1",    kind: "HOLD_POINT",  label: "Hold Point: MDB-L3 arc flash",  isBlocking: true  },
      { id: "ncr:n1",     kind: "NCR",         label: "NCR-001: Refrigerant leak CRAC-03", isBlocking: true },
      { id: "test:t1",    kind: "TEST",        label: "Megger test UPS-A1 input cable (FAILED)", isBlocking: true },
      { id: "proc:p1",    kind: "PROCUREMENT", label: "Eaton cable tray PO",           isBlocking: false },
    ],
    edges: [
      { fromId: "phase:L2",  toId: "phase:L3",   reason: "SEQUENCE",        description: "L2 must complete before L3 can advance" },
      { fromId: "hold:h1",   toId: "asset:ups",  reason: "OPEN_HOLD_POINT", description: "Hold point blocks UPS-A1 energization" },
      { fromId: "ncr:n1",    toId: "phase:L3",   reason: "OPEN_ISSUE",      description: "Critical NCR blocks L3 gate progression" },
      { fromId: "test:t1",   toId: "asset:ups",  reason: "FAILED_TEST",     description: "Failed megger test — retest required before energization" },
      { fromId: "proc:p1",   toId: "phase:L3",   reason: "PROCUREMENT_INPUT", description: "Cable tray PO required for L3 scope completion" },
    ],
  },
  summary: { totalNodes: 8, totalEdges: 5, blockedAssetCount: 2, openHoldPointCount: 1, openNcrCount: 1, failedTestCount: 1, longLeadInFlightCount: 1 },
};

// ─── Style constants ──────────────────────────────────────────────────────────

const PRIORITY_COLOR = { high: "var(--rf-red)", medium: "var(--rf-yellow)", low: "var(--rf-green)" };
const PRIORITY_BG    = { high: "rgba(239,68,68,0.1)", medium: "rgba(245,158,11,0.1)", low: "rgba(16,185,129,0.1)" };
const MS_STATUS_COLOR = { done: "var(--rf-green)", upcoming: "var(--rf-accent)", future: "var(--rf-txt3)" };
const MS_STATUS_BG    = { done: "rgba(16,185,129,0.1)", upcoming: "rgba(59,130,246,0.1)", future: "var(--rf-bg3)" };
const MS_STATUS_LABEL = { done: "Done", upcoming: "Upcoming", future: "Planned" };

const HEALTH_BAND = {
  GREEN: { bg: "rgba(16,185,129,0.15)", color: "#15803d", border: "rgba(16,185,129,0.4)", dot: "#10b981" },
  AMBER: { bg: "rgba(245,158,11,0.15)", color: "#b45309", border: "rgba(245,158,11,0.4)", dot: "#f59e0b" },
  RED:   { bg: "rgba(239,68,68,0.15)",  color: "#dc2626", border: "rgba(239,68,68,0.4)",  dot: "#ef4444" },
};

const READINESS_CELL = {
  NO_WORK:     { bg: "var(--rf-bg3)",             color: "var(--rf-txt3)",  label: "—"    },
  PLANNED:     { bg: "rgba(245,158,11,0.08)",     color: "#b45309",         label: "Plan" },
  IN_PROGRESS: { bg: "rgba(245,158,11,0.22)",     color: "#92400e",         label: "WIP"  },
  READY:       { bg: "rgba(16,185,129,0.18)",     color: "#15803d",         label: "✓"    },
  BLOCKED:     { bg: "rgba(239,68,68,0.18)",      color: "#dc2626",         label: "🚫"   },
};

const DEP_NODE_COLOR = {
  PHASE:       "#3b82f6", ASSET:       "#0f766e", TEST:        "#7c2d12",
  CHECKLIST:   "#4b5563", HOLD_POINT:  "#92400e", NCR:         "#dc2626",
  PROCUREMENT: "#5b21b6",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: color + "22", border: `1.5px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 700, color, userSelect: "none" }}>
      {initials}
    </div>
  );
}

function KpiCard({ label, value, sub, topColor }) {
  return (
    <div style={{ flex: "1 1 140px", background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 12, padding: "18px 22px", position: "relative", overflow: "hidden" }}>
      {topColor && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: topColor, borderRadius: "12px 12px 0 0" }} />}
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "var(--rf-txt)", lineHeight: 1, marginBottom: sub ? 6 : 0 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>{sub}</div>}
    </div>
  );
}

function HealthChip({ band }) {
  if (!band) return null;
  const s = HEALTH_BAND[band] || HEALTH_BAND.AMBER;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: s.bg, border: `1px solid ${s.border}`, fontSize: 12, fontWeight: 800, color: s.color, letterSpacing: "0.05em" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {band}
    </span>
  );
}

function PhaseTimeline({ phases }) {
  return (
    <div style={{ display: "flex", borderRadius: 10, overflow: "hidden", border: "1px solid var(--rf-border)" }}>
      {phases.map((ph, i) => {
        const isDone = ph.status === "done"; const isActive = ph.status === "active";
        const bg = isDone ? "var(--rf-accent)" : isActive ? "var(--rf-yellow)" : "var(--rf-bg3)";
        const fg = isDone || isActive ? "#fff" : "var(--rf-txt3)";
        return (
          <div key={ph.id} style={{ flex: 1, padding: "12px 0", textAlign: "center", background: bg, borderRight: i < phases.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: fg, letterSpacing: "0.04em" }}>{ph.id} · {ph.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 800, color: "var(--rf-txt)", letterSpacing: "-0.01em" }}>{children}</h2>;
}

function ProgressBar({ pct, color = "var(--rf-accent)", height = 6 }) {
  return (
    <div style={{ height, borderRadius: 99, background: "var(--rf-bg3)", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.4s" }} />
    </div>
  );
}

function LoadingState() {
  return <div style={{ textAlign: "center", padding: "40px 0", color: "var(--rf-txt3)", fontSize: 13 }}>Loading...</div>;
}

// ── Health tab ────────────────────────────────────────────────────────────────

function HealthTab({ health, phaseReadiness, turnover }) {
  if (!health) return <LoadingState />;
  const band = HEALTH_BAND[health.band] || HEALTH_BAND.AMBER;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      {/* Band + rationale */}
      <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 20 }}>
        <SectionTitle>Operational health</SectionTitle>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <HealthChip band={health.band} />
          {health.cxScore != null && (
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--rf-txt)" }}>
              {health.cxScore}<span style={{ fontSize: 13, fontWeight: 500, color: "var(--rf-txt3)", marginLeft: 4 }}>/ 100</span>
            </span>
          )}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Why this band</div>
          {health.rationale.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: i < health.rationale.length - 1 ? "1px solid var(--rf-border)" : "none" }}>
              <span style={{ color: band.dot, flexShrink: 0, marginTop: 2 }}>●</span>
              <span style={{ fontSize: 12, color: "var(--rf-txt2)", lineHeight: 1.5 }}>{r}</span>
            </div>
          ))}
        </div>
        {/* Escalation counts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 14 }}>
          {[
            { label: "Critical", val: health.activeEscalations.CRITICAL, color: "var(--rf-red)" },
            { label: "Warn",     val: health.activeEscalations.WARN,     color: "var(--rf-yellow)" },
            { label: "Info",     val: health.activeEscalations.INFO,     color: "var(--rf-accent)" },
          ].map((e) => (
            <div key={e.label} style={{ textAlign: "center", background: "var(--rf-bg3)", borderRadius: 10, padding: "10px 8px" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: e.color }}>{e.val}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", marginTop: 2 }}>{e.label}</div>
            </div>
          ))}
        </div>
        {/* Quick stats */}
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: "Open critical issues",    val: health.openCriticalIssues,      color: health.openCriticalIssues > 0 ? "var(--rf-red)" : "var(--rf-green)" },
            { label: "PSSR pending signoff",     val: health.pssrPendingSignoff,      color: health.pssrPendingSignoff > 0 ? "var(--rf-yellow)" : "var(--rf-green)" },
            { label: "Readiness",                val: `${health.readinessPct}%`,      color: health.readinessPct >= 80 ? "var(--rf-green)" : health.readinessPct >= 50 ? "var(--rf-yellow)" : "var(--rf-red)" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "5px 0", borderBottom: "1px solid var(--rf-border)" }}>
              <span style={{ color: "var(--rf-txt3)" }}>{s.label}</span>
              <span style={{ fontWeight: 700, color: s.color }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase readiness + turnover */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {phaseReadiness && (
          <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 20 }}>
            <SectionTitle>Phase gate · {phaseReadiness.currentPhase} → {phaseReadiness.targetPhase}</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "4px 12px", borderRadius: 99, letterSpacing: "0.04em",
                background: phaseReadiness.canAdvance ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)",
                color: phaseReadiness.canAdvance ? "#15803d" : "#dc2626",
                border: `1px solid ${phaseReadiness.canAdvance ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.3)"}`,
              }}>
                {phaseReadiness.canAdvance ? "✓ Ready to advance" : "✕ Blocked"}
              </span>
            </div>
            {phaseReadiness.blockingConditions.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--rf-red)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Blocking conditions</div>
                {phaseReadiness.blockingConditions.map((c) => (
                  <div key={c.conditionId} style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--rf-border)", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--rf-red)", fontSize: 11, marginTop: 1, flexShrink: 0 }}>✕</span>
                    <span style={{ fontSize: 12, color: "var(--rf-txt2)" }}>{c.description}</span>
                    {c.conditionType && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: "var(--rf-txt3)", background: "var(--rf-bg3)", padding: "1px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>{c.conditionType}</span>}
                  </div>
                ))}
              </div>
            )}
            {phaseReadiness.advisoryConditions.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--rf-yellow)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Advisory</div>
                {phaseReadiness.advisoryConditions.map((c) => (
                  <div key={c.conditionId} style={{ display: "flex", gap: 8, padding: "4px 0", alignItems: "center" }}>
                    <span style={{ color: "var(--rf-yellow)", fontSize: 11 }}>⚠</span>
                    <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>{c.description}</span>
                  </div>
                ))}
              </div>
            )}
            {phaseReadiness.blockingAssets.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Blocking assets</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {phaseReadiness.blockingAssets.map((a) => (
                    <span key={a.assetId} style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "rgba(239,68,68,0.08)", color: "var(--rf-red)", border: "1px solid rgba(239,68,68,0.25)" }}>
                      {a.assetTag} ({a.blockerCount})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {turnover && (
          <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <SectionTitle>Turnover readiness</SectionTitle>
              <span style={{ fontSize: 22, fontWeight: 800, color: turnover.isReady ? "var(--rf-green)" : "var(--rf-txt)", marginTop: -10 }}>
                {turnover.readinessPct}%
              </span>
            </div>
            <ProgressBar pct={turnover.readinessPct} color={turnover.readinessPct >= 80 ? "var(--rf-green)" : "var(--rf-yellow)"} height={8} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
              {turnover.checks.map((chk) => {
                const pass = chk.done === chk.total && chk.total > 0;
                return (
                  <div key={chk.id} style={{ borderBottom: "1px solid var(--rf-border)", paddingBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, color: pass ? "var(--rf-green)" : "var(--rf-txt3)" }}>{pass ? "✓" : "○"}</span>
                        <span style={{ fontSize: 12, color: "var(--rf-txt)", fontWeight: chk.required ? 600 : 400 }}>{chk.label}</span>
                        {chk.required && <span style={{ fontSize: 9, fontWeight: 700, color: "var(--rf-accent)", textTransform: "uppercase" }}>required</span>}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--rf-txt3)", whiteSpace: "nowrap", marginLeft: 8 }}>{chk.done}/{chk.total}</span>
                    </div>
                    {chk.blockingHint && !pass && (
                      <div style={{ fontSize: 11, color: "var(--rf-yellow)", paddingLeft: 19 }}>⚠ {chk.blockingHint}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Readiness matrix tab ──────────────────────────────────────────────────────

function ReadinessTab({ assetReadiness }) {
  if (!assetReadiness) return <LoadingState />;
  const { phases, assets } = assetReadiness;
  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        {Object.entries(READINESS_CELL).map(([status, s]) => (
          <span key={status} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, padding: "3px 9px", borderRadius: 6, background: s.bg, color: s.color, fontWeight: 600 }}>
            {s.label} <span style={{ fontWeight: 400, opacity: 0.7 }}>{status}</span>
          </span>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "var(--rf-bg2)", borderBottom: "1px solid var(--rf-border)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>Asset</th>
              <th style={{ padding: "10px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Category</th>
              {phases.map((p) => (
                <th key={p} style={{ padding: "10px 8px", textAlign: "center", fontSize: 11, fontWeight: 800, color: "var(--rf-txt2)", letterSpacing: "0.04em", minWidth: 80 }}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.assetId} style={{ borderBottom: "1px solid var(--rf-border)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--rf-bg3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                  <span style={{ fontWeight: 700, color: "var(--rf-txt)", fontFamily: "monospace", fontSize: 12 }}>{asset.assetTag}</span>
                  <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 1 }}>{asset.assetName}</div>
                </td>
                <td style={{ padding: "10px 10px" }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--rf-txt3)", background: "var(--rf-bg3)", padding: "2px 6px", borderRadius: 4 }}>{asset.category}</span>
                </td>
                {asset.cells.map((cell) => {
                  const s = READINESS_CELL[cell.status] || READINESS_CELL.NO_WORK;
                  return (
                    <td key={cell.phase} style={{ padding: "8px 6px", textAlign: "center" }}>
                      <div style={{ background: s.bg, color: s.color, borderRadius: 7, padding: "6px 4px", fontSize: 13, fontWeight: 700 }}>
                        {s.label}
                      </div>
                      {cell.testTotal > 0 && (
                        <div style={{ fontSize: 9, color: "var(--rf-txt3)", marginTop: 2 }}>
                          {cell.testsPassing}/{cell.testTotal} ✓
                          {cell.testsFailed > 0 && <span style={{ color: "var(--rf-red)", marginLeft: 3 }}>{cell.testsFailed} ✗</span>}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Dependencies tab ──────────────────────────────────────────────────────────

function DependenciesTab({ dependencies }) {
  if (!dependencies) return <LoadingState />;
  const { graph, summary } = dependencies;
  const blocking = graph.nodes.filter((n) => n.isBlocking);
  const byKind = graph.nodes.reduce((acc, n) => { if (!acc[n.kind]) acc[n.kind] = []; acc[n.kind].push(n); return acc; }, {});

  return (
    <div>
      {/* Summary KPIs */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {[
          { label: "Blocked assets",     val: summary.blockedAssetCount,     color: "var(--rf-red)" },
          { label: "Open hold points",   val: summary.openHoldPointCount,    color: "#92400e" },
          { label: "Open NCRs",          val: summary.openNcrCount,          color: "var(--rf-red)" },
          { label: "Failed tests",       val: summary.failedTestCount,       color: "#7c2d12" },
          { label: "Long-lead in-flight", val: summary.longLeadInFlightCount, color: "#5b21b6" },
        ].map((s) => (
          <div key={s.label} style={{ flex: "1 1 120px", background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.val > 0 ? s.color : "var(--rf-txt3)" }}>{s.val}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Blocking nodes */}
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 18 }}>
          <SectionTitle>Blocking nodes ({blocking.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {blocking.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--rf-green)", textAlign: "center", padding: "20px 0" }}>✓ No blocking nodes</div>
            ) : blocking.map((n) => (
              <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: DEP_NODE_COLOR[n.kind] || "#6b7280", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--rf-txt)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.label}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: DEP_NODE_COLOR[n.kind] || "#6b7280", background: "var(--rf-bg3)", padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap" }}>{n.kind}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dependency edges */}
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 18 }}>
          <SectionTitle>Dependency edges ({graph.edges.length})</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {graph.edges.map((e, i) => {
              const fromNode = graph.nodes.find((n) => n.id === e.fromId);
              const toNode   = graph.nodes.find((n) => n.id === e.toId);
              return (
                <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: "var(--rf-bg3)", border: "1px solid var(--rf-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--rf-txt2)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fromNode?.label || e.fromId}</span>
                    <span style={{ fontSize: 12, color: "var(--rf-txt3)", flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--rf-txt2)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{toNode?.label || e.toId}</span>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--rf-txt3)" }}>
                    <span style={{ fontWeight: 700, color: DEP_NODE_COLOR[fromNode?.kind] || "#6b7280", marginRight: 5 }}>{e.reason}</span>
                    {e.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* All nodes by kind */}
      <div style={{ marginTop: 16, background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 18 }}>
        <SectionTitle>All nodes by type</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(byKind).map(([kind, nodes]) => (
            <div key={kind} style={{ flex: "1 1 180px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: DEP_NODE_COLOR[kind] || "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{kind} ({nodes.length})</div>
              {nodes.map((n) => (
                <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid var(--rf-border)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: n.isBlocking ? "var(--rf-red)" : "var(--rf-green)" }} />
                  <span style={{ fontSize: 11, color: n.isBlocking ? "var(--rf-txt)" : "var(--rf-txt3)" }}>{n.label}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main container ───────────────────────────────────────────────────────────

export default function ProjectOverview() {
  const [activeTab, setActiveTab] = useState("overview");

  // Phase 3 state
  const [health, setHealth]                   = useState(null);
  const [assetReadiness, setAssetReadiness]   = useState(null);
  const [phaseReadiness, setPhaseReadiness]   = useState(null);
  const [turnover, setTurnover]               = useState(null);
  const [dependencies, setDependencies]       = useState(null);
  const [p3Loading, setP3Loading]             = useState(true);

  useEffect(() => {
    const id = PROJECT.id;
    Promise.allSettled([
      getProjectHealth(id),
      getAssetReadiness(id),
      getPhaseReadiness(id),
      getTurnoverProgression(id),
      getProjectDependencies(id),
    ]).then(([hRes, arRes, prRes, tvRes, depRes]) => {
      setHealth(       hRes.status === "fulfilled" && hRes.value   ? hRes.value   : MOCK_HEALTH);
      setAssetReadiness(arRes.status === "fulfilled" && arRes.value ? arRes.value : MOCK_ASSET_READINESS);
      setPhaseReadiness(prRes.status === "fulfilled" && prRes.value ? prRes.value : MOCK_PHASE_READINESS);
      setTurnover(     tvRes.status === "fulfilled" && tvRes.value  ? tvRes.value  : MOCK_TURNOVER);
      setDependencies( depRes.status === "fulfilled" && depRes.value ? depRes.value : MOCK_DEPENDENCIES);
      setP3Loading(false);
    });
  }, []);

  const tabs = [
    { key: "overview",      label: "Overview" },
    { key: "health",        label: "Health", badge: health?.band },
    { key: "readiness",     label: "Readiness" },
    { key: "dependencies",  label: `Dependencies${dependencies ? ` (${dependencies.summary.blockedAssetCount} blocked)` : ""}` },
    { key: "milestones",    label: "Milestones" },
    { key: "issues",        label: `Issues (${ISSUES_MOCK.length})` },
    { key: "team",          label: "Team" },
    { key: "activity",      label: "Activity" },
  ];

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--rf-txt)" }}>
            {PROJECT.code} · Project overview
          </h1>
          {health && <HealthChip band={health.band} />}
          {health?.cxScore != null && (
            <span style={{ fontSize: 13, color: "var(--rf-txt3)" }}>
              CxScore <strong style={{ color: "var(--rf-txt)" }}>{health.cxScore}</strong>
            </span>
          )}
        </div>
        <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}>
          {PROJECT.name} · {PROJECT.client} · {PROJECT.location}
        </p>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <KpiCard label="Phase"             value={PROJECT.currentPhase}    sub={`${PROJECT.overallProgress}% complete`}     topColor="var(--rf-accent)" />
        <KpiCard label="Total assets"      value={PROJECT.totalAssets}                                                      topColor={null} />
        <KpiCard label="Energized"         value={PROJECT.energized}                                                        topColor="var(--rf-green)" />
        <KpiCard label="Open issues"       value={PROJECT.openIssues}                                                       topColor="var(--rf-yellow)" />
        {health && <KpiCard label="Readiness"         value={`${health.readinessPct}%`}  sub={`${health.openCriticalIssues} critical open`}     topColor={HEALTH_BAND[health.band]?.dot} />}
        <KpiCard label="Contract value"    value={PROJECT.contractValue}   sub={`${PROJECT.burnPct}% spent`}                topColor={null} />
      </div>

      {/* ── Phase timeline ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <SectionTitle>Phase timeline</SectionTitle>
        <PhaseTimeline phases={PHASES} />
        <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          {PHASES.map((ph) => {
            const isActive = ph.status === "active"; const isDone = ph.status === "done";
            return (
              <div key={ph.id} style={{ flex: "1 1 140px", background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--rf-txt)" }}>{ph.id} · {ph.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isDone ? "var(--rf-green)" : isActive ? "var(--rf-yellow)" : "var(--rf-txt3)" }}>{ph.pct}%</span>
                </div>
                <ProgressBar pct={ph.pct} color={isDone ? "var(--rf-green)" : isActive ? "var(--rf-yellow)" : "var(--rf-bg3)"} />
                <div style={{ fontSize: 10, color: "var(--rf-txt3)", marginTop: 6 }}>{ph.startDate} → {ph.endDate}</div>
                <div style={{ fontSize: 10, color: "var(--rf-txt3)", marginTop: 2 }}>{ph.assets} assets</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--rf-border)", marginBottom: 22, overflowX: "auto" }}>
        {tabs.map((t) => {
          const band = t.badge ? HEALTH_BAND[t.badge] : null;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: "9px 14px", border: "none", background: "transparent", cursor: "pointer",
              fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, whiteSpace: "nowrap",
              color: activeTab === t.key ? "var(--rf-accent)" : "var(--rf-txt2)",
              borderBottom: activeTab === t.key ? "2px solid var(--rf-accent)" : "2px solid transparent",
              marginBottom: -1, transition: "color 0.15s", display: "flex", alignItems: "center", gap: 6,
            }}>
              {t.label}
              {band && <span style={{ width: 7, height: 7, borderRadius: "50%", background: band.dot, flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}

      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 20 }}>
            <SectionTitle>Project details</SectionTitle>
            {[
              ["Project code", PROJECT.code], ["Client", PROJECT.client], ["Location", PROJECT.location],
              ["Start date", PROJECT.startDate], ["Target completion", PROJECT.targetCompletion],
              ["Contract value", PROJECT.contractValue], ["Current phase", `${PROJECT.currentPhase} · ${PROJECT.currentPhaseLabel}`],
              ["Overall progress", `${PROJECT.overallProgress}%`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--rf-border)", gap: 12 }}>
                <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>{label}</span>
                <span style={{ fontSize: 12, color: "var(--rf-txt)", fontWeight: 600, textAlign: "right" }}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: 20 }}>
            <SectionTitle>Recent activity</SectionTitle>
            {ACTIVITY.map((a) => (
              <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--rf-border)" }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rf-txt)" }}>{a.actor} </span>
                  <span style={{ fontSize: 12, color: "var(--rf-txt2)" }}>{a.action}</span>
                </div>
                <span style={{ fontSize: 11, color: "var(--rf-txt3)", whiteSpace: "nowrap", flexShrink: 0 }}>{a.timeAgo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "health" && <HealthTab health={health} phaseReadiness={phaseReadiness} turnover={turnover} />}
      {activeTab === "readiness" && <ReadinessTab assetReadiness={assetReadiness} />}
      {activeTab === "dependencies" && <DependenciesTab dependencies={dependencies} />}

      {activeTab === "milestones" && (
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rf-border)" }}>
                {["Milestone", "Phase", "Date", "Status"].map((h) => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map((ms) => (
                <tr key={ms.id} style={{ borderBottom: "1px solid var(--rf-border)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--rf-bg3)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "13px 18px", color: "var(--rf-txt)", fontWeight: 500 }}>{ms.title}</td>
                  <td style={{ padding: "13px 18px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "var(--rf-bg3)", color: "var(--rf-txt2)", fontFamily: "monospace" }}>{ms.phase}</span></td>
                  <td style={{ padding: "13px 18px", color: "var(--rf-txt2)", whiteSpace: "nowrap" }}>{ms.date}</td>
                  <td style={{ padding: "13px 18px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: MS_STATUS_BG[ms.status], color: MS_STATUS_COLOR[ms.status], textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {MS_STATUS_LABEL[ms.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "issues" && (
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rf-border)" }}>
                {["Issue", "Phase", "Priority", "Assignee"].map((h) => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ISSUES_MOCK.map((issue) => (
                <tr key={issue.id} style={{ borderBottom: "1px solid var(--rf-border)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--rf-bg3)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 18px", color: "var(--rf-txt)", fontWeight: 500 }}>{issue.title}</td>
                  <td style={{ padding: "12px 18px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: "var(--rf-bg3)", color: "var(--rf-txt2)", fontFamily: "monospace" }}>{issue.phase}</span></td>
                  <td style={{ padding: "12px 18px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: PRIORITY_BG[issue.priority], color: PRIORITY_COLOR[issue.priority], textTransform: "uppercase", letterSpacing: "0.04em" }}>{issue.priority}</span></td>
                  <td style={{ padding: "12px 18px", color: "var(--rf-txt2)", fontFamily: "monospace", fontWeight: 600, fontSize: 12 }}>{issue.assignee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "team" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {TEAM.map((m) => (
            <div key={m.id} style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = m.color + "66"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--rf-border)"}
            >
              <Avatar initials={m.initials} color={m.color} size={42} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--rf-txt)", marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "var(--rf-accent)", fontWeight: 600 }}>{m.role}</div>
                <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.company}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "activity" && (
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, overflow: "hidden" }}>
          {ACTIVITY.map((a, i) => (
            <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 20px", borderBottom: i < ACTIVITY.length - 1 ? "1px solid var(--rf-border)" : "none" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--rf-bg3)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{a.icon}</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rf-txt)" }}>{a.actor} </span>
                <span style={{ fontSize: 13, color: "var(--rf-txt2)" }}>{a.action}</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--rf-txt3)", whiteSpace: "nowrap", flexShrink: 0 }}>{a.timeAgo}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
