// components/Layout.js
"use client";
import Sidebar from "../../components/sidebar";
import { FaBell, FaSun, FaMoon, FaArrowLeft } from "react-icons/fa";
import { FiPower, FiSearch, FiSettings, FiUser } from "react-icons/fi";
import config from "../../config";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  clearTokens,
  getAccessToken,
} from "../../services/instance/tokenService";
import { useParams, usePathname, useRouter } from "next/navigation";
import { getUser } from "../../services/instance/tokenService";
import { Logout } from "@/services/auth";

const Layout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [search, setSearch] = useState("");
  const user = JSON.parse(getUser());
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // <-- track client mount

  const handleChange = (e) => {
    const { value } = e.target;
    setSearch(value);
  };

  // Wait for client to mount to avoid SSR mismatch
  useEffect(() => {
    setMounted(true);
    if (!getAccessToken()) {
      router.replace("/Auth/Login");
    }
  }, []);

  const toggleTheme = () => {
    // toggle between light and dark using next-themes
    if (!mounted) return;
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };
  const handleLogout = async () => {
    try {
      const response = await Logout();
      console.log(response);
      clearTokens();
      router.push("/Auth/Login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Do not render theme-dependent UI until mounted
  if (!mounted) return null;

  return (
    <div className="bg-[url('/images/background.png')] bg-cover bg-center bg-no-repeat flex flex-col min-h-screen">
      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-74 overflow-y-auto h-screen scrollbar-hide">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1  pb-8 overflow-y-auto h-screen scrollbar-hide">
          <div className="sticky top-0 z-20 backdrop-blur px-5 pt-3">
            <div className="sticky top-0 z-20 backdrop-blur flex items-center justify-between bg-[#060B26F0]/60 gap-2 w-full py-2 px-4 rounded-xl">
              <div className="bg-[transparent] px-2">
                <div className="flex items-center gap-5 cursor-pointer">
                  {(pathname === `/Profile/Managers/${params?.id}` ||
                    pathname === "/CreateProject" ||
                    pathname === "/ProjectDetails") && (
                    <FaArrowLeft
                      onClick={() => router.back()}
                      className="text-2xl"
                    />
                  )}
                  <p className="text-2xl font-semibold text-white">
                    {pathname === `/Managers/List`
                      ? "Project Managers"
                      : pathname === `/Profile/Managers/${params?.id}`
                        ? "Project Manager Profile"
                        : pathname === "/Warehouse/List"
                          ? "Warehouse"
                          : pathname === "/Sales/List"
                            ? "Sales"
                            : pathname === "/QA/QC"
                              ? "QA/QC"
                              : pathname === "/FSEs"
                                ? "FSEs"
                                : pathname === "/Safety"
                                  ? "Safety"
                                  : pathname === "/Settings"
                                    ? "Settings"
                                    : pathname === "/UserProfile"
                                      ? "My Profile"
                                      : pathname === "/CreateProject"
                                        ? "Create Project"
                                        : pathname === "/ProjectDetails"
                                          ? "Project Details"
                                          : pathname === "/Shipment/Dashboard"
                                            ? "Shipment"
                                            : "Dashboard"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto mr-3">
                <div className="relative">
                  <FiSearch className="absolute text-xl text-white bg-transparent top-4 left-3" />
                  <input
                    type="text"
                    name="search"
                    value={search}
                    onChange={handleChange}
                    placeholder="Type to search..."
                    className="input w-[489px] bg-transparent backdrop-blur-[42px] border-3 border-[white]/[0.03] border-t-white/[0.09] rounded-2xl pl-9 pr-4 text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-white/[0.03] focus:border-t-white/[0.09] h-13"
                  />
                </div>
                <span className="w-[6px] rounded-xl mx-5 h-[30px] bg-[#62D1FE]" />
                <FaBell className="cursor-pointer text-white text-3xl" />
                {/* <button onClick={toggleTheme} className="text-2xl">
                  {resolvedTheme === "dark" ? <FaSun /> : <FaMoon />}
                </button> */}
                <span className="w-[6px] rounded-xl mx-5 h-[30px] bg-[#62D1FE]" />

                {/* --- User Dropdown Start --- */}
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost hover:shadow-none focus:shadow-none active:shadow-none hover:bg-[transparent] focus:bg-[transparent] active:bg-[transparent] hover:border-[transparent] focus:border-[transparent] active:border-[transparent] btn-circle avatar online w-15 h-15"
                  >
                    <div className="avatar online">
                      <div className="relative inline-block ">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={
                              config?.user_icon ||
                              "https://placehold.co/100x100"
                            }
                          />
                        </div>
                        {/* The Green Dot */}
                        <span className="absolute bottom-[2px] right-[2px] block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
                      </div>
                    </div>
                  </label>
                  <ul
                    tabIndex={0}
                    className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-gradient-to-r from-[#093E7D] to-[#0075FF] border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-box w-60 border border-white/10"
                  >
                    {/* User Info Header */}
                    <li className=" flex flex-row items-center justify-start">
                      <div className="avatar online">
                        <div className="relative inline-block ">
                          <div className="w-15 h-15 rounded-full overflow-hidden">
                            <img
                              src={
                                config?.user_icon ||
                                "https://placehold.co/100x100"
                              }
                            />
                          </div>
                          {/* The Green Dot */}
                          <span className="absolute bottom-[2px] right-[2px] block h-3 w-3 rounded-full ring-2 ring-white bg-green-500"></span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-start">
                        <span className="text-left font-semibold text-[16px] text-white">
                          {user?.fullName}
                        </span>
                        <span className="text-left opacity-60 text-[16px] capitalize text-white">
                          {user?.role}
                        </span>
                      </div>
                    </li>

                    <div className="divider my-0 divider-info opacity-20"></div>

                    <li>
                      <a
                        href="/UserProfile"
                        className={`text-[16px] text-white gap-3 mt-2 ${pathname === "/UserProfile" ? "bg-gray-400/20" : ""}`}
                      >
                        <FiUser className="text-lg" /> My Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/Settings"
                        className={`text-[16px] text-white mb-3 gap-3 ${pathname === "/Settings" ? "bg-gray-400/20" : ""}`}
                      >
                        <FiSettings className="text-lg" /> Settings
                      </a>
                    </li>
                    {/* <li>
                      <a className="justify-between">
                        <div className="flex items-center text-[16px] text-white gap-3">
                          <FiCreditCard className="text-lg" /> Billing Plan
                        </div>
                        <span className="badge badge-error text-white text-[15px] h-6 w-6 p-0 flex items-center justify-center">
                          4
                        </span>
                      </a>
                    </li> */}


                    {/* <li>
                      <a className="text-[16px] text-white gap-3">
                        <FiDollarSign className="text-lg" /> Pricing
                      </a>
                    </li>
                    <li>
                      <a className="text-[16px] text-white gap-3">
                        <FiHelpCircle className="text-lg" /> FAQ
                      </a>
                    </li> */}

                    <div className="divider divider-info my-0 opacity-20"></div>

                    <li onClick={() => handleLogout()}>
                      <a className="text-error text-[16px] gap-3">
                        <FiPower className="text-lg" /> Log Out
                      </a>
                    </li>
                  </ul>
                </div>
                {/* --- User Dropdown End --- */}
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
