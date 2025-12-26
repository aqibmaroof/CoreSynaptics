// components/cards/OrderStatisticsCard.jsx
import React from "react";
import CardWrapper from "../../CardWrapper";
import { FaMobileAlt, FaTshirt, FaHome, FaFootballBall } from "react-icons/fa"; // Example icons

// Helper for dynamic icon rendering
const getCategoryIcon = (categoryName) => {
  switch (categoryName) {
    case "Electronic":
      return <FaMobileAlt className="text-purple-500 text-lg" />;
    case "Fashion":
      return <FaTshirt className="text-green-500 text-lg" />;
    case "Decor":
      return <FaHome className="text-blue-500 text-lg" />;
    case "Sports":
      return <FaFootballBall className="text-red-500 text-lg" />;
    default:
      return <div className="w-5 h-5 bg-gray-300 rounded-full"></div>; // Placeholder
  }
};

const OrderStatisticsCard = ({ data }) => {
  const { title, totalSales, totalOrders, weeklyPercentage, categories } = data;

  return (
    <CardWrapper className="col-span-4 flex flex-col justify-between">
      {" "}
      {/* Example: Takes 4 columns */}
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#183431] dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-[#fff]">
            {totalSales} Total Sales
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </button>
      </div>
      {/* Orders Count & Radial Chart */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {totalOrders.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-[#fff]">Total Orders</p>
        </div>
        {/* Radial Progress Bar - Simplified with a ring. For actual animation, use a charting library. */}
        <div
          className="relative w-20 h-20 rounded-full flex items-center justify-center text-sm font-semibold text-gray-800 dark:text-white"
          style={{
            background: `conic-gradient(#8b5cf6 ${weeklyPercentage}%, #e2e8f0 ${weeklyPercentage}%)`, // Tailwind purple-500 and gray-200
            boxShadow: "inset 0 0 0 8px rgba(255,255,255,0.8)", // Inner white border effect
          }}
        >
          <div className="absolute w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
            {weeklyPercentage}%
            <span className="absolute -bottom-7 text-xs text-gray-500 dark:text-[#fff]">
              Weekly
            </span>
          </div>
        </div>
      </div>
      {/* Categories List */}
      <div className="space-y-4">
        {categories.map((cat, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                {getCategoryIcon(cat.name)}
              </div>
              <div>
                <p className="text-base font-medium text-gray-800 dark:text-white">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-[#fff]">
                  {cat.description}
                </p>
              </div>
            </div>
            <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
              {cat.value}
            </p>
          </div>
        ))}
      </div>
    </CardWrapper>
  );
};

export default OrderStatisticsCard;
