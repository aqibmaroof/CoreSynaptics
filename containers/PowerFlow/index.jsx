"use client";

// ── Phase v15 C1: Power-flow simulator ──────────────────────────────────────
// Server-side deterministic engine. The client collects operator decisions and
// POSTs them to /submit. Render trace[] verbatim — never simulate the graph
// in the browser.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listPowerFlowScenarios,
  startPowerFlowRun,
  submitPowerFlowRun,
  replayPowerFlowRun,
  POWER_FLOW_DIFFICULTIES,
} from "@/services/PowerFlow";

const DIFFICULTY_STYLE = {
  BEGINNER: { color: "var(--rf-green)", bg: "rgba(34,197,94,0.16)" },
  INTERMEDIATE: {
    color: "var(--rf-yellow, #f59e0b)",
    bg: "rgba(245,158,11,0.16)",
  },
  EXPERT: { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" },
};

export default function PowerFlow() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [run, setRun] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const xs = await listPowerFlowScenarios();
        if (!cancelled)
          setScenarios(Array.isArray(xs) ? xs : xs?.items ?? []);
      } catch (e) {
        if (!cancelled)
          setError(e?.message || "Failed to load scenarios");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const start = useCallback(async (scenario) => {
    setBusy(true);
    setError("");
    try {
      const r = await startPowerFlowRun(scenario.id);
      setSelectedScenario(scenario);
      setRun(r);
      setDecisions([]);
    } catch (e) {
      setError(e?.message || "Start failed");
    } finally {
      setBusy(false);
    }
  }, []);

  const submit = async () => {
    if (!run) return;
    setBusy(true);
    setError("");
    try {
      const ordered = [...decisions].sort(
        (a, b) => (a.atTick ?? 0) - (b.atTick ?? 0)
      );
      const r = await submitPowerFlowRun(run.id, ordered);
      setRun(r);
    } catch (e) {
      setError(e?.message || "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  const replay = async () => {
    if (!run) return;
    setBusy(true);
    try {
      const res = await replayPowerFlowRun(run.id);
      setRun(res?.run || res);
    } catch (e) {
      setError(e?.message || "Replay failed");
    } finally {
      setBusy(false);
    }
  };

  const addDecision = (d) => setDecisions((prev) => [...prev, d]);
  const removeDecision = (idx) =>
    setDecisions((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Power-flow simulator</h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Server-side deterministic engine. Decisions submit + trace as returned.
        </p>
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

      {!run ? (
        <ScenarioList
          scenarios={scenarios}
          loading={loading}
          onStart={start}
          busy={busy}
        />
      ) : (
        <Runner
          scenario={selectedScenario}
          run={run}
          decisions={decisions}
          onAddDecision={addDecision}
          onRemoveDecision={removeDecision}
          onSubmit={submit}
          onReplay={replay}
          onPickAnother={() => {
            setRun(null);
            setSelectedScenario(null);
            setDecisions([]);
          }}
          busy={busy}
        />
      )}
    </div>
  );
}

function ScenarioList({ scenarios, loading, onStart, busy }) {
  if (loading && scenarios.length === 0)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (scenarios.length === 0)
    return (
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--rf-txt3)",
        }}
      >
        No scenarios available yet.
      </div>
    );
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 12,
      }}
    >
      {scenarios.map((s) => {
        const sty =
          DIFFICULTY_STYLE[s.difficulty] || DIFFICULTY_STYLE.BEGINNER;
        return (
          <article
            key={s.id}
            className="rf-card"
            style={{ padding: 14 }}
          >
            <header
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 6,
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
                {s.difficulty}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</span>
            </header>
            {s.description && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--rf-txt3)",
                  marginBottom: 8,
                }}
              >
                {s.description}
              </div>
            )}
            <div
              style={{ fontSize: 11, color: "var(--rf-txt3)", marginBottom: 8 }}
            >
              {s.graph?.nodes?.length ?? 0} nodes ·{" "}
              {s.graph?.edges?.length ?? 0} edges · passing score{" "}
              {s.passingScore}
            </div>
            <button
              className="rf-btn rf-btn-primary"
              onClick={() => onStart(s)}
              disabled={busy}
            >
              Start scenario
            </button>
          </article>
        );
      })}
    </div>
  );
}

