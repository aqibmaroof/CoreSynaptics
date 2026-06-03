"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPencil } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

// ─── Mock data (no Tasks API yet) ─────────────────────────────────────────────

const SEED_TASKS = [
  {
    id: 1,
    taskName: "Finalize Project Proposal",
    project: "Website Redesign",
    estimation: "01 Nov - 07 Nov 2026",
    priority: "Urgent",
    progress: 80,
    assignees: ["Rainer Brown", "Conny Rany", "Armin Falcon"],
  },
  {
    id: 2,
    taskName: "Review NETA acceptance test scope",
    project: "Level 3 Commissioning",
    estimation: "04 Nov - 12 Nov 2026",
    priority: "High",
    progress: 45,
    assignees: ["Adam Krol", "Sarah Chen"],
  },
  {
    id: 3,
    taskName: "Upload weekly safety sign-in sheets",
    project: "Compliance",
    estimation: "08 Nov - 09 Nov 2026",
    priority: "Low",
    progress: 100,
    assignees: ["Priya Nair"],
  },
  {
    id: 4,
    taskName: "Submit cable tray shop drawings",
    project: "Electrical Coordination",
    estimation: "10 Nov - 18 Nov 2026",
    priority: "Medium",
    progress: 20,
    assignees: ["James Rivera", "Lisa Park", "Conny Rany", "Adam Krol"],
  },
  {
    id: 5,
    taskName: "Close out L2 punch list items",
    project: "Level 2 Turnover",
    estimation: "12 Nov - 20 Nov 2026",
    priority: "High",
    progress: 60,
    assignees: ["Sarah Chen"],
  },
];

// ─── Theme helpers ────────────────────────────────────────────────────────────

const PRIORITY_COLOR = {
  Urgent: "var(--rf-red)",
  High: "var(--rf-orange)",
  Medium: "var(--rf-yellow)",
  Low: "var(--rf-green)",
};

const AVATAR_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const initialsOf = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const colorFor = (name) => {
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
};

function Avatar({ name, size = 28, ring = false }) {
  const color = colorFor(name);
  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color + "22",
        border: `1.5px solid ${color}55`,
        boxShadow: ring ? "0 0 0 2px var(--rf-bg2)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      {initialsOf(name)}
    </div>
  );
}

function AssigneeStack({ assignees = [] }) {
  const shown = assignees.slice(0, 3);
  const extra = assignees.length - shown.length;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {shown.map((name, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={name} ring />
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            marginLeft: -8,
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--rf-bg3)",
            border: "1.5px solid var(--rf-border)",
            boxShadow: "0 0 0 2px var(--rf-bg2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--rf-txt2)",
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

function PriorityChip({ priority }) {
  const color = PRIORITY_COLOR[priority] || "var(--rf-txt3)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 9px",
        borderRadius: 99,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        color,
        border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
        letterSpacing: "0.03em",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: color,
        }}
      />
      {priority}
    </span>
  );
}

function ProgressCell({ value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 120 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          borderRadius: 99,
          background: "var(--rf-bg3)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: value === 100 ? "var(--rf-green)" : "var(--rf-accent)",
            borderRadius: 99,
            transition: "width 0.3s",
          }}
        />
      </div>
      <span style={{ fontSize: 11, color: "var(--rf-txt3)", whiteSpace: "nowrap" }}>
        {value}%
      </span>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KPI({ label, value, variant }) {
  const accent = {
    amber: "var(--rf-yellow)",
    green: "var(--rf-green)",
    red: "var(--rf-red)",
  }[variant];
  return (
    <div
      style={{
        background: "var(--rf-bg2)",
        border: `1px solid ${accent || "var(--rf-border)"}`,
        borderRadius: 12,
        padding: "16px 20px",
        flex: "1 1 140px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: accent || "var(--rf-txt)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TasksList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = useUserPermissions();

  const [tasks, setTasks] = useState(SEED_TASKS);

  const total = tasks.length;
  const urgent = tasks.filter((t) => t.priority === "Urgent" || t.priority === "High").length;
  const inProgress = tasks.filter((t) => t.progress > 0 && t.progress < 100).length;
  const completed = tasks.filter((t) => t.progress === 100).length;

  const deleteTask = (id) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const VIEWS = [
    { key: "list", label: "List", path: "/Tasks/List" },
    { key: "kanban", label: "Kanban", path: "/Tasks/Kanban" },
    { key: "calendar", label: "Calendar", path: "/Tasks/Calendar" },
  ];

  const COLUMNS = ["#", "Task", "Project", "Estimation", "Priority", "Progress", "Assignee", "Action"];

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--rf-txt)" }}>
            Tasks
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}>
            All tasks across your projects
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* View switch */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: 4,
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border)",
              borderRadius: 10,
            }}
          >
            {VIEWS.map((v) => {
              const active = v.key === "list";
              return (
                <button
                  key={v.key}
                  onClick={() => !active && router.push(v.path)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 7,
                    border: "none",
                    cursor: active ? "default" : "pointer",
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    background: active ? "var(--rf-accent)" : "transparent",
                    color: active ? "#fff" : "var(--rf-txt2)",
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => router.push("/Tasks/CreateTask/new")}
            {...permissionProps(canCreate(MODULE.TASKS), "create a task")}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              background: "var(--rf-accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <KPI label="Total Tasks" value={total} />
        <KPI label="Urgent / High" value={urgent} variant={urgent > 0 ? "red" : undefined} />
        <KPI label="In Progress" value={inProgress} variant={inProgress > 0 ? "amber" : undefined} />
        <KPI label="Completed" value={completed} variant="green" />
      </div>

      {/* ── Single table ───────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {tasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--rf-txt3)", fontSize: 13 }}>
            No tasks found.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rf-border)", background: "var(--rf-bg3)" }}>
                  {COLUMNS.map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 16px",
                        textAlign: h === "Action" ? "right" : "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--rf-txt3)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <tr
                    key={task.id}
                    style={{
                      borderBottom: "1px solid var(--rf-border)",
                      transition: "background 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-bg3)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => router.push(`/Profile/Managers/${task.id}`)}
                  >
                    <td style={{ padding: "12px 16px", color: "var(--rf-txt3)" }}>{index + 1}</td>
                    <td style={{ padding: "12px 16px", color: "var(--rf-txt)", fontWeight: 600 }}>
                      {task.taskName}
                    </td>
                    <td style={{ padding: "12px 16px", color: "var(--rf-txt2)" }}>{task.project}</td>
                    <td style={{ padding: "12px 16px", color: "var(--rf-txt3)", whiteSpace: "nowrap" }}>
                      {task.estimation}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <PriorityChip priority={task.priority} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <ProgressCell value={task.progress} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <AssigneeStack assignees={task.assignees} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        {canEdit(MODULE.TASKS) && (
                          <button
                            title="View / Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/Profile/Managers/${task.id}`);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--rf-accent)",
                              padding: 6,
                              display: "flex",
                            }}
                          >
                            <FaPencil size={13} />
                          </button>
                        )}
                        {canDelete(MODULE.TASKS) && (
                          <button
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "var(--rf-red)",
                              padding: 6,
                              display: "flex",
                            }}
                          >
                            <FaTrash size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
