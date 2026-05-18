"use client";

// Automation admin — Phase 5 PR-1
// Org-wide rule list + executions history. The rule editor is a 3-pane form
// (Trigger / Conditions / Actions) — kept declarative; no client-side rule
// evaluation. The "Fire" button is dry-run debugging only.

import { useEffect, useState, useCallback } from "react";
import {
  listAutomationRules,
  listAutomationExecutions,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
  fireAutomationRule,
  automationHealth,
  automationConflicts,
  automationRecommendations,
  AUTOMATION_TRIGGERS,
  AUTOMATION_ACTION_KINDS,
  AUTOMATION_EXEC_STATUSES,
  AUTOMATION_EXEC_BADGE,
  AUTOMATION_HEALTH_STYLE,
} from "@/services/Automation";
import PolicyPreviewCard from "@/components/PolicyPreviewCard";

const emptyRule = () => ({
  name: "",
  description: "",
  trigger: "EVENT",
  eventName: "",
  cronExpr: "",
  conditions: {},
  actions: [],
  idempotent: true,
  isActive: true,
});

export default function AutomationAdmin() {
  const [tab, setTab] = useState("rules");
  const [rules, setRules] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | id
  const [draft, setDraft] = useState(emptyRule());
  const [filter, setFilter] = useState({ trigger: "", isActive: "" });
  const [execFilter, setExecFilter] = useState({ ruleId: "", status: "" });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filter.trigger) params.trigger = filter.trigger;
      if (filter.isActive !== "") params.isActive = filter.isActive;
      const rs = await listAutomationRules(params);
      setRules(Array.isArray(rs) ? rs : rs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const refreshExec = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (execFilter.ruleId) params.ruleId = execFilter.ruleId;
      if (execFilter.status) params.status = execFilter.status;
      const xs = await listAutomationExecutions(params);
      setExecutions(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load executions");
    } finally {
      setLoading(false);
    }
  }, [execFilter]);

  useEffect(() => {
    if (tab === "rules") refresh();
    else refreshExec();
  }, [tab, refresh, refreshExec]);

  const startNew = () => {
    setDraft(emptyRule());
    setEditing("new");
  };

  const startEdit = (rule) => {
    setDraft({ ...rule, actions: rule.actions ?? [], conditions: rule.conditions ?? {} });
    setEditing(rule.id);
  };

  const save = async () => {
    try {
      const payload = {
        name: draft.name,
        description: draft.description || null,
        trigger: draft.trigger,
        eventName: draft.trigger === "EVENT" ? draft.eventName || null : null,
        cronExpr: draft.trigger === "SCHEDULE" ? draft.cronExpr || null : null,
        conditions: draft.conditions,
        actions: draft.actions,
        idempotent: !!draft.idempotent,
        isActive: !!draft.isActive,
      };
      if (editing === "new") await createAutomationRule(payload);
      else await updateAutomationRule(editing, payload);
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(e?.message || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this rule?")) return;
    try {
      await deleteAutomationRule(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Delete failed");
    }
  };

  const fireDry = async (id) => {
    try {
      const r = await fireAutomationRule(id, { dryRun: true });
      alert(`Execution queued: ${r?.executionId ?? "ok"}`);
      refreshExec();
    } catch (e) {
      setError(e?.message || "Fire failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="rf-h1" style={{ fontSize: 22, fontWeight: 700, color: "var(--rf-txt)" }}>Automation</h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Workflow rules, schedules, and execution history.</p>
        </div>
        {tab === "rules" && (
          <button className="rf-btn rf-btn-primary" onClick={startNew}>+ New rule</button>
        )}
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <button className={`rf-btn ${tab === "rules" ? "rf-btn-primary" : ""}`} onClick={() => setTab("rules")}>Rules</button>
        <button className={`rf-btn ${tab === "executions" ? "rf-btn-primary" : ""}`} onClick={() => setTab("executions")}>Executions</button>
        <button className={`rf-btn ${tab === "health" ? "rf-btn-primary" : ""}`} onClick={() => setTab("health")}>Health</button>
        <button className={`rf-btn ${tab === "conflicts" ? "rf-btn-primary" : ""}`} onClick={() => setTab("conflicts")}>Conflicts</button>
        <button className={`rf-btn ${tab === "recommendations" ? "rf-btn-primary" : ""}`} onClick={() => setTab("recommendations")}>Recommendations</button>
      </div>

      {error && (
        <div style={{ padding: 10, background: "rgba(239,68,68,0.12)", color: "var(--rf-red)", borderRadius: 6, marginBottom: 12 }}>{error}</div>
      )}

      {tab === "rules" && (
        <RulesTab
          rules={rules}
          loading={loading}
          filter={filter}
          setFilter={setFilter}
          onEdit={startEdit}
          onDelete={remove}
          onFire={fireDry}
        />
      )}
      {tab === "executions" && (
        <ExecutionsTab
          executions={executions}
          loading={loading}
          filter={execFilter}
          setFilter={setExecFilter}
          rules={rules}
        />
      )}
      {tab === "health" && <HealthTab onEdit={startEdit} rules={rules} />}
      {tab === "conflicts" && <ConflictsTab />}
      {tab === "recommendations" && <RecommendationsTab onEdit={startEdit} rules={rules} />}

      {editing && (
        <RuleEditor
          draft={draft}
          setDraft={setDraft}
          onCancel={() => setEditing(null)}
          onSave={save}
          isNew={editing === "new"}
        />
      )}
    </div>
  );
}

function RulesTab({ rules, loading, filter, setFilter, onEdit, onDelete, onFire }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select className="rf-input" value={filter.trigger} onChange={(e) => setFilter({ ...filter, trigger: e.target.value })}>
          <option value="">All triggers</option>
          {AUTOMATION_TRIGGERS.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select className="rf-input" value={filter.isActive} onChange={(e) => setFilter({ ...filter, isActive: e.target.value })}>
          <option value="">Active + inactive</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {loading ? <div>Loading…</div> : rules.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>No automation rules yet.</div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Name</th>
                <th style={th}>Trigger</th>
                <th style={th}>Event / Cron</th>
                <th style={th}>Actions</th>
                <th style={th}>Active</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid var(--rf-border)" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    {r.description && <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>{r.description}</div>}
                  </td>
                  <td style={td}>{r.trigger}</td>
                  <td style={td}>{r.eventName || r.cronExpr || "—"}</td>
                  <td style={td}>{(r.actions ?? []).length}</td>
                  <td style={td}>{r.isActive ? "Yes" : "No"}</td>
                  <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button className="rf-btn" onClick={() => onFire(r.id)} style={{ marginRight: 6 }}>Fire</button>
                    <button className="rf-btn" onClick={() => onEdit(r)} style={{ marginRight: 6 }}>Edit</button>
                    <button className="rf-btn" onClick={() => onDelete(r.id)}>Delete</button>
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

function ExecutionsTab({ executions, loading, filter, setFilter, rules }) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select className="rf-input" value={filter.ruleId} onChange={(e) => setFilter({ ...filter, ruleId: e.target.value })}>
          <option value="">All rules</option>
          {rules.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
        </select>
        <select className="rf-input" value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All statuses</option>
          {AUTOMATION_EXEC_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      {loading ? <div>Loading…</div> : executions.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>No executions yet.</div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Started</th>
                <th style={th}>Rule</th>
                <th style={th}>Source event</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((x) => {
                const rule = rules.find((r) => r.id === x.ruleId);
                const okCount = (x.actionResults ?? []).filter((a) => a.ok).length;
                const total = (x.actionResults ?? []).length;
                return (
                  <tr key={x.id} style={{ borderTop: "1px solid var(--rf-border)" }}>
                    <td style={td}>{x.startedAt ? new Date(x.startedAt).toLocaleString() : "—"}</td>
                    <td style={td}>{rule?.name ?? x.ruleId.slice(0, 8)}</td>
                    <td style={td}>{x.sourceEventName || "—"}</td>
                    <td style={td}>
                      <span className={`rf-badge ${AUTOMATION_EXEC_BADGE[x.status] || ""}`} style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, border: "1px solid" }}>
                        {x.status}
                      </span>
                    </td>
                    <td style={td}>{okCount}/{total}{x.error ? ` · ${x.error}` : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RuleEditor({ draft, setDraft, onCancel, onSave, isNew }) {
  const setField = (k, v) => setDraft({ ...draft, [k]: v });
  const setAction = (i, patch) => {
    const next = [...draft.actions];
    next[i] = { ...next[i], ...patch };
    setDraft({ ...draft, actions: next });
  };
  const addAction = () =>
    setDraft({ ...draft, actions: [...draft.actions, { kind: "NOTIFY", params: {} }] });
  const removeAction = (i) =>
    setDraft({ ...draft, actions: draft.actions.filter((_, idx) => idx !== i) });

  return (
    <div style={overlay}>
      <div style={modal}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--rf-txt)" }}>{isNew ? "New rule" : "Edit rule"}</h2>
          <button className="rf-btn" onClick={onCancel}></button>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="Name">
            <input className="rf-input" value={draft.name} onChange={(e) => setField("name", e.target.value)} />
          </Field>
          <Field label="Trigger">
            <select className="rf-input" value={draft.trigger} onChange={(e) => setField("trigger", e.target.value)}>
              {AUTOMATION_TRIGGERS.map((t) => (<option key={t} value={t}>{t}</option>))}
            </select>
          </Field>
        </div>

        <Field label="Description">
          <textarea className="rf-input" rows={2} value={draft.description ?? ""} onChange={(e) => setField("description", e.target.value)} />
        </Field>

        {draft.trigger === "EVENT" && (
          <Field label="Event name (e.g. issue.created)">
            <input className="rf-input" value={draft.eventName ?? ""} onChange={(e) => setField("eventName", e.target.value)} />
          </Field>
        )}
        {draft.trigger === "SCHEDULE" && (
          <Field label="Cron expression (* */N H:MM)">
            <input className="rf-input" value={draft.cronExpr ?? ""} onChange={(e) => setField("cronExpr", e.target.value)} placeholder="0 9 * * *" />
          </Field>
        )}

        <Field label="Conditions (JSON — ConditionNode)">
          <textarea className="rf-input" rows={4} value={JSON.stringify(draft.conditions ?? {}, null, 2)} onChange={(e) => {
            try { setField("conditions", JSON.parse(e.target.value || "{}")); } catch { /* swallow until valid */ }
          }} />
        </Field>

        <div style={{ marginTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--rf-txt2)" }}>Actions</span>
            <button className="rf-btn" onClick={addAction}>+ Add action</button>
          </div>
          {draft.actions.map((a, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 40px", gap: 8, marginBottom: 6 }}>
              <select className="rf-input" value={a.kind} onChange={(e) => setAction(i, { kind: e.target.value })}>
                {AUTOMATION_ACTION_KINDS.map((k) => (<option key={k} value={k}>{k}</option>))}
              </select>
              <input
                className="rf-input"
                placeholder='params JSON (e.g. {"category":"qa"})'
                value={JSON.stringify(a.params ?? {})}
                onChange={(e) => {
                  try { setAction(i, { params: JSON.parse(e.target.value || "{}") }); } catch { /* swallow */ }
                }}
              />
              <button className="rf-btn" onClick={() => removeAction(i)}></button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
            <input type="checkbox" checked={!!draft.idempotent} onChange={(e) => setField("idempotent", e.target.checked)} />
            Idempotent
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
            <input type="checkbox" checked={!!draft.isActive} onChange={(e) => setField("isActive", e.target.checked)} />
            Active
          </label>
        </div>

        {!isNew && draft.id && (
          <div style={{ marginTop: 12 }}>
            <PolicyPreviewCard ruleId={draft.id} />
          </div>
        )}

        <footer style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="rf-btn" onClick={onCancel}>Cancel</button>
          <button className="rf-btn rf-btn-primary" onClick={onSave}>Save</button>
        </footer>
      </div>
    </div>
  );
}

// ── Phase 7 PR-7: intelligence tabs ──────────────────────────────────────────

function HealthTab({ onEdit, rules }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const xs = await automationHealth();
        if (!cancelled) setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sort RED first, then YELLOW, then GREEN.
  const sorted = [...rows].sort((a, b) => {
    const rank = (h) => (h === "RED" ? 0 : h === "YELLOW" ? 1 : 2);
    return rank(a.health) - rank(b.health);
  });

  if (loading) return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (error)
    return (
      <div
        style={{
          padding: 10,
          background: "rgba(239,68,68,0.12)",
          color: "var(--rf-red)",
          borderRadius: 6,
        }}
      >
        {error}
      </div>
    );
  if (sorted.length === 0)
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>
        No execution history yet.
      </div>
    );
  return (
    <div className="rf-card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "var(--rf-bg2)" }}>
            <th style={th}>Rule</th>
            <th style={th}>Health</th>
            <th style={th}>Success rate</th>
            <th style={th}>Runs</th>
            <th style={th}>Last run</th>
            <th style={th}>Notes</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((h) => {
            const style =
              AUTOMATION_HEALTH_STYLE[h.health] ||
              AUTOMATION_HEALTH_STYLE.GREEN;
            const fullRule = rules.find((r) => r.id === h.ruleId);
            return (
              <tr
                key={h.ruleId}
                style={{ borderTop: "1px solid var(--rf-border)" }}
              >
                <td style={td}>
                  <div style={{ fontWeight: 600 }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: "var(--rf-txt3)" }}>
                    {h.isActive ? "active" : "inactive"}
                  </div>
                </td>
                <td style={td}>
                  <span
                    style={{
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 4,
                      background: style.bg,
                      color: style.color,
                    }}
                  >
                    {h.health}
                  </span>
                </td>
                <td style={td}>{(h.successRate * 100).toFixed(1)}%</td>
                <td style={td}>
                  {h.successes}/{h.totalExecutions}
                </td>
                <td style={td}>
                  {h.lastRunAt
                    ? new Date(h.lastRunAt).toLocaleString()
                    : "—"}
                </td>
                <td style={{ ...td, fontSize: 11, color: "var(--rf-txt3)" }}>
                  {(h.notes ?? []).join(" · ")}
                </td>
                <td style={{ ...td, textAlign: "right" }}>
                  {fullRule && (
                    <button
                      className="rf-btn"
                      onClick={() => onEdit(fullRule)}
                    >
                      Open rule
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConflictsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const xs = await automationConflicts();
        if (!cancelled) setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (error)
    return (
      <div
        style={{
          padding: 10,
          background: "rgba(239,68,68,0.12)",
          color: "var(--rf-red)",
          borderRadius: 6,
        }}
      >
        {error}
      </div>
    );
  if (rows.length === 0)
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>
        No rule conflicts detected.
      </div>
    );
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rows.map((c, i) => (
        <li
          key={`${c.eventName}-${i}`}
          className="rf-card"
          style={{ padding: 12, marginBottom: 8 }}
        >
          <div
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {c.eventName}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--rf-txt3)",
              }}
            >
              {c.ruleIds?.length ?? 0} rules
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--rf-txt2)",
              marginBottom: 6,
            }}
          >
            {c.detail}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(c.ruleNames ?? []).map((n, idx) => (
              <span
                key={`${n}-${idx}`}
                style={{
                  fontSize: 11,
                  padding: "2px 8px",
                  border: "1px solid var(--rf-border)",
                  borderRadius: 4,
                }}
              >
                {n}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function RecommendationsTab({ onEdit, rules }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const xs = await automationRecommendations();
        if (!cancelled) setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
  if (error)
    return (
      <div
        style={{
          padding: 10,
          background: "rgba(239,68,68,0.12)",
          color: "var(--rf-red)",
          borderRadius: 6,
        }}
      >
        {error}
      </div>
    );
  if (rows.length === 0)
    return (
      <div style={{ padding: 32, textAlign: "center", color: "var(--rf-txt3)" }}>
        Nothing to recommend right now.
      </div>
    );
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {rows.map((r, i) => {
        const linkedRules = (r.ruleIds ?? [])
          .map((id) => rules.find((rl) => rl.id === id))
          .filter(Boolean);
        return (
          <li
            key={`${r.kind}-${i}`}
            className="rf-card"
            style={{ padding: 12, marginBottom: 8 }}
          >
            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 4,
                  background: "var(--rf-bg3)",
                  color: "var(--rf-txt3)",
                }}
              >
                {r.kind}
              </span>
              <span style={{ fontWeight: 600 }}>{r.title}</span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--rf-txt2)",
                marginBottom: 6,
              }}
            >
              {r.detail}
            </div>
            {r.eventName && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  marginBottom: 4,
                }}
              >
                event · {r.eventName}
              </div>
            )}
            {linkedRules.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                {linkedRules.map((rl) => (
                  <button
                    key={rl.id}
                    className="rf-btn"
                    onClick={() => onEdit(rl)}
                  >
                    Review {rl.name}
                  </button>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "var(--rf-txt3)", letterSpacing: 0.04 };
const td = { padding: "10px 12px", fontSize: 13, color: "var(--rf-txt)" };
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modal = { background: "var(--rf-bg)", border: "1px solid var(--rf-border)", borderRadius: 12, padding: 20, maxWidth: 720, width: "100%", maxHeight: "92vh", overflow: "auto" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--rf-txt3)", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}
