"use client";

// ── Phase 12: Learner Profile container ──────────────────────────────────────
// Per-user panel for Competency / Coaching / Governance. Used standalone via
// /LearnerProfile?userId=… or as an embed in worker detail screens.

import { useState } from "react";
import CompetencyPanel from "@/components/CompetencyPanel";
import CoachingPanel from "@/components/CoachingPanel";
import GovernancePanel from "@/components/GovernancePanel";
import LensFilter from "@/components/LensFilter";

export default function LearnerProfile({ userId, roleName }) {
  const [tab, setTab] = useState("competency");
  const [lens, setLens] = useState();

  if (!userId) {
    return (
      <div style={{ padding: 24, color: "var(--rf-txt3)" }}>
        Pick a user (set <code>?userId=…</code>) to view their learning
        profile.
      </div>
    );
  }

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
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Learner Profile
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            User{" "}
            <span style={{ fontFamily: "monospace" }}>
              {userId.slice(0, 8)}
            </span>
            {roleName ? ` · role ${roleName}` : ""}
          </p>
        </div>
        {tab !== "competency" && (
          <LensFilter value={lens} onChange={setLens} />
        )}
      </header>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          ["competency", "Competency"],
          ["coaching", "Coaching"],
          ["governance", "Governance"],
        ].map(([k, label]) => (
          <button
            key={k}
            className={`rf-btn ${tab === k ? "rf-btn-primary" : ""}`}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "competency" && <CompetencyPanel userId={userId} />}
      {tab === "coaching" && <CoachingPanel userId={userId} lens={lens} />}
      {tab === "governance" && (
        <GovernancePanel userId={userId} roleName={roleName} lens={lens} />
      )}
    </div>
  );
}
