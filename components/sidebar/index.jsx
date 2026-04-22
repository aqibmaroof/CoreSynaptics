"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMenuByRole } from "./sideBarData";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import config from "../../config";
import {
  getAccessToken,
  getUser,
  setUser,
} from "@/services/instance/tokenService";
import { getRoles } from "@/services/Roles";
import { GetUser } from "@/services/auth";

const formatRole = (role) => {
  if (!role) return "User";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    const user = JSON.parse(getUser());
    const accessToken = getAccessToken();
    setCurrentUser(user);

    const items = getMenuByRole(user?.activeRole?.name || user?.platformRole);
    setVisibleItems(items);
    setMounted(true);

    getRolesList();
    if (accessToken) getUserFromApi();
  }, []);

  // Auto-open the parent whose submenu contains the current pathname
  useEffect(() => {
    if (!visibleItems.length) return;
    const activeParent = visibleItems.findIndex((item) =>
      (item.submenu || []).some((sub) => sub.path === pathname)
    );
    if (activeParent !== -1) setOpenIndex(activeParent);
  }, [pathname, visibleItems]);

  const getUserFromApi = async () => {
    const userResponse = await GetUser();
    setUser({ user: userResponse });
    setCurrentUser(userResponse);
    const items = getMenuByRole(
      userResponse?.activeRole?.name || userResponse?.platformRole
    );
    setVisibleItems(items);
  };

  const getRolesList = async () => {
    try {
      const res = await getRoles();
      localStorage.setItem("roles", JSON.stringify(res));
    } catch (error) {
      console.log("Error Fetching Roles:", error);
    }
  };

  const toggleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const isParentActive = (item) =>
    item.submenu?.length > 0
      ? item.submenu.some((sub) => sub.path === pathname)
      : item.path === pathname;

  if (!mounted) return null;

  const isDark = theme === "dark";
  const roleLabel =
    currentUser?.activeRole?.name ||
    currentUser?.platformRole ||
    currentUser?.role ||
    "";

  return (
    <aside className="w-[280px] m-3 py-2 transition-colors bg-transparent rounded-2xl duration-300 overflow-y-auto h-screen scrollbar-hide">
      {/* ── Logo + Role badge ─────────────────────────────────── */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <img
            src={isDark ? config?.brand : config?.darkBrand}
            className="w-48 h-auto"
            alt="brand"
          />
        </div>

        {currentUser && (
          <div
            className={`flex gap-2.5 px-3 py-2.5 rounded-xl ${
              isDark
                ? "bg-slate-800/60 border border-slate-700/60"
                : "bg-slate-100 border border-slate-200"
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img
                  src={config?.user_icon || "https://placehold.co/100x100"}
                  className="w-full h-full object-cover"
                  alt="user"
                />
              </div>
              <span className="absolute bottom-5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs font-semibold truncate leading-tight ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p
                className={`text-[10px] mb-1 truncate leading-tight ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {currentUser?.organizationName || ""}
              </p>
              {roleLabel && (
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide shrink-0 ${
                    isDark
                      ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                      : "bg-sky-100 text-sky-700 border border-sky-200"
                  }`}
                >
                  {formatRole(roleLabel)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <img src={config?.h_line} className="px-4 mt-2 mb-4" alt="" />

      {/* ── Navigation ────────────────────────────────────────── */}
      <ul className="list-none m-0 p-0 mb-15">
        {visibleItems.map((item, index) => {
          const parentActive = isParentActive(item);
          const isOpen = openIndex === index;

          return (
            <li key={index}>
              {/* Parent row */}
              <div
                className={`flex items-center py-3 w-[250px] mx-4 rounded-xl h-auto px-4 cursor-pointer transition-all duration-150 ${
                  parentActive
                    ? isDark
                      ? "bg-slate-700/70 border border-slate-600/60"
                      : "bg-slate-200/80 border border-slate-300"
                    : isDark
                      ? "hover:bg-slate-700/40 border border-transparent"
                      : "hover:bg-slate-200/60 border border-transparent"
                }`}
                onClick={() => {
                  if (item.submenu?.length > 0) {
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
                  src={parentActive ? item?.iconActive : item.icon}
                  className={`mr-3 p-1.5 rounded-lg w-8 h-8 object-contain ${
                    parentActive
                      ? "bg-[#0075FF]"
                      : isDark
                        ? "bg-slate-800"
                        : "bg-slate-200"
                  }`}
                  alt=""
                />
                <span
                  className={`flex-1 text-[13px] font-medium ${
                    parentActive
                      ? isDark
                        ? "text-white"
                        : "text-slate-900"
                      : isDark
                        ? "text-slate-300"
                        : "text-slate-700"
                  }`}
                >
                  {item.title}
                </span>
                {item.submenu?.length > 0 && (
                  <span
                    className={`text-[10px] ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {isOpen ? <FaChevronDown /> : <FaChevronRight />}
                  </span>
                )}
              </div>

              {/* Submenu */}
              {item.submenu?.length > 0 && isOpen && (
                <ul className="list-none mt-1 pl-6 pr-4">
                  {item.submenu.map((sub, subIdx) => {
                    const subActive = sub.path === pathname;
                    return (
                      <li key={subIdx}>
                        <Link
                          href={sub.path}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] transition-colors no-underline ${
                            subActive
                              ? isDark
                                ? "bg-slate-700/60 text-white font-semibold"
                                : "bg-slate-200 text-slate-900 font-semibold"
                              : isDark
                                ? "text-slate-400 hover:text-white hover:bg-slate-700/30"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          {subActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0075FF] shrink-0" />
                          )}
                          {sub.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      {/* ── Need Help Card ────────────────────────────────────── */}
      {isDark ? (
        <div className="text-white bg-[url('/images/needHelp.png')] bg-cover bg-center w-[220px] rounded-xl mx-auto mb-15 px-4 py-4">
          <img src={config?.questionMark} alt="" />
          <p className="mt-5 font-bold text-[14px]">Need help?</p>
          <p className="mb-3 text-[12px] text-slate-300">Please check our docs</p>
          <a
            href="#"
            target="_blank"
            className="bg-gradient-to-r from-[#0A0E23B5] to-[#060B28BD] w-full p-3 rounded-xl flex items-center justify-center text-xs font-bold tracking-widest hover:opacity-80 transition-opacity"
          >
            DOCUMENTATION
          </a>
        </div>
      ) : (
        <div className="w-[220px] rounded-xl mx-auto mb-15 px-4 py-4 bg-slate-100 border border-slate-200">
          <img src={config?.questionMark} alt="" />
          <p className="mt-5 font-bold text-[14px] text-slate-800">Need help?</p>
          <p className="mb-3 text-[12px] text-slate-500">Please check our docs</p>
          <a
            href="#"
            target="_blank"
            className="bg-slate-800 text-white w-full p-3 rounded-xl flex items-center justify-center text-xs font-bold tracking-widest hover:opacity-80 transition-opacity no-underline"
          >
            DOCUMENTATION
          </a>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
