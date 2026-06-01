"use client";

// ── RBAC helper ─────────────────────────────────────────────────────────────
// Single source of truth for permission checks on the FE.
//
// Source of truth is the user object returned by GET /auth/me (UserProfileDto).
// Relevant fields:
//   user.isPlatformUser           — true → unrestricted
//   user.platformRole             — 'SUPERADMIN' | 'PLATFORM_ADMIN' | null
//   user.accessibleModules        — string[] of moduleKeys the user can view
//   user.moduleActions            — Record<moduleKey, ('view'|'edit'|'approve'|'execute'|'*')[]>
//   user.activeRole.permissions[] — [{ moduleKey, allowedActions, permissionLevel, ... }]
//
// Backend action vocabulary is: view | edit | approve | execute (plus '*' for platform).
// "create", "update", "delete" all map to BE `edit` per RBAC seed (lens templates only
// distinguish view/edit/approve/execute — `edit` covers full CRUD on the resource).
//
// Usage:
//   import { useUserPermissions, can, canAccessModule } from "@/Utils/rbac";
//   const { user, can } = useUserPermissions();
//   if (!can("checklists", "create")) return null;
//
//   <PermissionGate module={MODULE.PROJECTS} action="create">
//     <button>Add Project</button>
//   </PermissionGate>
//
//   // Hard-gate a whole route (Add/Edit pages):
//   const guard = useRequirePermission(MODULE.PROJECTS, "edit");
//   if (guard.blocked) return guard.fallback;

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GetUser } from "@/services/auth";
import { getUser, setUser } from "@/services/instance/tokenService";

// ── Constants ───────────────────────────────────────────────────────────────

// Mirrors BUSINESS_MODULES keys in coresynaptics-backend/prisma/seed-rbac.ts.
export const MODULE = {
  SALES: "sales",
  PROJECTS: "projects",
  SCHEDULING: "scheduling",
  SUPPLY_CHAIN: "supply_chain",
  FIELD_EXECUTION: "field_execution",
  QA_QC: "qa_qc",
  SAFETY: "safety",
  COMMISSIONING: "commissioning",
  RMA_RCA: "rma_rca",
  FINANCE: "finance",
  HR: "hr",
  DOCUMENTS: "documents",
  REPORTS: "reports",
  ADMIN: "admin",
  CHECKLISTS: "checklists",
  MEETINGS: "meetings",
  CONTACTS: "contacts",
  LEADS: "leads",
  DEALS: "deals",
  SUBMITTALS: "submittals",
  MILESTONES: "milestones",
  TASKS: "tasks",
  DAILY_LOG: "daily_log",
  DAILY_ROLLUP: "daily_rollup",
  CREW: "crew",
  COMMUNICATIONS: "communications",
  ARTIFACTS: "artifacts",
  CHAT: "chat",
  TEAM: "team",
  COMMISSIONING_TESTS: "commissioning_tests",
  PSSR: "pssr",
  RISK: "risk",
  CX_SCORE: "cx_score",
  ORCHESTRATION: "orchestration",
  PREDICTION: "prediction",
  ANOMALY: "anomaly",
  KNOWLEDGE_GRAPH: "knowledge_graph",
  COPILOT: "copilot",
  INTELLIGENCE: "intelligence",
  AUTOMATION: "automation",
  LEARNING: "learning",
  ECOSYSTEM: "ecosystem",
  EVENT_LOG: "event_log",
  GOVERNANCE: "governance",
};

const ALL_ACTIONS = ["view", "edit", "approve", "execute"];

// Normalize FE-friendly verbs to BE catalog actions.
//   create / update / delete → edit   (per seed-rbac.ts hierarchy)
//   read                     → view
//   anything else passes through
function normalizeAction(action) {
  if (!action) return "view";
  const a = String(action).toLowerCase();
  if (a === "create" || a === "update" || a === "delete") return "edit";
  if (a === "read") return "view";
  return a;
}

// ── Pure helpers ────────────────────────────────────────────────────────────

export function isSuperUser(user) {
  if (!user) return false;
  if (user.isPlatformUser) return true;
  if (user.platformRole === "SUPERADMIN" || user.platformRole === "PLATFORM_ADMIN") return true;
  return false;
}

function getModuleActionsMap(user) {
  if (!user) return {};
  // Prefer the flat quick-access map; fall back to activeRole.permissions.
  if (user.moduleActions && typeof user.moduleActions === "object") {
    return user.moduleActions;
  }
  const perms = user?.activeRole?.permissions;
  if (Array.isArray(perms)) {
    return perms.reduce((acc, p) => {
      if (p?.moduleKey) acc[p.moduleKey] = p.allowedActions || [];
      return acc;
    }, {});
  }
  return {};
}

export function getActions(user, moduleKey) {
  if (!moduleKey) return [];
  if (isSuperUser(user)) return ["*"];
  const map = getModuleActionsMap(user);
  return Array.isArray(map[moduleKey]) ? map[moduleKey] : [];
}

export function canAccessModule(user, moduleKey) {
  if (isSuperUser(user)) return true;
  const actions = getActions(user, moduleKey);
  if (actions.includes("*")) return true;
  // Any non-empty permission set implies at least visibility.
  return actions.length > 0;
}

// Action-level check with hierarchy:
//   approve  ⇒ view + edit + approve
//   edit     ⇒ view + edit
//   execute  ⇒ view + execute
//   view     ⇒ view
//
//   can(user, mod, 'create' | 'update' | 'delete') === can(user, mod, 'edit')
//   can(user, mod, 'read')                          === can(user, mod, 'view')
export function can(user, moduleKey, action) {
  if (!moduleKey) return false;
  if (isSuperUser(user)) return true;
  const actions = getActions(user, moduleKey);
  if (!actions.length) return false;
  if (actions.includes("*")) return true;
  const need = normalizeAction(action);
  if (actions.includes(need)) return true;
  // Hierarchy: approve implies edit + view; edit implies view.
  if (need === "view" && (actions.includes("edit") || actions.includes("approve") || actions.includes("execute"))) {
    return true;
  }
  if (need === "edit" && actions.includes("approve")) return true;
  return false;
}

