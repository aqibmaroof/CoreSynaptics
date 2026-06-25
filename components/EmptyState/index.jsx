"use client";

import React from "react";

// Shared empty-state message (PP-047). Renders a clear "No Data Available"
// style message when a module has no records, so every module surfaces the
// no-data case consistently instead of rendering an empty table/list.
export default function EmptyState({
  title = "No Data Available",
  message = "",
  icon = true,
  className = "",
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center py-16 ${className}`}
    >
      {icon ? (
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="mb-3"
          style={{ color: "var(--rf-txt3, #94a3b8)" }}
        >
          <path
            d="M9 13h6m-6 4h6M9 9h1M5 3h9l5 5v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <p
        className="text-base font-semibold"
        style={{ color: "var(--rf-txt2, #475569)" }}
      >
        {title}
      </p>
      {message ? (
        <p className="text-sm mt-1" style={{ color: "var(--rf-txt3, #94a3b8)" }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
