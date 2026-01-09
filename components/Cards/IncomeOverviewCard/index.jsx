"use client";
import { useState, useEffect } from "react";
import { FaSmile } from "react-icons/fa";

const CircularProgress = ({ percentage }) => {
  const [progress, setProgress] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90" width="180" height="180">
        {/* Background circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="#1e293b"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="url(#gradient)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: "stroke-dashoffset 1.5s ease-in-out",
          }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg">
          <FaSmile className="text-emerald-400 text-2xl" />
        </div>
      </div>
    </div>
  );
};

export default function QAQCSatisfactionCard() {
  const satisfactionRate = 95;

  return (
    <div className="flex flex-col w-full bg-gradient-to-r font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-white text-xl font-semibold mb-1">
          QA/QC Satisfaction Rate
        </h2>
        <p className="text-gray-400 text-sm">From all projects</p>
      </div>

      {/* Circular Progress */}
      <div className="flex flex-col items-center mb-6">
        <CircularProgress percentage={satisfactionRate} />

        {/* Percentage Labels */}
        <div className="flex justify-center px-4 mt-4 bg-[#090e2b] w-[max-content] py-1 rounded-xl gap-8">
          <span className="text-gray-400 text-xs">0%</span>
          <div className="text-center">
            <p className="text-white text-4xl font-bold">{satisfactionRate}%</p>
            <p className="text-gray-400 text-xs mt-1">
              Based on positive answers
            </p>
          </div>
          <span className="text-gray-400 text-xs">100%</span>
        </div>
      </div>
    </div>
  );
}
