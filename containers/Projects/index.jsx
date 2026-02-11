"use client";

import { FaEllipsisV, FaStar, FaEdit, FaCommentDots } from "react-icons/fa";
import CardWrapper from "@/components/CardWrapper";
import { useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";

export default function KanbanBoard() {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");


  const projects = [
    {
      id: 1,
      name: "Primor Project",
      email: "6 Tasks due soon",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      name: "Trustworth Project",
      email: "3 Tasks due soon",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: 3,
      name: "New App Launch",
      email: "1 Tasks due soon",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: 4,
      name: "Sulivan Project",
      email: "3 Tasks due soon",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: 5,
      name: "Marketing Campaign",
      email: "1 Tasks due soon",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: 6,
      name: "Website Redesign",
      email: "No tasks",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  ];
  const members = [
    {
      id: 1,
      name: "Rainer Brown",
      email: "Rainerbrown@mail.com",
      avatar: "https://i.pravatar.cc/150?img=1",
      bgColor: "bg-purple-500/20",
    },
    {
      id: 2,
      name: "Conny Rany",
      email: "connyrany@mail.com",
      avatar: "https://i.pravatar.cc/150?img=5",
      bgColor: "bg-emerald-500/20",
    },
    {
      id: 3,
      name: "Armin Falcon",
      email: "arfalcon@mail.com",
      avatar: "https://i.pravatar.cc/150?img=3",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 4,
      name: "James Sullivan",
      email: "Warren L.",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 5,
      name: "James Sullivan",
      email: "Warren L.",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 6,
      name: "James Sullivan",
      email: "Warren L.",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
  ];
  const tasks = [
    {
      id: 1,
      taskName: "Finalize Project Proposal",
      project: "Website Redesign",
      estimation: "01 Nov - 7 Nov 2026",
      priority: "Urgent",
      progress: "80%",
      assignee: [
    {
      id: 1,
      name: "Rainer Brown",
      email: "Rainerbrown@mail.com",
      avatar: "https://i.pravatar.cc/150?img=1",
      bgColor: "bg-purple-500/20",
    },
    {
      id: 2,
      name: "Conny Rany",
      email: "connyrany@mail.com",
      avatar: "https://i.pravatar.cc/150?img=5",
      bgColor: "bg-emerald-500/20",
    },
    {
      id: 3,
      name: "Armin Falcon",
      email: "arfalcon@mail.com",
      avatar: "https://i.pravatar.cc/150?img=3",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 4,
      name: "James Sullivan",
      email: "Warren L.",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 5,
      name: "James Sullivan",
      email: "Warren L.",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 6,
      name: "James Sullivan",
      email: "Warren L.",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
  ]
      
    },
  ]
  

  return (
    <div className="min-h-screen font-gilroy p-6 text-[#101437] dark:text-white">
     <h1 className="font-bold text-2xl">Task overveiw</h1>
      <div className="w-full px-3 gap-10 flex items-center justify-between font-gilroy mt-6 mb-6">
      {/* LEFT SIDE */}
      <div>
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center justify-between gap-10 w-[max-content]">
            <p className="text-7xl font-bold font-gilroy">80</p>
            <div className="flex flex-col items-start justify-end text-xl w-30">
              <p>Total <br/>Tasks</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10 w-[max-content]">
            <p className="text-6xl font-bold text-7xl">15</p>
            <div className="flex flex-col items-right justify-end text-xl w-40">
              <p>Tasks Due <br/>Today</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10 w-[max-content]">
            <p className="text-6xl font-bold text-7xl">20</p>
            <div className="flex flex-col items-start justify-end text-xl">
              <p>Overdue <br/>Tasks</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-10 w-[max-content]">
            <p className="text-6xl font-bold text-7xl">150</p>
            <div className="flex flex-col items-start justify-end text-xl">
              <p>Tasks <br/>Completed</p>
            </div>
          </div>
        </div>
      </div>
      </div> 
        {/* cards */}
        <div className="flex flex-row gap-6">
        {/* Left side card */}
        <CardWrapper className="font-gilroy flex-col max-w-lg">
          {" "}
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white text-xl font-semibold">Projects List</h2>
             </div>
             <div className="flex items-center justify-between gap-2">
              <div className="border border-[#5B5D79] rounded-2xl">
                <button className="font-semibold text-sm mx-2"> Nearest Due Date ▼ </button>
              </div>
              <button className="bg-[#66ACFF] text-white p-2 rounded-xl hover:bg-[#fbbf24] transition-all">
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
              <button className="bg-white text-[#BEBEC8] p-2 border-[#E5E5EC] rounded-xl hover:bg-[#fbbf24] transition-all">
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
              </div>
          </div>
          {/* Members List */}
          <div className="space-y-1 grid grid-cols-2 grid-rows-3 gap-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  project.isActive
                    ? "bg-emerald-600/30 border border-emerald-500/50"
                    : "bg-gradient-to-r from-[#1A1F37] via-[#214A52] to-[#1A1F37]"
                }`}
              >
                {/* Left Side - Avatar and Info */}
                <div className="flex items-center gap-3">
                  <div className={`avatar ${project.isActive ? "online" : ""}`}>
                    <div className="w-7 h-7 rounded-full">
                      <p>
                        {project.name.slice(0,1)}
                        {project.name.split(" ")[1].slice(0,1) }
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-xs">{project.email}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors p-2">
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>

                {/* Right Side - Action Icons */}
                {project.isActive && (
                  <div className="flex items-center gap-3">
                    <div className="dropdown dropdown-end">
                      <label
                        tabIndex={0}
                        className="btn btn-ghost btn-xs text-white/70 hover:text-white"
                      >
                        <FaEllipsisV size={14} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
        </CardWrapper>
        {/* Right side card */}
        <CardWrapper className="font-gilroy flex-col max-w-lg">
          {" "}
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white text-xl font-semibold">Members</h2>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button className="bg-[#66ACFF] text-white p-2 rounded-xl hover:bg-[#fbbf24] transition-all">
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
              <button className="bg-white text-[#BEBEC8] p-2 border-[#E5E5EC] rounded-xl hover:bg-[#fbbf24] transition-all">
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
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Managers List */}
          <div className="space-y-1 grid grid-cols-2 grid-rows-3 gap-3 ">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                  member.isActive
                    ? "bg-emerald-600/30 border border-emerald-500/50"
                  : "bg-gradient-to-r from-[#152E6A] to-[#1A1F37]"
                }`}
              >
                {/* Left Side - Avatar and Info */}
                <div className="flex items-center gap-3">
                  <div className={`avatar ${member.isActive ? "online" : ""}`}>
                    <div className="w-7 h-7 rounded-full">
                      <img src={member.avatar} alt={member.name} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">
                      {member.name}
                    </h3>
                    <p className="text-gray-400 text-xs">{member.email}</p>
                  </div>
                </div>
                <div>
                <button className="text-gray-400 hover:text-white transition-colors p-2">
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
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
                </div>
                {/* Right Side - Action Icons */}
                {member.isActive && (
                  <div className="flex items-center gap-3">
                    <div className="dropdown dropdown-end">
                      <label
                        tabIndex={0}
                        className="btn btn-ghost btn-xs text-white/70 hover:text-white"
                      >
                        <FaEllipsisV size={14} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
        </CardWrapper>
        </div>
      
      {/* Task List */}
      <div className="flex w-full bg-gradient-to-r  from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white mt-5 ml-4 text-2xl font-bold">Task List</h1>
          <div className="flex items-center gap-2">
            <button className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-2 rounded-xl transition-all">
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
                <span>Add New</span>
              </button>
            <span className="text-gray-400 text-sm">Sort by</span>
            <button className="text-white font-semibold text-sm flex items-center gap-1 hover:text-gray-300 transition-colors">
              Top
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
        <div className="flex items-center gap-4 mb-6 ml-4">
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
              placeholder="Search Task"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>

          {/* Dropdown Filters */}
          <select className="bg-transparent text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
            <option>Assignee</option>
            <option>All Projects</option>
          </select>

          <select className="bg-transparent text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
            <option>Priority</option>
            <option>Urgent</option>
          </select>

          {/* Action Buttons */}
          <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
            <svg  
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                strokeWidth={2}
                d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
              </svg>
           </button>

          <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
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
                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
              />
            </svg>
          </button>

          <button className="bg-[#facc15] text-[#0a1128] p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20">
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
                d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184"
              />
            </svg>
          </button>
        </div>
        {/* Table */}
        <div className="overflow-x-auto ml-4">
          <table className="w-full">
            <thead className="bg-[#080C26] rounded-2xl">
              <tr className="rounded-2xl">
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  #
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Task Name
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Projects
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Estimations
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Priority
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Progress
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Assignee
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr
                  key={task.id}
                  className=" hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/Profile/Managers/${task.id}`)}
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                    />
                  </td>
                  <td className="py-4 px-4">{task.taskName}</td>
                  <td className="py-4 px-4 text-gray-400">{task.project}</td>
                  <td className="py-4 px-4 text-gray-400">{task.estimation}</td>
                  <td className="py-4 px-4 text-gray-400">{task.priority}</td>
                  <td className="py-4 px-4 text-gray-400">
                    <progress className="progress progress-success w-56" value="70" max="100"></progress>
                    {task.progress}</td>
                  <td className="flex items-center py-4 px-4 text-gray-400">{task.assignee.map((item, index)=> (
                    <img className={`rounded-full w-8 h-8 ${index > 0 ? "-ml-12" : ""}`} src={item.avatar} alt={item.name}/>
                  ))}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-white transition-colors p-2">
                        <FiMessageCircle className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-yellow-400 transition-colors p-2">
                        <FiStar className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors p-2">
                        <FaPencil className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors p-2">
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
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex w-full bg-gradient-to-r  from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        <div class="flex flex-1 justify-between sm:hidden">
          <a href="#" class="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10">Previous</a>
          <a href="#" class="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10">Next</a>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          
          <div>
            <nav aria-label="Pagination" class="isolate inline-flex -space-x-px rounded-2xl">
              <a href="#" class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0">
                <span class="sr-only">Previous</span>
                <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="size-5">
                  <path d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
              </a>
              {/* <!-- Current: "z-10 text-white focus-visible:outline-2 focus-visible:outline-offset-2 bg-indigo-500 focus-visible:outline-indigo-500", Default: "inset-ring focus:outline-offset-0 text-gray-200 inset-ring-gray-700 hover:bg-white/5" --> */}
              <a href="#" aria-current="page" class="relative z-10 inline-flex items-center bg-[#656A80] px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">1</a>
              <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0">2</a>
              <a href="#" class="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0 md:inline-flex">3</a>
              <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 inset-ring inset-ring-gray-700 focus:outline-offset-0">...</span>
              <a href="#" class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-200 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0">10</a>
              <a href="#" class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0">
                <span class="sr-only">Next</span>
                <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" class="size-5">
                  <path d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" fill-rule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
          <div>
            <p class="text-sm text-gray-300">
              Showing
              <span class="font-medium"> 1 </span>
              to
              <span class="font-medium"> 10 </span>
              of
              <span class="font-medium"> 97 </span>
              entries
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
