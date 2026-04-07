import React from "react";

const TradeItemsCard = ({ data }) => {
  const maxCount = Math.max(...data.trades.map((t) => t.count), 1);
  const totalItems = data.trades.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-7 border border-slate-700/50 backdrop-blur hover:border-slate-600 transition-all shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white text-lg font-bold flex items-center gap-2">
          <span className="text-xl">🏗️</span>
          {data.title}
        </h3>
        <div className="text-xs font-bold bg-gradient-to-r from-orange-600 to-red-600 px-3 py-1 rounded-full text-white">
          {data.trades.length} Trades
        </div>
      </div>

      {/* Trade items */}
      <div className="space-y-5">
        {data.trades.map((trade, index) => {
          const percentage = (trade.count / maxCount) * 100;
          return (
            <div key={index} className="group relative">
              {/* Header with name and count */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-200 text-sm font-semibold group-hover:text-orange-300 transition-colors">
                  {trade.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    {trade.count}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({Math.round((trade.count / totalItems) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Advanced progress bar */}
              <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden shadow-inner group-hover:shadow-orange-500/20 transition-shadow">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 rounded-full" />

                {/* Progress fill with animation */}
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 shadow-lg group-hover:shadow-orange-500/50 transition-all duration-500 relative overflow-hidden"
                  style={{
                    width: `${percentage}%`,
                    animation:
                      percentage > 0 ? "slideIn 0.6s ease-out" : "none",
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 animate-pulse" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats footer */}
      <div className="mt-8 pt-6 border-t border-slate-700/50">
        <div className="grid grid-cols-2 gap-4 text-center text-xs">
          <div>
            <div className="text-gray-400">Total Items</div>
            <div className="text-xl font-bold text-orange-400 mt-1">
              {totalItems}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Busiest Trade</div>
            <div className="text-orange-300 mt-1 truncate text-xs font-semibold">
              {
                data.trades.reduce(
                  (max, t) => (t.count > max.count ? t : max),
                  data.trades[0],
                )?.name
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeItemsCard;
