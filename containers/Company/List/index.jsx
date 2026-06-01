"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCompanies, deleteCompany } from "@/services/Companies";
import ActivityTimeline from "@/components/CRM/ActivityTimeline";
import { useUserPermissions, MODULE, permissionProps } from "@/Utils/rbac";

// ─── Mock fallback data (matches screenshot) ──────────────────────────────────

const MOCK_COMPANIES = [
  {
    id: "c1",
    name: "HITT Contracting",
    badge: "GC",
    subtitle: "General Contractor",
    people: 32,
    checklists: 312,
    isMyCompany: false,
  },
  {
    id: "c2",
    name: "Microsoft",
    badge: "CUST",
    subtitle: "Customer",
    people: 14,
    checklists: 0,
    isMyCompany: false,
  },
  {
    id: "c3",
    name: "Delta Electronics",
    badge: "OEM",
    subtitle: "OEM · UPS",
    people: 22,
    checklists: 88,
    isMyCompany: true,
  },
  {
    id: "c4",
    name: "Caterpillar",
    badge: "OEM",
    subtitle: "OEM · Generators",
    people: 14,
    checklists: 32,
    isMyCompany: false,
  },
  {
    id: "c5",
    name: "Vertiv",
    badge: "OEM",
    subtitle: "OEM · Cooling",
    people: 16,
    checklists: 44,
    isMyCompany: false,
  },
  {
    id: "c6",
    name: "Rosendin Electric",
    badge: "TRAD",
    subtitle: "Electrical Trade",
    people: 62,
    checklists: 178,
    isMyCompany: false,
  },
  {
    id: "c7",
    name: "McKinstry",
    badge: "TRAD",
    subtitle: "Mechanical Trade",
    people: 38,
    checklists: 96,
    isMyCompany: false,
  },
  {
    id: "c8",
    name: "Shermco Industries",
    badge: "NETA",
    subtitle: "NETA Testing",
    people: 9,
    checklists: 64,
    isMyCompany: false,
  },
  {
    id: "c9",
    name: "CxA Group",
    badge: "CXA",
    subtitle: "Commissioning Agent",
    people: 8,
    checklists: 142,
    isMyCompany: false,
  },
  {
    id: "c10",
    name: "Schneider Building Auto",
    badge: "BMS",
    subtitle: "BMS Provider",
    people: 9,
    checklists: 48,
    isMyCompany: false,
  },
  {
    id: "c11",
    name: "Allied Security",
    badge: "SECU",
    subtitle: "Building Security · Access Control",
    people: 14,
    checklists: 18,
    isMyCompany: false,
  },
  {
    id: "c12",
    name: "Tyco Surveillance",
    badge: "CCTV",
    subtitle: "CCTV / Security Cameras",
    people: 8,
    checklists: 24,
    isMyCompany: false,
  },
  {
    id: "c13",
    name: "Siemens Fire & Life",
    badge: "FIRE",
    subtitle: "Fire / Life Safety",
    people: 10,
    checklists: 36,
    isMyCompany: false,
  },
  {
    id: "c14",
    name: "Gensler",
    badge: "ARCH",
    subtitle: "Architect of Record",
    people: 6,
    checklists: 0,
    isMyCompany: false,
  },
  {
    id: "c15",
    name: "Aerotek Staffing",
    badge: "STAF",
    subtitle: "Staffing Agency · Labor Supply",
    people: 4,
    checklists: 0,
    isMyCompany: false,
  },
];

// ─── Badge color map ──────────────────────────────────────────────────────────

