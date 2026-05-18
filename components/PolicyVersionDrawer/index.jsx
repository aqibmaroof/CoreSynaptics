"use client";

// ── Phase v15 C4: Policy version history drawer ─────────────────────────────
// Rollback creates a NEW version (append-only audit chain). Diff is
// server-side — render `diff.diff` verbatim.

import { useCallback, useEffect, useState } from "react";
import {
  listPolicyVersions,
  policyVersionDiff,
  rollbackPolicyVersion,
} from "@/services/PolicyVersions";

export default function PolicyVersionDrawer({ policyId }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [fromV, setFromV] = useState(null);
  const [toV, setToV] = useState(null);
  const [diff, setDiff] = useState(null);

  const refresh = useCallback(async () => {
    if (!policyId) return;
    setLoading(true);
    setError("");
    try {
      const xs = await listPolicyVersions(policyId);
      setVersions(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load versions");
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!policyId || fromV == null || toV == null || fromV === toV) {
      setDiff(null);
      return;
    }
    let cancelled = false;
    policyVersionDiff(policyId, fromV, toV)
      .then((d) => !cancelled && setDiff(d))
      .catch(
        (e) => !cancelled && setError(e?.message || "Diff failed")
      );
    return () => {
      cancelled = true;
    };
  }, [policyId, fromV, toV]);

  const rollback = async (v) => {
    if (!confirm(`Rollback to v${v.version}? Creates a new version.`)) return;
    setBusy(true);
    try {
      await rollbackPolicyVersion(policyId, v.version, `Rollback to v${v.version}`);
      await refresh();
    } catch (e) {
      setError(e?.message || "Rollback failed");
    } finally {
      setBusy(false);
    }
  };

  if (!policyId) return null;

  return (
    <aside className="rf-card" style={{ padding: 14 }}>
      <header style={{ marginBottom: 10 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--rf-txt2)",
            textTransform: "uppercase",
            letterSpacing: 0.04,
          }}
        >
          Version history
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: 8,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          {error}
        </div>
      )}

      {loading && versions.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>Loading…</div>
      ) : versions.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          No versions yet.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {versions.map((v) => {
            const superseded = !!v.effectiveTo;
            return (
              <li
                key={v.id}
                style={{
                  padding: 8,
                  borderTop: "1px solid var(--rf-border)",
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <strong style={{ fontFamily: "monospace" }}>
                    v{v.version}
                  </strong>
                  <span style={{ color: "var(--rf-txt3)", fontSize: 11 }}>
                    {v.effectiveFrom
                      ? new Date(v.effectiveFrom).toLocaleString()
                      : "—"}
                  </span>
                  {superseded && (
                    <span
                      style={{
                        padding: "1px 6px",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 4,
                        background: "var(--rf-bg3)",
                        color: "var(--rf-txt3)",
                      }}
                    >
                      superseded
                    </span>
                  )}
                  <span
                    style={{
                      marginLeft: "auto",
                      fontFamily: "monospace",
                      fontSize: 10,
                      color: "var(--rf-txt3)",
                    }}
                  >
                    by {String(v.createdBy).slice(0, 8)}
                  </span>
                </div>
                {v.notes && (
                  <div
                    style={{
                      color: "var(--rf-txt3)",
                      marginTop: 2,
                    }}
                  >
                    {v.notes}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  <button
                    className="rf-btn"
                    onClick={() => setFromV(v.version)}
                    style={{ fontSize: 10 }}
                  >
                    Diff from
                  </button>
                  <button
                    className="rf-btn"
                    onClick={() => setToV(v.version)}
                    style={{ fontSize: 10 }}
                  >
                    Diff to
                  </button>
                  <button
                    className="rf-btn"
                    onClick={() => rollback(v)}
                    disabled={busy || !superseded}
                    style={{ fontSize: 10 }}
                  >
                    Rollback
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {diff && (
        <div style={{ marginTop: 12 }}>
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
            Diff v{fromV} → v{toV}
          </div>
          <pre
            style={{
              margin: 0,
              padding: 8,
              background: "var(--rf-bg2)",
              borderRadius: 6,
              fontSize: 11,
              overflow: "auto",
              maxHeight: 320,
            }}
          >
            {JSON.stringify(diff.diff, null, 2)}
          </pre>
        </div>
      )}
    </aside>
  );
}
