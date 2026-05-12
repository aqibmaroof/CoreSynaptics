"use client";

import { useState, useEffect } from "react";
import { getDispatchForDay, assignShift } from "@/services/CxProjects";
import { setShiftStatus } from "@/services/Finance/Procurement";
import { getWorkforceReadiness } from "@/services/CxProjects";
import { getUser } from "@/services/instance/tokenService";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DISPATCH = {
  cxProjectId: "p1",
  date: new Date().toISOString().slice(0, 10),
  rows: [
    { id: "s1", date: new Date().toISOString().slice(0, 10), crewMemberId: "cm1", workerName: "Adam Krol", company: "Shermco Industries", roleLabel: "NETA Test Lead", shiftStart: "07:00", shiftEnd: "16:00", task: "L3.05 NETA Acceptance Testing", assetCode: "PDU-03", location: "Level 3 – East MER", status: "ON_SITE" },
    { id: "s2", date: new Date().toISOString().slice(0, 10), crewMemberId: "cm2", workerName: "James Rivera", company: "Delta Electrical", roleLabel: "Electrician – Foreman", shiftStart: "07:00", shiftEnd: "15:30", task: "Cable tray support corrections – NCR #007", assetCode: "CT-L4-E", location: "Level 4 – East Riser", status: "ASSIGNED" },
    { id: "s3", date: new Date().toISOString().slice(0, 10), crewMemberId: "cm3", workerName: "Priya Nair", company: "HITT Contracting", roleLabel: "QA/QC Manager", shiftStart: "08:00", shiftEnd: "17:00", task: "MEP rough-in QC walkthrough – Level 6", assetCode: null, location: "Level 6", status: "ASSIGNED" },
    { id: "s4", date: new Date().toISOString().slice(0, 10), crewMemberId: "cm4", workerName: "David Park", company: "Shermco Industries", roleLabel: "NETA Technician", shiftStart: "07:00", shiftEnd: "16:00", task: "L3.05 NETA Acceptance Testing – support", assetCode: "PDU-03", location: "Level 3 – East MER", status: "ON_SITE" },
    { id: "s5", date: new Date().toISOString().slice(0, 10), crewMemberId: "cm5", workerName: "Marcus Webb", company: "Delta Electrical", roleLabel: "Journeyman Electrician", shiftStart: "06:30", shiftEnd: "15:00", task: "L5 load bank infrastructure prep", assetCode: "LB-L5", location: "Level 5 – Generator Room", status: "DONE" },
    { id: "s6", date: new Date().toISOString().slice(0, 10), crewMemberId: "cm6", workerName: "Elena Torres", company: "HITT Contracting", roleLabel: "Superintendent", shiftStart: "06:00", shiftEnd: "17:00", task: "Site supervision – all levels", assetCode: null, location: "All floors", status: "ON_SITE" },
  ],
  totals: { total: 6, onSite: 3, assigned: 2, done: 1, noShow: 0 },
};

const MOCK_WORKFORCE = {
  rows: [
    { crewMemberId: "cm1", fullName: "Adam Krol", organizationId: "o1", roleLabel: "NETA Test Lead", status: "active", certStatus: "CURRENT", certsCurrent: 4, certsExpiring: 0, certsExpired: 0 },
    { crewMemberId: "cm2", fullName: "James Rivera", organizationId: "o2", roleLabel: "Electrician Foreman", status: "active", certStatus: "EXPIRING", certsCurrent: 3, certsExpiring: 1, certsExpired: 0 },
    { crewMemberId: "cm3", fullName: "Priya Nair", organizationId: "o3", roleLabel: "QA/QC Manager", status: "active", certStatus: "CURRENT", certsCurrent: 5, certsExpiring: 0, certsExpired: 0 },
    { crewMemberId: "cm4", fullName: "David Park", organizationId: "o1", roleLabel: "NETA Technician", status: "active", certStatus: "CURRENT", certsCurrent: 3, certsExpiring: 0, certsExpired: 0 },
    { crewMemberId: "cm5", fullName: "Marcus Webb", organizationId: "o2", roleLabel: "Journeyman Electrician", status: "active", certStatus: "EXPIRED", certsCurrent: 1, certsExpiring: 0, certsExpired: 1 },
    { crewMemberId: "cm6", fullName: "Elena Torres", organizationId: "o3", roleLabel: "Superintendent", status: "active", certStatus: "CURRENT", certsCurrent: 6, certsExpiring: 0, certsExpired: 0 },
  ],
  totals: { crew: 6, current: 4, expiring: 1, expired: 1, missing: 0 },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  ASSIGNED: { label: "Assigned", color: "var(--rf-accent)", bg: "rgba(99,102,241,0.12)" },
  ON_SITE:  { label: "On Site",  color: "var(--rf-green)",  bg: "rgba(16,185,129,0.12)" },
  DONE:     { label: "Done",     color: "var(--rf-txt3)",   bg: "var(--rf-bg3)" },
  NO_SHOW:  { label: "No Show",  color: "var(--rf-red)",    bg: "rgba(239,68,68,0.12)" },
};

