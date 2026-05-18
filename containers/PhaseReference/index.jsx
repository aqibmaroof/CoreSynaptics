"use client";

// ── Phase v15 B3: Phase reference taxonomy + ownership map ──────────────────
// Render server-merged tree as returned. Mark `overridden=true` nodes with a
// visual cue — never deep-merge canonical and override values client-side.

import { useCallback, useEffect, useState } from "react";
import {
  phaseReferenceTree,
  upsertPhaseOverride,
  OWNER_STYLE,
  PHASE_OWNERS,
} from "@/services/PhaseReference";

export default function PhaseReference() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const t = await phaseReferenceTree();
      setTree(Array.isArray(t) ? t : t?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load phase reference");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveOverride = async (body) => {
    setBusy(true);
    try {
      await upsertPhaseOverride(body);
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(e?.message || "Override failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>
          🧭 Phase reference & ownership
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Canonical L1–L5 taxonomy with org overrides. Highlighted rows are
          non-canonical for this org.
        </p>
      </header>

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

      {loading && tree.length === 0 ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : tree.length === 0 ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          No phase reference rows. Platform admin can run{" "}
          <code>seed-canonical</code>.
        </div>
      ) : (
        tree.map((n) => (
          <PhaseNode
            key={n.phaseKey}
            node={n}
            depth={0}
            onEdit={setEditing}
          />
        ))
      )}

      {editing && (
        <OverrideModal
          node={editing}
          onClose={() => setEditing(null)}
          onSave={saveOverride}
          busy={busy}
        />
      )}
    </div>
  );
}

function PhaseNode({ node, depth, onEdit }) {
  const ownerSty = OWNER_STYLE[node.primaryOwner] || OWNER_STYLE.SHARED;
  return (
    <section
      className="rf-card"
      style={{
        padding: 10,
        marginLeft: depth * 18,
        marginBottom: 6,
        background: node.overridden ? "rgba(245,158,11,0.05)" : undefined,
      }}
    >
      <header
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            color: "var(--rf-txt3)",
          }}
        >
          {node.phaseKey}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{node.title}</span>
        <span
          style={{
            padding: "1px 6px",
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 4,
            background: ownerSty.bg,
            color: ownerSty.color,
          }}
        >
          {node.primaryOwner}
        </span>
        {(node.alternateOwners || []).map((o) => {
          const sty = OWNER_STYLE[o] || OWNER_STYLE.SHARED;
          return (
            <span
              key={o}
              style={{
                padding: "1px 6px",
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 4,
                background: sty.bg,
                color: sty.color,
                opacity: 0.7,
              }}
            >
              {o}
            </span>
          );
        })}
        {node.isHoldPoint && (
          <span
            style={{
              padding: "1px 6px",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 4,
              background: "rgba(245,158,11,0.16)",
              color: "var(--rf-yellow, #f59e0b)",
            }}
          >
            HOLD
          </span>
        )}
        {node.isWitnessPoint && (
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
            WITNESS
          </span>
        )}
        {node.overridden && (
          <span
            style={{
              padding: "1px 6px",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 4,
              background: "rgba(245,158,11,0.16)",
              color: "var(--rf-yellow, #f59e0b)",
            }}
          >
            overridden
          </span>
        )}
        <button
          className="rf-btn"
          onClick={() => onEdit(node)}
          style={{ marginLeft: "auto", fontSize: 11 }}
        >
          Override
        </button>
      </header>
      {node.shortDesc && (
        <p
          style={{
            fontSize: 12,
            color: "var(--rf-txt2)",
            margin: "6px 0 0",
          }}
        >
          {node.shortDesc}
        </p>
      )}
      {(node.children || []).map((c) => (
        <PhaseNode
          key={c.phaseKey}
          node={c}
          depth={depth + 1}
          onEdit={onEdit}
        />
      ))}
    </section>
  );
}

function OverrideModal({ node, onClose, onSave, busy }) {
  const [draft, setDraft] = useState({
    phaseKey: node.phaseKey,
    primaryOwner: node.primaryOwner,
    alternateOwners: node.alternateOwners || [],
    isHoldPoint: node.isHoldPoint,
    isWitnessPoint: node.isWitnessPoint,
    title: node.title,
    shortDesc: node.shortDesc || "",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="rf-card"
        style={{ padding: 20, maxWidth: 540, width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
          Override · {node.phaseKey}
        </h2>
        <div style={{ display: "grid", gap: 10 }}>
          <Field label="Title">
            <input
              className="rf-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="rf-input"
              rows={3}
              value={draft.shortDesc}
              onChange={(e) =>
                setDraft({ ...draft, shortDesc: e.target.value })
              }
            />
          </Field>
          <Field label="Primary owner">
            <select
              className="rf-input"
              value={draft.primaryOwner}
              onChange={(e) =>
                setDraft({ ...draft, primaryOwner: e.target.value })
              }
            >
              {PHASE_OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Alternate owners (chips)">
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {PHASE_OWNERS.map((o) => {
                const active = (draft.alternateOwners || []).includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    className={`rf-btn ${active ? "rf-btn-primary" : ""}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        alternateOwners: active
                          ? draft.alternateOwners.filter((x) => x !== o)
                          : [...(draft.alternateOwners || []), o],
                      })
                    }
                    style={{ fontSize: 11 }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </Field>
          <label
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={!!draft.isHoldPoint}
              onChange={(e) =>
                setDraft({ ...draft, isHoldPoint: e.target.checked })
              }
            />
            Hold point
          </label>
          <label
            style={{
              display: "flex",
              gap: 6,
              alignItems: "center",
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={!!draft.isWitnessPoint}
              onChange={(e) =>
                setDraft({ ...draft, isWitnessPoint: e.target.checked })
              }
            />
            Witness point
          </label>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 14,
          }}
        >
          <button className="rf-btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            className="rf-btn rf-btn-primary"
            onClick={() => onSave(draft)}
            disabled={busy}
          >
            Save override
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--rf-txt3)",
          marginBottom: 4,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
