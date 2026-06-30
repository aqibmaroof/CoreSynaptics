"use client";

// ── Phase 10 PR-2..5: Reusable Recommendations renderer ──────────────────────
// One card serves: MyWork (NBA), entity right rail, project Blockers strip,
// Escalations card, Readiness guidance, and the lens-routed project Copilot
// page. Caller supplies a `fetcher(params)` that returns RecommendationPage.
//
// Each row carries inline "Why?" and "Open flow" controls. "Why?" mounts the
// shared v9 WhyPanel with a recommendation-specific fetcher; "Open flow"
// surfaces the GuidedFlowDrawer beneath the row.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  RECOMMENDATION_KIND_LABEL,
  COPILOT_PRIORITY_STYLE,
  explainRecommendation,
} from "@/services/Copilot";
import { hrefForNode } from "@/services/KnowledgeGraph";
import WhyPanel from "@/components/WhyPanel";
import GuidedFlowDrawer from "@/components/GuidedFlowDrawer";

const PRIORITY_RANK = { CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 };

export default function RecommendationsCard({
  title,
  fetcher,
  params = {},
  lens,
  cxProjectId,
  topN = 12,
  emptyMessage = "No recommendations.",
  showLens = true,
}) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whyId, setWhyId] = useState(null);
  const [flowRec, setFlowRec] = useState(null);

  // Callers commonly pass `fetcher` as an inline arrow and `params` as an inline
  // object literal, so both get a new identity on every render. Depending on
  // them directly would re-run the effect → setState → re-render → re-run,
  // hammering the endpoint in an infinite loop (and tripping the 429 limiter).
  // Keep the latest fetcher in a ref, and trigger the fetch off a stable key
  // derived from the actual VALUES that should cause a refetch.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const fetchKey = useMemo(
    () => JSON.stringify({ params: params ?? {}, lens: lens ?? null, cxProjectId: cxProjectId ?? null }),
    [params, lens, cxProjectId],
  );

  const load = useCallback(async () => {
    const fn = fetcherRef.current;
    if (!fn) return;
    setLoading(true);
    setError("");
    try {
      const res = await fn({ ...(params ?? {}), lens });
      setPage(res);
    } catch (e) {
      setError(e?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
    // params/lens are captured via fetchKey; reading the latest fetcher from the
    // ref keeps this callback identity stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(
    () =>
      [...(page?.recommendations ?? [])].sort(
        (a, b) =>
          (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9) ||
          (b.rankScore ?? 0) - (a.rankScore ?? 0)
      ),
    [page]
  );
  const top = sorted.slice(0, topN);

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
            {title}
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
            {page?.evaluatedAt
              ? `Evaluated ${new Date(page.evaluatedAt).toLocaleString()}`
              : ""}
            {sorted.length ? ` · ${sorted.length} active` : ""}
            {showLens && page?.lens ? ` · lens ${page.lens}` : ""}
          </div>
        </div>
        <button className="rf-btn" onClick={load} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
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

      {loading && !page ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : top.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          {emptyMessage}
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {top.map((r) => (
            <RecommendationRow
              key={r.id}
              rec={r}
              onWhy={() => {
                setFlowRec(null);
                setWhyId(r.id);
              }}
              onFlow={() => {
                setWhyId(null);
                setFlowRec(r);
              }}
            />
          ))}
        </ul>
      )}

      {flowRec && (
        <div style={{ marginTop: 12 }}>
          <GuidedFlowDrawer
            rec={flowRec}
            onClose={() => setFlowRec(null)}
            onWhy={(id) => {
              setFlowRec(null);
              setWhyId(id);
            }}
          />
        </div>
      )}

      {whyId && (
        <div style={{ marginTop: 12 }}>
          <WhyPanel
            predictionId={whyId}
            fetcher={(id) =>
              explainRecommendation(id, cxProjectId || undefined)
            }
            onClose={() => setWhyId(null)}
          />
        </div>
      )}
    </section>
  );
}

function RecommendationRow({ rec, onWhy, onFlow }) {
  const ps =
    COPILOT_PRIORITY_STYLE[rec.priority] || COPILOT_PRIORITY_STYLE.NORMAL;
  const hasFlow = (rec.steps?.length ?? 0) > 0;
  return (
    <li
      style={{
        padding: 8,
        borderTop: "1px solid var(--rf-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          marginBottom: 2,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "1px 8px",
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 4,
            background: ps.bg,
            color: ps.color,
          }}
        >
          {rec.priority}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 10,
            color: "var(--rf-txt3)",
          }}
        >
          {RECOMMENDATION_KIND_LABEL[rec.kind] || rec.kind}
        </span>
        {rec.targetEntity ? (
          <Link
            href={hrefForNode({
              entityType: rec.targetEntity.entityType,
              entityId: rec.targetEntity.entityId,
            })}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--rf-txt)",
              textDecoration: "none",
              flex: 1,
              minWidth: 0,
            }}
          >
            {rec.title}
          </Link>
        ) : (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              flex: 1,
              minWidth: 0,
            }}
          >
            {rec.title}
          </span>
        )}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--rf-txt3)",
          }}
        >
          {rec.confidence ?? "—"}%
        </span>
      </div>
      {rec.detail && (
        <div
          style={{
            fontSize: 12,
            color: "var(--rf-txt2)",
            marginBottom: 4,
          }}
        >
          {rec.detail}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
          fontSize: 11,
          color: "var(--rf-txt3)",
          flexWrap: "wrap",
        }}
      >
        {rec.recommendedOwner?.roleName && (
          <span
            style={{
              padding: "1px 6px",
              borderRadius: 4,
              background: "var(--rf-bg3)",
            }}
          >
            Owner · {rec.recommendedOwner.roleName}
          </span>
        )}
        {(rec.lenses ?? []).map((l) => (
          <span
            key={l}
            style={{
              padding: "1px 6px",
              borderRadius: 4,
              background: "var(--rf-bg3)",
              fontFamily: "monospace",
            }}
          >
            {l}
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {hasFlow && (
            <button
              className="rf-btn"
              onClick={onFlow}
              style={{ fontSize: 11 }}
            >
              Open flow ({rec.steps.length})
            </button>
          )}
          <button
            className="rf-btn"
            onClick={onWhy}
            style={{ fontSize: 11 }}
          >
            Why?
          </button>
        </span>
      </div>
    </li>
  );
}
