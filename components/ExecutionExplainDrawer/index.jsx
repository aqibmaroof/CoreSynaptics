"use client";

// ── Phase 11 PR-6: Automation execution explainability drawer ────────────────
// Pulls /automation/intelligence/explain/:id. Renders rule/status/duration +
// policy resolution chain + WhyPanel for the structured ExplainabilityBundle.
// Use on every execution row and on every v11 recommendation card.

import { useEffect, useState } from "react";
import {
  automationExplainExecution,
  POLICY_SCOPE_STYLE,
} from "@/services/AutomationIntelligence";
import WhyPanel from "@/components/WhyPanel";

export default function ExecutionExplainDrawer({
  executionId,
  lens,
  onClose,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!executionId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await automationExplainExecution(executionId, lens);
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Failed to load execution explanation");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [executionId, lens]);

  if (!executionId) return null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: 0.04,
            }}
          >
            Why did this execution happen?
          </div>
          {data && (
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "var(--rf-txt)",
                marginTop: 2,
              }}
            >
              {data.ruleName}
            </div>
          )}
        </div>
        {onClose && (
          <button className="rf-btn" onClick={onClose} title="Close">
           
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
            marginBottom: 8,
          }}
        >
          {error}
        </div>
      )}

      {loading && !data ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : !data ? null : (
        <>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: "4px 12px",
              margin: 0,
              fontSize: 12,
            }}
          >
            <dt style={{ color: "var(--rf-txt3)" }}>Status</dt>
            <dd style={{ margin: 0 }}>{data.status}</dd>
            <dt style={{ color: "var(--rf-txt3)" }}>Duration</dt>
            <dd style={{ margin: 0, fontFamily: "monospace" }}>
              {data.durationMs != null ? `${data.durationMs} ms` : "—"}
            </dd>
            <dt style={{ color: "var(--rf-txt3)" }}>Source event</dt>
            <dd style={{ margin: 0, fontFamily: "monospace" }}>
              {data.sourceEventName || "manual"}
            </dd>
            <dt style={{ color: "var(--rf-txt3)" }}>Started</dt>
            <dd style={{ margin: 0 }}>
              {data.startedAt
                ? new Date(data.startedAt).toLocaleString()
                : "—"}
            </dd>
            {data.finishedAt && (
              <>
                <dt style={{ color: "var(--rf-txt3)" }}>Finished</dt>
                <dd style={{ margin: 0 }}>
                  {new Date(data.finishedAt).toLocaleString()}
                </dd>
              </>
            )}
          </dl>

          {data.policyMatched && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--rf-txt3)",
                  textTransform: "uppercase",
                  letterSpacing: 0.04,
                  marginBottom: 4,
                }}
              >
                Policy that gated this fire
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  marginBottom: 4,
                }}
              >
                {data.policyMatched.baseKey}
              </div>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {(data.policyMatched.resolvedFrom ?? []).map((s) => {
                  const sty =
                    POLICY_SCOPE_STYLE[s.scope] ||
                    POLICY_SCOPE_STYLE.ORGANIZATION;
                  return (
                    <li
                      key={`${s.scope}|${s.key}|${s.version}`}
                      style={{
                        padding: 4,
                        borderTop: "1px solid var(--rf-border)",
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          padding: "1px 6px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: sty.bg,
                          color: sty.color,
                        }}
                      >
                        {s.scope}
                      </span>
                      <span style={{ fontSize: 12 }}>{s.key}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontFamily: "monospace",
                          fontSize: 10,
                          color: "var(--rf-txt3)",
                        }}
                      >
                        v{s.version}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {/* The bundle shape matches v9 — reuse WhyPanel with a synthetic
              fetcher that returns the bundle we already have. */}
          <div style={{ marginTop: 12 }}>
            <WhyPanel
              predictionId={executionId}
              fetcher={async () => ({
                title: data.ruleName,
                detail: data.sourceEventName,
                kind: "AUTOMATION_EXECUTION",
                severity: null,
                confidence: null,
                explainability: data.explainability,
              })}
            />
          </div>
        </>
      )}
    </section>
  );
}
