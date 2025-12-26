export const sidebarItems = [
  {
    title: "Home",
    icon: "•",
    path: "/",
    type: "link",
    submenu: [],
  },
  {
    title: "Hunts",
    icon: "•",
    category: "",
    path: "/Hunt/List",
    submenu: [
      {
        title: "Hunt List",
        path: "/Hunt/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Add Hunt",
        path: "/Hunt/Add",
        type: "text",
        icon: "•",
      },
      {
        title: "Hunt Category",
        path: "/Hunt/Category/List",
        type: "text",
        icon: "•",
      },
    ],
  },
  {
    title: "Hunts Bookings",
    icon: "•",
    path: "#",
    submenu: [
      // { title: "Settings", path: "/AbondonedOrder/Settings", type: "link" },
      {
        title: "Hunts Booking List",
        path: "/Hunt/Orders/List",
        type: "link",
        icon: "•",
      },
    ],
  },
  {
    title: "Outfiters",
    icon: "•",
    category: "",
    path: "/Hunt/List",
    submenu: [
      {
        title: "Outfiters List",
        path: "/Outfiters/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Add Outfiter",
        path: "/Outfiters/Add",
        type: "text",
        icon: "•",
      },
    ],
  },
  {
    title: "Guides",
    icon: "•",
    category: "",
    path: "/Guide/List",
    submenu: [
      {
        title: "Guides List",
        path: "/Guide/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Add Guide",
        path: "/Guide/Add",
        type: "text",
        icon: "•",
      },
    ],
  },
  {
    title: "Customers",
    icon: "•",
    path: "/Customers/Manage",
    submenu: [
      {
        title: "All Customers",
        path: "/Customers/List",
        type: "link",
        icon: "•",
      },
    ],
  },
  {
    title: "User Reviews",
    icon: "•",
    path: "/Reviews/List",
    submenu: [],
  },
  {
    title: "Settings",
    path: "",
    icon: "•",
    submenu: [
      {
        title: "Payments",
        path: "/payments/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Checkout",
        path: "",
        type: "link",
        icon: "•",
      },
      {
        title: "Locations",
        path: "",
        type: "link",
        icon: "•",
      },
      {
        title: "Verifications",
        path: "/Verifications/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Disputes",
        path: "/Disputes/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Refunds",
        path: "/Refunds/List",
        type: "link",
        icon: "•",
      },
    ],
  },
  {
    title: "Invoice",
    path: "",
    icon: "•",
    submenu: [
      {
        title: "Invoice List",
        path: "/Invoices/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Add Invoice",
        path: "/Invoices/Add",
        type: "link",
        icon: "•",
      },
    ],
  },
  {
    title: "Admin Users",
    path: "",
    icon: "•",
    submenu: [
      {
        title: "Users List",
        path: "/Users/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Users Roles",
        path: "",
        type: "link",
        icon: "•",
      },
      {
        title: "Users Permisions",
        path: "",
        type: "link",
        icon: "•",
      },
    ],
  },
  {
    title: "Countries",
    path: "/Country/List",
    icon: "•",
    submenu: [
      {
        title: "Countries List",
        path: "/Country/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Add Country",
        path: "/Add/List",
        type: "link",
        icon: "•",
      },
    ],
  },
  {
    title: "FAQ",
    icon: "•",
    path: "/Faq/List",
    submenu: [
      {
        title: "Add",
        path: "/Faq/Add",
        type: "link",
        icon: "•",
      },
      {
        title: "List",
        path: "/Faq/List",
        type: "link",
        icon: "•",
      },
      {
        title: "Category",
        path: "/Faq/Category/List",
        type: "link",
        icon: "•",
      },
    ],
  },
  {
    title: "Support",
    icon: "•",
    category: "",
    path: "https://consult2manage.com/contact-us/",
    submenu: [],
  },
];
