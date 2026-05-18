"use client";

// ── Phase 6 PR-1: Error report widget ────────────────────────────────────────
// Drop into error boundaries / "Something went wrong" screens. Surfaces the
// last X-Request-Id and X-Trace-Id captured by axiosConfig so users can paste
// them into support tickets.

import { useState } from "react";
import { getLastTrace } from "@/services/instance/correlation";

export default function ErrorReport({ error, title = "Something went wrong" }) {
  const trace = getLastTrace() ?? {};
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            requestId: trace.requestId || null,
            traceId: trace.traceId || null,
            message: error?.message || String(error),
            at: new Date().toISOString(),
          },
          null,
          2
        )
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — leave the IDs visible */
    }
  };

  return (
    <section
      className="rf-card"
      style={{ padding: 16, borderColor: "var(--rf-red)" }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--rf-red)",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      {error?.message && (
        <div
          style={{
            fontSize: 13,
            color: "var(--rf-txt2)",
            marginBottom: 10,
            whiteSpace: "pre-wrap",
          }}
        >
          {error.message}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gap: 4,
          fontFamily: "monospace",
          fontSize: 12,
          color: "var(--rf-txt3)",
          marginBottom: 10,
        }}
      >
        <div>requestId: {trace.requestId || "n/a"}</div>
        <div>traceId: {trace.traceId || "n/a"}</div>
      </div>
      <button className="rf-btn" onClick={copy}>
        {copied ? "Copied" : "Copy support ID"}
      </button>
    </section>
  );
}
