"use client";

// ── Phase 12 PR-2: Scenario picker ───────────────────────────────────────────
// List view only — does NOT render step bodies (the list payload intentionally
// omits them). Open detail via onSelect to view full step list before start.

import { useCallback, useEffect, useState } from "react";
import { listScenarios } from "@/services/Learning";

const ROLES = ["", "gc_pm", "fse", "oem_engineer", "cx_lead"];
const DIFFICULTIES = ["", "easy", "medium", "hard"];

export default function ScenarioPicker({ onSelect }) {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listScenarios({
        role: role || undefined,
        difficulty: difficulty || undefined,
        limit: 100,
      });
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load scenarios");
    } finally {
      setLoading(false);
    }
  }, [role, difficulty]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <section>
      <header style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>Role</label>
          <select
            className="rf-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r || "any"} value={r}>
                {r || "Any"}
              </option>
            ))}
          </select>
          <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            Difficulty
          </label>
          <select
            className="rf-input"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d || "any"} value={d}>
                {d || "Any"}
              </option>
            ))}
          </select>
          <button className="rf-btn" onClick={refresh} disabled={loading}>
            {loading ? "…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No scenarios match this filter.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {rows.map((s) => (
            <li key={s.id} className="rf-card" style={{ marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => onSelect?.(s)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: 12,
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                }}
              >
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
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--rf-txt)",
                    }}
                  >
                    {s.title}
                  </span>
                  {s.isPlatform && (
                    <span
                      style={{
                        padding: "1px 6px",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 4,
                        background: "var(--rf-bg3)",
                        color: "var(--rf-txt3)",
                      }}
                    >
                      platform
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
                  {s.role} · {s.difficulty} · {s.totalSteps} steps
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
