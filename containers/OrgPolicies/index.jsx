"use client";

// ── Phase 5 PR-6: Operational policies admin ─────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import {
  listOrgPolicies,
  upsertOrgPolicy,
  setOrgPolicyActive,
  ORG_POLICY_TYPES,
  ORG_POLICY_HINT,
} from "@/services/OrgPolicies";
import PolicyVersionDrawer from "@/components/PolicyVersionDrawer";

const empty = () => ({
  policyType: "SLA",
  key: "",
  config: {},
  isActive: true,
});

export default function OrgPoliciesAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ policyType: "", isActive: "" });
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [draft, setDraft] = useState(empty());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filter.policyType) params.policyType = filter.policyType;
      if (filter.isActive !== "") params.isActive = filter.isActive;
      const xs = await listOrgPolicies(params);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load policies");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = async () => {
    try {
      await upsertOrgPolicy({
        policyType: draft.policyType,
        key: draft.key,
        config: draft.config,
        isActive: !!draft.isActive,
      });
      setEditing(null);
      setDraft(empty());
      await refresh();
    } catch (e) {
      setError(e?.message || "Save failed");
    }
  };

  const toggle = async (row) => {
    try {
      await setOrgPolicyActive(row.id, !row.isActive);
      await refresh();
    } catch (e) {
      setError(e?.message || "Toggle failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Operational policies
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Versioned configuration consumed by automation, approvals,
            escalation and turnover gates.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => {
            setDraft(empty());
            setEditing("new");
          }}
        >
          + New policy
        </button>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          className="rf-input"
          value={filter.policyType}
          onChange={(e) =>
            setFilter({ ...filter, policyType: e.target.value })
          }
        >
          <option value="">All types</option>
          {ORG_POLICY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className="rf-input"
          value={filter.isActive}
          onChange={(e) =>
            setFilter({ ...filter, isActive: e.target.value })
          }
        >
          <option value="">Active + inactive</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No policies yet.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Type</th>
                <th style={th}>Key</th>
                <th style={th}>Version</th>
                <th style={th}>Active</th>
                <th style={th}>Created</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>{r.policyType}</td>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{r.key}</div>
                  </td>
                  <td style={td}>v{r.version}</td>
                  <td style={td}>{r.isActive ? "Yes" : "No"}</td>
                  <td style={td}>
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleString()
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...td,
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <button
                      className="rf-btn"
                      onClick={() => toggle(r)}
                      style={{ marginRight: 6 }}
                    >
                      {r.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="rf-btn"
                      onClick={() => {
                        setDraft({
                          policyType: r.policyType,
                          key: r.key,
                          config: r.config ?? {},
                          isActive: r.isActive,
                        });
                        setEditing(r.id);
                      }}
                    >
                      Edit (new version)
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div style={overlay} onClick={() => setEditing(null)}>
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 720, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              {editing === "new" ? "New policy" : "New version"}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <Field label="Type">
                <select
                  className="rf-input"
                  value={draft.policyType}
                  onChange={(e) =>
                    setDraft({ ...draft, policyType: e.target.value })
                  }
                >
                  {ORG_POLICY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Key">
                <input
                  className="rf-input"
                  value={draft.key}
                  onChange={(e) =>
                    setDraft({ ...draft, key: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label={`Config (JSON) — ${ORG_POLICY_HINT[draft.policyType]}`}>
              <textarea
                className="rf-input"
                rows={8}
                value={JSON.stringify(draft.config ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    setDraft({
                      ...draft,
                      config: JSON.parse(e.target.value || "{}"),
                    });
                  } catch {
                    /* swallow until valid */
                  }
                }}
              />
            </Field>
            {editing !== "new" && (
              <div style={{ marginTop: 12 }}>
                <PolicyVersionDrawer policyId={editing} />
              </div>
            )}
            <label
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                fontSize: 13,
                marginTop: 6,
              }}
            >
              <input
                type="checkbox"
                checked={!!draft.isActive}
                onChange={(e) =>
                  setDraft({ ...draft, isActive: e.target.checked })
                }
              />
              Active
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button className="rf-btn" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={save}
                disabled={!draft.key.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "var(--rf-txt3)",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--rf-txt3)",
  letterSpacing: 0.04,
};
const td = { padding: "10px 12px", fontSize: 13, color: "var(--rf-txt)" };
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 20,
};
