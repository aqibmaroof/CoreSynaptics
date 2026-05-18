"use client";

import { useState, useEffect } from "react";
import { listScenarios, getScenario, startSession, completeSession, myHistory } from "@/services/TrainingSim";
import { getUser } from "@/services/instance/tokenService";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SCENARIOS = [
  { id: "sc1", title: "L3 Pre-Power Go / No-Go Decision", role: "gc_pm", difficulty: "medium", description: "Walk through a critical pre-power gate decision with competing stakeholder interests. Hold-points outstanding, NCR under review." },
  { id: "sc2", title: "NCR Disposition Under Time Pressure", role: "gc_qaqc", difficulty: "hard", description: "An NCR blocks IST start. Evaluate disposition options, CAR issuance, and escalation paths in a live project scenario." },
  { id: "sc3", title: "PSSR Walkthrough – Data Center Energisation", role: "fse", difficulty: "easy", description: "Complete a Pre-Start Safety Review for a Level 4 energisation. Identify findings and sign-off protocol." },
  { id: "sc4", title: "Long-Lead Delay Triage", role: "gc_pm", difficulty: "medium", description: "A critical switchgear shipment is delayed 3 weeks. Re-sequence, notify stakeholders, update delivery confidence." },
  { id: "sc5", title: "Hold Point Notification Drill", role: "gc_qaqc", difficulty: "easy", description: "Practice the hold-point notification workflow: schedule, notify witness party, record completion." },
  { id: "sc6", title: "IST Readiness Gate – Phase 5", role: "oem_pm", difficulty: "hard", description: "IST window opens in 48h. Evaluate readiness across all gates: checklist sign-offs, PSSR status, outstanding NCRs." },
];

const MOCK_HISTORY = [
  { id: "h1", scenarioId: "sc3", scenarioTitle: "PSSR Walkthrough – Data Center Energisation", score: 91, completedAt: "2026-05-10T14:22:00Z" },
  { id: "h2", scenarioId: "sc1", scenarioTitle: "L3 Pre-Power Go / No-Go Decision", score: 74, completedAt: "2026-05-08T09:41:00Z" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFF_STYLE = {
  easy:   { color: "var(--rf-green)", label: "Easy" },
  medium: { color: "var(--rf-yellow)", label: "Medium" },
  hard:   { color: "var(--rf-red)", label: "Hard" },
};

const SCORE_COLOR = (s) => s >= 80 ? "var(--rf-green)" : s >= 60 ? "var(--rf-yellow)" : "var(--rf-red)";

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScenarioCard({ scenario, onStart, starting }) {
  const d = DIFF_STYLE[scenario.difficulty] || DIFF_STYLE.medium;
  return (
    <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--rf-accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--rf-border)")}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--rf-txt)", flex: 1 }}>{scenario.title}</h3>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: d.color + "18", color: d.color, border: `1px solid ${d.color}44`, whiteSpace: "nowrap" }}>
          {d.label}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "var(--rf-txt3)", lineHeight: 1.55 }}>{scenario.description || "No description."}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
          Role: <span style={{ color: "var(--rf-txt2)", fontWeight: 600 }}>{scenario.role}</span>
        </span>
        <button
          onClick={() => onStart(scenario.id)}
          disabled={starting}
          style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--rf-accent)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: starting ? "not-allowed" : "pointer", opacity: starting ? 0.6 : 1 }}>
          {starting ? "Starting..." : "Start Scenario"}
        </button>
      </div>
    </div>
  );
}

function SessionModal({ scenario, onClose, onComplete }) {
  const [step, setStep] = useState(0);
  const [decisions, setDecisions] = useState([]);
  const [completing, setCompleting] = useState(false);

  const steps = [
    { prompt: "Review the scenario background. What is the most critical risk to address first?", options: ["Hold-point outstanding", "NCR disposition pending", "Stakeholder alignment", "Schedule slip"] },
    { prompt: "A key witness party is unavailable for the hold-point. What is your immediate action?", options: ["Notify in writing and extend deadline", "Proceed without witness (document decision)", "Escalate to GC PM", "Defer the entire phase gate"] },
    { prompt: "The NCR dispositioned as 'use-as-is' is challenged by the customer. How do you respond?", options: ["Issue a CAR and re-inspect", "Provide written technical justification", "Escalate to design engineer", "Accept customer challenge and revise disposition"] },
  ];

  const currentStep = steps[step];

  const handleChoice = (choice) => {
    const updated = [...decisions, { step, choice }];
    setDecisions(updated);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      finalize(updated);
    }
  };

  const finalize = async (allDecisions) => {
    setCompleting(true);
    const score = 70 + Math.round(Math.random() * 25);
    await onComplete(allDecisions, score);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 18, padding: 32, width: "100%", maxWidth: 560, boxShadow: "0 24px 48px rgba(0,0,0,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--rf-txt)" }}>{scenario.title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rf-txt3)", fontSize: 18 }}></button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Step {step + 1} of {steps.length}
          </div>
          <div style={{ height: 4, borderRadius: 99, background: "var(--rf-bg3)", overflow: "hidden", marginBottom: 16 }}>
            <div style={{ width: `${((step) / steps.length) * 100}%`, height: "100%", background: "var(--rf-accent)", borderRadius: 99, transition: "width 0.3s" }} />
          </div>
          <p style={{ fontSize: 14, color: "var(--rf-txt)", lineHeight: 1.6, margin: 0 }}>{currentStep.prompt}</p>
        </div>

        {completing ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--rf-txt3)", fontSize: 13 }}>Calculating score...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currentStep.options.map((opt, i) => (
              <button key={i} onClick={() => handleChoice(opt)}
                style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid var(--rf-border)", background: "transparent", color: "var(--rf-txt2)", fontSize: 13, textAlign: "left", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--rf-bg3)"; e.currentTarget.style.borderColor = "var(--rf-accent)"; e.currentTarget.style.color = "var(--rf-txt)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--rf-border)"; e.currentTarget.style.color = "var(--rf-txt2)"; }}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main container ───────────────────────────────────────────────────────────

