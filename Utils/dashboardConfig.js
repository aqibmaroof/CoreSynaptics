// Dashboard configurations based on user roles
export const getDashboardConfig = (userRole) => {
  const baseConfig = {
    phaseGates: [
      {
        number: 1,
        name: "Factory Test",
        status: "complete",
        statusLabel: "Done",
      },
      {
        number: 2,
        name: "Receipt Inspect.",
        status: "complete",
        statusLabel: "Active",
      },
      {
        number: 3,
        name: "Pre-Functional",
        status: "locked",
        statusLabel: "Locked",
      },
      {
        number: 4,
        name: "Functional",
        status: "pending",
        statusLabel: "Locked",
      },
      {
        number: 5,
        name: "L5",
        status: "pending",
        statusLabel: "Locked",
      },
    ],
    alert: {
      title: "L3 Gate Blocked: 839 L2 checklists remain",
      message: "75 open issues • 8/133 assets ready",
    },
  };

  // Role-specific configurations
  const roleConfigs = {
    admin: {
      ...baseConfig,
      metrics: [
        {
          title: "TOTAL ASSETS",
          value: "10",
          subtitle: "10 active",
          color: "blue",
        },
        {
          title: "CHECKLISTS CLOSED",
          value: "273",
          subtitle: "of 1,491 total",
          color: "blue",
        },
        {
          title: "OPEN ISSUES",
          value: "5",
          subtitle: "All high priority",
          color: "red",
        },
        {
          title: "READY FOR L3",
          value: "0",
          subtitle: "10 blocked",
          color: "red",
        },
      ],
      showChecklist: true,
      showPhaseDistribution: true,
      showTradeItems: true,
      showPriorityTasks: true,
    },
    manager: {
      ...baseConfig,
      metrics: [
        {
          title: "TOTAL ASSETS",
          value: "5",
          subtitle: "5 active",
          color: "blue",
        },
        {
          title: "CHECKLISTS CLOSED",
          value: "150",
          subtitle: "of 600 total",
          color: "blue",
        },
        {
          title: "OPEN ISSUES",
          value: "3",
          subtitle: "2 high priority",
          color: "red",
        },
        {
          title: "READY FOR L3",
          value: "1",
          subtitle: "5 blocked",
          color: "yellow",
        },
      ],
      showChecklist: true,
      showPhaseDistribution: true,
      showTradeItems: true,
      showPriorityTasks: true,
    },
    field_technician: {
      ...baseConfig,
      metrics: [
        {
          title: "ASSIGNED ASSETS",
          value: "2",
          subtitle: "In progress",
          color: "blue",
        },
        {
          title: "MY CHECKLISTS",
          value: "45",
          subtitle: "of 200 total",
          color: "blue",
        },
        {
          title: "ISSUES FOUND",
          value: "2",
          subtitle: "Pending review",
          color: "yellow",
        },
        {
          title: "COMPLETION",
          value: "22%",
          subtitle: "Progress",
          color: "green",
        },
      ],
      showChecklist: true,
      showPhaseDistribution: false,
      showTradeItems: false,
      showPriorityTasks: true,
    },
    inspector: {
      ...baseConfig,
      metrics: [
        {
          title: "INSPECTIONS TODAY",
          value: "8",
          subtitle: "4 completed",
          color: "blue",
        },
        {
          title: "ITEMS CHECKED",
          value: "156",
          subtitle: "2 failed",
          color: "blue",
        },
        {
          title: "NON-CONFORMANCES",
          value: "2",
          subtitle: "Pending action",
          color: "red",
        },
        {
          title: "PASS RATE",
          value: "98.7%",
          subtitle: "Today",
          color: "green",
        },
      ],
      showChecklist: true,
      showPhaseDistribution: true,
      showTradeItems: false,
      showPriorityTasks: true,
    },
    qaqc: {
      ...baseConfig,
      metrics: [
        {
          title: "OPEN NCR'S",
          value: "12",
          subtitle: "5 critical",
          color: "red",
        },
        {
          title: "AUDITS PENDING",
          value: "4",
          subtitle: "This week",
          color: "yellow",
        },
        {
          title: "CORRECTIVE ACTIONS",
          value: "8",
          subtitle: "In progress",
          color: "blue",
        },
        {
          title: "COMPLIANCE",
          value: "94%",
          subtitle: "Monthly",
          color: "green",
        },
      ],
      showChecklist: true,
      showPhaseDistribution: true,
      showTradeItems: true,
      showPriorityTasks: true,
    },
    default: {
      ...baseConfig,
      metrics: [
        {
          title: "TOTAL ASSETS",
          value: "10",
          subtitle: "10 active",
          color: "blue",
        },
        {
          title: "CHECKLISTS CLOSED",
          value: "273",
          subtitle: "of 1,491 total",
          color: "blue",
        },
        {
          title: "OPEN ISSUES",
          value: "5",
          subtitle: "All high priority",
          color: "red",
        },
        {
          title: "READY FOR L3",
          value: "0",
          subtitle: "10 blocked",
          color: "red",
        },
      ],
      showChecklist: true,
      showPhaseDistribution: true,
      showTradeItems: true,
      showPriorityTasks: true,
    },
  };

  return roleConfigs[userRole] || roleConfigs.default;
};

