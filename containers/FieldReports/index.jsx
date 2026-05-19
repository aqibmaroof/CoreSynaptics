"use client";

import { useMemo, useState } from "react";

const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

const TODAY = { short: "May 05", long: "May 05, 2026" };

const TAG_PALETTE = {
  accent: {
    bg: "color-mix(in srgb, var(--rf-accent) 14%, transparent)",
    fg: "var(--rf-accent)",
  },
  green: {
    bg: "color-mix(in srgb, var(--rf-green) 14%, transparent)",
    fg: "var(--rf-green2)",
  },
  yellow: {
    bg: "color-mix(in srgb, var(--rf-yellow) 22%, transparent)",
    fg: "var(--rf-yellow2)",
  },
  purple: {
    bg: "color-mix(in srgb, var(--rf-purple) 14%, transparent)",
    fg: "var(--rf-purple)",
  },
  teal: {
    bg: "color-mix(in srgb, var(--rf-teal) 14%, transparent)",
    fg: "var(--rf-teal)",
  },
  orange: {
    bg: "color-mix(in srgb, var(--rf-orange) 14%, transparent)",
    fg: "var(--rf-orange)",
  },
};

const SAMPLE_LOGS = [
  {
    id: "L1",
    date: TODAY.short,
    tag: { label: "HITT-001", palette: "accent" },
    author: {
      name: "Joe Martinez",
      company: "HITT Contracting",
      role: "GC Superintendent",
      zone: "Project-wide",
    },
    weather: "73°F partly cloudy",
    onSite: 142,
    photos: 3,
    incidents: 0,
    work: "Daily field report. Termination crew finishing UPS-Rm-B by EOD. UPS-03 lugs prep starting tomorrow. MV cable pull GEN-02 at 60%.",
    issues:
      "Burndy 750kcmil lug shortage — emergency PO filed by Kim Porter (Rosendin).",
  },
  {
    id: "L2",
    date: TODAY.short,
    tag: { label: "RSDN-005", palette: "green" },
    author: {
      name: "Dan Perkins",
      company: "Rosendin Electric",
      role: "Foreman",
      zone: "UPS-Rm-B / Yard-N",
    },
    weather: "73°F partly cloudy",
    onSite: 14,
    photos: 5,
    incidents: 0,
    work: "Crew B continued UPS-Rm-B termination. Crew C MV cable pull GEN-02 at 60%, finishing tomorrow. Crew D started lug prep for UPS-03.",
    issues: "Short on 750kcmil compression lugs — Kim filed emergency PO.",
  },
  {
    id: "L3",
    date: TODAY.short,
    tag: { label: "DLTA-002", palette: "yellow" },
    author: {
      name: "Aaron Wright",
      company: "Delta Electronics",
      role: "Lead FSE",
      zone: "UPS-Rm-A",
    },
    weather: "73°F partly cloudy",
    onSite: 1,
    photos: 2,
    incidents: 0,
    work: "Closed all open UPS-01/02 FSRs. Reviewed UPS-03 firmware version target with Marcus for handoff. Site walk with Carol on UPS-Rm-B readiness.",
    issues: "",
  },
  {
    id: "L4",
    date: TODAY.short,
    tag: { label: "SHCO-003", palette: "purple" },
    author: {
      name: "Marcus Lee",
      company: "Shermco Industries",
      role: "NETA Lead",
      zone: "Switchgear yard",
    },
    weather: "73°F partly cloudy",
    onSite: 6,
    photos: 4,
    incidents: 0,
    work: "Hi-pot dielectric tests on SG-04 in progress. Two acceptance reports filed. Calibration on insulation tester completed.",
    issues: "SG-04 ground fault flagged during pre-energization — awaiting electrical dispo.",
  },
  {
    id: "L5",
    date: TODAY.short,
    tag: { label: "MSFT-001", palette: "teal" },
    author: {
      name: "Lisa Park",
      company: "Microsoft",
      role: "Owner's Rep",
      zone: "Site walk",
    },
    weather: "73°F partly cloudy",
    onSite: 2,
    photos: 1,
    incidents: 0,
    work: "Joined Carol on UPS-Rm-B readiness walk. Spot-checked tagging and as-built markups. No customer-side blockers raised.",
    issues: "",
  },
  {
    id: "L6",
    date: TODAY.short,
    tag: { label: "HITT-014", palette: "accent" },
    author: {
      name: "Sarah Chen",
      company: "HITT Contracting",
      role: "GC Project Manager",
      zone: "Office / coordination",
    },
    weather: "73°F partly cloudy",
    onSite: 4,
    photos: 0,
    incidents: 0,
    work: "Three-week look-ahead refresh. Confirmed RFS targets with Microsoft. Coordinated Shermco return visit for SG-04 retest.",
    issues: "",
  },
  {
    id: "L7",
    date: TODAY.short,
    tag: { label: "RSDN-008", palette: "green" },
    author: {
      name: "Pedro Alvarez",
      company: "Rosendin Electric",
      role: "Foreman",
      zone: "GEN yard",
    },
    weather: "73°F partly cloudy",
    onSite: 9,
    photos: 6,
    incidents: 0,
    work: "MV cable pull on GEN-02 reached 60%, on plan for tomorrow. Crew managed cable bend radii within spec.",
    issues: "",
  },
  {
    id: "L8",
    date: TODAY.short,
    tag: { label: "DLTA-006", palette: "yellow" },
    author: {
      name: "Hannah Cole",
      company: "Delta Electronics",
      role: "FSE",
      zone: "UPS-Rm-A",
    },
    weather: "73°F partly cloudy",
    onSite: 1,
    photos: 1,
    incidents: 0,
    work: "Battery capacity retest on UPS-02 scheduled for tomorrow. Cell imbalance from prior fail reviewed with vendor engineering.",
    issues: "UPS-02 cell imbalance — vendor disposition pending.",
  },
];

