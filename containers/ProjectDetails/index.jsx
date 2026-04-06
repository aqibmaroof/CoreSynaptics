"use client";
import { FaCircle, FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AddTeamsToProjects,
  AddUsersToProjects,
  DeleteProjects,
  DeleteTeamsToProjects,
  DeleteUsersToProjects,
  getProjects,
  GetProjectsById,
  UpdateProjects,
} from "@/services/Projects";
import { getUsers } from "@/services/Users";
import CircularProgress from "@/Utils/CustomProgress";
import {
  DeleteSite,
  GetSiteById,
  GetSites,
  UpdateSite,
} from "@/services/Sites";
import {
  DeleteZone,
  GetZoneById,
  GetZones,
  UpdateZone,
} from "@/services/Zones";
import {
  DeleteEquipment,
  GetEquipmentById,
  GetEquipments,
  UpdateEquipment,
} from "@/services/Equipment";
import {
  CreateTask,
  getAllTasks,
  updateTask,
  DeleteTask,
} from "@/services/Tasks";
import {
  createSubTask,
  getSubTasksByTaskId,
  updateSubTaskByTaskId,
  deleteSubTaskByTaskId,
} from "@/services/SubTasks";
import { getTeams } from "@/services/Teams";
import MultiSelectDropdown from "@/components/MultiSelectDropDown";
import EntityModal from "@/components/EntityModal";

// Helper function to get all unique keys from an array of objects
const getTableHeaders = (data) => {
  if (!data || data.length === 0) return [];

  // Get all unique keys from all objects
  const allKeys = new Set();
  data.forEach((item) => {
    Object.keys(item).forEach((key) => {
      // Skip nested objects that shouldn't be displayed as columns
      if (key !== "assignedUsers" && key !== "team" && key !== "organization") {
        if (key === "metadata" && item.metadata) {
          // Expand metadata fields as separate columns
          Object.keys(item.metadata).forEach((metaKey) => {
            allKeys.add(`metadata.${metaKey}`);
          });
        } else {
          allKeys.add(key);
        }
      } else if (key === "organization") {
        // Add organization fields as separate columns
        allKeys.add("organizationName");
        allKeys.add("organizationType");
        allKeys.add("organizationStatus");
      } else if (key === "assignedUsers") {
        allKeys.add("assignedUsersCount");
      }
    });
  });

  // Define priority order for columns
  const priorityOrder = [
    "name",
    "type",
    "status",
    "organizationName",
    "organizationType",
  ];

  // Sort keys based on priority order
  const sortedKeys = Array.from(allKeys).sort((a, b) => {
    const aIndex = priorityOrder.indexOf(a);
    const bIndex = priorityOrder.indexOf(b);

    // If both keys are in priorityOrder, sort by their index
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    // If only a is in priorityOrder, a comes first
    if (aIndex !== -1) {
      return -1;
    }
    // If only b is in priorityOrder, b comes first
    if (bIndex !== -1) {
      return 1;
    }
    // If neither is in priorityOrder, sort alphabetically
    return a.localeCompare(b);
  });

  return sortedKeys;
};

