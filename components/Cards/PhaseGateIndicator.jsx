import React from "react";

const statusStyle = {
  complete: {
    circle: "linear-gradient(135deg,#4ade80,#16a34a)",
    shadow: "rgba(74,222,128,0.35)",
    badge: { bg: "rgba(74,222,128,0.12)", color: "#4ade80", border: "rgba(74,222,128,0.25)" },
  },
  active: {
    circle: "linear-gradient(135deg,#fbbf24,#f97316)",
    shadow: "rgba(251,191,36,0.35)",
    badge: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "rgba(251,191,36,0.25)" },
  },
  locked: {
    circle: "linear-gradient(135deg,#f87171,#ef4444)",
    shadow: "rgba(248,113,113,0.25)",
    badge: { bg: "rgba(248,113,113,0.10)", color: "#f87171", border: "rgba(248,113,113,0.20)" },
  },
  pending: {
    circle: "linear-gradient(135deg,#64748b,#475569)",
    shadow: "rgba(100,116,139,0.20)",
    badge: { bg: "rgba(100,116,139,0.10)", color: "#94a3b8", border: "rgba(100,116,139,0.18)" },
  },
};

const PhaseGateIndicator = ({ currentPhase, phases, alert }) => {
  return (
    <div
      className="rounded-xl p-6 mb-7"
      style={{
        background: "var(--home-card-bg)",
        border: "1px solid var(--home-card-border)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-lg font-bold"
            style={{
              background: "linear-gradient(to right, var(--rf-accent), var(--home-gradient-to))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Commissioning Phase Gate
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--rf-txt3)" }}>
            Project progression tracking
          </p>
        </div>
        <span className="text-3xl">🏗️</span>
      </div>

      {/* Phases */}
      <div className="relative mb-8">
        {/* Connecting line */}
        <div
          className="absolute top-7 left-0 right-0 h-px"
          style={{ background: "var(--home-card-border)" }}
        />

        <div className="flex items-start justify-between relative z-10">
          {phases.map((phase, index) => {
            const s = statusStyle[phase.status] || statusStyle.pending;
            return (
              <div key={index} className="flex flex-col items-center flex-1 gap-2">
                {/* Circle */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-lg transition-transform hover:scale-105"
                  style={{
                    background: s.circle,
                    boxShadow: `0 4px 16px ${s.shadow}`,
                    animation: phase.status === "active" ? "pulse 2s infinite" : "none",
                  }}
                >
                  {phase.number}
                </div>
                {/* Name */}
                <p
                  className="text-xs font-semibold text-center max-w-[90px] leading-tight"
                  style={{ color: "var(--rf-txt)" }}
                >
                  {phase.name}
                </p>
                {/* Badge */}
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide"
                  style={{
                    background: s.badge.bg,
                    color: s.badge.color,
                    borderColor: s.badge.border,
                  }}
                >
                  {phase.statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl"
          style={{
            background: "rgba(251,191,36,0.08)",
            border: "1px solid rgba(251,191,36,0.22)",
          }}
        >
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "#fbbf24" }}>
              {alert.title}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--rf-txt2)" }}>
              {alert.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseGateIndicator;
