"use client";

// ── Phase v15 B10: 19-step onboarding tour overlay ──────────────────────────
// Mount once at the top of Layout. start() is idempotent; advance(N) marks
// step N complete. Never advance(currentStep + k) for k > 1.

import { useCallback, useEffect, useState } from "react";
import {
  getMyTour,
  startTour,
  advanceTour,
  skipTour,
} from "@/services/OnboardingTour";

export default function OnboardingTourOverlay({ autoStart = true }) {
  const [tour, setTour] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const t = await getMyTour();
      setTour(t);
      if (autoStart && !t) {
        const started = await startTour();
        setTour(started);
      }
    } catch {
      /* swallow — tour is optional UX */
    }
  }, [autoStart]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!tour || tour.status !== "IN_PROGRESS") return null;

  const title =
    tour.stepTitles?.[tour.currentStep] || `Step ${tour.currentStep}`;
  const pct = tour.totalSteps
    ? Math.round((tour.currentStep / tour.totalSteps) * 100)
    : 0;

  const next = async () => {
    setBusy(true);
    try {
      const t = await advanceTour(tour.currentStep);
      setTour(t);
    } finally {
      setBusy(false);
    }
  };
  const skip = async () => {
    setBusy(true);
    try {
      const t = await skipTour();
      setTour(t);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        background: "var(--cx-surface, var(--rf-bg, #fff))",
        border: "1px solid var(--rf-border)",
        borderRadius: 12,
        padding: 16,
        maxWidth: 360,
        boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--rf-txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.04,
          marginBottom: 4,
        }}
      >
        Tour · step {tour.currentStep} / {tour.totalSteps}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
        {title}
      </div>
      <div
        style={{
          height: 6,
          background: "var(--rf-bg3)",
          borderRadius: 3,
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--rf-blue, #3b82f6)",
            transition: "width 0.2s",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <button
          className="rf-btn"
          onClick={skip}
          disabled={busy}
          style={{ fontSize: 11 }}
        >
          Skip
        </button>
        <button
          className="rf-btn rf-btn-primary"
          onClick={next}
          disabled={busy}
          style={{ fontSize: 11 }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
