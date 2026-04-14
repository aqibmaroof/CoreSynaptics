import React from "react";

const typeColors = {
  finished:    { bar: "linear-gradient(to right,#4ade80,#16a34a)", dot: "#4ade80", text: "#4ade80" },
  in_progress: { bar: "linear-gradient(to right,#fbbf24,#f59e0b)", dot: "#fbbf24", text: "#fbbf24" },
  pending:     { bar: "linear-gradient(to right,#f87171,#ef4444)", dot: "#f87171", text: "#f87171" },
};

const ChecklistStatusCard = ({ data }) => {
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
          <span className="text-base">📋</span>
          {data.title}
        </h3>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
          style={{ background: "var(--home-card-el)", color: "var(--rf-accent)" }}
        >
          Live
        </span>
      </div>

      {/* Status items */}
      <div className="space-y-4">
        {data.statuses.map((status, index) => {
          const c = typeColors[status.type] || typeColors.pending;
          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: c.dot }}
                  />
                  <span className="text-xs font-semibold" style={{ color: "var(--rf-txt)" }}>
                    {status.label}
                  </span>
                </div>
                <span className="text-sm font-black" style={{ color: c.text }}>
                  {status.count}
                </span>
              </div>
              {/* Track */}
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--home-progress-track)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${status.percentage}%`, background: c.bar }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="mt-6 pt-4 flex items-center justify-between text-xs"
        style={{ borderTop: "1px solid var(--home-card-border)", color: "var(--rf-txt3)" }}
      >
        <span>Total items tracked</span>
        <span className="font-bold" style={{ color: "var(--rf-accent)" }}>
          {data.statuses.reduce((s, x) => s + x.count, 0)}
        </span>
      </div>
    </div>
  );
};

export default ChecklistStatusCard;
