"use client";

// ── Phase 5 PR-2: Reusable approval-chain side panel ─────────────────────────
// Drop into any entity detail screen (Submittal, RFI, Turnover Package,
// Change Request) — do NOT duplicate per entity.
//
// Usage:
//   <ApprovalChainPanel chainId={chain.id} onChange={() => refetchEntity()} />

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getApprovalChain,
  decideApprovalStep,
  cancelApprovalChain,
  APPROVAL_STEP_BADGE,
} from "@/services/Approvals";

export default function ApprovalChainPanel({ chainId, onChange }) {
  const [chain, setChain] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyStepId, setBusyStepId] = useState(null);
  const [commentDraft, setCommentDraft] = useState({});

  const load = useCallback(async () => {
    if (!chainId) return;
    setLoading(true);
    setError("");
    try {
      const c = await getApprovalChain(chainId);
      setChain(c);
    } catch (e) {
      setError(e?.message || "Failed to load approval chain");
    } finally {
      setLoading(false);
    }
  }, [chainId]);

  useEffect(() => {
    load();
  }, [load]);

  // Group steps by order — same order = parallel.
  const groups = useMemo(() => {
    const steps = chain?.steps ?? [];
    const byOrder = new Map();
    for (const s of steps) {
      const list = byOrder.get(s.order) ?? [];
      list.push(s);
      byOrder.set(s.order, list);
    }
    return [...byOrder.entries()].sort((a, b) => a[0] - b[0]);
  }, [chain]);

  const decide = async (stepId, decision) => {
    setBusyStepId(stepId);
    try {
      await decideApprovalStep(chainId, stepId, {
        decision,
        comment: commentDraft[stepId] || undefined,
      });
      setCommentDraft((d) => ({ ...d, [stepId]: "" }));
      await load();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Decision failed");
    } finally {
      setBusyStepId(null);
    }
  };

  const cancel = async () => {
    if (!confirm("Cancel this approval chain?")) return;
    try {
      await cancelApprovalChain(chainId);
      await load();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Cancel failed");
    }
  };

  if (!chainId) return null;

  if (loading) {
    return (
      <section className="rf-card" style={{ padding: 16 }}>
        <div style={{ color: "var(--rf-txt3)" }}>Loading approval chain…</div>
      </section>
    );
  }

  if (!chain) return null;

  return (
    <section className="rf-card" style={{ padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>Approval</div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            {chain.status}
          </div>
          {chain.templateKey && (
            <div
              style={{
                fontSize: 11,
                color: "var(--rf-txt3)",
                marginTop: 2,
              }}
            >
              Template · {chain.templateKey}
            </div>
          )}
        </div>
        {(chain.status === "PENDING" || chain.status === "IN_PROGRESS") && (
          <button className="rf-btn" onClick={cancel}>
            Cancel chain
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
            marginBottom: 10,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {groups.map(([order, steps]) => (
          <li key={order} style={{ marginBottom: 12 }}>
            {steps.length > 1 && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: 0.04,
                }}
              >
                Parallel · step {order + 1}
              </div>
            )}
            {steps.map((s) => (
              <StepRow
                key={s.id}
                step={s}
                busy={busyStepId === s.id}
                comment={commentDraft[s.id] || ""}
                setComment={(v) =>
                  setCommentDraft((d) => ({ ...d, [s.id]: v }))
                }
                onDecide={(decision) => decide(s.id, decision)}
              />
            ))}
          </li>
        ))}
      </ol>
    </section>
  );
}

function StepRow({ step, busy, comment, setComment, onDecide }) {
  const badge = APPROVAL_STEP_BADGE[step.status] || APPROVAL_STEP_BADGE.PENDING;
  const isActive = step.status === "ACTIVE";
  return (
    <div
      style={{
        border: "1px solid var(--rf-border)",
        borderRadius: 8,
        padding: 10,
        marginBottom: 6,
        background: "var(--rf-bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, color: "var(--rf-txt)" }}>
            {step.order + 1}. {step.name}
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            {step.approverUserId
              ? `User · ${step.approverUserId.slice(0, 8)}`
              : step.approverRoleName
              ? `Role · ${step.approverRoleName}`
              : step.approverCompanyId
              ? `Company · ${step.approverCompanyId.slice(0, 8)}`
              : "—"}
            {step.dueAt
              ? ` · due ${new Date(step.dueAt).toLocaleString()}`
              : ""}
            {step.escalationLevel
              ? ` · escalated x${step.escalationLevel}`
              : ""}
          </div>
        </div>
        <span
          style={{
            padding: "3px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {step.status}
        </span>
      </div>

      {isActive && (
        <div style={{ marginTop: 8 }}>
          <input
            className="rf-input"
            placeholder="Comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={busy}
            style={{ marginBottom: 6, width: "100%" }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => onDecide("APPROVE")}
              disabled={busy}
            >
              Approve
            </button>
            <button
              className="rf-btn"
              onClick={() => onDecide("REJECT")}
              disabled={busy}
              style={{ color: "var(--rf-red)" }}
            >
              Reject
            </button>
            <button
              className="rf-btn"
              onClick={() => onDecide("DELEGATE")}
              disabled={busy}
            >
              Delegate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
