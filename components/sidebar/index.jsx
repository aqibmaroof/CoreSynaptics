"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  sidebarItems,
  getRoleMeta,
  getLensNavItems,
  LENSES,
} from "./sideBarData";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";
import config from "../../config";
import {
  getAccessToken,
  getUser,
  setUser,
  setOrganization,
  getOrganization,
} from "@/services/instance/tokenService";
import { getRoles } from "@/services/Roles";
import { GetUser, GetOrganization } from "@/services/auth";

const formatRole = (role) => {
  if (!role) return "User";
  return role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// Each element of accessibleModules may be a plain string key or an object { key, ... }.
const extractModules = (user) => {
  const raw = user?.accessibleModules;
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw.map((m) => (typeof m === "string" ? m : m?.key)).filter(Boolean);
};

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [currentUser, setCurrentUser] = useState(null);
  const [roleMeta, setRoleMeta] = useState(null);
  const [orgData, setOrgData] = useState(null);
  const user = JSON.parse(getUser());

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    const accessToken = getAccessToken();
    setCurrentUser(user);

    const roleId = user?.activeRole?.name || user?.platformRole;
    setVisibleItems(sidebarItems);
    setRoleMeta(getRoleMeta(roleId));
    setMounted(true);

    // Hydrate org from cache immediately

    getRolesList();
    getUserFromApi();
  }, []);

  // Auto-open the parent whose submenu contains the current pathname
  useEffect(() => {
    if (!visibleItems.length) return;
    const activeParent = visibleItems.findIndex((item) =>
      (item.submenu || []).some((sub) => sub.path === pathname),
    );
    if (activeParent !== -1) setOpenIndex(activeParent);
  }, [pathname, visibleItems]);

  const getUserFromApi = async () => {
    const [userResponse, orgResponse] = await Promise.all([
      GetUser(),
      GetOrganization().catch(() => null),
    ]);
    if (orgResponse && userResponse) {
      setUser({ user: userResponse });
      setCurrentUser(userResponse);
      const roleId =
        userResponse?.activeRole?.name || userResponse?.platformRole;
      setVisibleItems(sidebarItems);
      setRoleMeta(getRoleMeta(roleId));

      setOrganization({ organization: orgResponse });
      setOrgData(orgResponse);
      console.log("updated")
    }
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
        <a href="/" className="flex items-center gap-5 mb-4">
          <img
            src={
              orgData?.branding?.logoUrl
                ? orgData?.branding?.logoUrl
                : isDark
                  ? config?.brand
                  : config?.darkBrand
            }
            className={`${orgData?.branding?.logoUrl ? "w-14 h-14 object-center rounded-full" : "w-48 h-auto rounded-none"}`}
            alt="brand"
          />
          <p
            className={`${isDark ? "text-slate-200" : "text-slate-800"} font-bold`}
          >
            {orgData?.branding?.logoUrl
              ? user?.firstName + "" + user?.lastName
              : null}
          </p>
        </a>

        {currentUser && (
          <div
            className={`px-3 py-2.5 rounded-xl ${
              isDark
                ? "bg-slate-800/60 border border-slate-700/60"
                : "bg-slate-100 border border-slate-200"
            }`}
          >
            {/* User identity row */}
            <div className="flex gap-2.5 mb-2">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  {orgData?.branding?.logoUrl ? (
                    <img
                      src={orgData.branding.logoUrl}
                      className="w-full h-full object-cover"
                      alt={orgData.name}
                    />
                  ) : (
                    <img
                      src={config?.user_icon || "https://placehold.co/100x100"}
                      className="w-full h-full object-cover"
                      alt="user"
                    />
                  )}
                </div>
                <span className="absolute bottom-5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold truncate leading-tight ${isDark ? "text-slate-100" : "text-slate-800"}`}
                >
                  {currentUser?.firstName}
                  {currentUser?.lastName}
                </p>
                <p
                  className={`text-[10px] truncate leading-tight ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {orgData?.name || currentUser?.organizationName || ""}
                </p>
              </div>
            </div>

            {/* Role card — shows library meta when available */}
            {roleMeta ? (
              <div
                className={`rounded-lg px-2.5 py-2 mt-1 ${isDark ? "bg-slate-700/50" : "bg-white/60 border border-slate-200"}`}
              >
                <p
                  className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  YOUR ROLE
                </p>
                <p
                  className={`text-[10px] font-mono truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {roleMeta.id}
                </p>
                <p
                  className={`text-xs font-semibold truncate leading-tight ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {roleMeta.name}
                </p>
                <p
                  className={`text-[10px] truncate mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  {currentUser?.organizationName || roleMeta.companyType} ·{" "}
                  {roleMeta.tier}
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${isDark ? "bg-slate-600 text-slate-300" : "bg-slate-200 text-slate-600"}`}
                  >
                    LENS · {roleMeta.lens}
                  </span>
                  {LENSES[roleMeta.lens] && (
                    <span
                      className={`text-[9px] truncate ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {LENSES[roleMeta.lens].name}
                    </span>
                  )}
                </div>
              </div>
            ) : roleLabel ? (
              <span
                className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide inline-block mt-1 ${isDark ? "bg-cyan-950 text-cyan-400 border border-cyan-800" : "bg-sky-100 text-sky-700 border border-sky-200"}`}
              >
                {formatRole(roleLabel)}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Divider */}
      <img src={config?.h_line} className="px-4 mt-2 mb-4" alt="" />

      {/* ── Navigation ────────────────────────────────────────── */}
      <ul className="list-none m-0 p-0 mb-2">
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

      {/* ── Lens Quick-Nav ───────────────────────────────────── */}
      {roleMeta &&
        (() => {
          const lens = LENSES[roleMeta.lens];
          const lensItems = getLensNavItems(roleMeta.lens);
          if (!lens || !lensItems.length) return null;
          return (
            <div className="ml-2 mb-5">
              <div className="px-7 pt-3 pb-1">
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-500" : "text-slate-400"}`}
                >
                  {lens.name}
                </p>
              </div>
              <ul className="list-none m-0 p-0">
                {lensItems.map((item, i) => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={i}>
                      <Link
                        href={item.path}
                        className={`flex items-center gap-2 px-7 py-1.5 text-[13px] transition-colors no-underline ${
                          isActive
                            ? isDark
                              ? "text-white font-semibold"
                              : "text-slate-900 font-semibold"
                            : isDark
                              ? "text-slate-400 hover:text-white hover:bg-slate-700/30"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        }`}
                      >
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0075FF] shrink-0" />
                        )}
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })()}

      {/* ── Need Help Card ────────────────────────────────────── */}
      {isDark ? (
        <div className="text-white bg-[url('/images/needHelp.png')] bg-cover bg-center w-[220px] rounded-xl mx-auto mb-15 px-4 py-4">
          <img src={config?.questionMark} alt="" />
          <p className="mt-5 font-bold text-[14px]">Need help?</p>
          <p className="mb-3 text-[12px] text-slate-300">
            Please check our docs
          </p>
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
          <p className="mt-5 font-bold text-[14px] text-slate-800">
            Need help?
          </p>
          <p className="mb-3 text-[12px] text-slate-500">
            Please check our docs
          </p>
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