"use client";

// ── RBAC Admin — Role × Module grant matrix (org admin) ──────────────────────
// Rows = grantable modules, columns = the four tenant actions, plus a derived
// level badge. Stage checkbox changes for one role, then submit ONE batch.
// All-or-nothing: on a 400 the server returns only a summary message (no per-pair
// detail), so we mirror validation client-side and show a "review" banner.

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  listRoles,
  roleModules,
  orgGrantableModules,
  orgGrantModules,
  deriveLevel,
  levelToActions,
  sanitizeActions,
  errorBody,
  prettyReason,
  TENANT_ACTIONS,
  MAX_GRANT_PAIRS,
} from "@/services/RbacAdmin";
import { useRealtimeSocket } from "@/lib/realtime/useRealtimeSocket";
import { onEnvelope } from "@/lib/realtime/envelope";

const moduleLabel = (key) =>
  String(key || "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// Roles that resolve to the org's admin must be excluded from the picker
// (AUTHORITY_BOUND). We only exclude when the API actually flags it.
const isAdminRole = (r) =>
  Boolean(r?.isAdmin ?? r?.isAdminRole ?? r?.adminRole ?? r?.isResolvedAdmin);

const sameSet = (a, b) => {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
};

const LEVEL_BADGE = {
  hidden: { label: "No access", color: "var(--rf-txt3)" },
  "read-only": { label: "Read-only", color: "var(--rf-yellow)" },
  full: { label: "Full", color: "var(--rf-green)" },
};

export default function ModuleGrantMatrix() {
  const router = useRouter();
  const socket = useRealtimeSocket();

  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [adminOnly, setAdminOnly] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);

  const [grantable, setGrantable] = useState([]); // authoritative editable columns
  const [grantableLoaded, setGrantableLoaded] = useState(false);
  const [original, setOriginal] = useState({}); // moduleKey -> actions[] (server truth)
  const [draft, setDraft] = useState({}); // moduleKey -> actions[]
  const [modulesLoading, setModulesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [batchError, setBatchError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [roleSearch, setRoleSearch] = useState("");
  const [moduleSearch, setModuleSearch] = useState("");

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(
      () => setMessage((c) => (c.text === text ? { type: "", text: "" } : c)),
      5000,
    );
  };

  // ── Load roles + grantable modules ─────────────────────────────────────────
  const loadRoles = useCallback(async () => {
    setRolesLoading(true);
    try {
      const res = await listRoles();
      const raw = Array.isArray(res) ? res : res?.data || res?.roles || [];

      const selectable = raw.filter((r) => !isAdminRole(r)); // exclude admin role
      setRoles(selectable);
      setSelectedRoleId((cur) =>
        selectable.some((r) => r.id === cur)
          ? cur
          : (selectable[0]?.id ?? null),
      );
      setAdminOnly(false);
    } catch (err) {

      if ((err?.statusCode || err?.status) === 403) setAdminOnly(true);
      else flash("error", errorBody(err)?.message || "Failed to load roles");
      setRoles([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
    (async () => {
      try {
        const res = await orgGrantableModules();
        const mods = Array.isArray(res) ? res : res?.modules || [];
        setGrantable(mods.map((m) => String(m).toLowerCase()));
      } catch {
        setGrantable([]);
      } finally {
        setGrantableLoaded(true);
      }
    })();
  }, [loadRoles]);

  // ── Load the selected role's current grants → pre-fill the matrix ──────────
  const loadRoleModules = useCallback(async (roleId) => {
    if (!roleId) {
      setOriginal({});
      setDraft({});
      return;
    }
    setModulesLoading(true);
    setBatchError("");
    try {
      const res = await roleModules(roleId);
      const perms = res?.permissions || res?.data?.permissions || [];
      const map = {};
      for (const p of perms) {
        if (!p?.moduleKey) continue;
        let acts = sanitizeActions(p.allowedActions);
        if (acts.length === 0 && p.permissionLevel)
          acts = levelToActions(p.permissionLevel);
        map[p.moduleKey] = acts;
      }
      setOriginal(map);
      setDraft(map);
    } catch (err) {
      setOriginal({});
      setDraft({});
      flash("error", errorBody(err)?.message || "Failed to load role modules");
    } finally {
      setModulesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoleModules(selectedRoleId);
  }, [selectedRoleId, loadRoleModules]);

  // ── Realtime cache-bust: refetch when this role's grants change ────────────
  useEffect(() => {
    if (!socket) return;
    const off = onEnvelope(
      socket,
      "role.module.permissions.updated",
      ({ data }) => {
        const roleId = data?.roleId || data?.id;
        if (roleId && roleId === selectedRoleId)
          loadRoleModules(selectedRoleId);
      },
    );
    return () => off();
  }, [socket, selectedRoleId, loadRoleModules]);

  // ── Module rows: grantable plan modules ∪ any module the role already has ──
  const moduleRows = useMemo(() => {
    const set = new Set(grantable);
    Object.keys(original).forEach((k) => set.add(k)); // keep existing grants revocable
    let list = [...set];
    const q = moduleSearch.trim().toLowerCase();
    if (q)
      list = list.filter(
        (k) => k.includes(q) || moduleLabel(k).toLowerCase().includes(q),
      );
    return list.sort((a, b) => moduleLabel(a).localeCompare(moduleLabel(b)));
  }, [grantable, original, moduleSearch]);

  const actionsOf = (key) => draft[key] || [];

  const toggle = (key, action) => {
    setBatchError("");
    setDraft((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(action)
        ? cur.filter((a) => a !== action)
        : [...cur, action];
      return { ...prev, [key]: next };
    });
  };

  // Only modules whose action set diverges from server truth.
  const changes = useMemo(() => {
    const keys = new Set([...Object.keys(draft), ...Object.keys(original)]);
    const out = [];
    for (const key of keys) {
      const d = draft[key] || [];
      const o = original[key] || [];
      if (!sameSet(d, o)) out.push(key);
    }
    return out;
  }, [draft, original]);

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q),
    );
  }, [roles, roleSearch]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  const discard = () => {
    setDraft(original);
    setBatchError("");
  };

  // ── Submit changed cells as one all-or-nothing batch ───────────────────────
  const save = async () => {
    if (!selectedRoleId || changes.length === 0 || saving) return;
    if (changes.length > MAX_GRANT_PAIRS) {
      flash(
        "error",
        `Too many changes (${changes.length}). Limit is ${MAX_GRANT_PAIRS} per save.`,
      );
      return;
    }
    setSaving(true);
    setBatchError("");
    const grants = changes.map((moduleKey) => ({
      roleId: selectedRoleId,
      moduleKey,
      allowedActions: sanitizeActions(draft[moduleKey]), // [] → revoke
    }));
    try {
      const res = await orgGrantModules({ grants });
      flash("success", `Updated ${res?.applied ?? grants.length} grant(s).`);
      await loadRoleModules(selectedRoleId); // refetch server truth
    } catch (err) {
      // 400 → nothing was written (all-or-nothing). The backend now forwards the
      // per-pair `results`, so surface exactly which module(s) were rejected and
      // why. Staged changes are preserved so the admin can adjust and retry.
      const body = errorBody(err);
      const rejected = (body?.results || []).filter(
        (r) => r?.status === "REJECTED",
      );
      if (rejected.length) {
        const detail = rejected
          .map((r) => `${moduleLabel(r.moduleKey)}: ${prettyReason(r.reason)}`)
          .join(" · ");
        setBatchError(`No changes applied. ${detail}`);
      } else {
        setBatchError(
          body?.message ||
            "No changes were applied. Review your selections (plan-included modules and valid actions) and retry.",
        );
      }
      flash("error", "Batch rejected — no changes applied.");
    } finally {
      setSaving(false);
    }
  };

  // ── Admin-only / no-plan states ────────────────────────────────────────────
  if (adminOnly) {
    return (
      <div className="font-gilroy py-6 px-7 text-[var(--rf-txt)]">
        <div className="max-w-md mx-auto text-center mt-20 rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] p-10">
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
          <h2 className="text-lg font-bold text-[var(--rf-txt)] mb-1">
            Admin access required
          </h2>
          <p className="text-sm text-[var(--rf-txt2)]">
            Only your organization&apos;s designated admin can manage roles
            &amp; access.
          </p>
        </div>
      </div>
    );
  }

  const noPlanModules = grantableLoaded && grantable.length === 0;

  return (
    <div className="font-gilroy flex flex-col py-6 px-7 text-[var(--rf-txt)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--rf-txt)]">
            Roles &amp; Access
          </h1>
          <p className="text-sm text-[var(--rf-txt2)]">
            Grant or revoke module actions per role. Changes apply
            all-or-nothing.
          </p>
        </div>
        <button
          onClick={() => router.push("/Permissions/Add")}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--rf-bg2)] border border-[var(--rf-border2)] text-[var(--rf-txt)] font-semibold text-sm hover:border-[var(--rf-accent)] transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-3-6.7"
            />
          </svg>
          Assign Roles to Users
        </button>
      </div>

      {/* Toast */}
      {message.text && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium border ${
            message.type === "success"
              ? "text-[var(--rf-green)] border-[var(--rf-green)]/40 bg-[var(--rf-green)]/10"
              : "text-[var(--rf-red)] border-[var(--rf-red)]/40 bg-[var(--rf-red)]/10"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* ── Role list ──────────────────────────────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] overflow-hidden h-fit">
          <div className="px-4 py-3 border-b border-[var(--rf-border)] bg-[var(--rf-bg3)]/40">
            <div className="text-sm font-bold text-[var(--rf-txt)] mb-2">
              Roles
            </div>
            <input
              type="text"
              value={roleSearch}
              onChange={(e) => setRoleSearch(e.target.value)}
              placeholder="Search roles…"
              className="w-full px-3 py-2 text-sm rounded-lg bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] placeholder-[var(--rf-txt3)] focus:border-[var(--rf-accent)] focus:outline-none"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {rolesLoading ? (
              <div className="p-4 text-sm text-[var(--rf-txt3)]">
                Loading roles…
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="p-4 text-sm text-[var(--rf-txt3)]">
                No roles found.
              </div>
            ) : (
              filteredRoles.map((r) => {
                const active = r.id === selectedRoleId;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoleId(r.id)}
                    className="w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors"
                    style={{
                      background: active ? "var(--rf-accent)" : "transparent",
                      color: active ? "var(--rf-bg)" : "var(--rf-txt)",
                    }}
                  >
                    <div className="text-sm font-semibold truncate">
                      {r.name}
                    </div>
                    {r.description && (
                      <div
                        className="text-xs truncate mt-0.5"
                        style={{
                          color: active
                            ? "rgba(255,255,255,0.8)"
                            : "var(--rf-txt3)",
                        }}
                      >
                        {r.description}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Action matrix for the selected role ────────────────────────────── */}
        <div className="rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--rf-border)] bg-[var(--rf-bg3)]/40 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-base font-bold text-[var(--rf-txt)]">
                {selectedRole ? selectedRole.name : "Select a role"}
              </div>
              <div className="text-xs text-[var(--rf-txt2)]">
                {changes.length > 0
                  ? `${changes.length} unsaved change(s)`
                  : "Module actions for this role"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                placeholder="Search modules…"
                className="px-3 py-2 text-sm rounded-lg bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] placeholder-[var(--rf-txt3)] focus:border-[var(--rf-accent)] focus:outline-none"
              />
              <button
                onClick={discard}
                disabled={changes.length === 0 || saving}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--rf-border2)] text-[var(--rf-txt2)] hover:text-[var(--rf-txt)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Discard
              </button>
              <button
                onClick={save}
                disabled={changes.length === 0 || saving}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-[var(--rf-bg)] bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {saving
                  ? "Saving…"
                  : `Save${changes.length ? ` (${changes.length})` : ""}`}
              </button>
            </div>
          </div>

          {/* Batch rejection banner (400 — no per-pair detail available) */}
          {batchError && (
            <div className="mx-5 mt-4 rounded-xl px-4 py-3 text-sm text-[var(--rf-red)] border border-[var(--rf-red)]/30 bg-[var(--rf-red)]/10">
              {batchError}
            </div>
          )}

          <div className="flex-1 overflow-auto max-h-[62vh]">
            {!selectedRoleId ? (
              <div className="p-10 text-center text-sm text-[var(--rf-txt3)]">
                Pick a role to manage its module access.
              </div>
            ) : modulesLoading ? (
              <div className="p-10 text-center text-sm text-[var(--rf-txt3)]">
                Loading modules…
              </div>
            ) : noPlanModules && moduleRows.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--rf-txt3)]">
                No grantable modules — the organization has no active plan, or
                its plan includes no modules.
              </div>
            ) : moduleRows.length === 0 ? (
              <div className="p-10 text-center text-sm text-[var(--rf-txt3)]">
                No modules found.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--rf-accent)] z-10">
                  <tr>
                    <th className="text-left py-3 px-5 text-white font-semibold text-xs uppercase tracking-wider">
                      Module
                    </th>
                    {TENANT_ACTIONS.map((a) => (
                      <th
                        key={a}
                        className="text-center py-3 px-3 text-white font-semibold text-xs uppercase tracking-wider"
                      >
                        {a}
                      </th>
                    ))}
                    <th className="text-right py-3 px-5 text-white font-semibold text-xs uppercase tracking-wider">
                      Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {moduleRows.map((key, i) => {
                    const acts = actionsOf(key);
                    const level = deriveLevel(acts);
                    const badge = LEVEL_BADGE[level];
                    const changed = !sameSet(acts, original[key] || []);
                    const notInPlan =
                      grantableLoaded &&
                      grantable.length > 0 &&
                      !grantable.includes(key);
                    return (
                      <tr
                        key={key}
                        className="border-t border-[var(--rf-border)]"
                        style={{
                          background:
                            i % 2 === 1
                              ? "color-mix(in srgb, var(--rf-bg3) 35%, transparent)"
                              : "transparent",
                        }}
                      >
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--rf-txt)]">
                              {moduleLabel(key)}
                            </span>
                            {changed && (
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-[var(--rf-accent)]"
                                title="Unsaved change"
                              />
                            )}
                            {notInPlan && (
                              <span
                                className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                                style={{
                                  background:
                                    "color-mix(in srgb, var(--rf-yellow) 16%, transparent)",
                                  color: "var(--rf-yellow)",
                                }}
                                title="Not in the current plan — revoke only"
                              >
                                not in plan
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[var(--rf-txt3)] font-mono">
                            {key}
                          </div>
                        </td>
                        {TENANT_ACTIONS.map((a) => (
                          <td key={a} className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              // DaisyUI 5: --input-color drives the checked fill
                              // & border; `color` drives the checkmark (white).
                              className="checkbox checkbox-sm border-2 border-gray-400 text-white checked:[--input-color:var(--rf-green)] checked:border-[var(--rf-green)]"
                              checked={acts.includes(a)}
                              disabled={saving}
                              onChange={() => toggle(key, a)}
                            />
                          </td>
                        ))}
                        <td className="py-3 px-5 text-right">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
