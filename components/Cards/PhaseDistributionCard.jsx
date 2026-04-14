import React from "react";

const PhaseDistributionCard = ({ data }) => {
  const maxCount = Math.max(...data.phases.map((p) => p.count || 0), 1);

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
          <span className="text-base">📊</span>
          {data.title}
        </h3>
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
          style={{ background: "var(--home-card-el)", color: "var(--rf-accent)" }}
        >
          {data.phases.length} Phases
        </span>
      </div>

      {/* Phase rows */}
      <div className="space-y-4">
        {data.phases.map((phase, index) => {
          const pct = (phase.count / maxCount) * 100;
          const isActive = phase.count > 0;
          return (
            <div key={index} className="group">
              <div className="flex justify-between items-center mb-1.5">
                <span
                  className="text-xs font-semibold truncate max-w-[60%]"
                  style={{ color: isActive ? "var(--rf-txt)" : "var(--rf-txt3)" }}
                >
                  {phase.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="text-sm font-black"
                    style={{ color: "var(--rf-accent)" }}
                  >
                    {phase.count}
                  </span>
                  {isActive && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                      style={{ background: "var(--home-card-el)", color: "var(--rf-accent)" }}
                    >
                      ACTIVE
                    </span>
                  )}
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
                    background: "linear-gradient(to right, var(--rf-accent), var(--home-gradient-to))",
                    opacity: isActive ? 1 : 0.3,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="mt-6 pt-4 text-center text-xs"
        style={{ borderTop: "1px solid var(--home-card-border)", color: "var(--rf-txt3)" }}
      >
        Total assets:{" "}
        <span className="font-bold" style={{ color: "var(--rf-accent)" }}>
          {data.phases.reduce((s, p) => s + p.count, 0)}
        </span>
      </div>
    </div>
  );
};

export default PhaseDistributionCard;
