"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/instance/tokenService";
import { getMyNextActions } from "@/services/Me";

// ─── Mock data ────────────────────────────────────────────────────────────────

const COMPANIES = [
  { id: "c1", name: "HITT Contracting" },
  { id: "c2", name: "Shermco Industries" },
  { id: "c3", name: "Microsoft" },
  { id: "c4", name: "Delta Electrical" },
];

const USERS = [
  {
    id: "u1",
    name: "Sarah Chen",
    role: "gc_pm",
    company: "c1",
    initials: "SC",
    color: "#3b82f6",
  },
  {
    id: "u2",
    name: "Adam Krol",
    role: "superintendent",
    company: "c2",
    initials: "AK",
    color: "#10b981",
  },
  {
    id: "u3",
    name: "Lisa Park",
    role: "customer",
    company: "c3",
    initials: "LP",
    color: "#f59e0b",
  },
  {
    id: "u4",
    name: "James Rivera",
    role: "fse",
    company: "c4",
    initials: "JR",
    color: "#8b5cf6",
  },
  {
    id: "u5",
    name: "Priya Nair",
    role: "qa_manager",
    company: "c1",
    initials: "PN",
    color: "#ec4899",
  },
];

const TASKS = [
  {
    id: "t1",
    title: "Confirm load bank capacity for L5 IST",
    description:
      "Coordinate with Delta + Shermco on 4MW load bank expansion for May 19 IST window.",
    assignedTo: "u1",
    createdBy: "u3",
    company: "c1",
    status: "open",
    priority: "high",
    dueDate: "2026-05-16",
    tags: ["IST", "L5"],
  },
  {
    id: "t2",
    title: "Review NETA acceptance test scope for L3.05",
    description:
      "Adam's team starts Monday — verify scope sheet is in Documents and access granted.",
    assignedTo: "u1",
    createdBy: "u1",
    company: "c1",
    status: "in_prog",
    priority: "medium",
    dueDate: "2026-05-14",
    tags: ["NETA", "L3"],
  },
  {
    id: "t3",
    title: "Submit cable tray shop drawings",
    description:
      "Electrical coordination drawings due before Level 4 rough-in.",
    assignedTo: "u2",
    createdBy: "u1",
    company: "c1",
    status: "open",
    priority: "high",
    dueDate: "2026-05-13",
    tags: ["Drawings"],
  },
  {
    id: "t4",
    title: "Close out L2 punch list items",
    description:
      "14 items remaining — target all closed before Level 2 substantial completion.",
    assignedTo: "u1",
    createdBy: "u5",
    company: "c1",
    status: "in_prog",
    priority: "high",
    dueDate: "2026-05-15",
    tags: ["Punch", "L2"],
  },
  {
    id: "t5",
    title: "Upload weekly safety meeting sign-in sheets",
    description:
      "Required for compliance dashboard — toolbox talk sheets from Mon & Wed.",
    assignedTo: "u2",
    createdBy: "u1",
    company: "c1",
    status: "open",
    priority: "low",
    dueDate: "2026-05-12",
    tags: ["Safety"],
  },
  {
    id: "t6",
    title: "Verify BMS point-to-point testing schedule",
    description:
      "Align BMS contractor availability with OEM commissioning windows.",
    assignedTo: "u1",
    createdBy: "u1",
    company: "c1",
    status: "done",
    priority: "medium",
    dueDate: "2026-05-10",
    tags: ["BMS"],
  },
  {
    id: "t7",
    title: "Prepare RFI log for weekly owner meeting",
    description:
      "Export RFI log, filter by open items, attach latest revisions.",
    assignedTo: "u1",
    createdBy: "u1",
    company: "c1",
    status: "done",
    priority: "low",
    dueDate: "2026-05-09",
    tags: ["RFI"],
  },
  {
    id: "t8",
    title: "QC walkthrough Level 6 MEP rough-in",
    description:
      "Coordinate with Priya for the inspection checklist before drywall.",
    assignedTo: "u5",
    createdBy: "u1",
    company: "c1",
    status: "open",
    priority: "high",
    dueDate: "2026-05-17",
    tags: ["QC", "L6"],
  },
];

