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
    path: "#",
    submenu: [],
  },
  {
    title: "Safety",
    icon: config?.chart,
    category: "",
    path: "#",
    submenu: [],
  },
  {
    title: "Warehouse",
    icon: config?.chart,
    path: "/Warehouse/List",
    submenu: [],
  },
  {
    title: "Sales",
    icon: config?.chart,
    path: "/Sales/List",
    submenu: [],
  },
  {
    title: "Settings",
    path: "#",
    icon: config?.chart,
    submenu: [],
  },
];
