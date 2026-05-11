"use client";

// CxControl Issues — unified view across the kind discriminator
// (HOLD_POINT / WITNESS_POINT / PUNCH_LIST / NCR / SNAG / GENERAL)
// Mirrors HTML's renderHoldPoints, renderPunchList, NCR table — one
// aggregate, kind-tabbed surface.

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getIssues,
  getIssueById,
  createIssue,
  changeIssueStatus,
  verifyAndCloseIssue,
  ISSUE_KINDS,
  ISSUE_KIND_LABELS,
} from "@/services/Issues";

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  brand: "#1e40af",
  brandH: "#1e3a8a",
  brandFade: "#eff6ff",
  brandSoft: "#dbeafe",
  green: "#16a34a",
  red: "#dc2626",
  amber: "#f59e0b",
  bgSoft: "#f1f5f9",
};

const KIND_CHIP = {
  GENERAL: { bg: "#e2e8f0", fg: C.textSoft },
  HOLD_POINT: { bg: "#fef3c7", fg: "#92400e" },
  WITNESS_POINT: { bg: "#cffafe", fg: "#155e75" },
  PUNCH_LIST: { bg: "#ede9fe", fg: "#6d28d9" },
  NCR: { bg: "#fee2e2", fg: C.red },
  SNAG: { bg: "#fed7aa", fg: "#9a3412" },
};

const SEV = {
  LOW: { bg: "#e2e8f0", fg: C.textSoft, label: "Low" },
  MEDIUM: { bg: "#fef9c3", fg: "#854d0e", label: "Medium" },
  HIGH: { bg: "#ffedd5", fg: "#9a3412", label: "High" },
  CRITICAL: { bg: "#fee2e2", fg: C.red, label: "Critical" },
};

const STATUS = {
  NEW: { bg: "#dbeafe", fg: "#1e3a8a", label: "New" },
  IN_PROGRESS: { bg: "#cffafe", fg: "#155e75", label: "In progress" },
  READY_FOR_VERIFICATION: { bg: "#ede9fe", fg: "#6d28d9", label: "Ready to verify" },
  CLOSED: { bg: "#dcfce7", fg: "#15803d", label: "Closed" },
  DEFERRED: { bg: "#e2e8f0", fg: C.textMuted, label: "Deferred" },
};

const Toast = ({ message, onClose }) =>
  message ? (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 100,
        padding: "10px 16px",
        borderRadius: 8,
        background: message.type === "error" ? C.red : C.brand,
        color: "#fff",
        fontSize: 13,
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        cursor: "pointer",
        maxWidth: 480,
      }}
    >
      {message.text}
    </div>
  ) : null;

const TABS = ["ALL", ...ISSUE_KINDS];

