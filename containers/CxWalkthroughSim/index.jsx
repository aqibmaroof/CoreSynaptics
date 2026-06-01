"use client";

import { useEffect, useState } from "react";
import {
  getCxSimulations,
  startCxSimulationSession,
  submitCxSimulationAnswer,
  submitCxSimulationFeedback,
} from "@/services/CxWalkthroughSim";

export default function CxWalkthroughSim() {
  const [simulations, setSimulations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getCxSimulations();
        const list = res?.data || res?.items || res || [];
        setSimulations(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e?.message || "Failed to load simulations");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStart = async (simulationId) => {
    try {
      const res = await startCxSimulationSession(simulationId);
      setActiveSession(res?.data || res);
    } catch (e) {
      setError(e?.message || "Failed to start session");
    }
  };

  const handleAnswer = async (stepKey, choiceKey) => {
    if (!activeSession?.id) return;
    try {
      const res = await submitCxSimulationAnswer(activeSession.id, {
        stepKey,
        choiceKey,
      });
      setActiveSession(res?.data || res);
    } catch (e) {
      setError(e?.message || "Failed to submit answer");
    }
  };

  const handleFeedback = async (simulationId, body) => {
    try {
      await submitCxSimulationFeedback(simulationId, body);
    } catch (e) {
      setError(e?.message || "Failed to submit feedback");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--cx-text)",
          marginBottom: 8,
        }}
      >
        Cx Walkthrough Sim
      </h1>
      <p style={{ color: "var(--cx-text-muted)", marginBottom: 16 }}>
        Step-by-step simulation mirroring real-world customer scenarios with
        decision points, immediate feedback, and scoring.
      </p>

      {loading && (
        <div style={{ color: "var(--cx-text-muted)" }}>Loading…</div>
      )}
      {error && <div style={{ color: "var(--rf-red)" }}>{error}</div>}

      {!loading && !error && (
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--cx-text)",
              marginBottom: 8,
            }}
          >
            Available Simulations ({simulations.length})
          </div>
          <ul style={{ color: "var(--cx-text-muted)" }}>
            {simulations.map((s) => (
              <li
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span>{s.name || s.title}</span>
                <button
                  className="rf-btn rf-btn-primary"
                  onClick={() => handleStart(s.id)}
                >
                  Start
                </button>
              </li>
            ))}
          </ul>

          {activeSession && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--cx-text)",
                  marginBottom: 4,
                }}
              >
                Session: {activeSession.id}
              </div>
              <div style={{ color: "var(--cx-text-muted)" }}>
                Score: {activeSession.score ?? "—"}
              </div>
              {activeSession.currentStep && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: "var(--cx-text)" }}>
                    {activeSession.currentStep.prompt}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {(activeSession.currentStep.choices || []).map((c) => (
                      <button
                        key={c.key}
                        className="rf-btn rf-btn-secondary"
                        onClick={() =>
                          handleAnswer(
                            activeSession.currentStep.key,
                            c.key,
                          )
                        }
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                className="rf-btn rf-btn-ghost"
                style={{ marginTop: 12 }}
                onClick={() =>
                  handleFeedback(activeSession.simulationId, {
                    rating: 5,
                    comments: "",
                  })
                }
              >
                Send feedback
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