// Mock data generators based on role
export const getChecklistData = (userRole) => {
  const baseData = {
    title: "Checklist Status",
    statuses: [
      {
        label: "Finished",
        count: 273,
        type: "finished",
        percentage: 100,
      },
      {
        label: "In Progress",
        count: 11,
        type: "in_progress",
        percentage: 20,
      },
      {
        label: "Not Started",
        count: 1176,
        type: "pending",
        percentage: 5,
      },
      {
        label: "Pending Close",
        count: 31,
        type: "pending",
        percentage: 15,
      },
    ],
  };

  return baseData;
};

export const getPhaseDistributionData = (userRole) => {
  return {
    title: "Asset Phase Distribution",
    phases: [
      { name: "L3 Factory Test", count: 25 },
      { name: "L2 Receipt Insp.", count: 64 },
      { name: "L2 Equipment Installed", count: 54 },
      { name: "L3 PFT/Startup", count: 0 },
      { name: "L4 Functional", count: 0 },
      { name: "L5 IST", count: 0 },
    ],
  };
};

export const getTradeItemsData = (userRole) => {
  return {
    title: "Open L2/L3 Items by Trade",
    trades: [
      { name: "Iconix", count: 64 },
      { name: "ECC EC", count: 11 },
      { name: "EC/Shermco", count: 0 },
      { name: "Schneider", count: 0 },
      { name: "Mech. Contractor", count: 0 },
    ],
  };
};

export const getPriorityTasksData = (userRole) => {
  const allTasks = {
    admin: [
      {
        title: "Complete missing L2 inspections",
        description: "Review 15 outstanding inspection reports",
        priority: "High",
      },
      {
        title: "Resolve critical NCR issues",
        description: "3 critical non-conformance items awaiting action",
        priority: "Critical",
      },
      {
        title: "Update asset schedule",
        description: "Reschedule 5 assets for next phase gate",
        priority: "Medium",
      },
      {
        title: "Approve QA submissions",
        description: "Review 8 pending quality approvals",
        priority: "High",
      },
      {
        title: "Generate commission report",
        description: "Monthly commissioning status report",
        priority: "Medium",
      },
    ],
    field_technician: [
      {
        title: "Complete L2 checklist - Asset 001",
        description: "Finish remaining items for equipment",
        priority: "High",
      },
      {
        title: "Add photo evidence",
        description: "Upload 5 missing photo proofs",
        priority: "Medium",
      },
      {
        title: "Report safety hazard",
        description: "Cable routing issue in control room",
        priority: "Critical",
      },
    ],
    qaqc: [
      {
        title: "Conduct L3 inspection",
        description: "Functional test for Asset 005",
        priority: "High",
      },
      {
        title: "Review NCR closure",
        description: "Verify corrective action completeness",
        priority: "Critical",
      },
    ],
  };

  const roleSpecificTasks = allTasks[userRole] || allTasks.admin.slice(0, 3);

  return {
    title: "Today's Priority Tasks",
    tasks: roleSpecificTasks,
  };
};
