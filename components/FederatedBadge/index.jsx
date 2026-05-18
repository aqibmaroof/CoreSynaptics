"use client";

// ── Phase 13 PR-9: External workflow federation badge ────────────────────────
// Strictly read-only. Renders nothing when there are no external refs.
// Internal aggregates remain authoritative — clicking does NOT navigate to
// the external system. Show a "Federated · N" disclosure that expands the
// list of refs (system / status / last observed).

import { useCallback, useEffect, useState } from "react";
import {
  workflowsForEntity,
  EXTERNAL_WORKFLOW_STATUS_STYLE,
} from "@/services/Ecosystem";

export default function FederatedBadge({ entityType, entityId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!entityType || !entityId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await workflowsForEntity(entityType, entityId);
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load federation refs");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!entityType || !entityId) return null;
  if (!loading && rows.length === 0 && !error) return null;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "2px 8px",
          borderRadius: 4,
          fontSize: 11,
          fontWeight: 700,
          background: "rgba(59,130,246,0.16)",
          color: "var(--rf-blue, #3b82f6)",
          border: 0,
          cursor: "pointer",
        }}
      >
        Federated · {rows.length} {open ? "▾" : "▸"}
      </button>

      {open && (
        <div
          className="rf-card"
          style={{ padding: 10, minWidth: 320, maxWidth: 480 }}
        >
          {error && (
            <div
              style={{
                padding: 8,
                background: "rgba(239,68,68,0.12)",
                color: "var(--rf-red)",
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 8,
              }}
            >
              {error}
            </div>
          )}
          {loading ? (
            <div style={{ color: "var(--rf-txt3)", fontSize: 12 }}>
              Loading…
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {rows.map((r) => {
                const sty =
                  EXTERNAL_WORKFLOW_STATUS_STYLE[r.status] ||
                  EXTERNAL_WORKFLOW_STATUS_STYLE.UNKNOWN;
                return (
                  <li
                    key={r.id}
                    style={{
                      padding: 6,
                      borderTop: "1px solid var(--rf-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <span
                        style={{
                          padding: "1px 8px",
                          fontSize: 10,
                          fontWeight: 700,
                          borderRadius: 4,
                          background: sty.bg,
                          color: sty.color,
                        }}
                      >
                        {r.status}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {r.externalSystem}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                      }}
                    >
                      {r.externalRef}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--rf-txt3)",
                      }}
                    >
                      last seen{" "}
                      {r.lastObservedAt
                        ? new Date(r.lastObservedAt).toLocaleString()
                        : "—"}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div
            style={{
              marginTop: 8,
              fontSize: 10,
              color: "var(--rf-txt3)",
            }}
          >
            Read-only. Internal aggregates remain authoritative.
          </div>
        </div>
      )}
    </div>
  );
}
