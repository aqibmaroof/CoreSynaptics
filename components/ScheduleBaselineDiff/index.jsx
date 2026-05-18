"use client";

// ── Phase v15 B4: Schedule baseline vs actual diff ───────────────────────────
// Variance + status come from the server. Render `varianceDays` and `status`
// exactly as returned — NEVER compute in the browser.

import { useCallback, useEffect, useState } from "react";
import {
  listBaselines,
  freezeBaseline,
  activateBaseline,
  baselineDiff,
  VARIANCE_STATUS_STYLE,
} from "@/services/ScheduleBaseline";

export default function ScheduleBaselineDiff({ cxProjectId }) {
  const [baselines, setBaselines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!cxProjectId) return;
    setLoading(true);
    setError("");
    try {
      const list = await listBaselines(cxProjectId);
      const items = Array.isArray(list) ? list : list?.items ?? [];
      setBaselines(items);
      const active = items.find((b) => b.isActive) || items[0];
      setSelected(active?.id || null);
    } catch (e) {
      setError(e?.message || "Failed to load baselines");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!cxProjectId || !selected) {
      setDiff(null);
      return;
    }
    let cancelled = false;
    baselineDiff(cxProjectId, selected)
      .then((d) => !cancelled && setDiff(d))
      .catch(
        (e) => !cancelled && setError(e?.message || "Diff failed")
      );
    return () => {
      cancelled = true;
    };
  }, [cxProjectId, selected]);

  const freeze = async () => {
    const label = window.prompt('Baseline label (e.g. "Contract Baseline")');
    if (!label) return;
    const notes = window.prompt("Notes (optional)") || undefined;
    setBusy(true);
    try {
      await freezeBaseline(cxProjectId, label, notes);
      await reload();
    } catch (e) {
      setError(e?.message || "Freeze failed");
    } finally {
      setBusy(false);
    }
  };

  const activate = async (id) => {
    setBusy(true);
    try {
      await activateBaseline(id);
      await reload();
    } catch (e) {
      setError(e?.message || "Activate failed");
    } finally {
      setBusy(false);
    }
  };

  if (!cxProjectId) return null;

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 10,
          flexWrap: "wrap",
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
          Baseline vs actual
        </div>
        <select
          className="rf-input"
          value={selected || ""}
          onChange={(e) => setSelected(e.target.value || null)}
          style={{ marginLeft: "auto" }}
        >
          {baselines.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label} {b.isActive ? "· active" : ""}
            </option>
          ))}
          {baselines.length === 0 && <option value="">no baseline yet</option>}
        </select>
        <button className="rf-btn" onClick={freeze} disabled={busy}>
          + Freeze
        </button>
        {selected && !baselines.find((b) => b.id === selected)?.isActive && (
          <button
            className="rf-btn"
            onClick={() => activate(selected)}
            disabled={busy}
          >
            Activate
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
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      {baselines.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          {loading ? "Loading…" : "No baseline frozen yet."}
        </div>
      ) : !diff ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading diff…</div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 10,
              flexWrap: "wrap",
            }}
          >
            <Pill tone="green">Ahead · {diff.summary?.ahead ?? 0}</Pill>
            <Pill>On track · {diff.summary?.onTrack ?? 0}</Pill>
            <Pill tone="red">
              Behind · {diff.summary?.behind ?? 0} (Δ{" "}
              {diff.summary?.criticalDelta ?? 0}d)
            </Pill>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Milestone</th>
                <th style={th}>Phase</th>
                <th style={th}>Baseline end</th>
                <th style={th}>Actual / scheduled</th>
                <th style={{ ...th, textAlign: "right" }}>Δ days</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(diff.rows || []).map((r) => {
                const sty =
                  VARIANCE_STATUS_STYLE[r.status] ||
                  VARIANCE_STATUS_STYLE.unknown;
                return (
                  <tr
                    key={r.scheduleMilestoneId}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      {r.name}
                      {r.deleted && (
                        <span
                          style={{
                            marginLeft: 4,
                            fontSize: 10,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          (deleted)
                        </span>
                      )}
                    </td>
                    <td style={td}>{r.phaseKey || "—"}</td>
                    <td style={td}>
                      {r.baselineEnd
                        ? String(r.baselineEnd).slice(0, 10)
                        : "—"}
                    </td>
                    <td style={td}>
                      {r.actualEnd
                        ? String(r.actualEnd).slice(0, 10)
                        : r.scheduledEnd
                        ? String(r.scheduledEnd).slice(0, 10)
                        : "—"}
                    </td>
                    <td
                      style={{
                        ...td,
                        textAlign: "right",
                        fontFamily: "monospace",
                        color:
                          r.varianceDays != null && r.varianceDays > 0
                            ? "var(--rf-red)"
                            : r.varianceDays != null && r.varianceDays < 0
                            ? "var(--rf-green)"
                            : undefined,
                      }}
                    >
                      {r.varianceDays ?? "—"}
                    </td>
                    <td style={td}>
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
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}

function Pill({ children, tone }) {
  const map = {
    green: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
    red: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
  };
  const sty = tone && map[tone] ? map[tone] : { color: "var(--rf-txt2)", bg: "var(--rf-bg3)" };
  return (
    <span
      style={{
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 4,
        background: sty.bg,
        color: sty.color,
      }}
    >
      {children}
    </span>
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
