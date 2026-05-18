"use client";

// ── Phase 7 PR-3: Copilot inbox card (top of MyWork) ─────────────────────────
// Always shows the top N recommendations across the user's work surface.
// Reads through the canonical next-action engine — never invents work that
// isn't in MyWork.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  nextActions,
  COPILOT_PRIORITY_STYLE,
  RECOMMENDATION_KIND_LABEL,
} from "@/services/Copilot";
import { hrefForNode } from "@/services/KnowledgeGraph";

// Phase 10 PR-2: switched data source from v7 /copilot/inbox to v10
// /copilot/next-actions — richer payload (confidence, lenses, steps,
// explainability), same render shape.

export default function CopilotInboxCard({ lens, limit = 5 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const lensRef = useRef(lens);
  useEffect(() => {
    lensRef.current = lens;
  }, [lens]);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await nextActions({
          lens: lensRef.current || undefined,
          limit: 20,
        });
        if (!cancelled) {
          // Normalize { recommendations, evaluatedAt, lens } to the existing
          // shape this card expects.
          setData({
            evaluatedAt: res?.evaluatedAt,
            lens: res?.lens,
            recommendations: res?.recommendations ?? [],
          });
          setError("");
        }
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Failed to load next actions");
      }
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  if (error) {
    return (
      <section
        className="rf-card"
        style={{
          padding: 12,
          fontSize: 12,
          color: "var(--rf-red)",
        }}
      >
        {error}
      </section>
    );
  }
  if (!data || !data.recommendations?.length) return null;

  const top = data.recommendations.slice(0, limit);
  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--rf-txt)",
              textTransform: "uppercase",
              letterSpacing: 0.04,
            }}
          >
            Suggested next actions
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            Lens · {data.lens || "default"} · evaluated{" "}
            {data.evaluatedAt
              ? new Date(data.evaluatedAt).toLocaleTimeString()
              : "—"}
          </div>
        </div>
      </header>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {top.map((r, i) => {
          const ps =
            COPILOT_PRIORITY_STYLE[r.priority] || COPILOT_PRIORITY_STYLE.NORMAL;
          const href = r.targetEntity
            ? hrefForNode({
                entityType: r.targetEntity.entityType,
                entityId: r.targetEntity.entityId,
              })
            : null;
          const body = (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    padding: "2px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 4,
                    background: ps.bg,
                    color: ps.color,
                  }}
                >
                  {r.priority}
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "var(--rf-txt3)",
                  }}
                >
                  {RECOMMENDATION_KIND_LABEL[r.kind] || r.kind}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--rf-txt)",
                  }}
                >
                  {r.title}
                </span>
              </div>
              {r.detail && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--rf-txt2)",
                    marginBottom: 4,
                  }}
                >
                  {r.detail}
                </div>
              )}
              {(r.rationale ?? []).length > 0 && (
                <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                  {r.rationale.join(" · ")}
                </div>
              )}
            </>
          );
          return (
            <li
              key={`${r.kind}:${r.targetEntity?.entityId ?? r.title}:${i}`}
              style={{
                padding: 10,
                borderTop: i === 0 ? "none" : "1px solid var(--rf-border)",
              }}
            >
              {href ? (
                <Link
                  href={href}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
