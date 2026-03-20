"use client";
import { FaCircle, FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { FiMessageCircle, FiStar } from "react-icons/fi";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AddUsersToProjects,
  DeleteProjects,
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
  const { type, id, subId } = params;
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
  const [taskForm, setTaskForm] = useState({ name: "", description: "" });
  const [editingTask, setEditingTask] = useState(null); // task being edited
  const [editingSubtask, setEditingSubtask] = useState(null); // subtask being edited
  const [editTaskForm, setEditTaskForm] = useState({
    name: "",
    description: "",
    status: "PENDING",
  });
  const [editSubtaskForm, setEditSubtaskForm] = useState({
    name: "",
    description: "",
    status: "PENDING",
  });
  const [subtaskInputs, setSubtaskInputs] = useState([
    { name: "", description: "" },
  ]);
  const [taskLoading, setTaskLoading] = useState(false);

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
    }
    if (isProject) getProjectList();
    if (isZone) getZones();
    if (isEquipment) getEquipments();
  }, [id]);

  // Separate effect: fetch subtasks once tasksList is populated
  useEffect(() => {
    if (tasksList.length > 0) {
      fetchSubtasks();
    }
  }, [tasksList.length]);

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
        ...(type === "Project" && { projectId: id }),
        ...(type === "Projects" && { subProjectId: id }),
        ...(type === "Site" && { siteId: id }),
        ...(type === "Zone" && { zoneId: id }),
        ...(type === "Equipment" && { equipmentId: id }),
      };

      await CreateTask(payload);
      setMessage({ type: "success", text: "Task created successfully! 🚀" });
      setTaskForm({ name: "", description: "" });
      setSubtaskInputs([{ name: "", description: "" }]);
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
        });
      }
      setMessage({
        type: "success",
        text: "Subtasks created successfully! 🚀",
      });
      setSubtaskInputs([{ name: "", description: "" }]);
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

  const handleAssignProject = async (e) => {
    try {
      setForm({
        ...form,
        assigneeId: e.target.value,
      });
      const payload = {
        userId: e.target.value,
        siteId: null,
      };
      const requiredFields = ["userId"];

      for (const field of requiredFields) {
        const value = payload[field];
        if (value === undefined || value === null || value === "") {
          setMessage({
            type: "error",
            text: `Missing value for field: ${CapitalizeText(field)}`,
          });
          return;
        }
      }
      await AddUsersToProjects(id, payload);
      setMessage({
        type: "success",
        text: "Project Assigned successfully! 🚀",
      });
      setTimeout(() => {
        router.back();
      }, 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          `Error assigning Project : ${error?.message}` ||
          "Error assigning Project.",
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
        text: `${deleteType === "Sites" ? "Site" : deleteType === "Projects" ? "Sub Project" : deleteType === "Zones" ? "Zone" : deleteType === "Assets" ? "Asset" : ""} Deleted Successfully !`,
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
            className="ml-auto bg-gradient-to-r from-[#3C71F0] to-[#1C3B80] text-white font-[510] py-2 px-4 border-none rounded-xl transition-all cursor-pointer w-50"
          >
            {type === "Zone"
              ? "Update Zone"
              : type === "Equipment"
                ? "Update Equipment"
                : type === "Projects"
                  ? "Update Site Project"
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
            className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-20 items-center mt-3">
              <h2>Start Date:</h2>
              <input
                type="datetime-local"
                name="startDate"
                value={form?.startDate}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-22 items-center mt-3">
              <h2>End Date:</h2>
              <input
                type="datetime-local"
                name="endDate"
                value={form?.endDate}
                onChange={handleChange}
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Project Type:</h2>
              <select
                onChange={(e) =>
                  setForm({ ...form, projectType: e.target.value })
                }
                value={form?.projectType}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
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
            <div className="flex justify-left gap-7 items-center mt-3">
              <h2>Assignees:</h2>
              <div className="flex items-center justify-left gap-2 capitalize">
                {form?.assignee?.map((item, i) => (
                  <p key={i}>
                    {item?.firstName} {item?.lastName}
                  </p>
                ))}
              </div>
            </div>
            <div className="flex justify-left gap-5 items-center mt-3">
              <h2 className="w-40">Update Assignee:</h2>
              <select
                onChange={(e) => handleAssignProject(e)}
                className="select border-none shadow-none bg-[#12153d] w-full text-white focus:outline-none h-10 text-sm"
              >
                <option value="">Select Assignee</option>
                {users?.length > 0 &&
                  users?.map((item, index) => (
                    <option value={item.id} key={index}>
                      {item.firstName} {item?.lastName}
                    </option>
                  ))}
              </select>
            </div>
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Status:</h2>
              <select
                name="status"
                value={form?.status}
                onChange={handleChange}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
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
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
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
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
              />
            </div>
            <div className="flex justify-left gap-9 items-center mt-3">
              <h2 className="w-30">Status:</h2>
              <select
                name="status"
                value={form?.status}
                onChange={handleChange}
                className="select border-none shadow-none bg-[#12153d] w-80 text-white focus:outline-none h-10 text-sm"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
                className="bg-neutral-secondary-medium font-[600] text-heading text-[18px] text-[#656A80] placeholder:text-body outline-none border-none"
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
            {/* List view button */}
            <button
              onClick={() => setActiveView("task")}
              className="font-[500] w-[max-content] text-white border-3 cursor-pointer border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
            >
              <span
                className={`h-8 w-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${activeView === "task" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
              >
                <img src="/images/list.png" alt="Vector" className="h-3 w-3" />
                Tasks
              </span>
            </button>
            {type === "Project" ? (
              <button
                onClick={() => setActiveView("Sites")}
                className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
              >
                <span
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${activeView === "Sites" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
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
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${activeView === "Projects" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
                >
                  Projects
                </span>
              </button>
            ) : type === "Projects" ? (
              <button
                onClick={() => setActiveView("Zones")}
                className="font-[500] w-[max-content] text-white cursor-pointer border-3 border-white/[0.04] border-t-white/[0.1] rounded-3xl  transition-all"
              >
                <span
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${activeView === "Zones" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
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
                  className={`h-8 ww-[max-content] px-4 flex items-center justify-center rounded-3xl flex flex-row gap-2 items-center ${activeView === "Assets" ? "bg-gradient-to-r from-[#3C71F0] to-[#1C3B80]" : "bg-transparent"}`}
                >
                  Assets
                </span>
              </button>
            )}

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
                  onClick={() =>
                    document.getElementById("my_modal_4").showModal()
                  }
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
                    <span>Add new Task</span>
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
                {/* To do */}
                <div className="flex w-full bg-gradient-to-b from-[#00377e] from-5% via-[#11163b]/10 via-20% to-[#11163b]/10 to-10% border-3 border-white/[0.03] border-t-white/[0.09] font-gilroy py-6 px-3 mt-8 rounded-3xl card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-row items-center gap-2">
                      <FaCircle className="text-[#4D81E7]" />
                      <span className="text-xl font-semibold">Tasks</span>
                      <span className="h-6 w-6 rounded-sm font-semibold border border-[#E5E5EC] bg-[#4D81E7] text-white flex items-center justify-center text-xs">
                        {tasksList.length}
                      </span>
                    </div>
                  </div>

                  {tasksList.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      No tasks yet. Click "Add new Task" to create one.
                    </div>
                  ) : (
                    tasksList.map((task) => (
                      <div
                        key={task.id}
                        className="mt-3 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                      >
                        {/* Task Row */}
                        <div
                          className="flex items-center justify-between w-full p-3 cursor-pointer hover:bg-white/5 rounded-t-xl"
                          onClick={() => {
                            setSelectedTask(
                              selectedTask?.id === task.id ? null : task,
                            );
                            setSubtaskInputs([{ name: "", description: "" }]);
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <FaCircle className="text-[#4D81E7] text-[8px] shrink-0" />
                            <span className="text-white text-sm font-medium">
                              {task.name}
                            </span>
                            {task.description && (
                              <span className="text-gray-500 text-xs hidden md:block">
                                {task.description}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <span
                              className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                                task.status === "PENDING"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : task.status === "IN_PROGRESS"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {task.status}
                            </span>
                            <span className="text-gray-500 text-xs shrink-0">
                              {subtasksList.filter((s) => s.taskId === task.id).length} subtasks
                            </span>
                            {/* Edit Task */}
                            <button
                              className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
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
                            >
                              <FaPencil className="text-xs" />
                            </button>
                            {/* Delete Task */}
                            <button
                              className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                              onClick={(e) => deleteTask(e, task.id)}
                            >
                              <FaTrash className="text-xs" />
                            </button>
                            {/* Add Subtask */}
                            <button
                              className="text-xs border border-white/10 hover:border-blue-400 text-gray-400 hover:text-blue-400 px-2 py-1 rounded-lg transition-colors shrink-0"
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
                            >
                              + Subtask
                            </button>
                          </div>
                        </div>

                        {/* Subtasks for this task */}
                        {subtasksList.filter((s) => s.taskId === task.id).length > 0 && (
                          <div className="border-t border-white/5 px-4 py-2">
                            {subtasksList.filter((s) => s.taskId === task.id).map((sub) => (
                              <div
                                key={sub.id}
                                className="flex items-center justify-between py-1.5 pl-4 border-l border-white/10 ml-2"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-gray-400 text-xs">
                                    •
                                  </span>
                                  <span className="text-gray-300 text-xs">
                                    {sub.name}
                                  </span>
                                  {sub.description && (
                                    <span className="text-gray-600 text-xs hidden md:block">
                                      {sub.description}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                                      sub.status === "PENDING"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : sub.status === "IN_PROGRESS"
                                          ? "bg-blue-500/20 text-blue-400"
                                          : "bg-green-500/20 text-green-400"
                                    }`}
                                  >
                                    {sub.status}
                                  </span>
                                  {/* Edit Subtask */}
                                  <button
                                    className="p-1 text-gray-500 hover:text-blue-400 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingSubtask(sub);
                                      setEditSubtaskForm({
                                        name: sub.name,
                                        description: sub.description || "",
                                        status: sub.status,
                                      });
                                      document
                                        .getElementById("edit_subtask_modal")
                                        .showModal();
                                    }}
                                  >
                                    <FaPencil className="text-[10px]" />
                                  </button>
                                  {/* Delete Subtask */}
                                  <button
                                    className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                                    onClick={(e) =>
                                      deleteSubtask(e, sub.taskId, sub.id)
                                    }
                                  >
                                    <FaTrash className="text-[10px]" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                                transition-transform duration-300 z-${task.assignee.length - index}`}
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
                {activeView}
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
                    placeholder={`Search ${activeView}`}
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
                  onClick={() =>
                    router.push(
                      subId
                        ? `/create-project/${type}/${activeView}/${id}/${subId}`
                        : `/create-project/${type}/${activeView}/${id}`,
                    )
                  }
                  className="bg-[#F2F962] w-[max-content] flex items-center justify-center font-semibold capitalize text-[#0a1128] p-3.5 rounded-xl hover:bg-[#fbbf24] transition-all shadow-lg shadow-yellow-500/20 w-[max-content"
                >
                  Add {activeView}
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto ml-4">
              {/* ── SITES TABLE ── */}
              {activeView === "Sites" && (
                <table className="w-full">
                  <thead className="bg-[#080C26] rounded-2xl">
                    <tr>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Name
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Safety Status
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Permit Status
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Location
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
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
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/Site/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                              <span className="text-white font-medium">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">
                              {item.safetyStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                              {item.permitStatus}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.location}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 cursor-pointer"
                                onClick={(e) =>
                                  deleteFunction(e, activeView, item?.id)
                                }
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {/* ── PROJECTS TABLE ── */}
              {activeView === "Projects" && (
                <table className="w-full">
                  <thead className="bg-[#080C26] rounded-2xl">
                    <tr>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Name
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Project Type
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Start Date
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        End Date
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Address
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Assigned Users
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
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
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/Projects/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500"></div>
                              <span className="text-white font-medium">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.projectType}
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.startDate
                              ? new Date(item.startDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.endDate
                              ? new Date(item.endDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.address}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex">
                              {item.assignedUsers
                                ?.slice(0, 3)
                                .map((user, i) => (
                                  <div
                                    key={user.id}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs text-white font-bold ${i !== 0 ? "-ml-2" : ""}`}
                                  >
                                    {user.firstName?.[0]}
                                    {user.lastName?.[0]}
                                  </div>
                                ))}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                className="p-2 cursor-pointer"
                                onClick={(e) =>
                                  deleteFunction(e, activeView, item?.id)
                                }
                              >
                                <FaTrash className="text-white" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {/* ── ZONES TABLE ── */}
              {activeView === "Zones" && (
                <table className="w-full">
                  <thead className="bg-[#080C26] rounded-2xl">
                    <tr>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Name
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Type
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Site ID
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Created At
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
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
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/Zone/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500"></div>
                              <span className="text-white font-medium">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.type}
                          </td>
                          <td className="py-4 px-4 text-gray-400 text-xs">
                            {item.siteId}
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 cursor-pointer"
                                  onClick={(e) =>
                                    deleteFunction(e, activeView, item?.id)
                                  }
                                >
                                  <FaTrash className="text-white" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {/* ── EQUIPMENT TABLE ── */}
              {activeView === "Assets" && (
                <table className="w-full">
                  <thead className="bg-[#080C26] rounded-2xl">
                    <tr>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        #
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Name
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Serial Number
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Type
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Lifecycle Phase
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
                        Certification Req
                      </th>
                      <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">
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
                      .map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(
                              `/ProjectDetails/Equipment/${item.id}/${id}`,
                            );
                          }}
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-sm border-gray-600 [--chkbg:#3b82f6]"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500"></div>
                              <span className="text-white font-medium">
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.serialNumber}
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.type}
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.lifecyclePhase}
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {item.certificationReq}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-2 cursor-pointer"
                                  onClick={(e) =>
                                    deleteFunction(e, activeView, item?.id)
                                  }
                                >
                                  <FaTrash className="text-white" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
      <dialog id="my_modal_4" className="modal items-start justify-center p-10">
        <div className="modal-box pt-0 px-0 w-[1000px] max-h-[90vh] border border-[#656A80] backdrop-blur-2xl bg-[#0a1128] scrollbar-hide overflow-y-auto">
          <div className="modal-action flex items-center justify-between pt-4 px-4">
            <h3 className="font-bold text-lg text-white">
              {selectedTask ? `Task: ${selectedTask.name}` : "New Task"}
            </h3>
            <form method="dialog" className="gap-2 flex">
              {/* <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setTaskForm({ name: "", description: "" });
                  setSubtaskInputs([{ name: "", description: "" }]);
                }}
                className="size-9 rounded-xl hover:bg-gray-300 flex items-center justify-center border border-white bg-[#656A80]"
              >
                <img src="/images/maximize.svg" alt="Reset" />
              </button> */}
              <button
                className="size-9 rounded-xl hover:bg-gray-300 flex items-center justify-center border border-white bg-[#FB5874]"
                onClick={() => {
                  setSelectedTask(null);
                  setTaskForm({ name: "", description: "" });
                }}
              >
                <img src="/images/close.svg" alt="Close" />
              </button>
            </form>
          </div>
          <hr className="w-full my-3 border-[#656A80]" />

          {/* ── CREATE NEW TASK FORM (only when no task selected) ── */}
          {!selectedTask && (
            <div className="px-4 mt-4">
              <h4 className="text-white font-semibold mb-3">Create New Task</h4>
              <div className="mt-2">
                <p className="text-gray-400 text-sm mb-1">Task Name *</p>
                <input
                  type="text"
                  placeholder="Enter Task Name"
                  value={taskForm.name}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, name: e.target.value })
                  }
                  className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                />
              </div>
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-1">Task Description</p>
                <textarea
                  rows="2"
                  placeholder="Enter Task Description"
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-3 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {/* ── CREATE SUBTASKS FORM (only when task selected) ── */}
          {selectedTask && (
            <div className="px-4 mt-4">
              <h4 className="text-white font-semibold mb-3">
                Add Subtasks to:{" "}
                <span className="text-blue-400">{selectedTask.name}</span>
              </h4>
              {subtaskInputs.map((subtask, index) => (
                <div
                  key={index}
                  className="mb-3 p-3 rounded-xl border border-white/10"
                >
                  <p className="text-gray-400 text-sm mb-1">
                    Subtask {index + 1} Name *
                  </p>
                  <input
                    type="text"
                    placeholder="Enter Subtask Name"
                    value={subtask.name}
                    onChange={(e) => {
                      const updated = [...subtaskInputs];
                      updated[index].name = e.target.value;
                      setSubtaskInputs(updated);
                    }}
                    className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors mb-2"
                  />
                  <p className="text-gray-400 text-sm mb-1">Description</p>
                  <input
                    type="text"
                    placeholder="Enter Subtask Description"
                    value={subtask.description}
                    onChange={(e) => {
                      const updated = [...subtaskInputs];
                      updated[index].description = e.target.value;
                      setSubtaskInputs(updated);
                    }}
                    className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setSubtaskInputs([
                    ...subtaskInputs,
                    { name: "", description: "" },
                  ])
                }
                className="bg-gradient-to-r from-[#080C26] to-[#00E691] text-white p-2 px-4 mt-2 border-none rounded-xl transition-all"
              >
                <div className="flex flex-row gap-2 items-center">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add Another Subtask</span>
                </div>
              </button>
            </div>
          )}

          <hr className="w-full mt-4 border-[#656A80]" />
          <div className="flex items-center justify-between gap-2 mx-4 mt-4 mb-2">
            {selectedTask && (
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setSubtaskInputs([{ name: "", description: "" }]);
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Back to Create Task
              </button>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => {
                  document.getElementById("my_modal_4").close();
                  setSelectedTask(null);
                  setTaskForm({ name: "", description: "" });
                }}
                className="btn backdrop-blur-md text-white p-3 bg-transparent border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={selectedTask ? createSubtask : createTask}
                disabled={taskLoading}
                className="btn bg-gradient-to-r from-[#0075F8] to-[#00387A] text-white px-6 border-2 border-white/[0.03] border-t-white/[0.09] rounded-2xl transition-all disabled:opacity-50"
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
        <div className="modal-box pt-0 px-0 w-[600px] border border-[#656A80] backdrop-blur-2xl bg-[#0a1128]">
          <div className="modal-action flex items-center justify-between pt-4 px-4">
            <h3 className="font-bold text-lg text-white">Edit Task</h3>
            <form method="dialog">
              <button className="size-9 rounded-xl flex items-center justify-center border border-white bg-[#FB5874]">
                <img src="/images/close.svg" alt="Close" />
              </button>
            </form>
          </div>
          <hr className="w-full my-3 border-[#656A80]" />
          <div className="px-4 pb-4">
            <div className="mt-2">
              <p className="text-gray-400 text-sm mb-1">Task Name *</p>
              <input
                type="text"
                value={editTaskForm.name}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, name: e.target.value })
                }
                className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-1">Description</p>
              <textarea
                rows="2"
                value={editTaskForm.description}
                onChange={(e) =>
                  setEditTaskForm({
                    ...editTaskForm,
                    description: e.target.value,
                  })
                }
                className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-3 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <select
                value={editTaskForm.status}
                onChange={(e) =>
                  setEditTaskForm({ ...editTaskForm, status: e.target.value })
                }
                className="w-full bg-[#12153d] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <form method="dialog">
                <button className="btn bg-transparent text-white border border-white/10 rounded-xl px-4">
                  Cancel
                </button>
              </form>
              <button
                onClick={handleUpdateTask}
                disabled={taskLoading}
                className="btn bg-gradient-to-r from-[#0075F8] to-[#00387A] text-white px-6 rounded-xl disabled:opacity-50"
              >
                {taskLoading ? "Saving..." : "Update Task"}
              </button>
            </div>
          </div>
        </div>
      </dialog>

      {/* ── EDIT SUBTASK MODAL ── */}
      <dialog
        id="edit_subtask_modal"
        className="modal items-start justify-end p-4"
      >
        <div className="modal-box pt-0 px-0 w-[600px] border border-[#656A80] backdrop-blur-2xl bg-[#0a1128]">
          <div className="modal-action flex items-center justify-between pt-4 px-4">
            <h3 className="font-bold text-lg text-white">Edit Subtask</h3>
            <form method="dialog">
              <button className="size-9 rounded-xl flex items-center justify-center border border-white bg-[#FB5874]">
                <img src="/images/close.svg" alt="Close" />
              </button>
            </form>
          </div>
          <hr className="w-full my-3 border-[#656A80]" />
          <div className="px-4 pb-4">
            <div className="mt-2">
              <p className="text-gray-400 text-sm mb-1">Subtask Name *</p>
              <input
                type="text"
                value={editSubtaskForm.name}
                onChange={(e) =>
                  setEditSubtaskForm({
                    ...editSubtaskForm,
                    name: e.target.value,
                  })
                }
                className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-1">Description</p>
              <textarea
                rows="2"
                value={editSubtaskForm.description}
                onChange={(e) =>
                  setEditSubtaskForm({
                    ...editSubtaskForm,
                    description: e.target.value,
                  })
                }
                className="w-full bg-transparent text-white placeholder-gray-500 pl-4 pr-2 py-3 rounded-xl border border-white/10 focus:border-white/20 focus:outline-none transition-colors"
              />
            </div>
            <div className="mt-4">
              <p className="text-gray-400 text-sm mb-1">Status</p>
              <select
                value={editSubtaskForm.status}
                onChange={(e) =>
                  setEditSubtaskForm({
                    ...editSubtaskForm,
                    status: e.target.value,
                  })
                }
                className="w-full bg-[#12153d] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:outline-none"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <form method="dialog">
                <button className="btn bg-transparent text-white border border-white/10 rounded-xl px-4">
                  Cancel
                </button>
              </form>
              <button
                onClick={handleUpdateSubtask}
                disabled={taskLoading}
                className="btn bg-gradient-to-r from-[#0075F8] to-[#00387A] text-white px-6 rounded-xl disabled:opacity-50"
              >
                {taskLoading ? "Saving..." : "Update Subtask"}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}
