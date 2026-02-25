// import config from "@/config";

// export const sidebarItems = [
//   {
//     title: "Dashboard",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/",
//     type: "link",
//     submenu: [],
//     role:['GCPM']
//   },
//   {
//     title: "Project Managers",
//     icon: config?.chart,
//     iconActive: config?.home,
//     category: "",
//     path: "/Managers/List",
//     submenu: [],
//   },
//   {
//     title: "Projects",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/Projects",
//     type: "link",
//     submenu: [],
//   },
//   {
//     title: "Tasks",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/Tasks/List",
//     type: "link",
//     submenu: [],
//   },
//   {
//     title: "Shipment",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/Shipment/Dashboard",
//     type: "link",
//     submenu: [],
//   },
//   {
//     title: "Receiving",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/Receiving/Overview",
//     type: "link",
//     submenu: [],
//   },
//   {
//     title: "QA/QC",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/QA/QC",
//     submenu: [],
//   },
//   {
//     title: "FSEs",
//     icon: config?.chart,
//     iconActive: config?.home,
//     category: "",
//     path: "/FSEs",
//     submenu: [],
//   },
//   {
//     title: "Safety",
//     icon: config?.chart,
//     iconActive: config?.home,
//     category: "",
//     path: "/Safety",
//     submenu: [],
//   },
//   {
//     title: "Warehouse",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/Warehouse/List",
//     submenu: [],
//   },
//   {
//     title: "Sales",
//     icon: config?.chart,
//     iconActive: config?.home,
//     path: "/Sales/List",
//     submenu: [],
//   },
//   {
//     title: "Subscriptions",
//     path: "/Subscriptions/List",
//     icon: config?.chart,
//     iconActive: config?.home,
//     submenu: [],
//   },
//   {
//     title: "Settings",
//     path: "/Settings",
//     icon: config?.chart,
//     iconActive: config?.home,
//     submenu: [],
//   },
// ];
"use client";
import config from "@/config";

// Role constants for clarity and reuse
export const ROLES = {
  GC_PM: "GCPM",
  OEM_PM: "OEMPM",
  FSM: "FSM", // Field Service Manager / Scheduler – OEM
  FSE: "FSE", // Field Service Engineer / ASP – OEM
  SUPERINTENDENT: "SUPERINTENDENT", // GC
  QA_QC: "QAQC", // GC or OEM
  SAFETY: "SAFETY", // GC or OEM
  FINANCE: "FINANCE", // GC or OEM
  EXECUTIVE: "EXECUTIVE",
  SUPERADMIN: "SUPERADMIN",
};