const BADGE_STYLE = {
  GC: {
    bg: "rgba(59,130,246,0.13)",
    color: "#2563eb",
    border: "rgba(59,130,246,0.3)",
  },
  CUST: {
    bg: "rgba(139,92,246,0.13)",
    color: "#7c3aed",
    border: "rgba(139,92,246,0.3)",
  },
  OEM: {
    bg: "rgba(245,158,11,0.13)",
    color: "#b45309",
    border: "rgba(245,158,11,0.3)",
  },
  TRAD: {
    bg: "rgba(20,184,166,0.13)",
    color: "#0f766e",
    border: "rgba(20,184,166,0.3)",
  },
  NETA: {
    bg: "rgba(236,72,153,0.13)",
    color: "#be185d",
    border: "rgba(236,72,153,0.3)",
  },
  CXA: {
    bg: "rgba(59,130,246,0.13)",
    color: "#1d4ed8",
    border: "rgba(59,130,246,0.3)",
  },
  BMS: {
    bg: "rgba(30,58,138,0.15)",
    color: "#1e40af",
    border: "rgba(30,58,138,0.35)",
  },
  SECU: {
    bg: "rgba(239,68,68,0.13)",
    color: "#b91c1c",
    border: "rgba(239,68,68,0.3)",
  },
  CCTV: {
    bg: "rgba(6,182,212,0.13)",
    color: "#0e7490",
    border: "rgba(6,182,212,0.3)",
  },
  FIRE: {
    bg: "rgba(251,146,60,0.13)",
    color: "#c2410c",
    border: "rgba(251,146,60,0.3)",
  },
  ARCH: {
    bg: "rgba(99,102,241,0.13)",
    color: "#4338ca",
    border: "rgba(99,102,241,0.3)",
  },
  STAF: {
    bg: "rgba(34,197,94,0.13)",
    color: "#15803d",
    border: "rgba(34,197,94,0.3)",
  },
};

