import sendRequest from "../instance/sendRequest";

// ── RBAC Admin (write-side) service ──────────────────────────────────────────
// Module grants (modules → roles) and role assignment (roles → users).
//
// Hard rules (server-owned — never re-implement client-side beyond pre-validation):
//   • Tenant actions are exactly view | edit | approve | execute. `delete` 400s.
//   • An empty action set === REVOKE the module from the role.
//   • Derived level: [] → hidden, ['view'] → read-only, any edit/approve/execute → full.
//   • One role per org. Assign = REPLACE. Revoke → zero roles (fails closed).
//   • Org admin acts on their own org only (org from JWT — never send organizationId)
//     and cannot target the org's own admin role (AUTHORITY_BOUND).
//   • All-or-nothing batches; ≤ 500 pairs each.
//   • IMPORTANT: on a 400 the server does NOT forward per-pair `results` — only a
//     summary `message`. Per-pair `results` are reliable ONLY on the 200 success
//     response. So we mirror validation client-side and show a summary on failure.

// ── Vocabulary + caps ────────────────────────────────────────────────────────
export const TENANT_ACTIONS = ["view", "edit", "approve", "execute"];
export const MAX_GRANT_PAIRS = 500;
export const MAX_USER_ROLE_PAIRS = 500;

// ── Derived level + helpers ──────────────────────────────────────────────────
export function deriveLevel(actions = []) {
  if (!actions || actions.length === 0) return "hidden";
  if (actions.some((a) => a === "edit" || a === "approve" || a === "execute")) return "full";
  if (actions.includes("view")) return "read-only";
  return "hidden";
}

// level → canonical action set (for read-back when only a level is available).
export function levelToActions(level) {
  switch (level) {
    case "read-only":
      return ["view"];
    case "full":
      return ["view", "edit", "approve", "execute"];
    case "hidden":
    default:
      return [];
  }
}

// Keep only valid tenant actions; `delete` (and anything else) is dropped.
export const sanitizeActions = (actions = []) =>
  (actions || []).filter((a) => TENANT_ACTIONS.includes(a));

// `sendRequest` re-throws the parsed error envelope (or the raw error). This
// normalises both so screens can always read `.message` / `.statusCode`.
export const errorBody = (err) => (err && typeof err === "object" ? err : {});

// ── Reason → human copy (used on the 200 results[] and for pre-validation) ───
export function prettyReason(reason) {
  switch (String(reason || "").split(":")[0]) {
    case "DELETE_NOT_ALLOWED":
      return "Delete is not a grantable action.";
    case "INVALID_ACTION":
      return "Unsupported action.";
    case "ROLE_NOT_FOUND":
      return "Role not found — refresh the role list.";
    case "NOT_OWN_ORG":
      return "That role is not in your organization.";
    case "AUTHORITY_BOUND":
      return "You cannot edit the organization admin role.";
    case "NO_RESOLVABLE_ADMIN":
      return "Your organization has no resolvable admin — contact support.";
    case "NO_ACTIVE_SUBSCRIPTION":
      return "No active subscription plan.";
    case "PLAN_EXCLUDES_MODULE":
      return "This module is not in your plan.";
    case "PERMISSION_CATALOG_MISSING":
      return "Module is not in the permission catalog.";
    case "GLOBAL_TEMPLATE_REQUIRES_ACK":
      return "Confirm you are editing a global template.";
    default:
      return reason || "Rejected.";
  }
}

export function prettyUserReason(reason) {
  switch (String(reason || "").split(":")[0]) {
    case "LAST_ADMIN_HOLDER":
      return "Cannot remove the last admin — the organization would be locked out.";
    case "NO_ROLE_TO_REVOKE":
      return "User has no role in this organization.";
    case "USER_NOT_IN_ORG":
      return "User is not in your organization.";
    case "ROLE_NOT_OWN_ORG":
      return "That role is not in your organization.";
    case "USER_NOT_FOUND":
      return "User not found.";
    case "ROLE_NOT_FOUND":
      return "Role not found.";
    case "NO_RESOLVABLE_ADMIN":
      return "Your organization has no resolvable admin.";
    default:
      return reason || "Rejected.";
  }
}

// ── Org admin: module → role ─────────────────────────────────────────────────
/** body: { grants:[{roleId,moduleKey,allowedActions}] } → BulkGrantResponse */
export const orgGrantModules = (body) =>
  sendRequest({ url: "/org/rbac/roles/module-grants", method: "POST", data: body });

/** body: { pairs:[{roleId,moduleKey}] } → BulkGrantResponse */
export const orgRevokeModules = (body) =>
  sendRequest({ url: "/org/rbac/roles/module-grants", method: "DELETE", data: body });

/** → { modules: string[] } — the org plan's grantable moduleKeys (authoritative). */
export const orgGrantableModules = () =>
  sendRequest({ url: "/org/rbac/roles/grantable-modules", method: "GET" });

// ── Org admin: role → user (one role per org; assign = replace) ───────────────
/** assignments: [{ userId, roleId }] → UserRoleBulkResponse */
export const orgAssignUserRoles = (assignments) =>
  sendRequest({ url: "/org/rbac/roles/user-roles", method: "POST", data: { assignments } });

/** userIds: string[] → UserRoleBulkResponse */
export const orgRevokeUserRoles = (userIds) =>
  sendRequest({ url: "/org/rbac/roles/user-roles", method: "DELETE", data: { userIds } });

// ── Platform super-admin (SUPERADMIN) ────────────────────────────────────────
export const platformGrantModules = (body) =>
  sendRequest({ url: "/platform/rbac/roles/module-grants", method: "POST", data: body });

export const platformRevokeModules = (body) =>
  sendRequest({ url: "/platform/rbac/roles/module-grants", method: "DELETE", data: body });

export const platformAssignUserRoles = (organizationId, assignments) =>
  sendRequest({
    url: "/platform/rbac/roles/user-roles",
    method: "POST",
    data: { organizationId, assignments },
  });

export const platformRevokeUserRoles = (organizationId, userIds) =>
  sendRequest({
    url: "/platform/rbac/roles/user-roles",
    method: "DELETE",
    data: { organizationId, userIds },
  });

// ── Read pickers (existing endpoints, fetched from elsewhere — §9) ───────────
/** → RoleSummaryDto[] (roles in the caller's org). */
export const listRoles = () => sendRequest({ url: "/roles", method: "GET" });

/** → { permissions: [{ moduleKey, allowedActions, permissionLevel }] } */
export const roleModules = (roleId) =>
  sendRequest({ url: `/roles/${roleId}/modules`, method: "GET" });

/** → user list (existing shape). */
export const listRbacUsers = () => sendRequest({ url: "/users", method: "GET" });