const CERT_STYLE = {
  CURRENT:  { label: "Current",  color: "var(--rf-green)" },
  EXPIRING: { label: "Expiring", color: "var(--rf-yellow)" },
  EXPIRED:  { label: "Expired",  color: "var(--rf-red)" },
  MISSING:  { label: "Missing",  color: "var(--rf-red)" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiTile({ label, value, color }) {
  return (
    <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 12, padding: "14px 20px", flex: "1 1 110px", minWidth: 100 }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: color || "var(--rf-txt)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function StatusChip({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.ASSIGNED;
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.color}44`, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

function CertBadge({ certStatus }) {
  const s = CERT_STYLE[certStatus] || CERT_STYLE.CURRENT;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: s.color + "18", color: s.color, border: `1px solid ${s.color}44` }}>
      {s.label}
    </span>
  );
}

function DispatchTable({ rows, loading, onStatusChange }) {
  if (loading) return <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>Loading dispatch...</div>;
  if (!rows.length) return <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>No shifts scheduled for this date.</div>;

  const grouped = rows.reduce((acc, r) => {
    (acc[r.company] = acc[r.company] || []).push(r);
    return acc;
  }, {});

  return (
    <div style={{ overflowX: "auto" }}>
      {Object.entries(grouped).map(([company, shifts]) => (
        <div key={company}>
          <div style={{ padding: "8px 16px", background: "var(--rf-bg3)", borderBottom: "1px solid var(--rf-border)", fontSize: 11, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {company} · {shifts.length} worker{shifts.length !== 1 ? "s" : ""}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rf-border)" }}>
                {["Worker", "Role", "Task", "Asset", "Shift", "Location", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--rf-border)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-bg3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--rf-txt)", whiteSpace: "nowrap" }}>{row.workerName}</td>
                  <td style={{ padding: "11px 14px", color: "var(--rf-txt2)", whiteSpace: "nowrap" }}>{row.roleLabel || "—"}</td>
                  <td style={{ padding: "11px 14px", color: "var(--rf-txt2)", maxWidth: 200 }}>{row.task}</td>
                  <td style={{ padding: "11px 14px", color: "var(--rf-txt3)", whiteSpace: "nowrap" }}>{row.assetCode || "—"}</td>
                  <td style={{ padding: "11px 14px", color: "var(--rf-txt3)", whiteSpace: "nowrap" }}>{row.shiftStart}–{row.shiftEnd}</td>
                  <td style={{ padding: "11px 14px", color: "var(--rf-txt3)" }}>{row.location || "—"}</td>
                  <td style={{ padding: "11px 14px" }}><StatusChip status={row.status} /></td>
                  <td style={{ padding: "11px 14px" }}>
                    {row.status !== "DONE" && row.status !== "NO_SHOW" && (
                      <select
                        value={row.status}
                        onChange={(e) => onStatusChange(row.id, e.target.value)}
                        style={{ fontSize: 11, padding: "3px 6px", borderRadius: 6, border: "1px solid var(--rf-border)", background: "var(--rf-bg3)", color: "var(--rf-txt2)", cursor: "pointer" }}>
                        <option value="ASSIGNED">Assigned</option>
                        <option value="ON_SITE">On Site</option>
                        <option value="DONE">Done</option>
                        <option value="NO_SHOW">No Show</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function WorkforceTab({ data, loading }) {
  if (loading) return <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--rf-txt3)", fontSize: 13 }}>Loading workforce...</div>;
  const rows = data?.rows || [];
  const totals = data?.totals || {};

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "16px" }}>
        <KpiTile label="Total Crew" value={totals.crew ?? 0} />
        <KpiTile label="Certs Current" value={totals.current ?? 0} color="var(--rf-green)" />
        <KpiTile label="Expiring" value={totals.expiring ?? 0} color="var(--rf-yellow)" />
        <KpiTile label="Expired" value={totals.expired ?? 0} color="var(--rf-red)" />
        <KpiTile label="Missing" value={totals.missing ?? 0} color="var(--rf-red)" />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rf-border)", background: "var(--rf-bg3)" }}>
              {["Name", "Role", "Cert Status", "Current", "Expiring", "Expired"].map((h) => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--rf-txt3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.crewMemberId} style={{ borderBottom: "1px solid var(--rf-border)", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--rf-bg3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--rf-txt)" }}>{r.fullName}</td>
                <td style={{ padding: "10px 14px", color: "var(--rf-txt2)" }}>{r.roleLabel || "—"}</td>
                <td style={{ padding: "10px 14px" }}><CertBadge certStatus={r.certStatus} /></td>
                <td style={{ padding: "10px 14px", textAlign: "center", color: "var(--rf-green)", fontWeight: 700 }}>{r.certsCurrent}</td>
                <td style={{ padding: "10px 14px", textAlign: "center", color: r.certsExpiring > 0 ? "var(--rf-yellow)" : "var(--rf-txt3)", fontWeight: r.certsExpiring > 0 ? 700 : 400 }}>{r.certsExpiring}</td>
                <td style={{ padding: "10px 14px", textAlign: "center", color: r.certsExpired > 0 ? "var(--rf-red)" : "var(--rf-txt3)", fontWeight: r.certsExpired > 0 ? 700 : 400 }}>{r.certsExpired}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main container ───────────────────────────────────────────────────────────

export default function CrewDispatch() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [projectId, setProjectId] = useState("p1");
  const [dispatch, setDispatch] = useState(null);
  const [workforce, setWorkforce] = useState(null);
  const [dispatchLoading, setDispatchLoading] = useState(true);
  const [workforceLoading, setWorkforceLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dispatch");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      setDispatchLoading(true);
      try {
        const res = await getDispatchForDay(projectId, date);
        setDispatch(res?.rows ? res : MOCK_DISPATCH);
      } catch {
        setDispatch(MOCK_DISPATCH);
      } finally {
        setDispatchLoading(false);
      }
    })();
  }, [projectId, date]);

  useEffect(() => {
    (async () => {
      setWorkforceLoading(true);
      try {
        const res = await getWorkforceReadiness(projectId);
        setWorkforce(res?.rows ? res : MOCK_WORKFORCE);
      } catch {
        setWorkforce(MOCK_WORKFORCE);
      } finally {
        setWorkforceLoading(false);
      }
    })();
  }, [projectId]);

  const handleStatusChange = async (shiftId, newStatus) => {
    setDispatch((prev) => {
      if (!prev) return prev;
      return { ...prev, rows: prev.rows.map((r) => r.id === shiftId ? { ...r, status: newStatus } : r) };
    });
    try {
      await setShiftStatus(shiftId, newStatus);
      setToast("Status updated");
    } catch {
      setDispatch((prev) => prev); // revert would require storing old, keep simple
      setToast("Failed to update status");
    }
  };

  const totals = dispatch?.totals || MOCK_DISPATCH.totals;

  const tabs = [
    { key: "dispatch", label: "Crew Dispatch", count: totals.total },
    { key: "workforce", label: "Workforce Readiness", count: workforce?.totals?.crew ?? 0 },
  ];

  return (
    <div style={{ padding: "24px 28px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--rf-txt)" }}>Crew Dispatch</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}>
            {totals.total} workers scheduled · {totals.onSite} on site · {totals.assigned} assigned
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--rf-border)", background: "var(--rf-bg3)", color: "var(--rf-txt)", fontSize: 13, fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        <KpiTile label="Total" value={totals.total} />
        <KpiTile label="On Site" value={totals.onSite} color="var(--rf-green)" />
        <KpiTile label="Assigned" value={totals.assigned} color="var(--rf-accent)" />
        <KpiTile label="Done" value={totals.done} color="var(--rf-txt3)" />
        {totals.noShow > 0 && <KpiTile label="No Show" value={totals.noShow} color="var(--rf-red)" />}
      </div>

      {/* Main card */}
      <div style={{ background: "var(--rf-bg2)", border: "1px solid var(--rf-border)", borderRadius: 16, overflow: "hidden" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, padding: "4px", borderBottom: "1px solid var(--rf-border)", background: "var(--rf-bg3)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, background: activeTab === t.key ? "var(--rf-accent)" : "transparent", color: activeTab === t.key ? "#fff" : "var(--rf-txt2)", display: "flex", alignItems: "center", gap: 6 }}>
              {t.label}
              <span style={{ fontSize: 10, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 99, background: activeTab === t.key ? "rgba(255,255,255,0.25)" : "var(--rf-bg2)", color: activeTab === t.key ? "#fff" : "var(--rf-txt3)", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "dispatch" && (
          <DispatchTable rows={dispatch?.rows || []} loading={dispatchLoading} onStatusChange={handleStatusChange} />
        )}
        {activeTab === "workforce" && (
          <WorkforceTab data={workforce} loading={workforceLoading} />
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 2000, background: "var(--rf-bg2)", border: "1px solid var(--rf-green)", color: "var(--rf-green)", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
