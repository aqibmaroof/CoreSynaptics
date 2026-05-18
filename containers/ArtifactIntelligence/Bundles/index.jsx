"use client";

// ── Phase 5 PR-5: Bundle viewer ──────────────────────────────────────────────
// Curated artifact bundles that ultimately roll into a turnover package.

import { useCallback, useEffect, useState } from "react";
import {
  listBundles,
  createBundle,
  getBundle,
  setBundleStatus,
  removeBundleItem,
  BUNDLE_STATUSES,
  BUNDLE_STATUS_STYLE,
} from "@/services/ArtifactIntelligence";

export default function ArtifactBundles() {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [newDraft, setNewDraft] = useState({
    title: "",
    description: "",
    cxProjectId: "",
  });
  const [showNew, setShowNew] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await listBundles();
      setBundles(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load bundles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const openBundle = async (id) => {
    try {
      const b = await getBundle(id);
      setSelected(b);
    } catch (e) {
      setError(e?.message || "Failed to load bundle");
    }
  };

  const create = async () => {
    try {
      await createBundle({
        title: newDraft.title,
        description: newDraft.description || undefined,
        cxProjectId: newDraft.cxProjectId || undefined,
      });
      setShowNew(false);
      setNewDraft({ title: "", description: "", cxProjectId: "" });
      await refresh();
    } catch (e) {
      setError(e?.message || "Create failed");
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await setBundleStatus(id, { status });
      if (selected?.id === id) await openBundle(id);
      await refresh();
    } catch (e) {
      setError(e?.message || "Status change failed");
    }
  };

  const removeItem = async (artifactId) => {
    if (!selected) return;
    if (!confirm("Remove this artifact from the bundle?")) return;
    try {
      await removeBundleItem(selected.id, artifactId);
      await openBundle(selected.id);
    } catch (e) {
      setError(e?.message || "Remove failed");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--rf-txt)",
            }}
          >
            Artifact bundles
          </h1>
          <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
            Curate evidence into a single deliverable.
          </p>
        </div>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => setShowNew(true)}
        >
          + New bundle
        </button>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="rf-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--rf-border)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Bundles
          </div>
          {loading ? (
            <div style={{ padding: 14, color: "var(--rf-txt3)" }}>Loading…</div>
          ) : bundles.length === 0 ? (
            <div style={{ padding: 14, color: "var(--rf-txt3)" }}>
              None yet.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {bundles.map((b) => {
                const ps =
                  BUNDLE_STATUS_STYLE[b.status] ||
                  BUNDLE_STATUS_STYLE.DRAFT;
                return (
                  <li
                    key={b.id}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <button
                      type="button"
                      onClick={() => openBundle(b.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 14px",
                        background:
                          selected?.id === b.id
                            ? "var(--rf-bg2)"
                            : "transparent",
                        border: 0,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>{b.title}</span>
                        <span
                          style={{
                            marginLeft: "auto",
                            padding: "2px 8px",
                            fontSize: 11,
                            fontWeight: 700,
                            borderRadius: 4,
                            background: ps.bg,
                            color: ps.color,
                          }}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--rf-txt3)",
                          marginTop: 2,
                        }}
                      >
                        {b.itemCount} items
                        {b.cxProjectId
                          ? ` · proj ${b.cxProjectId.slice(0, 8)}`
                          : ""}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rf-card" style={{ padding: 14 }}>
          {!selected ? (
            <div style={{ color: "var(--rf-txt3)" }}>
              Select a bundle to inspect.
            </div>
          ) : (
            <>
              <header style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>
                  {selected.title}
                </div>
                {selected.description && (
                  <div style={{ fontSize: 12, color: "var(--rf-txt3)" }}>
                    {selected.description}
                  </div>
                )}
              </header>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                {BUNDLE_STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`rf-btn ${
                      selected.status === s ? "rf-btn-primary" : ""
                    }`}
                    onClick={() => changeStatus(selected.id, s)}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--rf-txt2)",
                  margin: "8px 0",
                }}
              >
                Items
              </div>
              {(selected.items ?? []).length === 0 ? (
                <div
                  style={{ color: "var(--rf-txt3)", fontSize: 13 }}
                >
                  Empty.
                </div>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {(selected.items ?? []).map((it) => (
                    <li
                      key={it.id}
                      style={{
                        padding: 8,
                        borderTop: "1px solid var(--rf-border)",
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--rf-txt3)",
                          padding: "2px 6px",
                          background: "var(--rf-bg3)",
                          borderRadius: 4,
                        }}
                      >
                        {it.section || "—"}
                      </span>
                      <div style={{ flex: 1, fontSize: 12 }}>
                        <div style={{ fontWeight: 600 }}>
                          {it.caption ||
                            `Artifact ${it.artifactId.slice(0, 8)}`}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--rf-txt3)",
                          }}
                        >
                          ordinal {it.ordinal}
                        </div>
                      </div>
                      <button
                        className="rf-btn"
                        onClick={() => removeItem(it.artifactId)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>

      {showNew && (
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
          onClick={() => setShowNew(false)}
        >
          <div
            className="rf-card"
            style={{ padding: 20, maxWidth: 480, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              New bundle
            </h2>
            <div style={{ display: "grid", gap: 10 }}>
              <input
                className="rf-input"
                placeholder="Title"
                value={newDraft.title}
                onChange={(e) =>
                  setNewDraft({ ...newDraft, title: e.target.value })
                }
              />
              <textarea
                className="rf-input"
                placeholder="Description (optional)"
                rows={3}
                value={newDraft.description}
                onChange={(e) =>
                  setNewDraft({
                    ...newDraft,
                    description: e.target.value,
                  })
                }
              />
              <input
                className="rf-input"
                placeholder="cxProjectId (optional)"
                value={newDraft.cxProjectId}
                onChange={(e) =>
                  setNewDraft({
                    ...newDraft,
                    cxProjectId: e.target.value,
                  })
                }
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <button className="rf-btn" onClick={() => setShowNew(false)}>
                Cancel
              </button>
              <button
                className="rf-btn rf-btn-primary"
                onClick={create}
                disabled={!newDraft.title.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
