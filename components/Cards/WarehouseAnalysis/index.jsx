"use client";
import CardWrapper from "@/components/CardWrapper";
import DynamicChart from "@/components/common/Charts/DynamicChart";

export default function WarehouseAnalysis() {
  const ChartOptions = {
    series: [
      {
        name: "Warehouse",
        data: [200, 450, 620, 380, 320, 430, 580, 340, 520, 380, 610, 470],
      },
    ],
    chart: {
      type: "bar",
      height: "280",
      toolbar: {
        show: false,
      },
      background: "transparent",
      zoom: {
        enabled: false,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "12px",
        borderRadius: 4,
        borderRadiusApplication: "end",
        colors: {
          ranges: [
            {
              from: 0,
              to: 619,
              color: "#064a9a",
            },
            {
              from: 220,
              to: 400,
              color: "#00e295",
            },
             {
              from: 0,
              to: 619,
              color: "#064a9a",
            },
            {
              from: 620,
              to: 800,
              color: "#00e295",
            },
          ],
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#1e40af"],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100],
      },
    },
    colors: ["#3b82f6"],
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
          colors: "#94a3b8",
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
      max: 800,
      tickAmount: 4,
      labels: {
        formatter: function (val) {
          return val.toFixed(0);
        },
        style: {
          colors: "#64748b",
          fontSize: "12px",
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: "#1e293b",
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
          return val.toFixed(0);
        },
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        if (value === 620) {
          return `<div class="bg-white text-slate-900 px-3 py-1.5 rounded-lg font-semibold text-sm shadow-lg">${value}</div>`;
        }
        return `<div class="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm">${value}</div>`;
      },
    },
    annotations: {
      points: [
        {
          x: "Mar",
          y: 620,
          marker: {
            size: 0,
          },
          label: {
            borderColor: "transparent",
            offsetY: -10,
            style: {
              color: "#0a0e27",
              background: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              padding: {
                left: 12,
                right: 12,
                top: 6,
                bottom: 6,
              },
            },
            text: "620",
          },
        },
      ],
    },
  };

  return (
    <CardWrapper className="flex flex-col font-gilroy">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-2xl font-semibold">
            Warehouse Analysis
          </h2>
      </div>

      {/* Chart */}
      <div className="w-[100%] flex justify-center items-center gap-6">
        {/* Time period buttons */}
        <div className="flex flex-col gap-2">
          <button className="px-4 py-2 rounded-lg text-gray-400 text-sm bg-[#1A1F37D1] hover:bg-[#464667] transition-colors">
            Yearly
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#1A1F37D1] hover:bg-[#464667] text-white text-sm">
            Monthly
          </button>
          <button className="px-4 py-2 rounded-lg text-gray-400 text-sm bg-[#1A1F37D1] hover:bg-[#464667] transition-colors">
            Weekly
          </button>
        </div>
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
