"use client";
import { useState } from "react";
import DynamicChart from "../../common/Charts/DynamicChart";

export default function PurchaseReport() {
  const [activeTab, setActiveTab] = useState("Today");

  const ChartOptions = {
    chart: {
      type: "area",
      background: "transparent",
      fontFamily: "system-ui, -apple-system, sans-serif",
      height: "200",
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    colors: ["#3B82F6"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    series: [
      {
        name: "Amount",
        data: [30, 40, 35, 50, 49, 60, 70, 91],
      },
    ],
    xaxis: {
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
    grid: {
      show: false,
      padding: {
        left: 0,
        right: 0,
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      x: {
        show: false,
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 6,
      },
    },
  };

  const tabs = ["Today", "Yearly", "Monthly", "Weekly"];

  return (
    <div className="flex flex-col w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      {/* Header with tabs */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl font-semibold">Purchase Report</h2>
        <div className="flex gap-2 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                activeTab === tab
                  ? "bg-[#464667] text-white"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between my-auto">
        {/* Stats */}
        <div className="space-y-8 m-auto">
          <div className="flex items-center gap-5">
            <div className="text-5xl font-bold text-white mb-1">105</div>
            <div className="text-gray-400 text-sm w-30">
              Total Products Ordered
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-4xl font-bold text-white mb-1">$14,589</div>
            <div className="text-gray-400 text-sm ">Amount Paid</div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-4xl font-bold text-white mb-1">$5,299</div>
            <div className="text-gray-400 text-sm w-10">Amount Pending</div>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full mt-4">
          <DynamicChart
            options={ChartOptions}
            series={ChartOptions.series}
            type={ChartOptions.chart?.type}
            height={ChartOptions.chart?.height}
          />
        </div>
      </div>
    </div>
  );
}
