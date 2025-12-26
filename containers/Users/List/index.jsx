"use client";

import {
  FaUsers,
  FaUserPlus,
  FaEye,
  FaTrash,
  FaEllipsisV,
} from "react-icons/fa";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-[#183431] p-6 text-[#183431] dark:text-white">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          {
            title: "Session",
            value: "21,459",
            change: "+29%",
            color: "text-[#183431]",
            darkColor: "text-white",
          },
          {
            title: "Paid Users",
            value: "4,567",
            change: "+18%",
            color: "text-[#183431]",
            darkColor: "text-white",
          },
          {
            title: "Active Users",
            value: "19,860",
            change: "-14%",
            color: "text-red-400",
            darkColor: "text-red-400",
          },
          {
            title: "Pending Users",
            value: "237",
            change: "+42%",
            color: "text-[#183431]",
            darkColor: "text-white",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="card bg-[#f6f6f6] dark:bg-[#1e4742] shadow"
          >
            <div className="card-body">
              <h3 className="text-sm text-gray-400">{item.title}</h3>
              <p className="text-2xl font-semibold">
                {item.value}{" "}
                <span
                  className={`text-sm ${item.color} dark:${item.darkColor}`}
                >
                  ({item.change})
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="card bg-[#f6f6f6] dark:bg-[#1e4742] mb-6">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Search Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="select w-full select-bordered bg-[#f6f6f6] dark:bg-[#1e4742]">
              <option>Select Role</option>
            </select>
            <select className="select w-full select-bordered bg-[#f6f6f6] dark:bg-[#1e4742]">
              <option>Select Plan</option>
            </select>
            <select className="select w-full select-bordered bg-[#f6f6f6] dark:bg-[#1e4742]">
              <option>Select Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card bg-[#f6f6f6] dark:bg-[#1e4742]">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <select className="select select-bordered w-24 bg-[#f6f6f6] dark:bg-[#1e4742]">
              <option>10</option>
              <option>20</option>
            </select>

            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search User"
                className="input input-bordered bg-[#f6f6f6] dark:bg-[#1e4742]"
              />
              <button className="btn btn-accent btn-outline">Export</button>
              <button className="btn btn-accent gap-2">
                <FaUserPlus /> Add New User
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-[#183431] dark:text-white">
                  <th>
                    <input type="checkbox" className="checkbox" />
                  </th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Billing</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover">
                    <td>
                      <input type="checkbox" className="checkbox" />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-[#183431] dark:text-white rounded-full w-8">
                            <span>SO</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold">Saunder Offner</p>
                          <p className="text-sm text-[#183431] dark:text-white">
                            soffner19@mac.com
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="flex items-center gap-2 text-md">
                      <FaUsers className="text-green-400" /> Maintainer
                    </td>
                    <td>Enterprise</td>
                    <td>Auto Debit</td>
                    <td>
                      <span
                        className={`badge ${
                          i == 1
                            ? "badge-warning"
                            : i == 2
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {i == 1 ? "Pending" : i == 2 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="flex gap-2">
                      <button className="btn btn-ghost btn-sm btn-info">
                        <FaEye />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-error">
                        <FaTrash />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-success">
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-[#183431] dark:text-white">
              Showing 1 to 10 of 50 entries
            </p>
            <div className="join bg-[#f6f6f6] dark:bg-[#1e4742] p-1 rounded-md">
              <button className="join-item btn bg-[#f6f6f6] dark:bg-[#1e4742]">«</button>
              <button className="join-item btn btn-active">1</button>
              <button className="join-item btn bg-[#f6f6f6] dark:bg-[#1e4742]">2</button>
              <button className="join-item btn bg-[#f6f6f6] dark:bg-[#1e4742]">3</button>
              <button className="join-item btn bg-[#f6f6f6] dark:bg-[#1e4742]">»</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
