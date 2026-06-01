"use client";

// ── Phase v15 B9: Chat message body with mention chip renderer ──────────────
// Server-resolved mentions live on `message.mentions` (entityType, entityId,
// label, span:[start,end]). Render chips by slicing the body around the spans
// — never re-resolve `@tokens` in the browser.
//
// Rendering rules (Chat audit):
//   • Emojis render natively — body text is never escaped/stripped.
//   • Bare URLs become clickable links (new tab, noopener).
//   • Long URLs wrap instead of overflowing the bubble (overflowWrap:anywhere).

import Link from "next/link";
import { mentionHref } from "@/services/ChatReactions";

// Capture http(s):// and bare www. URLs. We trim trailing punctuation that is
// almost certainly sentence punctuation rather than part of the link.
const URL_RE = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;
const TRAILING_PUNCT = /[.,;:!?)\]}'"]+$/;

const linkStyle = {
  color: "inherit",
  textDecoration: "underline",
  textUnderlineOffset: 2,
  wordBreak: "break-all",
  overflowWrap: "anywhere",
};

// Turn a plain-text run into an array of strings + anchor elements.
function linkify(text, keyPrefix) {
  if (!text) return [text];
  const out = [];
  let last = 0;
  let match;
  let i = 0;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    let raw = match[0];
    let trailing = "";
    const trimmed = raw.match(TRAILING_PUNCT);
    if (trimmed) {
      trailing = trimmed[0];
      raw = raw.slice(0, raw.length - trailing.length);
    }
    if (match.index > last) out.push(text.slice(last, match.index));
    const href = raw.startsWith("http") ? raw : `https://${raw}`;
    out.push(
      <a
        key={`${keyPrefix}-url-${i++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
      >
        {raw}
      </a>
    );
    if (trailing) out.push(trailing);
    last = match.index + raw.length + trailing.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function ChatMessageBody({ message }) {
  const body = String(message?.body || "");
  const mentions = Array.isArray(message?.mentions) ? message.mentions : [];

  // Fast path: no mentions — just linkify the whole body.
  if (mentions.length === 0) {
    return <span style={{ overflowWrap: "anywhere" }}>{linkify(body, "b")}</span>;
  }

  const sorted = [...mentions]
    .filter((m) => Array.isArray(m?.span) && m.span.length === 2)
    .sort((a, b) => a.span[0] - b.span[0]);

  const out = [];
  let cursor = 0;
  sorted.forEach((m, idx) => {
    const [start, end] = m.span;
    if (start > cursor) {
      out.push(...linkify(body.slice(cursor, start), `seg-${idx}`));
    }
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
  if (cursor < body.length) out.push(...linkify(body.slice(cursor), "tail"));
  return <span style={{ overflowWrap: "anywhere" }}>{out}</span>;
}
