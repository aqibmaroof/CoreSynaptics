"use client";
import { FaEllipsisV, FaStar, FaEdit, FaCommentDots } from "react-icons/fa";

export default function KanbanBoard() {
  const members = [
    {
      id: 1,
      name: "John Doe",
      email: "Service Appointment",
      avatar: "https://i.pravatar.cc/150?img=1",
      bgColor: "bg-purple-500/20",
    },
    {
      id: 2,
      name: "John Doe",
      email: "Service Appointment",
      avatar: "https://i.pravatar.cc/150?img=5",
      bgColor: "bg-emerald-500/20",
    },
    {
      id: 3,
      name: "John Doe",
      email: "Service Appointment",
      avatar: "https://i.pravatar.cc/150?img=3",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 4,
      name: "John Doe",
      email: "Service Appointment",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
    {
      id: 5,
      name: "John Doe",
      email: "Service Appointment",
      avatar: "https://i.pravatar.cc/150?img=4",
      bgColor: "bg-gray-500/20",
    },
  ];
  return (
    <div className="min-h-screen flex flex-row gap-2 font-gilroy p-6 text-[#101437] dark:text-white w-full">
      {/* All service appointment */}
      <div className="flex min-h-screen w-128 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-2 mt-8 rounded-2xl card">
        <div>
          <select
            className="text-xl font-bold p-1"
            name="Create Task"
            id="Create Task"
          >
            <option>All Service Appointment</option>
          </select>
        </div>
        <div className="flex items-center justify-between mx-1 mt-4 gap-1 ">
          <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.3556 17.3658C18.8279 15.8961 19.7388 13.8641 19.7388 11.6194C19.7388 7.13518 16.1036 3.5 11.6194 3.5C7.13518 3.5 3.5 7.13518 3.5 11.6194C3.5 16.1036 7.13518 19.7388 11.6194 19.7388C13.8589 19.7388 15.8866 18.8321 17.3556 17.3658ZM17.3556 17.3658L20.5 20.5"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.75 2.25V0.75M6.75 2.25C5.92157 2.25 5.25 2.92157 5.25 3.75C5.25 4.57843 5.92157 5.25 6.75 5.25M6.75 2.25C7.57843 2.25 8.25 2.92157 8.25 3.75C8.25 4.57843 7.57843 5.25 6.75 5.25M2.25 11.25C3.07843 11.25 3.75 10.5784 3.75 9.75C3.75 8.92157 3.07843 8.25 2.25 8.25M2.25 11.25C1.42157 11.25 0.75 10.5784 0.75 9.75C0.75 8.92157 1.42157 8.25 2.25 8.25M2.25 11.25V12.75M2.25 8.25V0.75M6.75 5.25V12.75M11.25 11.25C12.0784 11.25 12.75 10.5784 12.75 9.75C12.75 8.92157 12.0784 8.25 11.25 8.25M11.25 11.25C10.4216 11.25 9.75 10.5784 9.75 9.75C9.75 8.92157 10.4216 8.25 11.25 8.25M11.25 11.25V12.75M11.25 8.25V0.75"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M18.2979 5.68337C17.9179 5.75137 17.3819 5.92737 16.5219 6.21337L10.0299 8.37838C9.2019 8.65438 8.6179 8.84937 8.1979 9.01337C8.04405 9.07222 7.8932 9.13864 7.7459 9.21237C7.6599 9.25737 7.6299 9.28237 7.6279 9.28237C7.53158 9.37561 7.45499 9.48727 7.40269 9.6107C7.35038 9.73413 7.32343 9.86682 7.32343 10.0009C7.32343 10.1349 7.35038 10.2676 7.40269 10.391C7.45499 10.5145 7.53158 10.6261 7.6279 10.7194C7.66556 10.7457 7.70498 10.7694 7.7459 10.7904C7.8459 10.8434 7.9909 10.9084 8.1979 10.9904C8.6179 11.1534 9.2019 11.3484 10.0299 11.6244L10.0859 11.6434C10.3589 11.7334 10.5989 11.8134 10.8199 11.9304C11.3527 12.212 11.7882 12.6476 12.0699 13.1804C12.1869 13.4004 12.2669 13.6404 12.3569 13.9144L12.3769 13.9704C12.6519 14.7984 12.8469 15.3824 13.0109 15.8024C13.0679 15.957 13.1343 16.108 13.2099 16.2544C13.2549 16.3404 13.2799 16.3704 13.2799 16.3724C13.3731 16.4687 13.4848 16.5453 13.6082 16.5976C13.7317 16.6499 13.8643 16.6768 13.9984 16.6768C14.1325 16.6768 14.2651 16.6499 14.3886 16.5976C14.512 16.5453 14.6237 16.4687 14.7169 16.3724C14.7433 16.3347 14.767 16.2953 14.7879 16.2544C14.8409 16.1544 14.9059 16.0094 14.9879 15.8014C15.1509 15.3814 15.3459 14.7984 15.6219 13.9714L17.7849 7.48037C18.0719 6.62037 18.2479 6.08237 18.3149 5.70337L18.3199 5.68037L18.2979 5.68337ZM17.9479 3.71437C18.4979 3.61637 19.2529 3.58737 19.8329 4.16737C20.4129 4.74737 20.3829 5.50137 20.2859 6.05237C20.1899 6.59437 19.9629 7.27337 19.7079 8.03937L19.6839 8.11137L17.5199 14.6014L17.5099 14.6314C17.2459 15.4234 17.0359 16.0554 16.8509 16.5274C16.6779 16.9724 16.4729 17.4324 16.1629 17.7544C15.883 18.0456 15.5471 18.2774 15.1754 18.4357C14.8037 18.594 14.4039 18.6756 13.9999 18.6756C13.5959 18.6756 13.1961 18.594 12.8244 18.4357C12.4527 18.2774 12.1168 18.0456 11.8369 17.7544C11.5269 17.4324 11.3219 16.9724 11.1489 16.5274C10.9639 16.0554 10.7539 15.4234 10.4889 14.6304L10.4789 14.6024C10.3589 14.2414 10.3319 14.1694 10.3029 14.1144C10.209 13.9366 10.0637 13.7913 9.8859 13.6974C9.8309 13.6674 9.7589 13.6414 9.3979 13.5204L9.3699 13.5104C8.5769 13.2464 7.9449 13.0364 7.4719 12.8514C7.0279 12.6784 6.5679 12.4734 6.2459 12.1634C5.95463 11.8834 5.72289 11.5476 5.5646 11.1759C5.4063 10.8042 5.32471 10.4044 5.32471 10.0004C5.32471 9.59639 5.4063 9.19656 5.5646 8.82488C5.72289 8.45319 5.95463 8.11731 6.2459 7.83737C6.5679 7.52737 7.0279 7.32238 7.4719 7.14937C8.09958 6.91527 8.7324 6.69522 9.3699 6.48937L9.3979 6.47937L15.8889 4.31637L15.9609 4.29237C16.7269 4.03737 17.4059 3.81037 17.9479 3.71437Z"
                fill="white"
              />
            </svg>
          </button>
          <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 21"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.75 8.75H18.75M14.75 0.75V4.75M4.75 0.75V4.75M14.75 2.75H4.75C3.68913 2.75 2.67172 3.17143 1.92157 3.92157C1.17143 4.67172 0.75 5.68913 0.75 6.75V15.5C0.75 16.5609 1.17143 17.5783 1.92157 18.3284C2.67172 19.0786 3.68913 19.5 4.75 19.5H14.75C15.8109 19.5 16.8283 19.0786 17.5784 18.3284C18.3286 17.5783 18.75 16.5609 18.75 15.5V6.75C18.75 5.68913 18.3286 4.67172 17.5784 3.92157C16.8283 3.17143 15.8109 2.75 14.75 2.75Z"
                stroke="white"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <button className="bg-transparent text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.08206 13.9448C2.55306 12.9948 2.28906 12.5188 2.28906 11.9998C2.28906 11.4808 2.55306 11.0058 3.08206 10.0558L4.43006 7.62977L5.85606 5.24877C6.41506 4.31577 6.69406 3.84877 7.14306 3.58877C7.59306 3.32977 8.13606 3.32177 9.22306 3.30377L12.0001 3.25977L14.7751 3.30377C15.8631 3.32177 16.4061 3.32977 16.8551 3.58977C17.3041 3.84977 17.5851 4.31577 18.1431 5.24877L19.5701 7.62977L20.9201 10.0558C21.4481 11.0058 21.7121 11.4808 21.7121 11.9998C21.7121 12.5188 21.4481 12.9938 20.9191 13.9438L19.5701 16.3698L18.1441 18.7508C17.5851 19.6838 17.3061 20.1508 16.8571 20.4108C16.4071 20.6698 15.8641 20.6778 14.7771 20.6958L12.0001 20.7398L9.22506 20.6958C8.13706 20.6778 7.59406 20.6698 7.14506 20.4098C6.69606 20.1498 6.41506 19.6838 5.85706 18.7508L4.43006 16.3698L3.08206 13.9448Z"
                stroke="white"
                stroke-width="1.5"
              />
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke="white"
                stroke-width="1.5"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-center mt-4">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            data-slot="icon"
            aria-hidden="true"
            class="size-5"
          >
            <path
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clip-rule="evenodd"
              fill-rule="evenodd"
            />
          </svg>
          <h2 className="ml-4 mr-4">16 Feb, 2026</h2>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            data-slot="icon"
            aria-hidden="true"
            class="size-5"
          >
            <path
              d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
              fill-rule="evenodd"
            />
          </svg>
        </div>
        <div className="m-auto flex flex-col items-center justify-center">
          <img src="/images/NSA.png" alt="NSA logo" className="h-30 w-30" />
          <h2 className="font-semibold font-sora text-sm">
            No Service Appointment
          </h2>
          <h3 className="font-semibold font-sora text-xs text-[#A0AEC0]">
            Not found under selected custom view
          </h3>
        </div>
        <hr class="w-full my-3 bg-neutral-quaternary border-[#656A80]"></hr>
        <div className="flex items-center justify-between mx-2">
          <div className="flex flex-col">
            <h2 className="text-[#A0AEC0] text-sm">Total Records:</h2>
            <h3 className="text-sm font-bold">000</h3>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-[#A0AEC0] text-sm">10 records per page:</h2>
            <div className="flex items-center justify-center gap-2">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                data-slot="icon"
                aria-hidden="true"
                class="size-5"
              >
                <path
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                />
              </svg>
              <h3 className="text-sm font-bold">1</h3>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                data-slot="icon"
                aria-hidden="true"
                class="size-5"
              >
                <path
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Service Resources card */}
        <div className="flex mt-8 w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] p-4 rounded-2xl card">
          <h1 className="text-white text-2xl font-gilroy font-bold">
            Service Resource
          </h1>

          {/* Filters and Search */}
          <div className="flex items-center gap-4 mb-6 mt-6">
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
                placeholder="Search Invoices"
                className="w-full bg-transparent text-white placeholder-gray-500 pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>

            {/* Dropdown Filters */}
            <select className="w-[max-content] bg-transparent text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance hover:border-white/20 transition-colors">
              <option>Type</option>
              <option>All Projects</option>
            </select>

            <select className="bg-transparent text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
              <option>Territory</option>
              <option>Urgent</option>
            </select>

            <select className="bg-transparent text-white px-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance pr-10 hover:border-white/20 transition-colors">
              <option>Sort by</option>
              <option>Urgent</option>
            </select>

            {/* Action Button */}
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
          </div>
          {/* buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="btn px-5 text-xs bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white p-2 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
                Gantt
              </button>
              <button className="btn px-5 text-xs bg-transparent  text-[#62708D] p-2 border-2 border-white/[0.03] border-t-white/[0.09] rounded-3xl transition-all">
                Grid
              </button>
              <button className="btn  px-5 text-xs bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] text-[#62708D] p-2  rounded-3xl transition-all">
                Maps
              </button>
              <button className="btn px-5 text-xs bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] text-[#62708D] p-2  rounded-3xl transition-all">
                Calendar
              </button>
            </div>
            <div className="flex items-center justify-center">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                data-slot="icon"
                aria-hidden="true"
                class="size-5"
              >
                <path
                  d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                />
              </svg>
              <h2 className="ml-4 mr-4">16 Feb, 2026</h2>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                data-slot="icon"
                aria-hidden="true"
                class="size-5"
              >
                <path
                  d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                  fill-rule="evenodd"
                />
              </svg>
            </div>
            <div className="flex gap-2">
              <select className="bg-transparent text-white hover:bg-[#656A80] px-2 py-2 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer  hover:border-white/20 transition-colors">
                <option>Live</option>
              </select>
              <select className="bg-transparent text-white hover:bg-[#656A80] px-2 py-2 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer  hover:border-white/20 transition-colors">
                <option>Day</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-50 min-h-screen bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-2 mt-8 rounded-2xl card">
              {members.map((member) => (
                <div
                  key={member.id}
                  className={`flex mt-2 items-center justify-between w-full font-gilroy p-1 ${
                    member.isActive ? "" : "bg-transparent"
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
                      <div className="text-gray-400 text-xs flex items-center">
                        {member.email}
                        <p className="bg-[#0075FF] text-xs px-2 text-white rounded-lg w-[max-content] ">
                          2
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex mt-8 w-full bg-transparent border-3 border-white/[0.03] border-t-white/[0.09] p-4 rounded-2xl card">
              <hr class="w-full  bg-neutral-quaternary border-[#656A80]"></hr>
              <div className="flex items-center justify-between">
                <h2>Mon 15</h2>
                <h2>Tue 16</h2>
                <h2>Wed 17</h2>
                <h2>Thu 18</h2>
                <h2>Fri 19</h2>
                <h2>Sat 20</h2>
                <h2>Sun 21</h2>
              </div>
              <hr class="w-full  bg-neutral-quaternary border-[#656A80]"></hr>

              <div>
                <div className="absolute ml-5 mt-10 flex w-38  bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
                  <h2 className="font-medium text-sm font-geist">SA - 533</h2>
                  <div className="flex gap-2 items-center mt-1">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.04053 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M6.08105 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1.33008 3.45508H7.79121"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.98133 3.23041V6.46097C7.98133 7.60117 7.41123 8.36131 6.081 8.36131H3.04047C1.71024 8.36131 1.14014 7.60117 1.14014 6.46097V3.23041C1.14014 2.09021 1.71024 1.33008 3.04047 1.33008H6.081C7.41123 1.33008 7.98133 2.09021 7.98133 3.23041Z"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 5.20663H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 6.34726H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 5.20663H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 6.34726H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 5.20663H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 6.34726H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <h2 className="text-[#A0AEC0]">Nov 12, 2024</h2>
                  </div>
                  <div className="px-3.5 mt-2 py-1.5 w-14 rounded-full text-xs font-medium bg-[#FF6637] text-white">
                    <span>High</span>
                  </div>
                </div>

                <div className="absolute ml-55 mt-20 flex w-38  bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
                  <h2 className="font-medium text-sm font-geist">SA - 533</h2>
                  <div className="flex gap-2 items-center mt-1">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.04053 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M6.08105 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1.33008 3.45508H7.79121"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.98133 3.23041V6.46097C7.98133 7.60117 7.41123 8.36131 6.081 8.36131H3.04047C1.71024 8.36131 1.14014 7.60117 1.14014 6.46097V3.23041C1.14014 2.09021 1.71024 1.33008 3.04047 1.33008H6.081C7.41123 1.33008 7.98133 2.09021 7.98133 3.23041Z"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 5.20663H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 6.34726H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 5.20663H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 6.34726H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 5.20663H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 6.34726H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <h2 className="text-[#A0AEC0]">Nov 12, 2024</h2>
                  </div>
                  <div className="px-3.5 mt-2 py-1.5 w-14 rounded-full text-xs font-medium bg-[#FF6637] text-white">
                    <span>High</span>
                  </div>
                </div>

                <div className="absolute ml-22 mt-70 flex w-48  bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
                  <h2 className="font-medium text-sm font-geist">SA - 533</h2>
                  <div className="flex gap-2 items-center mt-1">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.04053 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M6.08105 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1.33008 3.45508H7.79121"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.98133 3.23041V6.46097C7.98133 7.60117 7.41123 8.36131 6.081 8.36131H3.04047C1.71024 8.36131 1.14014 7.60117 1.14014 6.46097V3.23041C1.14014 2.09021 1.71024 1.33008 3.04047 1.33008H6.081C7.41123 1.33008 7.98133 2.09021 7.98133 3.23041Z"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 5.20663H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 6.34726H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 5.20663H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 6.34726H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 5.20663H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 6.34726H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <h2 className="text-[#A0AEC0]">Nov 12, 2024</h2>
                  </div>
                  <div className="px-3.5 mt-2 py-1.5 w-17 rounded-full text-xs font-medium bg-[#0075F8] text-white">
                    <span>Medium</span>
                  </div>
                </div>

                <div className="absolute ml-75 mt-120 flex w-42  bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-3  rounded-3xl card">
                  <h2 className="font-medium text-sm font-geist">SA - 533</h2>
                  <div className="flex gap-2 items-center mt-1">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.04053 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M6.08105 0.759766V1.89996"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M1.33008 3.45508H7.79121"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.98133 3.23041V6.46097C7.98133 7.60117 7.41123 8.36131 6.081 8.36131H3.04047C1.71024 8.36131 1.14014 7.60117 1.14014 6.46097V3.23041C1.14014 2.09021 1.71024 1.33008 3.04047 1.33008H6.081C7.41123 1.33008 7.98133 2.09021 7.98133 3.23041Z"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 5.20663H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M5.9648 6.34726H5.96821"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 5.20663H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M4.55904 6.34726H4.56245"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 5.20663H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.1523 6.34726H3.15571"
                        stroke="#A0AEC0"
                        stroke-width="0.74113"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>

                    <h2 className="text-[#A0AEC0]">Nov 12, 2024</h2>
                  </div>
                  <div className="px-3.5 mt-2 py-1.5 w-14 rounded-full text-xs font-medium bg-[#FF6637] text-white">
                    <span>High</span>
                  </div>
                </div>

                {/* Vertical lines */}
                <div className="flex items-center justify-between">
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                  <div class="inline-block min-h-screen w-0.5 self-stretch bg-[#56577A] dark:bg-white/10"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
