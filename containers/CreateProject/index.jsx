"use client";
import { useRouter } from "next/navigation";

export default function KanbanBoard() {
  const router = useRouter();

  return (
    <div className="min-h-screen font-gilroy p-6 text-[#101437] font-gilroy dark:text-white">
      <h1 className="font-bold font-gilroy text-2xl text-[#A0AEC0]">
        Project Name
      </h1>
      <div className="w-100  font-gilroy mt-6 mb-6 text-[#A0AEC0]">
        <div className="flex justify-left gap-14 items-center">
          <h2>Project Status:</h2>
          <input
            className="text-lg text-[#656A80] font-[600] "
            type="text"
            placeholder="Empty"
          />
        </div>
        <div className="flex items-center justify-left gap-24 mt-3">
          <span class="text-slate-400">Progress:</span>
          <div className="flex items-center gap-2">
            <span class="text-sm text-[#656A80]">0%</span>
            <progress
              className="progress progress-[#656A80] w-56"
              value={0}
              max="100"
            ></progress>
          </div>
        </div>
        <div className="flex justify-left gap-27 items-center mt-3">
          <h2>Dates:</h2>
          <div class="relative max-w-sm">
            <div class="absolute inset-y-0 start-0 flex items-center "></div>
            <input
              className="text-lg font-semibold appearance-none"
              datepicker
              id="default-datepicker"
              type="text"
              class="block pl-1 bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body"
              placeholder="Select Calender"
            ></input>
          </div>
        </div>
        <div className="flex justify-left gap-8 items-center mt-3">
          <h2>Project Manager:</h2>
          <select className="bg-transparent text-[18px] font-[600] text-[#656A80] rounded-2xl border-none focus:outline-none appearance-none">
            <option>Select Project Manager</option>
            <option>All Projects</option>
          </select>
        </div>
        <div className="flex justify-left gap-10 items-center mt-3">
          <h2>Team Members:</h2>
          <button class="flex items-center justify-center w-[129px] text-white text-[18.82px] font-[600] bg-transparent font-gilroy border-3 border-white/[0.03] border-t-white/[0.09] px-2 py-1 mt-2 rounded-3xl">
            <span className="text-3xl font-normal">+</span> &nbsp; Invite
          </button>
        </div>
      </div>
      {/* Task List */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-white mt-5 ml-4 text-2xl font-bold">
            Task Views
          </h1>
          <div className="flex items-center gap-5">
            <button
              onClick={() => router.push("/ProjectDetails")}
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
        <div className="justify-center text-center">
          <figure>
            <img src="/images/add_task.png" alt="Add Task" />
          </figure>
          <h2 className="text-xl font-bold font-sora mt-2">Empty Task</h2>
          <h2 className="text-base font-sora mt-2">
            Let’s add your first task now
          </h2>
          <button
            onClick={() => router.push("/CreateProject")}
            className="mt-5 bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-2 border-none rounded-xl transition-all"
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
        </div>
      </div>
    </div>
  );
}
