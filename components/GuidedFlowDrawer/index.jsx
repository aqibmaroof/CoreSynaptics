"use client";

// ── Phase 10 PR-8 + Phase 12 PR-3: Guided flow drawer ───────────────────────
// Renders a recommendation's `steps[]` as ordered decision-support guidance.
// IMPORTANT: steps are NOT tasks. They are a deterministic projection of the
// current operational state — refresh and they recompute. No Task / Issue /
// Workflow row is created. The user navigates to the linked entity and acts
// there.
//
// Persistence (v12 PR-3):
//   Pass `persistMode` to back the drawer with a server-side
//   GuidedExecutionSession. Steps are snapshotted at session start; the
//   server enforces strictly-monotonic ordinal advance. Abandoned sessions
//   cannot be resumed.
//
//   <GuidedFlowDrawer rec={rec} persistMode cxProjectId={cxProjectId} />
//
// Backward-compatible default (no `persistMode`): renders the original
// transient v10 drawer with no API calls.

import { useEffect, useState } from "react";
import Link from "next/link";
import { hrefForNode } from "@/services/KnowledgeGraph";
import {
  COPILOT_PRIORITY_STYLE,
  RECOMMENDATION_KIND_LABEL,
} from "@/services/Copilot";
import {
  startGuidedSession,
  getGuidedSession,
  advanceGuidedSession,
  pauseGuidedSession,
  resumeGuidedSession,
  abandonGuidedSession,
  GUIDED_STATUS_STYLE,
} from "@/services/Learning";

