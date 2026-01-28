"use client";

import { useState } from "react";

export default function KanbanBoard() {
  const [columns, setColumns] = useState({
    inProgress: [
      {
        id: 1,
        title: "Research FAQ page UX",
        tag: "UX",
        tagColor: "success",
        attachments: 2,
        comments: 1,
        avatars: ["/images/profile.jpg", "/images/profile.jpg"],
      },
      {
        id: 2,
        title: "Review JavaScript code",
        tag: "Code Review",
        tagColor: "error",
        attachments: 2,
        comments: 4,
        avatars: [
          "/images/profile.jpg",
          "/images/profile.jpg",
          "/images/profile.jpg",
        ],
      },
    ],
    inReview: [
      {
        id: 3,
        title: "Review completed Apps",
        tag: "Dashboard",
        tagColor: "info",
        attachments: 5,
        comments: 10,
        avatars: ["/images/profile.jpg", "/images/profile.jpg"],
      },
      {
        id: 4,
        title: "Find new images for pages",
        tag: "Image",
        tagColor: "warning",
        attachments: 5,
        comments: 4,
        image: "/images/plan.png",
        avatars: ["/images/profile.jpg", "/images/profile.jpg"],
      },
    ],
    done: [
      {
        id: 5,
        title: "Forms & tables section",
        tag: "App",
        tagColor: "ghost",
        attachments: 7,
        comments: 2,
        avatars: ["/images/profile.jpg", "/images/profile.jpg"],
      },
      {
        id: 6,
        title: "Completed charts & maps",
        tag: "Charts & Maps",
        tagColor: "secondary",
        attachments: 1,
        comments: 10,
        avatars: ["/images/profile.jpg", "/images/profile.jpg"],
      },
    ],
  });

  const renderCard = (item) => (
    <div
      key={item.id}
      className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-2 rounded-3xl card shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-2">
          <span className={`badge badge-${item.tagColor} badge-md`}>
            {item.tag}
          </span>
        </div>

        <h3 className="text-md font-medium text-base-content mb-3">
          {item.title}
        </h3>

        {item.image && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-base-content/60">
            <div className="flex items-center gap-1">
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
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <span>{item.attachments}</span>
            </div>
            <div className="flex items-center gap-1">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>{item.comments}</span>
            </div>
          </div>

          <div className="avatar-group -space-x-3">
            {item.avatars.map((avatar, idx) => (
              <div key={idx} className="avatar placeholder">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-base-100">
                  <span className="text-xs text-white">
                    {avatar ? (
                      <img src={avatar} />
                    ) : (
                      String.fromCharCode(65 + idx)
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-gilroy p-6 text-[#101437] dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* In Progress Column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-xl font-semibold text-base-content">
              In Progress
            </h2>
            <button className="btn btn-ghost btn-xs btn-circle">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {columns.inProgress.map(renderCard)}

            <button className="btn btn-ghost btn-md hover:border-none hover:shadow-none hover:p-[17px] hover:bg-transparent justify-start w-full text-base-content/60">
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
              Add New Item
            </button>
          </div>
        </div>

        {/* In Review Column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 mt-2">
            <h2 className="text-xl font-semibold text-base-content">
              In Review
            </h2>
            <button className="btn btn-ghost btn-xs btn-circle">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {columns.inReview.map(renderCard)}

            <button className="btn btn-ghost btn-md hover:border-none hover:shadow-none hover:p-[17px]  hover:bg-transparent justify-start w-full text-base-content/60">
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
              Add New Item
            </button>
          </div>
        </div>

        {/* Done Column */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-base-content">Done</h2>
            <div className="flex items-center gap-2">
              <button className="btn btn-ghost btn-xs btn-circle">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              <button className="btn btn-ghost btn-md gap-1">
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
                Add New
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {columns.done.map(renderCard)}

            <button className="btn btn-ghost btn-md hover:border-none hover:shadow-none hover:p-[17px] hover:bg-transparent justify-start w-full text-base-content/60">
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
              Add New Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