export default function CxIssues({ cxProjectId }) {
  const search = useSearchParams();
  const focusId = search?.get("focus") ?? null;

  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showVerify, setShowVerify] = useState(null);
  const [toast, setToast] = useState(null);
  // Pulse the focused row briefly. We re-pulse whenever focusId changes.
  const [pulse, setPulse] = useState(false);
  // Ref map: issueId → row DOM node, used to scrollIntoView the focused issue.
  const rowRefs = useRef({});

  const reload = async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (cxProjectId) params.projectId = cxProjectId; // service maps to cxProjectId
      const page = await getIssues(params);
      let list = page?.data ?? [];

      // If a focus issue is specified and not in the page (different filter,
      // pagination, kind, etc.), fetch it directly and prepend so the user can
      // see it without hunting. Tolerate failure silently — they'll just see
      // the regular list.
      if (focusId && !list.some((i) => i.id === focusId)) {
        try {
          const it = await getIssueById(focusId);
          if (it) list = [it, ...list];
        } catch {
          /* ignore */
        }
      }

      setItems(list);

      // Auto-switch the tab to the focused issue's kind so it's actually visible.
      const focused = list.find((i) => i.id === focusId);
      if (focused?.kind) setTab(focused.kind);
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cxProjectId, focusId]);

  // Once items are rendered, scroll the focused row into view + pulse it.
  useEffect(() => {
    if (!focusId || loading) return;
    const node = rowRefs.current[focusId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 2500);
      return () => clearTimeout(t);
    }
  }, [focusId, loading, items]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => {
    const c = { ALL: items.length };
    for (const k of ISSUE_KINDS) c[k] = items.filter((i) => i.kind === k).length;
    return c;
  }, [items]);

  const filtered =
    tab === "ALL" ? items : items.filter((i) => i.kind === tab);

  const act = async (fn, ok) => {
    try {
      await fn();
      setToast({ type: "ok", text: ok });
      reload();
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed" });
    }
  };

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: C.text,
      }}
    >
      <Toast message={toast} onClose={() => setToast(null)} />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 18,
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
            Issues
          </h1>
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            Single aggregate, six QA/QC variants. Hold-points, witness points,
            punch list, NCRs, snags, and general issues — same lifecycle, same
            assignment surface, kind chip discriminates.
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: C.brand,
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            border: 0,
            cursor: "pointer",
          }}
        >
          + Raise issue
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              background: tab === t ? C.brand : C.surface,
              color: tab === t ? "#fff" : C.textSoft,
              border: `1px solid ${tab === t ? C.brand : C.border}`,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            {t === "ALL" ? "All" : ISSUE_KIND_LABELS[t]}
            <span
              style={{
                background: tab === t ? "rgba(255,255,255,0.22)" : C.bgSoft,
                color: tab === t ? "#fff" : C.textMuted,
                padding: "1px 7px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 2fr 90px 100px 130px 220px",
            gap: 14,
            padding: "12px 16px",
            background: C.bgSoft,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: C.textMuted,
            textTransform: "uppercase",
          }}
        >
          <div>KIND</div>
          <div>TITLE</div>
          <div>SEV</div>
          <div>STATUS</div>
          <div>ASSIGNED</div>
          <div>ACTIONS</div>
        </div>

        {loading && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            Loading issues…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            No issues in this kind.
          </div>
        )}
        {!loading &&
          filtered.map((i) => {
            const kind = KIND_CHIP[i.kind] ?? KIND_CHIP.GENERAL;
            const sev = SEV[i.severity] ?? SEV.MEDIUM;
            const stat = STATUS[i.status] ?? STATUS.NEW;
            const isFocused = focusId && i.id === focusId;
            return (
              <div
                key={i.id}
                ref={(el) => {
                  if (el) rowRefs.current[i.id] = el;
                }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 2fr 90px 100px 130px 220px",
                  gap: 14,
                  padding: "12px 16px",
                  borderTop: `1px solid ${C.border}`,
                  alignItems: "center",
                  fontSize: 13,
                  // Highlight + brief pulse when arriving from a deep-link
                  background: isFocused
                    ? pulse
                      ? "#fef3c7"
                      : "#fef9c3"
                    : "transparent",
                  boxShadow: isFocused
                    ? "inset 4px 0 0 0 #f59e0b"
                    : "none",
                  transition: "background 0.4s ease",
                }}
              >
                <div>
                  <span
                    style={{
                      background: kind.bg,
                      color: kind.fg,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {ISSUE_KIND_LABELS[i.kind] ?? i.kind}
                  </span>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{i.title}</div>
                  {i.description && (
                    <div
                      style={{
                        fontSize: 11,
                        color: C.textSoft,
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: 480,
                      }}
                    >
                      {i.description}
                    </div>
                  )}
                </div>
                <div>
                  <span
                    style={{
                      background: sev.bg,
                      color: sev.fg,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {sev.label}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      background: stat.bg,
                      color: stat.fg,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {i.assignedToUserId?.slice(0, 8) ??
                    i.assignedToCompanyId?.slice(0, 8) ??
                    "—"}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {i.status === "NEW" && (
                    <button
                      style={btnSoft}
                      onClick={() =>
                        act(
                          () =>
                            changeIssueStatus(i.id, { status: "IN_PROGRESS" }),
                          "Started"
                        )
                      }
                    >
                      Start
                    </button>
                  )}
                  {i.status === "IN_PROGRESS" && (
                    <button
                      style={btnSoft}
                      onClick={() =>
                        act(
                          () =>
                            changeIssueStatus(i.id, {
                              status: "READY_FOR_VERIFICATION",
                            }),
                          "Marked ready to verify"
                        )
                      }
                    >
                      Ready to verify
                    </button>
                  )}
                  {i.status === "READY_FOR_VERIFICATION" && (
                    <button
                      style={btnPri}
                      onClick={() => setShowVerify(i)}
                    >
                      Verify & close
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {showCreate && (
        <CreateModal
          cxProjectId={cxProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setToast({ type: "ok", text: "Issue raised" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}

      {showVerify && (
        <VerifyModal
          issue={showVerify}
          onClose={() => setShowVerify(null)}
          onClosed={() => {
            setShowVerify(null);
            setToast({ type: "ok", text: "Issue closed" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}
    </div>
  );
}

function CreateModal({ cxProjectId, onClose, onCreated, onError }) {
  const [form, setForm] = useState({
    cxProjectId: cxProjectId ?? "",
    assetId: "",
    kind: "GENERAL",
    title: "",
    description: "",
    severity: "MEDIUM",
    assignedToCompanyId: "",
    assignedToUserId: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setBusy(true);
    try {
      const body = {
        kind: form.kind,
        title: form.title,
        description: form.description || undefined,
        severity: form.severity,
      };
      if (form.cxProjectId) body.cxProjectId = form.cxProjectId;
      if (form.assetId) body.assetId = form.assetId;
      if (form.assignedToCompanyId) body.assignedToCompanyId = form.assignedToCompanyId;
      if (form.assignedToUserId) body.assignedToUserId = form.assignedToUserId;
      await createIssue(body);
      onCreated();
    } catch (e) {
      onError(e?.message ?? "Failed to raise");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="+ Raise issue" onClose={onClose} onSubmit={submit} busy={busy} disabled={!form.title}>
      <FieldSelect label="Kind" v={form.kind} on={set("kind")} options={ISSUE_KINDS} labels={ISSUE_KIND_LABELS} />
      <Field label="Title" v={form.title} on={set("title")} />
      <Field
        label={form.kind === "NCR" ? "Description (mandatory for NCR)" : "Description"}
        v={form.description}
        on={set("description")}
        multiline
      />
      <FieldSelect label="Severity" v={form.severity} on={set("severity")} options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]} />
      <Field label="CxProject ID" v={form.cxProjectId} on={set("cxProjectId")} />
      <Field label="Asset ID (or required for project-only)" v={form.assetId} on={set("assetId")} />
      <Field
        label={
          form.kind === "HOLD_POINT"
            ? "Assigned company (mandatory for hold-point)"
            : "Assigned company (optional)"
        }
        v={form.assignedToCompanyId}
        on={set("assignedToCompanyId")}
      />
      <Field label="Assigned user (optional)" v={form.assignedToUserId} on={set("assignedToUserId")} />
    </Modal>
  );
}

function VerifyModal({ issue, onClose, onClosed, onError }) {
  const [verifier, setVerifier] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await verifyAndCloseIssue(issue.id, { closeVerifiedBy: verifier });
      onClosed();
    } catch (e) {
      onError(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      title={`Verify & close · ${issue.title}`}
      onClose={onClose}
      onSubmit={submit}
      busy={busy}
      disabled={!verifier}
      submitLabel="Close issue"
    >
      <Field
        label="Verifier user ID"
        v={verifier}
        on={(e) => setVerifier(e.target.value)}
      />
      <div
        style={{
          fontSize: 11,
          background: C.bgSoft,
          padding: 10,
          borderRadius: 6,
          color: C.textSoft,
          lineHeight: 1.5,
        }}
      >
        CLOSED is terminal. If this issue is a PSSR finding, the linked PSSR
        inspection auto-reconciles its counts.
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, onSubmit, busy, disabled, submitLabel = "Save", children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: 12,
          width: 540,
          maxWidth: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {title}
        </div>
        <div style={{ padding: 20, display: "grid", gap: 12 }}>{children}</div>
        <div
          style={{
            padding: "12px 20px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            background: C.bgSoft,
          }}
        >
          <button onClick={onClose} style={btnSoft}>Cancel</button>
          <button onClick={onSubmit} disabled={busy || disabled} style={btnPri}>
            {busy ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, v, on, multiline }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: C.textSoft,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      {multiline ? (
        <textarea
          rows={3}
          value={v}
          onChange={on}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            marginTop: 4,
          }}
        />
      ) : (
        <input
          value={v}
          onChange={on}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            fontSize: 13,
            marginTop: 4,
          }}
        />
      )}
    </div>
  );
}

function FieldSelect({ label, v, on, options, labels }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: C.textSoft,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <select
        value={v}
        onChange={on}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          fontSize: 13,
          marginTop: 4,
          background: C.surface,
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

const btnPri = {
  background: C.brand,
  color: "#fff",
  padding: "5px 10px",
  borderRadius: 6,
  border: 0,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};
const btnSoft = {
  background: C.brandFade,
  color: C.brandH,
  padding: "5px 10px",
  borderRadius: 6,
  border: `1px solid ${C.brandSoft}`,
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};
