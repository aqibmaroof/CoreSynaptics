import React from "react";
import { BsPencilSquare, BsFillCartFill } from "react-icons/bs";

const CustomerDetailsCard = () => {
  return (
    // Card container using DaisyUI/Tailwind dark background color
    <div className="card w-full bg-[#1e4742] shadow-xl p-5 mb-4 rounde-xl">
      {/* Card Header */}
      <h2 className="text-xl font-semibold text-white mb-4">
        Customer details
      </h2>

      {/* Profile Section */}
      <div className="flex items-start space-x-4 mb-5">
        {/* Avatar Placeholder */}
        <div className="avatar">
          <div className="w-12 rounded-full bg-blue-600 flex items-center justify-center">
            {/* Replace with actual image: <img src="[image path]" alt="Avatar" /> */}
            <span className="text-white font-bold text-lg">ST</span>
          </div>
        </div>
        <div>
          <p className="text-white font-medium">
            Shamus Tuttle
          </p>
          <p className="text-sm text-white">
            Customer ID: #58909
          </p>
        </div>
      </div>

      {/* Orders Count */}
      <div className="flex items-center space-x-3 mb-6">
        <BsFillCartFill className="text-green-500 h-5 w-5" />
        <p className="text-white">12 Orders</p>
      </div>

      {/* Contact Info Section */}
      <div className="flex justify-between items-start pt-4 border-t border-gray-700/50">
        <div>
          <p className="text-base font-semibold text-white mb-2">
            Contact info
          </p>
          <p className="text-sm  text-white">
            Email: Shamus889@yahoo.com
          </p>
          <p className="text-sm  text-white">
            Mobile: +1 (609) 972-22-22
          </p>
        </div>
        <button className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
          Edit
        </button>
      </div>
    </div>
  );
};

export default CustomerDetailsCard;
