"use client";

import { useEffect, useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getCxProjects, deleteCxProject } from "@/services/CxProjects";
import EntityModal from "@/components/EntityModal";
import { useUserPermissions, useRequirePermission, MODULE } from "@/Utils/rbac";

const STATUS_COLORS = {
  ACTIVE: {
    bg: "var(--rf-green-soft, #d1fae5)",
    color: "var(--rf-green, #059669)",
  },
  ON_HOLD: {
    bg: "var(--rf-amber-soft, #fef3c7)",
    color: "var(--rf-amber, #d97706)",
  },
  COMPLETED: {
    bg: "var(--rf-blue-soft, #dbeafe)",
    color: "var(--rf-blue, #2563eb)",
  },
  ARCHIVED: {
    bg: "var(--rf-smoke-soft, #f3f4f6)",
    color: "var(--smoke, #6b7280)",
  },
};

export default function KanbanBoard() {
  const guard = useRequirePermission(MODULE.PROJECTS, "view");
  const { canCreate, canEdit, canDelete } = useUserPermissions();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isEntityModalOpen, setIsEntityModalOpen] = useState(false);
  const [modalEntityType] = useState("project");
  const [modalProjectCategory] = useState(null);

  const getProjectsList = async (page = 1) => {
    try {
      const res = await getCxProjects({ page, limit: 20 });
      setProjects(res.data || []);
      setPagination({
        total: res.total || 0,
        page: res.page || 1,
        totalPages: res.totalPages || 1,
      });
    } catch (error) {
      console.log("error fetching projects : ", error);
    }
  };

  const deleteProject = async (id) => {
    try {
      await deleteCxProject(id);
      getProjectsList(pagination.page);
      setMessage({ type: "success", text: "Project Deleted Successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    } catch (error) {
      setMessage({
        type: "error",
        text: `Error Deleting project: ${error?.message}`,
      });
    }
  };

  useEffect(() => {
    const loadProjects = async () => {
      await getProjectsList(1);
    };
    loadProjects();
  }, []);

  // RBAC hard guard — render the fallback while permissions load or when the
  // user is not allowed to view projects.
  if (guard.loading || guard.blocked) return guard.fallback;

  const completedCount = projects.filter(
    (p) => p?.props?.status === "COMPLETED",
  ).length;

  const query = searchTerm.trim().toLowerCase();
  const filteredProjects = query
    ? projects.filter((p) => {
        const name = (p?.props?.projectName || "").toLowerCase();
        const customer = (p?.props?.customer || "").toLowerCase();
        const type = (p?.props?.projectType || "").toLowerCase();
        return (
          name.includes(query) ||
          customer.includes(query) ||
          type.includes(query)
        );
      })
    : projects;

  const thStyle = {
    color: "var(--rf-txt2)",
    letterSpacing: "0.05em",
  };

  return (
    <div
      className="min-h-screen font-gilroy p-6"
      style={{ color: "var(--rf-txt)" }}
    >
      <h1 className="font-bold text-xl md:text-2xl">Projects Overview</h1>

      {/* Stats */}
      <div className="flex items-center justify-between w-full gap-20 md:gap-8 px-3 font-gilroy mt-6 mb-6">
        <div className="flex items-center justify-left gap-2 md:gap-6 w-full">
          <p className="text-4xl md:text-7xl font-bold font-gilroy">
            {pagination.total}
          </p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm">
            <p>
              Total <br />
              Projects
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="text-4xl md:text-7xl font-bold">—</p>
          <div className="flex flex-col items-right justify-end text-xs md:text-sm">
            <p>
              Projects Due <br />
              Today
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="text-4xl md:text-7xl font-bold">—</p>
          <div className="flex flex-col items-start justify-end text-xs md:text-sm">
            <p>
              Overdue <br />
              Projects
            </p>
          </div>
        </div>
        <div className="flex items-center justify-left gap-6 w-full">
          <p className="text-4xl md:text-7xl font-bold">{completedCount}</p>
          <div className="flex flex-col items-start justify-end text-right text-xs md:text-sm">
            <p>
              Projects <br />
              Completed
            </p>
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div
        className="w-full font-gilroy p-6 mt-2 rounded-3xl"
        style={{
          background: "var(--rf-bg2)",
          border: "1px solid var(--rf-border2)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2
            className="text-lg md:text-xl font-bold"
            style={{ color: "var(--rf-txt)" }}
          >
            Projects List
          </h2>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative" style={{ color: "var(--rf-txt2)" }}>
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2"
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
                placeholder="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                style={{
                  background: "var(--rf-bg3)",
                  border: "1px solid var(--rf-border)",
                  color: "var(--rf-txt)",
                }}
              />
            </div>

            {canCreate && (
              <a
                href="/CreateProject"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
                style={{ background: "var(--rf-accent)", color: "#fff" }}
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add new
              </a>
            )}
          </div>
        </div>

        {/* Status message */}
        {message.text && (
          <div
            className="px-3 py-2 mb-4 rounded-lg text-sm animate-fade-in"
            style={{
              background:
                message.type === "success"
                  ? "var(--rf-green-soft, #d1fae5)"
                  : "var(--rf-red-soft, #fee2e2)",
              color:
                message.type === "success"
                  ? "var(--rf-green, #059669)"
                  : "var(--rf-red, #dc2626)",
              border: `1px solid ${
                message.type === "success"
                  ? "var(--rf-green, #059669)"
                  : "var(--rf-red, #dc2626)"
              }`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ background: "var(--rf-bg3)" }}>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase rounded-l-xl"
                  style={thStyle}
                >
                  #
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={thStyle}
                >
                  Project
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={thStyle}
                >
                  Customer
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={thStyle}
                >
                  Type
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-semibold uppercase"
                  style={thStyle}
                >
                  Status
                </th>
                <th
                  className="text-right py-3 px-4 text-xs font-semibold uppercase rounded-r-xl"
                  style={thStyle}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-sm"
                    style={{ color: "var(--rf-txt2)" }}
                  >
                    NO PROJECTS FOUND
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, index) => {
                  const status = project?.props?.status;
                  const statusStyle =
                    STATUS_COLORS[status] || STATUS_COLORS.ARCHIVED;
                  const id = project?.props?.id;
                  return (
                    <tr
                      key={id ?? index}
                      className="cursor-pointer transition-colors"
                      style={{ borderTop: "1px solid var(--rf-border)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--rf-bg3)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                      onClick={() =>
                        router.push(`/ProjectDetails/cx/Project/${id}`)
                      }
                    >
                      <td
                        className="py-3 px-4 text-sm"
                        style={{ color: "var(--rf-txt2)" }}
                      >
                        {index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{
                              background: "var(--rf-bg4)",
                              color: "var(--rf-txt)",
                            }}
                          >
                            {(project?.props?.projectName || "?")
                              .slice(0, 1)
                              .toUpperCase()}
                          </div>
                          <span
                            className="font-semibold text-sm"
                            style={{ color: "var(--rf-txt)" }}
                          >
                            {project?.props?.projectName || "—"}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-3 px-4 text-sm"
                        style={{ color: "var(--rf-txt2)" }}
                      >
                        {project?.props?.customer || "—"}
                      </td>
                      <td
                        className="py-3 px-4 text-sm"
                        style={{ color: "var(--rf-txt2)" }}
                      >
                        {project?.props?.projectType || "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: statusStyle.bg,
                            color: statusStyle.color,
                            display: "inline-block",
                          }}
                        >
                          {status || "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              title="View / Edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/ProjectDetails/cx/Project/${id}`,
                                );
                              }}
                              className="p-2 rounded-lg transition-colors hover:opacity-70"
                              style={{ color: "var(--rf-blue, #2563eb)" }}
                            >
                              <FaPencil className="text-sm" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              title="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProject(id);
                              }}
                              className="p-2 rounded-lg transition-colors hover:opacity-70"
                              style={{ color: "var(--rf-red, #dc2626)" }}
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EntityModal - Unified component for creating Projects */}
      <EntityModal
        isOpen={isEntityModalOpen}
        onClose={() => setIsEntityModalOpen(false)}
        entityType={modalEntityType}
        projectCategory={modalProjectCategory}
        onSuccess={() => {
          // Refresh projects list after successful creation
          getProjectsList();
        }}
      />
    </div>
  );
}
