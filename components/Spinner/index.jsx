"use client";

import React from "react";

// Shared loading indicator (PP-035 / PP-048). Renders an accessible, animated
// spinner with an optional label. Use across module list/detail pages so the
// loading affordance is consistent instead of each page hand-rolling its own.
export default function Spinner({
  label = "Loading…",
  size = 40,
  className = "",
  fullPage = false,
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`flex flex-col items-center justify-center ${
        fullPage ? "py-20" : "py-12"
      } ${className}`}
    >
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ color: "var(--rf-accent, #2563eb)" }}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label ? (
        <p
          className="mt-3 text-sm"
          style={{ color: "var(--rf-txt2, #475569)" }}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}
