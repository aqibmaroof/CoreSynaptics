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
    <div className="min-h-screen  p-6 text-white">
      <div className="flex items-center gap-16 md:gap-8 justify-between mx-3">
        <div className="flex items-center gap-2 md:gap-4">
          <p className="text-xl md:text-2xl font-bold">
            Design Homepage layout
          </p>
          <div className="flex items-center justify-between gap-2 md:gap-6">
            <img src="/images/line-md_link.svg" alt="line-md_link" />
            <img
              src="/images/mingcute_attachment-2-line.svg"
              alt="line-md_link"
            />
            <img src="/images/mage_message-dots-round.svg" alt="line-md_link" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <progress
            className="progress progress-accent w-30 md:w-56 ml-2"
            value="80"
            max="100"
          ></progress>
          <span className="text-xs md:text-sm">80%</span>
        </div>
      </div>
      {/* Create Task */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-2xl card">
        <div>
          <select
            className="text-xl md:text-2xl font-bold"
            name="Create Task"
            id="Create Task"
          >
            <option>Create Task</option>
          </select>
        </div>
        <div className="w-full flex flex-row gap-4 mt-8 mx-2">
          <div>
            <p className="text-sm md:text-base">Task Name</p>
            <input
              type="text"
              placeholder="Enter task name"
              className="w-48 md:w-[470px] text-sm md:text-base bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <p className="text-sm md:text-base">Project</p>
            <select
              className="w-48 md:w-[470px] text-sm md:text-base bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              name="Create Task"
              id="Create Task"
            >
              <option>Explore Zoho Projects</option>
            </select>
          </div>
        </div>
        <div className="mt-8">
          <h2>Task Description</h2>
          <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-2 border-white/3 border-t p-6 mt-2 rounded-2xl card">
            <div className="flex items-center justify-between space-x-1 rtl:space-x-reverse flex-wrap">
              <div className="flex items-center space-x-1 rtl:space-x-reverse flex-wrap">
                <button
                  id="toggleBoldButton"
                  data-tooltip-target="tooltip-bold"
                  type="button"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5h4.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0-7H6m2 7h6.5a3.5 3.5 0 1 1 0 7H8m0-7v7m0 0H6"
                    />
                  </svg>
                  <span className="sr-only">Bold</span>
                </button>
                <div
                  id="tooltip-bold"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Toggle bold
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button
                  id="toggleItalicButton"
                  data-tooltip-target="tooltip-italic"
                  type="button"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m8.874 19 6.143-14M6 19h6.33m-.66-14H18"
                    />
                  </svg>
                  <span className="sr-only">Italic</span>
                </button>
                <div
                  id="tooltip-italic"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Toggle italic
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button
                  id="toggleUnderlineButton"
                  data-tooltip-target="tooltip-underline"
                  type="button"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M6 19h12M8 5v9a4 4 0 0 0 8 0V5M6 5h4m4 0h4"
                    />
                  </svg>
                  <span className="sr-only">Underline</span>
                </button>
                <button
                  id="toggleTextSizeButton"
                  data-dropdown-toggle="textSizeDropdown"
                  type="button"
                  data-tooltip-target="tooltip-text-size"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3"
                    />
                  </svg>
                  <span className="sr-only">Text size</span>
                </button>
                <div
                  id="tooltip-text-size"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Text size
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>

              <div
                id="textSizeDropdown"
                className="z-10 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-72"
              >
                <ul
                  className="p-2 space-y-1 text-sm text-body font-medium"
                  aria-labelledby="toggleTextSizeButton"
                >
                  <li>
                    <button
                      data-text-size="16px"
                      type="button"
                      className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded text-sm"
                    >
                      16px (Default)
                    </button>
                  </li>
                  <li>
                    <button
                      data-text-size="12px"
                      type="button"
                      className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded text-xs"
                    >
                      12px (Tiny)
                    </button>
                  </li>
                  <li>
                    <button
                      data-text-size="14px"
                      type="button"
                      className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded text-sm"
                    >
                      14px (Small)
                    </button>
                  </li>
                  <li>
                    <button
                      data-text-size="18px"
                      type="button"
                      className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded text-lg"
                    >
                      18px (Lead)
                    </button>
                  </li>
                  <li>
                    <button
                      data-text-size="24px"
                      type="button"
                      className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded text-2xl"
                    >
                      24px (Large)
                    </button>
                  </li>
                  <li>
                    <button
                      data-text-size="36px"
                      type="button"
                      className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded text-4xl"
                    >
                      36px (Huge)
                    </button>
                  </li>
                </ul>
              </div>

              <div className="flex items-center space-x-1 rtl:space-x-reverse flex-wrap">
                <button
                  id="toggleLeftAlignButton"
                  type="button"
                  data-tooltip-target="tooltip-left-align"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 6h8m-8 4h12M6 14h8m-8 4h12"
                    />
                  </svg>
                  <span className="sr-only">Align left</span>
                </button>
                <div
                  id="tooltip-left-align"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Align left
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button
                  id="toggleCenterAlignButton"
                  type="button"
                  data-tooltip-target="tooltip-center-align"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 6h8M6 10h12M8 14h8M6 18h12"
                    />
                  </svg>
                  <span className="sr-only">Align center</span>
                </button>
                <div
                  id="tooltip-center-align"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Align center
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button
                  id="toggleRightAlignButton"
                  type="button"
                  data-tooltip-target="tooltip-right-align"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 6h-8m8 4H6m12 4h-8m8 4H6"
                    />
                  </svg>
                  <span className="sr-only">Align right</span>
                </button>
                <div
                  id="tooltip-right-align"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Align right
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>

              <div className="flex items-center space-x-1 rtl:space-x-reverse flex-wrap">
                <button
                  id="toggleListButton"
                  type="button"
                  data-tooltip-target="tooltip-list"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                      d="M9 8h10M9 12h10M9 16h10M4.99 8H5m-.02 4h.01m0 4H5"
                    />
                  </svg>
                  <span className="sr-only">Toggle list</span>
                </button>
                <div
                  id="tooltip-list"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Toggle list
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>

              <div className="flex items-center space-x-1 rtl:space-x-reverse flex-wrap">
                <button
                  id="addImageButton"
                  type="button"
                  data-tooltip-target="tooltip-image"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M13 10a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H14a1 1 0 0 1-1-1Z"
                      clip-rule="evenodd"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12c0 .556-.227 1.06-.593 1.422A.999.999 0 0 1 20.5 20H4a2.002 2.002 0 0 1-2-2V6Zm6.892 12 3.833-5.356-3.99-4.322a1 1 0 0 0-1.549.097L4 12.879V6h16v9.95l-3.257-3.619a1 1 0 0 0-1.557.088L11.2 18H8.892Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">Add image</span>
                </button>
                <div
                  id="tooltip-image"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Add image
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
                <button
                  id="toggleLinkButton"
                  data-tooltip-target="tooltip-link"
                  type="button"
                  className="p-1.5 text-body rounded-sm cursor-pointer hover:text-heading hover:bg-neutral-quaternary"
                >
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.213 9.787a3.391 3.391 0 0 0-4.795 0l-3.425 3.426a3.39 3.39 0 0 0 4.795 4.794l.321-.304m-.321-4.49a3.39 3.39 0 0 0 4.795 0l3.424-3.426a3.39 3.39 0 0 0-4.794-4.795l-1.028.961"
                    />
                  </svg>
                  <span className="sr-only">Link</span>
                </button>
                <div
                  id="tooltip-link"
                  role="tooltip"
                  className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-dark-strong rounded-base shadow-xs opacity-0 tooltip"
                >
                  Add link
                  <div className="tooltip-arrow" data-popper-arrow></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl md:text-3xl mt-4">
                Welcome to CoreSynaptics
              </h3>
              <p className="text-sm md:text-base mt-4">
                Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                massa mi. Aliquam in hendrerit urna. Pellentesque sit amet
                sapien.
              </p>
              <ul className="list-disc pl-5 mt-4 ml-2 text-sm md:text-base">
                <li>Lorem ipsum dolor sit amet consectetur adipiscing.</li>
                <li>Lorem ipsum dolor sit amet consectetur adipiscing.</li>
                <li>Lorem ipsum dolor sit amet consectetur adipiscing.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Task Information */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-2xl card">
        <div>
          <select
            className="text-xl md:text-2xl font-bold"
            name="Create Task"
            id="Create Task"
          >
            <option>Task Information</option>
          </select>
        </div>
        <div className="w-full flex flex-row gap-4 mt-8 mx-2">
          <div>
            <p className="text-sm md:text-base">Task Name</p>
            <input
              type="text"
              placeholder="Enter task name"
              className="w-48 md:w-[470px] text-sm md:text-base bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <p className="text-sm md:text-base">Project</p>
            <select
              className="w-48 md:w-[470px] text-sm md:text-base bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              name="Create Task"
              id="Create Task"
            >
              <option>Explore Zoho Projects</option>
            </select>
          </div>
        </div>
        <div className="flex flex-row md:flex-row gap-4 w-full items-center justify-between mt-4">
          <div className="w-full">
            <h1 className="mt-3 text-sm md:text-base mb-3">Date:</h1>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="p-3 w-full flex items-center justify-between border-3 bg-transparent shadow-none rounded-2xl border-white/[0.04] border-t-white/[0.1] text-white"
              >
                <span className="font-normal">
                  Feb 01, 2026 {"->"} Feb 11, 2026
                </span>
                <img src={"/images/calendar_1.svg"} />
              </div>
            </div>
          </div>
          <div className="w-full">
            <h1 className="mt-3 text-sm md:text-base mb-3">Tasks Status:</h1>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="p-3 w-full flex items-center justify-between border-3 bg-transparent shadow-none rounded-2xl border-white/[0.04] border-t-white/[0.1] text-white"
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
            <h1 className="mt-3 text-sm md:text-base mb-3">Priority:</h1>
            <div className="dropdown dropdown-bottom w-full">
              <div
                tabIndex={0}
                role="button"
                className="p-3 w-full flex items-center justify-between border-3 bg-transparent shadow-none rounded-2xl border-white/[0.04] border-t-white/[0.1] text-white"
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
        <div className="flex flex-col w-full mt-4">
          <p>Tags</p>
          <input
            type="text"
            placeholder="Enter task name"
            className=" bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-2.5 mt-1 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <h2>Assignee</h2>
          <div className="flex flex-row items-center justify-center gap-2 ml-8">
            {members.slice(0, 1).map((member) => (
              <div
                key={member.id}
                className={`flex items-center h-8 justify-between w-34 font-geist border border-[#656A80] rounded-2xl ${
                  member.isActive
                    ? "bg-emerald-600/30 border border-emerald-500/50"
                    : "bg-[#575975]"
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
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-medium bg-[#454A62] rounded-2xl h-8 font-semibold text-white border border-[#656A80] hover:bg-slate-700">
            + Invite
          </button>
        </div>
      </div>
      {/* Comments/Sub-task */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy  mt-8 rounded-2xl card">
        <div className="flex items-center text-base md:text-lg gap-4 border-b-[0.5px] border-[#E5E5EC6E] px-6 pt-6">
          <h3 className="text-[#5B5A64] font-medium">Comments</h3>
          <h3 className="border-b-2 border-[#00E691] text-white font-medium">
            Sub Task
          </h3>
          <h3 className="text-[#5B5A64] font-medium">Documents</h3>
          <h3 className="text-[#5B5A64] font-medium">Issues</h3>
          <h3 className="text-[#5B5A64] font-medium">Activities</h3>
        </div>
        <div className="flex items-center justify-between px-6 mt-6">
          <p className="text-sm md:text-base">Our Design Process</p>
          <CircularProgress value={60} label="Progress" />
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                className="checkbox checkbox-xs md:checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
              />
              <h3 className="text-sm md:text-base">
                Research and Gather Inspiration
              </h3>
            </div>
            <div>
              <img src="/images/move_icon.svg" alt="Move Icon" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                className="checkbox checkbox-xs md:checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
              />
              <h3 className="text-sm md:text-base">
                Define Ad Content and Copy
              </h3>
            </div>
            <div>
              <img src="/images/move_icon.svg" alt="Move Icon" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                className="checkbox checkbox-xs md:checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
              />
              <h3 className="text-sm md:text-base">Design Ad Templates</h3>
            </div>
            <div>
              <img src="/images/move_icon.svg" alt="Move Icon" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                className="checkbox checkbox-xs md:checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
              />
              <h3 className="text-sm md:text-base">Review and Iterate</h3>
            </div>
            <div>
              <img src="/images/move_icon.svg" alt="Move Icon" />
            </div>
          </div>
          <div className="flex items-center text-sm justify-between mt-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                className="checkbox checkbox-xs md:checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
              />
              <h3 className="text-sm md:text-base">
                Finalize and Deliver Assets
              </h3>
            </div>
            <div>
              <img src="/images/move_icon.svg" alt="Move Icon" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
