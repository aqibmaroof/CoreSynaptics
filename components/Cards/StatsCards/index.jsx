export default function StatsCards() {
  return (
    <div className="w-full col-span-7 mx-auto bg-[#ffff] dark:bg-[#2B3340] text-white rounded-xl mt-4 p-6 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl">
      {/* LEFT CARD — New Visitors */}
      <div className="bg-[#ffff] dark:bg-[#2B3340] shadow-xl border border-[#183431] dark:border-[#A9D18E] h-[max-content] rounded-xl p-4 flex flex-col justify-between gap-6">
        {/* Header */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span className=" text-[#183431] dark:text-[#fff] text-md font-semibold">
            New Visitors
          </span>
          <span>Last Week</span>
        </div>

        {/* Percentage */}
        <div className="flex gap-6 ">
          <div className="flex flex-col items-start justify-between">
            <p className=" text-[#183431] dark:text-[#fff] text-xl font-semibold">
              23%
            </p>
            <p className=" text-red-400 text-sm mt-1">▼ -13.24%</p>
          </div>
          {/* Graph Placeholder */}
          <div className="mt-2 flex flex-col items-center">
            <div className="flex gap-2 h-13 items-end">
              <div className="w-3 h-10 bg-blue-900 rounded-md"></div>
              <div className="w-3 h-14 bg-blue-800 rounded-md"></div>
              <div className="w-3 h-16 bg-blue-700 rounded-md"></div>
              <div className="w-3 h-12 bg-blue-600 rounded-md"></div>
              <div className="w-3 h-18 bg-blue-500 rounded-md"></div>
              <div className="w-3 h-20 bg-blue-400 rounded-md"></div>
              <div className="w-3 h-16 bg-blue-300 rounded-md"></div>
            </div>

            <div className="flex justify-between w-full px-3 text-xs text-gray-500 mt-3">
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
              <span>S</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT CARD — Activity */}
      <div className="bg-[#ffff] dark:bg-[#2B3340] shadow-xl border border-[#183431] dark:border-[#A9D18E] rounded-xl p-4 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
          <span className="text-white text-md font-semibold">Activity</span>
          <span>Last Week</span>
        </div>

        {/* Percentage */}
        <div className="flex gap-5 h-20 ">
          <div className="flex flex-col items-start justify-between">
            <p className=" text-[#183431] dark:text-[#fff] text-xl font-semibold">
              82%
            </p>
            <p className="text-green-400 text-sm flex">
              <span>▲</span> 24.8%
            </p>
          </div>
          {/* Line Chart Placeholder */}
          <div className="flex flex-col justify-end items-end mt-1 h-19">
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <path
                d="M0 50 C40 60, 60 20, 100 30 S160 60, 200 40"
                fill="none"
                stroke="#4ADE80"
                strokeWidth="3"
              />
            </svg>

            <div className="flex justify-between w-full px-3 text-xs text-gray-500 ">
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