export default function GuidedFlowDrawer({
  rec,
  onClose,
  onWhy,
  persistMode = false,
  cxProjectId,
}) {
  // Always call hooks — gate behavior internally based on `persistMode`.
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!persistMode || !rec) return;
    if (session) return;
    let cancelled = false;
    setBusy(true);
    (async () => {
      try {
        const res = await startGuidedSession({
          flowKey: rec.kind || "GUIDED_FLOW",
          steps: rec.steps ?? [],
          cxProjectId: cxProjectId || undefined,
          sourceRecommendationId: rec.id || undefined,
          targetEntity: rec.targetEntity || undefined,
        });
        if (!cancelled) setSession(res);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Failed to start guided session");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistMode, rec, cxProjectId, session]);

  const refreshSession = async () => {
    if (!session) return;
    try {
      const fresh = await getGuidedSession(session.id);
      setSession(fresh);
    } catch (e) {
      setError(e?.message || "Refresh failed");
    }
  };

  const advance = async (ordinal, note) => {
    if (!session) return;
    setBusy(true);
    try {
      const fresh = await advanceGuidedSession(session.id, {
        ordinal,
        note,
      });
      setSession(fresh);
    } catch (e) {
      setError(e?.message || "Advance failed");
    } finally {
      setBusy(false);
    }
  };

  const pause = async () => {
    if (!session) return;
    setBusy(true);
    try {
      const fresh = await pauseGuidedSession(session.id);
      setSession(fresh);
    } catch (e) {
      setError(e?.message || "Pause failed");
    } finally {
      setBusy(false);
    }
  };

  const resume = async () => {
    if (!session) return;
    setBusy(true);
    try {
      const fresh = await resumeGuidedSession(session.id);
      setSession(fresh);
    } catch (e) {
      setError(e?.message || "Resume failed");
    } finally {
      setBusy(false);
    }
  };

  const abandon = async () => {
    if (!session) return;
    const reason = window.prompt("Abandon reason?");
    if (!reason) return;
    setBusy(true);
    try {
      const fresh = await abandonGuidedSession(session.id, reason);
      setSession(fresh);
    } catch (e) {
      setError(e?.message || "Abandon failed");
    } finally {
      setBusy(false);
    }
  };

  if (!rec) return null;
  const ps =
    COPILOT_PRIORITY_STYLE[rec.priority] || COPILOT_PRIORITY_STYLE.NORMAL;
  // In persistMode the session's snapshot is the source of truth — even if
  // the upstream rec regenerates. Otherwise fall back to the rec's steps.
  const steps = [...(session?.stepsSnapshot ?? rec.steps ?? [])].sort(
    (a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0)
  );
  const completedSet = new Set(
    (session?.completionLog ?? []).map((c) => c.ordinal)
  );
  const nextOrdinal = session ? session.currentStep + 1 : 1;
  const guidedStatus = session?.status;
  const guidedStatusStyle = guidedStatus
    ? GUIDED_STATUS_STYLE[guidedStatus] || GUIDED_STATUS_STYLE.ACTIVE
    : null;

  return (
    <aside className="rf-card" style={{ padding: 16 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: 0.04,
            }}
          >
            Guided flow
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--rf-txt)",
              marginTop: 2,
            }}
          >
            {rec.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--rf-txt3)",
              marginTop: 4,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                padding: "1px 8px",
                borderRadius: 4,
                background: ps.bg,
                color: ps.color,
                fontWeight: 700,
              }}
            >
              {rec.priority}
            </span>
            <span>
              {RECOMMENDATION_KIND_LABEL[rec.kind] || rec.kind}
            </span>
            <span>· {rec.confidence ?? "—"}% confidence</span>
            <span>· {steps.length} steps</span>
            {persistMode && guidedStatus && guidedStatusStyle && (
              <span
                style={{
                  padding: "1px 8px",
                  borderRadius: 4,
                  background: guidedStatusStyle.bg,
                  color: guidedStatusStyle.color,
                  fontWeight: 700,
                }}
              >
                {guidedStatus}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {persistMode && session && guidedStatus === "ACTIVE" && (
            <button className="rf-btn" onClick={pause} disabled={busy}>
              Pause
            </button>
          )}
          {persistMode && session && guidedStatus === "PAUSED" && (
            <button
              className="rf-btn rf-btn-primary"
              onClick={resume}
              disabled={busy}
            >
              Resume
            </button>
          )}
          {persistMode &&
            session &&
            (guidedStatus === "ACTIVE" || guidedStatus === "PAUSED") && (
              <button
                className="rf-btn"
                onClick={abandon}
                disabled={busy}
                style={{ color: "var(--rf-red)" }}
              >
                Abandon
              </button>
            )}
          {onWhy && (
            <button className="rf-btn" onClick={() => onWhy(rec.id)}>
              Why?
            </button>
          )}
          {onClose && (
            <button className="rf-btn" onClick={onClose} title="Close">
             
            </button>
          )}
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      {rec.detail && (
        <p
          style={{
            fontSize: 13,
            color: "var(--rf-txt2)",
            margin: "0 0 10px",
          }}
        >
          {rec.detail}
        </p>
      )}

      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {steps.map((s) => {
          const isDone = completedSet.has(s.ordinal);
          const isNext =
            persistMode && session && s.ordinal === nextOrdinal;
          return (
          <li
            key={s.ordinal}
            style={{
              display: "flex",
              gap: 12,
              padding: "10px 0",
              borderTop: "1px solid var(--rf-border)",
              opacity: isDone ? 0.6 : 1,
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                borderRadius: "50%",
                background: isDone
                  ? "rgba(34,197,94,0.20)"
                  : isNext
                  ? "rgba(59,130,246,0.20)"
                  : "var(--rf-bg3)",
                color: isDone
                  ? "var(--rf-green)"
                  : isNext
                  ? "var(--rf-blue, #3b82f6)"
                  : "var(--rf-txt2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontFamily: "monospace",
                fontSize: 13,
              }}
            >
              {isDone ? "" : s.ordinal}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
              {s.detail && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--rf-txt2)",
                    marginTop: 2,
                  }}
                >
                  {s.detail}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 6,
                  flexWrap: "wrap",
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  alignItems: "center",
                }}
              >
                {s.targetEntity && (
                  <Link
                    href={hrefForNode({
                      entityType: s.targetEntity.entityType,
                      entityId: s.targetEntity.entityId,
                    })}
                    className="rf-btn"
                    style={{ fontSize: 11 }}
                  >
                    Open {s.targetEntity.entityType}
                  </Link>
                )}
                {s.recommendedOwner?.roleName && (
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: "var(--rf-bg3)",
                    }}
                  >
                    Owner · {s.recommendedOwner.roleName}
                  </span>
                )}
                {s.recommendedOwner?.userId && (
                  <span
                    style={{
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: "var(--rf-bg3)",
                      fontFamily: "monospace",
                    }}
                  >
                    Owner · {String(s.recommendedOwner.userId).slice(0, 8)}
                  </span>
                )}
                {s.doneCriteria && (
                  <span style={{ fontStyle: "italic" }}>
                    Done when: {s.doneCriteria}
                  </span>
                )}
                {persistMode && isNext && guidedStatus === "ACTIVE" && (
                  <button
                    className="rf-btn rf-btn-primary"
                    onClick={() => advance(s.ordinal)}
                    disabled={busy}
                    style={{ marginLeft: "auto", fontSize: 11 }}
                  >
                    Mark step done
                  </button>
                )}
              </div>
            </div>
          </li>
          );
        })}
      </ol>

      <div
        style={{
          marginTop: 10,
          padding: 8,
          background: "var(--rf-bg2)",
          borderRadius: 6,
          fontSize: 11,
          color: "var(--rf-txt3)",
        }}
      >
        Guided flow is decision support, not a workflow run. Steps recompute
        when the underlying state changes.
      </div>
    </aside>
  );
}
