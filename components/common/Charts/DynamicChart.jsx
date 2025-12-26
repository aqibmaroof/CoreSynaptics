// apexChartColunNegativeValues.jsx
// components/DynamicChart.tsx
"use client"; // If using Next.js 13+ app directory

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import ApexCharts with SSR disabled
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DynamicChart = ({ options, series, type, height }) => {
  return (
    <div id="chart">
      <ApexChart
        options={options}
        series={series}
        type={type}
        height={height}
      />
    </div>
  );
};

export default DynamicChart;
