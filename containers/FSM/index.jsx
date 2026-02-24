"use client";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

export default function KanbanBoard() {
    return(
        <div className="min-h-screen font-gilroy p-6 text-[#101437] dark:text-white">
            {/* Stats */}
            <h1 className="text-xl font-bold">Overview</h1>
            <div className="flex items-center justify-between w-full gap-3 mt-2">
                <div className="flex items-center justify-left gap-6 w-full ">
                    <p className="text-7xl font-bold font-gilroy">1050</p>
                    <div className="flex flex-col items-start justify-end text-sm w-30">
                    <p>
                        Total Work Orders
                    </p>
                    </div>
                </div>
                <div className="flex items-center justify-left gap-6 w-full">
                    <p className="font-bold text-7xl">877</p>
                    <div className="flex flex-col items-right justify-end text-sm ">
                    <p>
                        Completed Work Orders
                    </p>
                    </div>
                </div>
                <div className="flex items-center justify-left gap-6 w-full">
                    <p className="font-bold text-7xl">154</p>
                    <div className="flex flex-col items-start justify-end text-sm">
                    <p>
                        Total Service Appointments
                    </p>
                    <p className="bg-gradient-to-r from-[#080c26] to-[#6d1726] text-xs px-2 py-1 rounded-lg flex items-center mt-1 w-[max-content] ">
                        <FiArrowDown />
                        25%
                    </p>
                    </div>
                </div>
                <div className="flex items-center justify-left gap-6 w-full">
                    <p className="text-7xl font-bold ">89</p>
                    <div className="flex flex-col items-start justify-end text-right text-base">
                    <p>
                        Completed Service Appointments
                    </p>
                    </div>
                </div>
            </div>
        </div>
    );
}