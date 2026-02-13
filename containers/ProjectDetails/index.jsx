"use client";
import { FaCircle } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import {useRouter} from "next/navigation"


export default function KanbanBoard() {
    const router = useRouter();

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
    // {
    //   id: 2,
    //   taskName: "Finalize Project Proposal",
    //   project: "Website Redesign",
    //   estimation: "01 Nov - 7 Nov 2026",
    //   priority: "Urgent",
    //   progress: "80%",
    //   assignee: [
    //     {
    //       id: 1,
    //       name: "Rainer Brown",
    //       email: "Rainerbrown@mail.com",
    //       avatar: "/images/assignee1.jpg",
    //       bgColor: "bg-purple-500/20",
    //     },
    //     {
    //       id: 2,
    //       name: "Conny Rany",
    //       email: "connyrany@mail.com",
    //       avatar: "/images/assignee2.jpg",
    //       bgColor: "bg-emerald-500/20",
    //     },
    //     {
    //       id: 3,
    //       name: "Armin Falcon",
    //       email: "arfalcon@mail.com",
    //       avatar: "/images/assignee3.jpg",
    //       bgColor: "bg-gray-500/20",
    //     },
    //   ],
    // },
  ];
    return (
    <div className="min-h-screen font-gilroy p-6 text-[#101437] dark:text-white">
        <h1 className="font-bold text-2xl text-white">Delta Developers</h1>
        <div className="w-150  font-gilroy mt-6 mb-6 text-[#A0AEC0]">
          <div className="flex justify-between items-center">
            <h2>Project Status:</h2>
            <button className="px-3 py-2.5 rounded-3xl text-white bg-[#0075FF]">In Progress</button>
          </div>
          <div className="flex items-center space-x-4 mt-3">
            <span class="text-slate-400">Progress:</span>
            <span class="text-sm ml-28">60%</span>
            <progress className="progress progress-accent w-56" value="60" max="100"></progress>
          </div>
          <div className="flex justify-between items-center mt-3">
            <h2>Dates:</h2>  
                <div class="relative max-w-sm">
                <span>January 15, 2026  - February 20, 2026</span>
                </div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <h2>Project Manager:</h2>
            <div >
            {members.slice(0, 1).map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between w-full font-geist border border-white/[0.03] border-t-white/[0.09] ml-2 mt-2 rounded-2xl ${
                  member.isActive
                    ? "bg-emerald-600/30 border border-emerald-500/50"
                    : "bg-[#575975]"
                }`}
              >
                {/* Left Side - Avatar and Info */}
                <div className="flex items-center gap-3 ">
                  <div className={`avatar ${member.isActive ? "online" : ""}`}>
                    <div className="w-7 h-7 rounded-full border-2 border-white">
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

          </div>
          <div className="flex justify-between items-center mt-3">
            <h2>Team Members:</h2>
            <div className="flex flex-row gap-2">
            {members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between w-full font-geist border border-white/[0.03] border-t-white/[0.09] ml-2 mt-2 rounded-2xl ${
                  member.isActive
                    ? "bg-emerald-600/30 border border-emerald-500/50"
                    : "bg-[#575975]"
                }`}
              >
                {/* Left Side - Avatar and Info */}
                <div className="flex items-center gap-3 ">
                  <div className={`avatar ${member.isActive ? "online" : ""}`}>
                    <div className="w-7 h-7 rounded-full border-2 border-white">
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
            <button className="btn btn-medium items-center bg-transparent rounded-3xl ml-3 px-8 font-semibold text-white border-2 border-white/[0.03] border-t-white/[0.09] hover:bg-slate-700">+ Invite</button>
          </div>
        </div>
         {/* Task Views */}
        <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
            <div className="flex items-center justify-between mb-8">
            <div className="flex gap-4">
            <h1 className="text-white mt-5 ml-4 text-2xl font-bold">Task Views</h1>
            <button  className="btn mt-5 bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-4 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
              <div >
              {/* <svg
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
              </svg> */}
                <span className="flex flex-row gap-2 items-center"><img src="/images/list.png" alt="Vector" className="h-3 w-3" />
                List
                </span>
              </div>
            </button>
            <button onClick={()=> router.push("/KanbanView")} className="btn mt-5 bg-transparent  text-white p-2 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
              <div className="flex flex-row gap-2">
              {/* <svg
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
              </svg> */}
              <span className="flex flex-row gap-2 items-center"><img src="/images/kanban.png" alt="Vector" className="h-3 w-3" />
                Kanban
                </span>
              </div>
            </button>
            <button  className="btn mt-5 bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] text-white p-2  rounded-3xl transition-all">
              <div className="flex flex-row gap-2">
              {/* <svg
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
              </svg> */}
                <span className="flex flex-row gap-2 items-center"><img src="/images/calender.png" alt="Vector" className="h-3 w-3" />
                Calender
                </span>
              </div>
            </button>
            </div>
          <div className="flex items-center gap-2">
            <button onClick={()=> router.push("/ProjectDetails")} className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-2 border-none rounded-xl transition-all">
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
              <span>Add new</span>
              </div>
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
                className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                />
            </div>

            {/* Dropdown Filters */}
            <select className="bg-transparent text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
                <option>Assignee</option>
                <option>All Projects</option>
            </select>

            <select className="bg-transparent text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
                <option>Date</option>
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
        {/* To do */}
         <div className="flex w-full shadow-inner shadow-blue-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
            <div className="flex items-center justify-between " >
              <div className="flex flex-row items-center gap-2">
                <FaCircle className="text-[#4D81E7]" />
                <span className="text-xl font-semibold">To Do</span>
                <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#4D81E7] text-white">4</button>
              </div>
              <div className="flex items-center gap-2">
              <button className="bg-none bg-transparent text-white p-2 border-none rounded-xl transition-all">
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
              <span>Add new Task</span>
              </div>
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
           </div>
           <div>
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
                <td className="py-4 px-4 text-sm">{task.taskName}</td>
                <td className="py-4 px-4 text-gray-400 text-sm flex gap-2">
                    <div className="flex items-center gap-2 ">
                    <p className="w-8 h-8 rounded-full text-center justify-center bg-[#656A80] text-xl font-bold text-white ">
                    {task.project.slice(0, 1)}
                    {task.project.split(" ")[1].slice(0, 1)}
                    </p>
                    {task.project}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400">{task.estimation}</td>
                <td className="py-4 px-4 text-[#FB5874] text-sm">
                    <div className="flex items-center gap-3">
                    <FaCircle className="text-[#FB5874]" />
                    {task.priority}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400  text-sm">
                    <div className="flex items-center gap-3">
                    <progress
                    className="progress progress-success w-25 "
                    value="70"
                    max="100"
                    ></progress>
                    {task.progress}
                    </div>
                </td>
                <td className="flex items-center py-4 px-4 text-gray-400">
                    {task.assignee.map((item, index) => (
                    <div
                        key={index}
                        className={`avatar 
                        ${index !== 0 ? "-ml-2" : ""} 
                        transition-transform duration-300 z-${task.assignee.length - index}`}
                    >
                        <div className="w-[40px] h-[40px] rounded-full ring-3 ring-[#0C255B] shadow-xl">
                        <img
                            src={item.avatar}
                            alt={`User ${index}`}
                            className="w-[40px] h-[40px] rounded-full object-cover"
                        />
                        </div>
                    </div>
                    ))}
                </td>
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
           </div>
         </div>
         {/* In Progress */}
         <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
            <div className="flex items-center justify-between " >
              <div className="flex flex-row items-center gap-2">
                <FaCircle className="text-[#EFBA47]" />
                <span className="text-xl font-semibold">In Progress</span>
                <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#EFBA47] text-white">4</button>
              </div>
              <div className="flex items-center gap-2">
              <button className="bg-none bg-transparent text-white p-2 border-none rounded-xl transition-all">
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
              <span>Add new Task</span>
              </div>
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
           </div>
           <div>
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
                <td className="py-4 px-4 text-sm">{task.taskName}</td>
                <td className="py-4 px-4 text-gray-400 text-sm flex gap-2">
                    <div className="flex items-center gap-2 ">
                    <p className="w-8 h-8 rounded-full text-center justify-center bg-[#656A80] text-xl font-bold text-white ">
                    {task.project.slice(0, 1)}
                    {task.project.split(" ")[1].slice(0, 1)}
                    </p>
                    {task.project}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400">{task.estimation}</td>
                <td className="py-4 px-4 text-[#FB5874] text-sm">
                    <div className="flex items-center gap-3">
                    <FaCircle className="text-[#FB5874]" />
                    {task.priority}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400  text-sm">
                    <div className="flex items-center gap-3">
                    <progress
                    className="progress progress-success w-25 "
                    value="70"
                    max="100"
                    ></progress>
                    {task.progress}
                    </div>
                </td>
                <td className="flex items-center py-4 px-4 text-gray-400">
                    {task.assignee.map((item, index) => (
                    <div
                        key={index}
                        className={`avatar 
                        ${index !== 0 ? "-ml-2" : ""} 
                        transition-transform duration-300 z-${task.assignee.length - index}`}
                    >
                        <div className="w-[40px] h-[40px] rounded-full ring-3 ring-[#0C255B] shadow-xl">
                        <img
                            src={item.avatar}
                            alt={`User ${index}`}
                            className="w-[40px] h-[40px] rounded-full object-cover"
                        />
                        </div>
                    </div>
                    ))}
                </td>
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
           </div>
         </div>
         {/* In Reviews */}
         <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
            <div className="flex items-center justify-between " >
              <div className="flex flex-row items-center gap-2">
                <FaCircle className="text-[#E7844D]" />
                <span className="text-xl font-semibold">In Reviews</span>
                <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#E7844D] text-white">4</button>
              </div>
              <div className="flex items-center gap-2">
              <button className="bg-none bg-transparent text-white p-2 border-none rounded-xl transition-all">
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
              <span>Add new Task</span>
              </div>
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
           </div>
           <div>
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
                <td className="py-4 px-4 text-sm">{task.taskName}</td>
                <td className="py-4 px-4 text-gray-400 text-sm flex gap-2">
                    <div className="flex items-center gap-2 ">
                    <p className="w-8 h-8 rounded-full text-center justify-center bg-[#656A80] text-xl font-bold text-white ">
                    {task.project.slice(0, 1)}
                    {task.project.split(" ")[1].slice(0, 1)}
                    </p>
                    {task.project}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400">{task.estimation}</td>
                <td className="py-4 px-4 text-[#FB5874] text-sm">
                    <div className="flex items-center gap-3">
                    <FaCircle className="text-[#FB5874]" />
                    {task.priority}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400  text-sm">
                    <div className="flex items-center gap-3">
                    <progress
                    className="progress progress-success w-25 "
                    value="70"
                    max="100"
                    ></progress>
                    {task.progress}
                    </div>
                </td>
                <td className="flex items-center py-4 px-4 text-gray-400">
                    {task.assignee.map((item, index) => (
                    <div
                        key={index}
                        className={`avatar 
                        ${index !== 0 ? "-ml-2" : ""} 
                        transition-transform duration-300 z-${task.assignee.length - index}`}
                    >
                        <div className="w-[40px] h-[40px] rounded-full ring-3 ring-[#0C255B] shadow-xl">
                        <img
                            src={item.avatar}
                            alt={`User ${index}`}
                            className="w-[40px] h-[40px] rounded-full object-cover"
                        />
                        </div>
                    </div>
                    ))}
                </td>
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
           </div>
         </div>
         {/* Completed */}
         <div className="flex w-full  bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
            <div className="flex items-center justify-between " >
              <div className="flex flex-row items-center gap-2">
                <FaCircle className="text-[#00E691]" />
                <span className="text-xl font-semibold">Completed</span>
                <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#00E691] text-white">4</button>
              </div>
              <div className="flex items-center gap-2">
              <button className="bg-none bg-transparent text-white p-2 border-none rounded-xl transition-all">
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
              <span>Add new Task</span>
              </div>
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
           </div>
           <div className="items-center justify-center">
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
                <td className="py-4 px-4 text-sm">{task.taskName}</td>
                <td className="py-4 px-4 text-gray-400 text-sm flex gap-2">
                    <div className="flex items-center gap-2 ">
                    <p className="w-8 h-8 rounded-full text-center justify-center bg-[#656A80] text-xl font-bold text-white ">
                    {task.project.slice(0, 1)}
                    {task.project.split(" ")[1].slice(0, 1)}
                    </p>
                    {task.project}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400">{task.estimation}</td>
                <td className="py-4 px-4 text-[#FB5874] text-sm">
                    <div className="flex items-center gap-3">
                    <FaCircle className="text-[#FB5874]" />
                    {task.priority}
                    </div>
                </td>
                <td className="py-4 px-4 text-gray-400  text-sm">
                    <div className="flex items-center gap-3">
                    <progress
                    className="progress progress-success w-25 "
                    value="70"
                    max="100"
                    ></progress>
                    {task.progress}
                    </div>
                </td>
                <td className="flex items-center py-4 px-4 text-gray-400">
                    {task.assignee.map((item, index) => (
                    <div
                        key={index}
                        className={`avatar 
                        ${index !== 0 ? "-ml-2" : ""} 
                        transition-transform duration-300 z-${task.assignee.length - index}`}
                    >
                        <div className="w-[40px] h-[40px] rounded-full ring-3 ring-[#0C255B] shadow-xl">
                        <img
                            src={item.avatar}
                            alt={`User ${index}`}
                            className="w-[40px] h-[40px] rounded-full object-cover"
                        />
                        </div>
                    </div>
                    ))}
                </td>
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
           </div>
         </div>
         
        </div>

        
    </div>
    )
};