export const sidebarItems = [
  // ─── GC PM Dashboard ───────────────────────────────────────────────
  {
    title: "Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM],
  },

  // ─── OEM PM Dashboard ──────────────────────────────────────────────
  {
    title: "OEM Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/OEM/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM],
  },

  // ─── FSM / Scheduler Dashboard ─────────────────────────────────────
  {
    title: "Dispatch Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Dispatch/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.FSM],
  },

  // ─── Superintendent Field Dashboard ────────────────────────────────
  {
    title: "Today / Field Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Field/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.SUPERINTENDENT],
  },

  // ─── QA/QC Dashboard ───────────────────────────────────────────────
  {
    title: "QA/QC Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC],
  },

  // ─── Safety Dashboard ──────────────────────────────────────────────
  {
    title: "Safety Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY],
  },

  // ─── Finance Dashboard ─────────────────────────────────────────────
  {
    title: "Finance Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE],
  },

  // ─── Executive Dashboard ───────────────────────────────────────────
  {
    title: "Executive Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Executive/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.EXECUTIVE],
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
    roles: [ROLES.GC_PM, ROLES.OEM_PM, ROLES.FSM, ROLES.QA_QC],
  },

  // ─── Portfolio (Executive only) ────────────────────────────────────
  {
    title: "Portfolio",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Portfolio",
    type: "link",
    submenu: [],
    roles: [ROLES.EXECUTIVE],
  },

  // ─── KPIs (Executive only) ─────────────────────────────────────────
  {
    title: "KPIs",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/KPIs",
    type: "link",
    submenu: [],
    roles: [ROLES.EXECUTIVE],
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
    roles: [ROLES.GC_PM, ROLES.SUPERINTENDENT],
  },

  // ─── Service Schedule / Dispatch ───────────────────────────────────
  {
    title: "Service Schedule / Dispatch",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/ServiceSchedule",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM],
  },

  // ─── Assignments (FSM) ─────────────────────────────────────────────
  {
    title: "Assignments",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Assignments",
    type: "link",
    submenu: [],
    roles: [ROLES.FSM],
  },

  // ─── Schedule & Windows (FSM) ──────────────────────────────────────
  {
    title: "Schedule & Windows",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/ScheduleWindows",
    type: "link",
    submenu: [],
    roles: [ROLES.FSM],
  },

  // ─── My Assignments (FSE) ──────────────────────────────────────────
  {
    title: "My Assignments",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/MyAssignments",
    type: "link",
    submenu: [],
    roles: [ROLES.FSE],
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
    roles: [ROLES.FSE, ROLES.SUPERINTENDENT],
  },

  // ─── Logistics (Site Deliveries) ───────────────────────────────────
  {
    title: "Logistics",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Logistics",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM],
  },

  // ─── Supply Chain ──────────────────────────────────────────────────
  {
    title: "Supply Chain",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/SupplyChain",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM],
  },

  // ─── Outbound Logistics / Shipments ────────────────────────────────
  {
    title: "Shipment",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Shipment/Dashboard",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM],
  },

  // ─── Receiving / Inspection ────────────────────────────────────────
  {
    title: "FSM",
    icon: config?.chart,
    iconActive: config?.home,
    category: "",
    path: "/FSM/Dashboard",
    submenu: [
      { 
        title: "Dashboard", 
        type:"link",
        path: "/FSM/Dashboard" 
      },
      { 
        title: "Dispatch Console", 
        type:"link",
        path: "/FSM/DispatchConsole" 
      },
      { 
        title: "Services & Parts", 
        type:"link",
        path: "/FSM/ServicesParts" 
      },
      { 
        title: "Invoices", 
        type:"link",
        path: "/FSM/Invoices" 
      },
    ],
  },
  {
    title: "Receiving",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Receiving/Overview",
    type: "link",
    submenu: [],
    roles: [ROLES.OEM_PM],
  },

  // ─── Field Reports ─────────────────────────────────────────────────
  {
    title: "Field Reports",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/FieldReports",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM],
  },

  // ─── Daily Reports (Superintendent) ───────────────────────────────
  {
    title: "Daily Reports",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/DailyReports",
    type: "link",
    submenu: [],
    roles: [ROLES.SUPERINTENDENT],
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
    roles: [ROLES.GC_PM, ROLES.SUPERINTENDENT],
  },

  // ─── QA/QC (Inspections, NCRs, Corrective Actions) ────────────────
  {
    title: "Inspections",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/Inspections",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC],
  },
  {
    title: "NCRs / Defects",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/NCRs",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC],
  },
  {
    title: "Corrective Actions",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/CorrectiveActions",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC],
  },
  {
    title: "Evidence Library",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/EvidenceLibrary",
    type: "link",
    submenu: [],
    roles: [ROLES.QA_QC],
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
    roles: [ROLES.GC_PM, ROLES.SUPERINTENDENT],
  },
  {
    title: "JHAs/JSAs & Permits",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Permits",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY],
  },
  {
    title: "Incidents",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Incidents",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY],
  },
  {
    title: "Audits",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Audits",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY],
  },
  {
    title: "Training Compliance",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Safety/Training",
    type: "link",
    submenu: [],
    roles: [ROLES.SAFETY],
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
    roles: [ROLES.GC_PM, ROLES.OEM_PM, ROLES.FSM, ROLES.FSE],
  },

  // ─── Test Results Upload (FSE) ─────────────────────────────────────
  {
    title: "Test Results Upload",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/TestResults",
    type: "link",
    submenu: [],
    roles: [ROLES.FSE],
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
    roles: [ROLES.OEM_PM, ROLES.FSM, ROLES.FSE],
  },

  // ─── Change Orders ─────────────────────────────────────────────────
  {
    title: "Change Orders",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/ChangeOrders",
    type: "link",
    submenu: [],
    roles: [ROLES.GC_PM],
  },

  // ─── Finance ───────────────────────────────────────────────────────
  {
    title: "AP (Vendors / Bills)",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/AP",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE],
  },
  {
    title: "AR (Customers / Invoices)",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/AR",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE],
  },
  {
    title: "Payments",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Payments",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE],
  },
  {
    title: "PO / SO",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/POSO",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE],
  },
  {
    title: "Budget vs Actual",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Budget",
    type: "link",
    submenu: [],
    roles: [ROLES.FINANCE],
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
    roles: [ROLES.GC_PM, ROLES.OEM_PM, ROLES.FSE, ROLES.SUPERINTENDENT],
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
      ROLES.OEM_PM,
      ROLES.FSM,
      ROLES.FSE,
      ROLES.QA_QC,
      ROLES.SAFETY,
      ROLES.FINANCE,
      ROLES.EXECUTIVE,
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
      ROLES.OEM_PM,
      ROLES.FSM,
      ROLES.FSE,
      ROLES.SUPERINTENDENT,
      ROLES.QA_QC,
      ROLES.SAFETY,
      ROLES.FINANCE,
      ROLES.EXECUTIVE,
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
  if (role === "SUPERADMIN") return sidebarItems;

  return sidebarItems.filter(
    (item) => !item.roles || item.roles.includes(role),
  );
}
