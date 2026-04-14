// containers/Layout/index.jsx
"use client";
import Sidebar from "../../components/sidebar";
import { FaBell, FaMoon, FaSun } from "react-icons/fa";
import { FiPower, FiSearch, FiSettings, FiUser } from "react-icons/fi";
import config from "../../config";
import { useEffect, useState } from "react";
import {
  clearTokens,
  getAccessToken,
} from "../../services/instance/tokenService";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getUser } from "../../services/instance/tokenService";
import { Logout } from "@/services/auth";

// Map pathnames to page titles
const PAGE_TITLES = {
  "/": "Dashboard",
  "/Managers/List": "Project Managers",
  "/Warehouse/List": "Warehouse",
  "/Sales/List": "Sales",
  "/QA/QC": "QA / QC",
  "/FSEs": "FSEs",
  "/Safety": "Safety",
  "/Settings": "Settings",
  "/UserProfile": "My Profile",
  "/CreateProject": "Create Project",
  "/ProjectDetails": "Project Details",
  "/Shipment/Dashboard": "Shipment",
  "/OEM/Dashboard": "OEM Dashboard",
  "/Dispatch/Dashboard": "FSM Dashboard",
  "/Field/Dashboard": "Field Dashboard",
  "/QAQC/Dashboard": "QA/QC Dashboard",
};

// Quick-nav tabs shown on main dashboard
const DASH_TABS = [
  { label: "Issues", path: "/QA/QC" },
  { label: "Schedule", path: "/Shipment/Dashboard" },
  { label: "OEM", path: "/OEM/Dashboard" },
  { label: "Team", path: "/Managers/List" },
];

