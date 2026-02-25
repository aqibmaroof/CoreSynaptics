import config from "@/config";

export const sidebarItems = [
  {
    title: "Dashboard",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/",
    type: "link",
    submenu: [],
  },
  {
    title: "Project Managers",
    icon: config?.chart,
    iconActive: config?.home,
    category: "",
    path: "/Managers/List",
    submenu: [],
  },
  {
    title: "Projects",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Projects",
    type: "link",
    submenu: [],
  },
  {
    title: "Tasks",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Tasks/List",
    type: "link",
    submenu: [],
  },
  {
    title: "Shipment",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Shipment/Dashboard",
    type: "link",
    submenu: [],
  },
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
  },
  {
    title: "QA/QC",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/QA/QC",
    submenu: [],
  },
  {
    title: "Finance",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Finance",
    submenu: [],
  },
  
  {
    title: "Safety",
    icon: config?.chart,
    iconActive: config?.home,
    category: "",
    path: "/Safety",
    submenu: [],
  },
  {
    title: "Warehouse",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Warehouse/List",
    submenu: [],
  },
  {
    title: "Sales",
    icon: config?.chart,
    iconActive: config?.home,
    path: "/Sales/List",
    submenu: [],
  },
  {
    title: "Settings",
    path: "/Settings",
    icon: config?.chart,
    iconActive: config?.home,
    submenu: [],
  },
];
