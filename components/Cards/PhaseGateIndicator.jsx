import React from "react";

const PhaseGateIndicator = ({ currentPhase, phases, alert }) => {
  return (
    <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-xl p-8 mb-8 border border-slate-700 shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Commissioning Phase Gate
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Project progression tracking
          </p>
        </div>
        <div className="text-4xl">🏗️</div>
      </div>

      {/* Phases Container */}
      <div className="relative mb-12">
        {/* Background gradient line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

        {/* Phases */}
        <div className="flex items-center justify-between relative z-10 px-2">
          {phases.map((phase, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-1 group"
            >
              {/* Circle with gradient and glow */}
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-all duration-300 shadow-lg ${
                  phase.status === "complete"
                    ? "bg-gradient-to-br from-emerald-400 to-green-600 text-white glow-green shadow-green-500/50"
                    : phase.status === "active"
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-pulse shadow-amber-500/50"
                      : "bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300 shadow-slate-900/50"
                }`}
              >
                {phase.number}
              </div>

              {/* Phase Name */}
              <p className="text-gray-200 text-sm font-semibold text-center max-w-20 group-hover:text-cyan-300 transition-colors">
                {phase.name}
              </p>

              {/* Phase Status Badge */}
              <div
                className={`text-xs mt-2 px-3 py-1 rounded-full font-semibold ${
                  phase.status === "complete"
                    ? "bg-emerald-900/40 text-emerald-300 border border-emerald-600/50"
                    : phase.status === "active"
                      ? "bg-amber-900/40 text-amber-300 border border-amber-600/50"
                      : phase.status === "locked"
                        ? "bg-red-900/40 text-red-300 border border-red-600/50"
                        : "bg-gray-700/40 text-gray-400 border border-gray-600/50"
                }`}
              >
                {phase.statusLabel}
              </div>

              {/* Connector line to next phase */}
              {index < phases.length - 1 && (
                <div className="absolute top-6 left-1/2 w-1/2 h-1 bg-gradient-to-r from-slate-600 to-slate-700 ml-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Alert Section */}
      {alert && (
        <div className="bg-gradient-to-r from-amber-900/30 via-red-900/20 to-transparent border border-amber-600/40 rounded-xl p-6 mt-2 backdrop-blur-sm hover:border-amber-500/60 transition-all">
          <div className="flex items-start gap-4">
            <div className="text-3xl animate-bounce">⚠️</div>
            <div className="flex-1">
              <p className="text-amber-300 text-sm font-bold uppercase tracking-wide">
                {alert.title}
              </p>
              <p className="text-amber-200/80 text-xs mt-2 leading-relaxed">
                {alert.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseGateIndicator;
