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
} from "@/services/instance/tokenService";
import { GetUser, Logout } from "@/services/auth";
import GlobalSearchBar from "@/components/GlobalSearchBar";
import NotificationBell from "@/components/NotificationBell";
import OnboardingTourOverlay from "@/components/OnboardingTourOverlay";

// ─── Sidebar nav (mirrors HTML sidebar order) ────────────────────────────
// Each section is a { label, items: [{ icon, title, href, badge?, badgeKind? }] }
// Role gating is handled at the page level; Cx commissioning routes are
// universally addressable but the action UIs surface what each user can act on.
// Sidebar section builder. The Project and My Company groups embed the
// active project code in their labels, so we derive SECTIONS from the
// current project at render time rather than holding a static module-level
// array.
function buildSections(projectCode) {
  const code = projectCode || "—";
  return [
    {
      label: "Workspace",
      items: [
        { title: "Dashboard", href: "/" },
        { title: "Executive Summary", href: "/Executive/Dashboard" },
        { title: "My work", href: "/MyAssignments" },
        { title: "Announcements", href: "/Announcements" },
        {
          title: "Projects",
          href: "/Projects",
        },
        { title: "Chat", href: "/Chat" },
        { title: "Daily field log", href: "/FieldReports" },
        { title: "Crew dispatch", href: "/CrewDispatch" },
      ],
    },
    {
      label: `Project · ${code}`,
      items: [
        { title: "Overview", href: "/ProjectOverview" },
        { title: "Companies", href: "/Company/List" },
        { title: "Equipment", href: "/Assets/List" },
        { title: "Schedule (Gantt)", href: "/Schedule" },
        { title: "QA/QC checklists", href: "/Checklist/List" },
        { title: "Issues", href: "/Issues/List" },
        { title: "NCRs", href: "/NCRs" },
        { title: "Hold/Witness pts", href: "/HoldWitnessPoints" },
        { title: "Punch list", href: "/PunchList" },
        { title: "Test results", href: "/Commissioning/Tests" },
        { title: "Long-lead items", href: "/LongLeadItems" },
        { title: "Procurement", href: "/Finance/Procurement" },
      ],
    },
    {
      label: "GC QA/QC Toolkit",
      items: [
        { title: "QA/QC Command Center", href: "/QAQC" },
        { title: "Phase advancement queue", href: "/Phases/List" },
        { title: "Cx Score · Exec", href: "/CxScore" },
        { title: "Cx Master Log", href: "/CxMasterLog" },
        { title: "PSSR · Pre-Startup", href: "/PSSR" },
        { title: "Risk Register", href: "/Risk" },
        { title: "Turnover Package", href: "/Turnover" },
      ],
    },
    {
      label: "Communication",
      items: [
        { title: "Present to leadership", href: "/PresentToLeadership" },
        { title: "RFIs", href: "/RFI/List" },
        { title: "Artifacto", href: "/Artifacto" },
        { title: "Photos", href: "/Photos" },
        { title: "Site arrivals (TARF)", href: "/CxTARF" },
        { title: "Activity feed", href: "/ActivityFeed" },
      ],
    },
    {
      label: "Learning",
      items: [
        { title: "Training & Library", href: "/Training" },
        { title: "Phase reference", href: "/PhaseReference" },
        { title: "Cx flow diagram", href: "/CxFlowDiagram" },
        { title: "Cx walkthrough sim", href: "/CxWalkthroughSim" },
        { title: "Power flow simulator", href: "/PowerFlow" },
        { title: "Glossary", href: "/Glossary" },
      ],
    },
    {
      label: `My Company · ${code}`,
      items: [
        { title: "Team", href: "/Teams/List" },
        { title: "Billing & invoices", href: "/Finance/Billing" },
      ],
    },
    {
      label: "Portfolio",
      items: [{ title: "All my projects", href: "/Portfolio" }],
    },
  ];
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
  const [user, setLocalUser] = useState(null);
  const [activeOrg, setActiveOrg] = useState({
    name: "Active Project",
    code: "—",
  });
  const [menu, setMenu] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(PROJECTS[0]);

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

  const fetchUser = async () => {
    try {
      const u = await GetUser();
      setUser({ user: u });
      if (u) setLocalUser(u);
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/Auth/Login");
      return;
    }
    fetchUser();
  }, []);

  const SECTIONS = useMemo(
    () => buildSections(activeProject?.code),
    [activeProject?.code],
  );

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
            <div className="name">
              {user
                ? `${user.firstName ?? user.first_name ?? ""} ${
                    user.lastName ?? user.last_name ?? ""
                  }`.trim() || user.email
                : "—"}
            </div>
            <div className="role">
              {user?.activeRole?.description ??
                user?.platformRole ??
                "Operator"}
            </div>
          </div>

          {SECTIONS.map((sec) => (
            <div key={sec.label} className="cx-side-section">
              <div className="label">{sec.label}</div>
              {sec.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
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
          ))}
        </aside>

        <main style={{ overflowX: "hidden", minWidth: 0 }}>{children}</main>
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
