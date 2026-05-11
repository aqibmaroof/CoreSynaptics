"use client";

// SubPhaseProgressPanel
// Mirrors cxcontrol_v2.html's L-Phase matrix view by rendering sub-phase
// markers (L2.0x, L3.06) grouped by owner taxonomy. Uses the read-only
// projection from /api/phase-gates/:projectId/sub-progress.

import { useEffect, useState } from "react";
import {
  getSubPhaseProgress,
  SUB_PHASE_OWNER_LABELS,
} from "@/services/PhaseGates";

const C = {
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
  greenSoft: "#dcfce7",
  bgSoft: "#f1f5f9",
};

const STATUS_PILL = {
  PENDING: { bg: C.bgSoft, fg: C.textSoft },
  MET: { bg: C.greenSoft, fg: C.green },
  WAIVED: { bg: "#fef3c7", fg: "#92400e" },
  BLOCKED: { bg: "#fee2e2", fg: "#991b1b" },
};

// Stable owner column order, matches HTML PHASE_REFERENCE display
const OWNER_ORDER = [
  "TRADE",
  "TRADE_M",
  "OEM",
  "OEM_OR_TRADE",
  "BMS",
  "GC_QAQC",
  "CXA",
];

export default function SubPhaseProgressPanel({ projectId, compact = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setLoading(true);
    getSubPhaseProgress(projectId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled)
          setErr(e?.message ?? "Failed to load sub-phase progress");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (!projectId) return null;
  if (loading)
    return (
      <Card>
        <Loading text="Loading sub-phase progress…" />
      </Card>
    );
  if (err)
    return (
      <Card>
        <div style={{ color: "#dc2626", fontSize: 13 }}>{err}</div>
      </Card>
    );
  if (!data) return null;

  const owners = OWNER_ORDER.filter((o) => (data.byOwner ?? {})[o]?.length > 0);

  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 18,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: C.text,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
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
            L-Phase progress · advisory sub-gates
          </div>
          <div style={{ marginTop: 4, fontSize: 13, color: C.textSoft }}>
            {data.completedSteps} of {data.totalSteps} markers complete (
            {data.percentComplete}%) · do not block top-level transitions
          </div>
        </div>
        <ProgressBar pct={data.percentComplete} />
      </div>

      {/* Per-owner columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${owners.length}, 1fr)`,
          gap: 12,
        }}
      >
        {owners.map((o) => (
          <Column
            key={o}
            owner={o}
            items={data.byOwner[o]}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function Card({ children }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: 18,
      }}
    >
      {children}
    </div>
  );
}

function Loading({ text }) {
  return (
    <div style={{ padding: 12, textAlign: "center", color: C.textMuted, fontSize: 13 }}>
      {text}
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
      <div
        style={{
          flex: 1,
          height: 8,
          background: C.bgSoft,
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{ height: "100%", width: `${pct}%`, background: C.brand }}
        />
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          fontWeight: 700,
          color: C.brandH,
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

function Column({ owner, items, compact }) {
  const total = items.length;
  const done = items.filter((i) => i.isSatisfied).length;
  return (
    <div
      style={{
        background: C.bgSoft,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: 10,
        minHeight: 120,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 12,
          color: C.brandH,
          marginBottom: 4,
        }}
      >
        {SUB_PHASE_OWNER_LABELS[owner] ?? owner}
      </div>
      <div
        style={{
          fontSize: 10,
          color: C.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
          marginBottom: 8,
        }}
      >
        {done}/{total} done
      </div>
      <div style={{ display: "grid", gap: 6 }}>
        {items.map((it) => (
          <ItemPill key={it.conditionKey} it={it} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function ItemPill({ it, compact }) {
  const pill = STATUS_PILL[it.status] ?? STATUS_PILL.PENDING;
  return (
    <div
      title={it.description}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 6,
        padding: compact ? "5px 8px" : "7px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: C.textSoft,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {it.conditionKey.replace(/_/g, " ")}
      </span>
      <span
        style={{
          background: pill.bg,
          color: pill.fg,
          padding: "1px 7px",
          borderRadius: 999,
          fontSize: 9,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {it.status}
      </span>
    </div>
  );
}
