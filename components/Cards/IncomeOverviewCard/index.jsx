// components/cards/IncomeOverviewCard.jsx
import React, { useState } from "react";
import CardWrapper from "../../CardWrapper";

// Simple SVG for a line chart. For production, use a library like Chart.js or Recharts.
const LineChart = ({ data }) => {
  const points = data
    .map(
      (y, i) =>
        `${i * (100 / (data.length - 1))},${
          100 - (y / Math.max(...data)) * 100
        }`
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-24"
      preserveAspectRatio="none"
    >
      <polyline fill="none" stroke="#8b5cf6" strokeWidth="2" points={points} />
      <path
        fill="rgba(139, 92, 246, 0.2)"
        d={`M0,100 L${points} L100,100 Z`} // Area fill
      />
    </svg>
  );
};

const IncomeOverviewCard = ({ data }) => {
  const {
    totalBalance,
    balanceChange,
    chartData,
    incomeThisWeek,
    incomeComparison,
  } = data;
  const [activeTab, setActiveTab] = useState("Income"); // Default tab

  return (
    <CardWrapper className="col-span-4 flex flex-col">
      {" "}
      {/* Example: Takes 4 columns */}
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-6">
        {["Income", "Expenses", "Profit"].map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors duration-200
              ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 dark:text-[#fff] hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Total Balance */}
      <div className="mb-6 flex items-start gap-4">
        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-purple-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 18.75V10.5a3 3 0 013-3h15c1.728 0 3 1.372 3 3v1.5m-14.25 0h.007v.008H5.25v-.008zM12 12.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div>
          <p className="text-base text-gray-500 dark:text-[#fff]">
            Total Balance
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalBalance}
            </p>
            <span className="text-green-500 text-sm font-semibold flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25c0 .414-.336.75-.75.75z"
                  clipRule="evenodd"
                />
              </svg>
              {balanceChange}%
            </span>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="mb-6">
        <LineChart data={chartData} />
      </div>
      {/* Chart X-axis Labels */}
      <div className="flex justify-between text-xs text-gray-400 dark:text-[#fff] mb-6">
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
      {/* Income This Week Summary */}
      <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold">
          ${Math.floor(incomeThisWeek / 1000)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-white">
            Income this week
          </p>
          <p className="text-xs text-gray-500 dark:text-[#fff]">
            {incomeComparison}
          </p>
        </div>
      </div>
    </CardWrapper>
  );
};

export default IncomeOverviewCard;
