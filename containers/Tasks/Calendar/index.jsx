"use client";
import { FaCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import CircularProgress from "@/Utils/CustomProgress";

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

  return (
    <div className="min-h-screen  p-6 text-[#101437] dark:text-white">
      <h1 className="font-bold text-2xl">Task overveiw</h1>
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex items-center justify-left gap-10 w-full ">
          <p className="text-7xl font-bold font-gilroy">80</p>
          <div className="flex flex-col items-start justify-end text-xl w-30">
            <p>
              Total <br />
              Tasks
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-10 w-full">
          <p className="text-6xl font-bold text-7xl">15</p>
          <div className="flex flex-col items-right justify-end text-xl w-40">
            <p>
              Tasks Due <br />
              Today
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-10 w-full">
          <p className="text-6xl font-bold text-7xl">20</p>
          <div className="flex flex-col items-start justify-end text-xl">
            <p>
              Overdue <br />
              Tasks
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-10 w-full">
          <p className="text-6xl font-bold text-7xl">150</p>
          <div className="flex flex-col items-start justify-end text-right text-xl">
            <p>
              Tasks <br />
              Completed
            </p>
          </div>
        </div>
      </div>
      {/* Tasks Calendar View */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-white ml-4 text-2xl font-bold">Task Views</h1>
            {/* List view button */}
            <button
              onClick={() => router.push("/Tasks/List")}
              className="font-[500] w-[max-content] text-white border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
            >
              <span className="h-8 w-20 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center">
                <img src="/images/list.png" alt="Vector" className="h-3 w-3" />
                List
              </span>
            </button>

            <button
              onClick={() => router.push("/Tasks/Kanban")}
              className="font-[500] w-[max-content] text-white border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
            >
              <span className="h-8 w-30 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center">
                <img
                  src="/images/kanban.png"
                  alt="Vector"
                  className="h-3 w-3"
                />
                Kanban
              </span>
            </button>

            <button
              onClick={() => router.push("/Tasks/Calendar")}
              className="font-[500] w-[max-content] text-white border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
            >
              <span className="h-8 w-40 flex items-center justify-center rounded-3xl bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] flex flex-row gap-2 items-center">
                <img
                  src="/images/calender_selected.svg"
                  alt="Vector"
                  className="h-3 w-3"
                />
                Calender
              </span>
            </button>

            {/* calendar view button */}
          </div>
          {/* Add new button */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => document.getElementById("my_modal_4").showModal()}
              className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white py-2 px-4 border-none rounded-xl transition-all cursor-pointer"
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
        <div className="flex items-center gap-1 mb-6 ml-4">
          <h1 className="text-white text-2xl font-bold mr-2">October 2026</h1>
          <button className="bg-transparent text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none">
            Day
          </button>
          <button className="bg-[#656A80] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none">
            Week
          </button>
          <button className="bg-transparent text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none">
            Month
          </button>
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
        </div>
        {/* calnedar view */}
        <div className=" ml-4">
          <hr className="h-px  bg-[#656A80] border-0"></hr>
          <div className="flex items-center justify-between mx-14 mt-4">
            <h1 className="text-lg ">
              MON <span className="font-medium">15</span>
            </h1>
            <h1 className="text-lg ">
              TUE <span className="font-medium">16</span>
            </h1>
            <h1 className="text-lg ">
              WED <span className="font-medium">17</span>
            </h1>
            <h1 className="text-lg ">
              THU <span className="font-medium">18</span>
            </h1>
            <h1 className="text-lg ">
              FRI <span className="font-medium">19</span>
            </h1>
            <h1 className="text-lg ">
              SAT <span className="font-medium">20</span>
            </h1>
            <h1 className="text-lg ">
              SUN <span className="font-medium">21</span>
            </h1>
          </div>
          <hr className="h-px bg-[#656A80] border-0 mt-4"></hr>
          {/* cards */}
          <div className="absolute ml-10 mt-20 flex w-70 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
            <div className="flex flex-col  justify-between">
              <div className="flex items-center justify-between ">
                <h2 className="font-medium text-sm font-geist">
                  Conduct Client Meeting
                </h2>
                <div className="flex flex-col">
                  <CircularProgress value={60} label="Progress" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#A0AEC0]">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span>Nov 12, 2024</span>
                <svg
                  className="w-5 h-5 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span>12</span>
              </div>

              <div className="flex gap-2 mt-2 items-center ">
                <button className="px-2 py-1 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#44444A] bg-[#FEF6F5]">
                  <FaCircle className="text-[#44444A]" />
                  <span className="text-sm font-semibold">Todo</span>
                </button>
                <button className="px-2 py-1 mr-3 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#C65468] bg-[#FEF6F5]">
                  <FaCircle className="text-[#C65468]" />
                  <span className="text-sm font-semibold">Urgent</span>
                </button>
                <div className="flex ml-6">
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3"></button>
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3 -ml-4"></button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute ml-110 mt-20 flex w-75 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
            <div className="flex flex-col  justify-between">
              <div className="flex items-center justify-between ">
                <h2 className="font-medium text-sm font-geist">
                  Finalize Project Proposal
                </h2>
                <CircularProgress value={60} label="Progress" />
              </div>
              <div className="flex items-center gap-2 text-[#A0AEC0]">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span>Nov 12, 2024</span>
                <svg
                  className="w-5 h-5 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span>12</span>
              </div>

              <div className="flex gap-2 mt-2 items-center ">
                <button className="px-2 py-1 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#4D81E7] bg-[#FEF6F5]">
                  <FaCircle className="text-[#4D81E7]" />
                  <span className="text-sm font-semibold">Inprogress</span>
                </button>
                <button className="px-2 py-1 mr-3 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#E7844D] bg-[#FEF6F5]">
                  <FaCircle className="text-[#E7844D]" />
                  <span className="text-sm font-semibold">Normal</span>
                </button>
                <div className="flex ml-3">
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3"></button>
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3 -ml-4"></button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute ml-55 mt-80 flex w-75 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3 rounded-3xl card">
            <div className="flex flex-col  justify-between">
              <div className="flex items-center justify-between ">
                <h2 className="font-medium text-sm font-geist">
                  Write Email Copy
                </h2>
                <div className="flex flex-col">
                  <CircularProgress value={60} label="Progress" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#A0AEC0]">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span>Nov 12, 2024</span>
                <svg
                  className="w-5 h-5 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span>12</span>
              </div>

              <div className="flex gap-2 mt-2 items-center ">
                <button className="px-2 py-1 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#44444A] bg-[#FEF6F5]">
                  <FaCircle className="text-[#44444A]" />
                  <span className="text-sm font-semibold">Todo</span>
                </button>
                <button className="px-2 py-1 mr-3 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#C65468] bg-[#FEF6F5]">
                  <FaCircle className="text-[#C65468]" />
                  <span className="text-sm font-semibold">Urgent</span>
                </button>
                <div className="flex ml-10">
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3"></button>
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3 -ml-4"></button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute ml-160 mt-80 flex w-75 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3 rounded-3xl card">
            <div className="flex flex-col  justify-between">
              <div className="flex items-center justify-between ">
                <h2 className="font-medium text-sm font-geist">
                  Write Email Copy
                </h2>
                <CircularProgress value={60} label="Progress" />
              </div>
              <div className="flex items-center gap-2 text-[#A0AEC0]">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span>Nov 12, 2024</span>
                <svg
                  className="w-5 h-5 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span>12</span>
              </div>

              <div className="flex gap-2 mt-2 items-center ">
                <button className="px-2 py-1 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#44444A] bg-[#FEF6F5]">
                  <FaCircle className="text-[#44444A]" />
                  <span className="text-sm font-semibold">Todo</span>
                </button>
                <button className="px-2 py-1 mr-3 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#C65468] bg-[#FEF6F5]">
                  <FaCircle className="text-[#C65468]" />
                  <span className="text-sm font-semibold">Urgent</span>
                </button>
                <div className="flex ml-10">
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3"></button>
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3 -ml-4"></button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute ml-2 flex w-75 mt-140 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
            <div className="flex flex-col  justify-between">
              <div className="flex items-center justify-between ">
                <h2 className="font-medium text-sm font-geist">
                  Finalize Project Proposal
                </h2>
                <CircularProgress value={60} label="Progress" />
              </div>
              <div className="flex items-center gap-2 text-[#A0AEC0]">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span>Nov 12, 2024</span>
                <svg
                  className="w-5 h-5 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span>12</span>
              </div>

              <div className="flex gap-2 mt-2 items-center ">
                <button className="px-2 py-1 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#4D81E7] bg-[#FEF6F5]">
                  <FaCircle className="text-[#4D81E7]" />
                  <span className="text-sm font-semibold">Inprogress</span>
                </button>
                <button className="px-2 py-1 mr-3 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#E7844D] bg-[#FEF6F5]">
                  <FaCircle className="text-[#E7844D]" />
                  <span className="text-sm font-semibold">Normal</span>
                </button>
                <div className="flex ml-3">
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3"></button>
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3 -ml-4"></button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute ml-110 flex w-85 mt-140 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
            <div className="flex flex-col  justify-between">
              <div className="flex items-center justify-between ">
                <h2 className="font-medium text-sm font-geist">
                  Conduct Client Meeting
                </h2>
                <CircularProgress value={100} label="Progress" />
              </div>
              <div className="flex items-center gap-2 text-[#A0AEC0]">
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
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                <span>Nov 12, 2024</span>
                <svg
                  className="w-5 h-5 ml-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                <span>12</span>
              </div>

              <div className="flex gap-2 mt-2 items-center ">
                <button className="px-2 py-1 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#00E691] bg-[#FEF6F5]">
                  <FaCircle className="text-[#00E691]" />
                  <span className="text-sm font-semibold">Completed</span>
                </button>
                <button className="px-2 py-1 mr-3 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#C65468] bg-[#E0F7EC]">
                  <FaCircle className="text-[#C65468]" />
                  <span className="text-sm font-semibold">Urgent</span>
                </button>
                <div className="flex ml-10">
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3"></button>
                  <button className="w-8 h-8 rounded-full bg-[#D9D9D9] border-3 -ml-4"></button>
                </div>
              </div>
            </div>
          </div>
          {/* Vertical lines */}
          <div className="flex items-center justify-between mx-8">
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
            <div class="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-[#56577A] dark:bg-white/10 mt-4"></div>
          </div>
        </div>
      </div>
      {/* Popup box */}
      <dialog id="my_modal_4" className="modal ">
        <div className="modal-box pt-0 px-0 w-[1000px] h-[850px] border border-[#656A80] backdrop-blur-2xl bg-transparent scrollbar-hide">
          <div className="modal-action flex items-center justify-between pt-0 px-4">
            <div>
              <h3 className="font-bold text-lg">New Task</h3>
            </div>
            <form method="dialog" className="gap-2 flex">
              <button
                onClick={() => router.push("/Tasks/CreateTask")}
                className="size-9 rounded-xl hover:bg-gray-300 flex items-center justify-center border border-white bg-[#656A80]"
              >
                <img src="/images/maximize.svg" alt="Maximize" />
              </button>
              <button className="size-9 rounded-xl hover:bg-gray-300 flex items-center justify-center border border-white bg-[#FB5874]">
                <img src="/images/close.svg" alt="Close" />
              </button>
            </form>
          </div>
          <hr class="w-full my-3 bg-neutral-quaternary border-[#656A80]"></hr>
          <div className="px-4">
            <div className="mt-4">
              <p>Task Name</p>
              <input
                type="text"
                placeholder="Enter Task Name"
                className="w-full bg-transparent text-white placeholder-gray-500 mt-1 pl-4 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <div className="mt-4">
              <p>Date</p>
              <div class="relative">
                <div class="absolute right-4 inset-y-0 flex items-center ps-3 pointer-events-none">
                  <img src="/images/calendar_1.svg" alt="Calendar" />
                </div>
                <input
                  datepicker
                  id="default-datepicker"
                  type="text"
                  className="block w-full pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 text-md px-3 focus:border-white/20 focus:outline-none placeholder:text-body"
                  placeholder="Select date"
                />
              </div>
            </div>
            <div className="flex flex-row gap-4 w-full mt-4">
              <div>
                <p>Tasks Status:</p>

                <details className="dropdown ">
                  <summary className="btn m-1 w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors">
                    open or close
                  </summary>
                  <ul className="menu dropdown-content bg-transparent w-56 pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors">
                    <li className="px-2 py-1 mr-3 gap-2 text-xs flex items-center justify-between font-medium rounded-3xl text-[#C65468] bg-[#FEF6F5]">
                      <FaCircle className="text-[#C65468]" />
                      <a>Item 1</a>
                    </li>
                    <li>
                      <a>Item 2</a>
                    </li>
                  </ul>
                </details>
              </div>
              <div>
                <p>Priority:</p>
                <input
                  type="text"
                  placeholder="Select"
                  className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-2 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="mt-4">
              <p>Task Description</p>
              <textarea
                id="comment"
                name="Description"
                rows="2"
                placeholder="Enter Tasks Description"
                className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-3 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <h2>Priority:</h2>
              <div className="flex flex-row items-center gap-2">
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
              <button className="btn btn-medium bg-[#454A62] rounded-2xl h-8 font-semibold text-white border border-[#656A80] hover:bg-slate-700">
                + Invite
              </button>
            </div>
            <div className="mt-4">
              <p>Attach Files</p>
              <div className="flex items-center justify-center w-full mt-1">
                <label
                  for="dropzone-file"
                  class="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-2 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors cursor-pointer hover:bg-neutral-tertiary-medium"
                >
                  <div class="flex flex-col items-center justify-center text-body pt-5 pb-6">
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 30 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.1041 20.9724V13.5703L8.63672 16.0377"
                        stroke="#0075FF"
                        stroke-width="1.85053"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M11.1016 13.5703L13.5689 16.0377"
                        stroke="#0075FF"
                        stroke-width="1.85053"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M27.1425 12.3373V18.5057C27.1425 24.6741 24.6751 27.1415 18.5067 27.1415H11.1046C4.93612 27.1415 2.46875 24.6741 2.46875 18.5057V11.1036C2.46875 4.93515 4.93612 2.46777 11.1046 2.46777H17.273"
                        stroke="#0075FF"
                        stroke-width="1.85053"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M27.1429 12.3373H22.2082C18.5071 12.3373 17.2734 11.1036 17.2734 7.40252V2.46777L27.1429 12.3373Z"
                        stroke="#0075FF"
                        stroke-width="1.85053"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <p class="mb-2 text-sm">
                      Drag here or upload from directory
                    </p>
                  </div>
                  <input id="dropzone-file" type="file" class="hidden" />
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4 px-4">
            <h3 className="font-bold text-lg mt-2">Sub Tasks</h3>
            <div className="mt-3">
              <p>Sub Task 1</p>
              <input
                type="text"
                placeholder="Enter Task Name"
                className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-4 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <button className="bg-gradient-to-r from-[#080C26] to-[#00E691] text-white p-2 px-4 mt-4 border-none rounded-xl transition-all">
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
          </div>
          <hr class="w-full mt-3 bg-neutral-quaternary border-[#656A80]"></hr>
          <div className="flex items-center justify-end gap-2 mr-4">
            <button className="btn mt-5 backdrop-blur-md text-white p-3 bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all">
              <div className="flex flex-row gap-2">
                <span className="flex flex-row gap-2 items-center">Cancel</span>
              </div>
            </button>
            <button className="btn mt-5 bg-gradient-to-r from-[#0075F8] to-[#00387A] text-white p-4 border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all">
              <div className="flex flex-row gap-2">
                <span className="flex flex-row gap-2 items-center">Save</span>
              </div>
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
