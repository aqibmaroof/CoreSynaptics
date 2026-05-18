"use client";

// ── Phase v15 B6: Canonical crew dispatch board ─────────────────────────────
// Visibility is server-enforced (GC sees all; non-GC sees only their company).
// On assign, always inspect res.conflict — the row is still created; the flag
// is informational. Status transitions are linear forward.

import { useCallback, useEffect, useState } from "react";
import {
  dispatchForDay,
  assignDispatch,
  updateDispatchStatus,
  CREW_SHIFT_STATUSES,
  SHIFT_STATUS_STYLE,
} from "@/services/Dispatch";

export default function CrewDispatchV15({ cxProjectId }) {
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [showAssign, setShowAssign] = useState(false);

  const refresh = useCallback(async () => {
    if (!cxProjectId) return;
    setLoading(true);
    setError("");
    try {
      const d = await dispatchForDay(cxProjectId, date);
      setDay(d);
    } catch (e) {
      setError(e?.message || "Failed to load day");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const assign = async (form) => {
    setConflict(null);
    setBusyId("__new");
    try {
      const res = await assignDispatch({ cxProjectId, ...form });
      if (res?.conflict)
        setConflict(
          `Conflict with assignment ${res.conflictingAssignmentId || "?"}`
        );
      setShowAssign(false);
      await refresh();
    } catch (e) {
      setError(e?.message || "Assign failed");
    } finally {
      setBusyId(null);
    }
  };

  const updateStatus = async (id, status) => {
    setBusyId(id);
    try {
      await updateDispatchStatus(id, status);
      await refresh();
    } catch (e) {
      setError(e?.message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  if (!cxProjectId) {
    return (
      <div style={{ padding: 24, color: "var(--rf-txt3)" }}>
        Pick a project (set <code>?cxProjectId=…</code>) to view dispatch.
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>👷 Crew dispatch</h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Canonical dispatch board. Conflicts surface inline, never as errors.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowAssign(true)}
        >
          + Dispatch FSE
        </button>
      </header>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <input
          type="date"
          className="rf-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
        {day?.totals && (
          <span
            style={{
              fontSize: 11,
              color: "var(--rf-txt3)",
              marginLeft: "auto",
              fontFamily: "monospace",
            }}
          >
            total {day.totals.total} · onSite {day.totals.onSite} · done{" "}
            {day.totals.done} · no-show {day.totals.noShow}
          </span>
        )}
      </div>

      {conflict && (
        <div
          style={{
            padding: 10,
            background: "rgba(245,158,11,0.16)",
            color: "var(--rf-yellow, #f59e0b)",
            borderRadius: 6,
            marginBottom: 12,
            fontSize: 13,
          }}
        >
          ⚠ {conflict}
        </div>
      )}

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

      {!day || (day.rows || []).length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No assignments for this day.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Worker</th>
                <th style={th}>Company</th>
                <th style={th}>Shift</th>
                <th style={th}>Task</th>
                <th style={th}>Asset</th>
                <th style={th}>Status</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {day.rows.map((r) => {
                const sty =
                  SHIFT_STATUS_STYLE[r.status] || SHIFT_STATUS_STYLE.PLANNED;
                return (
                  <tr
                    key={r.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{r.workerName}</div>
                      {r.roleLabel && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          {r.roleLabel}
                        </div>
                      )}
                    </td>
                    <td style={td}>{r.company}</td>
                    <td style={{ ...td, fontFamily: "monospace" }}>
                      {r.shiftStart}–{r.shiftEnd}
                    </td>
                    <td style={td}>{r.task}</td>
                    <td style={td}>{r.assetCode || "—"}</td>
                    <td style={td}>
                      <span
                        style={{
                          padding: "1px 6px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: sty.bg,
                          color: sty.color,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={td}>
                      <select
                        className="rf-input"
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        disabled={busyId === r.id}
                        style={{ fontSize: 11 }}
                      >
                        {CREW_SHIFT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showAssign && (
        <AssignModal
          date={date}
          onClose={() => setShowAssign(false)}
          onAssign={assign}
          busy={busyId === "__new"}
        />
      )}
    </div>
  );
}

function AssignModal({ date, onClose, onAssign, busy }) {
  const [form, setForm] = useState({
    crewMemberId: "",
    shiftDate: date,
    shiftStart: "07:00",
    shiftEnd: "15:00",
    task: "",
    assetCode: "",
    location: "",
  });
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="rf-card"
        style={{ padding: 20, maxWidth: 540, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
          + Dispatch FSE
        </h2>
        <Field label="Crew member id">
          <input
            className="rf-input"
            value={form.crewMemberId}
            onChange={(e) =>
              setForm({ ...form, crewMemberId: e.target.value })
            }
          />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Field label="Date">
            <input
              type="date"
              className="rf-input"
              value={form.shiftDate}
              onChange={(e) =>
                setForm({ ...form, shiftDate: e.target.value })
              }
            />
          </Field>
          <Field label="Task">
            <input
              className="rf-input"
              value={form.task}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
            />
          </Field>
          <Field label="Start (HH:MM)">
            <input
              className="rf-input"
              value={form.shiftStart}
              onChange={(e) =>
                setForm({ ...form, shiftStart: e.target.value })
              }
            />
          </Field>
          <Field label="End (HH:MM)">
            <input
              className="rf-input"
              value={form.shiftEnd}
              onChange={(e) =>
                setForm({ ...form, shiftEnd: e.target.value })
              }
            />
          </Field>
          <Field label="Asset code (optional)">
            <input
              className="rf-input"
              value={form.assetCode}
              onChange={(e) =>
                setForm({ ...form, assetCode: e.target.value })
              }
            />
          </Field>
          <Field label="Location (optional)">
            <input
              className="rf-input"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 14,
          }}
        >
          <button className="rf-btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className="rf-btn rf-btn-primary"
            disabled={
              busy || !form.crewMemberId || !form.task || !form.shiftDate
            }
            onClick={() =>
              onAssign({
                crewMemberId: form.crewMemberId,
                shiftDate: form.shiftDate,
                shiftStart: form.shiftStart,
                shiftEnd: form.shiftEnd,
                task: form.task,
                assetCode: form.assetCode || undefined,
                location: form.location || undefined,
              })
            }
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
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
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "8px 10px", fontSize: 12, color: "var(--rf-txt)" };
