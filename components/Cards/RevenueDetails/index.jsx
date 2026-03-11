import { FiArrowUp } from "react-icons/fi";

export default function RevenueDetails({ user }) {
  return (
    <div className="w-full gap-20 flex items-center justify-between font-gilroy">
      {/* LEFT SIDE */}
      <div>
        <div className="flex items-center justify-between w-full mt-4 gap-14">
          <div>
            <h1 className="text-white text-xl md:text-2xl font-semibold">
              Total Revenue
            </h1>
            <div className="flex items-center justify-between gap-6 w-[max-content]">
              <p className="text-4xl md:text-6xl font-bold font-gilroy">$105K</p>
              <div className="flex flex-col items-start justify-end text-sm md:text-sm">
                <p>this month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 20%
                </p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold">
              Total Orders
            </h1>
            <div className="flex items-center justify-between gap-6 w-[max-content]">
              <p className="font-bold text-4xl md:text-6xl">2704</p>
              <div className="flex flex-col items-right justify-end text-sm md:text-sm">
                <p>last month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 10%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div>
            <h1 className="text-white text-2xl font-semibold">
              Monthly Growth
            </h1>
            <div className="flex items-center justify-between gap-6 w-[max-content]">
              <p className="text-4xl md:text-6xl font-bold font-gilroy">48%</p>
              <div className="flex flex-col items-start justify-end text-sm md:text-sm">
                <p>this month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 22%
                </p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold">
              Orders Today
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-4xl md:text-6xl font-bold ">15</p>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
