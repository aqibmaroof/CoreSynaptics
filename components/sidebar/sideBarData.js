import config from "@/config";

export const sidebarItems = [
  {
    title: "Dashboard",
    icon: config?.home,
    path: "/",
    type: "link",
    submenu: [],
  },
  {
    title: "Project Managers",
    icon: config?.chart,
    category: "",
    path: "/Managers/List",
    submenu: [],
  },
  {
    title: "QA/QC",
    icon: config?.chart,
    path: "#",
    submenu: [],
  },
  {
    title: "FSEs",
    icon: config?.chart,
    category: "",
    path: "/Hunt/List",
    submenu: [],
  },
  {
    title: "Safety",
    icon: config?.chart,
    category: "",
    path: "/Guide/List",
    submenu: [],
  },
  {
    title: "Warehouse",
    icon: config?.chart,
    path: "/Customers/Manage",
    submenu: [],
  },
  {
    title: "Sales",
    icon: config?.chart,
    path: "/Reviews/List",
    submenu: [],
  },
  {
    title: "Settings",
    path: "",
    icon: config?.chart,
    submenu: [],
  },
];