const CHECKLISTS = [
  {
    id: "ch1",
    company: "c1",
    title: "Level 3 Pre-Power Checklist",
    items: 22,
    done: 18,
    status: "open",
    assignedTo: "u1",
    dueDate: "2026-05-14",
  },
  {
    id: "ch2",
    company: "c1",
    title: "IST Readiness – Mechanical",
    items: 15,
    done: 15,
    status: "closed",
    assignedTo: "u1",
    dueDate: "2026-05-10",
  },
  {
    id: "ch3",
    company: "c1",
    title: "Level 5 IST Checklist",
    items: 30,
    done: 11,
    status: "open",
    assignedTo: "u1",
    dueDate: "2026-05-19",
  },
  {
    id: "ch4",
    company: "c1",
    title: "Safety Pre-Task Planning – Week 20",
    items: 8,
    done: 3,
    status: "open",
    assignedTo: "u2",
    dueDate: "2026-05-13",
  },
  {
    id: "ch5",
    company: "c1",
    title: "Commissioning Turnover Package – L2",
    items: 40,
    done: 40,
    status: "closed",
    assignedTo: "u1",
    dueDate: "2026-05-08",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MGMT_ROLES = new Set([
  "gc_pm",
  "gc_admin",
  "superintendent",
  "gc_qaqc",
  "oem_pm",
  "oem_admin",
  "fsm",
  "customer",
  "executive",
  "SUPERADMIN",
  "qa_manager",
  "finance",
]);

const isManagementLens = (role) => MGMT_ROLES.has(role);

const checklistsForCompany = (cid) =>
  CHECKLISTS.filter((c) => c.company === cid);

const PRIORITY_COLOR = {
  high: "var(--rf-red)",
  medium: "var(--rf-yellow)",
  low: "var(--rf-green)",
};
const STATUS_LABEL = { open: "Open", in_prog: "In Progress", done: "Done" };
const STATUS_BG = {
  open: "rgba(59,130,246,0.12)",
  in_prog: "rgba(245,158,11,0.12)",
  done: "rgba(16,185,129,0.12)",
};
const STATUS_COLOR = {
  open: "var(--rf-accent)",
  in_prog: "var(--rf-yellow)",
  done: "var(--rf-green)",
};

// ─── Next Actions (Phase 3 PR-6) ──────────────────────────────────────────────

const MOCK_NEXT_ACTIONS = [
  {
    id: "na1",
    source: "ISSUE_ASSIGNED",
    title: "Resolve NCR #007 – cable tray support spacing non-conformance",
    cxProjectId: "p3",
    priority: "CRITICAL",
    rankScore: 98,
    dueDate: "2026-05-14",
    reason: "Blocking Level 4 energisation gate. Disposition required before IST.",
  },
  {
    id: "na2",
    source: "TASK",
    title: "Confirm load bank capacity for L5 IST",
    cxProjectId: "p1",
    priority: "HIGH",
    rankScore: 87,
    dueDate: "2026-05-16",
    reason: "IST window is fixed. Delta + Shermco coordination pending your confirmation.",
  },
  {
    id: "na3",
    source: "PSSR_PENDING",
    title: "Sign off Level 3 Pre-Start Safety Review",
    cxProjectId: "p2",
    priority: "HIGH",
    rankScore: 81,
    dueDate: "2026-05-15",
    reason: "PSSR has been submitted — your sign-off is the remaining gate.",
  },
  {
    id: "na4",
    source: "GENERIC_TASK",
    title: "Close out L2 punch list (14 items remaining)",
    cxProjectId: "p1",
    priority: "HIGH",
    rankScore: 74,
    dueDate: "2026-05-15",
    reason: "Substantial completion sign-off blocked until punch list is cleared.",
  },
  {
    id: "na5",
    source: "ISSUE_RAISED",
    title: "Review disposition on open Witness Point – L4 switchgear test",
    cxProjectId: "p4",
    priority: "NORMAL",
    rankScore: 61,
    dueDate: "2026-05-17",
    reason: "You raised this issue. Witness party has not confirmed attendance.",
  },
  {
    id: "na6",
    source: "TASK",
    title: "Verify BMS point-to-point testing schedule",
    cxProjectId: "p4",
    priority: "NORMAL",
    rankScore: 49,
    dueDate: "2026-05-18",
    reason: "OEM commissioning windows need to align before BMS contractor is booked.",
  },
];

const SOURCE_LABEL = {
  TASK: "Task",
  GENERIC_TASK: "Task",
  ISSUE_ASSIGNED: "Issue",
  ISSUE_RAISED: "Issue",
  PSSR_PENDING: "PSSR",
};

const SOURCE_COLOR = {
  TASK: "var(--rf-accent)",
  GENERIC_TASK: "var(--rf-accent)",
  ISSUE_ASSIGNED: "var(--rf-red)",
  ISSUE_RAISED: "var(--rf-yellow)",
  PSSR_PENDING: "#a78bfa",
};

const NA_PRIORITY_COLOR = {
  CRITICAL: "var(--rf-red)",
  HIGH: "var(--rf-yellow)",
  NORMAL: "var(--rf-accent)",
  LOW: "var(--rf-txt3)",
};

const TODAY = new Date();
const END_OF_WEEK = new Date(TODAY);
END_OF_WEEK.setDate(TODAY.getDate() + 7);

const isOverdue = (dueDate) => new Date(dueDate) < TODAY;
const isDueThisWeek = (dueDate) => {
  const d = new Date(dueDate);
  return d >= TODAY && d <= END_OF_WEEK;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 32 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color + "22",
        border: `1.5px solid ${color}55`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 700,
        color,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function PriorityDot({ priority }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: PRIORITY_COLOR[priority] || "var(--rf-txt3)",
        flexShrink: 0,
      }}
      title={priority}
    />
  );
}

