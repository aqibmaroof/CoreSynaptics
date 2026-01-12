"use client";

import Image from "next/image";

const countries = [
  {
    name: "United States",
    code: "US",
    style: "flat",
    value: 120,
    percent: "22%",
    size: 32,
  },
  {
    name: "England",
    value: 100,
    percent: "18%",
    code: "GB",
    style: "flat",
    size: 32,
  },
  {
    name: "Australia",
    value: 80,
    percent: "14%",
    code: "AU",
    style: "flat",
    size: 32,
  },
  {
    name: "Canada",
    value: 40,
    percent: "10%",
    code: "CA",
    style: "flat",
    size: 32,
  },
];

export default function ProductsByCountry() {
  return (
    <div className="flex flex-col w-full bg-gradient-to-r  font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 mt-2 rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">
          Products Sold by Country / Location
        </h2>

        <button className="btn btn-sm btn-ghost text-white/80">
          Sort by Monthly ▾
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Left: Country List */}
        <div className="space-y-5">
          {countries.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-left gap-5 mb-1">
                <img
                  src={`https://flagsapi.com/${item.code}/${item.style}/${item.size}.png`}
                  className="rounded-full w-auto h-auto"
                />
                <div className="w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-white/70">
                    <span>{item.value}</span>
                    <span>{item.percent}</span>
                  </div>
                  <progress
                    className="progress progress-success h-1.5 w-full bg-white/10"
                    value={item.value}
                    max="120"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: World Map */}
        <div className="relative flex justify-center">
          <Image
            src="/images/map.png"
            alt="World Map"
            width={420}
            height={220}
            className="opacity-90"
          />

          {/* Location Dots */}
          {countries?.map((item, index) => (
            <>
              <span
                className={`absolute top-[${
                  index === 0
                    ? "38%"
                    : index === 1
                    ? "30%"
                    : index === 2
                    ? "42%"
                    : "55%"
                }] left-[${
                  index === 0
                    ? "28%"
                    : index === 1
                    ? "45%"
                    : index === 2
                    ? "50%"
                    : "70%"
                }] w-2.5 h-2.5 rounded-full shadow-md`}
              >
                <img
                  src={`https://flagsapi.com/${item.code}/${item.style}/${item.size}.png`}
                  className="rounded-full w-auto h-auto"
                />
              </span>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
