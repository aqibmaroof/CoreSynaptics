"use client";

// Risk Register · List view
// Mirrors cxcontrol_v2.html renderRiskRegister():
// - Page header with active count
// - 5×5 probability × impact heat-map matrix
// - Sorted log table with band color, owner, status
// - Inline create + close-with-reason modals

import { useEffect, useMemo, useState } from "react";
import {
  listRisks,
  createRisk,
  closeRisk,
  changeRiskStatus,
  RISK_CATEGORIES,
  RISK_STATUSES,
  RISK_CLOSE_REASONS,
} from "@/services/RiskRegister";
import { listV2Projects } from "@/services/CxProjectsV2";
import { getUsers } from "@/services/Users";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  brand: "#1e40af",
  brandH: "#1e3a8a",
  brandSoft: "#dbeafe",
  brandFade: "#eff6ff",
  green: "#16a34a",
  red: "#dc2626",
  bgSoft: "#f1f5f9",
};

// HTML risk band buckets (cxcontrol_v2.html cellClass + legend):
//   1-2   LOW       (green)   #d1fae5
//   3-4   MEDIUM    (yellow)  #fef3c7
//   5-8   MED-HIGH  (orange)  #fed7aa
//   9-12  HIGH      (red-soft)#fecaca
//   15+   CRITICAL  (red)     #dc2626
const cellBg = (score) => {
  if (score >= 15) return "#dc2626";
  if (score >= 9) return "#fecaca";
  if (score >= 5) return "#fed7aa";
  if (score >= 3) return "#fef3c7";
  return "#d1fae5";
};
const cellFg = (score) => (score >= 15 ? "#fff" : C.text);

// Server-derived band → tailwind-style background for log row chip
const bandBg = {
  LOW: "#dcfce7",
  MEDIUM: "#fef3c7",
  HIGH: "#fed7aa",
  SEVERE: "#fecaca",
};
const bandFg = {
  LOW: "#15803d",
  MEDIUM: "#854d0e",
  HIGH: "#9a3412",
  SEVERE: "#991b1b",
};

const STATUS_LABELS = { OPEN: "Active", MITIGATING: "Mitigating", CLOSED: "Closed" };

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
        maxWidth: 420,
      }}
    >
      {message.text}
    </div>
  ) : null;

