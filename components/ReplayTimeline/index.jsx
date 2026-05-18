"use client";

// ── Phase 12 PR-2: Replay timeline ───────────────────────────────────────────
// Server merges STEP + EVENT entries in chronological order. Render as-is —
// never re-sort, never re-merge on the client.

import { useCallback, useEffect, useState } from "react";
import { replaySimulationRun } from "@/services/Learning";

export default function ReplayTimeline({ runId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    setError("");
    try {
      const res = await replaySimulationRun(runId);
      setData(res);
    } catch (e) {
      setError(e?.message || "Failed to load replay");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!runId) return null;
  if (loading && !data)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading replay…</div>;
  if (error)
    return (
      <div
        style={{
          padding: 10,
          background: "rgba(239,68,68,0.12)",
          color: "var(--rf-red)",
          borderRadius: 6,
        }}
      >
        {error}
      </div>
    );
  if (!data) return null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--rf-txt)",
          }}
        >
          {data.scenarioTitle}
        </div>
        <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
          {data.status} · {data.totalSteps} steps ·{" "}
          {data.startedAt
            ? new Date(data.startedAt).toLocaleString()
            : "—"}
          {data.finishedAt
            ? ` → ${new Date(data.finishedAt).toLocaleString()}`
            : ""}
        </div>
      </header>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {(data.entries ?? []).map((e, i) => (
          <li
            key={`${e.at}-${i}`}
            style={{
              padding: 8,
              borderTop: "1px solid var(--rf-border)",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 4,
                background:
                  e.kind === "STEP"
                    ? "var(--rf-bg3)"
                    : "rgba(59,130,246,0.16)",
                color:
                  e.kind === "STEP"
                    ? "var(--rf-txt3)"
                    : "var(--rf-blue, #3b82f6)",
              }}
            >
              {e.kind}
            </span>
            <div style={{ flex: 1, minWidth: 0, fontSize: 12 }}>
              {e.kind === "STEP" ? (
                <>
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "var(--rf-txt3)",
                    }}
                  >
                    #{e.ordinal}
                  </span>{" "}
                  <strong>{e.decision}</strong>
                  {typeof e.elapsedMs === "number" && (
                    <span
                      style={{
                        color: "var(--rf-txt3)",
                        marginLeft: 6,
                      }}
                    >
                      ({Math.round(e.elapsedMs / 1000)}s)
                    </span>
                  )}
                </>
              ) : (
                <span>{e.message}</span>
              )}
              <div style={{ color: "var(--rf-txt3)", fontSize: 11 }}>
                {e.at ? new Date(e.at).toLocaleString() : "—"}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