function Runner({
  scenario,
  run,
  decisions,
  onAddDecision,
  onRemoveDecision,
  onSubmit,
  onReplay,
  onPickAnother,
  busy,
}) {
  const completed = run.status === "COMPLETED" || run.status === "ABORTED";
  const traceLatest = useMemo(() => {
    const trace = run.trace || [];
    return trace[trace.length - 1] || null;
  }, [run]);

  const [draft, setDraft] = useState({
    atTick: 0,
    op: "SET_STATE",
    nodeId: "",
    newState: "CLOSED",
    newLoadKw: "",
  });

  const submitDraft = () => {
    if (!draft.nodeId) return;
    onAddDecision({
      atTick: Number(draft.atTick) || 0,
      op: draft.op,
      nodeId: draft.nodeId,
      newState: draft.op === "SET_STATE" ? draft.newState : undefined,
      newLoadKw:
        draft.op === "SET_LOAD" && draft.newLoadKw !== ""
          ? Number(draft.newLoadKw)
          : undefined,
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr",
        gap: 16,
      }}
    >
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
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            {scenario?.title}
          </span>
          <span
            style={{
              padding: "1px 8px",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 4,
              background:
                run.status === "COMPLETED"
                  ? "rgba(34,197,94,0.16)"
                  : run.status === "ABORTED"
                  ? "rgba(239,68,68,0.16)"
                  : "rgba(59,130,246,0.16)",
              color:
                run.status === "COMPLETED"
                  ? "var(--rf-green)"
                  : run.status === "ABORTED"
                  ? "var(--rf-red)"
                  : "var(--rf-blue, #3b82f6)",
            }}
          >
            {run.status}
          </span>
          {run.score != null && (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 13,
                color:
                  run.score >= (scenario?.passingScore || 70)
                    ? "var(--rf-green)"
                    : "var(--rf-red)",
                fontWeight: 700,
              }}
            >
              Score: {run.score} / {scenario?.passingScore || 100}
            </span>
          )}
        </header>

        <SectionHeader title="Graph nodes" />
        <NodeList nodes={scenario?.graph?.nodes || []} latest={traceLatest} />

        <SectionHeader title={`Trace (${(run.trace || []).length} ticks)`} />
        {(run.trace || []).length === 0 ? (
          <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            No trace yet — submit decisions to score.
          </div>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {(run.trace || []).map((t, i) => (
              <li
                key={i}
                style={{
                  padding: 6,
                  borderTop: "1px solid var(--rf-border)",
                  fontSize: 12,
                }}
              >
                <code style={{ fontFamily: "monospace" }}>tick {t.tick}</code>{" "}
                · {t.cause} · powered{" "}
                {(t.poweredNodeIds || []).length} · load {t.totalLoadKw} kW
              </li>
            ))}
          </ol>
        )}
      </section>

      <aside className="rf-card" style={{ padding: 14 }}>
        <SectionHeader title="Operator decisions" />
        <Field label="At tick">
          <input
            type="number"
            min={0}
            className="rf-input"
            value={draft.atTick}
            onChange={(e) =>
              setDraft({ ...draft, atTick: e.target.value })
            }
          />
        </Field>
        <Field label="Op">
          <select
            className="rf-input"
            value={draft.op}
            onChange={(e) => setDraft({ ...draft, op: e.target.value })}
          >
            <option value="SET_STATE">SET_STATE</option>
            <option value="SET_LOAD">SET_LOAD</option>
          </select>
        </Field>
        <Field label="Node id">
          <select
            className="rf-input"
            value={draft.nodeId}
            onChange={(e) => setDraft({ ...draft, nodeId: e.target.value })}
          >
            <option value="">— pick —</option>
            {(scenario?.graph?.nodes || []).map((n) => (
              <option key={n.id} value={n.id}>
                {n.id} · {n.kind} · {n.label}
              </option>
            ))}
          </select>
        </Field>
        {draft.op === "SET_STATE" ? (
          <Field label="New state">
            <select
              className="rf-input"
              value={draft.newState}
              onChange={(e) =>
                setDraft({ ...draft, newState: e.target.value })
              }
            >
              <option value="CLOSED">CLOSED</option>
              <option value="OPEN">OPEN</option>
              <option value="PRIMARY">PRIMARY</option>
              <option value="SECONDARY">SECONDARY</option>
            </select>
          </Field>
        ) : (
          <Field label="New load (kW)">
            <input
              type="number"
              className="rf-input"
              value={draft.newLoadKw}
              onChange={(e) =>
                setDraft({ ...draft, newLoadKw: e.target.value })
              }
            />
          </Field>
        )}
        <button
          className="rf-btn"
          onClick={submitDraft}
          disabled={busy || completed || !draft.nodeId}
        >
          + Queue decision
        </button>

        <SectionHeader title={`Queued (${decisions.length})`} />
        {decisions.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>None.</div>
        ) : (
          <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {decisions.map((d, i) => (
              <li
                key={i}
                style={{
                  padding: 6,
                  borderTop: "1px solid var(--rf-border)",
                  fontSize: 12,
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <span style={{ fontFamily: "monospace" }}>
                  t={d.atTick}
                </span>
                <span>
                  {d.op} {d.nodeId} →{" "}
                  {d.newState ?? `${d.newLoadKw} kW`}
                </span>
                <button
                  className="rf-btn"
                  onClick={() => onRemoveDecision(i)}
                  disabled={busy || completed}
                  style={{ marginLeft: "auto", fontSize: 10 }}
                >
                 
                </button>
              </li>
            ))}
          </ol>
        )}

        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            className="rf-btn rf-btn-primary"
            onClick={onSubmit}
            disabled={busy || completed || decisions.length === 0}
          >
            Submit & score
          </button>
          <button
            className="rf-btn"
            onClick={onReplay}
            disabled={busy || !completed}
          >
            Replay deterministically
          </button>
          <button
            className="rf-btn"
            onClick={onPickAnother}
            disabled={busy}
            style={{ marginLeft: "auto" }}
          >
            Pick another
          </button>
        </div>
      </aside>
    </div>
  );
}

function NodeList({ nodes, latest }) {
  if (!nodes.length)
    return <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>None.</div>;
  const powered = new Set(latest?.poweredNodeIds || []);
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 4,
      }}
    >
      {nodes.map((n) => {
        const on = powered.has(n.id);
        return (
          <li
            key={n.id}
            style={{
              padding: 6,
              border: "1px solid var(--rf-border)",
              borderRadius: 6,
              background: on ? "rgba(34,197,94,0.08)" : "transparent",
            }}
          >
            <div style={{ fontSize: 11, fontFamily: "monospace" }}>
              {n.id}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{n.label}</div>
            <div style={{ fontSize: 10, color: "var(--rf-txt3)" }}>
              {n.kind}
              {n.state ? ` · ${n.state}` : ""}
              {on ? " ·" : ""}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--rf-txt3)",
        textTransform: "uppercase",
        letterSpacing: 0.04,
        margin: "10px 0 6px",
      }}
    >
      {title}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--rf-txt3)",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
