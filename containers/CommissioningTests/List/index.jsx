"use client";

// CommissioningTests · List view
// Mirrors cxcontrol_v2.html renderTestResults():
// - "Test results database" page header with pass/fail counts
// - Tabs: All · ❌ Failures · per-asset
// - Dense table: ASSET · PHASE · TEST · VALUE · THRESHOLD · RESULT · DATE/TECH
// - PASS/FAIL pill, fail rows tinted
// - Inline actions: + Log test result, Record witness on PASS

import { useEffect, useMemo, useState } from "react";
import {
  listCommissioningTests,
  recordTestResult,
  recordTestWitness,
  createCommissioningTest,
  TEST_TYPES,
  TEST_RESULTS,
  COMMISSIONING_PHASES,
} from "@/services/CommissioningTests";

// ─── Color tokens (mirrors HTML Cobalt + Citrine palette) ───────────────────
const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  borderStrong: "#cbd5e1",
  text: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  brand: "#1e40af",
  brandH: "#1e3a8a",
  brandSoft: "#dbeafe",
  brandFade: "#eff6ff",
  accent: "#f59e0b",
  green: "#16a34a",
  greenSoft: "#dcfce7",
  red: "#dc2626",
  redSoft: "#fee2e2",
  bgSoft: "#f1f5f9",
};

const RESULT_PILL = {
  PASS: { bg: C.greenSoft, fg: C.green, label: "PASS" },
  FAIL: { bg: C.redSoft, fg: C.red, label: "FAIL" },
  RETEST_REQUIRED: { bg: "#fef3c7", fg: "#92400e", label: "RETEST" },
  PENDING: { bg: "#e2e8f0", fg: C.textSoft, label: "PENDING" },
};

const Mono = ({ children, style = {}, ...rest }) => (
  <span
    style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11,
      ...style,
    }}
    {...rest}
  >
    {children}
  </span>
);

