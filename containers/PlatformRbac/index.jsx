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

  // load roles + grantable when org changes
  useEffect(() => {
    if (allowed !== true || !orgId) return;
    (async () => {
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
    })();
  }, [allowed, orgId]);

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
  if (allowed === null) return <div style={{ padding: 24 }}>Loading…</div>;
  if (allowed === false)
    return (
      <div style={{ padding: 48, textAlign: "center" }}>
        <div className="rf-card" style={{ maxWidth: 420, margin: "0 auto", padding: 32 }}>
          <h3>Platform access required</h3>
          <p style={{ color: "var(--rf-txt3)" }}>Only platform super-admins can manage cross-organization RBAC.</p>
        </div>
      </div>
    );

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700 }}>Platform RBAC</h1>
      <p style={{ color: "var(--rf-txt3)", marginTop: 4 }}>
        Manage roles &amp; access across any organization. Changes apply all-or-nothing.
      </p>

      {/* org picker */}
      <div style={{ margin: "16px 0", display: "flex", gap: 12, alignItems: "center" }}>
        <label style={{ fontSize: 12, letterSpacing: 1, color: "var(--rf-txt3)" }}>ORGANIZATION</label>
        <select
          value={orgId}
          onChange={(e) => setOrgId(e.target.value)}
          disabled={orgsLoading}
          style={{ padding: "8px 12px", borderRadius: 6, minWidth: 280 }}
        >
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name} {o.type ? `(${o.type})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button className={`rf-btn ${tab === "modules" ? "rf-btn-primary" : ""}`} onClick={() => setTab("modules")}>
          Modules → Roles
        </button>
        <button className={`rf-btn ${tab === "users" ? "rf-btn-primary" : ""}`} onClick={() => setTab("users")}>
          Roles → Users
        </button>
      </div>

      {flash && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            marginBottom: 12,
            background: flash.type === "success" ? "var(--rf-green-bg, #e8f5e9)" : "var(--rf-red-bg, #fdecea)",
            color: flash.type === "success" ? "var(--rf-green)" : "var(--rf-red)",
          }}
        >
          {flash.text}
        </div>
      )}

      {tab === "modules" ? (
        <div style={{ display: "flex", gap: 16 }}>
          {/* roles list */}
          <div className="rf-card" style={{ width: 280, padding: 12, maxHeight: 560, overflow: "auto" }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Roles</div>
            {loading ? (
              <div>Loading…</div>
            ) : (
              roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                    background: r.id === selectedRoleId ? "var(--rf-accent, #2563eb)" : "transparent",
                    color: r.id === selectedRoleId ? "#fff" : "inherit",
                  }}
                >
                  {r.name}
                </div>
              ))
            )}
          </div>

          {/* matrix */}
          <div className="rf-card" style={{ flex: 1, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700 }}>{selectedRole?.name || "—"}</div>
              <button
                className="rf-btn rf-btn-primary"
                onClick={saveGrants}
                disabled={changedModules.length === 0 || saving}
              >
                {saving ? "Saving…" : `Save${changedModules.length ? ` (${changedModules.length})` : ""}`}
              </button>
            </div>
            {batchError && (
              <div style={{ marginTop: 8, color: "var(--rf-red)", fontSize: 13 }}>{batchError}</div>
            )}
            <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", fontSize: 11, color: "var(--rf-txt3)" }}>
                  <th style={{ padding: 8 }}>MODULE</th>
                  {TENANT_ACTIONS.map((a) => (
                    <th key={a} style={{ padding: 8, textTransform: "uppercase" }}>{a}</th>
                  ))}
                  <th style={{ padding: 8, textAlign: "right" }}>LEVEL</th>
                </tr>
              </thead>
              <tbody>
                {grantable.map((mk) => {
                  const acts = staged[mk] || [];
                  const lvl = deriveLevel(acts);
                  const badge = LEVEL_BADGE[lvl];
                  const changed = !sameSet(original[mk] || [], acts);
                  return (
                    <tr key={mk} style={{ borderTop: "1px solid var(--rf-border, #eee)" }}>
                      <td style={{ padding: 8 }}>
                        {moduleLabel(mk)} {changed ? <span style={{ color: "var(--rf-accent)" }}>•</span> : null}
                        <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>{mk}</div>
                      </td>
                      {TENANT_ACTIONS.map((a) => (
                        <td key={a} style={{ padding: 8 }}>
                          <input type="checkbox" checked={acts.includes(a)} onChange={() => toggle(mk, a)} />
                        </td>
                      ))}
                      <td style={{ padding: 8, textAlign: "right", color: badge.color, fontSize: 12 }}>
                        {badge.label}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // ── Roles → Users ──
        <div className="rf-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "var(--rf-txt3)" }}>ROLE TO SET</label>
            <select value={assignRoleId} onChange={(e) => setAssignRoleId(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6 }}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button className="rf-btn rf-btn-primary" onClick={assignUsers} disabled={selectedUserIds.length === 0 || busy}>
              Set role {selectedUserIds.length ? `(${selectedUserIds.length})` : ""}
            </button>
            <button className="rf-btn" onClick={revokeUsers} disabled={selectedUserIds.length === 0 || busy} style={{ color: "var(--rf-red)" }}>
              Remove from org
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", fontSize: 11, color: "var(--rf-txt3)" }}>
                <th style={{ padding: 8 }} />
                <th style={{ padding: 8 }}>USER</th>
                <th style={{ padding: 8 }}>CURRENT ROLE</th>
                <th style={{ padding: 8, textAlign: "right" }}>RESULT</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: "1px solid var(--rf-border, #eee)" }}>
                  <td style={{ padding: 8 }}>
                    <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUser(u.id)} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <div style={{ fontWeight: 600 }}>{userName(u)}</div>
                    <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>{u.email}</div>
                  </td>
                  <td style={{ padding: 8 }}>{u.roleName || "—"}</td>
                  <td style={{ padding: 8, textAlign: "right", color: userResults[u.id]?.danger ? "var(--rf-red)" : "var(--rf-green)", fontSize: 13 }}>
                    {userResults[u.id]?.text || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
