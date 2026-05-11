"use client";

export default function PhaseIndicator({ currentPhase, totalPhases, phases }) {
  return (
    <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-300">
          Phase {currentPhase} of {totalPhases}
        </span>
        <span className="text-sm font-semibold text-blue-400">
          {phases[currentPhase - 1]?.label || ""}
        </span>
      </div>
      <div className="flex gap-2">
        {phases.map((phase, idx) => (
          <div key={idx} className="flex-1">
            <div
              className={`h-1 rounded-full transition-all ${
                idx + 1 <= currentPhase ? "bg-blue-500" : "bg-gray-700"
              }`}
            />
            <div className="text-xs mt-1 text-gray-400 text-center">
              {phase.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