export default function RiskRegisterList({ cxProjectId }) {
  const { canCreate, canEdit, canDelete } = useUserPermissions();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showClose, setShowClose] = useState(null); // risk
  const [toast, setToast] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      // Backend caps risk list limit at 100 (RiskFilterDto @Max(100)).
      const params = cxProjectId ? { cxProjectId, limit: 100 } : { limit: 100 };
      const page = await listRisks(params);
      setRisks(page?.data ?? page?.items ?? (Array.isArray(page) ? page : []));
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to load risks" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cxProjectId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Build matrix: rows = impact (5..1 desc), cols = probability (1..5)
  const matrix = useMemo(() => {
    const m = {};
    for (let i = 1; i <= 5; i++) {
      m[i] = {};
      for (let p = 1; p <= 5; p++) m[i][p] = [];
    }
    for (const r of risks) {
      if (r.status === "CLOSED") continue;
      const p = Math.min(5, Math.max(1, r.probability));
      const i = Math.min(5, Math.max(1, r.impact));
      m[i][p].push(r);
    }
    return m;
  }, [risks]);

  const active = risks.filter((r) => r.status !== "CLOSED").length;
  const sorted = [...risks].sort((a, b) => b.score - a.score);

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

      {/* Page header */}
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
            Risk Register
          </h1>
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            {risks.length} risks tracked ·{" "}
            <b style={{ color: C.red }}>{active} active</b>. Probability ×
            Impact matrix and full risk log with mitigations.
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          {...permissionProps(canCreate(MODULE.RISK), "add a risk")}
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
          + Add risk
        </button>
      </div>

      <div
        style={{
          background: C.brandFade,
          border: `1px solid ${C.brandSoft}`,
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 14,
          fontSize: 13,
          color: C.brandH,
          lineHeight: 1.55,
        }}
      >
        <b>Risk register.</b> Each risk scored on 1-5 probability × 1-5
        impact (max score 25). Critical items (score ≥15) get weekly executive
        review; High items (9-14) get bi-weekly review.
      </div>

      {/* Heat-map */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: C.textMuted,
            marginBottom: 12,
          }}
        >
          Risk matrix · probability (likelihood) × impact (severity)
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(5, 1fr)",
            gap: 4,
          }}
        >
          {/* Top-left corner */}
          <div
            style={{
              fontSize: 9,
              color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              textAlign: "center",
              padding: 6,
              lineHeight: 1.2,
            }}
          >
            <div>impact ↑</div>
            <div>prob →</div>
          </div>
          {[1, 2, 3, 4, 5].map((p) => (
            <div
              key={`pcol-${p}`}
              style={{
                background: C.bgSoft,
                color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                textAlign: "center",
                padding: 8,
                borderRadius: 4,
              }}
            >
              P{p}
            </div>
          ))}

          {[5, 4, 3, 2, 1].map((i) => (
            <Row5
              key={`row-${i}`}
              i={i}
              cellBg={cellBg}
              cellFg={cellFg}
              row={matrix[i]}
            />
          ))}
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 14,
            fontSize: 11,
            color: C.textSoft,
            flexWrap: "wrap",
          }}
        >
          {[
            { c: "#dc2626", l: "Critical (15+)" },
            { c: "#fecaca", l: "High (9-12)" },
            { c: "#fed7aa", l: "Med-High (5-8)" },
            { c: "#fef3c7", l: "Medium (3-4)" },
            { c: "#d1fae5", l: "Low (1-2)" },
          ].map((x) => (
            <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: x.c,
                  borderRadius: 3,
                }}
              />
              {x.l}
            </div>
          ))}
        </div>
      </div>

      {/* Log table */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <Header />
        {loading && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            Loading risks…
          </div>
        )}
        {!loading && sorted.length === 0 && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            No risks tracked yet. Click "+ Add risk" to start.
          </div>
        )}
        {!loading &&
          sorted.map((r) => (
            <RiskRow
              key={r.id}
              r={r}
              onClose={() => setShowClose(r)}
              onMarkMitigating={async () => {
                try {
                  await changeRiskStatus(r.id, { status: "MITIGATING" });
                  setToast({ type: "ok", text: "Marked as mitigating" });
                  reload();
                } catch (e) {
                  setToast({ type: "error", text: e?.message ?? "Failed" });
                }
              }}
            />
          ))}
      </div>

      {showCreate && (
        <CreateModal
          cxProjectId={cxProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setToast({ type: "ok", text: "Risk added" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}

      {showClose && (
        <CloseRiskModal
          risk={showClose}
          onClose={() => setShowClose(null)}
          onClosed={() => {
            setShowClose(null);
            setToast({ type: "ok", text: "Risk closed" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}
    </div>
  );
}

function Row5({ i, cellBg, cellFg, row }) {
  return (
    <>
      <div
        style={{
          background: C.bgSoft,
          color: C.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          textAlign: "center",
          padding: 8,
          borderRadius: 4,
        }}
      >
        I{i}
      </div>
      {[1, 2, 3, 4, 5].map((p) => {
        const score = i * p;
        const cell = row[p] ?? [];
        return (
          <div
            key={`cell-${i}-${p}`}
            style={{
              background: cellBg(score),
              color: cellFg(score),
              borderRadius: 4,
              padding: 10,
              minHeight: 56,
              textAlign: "center",
              fontSize: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cell.length > 0 ? (
              <>
                <b style={{ fontSize: 16 }}>{cell.length}</b>
                <span style={{ fontSize: 9, opacity: 0.75 }}>score {score}</span>
              </>
            ) : (
              <span style={{ opacity: 0.4 }}>{score}</span>
            )}
          </div>
        );
      })}
    </>
  );
}

function Header() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 90px 80px 1fr 100px 130px",
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
      <div>RISK</div>
      <div>CATEGORY</div>
      <div>P × I</div>
      <div>SCORE</div>
      <div>OWNER</div>
      <div>STATUS</div>
      <div>ACTIONS</div>
    </div>
  );
}

function RiskRow({ r, onClose, onMarkMitigating }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 90px 80px 1fr 100px 130px",
        gap: 14,
        padding: "12px 16px",
        borderTop: `1px solid ${C.border}`,
        alignItems: "center",
        fontSize: 13,
      }}
    >
      <div>
        <div style={{ fontWeight: 600 }}>{r.title}</div>
        {r.mitigationPlan && (
          <div style={{ fontSize: 11, color: C.textSoft, marginTop: 2 }}>
            ↳ {r.mitigationPlan.slice(0, 80)}
            {r.mitigationPlan.length > 80 ? "…" : ""}
          </div>
        )}
      </div>
      <div style={{ fontSize: 11, color: C.textSoft }}>{r.category}</div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: C.textSoft,
        }}
      >
        {r.probability} × {r.impact}
      </div>
      <div>
        <span
          style={{
            background: bandBg[r.band] ?? C.bgSoft,
            color: bandFg[r.band] ?? C.text,
            padding: "3px 10px",
            borderRadius: 999,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {r.score}
        </span>
      </div>
      <div style={{ fontSize: 11, color: C.textMuted }}>
        {r.ownerUserId?.slice(0, 8) ?? "—"}
      </div>
      <div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color:
              r.status === "OPEN"
                ? C.red
                : r.status === "MITIGATING"
                ? "#92400e"
                : C.textMuted,
          }}
        >
          {STATUS_LABELS[r.status] ?? r.status}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {r.status === "OPEN" && (
          <button onClick={onMarkMitigating} style={btnSoft}>
            Mitigate
          </button>
        )}
        {r.status !== "CLOSED" && (
          <button onClick={onClose} style={btnSoft}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}

function CreateModal({ cxProjectId, onClose, onCreated, onError }) {
  const [form, setForm] = useState({
    cxProjectId: cxProjectId ?? "",
    title: "",
    description: "",
    category: "SCHEDULE",
    probability: 3,
    impact: 3,
    ownerUserId: "",
    mitigationPlan: "",
  });
  const [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const set = (k) => (e) => {
    const v = e.target.value;
    setForm({
      ...form,
      [k]: k === "probability" || k === "impact" ? parseInt(v, 10) : v,
    });
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await listV2Projects({ limit: 100 });
        const arr = Array.isArray(r) ? r : (r?.data ?? r?.projects ?? r?.items ?? []);
        if (alive) setProjects(arr);
      } catch {
        /* non-fatal */
      }
      try {
        const u = await getUsers(100, 1);
        const arr = Array.isArray(u) ? u : (u?.data ?? u?.users ?? u?.items ?? []);
        if (alive) setUsers(arr);
      } catch {
        /* non-fatal — owner just stays optional */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const submit = async () => {
    setBusy(true);
    try {
      // Only send ownerUserId if it's a real UUID — the backend rejects any
      // non-UUID value (e.g. a stray typed string) with a 400.
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        form.ownerUserId || "",
      );
      await createRisk({
        cxProjectId: form.cxProjectId,
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        probability: form.probability,
        impact: form.impact,
        ownerUserId: isUuid ? form.ownerUserId : undefined,
        mitigationPlan: form.mitigationPlan || undefined,
      });
      onCreated();
    } catch (e) {
      onError(e?.message ?? "Failed to create risk");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="+ Add risk" onClose={onClose} onSubmit={submit} busy={busy} disabled={!form.title || !form.cxProjectId}>
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
          Project
        </div>
        <select
          value={form.cxProjectId}
          onChange={set("cxProjectId")}
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
          <option value="">— Select project —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.projectName ?? p.name ?? p.id}
            </option>
          ))}
        </select>
      </div>
      <Field label="Title" v={form.title} on={set("title")} />
      <Field label="Description" v={form.description} on={set("description")} multiline />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 90px 90px", gap: 10 }}>
        <FieldSelect label="Category" v={form.category} on={set("category")} options={RISK_CATEGORIES} />
        <FieldSelect
          label="Probability"
          v={String(form.probability)}
          on={set("probability")}
          options={["1", "2", "3", "4", "5"]}
        />
        <FieldSelect
          label="Impact"
          v={String(form.impact)}
          on={set("impact")}
          options={["1", "2", "3", "4", "5"]}
        />
      </div>
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
          Owner (optional)
        </div>
        <select
          value={form.ownerUserId}
          onChange={set("ownerUserId")}
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
          <option value="">— Unassigned —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {[u.firstName, u.lastName].filter(Boolean).join(" ") ||
                u.email ||
                u.id}
            </option>
          ))}
        </select>
      </div>
      <Field label="Mitigation plan" v={form.mitigationPlan} on={set("mitigationPlan")} multiline />
      <div
        style={{
          fontSize: 11,
          background: C.bgSoft,
          padding: 8,
          borderRadius: 6,
          color: C.textSoft,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Score = {form.probability * form.impact} (band derived server-side)
      </div>
    </Modal>
  );
}

function CloseRiskModal({ risk, onClose, onClosed, onError }) {
  const [reason, setReason] = useState("MITIGATED");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await closeRisk(risk.id, { reason, notes: notes || undefined });
      onClosed();
    } catch (e) {
      onError(
        e?.message ??
          "Failed to close. MITIGATED requires every linked Issue to be CLOSED."
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={`Close risk · ${risk.title}`} onClose={onClose} onSubmit={submit} busy={busy}>
      <FieldSelect
        label="Close reason"
        v={reason}
        on={(e) => setReason(e.target.value)}
        options={RISK_CLOSE_REASONS}
      />
      <Field label="Notes (optional)" v={notes} on={(e) => setNotes(e.target.value)} multiline />
      <div
        style={{
          fontSize: 11,
          background: "#fef3c7",
          color: "#92400e",
          padding: 10,
          borderRadius: 8,
          lineHeight: 1.5,
        }}
      >
        <b>MITIGATED</b> requires every linked Issue to already be{" "}
        <b>CLOSED</b>. ACCEPTED / OBSOLETE accept any state.
      </div>
    </Modal>
  );
}

// ─── Modal scaffolding ──────────────────────────────────────────────────────

function Modal({ title, onClose, onSubmit, busy, disabled, children }) {
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
          <button onClick={onClose} style={btnSoft}>
            Cancel
          </button>
          <button onClick={onSubmit} disabled={busy || disabled} style={btnPri}>
            {busy ? "Saving…" : "Save"}
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
          value={v}
          onChange={on}
          style={{
            width: "100%",
            minHeight: 60,
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

function FieldSelect({ label, v, on, options }) {
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
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

const btnPri = {
  background: C.brand,
  color: "#fff",
  padding: "6px 12px",
  borderRadius: 6,
  border: 0,
  fontSize: 12,
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