const Layout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("dark");
  const user = JSON.parse(getUser());

  const pageTitle =
    PAGE_TITLES[pathname] ??
    (pathname.startsWith("/Profile/Managers/") ? "Project Manager Profile" : "Dashboard");

  const isDashboard = pathname === "/" || pathname === "/OEM/Dashboard";

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    if (!getAccessToken()) router.replace("/Auth/Login");
  }, []);

  const handleLogout = async () => {
    try {
      await Logout();
      clearTokens();
      router.push("/Auth/Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    window.location.reload();
  };

  const isDark = theme === "dark";

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--rf-bg)" }}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className="w-74 shrink-0 overflow-y-auto h-screen scrollbar-hide"
          style={{
            background: "var(--rf-bg2)",
            borderRight: "1px solid var(--rf-border)",
          }}
        >
          <Sidebar />
        </aside>

        {/* ── Main Content ────────────────────────────────────────── */}
        <main
          className="flex-1 overflow-y-auto h-screen scrollbar-hide"
          style={{ background: "var(--rf-bg)" }}
        >
          {/* ── Top Navigation Bar ──────────────────────────────── */}
          <div className="sticky top-0 z-20 px-5 pt-3 pb-0">
            <div
              className="flex items-center justify-between gap-3 w-full py-2 px-4 rounded-xl"
              style={{
                background: "var(--rf-bg2)",
                border: "1px solid var(--rf-border)",
                color: "var(--rf-txt)",
              }}
            >
              {/* Left: Title + dashboard tabs */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Back arrow for detail pages */}
                {(pathname.startsWith("/Profile/Managers/") ||
                  pathname === "/CreateProject" ||
                  pathname === "/ProjectDetails") && (
                  <button
                    onClick={() => router.back()}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isDark
                        ? "hover:bg-slate-700 text-slate-300"
                        : "hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    ←
                  </button>
                )}

                <h1
                  className="text-xl font-bold whitespace-nowrap"
                  style={{ color: "var(--rf-txt)" }}
                >
                  {pageTitle}
                </h1>

                {/* Quick-nav tabs (shown on dashboard) */}
                {isDashboard && (
                  <nav className="hidden md:flex items-center gap-1 ml-2">
                    {DASH_TABS.map((tab) => (
                      <button
                        key={tab.label}
                        onClick={() => router.push(tab.path)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          pathname === tab.path
                            ? isDark
                              ? "bg-cyan-900/50 text-cyan-400 border border-cyan-800"
                              : "bg-sky-100 text-sky-700 border border-sky-200"
                            : isDark
                            ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/60"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/70"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                )}
              </div>

              {/* Right: Search + controls */}
              <div className="flex items-center gap-3 ml-auto">
                {/* Search */}
                <div className="relative hidden md:block">
                  <FiSearch
                    className="absolute top-1/2 -translate-y-1/2 left-3 text-base pointer-events-none"
                    style={{ color: "var(--rf-txt3)" }}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className={`text-sm pl-9 pr-4 h-9 w-56 rounded-lg outline-none transition-all focus:w-72 ${
                      isDark
                        ? "bg-slate-800 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:border-cyan-700"
                        : "bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-400"
                    }`}
                  />
                </div>

                {/* Separator */}
                <span
                  className="hidden md:block w-px h-6 rounded-full"
                  style={{ background: "var(--rf-border2)" }}
                />

                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-all text-base ${
                    isDark
                      ? "text-slate-400 hover:text-amber-400 hover:bg-slate-700/60"
                      : "text-slate-500 hover:text-amber-600 hover:bg-slate-200/70"
                  }`}
                  aria-label="Toggle theme"
                >
                  {isDark ? <FaSun /> : <FaMoon />}
                </button>

                {/* Bell */}
                <button
                  className={`relative p-2 rounded-lg transition-all text-base ${
                    isDark
                      ? "text-slate-400 hover:text-white hover:bg-slate-700/60"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <FaBell />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                </button>

                {/* Separator */}
                <span
                  className="w-px h-6 rounded-full"
                  style={{ background: "var(--rf-border2)" }}
                />

                {/* User dropdown */}
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost hover:shadow-none focus:shadow-none active:shadow-none hover:bg-transparent focus:bg-transparent active:bg-transparent hover:border-transparent focus:border-transparent active:border-transparent btn-circle avatar w-10 h-10 min-h-0 p-0"
                  >
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-transparent ring-slate-600">
                        <img
                          src={config?.user_icon || "https://placehold.co/100x100"}
                          className="w-full h-full object-cover"
                          alt="user"
                        />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                  </label>

                  <ul
                    tabIndex={0}
                    className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content rounded-xl w-60"
                    style={{
                      background: "var(--rf-bg2)",
                      border: "1px solid var(--rf-border2)",
                    }}
                  >
                    {/* User info */}
                    <li className="flex flex-row items-center gap-3 p-2 mb-1">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full overflow-hidden">
                          <img
                            src={config?.user_icon || "https://placehold.co/100x100"}
                            className="w-full h-full object-cover"
                            alt="user"
                          />
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className="font-semibold text-[13px] truncate"
                          style={{ color: "var(--rf-txt)" }}
                        >
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span
                          className="text-[11px] capitalize truncate"
                          style={{ color: "var(--rf-txt2)" }}
                        >
                          {user?.organizationName?.replace(/_/g, " ") || ""}
                        </span>
                        <span
                          className="text-[10px] capitalize truncate"
                          style={{ color: "var(--rf-txt3)" }}
                        >
                          {user?.platformRole?.replace(/_/g, " ") ||
                            user?.activeRole?.name?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </li>

                    <div className="rf-divider my-0" />

                    <li>
                      <a
                        href="/UserProfile"
                        className={`text-sm gap-3 mt-1 rounded-lg ${
                          pathname === "/UserProfile"
                            ? isDark
                              ? "bg-cyan-900/20 text-cyan-400"
                              : "bg-sky-100 text-sky-700"
                            : ""
                        }`}
                        style={{ color: "var(--rf-txt)" }}
                      >
                        <FiUser className="text-base shrink-0" /> My Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/Settings"
                        className={`text-sm gap-3 mb-1 rounded-lg ${
                          pathname === "/Settings"
                            ? isDark
                              ? "bg-cyan-900/20 text-cyan-400"
                              : "bg-sky-100 text-sky-700"
                            : ""
                        }`}
                        style={{ color: "var(--rf-txt)" }}
                      >
                        <FiSettings className="text-base shrink-0" /> Settings
                      </a>
                    </li>

                    <div className="rf-divider my-0" />

                    <li onClick={handleLogout}>
                      <a
                        className="text-sm gap-3 rounded-lg"
                        style={{ color: "var(--rf-red)" }}
                      >
                        <FiPower className="text-base shrink-0" /> Log Out
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
