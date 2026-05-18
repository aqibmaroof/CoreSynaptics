"use client";

// PSSR · Detail view
// 6-category accordion, per-item compliant/not-compliant + notes,
// finding-issue link surfaced inline, sign button gated on openFindings=0.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getPssrInspection,
  startPssrWalk,
  answerPssrItem,
  signPssrInspection,
  PSSR_CATEGORIES,
  PSSR_CATEGORY_LABELS,
} from "@/services/PSSR";

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
  greenSoft: "#dcfce7",
  red: "#dc2626",
  redSoft: "#fee2e2",
  amber: "#f59e0b",
  amberSoft: "#fef3c7",
  bgSoft: "#f1f5f9",
};

const STATUS_PILL = {
  DRAFT: { bg: "#e2e8f0", fg: C.textSoft, label: "Draft" },
  WALKED: { bg: C.brandFade, fg: C.brandH, label: "Walked" },
  PUNCHLIST_OPEN: { bg: C.amberSoft, fg: "#92400e", label: "Punchlist open" },
  PUNCHLIST_CLOSED: { bg: C.greenSoft, fg: C.green, label: "Punchlist closed" },
  SIGNED: { bg: C.brand, fg: "#fff", label: "Signed" },
};

const Pill = ({ s }) => {
  const v = STATUS_PILL[s] ?? STATUS_PILL.DRAFT;
  return (
    <span
      style={{
        background: v.bg,
        color: v.fg,
        padding: "4px 12px",
        borderRadius: 999,
        fontSize: 12,
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
        maxWidth: 420,
      }}
    >
      {message.text}
    </div>
  ) : null;

export default function PSSRDetail({ id }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const [openCats, setOpenCats] = useState(() => new Set(PSSR_CATEGORIES));

  const reload = async () => {
    setLoading(true);
    try {
      setData(await getPssrInspection(id));
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to load" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (loading || !data) {
    return (
      <div
        style={{
          padding: 36,
          textAlign: "center",
          color: C.textMuted,
          background: C.bg,
          minHeight: "100vh",
        }}
      >
        Loading inspection…
      </div>
    );
  }

  const { items = [] } = data;
  const grouped = PSSR_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.category === cat);
    return acc;
  }, {});

  const canStartWalk = data.status === "DRAFT" && items.length > 0;
  const canSign =
    (data.status === "WALKED" || data.status === "PUNCHLIST_CLOSED") &&
    data.openFindings === 0;
  const isSigned = data.status === "SIGNED";

  const onStart = async () => {
    setBusy(true);
    try {
      await startPssrWalk(id);
      setToast({ type: "ok", text: "Walk started" });
      reload();
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed" });
    } finally {
      setBusy(false);
    }
  };

  const onSign = async () => {
    setBusy(true);
    try {
      await signPssrInspection(id);
      setToast({ type: "ok", text: "Inspection signed (terminal)" });
      reload();
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Cannot sign" });
    } finally {
      setBusy(false);
    }
  };

  const toggleCat = (cat) => {
    const next = new Set(openCats);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    setOpenCats(next);
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

      {/* Header */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: C.textMuted,
              }}
            >
              PSSR · {data.id.slice(0, 8)}
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                marginTop: 4,
                letterSpacing: "-0.01em",
              }}
            >
              {data.title}
            </h1>
            {data.description && (
              <div
                style={{
                  marginTop: 6,
                  color: C.textSoft,
                  fontSize: 13,
                  maxWidth: 720,
                }}
              >
                {data.description}
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <Pill s={data.status} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {canStartWalk && (
              <button onClick={onStart} disabled={busy} style={btnPri}>
                {busy ? "Working…" : "Start walk"}
              </button>
            )}
            {canSign && (
              <button onClick={onSign} disabled={busy} style={btnPri}>
                {busy ? "Working…" : "Sign inspection"}
              </button>
            )}
            {isSigned && (
              <span
                style={{
                  fontSize: 12,
                  color: C.textMuted,
                  alignSelf: "center",
                }}
              >
                Signed by {data.signedBy?.slice(0, 8)} on{" "}
                {new Date(data.signedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginTop: 18,
          }}
        >
          <Stat label="Total items" v={data.totalItems} />
          <Stat label="Compliant" v={data.compliantItems} color={C.green} />
          <Stat
            label="Open findings"
            v={data.openFindings}
            color={data.openFindings > 0 ? C.red : C.textMuted}
          />
          <Stat
            label="Walked"
            v={
              data.walkedAt
                ? new Date(data.walkedAt).toLocaleDateString()
                : "—"
            }
          />
        </div>
      </div>

      {/* Category accordion */}
      {PSSR_CATEGORIES.map((cat) => {
        const list = grouped[cat] ?? [];
        if (list.length === 0) return null;
        const compliant = list.filter((i) => i.compliant === true).length;
        const finding = list.filter((i) => i.compliant === false).length;
        const open = openCats.has(cat);
        return (
          <div
            key={cat}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => toggleCat(cat)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                background: open ? C.brandFade : C.bgSoft,
                border: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.brandH }}>
                  {open ? "▾" : "▸"} {PSSR_CATEGORY_LABELS[cat]}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 2,
                  }}
                >
                  {list.length} items · {compliant} compliant ·{" "}
                  <span style={{ color: finding > 0 ? C.red : C.textMuted }}>
                    {finding} finding{finding === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </button>
            {open && (
              <div>
                {list.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    locked={isSigned || data.status === "DRAFT"}
                    onAnswered={() => {
                      reload();
                      setToast({
                        type: "ok",
                        text: "Answer saved · counts refreshed",
                      });
                    }}
                    onError={(text) => setToast({ type: "error", text })}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Stat({ label, v, color }) {
  return (
    <div
      style={{
        background: C.bgSoft,
        border: `1px solid ${C.border}`,
        padding: "10px 14px",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: C.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginTop: 4,
          color: color ?? C.text,
        }}
      >
        {v}
      </div>
    </div>
  );
}

function ItemRow({ item, locked, onAnswered, onError }) {
  const [showForm, setShowForm] = useState(false);
  const [compliant, setCompliant] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await answerPssrItem(item.id, { compliant, notes: notes || undefined });
      setShowForm(false);
      setNotes("");
      onAnswered();
    } catch (e) {
      onError(e?.message ?? "Failed to answer");
    } finally {
      setBusy(false);
    }
  };

  const answered = item.compliant !== null && item.compliant !== undefined;

  return (
    <div
      style={{
        padding: "12px 18px",
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: C.text }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: C.textMuted,
              marginRight: 8,
            }}
          >
            #{item.sequence}
          </span>
          {item.prompt}
        </div>
        {item.notes && (
          <div
            style={{
              fontSize: 11,
              color: C.textSoft,
              marginTop: 4,
              fontStyle: "italic",
            }}
          >
            “{item.notes}”
          </div>
        )}
        {item.findingIssueId && (
          <Link
            href={`/CxIssues?focus=${item.findingIssueId}`}
            style={{
              display: "inline-block",
              fontSize: 11,
              color: C.red,
              marginTop: 4,
              fontFamily: "'JetBrains Mono', monospace",
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
            title="Open the linked PUNCH_LIST issue"
          >
            ↳ Finding: Issue {item.findingIssueId.slice(0, 8)} (PUNCH_LIST) →
          </Link>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {answered && (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: item.compliant ? C.greenSoft : C.redSoft,
              color: item.compliant ? C.green : C.red,
            }}
          >
            {item.compliant ? "Compliant" : "Finding"}
          </span>
        )}
        {!answered && !locked && !showForm && (
          <button onClick={() => setShowForm(true)} style={btnSoft}>
            Answer
          </button>
        )}
        {showForm && !locked && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              alignItems: "flex-end",
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setCompliant(true)}
                style={{
                  ...btnSoft,
                  background: compliant ? C.greenSoft : C.bgSoft,
                  color: compliant ? C.green : C.textSoft,
                  borderColor: compliant ? C.green : C.border,
                }}
              >
                Compliant
              </button>
              <button
                onClick={() => setCompliant(false)}
                style={{
                  ...btnSoft,
                  background: !compliant ? C.redSoft : C.bgSoft,
                  color: !compliant ? C.red : C.textSoft,
                  borderColor: !compliant ? C.red : C.border,
                }}
              >
                Finding
              </button>
            </div>
            <input
              placeholder={
                compliant ? "Note (optional)" : "Required: describe finding"
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: 260,
                padding: "5px 8px",
                fontSize: 12,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
              }}
            />
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ ...btnSoft, padding: "4px 10px" }}
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={busy}
                style={{ ...btnPri, padding: "4px 10px" }}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>
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
