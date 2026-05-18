"use client";

// ── Phase 5 PR-4: Top-bar global search dropdown ─────────────────────────────
// Mounted by containers/Layout. Debounced suggestions; Enter or "See all"
// routes to /Search?q=…

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { search, hrefForHit } from "@/services/Search";

export default function GlobalSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState([]);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);

  const runSearch = useCallback(async (qq) => {
    if (!qq || qq.trim().length < 2) {
      setHits([]);
      return;
    }
    setLoading(true);
    try {
      const res = await search({ q: qq, limit: 8 });
      setHits(res?.hits ?? []);
    } catch {
      setHits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runSearch(q), 250);
    return () => timerRef.current && clearTimeout(timerRef.current);
  }, [q, runSearch]);

  // click-outside close
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const goSeeAll = () => {
    setOpen(false);
    router.push(`/Search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={wrapRef} className="cx-tb-search" style={{ position: "relative" }}>
      <input
        type="text"
        placeholder="Search projects, assets, RFIs, checklists…"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") goSeeAll();
          if (e.key === "Escape") setOpen(false);
        }}
        style={{ paddingLeft: 12 }}
      />
      {open && q.trim().length >= 2 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "calc(100% + 6px)",
            background: "var(--cx-surface)",
            border: "1px solid var(--cx-border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            zIndex: 70,
            maxHeight: 420,
            overflow: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div
              style={{
                padding: 12,
                fontSize: 12,
                color: "var(--cx-text-muted)",
              }}
            >
              Searching…
            </div>
          ) : hits.length === 0 ? (
            <div
              style={{
                padding: 12,
                fontSize: 12,
                color: "var(--cx-text-muted)",
              }}
            >
              No matches.
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {hits.map((h) => (
                <li
                  key={`${h.entityType}-${h.id}`}
                  style={{ borderTop: "1px solid var(--cx-border)" }}
                >
                  <Link
                    href={hrefForHit(h)}
                    onClick={() => setOpen(false)}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      padding: "8px 12px",
                      textDecoration: "none",
                      color: "var(--cx-text)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: 4,
                        background: "var(--cx-bg-soft)",
                        color: "var(--cx-text-muted)",
                        flexShrink: 0,
                      }}
                    >
                      {h.entityType}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {h.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={goSeeAll}
            style={{
              display: "block",
              width: "100%",
              padding: "8px 12px",
              background: "transparent",
              border: "none",
              borderTop: "1px solid var(--cx-border)",
              textAlign: "center",
              fontSize: 12,
              color: "var(--cx-text-muted)",
              cursor: "pointer",
            }}
          >
            See all results for &ldquo;{q}&rdquo; →
          </button>
        </div>
      )}
    </div>
  );
}
