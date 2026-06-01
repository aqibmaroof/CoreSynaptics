"use client";

import React, { useState } from "react";

// ── Shared field styles (theme-aware --rf-* tokens) ──────────────────────────
const inputClass =
  "w-full bg-[var(--rf-bg3)] border border-[var(--rf-border2)] rounded-lg px-4 py-2.5 text-sm text-[var(--rf-txt)] placeholder-[var(--rf-txt3)] focus:outline-none focus:border-[var(--rf-accent)] transition-colors";

const optionClass = "bg-[var(--rf-bg2)] text-[var(--rf-txt)]";

// ── Reusable tabular building blocks ─────────────────────────────────────────
function SettingsCard({ icon, iconColor, title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] shadow-sm font-gilroy overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--rf-border)] bg-[var(--rf-bg3)]/40">
        {icon && (
          <div
            className="p-3 rounded-xl flex items-center justify-center"
            style={{
              background: `color-mix(in srgb, ${iconColor} 14%, transparent)`,
              color: iconColor,
            }}
          >
            {icon}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-[var(--rf-txt)] leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[var(--rf-txt2)]">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

// A single tabular row: label/hint on the left, control on the right.
function Row({ label, hint, children, last }) {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-6 py-4 ${
        last ? "" : "border-b border-[var(--rf-border)]"
      }`}
    >
      <div className="md:w-1/3 shrink-0">
        <div className="text-sm font-semibold text-[var(--rf-txt)]">{label}</div>
        {hint && (
          <div className="text-xs text-[var(--rf-txt3)] mt-0.5">{hint}</div>
        )}
      </div>
      <div className="md:flex-1 w-full">{children}</div>
    </div>
  );
}

function DataTable({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--rf-border)] my-5">
      <table className="w-full text-sm">
        <thead className="bg-[var(--rf-bg3)]">
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="text-left py-3 px-4 text-[var(--rf-txt3)] font-medium whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-semibold text-[var(--rf-bg)] bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)] transition-all ${
        small ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm"
      }`}
      style={{ boxShadow: "0 8px 24px var(--rf-glow)" }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg font-medium text-[var(--rf-txt)] border border-[var(--rf-border2)] hover:border-[var(--rf-accent)] hover:text-[var(--rf-accent)] transition-colors ${
        small ? "px-4 py-2 text-sm" : "px-6 py-3 text-sm"
      }`}
    >
      {children}
    </button>
  );
}

export default function ProjectManagerDashboard() {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    // General
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
    // Projects
    defaultTemplate: "Software Development",
    projectVisibility: "Team Members Only",
    requireApproval: true,
    autoArchive: false,
    allowGuestAccess: false,
    // Notifications
    notifyTaskAssigned: true,
    notifyMentions: true,
    notifyWeeklyDigest: true,
    notifyComments: false,
    pushDeadlines: true,
    pushMobile: true,
    pushSound: false,
    // Security
    twoFactor: true,
    loginAlerts: true,
    sessionTimeout: "30 minutes",
    passwordExpiry: "90 days",
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

  const shared = { formData, handleChange, handleToggle };

  return (
    <div className="min-h-screen p-6 md:p-8 font-gilroy text-[var(--rf-txt)]">
      {/* Header */}
      <div className="mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--rf-txt)] mb-1">
              Dashboard Settings
            </h1>
            <p className="text-[var(--rf-txt2)] text-base md:text-lg">
              Manage your project management workspace
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="rounded-lg text-xs font-bold px-3 py-2 tracking-wide"
              style={{ background: "var(--rf-yellow)", color: "var(--rf-bg)" }}
            >
              PRO PLAN
            </div>
            <div className="relative">
              <div
                className="flex items-center justify-center rounded-full w-12 h-12 cursor-pointer text-[var(--rf-bg)]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--rf-accent), var(--rf-purple))",
                }}
              >
                <span className="text-lg font-semibold">PM</span>
              </div>
              <div className="absolute top-0 right-0 w-3 h-3 rounded-full bg-[var(--rf-green)] border-2 border-[var(--rf-bg)]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-auto mb-8">
        <div className="bg-[var(--rf-bg2)] border border-[var(--rf-border)] rounded-xl p-1.5 flex gap-1 overflow-x-auto flex-nowrap">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-[var(--rf-bg)] font-semibold"
                    : "text-[var(--rf-txt2)] hover:text-[var(--rf-txt)] hover:bg-[var(--rf-bg3)]"
                }`}
                style={active ? { background: "var(--rf-accent)" } : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto">
        {activeTab === "general" && <GeneralTab {...shared} />}
        {activeTab === "team" && <TeamTab />}
        {activeTab === "projects" && <ProjectsTab {...shared} />}
        {activeTab === "notifications" && <NotificationsTab {...shared} />}
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "security" && <SecurityTab {...shared} />}
        {activeTab === "billing" && <BillingTab />}
      </div>

      {/* Action Buttons */}
      <div className="mx-auto mt-8 flex justify-end gap-4">
        <GhostButton onClick={handleCancel}>Cancel Changes</GhostButton>
        <PrimaryButton onClick={handleSave}>Save All Settings</PrimaryButton>
      </div>
    </div>
  );
}

