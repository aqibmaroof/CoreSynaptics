"use client";

// RoutePlaceholder — graceful fallback rendered for any route that has no
// dedicated page yet (via the root catch-all app/[...slug]) or that Next.js
// would otherwise resolve to its default 404. Keeps the user inside the app
// shell with a friendly "under construction" panel instead of a dead end.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function RoutePlaceholder({ title }) {
  const router = useRouter();
  const pathname = usePathname();

  const prettyName =
    title ||
    (() => {
      const last = (pathname || "/").split("/").filter(Boolean).pop();
      if (!last) return "Home";
      return last
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    })();

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          background: "var(--cx-surface, #fff)",
          border: "1px solid var(--cx-border, #e5e7eb)",
          borderRadius: 16,
          padding: "40px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: "0 auto 20px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--cx-accent-soft, #fef3c7)",
            color: "var(--cx-accent-h, #d97706)",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          ⚙
        </div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 8px",
            color: "var(--cx-text, #0f172a)",
          }}
        >
          {prettyName}
        </h1>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            margin: "0 0 24px",
            color: "var(--cx-text-muted, #64748b)",
          }}
        >
          This page is under construction. The section you tried to open
          doesn&apos;t have a view yet — no worries, you&apos;re still inside the
          app.
        </p>

        {pathname ? (
          <code
            style={{
              display: "inline-block",
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 6,
              marginBottom: 24,
              background: "var(--cx-bg-app, #f8fafc)",
              border: "1px solid var(--cx-border, #e5e7eb)",
              color: "var(--cx-text-muted, #64748b)",
            }}
          >
            {pathname}
          </code>
        ) : null}

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background: "var(--cx-bg-app, #f8fafc)",
              color: "var(--cx-text, #0f172a)",
              border: "1px solid var(--cx-border-strong, #cbd5e1)",
            }}
          >
            ← Go back
          </button>
          <Link
            href="/"
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              background: "var(--cx-accent, #f59e0b)",
              color: "#fff",
              border: "1px solid var(--cx-accent, #f59e0b)",
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
