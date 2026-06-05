"use client";

// ── RBAC Admin — Assign roles to users (org admin) ───────────────────────────
// One role per org. Assigning REPLACES the user's current role; revoking removes
// it (zero roles → fails closed until reassigned). All-or-nothing batches.
// On a 400 the server returns only a summary message (no per-pair detail), so we
// render results[] notes/verdicts only on the 200 success response.

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearTokens } from "@/services/instance/tokenService";
import {
  listRoles,
  listRbacUsers,
  orgAssignUserRoles,
  orgRevokeUserRoles,
  errorBody,
  prettyUserReason,
  MAX_USER_ROLE_PAIRS,
} from "@/services/RbacAdmin";
import { useRealtimeSocket } from "@/lib/realtime/useRealtimeSocket";
import { onEnvelope } from "@/lib/realtime/envelope";
import { isSuperUser } from "@/Utils/rbac";

const userName = (u) =>
  u?.name ||
  `${u?.firstName || ""} ${u?.lastName || ""}`.trim() ||
  u?.email ||
  "Unknown";
const userRoleLabel = (u) =>
  u?.roleName || u?.role?.name || u?.role || u?.activeRole?.name || "";

const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();

export default function AssignRolesToUsers() {
  const router = useRouter();
  const socket = useRealtimeSocket();

  // Platform users (SUPERADMIN) have no org context — org-scoped role assignment
  // would 403 / NO_CALLER_ORG. Route them to the platform RBAC screen instead.
  useEffect(() => {
    let u = null;
    try {
      u = JSON.parse(getUser() ?? "null");
    } catch {
      u = null;
    }
    if (isSuperUser(u)) router.replace("/PlatformRbac");
  }, [router]);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminOnly, setAdminOnly] = useState(false);

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState({}); // userId -> { danger, text } (200 only)
  const [message, setMessage] = useState({ type: "", text: "" });
  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [selfReauth, setSelfReauth] = useState(false);

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage((c) => (c.text === text ? { type: "", text: "" } : c)), 6000);
  };

  useEffect(() => {
    try {
      const raw = getUser();
      if (raw) setCurrentUserId(JSON.parse(raw)?.id || null);
    } catch {
      setCurrentUserId(null);
    }
  }, []);

  // ── Load roles + users ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rolesRes, usersRes] = await Promise.all([listRoles(), listRbacUsers()]);
      const roleList = Array.isArray(rolesRes) ? rolesRes : rolesRes?.data || rolesRes?.roles || [];
      const userList = Array.isArray(usersRes) ? usersRes : usersRes?.data || usersRes?.users || [];
      setRoles(roleList);
      setUsers(userList);
      setSelectedRoleId((cur) => cur || roleList[0]?.id || "");
      setAdminOnly(false);
    } catch (err) {
      if ((err?.statusCode || err?.status) === 403) setAdminOnly(true);
      else flash("error", errorBody(err)?.message || "Failed to load roles/users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Realtime: a role change on the current user invalidates their session ──
  useEffect(() => {
    if (!socket) return;
    const off = onEnvelope(socket, "user.role.changed", ({ data }) => {
      const uid = data?.userId || data?.id;
      if (uid && uid === currentUserId) setSelfReauth(true);
      load();
    });
    return () => off();
  }, [socket, currentUserId, load]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        userName(u).toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        userRoleLabel(u).toLowerCase().includes(q)
    );
  }, [users, search]);

  const allSelected =
    filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id));

  const toggleAll = () =>
    setSelectedUserIds(allSelected ? [] : filteredUsers.map((u) => u.id));

  const toggleOne = (id) =>
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // Render per-user verdicts/notes — ONLY called on a 200 response.
  const renderResults = (resArr) => {
    const next = {};
    let touchedSelf = false;
    (resArr || []).forEach((r) => {
      if (r.status === "REJECTED") {
        next[r.userId] = { danger: true, text: prettyUserReason(r.reason) };
      } else {
        next[r.userId] = {
          danger: !r.resultingRoleId,
          text: r.note || (r.resultingRoleId ? "Role set." : "No role — access revoked."),
        };
      }
      if (r.userId === currentUserId) touchedSelf = true;
    });
    setResults((prev) => ({ ...prev, ...next }));
    if (touchedSelf) setSelfReauth(true);
  };

  // ── Assign (replace) ───────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!selectedRoleId || selectedUserIds.length === 0 || busy) return;
    if (selectedUserIds.length > MAX_USER_ROLE_PAIRS) {
      flash("error", `Too many users (${selectedUserIds.length}). Limit is ${MAX_USER_ROLE_PAIRS}.`);
      return;
    }
    setBusy(true);
    setResults({});
    const assignments = selectedUserIds.map((userId) => ({ userId, roleId: selectedRoleId }));
    try {
      const res = await orgAssignUserRoles(assignments);
      renderResults(res?.results);
      flash("success", `Assigned to ${res?.applied ?? assignments.length} user(s).`);
    } catch (err) {
      // 400 → nothing applied (all-or-nothing). The backend now forwards per-pair
      // `results`, so mark each rejected user with its reason.
      const body = errorBody(err);
      if (body?.results?.length) renderResults(body.results);
      flash("error", body?.message || "Batch rejected — no changes applied.");
    } finally {
      setBusy(false);
    }
  };

  // ── Revoke (→ zero roles) ──────────────────────────────────────────────────
  const handleRevoke = async () => {
    setConfirmRevoke(false);
    if (selectedUserIds.length === 0 || busy) return;
    setBusy(true);
    setResults({});
    try {
      const res = await orgRevokeUserRoles(selectedUserIds);
      renderResults(res?.results);
      flash("success", `Revoked ${res?.applied ?? selectedUserIds.length} user(s).`);
    } catch (err) {
      const body = errorBody(err);
      if (body?.results?.length) renderResults(body.results);
      flash("error", body?.message || "Batch rejected — no changes applied.");
    } finally {
      setBusy(false);
    }
  };

  const reauth = () => {
    clearTokens();
    window.location.assign("/");
  };

  if (adminOnly) {
    return (
      <div className="font-gilroy py-6 px-7 text-[var(--rf-txt)]">
        <div className="max-w-md mx-auto text-center mt-20 rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] p-10">
          <h2 className="text-lg font-bold text-[var(--rf-txt)] mb-1">Admin access required</h2>
          <p className="text-sm text-[var(--rf-txt2)]">
            Only your organization&apos;s designated admin can assign roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-gilroy flex flex-col py-6 px-7 text-[var(--rf-txt)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/Permissions")}
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-[var(--rf-border2)] text-[var(--rf-txt2)] hover:text-[var(--rf-txt)] hover:border-[var(--rf-accent)] transition-colors"
          aria-label="Back to Roles & Access"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--rf-txt)]">
            Assign Roles to Users
          </h1>
          <p className="text-sm text-[var(--rf-txt2)]">
            One role per user. Assigning <strong>replaces</strong> their current role; revoking removes it.
          </p>
        </div>
      </div>

      {/* Self re-auth banner */}
      {selfReauth && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm border text-[var(--rf-yellow)] border-[var(--rf-yellow)]/40 bg-[var(--rf-yellow)]/10 flex items-center justify-between gap-3">
          <span>Your own role changed — sign in again to refresh your access.</span>
          <button
            onClick={reauth}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--rf-bg)] bg-[var(--rf-yellow)] whitespace-nowrap"
          >
            Sign in again
          </button>
        </div>
      )}

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

      {/* Action bar */}
      <div className="rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] p-4 mb-5 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold uppercase tracking-widest text-[var(--rf-txt3)] mb-2">
            Role to set
          </label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] text-sm focus:border-[var(--rf-accent)] focus:outline-none"
          >
            {roles.length === 0 && <option value="">No roles available</option>}
            {roles.map((r) => (
              <option key={r.id} value={r.id} className="bg-[var(--rf-bg2)] text-[var(--rf-txt)]">
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAssign}
            disabled={!selectedRoleId || selectedUserIds.length === 0 || busy}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[var(--rf-bg)] bg-[var(--rf-accent)] hover:bg-[var(--rf-accent2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {busy ? "Working…" : `Set role${selectedUserIds.length ? ` (${selectedUserIds.length})` : ""}`}
          </button>
          <button
            onClick={() => setConfirmRevoke(true)}
            disabled={selectedUserIds.length === 0 || busy}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-[var(--rf-red)] border border-[var(--rf-red)]/40 hover:bg-[var(--rf-red)]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Remove from org
          </button>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--rf-border)] bg-[var(--rf-bg3)]/40 flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email or role…"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--rf-bg3)] border border-[var(--rf-border2)] text-[var(--rf-txt)] placeholder-[var(--rf-txt3)] focus:border-[var(--rf-accent)] focus:outline-none"
          />
          <span className="text-sm text-[var(--rf-txt2)] whitespace-nowrap">
            <span className="font-semibold text-[var(--rf-txt)]">{selectedUserIds.length}</span> selected
          </span>
        </div>

        <div className="overflow-x-auto max-h-[58vh]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--rf-bg3)] sticky top-0">
              <tr>
                <th className="w-12 py-3 px-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="checkbox checkbox-sm border-[var(--rf-border2)] [--chkbg:var(--rf-accent)]"
                  />
                </th>
                <th className="text-left py-3 px-4 text-[var(--rf-txt3)] font-semibold text-xs uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-3 px-4 text-[var(--rf-txt3)] font-semibold text-xs uppercase tracking-wider">
                  Current role
                </th>
                <th className="text-left py-3 px-4 text-[var(--rf-txt3)] font-semibold text-xs uppercase tracking-wider">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="100%" className="py-12 text-center text-[var(--rf-txt3)]">
                    Loading users…
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="100%" className="py-12 text-center text-[var(--rf-txt3)]">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const name = userName(u);
                  const res = results[u.id];
                  const isSelf = u.id === currentUserId;
                  return (
                    <tr
                      key={u.id}
                      className="border-t border-[var(--rf-border)] hover:bg-[var(--rf-bg3)]/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(u.id)}
                          onChange={() => toggleOne(u.id)}
                          className="checkbox checkbox-sm border-[var(--rf-border2)] [--chkbg:var(--rf-accent)]"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold uppercase text-[var(--rf-bg)]"
                            style={{
                              background:
                                "linear-gradient(135deg, var(--rf-accent), var(--rf-purple))",
                            }}
                          >
                            {initials(name)}
                          </div>
                          <div>
                            <div className="font-medium text-[var(--rf-txt)] flex items-center gap-1.5">
                              {name}
                              {isSelf && (
                                <span className="text-[10px] text-[var(--rf-txt3)]">(you)</span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--rf-txt3)]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {userRoleLabel(u) ? (
                          <span className="capitalize text-[var(--rf-txt2)]">{userRoleLabel(u)}</span>
                        ) : (
                          <span className="text-[var(--rf-txt3)]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {res ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: res.danger ? "var(--rf-red)" : "var(--rf-green)" }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: res.danger ? "var(--rf-red)" : "var(--rf-green)" }}
                            />
                            {res.text}
                          </span>
                        ) : (
                          <span className="text-[var(--rf-txt3)] text-xs">—</span>
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

      {/* Revoke confirmation */}
      {confirmRevoke && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setConfirmRevoke(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-[var(--rf-bg2)] border border-[var(--rf-border)] p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--rf-txt)] mb-2">Remove organization access?</h3>
            <p className="text-sm text-[var(--rf-txt2)] mb-5 leading-relaxed">
              <span className="font-semibold text-[var(--rf-txt)]">{selectedUserIds.length}</span> user(s)
              will have <span className="font-semibold">no role</span> in this organization and will lose
              all access until a role is reassigned.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmRevoke(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--rf-border2)] text-[var(--rf-txt2)] hover:text-[var(--rf-txt)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-[var(--rf-bg)] bg-[var(--rf-red)] hover:bg-[var(--rf-red2)]"
              >
                Remove access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
