"use client";
import config from "@/config";

export const ROLES = {
  // ── GC ───────────────────────────────────────────────────────────────────────
  GC_ADMIN: "gc_admin",
  GC_PM: "gc_pm",
  SUPERINTENDENT: "superintendent",
  GC_SCHEDULER: "gc_scheduler",
  GC_FOREMAN: "gc_foreman",
  GC_ESTIMATOR: "gc_estimator",
  GC_FIELD_ENGINEER: "gc_field_engineer",
  GC_PROCUREMENT: "gc_procurement",
  GC_SAFETY_MANAGER: "gc_safety_manager",
  GC_FINANCE: "gc_finance",
  // ── OEM ──────────────────────────────────────────────────────────────────────
  OEM_ADMIN: "oem_admin",
  OEM_PM: "oem_pm",
  FSM: "fsm",
  FSE: "fse",
  ASP: "asp",
  OEM_SALES: "oem_sales",
  OEM_ENGINEER: "oem_engineer",
  OEM_FACTORY_TECH: "oem_factory_tech",
  OEM_WARRANTY: "oem_warranty",
  // ── CUSTOMER ─────────────────────────────────────────────────────────────────
  CUSTOMER_EXEC: "customer_exec",
  CUSTOMER_PROGRAM_DIRECTOR: "customer_program_director",
  CUSTOMER_PM: "customer_pm",
  CUSTOMER_OWNER_REP: "customer_owner_rep",
  CUSTOMER_IT_MANAGER: "customer_it_manager",
  CUSTOMER_PROCUREMENT: "customer_procurement",
  CUSTOMER_FINANCE: "customer_finance",
  CUSTOMER_LEGAL: "customer_legal",
  CUSTOMER_CX_WITNESS: "customer_cx_witness",
  // ── BUILDER ──────────────────────────────────────────────────────────────────
  BUILDER_EXEC: "builder_exec",
  BUILDER_PM: "builder_pm",
  BUILDER_SUPERINTENDENT: "builder_superintendent",
  BUILDER_ESTIMATOR: "builder_estimator",
  BUILDER_ARCHITECT: "builder_architect",
  BUILDER_SAFETY: "builder_safety",
  BUILDER_FIELD_ENGINEER: "builder_field_engineer",
  BUILDER_FOREMAN: "builder_foreman",
  // ── TRADE ────────────────────────────────────────────────────────────────────
  TRADE_EXEC: "trade_exec",
  TRADE_PM: "trade_pm",
  TRADE_SUPERINTENDENT: "trade_superintendent",
  TRADE_FOREMAN: "trade_foreman",
  TRADE_JOURNEYMAN: "trade_journeyman",
  TRADE_APPRENTICE: "trade_apprentice",
  TRADE_SAFETY: "trade_safety",
  TRADE_ESTIMATOR: "trade_estimator",
  TRADE_QA: "trade_qa",
  // ── MECHANICAL ───────────────────────────────────────────────────────────────
  MECH_EXEC: "mech_exec",
  MECH_PM: "mech_pm",
  MECH_SUPERINTENDENT: "mech_superintendent",
  MECH_FOREMAN: "mech_foreman",
  MECH_TECHNICIAN: "mech_technician",
  MECH_CX_TECH: "mech_cx_tech",
  MECH_SAFETY: "mech_safety",
  // ── CONTROLS ─────────────────────────────────────────────────────────────────
  CONTROLS_EXEC: "controls_exec",
  CONTROLS_PM: "controls_pm",
  CONTROLS_ENGINEER: "controls_engineer",
  CONTROLS_TECHNICIAN: "controls_technician",
  CONTROLS_CX_TECH: "controls_cx_tech",
  CONTROLS_PROGRAMMER: "controls_programmer",
  CONTROLS_SAFETY: "controls_safety",
  // ── LOW VOLTAGE ──────────────────────────────────────────────────────────────
  LV_EXEC: "lv_exec",
  LV_PM: "lv_pm",
  LV_SUPERINTENDENT: "lv_superintendent",
  LV_TECHNICIAN: "lv_technician",
  LV_CX_TECH: "lv_cx_tech",
  LV_SAFETY: "lv_safety",
  // ── CXA ──────────────────────────────────────────────────────────────────────
  CXA_EXEC: "cxa_exec",
  CXA_PM: "cxa_pm",
  CXA_ENGINEER: "cxa_engineer",
  CXA_FIELD_AGENT: "cxa_field_agent",
  CXA_FUNCTIONAL_TESTER: "cxa_functional_tester",
  CXA_DOCUMENTER: "cxa_documenter",
  // ── AE ───────────────────────────────────────────────────────────────────────
  AE_EXEC: "ae_exec",
  AE_PM: "ae_pm",
  AE_ARCHITECT: "ae_architect",
  AE_STRUCTURAL_ENGINEER: "ae_structural_engineer",
  AE_MEP_ENGINEER: "ae_mep_engineer",
  AE_INSPECTOR: "ae_inspector",
  AE_CA: "ae_ca",
  // ── RIGGER ───────────────────────────────────────────────────────────────────
  RIGGER_EXEC: "rigger_exec",
  RIGGER_PM: "rigger_pm",
  RIGGER_SUPERINTENDENT: "rigger_superintendent",
  RIGGER_SIGNAL_PERSON: "rigger_signal_person",
  RIGGER_OPERATOR: "rigger_operator",
  RIGGER_SAFETY: "rigger_safety",
  // ── SECURITY ─────────────────────────────────────────────────────────────────
  SECURITY_EXEC: "security_exec",
  SECURITY_PM: "security_pm",
  SECURITY_ENGINEER: "security_engineer",
  SECURITY_TECHNICIAN: "security_technician",
  SECURITY_CX_TECH: "security_cx_tech",
  SECURITY_SAFETY: "security_safety",
  // ── FIRE ─────────────────────────────────────────────────────────────────────
  FIRE_EXEC: "fire_exec",
  FIRE_PM: "fire_pm",
  FIRE_DESIGNER: "fire_designer",
  FIRE_SUPERINTENDENT: "fire_superintendent",
  FIRE_TECHNICIAN: "fire_technician",
  FIRE_INSPECTOR: "fire_inspector",
  FIRE_SAFETY: "fire_safety",
  // ── STAFFING ─────────────────────────────────────────────────────────────────
  STAFFING_EXEC: "staffing_exec",
  STAFFING_RECRUITER: "staffing_recruiter",
  STAFFING_PM: "staffing_pm",
  STAFFING_WORKER: "staffing_worker",
  STAFFING_ACCOUNT_MGR: "staffing_account_mgr",
  // ── INTEGRATOR ───────────────────────────────────────────────────────────────
  INTEGRATOR_EXEC: "integrator_exec",
  INTEGRATOR_PM: "integrator_pm",
  INTEGRATOR_LEAD_TECH: "integrator_lead_tech",
  INTEGRATOR_NETWORK_ENGINEER: "integrator_network_engineer",
  INTEGRATOR_TECHNICIAN: "integrator_technician",
  INTEGRATOR_CX_TECH: "integrator_cx_tech",
  INTEGRATOR_SAFETY: "integrator_safety",
  INTEGRATOR_WARRANTY: "integrator_warranty",
  // ── OPERATIONS ───────────────────────────────────────────────────────────────
  OPS_EXEC: "ops_exec",
  OPS_DIRECTOR: "ops_director",
  OPS_FACILITY_MANAGER: "ops_facility_manager",
  OPS_SHIFT_SUPERVISOR: "ops_shift_supervisor",
  OPS_CRITICAL_TECH: "ops_critical_tech",
  OPS_CHANGE_MANAGER: "ops_change_manager",
  OPS_SAFETY: "ops_safety",
  OPS_WARRANTY_MANAGER: "ops_warranty_manager",
  OPS_FINANCE: "ops_finance",
  // ── CUSTOMER_CONST ───────────────────────────────────────────────────────────
  CC_EXEC: "cc_exec",
  CC_PM: "cc_pm",
  CC_OWNER_REP: "cc_owner_rep",
  CC_INSPECTOR: "cc_inspector",
  CC_FINANCE: "cc_finance",
  // ── UNIVERSAL ────────────────────────────────────────────────────────────────
  QA_QC: "qa_manager",
  SAFETY: "safety_officer",
  FINANCE: "finance",
  EXECUTIVE: "executive",
  // ── PLATFORM ─────────────────────────────────────────────────────────────────
  SUPERADMIN: "SUPERADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
};