export default function FieldReports() {
  const [logs, setLogs] = useState(SAMPLE_LOGS);
  const [submitOpen, setSubmitOpen] = useState(false);

  const myFiledToday = useMemo(
    () => logs.some((l) => l._mine && l.date === TODAY.short),
    [logs]
  );

  const addLog = (entry) => {
    setLogs((prev) => [
      {
        ...entry,
        id: `LOCAL-${Date.now()}`,
        date: TODAY.short,
        _mine: true,
      },
      ...prev,
    ]);
  };

  return (
    <div style={{ padding: 24,  margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 780 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: "var(--rf-txt)",
              margin: 0,
            }}
          >
            Daily field log
          </h1>
          <p
            style={{
              color: "var(--rf-txt3)",
              fontSize: 13,
              marginTop: 6,
              lineHeight: 1.5,
            }}
          >
            Project-wide daily logs from every superintendent, foreman, and field lead.{" "}
            <b style={{ color: "var(--rf-txt2)" }}>{logs.length} logs visible</b>. Today is {TODAY.long}.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setSubmitOpen(true)}
        >
          + Submit today’s log
        </button>
      </header>

      {/* Info banner */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          padding: "12px 16px",
          background: "color-mix(in srgb, var(--rf-accent) 8%, transparent)",
          border:
            "1px solid color-mix(in srgb, var(--rf-accent) 18%, transparent)",
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>
          💡
        </span>
        <div style={{ fontSize: 12, color: "var(--rf-txt2)", lineHeight: 1.5 }}>
          <b style={{ color: "var(--rf-txt)" }}>How daily logs work.</b>{" "}
          Sup, foreman, and field leads file one log per day. Captures crew count,
          weather, work performed, issues, incidents, photos. Logs are visible to
          your company and the GC. The GC consolidates project-wide visibility.
          {myFiledToday ? (
            <>
              {" "}
              <b style={{ color: "var(--rf-green2)" }}>
                ✓ You filed today’s log.
              </b>
            </>
          ) : (
            <>
              {" "}
              <b style={{ color: "var(--rf-txt)" }}>
                You have not filed today’s log yet.
              </b>
            </>
          )}
        </div>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {logs.map((l) => (
          <LogCard key={l.id} log={l} />
        ))}
      </ul>

      {submitOpen && (
        <SubmitLogModal
          onClose={() => setSubmitOpen(false)}
          onSubmit={(entry) => {
            addLog(entry);
            setSubmitOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Log card ────────────────────────────────────────────────────────────────
function LogCard({ log: l }) {
  const tag = TAG_PALETTE[l.tag.palette] || TAG_PALETTE.accent;
  return (
    <li
      className="rf-card"
      style={{
        padding: 16,
        marginBottom: 12,
        border: "1px solid var(--rf-border)",
        background: "var(--rf-bg2)",
        borderRadius: 10,
      }}
    >
      {/* Top row: date pill + author + tag */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <DatePill date={l.date} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--rf-txt)" }}>
            {l.author.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--rf-txt3)",
              marginTop: 2,
            }}
          >
            {[l.author.company, l.author.role, l.author.zone]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>
        <span
          style={{
            padding: "3px 10px",
            background: tag.bg,
            color: tag.fg,
            borderRadius: 4,
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            flexShrink: 0,
          }}
        >
          {l.tag.label}
        </span>
      </div>

      {/* Stat strip */}
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          flexWrap: "wrap",
          padding: "10px 14px",
          background: "var(--rf-bg3)",
          borderRadius: 8,
          marginTop: 12,
          fontSize: 12,
          color: "var(--rf-txt2)",
        }}
      >
        <Stat icon="☁" color="var(--rf-txt3)">
          <span style={{ fontWeight: 600, color: "var(--rf-txt)" }}>
            {l.weather}
          </span>
        </Stat>
        <Stat icon="👥" color="var(--rf-purple)">
          <b style={{ color: "var(--rf-txt)" }}>{l.onSite}</b> on site
        </Stat>
        <Stat icon="📷" color="var(--rf-accent)">
          <b style={{ color: "var(--rf-txt)" }}>{l.photos}</b> photos
        </Stat>
        <Stat
          icon={l.incidents > 0 ? "⚠" : "✓"}
          color={l.incidents > 0 ? "var(--rf-red)" : "var(--rf-green)"}
        >
          <b
            style={{
              color: l.incidents > 0 ? "var(--rf-red2)" : "var(--rf-green2)",
            }}
          >
            {l.incidents}
          </b>{" "}
          incidents
        </Stat>
      </div>

      {/* Work performed */}
      <Section label="WORK PERFORMED" labelColor="var(--rf-txt3)">
        {l.work}
      </Section>

      {/* Issues (optional) */}
      {l.issues && (
        <Section label="ISSUES" labelColor="var(--rf-yellow2)">
          {linkifyNames(l.issues)}
        </Section>
      )}
    </li>
  );
}

function DatePill({ date }) {
  return (
    <div
      style={{
        background: "var(--rf-txt)",
        color: "var(--rf-bg2)",
        padding: "6px 12px",
        borderRadius: 6,
        fontFamily: MONO,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.05em",
        flexShrink: 0,
        minWidth: 64,
        textAlign: "center",
      }}
    >
      {date}
    </div>
  );
}

function Stat({ icon, color, children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "var(--rf-txt2)",
      }}
    >
      <span aria-hidden style={{ color, fontSize: 13 }}>
        {icon}
      </span>
      {children}
    </span>
  );
}

function Section({ label, labelColor, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          color: labelColor,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "var(--rf-txt)",
          lineHeight: 1.55,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Highlight "Name (Company)" patterns as accent-colored mentions.
function linkifyNames(text) {
  const re = /([A-Z][a-z]+(?:\s[A-Z][a-z]+)+\s\([A-Z][a-zA-Z]+\))/g;
  const parts = String(text).split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <span key={i} style={{ color: "var(--rf-accent)", fontWeight: 600 }}>
        {p}
      </span>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

// ─── Submit modal ────────────────────────────────────────────────────────────
function SubmitLogModal({ onClose, onSubmit }) {
  const [zone, setZone] = useState("");
  const [weather, setWeather] = useState("73°F partly cloudy");
  const [onSite, setOnSite] = useState("");
  const [photos, setPhotos] = useState("0");
  const [incidents, setIncidents] = useState("0");
  const [work, setWork] = useState("");
  const [issues, setIssues] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = work.trim().length > 0 && onSite.trim() !== "";

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      onSubmit?.({
        tag: { label: "ME-001", palette: "accent" },
        author: {
          name: "You",
          company: "Your company",
          role: "Field lead",
          zone: zone || "Project-wide",
        },
        weather,
        onSite: Number(onSite) || 0,
        photos: Number(photos) || 0,
        incidents: Number(incidents) || 0,
        work,
        issues,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
        Submit today’s log
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <Field label="Zone / area">
          <input
            className="rf-input"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="e.g., UPS-Rm-B"
          />
        </Field>
        <Field label="Weather">
          <input
            className="rf-input"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          />
        </Field>
        <Field label="On site">
          <input
            type="number"
            min="0"
            className="rf-input"
            value={onSite}
            onChange={(e) => setOnSite(e.target.value)}
          />
        </Field>
        <Field label="Photos">
          <input
            type="number"
            min="0"
            className="rf-input"
            value={photos}
            onChange={(e) => setPhotos(e.target.value)}
          />
        </Field>
        <Field label="Incidents">
          <input
            type="number"
            min="0"
            className="rf-input"
            value={incidents}
            onChange={(e) => setIncidents(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Work performed">
        <textarea
          rows={5}
          className="rf-input"
          value={work}
          onChange={(e) => setWork(e.target.value)}
          placeholder="Crew activities, progress on tasks…"
        />
      </Field>
      <Field label="Issues (optional)">
        <textarea
          rows={3}
          className="rf-input"
          value={issues}
          onChange={(e) => setIssues(e.target.value)}
          placeholder="Blockers, shortages, escalations…"
        />
      </Field>
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          marginTop: 12,
        }}
      >
        <button className="rf-btn" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          className="rf-btn rf-btn-primary"
          onClick={submit}
          disabled={busy || !canSubmit}
        >
          {busy ? "Submitting…" : "Submit log"}
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, onClose }) {
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
        style={{
          padding: 20,
          maxWidth: 680,
          width: "100%",
          maxHeight: "92vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
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