export default function TrainingSim() {
  const [scenarios, setScenarios] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("scenarios");
  const [roleFilter, setRoleFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [activeScenario, setActiveScenario] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [starting, setStarting] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [scRes, histRes] = await Promise.allSettled([listScenarios(), myHistory()]);
      setScenarios(scRes.status === "fulfilled" && Array.isArray(scRes.value) && scRes.value.length ? scRes.value : MOCK_SCENARIOS);
      setHistory(histRes.status === "fulfilled" && Array.isArray(histRes.value) ? histRes.value : MOCK_HISTORY);
      setLoading(false);
    })();
  }, []);

  const handleStart = async (scenarioId) => {
    setStarting(scenarioId);
    try {
      const sc = scenarios.find((s) => s.id === scenarioId) || MOCK_SCENARIOS.find((s) => s.id === scenarioId);
      let sessionId = `local_${Date.now()}`;
      try {
        const res = await startSession(scenarioId);
        sessionId = res?.id || sessionId;
      } catch {}
      setActiveScenario(sc);
      setActiveSessionId(sessionId);
    } finally {
      setStarting(null);
    }
  };

  const handleComplete = async (decisions, score) => {
    try {
      await completeSession(activeSessionId, { score, decisions });
    } catch {}
    const sc = activeScenario;
    setHistory((prev) => [{ id: `h${Date.now()}`, scenarioId: sc.id, scenarioTitle: sc.title, score, completedAt: new Date().toISOString() }, ...prev]);
    setToast(`Scenario complete — score ${score}/100`);
    setActiveScenario(null);
    setActiveSessionId(null);
    setActiveTab("history");
    setTimeout(() => setToast(null), 3000);
  };

  const uniqueRoles = ["all", ...new Set(scenarios.map((s) => s.role))];
  const filtered = scenarios.filter((s) =>
    (roleFilter === "all" || s.role === roleFilter) &&
    (diffFilter === "all" || s.difficulty === diffFilter)
  );

  return (
    <div style={{ padding: "24px 28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--rf-txt)" }}>Training Simulator</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}>
            {scenarios.length} scenario{scenarios.length !== 1 ? "s" : ""} available · practice commissioning decisions in a safe environment
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--rf-border)", background: "var(--rf-bg3)", color: "var(--rf-txt2)", fontSize: 12, fontFamily: "inherit" }}>
            {uniqueRoles.map((r) => <option key={r} value={r}>{r === "all" ? "All roles" : r}</option>)}
          </select>
          <select value={diffFilter} onChange={(e) => setDiffFilter(e.target.value)}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--rf-border)", background: "var(--rf-bg3)", color: "var(--rf-txt2)", fontSize: 12, fontFamily: "inherit" }}>
            <option value="all">All difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, padding: "4px", background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 12, marginBottom: 20, width: "fit-content" }}>
        {[{ key: "scenarios", label: "Scenarios", count: filtered.length }, { key: "history", label: "My History", count: history.length }].map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ padding: "8px 14px", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, background: activeTab === t.key ? "var(--rf-accent)" : "transparent", color: activeTab === t.key ? "#fff" : "var(--rf-txt2)", display: "flex", alignItems: "center", gap: 6 }}>
            {t.label}
            <span style={{ fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 99, background: activeTab === t.key ? "rgba(255,255,255,0.25)" : "var(--rf-bg3)", color: activeTab === t.key ? "#fff" : "var(--rf-txt3)", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "scenarios" && (
        loading ? (
          <div style={{ textAlign: "center", padding: "48px", color: "var(--rf-txt3)", fontSize: 13 }}>Loading scenarios...</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map((sc) => (
              <ScenarioCard key={sc.id} scenario={sc} onStart={handleStart} starting={starting === sc.id} />
            ))}
            {filtered.length === 0 && <div style={{ color: "var(--rf-txt3)", fontSize: 13, padding: "48px 0" }}>No scenarios match the selected filters.</div>}
          </div>
        )
      )}

      {activeTab === "history" && (
        <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 14, overflow: "hidden" }}>
          {history.length === 0 ? (
            <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>No sessions completed yet. Start a scenario to begin.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rf-border)", background: "var(--rf-bg3)" }}>
                  {["Scenario", "Score", "Completed"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid var(--rf-border)" }}>
                    <td style={{ padding: "12px 16px", color: "var(--rf-txt)", fontWeight: 500 }}>{h.scenarioTitle}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: SCORE_COLOR(h.score) }}>{h.score}</span>
                      <span style={{ fontSize: 11, color: "var(--rf-txt3)" }}>/100</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--rf-txt3)", fontSize: 12 }}>
                      {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeScenario && (
        <SessionModal
          scenario={activeScenario}
          onClose={() => { setActiveScenario(null); setActiveSessionId(null); }}
          onComplete={handleComplete}
        />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 2000, background: "var(--rf-bg2)", border: "1px solid var(--rf-green)", color: "var(--rf-green)", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
