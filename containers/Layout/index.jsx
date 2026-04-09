// components/Layout.js
"use client";
import Sidebar from "../../components/sidebar";
import { FaBell, FaArrowLeft } from "react-icons/fa";
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

const Layout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [search, setSearch] = useState("");
  const user = JSON.parse(getUser());

  const handleChange = (e) => {
    const { value } = e.target;
    setSearch(value);
  };

  // Wait for client to mount to avoid SSR mismatch
  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/Auth/Login");
    }
  }, []);

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

  return (
    <div className="rf-container bg-[url('/images/background.png')] bg-cover bg-center bg-no-repeat flex flex-col min-h-screen" style={{ background: 'var(--rf-bg)' }}>
      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-74 overflow-y-auto h-screen scrollbar-hide" style={{ background: 'var(--rf-bg2)', borderRight: '1px solid var(--rf-border)' }}>
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 pb-8 overflow-y-auto h-screen scrollbar-hide" style={{ background: 'var(--rf-bg)' }}>
          <div className="sticky top-0 z-20 backdrop-blur px-5 pt-3">
            <div className="sticky top-0 z-20 backdrop-blur flex items-center justify-between gap-2 w-full py-2 px-4 rounded-xl" style={{ background: 'rgba(10, 14, 20, 0.97)', border: '1px solid var(--rf-border)', color: 'var(--rf-txt)' }}>
              <div className="bg-[transparent] px-2">
                <div className="flex items-center gap-5 cursor-pointer">
                  {(pathname === `/Profile/Managers/${params?.id}` ||
                    pathname === "/CreateProject" ||
                    pathname === "/ProjectDetails") && (
                    <FaArrowLeft
                      onClick={() => router.back()}
                      className="text-2xl"
                      style={{ color: 'var(--rf-txt)' }}
                    />
                  )}
                  <p className="text-2xl font-semibold" style={{ color: 'var(--rf-txt)' }}>
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
                  <FiSearch className="absolute text-xl top-4 left-3" style={{ color: 'var(--rf-txt2)' }} />
                  <input
                    type="text"
                    name="search"
                    value={search}
                    onChange={handleChange}
                    placeholder="Type to search..."
                    className="rf-form-input w-[489px] pl-9 pr-4 h-13 backdrop-blur-[42px]"
                    style={{ background: 'rgba(21, 29, 46, 0.6)', borderColor: 'var(--rf-border2)' }}
                  />
                </div>
                <span className="w-[6px] rounded-xl mx-5 h-[30px]" style={{ background: 'var(--rf-accent)' }} />
                <FaBell className="cursor-pointer text-3xl" style={{ color: 'var(--rf-txt)' }} />
                {/* <button onClick={toggleTheme} className="text-2xl">
                  {resolvedTheme === "dark" ? <FaSun /> : <FaMoon />}
                </button> */}
                <span className="w-[6px] rounded-xl mx-5 h-[30px]" style={{ background: 'var(--rf-accent)' }} />

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
                        <span className="absolute bottom-[2px] right-[2px] block h-2 w-2 rounded-full ring-2 ring-white bg-green-500"></span>
                      </div>
                    </div>
                  </label>
                  <ul
                    tabIndex={0}
                    className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content rounded-box w-60"
                    style={{ background: 'var(--rf-bg2)', border: '1px solid var(--rf-border2)' }}
                  >
                    {/* User Info Header */}
                    <li className="flex flex-row items-center justify-start">
                      <div className="w-[max-content] avatar online">
                        <div className="relative inline-block ">
                          <div className="w-13 h-13 rounded-full overflow-hidden">
                            <img
                              src={
                                config?.user_icon ||
                                "https://placehold.co/100x100"
                              }
                            />
                          </div>
                          {/* The Green Dot */}
                          <span className="absolute bottom-[2px] right-[2px] block h-2 w-2 rounded-full ring-2 ring-white bg-green-500"></span>
                        </div>
                      </div>
                      <div className="w-[max-content] flex flex-col justify-center items-start">
                        <span className="text-left font-semibold text-[13px]" style={{ color: 'var(--rf-txt)' }}>
                          {user?.firstName?.replace(/_/g, " ")} {user?.lastName?.replace(/_/g, " ")}
                        </span>
                        <span className="text-left text-[12px] capitalize" style={{ color: 'var(--rf-txt2)' }}>
                          {user?.organizationName?.replace(/_/g, " ") || ""}
                        </span>
                        <span className="text-left text-[11px] capitalize" style={{ color: 'var(--rf-txt3)' }}>
                          {user?.platformRole?.replace(/_/g, " ") || user?.activeRole?.name?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </li>

                    <div className="rf-divider my-0"></div>

                    <li>
                      <a
                        href="/UserProfile"
                        className={`text-[16px] gap-3 mt-2 ${
                          pathname === "/UserProfile" ? "bg-[rgba(0,200,255,0.1)]" : ""
                        }`}
                        style={{ color: 'var(--rf-txt)' }}
                      >
                        <FiUser className="text-lg" /> My Profile
                      </a>
                    </li>
                    <li>
                      <a
                        href="/Settings"
                        className={`text-[16px] mb-3 gap-3 ${
                          pathname === "/Settings" ? "bg-[rgba(0,200,255,0.1)]" : ""
                        }`}
                        style={{ color: 'var(--rf-txt)' }}
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

                    <div className="rf-divider my-0"></div>

                    <li onClick={() => handleLogout()}>
                      <a className="text-[16px] gap-3" style={{ color: 'var(--rf-red)' }}>
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
