import React from "react";

const ChecklistStatusCard = ({ data }) => {
  const statusConfig = {
    finished: {
      color: "emerald",
      icon: "✓",
      gradient: "from-emerald-400 to-green-600",
    },
    in_progress: {
      color: "amber",
      icon: "◐",
      gradient: "from-amber-400 to-orange-500",
    },
    pending: {
      color: "orange",
      icon: "◉",
      gradient: "from-orange-400 to-red-500",
    },
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-7 border border-slate-700/50 backdrop-blur hover:border-slate-600 transition-all shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white text-lg font-bold flex items-center gap-2">
          <span className="text-xl">📋</span>
          {data.title}
        </h3>
        <div className="text-xs font-bold bg-slate-700/50 px-3 py-1 rounded-full text-gray-300">
          Live
        </div>
      </div>

      {/* Status items */}
      <div className="space-y-5">
        {data.statuses.map((status, index) => {
          const config = statusConfig[status.type];
          return (
            <div key={index} className="group">
              {/* Header with label and count */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  {/* Animated indicator */}
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient} shadow-lg group-hover:scale-125 transition-transform`}
                  />
                  <span className="text-gray-200 text-sm font-semibold group-hover:text-white transition-colors">
                    {status.label}
                  </span>
                </div>
                <span
                  className={`text-lg font-black bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                >
                  {status.count}
                </span>
              </div>

              {/* Enhanced progress bar */}
              <div className="relative h-3 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full overflow-hidden shadow-inner">
                {/* Animated progress fill */}
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${config.gradient} shadow-lg transition-all duration-500 relative overflow-hidden group-hover:shadow-${config.color}-500/50`}
                  style={{ width: `${status.percentage}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="mt-8 pt-6 border-t border-slate-700/50 flex gap-4 text-xs text-gray-400">
        <div>Total items tracked</div>
        <div className="ml-auto font-semibold text-cyan-400">
          {data.statuses.reduce((sum, s) => sum + s.count, 0)}
        </div>
      </div>
    </div>
  );
};

export default ChecklistStatusCard;
