"use client";

// Cx Score landing — project picker. Reuses the existing CxProjects service to
// list the user's projects and route to /CxScore/[projectId] on selection.

import { useEffect, useState } from "react";
import Link from "next/link";
import CxLayout from "@/containers/CxLayout";
import { getCxProjects } from "@/services/CxProjects";

const C = {
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e5e7eb",
  text: "#0f172a",
  textSoft: "#475569",
  textMuted: "#94a3b8",
  brand: "#1e40af",
  brandH: "#1e3a8a",
  brandFade: "#eff6ff",
  brandSoft: "#dbeafe",
  bgSoft: "#f1f5f9",
};

export default function CxScorePicker() {
  return (
    <CxLayout>
      <Picker />
    </CxLayout>
  );
}

function Picker() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // listCxProjects exists in the project's existing services; tolerate either
    // shape: { data: [...] } | [...]
    (getCxProjects as any)?.()
      .then((res: any) => {
        if (cancelled) return;
        setItems(Array.isArray(res) ? res : res?.data ?? []);
      })
      .catch((e: any) => {
        if (!cancelled) setErr(e?.message ?? "Failed to load projects");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        color: C.text,
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em" }}>
        Cx Score · Pick a project
      </h1>
      <div style={{ fontSize: 13, color: C.textSoft, marginTop: 6, marginBottom: 18 }}>
        Pick a project to view its weighted commissioning health score
        (35% checklists + 30% tests + 25% asset stage + 10% PSSRs).
      </div>

      {loading && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 36,
            textAlign: "center",
            color: C.textMuted,
          }}
        >
          Loading projects…
        </div>
      )}

      {err && !loading && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderRadius: 10,
            padding: 16,
            fontSize: 13,
          }}
        >
          {err}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: 36,
            textAlign: "center",
            color: C.textMuted,
          }}
        >
          No projects available.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          {items.map((p: any) => (
            <Link
              key={p.id}
              href={`/CxScore/${p.id}`}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 200px 100px",
                gap: 14,
                padding: "14px 18px",
                borderTop: `1px solid ${C.border}`,
                alignItems: "center",
                textDecoration: "none",
                color: C.text,
                background: C.surface,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = C.bgSoft;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = C.surface;
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>
                  {p.projectName ?? p.name ?? p.title ?? p.id}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.textMuted,
                    fontFamily: "'JetBrains Mono', monospace",
                    marginTop: 2,
                  }}
                >
                  {p.id}
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.textSoft }}>
                {p.customer ?? "—"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: C.brand,
                  fontWeight: 600,
                  textAlign: "right",
                }}
              >
                Open ›
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
