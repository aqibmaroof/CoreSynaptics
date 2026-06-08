"use client";

// ── Platform RBAC (SUPERADMIN) ───────────────────────────────────────────────
// SUPERADMIN has no org of their own, so this screen takes an EXPLICIT target org
// (org-picker → /platform/tenants) and drives the /platform/rbac/* endpoints:
//   • module → role grants (matrix), and
//   • role → user assignment (one role per org; assign = replace).
// All the rules (plan gate for the target org, AUTHORITY_BOUND on the admin role,
// last-admin guard, both-gates-atomic) are enforced server-side — this screen
// only stages + submits, then renders the server's per-pair verdicts.

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/services/instance/tokenService";
import {
  platformListTenants,
  platformOrgRoles,
  platformOrgUsers,
  platformOrgGrantableModules,
  platformRoleModules,
  platformGrantModules,
  platformAssignUserRoles,
  platformRevokeUserRoles,
  platformCreateOrgRole,
  platformUpdateOrgRole,
  platformDeleteOrgRole,
  deriveLevel,
  levelToActions,
  sanitizeActions,
  errorBody,
  prettyReason,
  prettyUserReason,
  TENANT_ACTIONS,
} from "@/services/RbacAdmin";

const moduleLabel = (key) =>
  String(key || "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const userName = (u) =>
  u?.firstName || u?.lastName
    ? `${u?.firstName || ""} ${u?.lastName || ""}`.trim()
    : u?.email || "Unknown";

const LEVEL_BADGE = {
  hidden: { label: "No access", color: "var(--rf-txt3)" },
  "read-only": { label: "Read-only", color: "var(--rf-yellow)" },
  full: { label: "Full", color: "var(--rf-green)" },
};

// ── Shared theme class strings ───────────────────────────────────────────────
const BTN_PRIMARY =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all";
const BTN_GHOST =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-[var(--rf-border2)] text-[var(--rf-txt2)] hover:text-[var(--rf-txt)] hover:border-[var(--rf-accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors";
const BTN_DANGER =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[var(--rf-red)] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all";
const SELECT_CLS =
  "px-3 py-2 rounded-lg text-sm bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] focus:border-[var(--rf-accent)] focus:outline-none [&_option]:bg-[var(--rf-bg2)]";
const CARD_CLS = "rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)]";
const CHECKBOX_CLS =
  "checkbox checkbox-sm border-2 border-gray-400 text-white checked:[--input-color:var(--rf-green)] checked:border-[var(--rf-green)]";
const TH_CLS =
  "text-left py-3 px-4 text-white font-semibold text-xs uppercase tracking-wider";

const sameSet = (a, b) => {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
};

export default function PlatformRbac() {
  const router = useRouter();

  // ── SUPERADMIN gate ─────────────────────────────────────────────────────
  const [allowed, setAllowed] = useState(null); // null = checking
  useEffect(() => {
    let u = null;
    try {
      u = JSON.parse(getUser() || "null");
    } catch {
      u = null;
    }
    setAllowed(Boolean(u?.isPlatformUser && u?.platformRole === "SUPERADMIN"));
  }, []);

  const [tab, setTab] = useState("modules"); // 'modules' | 'users'

  // ── Org picker ──────────────────────────────────────────────────────────
  const [orgs, setOrgs] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [orgsLoading, setOrgsLoading] = useState(true);

  useEffect(() => {
    if (allowed !== true) return;
    (async () => {
      setOrgsLoading(true);
      try {
        const res = await platformListTenants();
        const list = Array.isArray(res) ? res : res?.data || res?.tenants || res?.items || [];
        setOrgs(list);
        setOrgId((cur) => cur || list[0]?.id || "");
      } catch {
        setOrgs([]);
      } finally {
        setOrgsLoading(false);
      }
    })();
  }, [allowed]);

  // ── Roles / users / grantable for the selected org ───────────────────────
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [grantable, setGrantable] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [original, setOriginal] = useState({}); // moduleKey -> actions[]
  const [staged, setStaged] = useState({}); // moduleKey -> actions[]
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState(null);
  const [batchError, setBatchError] = useState("");
  const [saving, setSaving] = useState(false);

  const showFlash = (type, text) => {
    setFlash({ type, text });
    setTimeout(() => setFlash(null), 4000);
  };

  // load roles + grantable for the selected org
  const loadOrgData = useCallback(async () => {
    if (allowed !== true || !orgId) return;
    setLoading(true);
    setBatchError("");
    try {
      const [r, g, u] = await Promise.all([
        platformOrgRoles(orgId),
        platformOrgGrantableModules(orgId),
        platformOrgUsers(orgId),
      ]);
      const roleList = Array.isArray(r) ? r : [];
      // exclude the resolved admin role (AUTHORITY_BOUND on write)
      const selectable = roleList.filter((x) => !x.isResolvedAdmin);
      setRoles(selectable);
      setGrantable(g?.modules || []);
      setUsers(Array.isArray(u) ? u : []);
      setSelectedRoleId((cur) =>
        selectable.some((x) => x.id === cur) ? cur : selectable[0]?.id ?? null,
      );
    } catch (e) {
      setRoles([]);
      setGrantable([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [allowed, orgId]);

  useEffect(() => {
    loadOrgData();
  }, [loadOrgData]);

  // ── Role CRUD (SUPERADMIN, target org) ─────────────────────────────────────
  const [newRoleName, setNewRoleName] = useState("");
  const [roleBusy, setRoleBusy] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [roleSearch, setRoleSearch] = useState("");

  // Roles filtered by the search box (case-insensitive match on name).
  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => (r.name || "").toLowerCase().includes(q));
  }, [roles, roleSearch]);

  const createRole = async () => {
    const name = newRoleName.trim();
    if (!name || !orgId || roleBusy) return;
    setRoleBusy(true);
    setRoleError("");
    try {
      await platformCreateOrgRole(orgId, { name });
      setNewRoleName("");
      await loadOrgData();
    } catch (err) {
      setRoleError(errorBody(err)?.message || "Failed to create role.");
    } finally {
      setRoleBusy(false);
    }
  };

  const deleteRole = async (roleId) => {
    if (!orgId || roleBusy) return;
    setRoleBusy(true);
    setRoleError("");
    try {
      await platformDeleteOrgRole(orgId, roleId);
      setConfirmDeleteId(null);
      if (selectedRoleId === roleId) setSelectedRoleId(null);
      await loadOrgData();
    } catch (err) {
      setRoleError(errorBody(err)?.message || "Failed to delete role.");
    } finally {
      setRoleBusy(false);
    }
  };

  // load the selected role's current module grants
  const loadRoleModules = useCallback(async (roleId) => {
    if (!roleId) return;
    setBatchError("");
    try {
      const res = await platformRoleModules(roleId);
      const perms = res?.permissions || [];
      const map = {};
      perms.forEach((p) => {
        map[p.moduleKey] = sanitizeActions(p.allowedActions || []);
      });
      setOriginal(map);
      setStaged(map);
    } catch {
      setOriginal({});
      setStaged({});
    }
  }, []);

  useEffect(() => {
    if (selectedRoleId) loadRoleModules(selectedRoleId);
  }, [selectedRoleId, loadRoleModules]);

  const toggle = (moduleKey, action) => {
    setStaged((prev) => {
      const cur = new Set(prev[moduleKey] || []);
      if (cur.has(action)) cur.delete(action);
      else cur.add(action);
      return { ...prev, [moduleKey]: sanitizeActions([...cur]) };
    });
  };

  const changedModules = useMemo(() => {
    const keys = new Set([...Object.keys(original), ...Object.keys(staged)]);
    const out = [];
    keys.forEach((k) => {
      const o = original[k] || [];
      const s = staged[k] || [];
      if (!sameSet(o, s)) out.push(k);
    });
    return out;
  }, [original, staged]);

  // Revert staged matrix edits back to the server truth.
  const discardGrants = () => {
    if (saving) return;
    setStaged(original);
    setBatchError("");
  };

  const saveGrants = async () => {
    if (!selectedRoleId || changedModules.length === 0) return;
    setSaving(true);
    setBatchError("");
    const grants = changedModules.map((moduleKey) => ({
      roleId: selectedRoleId,
      moduleKey,
      allowedActions: staged[moduleKey] || [],
    }));
    try {
      const res = await platformGrantModules({ grants });
      showFlash("success", `Updated ${res?.applied ?? grants.length} grant(s).`);
      await loadRoleModules(selectedRoleId);
    } catch (err) {
      const body = errorBody(err);
      const rejected = (body?.results || []).filter((r) => r?.status === "REJECTED");
      if (rejected.length) {
        setBatchError(
          "No changes applied. " +
            rejected
              .map((r) => `${moduleLabel(r.moduleKey)}: ${prettyReason(r.reason)}`)
              .join(" · "),
        );
      } else {
        setBatchError(body?.message || "No changes were applied. Review and retry.");
      }
      showFlash("error", "Batch rejected — no changes applied.");
    } finally {
      setSaving(false);
    }
  };

  // ── role → user (target org) ──────────────────────────────────────────────
  const [assignRoleId, setAssignRoleId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userResults, setUserResults] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setAssignRoleId((cur) => (roles.some((r) => r.id === cur) ? cur : roles[0]?.id || ""));
  }, [roles]);

  const toggleUser = (id) =>
    setSelectedUserIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );

  const renderUserResults = (arr) => {
    const next = {};
    (arr || []).forEach((r) => {
      if (r.status === "REJECTED") next[r.userId] = { danger: true, text: prettyUserReason(r.reason) };
      else
        next[r.userId] = {
          danger: !r.resultingRoleId,
          text: r.note || (r.resultingRoleId ? "Role set." : "No role — access revoked."),
        };
    });
    setUserResults(next);
  };

  const assignUsers = async () => {
    if (!assignRoleId || selectedUserIds.length === 0 || busy) return;
    setBusy(true);
    setUserResults({});
    const assignments = selectedUserIds.map((userId) => ({ userId, roleId: assignRoleId }));
    try {
      const res = await platformAssignUserRoles(orgId, assignments);
      renderUserResults(res?.results);
      showFlash("success", `Assigned to ${res?.applied ?? assignments.length} user(s).`);
      const u = await platformOrgUsers(orgId);
      setUsers(Array.isArray(u) ? u : []);
    } catch (err) {
      const body = errorBody(err);
      if (body?.results?.length) renderUserResults(body.results);
      showFlash("error", body?.message || "Batch rejected — no changes applied.");
    } finally {
      setBusy(false);
    }
  };

  const revokeUsers = async () => {
    if (selectedUserIds.length === 0 || busy) return;
    if (!window.confirm(`${selectedUserIds.length} user(s) will have NO role in this org and lose access until reassigned. Continue?`)) return;
    setBusy(true);
    setUserResults({});
    try {
      const res = await platformRevokeUserRoles(orgId, selectedUserIds);
      renderUserResults(res?.results);
      showFlash("success", `Revoked ${res?.applied ?? selectedUserIds.length} user(s).`);
      const u = await platformOrgUsers(orgId);
      setUsers(Array.isArray(u) ? u : []);
    } catch (err) {
      const body = errorBody(err);
      if (body?.results?.length) renderUserResults(body.results);
      showFlash("error", body?.message || "Batch rejected — no changes applied.");
    } finally {
      setBusy(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  if (allowed === null)
    return (
      <div className="font-gilroy p-10 text-sm text-[var(--rf-txt3)]">
        Loading…
      </div>
    );
  if (allowed === false)
    return (
      <div className="font-gilroy py-6 px-7 text-[var(--rf-txt)]">
        <div
          className={`${CARD_CLS} max-w-md mx-auto text-center mt-20 p-10`}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--rf-bg3)] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-[var(--rf-txt3)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[var(--rf-txt)] mb-1">
            Platform access required
          </h3>
          <p className="text-sm text-[var(--rf-txt2)]">
            Only platform super-admins can manage cross-organization RBAC.
          </p>
        </div>
      </div>
    );

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="font-gilroy py-6 px-7 text-[var(--rf-txt)]">
      {/* Header */}
      <h1 className="text-3xl font-bold tracking-tight text-[var(--rf-txt)]">
        Platform RBAC
      </h1>
      <p className="text-sm text-[var(--rf-txt2)] mt-1">
        Manage roles &amp; access across any organization. Changes apply
        all-or-nothing.
      </p>

      {/* Org picker */}
      <div className="mt-5 mb-4 flex items-center gap-3 flex-wrap">
        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--rf-txt3)]">
          Organization
        </label>
        <select
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          disabled={orgsLoading}
          className={`${SELECT_CLS} min-w-[280px] disabled:opacity-50`}
        >
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} {o.type ? `(${o.type})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1 p-1 mb-5 rounded-xl bg-[var(--rf-bg2)] border border-[var(--rf-border)]">
        {[
          { key: "modules", label: "Modules → Roles" },
          { key: "users", label: "Roles → Users" },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{
                fontWeight: active ? 700 : 500,
                background: active ? "var(--rf-accent)" : "transparent",
                color: active ? "#fff" : "var(--rf-txt2)",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {flash && (
        <div
          className="mb-4 rounded-xl px-4 py-3 text-sm font-medium border"
          style={{
            background:
              flash.type === "success"
                ? "color-mix(in srgb, var(--rf-green) 12%, transparent)"
                : "color-mix(in srgb, var(--rf-red) 12%, transparent)",
            borderColor:
              flash.type === "success"
                ? "color-mix(in srgb, var(--rf-green) 40%, transparent)"
                : "color-mix(in srgb, var(--rf-red) 40%, transparent)",
            color:
              flash.type === "success" ? "var(--rf-green)" : "var(--rf-red)",
          }}
        >
          {flash.text}
        </div>
      )}

      {tab === "modules" ? (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* Roles list */}
          <div className={`${CARD_CLS} overflow-hidden h-fit`}>
            <div className="px-4 py-3 border-b border-[var(--rf-border)] bg-[var(--rf-bg3)]/40 text-sm font-bold text-[var(--rf-txt)]">
              Roles
            </div>
            {/* Search / filter the roles list */}
            <div className="px-3 py-2 border-b border-[var(--rf-border)] relative">
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="Search roles…"
                className="w-full px-2 py-1.5 pr-7 text-sm rounded-md border border-[var(--rf-border)] bg-[var(--rf-bg)] text-[var(--rf-txt)]"
              />
              {roleSearch ? (
                <button
                  type="button"
                  onClick={() => setRoleSearch("")}
                  aria-label="Clear search"
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--rf-txt3)] hover:text-[var(--rf-txt)] text-sm leading-none"
                >
                  ✕
                </button>
              ) : null}
            </div>
            {/* Create a new role for the selected org (SUPERADMIN) */}
            {orgId ? (
              <div className="px-3 py-2 border-b border-[var(--rf-border)] flex gap-2">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createRole();
                  }}
                  placeholder="New role name…"
                  disabled={roleBusy}
                  className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded-md border border-[var(--rf-border)] bg-[var(--rf-bg)] text-[var(--rf-txt)]"
                />
                <button
                  type="button"
                  onClick={createRole}
                  disabled={roleBusy || !newRoleName.trim()}
                  className="px-3 py-1.5 text-sm font-semibold rounded-md text-white disabled:opacity-50"
                  style={{ background: "var(--rf-accent)" }}
                >
                  Add
                </button>
              </div>
            ) : null}
            {roleError ? (
              <div className="px-3 py-2 text-xs text-[var(--rf-red)]">
                {roleError}
              </div>
            ) : null}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {loading ? (
                <div className="p-4 text-sm text-[var(--rf-txt3)]">Loading…</div>
              ) : roles.length === 0 ? (
                <div className="p-4 text-sm text-[var(--rf-txt3)]">
                  No roles found.
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="p-4 text-sm text-[var(--rf-txt3)]">
                  No roles match &ldquo;{roleSearch}&rdquo;.
                </div>
              ) : (
                filteredRoles.map((r) => {
                  const active = r.id === selectedRoleId;
                  const confirming = confirmDeleteId === r.id;
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-1 mb-1 rounded-lg"
                      style={{
                        background: active ? "var(--rf-accent)" : "transparent",
                      }}
                    >
                      <button
                        onClick={() => setSelectedRoleId(r.id)}
                        className="flex-1 min-w-0 text-left px-3 py-2.5 transition-colors"
                        style={{ color: active ? "#fff" : "var(--rf-txt)" }}
                      >
                        <div className="text-sm font-semibold truncate">
                          {r.name}
                        </div>
                      </button>
                      {confirming ? (
                        <div className="flex items-center gap-1 pr-2">
                          <button
                            onClick={() => deleteRole(r.id)}
                            disabled={roleBusy}
                            className="px-2 py-1 text-xs font-semibold rounded text-white disabled:opacity-50"
                            style={{ background: "var(--rf-red)" }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs rounded"
                            style={{ color: active ? "#fff" : "var(--rf-txt2)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(r.id)}
                          title="Delete role"
                          className="px-2 py-1 mr-1 text-xs rounded opacity-70 hover:opacity-100"
                          style={{ color: active ? "#fff" : "var(--rf-txt3)" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Matrix */}
          <div className={`${CARD_CLS} overflow-hidden flex flex-col`}>
            <div className="px-5 py-4 border-b border-[var(--rf-border)] bg-[var(--rf-bg3)]/40 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-base font-bold text-[var(--rf-txt)]">
                  {selectedRole?.name || "Select a role"}
                </div>
                <div className="text-xs text-[var(--rf-txt2)]">
                  {changedModules.length > 0
                    ? `${changedModules.length} unsaved change(s)`
                    : "Module actions for this role"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={BTN_GHOST}
                  onClick={discardGrants}
                  disabled={changedModules.length === 0 || saving}
                >
                  Discard
                </button>
                <button
                  className={BTN_PRIMARY}
                  onClick={saveGrants}
                  disabled={changedModules.length === 0 || saving}
                >
                  {saving
                    ? "Saving…"
                    : `Save${changedModules.length ? ` (${changedModules.length})` : ""}`}
                </button>
              </div>
            </div>

            {batchError && (
              <div
                className="mx-5 mt-4 rounded-xl px-4 py-3 text-sm"
                style={{
                  color: "var(--rf-red)",
                  background:
                    "color-mix(in srgb, var(--rf-red) 10%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--rf-red) 30%, transparent)",
                }}
              >
                {batchError}
              </div>
            )}

            <div className="flex-1 overflow-auto max-h-[62vh]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--rf-accent)] z-10">
                  <tr>
                    <th className={TH_CLS}>Module</th>
                    {TENANT_ACTIONS.map((a) => (
                      <th key={a} className={`${TH_CLS} text-center`}>
                        {a}
                      </th>
                    ))}
                    <th className={`${TH_CLS} text-right`}>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {grantable.map((mk, i) => {
                    const acts = staged[mk] || [];
                    const lvl = deriveLevel(acts);
                    const badge = LEVEL_BADGE[lvl];
                    const changed = !sameSet(original[mk] || [], acts);
                    return (
                      <tr
                        key={mk}
                        className="border-t border-[var(--rf-border)]"
                        style={{
                          background:
                            i % 2 === 1
                              ? "color-mix(in srgb, var(--rf-bg3) 35%, transparent)"
                              : "transparent",
                        }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--rf-txt)]">
                              {moduleLabel(mk)}
                            </span>
                            {changed && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-[var(--rf-accent)]"
                                title="Unsaved change"
                              />
                            )}
                          </div>
                          <div className="text-xs text-[var(--rf-txt3)] font-mono">
                            {mk}
                          </div>
                        </td>
                        {TENANT_ACTIONS.map((a) => (
                          <td key={a} className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              className={CHECKBOX_CLS}
                              checked={acts.includes(a)}
                              onChange={() => toggle(mk, a)}
                            />
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right">
                          <span
                            className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded"
                            style={{
                              background: `color-mix(in srgb, ${badge.color} 16%, transparent)`,
                              color: badge.color,
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        // ── Roles → Users ──
        <div className={`${CARD_CLS} overflow-hidden`}>
          <div className="px-5 py-4 border-b border-[var(--rf-border)] bg-[var(--rf-bg3)]/40 flex items-end gap-3 flex-wrap">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--rf-txt3)]">
                Role to set
              </label>
              <select
                value={assignRoleId}
                onChange={(e) => setAssignRoleId(e.target.value)}
                className={SELECT_CLS}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              className={BTN_PRIMARY}
              onClick={assignUsers}
              disabled={selectedUserIds.length === 0 || busy}
            >
              Set role {selectedUserIds.length ? `(${selectedUserIds.length})` : ""}
            </button>
            <button
              className={BTN_DANGER}
              onClick={revokeUsers}
              disabled={selectedUserIds.length === 0 || busy}
            >
              Remove from org
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--rf-accent)]">
                <tr>
                  <th className={`${TH_CLS} w-10`} />
                  <th className={TH_CLS}>User</th>
                  <th className={TH_CLS}>Current Role</th>
                  <th className={`${TH_CLS} text-right`}>Result</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-sm text-[var(--rf-txt3)]"
                    >
                      No users in this organization.
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => {
                    const res = userResults[u.id];
                    return (
                      <tr
                        key={u.id}
                        className="border-t border-[var(--rf-border)]"
                        style={{
                          background:
                            i % 2 === 1
                              ? "color-mix(in srgb, var(--rf-bg3) 35%, transparent)"
                              : "transparent",
                        }}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            className={CHECKBOX_CLS}
                            checked={selectedUserIds.includes(u.id)}
                            onChange={() => toggleUser(u.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[var(--rf-txt)]">
                            {userName(u)}
                          </div>
                          <div className="text-xs text-[var(--rf-txt3)]">
                            {u.email}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--rf-txt2)]">
                          {u.roleName || "—"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {res ? (
                            <span
                              className="inline-flex items-center text-xs font-medium px-2 py-1 rounded"
                              style={{
                                background: `color-mix(in srgb, ${res.danger ? "var(--rf-red)" : "var(--rf-green)"} 14%, transparent)`,
                                color: res.danger
                                  ? "var(--rf-red)"
                                  : "var(--rf-green)",
                              }}
                            >
                              {res.text}
                            </span>
                          ) : (
                            <span className="text-[var(--rf-txt3)]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
