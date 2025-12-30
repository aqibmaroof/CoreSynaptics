import React from "react";
import { BsPencilSquare } from "react-icons/bs"; // Using react-icons for the 'Edit' pencil icon
import CustomerDetailsCard from "../../../../components/Cards/CustomerDetails";
import ShippingAddressCard from "../../../../components/Cards/ShippingAddressDetails";
import BillingAddressCard from "../../../../components/Cards/DeliveryAddressCard";
import ShippingActivityCard from "../../../../components/Cards/ShippingActivityCard";

// 1. Data Structure
const orderData = [
  {
    product: "Oneplus 10",
    details: "Storage:128gb",
    price: 896,
    qty: 3,
    total: 2688,
    image: "/images/oneplus.png", // Placeholder for actual image path
  },
  {
    product: "Nike Jordan",
    details: "Size:8UK",
    price: 392,
    qty: 1,
    total: 392,
    image: "/images/jordan.png", // Placeholder for actual image path
  },
  {
    product: "Wooden Chair",
    details: "Material: Wooden",
    price: 841,
    qty: 2,
    total: 1682,
    image: "/images/chair.png", // Placeholder for actual image path
  },
  {
    product: "Face cream",
    details: "Gender:Women",
    price: 813,
    qty: 2,
    total: 1626,
    image: "/images/facecream.png", // Placeholder for actual image path
  },
];

const HuntOrderDetail = () => {
  // Hardcoded summary values from the image
  const subtotal = 2093;
  const discount = 2;
  const tax = 28;
  const finalTotal = 2113;

  // Helper function to render a product row
  const renderProductRow = (item, index) => (
    <tr key={index} className="border-b border-gray-700/50">
      {/* Checkbox Column */}
      <td className="w-10 pr-2">
        <input
          type="checkbox"
          className="checkbox checkbox-sm checkbox-primary bg-[#f6f6f6] dark:bg-white  border-gray-500"
        />
      </td>

      {/* Product Column */}
      <td className="py-3 text-sm font-medium">
        <div className="flex items-center space-x-3">
          {/* Product Image Placeholder (mimics the small icon look) */}
          <div className="mask mask-squircle w-12 h-12 bg-white p-1 flex items-center justify-center">
            {/* Replace with an <img> tag pointing to the actual image source */}
            <span className="text-xs text-[#101437]">IMG</span>
          </div>
          <div>
            <div className="font-bold text-[#101437] dark:text-white">
              {item.product}
            </div>
            <div className="text-xs text-[#101437] dark:text-white opacity-50">
              {item.details}
            </div>
          </div>
        </div>
      </td>

      {/* Price Column */}
      <td className=" text-[#101437] dark:text-white font-medium">
        ${item.price}
      </td>

      {/* QTY Column */}
      <td className=" text-[#101437] dark:text-white font-medium">
        {item.qty}
      </td>

      {/* Total Column */}
      <td className=" text-[#101437] dark:text-white font-bold text-right">
        {item.total}
      </td>
    </tr>
  );

  return (
    // Outer container mimicking the dark background from the image.
    // Use the 'dark' theme configuration or a custom class if not using the DaisyUI dark theme.
    <div className="flex items-start justify-start w-full gap-10">
      <div className="flex flex-col justify-center items-start w-full">
        <div className="bg-[#f6f6f6] dark:bg-[#1e4742] p-6 rounded-xl shadow-2xl ml-5 mt-5 w-full">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-[#101437] dark:text-white">
              Hunt Booked details
            </h2>
            <button className="flex items-center text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
              Edit
            </button>
          </div>

          {/* --- Table Section --- */}
          <div className="overflow-x-auto">
            <table className="table w-full  text-[#101437] dark:text-white">
              {/* Table Header (<thead>) */}
              <thead className="border-b border-gray-700/50  text-[#101437] dark:text-white text-xs uppercase tracking-wider">
                <tr>
                  <th className="w-10 pr-2"></th>{" "}
                  {/* Empty for checkbox column */}
                  <th className="font-normal py-3">Products</th>
                  <th className="font-normal">Price</th>
                  <th className="font-normal">Qty</th>
                  <th className="font-normal text-right">Total</th>
                </tr>
              </thead>

              {/* Table Body (<tbody>) */}
              <tbody>{orderData.map(renderProductRow)}</tbody>
            </table>
          </div>
          {/* --- End Table Section --- */}

          {/* --- Summary Section --- */}
          <div className="mt-8 text-sm text-white">
            {/* Subtotal Row */}
            <div className="flex justify-end gap-x-12 mb-2">
              <span className="text-[#101437] dark:text-white">Subtotal:</span>
              <span className="w-20  text-[#101437] dark:text-white text-right font-medium">
                ${subtotal}
              </span>
            </div>

            {/* Discount Row */}
            <div className="flex justify-end gap-x-12 mb-2">
              <span className="text-[#101437] dark:text-white">Discount:</span>
              <span className="w-20 text-right font-medium text-red-400">
                -${discount}
              </span>
            </div>

            {/* Tax Row */}
            <div className="flex justify-end gap-x-12 mb-2">
              <span className="text-[#101437] dark:text-white">Tax:</span>
              <span className="w-20  text-[#101437] dark:text-white text-right font-medium">
                ${tax}
              </span>
            </div>

            {/* Total Row (Bold and slightly bigger) */}
            <div className="flex justify-end gap-x-12 pt-3 border-t border-gray-700/50">
              <span className="text-lg  text-[#101437] dark:text-white font-semibold">
                Total:
              </span>
              <span className="w-20  text-[#101437] dark:text-white text-right text-lg font-bold">
                ${finalTotal}
              </span>
            </div>
          </div>
          {/* --- End Summary Section --- */}
        </div>
        <ShippingActivityCard />
      </div>
      <div className="mt-5 mr-5 w-[40%]">
        <CustomerDetailsCard />
        <ShippingAddressCard />
        <BillingAddressCard />
      </div>
    </div>
  );
};

export default HuntOrderDetail;