const ALL = Object.values(ROLES);

// Helper: union of role arrays (deduped)
const union = (...arrays) => [...new Set(arrays.flat())];

// ── Role Groups ───────────────────────────────────────────────────────────────
// Used to build sidebar item role lists without repeating every role name.

// Platform admins always get everything
const PLATFORM = [ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN];

// Executive/director tier across all org types
const EXEC_ROLES = [
  ROLES.GC_ADMIN,
  ROLES.OEM_ADMIN,
  ROLES.EXECUTIVE,
  ROLES.BUILDER_EXEC,
  ROLES.TRADE_EXEC,
  ROLES.MECH_EXEC,
  ROLES.CONTROLS_EXEC,
  ROLES.LV_EXEC,
  ROLES.CXA_EXEC,
  ROLES.AE_EXEC,
  ROLES.RIGGER_EXEC,
  ROLES.SECURITY_EXEC,
  ROLES.FIRE_EXEC,
  ROLES.STAFFING_EXEC,
  ROLES.INTEGRATOR_EXEC,
  ROLES.OPS_EXEC,
  ROLES.OPS_DIRECTOR,
  ROLES.CUSTOMER_EXEC,
  ROLES.CUSTOMER_PROGRAM_DIRECTOR,
  ROLES.CC_EXEC,
];

