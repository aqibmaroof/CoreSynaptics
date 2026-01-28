"use client";

import React, { useState } from "react";

export default function ProjectManagerDashboard() {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    workspaceName: "Acme Corp Projects",
    workspaceId: "ACME-2024",
    description:
      "Central hub for managing all development and marketing projects across teams.",
    industry: "Technology",
    companySize: "50-100 employees",
    projectView: "Kanban Board",
    priorityLevels: "4 Levels (Low, Medium, High, Critical)",
    sprintDuration: "2 Weeks",
    workingDays: "Monday - Friday (5 days)",
    workHoursStart: "09:00",
    workHoursEnd: "17:00",
    timeZone: "(UTC-05:00) Eastern Time",
    dateFormat: "MM/DD/YYYY",
    language: "English (US)",
    currency: "USD - US Dollar",
    autoAssign: true,
    deadlineReminders: true,
    archiveProjects: false,
    weeklyReports: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = () => {
    console.log("Saving settings...", formData);
    alert("Settings saved successfully!");
  };

  const handleCancel = () => {
    console.log("Canceling changes...");
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "team", label: "Team & Members" },
    { id: "projects", label: "Projects" },
    { id: "notifications", label: "Notifications" },
    { id: "integrations", label: "Integrations" },
    { id: "security", label: "Security" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Epilogue:wght@600;800&display=swap");

        body {
          font-family: "DM Sans", sans-serif;
        }

        .heading-font {
          font-family: "Epilogue", sans-serif;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #1e293b;
        }

        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }

        /* Animation for pulse */
        @keyframes pulse-dot {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }

        .pulse-dot {
          animation: pulse-dot 2s infinite;
        }

        /* Smooth transitions */
        * {
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        /* Input styling */
        input:focus,
        select:focus,
        textarea:focus {
          outline: none !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>

      {/* Header */}
      <div className="mx-auto mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="heading-font text-4xl font-bold text-white mb-2">
              Dashboard Settings
            </h1>
            <p className="text-slate-400 text-lg">
              Manage your project management workspace
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="badge badge-warning gap-2 text-white font-semibold px-4 py-3">
              PRO PLAN
            </div>
            <div className="relative">
              <div className="avatar placeholder">
                <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-12 h-12 transition-transform cursor-pointer">
                  <span className="text-lg font-semibold">PM</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-success rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-auto mb-8">
        <div className="tabs tabs-boxed bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl p-2 overflow-x-auto flex-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab tab-lg whitespace-nowrap rounded-xl ${
                activeTab === tab.id
                  ? "tab-active bg-blue-500/20 text-white font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workspace Information Card */}
          <div className="card bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl font-gilroy transition-all">
            <div className="card-body">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="card-title text-white text-2xl mb-1">
                    Workspace Information
                  </h2>
                  <p className="text-slate-400">
                    Basic details about your workspace
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Workspace Name
                    </span>
                  </label>
                  <input
                    type="text"
                    name="workspaceName"
                    value={formData.workspaceName}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Workspace ID
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.workspaceId}
                    disabled
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>

                <div className="form-control md:col-span-2">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Description
                    </span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  ></textarea>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Industry
                    </span>
                  </label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Retail</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Company Size
                    </span>
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>50-100 employees</option>
                    <option>101-500 employees</option>
                    <option>500+ employees</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Project Defaults Card */}
          <div className="card bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl font-gilroy transition-all">
            <div className="card-body">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <svg
                    className="w-6 h-6 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    ></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="card-title text-white text-2xl mb-1">
                    Project Defaults
                  </h2>
                  <p className="text-slate-400">
                    Set default values for new projects
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Default Project View
                    </span>
                  </label>
                  <select
                    name="projectView"
                    value={formData.projectView}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>Kanban Board</option>
                    <option>List View</option>
                    <option>Calendar</option>
                    <option>Timeline</option>
                    <option>Gantt Chart</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Task Priority Levels
                    </span>
                  </label>
                  <select
                    name="priorityLevels"
                    value={formData.priorityLevels}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>4 Levels (Low, Medium, High, Critical)</option>
                    <option>3 Levels (Low, Medium, High)</option>
                    <option>5 Levels (Very Low to Critical)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Sprint Duration
                    </span>
                  </label>
                  <select
                    name="sprintDuration"
                    value={formData.sprintDuration}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>1 Week</option>
                    <option>2 Weeks</option>
                    <option>3 Weeks</option>
                    <option>4 Weeks</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Working Days
                    </span>
                  </label>
                  <select
                    name="workingDays"
                    value={formData.workingDays}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>Monday - Friday (5 days)</option>
                    <option>Monday - Saturday (6 days)</option>
                    <option>Sunday - Thursday (5 days)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Work Hours Start
                    </span>
                  </label>
                  <input
                    type="time"
                    name="workHoursStart"
                    value={formData.workHoursStart}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Work Hours End
                    </span>
                  </label>
                  <input
                    type="time"
                    name="workHoursEnd"
                    value={formData.workHoursEnd}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Automation & Workflows Card */}
          <div className="card bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl font-gilroy transition-all">
            <div className="card-body">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="card-title text-white text-2xl mb-1">
                    Automation & Workflows
                  </h2>
                  <p className="text-slate-400">
                    Configure automatic actions and triggers
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      Auto-assign tasks to team members
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Automatically distribute tasks based on workload
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoAssign}
                    onChange={() => handleToggle("autoAssign")}
                    className="toggle toggle-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      Send deadline reminders
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Notify team 24 hours before due dates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.deadlineReminders}
                    onChange={() => handleToggle("deadlineReminders")}
                    className="toggle toggle-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      Archive completed projects
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Move projects to archive 30 days after completion
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.archiveProjects}
                    onChange={() => handleToggle("archiveProjects")}
                    className="toggle toggle-primary"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      Generate weekly reports
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Email progress summaries every Friday
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.weeklyReports}
                    onChange={() => handleToggle("weeklyReports")}
                    className="toggle toggle-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats Card */}
          <div className="card bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl font-gilroy transition-all">
            <div className="card-body">
              <h3 className="card-title text-white text-xl mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Projects</span>
                  <span className="text-2xl font-bold text-white">24</span>
                </div>
                <div className="divider my-0"></div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Team Members</span>
                  <span className="text-2xl font-bold text-white">47</span>
                </div>
                <div className="divider my-0"></div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Tasks This Week</span>
                  <span className="text-2xl font-bold text-white">156</span>
                </div>
                <div className="divider my-0"></div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Completion Rate</span>
                  <span className="text-2xl font-bold text-success">87%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Zone & Regional Card */}
          <div className="card bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl font-gilroy transition-all">
            <div className="card-body">
              <div className="flex items-start gap-3 mb-4">
                <svg
                  className="w-6 h-6 text-blue-400 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <div>
                  <h3 className="card-title text-white text-xl mb-1">
                    Time Zone & Regional
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Configure location settings
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Time Zone
                    </span>
                  </label>
                  <select
                    name="timeZone"
                    value={formData.timeZone}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>(UTC-05:00) Eastern Time</option>
                    <option>(UTC-08:00) Pacific Time</option>
                    <option>(UTC+00:00) London</option>
                    <option>(UTC+05:00) Lahore</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Date Format
                    </span>
                  </label>
                  <select
                    name="dateFormat"
                    value={formData.dateFormat}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Language
                    </span>
                  </label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label mb-2">
                    <span className="label-text text-slate-300 font-semibold">
                      Currency
                    </span>
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy rounded-xl px-4 py-3 text-gray-400 placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                  >
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                    <option>PKR - Pakistani Rupee</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status Card */}
          <div className="card bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] rounded-2xl font-gilroy transition-all">
            <div className="card-body">
              <div className="flex items-start gap-3 mb-4">
                <svg
                  className="w-6 h-6 text-success mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  ></path>
                </svg>
                <div>
                  <h3 className="card-title text-white text-xl mb-1">
                    Security Status
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Your account is secure
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="alert alert-success bg-success/10 border border-success/20">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-sm">2FA Enabled</span>
                </div>

                <div className="alert alert-success bg-success/10 border border-success/20">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-sm">SSL Certificate Valid</span>
                </div>

                <div className="alert alert-warning bg-warning/10 border border-warning/20">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-sm">Password expires in 45 days</span>
                </div>
              </div>

              <button className="btn btn-outline btn-sm mt-4 w-full">
                View Security Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className=" mx-auto mt-8 flex justify-end gap-4">
        <button
          onClick={handleCancel}
          className="px-6 py-3 bg-base-100 text-gray-300 rounded-xl hover:bg-[#4a5066] transition-colors font-medium"
        >
          Cancel Changes
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 px-6 py-3  font-medium"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
}
