import React from "react";
import { BsFillCartFill } from "react-icons/bs";

// 1. Data Structure for the Timeline
const timelineEvents = [
  {
    status: "Pick-up",
    description: "Your order has been placed successfully",
    time: "Thursday 11:29 AM",
    isComplete: true, // Indicates a blue (active/complete) circle
  },
  {
    status: "Dispatched",
    description: "Item been scheduled up by courier",
    time: "Saturday 15:20 AM",
    isComplete: false, // Indicates a gray (pending) circle
  },
  {
    status: "Package arrived",
    description: "Package arrived at an an Amazon facility, NY",
    time: "Today 14:12 PM",
    isComplete: true, // Can be used to highlight the current step
  },
  {
    status: "Delivery",
    description: "KW 8NW, London",
    time: null, // Time might not be set yet for the final step
    isComplete: false,
  },
];

const ShippingActivityCard = () => {
  return (
    // Outer container matching the dark theme
    <div className="card w-full bg-[#f6f6f6] dark:bg-[#1e4742] rounded-xl shadow-2xl p-6 md:p-8 w-full ml-5 mt-5">
      {/* --- Header --- */}
      <h2 className="text-xl font-semibold text-[#101437] dark:text-white mb-6">
        Shipping activity
      </h2>

      {/* --- Customer Profile (Top Section) --- */}
      <div className="mb-6 space-y-4">
        {/* Profile Details */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar Placeholder */}
            <div className="avatar">
              <div className="w-10 rounded-full bg-blue-600 flex items-center justify-center">
                {/* Replace with actual image: <img src="[image path]" alt="Avatar" /> */}
                <span className="text-white font-bold text-lg">ST</span>
              </div>
            </div>
            <div>
              <p className=" text-[#101437] dark:text-white font-medium">
                Shamus Tuttle
              </p>
              <p className="text-sm  text-[#101437] dark:text-white">
                Customer ID: #58909
              </p>
            </div>
          </div>
          {/* Hardcoded time from the image */}
          <span className="text-xs  text-[#101437] dark:text-white pt-1">
            Tuesday 11:29 AM
          </span>
        </div>

        {/* Orders Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 ml-14">
            <BsFillCartFill className="text-green-500 h-5 w-5" />
            <p className=" text-[#101437] dark:text-white">12 Orders</p>
          </div>
          {/* Hardcoded time from the image */}
          <span className="text-xs  text-[#101437] dark:text-white pt-1">
            Wednesday 11:29 AM
          </span>
        </div>
      </div>

      {/* --- Timeline (The core of the design) --- */}
      <div className="flex flex-col space-y-6 pt-4">
        {timelineEvents.map((event, index) => (
          <div key={index} className="flex relative">
            {/* Vertical Line Connector */}
            {index < timelineEvents.length - 1 && (
              <div
                className={`absolute left-[6.5px] top-6 w-0.5 h-full ${
                  index === 0 && event.isComplete // Only draw the line after the first element if it's complete
                    ? "bg-blue-600"
                    : "bg-gray-700"
                }`}
                // The line should connect to the next element. The total height depends on the content.
                style={{ height: "calc(100% - 0.5rem)" }}
              ></div>
            )}

            {/* Status Dot */}
            <div className="flex-shrink-0 mr-4">
              <div
                className={`w-4 h-4 rounded-full ${
                  index === 0 && event.isComplete
                    ? "bg-blue-600"
                    : "bg-gray-500"
                }`}
              ></div>
            </div>

            {/* Content and Time */}
            <div className="flex-grow flex justify-between">
              <div className="max-w-xs pr-4">
                <p
                  className={`font-semibold ${
                    event.isComplete
                      ? " text-[#101437] dark:text-white"
                      : " text-[#101437] dark:text-white"
                  }`}
                >
                  {event.status}
                </p>
                <p className="text-sm  text-[#101437] dark:text-white leading-snug">
                  {event.description}
                </p>
              </div>

              {/* Time Stamp */}
              {event.time && (
                <span className="text-xs  text-[#101437] dark:text-white flex-shrink-0 text-right">
                  {event.time}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingActivityCard;
