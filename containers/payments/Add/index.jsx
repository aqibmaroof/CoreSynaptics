"use client";

import { useState } from "react";
import { FaTrash, FaCog, FaArrowRight } from "react-icons/fa";
import { FaMessage } from "react-icons/fa6";
import SendInvoicePanel from "../../../components/Modals/SendInvoiceModal";

export default function InvoiceEditor() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [items, setItems] = useState([
    { name: "", desc: "", cost: "", qty: 1 },
  ]);

  const addItem = () => {
    setItems([...items, { name: "", desc: "", cost: "", qty: 1 }]);
  };

  const deleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 bg-white dark:bg-[#183431] min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SECTION (Main Invoice Form) */}
        <div className="lg:col-span-2 ">
          <div className="bg-[#f6f6f6]  dark:bg-[#1e4742] rounded-xl p-6 shadow">
            {/* Header */}
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl text-[#183431] dark:text-white font-bold flex items-center gap-2">
                  <span className="text-accent">⚡</span> Sneat
                </h2>
                <p className="text-lg text-[#183431] dark:text-white mt-2 leading-relaxed">
                  Office 149, 450 South Brand Brooklyn <br />
                  San Diego County, CA 91905, USA <br />
                  +1 (123) 456 7891, +44 (876) 543 2198
                </p>
              </div>

              <div className="bg-[#e6e3e3]  dark:bg-[#215450] rounded-xl p-4 w-64">
                <div className="flex flex-col gap-2 text-sm">
                  <label className="font-semibold">Invoice</label>
                  <input
                    type="text"
                    placeholder="#3905"
                    className="input input-bordered input-sm w-full  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                  />
                  <label>Date Issued:</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    className="input input-bordered input-sm w-full  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                  />
                  <label>Due Date:</label>
                  <input
                    type="text"
                    placeholder="MM/DD/YYYY"
                    className="input input-bordered input-sm w-full  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                  />
                </div>
              </div>
            </div>

            {/* Invoice To / Bill To */}
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <div className="dropdown dropdown-bottom w-full">
                  <label
                    tabIndex={0}
                    className="btn w-full bg-[#f6f6f6] dark:bg-transparent text-[#183431] dark:text-white border border-black dark:border-white flex justify-between items-center"
                  >
                    Jordan Stevenson
                    {/* Arrow icon */}
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu bg-[#f6f6f6]  dark:bg-[#1e4742] w-full rounded-box border border-black dark:border-white"
                  >
                    <li>
                      <a>Jordan Stevenson</a>
                    </li>
                    <li>
                      <a>John Stevenson</a>
                    </li>
                    <li>
                      <a>Colin Stevenson</a>
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-[#183431] dark:text-white mt-2">
                  Shelby Company Limited <br />
                  Small Heath, B10 OHF, UK <br />
                  718-986-6062 <br />
                  peaklyFBlinders@gmail.com
                </p>
              </div>

              <div>
                <p className="font-semibold text-[#183431] dark:text-white mb-2">
                  Bill To:
                </p>
                <p className="text-lg text-[#183431] dark:text-white leading-6">
                  Total Due: <span className="font-semibold">$12,110.55</span>{" "}
                  <br />
                  Bank name: American Bank <br />
                  Country: United States <br />
                  IBAN: ETD95476213874685 <br />
                  SWIFT code: BR91905
                </p>
              </div>
            </div>

            <div className="divider before:h-[0.1px] after:h-[0.1px] divider-neutral dark:divider-accent my-8"></div>

            {/* ITEMS TABLE */}
            <div>
              <div className="grid grid-cols-4 text-md  text-center font-semibold opacity-70 mb-3">
                <p>Item</p>
                <p>Cost</p>
                <p>Qty</p>
                <p>Price</p>
              </div>

              {/* Item Rows */}
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#f6f6f6]  dark:bg-[#1e4742] p-4 rounded-lg mb-4 border border-black dark:border-white"
                >
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      placeholder="App Customization"
                      className="input input-bordered w-1/3  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                    />

                    <input
                      type="text"
                      placeholder="24"
                      className="input input-bordered w-24  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                    />

                    <input
                      type="text"
                      placeholder="1"
                      className="input input-bordered w-20  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                    />

                    <p className="w-20 text-right font-semibold">$24.00</p>

                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={() => deleteItem(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <textarea
                    rows="2"
                    className="textarea textarea-bordered w-full mt-3  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                    placeholder="Customization & Bug fixes"
                  ></textarea>

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-sm text-[#183431] dark:text-white">
                      Discount:
                    </p>
                    <FaCog className="cursor-pointer opacity-60 hover:opacity-100" />
                  </div>
                </div>
              ))}

              <button className="btn btn-accent btn-md mt-2" onClick={addItem}>
                + Add Item
              </button>
            </div>

            {/* Summary */}
            <div className="mt-10 grid grid-cols-2 gap-6">
              <div>
                <label className="font-semibold">Salesperson:</label>
                <input
                  type="text"
                  placeholder="Edward Crowley"
                  className="input input-bordered w-full mt-2  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                />

                <input
                  type="text"
                  placeholder="Thanks for your business"
                  className="input input-bordered w-full mt-3  bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                />
              </div>

              <div className="text-right text-[#183431] dark:text-white space-y-2">
                <p>
                  Subtotal: <span className="font-semibold">$1800</span>
                </p>
                <p>
                  Discount: <span className="font-semibold">$28</span>
                </p>
                <p>
                  Tax: <span className="font-semibold">21%</span>
                </p>
                <p className="text-xl font-bold">Total: $1690</p>
              </div>
            </div>

            {/* Note */}
            <div className="mt-8">
              <label className="font-semibold">Note:</label>
              <textarea
                className="textarea textarea-bordered w-full mt-2 bg-[#f6f6f6] dark:bg-transparent bg-[transparent] border border-black dark:border-white text-[#183431] dark:text-white placeholder-[#183431] dark:placeholder-white"
                rows="2"
                placeholder="It was a pleasure working with you..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          <div className="bg-[#f6f6f6]  dark:bg-[#1e4742] p-6 rounded-xl shadow space-y-4">
            <button
              className="btn btn-accent w-full flex items-center gap-2"
              onClick={() => setPanelOpen(true)}
            >
              <FaMessage /> Send Invoice
            </button>

            <button className="btn btn-accent btn-outline w-full">
              Preview
            </button>
            <button className="btn btn-success w-full">Save</button>

            <div className="divider before:h-[0.1px] after:h-[0.1px] divider-neutral dark:divider-accent"></div>

            <p className="font-semibold text-[#183431] dark:text-white text-md">
              Accept payments via
            </p>

            <div className="dropdown dropdown-bottom w-full">
              <label
                tabIndex={0}
                className="btn w-full bg-[#f6f6f6] dark:bg-transparent text-[#183431] dark:text-white border border-black dark:border-white flex justify-between items-center"
              >
                Bank Account
                {/* Arrow icon */}
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-[#f6f6f6]  dark:bg-[#1e4742] w-full rounded-box border border-black dark:border-white"
              >
                <li>
                  <a>Bank Account</a>
                </li>
                <li>
                  <a>Invoice</a>
                </li>
                <li>
                  <a>Cash</a>
                </li>
              </ul>
            </div>
            <div className="mt-4 space-y-2 text-md">
              <div className="flex justify-between">
                <span className="text-[#183431] dark:text-white">
                  Payment Terms
                </span>
                <input type="checkbox" className="toggle toggle-accent" />
              </div>

              <div className="flex justify-between">
                <span className="text-[#183431] dark:text-white">
                  Client Notes
                </span>
                <input type="checkbox" className="toggle toggle-accent" />
              </div>

              <div className="flex justify-between">
                <span className="text-[#183431] dark:text-white">
                  Payment Stub
                </span>
                <input type="checkbox" className="toggle toggle-accent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SendInvoicePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
