import { FiArrowDown, FiArrowUp } from "react-icons/fi";
import config from "../../../config";

export default function WareHouseOverview({ user }) {
  return (
    <div className="w-full px-3 gap-10 flex items-center text-white justify-between font-gilroy mt-10 mb-6">
      {/* LEFT SIDE */}
      <div>
        <h2 className="text-[#fff] text-2xl font-semibold">
          Warehouse Overview
        </h2>
        <div className="flex items-center justify-between w-full mt-4 gap-30">
          <div className="flex items-center justify-between gap-10 w-full">
            <p className="text-7xl font-bold font-gilroy text-white">06</p>
            <div className="flex flex-col items-start justify-end text-white text-2xl w-30">
              <p>Products In Stock</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10 w-full">
            <p className="text-6xl font-bold text-7xl">1500</p>
            <div className="flex flex-col items-right justify-end w-full text-2xl w-40">
              <p className="w-38">Products Sold Last Month</p>
              <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 m-auto">
                <FiArrowDown /> 500%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between w-full mt-4 gap-30">
          <div className="flex items-center justify-between gap-10 w-full">
            <p className="text-6xl font-bold text-7xl">107</p>
            <div className="flex flex-col items-start justify-end text-2xl">
              <p>Out of Stock</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10 w-full">
            <p className="text-6xl font-bold text-7xl">10</p>
            <div className="flex flex-col items-right justify-end text-2xl text-right">
              <p>Returned Last Month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
