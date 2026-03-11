"use client";
import { FiArrowUp } from "react-icons/fi";

const MiniLineChart = () => {
  const points = "0,80 20,70 40,60 60,40 80,30 100,20";

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-32"
      preserveAspectRatio="none"
    >
      {/* Area fill */}
      <path
        fill="url(#gradient)"
        d={`M0,100 L${points} L100,100 Z`}
        opacity="0.3"
      />
      {/* Line */}
      <polyline
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="3"
        points={points}
      />
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default function UPSTrackerOverview({heading, data}) {
  const stats = [
    { label: "Last month sale", value: "125" },
    { label: "November", value: "330" },
  ];

  return (
    <div className="flex flex-col w-full bg-gradient-to-r font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      {/* Header */}
      <h2 className="text-white text-xl font-semibold mb-8">
        {heading}
      </h2>

      {/* Main Stats Section */}
      <div className="flex items-start justify-between mb-6">
        {/* Left side - Number and badge */}
        <div>
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-2">$10K</h1>
          <p className="text-gray-400 text-xs md:text-sm mb-3">This month</p>
          <p className="text-base md:text-lg text-white gap-1 bg-gradient-to-r from-[#080c26] to-[#056050] px-4 py-1 rounded-md flex items-center justify-center mt-1 w-[max-content]">
            <FiArrowUp className="text-md"/> 80%
          </p>
        </div>

        {/* Right side - Chart */}
        <div className="flex-1 ml-4">
          <MiniLineChart />
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-700 my-6"></div>

      {/* Bottom Stats */}
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <p className="text-gray-400 text-xs md:text-sm font-medium">{stat.label}</p>
            <p className="text-white text-xs md:text-lg font-semibold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* See all link */}
      <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center gap-1 mt-6">
        See all →
      </button>
    </div>
  );
}
