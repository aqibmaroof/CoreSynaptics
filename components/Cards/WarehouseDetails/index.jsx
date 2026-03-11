import { FiArrowDown, FiArrowUp } from "react-icons/fi";

export default function RevenueDetails({ user }) {
  return (
    <div className="w-full px-3 gap-6 flex flex-col justify-between font-gilroy mt-4 mb-4">
      {/* LEFT SIDE */}
        <h2 className="text-[#fff] text-xl md:text-xl font-semibold">
          Warehouse Overview
        </h2>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center justify-between gap-4 w-[max-content]">
            <p className="text-5xl md:text-7xl font-bold font-gilroy">450</p>
            <div className="flex flex-col items-start justify-end text-xs md:text-sm">
              <p>Products<br /> In Stock</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 w-[max-content]">
            <p className=" font-bold text-5xl md:text-7xl">1500</p>
            <div className="flex flex-col items-right justify-end text-xs md:text-sm">
              <p>Products Sold <br /> Last Month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-6 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 10%
                </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 w-[max-content]">
            <p className="font-bold text-5xl md:text-7xl">107</p>
            <div className="flex flex-col items-start justify-end text-xs md:text-sm">
              <p>Out of Stock</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 w-[max-content]">
            <p className="font-bold text-5xl md:text-7xl">10</p>
            <div className="flex flex-col items-right justify-end text-xs md:text-sm  text-right">
              <p>Returned <br /> Last Month</p>
            </div>
          </div>
        </div>
    </div>
  );
}
