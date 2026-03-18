"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { DeleteUsers, getUsers, UpdateUserStatus } from "@/services/Users";
import StatusDropdown from "../../../components/StatusDropDown";
import PermisionsDropdown from "../../../components/PersmissionsDropdown";

export default function PricingPlans() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    GetAllUsers();
    setRoles(JSON.parse(localStorage.getItem("roles")));
  }, []);

  const GetAllUsers = async () => {
    try {
      const res = await getUsers();
      console.log(res);
      setUsers(res);
    } catch (error) {
      console.error("error Fetching data", error.message);
    }
  };

  const removeUser = async (id) => {
    try {
      await DeleteUsers(id);
      GetAllUsers();
      setMessage({
        type: "success",
        text: "User Deleted Successfully ! 🚀",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: "Error Deleting user : " + error?.message,
      });
    }
  };

  const UpdateStatus = async (id, roleId) => {
    const payload = {
      roleId: roleId,
    };

    try {
      await UpdateUserStatus(id, payload);

      setMessage({
        type: "success",
        text: "status updated successfully!",
      });

      GetAllUsers();
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to update  status.",
      });
    } finally {
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <div className="text-white flex flex-col justify-center py-5 px-7">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Users Lists
        </h1>
      </div>
      <div className="flex w-full bg-gradient-to-r font-gilroy from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-6 rounded-3xl card">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {message.text && (
            <div
              className={`tooltip text-white tooltip-bottom ${
                message.type === "success" ? "tooltip-accent" : "tooltip-error"
              }`}
              data-tip={message.text}
            >
              <button
                className={`btn font-thin text-white ${
                  message.type === "success" ? "btn-accent" : "btn-error"
                }`}
              >
                {message.text.slice(0, 160)}
              </button>
            </div>
          )}
          <div className="flex items-center justify-end ml-auto gap-2">
            <span className="text-gray-400 text-sm">Sort by</span>
            <button className="text-white font-semibold text-sm flex items-center gap-1 hover:text-gray-300 transition-colors">
              Newest
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1 relative">
            <svg
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search Plan"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0a1128] text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

          <button className="bg-[#0a1128] text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </button>

          <button
            onClick={() => router.push("/Users/Add")}
            className="bg-[#facc15] text-[#0a1128] cursor-pointer p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#080C26] rounded-2xl">
              <tr className="rounded-2xl">
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  #
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  User Name
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Email
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Role
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Permissions
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Status
                </th>

                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users?.length === 0 ? (
                <tr>
                  <td
                    colSpan="100%"
                    className="text-center p-13 border-l-1 border-r-1 border-b-1 border-gray-600"
                  >
                    NO USERS FOUND
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="text-center hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="avatar">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                            {user.firstName.slice(0, 1)}
                            {user.lastName.slice(0, 1)}
                          </div>
                        </div>
                        <span className="text-white font-medium ">
                          {user.firstName} {user?.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-white font-medium ">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusDropdown
                        re={user}
                        onStatusUpdate={(id, status) => {
                          UpdateStatus(id, status);
                        }}
                        STATUS_OPTIONS={roles}
                      />
                    </td>
                    <td>
                      <StatusDropdown
                        re={user}
                        onStatusUpdate={(id, status) => {
                          UpdateStatus(id, status);
                        }}
                        STATUS_OPTIONS={roles}
                      />
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-white font-medium ">
                          {user.status}
                        </span>
                      </div>
                    </td>

                    <td className="flex items-center justify-center py-4 px-4 gap-4">
                      <button className="text-info text-xl mt-10 mb-10 cursor-pointer">
                        <a href={`/Users/Add?id=${user?.id}`}>
                          <FaEdit />
                        </a>
                      </button>
                      <button
                        className="text-error text-xl cursor-pointer"
                        onClick={() => removeUser(user.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