function Tag({ label }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "2px 7px",
        borderRadius: 99,
        background: "var(--rf-bg3)",
        color: "var(--rf-txt2)",
        border: "1px solid var(--rf-border)",
        letterSpacing: "0.03em",
      }}
    >
      {label}
    </span>
  );
}

function StatusChip({ status }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 99,
        background: STATUS_BG[status] || "var(--rf-bg3)",
        color: STATUS_COLOR[status] || "var(--rf-txt2)",
        border: `1px solid ${STATUS_COLOR[status] || "var(--rf-border)"}44`,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
      }}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function TaskRow({ task, users, onStatusChange }) {
  const assignee = users.find((u) => u.id === task.assignedTo);
  const creator = users.find((u) => u.id === task.createdBy);
  const overdue = task.status !== "done" && isOverdue(task.dueDate);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 16px",
        borderBottom: "1px solid var(--rf-border)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-bg3)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Priority dot */}
      <div style={{ paddingTop: 4 }}>
        <PriorityDot priority={task.priority} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--rf-txt)",
              flex: 1,
              minWidth: 0,
            }}
          >
            {task.title}
          </span>
          <StatusChip status={task.status} />
        </div>
        {task.description && (
          <p
            style={{
              fontSize: 12,
              color: "var(--rf-txt3)",
              margin: "0 0 6px 0",
              lineHeight: 1.5,
            }}
          >
            {task.description}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {(task.tags || []).map((t) => (
            <Tag key={t} label={t} />
          ))}
          <span
            style={{
              fontSize: 11,
              color: overdue ? "var(--rf-red)" : "var(--rf-txt3)",
              marginLeft: "auto",
            }}
          >
            {overdue ? "⚠ " : ""}Due {task.dueDate}
          </span>
        </div>
      </div>

      {/* Assignee */}
      {assignee && (
        <div title={`${assignee.name}`} style={{ flexShrink: 0 }}>
          <Avatar
            initials={assignee.initials}
            color={assignee.color}
            size={28}
          />
        </div>
      )}

      {/* Quick status toggle */}
      {task.status !== "done" && (
        <button
          onClick={() => onStatusChange(task.id)}
          title="Mark done"
          style={{
            background: "transparent",
            border: "1.5px solid var(--rf-border)",
            borderRadius: 6,
            width: 28,
            height: 28,
            cursor: "pointer",
            color: "var(--rf-txt3)",
            fontSize: 14,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--rf-green)";
            e.currentTarget.style.color = "var(--rf-green)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--rf-border)";
            e.currentTarget.style.color = "var(--rf-txt3)";
          }}
        >
          ✓
        </button>
      )}
    </div>
  );
}

