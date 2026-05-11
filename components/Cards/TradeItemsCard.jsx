import React from "react";

const TradeItemsCard = ({ data }) => {
  const maxCount = Math.max(...data.trades.map((t) => t.count), 1);
  const totalItems = data.trades.reduce((sum, t) => sum + t.count, 0);
  const busiest = data.trades.reduce((m, t) => (t.count > m.count ? t : m), data.trades[0]);

  return (
    <div
      className="rounded-xl p-6 transition-all hover:scale-[1.01]"
      style={{
        background: "var(--home-card-bg)",
        border: "1px solid var(--home-card-border)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--rf-txt)" }}>
          <span className="text-base">🏗️</span>
          {data.title}
        </h3>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
          style={{ background: "var(--home-card-el)", color: "#f97316" }}
        >
          {data.trades.length} Trades
        </span>
      </div>

      {/* Trade rows */}
      <div className="space-y-4">
        {data.trades.map((trade, index) => {
          const pct = (trade.count / maxCount) * 100;
          const tradePct = totalItems > 0 ? Math.round((trade.count / totalItems) * 100) : 0;
          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold truncate max-w-[60%]" style={{ color: "var(--rf-txt)" }}>
                  {trade.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm font-black" style={{ color: "#f97316" }}>
                    {trade.count}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--rf-txt3)" }}>
                    ({tradePct}%)
                  </span>
                </div>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--home-progress-track)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: "linear-gradient(to right, #f97316, #ef4444)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="mt-6 pt-4 grid grid-cols-2 gap-4 text-center text-xs"
        style={{ borderTop: "1px solid var(--home-card-border)" }}
      >
        <div>
          <div style={{ color: "var(--rf-txt3)" }}>Total Items</div>
          <div className="text-xl font-black mt-0.5" style={{ color: "#f97316" }}>
            {totalItems}
          </div>
        </div>
        <div>
          <div style={{ color: "var(--rf-txt3)" }}>Busiest Trade</div>
          <div className="font-semibold mt-0.5 text-[11px] truncate" style={{ color: "#fb923c" }}>
            {busiest?.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeItemsCard;
