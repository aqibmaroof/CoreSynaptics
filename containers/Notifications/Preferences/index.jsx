"use client";

// ── Phase 5 PR-3: Notification preferences ───────────────────────────────────
// Matrix of category × channel toggles, plus min-priority and a digest hour.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  myNotificationPreferences,
  upsertNotificationPreference,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES,
} from "@/services/Notifications";

export default function NotificationPreferences() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const xs = await myNotificationPreferences();
      setRows(Array.isArray(xs) ? xs : xs?.items ?? []);
    } catch (e) {
      setError(e?.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Build a quick lookup: `${category}|${channel}` → preference row.
  const byKey = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => m.set(`${r.category}|${r.channel}`, r));
    return m;
  }, [rows]);

  const save = async (patch) => {
    const key = `${patch.category}|${patch.channel}`;
    setBusyKey(key);
    try {
      await upsertNotificationPreference(patch);
      await refresh();
    } catch (e) {
      setError(e?.message || "Save failed");
    } finally {
      setBusyKey(null);
    }
  };

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
          Notification preferences
        </h1>
        <p style={{ color: "var(--rf-txt3)", fontSize: 13 }}>
          Pick which categories reach you on which channels. Digest hour is
          UTC.
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

      {loading ? (
        <div style={{ color: "var(--rf-txt3)" }}>Loading…</div>
      ) : (
        <div className="rf-card" style={{ overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--rf-bg2)" }}>
                <th style={th}>Category</th>
                {NOTIFICATION_CHANNELS.map((ch) => (
                  <th key={ch} style={{ ...th, textAlign: "center" }}>
                    {ch}
                  </th>
                ))}
                <th style={th}>Min priority</th>
                <th style={th}>Digest</th>
                <th style={th}>Hour (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {NOTIFICATION_CATEGORIES.map((cat) => {
                // Use any row in this category to pull min-priority / digest
                const sample =
                  rows.find((r) => r.category === cat) || {
                    minPriority: "NORMAL",
                    digestEnabled: false,
                    digestHour: null,
                  };
                return (
                  <tr
                    key={cat}
                    style={{ borderTop: "1px solid var(--rf-border)" }}
                  >
                    <td style={td}>
                      <div style={{ fontWeight: 600 }}>{cat}</div>
                    </td>
                    {NOTIFICATION_CHANNELS.map((ch) => {
                      const key = `${cat}|${ch}`;
                      const row = byKey.get(key);
                      const enabled = row?.enabled ?? true;
                      return (
                        <td
                          key={ch}
                          style={{ ...td, textAlign: "center" }}
                        >
                          <input
                            type="checkbox"
                            checked={enabled}
                            disabled={busyKey === key}
                            onChange={(e) =>
                              save({
                                category: cat,
                                channel: ch,
                                enabled: e.target.checked,
                                minPriority: sample.minPriority,
                                digestEnabled: sample.digestEnabled,
                                digestHour: sample.digestHour ?? undefined,
                              })
                            }
                          />
                        </td>
                      );
                    })}
                    <td style={td}>
                      <select
                        className="rf-input"
                        value={sample.minPriority || "NORMAL"}
                        onChange={(e) =>
                          NOTIFICATION_CHANNELS.forEach((ch) =>
                            save({
                              category: cat,
                              channel: ch,
                              enabled:
                                byKey.get(`${cat}|${ch}`)?.enabled ?? true,
                              minPriority: e.target.value,
                              digestEnabled: sample.digestEnabled,
                              digestHour: sample.digestHour ?? undefined,
                            })
                          )
                        }
                      >
                        {NOTIFICATION_PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={td}>
                      <input
                        type="checkbox"
                        checked={!!sample.digestEnabled}
                        onChange={(e) =>
                          NOTIFICATION_CHANNELS.forEach((ch) =>
                            save({
                              category: cat,
                              channel: ch,
                              enabled:
                                byKey.get(`${cat}|${ch}`)?.enabled ?? true,
                              minPriority: sample.minPriority || "NORMAL",
                              digestEnabled: e.target.checked,
                              digestHour: sample.digestHour ?? undefined,
                            })
                          )
                        }
                      />
                    </td>
                    <td style={td}>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        className="rf-input"
                        style={{ width: 80 }}
                        value={
                          sample.digestHour === null ||
                          sample.digestHour === undefined
                            ? ""
                            : sample.digestHour
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          const hr =
                            v === "" ? undefined : Math.min(23, Math.max(0, Number(v)));
                          NOTIFICATION_CHANNELS.forEach((ch) =>
                            save({
                              category: cat,
                              channel: ch,
                              enabled:
                                byKey.get(`${cat}|${ch}`)?.enabled ?? true,
                              minPriority: sample.minPriority || "NORMAL",
                              digestEnabled: sample.digestEnabled,
                              digestHour: hr,
                            })
                          );
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--rf-txt3)",
};
const td = {
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--rf-txt)",
};
