"use client";
import config from "@/config";

export const ROLES = {
  GC_PM: "gc_pm",
  GC_ADMIN: "gc_admin",
  OEM_PM: "oem_pm",
  OEM_ADMIN: "oem_admin",
  FSM: "fsm",
  FSE: "fse",
  SUPERINTENDENT: "superintendent",
  QA_QC: "qa_manager",
  SAFETY: "safety_officer",
  FINANCE: "finance",
  EXECUTIVE: "executive",
  SUPERADMIN: "SUPERADMIN",
};

const ALL = Object.values(ROLES);

// Helper: union of role arrays (deduped)
const union = (...arrays) => [...new Set(arrays.flat())];

export const sidebarItems = [
  // ─── Dashboards ─────────────────────────────────────────────────────
  {
    title: "Dashboards",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/",
    type: "link",
    roles: ALL,
    submenu: [
      {
        title: "GC Dashboard",
        type: "link",
        path: "/",
        roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "OEM Dashboard",
        type: "link",
        path: "/OEM/Dashboard",
        roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "FSM Dashboard",
        type: "link",
        path: "/Dispatch/Dashboard",
        roles: [ROLES.FSM, ROLES.SUPERADMIN],
      },
      {
        title: "Field Dashboard",
        type: "link",
        path: "/Field/Dashboard",
        roles: [ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
      },
      {
        title: "QA/QC Dashboard",
        type: "link",
        path: "/QAQC/Dashboard",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
      },
      {
        title: "Safety Dashboard",
        type: "link",
        path: "/Safety/Audits",
        roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
      },
      {
        title: "Finance Dashboard",
        type: "link",
        path: "/Finance/Dashboard",
        roles: [ROLES.FINANCE, ROLES.SUPERADMIN],
      },
      {
        title: "Executive Dashboard",
        type: "link",
        path: "/Executive/Dashboard",
        roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN],
      },
    ],
  },

  // ─── Projects ───────────────────────────────────────────────────────
  {
    title: "Projects",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Projects",
    type: "link",
    submenu: [],
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

  // ─── CRM ────────────────────────────────────────────────────────────
  {
    title: "CRM",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/CRM/Leads/List",
    type: "link",
    roles: ALL,
    submenu: [
      { title: "Leads", type: "link", path: "/CRM/Leads/List", roles: ALL },
      { title: "Companies", type: "link", path: "/Company/List", roles: ALL },
      {
        title: "Contacts",
        type: "link",
        path: "/CRM/Contacts/List",
        roles: ALL,
      },
      { title: "Deals", type: "link", path: "/CRM/Deals/List", roles: ALL },
    ],
  },

  // ─── Operations ─────────────────────────────────────────────────────
  {
    title: "Operations",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Checklist/List",
    type: "link",
    roles: ALL,
    submenu: [
      {
        title: "Checklists",
        type: "link",
        path: "/Checklist/List",
        roles: ALL,
      },
      {
        title: "Tasks",
        type: "link",
        path: "/Tasks/List",
        roles: [ROLES.FSE, ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
      },
      {
        title: "Issues",
        type: "link",
        path: "/Issues/List",
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
          ROLES.EXECUTIVE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "RFIs",
        type: "link",
        path: "/RFI/List",
        roles: ALL,
      },
      {
        title: "Meetings",
        type: "link",
        path: "/Meeting/List",
        roles: ALL,
      },
      {
        title: "Site Access (TARF)",
        type: "link",
        path: "/TARF/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.FSE,
          ROLES.SUPERINTENDENT,
          ROLES.SAFETY,
          ROLES.QA_QC,
          ROLES.SUPERADMIN,
        ],
      },

      {
        title: "Change Requests",
        type: "link",
        path: "/ChangeRequests",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Communications",
        type: "link",
        path: "/Communications",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERINTENDENT,
          ROLES.QA_QC,
          ROLES.SUPERADMIN,
        ],
      },
    ],
  },

  // ─── Scheduling ─────────────────────────────────────────────────────
  {
    title: "Scheduling",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Schedule",
    type: "link",
    roles: union(
      [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERINTENDENT],
      [ROLES.OEM_PM, ROLES.OEM_ADMIN],
      [ROLES.FSM],
      [ROLES.FSE],
      [ROLES.SUPERADMIN],
    ),
    submenu: [
      {
        title: "Schedule & Look-Ahead",
        type: "link",
        path: "/Schedule",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERINTENDENT,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Service Schedule / Dispatch",
        type: "link",
        path: "/ServiceSchedule",
        roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Assignments",
        type: "link",
        path: "/Assignments",
        roles: [ROLES.FSM, ROLES.SUPERADMIN],
      },
      {
        title: "Schedule & Windows",
        type: "link",
        path: "/ScheduleWindows",
        roles: [ROLES.FSM, ROLES.SUPERADMIN],
      },
      {
        title: "My Assignments",
        type: "link",
        path: "/MyAssignments",
        roles: [ROLES.FSE, ROLES.SUPERADMIN],
      },
    ],
  },

  // ─── Field Operations ───────────────────────────────────────────────
  {
    title: "Field Operations",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Commissioning",
    type: "link",
    roles: union(
      [ROLES.GC_PM, ROLES.GC_ADMIN],
      [ROLES.OEM_PM, ROLES.OEM_ADMIN],
      [ROLES.FSM, ROLES.FSE],
      [ROLES.SUPERINTENDENT],
      [ROLES.SUPERADMIN],
    ),
    submenu: [
      {
        title: "Commissioning",
        type: "link",
        path: "/Commissioning",
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
      {
        title: "Test Results Upload",
        type: "link",
        path: "/TestResults",
        roles: [ROLES.FSE, ROLES.SUPERADMIN],
      },
      {
        title: "Field Reports",
        type: "link",
        path: "/FieldReports",
        roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Daily Reports",
        type: "link",
        path: "/DailyReports",
        roles: [ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
      },
      {
        title: "Logistics",
        type: "link",
        path: "/Logistics",
        roles: [ROLES.GC_PM, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
      },
    ],
  },

  // ─── Supply Chain ───────────────────────────────────────────────────
  {
    title: "Supply Chain",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Inventory/Products/List",
    type: "link",
    roles: union(
      [ROLES.GC_PM, ROLES.GC_ADMIN],
      [ROLES.OEM_PM, ROLES.OEM_ADMIN],
      [ROLES.FSM, ROLES.FSE],
      [ROLES.SUPERINTENDENT],
      [ROLES.FINANCE],
      [ROLES.SUPERADMIN],
    ),
    submenu: [
      {
        title: "Products & SKUs",
        type: "link",
        path: "/Inventory/Products/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.SUPERINTENDENT,
          ROLES.FINANCE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Stock Movements",
        type: "link",
        path: "/Inventory/Movements/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.SUPERINTENDENT,
          ROLES.FINANCE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Warehouses",
        type: "link",
        path: "/Inventory/Warehouses/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.SUPERINTENDENT,
          ROLES.FINANCE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Suppliers",
        type: "link",
        path: "/Inventory/Suppliers/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.SUPERINTENDENT,
          ROLES.FINANCE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Shipments",
        type: "link",
        path: "/Shipments/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.SUPERINTENDENT,
          ROLES.FINANCE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Carriers",
        type: "link",
        path: "/Shipments/Carriers",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.SUPERINTENDENT,
          ROLES.FINANCE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "OEM Supply Chain",
        type: "link",
        path: "/SupplyChain",
        roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Shipment Dashboard",
        type: "link",
        path: "/Shipment/Dashboard",
        roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Receiving",
        type: "link",
        path: "/Receiving/Overview",
        roles: [ROLES.OEM_PM, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Assets",
        type: "link",
        path: "/Assets/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.FSE,
          ROLES.SUPERINTENDENT,
          ROLES.FINANCE,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "RMA / Service",
        type: "link",
        path: "/RMA",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.FSE,
          ROLES.SUPERADMIN,
        ],
      },
    ],
  },

  // ─── Quality & Safety ───────────────────────────────────────────────
  {
    title: "Quality & Safety",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QAQC/Inspections",
    type: "link",
    roles: union(
      [ROLES.GC_PM, ROLES.GC_ADMIN],
      [ROLES.SUPERINTENDENT],
      [ROLES.QA_QC],
      [ROLES.SAFETY],
      [ROLES.SUPERADMIN],
    ),
    submenu: [
      {
        title: "Quality (NCR)",
        type: "link",
        path: "/Quality",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERINTENDENT,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Inspections",
        type: "link",
        path: "/QAQC/Inspections",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
      },
      {
        title: "NCRs / Defects",
        type: "link",
        path: "/QAQC/NCRs",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
      },
      {
        title: "Corrective Actions",
        type: "link",
        path: "/QAQC/CorrectiveActions",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
      },
      {
        title: "Evidence Library",
        type: "link",
        path: "/QAQC/EvidenceLibrary",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN],
      },
      {
        title: "Safety",
        type: "link",
        path: "/Safety",
        roles: [ROLES.GC_PM, ROLES.SUPERINTENDENT, ROLES.SUPERADMIN],
      },
      {
        title: "JHAs / JSAs & Permits",
        type: "link",
        path: "/Safety/Reports",
        roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
      },
      {
        title: "Incidents",
        type: "link",
        path: "/Safety/Incidents",
        roles: [ROLES.SAFETY, ROLES.GC_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Audits",
        type: "link",
        path: "/Safety/Audits",
        roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
      },
      {
        title: "Training Compliance",
        type: "link",
        path: "/Safety/Training",
        roles: [ROLES.SAFETY, ROLES.SUPERADMIN],
      },
    ],
  },

  // ─── Finance ────────────────────────────────────────────────────────
  {
    title: "Finance",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance/Dashboard",
    type: "link",
    roles: [
      ROLES.FINANCE,
      ROLES.GC_ADMIN,
      ROLES.GC_PM,
      ROLES.OEM_ADMIN,
      ROLES.SUPERADMIN,
    ],
    submenu: [
      {
        title: "Dashboard",
        type: "link",
        path: "/Finance/Dashboard",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Contracts & Budget",
        type: "link",
        path: "/Finance/Contracts",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Vendor Quotes",
        type: "link",
        path: "/Finance/VendorQuotes",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Billing",
        type: "link",
        path: "/Finance/Billing",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Billing Chain",
        type: "link",
        path: "/Finance/BillingChain",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Procurement & Delays",
        type: "link",
        path: "/Finance/Procurement",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Payroll Dashboard",
        type: "link",
        path: "/Finance/Payroll/Dashboard",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Employees",
        type: "link",
        path: "/Finance/Payroll/Employees",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Timesheets",
        type: "link",
        path: "/Finance/Payroll/Timesheets",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Payroll Processing",
        type: "link",
        path: "/Finance/Payroll/PayrollProcessing",
        roles: [
          ROLES.FINANCE,
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
    ],
  },

  // ─── People ─────────────────────────────────────────────────────────
  {
    title: "People",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Teams/List",
    type: "link",
    roles: union(
      [ROLES.GC_PM, ROLES.GC_ADMIN],
      [ROLES.OEM_PM, ROLES.OEM_ADMIN],
      [ROLES.FSM, ROLES.QA_QC],
      [ROLES.SUPERADMIN],
    ),
    submenu: [
      {
        title: "Teams",
        type: "link",
        path: "/Teams/List",
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
      {
        title: "Users",
        type: "link",
        path: "/Users/List",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
        ],
      },
    ],
  },

  // ─── Documentation ──────────────────────────────────────────────────
  {
    title: "Documentation",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Document/List",
    type: "link",
    roles: ALL,
    submenu: [
      { title: "Documents", type: "link", path: "/Document/List", roles: ALL },
      {
        title: "Submittals",
        type: "link",
        path: "/Submittals/List",
        roles: ALL,
      },
    ],
  },

  // ─── Reports ────────────────────────────────────────────────────────
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

  // ─── Executive ──────────────────────────────────────────────────────
  {
    title: "Executive",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Portfolio",
    type: "link",
    roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN],
    submenu: [
      {
        title: "Portfolio",
        type: "link",
        path: "/Portfolio",
        roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN],
      },
      {
        title: "KPIs",
        type: "link",
        path: "/KPIs",
        roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN],
      },
    ],
  },

  // ─── Administration ─────────────────────────────────────────────────
  {
    title: "Administration",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Admin/OwnerPortal",
    type: "link",
    roles: ALL,
    submenu: [
      {
        title: "Owner Portal",
        type: "link",
        path: "/Admin/OwnerPortal",
        roles: ALL,
      },
      {
        title: "Tenants",
        type: "link",
        path: "/Admin/OwnerPortal/Tenants",
        roles: ALL,
      },
      {
        title: "Platform Subscriptions",
        type: "link",
        path: "/Admin/OwnerPortal/Subscriptions",
        roles: ALL,
      },
      {
        title: "Audit Logs",
        type: "link",
        path: "/Admin/OwnerPortal/AuditLogs",
        roles: ALL,
      },
      {
        title: "Roles",
        type: "link",
        path: "/Roles/List",
        roles: [ROLES.SUPERADMIN],
      },
      {
        title: "Permissions",
        type: "link",
        path: "/Permissions",
        roles: [ROLES.SUPERADMIN],
      },
      {
        title: "Subscriptions",
        type: "link",
        path: "/Subscriptions/List",
        roles: [ROLES.SUPERADMIN],
      },
      {
        title: "Org Workflows",
        type: "link",
        path: "/OrgWorkflows",
        roles: [ROLES.GC_ADMIN, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Org SOPs",
        type: "link",
        path: "/OrgSOPs",
        roles: [ROLES.GC_ADMIN, ROLES.OEM_ADMIN, ROLES.SUPERADMIN],
      },
      {
        title: "Mob Catalog",
        type: "link",
        path: "/OrgMobCatalog",
        roles: [ROLES.GC_ADMIN, ROLES.OEM_ADMIN, ROLES.FSM, ROLES.SUPERADMIN],
      },
      {
        title: "Safety Plan Templates",
        type: "link",
        path: "/OrgSafetyPlans",
        roles: [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.SAFETY,
          ROLES.SUPERADMIN,
        ],
      },
      {
        title: "Toolbox Talks",
        type: "link",
        path: "/OrgToolboxTalks",
        roles: [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.SAFETY,
          ROLES.SUPERADMIN,
        ],
      },
    ],
  },

  // ─── Settings ───────────────────────────────────────────────────────
  {
    title: "Settings",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Settings",
    type: "link",
    submenu: [],
    roles: ALL,
  },
];

/**
 * Returns sidebar items filtered by role.
 * Also filters submenu items by role so only accessible children are shown.
 * Parents with all children filtered out are removed.
 */
export function getMenuByRole(role) {
  return sidebarItems
    .filter((item) => !item.roles || item.roles.includes(role))
    .map((item) => ({
      ...item,
      submenu: (item.submenu || []).filter(
        (sub) => !sub.roles || sub.roles.includes(role),
      ),
    }))
    .filter((item) => item.submenu.length === 0 || item.submenu.length > 0);
}
