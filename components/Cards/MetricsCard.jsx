import React from "react";

const MetricsCard = ({ icon, title, value, subtitle, color = "blue" }) => {
  const colorConfig = {
    blue: {
      gradient: "from-blue-600 to-cyan-600",
      bg: "bg-blue-900/20",
      border: "border-blue-500/30 hover:border-blue-400/60",
      text: "text-cyan-400",
      glow: "hover:shadow-blue-500/20",
    },
    green: {
      gradient: "from-emerald-600 to-green-600",
      bg: "bg-green-900/20",
      border: "border-green-500/30 hover:border-green-400/60",
      text: "text-green-400",
      glow: "hover:shadow-green-500/20",
    },
    red: {
      gradient: "from-red-600 to-pink-600",
      bg: "bg-red-900/20",
      border: "border-red-500/30 hover:border-red-400/60",
      text: "text-red-400",
      glow: "hover:shadow-red-500/20",
    },
    yellow: {
      gradient: "from-amber-600 to-orange-600",
      bg: "bg-amber-900/20",
      border: "border-amber-500/30 hover:border-amber-400/60",
      text: "text-amber-400",
      glow: "hover:shadow-amber-500/20",
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div
      className={`relative group overflow-hidden rounded-xl p-6 transition-all duration-300 backdrop-blur 
        border ${config.border} ${config.bg} ${config.glow} hover:shadow-lg cursor-pointer
        transform hover:scale-105 hover:-translate-y-1`}
    >
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />

      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            {title}
          </div>
          {icon && <span className="text-xl">{icon}</span>}
        </div>

        {/* Value */}
        <div className="mb-3">
          <div className={`text-4xl font-black ${config.text} leading-none`}>
            {value}
          </div>
        </div>

        {/* Subtitle with accent */}
        <div className="flex items-center gap-2">
          <div
            className={`w-1 h-4 rounded-full bg-gradient-to-b ${config.gradient}`}
          />
          <div className="text-gray-400 text-xs font-medium">{subtitle}</div>
        </div>
      </div>

      {/* Corner decoration */}
      <div
        className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-5 rounded-full blur-xl transition-all duration-300`}
      />
    </div>
  );
};

export default MetricsCard;