function NextActionRow({ action }) {
  const overdue = action.dueDate && new Date(action.dueDate) < TODAY;
  const sourceColor = SOURCE_COLOR[action.source] || "var(--rf-txt3)";
  const priorityColor = NA_PRIORITY_COLOR[action.priority] || "var(--rf-txt3)";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "13px 16px",
        borderBottom: "1px solid var(--rf-border)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-bg3)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Priority dot */}
      <div style={{ paddingTop: 4 }}>
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: priorityColor,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-txt)", flex: 1, minWidth: 0 }}>
            {action.title}
          </span>
          {/* Source badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
              background: sourceColor + "20",
              color: sourceColor,
              border: `1px solid ${sourceColor}44`,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {SOURCE_LABEL[action.source] || action.source}
          </span>
          {/* Priority badge */}
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 99,
              background: priorityColor + "18",
              color: priorityColor,
              border: `1px solid ${priorityColor}40`,
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {action.priority}
          </span>
        </div>
        {action.reason && (
          <p style={{ fontSize: 12, color: "var(--rf-txt3)", margin: "0 0 5px 0", lineHeight: 1.5 }}>
            {action.reason}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: overdue ? "var(--rf-red)" : "var(--rf-txt3)",
            }}
          >
            {overdue ? "⚠ " : ""}
            {action.dueDate ? `Due ${action.dueDate}` : "No due date"}
          </span>
          <span style={{ fontSize: 10, color: "var(--rf-txt3)", marginLeft: "auto" }}>
            Score {action.rankScore}
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, icon = "📭" }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 24px",
        color: "var(--rf-txt3)",
        fontSize: 13,
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <div>{message}</div>
    </div>
  );
}

