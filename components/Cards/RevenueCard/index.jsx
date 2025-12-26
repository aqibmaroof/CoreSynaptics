"use client";
import { FaEllipsisV, FaEdit, FaTrash, FaShare } from "react-icons/fa";
import { useState, useEffect } from "react";
import DynamicChart from "../../../components/common/Charts/DynamicChart";
import { useTheme } from "next-themes";

export default function RevenueCard() {
  const [open, setOpen] = useState(false);
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

  const chartOptions = {
    series: [
      {
        // Series for positive values (2024, purple)
        name: "2024",
        data: [
          {
            x: "Jan",
            y: 15.5,
          },
          {
            x: "Feb",
            y: 5.2,
          },
          {
            x: "Mar",
            y: 12.5,
          },
          {
            x: "Apr",
            y: 28.1,
          },
          {
            x: "May",
            y: 16.5,
          },
          {
            x: "Jun",
            y: 10.1,
          },
          {
            x: "Jul",
            y: 7.2,
          },
        ],
      },
      {
        // Series for negative values (2023, cyan)
        name: "2023",
        data: [
          {
            x: "Jan",
            y: -15.5,
          },
          {
            x: "Feb",
            y: -5.2,
          },
          {
            x: "Mar",
            y: -12.5,
          },
          {
            x: "Apr",
            y: -28.1,
          },
          {
            x: "May",
            y: -16.5,
          },
          {
            x: "Jun",
            y: -10.1,
          },
          {
            x: "Jul",
            y: -7.2,
          },
        ],
      },
    ],
    chart: {
      type: "bar",
      height: 350,
      background: resolvedTheme === "dark" ? "#f6f6f6" : "#1e4742", // Dark background color from image
      toolbar: {
        show: false,
      },
    },
    colors: ["#8b5cf6", "#06b6d4"], // Explicit colors for the two series (purple and cyan)
    plotOptions: {
      bar: {
        horizontal: false, // Vertical bars
        columnWidth: "60%",
        endingShape: "rounded", // Rounded top/bottom of bars
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 1,
      colors: ["#2c2c44"], // Stroke color matching background for separation
    },
    grid: {
      show: true,
      borderColor: "#555", // Lighter dashed lines
      strokeDashArray: 5,
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
    xaxis: {
      // Categories are now defined in the data series X-value
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: resolvedTheme === "dark" ? "#183431" : "#fff", // White labels for contrast
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: resolvedTheme === "dark" ? "#183431" : "#fff", // White labels for contrast
        },
        formatter: function (y) {
          return y.toFixed(0);
        },
      },
      min: -20, // Setting explicit min/max based on your image
      max: 30,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: {
        colors: resolvedTheme === "dark" ? "#183431" : "#fff", // White legend text
      },
    },
  };

  const radialChartOptions = {
    series: [67], // Example percentage
    chart: {
      height: 350,
      type: "radialBar",
      offsetY: -10,
      background: resolvedTheme === "dark" ? "#f6f6f6" : "#1e4742", // Matches bar chart logic
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: "16px",
            color: resolvedTheme === "dark" ? "#183431" : "#fff", // dynamic label color
            offsetY: 120,
          },
          value: {
            offsetY: 76,
            fontSize: "22px",
            color: resolvedTheme === "dark" ? "#183431" : "#fff", // dynamic value color
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal", // can be 'horizontal', 'vertical', 'diagonal1', 'diagonal2'
        gradientToColors: ["#183431"], // end color of gradient (green)
        colorStops: [
          { offset: 0, color: "#A9D18E", opacity: 1 }, // start color (blue)
          { offset: 100, color: "#183431", opacity: 1 }, // end color (green)
        ],
      },
    },
    stroke: {
      dashArray: 4,
    },
    labels: ["Company Growth"],
  };

  return (
    <div className="flex col-span-8 bg-[#f6f6f6] dark:bg-[#1e4742] p-6 mt-2 rounded-xl shadow-xl">
      <div className="w-full grid grid-cols-3">
        <div className="w-full col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p>Total Revenue</p>
            <button onClick={() => setOpen(!open)} className="p-2">
              <FaEllipsisV size={20} />
            </button>
            {/* Dropdown menu */}
            {open && (
              <div className="absolute mt-2 w-40 bg-[#f6f6f6] dark:bg-[#1e4742] border rounded shadow-lg z-50">
                <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100">
                  <FaEdit /> Edit
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100">
                  <FaTrash /> Delete
                </button>
                <button className="flex items-center gap-2 px-4 py-2 w-full hover:bg-gray-100">
                  <FaShare /> Share
                </button>
              </div>
            )}
          </div>
          <div>
            <DynamicChart
              options={chartOptions}
              series={chartOptions.series}
              type={chartOptions.chart?.type}
              height={chartOptions.chart?.height}
            />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-6">
          <div class="dropdown dropdown-end font-sans">
            <div
              tabindex="0"
              role="button"
              class="inline-flex justify-center items-center w-[max-content] rounded-lg shadow-lg bg-[#f6f6f6]/50  dark:bg-[#265953]/50 text-[#183431] dark:text-white text-base font-semibold transition duration-150 ease-in-out border-2 border-[#d8d6d6] dark:border-[#265953] focus:outline-none"
            >
              <span class="py-2 px-3 mx-1 bg-[#e3e0e0] dark:bg-[#265953]/50 rounded-l-md">
                2024
              </span>

              <div class="bg-[#e3e0e0] dark:bg-[#275a54] hover:bg-[#d9d6d6] dark:hover:bg-[#246159] p-3 rounded-r-md">
                <svg
                  class="h-5 w-5 fill-current dark:text-white text-[#183431] "
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.97l3.71-3.74a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <ul
              tabindex="0"
              class="dropdown-content z-[1] bg-[#e3e0e0] dark:bg-[#246159] mt-2 w-27 p-0 rounded-lg shadow-2xl ring-1 ring-white/10"
            >
              <li>
                <a class="block px-4 py-3 text-lg text-[#183431] dark:text-white hover:bg-[#d9d6d6] dark:hover:bg-[#275a54] hover:rounded-t-lg transition duration-100 ease-in-out">
                  2021
                </a>
              </li>
              <li>
                <a class="block px-4 py-3 text-lg text-[#183431] dark:text-white hover:bg-[#d9d6d6] dark:hover:bg-[#275a54] transition duration-100 ease-in-out">
                  2020
                </a>
              </li>
              <li>
                <a class="block px-4 py-3 text-lg text-[#183431] dark:text-white hover:bg-[#d9d6d6] dark:hover:bg-[#275a54] hover:rounded-b-lg transition duration-100 ease-in-out">
                  2019
                </a>
              </li>
            </ul>
          </div>
          <div>
            <DynamicChart
              options={radialChartOptions}
              series={radialChartOptions.series}
              type={radialChartOptions.chart?.type}
              height={radialChartOptions.chart?.height}
            />
          </div>
        </div>
      </div>

      <div></div>
    </div>
  );
}
