"use client";

// ── Phase v15 B9: Chat reactions bar ─────────────────────────────────────────
// Toggle a reaction per (message, user, kind). Re-clicking is idempotent —
// the server returns the same state. The UI mirrors by reading the latest
// reactions list.

import { useCallback, useEffect, useState } from "react";
import {
  reactToMessage,
  unreactToMessage,
  listMessageReactions,
  CHAT_REACTION_KINDS,
  CHAT_REACTION_EMOJI,
} from "@/services/ChatReactions";

// Optimistic message ids (e.g. "opt-1779396208133") are placeholder strings
// minted client-side before the server returns the real UUID. Skip API calls
// for them so we don't fire a guaranteed-400 reactions fetch on every send.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isPersistedId = (id) => typeof id === "string" && UUID_RE.test(id);

export default function ChatReactionsBar({ messageId, currentUserId }) {
  const [reactions, setReactions] = useState([]);
  const [busy, setBusy] = useState(null);

  const refresh = useCallback(async () => {
    if (!isPersistedId(messageId)) return;
    try {
      const xs = await listMessageReactions(messageId);
      setReactions(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch {
      /* ignore */
    }
  }, [messageId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!isPersistedId(messageId)) return null;

  const myKinds = new Set(
    reactions
      .filter((r) => !currentUserId || r.userId === currentUserId)
      .map((r) => r.kind)
  );
  const countsByKind = reactions.reduce((acc, r) => {
    acc[r.kind] = (acc[r.kind] || 0) + 1;
    return acc;
  }, {});

  const toggle = async (kind) => {
    setBusy(kind);
    try {
      if (myKinds.has(kind)) await unreactToMessage(messageId, kind);
      else await reactToMessage(messageId, kind);
      await refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {CHAT_REACTION_KINDS.map((k) => {
        const active = myKinds.has(k);
        const count = countsByKind[k] || 0;
        return (
          <button
            key={k}
            type="button"
            className={`rf-btn ${active ? "rf-btn-primary" : ""}`}
            onClick={() => toggle(k)}
            disabled={busy === k}
            style={{
              fontSize: 11,
              padding: "2px 8px",
              display: "inline-flex",
              gap: 4,
              alignItems: "center",
            }}
            title={k}
          >
            <span>{CHAT_REACTION_EMOJI[k]}</span>
            {count > 0 && (
              <span style={{ fontFamily: "monospace" }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