function TaskList({ tasks, users, onStatusChange, emptyMsg }) {
  if (!tasks.length) return <EmptyState message={emptyMsg} />;
  return (
    <div>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          users={users}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

function ChecklistTable({ checklists }) {
  if (!checklists.length)
    return <EmptyState message="No open checklists." icon="☑" />;
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--rf-border)" }}>
            {["Checklist", "Progress", "Items", "Due", "Status"].map((h) => (
              <th
                key={h}
                style={{
                  padding: "10px 16px",
                  textAlign: "left",
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
          {checklists.map((c) => {
            const pct = Math.round((c.done / c.items) * 100);
            const overdue = isOverdue(c.dueDate);
            return (
              <tr
                key={c.id}
                style={{
                  borderBottom: "1px solid var(--rf-border)",
                  transition: "background 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--rf-bg3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td
                  style={{
                    padding: "12px 16px",
                    color: "var(--rf-txt)",
                    fontWeight: 500,
                  }}
                >
                  {c.title}
                </td>
                <td style={{ padding: "12px 16px", minWidth: 120 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
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
                          width: `${pct}%`,
                          height: "100%",
                          background:
                            pct === 100
                              ? "var(--rf-green)"
                              : "var(--rf-accent)",
                          borderRadius: 99,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: "var(--rf-txt2)",
                    textAlign: "center",
                  }}
                >
                  {c.done}/{c.items}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    color: overdue ? "var(--rf-red)" : "var(--rf-txt3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {overdue ? "⚠ " : ""}
                  {c.dueDate}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <StatusChip status={c.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function NewTaskModal({ onClose, onSave, users, currentUser }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: currentUser?.id || "",
    priority: "medium",
    dueDate: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: "t" + Date.now(),
      createdBy: currentUser?.id,
      company: currentUser?.company || "c1",
      status: "open",
      tags: [],
    });
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            New Task
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--rf-txt3)",
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {[
          {
            label: "Title",
            key: "title",
            type: "text",
            placeholder: "What needs to be done?",
          },
          {
            label: "Description",
            key: "description",
            type: "textarea",
            placeholder: "Optional details...",
          },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--rf-txt3)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 5,
              }}
            >
              {label}
            </label>
            {type === "textarea" ? (
              <textarea
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                rows={3}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--rf-border)",
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt)",
                  fontSize: 13,
                  resize: "vertical",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <input
                type="text"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--rf-border)",
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt)",
                  fontSize: 13,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        ))}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--rf-txt3)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 5,
              }}
            >
              Priority
            </label>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "var(--rf-bg3)",
                color: "var(--rf-txt)",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "var(--rf-txt3)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 5,
              }}
            >
              Due Date
            </label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--rf-border)",
                background: "var(--rf-bg3)",
                color: "var(--rf-txt)",
                fontSize: 13,
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--rf-txt3)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 5,
            }}
          >
            Assign To
          </label>
          <select
            value={form.assignedTo}
            onChange={(e) => set("assignedTo", e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--rf-border)",
              background: "var(--rf-bg3)",
              color: "var(--rf-txt)",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            <option value="">— Unassigned —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "1px solid var(--rf-border)",
              background: "transparent",
              color: "var(--rf-txt2)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: "var(--rf-accent)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 2000,
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-green)",
        color: "var(--rf-green)",
        padding: "10px 18px",
        borderRadius: 10,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      ✓ {msg}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPI({ label, value, sub, variant }) {
  const borderMap = {
    amber: "var(--rf-yellow)",
    green: "var(--rf-green)",
    red: "var(--rf-red)",
  };
  const colorMap = {
    amber: "var(--rf-yellow)",
    green: "var(--rf-green)",
    red: "var(--rf-red)",
  };
  return (
    <div
      style={{
        background: "var(--rf-bg2)",
        border: `1px solid ${borderMap[variant] || "var(--rf-border)"}`,
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
          color: colorMap[variant] || "var(--rf-txt)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 4 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        padding: "4px",
        background: "var(--rf-bg2)",
        border: "1px solid var(--rf-border)",
        borderRadius: 12,
        flexWrap: "wrap",
        marginBottom: 16,
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          style={{
            padding: "8px 14px",
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: active === t.key ? 700 : 500,
            transition: "all 0.15s",
            background: active === t.key ? "var(--rf-accent)" : "transparent",
            color: active === t.key ? "#fff" : "var(--rf-txt2)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>
            {t.icon} {t.label}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              minWidth: 18,
              height: 18,
              borderRadius: 99,
              background:
                active === t.key ? "rgba(255,255,255,0.25)" : "var(--rf-bg3)",
              color: active === t.key ? "#fff" : "var(--rf-txt3)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
            }}
          >
            {t.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Container ───────────────────────────────────────────────────────────

export default function MyAssignments() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("next");
  const [tasks, setTasks] = useState(TASKS);
  const [showNewTask, setShowNewTask] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [nextActions, setNextActions] = useState([]);
  const [naLoading, setNaLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = getUser();
      const u = raw ? JSON.parse(raw) : null;
      if (u) {
        const role =
          u?.activeRole?.name || u?.platformRole || u?.role || "gc_pm";
        const matched = USERS.find((x) => x.role === role) || USERS[0];
        setCurrentUser({ ...matched, ...u, role });
      } else {
        setCurrentUser(USERS[0]);
      }
    } catch {
      setCurrentUser(USERS[0]);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setNaLoading(true);
      try {
        const res = await getMyNextActions();
        const actions = res?.actions || (Array.isArray(res) ? res : []);
        setNextActions(actions.length ? actions : MOCK_NEXT_ACTIONS);
      } catch {
        setNextActions(MOCK_NEXT_ACTIONS);
      } finally {
        setNaLoading(false);
      }
    })();
  }, []);

  if (!currentUser) return null;

  const p = currentUser;
  const co = COMPANIES.find((c) => c.id === p.company) || COMPANIES[0];
  const role = p?.activeRole?.name || p?.platformRole || p?.role || "";
  const isMgmt = isManagementLens(role);

  // ── Task buckets ──────────────────────────────────────────────────────────
  const myOpenTasks = tasks.filter(
    (t) => t.assignedTo === p.id && t.status !== "done",
  );
  const myDoneTasks = tasks.filter(
    (t) => t.assignedTo === p.id && t.status === "done",
  );
  const teamTasks = tasks.filter(
    (t) => t.company === co.id && t.assignedTo !== p.id && t.status !== "done",
  );
  const tasksIAssigned = tasks.filter(
    (t) => t.createdBy === p.id && t.assignedTo !== p.id,
  );
  const overdueList = tasks.filter(
    (t) => t.assignedTo === p.id && t.status !== "done" && isOverdue(t.dueDate),
  );
  const weekList = tasks.filter(
    (t) =>
      t.assignedTo === p.id && t.status !== "done" && isDueThisWeek(t.dueDate),
  );
  const checklistList = checklistsForCompany(co.id).filter(
    (c) => c.status !== "closed",
  );

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const tabs = [
    { key: "next", icon: "⚡", label: "Next Actions", count: nextActions.length },
    { key: "mine", icon: "📋", label: "My Tasks", count: myOpenTasks.length },
    ...(isMgmt
      ? [
          {
            key: "team",
            icon: "👥",
            label: "Team Tasks",
            count: teamTasks.length,
          },
        ]
      : []),
    {
      key: "assigned",
      icon: "📤",
      label: "Tasks I Assigned",
      count: tasksIAssigned.length,
    },
    { key: "week", icon: "📅", label: "Due This Week", count: weekList.length },
    { key: "overdue", icon: "⚠", label: "Overdue", count: overdueList.length },
    { key: "done", icon: "✓", label: "Completed", count: myDoneTasks.length },
    {
      key: "check",
      icon: "☑",
      label: "Checklists",
      count: checklistList.length,
    },
  ];

  // ── Actions ───────────────────────────────────────────────────────────────
  const markDone = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)),
    );
    setToast("Task marked as done");
  };

  const addTask = (task) => {
    setTasks((prev) => [task, ...prev]);
    setToast("Task created");
  };

  // ── Body ──────────────────────────────────────────────────────────────────
  const renderBody = () => {
    const props = { users: USERS, onStatusChange: markDone };
    if (activeTab === "next") {
      if (naLoading)
        return (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>
            Loading next actions...
          </div>
        );
      if (!nextActions.length)
        return <EmptyState message="No actions in your queue. You're all caught up!" icon="⚡" />;
      return (
        <div>
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid var(--rf-border)",
              fontSize: 11,
              color: "var(--rf-txt3)",
              background: "var(--rf-bg3)",
            }}
          >
            Pre-ranked by priority and urgency — do not re-order
          </div>
          {nextActions.map((a) => (
            <NextActionRow key={a.id} action={a} />
          ))}
        </div>
      );
    }
    if (activeTab === "mine")
      return (
        <TaskList
          {...props}
          tasks={myOpenTasks}
          emptyMsg="You don't have any open tasks. Add one!"
        />
      );
    if (activeTab === "team")
      return (
        <TaskList {...props} tasks={teamTasks} emptyMsg="No open team tasks." />
      );
    if (activeTab === "assigned")
      return (
        <TaskList
          {...props}
          tasks={tasksIAssigned}
          emptyMsg="You haven't assigned any tasks yet."
        />
      );
    if (activeTab === "week")
      return (
        <TaskList
          {...props}
          tasks={weekList}
          emptyMsg="No tasks due this week. Enjoy!"
        />
      );
    if (activeTab === "overdue")
      return (
        <TaskList
          {...props}
          tasks={overdueList}
          emptyMsg="No overdue tasks. Great work!"
        />
      );
    if (activeTab === "done")
      return (
        <TaskList
          {...props}
          tasks={myDoneTasks}
          emptyMsg="No completed tasks recently."
        />
      );
    if (activeTab === "check")
      return <ChecklistTable checklists={checklistList} />;
    return null;
  };

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      {/* ── Page header ────────────────────────────────────────────────── */}
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
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: "var(--rf-txt)",
            }}
          >
            My Work
          </h1>
          <p
            style={{ margin: "4px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}
          >
            {p.name} ·{" "}
            <span style={{ textTransform: "capitalize" }}>
              {role.replace(/_/g, " ")}
            </span>{" "}
            at {co.name}
            {isMgmt && (
              <span
                style={{
                  marginLeft: 8,
                  color: "var(--rf-accent)",
                  fontWeight: 700,
                }}
              >
                ⭐ management view
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowNewTask(true)}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              background: "var(--rf-accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────────────── */}
      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}
      >
        <KPI
          label="My Open Tasks"
          value={myOpenTasks.length}
          variant={myOpenTasks.length > 0 ? "amber" : undefined}
        />
        {isMgmt && (
          <KPI label={`Team Tasks (${co.name})`} value={teamTasks.length} />
        )}
        <KPI
          label="Due This Week"
          value={weekList.length}
          variant={weekList.length > 0 ? "amber" : undefined}
        />
        {overdueList.length > 0 && (
          <KPI label="Overdue" value={overdueList.length} variant="red" />
        )}
        <KPI label="Open Checklists" value={checklistList.length} />
        <KPI
          label="Tasks Completed"
          value={myDoneTasks.length}
          variant="green"
        />
      </div>

      {/* ── Main card ──────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "16px 16px 0" }}>
          <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>
        {renderBody()}
      </div>

      {/* ── Modals / Toasts ────────────────────────────────────────────── */}
      {showNewTask && (
        <NewTaskModal
          onClose={() => setShowNewTask(false)}
          onSave={addTask}
          users={USERS}
          currentUser={p}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
