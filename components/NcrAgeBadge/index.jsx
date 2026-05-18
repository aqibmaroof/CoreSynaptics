"use client";

// ── Phase v15 C2: NCR aging badge ────────────────────────────────────────────
// Server-computed thresholds (≥7d = YELLOW, ≥14d = RED). Subscribe to
// `Issue.ncr-aged` events to bump live; for cold renders, pass the threshold
// directly when known. Never compute age in the browser.

export default function NcrAgeBadge({ threshold, ageDays }) {
  if (!threshold) return null;
  const sty =
    threshold === "RED"
      ? { color: "var(--rf-red)", bg: "rgba(239,68,68,0.16)" }
      : { color: "var(--rf-yellow, #f59e0b)", bg: "rgba(245,158,11,0.16)" };
  return (
    <span
      style={{
        padding: "1px 8px",
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 4,
        background: sty.bg,
        color: sty.color,
      }}
      title={
        ageDays != null
          ? `Aged ${ageDays} days (server-computed threshold)`
          : "Server-computed aging threshold"
      }
    >
      aged · {threshold}
      {ageDays != null ? ` · ${ageDays}d` : ""}
    </span>
  );
}
