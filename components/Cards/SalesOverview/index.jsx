"use client";
import CardWrapper from "@/components/CardWrapper";
import DynamicChart from "@/components/common/Charts/DynamicChart";

export default function SalesOverview() {
  const ChartOptions = {
    series: [
      {
        name: "Revenue",
        data: [420, 120, 190, 250, 220, 180, 160, 140, 190, 90, 150, 100],
      },
      {
        name: "Sales",
        data: [180, 220, 330, 420, 480, 320, 350, 250, 420, 450, 480 , 500],
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
          colors: "#b4beccff",
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
          colors: "#8b96a5ff",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: "#334155",
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
      theme: "dark",
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
        <h2 className="text-white text-2xl font-semibold">Sales Overview</h2>
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="text-white/80 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-1"
          >
            Sort by <span className="font-semibold">Monthly</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1e3a8a] rounded-box w-40 mt-2"
          >
            <li>
              <a className="text-white hover:bg-white/10">Daily</a>
            </li>
            <li>
              <a className="text-white hover:bg-white/10">Weekly</a>
            </li>
            <li>
              <a className="text-white hover:bg-white/10">Monthly</a>
            </li>
            <li>
              <a className="text-white hover:bg-white/10">Yearly</a>
            </li>
          </ul>
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