// Project-management tier across all org types
const PM_ROLES = [
  ROLES.GC_PM,
  ROLES.GC_SCHEDULER,
  ROLES.OEM_PM,
  ROLES.FSM,
  ROLES.BUILDER_PM,
  ROLES.TRADE_PM,
  ROLES.MECH_PM,
  ROLES.CONTROLS_PM,
  ROLES.LV_PM,
  ROLES.CXA_PM,
  ROLES.AE_PM,
  ROLES.RIGGER_PM,
  ROLES.SECURITY_PM,
  ROLES.FIRE_PM,
  ROLES.STAFFING_PM,
  ROLES.INTEGRATOR_PM,
  ROLES.OPS_FACILITY_MANAGER,
  ROLES.OPS_CHANGE_MANAGER,
  ROLES.CUSTOMER_PM,
  ROLES.CC_PM,
];

// Site superintendents / shift supervisors across all org types
const SUPERINTENDENT_ROLES = [
  ROLES.SUPERINTENDENT,
  ROLES.BUILDER_SUPERINTENDENT,
  ROLES.TRADE_SUPERINTENDENT,
  ROLES.MECH_SUPERINTENDENT,
  ROLES.LV_SUPERINTENDENT,
  ROLES.RIGGER_SUPERINTENDENT,
  ROLES.FIRE_SUPERINTENDENT,
  ROLES.OPS_SHIFT_SUPERVISOR,
];

// Field execution workers (hands-on, non-supervisory)
const FIELD_WORKER_ROLES = [
  ROLES.FSE,
  ROLES.ASP,
  ROLES.GC_FOREMAN,
  ROLES.GC_FIELD_ENGINEER,
  ROLES.OEM_FACTORY_TECH,
  ROLES.BUILDER_FOREMAN,
  ROLES.BUILDER_FIELD_ENGINEER,
  ROLES.TRADE_FOREMAN,
  ROLES.TRADE_JOURNEYMAN,
  ROLES.TRADE_APPRENTICE,
  ROLES.MECH_FOREMAN,
  ROLES.MECH_TECHNICIAN,
  ROLES.MECH_CX_TECH,
  ROLES.CONTROLS_ENGINEER,
  ROLES.CONTROLS_TECHNICIAN,
  ROLES.CONTROLS_CX_TECH,
  ROLES.CONTROLS_PROGRAMMER,
  ROLES.LV_TECHNICIAN,
  ROLES.LV_CX_TECH,
  ROLES.CXA_ENGINEER,
  ROLES.CXA_FIELD_AGENT,
  ROLES.CXA_FUNCTIONAL_TESTER,
  ROLES.CXA_DOCUMENTER,
  ROLES.AE_ARCHITECT,
  ROLES.AE_STRUCTURAL_ENGINEER,
  ROLES.AE_MEP_ENGINEER,
  ROLES.AE_INSPECTOR,
  ROLES.AE_CA,
  ROLES.RIGGER_SIGNAL_PERSON,
  ROLES.RIGGER_OPERATOR,
  ROLES.SECURITY_ENGINEER,
  ROLES.SECURITY_TECHNICIAN,
  ROLES.SECURITY_CX_TECH,
  ROLES.FIRE_DESIGNER,
  ROLES.FIRE_TECHNICIAN,
  ROLES.FIRE_INSPECTOR,
  ROLES.STAFFING_WORKER,
  ROLES.INTEGRATOR_LEAD_TECH,
  ROLES.INTEGRATOR_NETWORK_ENGINEER,
  ROLES.INTEGRATOR_TECHNICIAN,
  ROLES.INTEGRATOR_CX_TECH,
  ROLES.OPS_CRITICAL_TECH,
  ROLES.CUSTOMER_OWNER_REP,
  ROLES.CUSTOMER_CX_WITNESS,
  ROLES.CUSTOMER_IT_MANAGER,
  ROLES.CC_OWNER_REP,
  ROLES.CC_INSPECTOR,
];

