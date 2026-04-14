import React from "react";

const priorityStyle = {
  critical: { color: "#f87171", bg: "rgba(248,113,113,0.10)", label: "Critical" },
  high:     { color: "#f87171", bg: "rgba(248,113,113,0.10)", label: "High" },
  medium:   { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  label: "Medium" },
  low:      { color: "#4ade80", bg: "rgba(74,222,128,0.10)",  label: "Low" },
};

const PriorityTasksCard = ({ data }) => {
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: "var(--home-card-bg)",
        border: "1px solid var(--home-card-border)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
      }}
    >
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-bold" style={{ color: "var(--rf-txt)" }}>
          {data.title}
        </h3>
        <button
          className="text-xs font-semibold transition-opacity hover:opacity-70"
          style={{ color: "var(--rf-accent)" }}
        >
          View All
        </button>
      </div>

      <div className="space-y-2.5 max-h-64 overflow-y-auto">
        {data.tasks.map((task, index) => {
          const p = priorityStyle[task.priority?.toLowerCase()] || priorityStyle.low;
          return (
            <div
              key={index}
              className="rounded-lg p-3.5"
              style={{ background: p.bg, border: `1px solid ${p.color}22` }}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--rf-txt)" }}>
                      {task.title}
                    </p>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0"
                      style={{ color: p.color, background: `${p.color}18` }}
                    >
                      {p.label}
                    </span>
                  </div>
                  <p className="text-[11px] truncate" style={{ color: "var(--rf-txt2)" }}>
                    {task.description}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0 cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PriorityTasksCard;
