"use client";
import { FaCircle } from "react-icons/fa";
import { useState } from "react";
import TestCasesOverview from "../../components/Cards/TestCasesOverview";
import SalesOverview from "../../components/Cards/SalesOverview";

export default function KanbanBoard() {
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
        {
          id: 4,
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
  const orderStatsData = {
    title: "Order Statistics",
    totalSales: "42.82K",
    totalOrders: 8258,
    weeklyPercentage: 38,
    categories: [
      {
        name: "Electronic",
        description: "Mobile, Earbuds, TV",
        value: "82.5K",
      },
      { name: "Fashion", description: "T-shirt, Jeans, Shoes", value: "23.8K" },
      { name: "Decor", description: "Fine Art, Dining", value: "849" },
      { name: "Sports", description: "Football, Cricket Kit", value: "99" },
    ],
  };

  return (
    <div className="min-h-screen font-gilroy p-6 text-white">
      {/* Stats */}
      <h1 className="text-xl md:text-2xl font-bold">QA QC Overview</h1>
      <div className="flex items-center justify-between w-full gap-20 md:gap-8 mt-2">
        <div className="flex items-center justify-left gap-2 w-full ">
          <p className="text-4xl md:text-6xl font-bold font-gilroy">1120</p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm w-30">
            <p>
              Total Equipment
              <br />
              Tested
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-2 w-full">
          <p className="font-bold text-4xl md:text-6xl">70%</p>
          <div className="flex flex-col items-right justify-end text-xs md:text-sm ">
            <p>
              Test Equipment <br />
              Approved
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-2 w-full">
          <p className="font-bold text-4xl md:text-6xl">20%</p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm">
            <p>
              Test Equipment <br />
              Rejected
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-2 w-full">
          <p className="text-4xl md:text-6xl font-bold ">10%</p>
          <div className="flex flex-col items-start justify-end text-right text-xs md:text-sm">
            <p>
              Test Equipment <br />
              N/A
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-left gap-6 w-full">
        <p className="font-bold text-7xl">70%</p>
        <div className="flex flex-col items-right justify-end text-sm ">
          <p>
            Test Equipment <br />
            Approved
          </p>
        </div>
      </div>
      <div className="flex items-center justify-left gap-6 w-full">
        <p className="font-bold text-7xl">20%</p>
        <div className="flex flex-col items-start justify-end text-sm">
          <p>
            Test Equipment <br />
            Rejected
          </p>
        </div>
      </div>
      <div className="flex items-center justify-left gap-6 w-full">
        <p className="text-7xl font-bold ">10%</p>
        <div className="flex flex-col items-start justify-end text-right text-base">
          <p>
            Test Equipment <br />
            N/A
          </p>
        </div>
      </div>

      {/* cards */}
      <div className="flex flex-row gap-4 mb-5 font-gilroy mt-8">
        <TestCasesOverview data={orderStatsData} />
        <SalesOverview heading="Equipment Overview" />
      </div>

      {/* Task Views */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <h1 className="text-white mt-5 ml-4 text-2xl font-bold">
              Task Views
            </h1>
            <button className="btn mt-5 bg-transparent text-white p-4 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
              <div>
                <span className="flex flex-row gap-2 items-center">
                  <img
                    src="/images/list.png"
                    alt="Vector"
                    className="h-3 w-3"
                  />
                  List
                </span>
              </div>
            </button>
            <button className="btn mt-5 bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]  text-white p-2 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
              <div className="flex flex-row gap-2">
                <span className="flex flex-row gap-2 items-center">
                  <img
                    src="/images/kanban.png"
                    alt="Vector"
                    className="h-3 w-3"
                  />
                  Kanban
                </span>
              </div>
            </button>
            <button
              onClick={() => router.push("/CalendarView")}
              className="btn mt-5 bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] text-white p-2  rounded-3xl transition-all"
            >
              <div className="flex flex-row gap-2">
                <span className="flex flex-row gap-2 items-center">
                  <img
                    src="/images/calender.png"
                    alt="Vector"
                    className="h-3 w-3"
                  />
                  Calender
                </span>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/ProjectDetails/Create/12")}
              className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-2 border-none rounded-xl transition-all"
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

        {/* Task Views */}
        <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-4">
              <h1 className="text-white mt-5 ml-4 text-lg md:text-2xl font-bold">
                Task Views
              </h1>
              <button className="btn mt-5 bg-transparent text-white p-4 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
                <div>
                  <span className="flex flex-row text-xs md:text-sm gap-2 items-center">
                    <img
                      src="/images/list.png"
                      alt="Vector"
                      className="h-3 w-3"
                    />
                    List
                  </span>
                </div>
              </button>
              <button className="btn mt-5 bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]  text-white p-2 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
                <div className="flex flex-row gap-2">
                  <span className="flex flex-row text-xs md:text-sm gap-2 items-center">
                    <img
                      src="/images/kanban.png"
                      alt="Vector"
                      className="h-3 w-3"
                    />
                    Kanban
                  </span>
                </div>
              </button>
              <button
                onClick={() => router.push("/CalendarView")}
                className="btn mt-5 bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] text-white p-2  rounded-3xl transition-all"
              >
                <div className="flex flex-row gap-2">
                  <span className="flex flex-row text-xs md:text-sm gap-2 items-center">
                    <img
                      src="/images/calender.png"
                      alt="Vector"
                      className="h-3 w-3"
                    />
                    Calender
                  </span>
                </div>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/ProjectDetails")}
                className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-2 border-none rounded-xl transition-all"
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
              <div className="dropdown dropdown-end">
                <label
                  tabIndex={0}
                  className="text-white/80 text-sm cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                >
                  Sort by <span className="font-semibold">Top</span>
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
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1e3a8a] rounded-box w-40 mt-2"
                >
                  <li>
                    <a className="text-white hover:bg-white/10">Daily</a>
                  </li>
                  <li>
                    <a className="text-white hover:bg-white/10">Weekly</a>
                  </li>
                  <li>
                    <a className="text-white hover:bg-white/10">Monthly</a>
                  </li>
                  <li>
                    <a className="text-white hover:bg-white/10">Yearly</a>
                  </li>
                </ul>
              </div>
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

            <button className="bg-[#F2F962] text-[#0a1128] p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20">
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

          <div className="flex flex-row gap-2">
            {/* To do */}
            <div className="flex w-85 shadow-inner shadow-blue-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
              <div className="flex justify-between flex-col">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <FaCircle className="text-[#4D81E7]" />
                    <span className="text-xl font-semibold">To Do</span>
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
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="bg-none bg-[#1A1F374A] w-full justify-items-center text-white p-2 border-none rounded-xl transition-all">
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
                </div>
              </div>
              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                      Marketing
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                      Urgent
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Monthly Product Discussion
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                      Normal
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Update New Social Media Posts
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-2 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#FF6637] bg-[#FFD6CA]">
                      External
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                      Marketing
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                      Urgent
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Monthly Product Discussion
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* In Progress */}
            <div className="flex w-85 shadow-inner shadow-yellow-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
              <div className="flex justify-between flex-col">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <FaCircle className="text-[#EFBA47]" />
                    <span className="text-xl font-semibold">In Progress</span>
                    <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#EFBA47] text-white">
                      4
                    </button>
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
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="bg-none bg-[#1A1F374A] w-full justify-items-center text-white p-2 border-none rounded-xl transition-all">
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
                </div>
              </div>
              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                      Marketing
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                      Urgent
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Monthly Product Discussion
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                      Normal
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Update New Social Media Posts
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* In Reviews */}
            <div className="flex w-85 shadow-inner shadow-orange-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
              <div className="flex justify-between flex-col">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <FaCircle className="text-[#E7844D]" />
                    <span className="text-xl font-semibold">In Reviews</span>
                    <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#E7844D] text-white">
                      4
                    </button>
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
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="bg-none bg-[#1A1F374A] w-full justify-items-center text-white p-2 border-none rounded-xl transition-all">
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
                </div>
              </div>
              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                      Marketing
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                      Urgent
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Monthly Product Discussion
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                      Normal
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Update New Social Media Posts
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                      Normal
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Update New Social Media Posts
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Completed */}
            <div className="flex w-85 shadow-inner shadow-green-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
              <div className="flex justify-between flex-col">
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-row items-center justify-between gap-2">
                    <FaCircle className="text-[#00E691]" />
                    <span className="text-xl font-semibold">Completed</span>
                    <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#00E691] text-white">
                      4
                    </button>
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
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button className="bg-none bg-[#1A1F374A] w-full justify-items-center text-white p-2 border-none rounded-xl transition-all">
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
                </div>
              </div>
              <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex gap-2  ">
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                      Internal
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                      Marketing
                    </button>
                    <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                      Urgent
                    </button>
                  </div>
                  <div>
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
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-base text-white mt-3">
                  Monthly Product Discussion
                </div>
                <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                  <div className="flex gap-2 text-xs text-[#72748A]">
                    <img src="/images/calendar.svg" alt="calendar" />
                    <span>Due Date 24 Jan 2023</span>
                  </div>
                  <div className="flex gap-2">
                    <img src="/images/checklist.svg" alt="Checklist" />
                    4/12
                  </div>
                </div>
                <div className="flex items-center justify-between text-[#72748A] text-sm">
                  {/* Image icons */}
                  <div>
                    {tasks.map((task, index) => (
                      <tr
                        key={task.id}
                        className=" transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/Profile/Managers/${task.id}`)
                        }
                      >
                        <td className="flex items-center py-4 text-gray-400">
                          {task.assignee.map((item, index) => (
                            <div
                              key={index}
                              className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${task.assignee.length - index}`}
                            >
                              <div className="w-[40px] h-[40px] rounded-full ">
                                <img
                                  src={item.avatar}
                                  alt={`User ${index}`}
                                  className="w-[40px] h-[40px] rounded-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/attachments.svg" alt="Attachments" />
                        <p>8</p>
                      </span>
                    </div>
                    <div>
                      <span className="flex flex-row gap-1">
                        <img src="/images/comments.svg" alt="Comments" />
                        <p>15</p>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