// Safety and quality specialists
const SAFETY_QA_ROLES = [
  ROLES.QA_QC,
  ROLES.SAFETY,
  ROLES.GC_SAFETY_MANAGER,
  ROLES.BUILDER_SAFETY,
  ROLES.TRADE_SAFETY,
  ROLES.TRADE_QA,
  ROLES.MECH_SAFETY,
  ROLES.CONTROLS_SAFETY,
  ROLES.LV_SAFETY,
  ROLES.RIGGER_SAFETY,
  ROLES.SECURITY_SAFETY,
  ROLES.FIRE_SAFETY,
  ROLES.FIRE_INSPECTOR,
  ROLES.INTEGRATOR_SAFETY,
  ROLES.OPS_SAFETY,
  ROLES.AE_INSPECTOR,
];

// Finance-focused roles
const FINANCE_ROLES = [
  ROLES.FINANCE,
  ROLES.GC_FINANCE,
  ROLES.CUSTOMER_FINANCE,
  ROLES.CC_FINANCE,
  ROLES.OPS_FINANCE,
];

// Sales / estimating roles
const SALES_ROLES = [
  ROLES.GC_ESTIMATOR,
  ROLES.OEM_SALES,
  ROLES.BUILDER_ESTIMATOR,
  ROLES.TRADE_ESTIMATOR,
  ROLES.STAFFING_RECRUITER,
  ROLES.STAFFING_ACCOUNT_MGR,
];

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
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "OEM Dashboard",
        type: "link",
        path: "/OEM/Dashboard",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "FSM Dashboard",
        type: "link",
        path: "/Dispatch/Dashboard",
        roles: [ROLES.FSM, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Field Dashboard",
        type: "link",
        path: "/Field/Dashboard",
        roles: [ROLES.SUPERINTENDENT, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "QA/QC Dashboard",
        type: "link",
        path: "/QAQC/Dashboard",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Safety Dashboard",
        type: "link",
        path: "/Safety/Audits",
        roles: [ROLES.SAFETY, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Finance Dashboard",
        type: "link",
        path: "/Finance/Dashboard",
        roles: [ROLES.FINANCE, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Executive Dashboard",
        type: "link",
        path: "/Executive/Dashboard",
        roles: [ROLES.EXECUTIVE, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
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
    roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [
      ROLES.QA_QC,
      ROLES.CUSTOMER_OWNER_REP,
      ROLES.CC_OWNER_REP,
    ]),
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
        roles: union(SUPERINTENDENT_ROLES, FIELD_WORKER_ROLES, PLATFORM, [
          ROLES.FSE,
          ROLES.ASP,
        ]),
      },
      {
        title: "Issues",
        type: "link",
        path: "/Issues/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FIELD_WORKER_ROLES,
          SAFETY_QA_ROLES,
          PLATFORM,
        ),
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
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          SAFETY_QA_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP],
        ),
      },
      {
        title: "Change Requests",
        type: "link",
        path: "/ChangeRequests",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM),
      },
      {
        title: "Communications",
        type: "link",
        path: "/Communications",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          SAFETY_QA_ROLES,
          PLATFORM,
        ),
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
    roles: union(EXEC_ROLES, PM_ROLES, SUPERINTENDENT_ROLES, PLATFORM, [
      ROLES.FSE,
      ROLES.ASP,
    ]),
    submenu: [
      {
        title: "Schedule & Look-Ahead",
        type: "link",
        path: "/Schedule",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.GC_SCHEDULER,
          ROLES.SUPERINTENDENT,
          ROLES.BUILDER_SUPERINTENDENT,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Service Schedule / Dispatch",
        type: "link",
        path: "/ServiceSchedule",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Assignments",
        type: "link",
        path: "/Assignments",
        roles: [ROLES.FSM, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Schedule & Windows",
        type: "link",
        path: "/ScheduleWindows",
        roles: [ROLES.FSM, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "My Assignments",
        type: "link",
        path: "/MyAssignments",
        roles: [ROLES.FSE, ROLES.ASP, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
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
      EXEC_ROLES,
      PM_ROLES,
      SUPERINTENDENT_ROLES,
      FIELD_WORKER_ROLES,
      PLATFORM,
    ),
    submenu: [
      {
        title: "Commissioning",
        type: "link",
        path: "/Commissioning",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [
          ROLES.FSE,
          ROLES.ASP,
          ROLES.CXA_ENGINEER,
          ROLES.CXA_FIELD_AGENT,
          ROLES.CXA_FUNCTIONAL_TESTER,
          ROLES.MECH_CX_TECH,
          ROLES.CONTROLS_CX_TECH,
          ROLES.LV_CX_TECH,
          ROLES.SECURITY_CX_TECH,
          ROLES.INTEGRATOR_CX_TECH,
          ROLES.CUSTOMER_IT_MANAGER,
          ROLES.CUSTOMER_CX_WITNESS,
          ROLES.OPS_CRITICAL_TECH,
        ]),
      },
      {
        title: "Test Results Upload",
        type: "link",
        path: "/TestResults",
        roles: union(PLATFORM, [
          ROLES.FSE,
          ROLES.ASP,
          ROLES.CXA_FIELD_AGENT,
          ROLES.CXA_FUNCTIONAL_TESTER,
          ROLES.MECH_CX_TECH,
          ROLES.CONTROLS_CX_TECH,
          ROLES.LV_CX_TECH,
          ROLES.SECURITY_CX_TECH,
          ROLES.INTEGRATOR_CX_TECH,
        ]),
      },
      {
        title: "Field Reports",
        type: "link",
        path: "/FieldReports",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Daily Reports",
        type: "link",
        path: "/DailyReports",
        roles: union(SUPERINTENDENT_ROLES, PLATFORM, [
          ROLES.GC_FOREMAN,
          ROLES.BUILDER_FOREMAN,
          ROLES.TRADE_FOREMAN,
        ]),
      },
      {
        title: "Logistics",
        type: "link",
        path: "/Logistics",
        roles: [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
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
      EXEC_ROLES,
      PM_ROLES,
      SUPERINTENDENT_ROLES,
      FINANCE_ROLES,
      PLATFORM,
      [
        ROLES.FSE,
        ROLES.ASP,
        ROLES.GC_PROCUREMENT,
        ROLES.BUILDER_ESTIMATOR,
        ROLES.TRADE_ESTIMATOR,
        ROLES.CUSTOMER_PROCUREMENT,
      ],
    ),
    submenu: [
      {
        title: "Products & SKUs",
        type: "link",
        path: "/Inventory/Products/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Stock Movements",
        type: "link",
        path: "/Inventory/Movements/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Warehouses",
        type: "link",
        path: "/Inventory/Warehouses/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Suppliers",
        type: "link",
        path: "/Inventory/Suppliers/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Shipments",
        type: "link",
        path: "/Shipments/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "Carriers",
        type: "link",
        path: "/Shipments/Carriers",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP, ROLES.GC_PROCUREMENT],
        ),
      },
      {
        title: "OEM Supply Chain",
        type: "link",
        path: "/SupplyChain",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Shipment Dashboard",
        type: "link",
        path: "/Shipment/Dashboard",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Receiving",
        type: "link",
        path: "/Receiving/Overview",
        roles: [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.SUPERADMIN,
          ROLES.PLATFORM_ADMIN,
        ],
      },
      {
        title: "Assets",
        type: "link",
        path: "/Assets/List",
        roles: union(
          EXEC_ROLES,
          PM_ROLES,
          SUPERINTENDENT_ROLES,
          FINANCE_ROLES,
          PLATFORM,
          [ROLES.FSE, ROLES.ASP],
        ),
      },
      {
        title: "RMA / Service",
        type: "link",
        path: "/RMA",
        roles: union(PLATFORM, [
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES.FSE,
          ROLES.ASP,
          ROLES.OEM_WARRANTY,
          ROLES.INTEGRATOR_WARRANTY,
          ROLES.OPS_WARRANTY_MANAGER,
        ]),
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
      EXEC_ROLES,
      PM_ROLES,
      SUPERINTENDENT_ROLES,
      SAFETY_QA_ROLES,
      PLATFORM,
      [
        ROLES.CXA_ENGINEER,
        ROLES.CXA_FIELD_AGENT,
        ROLES.OEM_FACTORY_TECH,
        ROLES.MECH_CX_TECH,
        ROLES.CONTROLS_CX_TECH,
        ROLES.LV_CX_TECH,
        ROLES.CUSTOMER_IT_MANAGER,
        ROLES.CUSTOMER_CX_WITNESS,
        ROLES.CC_INSPECTOR,
      ],
    ),
    submenu: [
      {
        title: "Quality (NCR)",
        type: "link",
        path: "/Quality",
        roles: union(SUPERINTENDENT_ROLES, PLATFORM, [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.GC_FIELD_ENGINEER,
        ]),
      },
      {
        title: "Inspections",
        type: "link",
        path: "/QAQC/Inspections",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "NCRs / Defects",
        type: "link",
        path: "/QAQC/NCRs",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Corrective Actions",
        type: "link",
        path: "/QAQC/CorrectiveActions",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Evidence Library",
        type: "link",
        path: "/QAQC/EvidenceLibrary",
        roles: [ROLES.QA_QC, ROLES.SUPERADMIN, ROLES.PLATFORM_ADMIN],
      },
      {
        title: "Safety",
        type: "link",
        path: "/Safety",
        roles: union(SUPERINTENDENT_ROLES, PLATFORM, [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.GC_SAFETY_MANAGER,
        ]),
      },
      {
        title: "JHAs / JSAs & Permits",
        type: "link",
        path: "/Safety/Reports",
        roles: union(SAFETY_QA_ROLES, PLATFORM),
      },
      {
        title: "Incidents",
        type: "link",
        path: "/Safety/Incidents",
        roles: union(SAFETY_QA_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Audits",
        type: "link",
        path: "/Safety/Audits",
        roles: union(SAFETY_QA_ROLES, PLATFORM),
      },
      {
        title: "Training Compliance",
        type: "link",
        path: "/Safety/Training",
        roles: union(SAFETY_QA_ROLES, PLATFORM),
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
    roles: union(FINANCE_ROLES, PLATFORM, [
      ROLES.GC_ADMIN,
      ROLES.GC_PM,
      ROLES.GC_PROCUREMENT,
      ROLES.OEM_ADMIN,
      ROLES.OEM_PM,
      ROLES.CUSTOMER_EXEC,
      ROLES.CUSTOMER_PROGRAM_DIRECTOR,
      ROLES.CC_EXEC,
      ROLES.OPS_EXEC,
      ROLES.OPS_DIRECTOR,
    ]),
    submenu: [
      {
        title: "Dashboard",
        type: "link",
        path: "/Finance/Dashboard",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Contracts & Budget",
        type: "link",
        path: "/Finance/Contracts",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Vendor Quotes",
        type: "link",
        path: "/Finance/VendorQuotes",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Billing",
        type: "link",
        path: "/Finance/Billing",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Billing Chain",
        type: "link",
        path: "/Finance/BillingChain",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Procurement & Delays",
        type: "link",
        path: "/Finance/Procurement",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
          ROLES.GC_PROCUREMENT,
        ]),
      },
      {
        title: "Payroll Dashboard",
        type: "link",
        path: "/Finance/Payroll/Dashboard",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Employees",
        type: "link",
        path: "/Finance/Payroll/Employees",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Timesheets",
        type: "link",
        path: "/Finance/Payroll/Timesheets",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
      },
      {
        title: "Payroll Processing",
        type: "link",
        path: "/Finance/Payroll/PayrollProcessing",
        roles: union(FINANCE_ROLES, PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.GC_PM,
          ROLES.OEM_ADMIN,
        ]),
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
    roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [ROLES.QA_QC]),
    submenu: [
      {
        title: "Teams",
        type: "link",
        path: "/Teams/List",
        roles: union(EXEC_ROLES, PM_ROLES, PLATFORM, [ROLES.QA_QC]),
      },
      {
        title: "Users",
        type: "link",
        path: "/Users/List",
        roles: union(PLATFORM, [
          ROLES.GC_PM,
          ROLES.GC_ADMIN,
          ROLES.OEM_PM,
          ROLES.OEM_ADMIN,
          ROLES.BUILDER_EXEC,
          ROLES.BUILDER_PM,
          ROLES.TRADE_EXEC,
          ROLES.TRADE_PM,
          ROLES?.CUSTOMER_EXEC,
        ]),
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
    roles: union(
      EXEC_ROLES,
      PM_ROLES,
      SAFETY_QA_ROLES,
      FINANCE_ROLES,
      SALES_ROLES,
      PLATFORM,
      [
        ROLES.FSE,
        ROLES.ASP,
        ROLES.OEM_ENGINEER,
        ROLES.OEM_WARRANTY,
        ROLES.CXA_ENGINEER,
        ROLES.CXA_FIELD_AGENT,
        ROLES.TRADE_QA,
        ROLES.OPS_WARRANTY_MANAGER,
      ],
    ),
  },

  // ─── Executive ──────────────────────────────────────────────────────
  {
    title: "Executive",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Portfolio",
    type: "link",
    roles: union(PLATFORM, [
      ROLES.EXECUTIVE,
      ROLES.CUSTOMER_EXEC,
      ROLES.CUSTOMER_PROGRAM_DIRECTOR,
      ROLES.OPS_EXEC,
      ROLES.OPS_DIRECTOR,
    ]),
    submenu: [
      {
        title: "Portfolio",
        type: "link",
        path: "/Portfolio",
        roles: union(PLATFORM, [
          ROLES.EXECUTIVE,
          ROLES.CUSTOMER_EXEC,
          ROLES.CUSTOMER_PROGRAM_DIRECTOR,
          ROLES.OPS_EXEC,
          ROLES.OPS_DIRECTOR,
        ]),
      },
      {
        title: "KPIs",
        type: "link",
        path: "/KPIs",
        roles: union(PLATFORM, [
          ROLES.EXECUTIVE,
          ROLES.CUSTOMER_EXEC,
          ROLES.CUSTOMER_PROGRAM_DIRECTOR,
          ROLES.OPS_EXEC,
          ROLES.OPS_DIRECTOR,
        ]),
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
        roles: PLATFORM,
      },
      {
        title: "Permissions",
        type: "link",
        path: "/Permissions",
        roles: PLATFORM,
      },
      {
        title: "Subscriptions",
        type: "link",
        path: "/Subscriptions/List",
        roles: PLATFORM,
      },
      {
        title: "Org Workflows",
        type: "link",
        path: "/OrgWorkflows",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Org SOPs",
        type: "link",
        path: "/OrgSOPs",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Mob Catalog",
        type: "link",
        path: "/OrgMobCatalog",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.FSM,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Safety Plan Templates",
        type: "link",
        path: "/OrgSafetyPlans",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.SAFETY,
          ROLES?.CUSTOMER_EXEC,
        ]),
      },
      {
        title: "Toolbox Talks",
        type: "link",
        path: "/OrgToolboxTalks",
        roles: union(PLATFORM, [
          ROLES.GC_ADMIN,
          ROLES.OEM_ADMIN,
          ROLES.SAFETY,
          ROLES?.CUSTOMER_EXEC,
        ]),
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
 * Returns sidebar items filtered by role, with an optional second-layer
 * filter on accessibleModules (array of title strings from the user object).
 * When accessibleModules is present and non-empty, top-level items are only
 * shown if their title appears in the list (case-insensitive).
 * Falls back to role-only filtering when accessibleModules is null/undefined/empty.
 */
export function getMenuByRole(role, accessibleModules) {
  const moduleSet =
    Array.isArray(accessibleModules) && accessibleModules.length > 0
      ? new Set(accessibleModules.map((m) => m.toLowerCase()))
      : null;

  return sidebarItems
    .filter((item) => {
      if (item.roles && !item.roles.includes(role)) return false;
      if (moduleSet && !moduleSet.has((item.title || "").toLowerCase()))
        return false;
      return true;
    })
    .map((item) => ({
      ...item,
      submenu: (item.submenu || []).filter(
        (sub) => !sub.roles || sub.roles.includes(role),
      ),
    }));
}
