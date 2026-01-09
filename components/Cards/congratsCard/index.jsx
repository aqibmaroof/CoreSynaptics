import { FiArrowUp } from "react-icons/fi";
import config from "../../../config";

export default function ProfileReportCard({ user }) {
  return (
    <div className="w-full px-3 gap-10 flex items-center justify-center font-gilroy">
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-[#DF5B30] dark:text-[#fff] text-2xl font-semibold">
          Projects Overview
        </h2>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div className="flex items-center justify-between gap-20 w-[max-content]">
            <p className="text-8xl font-bold font-gilroy">06</p>
            <div className="flex flex-col items-start justify-end text-2xl">
              <p>this month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
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
      <img
        src={config?.line}
        className="text-center flex items-center justify-center mx-5 pl-5"
      />
      <div>
        <h2 className="text-[#DF5B30] dark:text-[#fff] text-2xl font-semibold">
          Units Overview
        </h2>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div className="flex items-center justify-between gap-15 w-[max-content]">
            <p className="text-6xl font-bold text-8xl">200</p>
            <div className="flex flex-col items-start justify-end text-2xl">
              <p>this month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#056050] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-15 w-[max-content]">
            <p className="text-6xl font-bold text-8xl">89</p>
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
  );
}
