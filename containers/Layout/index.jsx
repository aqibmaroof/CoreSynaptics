"use client";

// CxLayout — application shell mirroring cxcontrol_v2.html exactly:
//   · 56px sticky topbar with logo mark (CX), project picker, search, bell, avatar
//   · 240px sticky left sidebar with section labels, nav items, badges
//   · You-panel summarising the signed-in user
// Uses the .cx-* helper classes defined in app/globals.css.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getAccessToken,
  clearTokens,
  setUser,
  setOrganization,
} from "@/services/instance/tokenService";
import { GetOrganization, GetUser, Logout } from "@/services/auth";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import NotificationBell from "@/components/NotificationBell";
import OnboardingTourOverlay from "@/components/OnboardingTourOverlay";
import {
  canAccessModule,
  isSuperUser,
  MODULE,
  useUserPermissions,
  useRequirePermission,
} from "@/Utils/rbac";
import { getRoles } from "@/services/Roles";

// ─── Route → (module, action) permission map ─────────────────────────────
// Layout is mounted by every page.* route in /app, so we centralise the
// page-level RBAC hard-gate here. Order matters: more specific patterns
// (Add/Edit/Wizard) come BEFORE the generic prefix so the edit-level guard
// wins. Pathnames that match no entry render unconditionally (auth, profile,
// glossary, learning aids — all universal content).
const ROUTE_PERMISSIONS = [
  // ── Projects / Portfolio / Copilot ───────────────────────────────────
  { match: /^\/CreateProject/, module: MODULE.PROJECTS, action: "edit" },
  { match: /^\/create-project/, module: MODULE.PROJECTS, action: "edit" },
  { match: /^\/Projects(\/|$)/, module: MODULE.PROJECTS, action: "view" },
  { match: /^\/ProjectOverview/, module: MODULE.PROJECTS, action: "view" },
  { match: /^\/ProjectDetails/, module: MODULE.PROJECTS, action: "view" },
  { match: /^\/Portfolio(\/|$)/, module: MODULE.PROJECTS, action: "view" },
  { match: /^\/PortfolioCopilot/, module: MODULE.COPILOT, action: "view" },
  {
    match: /^\/PortfolioPredictions/,
    module: MODULE.PREDICTION,
    action: "view",
  },
  { match: /^\/ProjectCopilot/, module: MODULE.COPILOT, action: "view" },
  {
    match: /^\/ChangeRequests\/(?:Add|Edit)/,
    module: MODULE.PROJECTS,
    action: "edit",
  },
  { match: /^\/ChangeRequests/, module: MODULE.PROJECTS, action: "view" },
  { match: /^\/ChangeOrders/, module: MODULE.PROJECTS, action: "view" },

  // ── Tasks ────────────────────────────────────────────────────────────
  {
    match: /^\/Tasks\/(?:CreateTask|Add)/,
    module: MODULE.TASKS,
    action: "edit",
  },
  { match: /^\/Tasks(\/|$)/, module: MODULE.TASKS, action: "view" },

  // ── Meetings / Chat ──────────────────────────────────────────────────
  {
    match: /^\/Meetings\/(?:Add|Edit)/,
    module: MODULE.MEETINGS,
    action: "edit",
  },
  { match: /^\/Meeting(\/|$)/, module: MODULE.MEETINGS, action: "view" },
  { match: /^\/Chat(\/|$)/, module: MODULE.CHAT, action: "view" },

  // ── Checklists ───────────────────────────────────────────────────────
  {
    match: /^\/Checklist\/(?:Add|Edit)/,
    module: MODULE.CHECKLISTS,
    action: "edit",
  },
  { match: /^\/Checklist(\/|$)/, module: MODULE.CHECKLISTS, action: "view" },
  {
    match: /^\/ChecklistDelegations/,
    module: MODULE.CHECKLISTS,
    action: "view",
  },

  // ── Submittals / RFI / Communications / Documents / Artifacts ────────
  {
    match: /^\/Submittals\/(?:Add|Edit)/,
    module: MODULE.SUBMITTALS,
    action: "edit",
  },
  { match: /^\/Submittals(\/|$)/, module: MODULE.SUBMITTALS, action: "view" },
  {
    match: /^\/RFI\/(?:Add|Edit)/,
    module: MODULE.COMMUNICATIONS,
    action: "edit",
  },
  { match: /^\/RFI(\/|$)/, module: MODULE.COMMUNICATIONS, action: "view" },
  {
    match: /^\/Communications\/Add/,
    module: MODULE.COMMUNICATIONS,
    action: "edit",
  },
  {
    match: /^\/Communications(\/|$)/,
    module: MODULE.COMMUNICATIONS,
    action: "view",
  },
  {
    match: /^\/Document\/(?:Add|Edit)/,
    module: MODULE.DOCUMENTS,
    action: "edit",
  },
  { match: /^\/Document(\/|$)/, module: MODULE.DOCUMENTS, action: "view" },
  { match: /^\/Documents(\/|$)/, module: MODULE.DOCUMENTS, action: "view" },
  { match: /^\/Turnover(\/|$)/, module: MODULE.DOCUMENTS, action: "view" },
  { match: /^\/Artifacto/, module: MODULE.ARTIFACTS, action: "view" },
  {
    match: /^\/ArtifactIntelligence/,
    module: MODULE.ARTIFACTS,
    action: "view",
  },

  // ── Issues / Field Execution / RMA ───────────────────────────────────
  { match: /^\/Issues\/(?:Add|Edit)/, module: MODULE.RMA_RCA, action: "edit" },
  { match: /^\/Issues(\/|$)/, module: MODULE.RMA_RCA, action: "view" },
  { match: /^\/CxIssues/, module: MODULE.RMA_RCA, action: "view" },
  { match: /^\/RMA(\/|$)/, module: MODULE.RMA_RCA, action: "view" },
  { match: /^\/PunchList/, module: MODULE.FIELD_EXECUTION, action: "view" },
  { match: /^\/NCRs/, module: MODULE.QA_QC, action: "view" },

  // ── Commissioning / PSSR / Risk / CxScore ────────────────────────────
  {
    match: /^\/Phases\/(?:Add|Edit)/,
    module: MODULE.COMMISSIONING,
    action: "edit",
  },
  { match: /^\/Phases(\/|$)/, module: MODULE.COMMISSIONING, action: "view" },
  { match: /^\/Commissioning/, module: MODULE.COMMISSIONING, action: "view" },
  { match: /^\/CxMasterLog/, module: MODULE.COMMISSIONING, action: "view" },
  {
    match: /^\/HoldWitnessPoints/,
    module: MODULE.COMMISSIONING_TESTS,
    action: "view",
  },
  {
    match: /^\/TestResults/,
    module: MODULE.COMMISSIONING_TESTS,
    action: "view",
  },
  // TARF (trade access requests) is gated by the SAFETY module on the backend
  // (tarf controller uses @RequireEdit('tarf') → 'safety' in the catalog map).
  // The FE guard must match, or users with safety.edit are wrongly denied.
  { match: /^\/CxTARF/, module: MODULE.SAFETY, action: "view" },
  {
    match: /^\/TARF\/(?:Add|Edit)/,
    module: MODULE.SAFETY,
    action: "edit",
  },
  {
    match: /^\/TARF(\/|$)/,
    module: MODULE.SAFETY,
    action: "view",
  },
  { match: /^\/PSSR/, module: MODULE.PSSR, action: "view" },
  { match: /^\/RiskRegister(\/|$)/, module: MODULE.RISK, action: "view" },
  { match: /^\/CxScore/, module: MODULE.CX_SCORE, action: "view" },
  { match: /^\/CrossLens/, module: MODULE.CX_SCORE, action: "view" },

  // ── QA/QC / Safety / Toolbox / SOPs ──────────────────────────────────
  { match: /^\/QAQC/, module: MODULE.QA_QC, action: "view" },
  { match: /^\/QA\//, module: MODULE.QA_QC, action: "view" },
  { match: /^\/Quality/, module: MODULE.QA_QC, action: "view" },
  { match: /^\/Safety/, module: MODULE.SAFETY, action: "edit" },
  { match: /^\/Jha/, module: MODULE.SAFETY, action: "view" },
  {
    match: /^\/OrgSafetyPlans\/(?:Add|Edit)/,
    module: MODULE.SAFETY,
    action: "edit",
  },
  { match: /^\/OrgSafetyPlans/, module: MODULE.SAFETY, action: "view" },
  { match: /^\/OrgSOPs\/(?:Add|Edit)/, module: MODULE.SAFETY, action: "edit" },
  { match: /^\/OrgSOPs/, module: MODULE.SAFETY, action: "view" },
  {
    match: /^\/OrgToolboxTalks\/(?:Add|Edit)/,
    module: MODULE.SAFETY,
    action: "edit",
  },
  { match: /^\/OrgToolboxTalks/, module: MODULE.SAFETY, action: "view" },

  // ── Sales / CRM / Company ────────────────────────────────────────────
  { match: /^\/Sales/, module: MODULE.SALES, action: "view" },
  { match: /^\/CRM\/Contacts/, module: MODULE.CONTACTS, action: "view" },
  { match: /^\/CRM\/Leads/, module: MODULE.LEADS, action: "view" },
  { match: /^\/CRM\/Deals/, module: MODULE.DEALS, action: "view" },
  {
    match: /^\/Company\/(?:Add|Edit)/,
    module: MODULE.CONTACTS,
    action: "edit",
  },
  { match: /^\/Company/, module: MODULE.CONTACTS, action: "view" },

  // ── Supply Chain (Inventory / Warehouse / Shipments / Receiving) ─────
  {
    match: /^\/Inventory\/[^/]+\/(?:Add|Edit)/,
    module: MODULE.SUPPLY_CHAIN,
    action: "edit",
  },
  { match: /^\/Inventory/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  { match: /^\/Warehouse/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  {
    match: /^\/Shipments\/(?:Add|Edit)/,
    module: MODULE.SUPPLY_CHAIN,
    action: "edit",
  },
  { match: /^\/Shipments/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  { match: /^\/Shipment(\/|$)/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  { match: /^\/Receiving/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  { match: /^\/Logistics/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  { match: /^\/SupplyChain/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  { match: /^\/LongLeadItems/, module: MODULE.SUPPLY_CHAIN, action: "view" },
  {
    match: /^\/OrgMobCatalog\/(?:Add|Edit)/,
    module: MODULE.SUPPLY_CHAIN,
    action: "edit",
  },
  { match: /^\/OrgMobCatalog/, module: MODULE.SUPPLY_CHAIN, action: "view" },

  // ── Field Execution / Photos / Daily Log / Crew / Dispatch ───────────
  {
    match: /^\/Assets\/(?:Add|Edit|Assign)/,
    module: MODULE.FIELD_EXECUTION,
    action: "edit",
  },
  { match: /^\/Assets/, module: MODULE.FIELD_EXECUTION, action: "view" },
  { match: /^\/Photos/, module: MODULE.FIELD_EXECUTION, action: "view" },
  { match: /^\/Field\//, module: MODULE.FIELD_EXECUTION, action: "view" },
  { match: /^\/FieldReports/, module: MODULE.DAILY_LOG, action: "view" },
  { match: /^\/DailyReports/, module: MODULE.DAILY_LOG, action: "view" },
  { match: /^\/CrewDispatch/, module: MODULE.CREW, action: "view" },
  { match: /^\/Dispatch/, module: MODULE.CREW, action: "view" },

  // ── Schedule ─────────────────────────────────────────────────────────
  {
    match: /^\/ScheduleMilestones\/(?:Add|Edit|Wizard)/,
    module: MODULE.MILESTONES,
    action: "edit",
  },
  { match: /^\/ScheduleMilestones/, module: MODULE.MILESTONES, action: "view" },
  { match: /^\/Schedule(\/|$)/, module: MODULE.SCHEDULING, action: "view" },
  { match: /^\/ScheduleWindows/, module: MODULE.SCHEDULING, action: "view" },

  // ── FSM / Service ────────────────────────────────────────────────────
  { match: /^\/FSM/, module: MODULE.RMA_RCA, action: "view" },
  { match: /^\/ServiceSchedule/, module: MODULE.RMA_RCA, action: "view" },

  // ── Finance / Payroll (HR) ───────────────────────────────────────────
  {
    match: /^\/Finance\/Procurement/,
    module: MODULE.SUPPLY_CHAIN,
    action: "view",
  },
  { match: /^\/Finance\/Payroll/, module: MODULE.HR, action: "view" },
  { match: /^\/Finance/, module: MODULE.FINANCE, action: "view" },

  // ── Teams / Managers / Profile ───────────────────────────────────────
  { match: /^\/Teams\/(?:Add|Edit)/, module: MODULE.TEAM, action: "edit" },
  { match: /^\/Teams/, module: MODULE.TEAM, action: "view" },
  { match: /^\/Managers/, module: MODULE.TEAM, action: "view" },
  { match: /^\/Profile\/Managers/, module: MODULE.TEAM, action: "view" },

  // ── Admin (Users / Roles / Permissions / Settings / Subscriptions) ───
  { match: /^\/Users\/(?:Add|Edit)/, module: MODULE.ADMIN, action: "edit" },
  { match: /^\/Users/, module: MODULE.ADMIN, action: "view" },
  { match: /^\/Roles\/(?:Add|Edit)/, module: MODULE.ADMIN, action: "edit" },
  { match: /^\/Roles/, module: MODULE.ADMIN, action: "view" },
  {
    match: /^\/Permissions\/(?:Add|Edit)/,
    module: MODULE.ADMIN,
    action: "edit",
  },
  { match: /^\/Permissions/, module: MODULE.ADMIN, action: "view" },
  { match: /^\/Settings/, module: MODULE.ADMIN, action: "view" },
  { match: /^\/Admin/, module: MODULE.ADMIN, action: "view" },
  { match: /^\/Subscriptions/, module: MODULE.ADMIN, action: "view" },
  {
    match: /^\/OrgWorkflows\/(?:Add|Edit)/,
    module: MODULE.ADMIN,
    action: "edit",
  },
  { match: /^\/OrgWorkflows/, module: MODULE.ADMIN, action: "view" },
  { match: /^\/OrgPolicies/, module: MODULE.GOVERNANCE, action: "view" },

  // ── Reports / Dashboards ─────────────────────────────────────────────
  { match: /^\/Executive/, module: MODULE.REPORTS, action: "view" },
  { match: /^\/OEM\/Dashboard/, module: MODULE.REPORTS, action: "view" },
  { match: /^\/OemDashboard/, module: MODULE.REPORTS, action: "view" },
  { match: /^\/Analytics/, module: MODULE.REPORTS, action: "view" },
  { match: /^\/Reports/, module: MODULE.REPORTS, action: "view" },
  { match: /^\/PresentToLeadership/, module: MODULE.REPORTS, action: "view" },
  { match: /^\/KPIs/, module: MODULE.REPORTS, action: "view" },

  // ── Intelligence cluster ─────────────────────────────────────────────
  { match: /^\/Anomalies/, module: MODULE.ANOMALY, action: "view" },
  { match: /^\/AnomalySuppressions/, module: MODULE.ANOMALY, action: "view" },
  { match: /^\/OperationsAnomalies/, module: MODULE.ANOMALY, action: "view" },
  { match: /^\/Automation(\/|$)/, module: MODULE.AUTOMATION, action: "view" },
  {
    match: /^\/AutomationIntelligence/,
    module: MODULE.AUTOMATION,
    action: "view",
  },
  {
    match: /^\/IntelligenceStabilization/,
    module: MODULE.INTELLIGENCE,
    action: "view",
  },
  { match: /^\/Dependencies/, module: MODULE.ORCHESTRATION, action: "view" },
  { match: /^\/CrossDomain/, module: MODULE.ORCHESTRATION, action: "view" },
  { match: /^\/Readiness/, module: MODULE.ORCHESTRATION, action: "view" },
  { match: /^\/Ecosystem/, module: MODULE.ECOSYSTEM, action: "view" },
  { match: /^\/Integrations/, module: MODULE.ECOSYSTEM, action: "view" },
  { match: /^\/EventLog/, module: MODULE.EVENT_LOG, action: "view" },
  { match: /^\/Governance/, module: MODULE.GOVERNANCE, action: "view" },
  { match: /^\/ImpersonationAudit/, module: MODULE.GOVERNANCE, action: "view" },
  { match: /^\/Sre/, module: MODULE.GOVERNANCE, action: "view" },
  { match: /^\/Diagnostics/, module: MODULE.GOVERNANCE, action: "view" },

  // ── Learning ─────────────────────────────────────────────────────────
  { match: /^\/Training(\/|$)/, module: MODULE.LEARNING, action: "view" },
  { match: /^\/TrainingSim/, module: MODULE.LEARNING, action: "view" },
  { match: /^\/LearnerProfile/, module: MODULE.LEARNING, action: "view" },

  // Pages with no entry fall through to "no gate" — universal content:
  // /, /HomePage, /UserProfile, /Profile (own), /Glossary, /PhaseReference,
  // /CxFlowDiagram, /CxWalkthroughSim, /PowerFlow, /Search, /Notifications,
  // /Outbox, /Approvals/MyPending, /MyAssignments, /Announcements,
  // /CxAnnouncements, /Assignments, /ActivityFeed, /Auth/*
];

function resolveRouteGuard(pathname) {
  for (const r of ROUTE_PERMISSIONS) {
    if (r.match.test(pathname)) return r;
  }
  return null;
}

// ─── Sidebar nav (mirrors HTML sidebar order) ────────────────────────────
// Each section is a { label, items: [{ icon, title, href, badge?, badgeKind? }] }
// Role gating is handled at the page level; Cx commissioning routes are
// universally addressable but the action UIs surface what each user can act on.
// Sidebar section builder. The Project and My Company groups embed the
// active project code in their labels, so we derive SECTIONS from the
// current project at render time rather than holding a static module-level
// array.
// Each nav item carries an optional `module` (BE moduleKey). `null` = always
// visible to any signed-in user (dashboards, own profile, learning content).
// Filtering happens in filterSectionsForUser() below — items whose module the
// user can't view are dropped, and sections with zero remaining items are
// hidden entirely.
function buildSections(projectCode) {
  const code = projectCode || "—";
  return [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", href: "/", module: null },
        {
          title: "Executive Summary",
          href: "/Executive/Dashboard",
          module: MODULE.REPORTS,
        },
        { title: "My work", href: "/MyAssignments", module: null },
        { title: "Approvals", href: "/Approvals/MyPending", module: null },
        { title: "Announcements", href: "/Announcements", module: null },
        { title: "Projects", href: "/Projects", module: MODULE.PROJECTS },
        { title: "Tasks", href: "/Tasks/List", module: MODULE.TASKS },
        { title: "Meetings", href: "/Meetings/List", module: MODULE.MEETINGS },
        { title: "Chat", href: "/Chat", module: MODULE.CHAT },
        {
          title: "Daily field log",
          href: "/FieldReports",
          module: MODULE.DAILY_LOG,
        },
        { title: "Crew dispatch", href: "/CrewDispatch", module: MODULE.CREW },
      ],
    },
    {
      label: `Project · ${code}`,
      items: [
        {
          title: "Overview",
          href: "/ProjectOverview",
          module: MODULE.PROJECTS,
        },
        { title: "Companies", href: "/Company/List", module: MODULE.CONTACTS },
        {
          title: "Equipment",
          href: "/Assets/List",
          module: MODULE.FIELD_EXECUTION,
        },
        {
          title: "Schedule (Gantt)",
          href: "/Schedule",
          module: MODULE.SCHEDULING,
        },
        {
          title: "Schedule milestones",
          href: "/ScheduleMilestones/List",
          module: MODULE.MILESTONES,
        },
        {
          title: "QA/QC checklists",
          href: "/Checklist/List",
          module: MODULE.CHECKLISTS,
        },
        { title: "Issues", href: "/Issues/List", module: MODULE.RMA_RCA },
        { title: "NCRs", href: "/NCRs", module: MODULE.QA_QC },
        {
          title: "Hold/Witness pts",
          href: "/HoldWitnessPoints?kind=HOLD_POINT",
          module: MODULE.COMMISSIONING_TESTS,
        },
        {
          title: "Punch list",
          href: "/PunchList?kind=PUNCH_LIST",
          module: MODULE.FIELD_EXECUTION,
        },
        {
          title: "Test results",
          href: "/Commissioning/Tests",
          module: MODULE.COMMISSIONING_TESTS,
        },
        {
          title: "Change requests",
          href: "/ChangeRequests",
          module: MODULE.PROJECTS,
        },
        {
          title: "Submittals",
          href: "/Submittals/List",
          // module: MODULE.SUBMITTALS,
        },
        {
          title: "Documents",
          href: "/Document/List",
          // module: MODULE.SUBMITTALS,
        },
      ],
    },
    {
      label: "Supply Chain",
      items: [
        {
          title: "Inventory",
          href: "/Inventory/Products",
          module: MODULE.SUPPLY_CHAIN,
        },
        {
          title: "Warehouses",
          href: "/Inventory/Warehouses",
          module: MODULE.SUPPLY_CHAIN,
        },
        {
          title: "Suppliers",
          href: "/Inventory/Suppliers",
          module: MODULE.SUPPLY_CHAIN,
        },
        {
          title: "Movements",
          href: "/Inventory/Movements",
          module: MODULE.SUPPLY_CHAIN,
        },
        { title: "Shipments", href: "/Shipments", module: MODULE.SUPPLY_CHAIN },
        {
          title: "Long-lead items",
          href: "/LongLeadItems",
          module: MODULE.SUPPLY_CHAIN,
        },
        {
          title: "Procurement",
          href: "/Finance/Procurement",
          module: MODULE.SUPPLY_CHAIN,
        },
      ],
    },
    {
      label: "GC QA/QC Toolkit",
      items: [
        { title: "QA/QC Command Center", href: "/QAQC", module: MODULE.QA_QC },
        {
          title: "Safety",
          href: "/Safety",
          module: MODULE.SAFETY,
        },
        {
          title: "Phase advancement queue",
          href: "/Phases/List",
          module: MODULE.COMMISSIONING,
        },
        { title: "Cx Score · Exec", href: "/CxScore", module: MODULE.CX_SCORE },
        {
          title: "Cx Master Log",
          href: "/CxMasterLog",
          module: MODULE.COMMISSIONING,
        },
        { title: "PSSR · Pre-Startup", href: "/PSSR", module: MODULE.PSSR },
        { title: "Risk Register", href: "/RiskRegister", module: MODULE.RISK },
        {
          title: "Turnover Package",
          href: "/Turnover",
          module: MODULE.DOCUMENTS,
        },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          title: "Present to leadership",
          href: "/PresentToLeadership",
          module: MODULE.REPORTS,
        },
        {
          title: "Communications",
          href: "/Communications",
          module: MODULE.COMMUNICATIONS,
        },
        { title: "RFIs", href: "/RFI/List", module: MODULE.COMMUNICATIONS },
        { title: "Artifacto", href: "/Artifacto", module: MODULE.ARTIFACTS },
        { title: "Photos", href: "/Photos", module: MODULE.FIELD_EXECUTION },
        {
          title: "Site arrivals (TARF)",
          href: "/CxTARF",
          module: MODULE.FIELD_EXECUTION,
        },
        { title: "Activity feed", href: "/ActivityFeed", module: null },
      ],
    },
    {
      label: "Sales & CRM",
      items: [
        { title: "Sales pipeline", href: "/Sales/List", module: MODULE.SALES },
        { title: "Contacts", href: "/CRM/Contacts", module: MODULE.CONTACTS },
        { title: "Leads", href: "/CRM/Leads", module: MODULE.LEADS },
        { title: "Deals", href: "/CRM/Deals", module: MODULE.DEALS },
      ],
    },
    {
      label: "Learning",
      items: [
        {
          title: "Training & Library",
          href: "/Training",
          module: MODULE.LEARNING,
        },
        { title: "Phase reference", href: "/PhaseReference", module: null },
        { title: "Cx flow diagram", href: "/CxFlowDiagram", module: null },
        {
          title: "Cx walkthrough sim",
          href: "/CxWalkthroughSim",
          module: null,
        },
        { title: "Power flow simulator", href: "/PowerFlow", module: null },
        { title: "Glossary", href: "/Glossary", module: null },
      ],
    },
    {
      label: `My Company · ${code}`,
      items: [
        { title: "Team", href: "/Teams/List", module: MODULE.TEAM },
        {
          title: "Billing & invoices",
          href: "/Finance/Billing",
          module: MODULE.FINANCE,
        },
        { title: "Org SOPs", href: "/OrgSOPs/List", module: MODULE.SAFETY },
        // {
        //   title: "Safety plans",
        //   href: "/OrgSafetyPlans/List",
        //   module: MODULE.SAFETY,
        // },
        {
          title: "Toolbox talks",
          href: "/OrgToolboxTalks/List",
          module: MODULE.SAFETY,
        },
        {
          title: "Mob catalog",
          href: "/OrgMobCatalog/List",
          module: MODULE.SUPPLY_CHAIN,
        },
        {
          title: "Workflows",
          href: "/OrgWorkflows/List",
          module: MODULE.ADMIN,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        { title: "Users", href: "/Users/List", module: MODULE.ADMIN },
        { title: "Roles", href: "/Roles/List", module: MODULE.ADMIN },
        { title: "Permissions", href: "/Permissions", module: MODULE.ADMIN },
        { title: "Platform RBAC", href: "/PlatformRbac", module: MODULE.ADMIN },
        { title: "Settings", href: "/Settings", module: MODULE.ADMIN },
      ],
    },
    {
      label: "Portfolio",
      items: [
        {
          title: "All my projects",
          href: "/Portfolio",
          module: MODULE.PROJECTS,
        },
      ],
    },
  ];
}

// Drop nav items the user can't view; drop sections that end up empty.
// `module: null` items are always kept. SUPERADMIN / platform users see all.
function filterSectionsForUser(sections, user) {
  if (isSuperUser(user)) return sections;
  return sections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (it) => it.module == null || canAccessModule(user, it.module),
      ),
    }))
    .filter((sec) => sec.items.length > 0);
}

// ─── Project switcher data ────────────────────────────────────────────────
const PROJECTS = [
  {
    id: "p1",
    code: "MSFT-DC1",
    name: "Microsoft Atlanta Expansion",
    client: "Microsoft",
    location: "Atlanta, GA",
    phase: "L3",
    pct: 64,
  },
  {
    id: "p2",
    code: "QTS-IRV-3",
    name: "QTS Irving Phase 3",
    client: "QTS Realty",
    location: "Irving, TX",
    phase: "L4",
    pct: 88,
  },
  {
    id: "p3",
    code: "CRWV-CHI",
    name: "CoreWeave Chicago Build",
    client: "CoreWeave",
    location: "Chicago, IL",
    phase: "L2",
    pct: 28,
  },
  {
    id: "p4",
    code: "CRS0-RN0",
    name: "Crusoe Reno Pod-1",
    client: "Crusoe",
    location: "Reno, NV",
    phase: "L3",
    pct: 52,
  },
  {
    id: "p5",
    code: "GLXY-DAL",
    name: "Galaxy Dallas Hyperscale",
    client: "Galaxy",
    location: "Dallas, TX",
    phase: "L1",
    pct: 8,
  },
];

const PHASE_STYLE = {
  L1: { bg: "rgba(239,68,68,0.18)", color: "#b91c1c" },
  L2: { bg: "rgba(245,158,11,0.18)", color: "#b45309" },
  L3: { bg: "rgba(34,197,94,0.18)", color: "#15803d" },
  L4: { bg: "rgba(99,102,241,0.18)", color: "#4338ca" },
  L5: { bg: "rgba(148,163,184,0.18)", color: "#475569" },
};

// ─── Default export ──────────────────────────────────────────────────────
export default function CxLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  // useUserPermissions reads the cached user from localStorage synchronously
  // so the sidebar paints fully on first render and then refreshes from
  // /auth/me in the background. It also performs the GET /auth/me refresh
  // internally — we don't repeat that here.
  // useUserPermissions is SSR-safe: it returns user=null on the server AND the
  // first client render, then hydrates the cached user after mount — so the
  // permission-filtered sidebar can't cause a hydration mismatch (see the hook).
  const { user: rbacUser } = useUserPermissions();
  const [user, setLocalUser] = useState(rbacUser);
  useEffect(() => {
    if (rbacUser) setLocalUser(rbacUser);
  }, [rbacUser]);

  // ── Route-level RBAC hard gate ─────────────────────────────────────────
  // Look up the (module, action) pair for the current pathname and run the
  // permission guard. When blocked, the main content slot renders the
  // access-denied fallback instead of `children`. Sidebar + topbar stay
  // mounted so the user can navigate elsewhere.
  const routeRule = useMemo(() => resolveRouteGuard(pathname), [pathname]);
  const routeGuard = useRequirePermission(
    routeRule?.module,
    routeRule?.action ?? "view",
  );
  const [activeOrg, setActiveOrg] = useState({
    name: "Active Project",
    code: "—",
  });
  const [menu, setMenu] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(PROJECTS[0]);
  const [navQuery, setNavQuery] = useState("");

  // Preserve sidebar scroll position across route changes. Each page wraps
  // itself in <Layout>, so the <aside> remounts on every navigation and its
  // scrollTop would otherwise reset to 0 — pulling the active item out of
  // view. We persist to sessionStorage and restore before paint.
  const sidebarRef = useRef(null);
  const SIDEBAR_SCROLL_KEY = "cx-sidebar-scroll";

  useLayoutEffect(() => {
    const el = sidebarRef.current;
    if (!el || typeof window === "undefined") return;
    const saved = Number(window.sessionStorage.getItem(SIDEBAR_SCROLL_KEY));
    if (saved > 0) {
      el.scrollTop = saved;
    } else {
      const activeLink = el.querySelector(".cx-nav-item.active");
      if (activeLink && typeof activeLink.scrollIntoView === "function") {
        activeLink.scrollIntoView({ block: "nearest" });
      }
    }
  }, [pathname]);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const onScroll = () => {
      window.sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/Auth/Login");
    }
    // /auth/me refresh is owned by useUserPermissions — no duplicate call here.
  }, [router]);

  const SECTIONS = useMemo(
    () => filterSectionsForUser(buildSections(activeProject?.code), user),
    [activeProject?.code, user],
  );

  // Filter the role-based nav by the sidebar search query. Matches on the
  // module/item title or its section label; sections with no surviving items
  // are dropped so empty headers don't linger.
  const visibleSections = useMemo(() => {
    const q = navQuery.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          sec.label.toLowerCase().includes(q),
      ),
    })).filter((sec) => sec.items.length > 0);
  }, [SECTIONS, navQuery]);

  // Which sidebar item is "active" for the current route (PP-044). An exact
  // `pathname === href` match fails on sub-routes — /Projects/123 wouldn't
  // highlight /Projects, and /Tasks/Add wouldn't highlight /Tasks/List. We match
  // on the item's first path SEGMENT (e.g. "/Tasks/List" → base "/Tasks") so the
  // module stays highlighted across all its pages, and pick the most specific
  // (longest-base) winner. Dashboard ("/") only matches an exact "/".
  const activeHref = useMemo(() => {
    const path = pathname || "/";
    const baseOf = (href) => {
      const seg = href.split("/").filter(Boolean)[0];
      return seg ? `/${seg}` : "/";
    };
    let best = null; // { href, base }
    for (const sec of SECTIONS) {
      for (const item of sec.items) {
        const href = item.href;
        if (!href) continue;
        const base = baseOf(href);
        const matches =
          base === "/"
            ? path === "/"
            : path === base || path.startsWith(base + "/");
        if (matches && (!best || base.length > best.base.length)) {
          best = { href, base };
        }
      }
    }
    return best?.href ?? null;
  }, [SECTIONS, pathname]);

  const initials = useMemo(() => {
    if (!user) return "U";
    const first = user.firstName ?? user.first_name ?? "";
    const last = user.lastName ?? user.last_name ?? "";
    const seed = `${first} ${last}`.trim() || user.email || "User";
    return seed
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }, [user]);

  const handleLogout = async () => {
    try {
      await Logout?.();
    } catch {
      /* ignore — proceed to clear tokens regardless */
    }
    clearTokens();
    router.replace("/Auth/Login");
  };

  useEffect(() => {
    getRolesList();
    getUserFromApi();
  }, []);

  const getUserFromApi = async () => {
    const [userResponse, orgResponse] = await Promise.all([
      GetUser(),
      GetOrganization().catch(() => null),
    ]);
    if (orgResponse && userResponse) {
      setUser({ user: userResponse });
      setOrganization({ organization: orgResponse });
    }
  };

  const getRolesList = async () => {
    try {
      const res = await getRoles();
      localStorage.setItem("roles", JSON.stringify(res));
    } catch (error) {
      console.log("Error Fetching Roles:", error);
    }
  };

  return (
    <>
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className="cx-topbar">
        <Link
          href="/"
          className="cx-tb-logo"
          style={{ textDecoration: "none" }}
        >
          <div className="mark">CX</div>
          <span className="name">CoreSynaptics</span>
        </Link>

        <div className="cx-tb-divider" />

        {/* ── Project switcher ─────────────────────────────────────── */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="cx-tb-badge"
            title="Switch project"
            onClick={() => setProjectOpen((v) => !v)}
            style={{ padding: "5px 12px" }}
          >
            <div style={{ lineHeight: 1.2, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "var(--cx-text-muted)" }}>
                Project
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--cx-text)",
                  whiteSpace: "nowrap",
                  maxWidth: 260,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {activeProject.code} · {activeProject.name}
              </div>
            </div>
            <span
              style={{
                color: "var(--cx-text-muted)",
                fontSize: 11,
                marginLeft: 4,
              }}
            >
              ▾
            </span>
          </button>

          {projectOpen && (
            <>
              {/* backdrop */}
              <div
                style={{ position: "fixed", inset: 0, zIndex: 55 }}
                onClick={() => setProjectOpen(false)}
              />

              {/* dropdown panel */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: "calc(100% + 6px)",
                  background: "var(--cx-surface)",
                  border: "1px solid var(--cx-border)",
                  borderRadius: 10,
                  minWidth: 340,
                  boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
                  zIndex: 60,
                  overflow: "hidden",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* header */}
                <div
                  style={{
                    padding: "10px 16px 8px",
                    borderBottom: "1px solid var(--cx-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "var(--cx-text-muted)",
                      letterSpacing: "0.07em",
                      textTransform: "uppercase",
                    }}
                  >
                    SWITCH PROJECT · {PROJECTS.length} ACTIVE
                  </span>
                </div>

                {/* project rows */}
                {PROJECTS.map((p) => {
                  const ps = PHASE_STYLE[p.phase] || PHASE_STYLE.L1;
                  const isActive = p.id === activeProject.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setActiveProject(p);
                        setProjectOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        width: "100%",
                        padding: "10px 16px",
                        border: "none",
                        cursor: "pointer",
                        background: isActive
                          ? "var(--cx-bg-soft)"
                          : "transparent",
                        textAlign: "left",
                        transition: "background 0.12s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background =
                            "var(--cx-bg-soft)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {/* Phase badge */}
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: ps.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 800,
                            color: ps.color,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {p.phase}
                        </span>
                      </div>

                      {/* Name + client/location */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--cx-text)",
                            marginBottom: 1,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--cx-text-muted)",
                          }}
                        >
                          {p.client} · {p.location}
                        </div>
                      </div>

                      {/* Code + progress */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--cx-text-muted)",
                            fontFamily: "monospace",
                            marginBottom: 1,
                          }}
                        >
                          {p.code}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--cx-text-muted)",
                          }}
                        >
                          {p.pct}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <GlobalSearchBar />

        <div className="cx-tb-user">
          <button type="button" className="cx-tb-icon" title="Help">
            ?
          </button>
          <NotificationBell />
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="cx-tb-badge"
              onClick={() => setMenu((v) => !v)}
            >
              {/* These nodes render from client-only state (user pulled from
                  localStorage / /auth/me), so their text legitimately differs
                  between the SSR pass ("U" / "Sign in") and the first client
                  paint. suppressHydrationWarning tells React that's expected —
                  without it React treats the whole subtree as a hydration
                  mismatch and REGENERATES it on a loop, which tore down and
                  recreated the realtime socket every ~70s and broke live chat
                  typing/presence (CHAT_011/012/013). */}
              <div className="cx-tb-av" suppressHydrationWarning>
                {initials}
              </div>
              <div className="cx-tb-info">
                <div className="nm" suppressHydrationWarning>
                  {user
                    ? `${user.firstName ?? user.first_name ?? ""} ${
                        user.lastName ?? user.last_name ?? ""
                      }`.trim() || user.email
                    : "Sign in"}
                </div>
                <div className="rl" suppressHydrationWarning>
                  {user?.activeRole?.description ?? user?.platformRole ?? ""}
                </div>
              </div>
              <span style={{ color: "var(--cx-text-muted)", fontSize: 10 }}>
                ▾
              </span>
            </button>
            {menu && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "var(--cx-surface)",
                  border: "1px solid var(--cx-border)",
                  borderRadius: 8,
                  minWidth: 180,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  zIndex: 60,
                  padding: 6,
                }}
              >
                <MenuItem
                  onClick={() => {
                    setMenu(false);
                    router.push("/UserProfile");
                  }}
                >
                  My profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setMenu(false);
                    router.push("/Settings");
                  }}
                >
                  Settings
                </MenuItem>
                <div
                  style={{
                    borderTop: "1px solid var(--cx-border)",
                    margin: "4px 0",
                  }}
                />
                <MenuItem onClick={handleLogout}>Sign out</MenuItem>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body: 240px sidebar + main ────────────────────────────────── */}
      <div className="cx-layout">
        <aside ref={sidebarRef} className="cx-sidebar">
          <div className="cx-you">
            <div className="lbl">Signed in</div>
            {/* Client-only (localStorage/auth) — suppress hydration diff. */}
            <div className="name" suppressHydrationWarning>
              {user
                ? `${user.firstName ?? user.first_name ?? ""} ${
                    user.lastName ?? user.last_name ?? ""
                  }`.trim() || user.email
                : "—"}
            </div>
            <div className="role" suppressHydrationWarning>
              {user?.activeRole?.description ??
                user?.platformRole ??
                "Operator"}
            </div>
          </div>

          <div className="cx-side-searchbar">
            <div className="cx-side-search">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={navQuery}
                onChange={(e) => setNavQuery(e.target.value)}
                placeholder="Search modules…"
                className="border-none focus:border-none active:border-none"
                aria-label="Search modules"
              />
              {navQuery && (
                <button
                  type="button"
                  onClick={() => setNavQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {visibleSections.length === 0 ? (
            <div className="cx-side-empty">No modules match “{navQuery}”.</div>
          ) : (
            visibleSections.map((sec) => (
              <div key={sec.label} className="cx-side-section">
                <div className="label">{sec.label}</div>
                {sec.items.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`cx-nav-item${active ? " active" : ""}`}
                    >
                      <span style={{ flex: 1 }}>{item.title}</span>
                      {item.badge ? (
                        <span
                          className={`nav-badge${
                            item.badgeKind ? ` ${item.badgeKind}` : ""
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </aside>

        <main style={{ overflowX: "hidden", minWidth: 0 }}>
          {routeRule && (routeGuard.loading || routeGuard.blocked)
            ? routeGuard.fallback
            : children}
        </main>
      </div>
      <OnboardingTourOverlay autoStart={false} />
    </>
  );
}

function MenuItem({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "8px 10px",
        fontSize: 13,
        color: "var(--cx-text)",
        background: "transparent",
        border: 0,
        borderRadius: 6,
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--cx-bg-soft)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}
