"use client";
import DynamicChart from "../../common/Charts/DynamicChart";

export default function InventoryStatus() {
 const ChartOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      fontFamily: "system-ui, -apple-system, sans-serif",
      height: "280",
    },
    colors: ["#A78BFA", "#3B82F6"],
    labels: ["Products Sold", "Stock left"],
    series: [70, 40],
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "85%",
          labels: {
            show: true,
            name: {
              show: false,
            },
            value: {
              show: true,
              fontSize: "48px",
              fontWeight: "700",
              color: "#fff",
              offsetY: 10,
              formatter: function () {
                return "15K";
              },
            },
            total: {
              show: true,
              showAlways: true,
              fontSize: "48px",
              fontWeight: "700",
              color: "#fff",
              formatter: function () {
                return "15K";
              },
            },
          },
        },
        expandOnClick: false,
      },
    },
    legend: {
      show: false,
    },
    stroke: {
      show: true,
      width: 0,
      lineCap: "rounded",
    },
    tooltip: {
      enabled: true,
      theme: "dark",
    },
  };

  return (
    <div className="flex flex-col w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      <div className="w-full">
        <p className="font-semibold text-white text-[24px] mb-4">
          Inventory Status
        </p>
        <div className="w-full flex flex-col items-center">
          <DynamicChart
            options={ChartOptions}
            series={ChartOptions.series}
            type={ChartOptions.chart?.type}
            height={ChartOptions.chart?.height}
          />
          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-xl bg-purple-400"></div>
              <span className="text-white text-[20px] font-semibold">Products Sold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-5 rounded-xl bg-blue-400"></div>
              <span className="text-white text-[20px] font-semibold">Stock left</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
