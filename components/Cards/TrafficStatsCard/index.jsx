// components/cards/TrafficStatsCard.jsx
import React, { useState } from "react";
import CardWrapper from "../../CardWrapper";

// Example Data Structure
const trafficData = {
  activeTab: "Browser",
  tabs: ["Browser", "Operating System", "Country"],
  table: [
    {
      no: 1,
      browser: "Chrome",
      visits: "8.92k",
      percentage: 64.75,
      icon: (
        <img
          src="https://example.com/chrome.png"
          alt="Chrome"
          className="w-5 h-5"
        />
      ), // Placeholder
      barColor: "bg-green-500",
    },
    {
      no: 2,
      browser: "Safari",
      visits: "1.29k",
      percentage: 18.43,
      icon: (
        <img
          src="https://example.com/safari.png"
          alt="Safari"
          className="w-5 h-5"
        />
      ), // Placeholder
      barColor: "bg-blue-500",
    },
    {
      no: 3,
      browser: "Firefox",
      visits: "328",
      percentage: 8.37,
      icon: (
        <img
          src="https://example.com/firefox.png"
          alt="Firefox"
          className="w-5 h-5"
        />
      ), // Placeholder
      barColor: "bg-cyan-500",
    },
    {
      no: 4,
      browser: "Edge",
      visits: "142",
      percentage: 6.12,
      icon: (
        <img
          src="https://example.com/edge.png"
          alt="Edge"
          className="w-5 h-5"
        />
      ), // Placeholder
      barColor: "bg-yellow-500",
    },
    {
      no: 5,
      browser: "Opera",
      visits: "82",
      percentage: 2.12,
      icon: (
        <img
          src="https://example.com/opera.png"
          alt="Opera"
          className="w-5 h-5"
        />
      ), // Placeholder
      barColor: "bg-red-500",
    },
    {
      no: 6,
      browser: "UC Browser",
      visits: "328",
      percentage: 20.14,
      icon: (
        <img src="https://example.com/uc.png" alt="UC" className="w-5 h-5" />
      ), // Placeholder
      barColor: "bg-orange-500",
    },
  ],
};

const TrafficStatsCard = ({ data = trafficData }) => {
  const [activeTab, setActiveTab] = useState(data.activeTab);

  return (
    <CardWrapper className="col-span-6 md:col-span-6">
      {" "}
      {/* Example column span */}
      {/* Header Tabs */}
      <div className="flex gap-2 mb-8">
        {data.tabs.map((tab) => (
          <button
            key={tab}
            className={`
              py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200
              ${
                activeTab === tab
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-white hover:bg-gray-700"
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="text-xs font-semibold uppercase text-[#fff]">
              <th className="py-3 pr-2 text-left">NO</th>
              <th className="py-3 px-2 text-left">BROWSER</th>
              <th className="py-3 px-2 text-left">VISITS</th>
              <th className="py-3 pl-2 text-left">DATA IN PERCENTAGE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.table.map((row) => (
              <tr key={row.no} className="text-sm text-gray-200">
                <td className="py-3 pr-2 font-medium">{row.no}</td>

                {/* Browser Column */}
                <td className="py-3 px-2 flex items-center gap-2">
                  {/* NOTE: You must ensure browser icons are correctly sourced */}
                  {row.icon}
                  {row.browser}
                </td>

                <td className="py-3 px-2">{row.visits}</td>

                {/* Data in Percentage Column */}
                <td className="py-3 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-full rounded-full h-2.5 bg-gray-700">
                      <div
                        className={`h-2.5 rounded-full ${row.barColor}`}
                        style={{ width: `${row.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium w-16">
                      {row.percentage}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardWrapper>
  );
};

export default TrafficStatsCard;
