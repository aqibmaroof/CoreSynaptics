"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  getPhaseGates,
  getProjectPhaseStatus,
  evaluatePhaseReadiness,
  updateConditionStatus,
  advancePhase,
  getAdvancementLog,
  initializePhaseGates,
} from "@/services/PhaseGates";
import { getUsers } from "@/services/Users";
import {
  PHASES,
  PHASE_LABELS,
  TRANSITIONS,
  GATE_RULES,
  evaluateProjectReadiness,
  getTransitionForPhase,
} from "@/Utils/phaseGateEngine";

// ─── STATUS BADGE COLORS ────────────────────────────────────────────────────

const phaseColors = {
  L1: "from-blue-600 to-blue-500",
  L2: "from-indigo-600 to-indigo-500",
  PRE_E: "from-yellow-600 to-yellow-500",
  L3: "from-orange-600 to-orange-500",
  L4: "from-purple-600 to-purple-500",
  L5: "from-cyan-600 to-cyan-500",
  COMPLETE: "from-green-600 to-green-500",
};

const phaseBorderColors = {
  L1: "border-blue-500/40",
  L2: "border-indigo-500/40",
  PRE_E: "border-yellow-500/40",
  L3: "border-orange-500/40",
  L4: "border-purple-500/40",
  L5: "border-cyan-500/40",
  COMPLETE: "border-green-500/40",
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function PhaseGatesPanel() {
  const params = useParams();
  const projectId = params?.id;

  const [conditions, setConditions] = useState([]);
  const [phaseStatus, setPhaseStatus] = useState(null);
  const [users, setUsers] = useState([]);
  const [advancementLog, setAdvancementLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);
  const [advancing, setAdvancing] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [advanceNotes, setAdvanceNotes] = useState("");
  const [showAdvanceConfirm, setShowAdvanceConfirm] = useState(false);

  // Computed readiness from the client-side engine
  const [readiness, setReadiness] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadAll();
    }
  }, [projectId]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Recompute readiness whenever conditions or phaseStatus change
  useEffect(() => {
    if (phaseStatus?.current_phase || phaseStatus?.currentPhase) {
      const current = phaseStatus.current_phase || phaseStatus.currentPhase;
      const result = evaluateProjectReadiness(current, conditions);
      setReadiness(result);
    }
  }, [conditions, phaseStatus]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [gatesRes, statusRes, usersRes] = await Promise.all([
        getPhaseGates(projectId),
        getProjectPhaseStatus(projectId),
        getUsers(),
      ]);
      setConditions(Array.isArray(gatesRes) ? gatesRes : gatesRes?.data || []);
      setPhaseStatus(statusRes);
      setUsers(Array.isArray(usersRes) ? usersRes : usersRes?.data || []);
      setError("");
    } catch (err) {
      // If no gates exist yet, offer to initialize
      if (err?.statusCode === 404 || err?.status === 404) {
        setError("no_gates");
      } else {
        setError(err?.message || "Failed to load phase gates");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await initializePhaseGates(projectId);
      setMessage({
        type: "success",
        text: "Phase gates initialized for this project",
      });
      await loadAll();
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to initialize",
      });
    }
  };

  const handleToggleCondition = async (condition) => {
    const newMet = !condition.condition_met && !condition.conditionMet;
    try {
      await updateConditionStatus(projectId, condition.id, {
        condition_met: newMet,
        met_at: newMet ? new Date().toISOString() : null,
      });

      // Optimistic update
      setConditions((prev) =>
        prev.map((c) =>
          c.id === condition.id
            ? {
                ...c,
                condition_met: newMet,
                conditionMet: newMet,
                met_at: newMet ? new Date().toISOString() : null,
              }
            : c,
        ),
      );

      setMessage({
        type: "success",
        text: `${condition.condition_name || condition.conditionName} ${newMet ? "completed" : "unchecked"}`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to update condition",
      });
    }
  };

  const handleAdvancePhase = async () => {
    setAdvancing(true);
    try {
      await advancePhase(projectId, { notes: advanceNotes });
      setMessage({ type: "success", text: "Phase advanced successfully!" });
      setShowAdvanceConfirm(false);
      setAdvanceNotes("");
      await loadAll();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err?.message ||
          "Failed to advance phase. Check all blocking conditions.",
      });
    } finally {
      setAdvancing(false);
    }
  };

  const handleLoadLog = async () => {
    try {
      const res = await getAdvancementLog(projectId);
      setAdvancementLog(Array.isArray(res) ? res : res?.data || []);
      setShowLogModal(true);
    } catch {
      setMessage({ type: "error", text: "Failed to load advancement log" });
    }
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "—";
  };

  const currentPhase =
    phaseStatus?.current_phase || phaseStatus?.currentPhase || "L1";
  const currentTransitionKey = getTransitionForPhase(currentPhase);
  const currentTransition = currentTransitionKey
    ? TRANSITIONS[currentTransitionKey]
    : null;

  // Group conditions by transition for display
  const conditionsByTransition = {};
  conditions.forEach((c) => {
    const t = c.transition;
    if (!conditionsByTransition[t]) conditionsByTransition[t] = [];
    conditionsByTransition[t].push(c);
  });

  // ─── RENDER ─────────────────────────────────────────────────────────────

  // if (loading) {
  //   return (
  //     <div className="flex justify-center py-20">
  //       <div className="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
  //     </div>
  //   );
  // }

  if (error === "no_gates") {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">
            No Phase Gates Found
          </h2>
          <p className="text-gray-400 mb-8">
            Initialize the phase gate system for this project to begin tracking
            conditions.
          </p>
          <button
            onClick={handleInitialize}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-lg font-medium shadow-lg hover:from-cyan-500 hover:to-cyan-400 transition-all"
          >
            Initialize Phase Gates
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 text-red-400">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto">
        {/* ─── HEADER ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Phase Gate Control
              </h1>
              <p className="text-gray-400 text-sm">
                Manage phase progression and gating conditions
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Toast */}
              {message && (
                <div
                  className={`z-50 px-5 py-[8px] rounded-lg border shadow-xl text-sm font-medium ${
                    message.type === "success"
                      ? "bg-green-900/90 border-green-500/30 text-green-300"
                      : "bg-red-900/90 border-red-500/30 text-red-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button
                onClick={handleLoadLog}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm hover:border-gray-500 hover:text-white transition-colors"
              >
                Advancement Log
              </button>
            </div>
          </div>
        </div>

        {/* ─── PHASE PROGRESS BAR ─────────────────────────────────────── */}
        <div className="mb-8 bg-gray-900/60 rounded-xl border border-gray-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Project Phase Timeline
            </h2>
            {readiness && (
              <span className="text-xs text-gray-500">
                Overall: {readiness.overallProgress}% complete
              </span>
            )}
          </div>

          {/* Phase Steps */}
          <div className="flex items-center gap-0">
            {PHASES.map((phase, idx) => {
              const isCurrent = phase === currentPhase;
              const isPast =
                PHASES.indexOf(phase) < PHASES.indexOf(currentPhase);
              const isFuture =
                PHASES.indexOf(phase) > PHASES.indexOf(currentPhase);

              return (
                <div key={phase} className="flex items-center flex-1">
                  {/* Node */}
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        isCurrent
                          ? `bg-gradient-to-r ${phaseColors[phase]} text-white border-transparent shadow-lg shadow-cyan-500/20`
                          : isPast
                            ? "bg-green-500/20 text-green-400 border-green-500/40"
                            : "bg-gray-800 text-gray-500 border-gray-700"
                      }`}
                    >
                      {isPast ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : phase === "COMPLETE" ? (
                        phase[0] + phase.slice(-1)
                      ) : (
                        phase.replace("_", "-")
                      ) // Show first letter of phase
                      }
                    </div>
                    <span
                      className={`text-[10px] mt-2 text-center leading-tight ${
                        isCurrent
                          ? "text-white font-bold"
                          : isPast
                            ? "text-green-400"
                            : "text-gray-600"
                      }`}
                    >
                      {PHASE_LABELS[phase]?.split("—")[0]?.trim() || phase}
                    </span>
                  </div>

                  {/* Connector line */}
                  {idx < PHASES.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 -mx-1 ${isPast ? "bg-green-500/50" : isCurrent ? "bg-gradient-to-r from-cyan-500/50 to-gray-700" : "bg-gray-800"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── CURRENT PHASE STATUS CARD ─────────────────────────────── */}
        {currentPhase !== "COMPLETE" && readiness && currentTransitionKey && (
          <div
            className={`mb-8 bg-gray-900/60 rounded-xl border ${phaseBorderColors[currentPhase]} p-6`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {currentTransition?.label}: Gate Status
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {PHASE_LABELS[currentPhase]}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Progress ring */}
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={readiness.canAdvance ? "#10b981" : "#06b6d4"}
                      strokeWidth="3"
                      strokeDasharray={`${readiness.transitions[currentTransitionKey]?.progress || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {readiness.transitions[currentTransitionKey]?.progress ||
                        0}
                      %
                    </span>
                  </div>
                </div>

                {/* Advance button */}
                <button
                  onClick={() => setShowAdvanceConfirm(true)}
                  disabled={!readiness.canAdvance}
                  className={`px-6 py-3 rounded-lg text-sm font-bold transition-all ${
                    readiness.canAdvance
                      ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-lg shadow-green-500/20"
                      : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                  }`}
                >
                  {readiness.canAdvance
                    ? `Advance to ${readiness.nextPhaseLabel?.split("—")[0]?.trim()}`
                    : "Conditions Pending"}
                </button>
              </div>
            </div>

            {/* Conditions Checklist */}
            <div className="space-y-2">
              {(readiness.transitions[currentTransitionKey]?.details || []).map(
                (detail) => (
                  <div
                    key={detail.key}
                    onClick={() => {
                      const cond = conditions.find(
                        (c) =>
                          (c.condition_key || c.conditionKey) === detail.key &&
                          c.transition === currentTransitionKey,
                      );
                      if (cond) handleToggleCondition(cond);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      detail.met
                        ? "bg-green-900/10 border-green-500/20 hover:border-green-500/40"
                        : "bg-gray-800/30 border-gray-700/50 hover:border-gray-600"
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                        detail.met
                          ? "bg-green-500 border-green-500"
                          : "border-gray-600 bg-transparent"
                      }`}
                    >
                      {detail.met && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${detail.met ? "text-green-300 line-through opacity-70" : "text-white"}`}
                      >
                        {detail.name}
                      </p>
                      {detail.metAt && (
                        <p className="text-[10px] text-gray-500 mt-0.5">
                          Completed{" "}
                          {new Date(detail.metAt).toLocaleDateString()}{" "}
                          {detail.metBy
                            ? `by ${getUserName(detail.metBy)}`
                            : ""}
                        </p>
                      )}
                    </div>

                    {/* Blocking badge */}
                    {detail.blocking && !detail.met && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-500/20 flex-shrink-0">
                        BLOCKING
                      </span>
                    )}

                    {detail.met && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-500/20 flex-shrink-0">
                        DONE
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* ─── COMPLETE STATE ────────────────────────────────────────── */}
        {currentPhase === "COMPLETE" && (
          <div className="mb-8 bg-green-900/10 rounded-xl border border-green-500/30 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              Project Complete
            </h2>
            <p className="text-gray-400">
              All phase gates have been cleared. Project lifecycle is complete.
            </p>
          </div>
        )}

        {/* ─── ALL TRANSITIONS OVERVIEW ───────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            All Phase Transitions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TRANSITIONS).map(([key, trans]) => {
              const evaluation = readiness?.transitions[key];
              const isActive = key === currentTransitionKey;
              const isPast =
                PHASES.indexOf(trans.to) <= PHASES.indexOf(currentPhase);
              const isFuture =
                PHASES.indexOf(trans.from) > PHASES.indexOf(currentPhase);

              return (
                <div
                  key={key}
                  className={`rounded-xl border p-4 transition-all ${
                    isActive
                      ? `border-cyan-500/40 bg-cyan-900/10`
                      : isPast
                        ? "border-green-500/20 bg-green-900/5"
                        : "border-gray-800/50 bg-gray-900/30 opacity-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      className={`text-sm font-bold ${isActive ? "text-cyan-400" : isPast ? "text-green-400" : "text-gray-500"}`}
                    >
                      {trans.label}
                    </h3>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        ACTIVE
                      </span>
                    )}
                    {isPast && !isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                        PASSED
                      </span>
                    )}
                  </div>

                  {/* Mini progress bar */}
                  <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${isPast && !isActive ? "bg-green-500" : "bg-cyan-500"}`}
                      style={{ width: `${evaluation?.progress || 0}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      {evaluation?.metConditions || 0}/
                      {evaluation?.totalConditions || 0} conditions
                    </span>
                    {evaluation?.blockingUnmet > 0 && (
                      <span className="text-[10px] text-red-400">
                        {evaluation.blockingUnmet} blocking
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── ADVANCE PHASE CONFIRMATION MODAL ──────────────────────── */}
        {showAdvanceConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">
                    Advance Phase
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {currentTransition?.label}
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">
                All blocking conditions have been met. Advancing will move the
                project from
                <span className="text-cyan-400 font-bold">
                  {" "}
                  {currentPhase}
                </span>{" "}
                to
                <span className="text-green-400 font-bold">
                  {" "}
                  {readiness?.nextPhase}
                </span>
                . This action is recorded in the audit log and cannot be undone.
              </p>

              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">
                  Notes (optional)
                </label>
                <textarea
                  value={advanceNotes}
                  onChange={(e) => setAdvanceNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 resize-none"
                  rows={3}
                  placeholder="Advancement notes..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAdvanceConfirm(false);
                    setAdvanceNotes("");
                  }}
                  className="px-5 py-2.5 border border-gray-600 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdvancePhase}
                  disabled={advancing}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {advancing ? "Advancing..." : "Confirm Advance"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── ADVANCEMENT LOG MODAL ─────────────────────────────────── */}
        {showLogModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-bold text-lg">
                  Phase Advancement Log
                </h3>
                <button
                  onClick={() => setShowLogModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {advancementLog.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No advancements recorded yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {advancementLog.map((entry, idx) => (
                    <div
                      key={entry.id || idx}
                      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-400 border border-blue-500/20 font-bold">
                            {entry.from_phase || entry.fromPhase}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 border border-green-500/20 font-bold">
                            {entry.to_phase || entry.toPhase}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500">
                          {new Date(
                            entry.advanced_at || entry.advancedAt,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Advanced by:{" "}
                        <span className="text-white">
                          {getUserName(entry.advanced_by || entry.advancedBy)}
                        </span>
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
