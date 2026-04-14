import React from "react";

const colorMap = {
  blue:   { value: "#4fc3f7", accent: "#0288d1", track: "rgba(79,195,247,0.12)" },
  green:  { value: "#4ade80", accent: "#16a34a", track: "rgba(74,222,128,0.12)" },
  red:    { value: "#f87171", accent: "#dc2626", track: "rgba(248,113,113,0.12)" },
  yellow: { value: "#fbbf24", accent: "#d97706", track: "rgba(251,191,36,0.12)"  },
};

const MetricsCard = ({ title, value, subtitle, color = "blue" }) => {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      className="relative group rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
      style={{
        background: "var(--home-card-bg)",
        border: "1px solid var(--home-card-border)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      }}
    >
      {/* Top accent bar on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{ background: `linear-gradient(to right, ${c.value}, ${c.accent})` }}
      />

      {/* Title */}
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-3"
        style={{ color: "var(--rf-txt3)" }}
      >
        {title}
      </p>

      {/* Value */}
      <div
        className="text-4xl font-black leading-none mb-3"
        style={{ color: c.value }}
      >
        {value}
      </div>

      {/* Subtitle */}
      <div className="flex items-center gap-2">
        <div
          className="w-1 h-3.5 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${c.value}, ${c.accent})` }}
        />
        <span className="text-xs" style={{ color: "var(--rf-txt2)" }}>
          {subtitle}
        </span>
      </div>

      {/* Background tint on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ background: c.track }}
      />
    </div>
  );
};

export default MetricsCard;