const Pill = ({ result }) => {
  const r = RESULT_PILL[result] ?? RESULT_PILL.PENDING;
  return (
    <span
      style={{
        background: r.bg,
        color: r.fg,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {r.label}
    </span>
  );
};

const Toast = ({ message, onClose }) => {
  if (!message) return null;
  return (
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
  );
};

export default function CommissioningTestsList({ cxProjectId }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // 'all' | 'fail' | <assetId>
  const [toast, setToast] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showWitness, setShowWitness] = useState(null); // testId
  const [showResult, setShowResult] = useState(null);   // testId

  // ── Load ──────────────────────────────────────────────────────────────────
  const reload = async () => {
    setLoading(true);
    try {
      const params = cxProjectId ? { cxProjectId, limit: 200 } : { limit: 200 };
      const page = await listCommissioningTests(params);
      setTests(page?.data ?? []);
    } catch (e) {
      setToast({ type: "error", text: e?.message ?? "Failed to load tests" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cxProjectId]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const assetIds = useMemo(
    () => Array.from(new Set(tests.map((t) => t.assetId).filter(Boolean))),
    [tests]
  );

  const totalPass = tests.filter((t) => t.result === "PASS").length;
  const totalFail = tests.filter((t) => t.result === "FAIL").length;

  const filtered = useMemo(() => {
    if (tab === "all") return tests;
    if (tab === "fail") return tests.filter((t) => t.result === "FAIL");
    return tests.filter((t) => t.assetId === tab);
  }, [tests, tab]);

  // ── Render ────────────────────────────────────────────────────────────────
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

      {/* Page header — mirrors pageH() from HTML */}
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
            Test results database
          </h1>
          <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6 }}>
            {tests.length} tests on file ·{" "}
            <b style={{ color: C.green }}>{totalPass} pass</b> ·{" "}
            <b style={{ color: C.red }}>{totalFail} fail</b>. NETA acceptance +
            maintenance test data per device.
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
          + Log test result
        </button>
      </div>

      {/* Help banner — mirrors HTML brand-fade callout */}
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
        💡 <b>Test results database.</b> Per ANSI/NETA ATS-2025, every
        electrical asset gets acceptance testing before energization.
        Insulation Resistance, Power Factor, Contact Resistance, Hi-Pot,
        Torque values logged per phase. PASS + witness auto-resolves any
        linked phase gate (TEST condition).
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <Tab
          active={tab === "all"}
          onClick={() => setTab("all")}
          label="All"
          count={tests.length}
        />
        <Tab
          active={tab === "fail"}
          onClick={() => setTab("fail")}
          label="❌ Failures"
          count={totalFail}
        />
        {assetIds.map((id) => (
          <Tab
            key={id}
            active={tab === id}
            onClick={() => setTab(id)}
            label={id.slice(0, 8)}
            count={tests.filter((t) => t.assetId === id).length}
          />
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <Row header>
          <div>ASSET</div>
          <div>PHASE</div>
          <div>TEST</div>
          <div>RESULT</div>
          <div>WITNESS</div>
          <div>DATE / TECH</div>
          <div>ACTIONS</div>
        </Row>

        {loading && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            Loading tests…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: 36, textAlign: "center", color: C.textMuted }}>
            No test results match this filter.
          </div>
        )}

        {!loading &&
          filtered.map((t) => {
            const failTint = t.result === "FAIL" ? "#fff1f2" : C.surface;
            return (
              <Row key={t.id} background={failTint} title={t.notes ?? ""}>
                <div>
                  <Mono style={{ color: C.brandH, fontWeight: 700 }}>
                    {t.assetId ? t.assetId.slice(0, 8) : "—"}
                  </Mono>
                </div>
                <div>
                  <Mono>{t.phase}</Mono>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.testName}</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>
                    {t.testType}
                  </div>
                </div>
                <div>
                  <Pill result={t.result} />
                </div>
                <div>
                  {t.witnessedAt ? (
                    <Mono style={{ color: C.green }}>
                      ✓ {t.witnessedByUserId?.slice(0, 8) ?? "witnessed"}
                    </Mono>
                  ) : t.result === "PASS" ? (
                    <span
                      style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}
                    >
                      Awaiting
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, color: C.textMuted }}>—</span>
                  )}
                </div>
                <div>
                  <Mono>
                    {t.performedAt
                      ? new Date(t.performedAt).toISOString().slice(0, 10)
                      : "—"}
                  </Mono>
                  <div style={{ fontSize: 10, color: C.textMuted }}>
                    {t.performedByUserId?.slice(0, 8) ?? ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {t.result === "PENDING" && (
                    <button
                      onClick={() => setShowResult(t.id)}
                      style={btnSoft(C)}
                    >
                      Record
                    </button>
                  )}
                  {t.result === "PASS" && !t.witnessedAt && (
                    <button
                      onClick={() => setShowWitness(t.id)}
                      style={btnPri(C)}
                    >
                      Witness
                    </button>
                  )}
                </div>
              </Row>
            );
          })}
      </div>

      {showCreate && (
        <CreateTestModal
          cxProjectId={cxProjectId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setToast({ type: "ok", text: "Test created (PENDING)" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}

      {showResult && (
        <RecordResultModal
          testId={showResult}
          onClose={() => setShowResult(null)}
          onSaved={() => {
            setShowResult(null);
            setToast({ type: "ok", text: "Result recorded" });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}

      {showWitness && (
        <RecordWitnessModal
          testId={showWitness}
          onClose={() => setShowWitness(null)}
          onSaved={() => {
            setShowWitness(null);
            setToast({
              type: "ok",
              text: "Witness recorded — any linked phase gate auto-resolved",
            });
            reload();
          }}
          onError={(text) => setToast({ type: "error", text })}
        />
      )}
    </div>
  );
}

// ─── Tab ────────────────────────────────────────────────────────────────────
function Tab({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        borderRadius: 8,
        background: active ? C.brand : C.surface,
        color: active ? "#fff" : C.textSoft,
        border: `1px solid ${active ? C.brand : C.border}`,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {label}
      <span
        style={{
          background: active ? "rgba(255,255,255,0.22)" : C.bgSoft,
          color: active ? "#fff" : C.textMuted,
          padding: "1px 7px",
          borderRadius: 999,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ─── Test row (7-col grid) ─────────────────────────────────────────────────
function Row({ children, header = false, background, title }) {
  return (
    <div
      title={title}
      style={{
        display: "grid",
        gridTemplateColumns:
          "120px 70px 1fr 100px 130px 130px 170px",
        gap: 14,
        padding: "12px 16px",
        background: header ? C.bgSoft : background ?? C.surface,
        borderTop: header ? "none" : `1px solid ${C.border}`,
        alignItems: "center",
        fontSize: header ? 10 : 13,
        fontWeight: header ? 700 : 400,
        textTransform: header ? "uppercase" : "none",
        letterSpacing: header ? "0.05em" : "normal",
        color: header ? C.textMuted : C.text,
        fontFamily: header ? "'JetBrains Mono', monospace" : "inherit",
      }}
    >
      {children}
    </div>
  );
}

const btnPri = (C) => ({
  background: C.brand,
  color: "#fff",
  padding: "5px 10px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  border: 0,
  cursor: "pointer",
});

const btnSoft = (C) => ({
  background: C.brandFade,
  color: C.brandH,
  padding: "5px 10px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 600,
  border: `1px solid ${C.brandSoft}`,
  cursor: "pointer",
});

// ─── Modals ─────────────────────────────────────────────────────────────────

function ModalShell({ title, onClose, children, footer }) {
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
          {title}
        </div>
        <div style={{ padding: 20 }}>{children}</div>
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
          {footer}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${C.border}`,
  borderRadius: 8,
  fontSize: 13,
  background: C.surface,
  color: C.text,
  marginTop: 4,
};

const labelStyle = {
  fontSize: 11,
  color: C.textSoft,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontWeight: 600,
};

function CreateTestModal({ cxProjectId, onClose, onCreated, onError }) {
  const [form, setForm] = useState({
    cxProjectId: cxProjectId ?? "",
    assetId: "",
    phase: "L2",
    testType: "INSULATION_RESISTANCE",
    testName: "",
    specification: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setBusy(true);
    try {
      await createCommissioningTest({
        cxProjectId: form.cxProjectId,
        assetId: form.assetId || undefined,
        phase: form.phase,
        testType: form.testType,
        testName: form.testName,
        specification: form.specification || undefined,
      });
      onCreated();
    } catch (e) {
      onError(e?.message ?? "Failed to create test");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="+ Log new test"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} style={btnSoft(C)}>
            Cancel
          </button>
          <button onClick={submit} disabled={busy || !form.testName} style={btnPri(C)}>
            {busy ? "Creating…" : "Create test"}
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={labelStyle}>CxProject ID</div>
          <input style={inputStyle} value={form.cxProjectId} onChange={set("cxProjectId")} />
        </div>
        <div>
          <div style={labelStyle}>Asset ID (optional)</div>
          <input style={inputStyle} value={form.assetId} onChange={set("assetId")} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={labelStyle}>Phase</div>
            <select style={inputStyle} value={form.phase} onChange={set("phase")}>
              {COMMISSIONING_PHASES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={labelStyle}>Test type</div>
            <select style={inputStyle} value={form.testType} onChange={set("testType")}>
              {TEST_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <div style={labelStyle}>Test name</div>
          <input style={inputStyle} value={form.testName} onChange={set("testName")} />
        </div>
        <div>
          <div style={labelStyle}>Specification / acceptance criteria</div>
          <textarea
            style={{ ...inputStyle, minHeight: 80 }}
            value={form.specification}
            onChange={set("specification")}
          />
        </div>
      </div>
    </ModalShell>
  );
}

function RecordResultModal({ testId, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    result: "PASS",
    notes: "",
    measuredValues: "",
    performedByUserId: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setBusy(true);
    try {
      let measured;
      if (form.measuredValues.trim()) {
        try {
          measured = JSON.parse(form.measuredValues);
        } catch {
          throw new Error("measuredValues must be valid JSON");
        }
      }
      await recordTestResult(testId, {
        result: form.result,
        measuredValues: measured,
        notes: form.notes || undefined,
        performedByUserId: form.performedByUserId,
      });
      onSaved();
    } catch (e) {
      onError(e?.message ?? "Failed to record result");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="Record test result"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} style={btnSoft(C)}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || !form.performedByUserId}
            style={btnPri(C)}
          >
            {busy ? "Saving…" : "Save result"}
          </button>
        </>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={labelStyle}>Result</div>
          <select style={inputStyle} value={form.result} onChange={set("result")}>
            {TEST_RESULTS.filter((r) => r !== "PENDING").map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={labelStyle}>Performed by (user ID)</div>
          <input
            style={inputStyle}
            value={form.performedByUserId}
            onChange={set("performedByUserId")}
          />
        </div>
        <div>
          <div style={labelStyle}>Measured values (JSON)</div>
          <textarea
            placeholder='e.g. { "phase_A_megohms": 5200, "phase_B_megohms": 5100 }'
            style={{
              ...inputStyle,
              minHeight: 80,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
            }}
            value={form.measuredValues}
            onChange={set("measuredValues")}
          />
        </div>
        <div>
          <div style={labelStyle}>Notes</div>
          <textarea
            style={{ ...inputStyle, minHeight: 60 }}
            value={form.notes}
            onChange={set("notes")}
          />
        </div>
      </div>
    </ModalShell>
  );
}

function RecordWitnessModal({ testId, onClose, onSaved, onError }) {
  const [form, setForm] = useState({
    witnessedByUserId: "",
    witnessedByCompanyId: "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setBusy(true);
    try {
      await recordTestWitness(testId, {
        witnessedByUserId: form.witnessedByUserId,
        witnessedByCompanyId: form.witnessedByCompanyId || undefined,
      });
      onSaved();
    } catch (e) {
      onError(e?.message ?? "Failed to record witness");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      title="Record witness sign-off"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} style={btnSoft(C)}>
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || !form.witnessedByUserId}
            style={btnPri(C)}
          >
            {busy ? "Saving…" : "Witness"}
          </button>
        </>
      }
    >
      <div
        style={{
          background: C.brandFade,
          border: `1px solid ${C.brandSoft}`,
          padding: "10px 12px",
          borderRadius: 8,
          fontSize: 12,
          color: C.brandH,
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        Witness must be a CxA, GC QA/QC, or customer rep. After saving, any
        linked phase gate (TEST condition) auto-resolves.
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <div>
          <div style={labelStyle}>Witnessed by (user ID)</div>
          <input
            style={inputStyle}
            value={form.witnessedByUserId}
            onChange={set("witnessedByUserId")}
          />
        </div>
        <div>
          <div style={labelStyle}>Witness company (optional)</div>
          <input
            style={inputStyle}
            value={form.witnessedByCompanyId}
            onChange={set("witnessedByCompanyId")}
          />
        </div>
      </div>
    </ModalShell>
  );
}
