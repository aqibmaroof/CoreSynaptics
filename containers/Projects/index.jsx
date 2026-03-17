"use client";

import { FaEllipsisV, FaStar, FaEdit, FaCircle, FaTrash } from "react-icons/fa";
import CardWrapper from "@/components/CardWrapper";
import { useEffect, useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { DeleteProjects, getProjects } from "@/services/Projects";

export default function KanbanBoard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const router = useRouter();
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    getProjectsList();
  }, []);

  const getProjectsList = async () => {
    try {
      const res = await getProjects();
      setProjects(res.projects);
    } catch (error) {
      console.log("error fetching projects : ", error);
    }
  };

  const deleteProject = async (id) => {
    try {
      await DeleteProjects(id);
      getProjectsList();
      setMessage({
        type: "success",
        text: "Project Deleted Successfully!",
      });
      setTimeout(() => {
        setMessage({
          type: "",
          text: "",
        });
      }, [5000]);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error Deleting projects : ${error?.message}`,
      });
      console.log("error Deleting projects : ", error);
    }
  };

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
          avatar: "/images/assignee1.jpg",
          bgColor: "bg-purple-500/20",
        },
        {
          id: 2,
          name: "Conny Rany",
          email: "connyrany@mail.com",
          avatar: "/images/assignee2.jpg",
          bgColor: "bg-emerald-500/20",
        },
        {
          id: 3,
          name: "Armin Falcon",
          email: "arfalcon@mail.com",
          avatar: "/images/assignee3.jpg",
          bgColor: "bg-gray-500/20",
        },
      ],
    },
    {
      id: 2,
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
          avatar: "/images/assignee1.jpg",
          bgColor: "bg-purple-500/20",
        },
        {
          id: 2,
          name: "Conny Rany",
          email: "connyrany@mail.com",
          avatar: "/images/assignee2.jpg",
          bgColor: "bg-emerald-500/20",
        },
        {
          id: 3,
          name: "Armin Falcon",
          email: "arfalcon@mail.com",
          avatar: "/images/assignee3.jpg",
          bgColor: "bg-gray-500/20",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen font-gilroy p-6 text-white">
      <h1 className="font-bold text-xl md:text-2xl">Task overveiw</h1>
      {/* Stats */}
      <div className="flex items-center justify-between w-full gap-20 md:gap-8 px-3 font-gilroy mt-6 mb-6">
        <div className="flex items-center justify-left gap-2 md:gap-6 w-full ">
          <p className="text-4xl md:text-7xl font-bold font-gilroy">80</p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm">
            <p>
              Total <br />
              Projects
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="text-4xl md:text-7xl font-bold ">15</p>
          <div className="flex flex-col items-right justify-end text-xs md:text-sm ">
            <p>
              Projects Due <br />
              Today
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="text-4xl md:text-7xl font-bold">20</p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm">
            <p>
              Overdue <br />
              Projects
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="text-4xl md:text-7xl font-bold">150</p>
          <div className="flex flex-col items-start justify-end text-right text-xs md:text-sm">
            <p>
              Projects <br />
              Completed
            </p>
          </div>
        </div>
      </div>
      {/* cards */}
      <div className="flex flex-row gap-6">
        {/* Left side card */}
        <CardWrapper className="font-gilroy flex-col ">
          {" "}
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white text-sm md:text-xl font-semibold">
                Projects List
              </h2>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="border border-[#FFFFFF]/30 rounded-full px-2 py-2">
                <button className="font-semibold text-xs md:text-sm mx-2">
                  {" "}
                  Nearest Due Date <span className="ml-3">▼</span>
                </button>
              </div>
              <button
                onClick={() => router.push("/CreateProject")}
                className="bg-[#66ACFF] text-white p-2 rounded-xl hover:bg-[#fbbf24] transition-all cursor-pointer"
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
            {projects.length === 0 ? (
              <div className="col-span-2 flex items-center justify-center h-20">
                <p className="w-full text-center flex items-center justify-center">
                  NO PROJECTS FOUND
                </p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className={`flex  items-center justify-between w-full font-gilroy border-3 border-white/[0.03] border-t-white/[0.09] p-4 mt-2 rounded-2xl bg-gradient-to-r  from-[#12153d] via-[#114a4f] to-[#19253a]`}
                >
                  {/* Left Side - Avatar and Info */}
                  <div className="flex items-center gap-3">
                    <div className={`avatar online`}>
                      <div className="w-8 h-8 text-center justify-center border-2 border-[#62647A] rounded-full bg-gradient-to-r from-[#01e590] to-[#17323f]">
                        <p className="mt-1">
                          {project.name.slice(0, 1)}
                          {/* {project.name.split(" ")[1].slice(0, 1)} */}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {project.name}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {project.organization?.name} - {project?.projectType}
                      </p>
                      <p className="flex items-center gap-1 flex-wrap text-gray-400 text-xs">
                        Assignee :
                        {project.assignedUsers?.map((item) => (
                          <p>
                            {item?.firstName} {item?.lastName}
                          </p>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="dropdown dropdown-end">
                    <label
                      tabIndex={0}
                      className="btn btn-ghost hover:shadow-none focus:shadow-none active:shadow-none hover:bg-[transparent] focus:bg-[transparent] active:bg-[transparent] hover:border-[transparent] focus:border-[transparent] active:border-[transparent] btn-circle avatar online w-15 h-15"
                    >
                      <div className="avatar online">
                        <div className="relative inline-block ">
                          <div className="text-white/70 hover:text-white">
                            <FaEllipsisV size={14} />
                          </div>
                          {/* The Green Dot */}
                        </div>
                      </div>
                    </label>
                    <ul
                      tabIndex={0}
                      className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-gradient-to-r  from-[#12153d] via-[#114a4f] to-[#19253a] border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-box w-[max-content] border border-white/10"
                    >
                      <li>
                        <button
                          className={`text-[16px] text-white gap-3 mt-2 `}
                          onClick={() =>
                            router.push(
                              `/ProjectDetails/Project/${project?.id}`,
                            )
                          }
                        >
                          <FaPencil className="text-lg text-info" /> Edit
                        </button>
                      </li>
                      <li>
                        <button
                          className={`text-[16px] text-white gap-3 mt-2 `}
                          onClick={() => deleteProject(project?.id)}
                        >
                          <FaTrash className="text-lg text-error" /> Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
          {message.text && (
            <div
              className={` px-3 py-2 rounded-lg text-sm animate-fade-in ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-500/30"
                  : "bg-red-900/30 text-red-400 border border-red-500/30"
              }`}
            >
              {message.text}
            </div>
          )}
        </CardWrapper>
        {/* Right side card */}
        <CardWrapper className="font-gilroy flex-col">
          {" "}
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white text-sm md:text-xl font-semibold">
                Members
              </h2>
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
          <div className="space-y-1 grid grid-cols md:grid-cols-2 grid-rows-3 gap-1 md:gap-3">
            {members.map((member) => (
              <div
                key={member.id}
                className={`flex  items-center justify-between w-full font-gilroy border-3 border-white/[0.03] border-t-white/[0.09] p-1 md:p-3 mt-2 rounded-2xl ${
                  member.isActive
                    ? "bg-emerald-600/30 border border-emerald-500/50"
                    : "bg-gradient-to-r from-[#0d2963] via-[#0d2963] to-[#19213d]"
                }`}
              >
                {/* Left Side - Avatar and Info */}
                <div className="flex items-center gap-1 md:gap-3 ">
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

      {/* Task List Table */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        {/* Header */}
        <div className="flex items-center justify-between gap-16 mb-8">
          <h1 className="text-white mt-5 ml-4 text-lg md:text-xl font-bold">
            Task List
          </h1>
          <div className="flex items-center gap-5">
            <button
              onClick={() => document.getElementById("my_modal_4").showModal()}
              className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white px-4 py-2 border-none rounded-xl transition-all cursor-pointer"
            >
              <div className="flex flex-row gap-2">
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
                    d="M12 4v16m8-8H4 "
                  />
                </svg>
                <span className="text-xs md:text-sm">Add new</span>
              </div>
            </button>
            <button className="flex items-center justify-center gap-2 text-white text-sm flex items-center gap-1 hover:text-gray-300 transition-colors">
              <span className="text-gray-100 text-sm">Sort by</span>
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
        <div className="flex flex-col md:flex-row items-center gap-2 mb-6 ml-4">
          {/* Search Input */}
          <div className="flex gap-2 w-full md:w-full">
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
                className="w-full bg-transparent text-white placeholder-white pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <select className="bg-transparent text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
              <option>Assignee</option>
              <option>All Projects</option>
            </select>
          </div>

          {/* Dropdown Filters */}
          <div className="flex gap-2 w-full md:w-auto">
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"
                />
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

            <button className="bg-[#F2F962] text-[#0a1128] p-3.5 rounded-xl hover:bg-[#facc15] border border-white/10 hover:border-white/20 transition-all shadow-lg shadow-yellow-500/20">
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
                  Project
                </th>
                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                  Estimation
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
                  className="w-full hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() =>
                    router.push(`/ProjectDetails/Update/${task.id}`)
                  }
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                    />
                  </td>
                  <td className="py-4 px-1 text-xs ">{task.taskName}</td>
                  <td className="py-2 px-1">
                    <div className="flex items-center gap-2 text-xs">
                      <p className="w-12 h-12 rounded-full flex items-center justify-center bg-[#656A80] text-[16px] font-bold text-white">
                        {task.project.slice(0, 1)}
                        {task.project.split(" ")[1].slice(0, 1)}
                      </p>
                      {task.project}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-400 text-xs">
                    {task.estimation}
                  </td>
                  <td className="py-4 px-1 text-[#FB5874] text-[14px]">
                    <div className="flex items-center justify-center gap-1">
                      <FaCircle className="text-[#FB5874] text-[10px]" />
                      {task.priority}
                    </div>
                  </td>
                  <td className="py-4 px-1  text-[14px]">
                    <div className="flex items-center gap-2">
                      <progress
                        className="progress progress-success w-25 "
                        value="70"
                        max="100"
                      ></progress>
                      {task.progress}
                    </div>
                  </td>
                  <td className="flex items-center py-4 px-1 text-gray-400">
                    {task.assignee.map((item, index) => (
                      <div
                        key={index}
                        className={`avatar 
                              ${index !== 0 ? "-ml-2" : ""} 
                              transition-transform duration-300 z-${task.assignee.length - index}`}
                      >
                        <div className="w-[25px] h-[25px] rounded-full ring-3 ring-[#0C255B] shadow-xl">
                          <img
                            src={item.avatar}
                            alt={`User ${index}`}
                            className="w-[25px] h-[25px] rounded-full object-cover"
                          />
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-1 ">
                    <div className="flex items-center gap-2 text-[14px]">
                      <button className="text-gray-400 hover:text-white transition-colors p-2">
                        <FiMessageCircle className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-yellow-400 transition-colors p-2">
                        <FiStar className="text-white" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors p-2">
                        <FaPencil className="text-white text-[12px]" />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors p-2">
                        <svg
                          className="w-3 h-3"
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

      {/* Popup box */}
      <dialog id="my_modal_4" className="modal ">
        <div className="modal-box pt-0 px-0  border border-[#656A80] backdrop-blur-2xl bg-transparent scrollbar-hide">
          <div className="modal-action flex items-center justify-between pt-0 px-4">
            <div>
              <h3 className="font-bold text-lg">Create New Project</h3>
            </div>
            <form method="dialog" className="gap-2 flex">
              <button className="size-9 rounded-xl hover:bg-gray-300 flex items-center justify-center border border-white bg-[#656A80]">
                <img src="/images/maximize.svg" alt="Maximize" />
              </button>
              <button className="size-9 rounded-xl hover:bg-gray-300 flex items-center justify-center border border-white bg-[#FB5874]">
                <img src="/images/close.svg" alt="Close" />
              </button>
            </form>
          </div>
          <hr className="w-full my-3 bg-neutral-quaternary border-[#656A80]"></hr>

          <div className="px-4">
            <div className="mt-4">
              <p className="text-sm">Project Name</p>
              <input
                type="text"
                placeholder="Delta Developers"
                className="w-full bg-transparent text-white placeholder-white gray-500 mt-1 pl-4 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm">Date</p>
              <div
                tabIndex={0}
                role="button"
                className="p-3 w-full flex mt-1 items-center justify-between border-3 bg-transparent shadow-none rounded-2xl border-white/[0.04] border-t-white/[0.1] text-white"
              >
                <span className="font-normal">
                  Feb 01, 2026 {"->"} Feb 11, 2026
                </span>
                <img src={"/images/calendar_1.svg"} />
              </div>
            </div>

            <div className="flex flex-row gap-4 w-full items-center justify-between mt-4">
              <div className="w-full">
                <h1 className="text-sm">Status</h1>
                <div className="dropdown dropdown-bottom w-full">
                  <div
                    tabIndex={0}
                    role="button"
                    className="p-3 w-full flex mt-1 items-center justify-between border-3 bg-transparent shadow-none rounded-2xl border-white/[0.04] border-t-white/[0.1] text-white"
                  >
                    <span className="flex items-center justify-center gap-3 font-[510] bg-[#B6CFFF] text-[#4D81E7] rounded-full px-2">
                      <img src="/images/dot.svg" alt="diot" />
                      Inprogress
                    </span>
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
                  </div>
                  <div
                    tabIndex={0}
                    className="dropdown-content z-[9999] mt-2 w-full max-h-60 overflow-y-auto rounded-lg shadow-xl bg-gradient-to-r from-[#093E7D] to-[#0075FF] border-3 border-white/[0.03] border-t-white/[0.09]"
                  >
                    <div className="p-2 space-y-1">
                      <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-info checkbox-xs"
                        />
                        <span className="text-white text-sm">In progress</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <h1 className="text-sm">Project Manager</h1>
                <div className="dropdown dropdown-bottom w-full">
                  <div
                    tabIndex={0}
                    role="button"
                    className="p-3 w-full flex mt-1 items-center justify-between border-3 bg-transparent shadow-none rounded-2xl border-white/[0.04] border-t-white/[0.1] text-white"
                  >
                    <span className="flex items-center justify-center gap-3 font-[510] bg-[#FFC6D0] text-[#FB5874] rounded-full px-2">
                      <img src="/images/red_dot.svg" alt="diot" />
                      Urgent
                    </span>
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
                  </div>
                  <div
                    tabIndex={0}
                    className="dropdown-content z-[9999] mt-2 w-full max-h-60 overflow-y-auto rounded-lg bg-gradient-to-r from-[#093E7D] to-[#0075FF] border-3 border-white/[0.03] border-t-white/[0.09]"
                  >
                    <div className="p-2 space-y-1">
                      <label className="flex items-center gap-3 cursor-pointer  p-2 rounded">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-info checkbox-xs"
                        />
                        <span className="text-white text-sm">Urgent</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <h2 className="text-sm">Team Members</h2>
              <div className="flex flex-row items-center gap-2 ml-3">
                {members.slice(0, 1).map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center h-8 justify-between w-34 font-geist border border-[#656A80]  rounded-2xl ${
                      member.isActive
                        ? "bg-emerald-600/30 border border-emerald-500/50"
                        : "bg-[#575975]"
                    }`}
                  >
                    {/* Left Side - Avatar and Info */}
                    <div className="flex items-center gap-3 ">
                      <div
                        className={`avatar ${member.isActive ? "online" : ""}`}
                      >
                        <div className="w-7 h-7 rounded-full">
                          <img src={member.avatar} alt={member.name} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">
                          {member.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn btn-medium bg-[#454A62] rounded-2xl h-8 font-semibold text-white text-sm border border-[#656A80] hover:bg-slate-700">
                + Invite
              </button>
            </div>
          </div>

          <hr className="w-full mt-3 bg-neutral-quaternary border-[#656A80]"></hr>
          <div className="flex items-center justify-end gap-2 mr-4">
            <button className="btn mt-3 backdrop-blur-md text-white p-3 bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all">
              <div className="flex flex-row gap-2">
                <span className="flex flex-row gap-2 items-center">Cancel</span>
              </div>
            </button>
            <button className="btn mt-3 bg-gradient-to-r from-[#0075F8] to-[#00387A] text-white p-4 border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all">
              <div className="flex flex-row gap-2">
                <span className="flex flex-row gap-2 items-center">Save</span>
              </div>
            </button>
          </div>
        </div>
      </dialog>

      {/* Pagination */}
      <div className="flex w-full bg-gradient-to-r  from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        <div className="flex flex-1 justify-between sm:hidden">
          <a
            href="#"
            className="relative inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10"
          >
            Previous
          </a>
          <a
            href="#"
            className="relative ml-3 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 hover:bg-white/10"
          >
            Next
          </a>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <nav
              aria-label="Pagination"
              className="isolate inline-flex -space-x-px rounded-2xl"
            >
              <a
                href="#"
                className="relative inline-flex items-center rounded-xl mr-5 px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  data-slot="icon"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path
                    d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
              </a>
              {/* <!-- Current: "z-10 text-white focus-visible:outline-2 focus-visible:outline-offset-2 bg-indigo-500 focus-visible:outline-indigo-500", Default: "inset-ring focus:outline-offset-0 text-gray-200 inset-ring-gray-700 hover:bg-white/5" --> */}
              <a
                href="#"
                aria-current="page"
                className="relative z-10 inline-flex items-center bg-[#656A80] px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 rounded-xl focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-200 rounded-xl hover:bg-white/5 focus:z-20 focus:outline-offset-0"
              >
                2
              </a>
              <a
                href="#"
                className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-200 rounded-xl hover:bg-white/5 focus:z-20 focus:outline-offset-0 md:inline-flex"
              >
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-400 rounded-xl focus:outline-offset-0">
                ...
              </span>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-200 rounded-xl hover:bg-white/5 focus:z-20 focus:outline-offset-0"
              >
                10
              </a>
              <a
                href="#"
                className="relative inline-flex items-center rounded-xl ml-5 px-2 py-2 text-gray-400 inset-ring inset-ring-gray-700 hover:bg-white/5 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  data-slot="icon"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  />
                </svg>
              </a>
            </nav>
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-300">
              Showing
              <span className="font-medium"> 1 </span>
              to
              <span className="font-medium"> 10 </span>
              of
              <span className="font-medium"> 97 </span>
              entries
            </p>
            <div className="dropdown dropdown-top">
              <div
                tabIndex={0}
                role="button"
                className="btn border-none m-1 bg-white text-[#161618] rounded-xl"
              >
                Show 8{" "}
              </div>
              <ul
                tabIndex="-1"
                className="dropdown-content menu bg-white text-[#161618] rounded-xl z-1 w-52 "
              >
                <li>
                  <a>Item 1</a>
                </li>
                <li>
                  <a>Item 2</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
