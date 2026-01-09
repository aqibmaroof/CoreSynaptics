"use client";
import { FaEllipsisV, FaStar, FaEdit, FaCommentDots } from "react-icons/fa";
import { useState } from "react";
import CardWrapper from "@/components/CardWrapper";

export default function ProjectManagers() {
  const [openDropdown, setOpenDropdown] = useState(null);

  const managers = [
    {
      id: 1,
      name: "Chris Friedely",
      role: "Responsible Villeneuve",
      avatar: "https://i.pravatar.cc/150?img=1",
      bgColor: "bg-purple-500/20",
    },
    {
      id: 2,
      name: "Maggie Johnson",
      role: "South Dakota St.",
      avatar: "https://i.pravatar.cc/150?img=5",
      bgColor: "bg-emerald-500/20",
      isActive: true,
    },
    {
      id: 3,
      name: "Gael Harry",
      role: "New york Fleurs Fruits",
      avatar: "https://i.pravatar.cc/150?img=3",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 4,
      name: "James Sullivan",
      role: "Warren L.",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
  ];

  return (
    <CardWrapper className="font-gilroy flex-col max-w-lg">
      {" "}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-white text-xl font-semibold">Projects Managers</h2>
        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="text-white text-sm cursor-pointer hover:text-gray-300"
          >
            Sort by <span className="font-semibold">Newest</span> ▼
          </label>
        </div>
      </div>
      {/* Managers List */}
      <div className="space-y-3 mb-4">
        {managers.map((manager) => (
          <div
            key={manager.id}
            className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
              manager.isActive
                ? "bg-emerald-600/30 border border-emerald-500/50"
                : "bg-transparent hover:bg-white/5"
            }`}
          >
            {/* Left Side - Avatar and Info */}
            <div className="flex items-center gap-3">
              <div className={`avatar ${manager.isActive ? "online" : ""}`}>
                <div className="w-10 h-10 rounded-full">
                  <img src={manager.avatar} alt={manager.name} />
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  {manager.name}
                </h3>
                <p className="text-gray-400 text-xs">{manager.role}</p>
              </div>
            </div>

            {/* Right Side - Action Icons */}
            {manager.isActive && (
              <div className="flex items-center gap-3">
                <button className="text-white/70 hover:text-white transition-colors">
                  <FaCommentDots size={16} />
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <FaStar size={16} />
                </button>
                <button className="text-white/70 hover:text-white transition-colors">
                  <FaEdit size={16} />
                </button>
                <div className="dropdown dropdown-end">
                  <label
                    tabIndex={0}
                    className="btn btn-ghost btn-xs text-white/70 hover:text-white"
                  >
                    <FaEllipsisV size={14} />
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1a1d3f] rounded-box w-52 mt-2"
                  >
                    <li>
                      <a className="text-white hover:bg-white/10">
                        View Profile
                      </a>
                    </li>
                    <li>
                      <a className="text-white hover:bg-white/10">
                        Send Message
                      </a>
                    </li>
                    <li>
                      <a className="text-red-400 hover:bg-white/10">Remove</a>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* All PMs Link */}
      <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors flex items-center gap-1">
        All PMs →
      </button>
    </CardWrapper>
  );
}
