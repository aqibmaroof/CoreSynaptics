import { FiArrowUp } from "react-icons/fi";
import config from "../../../config";

export default function ProfileReportCard({ user }) {
  return (
    <div className="w-full px-2 flex items-center justify-between">
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-[#DF5B30] dark:text-[#fff] text-2xl font-semibold">
          Projects Overview
        </h2>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div className="flex items-center justify-between gap-25 w-[max-content]">
            <p className="text-6xl font-bold">06</p>
            <div className="flex flex-col items-start justify-end">
              <p>this month</p>
              <p className="bg-gradient-to-r from-[#080C26] to-[#00E691] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-25 w-[max-content]">
            <p className="text-6xl font-bold">01</p>
            <div className="flex flex-col items-right justify-end">
              <p>last month</p>
              <p className="bg-gradient-to-r from-[#080C26] to-[#FF2727] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
        </div>
      </div>
      <img src={config?.line} />
      <div>
        <h2 className="text-[#DF5B30] dark:text-[#fff] text-2xl font-semibold">
          Units Overview
        </h2>
        <div className="flex items-center justify-between w-full mt-4 gap-20">
          <div className="flex items-center justify-between gap-25 w-[max-content]">
            <p className="text-6xl font-bold">200</p>
            <div className="flex flex-col items-start justify-end">
              <p>this month</p>
              <p className="bg-gradient-to-r from-[#080C26] to-[#00E691] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-25 w-[max-content]">
            <p className="text-6xl font-bold">89</p>
            <div className="flex flex-col items-right justify-end">
              <p>last month</p>
              <p className="bg-gradient-to-r from-[#080C26] to-[#FF2727] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ml-auto">
                <FiArrowUp /> 500%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
