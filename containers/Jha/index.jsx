"use client";

// ── Phase v15 B8: JHA briefing + acknowledgment ─────────────────────────────
// Aggregate-driven workflow. Author drafts → adds hazards → publishes with
// requiredAttendeeUserIds → attendees acknowledge. Acknowledge is idempotent;
// the button toggles to "Acknowledged" once the current user is in the list.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listJha,
  getJha,
  createJha,
  addJhaHazard,
  publishJha,
  acknowledgeJha,
  retireJha,
  JHA_STATUSES,
  JHA_SEVERITIES,
  JHA_STATUS_STYLE,
  JHA_SEVERITY_STYLE,
} from "@/services/Jha";

export default function Jha({ cxProjectId, currentUserId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listJha({
        cxProjectId: cxProjectId || undefined,
        status: statusFilter || undefined,
        limit: 100,
      });
      const items = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : res?.items ?? [];
      setRows(items);
    } catch (e) {
      setError(e?.message || "Failed to load JHAs");
    } finally {
      setLoading(false);
    }
  }, [cxProjectId, statusFilter]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>JHA</h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Job hazard analysis briefings with required-attendee acknowledgment.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowNew(true)}
          disabled={!cxProjectId}
          title={cxProjectId ? "" : "cxProjectId required"}
        >
          + New JHA
        </button>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select
          className="rf-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          {JHA_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="rf-btn" onClick={refresh} disabled={loading}>
          {loading ? "…" : "Refresh"}
        </button>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) minmax(360px, 1.5fr)",
          gap: 16,
        }}
      >
        <section className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--rf-border)",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            JHAs ({rows.length})
          </div>
          {rows.length === 0 ? (
            <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
              {loading ? "Loading…" : "None."}
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rows.map((j) => {
                const sty =
                  JHA_STATUS_STYLE[j.status] || JHA_STATUS_STYLE.DRAFT;
                const isActive = activeId === j.id;
                return (
                  <li
                    key={j.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(j.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background: isActive
                          ? "var(--rf-bg2)"
                          : "transparent",
                        border: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
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
                          {j.status}
                        </span>
                        <span style={{ fontWeight: 600 }}>{j.taskTitle}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                          marginTop: 2,
                        }}
                      >
                        {j.hazards?.length ?? 0} hazards ·{" "}
                        {j.acknowledgedUserIds?.length ?? 0}/
                        {j.requiredAttendeeUserIds?.length ?? 0} ack
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {activeId ? (
          <JhaDetail
            id={activeId}
            currentUserId={currentUserId}
            onChange={refresh}
          />
        ) : (
          <div style={{ color: "var(--rf-txt3)", padding: 14 }}>
            Select a JHA.
          </div>
        )}
      </div>

      {showNew && cxProjectId && (
        <NewJhaModal
          cxProjectId={cxProjectId}
          onClose={() => setShowNew(false)}
          onCreated={(id) => {
            setShowNew(false);
            setActiveId(id);
            refresh();
          }}
        />
      )}
    </div>
  );
}

function JhaDetail({ id, currentUserId, onChange }) {
  const [jha, setJha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [hazardDraft, setHazardDraft] = useState({
    description: "",
    severity: "MEDIUM",
    mitigation: "",
  });
  const [attendeesText, setAttendeesText] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const j = await getJha(id);
      setJha(j);
    } catch (e) {
      setError(e?.message || "Failed to load JHA");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addHazard = async () => {
    setBusy(true);
    try {
      await addJhaHazard(id, hazardDraft);
      setHazardDraft({ description: "", severity: "MEDIUM", mitigation: "" });
      await refresh();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Add hazard failed");
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    const ids = attendeesText.split(/\s+/).filter(Boolean);
    if (!ids.length) return;
    setBusy(true);
    try {
      await publishJha(id, ids);
      setAttendeesText("");
      await refresh();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Publish failed");
    } finally {
      setBusy(false);
    }
  };

  const acknowledge = async () => {
    setBusy(true);
    try {
      const sig = await sha256(`${id}:${Date.now()}`);
      await acknowledgeJha(id, { signatureSha256: sig });
      await refresh();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Acknowledge failed");
    } finally {
      setBusy(false);
    }
  };

  const retire = async () => {
    if (!confirm("Retire this JHA?")) return;
    setBusy(true);
    try {
      await retireJha(id);
      await refresh();
      onChange?.();
    } catch (e) {
      setError(e?.message || "Retire failed");
    } finally {
      setBusy(false);
    }
  };

  const ackProgress = useMemo(() => {
    if (!jha) return 0;
    const tot = jha.requiredAttendeeUserIds?.length || 0;
    if (!tot) return 0;
    return Math.round(((jha.acknowledgedUserIds?.length || 0) / tot) * 100);
  }, [jha]);

  if (loading && !jha)
    return <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>;
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
  if (!jha) return null;

  const sty = JHA_STATUS_STYLE[jha.status] || JHA_STATUS_STYLE.DRAFT;
  const alreadyAcked =
    currentUserId && (jha.acknowledgedUserIds || []).includes(currentUserId);
  const canAck =
    jha.status === "PUBLISHED" &&
    currentUserId &&
    (jha.requiredAttendeeUserIds || []).includes(currentUserId);

  return (
    <section className="rf-card" style={{ padding: 14 }}>
      <header style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "2px 8px",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 4,
              background: sty.bg,
              color: sty.color,
            }}
          >
            {jha.status}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{jha.taskTitle}</span>
        </div>
        {jha.locationDesc && (
          <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            {jha.locationDesc}
          </div>
        )}
        {jha.scopeNotes && (
          <div
            style={{
              fontSize: 13,
              color: "var(--rf-txt2)",
              marginTop: 4,
            }}
          >
            {jha.scopeNotes}
          </div>
        )}
      </header>

      <SectionHeader title="Hazards" />
      {(jha.hazards || []).length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          None added yet.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {jha.hazards.map((h) => {
            const sevSty =
              JHA_SEVERITY_STYLE[h.severity] || JHA_SEVERITY_STYLE.MEDIUM;
            return (
              <li
                key={h.id}
                style={{
                  padding: 8,
                  borderTop: "1px solid var(--rf-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "1px 6px",
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 4,
                      background: sevSty.bg,
                      color: sevSty.color,
                    }}
                  >
                    {h.severity}
                  </span>
                  <strong style={{ fontSize: 13 }}>{h.description}</strong>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--rf-txt2)",
                    marginTop: 2,
                  }}
                >
                  Mitigation: {h.mitigation}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {jha.status === "DRAFT" && (
        <div style={{ marginTop: 10 }}>
          <SectionHeader title="Add hazard" />
          <input
            className="rf-input"
            placeholder="Description"
            value={hazardDraft.description}
            onChange={(e) =>
              setHazardDraft({ ...hazardDraft, description: e.target.value })
            }
            style={{ marginBottom: 6 }}
          />
          <select
            className="rf-input"
            value={hazardDraft.severity}
            onChange={(e) =>
              setHazardDraft({ ...hazardDraft, severity: e.target.value })
            }
            style={{ marginBottom: 6 }}
          >
            {JHA_SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            className="rf-input"
            placeholder="Mitigation"
            value={hazardDraft.mitigation}
            onChange={(e) =>
              setHazardDraft({ ...hazardDraft, mitigation: e.target.value })
            }
            style={{ marginBottom: 6 }}
          />
          <button
            className="rf-btn"
            onClick={addHazard}
            disabled={
              busy ||
              !hazardDraft.description.trim() ||
              !hazardDraft.mitigation.trim()
            }
          >
            Add hazard
          </button>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <SectionHeader title="Required attendees" />
        {jha.status === "DRAFT" ? (
          <>
            <textarea
              className="rf-input"
              rows={3}
              value={attendeesText}
              onChange={(e) => setAttendeesText(e.target.value)}
              placeholder="One user id per line"
              style={{ width: "100%", marginBottom: 6 }}
            />
            <button
              className="rf-btn rf-btn-primary"
              onClick={publish}
              disabled={
                busy ||
                (jha.hazards || []).length === 0 ||
                attendeesText.trim().length === 0
              }
            >
              Publish briefing
            </button>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <progress value={ackProgress} max={100} />
            <span style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
              {ackProgress}% acknowledged (
              {jha.acknowledgedUserIds?.length ?? 0}/
              {jha.requiredAttendeeUserIds?.length ?? 0})
            </span>
          </div>
        )}
      </div>

      {jha.status === "PUBLISHED" && (
        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
          {canAck && !alreadyAcked && (
            <button
              className="rf-btn rf-btn-primary"
              onClick={acknowledge}
              disabled={busy}
            >
              I have read this briefing
            </button>
          )}
          {alreadyAcked && (
            <span
              style={{
                padding: "4px 12px",
                background: "rgba(34,197,94,0.16)",
                color: "var(--rf-green)",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Acknowledged
            </span>
          )}
          <button
            className="rf-btn"
            onClick={retire}
            disabled={busy}
            style={{ color: "var(--rf-red)" }}
          >
            Retire
          </button>
        </div>
      )}
    </section>
  );
}

function NewJhaModal({ cxProjectId, onClose, onCreated }) {
  const [taskTitle, setTaskTitle] = useState("");
  const [locationDesc, setLocationDesc] = useState("");
  const [scopeNotes, setScopeNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const j = await createJha({
        cxProjectId,
        taskTitle,
        locationDesc: locationDesc || undefined,
        scopeNotes: scopeNotes || undefined,
      });
      onCreated?.(j.id);
    } catch (e) {
      setError(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  };

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
          New JHA
        </h2>
        {error && (
          <div
            style={{
              padding: 8,
              background: "rgba(239,68,68,0.12)",
              color: "var(--rf-red)",
              borderRadius: 6,
              fontSize: 12,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}
        <Field label="Task title">
          <input
            className="rf-input"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
        </Field>
        <Field label="Location description">
          <input
            className="rf-input"
            value={locationDesc}
            onChange={(e) => setLocationDesc(e.target.value)}
          />
        </Field>
        <Field label="Scope notes">
          <textarea
            className="rf-input"
            rows={3}
            value={scopeNotes}
            onChange={(e) => setScopeNotes(e.target.value)}
          />
        </Field>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button className="rf-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rf-btn rf-btn-primary"
            onClick={save}
            disabled={busy || !taskTitle.trim()}
          >
            Create draft
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--rf-txt3)",
        textTransform: "uppercase",
        letterSpacing: 0.04,
        marginBottom: 6,
        marginTop: 8,
      }}
    >
      {title}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
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

async function sha256(input) {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    return Math.random().toString(36).slice(2);
  }
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
