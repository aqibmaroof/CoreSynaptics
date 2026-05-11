"use client";
import CardWrapper from "@/components/CardWrapper";
import DynamicChart from "@/components/common/Charts/DynamicChart";

const isLight = () =>
  typeof document !== "undefined" &&
  document.documentElement.getAttribute("data-theme") === "light";

export default function SalesOverview({ heading, description }) {
  const light = isLight();
  const labelColor = light ? "#3a5070" : "#b4beccff";
  const axisColor  = light ? "#6b84a0" : "#8b96a5ff";
  const gridColor  = light ? "#c5d2ea" : "#334155";
  const tooltipTheme = light ? "light" : "dark";

  const ChartOptions = {
    series: [
      {
        name: "Revenue",
        data: [420, 120, 190, 250, 220, 180, 160, 140, 190, 90, 150, 100],
      },
      {
        name: "Sales",
        data: [180, 220, 330, 420, 480, 320, 350, 250, 420, 450, 480, 500],
      },
    ],
    chart: {
      type: "area",
      height: "320",
      toolbar: {
        show: false,
      },
      background: "transparent",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 0,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
    },
    colors: ["#02a574", "#035ecd"],
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      labels: {
        style: {
          colors: labelColor,
          fontSize: "12px",
          fontWeight: 500,
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
      max: 500,
      tickAmount: 6,
      labels: {
        formatter: function (val) {
          return val.toFixed(0);
        },
        style: {
          colors: axisColor,
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
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
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10,
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: tooltipTheme,
      style: {
        fontSize: "12px",
      },
      y: {
        formatter: function (val) {
          return "$" + val.toFixed(0);
        },
      },
    },
  };

  return (
    <CardWrapper className="flex flex-col font-gilroy">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl md:text-2xl font-semibold">
          {heading ? heading : "Shipment Overview"}
          {description && <p className="font-normal text-sm md:text-base">{description}</p>}
        </h2>
        <div className="flex gap-2">
          <button className="bg-transparent text-white px-5 py-2 text-xs md:text-base rounded-xl border border-white/10 focus:border-white/20 focus:outline-none">
            Day
          </button>
          <button className="bg-[#656A80] text-white px-5 py-2 text-xs md:text-base rounded-xl border border-white/10 focus:border-white/20 focus:outline-none">
            Week
          </button>
          <button className="bg-transparent text-white px-5 py-2 text-xs md:text-base rounded-xl border border-white/10 focus:border-white/20 focus:outline-none">
            Month
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full">
        <DynamicChart
          options={ChartOptions}
          series={ChartOptions.series}
          type={ChartOptions.chart?.type}
          height={ChartOptions.chart?.height}
        />
      </div>
    </CardWrapper>
  );
}
