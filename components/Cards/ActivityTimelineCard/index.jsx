// components/cards/ActivityTimelineCard.jsx
import React from "react";
import CardWrapper from "../../CardWrapper"; // Assuming you kept the CardWrapper

// Example Data Structure
const timelineData = {
  title: "Activity Timeline",
  activities: [
    {
      type: "invoice",
      time: "12 min ago",
      dotColor: "bg-blue-500",
      title: "12 Invoices have been paid",
      details: "Invoices have been paid to the company",
      attachment: { name: "invoices.pdf", icon: "📄" },
    },
    {
      type: "meeting",
      time: "45 min ago",
      dotColor: "bg-green-500",
      title: "Client Meeting",
      details: "Project meeting with john @10:15am",
      person: {
        name: "Lester McCarthy (Client)",
        title: "CEO of ThemeSelection",
        avatar: "L",
      },
    },
    {
      type: "project",
      time: "2 Day Ago",
      dotColor: "bg-cyan-500",
      title: "Create a new project for client",
      details: "6 team members in a project",
      team: [
        { avatar: "J" },
        { avatar: "A" },
        { avatar: "S" }, // Simplified avatars
      ],
    },
  ],
};

// --- Sub-Components for Cleanliness ---

const TimelineItem = ({ activity, isLast }) => (
  <div className="flex relative pb-8">
    {/* Vertical Line */}
    {!isLast && (
      <div className="absolute top-0 left-2 w-0.5 h-full bg-gray-200 dark:bg-gray-700 ml-0.5"></div>
    )}

    {/* Dot */}
    <div
      className={`z-10 w-3 h-3 rounded-full ${activity.dotColor} flex-shrink-0 mt-1`}
    ></div>

    {/* Content */}
    <div className="flex-grow ml-4">
      <div className="flex justify-between items-start">
        <h3 className="text-gray-800 dark:text-white font-medium mb-1">
          {activity.title}
        </h3>
        <span className="text-xs text-gray-500 dark:text-[#fff] flex-shrink-0">
          {activity.time}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-[#fff] mb-2">
        {activity.details}
      </p>

      {/* Conditional Content based on type */}
      {activity.attachment && (
        <div className="flex items-center gap-2 p-2 w-48 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-800 dark:text-[#fff]">
          <span className="text-red-500">{activity.attachment.icon}</span>
          {activity.attachment.name}
        </div>
      )}

      {activity.person && (
        <div className="flex items-center gap-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-sm font-semibold">
            {activity.person.avatar}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-800 dark:text-white">
              {activity.person.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#fff]">
              {activity.person.title}
            </p>
          </div>
        </div>
      )}

      {activity.team && (
        <div className="flex items-center -space-x-2 mt-2">
          {activity.team.map((member, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold"
            >
              {member.avatar}
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-semibold">
            +3
          </div>
        </div>
      )}
    </div>
  </div>
);
// ---------------------------------------------

const ActivityTimelineCard = ({ data = timelineData }) => {
  return (
    <CardWrapper className="col-span-12 md:col-span-12">
      {" "}
      {/* Example column span */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          {data.title}
        </h2>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75 12a.75 0 01-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
          </svg>
        </button>
      </div>
      <div className="relative">
        {data.activities.map((activity, index) => (
          <TimelineItem
            key={index}
            activity={activity}
            isLast={index === data.activities.length - 1}
          />
        ))}
      </div>
    </CardWrapper>
  );
};

export default ActivityTimelineCard;
