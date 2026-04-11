import React from "react";

const PhaseDistributionCard = ({ data }) => {
  const maxCount = Math.max(...data.phases.map((p) => p.count || 0), 1);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-7 border border-slate-700/50 backdrop-blur hover:border-slate-600 transition-all shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white text-lg font-bold flex items-center gap-2">
          <span className="text-xl">📊</span>
          {data.title}
        </h3>
        <div className="text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1 rounded-full text-white">
          {data.phases.length} Phases
        </div>
      </div>

      {/* Phase items */}
      <div className="space-y-5">
        {data.phases.map((phase, index) => {
          const percentage = (phase.count / maxCount) * 100;
          const isActive = phase.count > 0;
          return (
            <div key={index} className="group">
              {/* Label and count */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-200 text-sm font-semibold group-hover:text-cyan-300 transition-colors">
                  {phase.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {phase.count}
                  </span>
                  {isActive && (
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Animated bar */}
              <div className="relative h-2.5 bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    animation: isActive ? "slideIn 0.6s ease-out" : "none",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent opacity-0 group-hover:opacity-30 animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
        <div className="text-xs text-gray-400">
          Total assets across phases:{" "}
          <span className="font-bold text-cyan-400">
            {data.phases.reduce((sum, p) => sum + p.count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhaseDistributionCard;
