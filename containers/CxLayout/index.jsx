"use client";

// CxLayout — application shell mirroring cxcontrol_v2.html exactly:
//   · 56px sticky topbar with logo mark (CX), project picker, search, bell, avatar
//   · 240px sticky left sidebar with section labels, nav items, badges
//   · You-panel summarising the signed-in user
// Uses the .cx-* helper classes defined in app/globals.css.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  getAccessToken,
  getUser,
  clearTokens,
} from "@/services/instance/tokenService";
import { Logout } from "@/services/auth";

// ─── Sidebar nav (mirrors HTML sidebar order) ────────────────────────────
// Each section is a { label, items: [{ icon, title, href, badge?, badgeKind? }] }
// Role gating is handled at the page level; Cx commissioning routes are
// universally addressable but the action UIs surface what each user can act on.
const SECTIONS = [
  {
    label: "Workspace",
    items: [
      { icon: "▤", title: "Dashboard", href: "/" },
      { icon: "", title: "My Work", href: "/MyAssignments" },
      { icon: "", title: "Communications", href: "/Communications" },
    ],
  },
  {
    label: "Project",
    items: [
      { icon: "◳", title: "Overview", href: "/Projects" },
      { icon: "▦", title: "Companies", href: "/Company/List" },
      { icon: "", title: "Equipment", href: "/Assets/List" },
      { icon: "⌚", title: "Schedule", href: "/Schedule" },
      { icon: "", title: "Site Access (TARF)", href: "/CxTARF" },
      { icon: "", title: "Issues", href: "/Issues/List" },
    ],
  },
  {
    label: "Commissioning · GC QA/QC",
    items: [
      { icon: "≡", title: "Commissioning Score", href: "/CxScore" },
      { icon: "▣", title: "Test Results", href: "/Commissioning/Tests" },
      { icon: "", title: "PSSR Inspections", href: "/PSSR" },
      { icon: "▲", title: "Risk Register", href: "/Risk" },
    ],
  },
  {
    label: "Quality & Workflow",
    items: [
      { icon: "", title: "Checklists", href: "/Checklist/List" },
      { icon: "", title: "RFIs", href: "/RFI/List" },
      { icon: "⊟", title: "Submittals", href: "/Submittals" },
      { icon: "⇄", title: "Change Requests", href: "/ChangeRequests" },
    ],
  },
  {
    label: "Field & Daily Ops",
    items: [
      { icon: "", title: "Tasks", href: "/Tasks/List" },
      { icon: "", title: "Daily Reports", href: "/DailyReports" },
      { icon: "", title: "Crew", href: "/Field/Dashboard" },
      { icon: "", title: "Meetings", href: "/Meeting/List" },
    ],
  },
  {
    label: "Supply & Finance",
    items: [
      { icon: "", title: "Inventory", href: "/Inventory/Products/List" },
      { icon: "", title: "Shipments", href: "/Shipments" },
      { icon: "$", title: "Finance", href: "/Finance" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: "", title: "Settings", href: "/Settings" },
      { icon: "", title: "Roles & Permissions", href: "/Roles" },
      { icon: "", title: "Users", href: "/Users" },
    ],
  },
];

// ─── Default export ──────────────────────────────────────────────────────
export default function CxLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const [user, setUser] = useState(null);
  const [activeOrg, setActiveOrg] = useState({
    name: "Active Project",
    code: "—",
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/Auth/Login");
      return;
    }
    try {
      const u = JSON.parse(getUser() ?? "null");
      if (u) setUser(u);
    } catch {
      /* ignore */
    }
  }, [router]);

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

        <button
          type="button"
          className="cx-tb-badge"
          title="Active project"
          onClick={() => router.push("/Projects")}
          style={{ padding: "5px 12px" }}
        >
          <div style={{ lineHeight: 1.2, textAlign: "left" }}>
            <div style={{ fontSize: 11, color: "var(--cx-text-muted)" }}>
              Project
            </div>
            <div
              style={{ fontSize: 13, fontWeight: 600, color: "var(--cx-text)" }}
            >
              {activeOrg.name}
            </div>
          </div>
          <span style={{ color: "var(--cx-text-muted)", fontSize: 11 }}>▾</span>
        </button>

        <div className="cx-tb-search">
          <input
            type="text"
            placeholder="Search projects, assets, RFIs, checklists…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 120)}
            style={{ paddingLeft: 12 }}
          />
        </div>

        <div className="cx-tb-user">
          <button type="button" className="cx-tb-icon" title="Help">
            ?
          </button>
          <button type="button" className="cx-tb-icon" title="Notifications">
           
            <span className="cx-tb-bell-dot" />
          </button>
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="cx-tb-badge"
              onClick={() => setMenu((v) => !v)}
            >
              <div className="cx-tb-av">{initials}</div>
              <div className="cx-tb-info">
                <div className="nm">
                  {user
                    ? `${user.firstName ?? user.first_name ?? ""} ${
                        user.lastName ?? user.last_name ?? ""
                      }`.trim() || user.email
                    : "Sign in"}
                </div>
                <div className="rl">
                  {user?.role ?? user?.platformRole ?? ""}
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
        <aside className="cx-sidebar">
          <div className="cx-you">
            <div className="lbl">Signed in</div>
            <div className="name">
              {user
                ? `${user.firstName ?? user.first_name ?? ""} ${
                    user.lastName ?? user.last_name ?? ""
                  }`.trim() || user.email
                : "—"}
            </div>
            <div className="role">
              {user?.role ?? user?.platformRole ?? "Operator"}
            </div>
          </div>

          {SECTIONS.map((sec) => (
            <div key={sec.label} className="cx-side-section">
              <div className="label">{sec.label}</div>
              {sec.items.map((item, index) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <a
                    key={index}
                    href={item.href}
                    className={`cx-nav-item${active ? " active" : ""}`}
                  >
                    <span className="ic">{item.icon}</span>
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
                  </a>
                );
              })}
            </div>
          ))}
        </aside>

        <main style={{ overflowX: "hidden", minWidth: 0 }}>{children}</main>
      </div>
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
