"use client";
import { FaEllipsisV, FaEdit, FaTrash, FaShare } from "react-icons/fa";
import { useState, useEffect } from "react";
import DynamicChart from "../../../components/common/Charts/DynamicChart";
import { useTheme } from "next-themes";

export default function RevenueCard() {
  const { resolvedTheme, setTheme } = useTheme();

  // Wait for client to mount to avoid SSR mismatch

  useEffect(() => {
    // Make sure this runs only on client
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Set initial value
    setTheme(!mediaQuery.matches ? "dark" : "light");
    // Listener for changes
    const handler = (e) => {
      setTheme(!e.matches ? "dark" : "light");
    };

    // Add listener (fallback for older browsers: addListener)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  const ChartOptions = {
    chart: {
      type: "donut",
      background: "transparent",
      fontFamily: "system-ui, -apple-system, sans-serif",
      height:"250"
    },
    colors: ["#10B981", "#3B82F6"],
    labels: ["Active", "Non-Active"],
    series: [29.5,70.5],
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return val.toFixed(1) + "%";
      },
      style: {
        fontSize: "16px",
        fontWeight: "600",
        colors: ["#fff"],
      },
      dropShadow: {
        enabled: false,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "60%",
          labels: {
            show: false,
          },
        },
        expandOnClick: false,
      },
    },
    legend: {
      show: true,
      position: "left",
      horizontalAlign: "left",
      fontSize: "14px",
      fontWeight: 500,
      labels: {
        colors: "#fff",
      },
      markers: {
        width: 20,
        height: 12,
        radius: 2,
      },
      itemMargin: {
        vertical: 8,
      },
      formatter: function (seriesName, opts) {
        return (
          '<span style="display:flex; align-items:center; justify-content:center;font-size: 20px; font-weight: 600; margin-left: 5px;">' +
          seriesName +
          '<span style="font-size: 20px; font-weight: 600; margin-left: 5px;">0' +
          opts.seriesIndex +
          "</span>" +
          "</span>"
        );
      },
    },
    stroke: {
      show: false,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      y: {
        formatter: function (val) {
          return val.toFixed(1) + "%";
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  return (
    <div className="flex w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      <div className="w-full ">
        <p className="font-semibold font-gilroy text-xl">Projects Summary</p>
        <div className="w-full">
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
