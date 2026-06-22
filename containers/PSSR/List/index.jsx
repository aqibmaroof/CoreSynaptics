"use client";

// PSSR · List view
// Mirrors cxcontrol_v2.html renderPSSR():
// - Page header with total items + status legend
// - Status-priority sorted table
// - Category cards showing the 6 PSSR_TEMPLATE buckets
// - Inline create modal (uses default template if items[] omitted)

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  listPssrInspections,
  createPssrInspection,
  PSSR_STATUSES,
  PSSR_CATEGORIES,
  PSSR_CATEGORY_LABELS,
} from "@/services/PSSR";
import { listV2Projects } from "@/services/CxProjectsV2";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";
import { required, lengthBetween, collectErrors } from "@/Utils/validation";

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
  accent: "#f59e0b",
  green: "#16a34a",
  red: "#dc2626",
  bgSoft: "#f1f5f9",
};

const STATUS_PILL = {
  DRAFT: { bg: "#e2e8f0", fg: C.textSoft, label: "Draft" },
  WALKED: { bg: C.brandFade, fg: C.brandH, label: "Walked" },
  PUNCHLIST_OPEN: { bg: "#fef3c7", fg: "#92400e", label: "Punchlist open" },
  PUNCHLIST_CLOSED: { bg: "#dcfce7", fg: C.green, label: "Punchlist closed" },
  SIGNED: { bg: C.brand, fg: "#fff", label: "Signed" },
};

const STATUS_PRIORITY = {
  PUNCHLIST_OPEN: 0,
  WALKED: 1,
  DRAFT: 2,
  PUNCHLIST_CLOSED: 3,
  SIGNED: 4,
};

const Pill = ({ s }) => {
  const v = STATUS_PILL[s] ?? STATUS_PILL.DRAFT;
  return (
    <span
      style={{
        background: v.bg,
        color: v.fg,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {v.label}
    </span>
  );
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
      }}
    >
      {message.text}
    </div>
  ) : null;

