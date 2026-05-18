"use client";

// ── Phase 10 PR-6 + Phase v15 B7: Lens chip filter ───────────────────────────
// v15 owns the lens registry — fetch from `/lenses` and render whatever the
// server returns. Legacy COPILOT_LENSES is used only as the fallback while
// the registry call is in flight or fails. The selected lens is piped into
// every copilot hook on the page; the server does the filtering.

import { useEffect, useState } from "react";
import { listLenses, LENS_LABEL } from "@/services/Lenses";
import {
  COPILOT_LENSES,
  RECOMMENDATION_LENS_LABEL,
} from "@/services/Copilot";

export default function LensFilter({ value, onChange }) {
  const [lenses, setLenses] = useState(COPILOT_LENSES);
  const [labels, setLabels] = useState(() => ({
    ...RECOMMENDATION_LENS_LABEL,
    ...LENS_LABEL,
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const xs = await listLenses();
        if (cancelled) return;
        const items = Array.isArray(xs) ? xs : xs?.items ?? [];
        if (items.length === 0) return;
        const keys = items
          .map((l) => (typeof l === "string" ? l : l.key || l.lens || l.name))
          .filter(Boolean);
        const nextLabels = { ...RECOMMENDATION_LENS_LABEL, ...LENS_LABEL };
        items.forEach((l) => {
          if (typeof l === "object" && l && l.key && l.label) {
            nextLabels[l.key] = l.label;
          }
        });
        setLenses(keys);
        setLabels(nextLabels);
      } catch {
        /* keep fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <button
        type="button"
        className={`rf-btn ${!value ? "rf-btn-primary" : ""}`}
        onClick={() => onChange(undefined)}
        style={{ fontSize: 11 }}
      >
        All
      </button>
      {lenses.map((l) => (
        <button
          key={l}
          type="button"
          className={`rf-btn ${value === l ? "rf-btn-primary" : ""}`}
          onClick={() => onChange(l)}
          style={{ fontSize: 11 }}
          title={l}
        >
          {labels[l] || l}
        </button>
      ))}
    </div>
  );
}
