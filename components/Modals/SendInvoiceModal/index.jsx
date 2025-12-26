"use client";

import { FaCog } from "react-icons/fa";

export default function SendInvoicePanel({ open, onClose }) {
  return (
    <div>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0  backdrop-blur-sm z-40 transition-opacity duration-500"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel 
      
      
      */}
      <div
        className={`fixed top-0 right-0 h-[max-content] w-[380px] bg-[#f6f6f6]  dark:bg-[#1e4742] rounded-xl m-4 shadow-xl z-50 p-6
        transform transition-transform duration-500
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl text-[#183431] dark:text-white font-semibold">
            Send Invoice
          </h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-accent btn-outline"
          >
            ✕
          </button>
        </div>

        {/* From */}
        <label className="text-md text-[#183431] dark:text-white">From</label>
        <input
          type="email"
          defaultValue="shelbyCompany@email.com"
          className="input input-bordered w-full mb-2 mt-2 bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
        />

        {/* To */}
        <label className="text-md text-[#183431] dark:text-white">To</label>
        <div className="relative">
          <input
            type="email"
            defaultValue="qConsolidated@email.com"
            className="input input-bordered w-full mb-2 mt-2 bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
          />
        </div>

        {/* Subject */}
        <label className="text-md text-[#183431] dark:text-white">
          Subject
        </label>
        <input
          type="text"
          defaultValue="Invoice of purchased Admin Templates"
          className="input input-bordered w-full mb-2 mt-2 bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
        />

        {/* Message */}
        <label className="text-md text-[#183431] dark:text-white">
          Message
        </label>
        <textarea
          rows={6}
          className="textarea textarea-bordered w-full mb-1 mt-2 leading-relaxed bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
          defaultValue={`Dear Queen Consolidated,
Thank you for your business, always a pleasure to work with you!
We have generated a new invoice in the amount of $95.59
We would appreciate payment of this invoice by 05/11/2021`}
        ></textarea>

        {/* Invoice Attached */}
        <div className="pt-3">
          <span className="badge badge-outline text-[#183431] dark:text-white gap-2 ">
            📎 Invoice Attached
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 mt-4">
          <button className="btn btn-accent w-full">Send</button>
          <button className="btn btn-accent btn-outline w-full">Cancel</button>
        </div>
      </div>
    </div>
  );
}
