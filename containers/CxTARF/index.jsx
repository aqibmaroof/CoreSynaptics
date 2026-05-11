"use client";

// CxControl TARF (Trade Access Request Form) — two-stage GC funnel
// PENDING_GC → PENDING_CUSTOMER → APPROVED, REJECTED terminal.
// Approval buttons are stage-specific; sign-in gated on APPROVED + safety oriented.

import { useEffect, useState } from "react";
import {
  getTARFs,
  approveTARF,
  customerApproveTARF,
  rejectTARF,
  signInTARF,
  signOutTARF,
  TARF_STAGE_LABELS,
} from "@/services/TARF";

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
  amber: "#f59e0b",
  amberSoft: "#fef3c7",
  cyan: "#0891b2",
  cyanSoft: "#cffafe",
  bgSoft: "#f1f5f9",
};

const STAGE_PILL = {
  PENDING_GC: { bg: C.amberSoft, fg: "#92400e" },
  PENDING_CUSTOMER: { bg: C.cyanSoft, fg: "#155e75" },
  APPROVED: { bg: C.greenSoft, fg: "#15803d" },
  REJECTED: { bg: "#fee2e2", fg: C.red },
};

const Pill = ({ s }) => {
  const v = STAGE_PILL[s] ?? STAGE_PILL.PENDING_GC;
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
      {TARF_STAGE_LABELS[s] ?? s}
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
        maxWidth: 480,
      }}
    >
      {message.text}
    </div>
  ) : null;

const TABS = ["ALL", "PENDING_GC", "PENDING_CUSTOMER", "APPROVED", "REJECTED"];

export default function CxTARF({
  cxProjectId,
  isGcReviewer = false,
  isCustomerReviewer = false,
  isGateStaff = false,
}) {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showReject, setShowReject] = useState(null);

  const reload = async () => {
    setLoading(true);
    try {
      const params = cxProjectId ? { cxProjectId } : {};
      const list = await getTARFs(params);
      setItems(Array.isArray(list) ? list : list?.data ?? []);
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

  const filtered =
    tab === "ALL" ? items : items.filter((t) => t.approvalStage === tab);

  const counts = {
    ALL: items.length,
    PENDING_GC: items.filter((t) => t.approvalStage === "PENDING_GC").length,
    PENDING_CUSTOMER: items.filter((t) => t.approvalStage === "PENDING_CUSTOMER").length,
    APPROVED: items.filter((t) => t.approvalStage === "APPROVED").length,
    REJECTED: items.filter((t) => t.approvalStage === "REJECTED").length,
  };

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

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
          TARF · Trade Access Requests
        </h1>
        <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
          Two-stage funnel: <b>PENDING_GC</b> → GC reviews → <b>PENDING_CUSTOMER</b>{" "}
          → customer accepts → <b>APPROVED</b>. Site sign-in only on APPROVED +
          safety oriented.
        </div>
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
            {t === "ALL" ? "All" : TARF_STAGE_LABELS[t]}
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
            gridTemplateColumns:
              "1.4fr 1fr 130px 130px 1fr 110px 200px",
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
          <div>PERSON</div>
          <div>ROLE</div>
          <div>FROM</div>
          <div>TO</div>
          <div>COMPANY</div>
          <div>STAGE</div>
          <div>ACTIONS</div>
        </div>

        {loading && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            Loading TARFs…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            No TARFs in this stage.
          </div>
        )}
        {!loading &&
          filtered.map((t) => (
            <div
              key={t.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1.4fr 1fr 130px 130px 1fr 110px 200px",
                gap: 14,
                padding: "12px 16px",
                borderTop: `1px solid ${C.border}`,
                alignItems: "center",
                fontSize: 13,
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>{t.personName}</div>
                {t.isActiveSession && (
                  <div
                    style={{
                      fontSize: 10,
                      color: C.green,
                      fontWeight: 700,
                      marginTop: 2,
                    }}
                  >
                    ● ON SITE
                  </div>
                )}
                {t.isExpired && (
                  <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>
                    expired
                  </div>
                )}
              </div>
              <div style={{ fontSize: 12, color: C.textSoft }}>{t.roleOnSite}</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: C.textSoft,
                }}
              >
                {fmt(t.expectedStart)}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: C.textSoft,
                }}
              >
                {fmt(t.expectedEnd)}
              </div>
              <div style={{ fontSize: 12 }}>{t.companyName}</div>
              <div>
                <Pill s={t.approvalStage} />
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {t.approvalStage === "PENDING_GC" && isGcReviewer && (
                  <button
                    style={btnPri}
                    onClick={() => act(() => approveTARF(t.id), "GC approved")}
                  >
                    GC Approve
                  </button>
                )}
                {t.approvalStage === "PENDING_CUSTOMER" && isCustomerReviewer && (
                  <button
                    style={btnPri}
                    onClick={() =>
                      act(() => customerApproveTARF(t.id), "Customer accepted")
                    }
                  >
                    Customer Approve
                  </button>
                )}
                {(t.approvalStage === "PENDING_GC" ||
                  t.approvalStage === "PENDING_CUSTOMER") && (
                  <button
                    style={{ ...btnSoft, color: C.red, borderColor: "#fecaca" }}
                    onClick={() => setShowReject(t)}
                  >
                    Reject
                  </button>
                )}
                {t.approvalStage === "APPROVED" &&
                  t.safetyOrientationComplete &&
                  !t.isActiveSession &&
                  !t.isExpired &&
                  isGateStaff && (
                    <button
                      style={btnPri}
                      onClick={() => act(() => signInTARF(t.id), "Signed in")}
                    >
                      Sign in
                    </button>
                  )}
                {t.isActiveSession && isGateStaff && (
                  <button
                    style={btnSoft}
                    onClick={() => act(() => signOutTARF(t.id), "Signed out")}
                  >
                    Sign out
                  </button>
                )}
                {t.approvalStage === "APPROVED" &&
                  !t.safetyOrientationComplete && (
                    <span
                      style={{
                        fontSize: 10,
                        color: C.amber,
                        fontWeight: 600,
                      }}
                    >
                      Safety orient. needed
                    </span>
                  )}
              </div>
            </div>
          ))}
      </div>

      {showReject && (
        <RejectModal
          tarf={showReject}
          onClose={() => setShowReject(null)}
          onRejected={() => {
            setShowReject(null);
            setToast({ type: "ok", text: "Rejected" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}
    </div>
  );
}

function RejectModal({ tarf, onClose, onRejected, onError }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await rejectTARF(tarf.id, { reason });
      onRejected();
    } catch (e) {
      onError(e?.message ?? "Failed");
    } finally {
      setBusy(false);
    }
  };
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
          width: 480,
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
          Reject TARF · {tarf.personName}
        </div>
        <div style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: C.textSoft,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontWeight: 600,
            }}
          >
            Reason (optional)
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{
              width: "100%",
              minHeight: 80,
              padding: "8px 10px",
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              marginTop: 4,
              fontSize: 13,
            }}
          />
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
          <button onClick={onClose} style={btnSoft}>Cancel</button>
          <button onClick={submit} disabled={busy} style={btnPri}>
            {busy ? "…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

const fmt = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString();
};

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
