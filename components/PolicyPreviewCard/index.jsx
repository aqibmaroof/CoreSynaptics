"use client";

// ── Phase 11 PR-1: Policy preview card ───────────────────────────────────────
// Shows which org-policy would govern a rule right now — the resolved
// org → lens → project chain plus the effective config. Informational only;
// the actual decision is made server-side by the policy evaluator. Do NOT
// parse the config to predict whether the rule will fire.

import { useEffect, useState } from "react";
import {
  policyPreviewForRule,
  POLICY_SCOPE_STYLE,
} from "@/services/AutomationIntelligence";

export default function PolicyPreviewCard({ ruleId, lens, cxProjectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ruleId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await policyPreviewForRule(ruleId, {
          lens: lens || undefined,
          cxProjectId: cxProjectId || undefined,
        });
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Failed to load policy preview");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ruleId, lens, cxProjectId]);

  if (!ruleId) return null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--rf-txt2)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.04,
        }}
      >
        Policy that would apply
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
          <div style={{ fontSize: 12, color: "var(--rf-txt3)", marginBottom: 8 }}>
            <span style={{ fontFamily: "monospace" }}>
              {data.policy.policyType}
            </span>
            {" · "}
            {data.policy.baseKey}
          </div>
          {(data.policy.resolvedFrom ?? []).length === 0 ? (
            <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
              No policy bound — backend defaults apply.
            </div>
          ) : (
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {data.policy.resolvedFrom.map((s, i) => {
                const sty =
                  POLICY_SCOPE_STYLE[s.scope] || POLICY_SCOPE_STYLE.ORGANIZATION;
                return (
                  <li
                    key={`${s.scope}|${s.key}|${s.version}`}
                    style={{
                      padding: 6,
                      borderTop:
                        i === 0 ? "none" : "1px solid var(--rf-border)",
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        padding: "1px 8px",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 4,
                        background: sty.bg,
                        color: sty.color,
                      }}
                    >
                      {s.scope}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--rf-txt)",
                      }}
                    >
                      {s.key}
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                      }}
                    >
                      v{s.version}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}

          <details style={{ marginTop: 10 }}>
            <summary
              style={{
                fontSize: 12,
                color: "var(--rf-txt3)",
                cursor: "pointer",
              }}
            >
              Effective config
            </summary>
            <pre
              style={{
                marginTop: 6,
                padding: 8,
                background: "var(--rf-bg2)",
                borderRadius: 6,
                fontSize: 11,
                overflow: "auto",
                maxHeight: 240,
              }}
            >
              {JSON.stringify(data.policy.config ?? {}, null, 2)}
            </pre>
          </details>
        </>
      )}
    </section>
  );
}
