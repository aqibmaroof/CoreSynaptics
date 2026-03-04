import { FiArrowUp } from "react-icons/fi";
import config from "../../../config";

export default function ProfileReportCard({ user }) {
  return (
    <div className="w-full px-3 gap-10 flex items-center justify-center text-white font-gilroy">
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-[#fff] text-2xl font-semibold">
          Projects Overview
        </h2>
        <div className="flex text-white items-center justify-between w-full mt-4 gap-20">
          <div className="flex items-center justify-left gap-6 w-full ">
            <p className="text-7xl font-bold text-white font-gilroy text-7xl">06</p>
            <div className="flex flex-col items-end justify-end text-sm w-30">
              <p>this month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-white text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-left gap-6 w-full ">
            <p className="text-7xl font-bold font-gilroy text-7xl">01</p>
            <div className="flex flex-col items-end justify-end text-sm text-white w-30">
              <p>last month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-white text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
        </div>
      </div>
      <img
        src={config?.line}
        className="text-center flex items-center justify-center mx-5 pl-5"
      />
      <div>
        <h2 className="text-[#fff] text-2xl font-semibold">Units Overview</h2>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div className="flex items-center justify-left gap-6 w-full ">
            <p className="text-7xl font-bold font-gilroy text-7xl">200</p>
            <div className="flex flex-col items-end justify-end text-sm w-30">
              <p>this month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-left gap-6 w-full ">
            <p className="text-7xl font-bold font-gilroy text-7xl">89</p>
            <div className="flex flex-col items-end justify-end text-sm w-30">
              <p>last month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
