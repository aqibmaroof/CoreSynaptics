"use client";

import { useState } from "react";
import Link from "next/link";
import { sidebarItems } from "./sideBarData";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import config from "../../config";

const Sidebar = () => {
  const router = useRouter();

  const [openIndex, setOpenIndex] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [activeSubSubIndex, setActiveSubSubIndex] = useState(null);

  const toggleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
    setActiveSubIndex(null);
    setActiveSubSubIndex(null);
  };

  return (
    <aside className="w-[250px] bg-white dark:bg-[#183431] dark:text-white py-2 transition-colors duration-300 overflow-y-auto h-screen scrollbar-hide">
      {/* LIGHT ↔ DARK LOGOS */}
      <div className="sticky -top-2 -mt-5 bg-white dark:bg-[#183431] z-10 py-5">
        <img src={config?.brand} className="w-40 h-auto m-auto dark:hidden" />
        <img
          src={config?.brand_dark}
          className="w-40 h-auto m-auto hidden dark:block"
        />
      </div>
      <ul className="list-none m-0 p-0 mt-5 mb-15">
        {sidebarItems.map((item, index) => (
          <li key={index}>
            {/* CATEGORY TITLE */}
            <p className="text-[#DF5B30] my-2 mx-4">{item.category}</p>

            {/* MAIN ITEM */}
            <div
              className="flex items-center py-3 px-5 cursor-pointer text-[#2B3340] dark:text-white hover:text-[#2B3340] dark:hover:text-[#183431] hover:bg-[#A9D18E] transition"
              onClick={() =>
                item.submenu.length > 0
                  ? toggleSubmenu(index)
                  : item.title === "View Website" || item.title === "Support"
                  ? window.open(item.path, "_blank")
                  : router.push(item.path)
              }
            >
              <span className="mr-3">{item.icon}</span>
              <span className="flex-1">{item.title}</span>

              {item.submenu.length > 0 && (
                <span className="text-xs">
                  {openIndex === index ? <FaChevronDown /> : <FaChevronRight />}
                </span>
              )}
            </div>

            {/* SUBMENU */}
            {item.submenu.length > 0 && openIndex === index && (
              <ul
                className={`list-none mt-1 ${
                  item.title === "Orders" ? "pl-8" : "pl-10"
                }`}
              >
                {item.submenu.map((sub, subIdx) => {
                  // LINK
                  if (sub.type === "link") {
                    return (
                      <li key={subIdx} className="py-1 w-full">
                        <div className="flex items-center justify-start">
                          <span className="mr-3">{item.icon}</span>

                          <Link
                            href={sub.path}
                            className="cursor-pointer py-1 text-[#183431] dark:text-white dark:hover:text-[#A9D18E] hover:underline"
                          >
                            {sub.title}
                          </Link>

                          {/* SUB-SUB MENU BUTTON */}
                          {sub.submenu && (
                            <span className="text-xs mr-5 cursor-pointer">
                              {activeSubSubIndex === subIdx ? (
                                <FaChevronDown
                                  onClick={() => setActiveSubSubIndex(null)}
                                />
                              ) : (
                                <FaChevronRight
                                  onClick={() => setActiveSubSubIndex(subIdx)}
                                />
                              )}
                            </span>
                          )}
                        </div>

                        {/* SUB-SUB MENU */}
                        {sub.submenu && activeSubSubIndex === subIdx && (
                          <ul className="list-none pl-5 mt-1">
                            {sub.submenu.map((subSub, subSubIdx) => (
                              <li
                                key={subSubIdx}
                                className="cursor-pointer py-1 text-[#183431] dark:text-white hover:underline"
                                onClick={() => router.push(subSub.path)}
                              >
                                {subSub.title}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  }

                  // TEXT SECTION ITEM
                  if (sub.type === "text") {
                    return (
                      <li
                        key={subIdx}
                        onClick={() => setActiveSubIndex(subIdx)}
                        className="mb-2 text-[#183431] dark:text-white font-medium text-[16px] cursor-pointer"
                      >
                        <span className="mr-3">{item.icon}</span>
                        <a
                          href={sub.path}
                          className={`no-underline hover:text-[#A9D18E] dark:hover:text-[#A9D18E] hover:underline ${
                            subIdx === activeSubIndex
                              ? "text-[#fe3610] dark:text-white"
                              : ""
                          }`}
                        >
                          {sub.title}
                        </a>
                      </li>
                    );
                  }

                  // STATUS GROUP
                  if (sub.type === "status-group") {
                    return (
                      <li key={subIdx}>
                        <ul className="list-none mt-0 p-0">
                          {sub.statuses.map((status, sIdx) => (
                            <li
                              key={sIdx}
                              className={`mb-4 px-3 py-1 rounded w-fit inline-block text-sm cursor-pointer ${
                                status.color === "orange"
                                  ? "bg-[#fe5000] text-[#333]"
                                  : status.color === "teal"
                                  ? "bg-teal-500 text-white"
                                  : status.color === "pink"
                                  ? "bg-[#f9c2d1] text-[#900]"
                                  : status.color === "yellow"
                                  ? "bg-[#fef102] text-black"
                                  : ""
                              }`}
                              onClick={() => router.push(status.path)}
                            >
                              {status.title}
                              <span className="font-bold ml-1">(0)</span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