export default function PSSRList({ cxProjectId }) {
  const router = useRouter();
  const { canCreate, canEdit, canApprove } = useUserPermissions();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const params = cxProjectId ? { cxProjectId, limit: 100 } : { limit: 100 };
      const page = await listPssrInspections(params);
      setItems(page?.data ?? []);
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to load" });
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

  const sorted = [...items].sort(
    (a, b) =>
      (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
  );

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
            PSSR · Pre-Startup Safety Review
          </h1>
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            OSHA 29 CFR 1910.119 pre-energization review · 6 categories ·
            non-compliant items auto-create finding Issues (kind=PUNCH_LIST).
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          {...permissionProps(canCreate(MODULE.PSSR), "initiate a PSSR")}
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
          + Initiate PSSR
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
        <b>PSSR (Pre-Startup Safety Review)</b> is the GC QA/QC&apos;s final gate
        before authorizing energization. All items must PASS (or be formally
        waived) before sign-off. Each non-compliant answer spawns an{" "}
        <b>Issue (PUNCH_LIST)</b> linked back to the inspection.
      </div>

      {/* Inspection table */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 18,
        }}
      >
        <Header />
        {loading && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            Loading…
          </div>
        )}
        {!loading && sorted.length === 0 && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            No PSSR inspections yet. Click &quot;+ Initiate PSSR&quot; to create
            one.
          </div>
        )}
        {!loading &&
          sorted.map((p) => (
            <Row
              key={p.id}
              onClick={() => router.push(`/PSSR/${p.id}`)}
              cells={[
                <span
                  key="t"
                  style={{
                    fontWeight: 600,
                    color: C.brandH,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                  }}
                >
                  {p.title}
                </span>,
                <Pill key="s" s={p.status} />,
                <span key="prog">
                  {p.compliantItems}/{p.totalItems} compliant
                  {p.openFindings > 0 && (
                    <span style={{ color: C.red, marginLeft: 6 }}>
                      · {p.openFindings} open finding
                      {p.openFindings === 1 ? "" : "s"}
                    </span>
                  )}
                </span>,
                <span key="w" style={{ fontSize: 11, color: C.textMuted }}>
                  {p.walkedAt ? new Date(p.walkedAt).toLocaleDateString() : "—"}
                </span>,
                <span key="sg" style={{ fontSize: 11, color: C.textMuted }}>
                  {p.signedAt ? new Date(p.signedAt).toLocaleDateString() : "—"}
                </span>,
                <span key="sb" style={{ fontSize: 11, color: C.textMuted }}>
                  {p.signedBy?.slice(0, 8) ?? "—"}
                </span>,
              ]}
            />
          ))}
      </div>

      {/* Category cards (mirrors HTML pssr-cat-grid) */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 18,
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
          PSSR template · 6 categories
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {PSSR_CATEGORIES.map((cat) => (
            <div
              key={cat}
              style={{
                background: C.bgSoft,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: C.brandH }}>
                {PSSR_CATEGORY_LABELS[cat]}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginTop: 4,
                }}
              >
                {cat}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCreate && (
        <CreateModal
          cxProjectId={cxProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={(detail) => {
            setShowCreate(false);
            setToast({
              type: "ok",
              text: `Inspection created with ${detail.items?.length ?? 0} items`,
            });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 0.9fr 1.4fr 0.9fr 0.9fr 0.9fr",
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
      <div>TITLE</div>
      <div>STATUS</div>
      <div>PROGRESS</div>
      <div>WALKED</div>
      <div>SIGNED</div>
      <div>SIGNED BY</div>
    </div>
  );
}

function Row({ cells, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 0.9fr 1.4fr 0.9fr 0.9fr 0.9fr",
        gap: 14,
        padding: "12px 16px",
        borderTop: `1px solid ${C.border}`,
        alignItems: "center",
        fontSize: 13,
        cursor: "pointer",
        background: C.surface,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.bgSoft)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.surface)}
    >
      {cells.map((c, i) => (
        <div key={i}>{c}</div>
      ))}
    </div>
  );
}

const EMPTY_FORM = {
  cxProjectId: "",
  assetId: "",
  title: "",
  description: "",
};

function CreateModal({ cxProjectId, onClose, onCreated, onError }) {
  const [form, setForm] = useState({
    ...EMPTY_FORM,
    cxProjectId: cxProjectId ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [projects, setProjects] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setFieldErrors((prev) => (prev[k] ? { ...prev, [k]: "" } : prev));
  };

  // RPI_TC_048 — clear all form state before delegating to the parent close.
  const handleClose = () => {
    setForm({ ...EMPTY_FORM, cxProjectId: cxProjectId ?? "" });
    setFieldErrors({});
    onClose();
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
    })();
    return () => {
      alive = false;
    };
  }, []);

  // RPI_TC_054 — Esc closes the modal (and resets state via handleClose).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // RPI_TC_016/017/035/045 — Title required + max 120, Project required, with
  // inline per-field messages.
  const validate = () =>
    collectErrors({
      cxProjectId: required(form.cxProjectId, "Project"),
      title:
        required(form.title, "Title") ||
        lengthBetween(form.title, { max: 120, label: "Title" }),
    });

  const submit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    try {
      const detail = await createPssrInspection({
        cxProjectId: form.cxProjectId,
        assetId: form.assetId || undefined,
        title: form.title,
        description: form.description || undefined,
        // items omitted → backend seeds default 6-category template
      });
      onCreated(detail);
    } catch (e) {
      onError(e?.message ?? "Failed to create inspection");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={handleClose}
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
          width: 520,
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
          + Initiate PSSR inspection
        </div>
        <form onSubmit={submit}>
        <div style={{ padding: 20, display: "grid", gap: 12 }}>
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
                border: `1px solid ${fieldErrors.cxProjectId ? C.red : C.border}`,
                borderRadius: 8,
                fontSize: 13,
                background: C.surface,
                marginTop: 4,
              }}
            >
              <option value="">— Select project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectName ?? p.name ?? p.id}
                </option>
              ))}
            </select>
            {fieldErrors.cxProjectId && <ErrText>{fieldErrors.cxProjectId}</ErrText>}
          </div>
          <Field label="Asset ID (optional)" v={form.assetId} on={set("assetId")} />
          <Field
            label="Title"
            v={form.title}
            on={set("title")}
            error={fieldErrors.title}
            maxLength={120}
          />
          <Field label="Description" v={form.description} on={set("description")} multiline />
          <div
            style={{
              fontSize: 11,
              color: C.textSoft,
              background: C.brandFade,
              border: `1px solid ${C.brandSoft}`,
              padding: 10,
              borderRadius: 8,
              lineHeight: 1.5,
            }}
          >
            ℹ Items omitted → backend seeds the default 6-category template
            (~37 items) from cxcontrol_v2.html PSSR_TEMPLATE.
          </div>
        </div>
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
          <button
            type="button"
            onClick={handleClose}
            style={{
              background: C.brandFade,
              color: C.brandH,
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${C.brandSoft}`,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            style={{
              background: C.brand,
              color: "#fff",
              padding: "6px 14px",
              borderRadius: 6,
              border: 0,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              opacity: busy ? 0.5 : 1,
            }}
          >
            {busy ? "Creating…" : "Create inspection"}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}

function ErrText({ children }) {
  return (
    <div style={{ marginTop: 5, fontSize: 12, fontWeight: 600, color: C.red }}>
      {children}
    </div>
  );
}

function Field({ label, v, on, multiline, error, maxLength }) {
  const borderColor = error ? C.red : C.border;
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
            minHeight: 70,
            padding: "8px 10px",
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.surface,
            marginTop: 4,
          }}
        />
      ) : (
        <input
          value={v}
          onChange={on}
          maxLength={maxLength}
          style={{
            width: "100%",
            padding: "8px 10px",
            border: `1px solid ${borderColor}`,
            borderRadius: 8,
            fontSize: 13,
            background: C.surface,
            marginTop: 4,
          }}
        />
      )}
      {error && <ErrText>{error}</ErrText>}
    </div>
  );
}
