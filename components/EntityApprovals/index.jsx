"use client";

// ── Phase 5 PR-2: Entity-level approval chains wrapper ───────────────────────
// Drop into any entity detail screen. Auto-loads all chains for the entity
// and renders ApprovalChainPanel for each — the most recent active chain on
// top.
//
// Usage:
//   <EntityApprovals entityType="Submittal" entityId={id} cxProjectId={p} />

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listChainsForEntity,
  startApprovalChain,
} from "@/services/Approvals";
import ApprovalChainPanel from "@/components/ApprovalChainPanel";

export default function EntityApprovals({
  entityType,
  entityId,
  cxProjectId,
  defaultSteps,
}) {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const refresh = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await listChainsForEntity(entityType, entityId);
      setChains(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load approvals");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sorted = useMemo(() => {
    // Active chains first, then by initiatedAt desc.
    return [...chains].sort((a, b) => {
      const rank = (s) =>
        s === "IN_PROGRESS" || s === "PENDING" ? 0 : 1;
      const r = rank(a.status) - rank(b.status);
      if (r !== 0) return r;
      return (
        new Date(b.initiatedAt || 0).getTime() -
        new Date(a.initiatedAt || 0).getTime()
      );
    });
  }, [chains]);

  const startDefault = async () => {
    if (!defaultSteps?.length) return;
    setStarting(true);
    try {
      await startApprovalChain({
        entityType,
        entityId,
        cxProjectId,
        steps: defaultSteps,
      });
      await refresh();
    } catch (e) {
      setError(e?.message || "Failed to start chain");
    } finally {
      setStarting(false);
    }
  };

  if (!entityType || !entityId) return null;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--rf-txt2)",
            textTransform: "uppercase",
            letterSpacing: 0.04,
          }}
        >
          Approvals
        </div>
        {defaultSteps?.length > 0 && (
          <button
            className="rf-btn"
            onClick={startDefault}
            disabled={starting}
          >
            {starting ? "Starting…" : "+ Start approval"}
          </button>
        )}
      </header>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : sorted.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No approval chains on this {entityType.toLowerCase()}.
        </div>
      ) : (
        sorted.map((c) => (
          <ApprovalChainPanel
            key={c.id}
            chainId={c.id}
            onChange={refresh}
          />
        ))
      )}
    </div>
  );
}
