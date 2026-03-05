import { FiArrowUp } from "react-icons/fi";

export default function RevenueDetails({ user }) {
  return (
    <div className="w-full gap-20 flex items-center justify-between font-gilroy">
      {/* LEFT SIDE */}
      <div>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div>
            <h1 className="text-white text-2xl font-semibold">
              Total Revenue
            </h1>
            <div className="flex items-center justify-between gap-20 w-[max-content]">
              <p className="text-8xl font-bold font-gilroy">06</p>
              <div className="flex flex-col items-start justify-end text-2xl">
                <p>this month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 500%
                </p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold">
              Total Orders
            </h1>
            <div className="flex items-center justify-between gap-20 w-[max-content]">
              <p className="text-6xl font-bold text-8xl">01</p>
              <div className="flex flex-col items-right justify-end text-2xl">
                <p>last month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 500%
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
            <div className="flex items-center justify-between gap-20 w-[max-content]">
              <p className="text-8xl font-bold font-gilroy">06</p>
              <div className="flex flex-col items-start justify-end text-2xl">
                <p>this month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 500%
                </p>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold">
              Orders Today
            </h1>
            <div className="flex items-center justify-between gap-20 w-[max-content]">
              <p className="text-6xl font-bold text-8xl">01</p>
              <div className="flex flex-col items-right justify-end text-2xl">
                <p>last month</p>
                <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                  <FiArrowUp /> 500%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