// Convenience wrappers — keep call sites self-documenting.
export const canView    = (u, m) => can(u, m, "view");
export const canCreate  = (u, m) => can(u, m, "edit");
export const canEdit    = (u, m) => can(u, m, "edit");
export const canDelete  = (u, m) => can(u, m, "edit");
export const canApprove = (u, m) => can(u, m, "approve");
export const canExecute = (u, m) => can(u, m, "execute");

// Returns props to spread on a button/anchor to enforce the disable + tooltip
// pattern when the user lacks a permission. Use anywhere a New/Edit/Delete/
// Approve action surfaces in a List or Detail view.
//
//   <button {...permissionProps(canCreate, "create projects")} onClick={...}>
//     New project
//   </button>
//
// When `allowed` is false:
//   · disabled=true
//   · title="Insufficient permission — <action>"
//   · onClick is suppressed (defensive — buttons already block it via disabled)
//   · aria-disabled + opacity styling so non-button elements (Link, div) behave too
export function permissionProps(allowed, action = "perform this action") {
  if (allowed) return {};
  return {
    disabled: true,
    "aria-disabled": true,
    title: `Insufficient permission — ${action}`,
    onClick: (e) => {
      e.preventDefault();
      e.stopPropagation();
    },
    style: { opacity: 0.45, cursor: "not-allowed", pointerEvents: "auto" },
  };
}

// ── Hook ────────────────────────────────────────────────────────────────────
// Reads the cached user from localStorage immediately, then refreshes from
// /auth/me on mount so a freshly-changed role propagates without a hard reload.
export function useUserPermissions() {
  const [user, setLocalUser] = useState(() => {
    try {
      const raw = getUser();
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const fresh = await GetUser();
        if (cancelled || !fresh) return;
        setUser({ user: fresh });
        setLocalUser(fresh);
      } catch {
        /* keep cached user on failure */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    user,
    loading,
    isSuperUser: isSuperUser(user),
    canAccessModule: (m) => canAccessModule(user, m),
    can: (m, a) => can(user, m, a),
    canView: (m) => canView(user, m),
    canCreate: (m) => canCreate(user, m),
    canEdit: (m) => canEdit(user, m),
    canDelete: (m) => canDelete(user, m),
    canApprove: (m) => canApprove(user, m),
    canExecute: (m) => canExecute(user, m),
    getActions: (m) => getActions(user, m),
    permissionProps,
  };
}

export const _ALL_ACTIONS = ALL_ACTIONS;

// ── Components & route guards ───────────────────────────────────────────────

/**
 * Conditionally render children only if the current user can perform
 * `action` on `module`. Renders `fallback` (default: null) otherwise.
 *
 *   <PermissionGate module={MODULE.PROJECTS} action="create">
 *     <button>New project</button>
 *   </PermissionGate>
 */
export function PermissionGate({ module, action = "view", fallback = null, children }) {
  const { can: canDo, loading } = useUserPermissions();
  if (loading) return null;
  if (!module) return children;
  return canDo(module, action) ? children : fallback;
}

/**
 * Component wrapper for route-level permission gating. Wrap the page content
 * (typically inside <Layout>) so a user without the required action sees the
 * access-denied fallback instead of the page.
 *
 *   <RouteGuard module={MODULE.PROJECTS} action="view">
 *     <ProjectsContainer />
 *   </RouteGuard>
 *
 * Pass `action="edit"` for Add/Edit pages, `action="view"` for List/Detail.
 * If `module` is omitted, the children render unconditionally — useful for
 * universal pages (Dashboard, Glossary) wrapped uniformly at the route layer.
 */
export function RouteGuard({ module, action = "view", children }) {
  const guard = useRequirePermission(module, action);
  if (!module) return children;
  if (guard.loading || guard.blocked) return guard.fallback;
  return children;
}

/**
 * Hard guard for Add/Edit/Detail routes. Call at the top of the page.
 * - Returns `{ loading, blocked, fallback }`.
 * - When loading: render fallback (a spinner or null) until the user is known.
 * - When blocked: render the fallback (an access-denied notice).
 *
 * Usage:
 *   const guard = useRequirePermission(MODULE.PROJECTS, "edit");
 *   if (guard.loading) return guard.fallback;
 *   if (guard.blocked) return guard.fallback;
 */
export function useRequirePermission(moduleKey, action = "view") {
  const { user, loading, can: canDo } = useUserPermissions();
  const allowed = canDo(moduleKey, action);
  return {
    loading,
    blocked: !loading && !allowed,
    user,
    fallback: loading ? <RbacLoading /> : !allowed ? <RbacDenied module={moduleKey} action={action} /> : null,
  };
}

function RbacLoading() {
  return (
    <div className="flex items-center justify-center h-[60vh] text-gray-400 text-sm">
      Checking permissions…
    </div>
  );
}

function RbacDenied({ module, action }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
      <div className="text-5xl mb-3">🔒</div>
      <h2 className="text-2xl font-semibold text-white mb-2">Access denied</h2>
      <p className="text-gray-400 max-w-md mb-5">
        You don't have permission to <span className="font-semibold text-white">{action}</span>{" "}
        in the <span className="font-semibold text-white">{module}</span> module. Ask an
        administrator to grant access.
      </p>
      <button
        onClick={() => router.back()}
        className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm border border-white/15"
      >
        Go back
      </button>
    </div>
  );
}
