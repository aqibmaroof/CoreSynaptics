"use client";
import DynamicChart from "@/components/common/Charts/DynamicChart";

export default function IntegratorChart() {
  const ChartOptions = {
    series: [66, 34],
    chart: {
      type: "donut",
      height: "280",
      toolbar: {
        show: false,
      },
      background: "transparent",
    },
    labels: ["MPS", "Fiberbond"],
    colors: ["#10B981", "#3B82F6"],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(0) + "%";
      },
      style: {
        fontSize: "16px",
        fontWeight: "700",
        colors: ["#fff"],
      },
      dropShadow: {
        enabled: true,
        top: 2,
        left: 2,
        blur: 3,
        opacity: 0.5,
      },
      background: {
        enabled: true,
        foreColor: "#1e293b",
        borderRadius: 8,
        padding: 8,
        opacity: 0.9,
        borderWidth: 0,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: false,
          },
        },
        expandOnClick: false,
      },
    },
    stroke: {
      show: false,
      width: 0,
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      y: {
        formatter: function (val) {
          return val.toFixed(0) + "%";
        },
      },
    },
  };

  const legendData = [
    { name: "MPS", value: "02", color: "bg-emerald-500" },
    { name: "Fiberbond", value: "05", color: "bg-blue-500" },
  ];

  return (
    <div className="flex w-full bg-gradient-to-r font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      {/* Header */}
      <h2 className="text-white text-xl font-semibold mb-8">Integrator</h2>

      <div className="flex items-center justify-between gap-8">
        {/* Legend - Left Side */}
        <div className="space-y-6 flex flex-col items-start justify-start">
          {legendData.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-2 h-12 ${item.color} rounded-full`}></div>
              <div>
                <p className="text-white text-sm font-medium">{item.name}</p>
                <p className="text-white text-2xl font-bold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chart - Right Side */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full"></div>
            <div className="relative">
              <DynamicChart
                options={ChartOptions}
                series={ChartOptions.series}
                type={ChartOptions.chart?.type}
                height={ChartOptions.chart?.height}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}