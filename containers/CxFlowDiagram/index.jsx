"use client";

import { useEffect, useState } from "react";
import {
  getCxFlowDiagrams,
  getCxFlowPersonas,
} from "@/services/CxFlowDiagram";

export default function CxFlowDiagram() {
  const [personas, setPersonas] = useState([]);
  const [flows, setFlows] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [personasRes, flowsRes] = await Promise.all([
          getCxFlowPersonas(),
          getCxFlowDiagrams(),
        ]);
        const personaList =
          personasRes?.data || personasRes?.items || personasRes || [];
        const flowList = flowsRes?.data || flowsRes?.items || flowsRes || [];
        setPersonas(Array.isArray(personaList) ? personaList : []);
        setFlows(Array.isArray(flowList) ? flowList : []);
      } catch (e) {
        setError(e?.message || "Failed to load Cx flow diagrams");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        Cx Flow Diagram
      </h1>
      <p style={{ color: "var(--cx-text-muted)", marginBottom: 16 }}>
        End-to-end customer journey flows with interactive nodes showing inputs
        and outputs for each step.
      </p>

      {loading && (
        <div style={{ color: "var(--cx-text-muted)" }}>Loading…</div>
      )}
      {error && <div style={{ color: "var(--rf-red)" }}>{error}</div>}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--cx-text)",
                marginBottom: 8,
              }}
            >
              Personas ({personas.length})
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {personas.map((p) => (
                <button
                  key={p.id || p.key || p.name}
                  onClick={() => setSelectedPersona(p)}
                  className="rf-btn rf-btn-secondary"
                  style={{
                    borderColor:
                      selectedPersona?.id === p.id
                        ? "var(--rf-accent)"
                        : undefined,
                  }}
                >
                  {p.name || p.label || p.key}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--cx-text)",
                marginBottom: 8,
              }}
            >
              Flows ({flows.length})
            </div>
            <ul style={{ color: "var(--cx-text-muted)" }}>
              {flows.map((f) => (
                <li key={f.id}>{f.name || f.title}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
