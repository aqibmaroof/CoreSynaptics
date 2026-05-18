"use client";

// ── Phase v15 D: Anomaly suppressions admin ────────────────────────────────
// List + create + delete suppressions. Server enforces the 1m–30d window and
// stamps `expiresAt`. After expiry the fingerprint re-surfaces automatically.

import { useCallback, useEffect, useState } from "react";
import {
  listSuppressions,
  deleteSuppression,
} from "@/services/AnomalySuppressions";
import AnomalySuppressionModal from "@/components/AnomalySuppressionModal";

export default function AnomalySuppressionsView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const [modal, setModal] = useState(false);
  const [adhocKind, setAdhocKind] = useState("");
  const [adhocFp, setAdhocFp] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listSuppressions();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load suppressions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const remove = async (r) => {
    if (!confirm(`Unsuppress ${r.kind} · ${r.fingerprint}?`)) return;
    setBusy(r.id || `${r.kind}:${r.fingerprint}`);
    setError("");
    try {
      await deleteSuppression(r.kind, r.fingerprint);
      await reload();
    } catch (e) {
      setError(e?.message || "Unsuppress failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <header
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>
            Anomaly suppressions
          </h1>
          <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
            Detection keeps running — UI surfacing is silenced for the window.
            After expiry the fingerprint re-surfaces automatically.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className="rf-btn" onClick={reload} disabled={loading}>
            ⟳ Refresh
          </button>
        </div>
      </header>

      <section className="rf-card" style={{ padding: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <input
            className="rf-input"
            placeholder="Kind (e.g. METRIC, SCHEDULE)"
            value={adhocKind}
            onChange={(e) => setAdhocKind(e.target.value)}
            style={{ width: 220 }}
          />
          <input
            className="rf-input"
            placeholder="Fingerprint"
            value={adhocFp}
            onChange={(e) => setAdhocFp(e.target.value)}
            style={{ flex: 1, minWidth: 220 }}
          />
          <button
            className="rf-btn rf-btn-primary"
            onClick={() => {
              if (adhocKind && adhocFp) setModal(true);
            }}
            disabled={!adhocKind || !adhocFp}
          >
            + Suppress
          </button>
        </div>

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

        {loading && rows.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
        ) : rows.length === 0 ? (
          <div style={{ color: "var(--rf-txt3)" }}>
            No active suppressions.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Kind</th>
                <th style={th}>Fingerprint</th>
                <th style={th}>Created</th>
                <th style={th}>Expires</th>
                <th style={th}>Reason</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id || `${r.kind}:${r.fingerprint}`}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    <strong>{r.kind}</strong>
                  </td>
                  <td
                    style={{ ...td, fontFamily: "monospace", fontSize: 11 }}
                  >
                    {r.fingerprint}
                  </td>
                  <td style={td}>
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                  </td>
                  <td style={td}>
                    {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : "—"}
                  </td>
                  <td style={td}>{r.reason || "—"}</td>
                  <td style={td}>
                    <button
                      className="rf-btn"
                      onClick={() => remove(r)}
                      disabled={busy === (r.id || `${r.kind}:${r.fingerprint}`)}
                      style={{ fontSize: 11 }}
                    >
                      Unsuppress
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <AnomalySuppressionModal
        open={modal}
        onClose={() => setModal(false)}
        kind={adhocKind}
        fingerprint={adhocFp}
        onCreated={() => {
          setAdhocKind("");
          setAdhocFp("");
          reload();
        }}
      />
    </section>
  );
}

const th = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "8px 10px", fontSize: 12, color: "var(--rf-txt)" };
