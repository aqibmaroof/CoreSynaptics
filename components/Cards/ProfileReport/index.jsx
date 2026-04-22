import DynamicChart from "@/components/common/Charts/DynamicChart";
import NumberFormatter from "../../../Utils/NumberFormatter";

const isLight = () =>
  typeof document !== "undefined" &&
  document.documentElement.getAttribute("data-theme") === "light";

export default function SalesCards() {
  const light = isLight();
  const labelColor = light ? "#3a5070" : "#94a3b8";
  const axisColor  = light ? "#6b84a0" : "#c3c8cfff";
  const gridColor  = light ? "#c5d2ea" : "#6b6f75ff";
  const tooltipTheme = light ? "light" : "dark";
  const categories = ["Not Started", "In Progress", "L2", "Completed", "None"];
  const counts = [2, 2, 1, 1, 13];
  const total = counts.reduce((sum, val) => sum + val, 0);
  const percentages = counts.map((count) => ((count / total) * 100).toFixed(1));

  const ChartOptions = {
    series: [
      {
        name: "Sites",
        data: percentages.map((p) => parseFloat(p)),
      },
    ],
    chart: {
      type: "bar",
      height: "350",
      toolbar: {
        show: false,
      },
      background: "transparent",
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        borderRadiusApplication: "end",
        columnWidth: "60%",
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const index = opts.dataPointIndex;
        return index === 2 ? percentages[index] + "%" : "";
      },
      offsetY: -25,
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        colors: ["#fff", "#000"],
      },
      background: {
        enabled: true,
        foreColor: "#000",
        borderRadius: 6,
        padding: 6,
        opacity: 1,
        borderWidth: 0,
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#093E7D"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100],
      },
    },
    colors: ["#093E7D", "#0075FF", "#00E691"],
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: labelColor,
          fontSize: "12px",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        formatter: function (val) {
          return val + "%";
        },
        style: {
          colors: axisColor,
          fontSize: "12px",
        },
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 0,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: tooltipTheme,
      y: {
        formatter: function (val, opts) {
          const index = opts.dataPointIndex;
          return counts[index] + " sites (" + percentages[index] + "%)";
        },
      },
    },
  };

  return (
    <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      <div className="flex items-start justify-between w-full">
        <div>
          <h2 className="text-xl font-semibold text-white mb-12">
            Sites Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-medium w-32">Not Started</span>
              <span className="text-white font-semibold">02</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-medium w-32">In Progress</span>
              <span className="text-white font-semibold">02</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-medium w-32">L2</span>
              <span className="text-white font-semibold">01</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-medium w-32">Complete</span>
              <span className="text-white font-semibold">01</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span className="font-medium w-32">None</span>
              <span className="text-white font-semibold">13</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full ml-12">
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
