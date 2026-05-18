"use client";

// ── Phase 8 PR-6: Cross-Domain Inspector ─────────────────────────────────────
// Eight curated channels surface high-value cross-module relationships. Each
// channel returns CrossDomainPair[]: { from, via, to }. Read-only.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  crossDomainAssociations,
  listCrossDomainChannels,
  CROSS_DOMAIN_CHANNELS,
} from "@/services/Relationships";
import {
  hrefForNode,
  EDGE_KIND_LABEL,
  EDGE_KIND_COLOR,
} from "@/services/KnowledgeGraph";

export default function CrossDomainInspector({ cxProjectId }) {
  const [channels, setChannels] = useState(CROSS_DOMAIN_CHANNELS);
  const [channel, setChannel] = useState(CROSS_DOMAIN_CHANNELS[0].key);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Refresh available channels from the server (defensive — falls back to the
  // hard-coded list if the call fails).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listCrossDomainChannels();
        if (cancelled) return;
        const keys = res?.channels;
        if (Array.isArray(keys) && keys.length) {
          const merged = keys.map((k) => {
            const known = CROSS_DOMAIN_CHANNELS.find((c) => c.key === k);
            return known || { key: k, label: k };
          });
          setChannels(merged);
        }
      } catch {
        /* keep hard-coded list */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await crossDomainAssociations(
        channel,
        cxProjectId || undefined,
        100
      );
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load channel");
    } finally {
      setLoading(false);
    }
  }, [channel, cxProjectId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--rf-txt)",
          }}
        >
          Cross-Domain Inspector
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Curated relationship channels across QA, procurement, risk,
          approvals, schedule and turnover.
          {cxProjectId
            ? ` · project ${cxProjectId.slice(0, 8)}`
            : " · all projects"}
        </p>
      </header>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        {channels.map((c) => (
          <button
            key={c.key}
            className={`rf-btn ${channel === c.key ? "rf-btn-primary" : ""}`}
            onClick={() => setChannel(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            padding: 10,
            background: "rgba(239,68,68,0.12)",
            color: "var(--rf-red)",
            borderRadius: 6,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No associations on this channel.
        </div>
      ) : (
        <div className="rf-card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>From</th>
                <th style={th}>via</th>
                <th style={th}>To</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p, i) => (
                <tr
                  key={`${p.from.entityType}:${p.from.entityId}-${p.to.entityType}:${p.to.entityId}-${i}`}
                  style={{ borderTop: "1px solid var(--rf-border)" }}
                >
                  <td style={td}>
                    <RefLink entity={p.from} />
                  </td>
                  <td style={td}>
                    <Via via={p.via} />
                    {p.note && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                          marginTop: 2,
                        }}
                      >
                        {p.note}
                      </div>
                    )}
                  </td>
                  <td style={td}>
                    <RefLink entity={p.to} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RefLink({ entity }) {
  return (
    <Link
      href={hrefForNode({
        entityType: entity.entityType,
        entityId: entity.entityId,
      })}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 6px",
            borderRadius: 4,
            background: "var(--rf-bg3)",
            color: "var(--rf-txt3)",
          }}
        >
          {entity.entityType}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{entity.title}</span>
      </div>
      {(entity.severity || entity.status) && (
        <div
          style={{
            fontSize: 11,
            color: "var(--rf-txt3)",
            marginTop: 2,
          }}
        >
          {[entity.severity, entity.status].filter(Boolean).join(" · ")}
        </div>
      )}
    </Link>
  );
}

function Via({ via }) {
  if (via === "CANONICAL_LINK") {
    return (
      <span
        style={{
          padding: "1px 6px",
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 4,
          background: "var(--rf-bg3)",
          color: "var(--rf-txt3)",
        }}
      >
        canonical link
      </span>
    );
  }
  const c = EDGE_KIND_COLOR[via] || {};
  return (
    <span
      style={{
        padding: "1px 8px",
        fontSize: 11,
        fontWeight: 700,
        borderRadius: 4,
        background: c.bg || "var(--rf-bg3)",
        color: c.color || "var(--rf-txt3)",
      }}
    >
      {EDGE_KIND_LABEL[via] || via}
    </span>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = { padding: "10px 12px", fontSize: 13, color: "var(--rf-txt)" };