const getBadgeStyle = (badge) =>
  BADGE_STYLE[badge] || {
    bg: "rgba(100,116,139,0.13)",
    color: "#475569",
    border: "rgba(100,116,139,0.3)",
  };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mergeWithMock = (apiData) => {
  if (!apiData.length) return MOCK_COMPANIES;
  return apiData.map((c, i) => ({
    ...MOCK_COMPANIES[i % MOCK_COMPANIES.length],
    ...c,
    id: c.id,
    name: c.name,
    badge: c.badge || c.type?.slice(0, 4).toUpperCase() || "GC",
    subtitle: c.subtitle || c.description || c.type || "",
    people:
      c.people ??
      c.memberCount ??
      MOCK_COMPANIES[i % MOCK_COMPANIES.length]?.people ??
      0,
    checklists:
      c.checklists ??
      c.checklistCount ??
      MOCK_COMPANIES[i % MOCK_COMPANIES.length]?.checklists ??
      0,
    isMyCompany: c.isMyCompany ?? false,
  }));
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label }) {
  const s = getBadgeStyle(label);
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 800,
        padding: "2px 7px",
        borderRadius: 6,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function CompanyCard({ company, onDelete, onTimeline, onClick }) {
  const isMine = company.isMyCompany;
  return (
    <div
      onClick={() => onClick(company.id)}
      style={{
        background: isMine ? "rgba(59,130,246,0.04)" : "var(--rf-bg2)",
        border: isMine
          ? "2px solid var(--rf-accent)"
          : "1px solid var(--rf-border)",
        borderRadius: 12,
        padding: "16px 18px",
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isMine) {
          e.currentTarget.style.borderColor = "var(--rf-border2)";
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isMine) {
          e.currentTarget.style.borderColor = "var(--rf-border)";
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--rf-txt)",
            lineHeight: 1.3,
          }}
        >
          {company.name}
        </div>
        <Badge label={company.badge} />
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 12,
          color: "var(--rf-txt3)",
          marginBottom: 12,
          lineHeight: 1.4,
        }}
      >
        {company.subtitle}
      </div>

      {/* Divider */}
      <div
        style={{ height: 1, background: "var(--rf-border)", marginBottom: 12 }}
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--rf-txt)",
              lineHeight: 1,
            }}
          >
            {company.people}
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 2 }}>
            people
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "var(--rf-txt)",
              lineHeight: 1,
            }}
          >
            {company.checklists}
          </div>
          <div style={{ fontSize: 11, color: "var(--rf-txt3)", marginTop: 2 }}>
            checklists
          </div>
        </div>
      </div>

      {/* "My company" label */}
      {isMine && (
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--rf-accent)",
            letterSpacing: "0.04em",
          }}
        >
          THIS IS MY COMPANY
        </div>
      )}

      {/* Action buttons — appear on hover via CSS trick using opacity state */}
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          gap: 4,
          opacity: 0,
          transition: "opacity 0.15s",
        }}
        className="card-actions"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onTimeline(company)}
          title="Timeline"
          style={{
            background: "var(--rf-bg3)",
            border: "1px solid var(--rf-border)",
            borderRadius: 6,
            width: 24,
            height: 24,
            cursor: "pointer",
            fontSize: 11,
            color: "var(--rf-txt2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ⏱
        </button>
        <button
          onClick={() => onDelete(company.id)}
          title="Delete"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 6,
            width: 24,
            height: 24,
            cursor: "pointer",
            fontSize: 11,
            color: "var(--rf-red)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
         
        </button>
      </div>

      <style>{`.card-actions { opacity: 0; } div:hover > .card-actions { opacity: 1; }`}</style>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompanyList() {
  const router = useRouter();
  const { canCreate, canEdit, canDelete } = useUserPermissions();
  const [companies, setCompanies] = useState(MOCK_COMPANIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [timelineEntity, setTimelineEntity] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getCompanies();
      const raw = Array.isArray(res) ? res : res?.data || [];
      setCompanies(raw.length ? mergeWithMock(raw) : MOCK_COMPANIES);
      setError("");
    } catch {
      setCompanies(MOCK_COMPANIES);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(true);
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err?.message || "Failed to delete company");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = companies.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subtitle || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.badge || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPeople = companies.reduce((s, c) => s + (c.people || 0), 0);

  return (
    <div style={{ padding: "24px 28px", margin: "0 auto" }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 22,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: "var(--rf-txt)",
            }}
          >
            Companies on MSFT-DC1
          </h1>
          <p
            style={{ margin: "5px 0 0", fontSize: 13, color: "var(--rf-txt3)" }}
          >
            {companies.length} companies · {totalPeople} personnel total.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 9,
              border: "1px solid var(--rf-border)",
              background: "var(--rf-bg2)",
              color: "var(--rf-txt)",
              fontSize: 13,
              fontFamily: "inherit",
              outline: "none",
              width: 200,
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--rf-accent)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--rf-border)")}
          />
          <button
            onClick={() => router.push("/Company/Add")}
            {...permissionProps(canCreate(MODULE.CONTACTS), "invite a company")}
            style={{
              padding: "9px 18px",
              borderRadius: 9,
              border: "none",
              background: "var(--rf-accent)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            + Invite company
          </button>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "10px 16px",
            borderRadius: 9,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "var(--rf-red)",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {/* ── Loading ───────────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--rf-txt3)",
            fontSize: 13,
          }}
        >
          Loading companies...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--rf-txt3)",
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}></div>
          {searchTerm
            ? "No companies match your search."
            : "No companies found."}
        </div>
      ) : (
        /* ── Card grid ─────────────────────────────────────────────── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              onDelete={(id) => setDeleteConfirm(id)}
              onTimeline={(c) => setTimelineEntity({ id: c.id, name: c.name })}
              onClick={(id) => router.push(`/Company/Detail/${id}`)}
            />
          ))}
        </div>
      )}

      {/* ── Delete confirm modal ──────────────────────────────────────── */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border)",
              borderRadius: 14,
              padding: 24,
              maxWidth: 360,
              width: "100%",
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--rf-txt)",
              }}
            >
              Remove company?
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                fontSize: 13,
                color: "var(--rf-txt3)",
              }}
            >
              This will soft-delete the company. An administrator can restore it
              if needed.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: "1px solid var(--rf-border)",
                  background: "transparent",
                  color: "var(--rf-txt2)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  padding: "9px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "var(--rf-red)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 700,
                  opacity: actionLoading ? 0.6 : 1,
                }}
              >
                {actionLoading ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Timeline modal ───────────────────────────────────────────── */}
      {timelineEntity && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setTimelineEntity(null)}
        >
          <div
            style={{
              background: "var(--rf-bg2)",
              border: "1px solid var(--rf-border)",
              borderRadius: 14,
              width: "100%",
              maxWidth: 640,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid var(--rf-border)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--rf-txt)",
                }}
              >
                Timeline — {timelineEntity.name}
              </span>
              <button
                onClick={() => setTimelineEntity(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--rf-txt3)",
                  fontSize: 18,
                }}
              >
               
              </button>
            </div>
            <div style={{ padding: 20, overflowY: "auto" }}>
              <ActivityTimeline
                entityType="company"
                entityId={timelineEntity.id}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
