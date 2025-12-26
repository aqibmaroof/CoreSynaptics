import React from "react";
import { BsPencilSquare } from "react-icons/bs";

const ShippingAddressCard = () => {
  return (
    // Card container using DaisyUI/Tailwind dark background color
    <div className="card w-full  shadow-xl bg-[#f6f6f6] dark:bg-[#1e4742] p-5 mb-4 rounded-xl">
      {/* Card Header with Edit button */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-[#183431] dark:text-white">
          Shipping address
        </h2>
        <button className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
          Edit
        </button>
      </div>

      {/* Address Details */}
      <div className="text-sm text-[#183431] dark:text-white leading-relaxed">
        <p>45 Roker Terrace</p>
        <p>Latheronwheel</p>
        <p>KW5 8NW, London</p>
        <p>UK</p>
      </div>
    </div>
  );
};

export default ShippingAddressCard;
