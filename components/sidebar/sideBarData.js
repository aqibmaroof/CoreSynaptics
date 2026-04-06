"use client";
import config from "@/config";

// Role constants for clarity and reuse
export const ROLES = {
  GC_PM: "gc_pm",
  GC_ADMIN: "gc_admin",
  OEM_PM: "oem_pm",
  OEM_ADMIN: "oem_admin",
  FSM: "fsm", // Field Service Manager / Scheduler – OEM
  FSE: "fse", // Field Service Engineer / ASP – OEM
  SUPERINTENDENT: "superintendent", // GC
  QA_QC: "qa_manager", // GC or OEM
  SAFETY: "safety_officer", // GC or OEM
  FINANCE: "finance", // GC or OEM
  EXECUTIVE: "executive",
  SUPERADMIN: "SUPERADMIN",
};

export const sidebarItems = [
  // ─── GC PM Dashboard ───────────────────────────────────────────────
  {
    title: "GC Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── OEM PM Dashboard ──────────────────────────────────────────────
  {
    title: "OEM Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/OEM/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── FSM / Scheduler Dashboard ─────────────────────────────────────
  {
    title: "FSM Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Dispatch/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.FSM, ROLES.SUPERADMIN],
  },

  // ─── Superintendent Field Dashboard ────────────────────────────────
  {
    title: "Today / Field Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Field/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
  },

  // ─── QA/QC Dashboard ───────────────────────────────────────────────
  {
    title: "QA/QC Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
  },

  // ─── Safety Dashboard ──────────────────────────────────────────────
  {
    title: "Safety Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Audits",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
  },

  // ─── Finance Dashboard ─────────────────────────────────────────────
  {
    title: "Finance Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE, ROLES.SUPERADMIN],
  },

  // ─── Executive Dashboard ───────────────────────────────────────────
  {
    title: "Executive Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Executive/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN],
  },

  // ─── Projects ──────────────────────────────────────────────────────
  {
    title: "Projects",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Projects",
    type: "link",
    submenu: [],
    // GC PM: Edit/Approve | OEM PM: Edit | FSM: View (limited) | QA/QC: View (limited)
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.OEM_ADMIN,
      ROLES.OEM_PM,
      ROLES.FSM,
      ROLES.QA_QC,
      ROLES.SUPERADMIN,
    ],
  },

  // ─── Teams ──────────────────────────────────────────────────────
  {
    title: "Teams",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Teams/List",
    type: "link",
    submenu: [],
    // GC PM: Edit/Approve | OEM PM: Edit | FSM: View (limited) | QA/QC: View (limited)
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.OEM_ADMIN,
      ROLES.OEM_PM,
      ROLES.FSM,
      ROLES.QA_QC,
      ROLES.SUPERADMIN,
    ],
  },

  // ─── Portfolio (Executive only) ────────────────────────────────────
  {
    title: "Portfolio",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Portfolio",
    type: "link",
    submenu: [],
    roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN],
  },

  // ─── KPIs (Executive only) ─────────────────────────────────────────
  {
    title: "KPIs",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/KPIs",
    type: "link",
    submenu: [],
    roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN],
  },

  // ─── Schedule & Look-Ahead ─────────────────────────────────────────
  {
    title: "Schedule & Look-Ahead",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Schedule",
    type: "link",
    submenu: [],
    // GC PM: Edit | Superintendent: View
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.SUPERINTENDENT,
      ROLES.SUPERADMIN,
    ],
  },

  // ─── Service Schedule / Dispatch ───────────────────────────────────
  {
    title: "Service Schedule / Dispatch",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/ServiceSchedule",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── Assignments (FSM) ─────────────────────────────────────────────
  {
    title: "Assignments",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Assignments",
    type: "link",
    submenu: [],
    roles: [ROLES.FSM, ROLES.SUPERADMIN],
  },

  // ─── Schedule & Windows (FSM) ──────────────────────────────────────
  {
    title: "Schedule & Windows",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/ScheduleWindows",
    type: "link",
    submenu: [],
    roles: [ROLES.FSM, ROLES.SUPERADMIN],
  },

  // ─── My Assignments (FSE) ──────────────────────────────────────────
  {
    title: "My Assignments",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/MyAssignments",
    type: "link",
    submenu: [],
    roles: [ROLES.FSE, ROLES.SUPERADMIN],
  },

  // ─── Tasks ─────────────────────────────────────────────────────────
  {
    title: "Tasks",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Tasks/List",
    type: "link",
    submenu: [],
    // FSE & Superintendent: Execute
    roles: [ROLES.FSE, ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
  },

  // ─── Logistics (Site Deliveries) ───────────────────────────────────
  {
    title: "Logistics",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Logistics",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── Supply Chain ──────────────────────────────────────────────────
  {
    title: "Supply Chain",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/SupplyChain",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── Outbound Logistics / Shipments ────────────────────────────────
  {
    title: "Shipment",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Shipment/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── Receiving / Inspection ────────────────────────────────────────
  // {
  //   title: "FSM",
  //   icon: config?.chart,
  //   iconActive: config?.home,
  //   category: "",
  //   path: "/FSM/Dashboard",
  //   roles: [ROLES.FSM],

  //   submenu: [
  //     {
  //       title: "Dashboard",
  //       type: "link",
  //       path: "/FSM/Dashboard",
  //     },
  //     {
  //       title: "Dispatch Console",
  //       type: "link",
  //       path: "/FSM/DispatchConsole",
  //     },
  //     {
  //       title: "Services & Parts",
  //       type: "link",
  //       path: "/FSM/ServicesParts",
  //     },
  //     {
  //       title: "Invoices",
  //       type: "link",
  //       path: "/FSM/Invoices",
  //     },
  //   ],
  // },
  {
    title: "Receiving",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Receiving/Overview",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── Field Reports ─────────────────────────────────────────────────
  {
    title: "Field Reports",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/FieldReports",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── Daily Reports (Superintendent) ───────────────────────────────
  {
    title: "Daily Reports",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/DailyReports",
    type: "link",
    submenu: [],
    roles: [ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
  },

  // ─── Quality / NCR ─────────────────────────────────────────────────
  {
    title: "Quality (NCR)",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Quality",
    type: "link",
    submenu: [],
    // GC PM: View/Escalate | Superintendent: Edit (Install QC)
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.SUPERINTENDENT,
      ROLES.SUPERADMIN,
    ],
  },

  // ─── QA/QC (Inspections, NCRs, Corrective Actions) ────────────────
  {
    title: "Inspections",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/Inspections",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
  },
  {
    title: "NCRs / Defects",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/NCRs",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
  },
  {
    title: "Corrective Actions",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/CorrectiveActions",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
  },
  {
    title: "Evidence Library",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/EvidenceLibrary",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
  },

  // ─── Safety ────────────────────────────────────────────────────────
  {
    title: "Safety",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety",
    type: "link",
    submenu: [],
    // GC PM: View | Superintendent: Execute
    roles: [ROLES.GC_PM, ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
  },
  {
    title: "JHAs/JSAs & Permits",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Reports",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
  },
  {
    title: "Incidents",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Incidents",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
  },
  {
    title: "Audits",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Audits",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
  },
  {
    title: "Training Compliance",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Training",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
  },

  // ─── Commissioning ─────────────────────────────────────────────────
  {
    title: "Commissioning",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Commissioning",
    type: "link",
    submenu: [],
    // GC PM: View/Coordinate | OEM PM: Edit/Approve | FSM: View | FSE: Execute
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.OEM_PM,
      ROLES.OEM_ADMIN,
      ROLES.FSM,
      ROLES.FSE,
      ROLES.SUPERADMIN,
    ],
  },

  // ─── Test Results Upload (FSE) ─────────────────────────────────────
  {
    title: "Test Results Upload",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/TestResults",
    type: "link",
    submenu: [],
    roles: [ROLES.FSE, ROLES.SUPERADMIN],
  },

  // ─── RMA / Service ─────────────────────────────────────────────────
  {
    title: "RMA / Service",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/RMA",
    type: "link",
    submenu: [],
    // OEM PM: Edit | FSM: View | FSE: Edit
    roles: [
      ROLES.OEM_PM,
      ROLES.OEM_ADMIN,
      ROLES.FSM,
      ROLES.FSE,
      ROLES.SUPERADMIN,
    ],
  },

  // ─── Change Orders ─────────────────────────────────────────────────
  {
    title: "Change Orders",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/ChangeOrders",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
  },

  // ─── Finance ───────────────────────────────────────────────────────
  {
    title: "AP (Vendors / Bills)",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/AP",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE, ROLES.SUPERADMIN],
  },
  {
    title: "AR (Customers / Invoices)",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/AR",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE, ROLES.SUPERADMIN],
  },
  {
    title: "Payments",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Payments",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE, ROLES.SUPERADMIN],
  },
  {
    title: "PO / SO",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/POSO",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE, ROLES.SUPERADMIN],
  },
  {
    title: "Budget vs Actual",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Budget",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE, ROLES.SUPERADMIN],
  },

  // ─── Documents ─────────────────────────────────────────────────────
  {
    title: "Documents",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Documents",
    type: "link",
    submenu: [],
    // GC PM: Edit | OEM PM: Edit | FSE: View (site pack) | Superintendent: View (drawings)
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.OEM_PM,
      ROLES.OEM_ADMIN,
      ROLES.FSE,
      ROLES.SUPERADMIN,
      ROLES.SUPERINTENDENT,
    ],
  },

  // ─── Reports ───────────────────────────────────────────────────────
  {
    title: "Reports",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Reports",
    type: "link",
    submenu: [],
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.OEM_PM,
      ROLES.OEM_ADMIN,
      ROLES.FSM,
      ROLES.FSE,
      ROLES.QA_QC,
      ROLES.SAFETY,
      ROLES.FINANCE,
      ROLES.EXECUTIVE,
      ROLES.SUPERADMIN,
    ],
  },

  // ─── Roles (all roles – adjust as needed) ───────────────────────

  {
    title: "Roles",
    path: "/Roles/List",
    icon: config?.chart,
    iconActive: config?.home,
    type: "link",
    submenu: [],
    roles: [ROLES.SUPERADMIN],
  },

  // ─── Users (all roles – adjust as needed) ───────────────────────

  {
    title: "Users",
    path: "/Users/List",
    icon: config?.chart,
    iconActive: config?.home,
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.OEM_PM, ROLES.OEM_ADMIN],
  },

  // ─── Permissions (all roles – adjust as needed) ───────────────────────

  {
    title: "Permissions",
    path: "/Permissions",
    icon: config?.chart,
    iconActive: config?.home,
    type: "link",
    submenu: [],
    roles: [ROLES.SUPERADMIN],
  },

  // ─── Subscriptions (all roles – adjust as needed) ───────────────────────

  {
    title: "Subscriptions",
    path: "/Subscriptions/List",
    icon: config?.chart,
    iconActive: config?.home,
    type: "link",
    submenu: [],
    roles: [ROLES.SUPERADMIN],
  },

  // ─── Settings (all roles – adjust as needed) ───────────────────────
  {
    title: "Settings",
    path: "/Settings",
    icon: config?.chart,
    iconActive: config?.home,
    type: "link",
    submenu: [],
    roles: [
      ROLES.GC_PM,
      ROLES.GC_ADMIN,
      ROLES.OEM_PM,
      ROLES.OEM_ADMIN,
      ROLES.FSM,
      ROLES.FSE,
      ROLES.SUPERINTENDENT,
      ROLES.QA_QC,
      ROLES.SAFETY,
      ROLES.FINANCE,
      ROLES.EXECUTIVE,
      ROLES.SUPERADMIN,
    ],
  },
];

/**
 * Returns the filtered sidebar items for a given role.
 *
 * Usage in your sidebar component:
 *   const visibleItems = getMenuByRole(currentUser.role);
 *
 * @param {string} role – one of the ROLES constants
 * @returns {Array} filtered sidebarItems
 */
export function getMenuByRole(role) {
  // SUPERADMIN sees everything

  return sidebarItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );
}
