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
const SECTIONS = [
  {
    label: "Workspace",
    items: [
      { icon: "", title: "Dashboard", href: "/" },
      { icon: "", title: "My Work", href: "/MyAssignments" },
      { icon: "", title: "My Approvals", href: "/Approvals/MyPending" },
      { icon: "", title: "Notifications", href: "/Notifications" },
      { icon: "", title: "Cross-Lens", href: "/CrossLens" },
      {
        icon: "",
        title: "Portfolio Predictions",
        href: "/PortfolioPredictions",
      },
      { icon: "", title: "Portfolio Copilot", href: "/PortfolioCopilot" },
      { icon: "", title: "Project Copilot", href: "/ProjectCopilot" },
      { icon: "", title: "Learner Profile", href: "/LearnerProfile" },
      { icon: "", title: "Announcements", href: "/Announcements" },
      { icon: "", title: "Photos", href: "/Photos" },
      { icon: "", title: "Chat", href: "/Chat" },
      { icon: "", title: "Portfolio", href: "/Portfolio" },
      { icon: "", title: "Analytics", href: "/Analytics" },
    ],
  },
  {
    label: "Project",
    items: [
      { icon: "", title: "Overview", href: "/ProjectOverview" },
      { icon: "", title: "Companies", href: "/Company/List" },
      { icon: "", title: "Equipment", href: "/Assets/List" },
      { icon: "", title: "Schedule", href: "/ScheduleMilestones/List" },
      { icon: "", title: "Site Access (TARF)", href: "/CxTARF" },
      { icon: "", title: "Issues", href: "/Issues/List" },
      { icon: "", title: "Dependencies", href: "/Dependencies" },
    ],
  },
  {
    label: "Commissioning · GC QA/QC",
    items: [
      { icon: "", title: "Commissioning Score", href: "/CxScore" },
      { icon: "", title: "Test Results", href: "/Commissioning/Tests" },
      { icon: "", title: "PSSR Inspections", href: "/PSSR" },
      { icon: "", title: "Risk Register", href: "/Risk" },
      { icon: "", title: "Readiness", href: "/Readiness" },
      { icon: "", title: "Turnover Packages", href: "/Turnover" },
      {
        icon: "",
        title: "Artifact Bundles",
        href: "/ArtifactIntelligence/Bundles",
      },
      { icon: "", title: "JHA", href: "/Jha" },
      { icon: "", title: "Power Flow", href: "/PowerFlow" },
      { icon: "", title: "Phase Reference", href: "/PhaseReference" },
      { icon: "", title: "Training & Simulation", href: "/Training" },
      { icon: "", title: "Training Simulator (legacy)", href: "/TrainingSim" },
    ],
  },
  {
    label: "Quality & Workflow",
    items: [
      { icon: "", title: "Checklists", href: "/Checklist/List" },
      {
        icon: "",
        title: "Checklist Delegations",
        href: "/ChecklistDelegations",
      },
      { icon: "", title: "RFIs", href: "/RFI/List" },
      { icon: "", title: "Submittals", href: "/Submittals/List" },
      { icon: "", title: "Change Requests", href: "/ChangeRequests" },
    ],
  },
  {
    label: "Field & Daily Ops",
    items: [
      { icon: "", title: "Tasks", href: "/Tasks/List" },
      { icon: "", title: "Daily Reports", href: "/DailyReports" },
      {
        icon: "",
        title: "Crew Dispatch",
        href: "/CrewDispatch",
      },
      {
        icon: "",
        title: "Crew Dispatch v15",
        href: "/CrewDispatchV15",
      },
      { icon: "", title: "Meetings", href: "/Meeting/List" },
    ],
  },
  {
    label: "Supply & Finance",
    items: [
      { icon: "", title: "Inventory", href: "/Inventory/Products/List" },
      { icon: "", title: "Shipments", href: "/Shipments/List" },
      { icon: "", title: "Finance", href: "/Finance/Billing" },
    ],
  },
  {
    label: "Admin",
    items: [
      { icon: "", title: "Settings", href: "/Settings" },
      { icon: "", title: "Roles & Permissions", href: "/Roles/List" },
      { icon: "", title: "Users", href: "/Users/List" },
      { icon: "", title: "Automation", href: "/Automation" },
      {
        icon: "",
        title: "Automation Intel",
        href: "/AutomationIntelligence",
      },
      { icon: "", title: "Org Policies", href: "/OrgPolicies" },
      { icon: "", title: "Integrations", href: "/Integrations" },
      { icon: "", title: "Ecosystem", href: "/Ecosystem" },
      { icon: "", title: "Governance", href: "/Governance" },
      { icon: "", title: "Diagnostics", href: "/Diagnostics" },
      { icon: "", title: "Anomalies", href: "/Anomalies" },
      {
        icon: "",
        title: "Operations Anomalies",
        href: "/OperationsAnomalies",
      },
      {
        icon: "",
        title: "Anomaly Suppressions",
        href: "/AnomalySuppressions",
      },
      { icon: "", title: "Cross-Domain", href: "/CrossDomain" },
      { icon: "", title: "Event Log", href: "/EventLog" },
      { icon: "", title: "Outbox Explorer", href: "/Outbox" },
      { icon: "", title: "Impersonation Audit", href: "/ImpersonationAudit" },
    ],
  },
  {
    label: "Platform",
    items: [
      { icon: "", title: "SRE Dashboard", href: "/Sre" },
      {
        icon: "",
        title: "Intelligence Stabilization",
        href: "/IntelligenceStabilization",
      },
    ],
  },
];

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
