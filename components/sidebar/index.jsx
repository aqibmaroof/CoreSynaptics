"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMenuByRole } from "./sideBarData";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import config from "../../config";
import { getUser } from "@/services/instance/tokenService";
import { getRoles } from "@/services/Roles";
// Replace this with however you access the current user's role:
// e.g. useSession(), useContext(AuthContext), useSelector(), etc.

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const user = JSON.parse(getUser());
  const [openIndex, setOpenIndex] = useState(null);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [activeSubSubIndex, setActiveSubSubIndex] = useState(null);
  const [roles, setRoles] = useState([]);

  // Filter sidebar items to only those allowed for this role
  const visibleItems = getMenuByRole(user?.activeRole?.name || user?.platformRole);

  useEffect(() => {
    getRolesList();
  }, []);

  const getRolesList = async () => {
    try {
      const res = await getRoles();
      localStorage.setItem("roles" , JSON.stringify(res))
    } catch (error) {
      console.log("Error Fetching Roles : ", error);
    }
  };
  const toggleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
    setActiveSubIndex(null);
    setActiveSubSubIndex(null);
  };

  return (
    <aside className="w-[280px] m-3 py-2 transition-colors bg-gradient-to-b from-[#060B26F0] to-[#1A1F3700] rounded-t rounded-t-2xl duration-300 overflow-y-auto h-screen scrollbar-hide">
      {/* LOGOS */}
      <div className="sticky z-10 px-4 py-5">
        <img src={config?.brand} className="w-55 h-auto m-auto dark:hidden" />
        <img
          src={config?.brand}
          className="w-55 h-auto m-auto hidden dark:block"
        />
      </div>

      <img src={config?.h_line} className="px-4 mt-6" />

      <ul className="list-none m-0 p-0 mt-8 mb-15">
        {visibleItems.map((item, index) => (
          <li key={index}>
            {/* CATEGORY TITLE */}
            {item.category && (
              <p className="text-[#DF5B30] px-4 mb-1">{item.category}</p>
            )}

            {/* MAIN ITEM */}
            <div
              className={`flex items-center py-5 w-[250px] mx-4 rounded-xl h-auto px-5 cursor-pointer text-[#2B3340] dark:text-white hover:text-[#101437] dark:hover:text-[#fff] hover:bg-[url('/images/hover_background.png')] ${
                pathname === item?.path
                  ? "bg-[url('/images/hover_background.png')]"
                  : ""
              } bg-cover bg-center bg-no-repeat transition`}
              onClick={() => {
                if (item.submenu.length > 0) {
                  toggleSubmenu(index);
                } else if (
                  item.title === "View Website" ||
                  item.title === "Support"
                ) {
                  window.open(item.path, "_blank");
                } else {
                  router.push(item.path);
                }
              }}
            >
              <img
                src={pathname === item?.path ? item?.iconActive : item.icon}
                className={`mr-3 ${
                  pathname === item?.path ? "bg-[#0075FF]" : "bg-[#1A1F37]"
                } p-2 rounded-xl`}
              />
              <span className="flex-1 text-[14px]">{item.title}</span>

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
                          

                          <Link
                            href={sub.path}
                            className="cursor-pointer py-1 text-[#101437] dark:text-white dark:hover:text-[#A9D18E] hover:underline"
                          >
                            {sub.title}
                          </Link>

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
                                className="cursor-pointer py-1 text-[#101437] dark:text-white hover:underline"
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
                        className="mb-2 text-[#101437] dark:text-white font-medium text-[16px] cursor-pointer"
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

      {/* NEED HELP CARD */}
      <div className="bg-[url('/images/needHelp.png')] bg-cover bg-center bg-no-repeat w-[220px] rounded-xl h-auto mx-auto mb-15 px-4 py-4">
        <img src={config?.questionMark} />
        <p className="mt-5 font-bold text-[14px]">Need help?</p>
        <p className="mb-3 text-[12px]">Please check our docs</p>
        <a
          href="https://wildtag-s3-bucket.s3.eu-north-1.amazonaws.com/listing_temp/cmkx1vzt6000bty9h2n9r9tkw/1769546156716-ak18ne-Screenshot_1767712780406.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASWMZRHANP4L6HG73%2F20260127%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20260127T203556Z&X-Amz-Expires=86400&X-Amz-Signature=c75c001f0930eed3accf779efbbf6688a642aff55938302d29f4dd9f58b8c102&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
          target="_blank"
          className="bg-linear-to-r cursor-pointer from-[#0A0E23B5] to-[#060B28BD] w-full p-3 rounded-xl flex items-center justify-center m-auto"
        >
          DOCUMENTATION
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
