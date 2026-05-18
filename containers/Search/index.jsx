"use client";

// ── Phase 5 PR-4: Search results page ────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  search,
  SEARCH_ENTITY_TYPES,
  hrefForHit,
} from "@/services/Search";

// ── Phase 8 PR-4: Relationship facet filters ─────────────────────────────────
// /search payloads now carry `hit.facets.relationships` + `rel:*` /
// `lineage:*` tags. The existing tags filter parameter accepts these prefixes.
const REL_FILTERS = [
  { tag: "lineage:has-blockers", label: "Has blockers" },
  { tag: "lineage:has-approval", label: "In approval" },
  { tag: "rel:blocks", label: "Blocks something" },
  { tag: "rel:resolves", label: "Resolves something" },
];

export default function SearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const initialQ = params.get("q") || "";
  const initialType = params.get("entityType") || "";

  const [q, setQ] = useState(initialQ);
  const [entityType, setEntityType] = useState(initialType);
  const [relTags, setRelTags] = useState([]);
  const [page, setPage] = useState({ hits: [], total: 0, offset: 0, limit: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runSearch = useCallback(
    async (offset = 0) => {
      if (!q || q.trim().length < 2) {
        setPage({ hits: [], total: 0, offset: 0, limit: 20 });
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await search({
          q,
          entityTypes: entityType ? [entityType] : undefined,
          tags: relTags.length ? relTags : undefined,
          limit: 20,
          offset,
        });
        setPage(res || { hits: [], total: 0, offset: 0, limit: 20 });
      } catch (e) {
        setError(e?.message || "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [q, entityType, relTags]
  );

  useEffect(() => {
    runSearch(0);
  }, [runSearch]);

  const sync = (next) => {
    const usp = new URLSearchParams();
    if (next.q) usp.set("q", next.q);
    if (next.entityType) usp.set("entityType", next.entityType);
    router.replace(`/Search?${usp.toString()}`);
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((page.total || 0) / (page.limit || 20))),
    [page]
  );
  const currentPage = Math.floor((page.offset || 0) / (page.limit || 20));

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
          Search
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Operational search over projects, assets, RFIs, checklists, people
          and posts.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          className="rf-input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sync({ q, entityType });
              runSearch(0);
            }
          }}
          placeholder="Search…"
          style={{ flex: 1 }}
        />
        <select
          className="rf-input"
          value={entityType}
          onChange={(e) => {
            setEntityType(e.target.value);
            sync({ q, entityType: e.target.value });
          }}
        >
          <option value="">All types</option>
          {SEARCH_ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          className="rf-btn rf-btn-primary"
          onClick={() => {
            sync({ q, entityType });
            runSearch(0);
          }}
        >
          Search
        </button>
      </div>

      {/* PR-4: Relationship facet toggles */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        {REL_FILTERS.map((f) => {
          const active = relTags.includes(f.tag);
          return (
            <button
              key={f.tag}
              className={`rf-btn ${active ? "rf-btn-primary" : ""}`}
              onClick={() =>
                setRelTags((xs) =>
                  active ? xs.filter((t) => t !== f.tag) : [...xs, f.tag]
                )
              }
              style={{ fontSize: 11 }}
            >
              {f.label}
            </button>
          );
        })}
        {relTags.length > 0 && (
          <button
            className="rf-btn"
            onClick={() => setRelTags([])}
            style={{ fontSize: 11, color: "var(--rf-txt3)" }}
          >
            Clear
          </button>
        )}
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

      <div
        style={{
          fontSize: 12,
          color: "var(--rf-txt3)",
          marginBottom: 8,
        }}
      >
        {loading ? "Searching…" : `${page.total} results`}
      </div>

      {page.hits.length === 0 && !loading ? (
        <div
          style={{
            padding: 32,
            textAlign: "center",
            color: "var(--rf-txt3)",
          }}
        >
          {q
            ? "No matches. The indexer is async — newly created entities take a beat to appear."
            : "Type a query to begin."}
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {page.hits.map((h) => (
            <li
              key={`${h.entityType}-${h.id}`}
              className="rf-card"
              style={{ padding: 14, marginBottom: 8 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--rf-txt3)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: "var(--rf-bg3)",
                  }}
                >
                  {h.entityType}
                </span>
                <Link
                  href={hrefForHit(h)}
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--rf-txt)",
                    textDecoration: "none",
                  }}
                >
                  {h.title}
                </Link>
              </div>
              {h.body && (
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--rf-txt2)",
                  }}
                >
                  {h.body.length > 240
                    ? `${h.body.slice(0, 240)}…`
                    : h.body}
                </div>
              )}
              <RelationshipChips facets={h.facets?.relationships} />
              <div
                style={{
                  fontSize: 11,
                  color: "var(--rf-txt3)",
                  marginTop: 6,
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {(h.tags ?? [])
                  .filter(
                    (t) =>
                      !t.startsWith("rel:") && !t.startsWith("lineage:")
                  )
                  .map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: "1px 6px",
                        borderRadius: 4,
                        border: "1px solid var(--rf-border)",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                <span style={{ marginLeft: "auto" }}>
                  {h.updatedAt
                    ? new Date(h.updatedAt).toLocaleString()
                    : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {page.total > page.limit && (
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 12,
          }}
        >
          <button
            className="rf-btn"
            disabled={currentPage === 0 || loading}
            onClick={() => runSearch(Math.max(0, page.offset - page.limit))}
          >
            Prev
          </button>
          <span style={{ alignSelf: "center", fontSize: 12 }}>
            Page {currentPage + 1} / {totalPages}
          </span>
          <button
            className="rf-btn"
            disabled={currentPage + 1 >= totalPages || loading}
            onClick={() => runSearch(page.offset + page.limit)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// ── PR-4: Relationship chips ────────────────────────────────────────────────
function RelationshipChips({ facets }) {
  if (!facets) return null;
  const chips = [];
  if (facets.blockedBy > 0)
    chips.push({
      label: `Blocked by ${facets.blockedBy}`,
      color: "var(--rf-red)",
      bg: "rgba(239,68,68,0.16)",
    });
  if (facets.blocks > 0)
    chips.push({
      label: `Blocks ${facets.blocks}`,
      color: "var(--rf-yellow, #f59e0b)",
      bg: "rgba(245,158,11,0.16)",
    });
  if (facets.approvedViaCount > 0)
    chips.push({
      label: "Approval pending",
      color: "var(--rf-green)",
      bg: "rgba(34,197,94,0.16)",
    });
  if (facets.resolves > 0)
    chips.push({
      label: `Resolves ${facets.resolves}`,
      color: "var(--rf-green)",
      bg: "rgba(34,197,94,0.16)",
    });
  if (facets.attachedToCount > 0)
    chips.push({
      label: `${facets.attachedToCount} attached`,
      color: "var(--rf-txt3)",
      bg: "var(--rf-bg3)",
    });
  if (chips.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        marginTop: 6,
      }}
    >
      {chips.map((c, i) => (
        <span
          key={i}
          style={{
            padding: "1px 8px",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 700,
            background: c.bg,
            color: c.color,
          }}
        >
          {c.label}
        </span>
      ))}
    </div>
  );
}
