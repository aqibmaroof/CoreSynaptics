import { FiArrowDown, FiArrowUp } from "react-icons/fi";

export default function RevenueDetails({ user }) {
  return (
    <div className="w-full gap-20 flex items-center justify-between font-gilroy">
      {/* LEFT SIDE */}
      <div>
        <h1 className="text-[#fff] text-2xl font-semibold">
          Warehouse Overview
        </h1>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div>
            <div className="flex items-center justify-between gap-10 w-[max-content]">
              <p className="text-8xl font-bold font-gilroy">450</p>
              <div className="flex flex-col items-start justify-end text-2xl w-30">
                <p>Products In Stock </p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-10 w-[max-content]">
              <p className="text-6xl font-bold text-8xl">1500</p>
              <div className="flex flex-col items-left text-[20px] justify-left leading-[1.1] w-40">
                <p>Products Sold Last Month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726]  px-5 py-1 rounded-lg flex items-center mt-1 w-[max-content]">
                  <FiArrowDown /> 25%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div>
            <div className="flex items-center justify-between gap-10 w-[max-content]">
              <p className="text-7xl font-bold font-gilroy">107</p>
              <div className="flex flex-col items-start justify-end text-2xl">
                <p>Out Of Stock</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between gap-10 w-[max-content]">
              <p className="text-6xl font-bold text-7xl">10</p>
              <div className="flex flex-col items-center justify-center text-2xl w-35">
                <p className="text-center">Returned Last Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