// Update getCellValue to handle metadata fields
const getCellValue = (item, header) => {
  // Handle custom organization fields
  if (header === "organizationName") {
    return item.organization?.name || "-";
  }
  if (header === "organizationType") {
    return item.organization?.type || "-";
  }
  if (header === "organizationStatus") {
    return item.organization?.status || "-";
  }
  if (header === "assignedUsersCount") {
    return item.assignedUsers?.length || 0;
  }

  // Handle metadata fields
  if (header.startsWith("metadata.")) {
    const metaKey = header.replace("metadata.", "");
    return item.metadata?.[metaKey] || "-";
  }

  // Return regular field
  return item[header];
};
// Helper function to format cell values
const formatCellValue = (value) => {
  if (value === null || value === undefined) return "-";
  if (typeof value === "object" && !Array.isArray(value))
    return JSON.stringify(value).slice(0, 50);
  if (Array.isArray(value)) {
    // Special handling for readinessGates array
    if (value.length > 0 && value[0]?.gate && value[0]?.status) {
      return (
        <div className="flex flex-col gap-1">
          {value.map((gate, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {gate.gate?.replace(/_/g, " ")}:
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  gate.status === "APPROVED" || gate.status === "PASSED"
                    ? "bg-green-500/20 text-green-400"
                    : gate.status === "PENDING"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : gate.status === "REJECTED" || gate.status === "FAILED"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {gate.status}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return JSON.stringify(value).slice(0, 50);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (
    value instanceof Date ||
    (typeof value === "string" && value.includes("T") && value.includes("Z"))
  ) {
    return new Date(value).toLocaleDateString();
  }
  return String(value);
};

// Helper function to render cell content based on key and value
// Helper function to render cell content based on key and value
const renderCellContent = (item, header, activeView) => {
  const value = getCellValue(item, header);
  console.log(header, value);

  // Handle readinessGates specially
  if (header === "readinessGates" && Array.isArray(item.readinessGates)) {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        {item.readinessGates.map((gate, idx) => (
          <div key={idx} className="flex items-center justify-center gap-2">
            <span className="text-xs text-gray-400">
              {gate.gate?.replace(/_/g, " ")}:
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                gate.status === "APPROVED" || gate.status === "PASSED"
                  ? "bg-green-500/20 text-green-400"
                  : gate.status === "PENDING"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : gate.status === "REJECTED" || gate.status === "FAILED"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-500/20 text-gray-400"
              }`}
            >
              {gate.status}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Handle organization status
  if (header === "organizationStatus") {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          value === "ACTIVE"
            ? "bg-green-500/20 text-green-400"
            : value === "INACTIVE"
              ? "bg-red-500/20 text-red-400"
              : "bg-yellow-500/20 text-yellow-400"
        }`}
      >
        {value}
      </span>
    );
  }

  // Handle organization type
  if (header === "organizationType") {
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
        {value}
      </span>
    );
  }

  // Handle assigned users count
  if (header === "assignedUsersCount") {
    return (
      <div className="flex items-center justify-center gap-1">
        <span className="text-white font-medium">{value}</span>
        {value > 0 && (
          <div className="flex items-center justify-center -space-x-2">
            {item.assignedUsers?.slice(0, 3).map((user, idx) => (
              <div
                key={user.id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold border border-white"
                title={`${user.firstName} ${user.lastName}`}
              >
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            ))}
            {item.assignedUsers?.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-white font-bold border border-white">
                +{item.assignedUsers.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle status fields with badges
  if (
    header === "status" ||
    header === "safetyStatus" ||
    header === "permitStatus"
  ) {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          value === "ACTIVE" ||
          value === "APPROVED" ||
          value === "READY" ||
          value === "COMPLETED" ||
          value === "OPERATIONAL"
            ? "bg-green-500/20 text-green-400"
            : value === "PENDING" ||
                value === "NOT_READY" ||
                value === "PLANNING" ||
                value === "MAINTENANCE"
              ? "bg-yellow-500/20 text-yellow-400"
              : value === "REJECTED" ||
                  value === "FAILED" ||
                  value === "CANCELLED" ||
                  value === "DECOMMISSIONED"
                ? "bg-red-500/20 text-red-400"
                : value === "IN_PROGRESS" || value === "INSTALLING"
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-gray-500/20 text-gray-400"
        }`}
      >
        {value?.replace(/_/g, " ")}
      </span>
    );
  }

  // Handle lifecyclePhase for equipment
  if (header === "lifecyclePhase") {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          value === "ORDERED"
            ? "bg-purple-500/20 text-purple-400"
            : value === "MANUFACTURING"
              ? "bg-indigo-500/20 text-indigo-400"
              : value === "FAT"
                ? "bg-blue-500/20 text-blue-400"
                : value === "SHIPPED"
                  ? "bg-cyan-500/20 text-cyan-400"
                  : value === "INSTALLED"
                    ? "bg-green-500/20 text-green-400"
                    : value === "COMMISSIONED"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-gray-500/20 text-gray-400"
        }`}
      >
        {value?.replace(/_/g, " ")}
      </span>
    );
  }

  // Handle name with avatar (different colors for different entity types)
  if (header === "name") {
    // Determine gradient based on activeView
    let gradientClass = "from-blue-400 to-purple-500";
    if (activeView === "Zones") {
      gradientClass = "from-green-400 to-teal-500";
    } else if (activeView === "Assets") {
      gradientClass = "from-orange-400 to-red-500";
    } else if (activeView === "Projects") {
      gradientClass = "from-blue-400 to-purple-500";
    } else if (activeView === "Sites") {
      gradientClass = "from-blue-400 to-purple-500";
    }

    return (
      <div className="flex items-center justify-center gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold`}
        >
          {value?.charAt(0) || "?"}
        </div>
        <span className="text-white font-medium">{value}</span>
      </div>
    );
  }

  // Handle type fields with badge
  if (
    header === "type" ||
    header === "projectType" ||
    header === "zoneType" ||
    header === "equipmentType"
  ) {
    return (
      <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
        {value?.replace(/_/g, " ") || "-"}
      </span>
    );
  }

  // Handle serial number for equipment
  if (header === "serialNumber") {
    return <span className="text-gray-300 font-mono text-xs">{value}</span>;
  }

  // Handle certification requirement
  if (header === "certificationReq") {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          value === "REQUIRED"
            ? "bg-red-500/20 text-red-400"
            : value === "NOT_REQUIRED"
              ? "bg-gray-500/20 text-gray-400"
              : "bg-yellow-500/20 text-yellow-400"
        }`}
      >
        {value?.replace(/_/g, " ") || "-"}
      </span>
    );
  }

  // Handle metadata (truncate for display)
  if (header === "metadata") {
    const metadataStr = JSON.stringify(value, null, 2);
    const previewStr = JSON.stringify(value).slice(0, 50);
    const hasMore = JSON.stringify(value).length > 50;

    return (
      <div className="relative group">
        <div className="max-w-[200px] truncate cursor-help" title={metadataStr}>
          <span className="text-gray-400 text-xs">
            {previewStr}
            {hasMore ? "..." : ""}
          </span>
        </div>
        {/* Optional: Add a hover tooltip with full metadata */}
        <div className="absolute left-0 top-full mt-2 z-10 hidden group-hover:block bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[300px]">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap">
            {metadataStr}
          </pre>
        </div>
      </div>
    );
  }

  // Handle dates
  if (
    header === "startDate" ||
    header === "endDate" ||
    header === "createdAt" ||
    header === "updatedAt"
  ) {
    return <span className="text-gray-300">{formatCellValue(value)}</span>;
  }

  // Handle capacity or numeric fields
  if (
    header === "capacity" ||
    header === "minCardinality" ||
    header === "maxCardinality"
  ) {
    return <span className="text-gray-300 font-mono">{value || "-"}</span>;
  }

  // Handle boolean fields
  if (
    header === "bidirectional" ||
    header === "required" ||
    header === "isSystemRelationship"
  ) {
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          value
            ? "bg-green-500/20 text-green-400"
            : "bg-gray-500/20 text-gray-400"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  // Default formatting
  return <span className="text-gray-300">{formatCellValue(value)}</span>;
};

const CapitalizeText = (text) => {
  return text
    .replace(/([A-Z])/g, " $1") // insert space before each uppercase letter
    .replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize first letter of each word
    .trim(); // remove any leading space
};

const formatToDatetimeLocal = (isoString) => {
  if (!isoString) return "";
  return isoString.slice(0, 16); // "2026-03-07T18:41"
};

const tasks = [
  {
    id: 1,
    taskName: "Finalize Project Proposal",
    project: "Website Redesign",
    estimation: "01 Nov - 7 Nov 2026",
    priority: "Urgent",
    progress: "80%",
    assignee: [
      {
        id: 1,
        name: "Rainer Brown",
        email: "Rainerbrown@mail.com",
        avatar: "/images/assignee1.jpg",
        bgColor: "bg-purple-500/20",
      },
      {
        id: 2,
        name: "Conny Rany",
        email: "connyrany@mail.com",
        avatar: "/images/assignee2.jpg",
        bgColor: "bg-emerald-500/20",
      },
      {
        id: 3,
        name: "Armin Falcon",
        email: "arfalcon@mail.com",
        avatar: "/images/assignee3.jpg",
        bgColor: "bg-gray-500/20",
      },
    ],
  },
  // {
  //   id: 2,
  //   taskName: "Finalize Project Proposal",
  //   project: "Website Redesign",
  //   estimation: "01 Nov - 7 Nov 2026",
  //   priority: "Urgent",
  //   progress: "80%",
  //   assignee: [
  //     {
  //       id: 1,
  //       name: "Rainer Brown",
  //       email: "Rainerbrown@mail.com",
  //       avatar: "/images/assignee1.jpg",
  //       bgColor: "bg-purple-500/20",
  //     },
  //     {
  //       id: 2,
  //       name: "Conny Rany",
  //       email: "connyrany@mail.com",
  //       avatar: "/images/assignee2.jpg",
  //       bgColor: "bg-emerald-500/20",
  //     },
  //     {
  //       id: 3,
  //       name: "Armin Falcon",
  //       email: "arfalcon@mail.com",
  //       avatar: "/images/assignee3.jpg",
  //       bgColor: "bg-gray-500/20",
  //     },
  //   ],
  // },
];
export default function KanbanBoard() {
  const router = useRouter();
  const params = useParams();
  const { parentCategory, type, id, subId } = params;
  const [message, setMessage] = useState({ type: "", text: "" });
  const [users, setUsers] = useState([]);
  const [view, setView] = useState("list");
  const [activeView, setActiveView] = useState("task");
  const [searchTerm, setSearchTerm] = useState("");
  const [sites, setSites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [zones, setZones] = useState([]);
  const [equipments, setEquipments] = useState([]);

  // Task and Sub-Task
  const [tasksList, setTasksList] = useState([]);
  const [subtasksList, setSubtasksList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null); // clicked task for subtask creation
  const [taskForm, setTaskForm] = useState({
    name: "",
    description: "",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    category: "General",
  });
  const [editingTask, setEditingTask] = useState(null); // task being edited
  const [editingSubtask, setEditingSubtask] = useState(null); // subtask being edited
  const [teams, setTeams] = useState([]);

  const [editTaskForm, setEditTaskForm] = useState({
    name: "",
    description: "",
    priority: "Medium",
    startDate: "",
    dueDate: "",
    category: "General",
    status: "PENDING",
  });
  const [editSubtaskForm, setEditSubtaskForm] = useState({
    name: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    category: "General",
    status: "PENDING",
  });
  const [subtaskInputs, setSubtaskInputs] = useState([
    {
      name: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      category: "General",
    },
  ]);
  const [taskLoading, setTaskLoading] = useState(false);

  // EntityModal state
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [entityModalType, setEntityModalType] = useState(""); // "site", "zone", "equipment"
  const [entityModalParentId, setEntityModalParentId] = useState(null);

  const [form, setForm] = useState({
    // Project fields
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    timezone: "",
    address: "",
    contractValue: null,
    clientName: "",
    assignee: [],
    team: [],
    projectType: "",
    // Site fields
    location: "",
    status: "",
    safetyStatus: "",
    permitStatus: "",
    // Zone fields
    zoneType: "",
    capacity: "",
    coolingType: "",
    // Equipment fields
    serialNumber: "",
    equipmentType: "",
    lifecyclePhase: "",
    certificationReq: "",
  });

  const isSite = type === "Project";
  const isProject = type === "Site";
  const isZone = type === "Projects";
  const isEquipment = type === "Zone";

  useEffect(() => {
    if (id) {
      getProjectDetails();
      fetchTasks();
    }
    if (isSite) {
      getUsersList();
      getSites();
      setActiveView("Sites");
    }
    if (isProject) {
      getProjectList();
      setActiveView("Projects");
    }
    if (isZone) {
      getZones();
      setActiveView("Zones");
    }
    if (isEquipment) {
      getEquipments();
      setActiveView("Assets");
    }
    if (tasksList.length > 0) {
      fetchSubtasks();
    }
    GetAllTeams();
  }, [id, tasksList.length]);

  // Separate effect: fetch subtasks once tasksList is populated

  const fetchTasks = async () => {
    try {
      // Build query param based on current type
      const params = {};
      if (type === "Project") params.projectId = id;
      else if (type === "Projects") params.subProjectId = id;
      else if (type === "Site") params.siteId = id;
      else if (type === "Zone") params.zoneId = id;
      else if (type === "Equipment") params.equipmentId = id;

      const res = await getAllTasks(params);
      setTasksList(res || []);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  const fetchSubtasks = async (taskId = null) => {
    try {
      if (taskId) {
        // Fetch subtasks for a specific task
        const res = await getSubTasksByTaskId(taskId);
        setSubtasksList((prev) => {
          // Merge: remove old subtasks for this taskId, add new ones
          const others = prev.filter((s) => s.taskId !== taskId);
          return [...others, ...(res || [])];
        });
      } else {
        // Fetch subtasks for ALL tasks in tasksList
        const allSubs = [];
        for (const task of tasksList) {
          try {
            const res = await getSubTasksByTaskId(task.id);
            allSubs.push(...(res || []));
          } catch (_) {}
        }
        setSubtasksList(allSubs);
      }
    } catch (error) {
      console.log("Error fetching subtasks:", error);
    }
  };

  const createTask = async () => {
    if (!taskForm.name) {
      setMessage({ type: "error", text: "Task name is required" });
      return;
    }
    setTaskLoading(true);
    try {
      // Build payload with only the relevant ID for the current type
      const payload = {
        name: taskForm.name,
        description: taskForm.description,
        priority: taskForm.priority || "Medium",
        startDate: taskForm.startDate || "",
        dueDate: taskForm.dueDate || "",
        category: taskForm.category || "General",
        ...(type === "Project" && { projectId: id }),
        ...(type === "Projects" && { subProjectId: id }),
        ...(type === "Site" && { siteId: id }),
        ...(type === "Zone" && { zoneId: id }),
        ...(type === "Equipment" && { equipmentId: id }),
      };

      await CreateTask(payload);
      setMessage({ type: "success", text: "Task created successfully! 🚀" });
      setTaskForm({
        name: "",
        description: "",
        priority: "Medium",
        startDate: "",
        dueDate: "",
        category: "General",
      });
      setSubtaskInputs([
        {
          name: "",
          description: "",
          priority: "Medium",
          dueDate: "",
          category: "General",
        },
      ]);
      setSelectedTask(null);
      await fetchTasks();
      document.getElementById("my_modal_4").close();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error creating task: ${error?.message}`,
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const createSubtask = async () => {
    if (!selectedTask) {
      setMessage({
        type: "error",
        text: "Please select a task first to add subtasks",
      });
      return;
    }
    const validSubtasks = subtaskInputs.filter((s) => s.name);
    if (!validSubtasks.length) {
      setMessage({
        type: "error",
        text: "At least one subtask name is required",
      });
      return;
    }
    setTaskLoading(true);
    try {
      for (const subtask of validSubtasks) {
        await createSubTask(selectedTask.id, {
          name: subtask.name,
          description: subtask.description,
          priority: subtask.priority || "Medium",
          dueDate: subtask.dueDate || "",
          category: subtask.category || "General",
        });
      }
      setMessage({
        type: "success",
        text: "Subtasks created successfully! 🚀",
      });
      setSubtaskInputs([
        {
          name: "",
          description: "",
          priority: "Medium",
          dueDate: "",
          category: "General",
        },
      ]);
      await fetchSubtasks(selectedTask.id);
      document.getElementById("my_modal_4").close();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error creating subtask: ${error?.message}`,
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const GetAllTeams = async () => {
    try {
      const res = await getTeams();
      setTeams(res);
    } catch (error) {
      console.error("error Fetching data", error.message);
    }
  };
  const deleteTask = async (e, taskId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await DeleteTask(taskId);
      setMessage({ type: "success", text: "Task deleted successfully!" });
      // Also clear subtasks for this task from local state
      setSubtasksList((prev) => prev.filter((s) => s.taskId !== taskId));
      await fetchTasks();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error deleting task: ${error?.message}`,
      });
    }
  };

  const deleteSubtask = async (e, taskId, subtaskId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteSubTaskByTaskId(taskId, subtaskId);
      setMessage({ type: "success", text: "Subtask deleted successfully!" });
      setSubtasksList((prev) => prev.filter((s) => s.id !== subtaskId));
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error deleting subtask: ${error?.message}`,
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    setTaskLoading(true);
    try {
      await updateTask(editingTask.id, editTaskForm);
      setMessage({ type: "success", text: "Task updated successfully! 🚀" });
      setEditingTask(null);
      await fetchTasks();
      document.getElementById("edit_task_modal").close();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error updating task: ${error?.message}`,
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const handleUpdateSubtask = async () => {
    if (!editingSubtask) return;
    setTaskLoading(true);
    try {
      await updateSubTaskByTaskId(
        editingSubtask.taskId,
        editingSubtask.id,
        editSubtaskForm,
      );
      setMessage({ type: "success", text: "Subtask updated successfully! 🚀" });
      setEditingSubtask(null);
      await fetchSubtasks(editingSubtask.taskId);
      document.getElementById("edit_subtask_modal").close();
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error updating subtask: ${error?.message}`,
      });
    } finally {
      setTaskLoading(false);
    }
  };

  const getUsersList = async () => {
    try {
      const res = await getUsers();
      setUsers(res);
    } catch (error) {
      console.log("error fetching users : ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const updateProject = async (e) => {
    e.preventDefault();
    try {
      // ── PROJECT ──
      if (type === "Project" || type === "Projects") {
        const payload = {
          name: form?.name,
          description: form?.description,
          startDate: form?.startDate,
          endDate: form?.endDate,
          timezone: form?.timezone,
          address: form?.address,
          metadata: {
            contractValue: form?.contractValue,
            clientName: form?.clientName,
          },
        };
        const requiredFields = [
          "name",
          "description",
          "startDate",
          "endDate",
          "timezone",
          "address",
        ];
        for (const field of requiredFields) {
          if (!payload[field]) {
            setMessage({
              type: "error",
              text: `Missing value for field: ${CapitalizeText(field)}`,
            });
            return;
          }
        }
        await UpdateProjects(id, payload);
        setMessage({
          type: "success",
          text: "Project Updated successfully! 🚀",
        });
      }

      // ── SITE ──
      else if (type === "Site") {
        const payload = {
          name: form?.name,
          location: form?.location,
          status: form?.status,
          safetyStatus: form?.safetyStatus,
          permitStatus: form?.permitStatus,
        };
        const requiredFields = ["name", "location"];
        for (const field of requiredFields) {
          if (!payload[field]) {
            setMessage({
              type: "error",
              text: `Missing value for field: ${CapitalizeText(field)}`,
            });
            return;
          }
        }
        await UpdateSite(subId, id, payload); // subId = projectId, id = siteId
        setMessage({ type: "success", text: "Site Updated successfully! 🚀" });
      }

      // ── ZONE ──
      else if (type === "Zone") {
        const payload = {
          name: form?.name,
          type: form?.zoneType,
          metadata: {
            capacity: form?.capacity,
            coolingType: form?.coolingType,
          },
        };
        const requiredFields = ["name"];
        for (const field of requiredFields) {
          if (!payload[field]) {
            setMessage({
              type: "error",
              text: `Missing value for field: ${CapitalizeText(field)}`,
            });
            return;
          }
        }
        await UpdateZone(subId, id, payload); // subId = siteId, id = zoneId
        setMessage({ type: "success", text: "Zone Updated successfully! 🚀" });
      }

      // ── EQUIPMENT ──
      else if (type === "Equipment") {
        const payload = {
          name: form?.name,
          serialNumber: form?.serialNumber,
          type: form?.equipmentType,
          status: form?.status,
          lifecyclePhase: form?.lifecyclePhase,
          certificationReq: form?.certificationReq,
        };
        const requiredFields = ["name", "serialNumber"];
        for (const field of requiredFields) {
          if (!payload[field]) {
            setMessage({
              type: "error",
              text: `Missing value for field: ${CapitalizeText(field)}`,
            });
            return;
          }
        }
        await UpdateEquipment(subId, id, payload); // subId = projectId, id = equipmentId
        setMessage({
          type: "success",
          text: "Equipment Updated successfully! 🚀",
        });
      }

      setTimeout(() => router.back(), 2000);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error updating: ${error?.message}` || "Error updating.",
      });
    }
  };

  const getProjectDetails = async () => {
    try {
      // type === "Project" means we're viewing a Project → fetch by project id
      if (type === "Project" || type === "Projects") {
        const res = await GetProjectsById(id);
        setForm({
          name: res?.name || "",
          description: res?.description || "",
          startDate: formatToDatetimeLocal(res?.startDate),
          endDate: formatToDatetimeLocal(res?.endDate),
          timezone: res?.timezone || "",
          address: res?.address || "",
          contractValue: res?.metadata?.contractValue || null,
          clientName: res?.metadata?.clientName || "",
          assignee: res?.assignedUsers || [],
          team: res?.team?.id ? [res?.team] : [],
          projectType: res?.projectType || "",
          // reset other fields
          location: "",
          status: "",
          safetyStatus: "",
          permitStatus: "",
          zoneType: "",
          serialNumber: "",
          equipmentType: "",
          lifecyclePhase: "",
          certificationReq: "",
          coolingType: "",
          capacity: "",
        });
      }

      // type === "Zones" means we're viewing a Zone → subId = siteId, id = zoneId
      else if (type === "Zone") {
        const res = await GetZoneById(id, subId);
        setForm({
          name: res?.name || "",
          zoneType: res?.type || "",
          coolingType: res.metadata?.coolingType,
          capacity: res.metadata?.capacity,
          // reset others
          description: "",
          startDate: "",
          endDate: "",
          timezone: "",
          address: "",
          contractValue: null,
          clientName: "",
          assignee: [],
          projectType: "",
          location: "",
          status: "",
          safetyStatus: "",
          permitStatus: "",
          serialNumber: "",
          equipmentType: "",
          lifecyclePhase: "",
          certificationReq: "",
        });
      }

      // type === "Equipment" means we're viewing Equipment → subId = projectId, id = equipmentId
      else if (type === "Equipment") {
        const res = await GetEquipmentById(subId, id);
        setForm({
          name: res?.name || "",
          serialNumber: res?.serialNumber || "",
          equipmentType: res?.type || "",
          status: res?.status || "",
          lifecyclePhase: res?.lifecyclePhase || "",
          certificationReq: res?.certificationReq || "",
          // reset others
          description: "",
          startDate: "",
          endDate: "",
          timezone: "",
          address: "",
          contractValue: null,
          clientName: "",
          assignee: [],
          projectType: "",
          location: "",
          safetyStatus: "",
          permitStatus: "",
          zoneType: "",
          coolingType: "",
          capacity: "",
        });
      }

      // type Site
      else if (type === "Site") {
        const res = await GetSiteById(subId, id);
        setForm({
          name: res?.name || "",
          location: res?.location || "",
          status: res?.status || "",
          safetyStatus: res?.safetyStatus || "",
          permitStatus: res?.permitStatus || "",
          // reset others
          description: "",
          startDate: "",
          endDate: "",
          timezone: "",
          address: "",
          contractValue: null,
          clientName: "",
          assignee: [],
          projectType: "",
          zoneType: "",
          serialNumber: "",
          equipmentType: "",
          lifecyclePhase: "",
          certificationReq: "",
          coolingType: "",
          capacity: "",
        });
      }
    } catch (error) {
      console.log(`Error fetching details`, error);
    }
  };

  const DeleteUserFromProject = async (ItemId) => {
    try {
      await DeleteUsersToProjects(id, ItemId);

      setMessage({
        type: "success",
        text: "User Deleted from Project successfully! 🚀",
      });
      getProjectDetails();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          `Error Deleting User From Project : ${error?.message}` ||
          "Error Deleting User From Project.",
      });
    }
  };

  const handleAssignProject = async (item) => {
    try {
      setForm({
        ...form,
        assignee: [...(form.assignee || []), item], // ✅ update UI
        assigneeId: item.id,
      });

      const payload = {
        userId: item.id, // ✅ FIXED
        siteId: null,
      };

      const requiredFields = ["userId"];

      for (const field of requiredFields) {
        const value = payload[field];
        if (!value) {
          setMessage({
            type: "error",
            text: `Missing value for field: ${field}`,
          });
          return;
        }
      }

      await AddUsersToProjects(id, payload);

      setMessage({
        type: "success",
        text: "Project Assigned to user successfully! 🚀",
      });
      getProjectDetails();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          `Error assigning User To Project : ${error?.message}` ||
          "Error assigning User To Project.",
      });
    }
  };

  const DeleteTeamFromProject = async (ItemId) => {
    try {
      await DeleteTeamsToProjects(id, ItemId);

      setMessage({
        type: "success",
        text: "Team Deleted from Project successfully! 🚀",
      });
      getProjectDetails();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          `Error Deleting Team From Project  : ${error?.message}` ||
          "Error Deleting Team From Project.",
      });
    }
  };

  const handleAssignTeamToProject = async (item) => {
    try {
      setForm({
        ...form,
        team: [...(form.team || []), item?.id], // ✅ update UI
      });

      const payload = {
        teamId: item.id, // ✅ FIXED
      };

      const requiredFields = ["teamId"];

      for (const field of requiredFields) {
        const value = payload[field];
        if (!value) {
          setMessage({
            type: "error",
            text: `Missing value for field: ${field}`,
          });
          return;
        }
      }

      await AddTeamsToProjects(id, payload);

      setMessage({
        type: "success",
        text: "Project Assigned to team successfully! 🚀",
      });
      getProjectDetails();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          `Error assigning Project To Team : ${error?.message}` ||
          "Error assigning Project To Team.",
      });
    }
  };

  const getSites = async () => {
    try {
      const res = await GetSites(id);
      setSites(res);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectList = async () => {
    try {
      const res = await getProjects(25, 1, id, params?.subId);
      setProjects(res?.projects || []);
    } catch (error) {
      console.log(error);
    }
  };

  const getZones = async () => {
    try {
      const res = await GetZones(id);
      setZones(res);
    } catch (error) {
      console.log(error);
    }
  };

  const getEquipments = async () => {
    try {
      const res = await GetEquipments(id);
      setEquipments(res);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteFunction = async (e, deleteType, siteId) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      if (deleteType === "Sites") {
        await DeleteSite(id, siteId);
      } else if (deleteType === "Projects") {
        await DeleteProjects(siteId);
      } else if (deleteType === "Zones") {
        await DeleteZone(id, siteId);
      } else if (deleteType === "Assets") {
        await DeleteEquipment(id, siteId);
      }
      if (deleteType === "Sites") {
        getSites();
      } else if (deleteType === "Projects") {
        getProjectList();
      } else if (deleteType === "Zones") {
        getZones();
      } else if (deleteType === "Assets") {
        getEquipments();
      }
      setMessage({
        type: "success",
        text: `${
          deleteType === "Sites"
            ? "Site"
            : deleteType === "Projects"
              ? "Sub Project"
              : deleteType === "Zones"
                ? "Zone"
                : deleteType === "Assets"
                  ? "Asset"
                  : ""
        } Deleted Successfully !`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message,
      });
    }
  };
  return (
    <div className="min-h-screen font-gilroy p-6 text-white">
      <div className="w-full flex items-center justtify-between gap-5">
        <h1 className="font-bold text-2xl text-white">
          {form?.name ? form?.name : "Delta Developers"}
        </h1>

        <div className="flex items-center gap-5 ml-auto">
          {/* Status Messages */}
          {message.text && (
            <div
              className={` px-3 py-2 rounded-lg text-sm animate-fade-in ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-500/30"
                  : "bg-red-900/30 text-red-400 border border-red-500/30"
              }`}
            >
              {message.text}
            </div>
          )}
          <button
            onClick={(e) => updateProject(e)}
            className="ml-auto bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white font-[510] py-2 px-4 border border-1 border-white p-2 my-2 rounded-xl rounded-xl transition-all cursor-pointer w-50"
          >
            {type === "Zone"
              ? "Update Zone"
              : type === "Equipment"
                ? "Update Equipment"
                : type === "Projects"
                  ? "Update Area"
                  : type === "Site"
                    ? "Update Site "
                    : "Update Project"}
          </button>
        </div>
      </div>
      <div className="w-250 font-gilroy mt-6 mb-6 text-[#A0AEC0]">
        {/* ── Common: Name ── */}
        <div className="flex justify-left gap-28 items-center">
          <h2>Name:</h2>
          <input
            className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
            type="text"
            name="name"
            value={form?.name}
            onChange={handleChange}
            placeholder="Name"
          />
        </div>

        {/* ── PROJECT & SITE fields ── */}
        {(type === "Project" || type === "Projects") && (
          <>
            <div className="flex items-center justify-left gap-19 mt-3">
              <span className="text-slate-400">Description:</span>
              <input
                type="text"
                placeholder="Project Description"
                name="description"
                value={form?.description}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Start Date:</h2>
              <input
                type="datetime-local"
                name="startDate"
                value={form?.startDate}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-22 items-center mt-3">
              <h2>End Date:</h2>
              <input
                type="datetime-local"
                name="endDate"
                value={form?.endDate}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Time Zone:</h2>
              <input
                type="text"
                placeholder="Time Zone"
                name="timezone"
                value={form?.timezone}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-24 items-center mt-3">
              <h2>Address:</h2>
              <input
                type="text"
                placeholder="Address"
                name="address"
                value={form?.address}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-11 items-center mt-3">
              <h2>Contract Value:</h2>
              <input
                type="text"
                placeholder="Contract Value"
                name="contractValue"
                value={form?.contractValue}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-16 items-center mt-3">
              <h2>Client Name:</h2>
              <input
                type="text"
                placeholder="Client Name"
                name="clientName"
                value={form?.clientName}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Project Type:</h2>
              <select
                onChange={(e) =>
                  setForm({ ...form, projectType: e.target.value })
                }
                value={form?.projectType}
                className="select border border-1 border-white p-2 my-2 rounded-xl shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="">Select Project Type</option>
                {[
                  { name: "ZONE" },
                  { name: "ASSETS" },
                  { name: "SITE" },
                  { name: "OTHERS" },
                ].map((item, index) => (
                  <option value={item.name} key={index}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <MultiSelectDropdown
              label="Assign Users"
              options={users}
              selected={form?.assignee || []}
              setSelected={handleAssignProject}
              deleteUser={DeleteUserFromProject}
            />
            <MultiSelectDropdown
              label="Assign Team"
              options={teams}
              selected={form?.team || []}
              setSelected={handleAssignTeamToProject}
              deleteUser={DeleteTeamFromProject}
              setMessage={setMessage}
            />
          </>
        )}

        {/* ── SITE fields ── */}
        {type === "Site" && (
          <>
            <div className="flex justify-left gap-24 items-center mt-3">
              <h2>Location:</h2>
              <input
                type="text"
                placeholder="Location"
                name="location"
                value={form?.location}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Status:</h2>
              <select
                name="status"
                value={form?.status}
                onChange={handleChange}
                className="select border border-1 border-white p-2 my-2 rounded-xl shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="NOT_READY">NOT_READY</option>
                <option value="READY">READY</option>
                <option value="ACTIVE">ACTIVE</option>
              </select>
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Safety Status:</h2>
              <select
                name="safetyStatus"
                value={form?.safetyStatus}
                onChange={handleChange}
                className="select border border-1 border-white p-2 my-2 rounded-xl shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Permit Status:</h2>
              <select
                name="permitStatus"
                value={form?.permitStatus}
                onChange={handleChange}
                className="select border border-1 border-white p-2 my-2 rounded-xl shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </>
        )}

        {/* ── ZONE fields ── */}
        {type === "Zone" && (
          <>
            <div className="flex justify-left gap-28 items-center mt-3">
              <h2>Zone Type:</h2>
              <input
                type="text"
                placeholder="Zone Type"
                name="zoneType"
                value={form?.zoneType}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-28 items-center mt-3">
              <h2>Zone Capacity:</h2>
              <input
                type="text"
                placeholder="Zone Capacity"
                name="capacity"
                value={form?.capacity}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-28 items-center mt-3">
              <h2>Zone Cooling Type:</h2>
              <input
                type="text"
                placeholder="Cooling Type"
                name="coolingType"
                value={form?.coolingType}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
          </>
        )}

        {/* ── EQUIPMENT fields ── */}
        {type === "Equipment" && (
          <>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Serial Number:</h2>
              <input
                type="text"
                placeholder="Serial Number"
                name="serialNumber"
                value={form?.serialNumber}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-24 items-center mt-3">
              <h2>Type:</h2>
              <input
                type="text"
                placeholder="Equipment Type"
                name="equipmentType"
                value={form?.equipmentType}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Status:</h2>
              <select
                name="status"
                value={form?.status}
                onChange={handleChange}
                className="select border border-1 border-white p-2 my-2 rounded-xl shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
              >
                <option value="ORDERED">ORDERED</option>
                <option value="MANUFACTURING">MANUFACTURING</option>
                <option value="FAT">FAT</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="INSTALLED">INSTALLED</option>
                <option value="COMMISSIONED">COMMISSIONED</option>
              </select>
            </div>
            <div className="flex justify-left gap-18 items-center mt-3">
              <h2>Lifecycle Phase:</h2>
              <input
                type="text"
                placeholder="Lifecycle Phase"
                name="lifecyclePhase"
                value={form?.lifecyclePhase}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
            <div className="flex justify-left gap-14 items-center mt-3">
              <h2>Certification Req:</h2>
              <input
                type="text"
                placeholder="Certification Requirement"
                name="certificationReq"
                value={form?.certificationReq}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-white placeholder:text-body outline-none border border-1 border-white p-2 my-2 rounded-xl"
              />
            </div>
          </>
        )}
      </div>

      {/* Task Views */}
      <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
        {type !== "Equipment" && (
          <div className="flex items-center gap-4 mb-5">
            <h1 className="text-white ml-4 text-2xl font-bold">View</h1>

            {type === "Project" ? (
              <button
                onClick={() => setActiveView("Sites")}
                className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
              >
                <span
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${
                    activeView === "Sites"
                      ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]"
                      : "bg-transparent"
                  }`}
                >
                  Sites
                </span>
              </button>
            ) : type === "Site" ? (
              <button
                onClick={() => setActiveView("Projects")}
                className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
              >
                <span
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${
                    activeView === "Projects"
                      ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]"
                      : "bg-transparent"
                  }`}
                >
                  Areas
                </span>
              </button>
            ) : type === "Projects" ? (
              <button
                onClick={() => setActiveView("Zones")}
                className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
              >
                <span
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${
                    activeView === "Zones"
                      ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]"
                      : "bg-transparent"
                  }`}
                >
                  Zones
                </span>
              </button>
            ) : (
              <button
                onClick={() => setActiveView("Assets")}
                className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
              >
                <span
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${
                    activeView === "Assets"
                      ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]"
                      : "bg-transparent"
                  }`}
                >
                  Assets
                </span>
              </button>
            )}
            {/* List view button */}
            <button
              onClick={() => setActiveView("task")}
              className="font-[500] w-[max-content] text-white border-3 cursor-pointer border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
            >
              <span
                className={`h-8 w-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${
                  activeView === "task"
                    ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]"
                    : "bg-transparent"
                }`}
              >
                <img src="/images/list.png" alt="Vector" className="h-3 w-3" />
                Tasks
              </span>
            </button>

            {/* calendar view button */}
          </div>
        )}
        {activeView === "task" ? (
          <>
            <div className="flex items-center justify-between mb-8">
              {/* <div className="flex items-center gap-4">
                <h1 className="text-white ml-4 text-2xl font-bold">
                  Task Views
                </h1>
                <button
                  onClick={() => setView("list")}
                  className="font-[500] w-[max-content] text-white border-3 cursor-pointer border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
                >
                  <span
                    className={`h-8 w-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${view === "list" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
                  >
                    <img
                      src="/images/list.png"
                      alt="Vector"
                      className="h-3 w-3"
                    />
                    List
                  </span>
                </button>

                <button
                  onClick={() => setView("kanban")}
                  className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
                >
                  <span
                    className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${view === "kanban" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
                  >
                    <img
                      src="/images/kanban.png"
                      alt="Vector"
                      className="h-3 w-3"
                    />
                    Kanban
                  </span>
                </button>

                <button
                  onClick={() => setView("calender")}
                  className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
                >
                  <span
                    className={`h-8 w-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${view === "calender" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
                  >
                    <img
                      src="/images/calender.png"
                      alt="Vector"
                      className="h-3 w-3"
                    />
                    Calender
                  </span>
                </button>

              </div> */}
              {/* Add new button */}
              <div className="flex items-center justify-end ml-auto gap-5">
                <button
                  onClick={() => {
                    document.getElementById("my_modal_4").showModal();
                    setSelectedTask(null);
                    setTaskForm({ name: "", description: "" });
                    setSubtaskInputs([{ name: "", description: "" }]);
                  }}
                  className="bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white py-2 px-4 border border-1 border-white p-2 my-2 rounded-xl rounded-xl transition-all cursor-pointer"
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
                    <span>Add New Task</span>
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
            {view === "list" ? (
              <>
                {/* Task List Container */}
                <div className="flex w-full bg-gradient-to-b from-gray-800/40 via-gray-900/40 to-gray-950/40 border border-gray-700/50 font-gilroy py-6 px-6 mt-8 rounded-xl card">
                  <div className="flex items-center justify-between mb-5 w-full">
                    <div className="flex flex-row items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
                      <span
                        className="text-lg font-bold text-white uppercase"
                        style={{
                          fontFamily: "Rajdhani, sans-serif",
                          letterSpacing: "1px",
                        }}
                      >
                        Tasks
                      </span>
                      <span
                        className="h-6 w-6 rounded-lg font-semibold bg-gradient-to-r from-cyan-600 to-cyan-500 text-white flex items-center justify-center text-xs"
                        style={{ fontFamily: "IBM Plex Mono, monospace" }}
                      >
                        {tasksList.length}
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    {tasksList.length === 0 ? (
                      <div className="text-center text-gray-400 py-12">
                        <p className="text-sm">No tasks yet.</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Click "Add new Task" to create one.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {tasksList.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-lg border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all overflow-hidden bg-gradient-to-r from-gray-800/40 to-gray-900/40"
                          >
                            {/* Task Row */}
                            <div
                              className="flex items-center justify-between w-full p-4 cursor-pointer hover:bg-gradient-to-r hover:from-cyan-600/10 hover:to-cyan-500/5 transition-all group border-b border-gray-700/50"
                              onClick={() => {
                                setSelectedTask(
                                  selectedTask?.id === task.id ? null : task,
                                );
                                setSubtaskInputs([
                                  { name: "", description: "" },
                                ]);
                              }}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Task Status Indicator */}
                                <div className="flex-shrink-0">
                                  <div
                                    className={`w-2 h-2 rounded-full transition-all ${
                                      task.status === "PENDING"
                                        ? "bg-yellow-400 shadow-lg shadow-yellow-400/50"
                                        : task.status === "IN_PROGRESS"
                                          ? "bg-cyan-400 shadow-lg shadow-cyan-400/50"
                                          : "bg-green-400 shadow-lg shadow-green-400/50"
                                    }`}
                                  />
                                </div>
                                {/* Task Info */}
                                <div className="flex-1 min-w-0">
                                  <h4
                                    className="text-sm font-semibold text-white uppercase truncate"
                                    style={{
                                      fontFamily: "Rajdhani, sans-serif",
                                      letterSpacing: "0.5px",
                                    }}
                                  >
                                    {task.name}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-gray-400 truncate mt-1">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Right Side Actions */}
                              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                {/* Status Badge */}
                                <span
                                  className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap transition-all ${
                                    task.status === "PENDING"
                                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                                      : task.status === "IN_PROGRESS"
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                        : "bg-green-500/20 text-green-300 border border-green-500/30"
                                  }`}
                                  style={{
                                    fontFamily: "IBM Plex Mono, monospace",
                                    fontSize: "9px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  {task.status}
                                </span>

                                {/* Subtask Count */}
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50 border border-gray-700/50 group-hover:border-cyan-500/30 transition-all">
                                  <span
                                    className="text-xs font-medium text-gray-400"
                                    style={{
                                      fontFamily: "IBM Plex Mono, monospace",
                                    }}
                                  >
                                    {
                                      subtasksList.filter(
                                        (s) => s.taskId === task.id,
                                      ).length
                                    }
                                  </span>
                                  <span className="text-gray-600 text-xs">
                                    sub
                                  </span>
                                </div>

                                {/* Edit Button */}
                                <button
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingTask(task);
                                    setEditTaskForm({
                                      name: task.name,
                                      description: task.description || "",
                                      status: task.status,
                                    });
                                    document
                                      .getElementById("edit_task_modal")
                                      .showModal();
                                  }}
                                  title="Edit Task"
                                >
                                  <FaPencil className="text-xs" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                  onClick={(e) => deleteTask(e, task.id)}
                                  title="Delete Task"
                                >
                                  <FaTrash className="text-xs" />
                                </button>

                                {/* Add Subtask Button */}
                                <button
                                  className="text-xs font-medium px-2 py-1 rounded-lg border border-gray-600 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTask(task);
                                    setSubtaskInputs([
                                      { name: "", description: "" },
                                    ]);
                                    document
                                      .getElementById("my_modal_4")
                                      .showModal();
                                  }}
                                  title="Add Subtask"
                                >
                                  + Sub
                                </button>
                              </div>
                            </div>

                            {/* Subtasks for this task */}
                            {subtasksList.filter((s) => s.taskId === task.id)
                              .length > 0 && (
                              <div className="bg-gray-800/30 border-t border-gray-700/50">
                                {subtasksList
                                  .filter((s) => s.taskId === task.id)
                                  .map((sub) => (
                                    <div
                                      key={sub.id}
                                      className="flex items-center justify-between py-2.5 px-4 hover:bg-gray-700/30 border-b border-gray-700/30 last:border-b-0 group transition-all"
                                    >
                                      {/* Subtask Info */}
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        {/* Nested Indicator */}
                                        <div className="flex-shrink-0 flex items-center gap-1.5">
                                          <div className="w-0.5 h-5 bg-cyan-500/30" />
                                          <div
                                            className={`w-1.5 h-1.5 rounded-full ${
                                              sub.status === "PENDING"
                                                ? "bg-yellow-400/60"
                                                : sub.status === "IN_PROGRESS"
                                                  ? "bg-cyan-400/60"
                                                  : "bg-green-400/60"
                                            }`}
                                          />
                                        </div>
                                        {/* Subtask Title and Description */}
                                        <div className="flex-1 min-w-0">
                                          <p
                                            className="text-xs font-medium text-gray-300 truncate"
                                            style={{
                                              fontFamily:
                                                "IBM Plex Sans, sans-serif",
                                            }}
                                          >
                                            {sub.name}
                                          </p>
                                          {sub.description && (
                                            <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                              {sub.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>

                                      {/* Right Side Actions */}
                                      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                        {/* Subtask Status Badge */}
                                        <span
                                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                                            sub.status === "PENDING"
                                              ? "bg-yellow-500/15 text-yellow-300"
                                              : sub.status === "IN_PROGRESS"
                                                ? "bg-cyan-500/15 text-cyan-300"
                                                : "bg-green-500/15 text-green-300"
                                          }`}
                                          style={{
                                            fontFamily:
                                              "IBM Plex Mono, monospace",
                                            letterSpacing: "0.3px",
                                          }}
                                        >
                                          {sub.status.slice(0, 3).toUpperCase()}
                                        </span>

                                        {/* Edit Subtask */}
                                        <button
                                          className="p-1 text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingSubtask(sub);
                                            setEditSubtaskForm({
                                              name: sub.name,
                                              description:
                                                sub.description || "",
                                              status: sub.status,
                                            });
                                            document
                                              .getElementById(
                                                "edit_subtask_modal",
                                              )
                                              .showModal();
                                          }}
                                          title="Edit Subtask"
                                        >
                                          <FaPencil className="text-[10px]" />
                                        </button>

                                        {/* Delete Subtask */}
                                        <button
                                          className="p-1 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                          onClick={(e) =>
                                            deleteSubtask(e, sub.taskId, sub.id)
                                          }
                                          title="Delete Subtask"
                                        >
                                          <FaTrash className="text-[10px]" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : view === "kanban" ? (
              <div className="flex flex-row gap-2">
                {/* To do */}
                <div className="flex w-85 shadow-inner shadow-blue-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
                  <div className="flex justify-between flex-col">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <FaCircle className="text-[#4D81E7]" />
                        <span className="text-xl font-semibold">To Do</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                          Marketing
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                          Urgent
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Monthly Product Discussion
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                          Normal
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Update New Social Media Posts
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-2 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#FF6637] bg-[#FFD6CA]">
                          External
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                          Marketing
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                          Urgent
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Monthly Product Discussion
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* In Progress */}
                <div className="flex w-85 shadow-inner shadow-yellow-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
                  <div className="flex justify-between flex-col">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <FaCircle className="text-[#EFBA47]" />
                        <span className="text-xl font-semibold">
                          In Progress
                        </span>
                        <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#EFBA47] text-white">
                          4
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                          Marketing
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                          Urgent
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Monthly Product Discussion
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                          Normal
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Update New Social Media Posts
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* In Reviews */}
                <div className="flex w-85 shadow-inner shadow-orange-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
                  <div className="flex justify-between flex-col">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <FaCircle className="text-[#E7844D]" />
                        <span className="text-xl font-semibold">
                          In Reviews
                        </span>
                        <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#E7844D] text-white">
                          4
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                          Marketing
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                          Urgent
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Monthly Product Discussion
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                          Normal
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Update New Social Media Posts
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-2 font-gilroy p-4 mt-2 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#0075FF] bg-[#D2E7FF]">
                          Normal
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Update New Social Media Posts
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Completed */}
                <div className="flex w-85 shadow-inner shadow-green-500 bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09]  font-gilroy p-6 mt-8 rounded-3xl card">
                  <div className="flex justify-between flex-col">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div className="flex flex-row items-center justify-between gap-2">
                        <FaCircle className="text-[#00E691]" />
                        <span className="text-xl font-semibold">Completed</span>
                        <button className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#00E691] text-white">
                          4
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full bg-gradient-to-r from-gray-600/10 to-gray-500/10 border-3 border-white/[0.03] border-t-white/[0.09] px-3 font-gilroy p-4 mt-8 rounded-3xl card">
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex gap-2  ">
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#00E691] bg-[#C6FFEA]">
                          Internal
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#F1C21B] bg-[#FFFBEB]">
                          Marketing
                        </button>
                        <button className="px-2 py-1 text-xs font-medium rounded-3xl text-[#DD4347] bg-[#FFEFEF]">
                          Urgent
                        </button>
                      </div>
                      <div>
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
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-base text-white mt-3">
                      Monthly Product Discussion
                    </div>
                    <div className="flex  items-center justify-between text-sm mt-4 text-[#72748A]">
                      <div className="flex gap-2 text-xs text-[#72748A]">
                        <img src="/images/calendar.svg" alt="calendar" />
                        <span>Due Date 24 Jan 2023</span>
                      </div>
                      <div className="flex gap-2">
                        <img src="/images/checklist.svg" alt="Checklist" />
                        4/12
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[#72748A] text-sm">
                      {/* Image icons */}
                      <div>
                        {tasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className=" transition-colors cursor-pointer"
                            onClick={() =>
                              router.push(`/Profile/Managers/${task.id}`)
                            }
                          >
                            <td className="flex items-center py-4 text-gray-400">
                              {task.assignee.map((item, index) => (
                                <div
                                  key={index}
                                  className={`avatar 
                                ${index !== 0 ? "-ml-5" : ""} 
                                transition-transform duration-300 z-${
                                  task.assignee.length - index
                                }`}
                                >
                                  <div className="w-[40px] h-[40px] rounded-full ">
                                    <img
                                      src={item.avatar}
                                      alt={`User ${index}`}
                                      className="w-[40px] h-[40px] rounded-full object-cover"
                                    />
                                  </div>
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <div>
                          <span className="flex flex-row gap-1">
                            <img
                              src="/images/attachments.svg"
                              alt="Attachments"
                            />
                            <p>8</p>
                          </span>
                        </div>
                        <div>
                          <span className="flex flex-row gap-1">
                            <img src="/images/comments.svg" alt="Comments" />
                            <p>15</p>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                          <span className="text-sm font-semibold">
                            Inprogress
                          </span>
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
                          <span className="text-sm font-semibold">
                            Inprogress
                          </span>
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
                          <span className="text-sm font-semibold">
                            Completed
                          </span>
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
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                    <div className="inline-block h-[850px] min-h-[1em] w-0.5 self-stretch bg-white/10 mt-4"></div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-row md:flex-row gap-4 justify-between mb-8">
              <h1 className="text-white mt-5 ml-4 text-xl md:text-3xl capitalize">
                {activeView === "Projects" ? "Areas" : activeView}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Sort by</span>
                <button className="text-white font-semibold text-sm flex items-center gap-1 hover:text-gray-300 transition-colors">
                  Newest
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
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-6 ml-4">
              <div className="flex gap-2 w-full md:w-full">
                {/* Search Input */}
                <div className="w-full relative">
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
                    placeholder={`Search ${
                      activeView === "Projects" ? "Areas" : activeView
                    }`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0a1128] text-white placeholder-white pl-12 pr-4 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>

                {/* Dropdown Filters */}
                <select className="bg-[#0a1128] w-[max-content] text-white px-5  rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
                  <option>Client</option>
                  <option>All Projects</option>
                  <option>Active Projects</option>
                </select>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select className="bg-[#0a1128] w-[max-content] text-white px-5 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
                  <option>Last Modified</option>
                  <option>Netherlands</option>
                  <option>USA</option>
                  <option>UK</option>
                </select>

                <select className="bg-[#0a1128] w-[max-content] text-white px-5 py-3.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none cursor-pointer appearance-none pr-10 hover:border-white/20 transition-colors">
                  <option>Status</option>
                  <option>Active</option>
                  <option>In-active</option>
                </select>

                {/* Action Buttons */}
                <button className="bg-[#0a1128] w-[max-content] flex items-center justify-center text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <button className="bg-[#0a1128] w-[max-content] flex items-center justify-center text-white p-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-[#0f1629] transition-all">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    // Map activeView to entityType
                    let entityType = "";
                    if (activeView === "Sites") entityType = "site";
                    else if (activeView === "Projects")
                      entityType = "subProjects"; // "Areas" map to Sites
                    else if (activeView === "Zones") entityType = "zone";
                    else if (activeView === "Assets") entityType = "equipment";

                    setEntityModalType(entityType);
                    setEntityModalParentId(id); // Current project/site/zone ID
                    setIsEntityModalOpen(true);
                  }}
                  className="bg-[#F2F962] w-[max-content] flex items-center justify-center font-semibold capitalize text-[#0a1128] p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20 w-[max-content"
                >
                  Add{" "}
                  {activeView === "Projects" ? "Area" : activeView.slice(0, -1)}
                </button>
              </div>
            </div>

            {/* Table */}
            {/* ── SITES TABLE ── */}
            {activeView === "Sites" && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[7500px]">
                  <thead className="bg-[#080C26] text-center rounded-2xl">
                    <tr>
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      {getTableHeaders(sites).map((header) => (
                        <th
                          key={header}
                          className="py-4 px-4 text-gray-400 font-medium text-sm capitalize"
                        >
                          {header.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sites
                      ?.filter((item) =>
                        item?.name
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      )
                      .map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer text-center"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/${parentCategory}/Site/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          {getTableHeaders(sites).map((header) => (
                            <td key={header} className="py-4 ">
                              {renderCellContent(item, header, activeView)}
                            </td>
                          ))}
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFunction(e, activeView, item?.id);
                                }}
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* ── PROJECTS TABLE ── */}
            {activeView === "Projects" && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[5500px]">
                  <thead className="bg-[#080C26] text-center rounded-2xl">
                    <tr>
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      {getTableHeaders(projects).map((header) => (
                        <th
                          key={header}
                          className="py-4 px-4 text-gray-400 font-medium text-sm capitalize"
                        >
                          {header.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects
                      ?.filter((item) =>
                        item?.name
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      )
                      .map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors text-center cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/${parentCategory}/Projects/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          {getTableHeaders(projects).map((header) => (
                            <td key={header} className="py-4">
                              {renderCellContent(item, header, activeView)}
                            </td>
                          ))}
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFunction(e, activeView, item?.id);
                                }}
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── ZONES TABLE ── */}
            {/* ── ZONES TABLE (DYNAMIC) ── */}
            {activeView === "Zones" && (
              <div className="overflow-x-auto">
                <table className="w-full text-center min-w-[6000px]">
                  <thead className="bg-[#080C26] rounded-2xl">
                    <tr>
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      {getTableHeaders(zones).map((header) => (
                        <th
                          key={header}
                          className="py-4 px-4 text-gray-400 font-medium text-sm capitalize"
                        >
                          {header.replace(/([A-Z])/g, " $1").trim()}
                        </th>
                      ))}
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones
                      ?.filter((item) =>
                        item?.name
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      )
                      .map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors text-center cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/${parentCategory}/Zone/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          {getTableHeaders(zones).map((header) => (
                            <td key={header} className="py-4">
                              {renderCellContent(item, header, activeView)}
                            </td>
                          ))}
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFunction(e, activeView, item?.id);
                                }}
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── EQUIPMENT/ASSETS TABLE (DYNAMIC) ── */}
            {activeView === "Assets" && (
              <div className="overflow-x-auto">
                <table className="w-full text-center min-w-[6000px]">
                  <thead className="bg-[#080C26] rounded-2xl">
                    <tr>
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      {getTableHeaders(equipments).map((header) => (
                        <th
                          key={header}
                          className="py-4 px-4 text-gray-400 font-medium text-sm capitalize"
                        >
                          {header
                            .replace("metadata.", "")
                            .replace(/_/g, " ")
                            .replace(/([A-Z])/g, " $1")
                            .trim()}
                        </th>
                      ))}
                      <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipments
                      ?.filter((item) =>
                        item?.name
                          ?.toLowerCase()
                          .includes(searchTerm.toLowerCase()),
                      )
                      .map((item, index) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/${parentCategory}/Equipment/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          {getTableHeaders(equipments).map((header) => (
                            <td key={header} className="py-4">
                              {renderCellContent(item, header, activeView)}
                            </td>
                          ))}
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="p-2 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFunction(e, activeView, item?.id);
                                }}
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
      <dialog id="my_modal_4" className="modal items-start justify-center p-10">
        <div
          className="modal-box pt-0 px-0 w-[1000px] max-h-[90vh] border border-cyan-500/30 backdrop-blur-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 scrollbar-hide overflow-y-auto"
          style={{ borderRadius: "12px" }}
        >
          {/* ─── MODAL HEADER ─── */}
          <div className="flex items-center justify-between pt-6 px-6 pb-4 border-b border-gray-700/50">
            <div>
              <h3
                className="font-bold text-xl text-white"
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  letterSpacing: "1px",
                }}
              >
                {selectedTask
                  ? `SUBTASKS: ${selectedTask.name}`
                  : "CREATE NEW TASK"}
              </h3>
              {selectedTask && (
                <p
                  className="text-xs text-gray-400 mt-1"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Add subtasks to organize your work
                </p>
              )}
            </div>
            <form method="dialog" className="gap-2 flex">
              <button
                className="size-10 rounded-lg hover:bg-red-500/20 flex items-center justify-center border border-red-500/30 hover:border-red-500 text-red-400 transition-all"
                onClick={() => {
                  setSelectedTask(null);
                  setTaskForm({ name: "", description: "" });
                }}
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* ─── DIVIDER WITH ACCENT ─── */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* ─── CREATE NEW TASK FORM ─── */}
          {!selectedTask && (
            <div className="px-6 py-6 space-y-5">
              {/* Info Box */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(0, 200, 255, 0.08)",
                  borderColor: "rgba(0, 200, 255, 0.3)",
                }}
              >
                <p
                  className="text-xs text-gray-300"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
                >
                  📝{" "}
                  <strong style={{ color: "#00c8ff" }}>Task Creation:</strong>{" "}
                  Create tasks to organize and track work. You can add subtasks
                  after creating the main task.
                </p>
              </div>

              {/* Task Name */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Task Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete project setup checklist"
                  value={taskForm.name}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, name: e.target.value })
                  }
                  className="w-full bg-gray-800/50 text-white placeholder-gray-600 pl-4 pr-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Add any details or notes..."
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full bg-gray-800/50 text-white placeholder-gray-600 pl-4 pr-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
                />
              </div>

              {/* Priority & Dates Row */}
              <div className="grid grid-cols-3 gap-3">
                {/* Priority */}
                <div>
                  <label
                    className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                    style={{ fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    Priority
                  </label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, priority: e.target.value })
                    }
                    className="w-full bg-gray-800/50 text-white px-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium" selected>
                      Medium
                    </option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label
                    className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                    style={{ fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.startDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, startDate: e.target.value })
                    }
                    className="w-full bg-gray-800/50 text-white pl-3 pr-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label
                    className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                    style={{ fontFamily: "IBM Plex Mono, monospace" }}
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, dueDate: e.target.value })
                    }
                    className="w-full bg-gray-800/50 text-white pl-3 pr-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Category
                </label>
                <select
                  value={taskForm.category}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, category: e.target.value })
                  }
                  className="w-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 px-4 py-3 rounded-lg border border-cyan-500/40 hover:border-cyan-500/60 focus:border-cyan-500/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer appearance-none font-medium text-sm"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300c8ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    paddingRight: "36px",
                  }}
                >
                  <option
                    value="General"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    General
                  </option>
                  <option
                    value="Work"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Work
                  </option>
                  <option
                    value="Personal"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Personal
                  </option>
                  <option
                    value="Urgent"
                    style={{ backgroundColor: "#1f2937", color: "#fca5a5" }}
                  >
                    Urgent
                  </option>
                  <option
                    value="Planning"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Planning
                  </option>
                  <option
                    value="Review"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Review
                  </option>
                  <option
                    value="Implementation"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Implementation
                  </option>
                  <option
                    value="Testing"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Testing
                  </option>
                  <option
                    value="Documentation"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Documentation
                  </option>
                  <option
                    value="Support"
                    style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                  >
                    Support
                  </option>
                </select>
              </div>
            </div>
          )}

          {/* ─── CREATE SUBTASKS FORM ─── */}
          {selectedTask && (
            <div className="px-6 py-6 space-y-5">
              {/* Info Box */}
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: "rgba(0, 212, 200, 0.08)",
                  borderColor: "rgba(0, 212, 200, 0.3)",
                }}
              >
                <p
                  className="text-xs text-gray-300"
                  style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
                >
                  <strong style={{ color: "#00d4c8" }}>Subtasks for:</strong>{" "}
                  <span className="text-white font-medium">
                    {selectedTask.name}
                  </span>
                </p>
                {selectedTask.description && (
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedTask.description}
                  </p>
                )}
              </div>

              {/* Subtask List */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                {subtaskInputs.map((subtask, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 bg-gray-800/30 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <label
                        className="text-xs font-bold text-cyan-400 uppercase tracking-wider"
                        style={{ fontFamily: "IBM Plex Mono, monospace" }}
                      >
                        Subtask {index + 1}
                      </label>
                      {subtaskInputs.length > 1 && (
                        <button
                          onClick={() => {
                            setSubtaskInputs(
                              subtaskInputs.filter((_, i) => i !== index),
                            );
                          }}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Subtask title"
                      value={subtask.name}
                      onChange={(e) => {
                        const updated = [...subtaskInputs];
                        updated[index].name = e.target.value;
                        setSubtaskInputs(updated);
                      }}
                      className="w-full bg-gray-900/50 text-white placeholder-gray-600 pl-3 pr-3 py-2.5 rounded-md border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                    />

                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={subtask.description}
                      onChange={(e) => {
                        const updated = [...subtaskInputs];
                        updated[index].description = e.target.value;
                        setSubtaskInputs(updated);
                      }}
                      className="w-full bg-gray-900/50 text-white placeholder-gray-600 pl-3 pr-3 py-2.5 rounded-md border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                    />

                    {/* Priority & Due Date Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={subtask.priority || "Medium"}
                        onChange={(e) => {
                          const updated = [...subtaskInputs];
                          updated[index].priority = e.target.value;
                          setSubtaskInputs(updated);
                        }}
                        className="bg-gray-900/50 text-white px-3 py-2 rounded-md border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer text-xs"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>

                      <input
                        type="date"
                        value={subtask.dueDate || ""}
                        onChange={(e) => {
                          const updated = [...subtaskInputs];
                          updated[index].dueDate = e.target.value;
                          setSubtaskInputs(updated);
                        }}
                        className="bg-gray-900/50 text-white pl-3 pr-3 py-2 rounded-md border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-xs"
                      />
                    </div>

                    {/* Category */}
                    <select
                      value={subtask.category || "General"}
                      onChange={(e) => {
                        const updated = [...subtaskInputs];
                        updated[index].category = e.target.value;
                        setSubtaskInputs(updated);
                      }}
                      className="w-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 px-3 py-2 rounded-md border border-cyan-500/40 hover:border-cyan-500/60 focus:border-cyan-500/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer appearance-none font-medium text-xs"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 12 12'%3E%3Cpath fill='%2300c8ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 8px center",
                        paddingRight: "28px",
                      }}
                    >
                      <option
                        value="General"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        General
                      </option>
                      <option
                        value="Work"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Work
                      </option>
                      <option
                        value="Personal"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Personal
                      </option>
                      <option
                        value="Urgent"
                        style={{ backgroundColor: "#1f2937", color: "#fca5a5" }}
                      >
                        Urgent
                      </option>
                      <option
                        value="Planning"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Planning
                      </option>
                      <option
                        value="Review"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Review
                      </option>
                      <option
                        value="Implementation"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Implementation
                      </option>
                      <option
                        value="Testing"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Testing
                      </option>
                      <option
                        value="Documentation"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Documentation
                      </option>
                      <option
                        value="Support"
                        style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                      >
                        Support
                      </option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Add Another Button */}
              <button
                onClick={() =>
                  setSubtaskInputs([
                    ...subtaskInputs,
                    {
                      name: "",
                      description: "",
                      priority: "Medium",
                      dueDate: "",
                      category: "General",
                    },
                  ])
                }
                className="w-full py-2.5 px-4 rounded-lg border-2 border-dashed border-cyan-500/40 hover:border-cyan-500/60 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all font-medium text-sm"
              >
                ＋ Add Another Subtask
              </button>
            </div>
          )}

          {/* ─── MODAL FOOTER ─── */}
          <div className="border-t border-gray-700/50 p-6 flex items-center justify-between gap-3 bg-gray-950/50">
            <div>
              {selectedTask && (
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setSubtaskInputs([{ name: "", description: "" }]);
                  }}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
                >
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Task
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  document.getElementById("my_modal_4").close();
                  setSelectedTask(null);
                  setTaskForm({ name: "", description: "" });
                }}
                className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={selectedTask ? createSubtask : createTask}
                disabled={taskLoading}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-medium text-sm transition-all disabled:opacity-60"
              >
                {taskLoading
                  ? "Saving..."
                  : selectedTask
                    ? "Save Subtasks"
                    : "Create Task"}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* ── EDIT TASK MODAL ── */}
      <dialog
        id="edit_task_modal"
        className="modal items-start justify-end p-4"
      >
        <div className="modal-box pt-0 px-0 w-[600px] border border-cyan-500/30 backdrop-blur-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-lg">
          {/* ─── HEADER ─── */}
          <div className="flex items-center justify-between pt-6 px-6 pb-4 border-b border-gray-700/50">
            <h3
              className="font-bold text-lg text-white"
              style={{
                fontFamily: "Rajdhani, sans-serif",
                letterSpacing: "1px",
              }}
            >
              EDIT TASK
            </h3>
            <form method="dialog">
              <button className="size-10 rounded-lg hover:bg-red-500/20 flex items-center justify-center border border-red-500/30 hover:border-red-500 text-red-400 transition-all">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* ─── DIVIDER ─── */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* ─── FORM CONTENT ─── */}
          <div className="px-6 py-6 space-y-5">
            {/* Info Box */}
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: "rgba(0, 200, 255, 0.08)",
                borderColor: "rgba(0, 200, 255, 0.3)",
              }}
            >
              <p
                className="text-xs text-gray-300"
                style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
              >
                ✏️ <strong style={{ color: "#00c8ff" }}>Update Task:</strong>{" "}
                Modify task details, description, and status.
              </p>
            </div>

            {/* Task Name */}
            <div>
              <label
                className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Task Name *
              </label>
              <input
                type="text"
                value={editTaskForm.name}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, name: e.target.value })
                }
                placeholder="Task title"
                className="w-full bg-gray-800/50 text-white placeholder-gray-600 pl-4 pr-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Description
              </label>
              <textarea
                rows="3"
                value={editTaskForm.description}
                onChange={(e) =>
                  setEditTaskForm({
                    ...editTaskForm,
                    description: e.target.value,
                  })
                }
                placeholder="Add task details..."
                className="w-full bg-gray-800/50 text-white placeholder-gray-600 pl-4 pr-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
              />
            </div>

            {/* Priority & Dates Row */}
            <div className="grid grid-cols-3 gap-3">
              {/* Priority */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Priority
                </label>
                <select
                  value={editTaskForm.priority}
                  onChange={(e) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      priority: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white px-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={editTaskForm.startDate}
                  onChange={(e) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white pl-3 pr-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                />
              </div>

              {/* Due Date */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  value={editTaskForm.dueDate}
                  onChange={(e) =>
                    setEditTaskForm({
                      ...editTaskForm,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white pl-3 pr-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Category
              </label>
              <select
                value={editTaskForm.category}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, category: e.target.value })
                }
                className="w-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 px-4 py-3 rounded-lg border border-cyan-500/40 hover:border-cyan-500/60 focus:border-cyan-500/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer appearance-none font-medium text-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300c8ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                }}
              >
                <option
                  value="General"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  General
                </option>
                <option
                  value="Work"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Work
                </option>
                <option
                  value="Personal"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Personal
                </option>
                <option
                  value="Urgent"
                  style={{ backgroundColor: "#1f2937", color: "#fca5a5" }}
                >
                  Urgent
                </option>
                <option
                  value="Planning"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Planning
                </option>
                <option
                  value="Review"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Review
                </option>
                <option
                  value="Implementation"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Implementation
                </option>
                <option
                  value="Testing"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Testing
                </option>
                <option
                  value="Documentation"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Documentation
                </option>
                <option
                  value="Support"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Support
                </option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Status
              </label>
              <select
                value={editTaskForm.status}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, status: e.target.value })
                }
                className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer"
              >
                <option value="PENDING" className="bg-gray-900 text-white">
                  PENDING
                </option>
                <option value="IN_PROGRESS" className="bg-gray-900 text-white">
                  IN_PROGRESS
                </option>
                <option value="COMPLETED" className="bg-gray-900 text-white">
                  COMPLETED
                </option>
              </select>
            </div>
          </div>

          {/* ─── FOOTER ─── */}
          <div className="border-t border-gray-700/50 p-6 flex gap-3 justify-end bg-gray-950/50">
            <form method="dialog">
              <button className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all font-medium text-sm">
                Cancel
              </button>
            </form>
            <button
              onClick={handleUpdateTask}
              disabled={taskLoading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-medium text-sm transition-all disabled:opacity-60"
            >
              {taskLoading ? "Saving..." : "Update Task"}
            </button>
          </div>
        </div>
      </dialog>

      {/* ── EDIT SUBTASK MODAL ── */}
      <dialog
        id="edit_subtask_modal"
        className="modal items-start justify-end p-4"
      >
        <div className="modal-box pt-0 px-0 w-[600px] border border-cyan-500/30 backdrop-blur-2xl bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between pt-6 px-6 pb-4 border-b border-gray-700/50">
            <div>
              <h3
                className="font-bold text-xl text-white uppercase"
                style={{
                  fontFamily: "Rajdhani, sans-serif",
                  letterSpacing: "1px",
                }}
              >
                EDIT SUBTASK
              </h3>
            </div>
            <form method="dialog">
              <button className="flex items-center justify-center size-8 rounded-lg border border-gray-600 hover:border-cyan-500/50 hover:bg-gray-800/50 transition-all text-gray-400 hover:text-cyan-400">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </form>
          </div>

          {/* Gradient Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

          {/* Form Content */}
          <div className="px-6 py-6 space-y-5">
            {/* Info Box */}
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: "rgba(0, 212, 200, 0.08)",
                borderColor: "rgba(0, 212, 200, 0.3)",
              }}
            >
              <p
                className="text-xs text-gray-300"
                style={{ fontFamily: "IBM Plex Sans, sans-serif" }}
              >
                ✏️ <strong style={{ color: "#00d4c8" }}>Update Subtask:</strong>{" "}
                Modify subtask details, notes, and progress status.
              </p>
            </div>

            {/* Subtask Name */}
            <div>
              <label
                className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Subtask Name *
              </label>
              <input
                type="text"
                value={editSubtaskForm.name}
                onChange={(e) =>
                  setEditSubtaskForm({
                    ...editSubtaskForm,
                    name: e.target.value,
                  })
                }
                placeholder="Subtask title"
                className="w-full bg-gray-800/50 text-white placeholder-gray-600 pl-4 pr-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label
                className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Notes
              </label>
              <textarea
                rows="3"
                value={editSubtaskForm.description}
                onChange={(e) =>
                  setEditSubtaskForm({
                    ...editSubtaskForm,
                    description: e.target.value,
                  })
                }
                placeholder="Add notes..."
                className="w-full bg-gray-800/50 text-white placeholder-gray-600 pl-4 pr-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none"
              />
            </div>

            {/* Priority & Due Date Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Priority */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Priority
                </label>
                <select
                  value={editSubtaskForm.priority}
                  onChange={(e) =>
                    setEditSubtaskForm({
                      ...editSubtaskForm,
                      priority: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white px-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                  style={{ fontFamily: "IBM Plex Mono, monospace" }}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  value={editSubtaskForm.dueDate}
                  onChange={(e) =>
                    setEditSubtaskForm({
                      ...editSubtaskForm,
                      dueDate: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white pl-3 pr-3 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Category
              </label>
              <select
                value={editSubtaskForm.category}
                onChange={(e) =>
                  setEditSubtaskForm({
                    ...editSubtaskForm,
                    category: e.target.value,
                  })
                }
                className="w-full bg-gradient-to-br from-gray-800/60 to-gray-900/60 text-gray-100 px-4 py-3 rounded-lg border border-cyan-500/40 hover:border-cyan-500/60 focus:border-cyan-500/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition-all cursor-pointer appearance-none font-medium text-sm"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2300c8ff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "36px",
                }}
              >
                <option
                  value="General"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  General
                </option>
                <option
                  value="Work"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Work
                </option>
                <option
                  value="Personal"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Personal
                </option>
                <option
                  value="Urgent"
                  style={{ backgroundColor: "#1f2937", color: "#fca5a5" }}
                >
                  Urgent
                </option>
                <option
                  value="Planning"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Planning
                </option>
                <option
                  value="Review"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Review
                </option>
                <option
                  value="Implementation"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Implementation
                </option>
                <option
                  value="Testing"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Testing
                </option>
                <option
                  value="Documentation"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Documentation
                </option>
                <option
                  value="Support"
                  style={{ backgroundColor: "#1f2937", color: "#f3f4f6" }}
                >
                  Support
                </option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label
                className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                Status
              </label>
              <select
                value={editSubtaskForm.status}
                onChange={(e) =>
                  setEditSubtaskForm({
                    ...editSubtaskForm,
                    status: e.target.value,
                  })
                }
                className="w-full bg-gray-800/50 text-white pl-4 pr-4 py-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 transition-all cursor-pointer"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700/50">
            <form method="dialog">
              <button className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all font-medium text-sm">
                Cancel
              </button>
            </form>
            <button
              onClick={handleUpdateSubtask}
              disabled={taskLoading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:from-gray-600 disabled:to-gray-500 text-white font-medium text-sm transition-all disabled:opacity-60"
            >
              {taskLoading ? "Saving..." : "Update Subtask"}
            </button>
          </div>
        </div>
      </dialog>

      {/* EntityModal - Unified component for creating Sites, Zones, Equipment */}
      <EntityModal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        entityType={entityModalType}
        parentId={entityModalParentId}
        projectCategory={parentCategory}
        onSuccess={(entityType) => {
          // Refresh the appropriate list after successful creation
          if (entityType === "site" || entityModalType === "site") {
            getSites();
          } else if (entityType === "zone" || entityModalType === "zone") {
            getZones();
          } else if (
            entityType === "subProjects" ||
            entityModalType === "subProjects"
          ) {
            getProjectList();
          } else if (
            entityType === "equipment" ||
            entityModalType === "equipment"
          ) {
            getEquipments();
          }
          setIsEntityModalOpen(false);
        }}
      />
    </div>
  );
}
