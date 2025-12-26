import React from "react";
import { BsPencilSquare } from "react-icons/bs";

const BillingAddressCard = () => {
  return (
    // Card container using DaisyUI/Tailwind dark background color
    <div className="card w-full bg-[#f6f6f6] dark:bg-[#1e4742] shadow-xl p-5 rounded-xl">
      {/* Billing Address Header with Edit button */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-[#183431] dark:text-white">
          Billing address
        </h2>
        <button className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
          Edit
        </button>
      </div>

      {/* Address Details */}
      <div className="text-sm text-[#183431] dark:text-white leading-relaxed mb-6 border-b border-gray-700/50 pb-4">
        <p>45 Roker Terrace</p>
        <p>Latheronwheel</p>
        <p>KW5 8NW, London</p>
        <p>UK</p>
      </div>

      {/* Mastercard Details */}
      <div>
        <p className="text-base font-semibold text-[#183431] dark:text-white mb-2">
          Mastercard
        </p>
        <p className="text-sm text-[#183431] dark:text-white">
          Card Number: ********4291
        </p>
      </div>
    </div>
  );
};

export default BillingAddressCard;
