"use client";

// ── Phase 12 PR-2: Simulation runner ─────────────────────────────────────────
// Reads /simulations/runs/:id + /simulations/scenarios/:id then drives the run
// via advance / pause / resume / abort / finalize. Strictly monotonic — the
// disabled state prevents double-submit. Step body never leaks the answer key.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSimulationRun,
  getScenario,
  advanceSimulationRun,
  pauseSimulationRun,
  resumeSimulationRun,
  abortSimulationRun,
  finalizeSimulationRun,
  injectSimulationEvent,
  DEFAULT_DECISIONS,
  SIM_STATUS_STYLE,
} from "@/services/Learning";
import OutcomeScorecard from "@/components/OutcomeScorecard";

const TERMINAL = new Set(["COMPLETED", "ABORTED", "FAILED"]);

export default function SimulationRunner({ runId, onFinalized }) {
  const [run, setRun] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState(null);
  const [evidence, setEvidence] = useState("");
  const [showInject, setShowInject] = useState(false);
  const [injectDraft, setInjectDraft] = useState({ message: "", payload: {} });

  const refresh = useCallback(async () => {
    if (!runId) return;
    setLoading(true);
    setError("");
    try {
      const r = await getSimulationRun(runId);
      setRun(r);
      if (r?.scenarioId) {
        const s = await getScenario(r.scenarioId);
        setScenario(s);
      }
    } catch (e) {
      setError(e?.message || "Failed to load run");
    } finally {
      setLoading(false);
    }
  }, [runId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isTerminal = run && TERMINAL.has(run.status);

  const step = useMemo(() => {
    if (!run || !scenario) return null;
    return (scenario.steps ?? []).find(
      (s) => s.ordinal === run.currentStep + 1
    );
  }, [run, scenario]);

  const advance = async (decision) => {
    setBusy(true);
    try {
      let evObj;
      if (evidence.trim()) {
        try {
          evObj = JSON.parse(evidence);
        } catch {
          evObj = { note: evidence };
        }
      }
      const r = await advanceSimulationRun(runId, {
        decision,
        evidence: evObj,
      });
      setRun(r);
      setEvidence("");
    } catch (e) {
      setError(e?.message || "Advance failed");
    } finally {
      setBusy(false);
    }
  };

  const pause = async () => {
    setBusy(true);
    try {
      const r = await pauseSimulationRun(runId);
      setRun(r);
    } catch (e) {
      setError(e?.message || "Pause failed");
    } finally {
      setBusy(false);
    }
  };

  const resume = async () => {
    setBusy(true);
    try {
      const r = await resumeSimulationRun(runId);
      setRun(r);
    } catch (e) {
      setError(e?.message || "Resume failed");
    } finally {
      setBusy(false);
    }
  };

  const abort = async () => {
    const reason = window.prompt("Abort reason?");
    if (!reason) return;
    setBusy(true);
    try {
      const r = await abortSimulationRun(runId, reason);
      setRun(r);
    } catch (e) {
      setError(e?.message || "Abort failed");
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    try {
      const o = await finalizeSimulationRun(runId);
      setOutcome(o);
      onFinalized?.(o);
    } catch (e) {
      setError(e?.message || "Finalize failed");
    } finally {
      setBusy(false);
    }
  };

  const inject = async () => {
    setBusy(true);
    try {
      const r = await injectSimulationEvent(runId, {
        message: injectDraft.message,
        payload:
          Object.keys(injectDraft.payload || {}).length
            ? injectDraft.payload
            : undefined,
      });
      setRun(r);
      setShowInject(false);
      setInjectDraft({ message: "", payload: {} });
    } catch (e) {
      setError(e?.message || "Inject failed");
    } finally {
      setBusy(false);
    }
  };

  if (!runId)
    return (
      <div style={{ color: "var(--rf-txt3)", padding: 14 }}>
        Pick a run.
      </div>
    );

  if (loading && !run)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading run…</div>;

  if (!run || !scenario)
    return error ? (
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
    ) : (
      <div style={{ color: "var(--rf-txt3)" }}>Loading run…</div>
    );

  const sty = SIM_STATUS_STYLE[run.status] || SIM_STATUS_STYLE.PENDING;

  return (
    <section className="rf-card" style={{ padding: 16 }}>
      <header style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
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
            {run.status}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>
            {scenario.title}
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "var(--rf-txt3)",
            }}
          >
            {scenario.role} · {scenario.difficulty}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginTop: 6,
          }}
        >
          <progress
            value={run.currentStep}
            max={run.totalSteps}
            style={{ flex: 1 }}
          />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "var(--rf-txt3)",
            }}
          >
            {run.currentStep} / {run.totalSteps}
          </span>
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
            marginBottom: 8,
          }}
        >
          {error}
        </div>
      )}

      {run.status === "RUNNING" && step && (
        <article style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Step {step.ordinal}: {step.title}
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--rf-txt2)",
              margin: "6px 0",
            }}
          >
            {step.prompt}
          </p>
          {step.severityHint && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 8px",
                borderRadius: 4,
                background: "rgba(245,158,11,0.16)",
                color: "var(--rf-yellow, #f59e0b)",
              }}
            >
              severity hint · {step.severityHint}
            </span>
          )}
          <div style={{ marginTop: 10 }}>
            <label
              style={{
                fontSize: 11,
                color: "var(--rf-txt3)",
                marginBottom: 4,
                display: "block",
              }}
            >
              Evidence (optional, plain text or JSON)
            </label>
            <input
              className="rf-input"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder='e.g. "saw breaker open at 14:02"'
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            {DEFAULT_DECISIONS.map((d) => (
              <button
                key={d}
                className="rf-btn rf-btn-primary"
                onClick={() => advance(d)}
                disabled={busy}
              >
                {d}
              </button>
            ))}
            <button
              className="rf-btn"
              onClick={() => {
                const custom = window.prompt("Custom decision label?");
                if (custom) advance(custom);
              }}
              disabled={busy}
            >
              Custom…
            </button>
          </div>
        </article>
      )}

      {run.status === "PAUSED" && (
        <div
          style={{
            padding: 10,
            background: "var(--rf-bg2)",
            borderRadius: 6,
            marginBottom: 10,
            color: "var(--rf-txt2)",
            fontSize: 13,
          }}
        >
          Run is paused.
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {run.status === "RUNNING" && (
          <button className="rf-btn" onClick={pause} disabled={busy}>
            Pause
          </button>
        )}
        {run.status === "PAUSED" && (
          <button
            className="rf-btn rf-btn-primary"
            onClick={resume}
            disabled={busy}
          >
            Resume
          </button>
        )}
        {!isTerminal && (
          <>
            <button
              className="rf-btn"
              onClick={abort}
              disabled={busy}
              style={{ color: "var(--rf-red)" }}
            >
              Abort
            </button>
            <button
              className="rf-btn"
              onClick={() => setShowInject(true)}
              disabled={busy}
            >
              Inject event (instructor)
            </button>
          </>
        )}
        {isTerminal && (
          <button
            className="rf-btn rf-btn-primary"
            onClick={finalize}
            disabled={busy}
          >
            Finalize & score
          </button>
        )}
        <button className="rf-btn" onClick={refresh} disabled={busy}>
          Refresh
        </button>
      </div>

      {outcome && (
        <div style={{ marginTop: 12 }}>
          <OutcomeScorecard outcome={outcome} />
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        <Section title="Step log">
          {(run.stepLog ?? []).length === 0 ? (
            <Muted>No steps recorded yet.</Muted>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {run.stepLog.map((entry, i) => (
                <li
                  key={`${entry.ordinal}-${i}`}
                  style={{
                    padding: 6,
                    borderTop: "1px solid var(--rf-border)",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "var(--rf-txt3)",
                    }}
                  >
                    #{entry.ordinal}
                  </span>{" "}
                  <strong>{entry.decision}</strong>
                  <span
                    style={{
                      marginLeft: 6,
                      color: "var(--rf-txt3)",
                      fontSize: 11,
                    }}
                  >
                    {entry.at ? new Date(entry.at).toLocaleString() : "—"}
                    {typeof entry.elapsedMs === "number"
                      ? ` · ${Math.round(entry.elapsedMs / 1000)}s`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Event log">
          {(run.eventLog ?? []).length === 0 ? (
            <Muted>No events.</Muted>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {run.eventLog.map((entry, i) => (
                <li
                  key={`${entry.at}-${i}`}
                  style={{
                    padding: 6,
                    borderTop: "1px solid var(--rf-border)",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "var(--rf-txt3)",
                      marginRight: 6,
                    }}
                  >
                    {entry.kind}
                  </span>
                  {entry.message}
                  <span
                    style={{
                      marginLeft: 6,
                      color: "var(--rf-txt3)",
                      fontSize: 11,
                    }}
                  >
                    {entry.at ? new Date(entry.at).toLocaleString() : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {showInject && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setShowInject(false)}
        >
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 540, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Inject instructor event
            </h2>
            <Field label="Message">
              <input
                className="rf-input"
                value={injectDraft.message}
                onChange={(e) =>
                  setInjectDraft({ ...injectDraft, message: e.target.value })
                }
              />
            </Field>
            <Field label="Payload (JSON, optional)">
              <textarea
                className="rf-input"
                rows={5}
                value={JSON.stringify(injectDraft.payload ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    setInjectDraft({
                      ...injectDraft,
                      payload: JSON.parse(e.target.value || "{}"),
                    });
                  } catch {
                    /* swallow until valid */
                  }
                }}
              />
            </Field>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 12,
              }}
            >
              <button
                className="rf-btn"
                onClick={() => setShowInject(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={inject}
                disabled={busy || !injectDraft.message}
              >
                Inject
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Section({ title, children }) {
  return (
    <details open>
      <summary
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
          cursor: "pointer",
          marginBottom: 4,
        }}
      >
        {title}
      </summary>
      {children}
    </details>
  );
}

function Muted({ children }) {
  return (
    <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>{children}</div>
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
