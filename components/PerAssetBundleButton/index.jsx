"use client";

// ── Phase v15 C3: Per-asset turnover bundle export ──────────────────────────
// Drop on the asset detail screen. Renders summary.* counts and the
// readinessScore EXACTLY as returned by the server. JSON download is local
// only — never reformat the bundle.

import { useCallback, useState } from "react";
import { assetTurnoverBundle } from "@/services/TurnoverBundle";

export default function PerAssetBundleButton({ assetId, label = "Export equipment package" }) {
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    setError("");
    try {
      const b = await assetTurnoverBundle(assetId);
      setBundle(b);
    } catch (e) {
      setError(e?.message || "Bundle failed");
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  const download = () => {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bundle?.asset?.assetCode || assetId}-bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
      <button className="rf-btn" onClick={load} disabled={loading || !assetId}>
        {loading ? "Building…" : label}
      </button>
      {error && (
        <div
          style={{
            padding: 6,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}
      {bundle && (
        <aside
          className="rf-card"
          style={{ padding: 12, maxWidth: 460 }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700 }}>
              {bundle.asset?.assetCode}
            </span>
            <span
              style={{
                padding: "1px 8px",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: 4,
                background:
                  (bundle.summary?.readinessScore ?? 0) >= 80
                    ? "rgba(34,197,94,0.16)"
                    : (bundle.summary?.readinessScore ?? 0) >= 50
                    ? "rgba(245,158,11,0.16)"
                    : "rgba(239,68,68,0.16)",
                color:
                  (bundle.summary?.readinessScore ?? 0) >= 80
                    ? "var(--rf-green)"
                    : (bundle.summary?.readinessScore ?? 0) >= 50
                    ? "var(--rf-yellow, #f59e0b)"
                    : "var(--rf-red)",
              }}
            >
              readiness · {bundle.summary?.readinessScore ?? 0}%
            </span>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              fontSize: 12,
              display: "grid",
              gap: 2,
            }}
          >
            <li>
              Tests: {bundle.summary?.passingTests}/
              {bundle.summary?.totalTests} passing
            </li>
            <li>
              Failing tests: {bundle.summary?.failingTests}
            </li>
            <li>
              Open issues: {bundle.summary?.openIssues} (critical{" "}
              {bundle.summary?.criticalOpen})
            </li>
            <li>PSSR signed: {bundle.summary?.pssrSigned}</li>
          </ul>
          <button
            className="rf-btn rf-btn-primary"
            onClick={download}
            style={{ marginTop: 8, fontSize: 11 }}
          >
            Download JSON
          </button>
        </aside>
      )}
    </div>
  );
}