// ── GENERAL ──────────────────────────────────────────────────────────────────
function GeneralTab({ formData, handleChange, handleToggle }) {
  const automations = [
    {
      field: "autoAssign",
      title: "Auto-assign tasks to team members",
      desc: "Automatically distribute tasks based on workload",
    },
    {
      field: "deadlineReminders",
      title: "Send deadline reminders",
      desc: "Notify team 24 hours before due dates",
    },
    {
      field: "archiveProjects",
      title: "Archive completed projects",
      desc: "Move projects to archive 30 days after completion",
    },
    {
      field: "weeklyReports",
      title: "Generate weekly reports",
      desc: "Email progress summaries every Friday",
    },
  ];

  const stats = [
    { label: "Active Projects", value: "24" },
    { label: "Team Members", value: "47" },
    { label: "Tasks This Week", value: "156" },
    { label: "Completion Rate", value: "87%", accent: "var(--rf-green)" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        <SettingsCard
          iconColor="var(--rf-accent)"
          title="Workspace Information"
          subtitle="Basic details about your workspace"
          icon={<Icon path="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />}
        >
          <Row label="Workspace Name">
            <input
              type="text"
              name="workspaceName"
              value={formData.workspaceName}
              onChange={handleChange}
              className={inputClass}
            />
          </Row>
          <Row label="Workspace ID" hint="Read-only identifier">
            <input
              type="text"
              value={formData.workspaceId}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
          </Row>
          <Row label="Description">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className={inputClass}
            />
          </Row>
          <Row label="Industry">
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className={inputClass}
            >
              {["Technology", "Healthcare", "Finance", "Education", "Retail"].map(
                (o) => (
                  <option key={o} className={optionClass}>
                    {o}
                  </option>
                )
              )}
            </select>
          </Row>
          <Row label="Company Size" last>
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleChange}
              className={inputClass}
            >
              {[
                "1-10 employees",
                "11-50 employees",
                "50-100 employees",
                "101-500 employees",
                "500+ employees",
              ].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
        </SettingsCard>

        <SettingsCard
          iconColor="var(--rf-purple)"
          title="Project Defaults"
          subtitle="Set default values for new projects"
          icon={<Icon path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />}
        >
          <Row label="Default Project View">
            <select
              name="projectView"
              value={formData.projectView}
              onChange={handleChange}
              className={inputClass}
            >
              {["Kanban Board", "List View", "Calendar", "Timeline", "Gantt Chart"].map(
                (o) => (
                  <option key={o} className={optionClass}>
                    {o}
                  </option>
                )
              )}
            </select>
          </Row>
          <Row label="Task Priority Levels">
            <select
              name="priorityLevels"
              value={formData.priorityLevels}
              onChange={handleChange}
              className={inputClass}
            >
              {[
                "4 Levels (Low, Medium, High, Critical)",
                "3 Levels (Low, Medium, High)",
                "5 Levels (Very Low to Critical)",
              ].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Sprint Duration">
            <select
              name="sprintDuration"
              value={formData.sprintDuration}
              onChange={handleChange}
              className={inputClass}
            >
              {["1 Week", "2 Weeks", "3 Weeks", "4 Weeks"].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Working Days">
            <select
              name="workingDays"
              value={formData.workingDays}
              onChange={handleChange}
              className={inputClass}
            >
              {[
                "Monday - Friday (5 days)",
                "Monday - Saturday (6 days)",
                "Sunday - Thursday (5 days)",
              ].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Work Hours Start">
            <input
              type="time"
              name="workHoursStart"
              value={formData.workHoursStart}
              onChange={handleChange}
              className={inputClass}
            />
          </Row>
          <Row label="Work Hours End" last>
            <input
              type="time"
              name="workHoursEnd"
              value={formData.workHoursEnd}
              onChange={handleChange}
              className={inputClass}
            />
          </Row>
        </SettingsCard>

        <SettingsCard
          iconColor="var(--rf-green)"
          title="Automation & Workflows"
          subtitle="Configure automatic actions and triggers"
          icon={<Icon path="M13 10V3L4 14h7v7l9-11h-7z" />}
        >
          {automations.map((item, i) => (
            <Row
              key={item.field}
              label={item.title}
              hint={item.desc}
              last={i === automations.length - 1}
            >
              <ToggleRight
                checked={formData[item.field]}
                onChange={() => handleToggle(item.field)}
              />
            </Row>
          ))}
        </SettingsCard>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <SettingsCard
          iconColor="var(--rf-accent)"
          title="Quick Stats"
          icon={<Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
        >
          {stats.map((s, i) => (
            <Row key={s.label} label={s.label} last={i === stats.length - 1}>
              <div className="md:text-right">
                <span
                  className="text-2xl font-bold"
                  style={{ color: s.accent || "var(--rf-txt)" }}
                >
                  {s.value}
                </span>
              </div>
            </Row>
          ))}
        </SettingsCard>

        <SettingsCard
          iconColor="var(--rf-accent)"
          title="Time Zone & Regional"
          subtitle="Configure location settings"
          icon={<Icon path="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
        >
          <Row label="Time Zone">
            <select
              name="timeZone"
              value={formData.timeZone}
              onChange={handleChange}
              className={inputClass}
            >
              {[
                "(UTC-05:00) Eastern Time",
                "(UTC-08:00) Pacific Time",
                "(UTC+00:00) London",
                "(UTC+05:00) Lahore",
              ].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Date Format">
            <select
              name="dateFormat"
              value={formData.dateFormat}
              onChange={handleChange}
              className={inputClass}
            >
              {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Language">
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className={inputClass}
            >
              {["English (US)", "English (UK)", "Spanish", "French"].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
          <Row label="Currency" last>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className={inputClass}
            >
              {[
                "USD - US Dollar",
                "EUR - Euro",
                "GBP - British Pound",
                "PKR - Pakistani Rupee",
              ].map((o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              ))}
            </select>
          </Row>
        </SettingsCard>

        <SettingsCard
          iconColor="var(--rf-green)"
          title="Security Status"
          subtitle="Your account is secure"
          icon={<Icon path="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />}
        >
          <div className="py-5 space-y-3">
            <SecurityItem ok label="2FA Enabled" />
            <SecurityItem ok label="SSL Certificate Valid" />
            <SecurityItem label="Password expires in 45 days" />
            <GhostButton small>
              <span className="w-full block text-center">
                View Security Settings
              </span>
            </GhostButton>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}

// ── TEAM & MEMBERS ───────────────────────────────────────────────────────────
function TeamTab() {
  const members = [
    { name: "Sarah Chen", email: "sarah@acme.com", role: "Admin", status: "Active" },
    { name: "James Wilson", email: "james@acme.com", role: "Project Manager", status: "Active" },
    { name: "Maria Garcia", email: "maria@acme.com", role: "Member", status: "Active" },
    { name: "David Kim", email: "david@acme.com", role: "Member", status: "Pending" },
    { name: "Aisha Khan", email: "aisha@acme.com", role: "Viewer", status: "Active" },
  ];

  const roleColor = (role) =>
    role === "Admin"
      ? "var(--rf-purple)"
      : role === "Project Manager"
      ? "var(--rf-accent)"
      : "var(--rf-txt2)";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatTile label="Total Members" value="47" color="var(--rf-accent)" />
        <StatTile label="Active" value="44" color="var(--rf-green)" />
        <StatTile label="Pending Invites" value="3" color="var(--rf-yellow)" />
      </div>

      <SettingsCard
        iconColor="var(--rf-accent)"
        title="Team Members"
        subtitle="Manage who has access to this workspace"
        icon={<Icon path="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.7" />}
        action={<PrimaryButton small>+ Invite Member</PrimaryButton>}
      >
        <DataTable columns={["Member", "Role", "Status", "Actions"]}>
          {members.map((m) => (
            <tr
              key={m.email}
              className="border-t border-[var(--rf-border)] hover:bg-[var(--rf-bg3)] transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold uppercase text-[var(--rf-bg)]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--rf-accent), var(--rf-purple))",
                    }}
                  >
                    {m.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--rf-txt)]">
                      {m.name}
                    </div>
                    <div className="text-xs text-[var(--rf-txt3)]">{m.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <span
                  className="font-medium"
                  style={{ color: roleColor(m.role) }}
                >
                  {m.role}
                </span>
              </td>
              <td className="py-3 px-4">
                <Badge
                  color={
                    m.status === "Active" ? "var(--rf-green)" : "var(--rf-yellow)"
                  }
                >
                  {m.status}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <button className="text-[var(--rf-accent)] hover:text-[var(--rf-accent2)] text-sm font-medium mr-3">
                  Edit
                </button>
                <button className="text-[var(--rf-red)] hover:text-[var(--rf-red2)] text-sm font-medium">
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </SettingsCard>
    </div>
  );
}

// ── PROJECTS ─────────────────────────────────────────────────────────────────
function ProjectsTab({ formData, handleChange, handleToggle }) {
  const toggles = [
    {
      field: "requireApproval",
      title: "Require approval for new projects",
      desc: "Admins must approve before a project goes live",
    },
    {
      field: "autoArchive",
      title: "Auto-archive inactive projects",
      desc: "Archive projects with no activity for 60 days",
    },
    {
      field: "allowGuestAccess",
      title: "Allow guest access",
      desc: "Let external collaborators view selected projects",
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard
        iconColor="var(--rf-purple)"
        title="Project Configuration"
        subtitle="Control how projects are created and managed"
        icon={<Icon path="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />}
      >
        <Row label="Default Project Template">
          <select
            name="defaultTemplate"
            value={formData.defaultTemplate}
            onChange={handleChange}
            className={inputClass}
          >
            {["Software Development", "Marketing Campaign", "Product Launch", "Blank Project"].map(
              (o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              )
            )}
          </select>
        </Row>
        <Row label="Default Visibility" last>
          <select
            name="projectVisibility"
            value={formData.projectVisibility}
            onChange={handleChange}
            className={inputClass}
          >
            {["Team Members Only", "Organization Wide", "Private", "Public"].map(
              (o) => (
                <option key={o} className={optionClass}>
                  {o}
                </option>
              )
            )}
          </select>
        </Row>
      </SettingsCard>

      <SettingsCard
        iconColor="var(--rf-green)"
        title="Project Policies"
        subtitle="Rules applied across all projects"
        icon={<Icon path="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
      >
        {toggles.map((t, i) => (
          <Row
            key={t.field}
            label={t.title}
            hint={t.desc}
            last={i === toggles.length - 1}
          >
            <ToggleRight
              checked={formData[t.field]}
              onChange={() => handleToggle(t.field)}
            />
          </Row>
        ))}
      </SettingsCard>
    </div>
  );
}

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────
function NotificationsTab({ formData, handleToggle }) {
  const email = [
    { field: "notifyTaskAssigned", title: "Task assigned to me", desc: "Email when a task is assigned to you" },
    { field: "notifyMentions", title: "Mentions & comments", desc: "Email when someone @mentions you" },
    { field: "notifyWeeklyDigest", title: "Weekly digest", desc: "A summary of activity every Monday" },
    { field: "notifyComments", title: "All comment activity", desc: "Email for every comment on your projects" },
  ];
  const push = [
    { field: "pushDeadlines", title: "Deadline reminders", desc: "Push alerts before tasks are due" },
    { field: "pushMobile", title: "Mobile push notifications", desc: "Receive alerts on your mobile device" },
    { field: "pushSound", title: "Notification sound", desc: "Play a sound for new notifications" },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard
        iconColor="var(--rf-accent)"
        title="Email Notifications"
        subtitle="Choose what lands in your inbox"
        icon={<Icon path="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
      >
        {email.map((n, i) => (
          <Row key={n.field} label={n.title} hint={n.desc} last={i === email.length - 1}>
            <ToggleRight
              checked={formData[n.field]}
              onChange={() => handleToggle(n.field)}
            />
          </Row>
        ))}
      </SettingsCard>

      <SettingsCard
        iconColor="var(--rf-purple)"
        title="Push Notifications"
        subtitle="Real-time alerts on your devices"
        icon={<Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />}
      >
        {push.map((n, i) => (
          <Row key={n.field} label={n.title} hint={n.desc} last={i === push.length - 1}>
            <ToggleRight
              checked={formData[n.field]}
              onChange={() => handleToggle(n.field)}
            />
          </Row>
        ))}
      </SettingsCard>
    </div>
  );
}

// ── INTEGRATIONS ─────────────────────────────────────────────────────────────
function IntegrationsTab() {
  const [apps, setApps] = useState([
    { name: "Slack", desc: "Team communication", connected: true, color: "var(--rf-purple)" },
    { name: "GitHub", desc: "Code repository", connected: true, color: "var(--rf-txt)" },
    { name: "Google Drive", desc: "File storage & sharing", connected: false, color: "var(--rf-green)" },
    { name: "Jira", desc: "Issue & sprint tracking", connected: false, color: "var(--rf-accent)" },
    { name: "Figma", desc: "Design collaboration", connected: true, color: "var(--rf-red)" },
    { name: "Zoom", desc: "Video meetings", connected: false, color: "var(--rf-accent)" },
  ]);

  const toggle = (name) =>
    setApps((prev) =>
      prev.map((a) =>
        a.name === name ? { ...a, connected: !a.connected } : a
      )
    );

  return (
    <SettingsCard
      iconColor="var(--rf-accent)"
      title="Connected Apps"
      subtitle="Integrate your favorite tools with the workspace"
      icon={<Icon path="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5m6.328-1.328a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5">
        {apps.map((app) => (
          <div
            key={app.name}
            className="flex items-center gap-4 p-4 rounded-xl border border-[var(--rf-border)] bg-[var(--rf-bg3)]/40"
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-base font-bold"
              style={{
                background: `color-mix(in srgb, ${app.color} 16%, transparent)`,
                color: app.color,
              }}
            >
              {app.name.slice(0, 1)}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[var(--rf-txt)] flex items-center gap-2">
                {app.name}
                {app.connected && (
                  <Badge color="var(--rf-green)">Connected</Badge>
                )}
              </div>
              <div className="text-xs text-[var(--rf-txt3)]">{app.desc}</div>
            </div>
            <button
              onClick={() => toggle(app.name)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                app.connected
                  ? "border border-[var(--rf-border2)] text-[var(--rf-red)] hover:border-[var(--rf-red)]"
                  : "text-[var(--rf-bg)] bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)]"
              }`}
            >
              {app.connected ? "Disconnect" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}

// ── SECURITY ─────────────────────────────────────────────────────────────────
function SecurityTab({ formData, handleChange, handleToggle }) {
  const sessions = [
    { device: "MacBook Pro · Chrome", location: "New York, US", last: "Active now", current: true },
    { device: "iPhone 14 · Safari", location: "New York, US", last: "2 hours ago" },
    { device: "Windows PC · Edge", location: "Boston, US", last: "Yesterday" },
  ];

  return (
    <div className="space-y-6">
      <SettingsCard
        iconColor="var(--rf-green)"
        title="Authentication"
        subtitle="Protect your account access"
        icon={<Icon path="M12 11c0-1.105.895-2 2-2s2 .895 2 2m-6 0a6 6 0 1112 0v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a6 6 0 016-6z" />}
      >
        <Row
          label="Two-Factor Authentication"
          hint="Require a verification code at sign in"
        >
          <ToggleRight
            checked={formData.twoFactor}
            onChange={() => handleToggle("twoFactor")}
          />
        </Row>
        <Row label="Login Alerts" hint="Email me about new sign-ins">
          <ToggleRight
            checked={formData.loginAlerts}
            onChange={() => handleToggle("loginAlerts")}
          />
        </Row>
        <Row label="Session Timeout">
          <select
            name="sessionTimeout"
            value={formData.sessionTimeout}
            onChange={handleChange}
            className={inputClass}
          >
            {["15 minutes", "30 minutes", "1 hour", "4 hours", "Never"].map((o) => (
              <option key={o} className={optionClass}>
                {o}
              </option>
            ))}
          </select>
        </Row>
        <Row label="Password" hint="Last changed 45 days ago" last>
          <GhostButton small>Change Password</GhostButton>
        </Row>
      </SettingsCard>

      <SettingsCard
        iconColor="var(--rf-accent)"
        title="Active Sessions"
        subtitle="Devices currently signed into your account"
        icon={<Icon path="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
      >
        <DataTable columns={["Device", "Location", "Last Active", ""]}>
          {sessions.map((s) => (
            <tr
              key={s.device}
              className="border-t border-[var(--rf-border)] hover:bg-[var(--rf-bg3)] transition-colors"
            >
              <td className="py-3 px-4 font-medium text-[var(--rf-txt)]">
                <div className="flex items-center gap-2">
                  {s.device}
                  {s.current && (
                    <Badge color="var(--rf-green)">This device</Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-[var(--rf-txt2)]">{s.location}</td>
              <td className="py-3 px-4 text-[var(--rf-txt2)]">{s.last}</td>
              <td className="py-3 px-4">
                {!s.current && (
                  <button className="text-[var(--rf-red)] hover:text-[var(--rf-red2)] text-sm font-medium">
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </SettingsCard>
    </div>
  );
}

// ── BILLING ──────────────────────────────────────────────────────────────────
function BillingTab() {
  const invoices = [
    { date: "May 01, 2026", amount: "$49.00", status: "Paid", id: "INV-2026-005" },
    { date: "Apr 01, 2026", amount: "$49.00", status: "Paid", id: "INV-2026-004" },
    { date: "Mar 01, 2026", amount: "$49.00", status: "Paid", id: "INV-2026-003" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current plan */}
        <div className="lg:col-span-2">
          <SettingsCard
            iconColor="var(--rf-yellow)"
            title="Current Plan"
            subtitle="Your active subscription"
            icon={<Icon path="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />}
            action={<PrimaryButton small>Upgrade Plan</PrimaryButton>}
          >
            <div className="py-5 space-y-5">
              <div className="flex items-end justify-between flex-wrap gap-3">
                <div>
                  <div className="text-2xl font-bold text-[var(--rf-txt)] flex items-center gap-2">
                    Pro Plan
                    <Badge color="var(--rf-green)">Active</Badge>
                  </div>
                  <div className="text-sm text-[var(--rf-txt2)] mt-1">
                    Billed monthly · Renews on June 01, 2026
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-[var(--rf-txt)]">
                    $49
                  </span>
                  <span className="text-[var(--rf-txt3)] text-sm">/month</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--rf-txt2)]">Seats used</span>
                  <span className="text-[var(--rf-txt)] font-medium">47 / 50</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--rf-bg3)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "94%", background: "var(--rf-accent)" }}
                  />
                </div>
              </div>
            </div>
          </SettingsCard>
        </div>

        {/* Payment method */}
        <SettingsCard
          iconColor="var(--rf-accent)"
          title="Payment Method"
          icon={<Icon path="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
        >
          <div className="py-5 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--rf-border)] bg-[var(--rf-bg3)]/40">
              <div
                className="w-10 h-7 rounded flex items-center justify-center text-[10px] font-bold text-[var(--rf-bg)]"
                style={{ background: "var(--rf-accent)" }}
              >
                VISA
              </div>
              <div>
                <div className="text-sm font-medium text-[var(--rf-txt)]">
                  •••• •••• •••• 4242
                </div>
                <div className="text-xs text-[var(--rf-txt3)]">Expires 08/27</div>
              </div>
            </div>
            <GhostButton small>
              <span className="block w-full text-center">Update Card</span>
            </GhostButton>
          </div>
        </SettingsCard>
      </div>

      <SettingsCard
        iconColor="var(--rf-green)"
        title="Billing History"
        subtitle="Download past invoices"
        icon={<Icon path="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
      >
        <DataTable columns={["Invoice", "Date", "Amount", "Status", ""]}>
          {invoices.map((inv) => (
            <tr
              key={inv.id}
              className="border-t border-[var(--rf-border)] hover:bg-[var(--rf-bg3)] transition-colors"
            >
              <td className="py-3 px-4 font-medium text-[var(--rf-txt)]">
                {inv.id}
              </td>
              <td className="py-3 px-4 text-[var(--rf-txt2)]">{inv.date}</td>
              <td className="py-3 px-4 text-[var(--rf-txt)]">{inv.amount}</td>
              <td className="py-3 px-4">
                <Badge color="var(--rf-green)">{inv.status}</Badge>
              </td>
              <td className="py-3 px-4">
                <button className="text-[var(--rf-accent)] hover:text-[var(--rf-accent2)] text-sm font-medium">
                  Download
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </SettingsCard>
    </div>
  );
}

// ── Small shared primitives ──────────────────────────────────────────────────
function Icon({ path }) {
  return (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d={path}
      />
    </svg>
  );
}

function ToggleRight({ checked, onChange }) {
  return (
    <div className="flex md:justify-end">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="toggle toggle-primary"
      />
    </div>
  );
}

function StatTile({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] p-5">
      <div className="text-sm text-[var(--rf-txt2)] mb-1">{label}</div>
      <div className="text-3xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function SecurityItem({ ok, label }) {
  const color = ok ? "var(--rf-green)" : "var(--rf-yellow)";
  return (
    <div
      className="flex items-center gap-3 rounded-lg px-4 py-3 border"
      style={{
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      <svg
        className="w-5 h-5 shrink-0"
        style={{ color }}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        {ok ? (
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        )}
      </svg>
      <span className="text-sm text-[var(--rf-txt)]">{label}</span>
    </div>
  );
}
