"use client";

// ── Phase 12 PR-4: Competency panel ──────────────────────────────────────────
// Per-user competency table with manual Recompute button. recompute is costly
// (~1500 evidence rows) — call after known evidence changes, not on render.

import { useCallback, useEffect, useState } from "react";
import {
  listCompetency,
  recomputeCompetency,
  COMPETENCY_LEVEL_STYLE,
} from "@/services/Learning";

export default function CompetencyPanel({ userId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await listCompetency(userId);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load competency");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recompute = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      await recomputeCompetency(userId);
      await refresh();
    } catch (e) {
      setError(e?.message || "Recompute failed");
    } finally {
      setBusy(false);
    }
  };

  if (!userId) return null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--rf-txt)",
            textTransform: "uppercase",
            letterSpacing: 0.04,
          }}
        >
          Competency
        </div>
        <button
          className="rf-btn"
          onClick={recompute}
          disabled={busy || loading}
        >
          {busy ? "Recomputing…" : "Recompute from latest evidence"}
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

      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No competency records. Hit Recompute after the user gains evidence
          (certs / simulation finalize / training session).
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--rf-bg2)" }}>
              <th style={th}>Skill</th>
              <th style={th}>Level</th>
              <th style={{ ...th, textAlign: "right" }}>Score</th>
              <th style={th}>Last evidence</th>
              <th style={{ ...th, textAlign: "right" }}>Sources</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const sty =
                COMPETENCY_LEVEL_STYLE[c.level] ||
                COMPETENCY_LEVEL_STYLE.NOVICE;
              return (
                <tr
                  key={c.skillKey}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{c.skillKey}</td>
                  <td style={td}>
                    <span
                      style={{
                        padding: "2px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 4,
                        background: sty.bg,
                        color: sty.color,
                      }}
                    >
                      {c.level}
                    </span>
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {c.score}
                  </td>
                  <td style={td}>
                    {c.lastEvidenceAt
                      ? new Date(c.lastEvidenceAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      fontFamily: "monospace",
                    }}
                  >
                    {c.evidenceCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

const th = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "8px 10px", fontSize: 12, color: "var(--rf-txt)" };
