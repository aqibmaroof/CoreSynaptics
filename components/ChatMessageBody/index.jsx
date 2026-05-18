"use client";

// ── Phase v15 B9: Chat message body with mention chip renderer ──────────────
// Server-resolved mentions live on `message.mentions` (entityType, entityId,
// label, span:[start,end]). Render chips by slicing the body around the spans
// — never re-resolve `@tokens` in the browser.

import Link from "next/link";
import { mentionHref } from "@/services/ChatReactions";

export default function ChatMessageBody({ message }) {
  const body = String(message?.body || "");
  const mentions = Array.isArray(message?.mentions) ? message.mentions : [];
  if (mentions.length === 0) return <span>{body}</span>;

  const sorted = [...mentions]
    .filter((m) => Array.isArray(m?.span) && m.span.length === 2)
    .sort((a, b) => a.span[0] - b.span[0]);

  const out = [];
  let cursor = 0;
  sorted.forEach((m, idx) => {
    const [start, end] = m.span;
    if (start > cursor) out.push(body.slice(cursor, start));
    out.push(
      <Link
        key={`m-${idx}`}
        href={mentionHref(m)}
        style={{
          padding: "1px 6px",
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 4,
          background: "rgba(59,130,246,0.16)",
          color: "var(--rf-blue, #3b82f6)",
          textDecoration: "none",
        }}
      >
        @{m.label || `${m.entityType}:${String(m.entityId).slice(0, 6)}`}
      </Link>
    );
    cursor = end;
  });
  if (cursor < body.length) out.push(body.slice(cursor));
  return <span>{out}</span>;
}
